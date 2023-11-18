import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { UsersRepositories } from './repositories/users.repositories';

@Module({
  providers: [PrismaService, UsersRepositories],
  exports: [UsersRepositories],
})
export class DatabaseModule {}
