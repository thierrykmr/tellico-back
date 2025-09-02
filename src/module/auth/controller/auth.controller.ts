import { Body, Controller, Get, Post, Render, Req, Res, UseGuards } from '@nestjs/common';
import { AuthDto } from '../dto/auth.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { AuthService } from '../service/auth.service';
import { CreateUserDto } from 'src/module/user/dto/create-user.dto';
import { Request } from 'express';
import { AccessTokenGuard } from '../guards/accessToken.guard';
import { RefreshTokenGuard } from '../guards/refreshToken.guard';

@Controller()
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('signup')
    async signup(@Body() createUserDto: CreateUserDto) {
        return this.authService.signUp(createUserDto);
    }

    @Post('signin')
    async signin(@Body() authDto: AuthDto, @Res({ passthrough: true }) response: any) {
        return this.authService.signIn(authDto, response);
    }

    @Post('send-link-reset-password')
    async sendLinkResetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
        return this.authService.sendLinkResetPassword(resetPasswordDto);
    }

    @UseGuards(AccessTokenGuard)
    @Get('logout')
    async logout(@Req() req: Request) {
        console.log('logout ', req);
        if (req.user && typeof req.user['sub'] !== 'undefined') {
            this.authService.logout(req.user['sub']);
        } else {
            throw new Error('User information is missing in request.');
        }
    }

    @UseGuards(RefreshTokenGuard)
    @Get('refresh')
    refreshTokens(@Req() req: Request) {
        // const refreshToken = '';
        if (req.user && typeof req.user['sub'] !== 'undefined') {
            return this.authService.refreshTokens(req.user['sub'], req.cookies['refreshToken']);
        } else {
            throw new Error('User information is missing in request.');
        }
    }

    @UseGuards(RefreshTokenGuard)
    @Get('me')
    me(@Req() req: Request) {
        if (req.user && typeof req.user['sub'] !== 'undefined') {
            return this.authService.me(req.user['sub'], req.cookies['refreshToken']);
        } else {
            throw new Error('User information is missing in request.');
        }
    }

}
