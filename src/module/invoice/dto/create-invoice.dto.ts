import { IsNotEmpty, IsNumber, IsString, IsEnum } from 'class-validator';
import { InvoiceStatus } from '../entities/invoice.entity';

export class CreateInvoiceDto {

    @IsNotEmpty()
    @IsString()
    totalPrice: string;
    
    @IsString()
    paymentMethod: string;

    @IsEnum(InvoiceStatus)
    status: InvoiceStatus;

    @IsNumber()
    userId: number;
}