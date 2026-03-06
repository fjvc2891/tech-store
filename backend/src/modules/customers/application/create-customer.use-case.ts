import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerEntity } from '../infrastructure/customer.entity';
import { ok, err, Result } from '../../../shared/result/result';
import { CreateCustomerDto } from './create-customer.dto';

@Injectable()
export class CreateCustomerUseCase {
    constructor(
        @InjectRepository(CustomerEntity)
        private readonly repo: Repository<CustomerEntity>,
    ) { }

    async execute(dto: CreateCustomerDto): Promise<Result<CustomerEntity>> {
        try {
            const customer = this.repo.create(dto);
            const saved = await this.repo.save(customer);
            return ok(saved);
        } catch (error) {
            return err(new Error('Failed to create customer'));
        }
    }
}
