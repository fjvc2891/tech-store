import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { TransactionEntity } from '../../transactions/infrastructure/transaction.entity';

@Entity('deliveries')
export class DeliveryEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'transaction_id' })
    transactionId: string;

    @OneToOne(() => TransactionEntity)
    @JoinColumn({ name: 'transaction_id' })
    transaction: TransactionEntity;

    @Column()
    address: string;

    @Column()
    city: string;

    @Column()
    department: string;

    @Column({ name: 'postal_code', nullable: true })
    postalCode: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
