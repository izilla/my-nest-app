import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CatsModule } from './cats/cats.module';
import configuration from './config/configuration';
import { PostsService } from './posts/posts.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersService } from './users/users.service';

@Module({
  imports: [PrismaModule, ConfigModule.forRoot({ load: [configuration], cache: true }), CatsModule],
  controllers: [AppController],
  providers: [AppService, UsersService, PostsService],
})
export class AppModule {}
