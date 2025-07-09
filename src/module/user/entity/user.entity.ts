import {
  Entity,
  Column,
  BeforeInsert,
} from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';
// import * as bcrypt from 'bcrypt';

export enum UserRole {
ADMIN = 'admin',
SELLER = 'seller',
USER = 'user',
}

@Entity({name: 'users'})
export class UserEntity extends BaseEntity {

@Column({ type: 'varchar', nullable: false })
firstName: string;

@Column({ type: 'varchar', nullable: false })
lastName: string;

@Column({ type: 'varchar', unique: true, nullable: false })
email: string;

@Column({ type: 'varchar', nullable: false })
phone: string;

@Column({ type: 'varchar', nullable: false })
password: string;

@Column({ type: 'enum', enum: UserRole })
role: UserRole;

@Column({ type: 'varchar', nullable: true })
location?: string;

@Column({ type: 'boolean', default: true })
isActive: boolean;


// @BeforeInsert()
// async hashPassword() {
//     this.password = await bcrypt.hash(this.password, 10);
// }

}