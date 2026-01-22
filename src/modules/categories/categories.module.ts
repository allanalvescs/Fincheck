import { Module } from '@nestjs/common';
import { CategoriesService } from './service/categories.service';
import { CategoriesController } from './categories.controller';
import { ValidateCategoriesOwnership } from './validation/validate-categories-ownership.validation';

@Module({
  controllers: [CategoriesController],
  providers: [CategoriesService, ValidateCategoriesOwnership],
  exports: [ValidateCategoriesOwnership],
})
export class CategoriesModule {}
