import { Test } from "@nestjs/testing";
import { UsersRepositories } from "../../../shared/database/repositories/users.repository";
import { AuthService } from "./auth.service";
import { JwtService } from "@nestjs/jwt";
import { SigninDto } from "../dto/authenticate.dto";
import * as bcrypt from "bcryptjs";
import { ConflictException, UnauthorizedException } from "@nestjs/common";
import { SignupDto } from "../dto/create-user.dto";
import { create } from "domain";

describe("Suite Test AuthService", () => {
    let service: AuthService;
    let userRepo: UsersRepositories;
    let jwtService: JwtService;


    // Mocks
    const mockUseRepo = {
        findByEmail: jest.fn(),
        create: jest.fn(),
    };

    const mockJwtService = {
        signAsync: jest.fn(),
    };
    beforeEach(async () => {
        jest.mock("bcryptjs");

        const module = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: UsersRepositories,
                    useValue: mockUseRepo
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
            const singinDto: SigninDto = {
                email: "jonhDoe@gmail.com",
                password: "12345678"
            };

            const resolvedUser = {
                id: "user-uuid",
                email: singinDto.email,
                password: "hashedPassword",
                name: "Jonh Doe"
            };

            mockUseRepo.findByEmail.mockResolvedValue(resolvedUser);
            mockJwtService.signAsync.mockResolvedValue("valid-jwt-token");
            (jest.spyOn(bcrypt, "compare") as jest.Mock).mockResolvedValue(true);

            //Act
            const result = await service.signin(singinDto);

            //Assert
            expect(userRepo.findByEmail).toHaveBeenCalledWith({
                where: { email: singinDto.email }
            });
            expect(bcrypt.compare).toHaveBeenCalledWith(singinDto.password, resolvedUser.password);
            expect(jwtService.signAsync).toHaveBeenCalledWith({ sub: resolvedUser.id });
            expect(result).toEqual({ accessToken: "valid-jwt-token" });

        });

        it("should throw UnauthorizedException when user not found", async () => {
            // Arrange
            const singinDto: SigninDto ={ email: "nobody@gmail.com", password: "12345678" };
            mockUseRepo.findByEmail.mockResolvedValue(null);

            // Act & Assert
            await expect(service.signin(singinDto)).rejects.toThrow(UnauthorizedException);
            await expect(service.signin(singinDto)).rejects.toThrow('email not found!');

            expect(mockUseRepo.findByEmail).toHaveBeenCalledWith({ where: { email: singinDto.email }});
            expect(bcrypt.compare).not.toHaveBeenCalled();
            expect(mockJwtService.signAsync).not.toHaveBeenCalled();
        });

        it("should throw UnauthorizedException when password is invalid", async () => {
            // Arrange
            const singinDto: SigninDto ={ email: "allan@gmail.com", password: "12345678" };
            const expectedUser = {
                id: "user-uuid",
                email: singinDto.email,
                password: "hashedPassword",
                name: "Allan Souza"
            }

            mockUseRepo.findByEmail.mockResolvedValue(expectedUser);
            (jest.spyOn(bcrypt, "compare") as jest.Mock).mockResolvedValue(false);
            
            // Act & Assert
            await expect(service.signin(singinDto)).rejects.toThrow(UnauthorizedException);
            await expect(service.signin(singinDto)).rejects.toThrow('Invalid password!');

            expect(mockUseRepo.findByEmail).toHaveBeenCalledWith({ where: { email: singinDto.email }});
            expect(bcrypt.compare).toHaveBeenCalledWith(singinDto.password, expectedUser.password);
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
                name: "Jonh Doe",
                email: "jonhDoe@gmail.com",
                password: "12345678"
            };

            const expectedUserCreate = {
                id: "user-uuid",
                name: signupDto.name,
                email: signupDto.email,
                password: "hashedPassword"
            };

            mockUseRepo.findByEmail.mockResolvedValue(null);
            mockUseRepo.create.mockResolvedValue(expectedUserCreate);
            (jest.spyOn(bcrypt, "hash") as jest.Mock).mockResolvedValue("hashedPassword");
            mockJwtService.signAsync.mockResolvedValue("valid-jwt-token");

            // Act
            const result = await service.signup(signupDto);
            const createCall = mockUseRepo.create.mock.calls[0][0];

            // Assert
            expect(mockUseRepo.findByEmail).toHaveBeenCalledWith({ where: { email: signupDto.email } });
            expect(bcrypt.hash).toHaveBeenCalledWith(signupDto.password, 12);
            expect(mockUseRepo.create).toHaveBeenCalledWith({
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

        it("shoould be throw an error ConflictException when email is already in use", async () => {
            // Arrange
            const signupDto: SignupDto  = {
                name: "Jonh Doe Duplicate",
                email: "jonhDoe@gmail.com",
                password: "12345678"
            };

            const existingUser = {
                id: "existing-user-uuid",
                name: signupDto.name,
                email: signupDto.email,
                password: "hashedPassword"
            };

            mockUseRepo.findByEmail.mockResolvedValue(existingUser);

            // Actt
            await expect(service.signup(signupDto)).rejects.toThrow(ConflictException);
            await expect(service.signup(signupDto)).rejects.toThrow("This email is already in used");

            // Assert
            expect(mockUseRepo.findByEmail).toHaveBeenCalledWith({ where: { email: signupDto.email } });
            expect(bcrypt.hash).not.toHaveBeenCalled();
            expect(mockUseRepo.create).not.toHaveBeenCalled();
            expect(mockJwtService.signAsync).not.toHaveBeenCalled();
        });
    });
});