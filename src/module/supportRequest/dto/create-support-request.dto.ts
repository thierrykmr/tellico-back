import { IsNotEmpty, IsString, IsEnum, IsNumber } from 'class-validator';
import { SupportRequestStatus } from '../entities/supportRequest.entity'


export class CreateSupportRequestDto {

    @IsNotEmpty()
    @IsString()
    title: string;

    @IsNotEmpty()
    @IsString()
    message: string;

    @IsEnum( SupportRequestStatus)
    status: SupportRequestStatus;
    
    @IsNumber()
    userId: number;





 
}