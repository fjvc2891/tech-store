import { IsNotEmpty, IsString, IsUUID, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDeliveryDto {
    @ApiProperty({ example: 'uuid-transaction-id' })
    @IsUUID()
    transactionId: string;

    @ApiProperty({ example: 'Calle 123 #45-67' })
    @IsString()
    @IsNotEmpty()
    address: string;

    @ApiProperty({ example: 'Bogotá' })
    @IsString()
    @IsNotEmpty()
    city: string;

    @ApiProperty({ example: 'Cundinamarca' })
    @IsString()
    @IsNotEmpty()
    department: string;

    @ApiProperty({ example: '110111', required: false })
    @IsOptional()
    @IsString()
    postalCode?: string;
}
