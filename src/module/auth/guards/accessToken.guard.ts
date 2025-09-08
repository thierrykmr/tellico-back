import { Injectable, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Observable } from "rxjs";

@Injectable()
export class AccessTokenGuard extends AuthGuard("jwt") {

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    // Gestion d'erreurs personnalisée
    if (err || !user) {
      if (info?.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token expiré');
      }
      if (info?.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Token invalide');
      }
      if (info?.name === 'NotBeforeError') {
        throw new UnauthorizedException('Token pas encore valide');
      }
      throw new UnauthorizedException('Accès non autorisé');
    }
    return user;
  }
}