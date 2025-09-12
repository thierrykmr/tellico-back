import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateProductImageDto {
    
    @IsNotEmpty()
    @IsString()
    url: string;

    @IsBoolean()
    @IsOptional()
    isMain: boolean;

    @IsString()
    @IsOptional()
    altText?: string;

}