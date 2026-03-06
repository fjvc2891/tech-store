import { Injectable, Inject } from '@nestjs/common';
import type { Product, ProductRepository } from '../domain/product.domain';
import { ok, err, Result } from '../../../shared/result/result';

@Injectable()
export class GetProductsUseCase {
    constructor(
        @Inject('PRODUCT_REPOSITORY')
        private readonly productRepo: ProductRepository,
    ) { }

    async execute(): Promise<Result<Product[]>> {
        try {
            const products = await this.productRepo.findAll();
            return ok(products);
        } catch (error) {
            return err(new Error('Failed to fetch products'));
        }
    }
}

@Injectable()
export class GetProductByIdUseCase {
    constructor(
        @Inject('PRODUCT_REPOSITORY')
        private readonly productRepo: ProductRepository,
    ) { }

    async execute(id: string): Promise<Result<Product>> {
        try {
            const product = await this.productRepo.findById(id);
            if (!product) return err(new Error('Product not found'));
            return ok(product);
        } catch (error) {
            return err(new Error('Failed to fetch product'));
        }
    }
}

@Injectable()
export class UpdateProductStockUseCase {
    constructor(
        @Inject('PRODUCT_REPOSITORY')
        private readonly productRepo: ProductRepository,
    ) { }

    async execute(id: string, quantity: number): Promise<Result<Product>> {
        try {
            const product = await this.productRepo.findById(id);
            if (!product) return err(new Error('Product not found'));
            if (product.stock < quantity) return err(new Error('Insufficient stock'));
            const updated = await this.productRepo.updateStock(id, quantity);
            return ok(updated);
        } catch (error) {
            return err(new Error('Failed to update stock'));
        }
    }
}
