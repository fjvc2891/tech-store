import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateDeliveryUseCase } from './create-delivery.use-case';
import { DeliveryEntity } from '../infrastructure/delivery.entity';
import { Repository } from 'typeorm';

describe('CreateDeliveryUseCase', () => {
    let useCase: CreateDeliveryUseCase;
    let repo: Repository<DeliveryEntity>;

    const mockRepo = {
        create: jest.fn(),
        save: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CreateDeliveryUseCase,
                {
                    provide: getRepositoryToken(DeliveryEntity),
                    useValue: mockRepo,
                },
            ],
        }).compile();

        useCase = module.get<CreateDeliveryUseCase>(CreateDeliveryUseCase);
        repo = module.get<Repository<DeliveryEntity>>(getRepositoryToken(DeliveryEntity));
    });

    it('should create a delivery record successfully', async () => {
        const dto = {
            transactionId: 'tx-123',
            address: 'Calle 123',
            city: 'Bogota',
            department: 'DC'
        };
        const delivery = { ...dto, id: 'uuid' } as DeliveryEntity;

        mockRepo.create.mockReturnValue(delivery);
        mockRepo.save.mockResolvedValue(delivery);

        const result = await useCase.execute(dto);

        expect(result.isOk).toBe(true);
        if (result.isOk) {
            expect(result.value).toEqual(delivery);
        }
    });

    it('should return error if save fails', async () => {
        mockRepo.save.mockRejectedValue(new Error('DB Error'));
        const result = await useCase.execute({} as any);
        expect(result.isErr).toBe(true);
    });
});
