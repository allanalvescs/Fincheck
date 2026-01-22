import { Module } from '@nestjs/common';
import { UsersService } from './service/users.service';
import { UsersController } from './users.controller';
import { DatabaseModule } from '../../shared/database/database.module';
@Module({
  imports: [DatabaseModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}