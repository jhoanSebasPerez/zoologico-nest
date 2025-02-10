import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Comment } from '../entities/comment.entity';
import { CommentProjectionDto } from '../dto/projections/comment-projection.dto';
import { CommentDetailProjectionDto } from '../dto/projections/comment-detail-projection.dto';
import { PaginationQueryDto } from 'src/common/dtos';
import { CommentReachReplyException } from '../exceptions/comment-reach-reply.exceptions';

@Injectable()
export class CommentRepository extends Repository<Comment> {

    private readonly MAX_REPLY_DEPTH = 3;

    constructor(private readonly dataSource: DataSource) {
        super(Comment, dataSource.getRepository(Comment).manager);
    }

    async createComment(content: string, author: any, animal: any): Promise<CommentProjectionDto> {
        const comment = this.create({ content, author, animal });
        const savedComment = await this.save(comment);
        return this.mapToCommentProjection(savedComment);
    }

    async createReply(content: string, author: any, parent: Comment): Promise<CommentProjectionDto> {
        if (parent.level >= this.MAX_REPLY_DEPTH) {
            throw new CommentReachReplyException();
        }

        const reply = this.create({ content, author, parent, level: parent.level + 1 });

        const savedReply = await this.save(reply);

        return this.mapToCommentProjection(savedReply);
    }

    async findCommentById(id: string): Promise<CommentDetailProjectionDto | undefined> {
        const rawData = await this.createQueryBuilder('comment')
            .leftJoin('comment.children', 'replies')                 // Primer nivel de respuestas
            .leftJoin('replies.children', 'subReplies')              // Segundo nivel: respuestas de las respuestas
            .leftJoin('comment.author', 'author')
            .leftJoin('replies.author', 'replyAuthor')               // Autor de las respuestas

            .select([
                'comment.id AS id',
                'comment.content AS content',
                'comment.createdAt AS createdAt',
                'comment.lastModifiedAt AS lastModifiedAt',
                'author.id AS authorId',
                'author.fullName AS authorName',

                'replies.id AS replyId',
                'replies.content AS replyContent',
                'replyAuthor.id AS replyAuthorId',
                'replyAuthor.fullName AS replyAuthorName',

                'COUNT(subReplies.id) AS replyCount'                // Contamos las subréplicas
            ])

            .where('comment.id = :id', { id })
            .groupBy('comment.id, author.id, replies.id, replyAuthor.id')
            .orderBy('replies.createdAt', 'ASC')                    // Ordenar las respuestas por fecha
            .getRawMany();

        if (!rawData.length) return undefined;

        return this.mapToCommentDetailProjection(rawData);
    }

    async findAllComments(query: PaginationQueryDto): Promise<[CommentProjectionDto[], number]> {
        const page = query.page ?? 1;
        const limit = query.limit ?? 10;
        const sortBy = query.sortBy ?? 'createdAt';
        const order = query.order?.toUpperCase() as 'ASC' | 'DESC' ?? 'DESC';

        const rawComments = await this.createQueryBuilder('comment')
            .leftJoin('comment.children', 'replies')
            .leftJoin('comment.author', 'author')
            .select([
                'comment.id AS id',
                'comment.content AS content',
                'COUNT(replies.id) AS countOfReplies',
                'comment.lastModifiedAt AS lastModifiedAt',
                'author.id AS authorId',
                'author.fullName AS authorName'
            ])
            .groupBy('comment.id, author.id')
            .orderBy(`comment.${sortBy}`, order)
            .limit(limit)
            .offset((page - 1) * limit)
            .getRawMany();

        const total = await this.createQueryBuilder('comment').getCount();

        return [this.mapToCommentProjections(rawComments), total];
    }

    async getCommentReplyPercentage(): Promise<{ totalComments: number; commentsWithReplies: number; percentage: number }> {
        const totalComments = await this.count();
        const commentsWithReplies = await this.createQueryBuilder('comment')
            .leftJoin('comment.children', 'children')
            .where('children.id IS NOT NULL')
            .getCount();

        const percentage = totalComments > 0 ? (commentsWithReplies / totalComments) * 100 : 0;
        return { totalComments, commentsWithReplies, percentage: parseFloat(percentage.toFixed(2)) };
    }

    async findCommentsByAnimalId(animalId: string): Promise<CommentProjectionDto[]> {
        const rawComments = await this.createQueryBuilder('comment')
            .leftJoin('comment.author', 'author')
            .leftJoin('comment.children', 'children')  // 📌 Hacemos JOIN con los hijos (respuestas)
            .where('comment.animalId = :animalId', { animalId })
            .select([
                'comment.id AS id',
                'comment.content AS content',
                'COUNT(children.id) AS countOfReplies',  // 📌 Contamos los hijos por su ID
                'comment.lastModifiedAt AS lastModifiedAt',
                'author.id AS authorId',
                'author.fullName AS authorName'
            ])
            .groupBy('comment.id, author.id')
            .orderBy('comment.createdAt', 'DESC')
            .getRawMany();

        // 🔄 Mapeamos la proyección al DTO
        return rawComments.map(comment => ({
            id: comment.id,
            content: comment.content,
            countOfReplies: Number(comment.countofreplies),
            lastModifiedAt: comment.lastmodifiedat,
            author: {
                id: comment.authorid,
                name: comment.authorname,
            }
        }));
    }

    async searchComments(keyword: string): Promise<CommentProjectionDto[]> {
        const comments = await this.createQueryBuilder('comment')
            .leftJoinAndSelect('comment.animal', 'animal')
            .leftJoinAndSelect('animal.specie', 'species')
            .leftJoinAndSelect('species.zone', 'zone')
            .leftJoinAndSelect('comment.parent', 'parent')
            .leftJoin('comment.author', 'author')
            .where('LOWER(comment.content) LIKE LOWER(:keyword)', { keyword: `%${keyword}%` })
            .orWhere('LOWER(parent.content) LIKE LOWER(:keyword)', { keyword: `%${keyword}%` })
            .getMany();

        return comments.map(comment => this.mapToCommentProjection(comment));
    }

    private mapToCommentProjection(comment: any): CommentProjectionDto {
        return {
            id: comment.id,
            content: comment.content,
            countOfReplies: comment.children ? comment.children.length : 0,
            lastModifiedAt: comment.lastModifiedAt,
            author: {
                id: comment.author.id,
                name: comment.author.fullName
            }
        };
    }

    private mapToCommentProjections(rawComments: any[]): CommentProjectionDto[] {
        return rawComments.map(comment => ({
            id: comment.id,
            content: comment.content,
            countOfReplies: Number(comment.countOfReplies),
            lastModifiedAt: comment.lastModifiedAt,
            author: {
                id: comment.authorId,
                name: comment.authorName
            }
        }));
    }

    private mapToCommentDetailProjection(rawData: any[]): CommentDetailProjectionDto {
        const comment = rawData[0];

        return {
            id: comment.id,
            content: comment.content,
            createdAt: comment.createdat,
            lastModifiedAt: comment.lasmodifiedat,
            author: {
                id: comment.authorid,
                name: comment.authorname
            },
            replies: rawData
                .filter(data => data.replyid) // Filtrar solo si hay respuestas
                .map(reply => ({
                    id: reply.replyid,
                    content: reply.replycontent,
                    author: {
                        id: reply.replyauthorid,
                        name: reply.replyauthorname
                    },
                    replyCount: Number(reply.replycount)
                }))
        };
    }
}
