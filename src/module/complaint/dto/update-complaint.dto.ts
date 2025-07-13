import { CreateComplaintDto } from "./create-complaint.dto";
import { PartialType } from '@nestjs/mapped-types';

export class UpdateComplaintDto extends PartialType(CreateComplaintDto) {}