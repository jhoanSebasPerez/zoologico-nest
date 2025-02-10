import { DataSource, Repository } from "typeorm";
import { User } from "../entities/user.entity";
import { UserProjectionDto } from "../dto/projections/user-projection.dto";
import { PaginationQueryDto } from "src/common/dtos";
import { Injectable } from "@nestjs/common";

@Injectable()
export class UserRepository extends Repository<User> {
    constructor(private readonly dataSource: DataSource) {
        super(User, dataSource.createEntityManager());
    }

    async findByEmailWithPassword(email: string): Promise<User | undefined> {
        return this.createQueryBuilder('user')
            .select(['user.id', 'user.email', 'user.password', 'user.fullName', 'user.isActive'])
            .where('user.email = :email', { email })
            .getOne() as Promise<User | undefined>;
    }

    async findUserById(id: string): Promise<UserProjectionDto | undefined> {
        return this.createQueryBuilder('user')
            .select(['user.id', 'user.email', 'user.fullName', 'user.isActive'])
            .where('user.id = :id', { id })
            .getOne() as Promise<UserProjectionDto | undefined>;
    }

    async findAllUsersWithProjection(query: PaginationQueryDto): Promise<[UserProjectionDto[], number]> {
        const page = query.page ?? 1;
        const limit = query.limit ?? 10;
        const sortBy = query.sortBy ?? 'createdAt';
        const order = query.order?.toUpperCase() as 'ASC' | 'DESC' ?? 'DESC';

        return this.createQueryBuilder('user')
            .select(['user.id', 'user.email', 'user.fullName', 'user.isActive'])
            .orderBy(`user.${sortBy}`, order)
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();
    }
}