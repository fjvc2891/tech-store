export interface Product {
    id: string;
    name: string;
    description: string;
    priceCents: number;
    stock: number;
    imageUrl?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface ProductRepository {
    findAll(): Promise<Product[]>;
    findById(id: string): Promise<Product | null>;
    updateStock(id: string, quantity: number): Promise<Product>;
}
