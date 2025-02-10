import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { User } from "../entities/user.entity";
import { JwtPayload } from "../types";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ConfigService } from "@nestjs/config";
import { Injectable, UnauthorizedException } from "@nestjs/common";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,

        private readonly configService: ConfigService
    ) {
        super({
            secretOrKey: configService.get<string>('JWT_SECRET', 'defaultSecret'),
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        });
    }

    async validate(payload: JwtPayload): Promise<User> {
        if (!payload) {
            throw new UnauthorizedException("Token invalid or expired");
        }

        const { id } = payload;

        const user = await this.userRepository.findOneBy({ id });

        if (!user) {
            throw new UnauthorizedException("Invalid credentials, your token is invalid");
        }

        if (user && !user.isActive) {
            throw new UnauthorizedException("Invalid credentials, your account is inactive, contact with admin user");
        }

        return user;
    }
}