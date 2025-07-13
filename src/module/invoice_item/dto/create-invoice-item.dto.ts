import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateInvoiceItemDto {

    @IsNotEmpty()
    @IsNumber()
    quantity: number;

    @IsNotEmpty()
    @IsString()
    UnitPrice: string;

    @IsNumber()
    productId: number;

    @IsNumber()
    invoiceId: number;
}