import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeliveryEntity } from './infrastructure/delivery.entity';
import { CreateDeliveryUseCase } from './application/create-delivery.use-case';
import { DeliveriesController } from './infrastructure/deliveries.controller';

@Module({
    imports: [TypeOrmModule.forFeature([DeliveryEntity])],
    providers: [CreateDeliveryUseCase],
    controllers: [DeliveriesController],
    exports: [CreateDeliveryUseCase],
})
export class DeliveriesModule { }
