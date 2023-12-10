import { Injectable } from '@nestjs/common';
import { TransactionsRepository } from 'src/shared/database/repositories/transaction.repositories';

@Injectable()
export class ValidateTransactionOwnership {
  constructor(private readonly transactionsRepo: TransactionsRepository) {}
}
