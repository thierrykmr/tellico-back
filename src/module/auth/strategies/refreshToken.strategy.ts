import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-jwt";
import { Request } from "express";

const cookieExtractor = (req: any) => {
  let jwt = null;

  if (req && req.cookies) {
    jwt = req.cookies['refreshToken'];
  }

  return jwt;
};

type JwtPayload = {
  sub: number;
  email: string;
  iat?: number;
  exp?: number;
  role?: string;
  isActive: boolean;
};

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor() {
    super({
      jwtFromRequest: cookieExtractor,
      secretOrKey: process.env.JWT_REFRESH_SECRET,
      passReqToCallback: true,
    } as any);
  }

  validate(req: Request, payload: JwtPayload) {
    // Récupérer le refresh token depuis les cookies
    const refreshToken = req.cookies?.['refreshToken'];
    
    // Retourner les données utiles
    return { 
      sub: payload.sub,
      email: payload.email,
      refreshToken 
    };
  }
}




/*
import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-jwt";
import { Request } from "express";

const cookieExtractor = (req) => {
  let jwt = null;

  if (req && req.cookies) {
    jwt = req.cookies['refreshToken'];
  }

  return jwt;
};

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor() {
    super({
      jwtFromRequest: cookieExtractor,
      secretOrKey: process.env.JWT_REFRESH_SECRET,
      passReqToCallBack: true,
    });
  }

  validate(req: Request) {
    return { sub: req['sub'], email: req['email'] };
  }
}*/