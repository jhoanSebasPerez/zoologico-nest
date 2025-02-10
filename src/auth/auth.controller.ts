import { Controller, Post, Body, Get, Query, Delete, HttpCode, HttpStatus, Param, Put } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto, UserResponseDto } from './dto';
import { Auth } from './decorators';
import { ValidRoles } from './types';
import { PaginationQueryDto } from 'src/common/dtos/pagination-query.dto';
import { plainToInstance } from 'class-transformer';
import { UserUpdateDto } from './dto/request/update-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post("/register")
  async createUser(@Body() createUserDto: CreateUserDto) {
    const { user, token } = await this.authService.createUser(createUserDto);
    return plainToInstance(UserResponseDto, {
      ...user,
      token
    }, { excludeExtraneousValues: true });
  }

  @Post("/login")
  @HttpCode(HttpStatus.OK)
  async loginUser(@Body() loginUserDto: LoginUserDto) {
    return await this.authService.loginUser(loginUserDto);
  }

  @Get()
  @Auth(ValidRoles.ADMIN)
  findAllUsers(@Query() query: PaginationQueryDto) {
    return this.authService.findAllUsers(query);
  }

  @Put("/:id")
  @Auth(ValidRoles.ADMIN)
  async updateUser(@Param('id') id: string, @Body() updateUserDto: UserUpdateDto) {
    const user = await this.authService.updateUser(id, updateUserDto);
    return plainToInstance(UserResponseDto, {
      ...user
    }, { excludeExtraneousValues: true });
  }

  @Delete("/:id")
  @Auth(ValidRoles.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('id') id: string) {
    return this.authService.deleteUser(id);
  }
}
