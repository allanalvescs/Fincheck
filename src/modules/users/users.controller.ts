import { Controller, Get } from '@nestjs/common';
import { UsersService } from './service/users.service';
import { ActiveUserId } from '../../shared/decorators/ActiveUserId';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get('/me')
  me(@ActiveUserId() userId: string) {
    return this.userService.getUserById(userId);
  }
}
