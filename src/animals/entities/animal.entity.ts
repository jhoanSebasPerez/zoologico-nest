import { Comment } from "src/comments/entities/comment.entity";
import { Species } from "src/species/entities/species.entity";
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Animal {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text')
    name: string;

    @ManyToOne(() => Species, (specie) => specie.animals, { onDelete: 'CASCADE' })
    specie: Species;

    @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @OneToMany(() => Comment, (comment) => comment.animal, { onDelete: 'CASCADE' })
    comments: Comment[];

}
