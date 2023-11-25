/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { UsersRepositories } from 'src/shared/database/repositories/users.repositories';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepo: UsersRepositories) {}

  async getUserById(userId: string) {
    const user = await this.usersRepo.findByEmail({
      where: { id: userId },
      select: {
        name: true,
        email: true,
      },
    });

    return user;
  }
}
