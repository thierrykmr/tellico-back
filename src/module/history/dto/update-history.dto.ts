import { CreateHistoryDto } from "./create-history.dto";
import { PartialType } from '@nestjs/mapped-types';

export class UpdateHistoryDto extends PartialType(CreateHistoryDto) {}