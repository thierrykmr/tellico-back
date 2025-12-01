import { IsNotEmpty, IsNumber, IsString, IsEnum, IsOptional } from 'class-validator';
import { InvoiceStatus } from '../entities/invoice.entity';

export class CreateInvoiceDto {

    @IsNotEmpty()
    @IsString()
    totalPrice: string;

    @IsNumber()
    @IsOptional()
    totalItems: number;

    @IsNumber()
    @IsOptional()
    uniqueProducts: number;

    @IsString()
    @IsOptional()
    paymentReference?: string;
    
    @IsString()
    paymentMethod: string;

    @IsString()
    @IsOptional()
    notes?: string;

    @IsEnum(InvoiceStatus)
    status: InvoiceStatus;

    @IsNumber()
    userId: number;
}