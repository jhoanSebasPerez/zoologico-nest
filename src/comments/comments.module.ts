import { forwardRef, Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { AnimalsModule } from 'src/animals/animals.module';
import { CommentRepository } from './repositories/comment.repository';
import { Comment } from './entities/comment.entity';

@Module({
  controllers: [CommentsController],
  providers: [CommentsService, CommentRepository],
  imports: [
    TypeOrmModule.forFeature([Comment, CommentRepository]),
    AuthModule,
    forwardRef(() => AnimalsModule)
  ],
  exports: [CommentsService, TypeOrmModule, CommentRepository]
})
export class CommentsModule { }
