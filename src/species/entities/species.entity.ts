import { Animal } from "src/animals/entities/animal.entity";
import { Zone } from "src/zones/entities/zone.entity";
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Species {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text', { unique: true })
    name: string;

    @ManyToOne(() => Zone, (zone) => zone.species, { onDelete: 'CASCADE' })
    zone: Zone;

    @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @OneToMany(() => Animal, (animal) => animal.specie, { onDelete: 'CASCADE' })
    animals: Animal[];

}
