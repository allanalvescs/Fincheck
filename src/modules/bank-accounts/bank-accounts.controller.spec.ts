import { Test } from "@nestjs/testing";
import { BankAccountsController } from "./bank-accounts.controller";
import { BankAccountsService } from "./service/bank-accounts.service";
import { CreateBankAccountDto } from "./dto/create-bank-account.dto";
import { BankAccountTypeEnum } from "./entities/bank-account.entity";
import { UpdateBankAccountDto } from "./dto/update-bank-account.dto";

describe("Suite Test BankAccountsController", () => {
    let controller: BankAccountsController;
    let service: BankAccountsService;

    const mockService = {
        create: jest.fn(),
        findAll: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    };

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            controllers: [BankAccountsController],
            providers: [{
                provide: BankAccountsService,
                useValue: mockService,
            }]
        }).compile();

        controller = module.get<BankAccountsController>(BankAccountsController);
        service = module.get<BankAccountsService>(BankAccountsService);
    });

    describe("create method test", () => {
        it("Should be defined", () => {
            expect(controller.create).toBeDefined();
        });

        it("Should call service create method", async () => {
            const userId = "user-id";
            const createDto: CreateBankAccountDto = {
                name: "Test Account",
                initialBalance: 1000,
                type: BankAccountTypeEnum.CHECKING,
                color: "#FFFFFF",
            };
            
            await controller.create(userId, createDto);
            expect(service.create).toHaveBeenCalledWith(userId, createDto);
        });
    });

    describe("findAll method test", () => {
        it("Should be defined", () => {
            expect(controller.findAll).toBeDefined();
        });

        it("Should call service findAll method", async () => {
            const userId = "user-id";
            
            await controller.findAll(userId);
            expect(service.findAll).toHaveBeenCalledWith(userId);
        });
    });

    describe("update method test", () => {
        it("Should be defined", () => {
            expect(controller.update).toBeDefined();
        });

        it("Should call service update method", async () => {
            const userId = "user-id";
            const bankAccountId = "bank-account-id";
            const updateDto: UpdateBankAccountDto = {
                name: "Test Account",
                initialBalance: 1000,
                type: BankAccountTypeEnum.CHECKING,
                color: "#FFFFFF",
            };
            
            await controller.update(userId, bankAccountId, updateDto);
            expect(service.update).toHaveBeenCalledWith(userId, bankAccountId, updateDto);
        });
    });

    describe("delete method test", () => {
        it("Should be defined", () => {
            expect(controller.delete).toBeDefined();
        });

        it("Should call service delete method", async () => {
            const userId = "user-id";
            const bankAccountId = "bank-account-id";
            
            await controller.delete(userId, bankAccountId);
            expect(service.delete).toHaveBeenCalledWith(userId, bankAccountId);
        });
    });
});