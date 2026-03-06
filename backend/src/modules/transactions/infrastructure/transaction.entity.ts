import {
    Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
    UpdateDateColumn, ManyToOne, JoinColumn, OneToOne,
} from 'typeorm';
import { CustomerEntity } from '../../customers/infrastructure/customer.entity';
import { ProductEntity } from '../../products/infrastructure/product.entity';

export enum TransactionStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    DECLINED = 'DECLINED',
    ERROR = 'ERROR',
    VOIDED = 'VOIDED',
}

@Entity('transactions')
export class TransactionEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'wompi_transaction_id', nullable: true })
    wompiTransactionId: string;

    @Column({ name: 'reference', unique: true })
    reference: string;

    @Column({ name: 'status', type: 'enum', enum: TransactionStatus, default: TransactionStatus.PENDING })
    status: TransactionStatus;

    @Column({ name: 'amount_in_cents', type: 'int' })
    amountInCents: number;

    @Column({ name: 'base_fee_cents', type: 'int' })
    baseFeeCents: number;

    @Column({ name: 'delivery_fee_cents', type: 'int' })
    deliveryFeeCents: number;

    @Column({ name: 'customer_id' })
    customerId: string;

    @ManyToOne(() => CustomerEntity)
    @JoinColumn({ name: 'customer_id' })
    customer: CustomerEntity;

    @Column({ name: 'product_id' })
    productId: string;

    @ManyToOne(() => ProductEntity)
    @JoinColumn({ name: 'product_id' })
    product: ProductEntity;

    @Column({ name: 'card_last_four', nullable: true })
    cardLastFour: string;

    @Column({ name: 'card_brand', nullable: true })
    cardBrand: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
