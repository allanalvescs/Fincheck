import { UsersRepositories } from "../../../shared/database/repositories/users.repository";
import { UsersService } from "./users.service";
import { Test } from "@nestjs/testing";

describe("Suite Test UsersService", () => {
  let service: UsersService;
  let usersRepository: UsersRepositories;

  const mockUsersRepository = {
    findByEmail: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepositories,
          useValue: mockUsersRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    usersRepository = module.get<UsersRepositories>(UsersRepositories);
  });

  describe("getUserById method test", () => {
    it("Should return user data for a given userId", async () => {
      // Arrange
      const userId = "user-id-123";
      const mockUser = {
        name: "John Doe",
        email: "john.doe@example.com",
      };
      mockUsersRepository.findByEmail.mockResolvedValue(mockUser);

      // Act
      const result = await service.getUserById(userId);

      // Assert
      expect(usersRepository.findByEmail).toHaveBeenCalledWith({
        where: { id: userId },
        select: {
          name: true,
          email: true,
        },
      });
      expect(result).toEqual(mockUser);
    });

    it("Should return null when user is not found", async () => {
      // Arrange
      const userId = "non-existent-user-id";
      mockUsersRepository.findByEmail.mockResolvedValue(null);

      // Act
      const result = await service.getUserById(userId);

      // Assert
      expect(usersRepository.findByEmail).toHaveBeenCalledWith({
        where: { id: userId },
        select: {
          name: true,
          email: true,
        },
      });
      expect(result).toBeNull();
    });

  });
});
