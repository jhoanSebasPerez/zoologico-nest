import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto, LoginUserDto, UserUpdateDto } from './dto';
import { JwtPayload } from './types';
import { EmailAlreadyExistsException } from './exceptions/email-already-exists.exception';
import { PaginationQueryDto, PaginationResponseDto } from '../common/dtos';
import { UserNotFoundException } from './exceptions/user-not-found.exceptions';
import { UserRepository } from './repositories/user.repository';
import { UserProjectionDto } from './dto/projections/user-projection.dto';
import { plainToInstance } from 'class-transformer';
import { User } from './entities/user.entity';

@Injectable()
export class AuthService {

  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService
  ) { }

  async createUser(createAuthDto: CreateUserDto) {
    const { password, email, ...userData } = createAuthDto;

    const userExists = await this.userRepository.findOne({ where: { email } });

    if (userExists) {
      throw new EmailAlreadyExistsException();
    }

    const user = this.userRepository.create({
      ...userData,
      email,
      password: bcrypt.hashSync(password, 10)
    });

    await this.userRepository.save(user);

    return { user, token: this.generateToken({ id: user.id }) };
  }

  async loginUser(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;
    const user = await this.userRepository.findByEmailWithPassword(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials for the field (email)');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Your account is inactive, contact with admin user');
    }

    if (!bcrypt.compareSync(password, user.password)) {
      throw new UnauthorizedException('Invalid credentials for the field (password)');
    }

    const safeUser = plainToInstance(User, user);

    return { user: safeUser, token: this.generateToken({ id: user.id }) };
  }

  async findAllUsers(query: PaginationQueryDto): Promise<PaginationResponseDto<UserProjectionDto>> {
    const [users, total] = await this.userRepository.findAllUsersWithProjection(query);

    return new PaginationResponseDto<UserProjectionDto>(
      users,
      total,
      query.page ?? 1,
      Math.ceil(total / (query.limit ?? 10))
    );
  }

  async findById(id: string): Promise<UserProjectionDto> {
    const user = await this.userRepository.findUserById(id);

    if (!user) {
      throw new UserNotFoundException(id);
    }

    return user;
  }

  async deleteUser(id: string) {
    const user = await this.userRepository.findOneBy({ id });

    if (!user) {
      throw new UserNotFoundException(id);
    }

    user.isActive = false;
    await this.userRepository.save(user);
  }

  async updateUser(id: string, userUpdateDto: UserUpdateDto) {
    const user = await this.userRepository.findOneBy({ id });

    if (!user) {
      throw new UserNotFoundException(id);
    }

    await this.userRepository.save({
      ...user,
      ...userUpdateDto
    });

    return this.findById(id);
  }

  private generateToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload);
  }
}