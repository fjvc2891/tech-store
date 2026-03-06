import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeliveryEntity } from '../infrastructure/delivery.entity';
import { ok, err, Result } from '../../../shared/result/result';
import { CreateDeliveryDto } from './create-delivery.dto';

@Injectable()
export class CreateDeliveryUseCase {
    constructor(
        @InjectRepository(DeliveryEntity)
        private readonly repo: Repository<DeliveryEntity>,
    ) { }

    async execute(dto: CreateDeliveryDto): Promise<Result<DeliveryEntity>> {
        try {
            const delivery = this.repo.create(dto);
            const saved = await this.repo.save(delivery);
            return ok(saved);
        } catch (error) {
            return err(new Error('Failed to create delivery record'));
        }
    }
}
