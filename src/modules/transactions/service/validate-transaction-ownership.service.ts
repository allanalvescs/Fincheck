import { Injectable, UnauthorizedException } from '@nestjs/common';
import { TransactionsRepository } from 'src/shared/database/repositories/transaction.repositories';

@Injectable()
export class ValidateTransactionOwnership {
  constructor(private readonly transactionsRepo: TransactionsRepository) {}

  async validate(userId: string, transactionId: string) {
    const isOwner = await this.transactionsRepo.findFirst({
      where: { id: transactionId, userId },
    });

    if (!isOwner) {
      throw new UnauthorizedException('Transaction not found.');
    }
  }
}
