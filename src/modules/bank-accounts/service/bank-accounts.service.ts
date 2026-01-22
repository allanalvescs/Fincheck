import { ConflictException, Injectable } from '@nestjs/common';
import { CreateBankAccountDto } from '../dto/create-bank-account.dto';
import { UpdateBankAccountDto } from '../dto/update-bank-account.dto';
import { BankAccountsRepository } from '../../../shared/database/repositories/bank-accounts.repositories';
import { BankAccountOwnerShipValidation } from '../validation/bank-account-ownership.service';

@Injectable()
export class BankAccountsService {
  constructor(
    private readonly bankAccountRepo: BankAccountsRepository,
    private readonly bankAccountOwnerShipValidation: BankAccountOwnerShipValidation,
  ) {}

  async create(userId: string, createBankAccountDto: CreateBankAccountDto) {
    const { name, type, initialBalance, color } = createBankAccountDto;

    const bankAccount = await this.bankAccountRepo.findFirst({ 
      where: { name, userId }
     });

    if (bankAccount) {
      throw new ConflictException('Bank account with the same name already exists');
    }

    return this.bankAccountRepo.create({
      data: {
        name,
        type,
        initialBalance,
        color,
        userId,
      },
    });
  }

  async findAll(userId: string) {
    const bankAccounts = await this.bankAccountRepo.findAll({
      where: { userId },
      include: {
        transactions: {
          select: {
            type: true,
            value: true,
          },
        },
      },
    });

    return bankAccounts.map(({ transactions, ...bankAccount }) => {
      const totalTransactions = transactions.reduce(
        (acc, currentTransaction) => {
          return (
            acc +
            (currentTransaction.type === 'INCOME'
              ? currentTransaction.value
              : -currentTransaction.value)
          );
        },
        0,
      );

      const currenteBalance = bankAccount.initialBalance + totalTransactions;
      return { currenteBalance, ...bankAccount };
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} bankAccount`;
  }

  async update(
    userId: string,
    bankAccountId: string,
    updateBankAccountDto: UpdateBankAccountDto,
  ) {
    await this.bankAccountOwnerShipValidation.validate(userId, bankAccountId);

    const { name, initialBalance, type, color } = updateBankAccountDto;

    const newBankAccount = await this.bankAccountRepo.update({
      where: { id: bankAccountId},
      data: {
        name,
        initialBalance,
        color,
        type,
      },
    });

    return newBankAccount;
  }

  async delete(userId: string, bankAccountId: string) {
    await this.bankAccountOwnerShipValidation.validate(userId, bankAccountId);

    return this.bankAccountRepo.delete({
      where: { id: bankAccountId },
    });
  }
}
