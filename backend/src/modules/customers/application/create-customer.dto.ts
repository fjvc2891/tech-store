import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCustomerDto {
    @ApiProperty({ example: 'Juan Pérez' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(150)
    name: string;

    @ApiProperty({ example: 'juan@example.com' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: '+573001234567', required: false })
    @IsOptional()
    @IsString()
    phone?: string;
}
