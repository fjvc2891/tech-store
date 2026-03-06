import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductEntity } from '../infrastructure/product.entity';

@Injectable()
export class ProductSeeder {
    constructor(
        @InjectRepository(ProductEntity)
        private readonly repo: Repository<ProductEntity>,
    ) { }

    async seed(): Promise<void> {
        const count = await this.repo.count();
        if (count > 0) return;

        const products = [
            {
                name: 'Wireless Noise-Canceling Headphones',
                description: 'Premium over-ear headphones with active noise cancellation, 30h battery life, and Hi-Res Audio certification.',
                priceCents: 29900000,
                stock: 15,
                imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
            },
            {
                name: 'Smart Watch Pro',
                description: 'Advanced smartwatch with health monitoring, GPS, AMOLED display, and 7-day battery. Water resistant IP68.',
                priceCents: 45000000,
                stock: 8,
                imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
            },
            {
                name: 'Mechanical Keyboard TKL',
                description: 'Tenkeyless mechanical keyboard with Cherry MX Blue switches, RGB backlight, and aluminum frame.',
                priceCents: 18500000,
                stock: 20,
                imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800',
            },
            {
                name: 'USB-C Hub 9-in-1',
                description: '9-port USB-C hub: 4K HDMI, 2x USB-A 3.0, USB-C PD 100W, SD/microSD reader, Ethernet, and 3.5mm audio.',
                priceCents: 12000000,
                stock: 30,
                imageUrl: 'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=800',
            },
            {
                name: 'Portable SSD 1TB',
                description: '1TB portable SSD with read speeds up to 1050 MB/s, USB 3.2 Gen2, shock-resistant and compact design.',
                priceCents: 22000000,
                stock: 12,
                imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
            },
        ];

        await this.repo.save(products);
        console.log('✅ Products seeded successfully');
    }
}
