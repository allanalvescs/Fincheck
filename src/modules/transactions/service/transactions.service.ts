import { Injectable } from '@nestjs/common';
import { CreateTransactionDto } from '../dto/create-transaction.dto';
import { UpdateTransactionDto } from '../dto/update-transaction.dto';
import { TransactionsRepository } from 'src/shared/database/repositories/transaction.repositories';
import { BankAccountOwnerShipValidation } from 'src/modules/bank-accounts/service/bank-account-ownership.service';
import { ValidateCategoriesOwnership } from 'src/modules/categories/service/validate-categories-ownership.service';
import { EntitiesOwnership } from '../types/EntitiesOwnership';
import { ValidateTransactionOwnership } from './validate-transaction-ownership.service';
import { EnumTransactionType } from '../entities/transaction.entity';

@Injectable()
export class TransactionsService {
  constructor(
    private readonly transactionsRepo: TransactionsRepository,
    private readonly validateBankAccountOwnership: BankAccountOwnerShipValidation,
    private readonly validateCategoriesOwnership: ValidateCategoriesOwnership,
    private readonly validateTransactionOwnership: ValidateTransactionOwnership,
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
      transactionId &&
        this.validateTransactionOwnership.validate(userId, transactionId),
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

  findAll(
    userId: string,
    filters: {
      month: number;
      year: number;
      bankAccountId?: string;
      type?: EnumTransactionType;
    },
  ) {
    return this.transactionsRepo.findAll({
      where: {
        userId,
        bankAccountId: filters.bankAccountId,
        type: filters.type,
        date: {
          gte: new Date(Date.UTC(filters.year, filters.month)),
          lt: new Date(Date.UTC(filters.year, filters.month + 1)),
        },
      },
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} transaction`;
  }

  async update(
    userId: string,
    transactionId: string,
    updateTransactionDto: UpdateTransactionDto,
  ) {
    const { name, value, date, type, bankAccountId, categoryId } =
      updateTransactionDto;

    await this.validateEntitiesOwnership({
      userId,
      bankAccountId,
      categoryId,
      transactionId,
    });

    const newTransaction = await this.transactionsRepo.update({
      where: { id: transactionId },
      data: {
        name,
        value,
        date: new Date(date),
        type,
        bankAccountId,
        categoryId,
      },
    });

    return newTransaction;
  }

  async remove(userId: string, transactionId: string) {
    await this.validateEntitiesOwnership({ userId, transactionId });

    await this.transactionsRepo.delete({
      where: { id: transactionId },
    });

    return null;
  }
}
