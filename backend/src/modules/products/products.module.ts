import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from './infrastructure/product.entity';
import { TypeOrmProductRepository } from './infrastructure/typeorm-product.repository';
import { ProductSeeder } from './infrastructure/product.seeder';
import { GetProductsUseCase, GetProductByIdUseCase, UpdateProductStockUseCase } from './application/products.use-cases';
import { ProductsController } from './infrastructure/products.controller';

@Module({
    imports: [TypeOrmModule.forFeature([ProductEntity])],
    providers: [
        { provide: 'PRODUCT_REPOSITORY', useClass: TypeOrmProductRepository },
        ProductSeeder,
        GetProductsUseCase,
        GetProductByIdUseCase,
        UpdateProductStockUseCase,
    ],
    controllers: [ProductsController],
    exports: [GetProductByIdUseCase, UpdateProductStockUseCase, ProductSeeder],
})
export class ProductsModule { }
