/**
 * Représente un utilisateur authentifié dans le système.
 *
 * @property sub - Identifiant unique de l'utilisateur (généralement l'ID en base de données).
 * @property email - email de l'utilisateur, utilisé pour l'authentification ou l'identification.
 * @property isActive - Indique si le compte utilisateur est actif.
 * @property iat - Timestamp indiquant la date de création du token (issued at).
 * @property exp - Timestamp indiquant la date d'expiration du token.
 * @property role - Rôle attribué à l'utilisateur (ex: admin, user, etc.).
 */
export interface AuthenticatedUserDto {
    sub: number;
    email: string;
    isActive: boolean;
    iat: number;
    exp: number;
    role: string;
}