import {
    Controller, Post, Patch, Get, Body, Param,
    BadRequestException, NotFoundException, Logger
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { CreateTransactionDto } from '../application/transaction.dto';
import { CreateTransactionUseCase, UpdateTransactionStatusUseCase, GetTransactionUseCase } from '../application/transactions.use-cases';
import { WompiService } from '../../../shared/wompi/wompi.service';
import { TransactionEntity, TransactionStatus } from './transaction.entity';
import { UpdateProductStockUseCase } from '../../products/application/products.use-cases';
import { GetProductByIdUseCase } from '../../products/application/products.use-cases';

@ApiTags('transactions')
@Controller('transactions')
export class TransactionsController {
    private readonly logger = new Logger(TransactionsController.name);

    constructor(
        private readonly createTx: CreateTransactionUseCase,
        private readonly updateTx: UpdateTransactionStatusUseCase,
        private readonly getTx: GetTransactionUseCase,
        private readonly wompi: WompiService,
        private readonly config: ConfigService,
        @InjectRepository(TransactionEntity)
        private readonly txRepo: Repository<TransactionEntity>,
        private readonly getProduct: GetProductByIdUseCase,
        private readonly updateStock: UpdateProductStockUseCase,
    ) { }

    @Post()
    @ApiOperation({ summary: 'Create transaction and process payment with Wompi' })
    @ApiResponse({ status: 201, description: 'Transaction created and payment processed' })
    async create(@Body() dto: CreateTransactionDto) {
        // 1. Get product to calculate total
        const productResult = await this.getProduct.execute(dto.productId);
        if (productResult.isErr) throw new BadRequestException('Product not found');
        const product = productResult.value;

        if (product.stock < dto.quantity) {
            throw new BadRequestException('Insufficient stock');
        }

        const baseFeeCents = Number(this.config.get('BASE_FEE', 300000));
        const deliveryFeeCents = Number(this.config.get('DELIVERY_FEE', 500000));
        const amountInCents = (product.priceCents * dto.quantity) + baseFeeCents + deliveryFeeCents;

        // 2. Tokenize card & prepare
        const initResult = await this.createTx.execute(dto);
        if (initResult.isErr) throw new BadRequestException(initResult.error.message);
        const { transaction: txDraft, cardToken, reference } = initResult.value as any;

        // 3. Generate integrity signature
        const signature = this.wompi.generateSignature(reference, amountInCents, 'COP');

        // 4. Save PENDING transaction to DB
        txDraft.amountInCents = amountInCents;
        const savedTx = await this.txRepo.save(txDraft);

        // 5. Call Wompi to process payment
        let wompiResponse: any;
        try {
            // Fetch acceptance token first
            const merchantData = await this.wompi.getMerchantData();
            const acceptanceToken = merchantData.presigned_acceptance?.acceptance_token;

            wompiResponse = await this.wompi.createTransaction({
                amount_in_cents: amountInCents,
                currency: 'COP',
                customer_email: dto.customerEmail,
                reference,
                payment_method: {
                    type: 'CARD',
                    token: cardToken,
                    installments: 1,
                },
                signature: signature,
                acceptance_token: acceptanceToken,
            } as any);
        } catch (error) {
            this.logger.error('Wompi payment error', error?.response?.data);
            await this.txRepo.update(savedTx.id, { status: TransactionStatus.ERROR });

            const errorData = error?.response?.data?.error;
            let errorMessage = 'Payment failed';

            if (errorData?.messages) {
                // messages can be an object with arrays of strings
                const messages = errorData.messages;
                if (typeof messages === 'object' && !Array.isArray(messages)) {
                    errorMessage = Object.entries(messages)
                        .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
                        .join('; ');
                } else if (Array.isArray(messages)) {
                    errorMessage = messages.join(', ');
                }
            } else if (errorData?.type) {
                errorMessage = errorData.type;
            }

            throw new BadRequestException(errorMessage);
        }

        // 6. Update transaction with Wompi response
        const wompiStatus = wompiResponse.status as string;
        const mappedStatus =
            wompiStatus === 'APPROVED' ? TransactionStatus.APPROVED :
                wompiStatus === 'DECLINED' ? TransactionStatus.DECLINED :
                    wompiStatus === 'VOIDED' ? TransactionStatus.VOIDED :
                        TransactionStatus.PENDING;

        await this.txRepo.update(savedTx.id, {
            status: mappedStatus,
            wompiTransactionId: wompiResponse.id,
        });

        // 7. If approved, decrease stock
        if (mappedStatus === TransactionStatus.APPROVED) {
            await this.updateStock.execute(dto.productId, dto.quantity);
        }

        const finalTx = await this.txRepo.findOne({
            where: { id: savedTx.id },
            relations: ['customer', 'product'],
        });

        return { data: finalTx, wompiStatus: wompiResponse.status };
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get transaction by ID' })
    async findOne(@Param('id') id: string) {
        const result = await this.getTx.execute(id);
        if (result.isErr) throw new NotFoundException(result.error.message);
        return { data: result.value };
    }

    @Patch(':id/status')
    @ApiOperation({ summary: 'Update transaction status manually' })
    async updateStatus(
        @Param('id') id: string,
        @Body() body: { status: TransactionStatus; wompiTransactionId?: string }
    ) {
        const result = await this.updateTx.execute(id, body.status, body.wompiTransactionId);
        if (result.isErr) throw new BadRequestException(result.error.message);
        return { data: result.value };
    }
}
