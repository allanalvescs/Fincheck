import { Injectable } from '@nestjs/common';
import { CreateBankAccountDto } from '../dto/create-bank-account.dto';
import { UpdateBankAccountDto } from '../dto/update-bank-account.dto';
import { BankAccountsRepository } from 'src/shared/database/repositories/bank-accounts.repositories';
import { BankAccountOwnerShipValidation } from './bank-account-ownership.service';

@Injectable()
export class BankAccountsService {
  constructor(
    private readonly bankAccountRepo: BankAccountsRepository,
    private readonly bankAccountOwnerShipValidation: BankAccountOwnerShipValidation,
  ) {}

  create(userId: string, createBankAccountDto: CreateBankAccountDto) {
    const { name, type, initialBalance, color } = createBankAccountDto;
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

  findAll(userId: string) {
    return this.bankAccountRepo.findAll({
      where: { userId },
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

    const newBankAccount = this.bankAccountRepo.update({
      where: { id: bankAccountId, userId },
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
      where: { id: bankAccountId, userId },
    });
  }
}
