import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity('products')
export class ProductEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 100 })
    name: string;

    @Column({ type: 'text' })
    description: string;

    @Column({ name: 'price_cents', type: 'int' })
    priceCents: number;

    @Column({ type: 'int', default: 0 })
    stock: number;

    @Column({ name: 'image_url', nullable: true })
    imageUrl: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
