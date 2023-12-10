import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
  IsPositive,
  IsDateString,
  IsEnum,
} from 'class-validator';
import { EnumTransactionType } from '../entities/transaction.entity';

export class CreateTransactionDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @IsUUID()
  bankAccountId: string;

  @IsString()
  @IsNotEmpty()
  @IsUUID()
  categoryId: string;

  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  value: number;

  @IsDateString()
  @IsNotEmpty()
  date: string;

  @IsString()
  @IsNotEmpty()
  @IsEnum(EnumTransactionType)
  type: EnumTransactionType;
}
