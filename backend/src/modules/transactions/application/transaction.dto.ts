import { IsNotEmpty, IsString, IsNumber, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTransactionDto {
    @ApiProperty({ example: 'uuid-product-id' })
    @IsUUID()
    productId: string;

    @ApiProperty({ example: 'uuid-customer-id' })
    @IsUUID()
    customerId: string;

    @ApiProperty({ example: 'juan@example.com' })
    @IsString()
    @IsNotEmpty()
    customerEmail: string;

    @ApiProperty({ example: '4111111111111111' })
    @IsString()
    @IsNotEmpty()
    cardNumber: string;

    @ApiProperty({ example: '123' })
    @IsString()
    @IsNotEmpty()
    cardCvc: string;

    @ApiProperty({ example: '12' })
    @IsString()
    expMonth: string;

    @ApiProperty({ example: '27' })
    @IsString()
    expYear: string;

    @ApiProperty({ example: 'Juan Pérez' })
    @IsString()
    @IsNotEmpty()
    cardHolder: string;

    @ApiProperty({ example: 1 })
    @IsNumber()
    quantity: number;
}

export class UpdateTransactionDto {
    @ApiProperty({ example: 'APPROVED' })
    @IsString()
    @IsNotEmpty()
    status: string;

    @ApiProperty({ example: 'wompi-tx-id' })
    @IsString()
    @IsNotEmpty()
    wompiTransactionId: string;
}
