import { Test } from "@nestjs/testing";
import { UsersController } from "./users.controller";
import { UsersService } from "./service/users.service";

describe("Suite Test UsersController", () => {
    let controller: UsersController;
    let service: UsersService;

    const mockUsersService = {
        getUserById: jest.fn(),
    };

    beforeEach(async () => {
        jest.clearAllMocks();
        const module = await Test.createTestingModule({
            controllers: [UsersController],
            providers: [
                {
                    provide: UsersService,
                    useValue: mockUsersService,
                },
            ],
        }).compile();

        controller = module.get<UsersController>(UsersController);
        service = module.get<UsersService>(UsersService);
    });

    describe("me method test", () => {
        it("Should return user data for a given userId", async () => {
            // Arrange
            const userId = "user-id-123";
            const expectedUser = {
                name: "John Doe",
                email: "john.doe@example.com",
            };

            mockUsersService.getUserById.mockResolvedValue(expectedUser);

            // Act
            const user = await controller.me(userId);

            // Assert
            expect(service.getUserById).toHaveBeenCalledWith(userId);
            expect(user).toBe(expectedUser);
            expect(user).toHaveProperty("name");
            expect(user).toHaveProperty("email");
        });

        it("Should return null when user is not found", async () => {
            // Arrange
            const userId = "non-existent-user-id";

            mockUsersService.getUserById.mockResolvedValue(null);

            // Act
            const user = await controller.me(userId);

            // Assert
            expect(service.getUserById).toHaveBeenCalledWith(userId);
            expect(user).toBeNull();
        });

        it("Should call getUserById with correct userId parameter", async () => {
            // Arrange
            const userId = "test-user-id-456";
            const expectedUser = {
                name: "Jane Smith",
                email: "jane.smith@example.com",
            };

            mockUsersService.getUserById.mockResolvedValue(expectedUser);

            // Act
            await controller.me(userId);

            // Assert
            expect(service.getUserById).toHaveBeenCalledTimes(1);
            expect(service.getUserById).toHaveBeenCalledWith(userId);
        });
    });
});
