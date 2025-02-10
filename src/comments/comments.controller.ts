import { Controller, Post, Body, Param, Get, Delete, HttpStatus, HttpCode, Put, BadRequestException } from '@nestjs/common';
import { isUUID } from 'class-validator';
import { CommentsService } from './comments.service';
import { CreateReplyDto, CreateCommentDto } from './dto';
import { Auth, GetUser } from 'src/auth/decorators';
import { ValidRoles } from 'src/auth/types';
import { User } from 'src/auth/entities/user.entity';
import { CommentUpdateDto } from './dto/update-comment.dto';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) { }

  @Post()
  @Auth(ValidRoles.ADMIN, ValidRoles.EMPLOYEE)
  async createComment(
    @Body() createCommentDto: CreateCommentDto,
    @GetUser() author: User
  ) {
    return this.commentsService.create(author, createCommentDto);
  }

  @Post("/:id/reply")
  @Auth(ValidRoles.ADMIN, ValidRoles.EMPLOYEE)
  async createReply(
    @Param('id')
    commentId: string,
    @Body() createReplyDto: CreateReplyDto,
    @GetUser() author: User) {
    if (!isUUID(commentId)) {
      throw new BadRequestException('Invalid comment id');
    }
    return this.commentsService.createReply(author, commentId, createReplyDto);
  }

  @Get("/:id")
  @Auth(ValidRoles.ADMIN, ValidRoles.EMPLOYEE)
  async getComment(@Param('id') id: string) {
    return this.commentsService.getCommentInfo(id);
  }

  @Put("/:id")
  @Auth(ValidRoles.ADMIN, ValidRoles.EMPLOYEE)
  async updateComment(
    @Param('id') id: string,
    @Body() updateCommentDto: CommentUpdateDto,
    @GetUser() user: User
  ) {
    return this.commentsService.updateComment(id, updateCommentDto, user);
  }


  @Delete("/:id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @Auth(ValidRoles.ADMIN, ValidRoles.EMPLOYEE)
  async deleteComment(
    @Param('id') id: string,
    @GetUser() user: User
  ) {
    return await this.commentsService.deleteComment(id, user);
  }
}
