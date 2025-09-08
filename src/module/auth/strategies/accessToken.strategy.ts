import { Injectable, UnauthorizedException  } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, ExtractJwt } from "passport-jwt";
import { UserService } from "src/module/user/service/user.service";



type JwtPayload = {
    sub: number;
    email: string;
    role: string;
    isActive: boolean;
    iat?: number;
    exp?: number;
}


@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_ACCESS_SECRET,
      // Ajout de la validation de l'expiration
      ignoreExpiration: false,
    }as any);
  }

  async validate(payload: JwtPayload) {
    // Validation du payload
    if (!payload.sub || !payload.email) {
      throw new UnauthorizedException('Token invalide');
    }

    //  Vérification de l'utilisateur en base
    const user = await this.userService.findById(payload.sub);
    
    if (!user) {
      throw new UnauthorizedException('Utilisateur inexistant');
    }

    //  Vérification du statut actif
    if (!user.isActive) {
      throw new UnauthorizedException('Compte désactivé. Veuillez confirmer votre email');
    }

    // Vérification de cohérence email
    if (user.email !== payload.email) {
      throw new UnauthorizedException('Token invalide');
    }

    //  Retourner les données utilisateur formatées
    return {
      sub: user.id,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      firstName: user.firstName,
      lastName: user.lastName,
    };
  }



}   