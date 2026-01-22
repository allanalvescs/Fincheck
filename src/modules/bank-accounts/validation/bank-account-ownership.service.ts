import { Injectable, NotFoundException } from '@nestjs/common';
import { BankAccountsRepository } from '../../../shared/database/repositories/bank-accounts.repositories';

@Injectable()
export class BankAccountOwnerShipValidation {
  constructor(private readonly bankAccountRepo: BankAccountsRepository) {}

  async validate(userId: string, bankAccountId: string) {
    const isBankAccountOwnership = await this.bankAccountRepo.findFirst({
      where: { id: bankAccountId, userId },
    });

    if (!isBankAccountOwnership) {
      throw new NotFoundException('Bank account not found.');
    }
  }
}
