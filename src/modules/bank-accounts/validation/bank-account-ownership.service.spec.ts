import { NotFoundException } from "@nestjs/common";
import { BankAccountsRepository } from "../../../shared/database/repositories/bank-accounts.repositories";
import { BankAccountOwnerShipValidation } from "./bank-account-ownership.service";
import { Test } from "@nestjs/testing";

describe("Suite Test BankAccountOwnershipValidation", () => {
    let validation: BankAccountOwnerShipValidation;
    let bankAccountsRepository: BankAccountsRepository;

    const mockBankAccountsRepository = {
        findFirst: jest.fn(),
    };

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                BankAccountOwnerShipValidation,
                {
                    provide: BankAccountsRepository,
                    useValue: mockBankAccountsRepository,
                },
            ],
        }).compile();

        validation = module.get<BankAccountOwnerShipValidation>(BankAccountOwnerShipValidation);
        bankAccountsRepository = module.get<BankAccountsRepository>(BankAccountsRepository);
    });

    describe("Validate method test", () => {
        it("Should pass validation, exist a bank account", async () => {
            // Arrange
            const userId = "user-id";
            const bankAccountId = "bank-account-id";

            const expectBankAccount = {
                id: bankAccountId,
                userId: userId,
                name: "Bank Account Test",
                initialBalance: 1000,
                type: "CHECKING",
                color: "#333333",
            };

            mockBankAccountsRepository.findFirst.mockResolvedValue(expectBankAccount);

            // Act
            await validation.validate(userId, bankAccountId);

            // Assert
            expect(bankAccountsRepository.findFirst).toHaveBeenCalledWith({
                where: { id: bankAccountId, userId },
            });
            expect(validation.validate(userId, bankAccountId)).resolves.not.toThrow(NotFoundException);
        });

        it("Should throw NotFoundException, bank account not found", async () => {
            // Arrange
            const userId = "user-id";
            const bankAccountId = "bank-account-id";

            mockBankAccountsRepository.findFirst.mockResolvedValue(null);

            // Act & Assert
            const validationPromise = validation.validate(userId, bankAccountId);
            await expect(validationPromise).rejects.toThrow(NotFoundException);
            await expect(validationPromise).rejects.toThrow('Bank account not found.');
            
            expect(mockBankAccountsRepository.findFirst).toHaveBeenCalledWith({
                where: { id: bankAccountId, userId },
            });
        });
    });
});