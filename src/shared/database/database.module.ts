import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { UsersRepositories } from './repositories/users.repositories';

@Global()
@Module({
  providers: [PrismaService, UsersRepositories],
  exports: [UsersRepositories],
})
export class DatabaseModule {}
