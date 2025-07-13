import { IsEnum, IsNotEmpty, IsNumber, IsString, IsOptional } from "class-validator";
import { ComplaintStatus } from "../entities/complaint.entity";

export class CreateComplaintDto {
    
    @IsNumber()
    userId: number;

    @IsNumber()
    @IsOptional()
    productId?: number;

    @IsNotEmpty()
    @IsString()
    content: string;
 
    @IsNumber()
    @IsOptional()
    invoiceId?: number;

    @IsNumber()
    @IsOptional()
    supportRequestId?: number;
 
    @IsEnum(ComplaintStatus)
    status:  ComplaintStatus;
}