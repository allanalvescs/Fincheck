import { Test } from "@nestjs/testing";
import { BankAccountsService } from "./bank-accounts.service";
import { BankAccountsRepository } from "../../../shared/database/repositories/bank-accounts.repositories";
import { BankAccountOwnerShipValidation } from "../validation/bank-account-ownership.service";
import { CreateBankAccountDto } from "../dto/create-bank-account.dto";
import { BankAccountTypeEnum } from "../entities/bank-account.entity";
import { mock } from "node:test";
import { ConflictException, NotFoundException } from "@nestjs/common";
import { UpdateBankAccountDto } from "../dto/update-bank-account.dto";

describe("Suite Test BankAccountsService", () => {
    let service: BankAccountsService;
    let bankAccountsRepository: BankAccountsRepository;
    let bankAccountOwnerShipValidation: BankAccountOwnerShipValidation;

    const mockBankAccountsRepository = {
        create: jest.fn(),
        findAll: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    };

    const mockBankAccountOwnerShipValidation = {
        validate: jest.fn(),
    };

    beforeEach(async () => {
        jest.clearAllMocks();
        
        const module = await Test.createTestingModule({
            providers: [
                BankAccountsService,
                {
                    provide: BankAccountsRepository,
                    useValue: mockBankAccountsRepository,
                },
                {
                    provide: BankAccountOwnerShipValidation,
                    useValue: mockBankAccountOwnerShipValidation,
                },
            ],
        }).compile();

        service = module.get<BankAccountsService>(BankAccountsService);
        bankAccountsRepository = module.get<BankAccountsRepository>(BankAccountsRepository);
        bankAccountOwnerShipValidation = module.get<BankAccountOwnerShipValidation>(BankAccountOwnerShipValidation);
    });

    describe("Create method test", () => {
        it("Should create a bank account", async () => {
            // Arrange
            const userId = "user-id";
            const createBankAccountDto: CreateBankAccountDto = {
                name: "Bank Account Test",
                type: BankAccountTypeEnum.CHECKING,
                initialBalance: 1000,
                color: "#333333",
            };

            const expectBankAccount = {
                id: "bank-account-id",
                ...createBankAccountDto,
                userId,
            };

            mockBankAccountsRepository.create.mockResolvedValue(expectBankAccount);

            // Act
            const result = await service.create(userId, createBankAccountDto);

            // Assert
            expect(bankAccountsRepository.create).toHaveBeenCalledWith({
                data: {
                    ...createBankAccountDto,
                    userId,
                },
            });
            expect(result).toEqual(expectBankAccount);
        });

        it("Should throw an error when has bank account with same name", async () => {
            // Arrange
            const userId = "user-id";
            const createBankAccountDto: CreateBankAccountDto = {
                name: "Bank Account Test",
                type: BankAccountTypeEnum.CHECKING,
                initialBalance: 1000,
                color: "#333333",
            };

            const expectBankAccount = {
                id: "bank-account-id",
                userId,
                name: "My Bank Account",
                type: BankAccountTypeEnum.CHECKING,
                initialBalance: 1000,
                color: "#333333",
            };

            mockBankAccountsRepository.findFirst.mockResolvedValue(expectBankAccount);

            // Act
            const createBankAccountPromise = service.create(userId, createBankAccountDto);

            // Assert
            await expect(createBankAccountPromise).rejects.toBeInstanceOf(ConflictException);
            await expect(createBankAccountPromise).rejects.toThrow(
                'Bank account with the same name already exists',
            );

            expect(mockBankAccountsRepository.findFirst).toHaveBeenCalledWith({
                where: { name: createBankAccountDto.name, userId },
            });
            expect(mockBankAccountsRepository.create).not.toHaveBeenCalled();
        });
    });

    describe("FindAll method test", () => {
        it("Should return all bank accounts", async () => {
            // Arrange
            const userId = "user-id";
            const bankAccountsFromRepo = [
                {
                    id: "bank-account-id-1",
                    name: "Bank Account Test 1",
                    type: BankAccountTypeEnum.CHECKING,
                    initialBalance: 0,
                    color: "#333333",
                    userId,
                    transactions: [
                        { type: "INCOME", value: 500 },
                        { type: "INCOME", value: 200 },
                    ],
                },
                {
                    id: "bank-account-id-2",
                    name: "Bank Account Test 2",
                    type: BankAccountTypeEnum.INVESTMENT,
                    initialBalance: 2000,
                    color: "#444444",
                    userId,
                    transactions: [
                        { type: "INCOME", value: 1000 },
                        { type: "EXPENSE", value: 300 },
                    ],
                },
            ];

            mockBankAccountsRepository.findAll.mockResolvedValue(bankAccountsFromRepo);

            // Act
            const result = await service.findAll(userId);

            // Assert
            expect(bankAccountsRepository.findAll).toHaveBeenCalledWith({
                where: { userId },
                include: {
                    transactions: {
                        select: {
                            type: true,
                            value: true,
                        },
                    },
                },
            });

            expect(result).toEqual([
                {
                    id: "bank-account-id-1",
                    name: "Bank Account Test 1",
                    type: BankAccountTypeEnum.CHECKING,
                    initialBalance: 0,
                    color: "#333333",
                    userId,
                    currenteBalance: 700,
                },
                {
                    id: "bank-account-id-2",
                    name: "Bank Account Test 2",
                    type: BankAccountTypeEnum.INVESTMENT,
                    initialBalance: 2000,
                    color: "#444444",
                    userId,
                    currenteBalance: 2700,
                },
            ]);
            expect(result).toHaveLength(result.length);
        });

        it("Should return an empty array when user has no bank accounts", async () => {
            // Arrange
            const userId = "user-id-with-no-bank-accounts";

            mockBankAccountsRepository.findAll.mockResolvedValue([]);

            // Act
            const result = await service.findAll(userId);

            // Assert
            expect(mockBankAccountsRepository.findAll).toHaveBeenCalledWith({
                where: { userId },
                include: {
                    transactions: {
                        select: {
                            type: true,
                            value: true,
                        },
                    },
                },
            });

            expect(result).toEqual([]);
            expect(result).toHaveLength(0);
        });
    });

    describe("Update method test", () => {
       it("Should found a bank account and update with new data", async () => {
            // Arrange
            const userId = "user-id";
            const bankAccountId = "bank-account-id-valid";
            const updateBankAccountDto: UpdateBankAccountDto = {
                name: "Updated Bank Account Name",
                color: "#555555",
                initialBalance: 1500,
                type: BankAccountTypeEnum.CASH,
            };

            mockBankAccountOwnerShipValidation.validate.mockResolvedValue(true);
            mockBankAccountsRepository.update.mockResolvedValue({
                id: bankAccountId,
                userId,
                ...updateBankAccountDto,
            });

            // Act
            const result = await service.update(userId, bankAccountId, updateBankAccountDto);

            // Assert
            expect(bankAccountOwnerShipValidation.validate).toHaveBeenCalledWith(userId, bankAccountId);
            expect(bankAccountsRepository.update).toHaveBeenCalledWith({
                where: { id: bankAccountId},
                data: {
                    ...updateBankAccountDto,
                },
            });

            expect(result).toEqual({ id: bankAccountId, userId, ...updateBankAccountDto });
       });

       it("Should throw an error when bank account not found", async () => {
            // Arrange
            const userId = "user-id";
            const bankAccountId = "bank-account-id-invalid";
            const updateBankAccountDtio: UpdateBankAccountDto = {
                name: "Updated Bank Account Name",
                color: "#555555",
                initialBalance: 1500,
                type: BankAccountTypeEnum.CASH,
            };

            mockBankAccountOwnerShipValidation.validate.mockRejectedValue(new NotFoundException('Bank account not found'));
            // Act
            const updateBankAccountPromise = service.update(userId, bankAccountId, updateBankAccountDtio);

            // Assert
            await expect(updateBankAccountPromise).rejects.toBeInstanceOf(NotFoundException);
            await expect(updateBankAccountPromise).rejects.toThrow('Bank account not found');

            expect(bankAccountOwnerShipValidation.validate).toHaveBeenCalledWith(userId, bankAccountId);
            expect(bankAccountsRepository.update).not.toHaveBeenCalled();

       });
    });

    describe("Delete method test", () => {
        it("Should delete a bank account", async () => {
            // Arrange
            const userId = "user-id";
            const bankAccountId = "bank-account-id-valid";

            mockBankAccountOwnerShipValidation.validate.mockResolvedValue(true);
            mockBankAccountsRepository.delete.mockResolvedValue(null);
            // Act
            const result = await service.delete(userId, bankAccountId);
            
            // Assert
            expect(mockBankAccountOwnerShipValidation.validate).toHaveBeenCalledWith(userId, bankAccountId);
            expect(mockBankAccountsRepository.delete).toHaveBeenCalledWith({
                where: { id: bankAccountId },
            });

            expect(result).toBeNull();
        });

        it("Should not found a bank account to delete", async () => {
            // Arrange
            const userId = "user-id";
            const bankAccountId = "bank-account-id-invalid";

            mockBankAccountOwnerShipValidation.validate.mockRejectedValue(new NotFoundException('Bank account not found'));
            mockBankAccountsRepository.delete.mockResolvedValue(null);
            // Act
            const deleteBankAccountPromise = service.delete(userId, bankAccountId);
            
            // Assert
            await expect(deleteBankAccountPromise).rejects.toBeInstanceOf(NotFoundException);
            await expect(deleteBankAccountPromise).rejects.toThrow('Bank account not found');

            expect(mockBankAccountOwnerShipValidation.validate).toHaveBeenCalledWith(userId, bankAccountId);
            expect(mockBankAccountsRepository.delete).not.toHaveBeenCalled();
        });
    });
});