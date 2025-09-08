import { IsNotEmpty, IsEmail } from "class-validator";

export class AuthDto {
    @IsNotEmpty({ message: 'L\'email est requis' })
    @IsEmail({}, { message: 'Format d\'email invalide' })
    //@Transform(({ value }) => value?.toLowerCase().trim()) //  Normalisation de l'email
    email: string;

    @IsNotEmpty({ message: 'Le mot de passe est requis' })
    // @MinLength(6, { message: 'Le mot de passe doit contenir au moins 6 caractères' })
    //@MaxLength(128, { message: 'Le mot de passe ne peut pas dépasser 128 caractères' })
    password: string;
}
