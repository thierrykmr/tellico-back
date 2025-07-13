import {IsNotEmpty, IsNumber, IsString, IsEnum, IsBoolean } from "class-validator";
import { HistoryStatus } from "../entities/history.entity";

export class CreateHistoryDto {

    @IsNotEmpty()
    @IsNumber()
    quantity: number;
    
    @IsNotEmpty()
    @IsString()
    unitPrice: string;

    @IsNotEmpty()
    @IsString()
    total: string;
     
    @IsEnum( HistoryStatus)
    status: HistoryStatus;

    @IsNotEmpty()
    @IsBoolean()
    confirmedBySeller: boolean;

    @IsNumber()
    productId: number;

    @IsNumber()
    userId: number;
}