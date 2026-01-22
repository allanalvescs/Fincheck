import { Test } from "@nestjs/testing";
import { CategoriesRepository } from "../../../shared/database/repositories/categories.repository";
import { ValidateCategoriesOwnership } from "./validate-categories-ownership.validation";
import { NotFoundException } from "@nestjs/common";

describe("Suite Test ValidateCategoriesOwnership", () => {
    let validation: ValidateCategoriesOwnership;
    let mockCategoriesRepository: CategoriesRepository;

    const mockCategoryRepo = {
        findFirst: jest.fn(),
    }
    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                ValidateCategoriesOwnership,
                {
                    provide: CategoriesRepository,
                    useValue: mockCategoryRepo,
                },
            ],
        }).compile();

        validation = module.get<ValidateCategoriesOwnership>(ValidateCategoriesOwnership);
        mockCategoriesRepository = module.get<CategoriesRepository>(CategoriesRepository);
    });

    describe("validate method test", () => {
        it("Should validate category ownership successfully", async () => {
            // Arrange
            const userId = "user-id";
            const categoryId = "category-id";

            mockCategoriesRepository.findFirst = jest.fn().mockResolvedValue({
                id: categoryId,
                userId: userId,
            });

            // Act
            await validation.validate(userId, categoryId);

            // Assert
            expect(mockCategoriesRepository.findFirst).toHaveBeenCalledWith({
                where: { id: categoryId, userId },
            });
        });

        it("Should throw NotFoundException when category not found", async () => {
            // Arrange
            const userId = "user-id";
            const categoryId = "category-id";

            mockCategoriesRepository.findFirst = jest.fn().mockResolvedValue(null);

            // Act
            const validatePromise = validation.validate(userId, categoryId);

            // Assert
            await expect(validatePromise).rejects.toBeInstanceOf(NotFoundException);
            await expect(validatePromise).rejects.toThrow('Category account not found.');
            expect(mockCategoriesRepository.findFirst).toHaveBeenCalledWith({
                where: { id: categoryId, userId },
            });
        });
    });
});