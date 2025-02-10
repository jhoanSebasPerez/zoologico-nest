import { Exclude } from "class-transformer";
import { Comment } from "src/comments/entities/comment.entity";
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text', { unique: true })
    email: string;

    @Column('text')
    fullName: string;

    @Exclude()
    @Column('text', { select: false })
    password: string;

    @Column('bool', { default: true })
    isActive: boolean;

    @Column('text', { array: true, default: ['employee'] })
    roles: string[];

    @OneToMany(() => Comment, (comment) => comment.author, { onDelete: 'CASCADE' })
    comments: Comment[];

    @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @BeforeInsert()
    checkFieldsBeforeInsert() {
        this.email = this.email.toLowerCase().trim();
    }

    @BeforeUpdate()
    checkFieldsBeforeUpdate() {
        this.checkFieldsBeforeInsert();
    }
}
