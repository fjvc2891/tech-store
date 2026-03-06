import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';

@Entity('customers')
export class CustomerEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 150 })
    name: string;

    @Column({ length: 150 })
    email: string;

    @Column({ length: 20, nullable: true })
    phone: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
