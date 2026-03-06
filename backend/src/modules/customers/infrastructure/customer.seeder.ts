import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerEntity } from '../infrastructure/customer.entity';

@Injectable()
export class CustomerSeeder {
    constructor(
        @InjectRepository(CustomerEntity)
        private readonly repo: Repository<CustomerEntity>,
    ) { }

    async seed(): Promise<void> {
        const count = await this.repo.count();
        if (count > 0) return;

        await this.repo.save({
            id: "0b1e1d3e-8c3b-4b1a-9c1a-1a2b3c4d5e6f", // Same UUID used in frontend for demo
            name: 'Default Test Customer',
            email: 'customer@test.com',
            phone: '+573001234567'
        });
        console.log('✅ Customers seeded successfully');
    }
}
