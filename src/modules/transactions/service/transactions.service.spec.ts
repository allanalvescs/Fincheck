import { TransactionsRepository } from "../../../shared/database/repositories/transaction.repositories";
import { TransactionsService } from "./transactions.service";
import { BankAccountOwnerShipValidation } from "../../../modules/bank-accounts/validation/bank-account-ownership.service";
import { ValidateCategoriesOwnership } from "../../../modules/categories/validation/validate-categories-ownership.validation";
import { ValidateTransactionOwnership } from "../validator/validate-transaction-ownership.service";
import { Test } from "@nestjs/testing";
import { CreateTransactionDto } from "../dto/create-transaction.dto";
import { EnumTransactionType } from "../entities/transaction.entity";
import { NotFoundException } from "@nestjs/common";
import { UpdateTransactionDto } from "../dto/update-transaction.dto";

describe("Suite Test TransactionsService", () => {
  let service: TransactionsService;

  let transactionsRepo: TransactionsRepository,
  validateBankAccountOwnership: BankAccountOwnerShipValidation,
  validateCategoriesOwnership: ValidateCategoriesOwnership,
  validateTransactionOwnership: ValidateTransactionOwnership;

  const mockTransactionsRepository = {
    findAll: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockValidateBankAccountOwnership = {
    validate: jest.fn(),
  };

  const mockValidateCategoriesOwnership = {
    validate: jest.fn(),
  };

  const mockValidateTransactionOwnership = {
    validate: jest.fn(),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TransactionsService,
        {
          provide: TransactionsRepository,
          useValue: mockTransactionsRepository,
        },
        {
          provide: BankAccountOwnerShipValidation,
          useValue: mockValidateBankAccountOwnership,
        },
        {
          provide: ValidateCategoriesOwnership,
          useValue: mockValidateCategoriesOwnership,
        },
        {
          provide: ValidateTransactionOwnership,
          useValue: mockValidateTransactionOwnership,
        }
      ]
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);

    transactionsRepo = module.get<TransactionsRepository>(TransactionsRepository);
    validateBankAccountOwnership = module.get<BankAccountOwnerShipValidation>(BankAccountOwnerShipValidation);
    validateCategoriesOwnership = module.get<ValidateCategoriesOwnership>(ValidateCategoriesOwnership);
    validateTransactionOwnership = module.get<ValidateTransactionOwnership>(ValidateTransactionOwnership);

    jest.clearAllMocks();

  });

  describe("Create Transaction", () => {
    it("should create a transaction successfully", async () => {
      // Arrange
      const userId = "user-123";
      const createTransactionDto: CreateTransactionDto = {
        name: "Salary",
        value: 5000,
        date: "2024-06-15",
        type: EnumTransactionType.INCOME,
        bankAccountId: "bank-456",
        categoryId: "cat-789",
      };

      const expectedTransaction = {
        id: "trans-001",
        userId,
        ...createTransactionDto,
        date: new Date(createTransactionDto.date),
      };
      mockValidateBankAccountOwnership.validate.mockResolvedValue(undefined);
      mockValidateCategoriesOwnership.validate.mockResolvedValue(undefined);
      mockTransactionsRepository.create.mockResolvedValue(expectedTransaction);

      // Act
      const result = await service.create(userId, createTransactionDto);

      // Assert
      expect(result).toEqual(expectedTransaction);
      expect(validateBankAccountOwnership.validate).toHaveBeenCalledWith(userId, createTransactionDto.bankAccountId);
      expect(validateCategoriesOwnership.validate).toHaveBeenCalledWith(userId, createTransactionDto.categoryId);
      expect(transactionsRepo.create).toHaveBeenCalledWith({
        data: {
          userId,
          name: createTransactionDto.name,
          value: createTransactionDto.value,
          date: new Date(createTransactionDto.date),
          type: createTransactionDto.type,
          bankAccountId: createTransactionDto.bankAccountId,
          categoryId: createTransactionDto.categoryId,
        },
      });
    });

    it("Should throw error if bank account ownership validation fails", async () => {
      // Arrange
      const userId = "user-123";
      const createTransactionDto: CreateTransactionDto = {
        name: "Salary",
        value: 5000,
        date: "2024-06-15",
        type: EnumTransactionType.INCOME,
        bankAccountId: "bank-456",
        categoryId: "cat-789",
      };

      mockValidateBankAccountOwnership.validate.mockRejectedValue(new NotFoundException("Bank account not found."));

      // Act & Assert
      await expect(service.create(userId, createTransactionDto)).rejects.toThrow("Bank account not found.");
      expect(validateBankAccountOwnership.validate).toHaveBeenCalledWith(userId, createTransactionDto.bankAccountId);
      expect(validateCategoriesOwnership.validate).not.toHaveBeenCalled();
      expect(validateTransactionOwnership.validate).not.toHaveBeenCalled();
      expect(transactionsRepo.create).not.toHaveBeenCalled();
    });
  });

  describe("Find All Transactions", () => {
    it("should find all transactions with filters", async () => {
      // Arrange
      const userId = "user-123";
      const filters = {
        month: 6,
        year: 2024,
        bankAccountId: "bank-456",
        type: EnumTransactionType.EXPENSE,
      };

      const expectedTransactions = [
        { id: "trans-001", name: "Groceries", value: 150, date: new Date("2024-06-10"), type: EnumTransactionType.EXPENSE, bankAccountId: "bank-456", categoryId: "cat-001", userId },
        { id: " trans-002", name: "Utilities", value: 100, date: new Date("2024-06-12"), type: EnumTransactionType.EXPENSE, bankAccountId: "bank-456", categoryId: "cat-002", userId },
      ];

      mockTransactionsRepository.findAll.mockResolvedValue(expectedTransactions);

      // Act
      const result = await service.findAll(userId, filters);

      // Assert
      expect(result).toEqual(expectedTransactions);
      expect(transactionsRepo.findAll).toHaveBeenCalledWith({
        where: {
          userId,
          bankAccountId: filters.bankAccountId,
          type: filters.type,
          date: {
            gte: new Date(Date.UTC(filters.year, filters.month)),
            lt: new Date(Date.UTC(filters.year, filters.month + 1)),
          },
        },
      });
    });
  });

  describe("Update Transaction", () => {
    it("should update a transaction successfully", async () => {
      // Arrange
      const userId = "user-123";
      const transactionId = "trans-001";
      const updateTransactionDto: UpdateTransactionDto= {
        name: "Updated Salary",
        value: 5500,
        date: "2024-06-20",
        type: EnumTransactionType.INCOME,
        bankAccountId: "bank-456",
        categoryId: "cat-789",
      };

      const expectedUpdatedTransaction = {
        id: transactionId,
        userId,
        ...updateTransactionDto,
        date: new Date(updateTransactionDto.date),
      };

      mockValidateBankAccountOwnership.validate.mockResolvedValue(undefined);
      mockValidateCategoriesOwnership.validate.mockResolvedValue(undefined);
      mockValidateTransactionOwnership.validate.mockResolvedValue(undefined);
      mockTransactionsRepository.update.mockResolvedValue(expectedUpdatedTransaction);

      // Act
      const result = await service.update(userId, transactionId, updateTransactionDto);

      // Assert
      expect(result).toEqual(expectedUpdatedTransaction);
      expect(validateBankAccountOwnership.validate).toHaveBeenCalledWith(userId, updateTransactionDto.bankAccountId);
      expect(validateCategoriesOwnership.validate).toHaveBeenCalledWith(userId, updateTransactionDto.categoryId);
      expect(validateTransactionOwnership.validate).toHaveBeenCalledWith(userId, transactionId);
      expect(transactionsRepo.update).toHaveBeenCalledWith({
        where: { id: transactionId },
        data: {
          name: updateTransactionDto.name,
          value: updateTransactionDto.value,
          date: new Date(updateTransactionDto.date),
          type: updateTransactionDto.type,
          bankAccountId: updateTransactionDto.bankAccountId,
          categoryId: updateTransactionDto.categoryId,
        },
      });
    });

    it("Should throw error if category ownership validation fails", async () => {
      // Arrange
      const userId = "user-123";
      const transactionId = "trans-001";
      const updateTransactionDto: UpdateTransactionDto= {
        name: "Updated Salary",
        value: 5500,
        date: "2024-06-20",
        type: EnumTransactionType.INCOME,
        bankAccountId: "bank-456",
        categoryId: "cat-789",
      };

      mockValidateBankAccountOwnership.validate.mockResolvedValue(undefined);
      mockValidateCategoriesOwnership.validate.mockRejectedValue(new NotFoundException("Category account not found."));

      // Act & Assert

      const promiseUpdateTransaction = service.update(userId, transactionId, updateTransactionDto);
      await expect(promiseUpdateTransaction).rejects.toThrow("Category account not found.");
      await expect(promiseUpdateTransaction).rejects.toBeInstanceOf(NotFoundException);
      
      expect(validateBankAccountOwnership.validate).toHaveBeenCalledWith(userId, updateTransactionDto.bankAccountId);
      expect(validateCategoriesOwnership.validate).toHaveBeenCalledWith(userId, updateTransactionDto.categoryId);
      expect(validateTransactionOwnership.validate).not.toHaveBeenCalled();
      expect(transactionsRepo.update).not.toHaveBeenCalled();
    });
  });

  describe("Remove Transaction", () => {
    it("should remove a transaction successfully", async () => {
      // Arrange
      const userId = "user-123";
      const transactionId = "trans-001";

      mockValidateTransactionOwnership.validate.mockResolvedValue(undefined);
      mockValidateCategoriesOwnership.validate.mockResolvedValue(undefined);
      mockTransactionsRepository.delete.mockResolvedValue(undefined);

      // Act
      const result = await service.remove(userId, transactionId);

      // Assert
      expect(validateTransactionOwnership.validate).toHaveBeenCalledWith(userId, transactionId);
      expect(transactionsRepo.delete).toHaveBeenCalledWith({
        where: { id: transactionId },
      });

      expect(result).toBeNull();
    });

    it("Should throw error if search transaction ownership to remove not found", async () => {
      // Arrange
      const userId = "user-123";
      const transactionId = "trans-001";
      
      mockValidateCategoriesOwnership.validate.mockResolvedValue(undefined);
      mockValidateTransactionOwnership.validate.mockRejectedValue(new NotFoundException("Transaction not found."));
      // Act & Assert
      const promiseRemoveTransaction = service.remove(userId, transactionId);
      await expect(promiseRemoveTransaction).rejects.toThrow("Transaction not found.");
      await expect(promiseRemoveTransaction).rejects.toBeInstanceOf(NotFoundException);

      expect(validateTransactionOwnership.validate).toHaveBeenCalledWith(userId, transactionId);
      expect(transactionsRepo.delete).not.toHaveBeenCalled();
    });
  });
});