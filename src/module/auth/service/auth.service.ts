import { Injectable, HttpCode, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/module/user/service/user.service';
import { CreateUserDto } from 'src/module/user/dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { AuthDto } from '../dto/auth.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { Response} from 'express';
import { EventEmitter2 } from '@nestjs/event-emitter' 




@Injectable()
export class AuthService {

    constructor(
        private jwtService: JwtService,
        private userService: UserService,
        private readonly eventEmitter: EventEmitter2
    ) {}

    async hashData(data: string) {
        if (!data) {
            throw new Error('Data to hash must not be empty');
        }
        const saltOrRounds = 10;
        try {
            return await bcrypt.hash(data, saltOrRounds);
        } catch (error) {
            // Log or handle error as needed
            throw new Error('Hashing failed');
        }
    }

    async updateRefreshToken(userId: number, refreshToken: string) {

        const hashedRefreshToken = await this.hashData(refreshToken);
        await this.userService.update(userId, { refreshToken: hashedRefreshToken });
    }

    async getTokens(
        userId: number,
        email: string,
        role: string,
        key: number,
        isActive: boolean,

    ){

     if (key == 0) {
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(
            {
                sub: userId,
                email,
                role,
                isActive,
            },
            {
                secret: process.env.JWT_ACCESS_SECRET,
                expiresIn: process.env.JWT_ACCESS_EXPIRESIN,
            },
            ),
            this.jwtService.signAsync(
            {
                sub: userId,
                email,
                role,
                isActive,
            },
            {
                secret: process.env.JWT_REFRESH_SECRET,
                expiresIn: process.env.JWT_REFRESH_EXPIRESIN,
            },
            ),
        ]);
        return { accessToken, refreshToken };

     } else if (key == 1) {
      const [accessToken] = await Promise.all([
        this.jwtService.signAsync(
          {
            sub: userId,
            email,
            role,
            isActive,
          },
          {
            secret: process.env.JWT_ACCESS_SECRET,
            expiresIn: process.env.JWT_ACCESS_EXPIRESIN,
          },
        ),
      ]);

      return { accessToken };
      } else {
        const [refreshToken] = await Promise.all([
            this.jwtService.signAsync(
            {
                sub: userId,
                email,
                role,
                isActive,
            },
            {
                secret: process.env.JWT_REFRESH_SECRET,
                expiresIn: process.env.JWT_REFRESH_EXPIRESIN,
            },
            ),
        ]);

      return { refreshToken };
      }

    }


    @HttpCode(201)
    async signUp(createUserDto: CreateUserDto): Promise<any> {
        //Check if confirmPassword match
        if (createUserDto.password !== createUserDto.confirmPassword) {
        throw new UnauthorizedException('Les mots de passe ne correspondent pas');
        }

        //Check if username exists
        // const userExists = await this.userService.findByUsername(
        // createUserDto.username,
        // );

        // if (userExists) {
        // throw new UnauthorizedException('Username existe déjà');
        // }

        //Check if userEmail exists
         const userEmailExists = await this.userService.findByEmail(
         createUserDto.email,
         );

        if (userEmailExists) {
        throw new UnauthorizedException('Cet email existe déjà');
        }

        //Hash password
        const hash = await this.hashData(createUserDto.password);
        const newUser = await this.userService.create({
        ...createUserDto,
        password: hash,
        });

        // token of user
        const tokens = await this.getTokens(
        newUser.id,
        newUser.email,
        newUser.role,
        0,
        newUser.isActive,
        );
        if (!tokens.refreshToken) {
            throw new Error('Refresh token is undefined');
        }
        await this.updateRefreshToken(newUser.id, tokens.refreshToken);

        //Send email to welcome
        this.eventEmitter.emit('user.welcome', {
        name: newUser.lastName,
        email: newUser.email,
        });

        //Send email to active account
        this.eventEmitter.emit('user.verify-email', {
        name: newUser.lastName,
        email: newUser.email,
        });

        return { message: 'Register succed' };
    }



    @HttpCode(201)
    async signIn(data: AuthDto, response: Response) {
        //Check if username is email
        const isEmail = await this.validateEmail(data.email);

        //Check if user exists
        const user = await this.userService.findByEmail(data.email);
        

        if (!user)
        throw new UnauthorizedException(
            'Les données envoyées ne correspondent pas.',
        );

        // if(!user.isActive) throw new UnauthorizedException('Veuillez activer votre compte.')

        if (!user.password)
        throw new UnauthorizedException('Mot de passe incorrect.');

        const passwordMatches = await bcrypt.compare(data.password, user.password);
        if (!passwordMatches)
        throw new UnauthorizedException('Mot de passe incorrect');

        const tokens = await this.getTokens(
        user.id,
        user.email,
        user.role,
        2,
        user.isActive,
        );

        if (!tokens.refreshToken) {
            throw new Error('Refresh token is undefined');
        }
        await this.updateRefreshToken(user.id, tokens.refreshToken);

        response.cookie('refreshToken', tokens.refreshToken, {
        sameSite: 'lax',
        maxAge: 3600 * 24 * 1000, // 1 day
        });
    }

    async validateEmail(email) {
        var re = /\S+@\S+\.\S+/;
        return re.test(email);
    }

    @HttpCode(201)
    async sendLinkResetPassword(data: ResetPasswordDto) {
        //Check if user exists
        const user = await this.userService.findByEmail(data.email);

        if (!user)
        throw new UnauthorizedException(
            'Les données envoyées ne correspondent pas.',
        );

        //Send email welcome and active account
        this.eventEmitter.emit('user.reset-password', {
        name: user.lastName,
        email: user.email,
        link: process.env.RESET_PASSWORD_URL,
        });
    }

    async logout(userId: number) {
        return this.userService.update(userId, { refreshToken: undefined });
    }

    async checkRefreshTokenWatch(userId: number, refreshToken: string) {
        if (!refreshToken) throw new UnauthorizedException('Access Denied');

        const user = await this.userService.findById(userId);

        if (!user || !user.refreshToken)
        throw new UnauthorizedException('Access Denied');

        const refreshTokenMatches = await bcrypt.compare(
        refreshToken,
        user.refreshToken,
        );

        if (!refreshTokenMatches) throw new UnauthorizedException('Access Denied');

        return { user: user };
    }

    async refreshTokens(userId: number, refreshToken: string) {
        const resultCheck = await this.checkRefreshTokenWatch(userId, refreshToken);

        const tokens = await this.getTokens(
        resultCheck.user.id,
        resultCheck.user.email,
        resultCheck.user.role,
        0,
        resultCheck.user.isActive,
        );
        if (!tokens.refreshToken) {
            throw new Error('Refresh token is undefined');
        }
        await this.updateRefreshToken(resultCheck.user.id, tokens.refreshToken);

        return tokens;
    }

    async me(userId: number, refreshToken: string) {
        const resultCheck = await this.checkRefreshTokenWatch(userId, refreshToken);
        const tokens = await this.getTokens(
        resultCheck.user.id,
        resultCheck.user.email,
        resultCheck.user.role,
        1,
        resultCheck.user.isActive,
        );

        return {
        user: {
            id: resultCheck.user.id,
            email: resultCheck.user.email,
            role: resultCheck.user.role,
        },
        accessToken: tokens.accessToken,
        };
    }


}  
