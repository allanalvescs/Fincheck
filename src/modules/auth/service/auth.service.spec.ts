import { Test } from "@nestjs/testing";
import { UsersRepositories } from "../../../shared/database/repositories/users.repository";
import { AuthService } from "./auth.service";
import { JwtService } from "@nestjs/jwt";
import { SigninDto } from "../dto/authenticate.dto";
import * as bcrypt from "bcryptjs";
import { ConflictException, UnauthorizedException } from "@nestjs/common";
import { SignupDto } from "../dto/create-user.dto";

describe("Suite Test AuthService", () => {
    let service: AuthService;
    let userRepo: UsersRepositories;
    let jwtService: JwtService;


    // Mocks
    const mockUserRepo = {
        findByEmail: jest.fn(),
        create: jest.fn(),
    };

    const mockJwtService = {
        signAsync: jest.fn(),
    };

    beforeEach(async () => {

        const module = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: UsersRepositories,
                    useValue: mockUserRepo
                },
                {
                    provide: JwtService,
                    useValue: mockJwtService,
                }
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
        userRepo = module.get<UsersRepositories>(UsersRepositories);
        jwtService = module.get<JwtService>(JwtService);

        jest.clearAllMocks();
    });
    
    describe("signin method test", () => {
        it("should be defined", () => {
            expect(service.signin).toBeDefined();
        });

        it("should be success authentication with valid credentials", async () => {
            // Arrange
            const signinDto: SigninDto = {
                email: "johnDoe@gmail.com",
                password: "12345678"
            };

            const resolvedUser = {
                id: "user-uuid",
                email: signinDto.email,
                password: "hashedPassword",
                name: "John Doe"
            };

            mockUserRepo.findByEmail.mockResolvedValue(resolvedUser);
            mockJwtService.signAsync.mockResolvedValue("valid-jwt-token");
            (jest.spyOn(bcrypt, "compare") as jest.Mock).mockResolvedValue(true);

            //Act
            const result = await service.signin(signinDto);

            //Assert
            expect(userRepo.findByEmail).toHaveBeenCalledWith({
                where: { email: signinDto.email }
            });
            expect(bcrypt.compare).toHaveBeenCalledWith(signinDto.password, resolvedUser.password);
            expect(jwtService.signAsync).toHaveBeenCalledWith({ sub: resolvedUser.id });
            expect(result).toEqual({ accessToken: "valid-jwt-token" });

        });

        it("should throw UnauthorizedException when user not found", async () => {
            // Arrange
            const signinDto: SigninDto = { email: "nobody@gmail.com", password: "12345678" };
            mockUserRepo.findByEmail.mockResolvedValue(null);

            // Act & Assert
            const signinPromise = service.signin(signinDto);
            await expect(signinPromise).rejects.toThrow(UnauthorizedException);
            await expect(signinPromise).rejects.toThrow('email not found!');

            expect(mockUserRepo.findByEmail).toHaveBeenCalledWith({ where: { email: signinDto.email }});
            expect(bcrypt.compare).not.toHaveBeenCalled();
            expect(mockJwtService.signAsync).not.toHaveBeenCalled();
        });

        it("should throw UnauthorizedException when password is invalid", async () => {
            // Arrange
            const signinDto: SigninDto = { email: "allan@gmail.com", password: "12345678" };
            const expectedUser = {
                id: "user-uuid",
                email: signinDto.email,
                password: "hashedPassword",
                name: "Allan Souza"
            };

            mockUserRepo.findByEmail.mockResolvedValue(expectedUser);
            (jest.spyOn(bcrypt, "compare") as jest.Mock).mockResolvedValue(false);
            
            // Act & Assert
            const signinPromise = service.signin(signinDto);
            await expect(signinPromise).rejects.toThrow(UnauthorizedException);
            await expect(signinPromise).rejects.toThrow('Invalid password!');

            expect(mockUserRepo.findByEmail).toHaveBeenCalledWith({ where: { email: signinDto.email }});
            expect(bcrypt.compare).toHaveBeenCalledWith(signinDto.password, expectedUser.password);
            expect(mockJwtService.signAsync).not.toHaveBeenCalled();
        });
    });

    describe("signup method test", () => {
        it("should be defined", () => {
            expect(service.signup).toBeDefined();
        });

        it("should be successfully register a new user", async () => {
            // Arrange
            const signupDto: SignupDto  = {
                name: "John Doe",
                email: "johnDoe@gmail.com",
                password: "12345678"
            };

            const expectedUserCreate = {
                id: "user-uuid",
                name: signupDto.name,
                email: signupDto.email,
                password: "hashedPassword"
            };

            mockUserRepo.findByEmail.mockResolvedValue(null);
            mockUserRepo.create.mockResolvedValue(expectedUserCreate);
            (jest.spyOn(bcrypt, "hash") as jest.Mock).mockResolvedValue("hashedPassword");
            mockJwtService.signAsync.mockResolvedValue("valid-jwt-token");

            // Act
            const result = await service.signup(signupDto);
            const createCall = mockUserRepo.create.mock.calls[0][0];

            // Assert
            expect(mockUserRepo.findByEmail).toHaveBeenCalledWith({ where: { email: signupDto.email } });
            expect(bcrypt.hash).toHaveBeenCalledWith(signupDto.password, 12);
            expect(mockUserRepo.create).toHaveBeenCalledWith({
                data: {
                    name: signupDto.name,
                    email: signupDto.email,
                    password: "hashedPassword",
                    categories: {
                        createMany: {
                            data: expect.arrayContaining([
                                expect.objectContaining({
                                    name: expect.any(String),
                                    icon: expect.any(String),
                                    type: expect.any(String)
                                })
                            ])
                        }
                    }
                }
            });
            expect(createCall.data.categories.createMany.data).toHaveLength(12);
            expect(mockJwtService.signAsync).toHaveBeenCalledWith({ sub: expectedUserCreate.id });
            expect(result).toEqual({ accessToken: "valid-jwt-token" });
        });

        it("shoould throw an error ConflictException when email is already in use", async () => {
            // Arrange
            const signupDto: SignupDto  = {
                name: "John Doe Duplicate",
                email: "johnDoe@gmail.com",
                password: "12345678"
            };

            const existingUser = {
                id: "existing-user-uuid",
                name: signupDto.name,
                email: signupDto.email,
                password: "hashedPassword"
            };

            mockUserRepo.findByEmail.mockResolvedValue(existingUser);

            // Act
            const signupPromise = service.signup(signupDto);
            await expect(signupPromise).rejects.toThrow(ConflictException);
            await expect(signupPromise).rejects.toThrow("This email is already in use");

            // Assert
            expect(mockUserRepo.findByEmail).toHaveBeenCalledWith({ where: { email: signupDto.email } });
            expect(bcrypt.hash).not.toHaveBeenCalled();
            expect(mockUserRepo.create).not.toHaveBeenCalled();
            expect(mockJwtService.signAsync).not.toHaveBeenCalled();
        });
    });
});