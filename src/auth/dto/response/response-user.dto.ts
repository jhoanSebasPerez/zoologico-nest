import { Exclude, Expose, Transform } from "class-transformer";

export class UserResponseDto {
    @Expose()
    id: string;

    @Expose()
    email: string;

    @Expose()
    fullName: string;

    @Exclude()
    isActive: boolean;

    @Expose()
    roles: string[];

    @Exclude()
    password?: string;

    @Expose()
    token?: string;

    @Expose()
    @Transform(({ obj }) => ({
        self: { method: 'GET', href: `/users/${obj.id}` },
    }))
    links: object;
}