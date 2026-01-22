import { CategoriesRepository } from "../../../shared/database/repositories/categories.repository";
import { CategoriesService } from "./categories.service";
import { Test } from "@nestjs/testing";

describe("Suite Test CategoriesService", () => {
  let service: CategoriesService;
  let categoriesRepository: CategoriesRepository;

  const mockCategoriesRepository = {
    findMany: jest.fn(),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: CategoriesRepository,
          useValue: mockCategoriesRepository,
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    categoriesRepository = module.get<CategoriesRepository>(CategoriesRepository);
  });

  describe("findAllByUserId method test", () => {
    it("Should return an empty array of categories for a given userId", async () => {
      // Arrange
      const userId = "user-id-123";
      mockCategoriesRepository.findMany.mockResolvedValue([]);

      // Act
      const result = await service.findAllByUserId(userId);

      // Assert
      expect(categoriesRepository.findMany).toHaveBeenCalledWith({
        where: { userId },
      });
      expect(result).toEqual([]);
    });

    it("Should return an array of categories for a given userId", async () => {
      // Arrange
      const userId = "user-id-123";
      const mockCategories = [
        { id: "cat-1", name: "Category 1", userId },
        { id: "cat-2", name: "Category 2", userId },
      ];
      mockCategoriesRepository.findMany.mockResolvedValue(mockCategories);

      // Act
      const result = await service.findAllByUserId(userId);

      // Assert
      expect(categoriesRepository.findMany).toHaveBeenCalledWith({
        where: { userId },
      });
      expect(result).toEqual(mockCategories);
    });
  });
});