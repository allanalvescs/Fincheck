import { Injectable } from '@nestjs/common';
import { CreateTransactionDto } from '../dto/create-transaction.dto';
import { UpdateTransactionDto } from '../dto/update-transaction.dto';
import { TransactionsRepository } from 'src/shared/database/repositories/transaction.repositories';
import { BankAccountOwnerShipValidation } from 'src/modules/bank-accounts/service/bank-account-ownership.service';
import { ValidateCategoriesOwnership } from 'src/modules/categories/service/validate-categories-ownership.service';
import { EntitiesOwnership } from '../types/EntitiesOwnership';

@Injectable()
export class TransactionsService {
  constructor(
    private readonly transactionsRepo: TransactionsRepository,
    private readonly validateBankAccountOwnership: BankAccountOwnerShipValidation,
    private readonly validateCategoriesOwnership: ValidateCategoriesOwnership,
  ) {}

  private async validateEntitiesOwnership({
    userId,
    bankAccountId,
    categoryId,
    transactionId,
  }: EntitiesOwnership) {
    return await Promise.all([
      bankAccountId &&
        this.validateBankAccountOwnership.validate(userId, bankAccountId),
      categoryId &&
        this.validateCategoriesOwnership.validate(userId, categoryId),
    ]);
  }

  async create(userId: string, createTransactionDto: CreateTransactionDto) {
    const { name, value, date, type, bankAccountId, categoryId } =
      createTransactionDto;

    await this.validateEntitiesOwnership({
      userId,
      bankAccountId,
      categoryId,
    });

    const transaction = await this.transactionsRepo.create({
      data: {
        userId,
        name,
        value,
        date: new Date(date),
        type,
        bankAccountId,
        categoryId,
      },
    });

    return transaction;
  }

  findAll(userId: string) {
    return this.transactionsRepo.findAll({ where: { userId } });
  }

  findOne(id: number) {
    return `This action returns a #${id} transaction`;
  }

  update(id: number, updateTransactionDto: UpdateTransactionDto) {
    return `This action updates a #${id} transaction`;
  }

  remove(id: number) {
    return `This action removes a #${id} transaction`;
  }
}
