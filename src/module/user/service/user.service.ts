import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { UserEntity } from '../entities/user.entity';
import { Console } from 'console';



@Injectable()
export class UserService {
    constructor(
        @InjectRepository(UserEntity)
        private userRepository: Repository<UserEntity>,
    ) {}

    async create(createUserDto: CreateUserDto): Promise<UserEntity> {
        const user = this.userRepository.save(createUserDto);
        return user;
    }

    async findAll(): Promise<UserEntity[]> {
        return this.userRepository.find();
    }

    async findById(id: number, relations: string[] = []): Promise<UserEntity> {
        const user = await this.userRepository.findOne({ where: { id }, relations });
        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
        return user;
    }

    async findByEmail(email: string): Promise<UserEntity | null> {
        const user = await this.userRepository.findOne({ where: { email } });
        return user;
    }

    async update(id: number, updateUserDto: UpdateUserDto): Promise<UserEntity> {
        const user = await this.findById(id);
        const updatedUser = Object.assign(user, updateUserDto);
        return await this.userRepository.save(updatedUser);
    }

    async resetPassword(email: string) {
        return this.userRepository.update({ email }, { password: undefined });
    }

    async remove(id: number): Promise<UserEntity> {
        const existingUser = await this.findById(id);
        return await this.userRepository.remove(existingUser);
    }

}
