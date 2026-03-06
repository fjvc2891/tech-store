import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateCustomerUseCase } from '../application/create-customer.use-case';
import { CreateCustomerDto } from '../application/create-customer.dto';

@ApiTags('customers')
@Controller('customers')
export class CustomersController {
    constructor(private readonly createCustomer: CreateCustomerUseCase) { }

    @Post()
    @ApiOperation({ summary: 'Create a new customer' })
    @ApiResponse({ status: 201, description: 'Customer created' })
    async create(@Body() dto: CreateCustomerDto) {
        const result = await this.createCustomer.execute(dto);
        if (result.isErr) throw new BadRequestException(result.error.message);
        return { data: result.value };
    }
}
