import { Injectable, HttpCode, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/module/user/service/user.service';
import { CreateUserDto } from 'src/module/user/dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { AuthDto } from '../dto/auth.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { Response} from 'express';
import { EventEmitter2 } from '@nestjs/event-emitter' 
import { UserRole } from 'src/module/user/entities/user.entity';


// Énumération pour clarifier les types de tokens
enum TokenType {
  BOTH = 'both',
  ACCESS_ONLY = 'access',
  REFRESH_ONLY = 'refresh'
}

// Interface pour les tokens
interface TokenPair {
  accessToken: string;
  refreshToken?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly eventEmitter: EventEmitter2
  ) {}

  // Amélioration de la méthode de hashage
  async hashData(data: string): Promise<string> {
    if (!data || data.trim() === '') {
      throw new BadRequestException('Les données à hasher ne peuvent pas être vides');
    }
    
    const saltOrRounds = 12; // Plus sécurisé que 10
    try {
      return await bcrypt.hash(data, saltOrRounds);
    } catch (error) {
      throw new Error('Erreur lors du hashage des données');
    }
  }

  // Méthode de génération de tokens
  async generateTokens(
    userId: number,
    email: string,
    role: string,
    isActive: boolean,
    type: TokenType = TokenType.BOTH
  ): Promise<TokenPair> {
    const payload = { sub: userId, email, role, isActive };
    
    const tokenPromises: Promise<string>[] = [];
    
    // Génération conditionnelle plus claire
    const shouldGenerateAccess = type === TokenType.BOTH || type === TokenType.ACCESS_ONLY;
    const shouldGenerateRefresh = type === TokenType.BOTH || type === TokenType.REFRESH_ONLY;
    
    if (shouldGenerateAccess) {
      tokenPromises.push(
        this.jwtService.signAsync(payload, {
          secret: process.env.JWT_ACCESS_SECRET,
          expiresIn: process.env.JWT_ACCESS_EXPIRESIN || '15m',
        })
      );
    }
    
    if (shouldGenerateRefresh) {
      tokenPromises.push(
        this.jwtService.signAsync(payload, {
          secret: process.env.JWT_REFRESH_SECRET,
          expiresIn: process.env.JWT_REFRESH_EXPIRESIN || '30d',
        })
      );
    }

    const tokens = await Promise.all(tokenPromises);

    const result: TokenPair = {accessToken: ''};

    if (shouldGenerateAccess) {
      result.accessToken = tokens[0];
    }
    
    if (shouldGenerateRefresh) {
      result.refreshToken = shouldGenerateAccess ? tokens[1] : tokens[0];
    }
    
    return result;
  }

  // Méthode de mise à jour du refresh token e
  async updateRefreshToken(userId: number, refreshToken: string): Promise<void> {
    try {
      const hashedRefreshToken = await this.hashData(refreshToken);
      await this.userService.update(userId, { refreshToken: hashedRefreshToken });
    } catch (error) {
      throw new Error('Erreur lors de la mise à jour du refresh token');
    }
  }

  // Validation d'email
  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  //  Inscription 
  async signUp(createUserDto: CreateUserDto): Promise<any> {
    // Validation des mots de passe
    if (createUserDto.password !== createUserDto.confirmPassword) {
      throw new BadRequestException('Les mots de passe ne correspondent pas');
    }

    // Validation de l'email
    if (!this.validateEmail(createUserDto.email)) {
      throw new BadRequestException('Format d\'email invalide');
    }

    // Vérification de l'existence de l'email
    const userEmailExists = await this.userService.findByEmail(createUserDto.email);
    if (userEmailExists) {
      throw new BadRequestException('Cet email est déjà utilisé');
    }

    try {
      // Hashage du mot de passe
      const hashedPassword = await this.hashData(createUserDto.password);
      
      // Création de l'utilisateur
      console.log("Test entrée création user");
      const newUser = await this.userService.create({
        ...createUserDto,
        password: hashedPassword,
  
      });
      console.log("Le nouvel user", newUser);

      // Génération des tokens
      const tokens = await this.generateTokens(
        newUser.id,
        newUser.email,
        newUser.role,
        newUser.isActive,
        TokenType.BOTH
      );

      if (!tokens.refreshToken) {
        throw new Error('Erreur lors de la génération du refresh token');
      }

      // Sauvegarde du refresh token
      await this.updateRefreshToken(newUser.id, tokens.refreshToken);

      // Émission d'événements
      this.eventEmitter.emit('user.welcome', {
        name: newUser.lastName,
        email: newUser.email,
      });

      this.eventEmitter.emit('user.verify-email', {
        name: newUser.lastName,
        email: newUser.email,
      });

      return {
        message: 'Inscription réussie. Veuillez vérifier votre email',
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: {
          id: newUser.id,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          role: newUser.role,
          phone: newUser.phone,
          isActive: newUser.isActive,
        },
      };
    } catch (error) {
        //throw new BadRequestException('Erreur lors de l\'inscription');
        throw error;
    }
  }

  // Connexion
  async signIn(data: AuthDto, response: Response): Promise<any> {
    // Validation de l'email
    if (!this.validateEmail(data.email)) {
      throw new BadRequestException('Format d\'email invalide');
    }

    // Recherche de l'utilisateur
    const user = await this.userService.findByEmail(data.email);
    if (!user) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    // Vérification du mot de passe
    if (!user.password) {
      throw new UnauthorizedException('Compte invalide');
    }

    const passwordMatches = await bcrypt.compare(data.password, user.password);
    if (!passwordMatches) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    // Optionnel : Vérification du compte actif
    // if (!user.isActive) {
    //   throw new UnauthorizedException('Veuillez activer votre compte via l\'email de confirmation');
    // }

    try {
      // Génération des tokens
      const tokens = await this.generateTokens(
        user.id,
        user.email,
        user.role,
        user.isActive,
        TokenType.BOTH
      );

      if (!tokens.refreshToken) {
        throw new Error('Erreur lors de la génération du refresh token');
      }

      // Mise à jour du refresh token en base
      await this.updateRefreshToken(user.id, tokens.refreshToken);

      // Configuration sécurisée du cookie
      response.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true, // Pas accessible via JavaScript
        secure: process.env.NODE_ENV === 'production', // HTTPS en production
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
        path: '/', // Accessible sur tout le site
      });

      return {
        message: 'Connexion réussie',
        accessToken: tokens.accessToken,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isActive: user.isActive,
        },
      };
    } catch (error) {
      throw new BadRequestException('Erreur lors de la connexion');
    }
  }

  // Méthode de déconnexion 
  async logout(userId: number): Promise<void> {
    try {
      await this.userService.update(userId, { refreshToken: undefined});
    } catch (error) {
      throw new Error('Erreur lors de la déconnexion');
    }
  }

  // Vérification du refresh token e
  async verifyRefreshToken(userId: number, refreshToken: string): Promise<any> {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token manquant');
    }

    const user = await this.userService.findById(userId);
    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Utilisateur ou refresh token invalide');
    }

    const refreshTokenMatches = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!refreshTokenMatches) {
      throw new UnauthorizedException('Refresh token invalide');
    }

    return user;
  }

  // Rafraîchissement des tokens 
  async refreshTokens(userId: number, refreshToken: string): Promise<TokenPair> {
    const user = await this.verifyRefreshToken(userId, refreshToken);

    const tokens = await this.generateTokens(
      user.id,
      user.email,
      user.role,
      user.isActive,
      TokenType.BOTH
    );

    if (!tokens.refreshToken) {
      throw new Error('Erreur lors de la génération du nouveau refresh token');
    }

    await this.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  // Méthode 'me' 
  async me(userId: number, refreshToken: string): Promise<any> {
    const user = await this.verifyRefreshToken(userId, refreshToken);

    const tokens = await this.generateTokens(
      user.id,
      user.email,
      user.role,
      user.isActive,
      TokenType.ACCESS_ONLY
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isActive: user.isActive,
      },
      accessToken: tokens.accessToken,
    };
  }

  // Envoi de lien de réinitialisation 
  async sendLinkResetPassword(data: ResetPasswordDto): Promise<void> {
    if (!this.validateEmail(data.email)) {
      throw new BadRequestException('Format d\'email invalide');
    }

    const user = await this.userService.findByEmail(data.email);
    if (!user) {
      // Ne pas révéler si l'email existe ou non pour des raisons de sécurité
      return; // Ou throw une exception générique
    }

    this.eventEmitter.emit('user.reset-password', {
      name: user.lastName,
      email: user.email,
      link: process.env.RESET_PASSWORD_URL,
    });
  }
}