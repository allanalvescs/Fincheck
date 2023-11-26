import { Module } from '@nestjs/common';
import { BankAccountsService } from './service/bank-accounts.service';
import { BankAccountOwnerShipValidation } from './service/bank-account-ownership.service';
import { BankAccountsController } from './bank-accounts.controller';

@Module({
  controllers: [BankAccountsController],
  providers: [BankAccountsService, BankAccountOwnerShipValidation],
  exports: [BankAccountOwnerShipValidation],
})
export class BankAccountsModule {}
