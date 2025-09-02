import { Injectable, UnauthorizedException  } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, ExtractJwt } from "passport-jwt";
import { UserService } from "src/module/user/service/user.service";



type Payload = {
    sub: number;
    email: string;
    role?: string;
    isActive: boolean;
}


@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_ACCESS_SECRET,
    }as any);
  }

  async validate(payload: Payload) {
    if (!payload.isActive) {
        throw new UnauthorizedException();
    }

    const user = await this.userService.findById(payload.sub);
    if (!user || !user.isActive) {
        throw new UnauthorizedException("Confirmez d'abord votre email ou Compte désactivé|inexistant");
    } 

     
    return user;
    }



}   