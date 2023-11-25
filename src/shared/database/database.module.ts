import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { UsersRepositories } from './repositories/users.repository';
import { CategoriesRepository } from './repositories/categories.repository';

@Global()
@Module({
  providers: [PrismaService, UsersRepositories, CategoriesRepository],
  exports: [UsersRepositories, CategoriesRepository],
})
export class DatabaseModule {}
