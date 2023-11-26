import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsHexColor,
  IsEnum,
} from 'class-validator';
import { BankAccountTypeEnum } from '../entities/bank-account.entity';

export class CreateBankAccountDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  initialBalance: number;

  @IsString()
  @IsNotEmpty()
  @IsEnum(BankAccountTypeEnum)
  type: BankAccountTypeEnum;

  @IsString()
  @IsNotEmpty()
  @IsHexColor()
  color: string;
}
