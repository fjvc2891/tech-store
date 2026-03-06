import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { WompiService } from './wompi.service';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('WompiService', () => {
    let service: WompiService;
    let config: ConfigService;

    const mockClient = {
        post: jest.fn(),
        get: jest.fn(),
    };

    beforeEach(async () => {
        mockedAxios.create.mockReturnValue(mockClient as any);

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                WompiService,
                {
                    provide: ConfigService,
                    useValue: {
                        get: jest.fn((key, defaultValue) => {
                            if (key === 'WOMPI_INTEGRITY_KEY') return 'test_integrity_key';
                            return defaultValue;
                        }),
                    },
                },
            ],
        }).compile();

        service = module.get<WompiService>(WompiService);
        config = module.get<ConfigService>(ConfigService);
    });

    it('should generate a valid signature', () => {
        const signature = service.generateSignature('REF-1', 1000, 'COP');
        expect(signature).toBeDefined();
        expect(typeof signature).toBe('string');
    });

    it('should tokenize a card', async () => {
        mockClient.post.mockResolvedValue({
            data: {
                data: {
                    id: 'tok_123',
                    brand: 'VISA',
                    last_four: '4444',
                },
            },
        });

        const result = await service.tokenizeCard({
            number: '4111...',
            cvc: '123',
            exp_month: '12',
            exp_year: '25',
            card_holder: 'Test',
        });

        expect(result.token).toBe('tok_123');
        expect(result.brand).toBe('VISA');
    });

    it('should create a transaction', async () => {
        mockClient.post.mockResolvedValue({
            data: {
                data: { id: 'wompi_tx_123', status: 'PENDING' },
            },
        });

        const result = await service.createTransaction({} as any);
        expect(result.id).toBe('wompi_tx_123');
    });
});
