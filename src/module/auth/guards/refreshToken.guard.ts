import { Injectable, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Observable } from "rxjs";

@Injectable()
export class RefreshTokenGuard extends AuthGuard("jwt-refresh") {

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    //  Gestion d'erreurs spécifique au refresh token
    if (err || !user) {
      if (info?.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Refresh token expiré. Veuillez vous reconnecter');
      }
      if (info?.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Refresh token invalide');
      }
      if (info?.message === 'No auth token') {
        throw new UnauthorizedException('Refresh token manquant');
      }
      throw new UnauthorizedException('Refresh token invalide');
    }
    return user;
  }

}
