import { CreateSupportRequestDto } from "./create-support-request.dto";
import { PartialType } from '@nestjs/mapped-types';

export class UpdateSupportRequestDto extends PartialType(CreateSupportRequestDto) {}