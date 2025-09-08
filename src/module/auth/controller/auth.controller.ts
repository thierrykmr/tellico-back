import { 
  Body, 
  Controller, 
  Get, 
  Post, 
  Req, 
  Res, 
  UseGuards,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  ValidationPipe,
  UsePipes
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthDto } from '../dto/auth.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { AuthService } from '../service/auth.service';
import { CreateUserDto } from 'src/module/user/dto/create-user.dto';
import { AccessTokenGuard } from '../guards/accessToken.guard';
import { RefreshTokenGuard } from '../guards/refreshToken.guard';

// Interface pour typer les requêtes authentifiées
interface AuthenticatedRequest extends Request {
  user: {
    sub: number;
    email: string;
    role: string;
    isActive: boolean;
    firstName?: string;
    lastName?: string;
    refreshToken?: string; // Pour les requêtes avec refresh token
  };
}

@Controller()
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signup(@Body() createUserDto: CreateUserDto) {
    return this.authService.signUp(createUserDto);
  }

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  async signin(
    @Body() authDto: AuthDto, 
    @Res({ passthrough: true }) response: Response
  ) {
    return this.authService.signIn(authDto, response);
  }

  @Post('send-link-reset-password')
  @HttpCode(HttpStatus.OK)
  async sendLinkResetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    await this.authService.sendLinkResetPassword(resetPasswordDto);
    return { 
      message: 'Si cet email existe, un lien de réinitialisation a été envoyé' 
    };
  }

  @UseGuards(AccessTokenGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() req: AuthenticatedRequest,
    @Res({ passthrough: true }) response: Response
  ) {
    try {
      await this.authService.logout(req.user.sub);
      
      //  Nettoyer le cookie de refresh token
      response.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      });
      
      return { message: 'Déconnexion réussie' };
    } catch (error) {
      throw new UnauthorizedException('Erreur lors de la déconnexion');
    }
  }

  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshTokens(
    @Req() req: AuthenticatedRequest,
    @Res({ passthrough: true }) response: Response
  ) {
    try {
      const refreshToken = req.user.refreshToken || req.cookies?.refreshToken;
      
      if (!refreshToken) {
        throw new UnauthorizedException('Refresh token manquant');
      }

      const tokens = await this.authService.refreshTokens(req.user.sub, refreshToken);
      
      //  Mettre à jour le cookie avec le nouveau refresh token
      if (tokens.refreshToken) {
        response.cookie('refreshToken', tokens.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
          path: '/',
        });
      }

      return {
        message: 'Tokens rafraîchis avec succès',
        accessToken: tokens.accessToken,
      };
    } catch (error) {
      throw new UnauthorizedException('Impossible de rafraîchir les tokens');
    }
  }

  @UseGuards(RefreshTokenGuard)
  @Get('me')
  @HttpCode(HttpStatus.OK)
  async me(@Req() req: AuthenticatedRequest) {
    try {
      const refreshToken = req.user.refreshToken || req.cookies?.refreshToken;
      
      if (!refreshToken) {
        throw new UnauthorizedException('Refresh token manquant');
      }

      const result = await this.authService.me(req.user.sub, refreshToken);
      return {
        message: 'Informations utilisateur récupérées',
        ...result,
      };
    } catch (error) {
      throw new UnauthorizedException('Impossible de récupérer les informations utilisateur');
    }
  }

  // Route bonus pour vérifier la validité de l'access token
  @UseGuards(AccessTokenGuard)
  @Get('verify')
  @HttpCode(HttpStatus.OK)
  async verifyToken(@Req() req: AuthenticatedRequest) {
    return {
      message: 'Token valide',
      valid: true,
      user: {
        id: req.user.sub,
        email: req.user.email,
        role: req.user.role,
        isActive: req.user.isActive,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
      }
    };
  }

  // Route de santé publique (pas de guard)
  @Get('health')
  @HttpCode(HttpStatus.OK)
  async health() {
    return { 
      status: 'ok', 
      service: 'auth',
      timestamp: new Date().toISOString(),
    };
  }
}