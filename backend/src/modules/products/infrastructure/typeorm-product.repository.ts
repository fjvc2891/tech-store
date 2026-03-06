import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductEntity } from './product.entity';
import { Product, ProductRepository } from '../domain/product.domain';

@Injectable()
export class TypeOrmProductRepository implements ProductRepository {
    constructor(
        @InjectRepository(ProductEntity)
        private readonly repo: Repository<ProductEntity>,
    ) { }

    async findAll(): Promise<Product[]> {
        return this.repo.find({ order: { createdAt: 'ASC' } });
    }

    async findById(id: string): Promise<Product | null> {
        return this.repo.findOne({ where: { id } });
    }

    async updateStock(id: string, quantity: number): Promise<Product> {
        await this.repo.decrement({ id }, 'stock', quantity);
        return this.repo.findOneOrFail({ where: { id } });
    }
}
