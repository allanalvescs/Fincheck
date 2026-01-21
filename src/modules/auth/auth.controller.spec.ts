import { Test } from "@nestjs/testing";
import { AuthController } from "./auth.controller";
import { AuthService } from "./service/auth.service";
import { SigninDto } from "./dto/authenticate.dto";
import { SignupDto } from "./dto/create-user.dto";

describe("Suite Test AuthController", () => {
    let controller: AuthController;
    let authService: AuthService;

    beforeAll(async () => {
        const module = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                {
                    provide: AuthService,
                    useValue: {
                        signin: jest.fn(),
                        signup: jest.fn(),
                    },
                },
            ],
        }).compile();

        controller = module.get<AuthController>(AuthController);
        authService = module.get<AuthService>(AuthService);
    });

    describe('signin method test', () => {
        it('should call authService.signin with correct params', async () => {
            const signinDto: SigninDto = { email: 'test@example.com', password: '123456' };
            const expectedResult = { accessToken: 'token' };

            jest.spyOn(authService, 'signin').mockResolvedValue(expectedResult);
            
            const result = await controller.signin(signinDto);
            
            expect(authService.signin).toHaveBeenCalledWith(signinDto);
            expect(result).toEqual(expectedResult);
        });
    });

    describe('siginup method test', () => {
        it('should call authService.signup with correct params', async () => {
            const signupDto: SignupDto = { name: 'Test', email: 'test@example.com', password: '123456' };
            const expectedResult = { accessToken: 'token' }

            jest.spyOn(authService, 'signup').mockResolvedValue(expectedResult)
            
            const result = await controller.siginup(signupDto)
            
            expect(authService.signup).toHaveBeenCalledWith(signupDto);
            expect(result).toEqual(expectedResult);
        });
    });
});