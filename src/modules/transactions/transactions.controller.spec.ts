import { Test } from "@nestjs/testing";
import { TransactionsService } from "./service/transactions.service";
import { TransactionsController } from "./transactions.controller";
import { CreateTransactionDto } from "./dto/create-transaction.dto";
import { EnumTransactionType } from "./entities/transaction.entity";

describe("Suite Test TransactionsController", () => {
  let controller: TransactionsController;
  let service: TransactionsService;

  const mockTransactionService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module = await Test.createTestingModule({
      controllers: [TransactionsController],
      providers: [
        {
          provide: TransactionsService,
          useValue: mockTransactionService,
        },
      ],
    }).compile();

    controller = module.get<TransactionsController>(TransactionsController);
    service = module.get<TransactionsService>(TransactionsService);
  });

  describe("create method test", () => {
    it("Should call create method from TransactionsService", async () => {
      const userId = "user-id";
      const createTransactionDto: CreateTransactionDto = { 
        name: "Salary",
        bankAccountId: "bank-account-id",
        categoryId: "category-id",
        date: new Date().toISOString(),
        value: 100,
        type: EnumTransactionType.INCOME 
      };

      await controller.create(userId, createTransactionDto);

      expect(service.create).toHaveBeenCalledWith(
        userId,
        createTransactionDto,
      );
    });
  });

  describe("findAll method test", () => {
    it("Should call findAll method from TransactionsService", async () => {
      const userId = "user-id";
      const month = 5;
      const year = 2023;
      const bankAccountId = "bank-account-id";
      const type = EnumTransactionType.EXPENSE;

      await controller.findAll(
        userId,
        month,
        year,
        bankAccountId,
        type,
      );

      expect(service.findAll).toHaveBeenCalledWith(userId, {
        month,
        year,
        bankAccountId,
        type,
      });
    });
  });

  describe("findOne method test", () => {
    it("Should call findOne method from TransactionsService", async () => {
      const transactionId = "transaction-id";

      await controller.findOne(transactionId);

      expect(service.findOne).toHaveBeenCalledWith(+transactionId);
    });
  });

  describe("update method test", () => {
    it("Should call update method from TransactionsService", async () => {
      const userId = "user-id";
      const transactionId = "transaction-id";
      const updateTransactionDto: CreateTransactionDto = { 
        name: "Updated Salary",
        bankAccountId: "bank-account-id",
        categoryId: "category-id",
        date: new Date().toISOString(),
        value: 150,
        type: EnumTransactionType.INCOME 
      };

      await controller.update(
        userId,
        transactionId,
        updateTransactionDto,
      );

      expect(service.update).toHaveBeenCalledWith(
        userId,
        transactionId,
        updateTransactionDto,
      );
    });
  });

  describe("remove method test", () => {
    it("Should call remove method from TransactionsService", async () => {
      const userId = "user-id";
      const transactionId = "transaction-id";

      await controller.remove(userId, transactionId);

      expect(service.remove).toHaveBeenCalledWith(userId, transactionId);
    });
  });
});