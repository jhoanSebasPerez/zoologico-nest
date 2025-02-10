import { Animal } from "src/animals/entities/animal.entity";
import { User } from "src/auth/entities/user.entity";
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Comment {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text')
    content: string;

    @ManyToOne(() => User, (user) => user.comments, { onDelete: 'CASCADE' })
    author: User;

    @ManyToOne(() => Animal, (animal) => animal.comments, { onDelete: 'CASCADE' })
    animal: Animal;

    @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
    lastModifiedAt: Date;

    @Column('int', { default: 1 })
    level: number;

    @ManyToOne(() => Comment, (comment) => comment.children, { nullable: true, onDelete: 'CASCADE' })
    parent?: Comment;

    @OneToMany(() => Comment, (comment) => comment.parent)
    children?: Comment[];

}
