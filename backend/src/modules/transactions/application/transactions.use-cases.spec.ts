import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { CreateTransactionUseCase, UpdateTransactionStatusUseCase, GetTransactionUseCase } from './transactions.use-cases';
import { TransactionEntity, TransactionStatus } from '../infrastructure/transaction.entity';
import { WompiService } from '../../../shared/wompi/wompi.service';
import { Repository } from 'typeorm';

describe('Transactions Use Cases', () => {
    let createUseCase: CreateTransactionUseCase;
    let updateStatusUseCase: UpdateTransactionStatusUseCase;
    let getUseCase: GetTransactionUseCase;

    const mockRepo = {
        create: jest.fn(),
        save: jest.fn(),
        findOne: jest.fn(),
    };

    const mockWompi = {
        tokenizeCard: jest.fn(),
    };

    const mockConfig = {
        get: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CreateTransactionUseCase,
                UpdateTransactionStatusUseCase,
                GetTransactionUseCase,
                {
                    provide: getRepositoryToken(TransactionEntity),
                    useValue: mockRepo,
                },
                {
                    provide: WompiService,
                    useValue: mockWompi,
                },
                {
                    provide: ConfigService,
                    useValue: mockConfig,
                },
            ],
        }).compile();

        createUseCase = module.get<CreateTransactionUseCase>(CreateTransactionUseCase);
        updateStatusUseCase = module.get<UpdateTransactionStatusUseCase>(UpdateTransactionStatusUseCase);
        getUseCase = module.get<GetTransactionUseCase>(GetTransactionUseCase);
    });

    describe('CreateTransactionUseCase', () => {
        it('should initialize a transaction successfully', async () => {
            const dto = {
                productId: 'prod1',
                customerId: 'cust1',
                cardNumber: '4111111111111111',
                cardCvc: '123',
                expMonth: '12',
                expYear: '27',
                cardHolder: 'John Doe',
                quantity: 1,
            };

            mockConfig.get.mockReturnValue(3000); // base fee
            mockWompi.tokenizeCard.mockResolvedValue({
                token: 'tok_test',
                last_four: '1111',
                brand: 'VISA',
            });
            mockRepo.create.mockReturnValue({ reference: 'REF-1', status: TransactionStatus.PENDING });

            const result = await createUseCase.execute(dto);

            expect(result.isOk).toBe(true);
            if (result.isOk) {
                expect(result.value.cardToken).toBe('tok_test');
            }
        });

        it('should return error if tokenization fails', async () => {
            mockWompi.tokenizeCard.mockRejectedValue(new Error('Wompi Error'));
            const result = await createUseCase.execute({} as any);
            expect(result.isErr).toBe(true);
        });
    });

    describe('UpdateTransactionStatusUseCase', () => {
        it('should update status successfully', async () => {
            const tx = { id: '1', status: TransactionStatus.PENDING };
            mockRepo.findOne.mockResolvedValue(tx);
            mockRepo.save.mockResolvedValue({ ...tx, status: TransactionStatus.APPROVED });

            const result = await updateStatusUseCase.execute('1', TransactionStatus.APPROVED);

            expect(result.isOk).toBe(true);
            if (result.isOk) {
                expect(result.value.status).toBe(TransactionStatus.APPROVED);
            }
        });
    });
});
