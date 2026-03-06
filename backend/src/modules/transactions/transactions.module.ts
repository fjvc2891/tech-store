import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionEntity } from './infrastructure/transaction.entity';
import { CreateTransactionUseCase, UpdateTransactionStatusUseCase, GetTransactionUseCase } from './application/transactions.use-cases';
import { TransactionsController } from './infrastructure/transactions.controller';
import { WompiModule } from '../../shared/wompi/wompi.module';
import { ProductsModule } from '../products/products.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([TransactionEntity]),
        WompiModule,
        ProductsModule,
    ],
    providers: [CreateTransactionUseCase, UpdateTransactionStatusUseCase, GetTransactionUseCase],
    controllers: [TransactionsController],
    exports: [GetTransactionUseCase, UpdateTransactionStatusUseCase],
})
export class TransactionsModule { }
