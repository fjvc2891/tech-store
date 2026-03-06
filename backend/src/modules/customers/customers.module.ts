import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerEntity } from './infrastructure/customer.entity';
import { CreateCustomerUseCase } from './application/create-customer.use-case';
import { CustomersController } from './infrastructure/customers.controller';

import { CustomerSeeder } from './infrastructure/customer.seeder';

@Module({
    imports: [TypeOrmModule.forFeature([CustomerEntity])],
    providers: [CreateCustomerUseCase, CustomerSeeder],
    controllers: [CustomersController],
    exports: [CreateCustomerUseCase, CustomerSeeder],
})
export class CustomersModule { }
