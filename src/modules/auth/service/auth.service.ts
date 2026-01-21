import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { SigninDto } from '../dto/authenticate.dto';
import { UsersRepositories } from '../../../shared/database/repositories/users.repository';
import { compare, hash } from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { SignupDto } from '../dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepo: UsersRepositories,
    private readonly jwtServivce: JwtService,
  ) {}

  async signin(signinDto: SigninDto) {
    const { email, password } = signinDto;

    const user = await this.userRepo.findByEmail({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('email not found!');
    }

    const isPasswordValid = await compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password!');
    }

    // Generate JWT (JSON web Token)

    const accessToken = await this.generateAccessToken(user.id);

    return { accessToken };
  }

  async signup(signupDto: SignupDto) {
    const { email, name, password } = signupDto;

    const emailTaken = await this.userRepo.findByEmail({
      where: { email },
    });

    if (emailTaken) {
      throw new ConflictException('This email is already in used');
    }

    const hashedPassword = await hash(password, 12);

    const user = await this.userRepo.create({
      data: {
        name,
        email,
        password: hashedPassword,
        categories: {
          createMany: {
            data: [
              // Income
              { name: 'Salário', icon: 'salary', type: 'INCOME' },
              { name: 'Freelance', icon: 'freelance', type: 'INCOME' },
              { name: 'Outro', icon: 'other', type: 'INCOME' },
              // Expense
              { name: 'Casa', icon: 'home', type: 'EXPENSE' },
              { name: 'Alimentação', icon: 'food', type: 'EXPENSE' },
              { name: 'Educação', icon: 'education', type: 'EXPENSE' },
              { name: 'Lazer', icon: 'fun', type: 'EXPENSE' },
              { name: 'Mercado', icon: 'grocery', type: 'EXPENSE' },
              { name: 'Roupas', icon: 'clothes', type: 'EXPENSE' },
              { name: 'Transporte', icon: 'transport', type: 'EXPENSE' },
              { name: 'Viagem', icon: 'travel', type: 'EXPENSE' },
              { name: 'Outro', icon: 'other', type: 'EXPENSE' },
            ],
          },
        },
      },
    });

    const accessToken = await this.generateAccessToken(user.id);

    return { accessToken };
  }

  private async generateAccessToken(idUser: string) {
    return await this.jwtServivce.signAsync({ sub: idUser });
  }
}
