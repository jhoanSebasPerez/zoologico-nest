import { forwardRef, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { AnimalsService } from 'src/animals/animals.service';
import { User } from '../auth/entities/user.entity';
import { CommentNotFoundException } from './exceptions/comment-not-found.exception';
import { CreateReplyDto } from './dto';
import { CommentCanNotDeleteException } from './exceptions/comment-can-not-delete.exception';
import { CommentUpdateDto } from './dto/update-comment.dto';
import { CommentRepository } from './repositories/comment.repository';

@Injectable()
export class CommentsService {

  constructor(
    private readonly commentRepository: CommentRepository,
    @Inject(forwardRef(() => AnimalsService))
    private readonly animalsService: AnimalsService,
  ) { }

  async create(author: User, createCommentDto: CreateCommentDto) {
    const { animalId, content } = createCommentDto;
    const animal = await this.animalsService.findById(animalId);
    return this.commentRepository.createComment(content, author, animal);
  }

  async createReply(author: User, commentId: string, createReplyDto: CreateReplyDto) {
    const parentComment = await this.commentRepository.findOne({
      where: { id: commentId },
      relations: ['animal', 'parent', 'parent.parent', 'parent.parent.parent', 'children']
    });
    if (!parentComment) {
      throw new CommentNotFoundException(commentId);
    }
    return this.commentRepository.createReply(createReplyDto.content, author, parentComment);
  }

  async getCommentInfo(id: string) {
    const commentDetail = await this.commentRepository.findCommentById(id);
    if (!commentDetail) {
      throw new CommentNotFoundException(id);
    }
    return commentDetail;
  }

  async getCommentsByAnimalId(animalId: string) {
    return this.commentRepository.findCommentsByAnimalId(animalId);
  }

  async updateComment(id: string, updateCommentDto: CommentUpdateDto, user: User) {
    const comment = await this.commentRepository.findOne({ where: { id }, relations: ['author'] });
    if (!comment) throw new CommentNotFoundException(id);

    if (comment.author.id !== user.id) {
      throw new UnauthorizedException('You are not allowed to update this comment');
    }

    comment.content = updateCommentDto.content;
    comment.lastModifiedAt = new Date();
    await this.commentRepository.save(comment);

    return this.commentRepository.findCommentById(id);
  }

  async deleteComment(id: string, user: User) {
    const comment = await this.commentRepository.findOne({ where: { id }, relations: ['author', 'parent', 'children'] });
    if (!comment) throw new CommentNotFoundException(id);

    if (comment.author.id !== user.id) {
      throw new UnauthorizedException('You are not allowed to delete this comment');
    }

    if (!comment.parent && comment.children && comment.children.length > 0) {
      throw new CommentCanNotDeleteException(id);
    }

    await this.commentRepository.remove(comment);
  }

  async getCommentReplyPercentage() {
    return this.commentRepository.getCommentReplyPercentage();
  }

  async searchComments(keyword: string) {
    return this.commentRepository.searchComments(keyword);
  }
}
