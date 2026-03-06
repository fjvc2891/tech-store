import {
    Controller,
    Get,
    Param,
    Patch,
    Body,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GetProductsUseCase, GetProductByIdUseCase, UpdateProductStockUseCase } from '../application/products.use-cases';
import { IsNumber, Min } from 'class-validator';

class UpdateStockDto {
    @IsNumber()
    @Min(1)
    quantity: number;
}

@ApiTags('products')
@Controller('products')
export class ProductsController {
    constructor(
        private readonly getProducts: GetProductsUseCase,
        private readonly getProductById: GetProductByIdUseCase,
        private readonly updateStock: UpdateProductStockUseCase,
    ) { }

    @Get()
    @ApiOperation({ summary: 'Get all products with stock' })
    @ApiResponse({ status: 200, description: 'List of products' })
    async findAll() {
        const result = await this.getProducts.execute();
        if (result.isErr) throw new BadRequestException(result.error.message);
        return { data: result.value };
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get product by ID' })
    @ApiResponse({ status: 200, description: 'Product detail' })
    @ApiResponse({ status: 404, description: 'Product not found' })
    async findOne(@Param('id') id: string) {
        const result = await this.getProductById.execute(id);
        if (result.isErr) throw new NotFoundException(result.error.message);
        return { data: result.value };
    }

    @Patch(':id/stock')
    @ApiOperation({ summary: 'Decrease product stock' })
    @ApiResponse({ status: 200, description: 'Stock updated' })
    async decreaseStock(@Param('id') id: string, @Body() dto: UpdateStockDto) {
        const result = await this.updateStock.execute(id, dto.quantity);
        if (result.isErr) throw new BadRequestException(result.error.message);
        return { data: result.value };
    }
}
