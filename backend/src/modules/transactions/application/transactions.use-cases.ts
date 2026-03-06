import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { TransactionEntity, TransactionStatus } from '../infrastructure/transaction.entity';
import { WompiService } from '../../../shared/wompi/wompi.service';
import { ok, err, Result } from '../../../shared/result/result';
import { CreateTransactionDto } from './transaction.dto';

@Injectable()
export class CreateTransactionUseCase {
    private readonly logger = new Logger(CreateTransactionUseCase.name);

    constructor(
        @InjectRepository(TransactionEntity)
        private readonly repo: Repository<TransactionEntity>,
        private readonly wompi: WompiService,
        private readonly config: ConfigService,
    ) { }

    async execute(dto: CreateTransactionDto): Promise<Result<{
        transaction: TransactionEntity;
        cardToken: string;
        reference: string;
        baseFeeCents: number;
        deliveryFeeCents: number;
    }>> {
        try {
            const baseFeeCents = Number(this.config.get<number>('BASE_FEE', 300000));
            const deliveryFeeCents = Number(this.config.get<number>('DELIVERY_FEE', 500000));

            // Step 1: Tokenize card with Wompi
            const cardToken = await this.wompi.tokenizeCard({
                number: dto.cardNumber.replace(/\s/g, ''),
                cvc: dto.cardCvc,
                exp_month: dto.expMonth,
                exp_year: dto.expYear,
                card_holder: dto.cardHolder,
            });

            // Step 2: Create PENDING transaction in DB
            const reference = `TXN-${uuidv4().slice(0, 8).toUpperCase()}`;
            // We'll get the product price from the caller, so we use a placeholder here
            const transaction = this.repo.create({
                reference,
                status: TransactionStatus.PENDING,
                amountInCents: 0, // updated after we know the product
                baseFeeCents,
                deliveryFeeCents,
                customerId: dto.customerId,
                productId: dto.productId,
                cardLastFour: cardToken.last_four,
                cardBrand: cardToken.brand,
            });

            return ok({ transaction, cardToken: cardToken.token, reference, baseFeeCents, deliveryFeeCents });
        } catch (error) {
            this.logger.error('Error creating transaction', error);
            return err(new Error(error?.response?.data?.error?.messages?.join(', ') || 'Failed to process payment'));
        }
    }
}

@Injectable()
export class UpdateTransactionStatusUseCase {
    constructor(
        @InjectRepository(TransactionEntity)
        private readonly repo: Repository<TransactionEntity>,
    ) { }

    async execute(id: string, status: TransactionStatus, wompiTransactionId?: string): Promise<Result<TransactionEntity>> {
        try {
            const tx = await this.repo.findOne({ where: { id } });
            if (!tx) return err(new Error('Transaction not found'));
            tx.status = status;
            if (wompiTransactionId) tx.wompiTransactionId = wompiTransactionId;
            const saved = await this.repo.save(tx);
            return ok(saved);
        } catch {
            return err(new Error('Failed to update transaction'));
        }
    }
}

@Injectable()
export class GetTransactionUseCase {
    constructor(
        @InjectRepository(TransactionEntity)
        private readonly repo: Repository<TransactionEntity>,
    ) { }

    async execute(id: string): Promise<Result<TransactionEntity>> {
        try {
            const tx = await this.repo.findOne({
                where: { id },
                relations: ['customer', 'product'],
            });
            if (!tx) return err(new Error('Transaction not found'));
            return ok(tx);
        } catch {
            return err(new Error('Failed to fetch transaction'));
        }
    }
}
