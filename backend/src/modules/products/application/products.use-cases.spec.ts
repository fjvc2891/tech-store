import { Test, TestingModule } from '@nestjs/testing';
import { GetProductsUseCase, GetProductByIdUseCase, UpdateProductStockUseCase } from './products.use-cases';
import { Product } from '../domain/product.domain';

describe('Products Use Cases', () => {
    let getProductsUseCase: GetProductsUseCase;
    let getProductByIdUseCase: GetProductByIdUseCase;
    let updateStockUseCase: UpdateProductStockUseCase;

    const mockProduct: Product = {
        id: '1',
        name: 'Test Product',
        description: 'Description',
        priceCents: 1000,
        stock: 10,
        imageUrl: 'http://image.com',
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const mockProductRepo = {
        findAll: jest.fn(),
        findById: jest.fn(),
        updateStock: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GetProductsUseCase,
                GetProductByIdUseCase,
                UpdateProductStockUseCase,
                {
                    provide: 'PRODUCT_REPOSITORY',
                    useValue: mockProductRepo,
                },
            ],
        }).compile();

        getProductsUseCase = module.get<GetProductsUseCase>(GetProductsUseCase);
        getProductByIdUseCase = module.get<GetProductByIdUseCase>(GetProductByIdUseCase);
        updateStockUseCase = module.get<UpdateProductStockUseCase>(UpdateProductStockUseCase);
    });

    describe('GetProductsUseCase', () => {
        it('should return all products', async () => {
            mockProductRepo.findAll.mockResolvedValue([mockProduct]);
            const result = await getProductsUseCase.execute();
            expect(result.isOk).toBe(true);
            if (result.isOk) {
                expect(result.value).toEqual([mockProduct]);
            }
        });

        it('should return error if repository fails', async () => {
            mockProductRepo.findAll.mockRejectedValue(new Error());
            const result = await getProductsUseCase.execute();
            expect(result.isErr).toBe(true);
        });
    });

    describe('GetProductByIdUseCase', () => {
        it('should return a product by id', async () => {
            mockProductRepo.findById.mockResolvedValue(mockProduct);
            const result = await getProductByIdUseCase.execute('1');
            expect(result.isOk).toBe(true);
            if (result.isOk) {
                expect(result.value).toEqual(mockProduct);
            }
        });

        it('should return error if product not found', async () => {
            mockProductRepo.findById.mockResolvedValue(null);
            const result = await getProductByIdUseCase.execute('99');
            expect(result.isErr).toBe(true);
            if (result.isErr) {
                expect(result.error.message).toBe('Product not found');
            }
        });
    });

    describe('UpdateProductStockUseCase', () => {
        it('should update stock successfully', async () => {
            mockProductRepo.findById.mockResolvedValue(mockProduct);
            mockProductRepo.updateStock.mockResolvedValue({ ...mockProduct, stock: 9 });

            const result = await updateStockUseCase.execute('1', 1);
            expect(result.isOk).toBe(true);
            if (result.isOk) {
                expect(result.value.stock).toBe(9);
            }
        });

        it('should return error if insufficient stock', async () => {
            mockProductRepo.findById.mockResolvedValue(mockProduct);
            const result = await updateStockUseCase.execute('1', 100);
            expect(result.isErr).toBe(true);
            if (result.isErr) {
                expect(result.error.message).toBe('Insufficient stock');
            }
        });
    });
});
