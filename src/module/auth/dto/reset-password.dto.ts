import { IsEmail, IsNotEmpty } from "class-validator";

export class ResetPasswordDto {
    @IsNotEmpty({ message: 'L\'email est requis' })
    @IsEmail({}, { message: 'Format d\'email invalide' })
    // @Transform(({ value }) => value?.toLowerCase().trim())
    email: string;
}
