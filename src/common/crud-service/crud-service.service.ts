import { Injectable } from '@nestjs/common';
import { AuthenticatedUserDto } from 'src/module/user/dto/authenticated-user.dto';
import { ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common/exceptions';


@Injectable()
export class CrudService {
    constructor (private repository: any) { }

    async create (createDto: any) : Promise <any> {
        return this.repository.save(createDto);
    }

    async findAll(user: AuthenticatedUserDto, relations: string[] = []): Promise<any[]> {
        if (!user.sub)
        throw new ForbiddenException(
            "Vous n'êtes pas authentifié, vous ne pouvez pas accéder à cette ressource.",
        );
        const entries= await this.repository.find({
        where: {
            userId: user.sub,
        },
        order: {
            id: 'DESC',
        },
        relations,
        });
        return entries;
   }

   async findById(user: AuthenticatedUserDto, id: number, relations: string[] = [])
        
   {
        if (!user.sub) {
        throw new BadRequestException("Veuillez vous authentifier pour accéder à cette ressource.");
        }
        const entry = await this.repository.findOne({
        where: { id: id},
        relations,
        });

        if (!entry) throw new NotFoundException();

        return entry;
   }
   
   async update(user: AuthenticatedUserDto, id: number, updateDto: any) {
    await this.findById(user, id);
    return this.repository.update(id, updateDto);
   }

   async delete(user: AuthenticatedUserDto, id: number) {
    const entry = await this.findById(user, id);
    return this.repository.remove(entry);
   }
}