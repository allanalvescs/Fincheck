import { Test } from "@nestjs/testing";
import { CategoriesController } from "./categories.controller";
import { CategoriesService } from "./service/categories.service";

describe("Suite Test CategoryController", () => {
    let controller: CategoriesController;
    let service: CategoriesService;

    const mockCategoriesService = {
        findAllByUserId: jest.fn(),
    };

    beforeEach(async () => {
        jest.clearAllMocks();
        const module = await Test.createTestingModule({
            controllers: [CategoriesController],
            providers: [
                {
                    provide: CategoriesService,
                    useValue: mockCategoriesService,
                },
            ],
        }).compile();

        controller = module.get<CategoriesController>(CategoriesController);
        service = module.get<CategoriesService>(CategoriesService);
    });

    describe("findAll method test", () => {
        it("Should return an empty array of categories for a given user", async () => {
            // Arrange
            const userId = "user-id";
            const expectedCategories = [];

            mockCategoriesService.findAllByUserId.mockResolvedValue(expectedCategories);

            // Act
            const categories = await controller.findAll(userId);

            // Assert
            expect(service.findAllByUserId).toHaveBeenCalledWith(userId);
            expect(categories).toBe(expectedCategories);
            expect(categories).toHaveLength(0);
        });

        it("Should return an array of categories for a given user", async () => {
            // Arrange
            const userId = "user-id";
            const expectedCategories = [
                {
                    id: "category-id-1",
                    name: "Category 1",
                    color: "#FF0000",
                    userId: userId,
                },
                {
                    id: "category-id-2",
                    name: "Category 2",
                    color: "#00FF00",
                    userId: userId,
                },
            ];

            mockCategoriesService.findAllByUserId.mockResolvedValue(expectedCategories);

            // Act
            const categories = await controller.findAll(userId);

            // Assert
            expect(service.findAllByUserId).toHaveBeenCalledWith(userId);
            expect(categories).toBe(expectedCategories);
            expect(categories).toHaveLength(2);
        });
    });
});