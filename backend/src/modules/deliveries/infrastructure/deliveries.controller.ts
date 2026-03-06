import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateDeliveryUseCase } from '../application/create-delivery.use-case';
import { CreateDeliveryDto } from '../application/create-delivery.dto';

@ApiTags('deliveries')
@Controller('deliveries')
export class DeliveriesController {
    constructor(private readonly createDelivery: CreateDeliveryUseCase) { }

    @Post()
    @ApiOperation({ summary: 'Create a delivery record for a transaction' })
    @ApiResponse({ status: 201, description: 'Delivery record created' })
    async create(@Body() dto: CreateDeliveryDto) {
        const result = await this.createDelivery.execute(dto);
        if (result.isErr) throw new BadRequestException(result.error.message);
        return { data: result.value };
    }
}
