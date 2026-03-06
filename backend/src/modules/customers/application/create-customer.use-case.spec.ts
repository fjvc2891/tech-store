import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateCustomerUseCase } from './create-customer.use-case';
import { CustomerEntity } from '../infrastructure/customer.entity';
import { Repository } from 'typeorm';

describe('CreateCustomerUseCase', () => {
    let useCase: CreateCustomerUseCase;
    let repo: Repository<CustomerEntity>;

    const mockRepo = {
        create: jest.fn(),
        save: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CreateCustomerUseCase,
                {
                    provide: getRepositoryToken(CustomerEntity),
                    useValue: mockRepo,
                },
            ],
        }).compile();

        useCase = module.get<CreateCustomerUseCase>(CreateCustomerUseCase);
        repo = module.get<Repository<CustomerEntity>>(getRepositoryToken(CustomerEntity));
    });

    it('should create a customer successfully', async () => {
        const dto = { name: 'John Doe', email: 'john@example.com', phone: '123456' };
        const customer = { ...dto, id: 'uuid' } as CustomerEntity;

        mockRepo.create.mockReturnValue(customer);
        mockRepo.save.mockResolvedValue(customer);

        const result = await useCase.execute(dto);

        expect(result.isOk).toBe(true);
        if (result.isOk) {
            expect(result.value).toEqual(customer);
        }
    });

    it('should return error if save fails', async () => {
        mockRepo.save.mockRejectedValue(new Error('DB Error'));
        const result = await useCase.execute({ name: '', email: '', phone: '' });
        expect(result.isErr).toBe(true);
    });
});
