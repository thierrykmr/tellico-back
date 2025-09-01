import { UserService } from '../../service/user.service';
import { CreateUserDto } from '../../dto/create-user.dto';
import { UpdateUserDto } from '../../dto/update-user.dto';
import { Body, Post, Controller, Delete, Get, Param, Patch, UseGuards } from '@nestjs/common/decorators';
import { AccessTokenGuard } from '../../../auth/guards/accessToken.guard';

@Controller()
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Post()
    async create(@Body() createUserDto: CreateUserDto) {
        return this.userService.create(createUserDto);
    }

    @UseGuards(AccessTokenGuard)
    @Get('users')
    async findAll() {
        return this.userService.findAll();
    }

    @Get(':id')
    async findById(@Param('id') id: number) {
        return this.userService.findById(id);
    }

    @UseGuards(AccessTokenGuard)
    @Patch(':id')
    async update(@Param('id') id: number, @Body() updateUserDto: UpdateUserDto) {
        return this.userService.update(id, updateUserDto);
    }

    @UseGuards(AccessTokenGuard)
    @Delete(':id')
    async remove(@Param('id') id: number) {
        return this.userService.remove(id);
    }
}
