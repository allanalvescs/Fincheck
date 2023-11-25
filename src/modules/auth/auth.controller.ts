import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SigninDto } from './dto/authenticate.dto';
import { SignupDto } from './dto/create-user.dto';
import { IsPublic } from 'src/shared/decorators/isPublic';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signin')
  @IsPublic()
  signin(@Body() signinDto: SigninDto) {
    return this.authService.signin(signinDto);
  }

  @Post('signup')
  @IsPublic()
  siginup(@Body() signupDto: SignupDto) {
    return this.authService.signup(signupDto);
  }
}
