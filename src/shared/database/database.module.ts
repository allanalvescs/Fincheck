import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { UsersRepositories } from './repositories/users.repository';
import { CategoriesRepository } from './repositories/categories.repository';
import { BankAccountsRepository } from './repositories/bank-accounts.repositories';

@Global()
@Module({
  providers: [
    PrismaService,
    UsersRepositories,
    CategoriesRepository,
    BankAccountsRepository,
  ],
  exports: [UsersRepositories, CategoriesRepository, BankAccountsRepository],
})
export class DatabaseModule {}
