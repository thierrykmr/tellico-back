import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-jwt";
import { Request } from "express";

// Extracteur de cookie sécurisé et typé
const cookieExtractor = (req: Request): string | null => {
  if (req?.cookies?.refreshToken) {
    return req.cookies.refreshToken;
  }
  return null;
};

type RefreshTokenPayload = {
  sub: number;
  email: string;
  iat?: number;
  exp?: number;
  role: string;
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
      ignoreExpiration: false, // Vérification de l'expiration
    } as any);
  }

  async validate(req: Request, payload: RefreshTokenPayload) {
    // Validation du payload
    if (!payload.sub || !payload.email) {
      throw new UnauthorizedException('Refresh token invalide');
    }

    // Récupération sécurisée du refresh token
    const refreshToken = req.cookies?.refreshToken;
    
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token manquant');
    }

    // Retourner toutes les données nécessaires
    return {
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
      isActive: payload.isActive,
      refreshToken, // Nécessaire pour la vérification en base
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