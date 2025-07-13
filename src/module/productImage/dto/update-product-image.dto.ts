import { CreateProductImageDto } from "./create-product-image.dto";
import { PartialType } from '@nestjs/mapped-types';

export class UpdateProductImageDto extends PartialType(CreateProductImageDto) {}