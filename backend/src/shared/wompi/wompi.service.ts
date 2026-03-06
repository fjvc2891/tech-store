import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import * as crypto from 'crypto';

@Injectable()
export class WompiService {
    private readonly client: AxiosInstance;
    private readonly logger = new Logger(WompiService.name);
    private readonly publicKey: string;
    private readonly privateKey: string;
    private readonly integrityKey: string;

    constructor(private config: ConfigService) {
        const baseURL = config.get<string>('WOMPI_BASE_URL', 'https://api-sandbox.co.uat.wompi.dev/v1');
        this.publicKey = config.get<string>('WOMPI_PUBLIC_KEY', '');
        this.privateKey = config.get<string>('WOMPI_PRIVATE_KEY', '');
        this.integrityKey = config.get<string>('WOMPI_INTEGRITY_KEY', '');

        this.client = axios.create({
            baseURL,
            headers: {
                Authorization: `Bearer ${this.publicKey}`,
                'Content-Type': 'application/json',
            },
        });
    }

    /**
     * Generate integrity signature for a transaction
     */
    generateSignature(reference: string, amountInCents: number, currency: string): string {
        const concatenated = `${reference}${amountInCents}${currency}${this.integrityKey}`;
        return crypto.createHash('sha256').update(concatenated).digest('hex');
    }

    /**
     * Tokenize a credit card (returns card token)
     */
    async tokenizeCard(cardData: {
        number: string;
        cvc: string;
        exp_month: string;
        exp_year: string;
        card_holder: string;
    }): Promise<{ token: string; brand: string; last_four: string }> {
        const response = await this.client.post('/tokens/cards', cardData);
        const data = response.data.data;
        return {
            token: data.id,
            brand: data.brand,
            last_four: data.last_four,
        };
    }

    /**
     * Create a transaction in Wompi
     */
    async createTransaction(payload: {
        amount_in_cents: number;
        currency: string;
        customer_email: string;
        reference: string;
        payment_method: {
            type: string;
            token: string;
            installments: number;
        };
        signature: { integrity: string };
        customer_data?: {
            phone_number?: string;
            full_name?: string;
        };
        shipping_address?: {
            address_line_1: string;
            country: string;
            region: string;
            city: string;
            name: string;
            phone_number: string;
            postal_code?: string;
        };
    }) {
        const response = await this.client.post('/transactions', payload);
        return response.data.data;
    }

    /**
     * Get transaction status from Wompi
     */
    async getTransaction(wompiTransactionId: string) {
        const response = await this.client.get(`/transactions/${wompiTransactionId}`);
        return response.data.data;
    }
}
