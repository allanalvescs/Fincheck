import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { type Prisma } from '@prisma/client';

@Injectable()
export class BankAccountsRepository {
  constructor(private readonly prismaService: PrismaService) {}

  findAll<T extends Prisma.BankAccountFindManyArgs>(
    findManyBankAccountDto: Prisma.SelectSubset<
      T,
      Prisma.BankAccountFindManyArgs
    >,
  ) {
    return this.prismaService.bankAccount.findMany(findManyBankAccountDto);
  }

  findFirst(findFirstBankAccountDto: Prisma.BankAccountFindFirstArgs) {
    return this.prismaService.bankAccount.findFirst(findFirstBankAccountDto);
  }

  create(createBankAccountDto: Prisma.BankAccountCreateArgs) {
    return this.prismaService.bankAccount.create(createBankAccountDto);
  }

  update(updateBankAccountDto: Prisma.BankAccountUpdateArgs) {
    return this.prismaService.bankAccount.update(updateBankAccountDto);
  }

  delete(deleteBankAccountDto: Prisma.BankAccountDeleteArgs) {
    return this.prismaService.bankAccount.delete(deleteBankAccountDto);
  }
}
