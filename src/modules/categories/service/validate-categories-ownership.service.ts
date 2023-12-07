import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CategoriesRepository } from 'src/shared/database/repositories/categories.repository';

@Injectable()
export class ValidateCategoriesOwnership {
  constructor(private readonly categoriesRepo: CategoriesRepository) {}

  async validate(userId: string, categoryId: string) {
    const isOwner = await this.categoriesRepo.findFirst({
      where: { id: categoryId, userId },
    });

    if (!isOwner) {
      throw new UnauthorizedException('Category account not found.');
    }
  }
}
