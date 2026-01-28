import { Test } from "@nestjs/testing";
import { TransactionsRepository } from "../../../shared/database/repositories/transaction.repositories";
import { ValidateTransactionOwnership } from "./validate-transaction-ownership.service";
import { NotFoundException } from "@nestjs/common";

describe("Suite Test ValidateTransactionOwnership", () => {
  let validator: ValidateTransactionOwnership;
  let transactionsRepo: TransactionsRepository;

  const mockTransactionRepo = {
    findFirst: jest.fn(),
  }
  beforeEach(async () => {
    jest.clearAllMocks();
    
    const module = await Test.createTestingModule({
      providers: [
        ValidateTransactionOwnership,
        {
          provide: TransactionsRepository,
          useValue: mockTransactionRepo,
        }
      ]
    }).compile();

    validator = module.get<ValidateTransactionOwnership>(ValidateTransactionOwnership);
    transactionsRepo = module.get<TransactionsRepository>(TransactionsRepository);
  });

  describe("validate test", () => {
    it("should validate transaction ownership successfully", async () => {
      // Arrange
      const userId = "user-123";
      const transactionId = "trans-456";

      const expectedTransaction = {
        id: transactionId,
        userId: userId,
        amount: 100,
        type: "INCOME",
      };

      mockTransactionRepo.findFirst.mockResolvedValue(expectedTransaction);

      // Act
      const result = await validator.validate(userId, transactionId);

      // Assert
      expect(result).toBeUndefined();
      expect(transactionsRepo.findFirst).toHaveBeenCalledWith({
        where: { id: transactionId, userId },
      });
    });

    it("should throw UnauthorizedException when user does not own the transaction", async () => {
      // Arrange
      const userId = "user-123";
      const transactionId = "trans-not-found";
      
      mockTransactionRepo.findFirst.mockResolvedValue(null);

      // Act & Assert
      const validatorPromise = validator.validate(userId, transactionId);

      await expect(validatorPromise).rejects.toThrow('Transaction not found.');
      await expect(validatorPromise).rejects.toBeInstanceOf(NotFoundException)
      
      expect(transactionsRepo.findFirst).toHaveBeenCalledWith({
        where: { id: transactionId, userId },
      });
    });
  });
});