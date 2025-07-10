import {
  Entity,
  Column,
  OneToMany,
  JoinColumn,

} from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';
import { ProductEntity } from '../../product/entity/product.entity';
import { CartEntity } from '../../cart/entity/cart.entity';
import { HistoryEntity } from '../../history/entity/history.entity';
import { ComplaintEntity } from 'src/module/complaint/entity/complaint.entity';
import { SupportRequestEntity } from 'src/module/supportRequest/entity/supportRequest.entity';
import { InvoiceEntity } from 'src/module/invoice/entity/invoice.entity';


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

@Column({ nullable: true, name: 'refresh_token', unique: true })
refreshToken: string;

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

//relations
@OneToMany(() => ProductEntity, (product) => product.user)
products: ProductEntity[];

@OneToMany(() => CartEntity, (cart) => cart.user)
carts: CartEntity[];

@OneToMany(() => HistoryEntity, (history) => history.user)
histories: HistoryEntity[];

@OneToMany(() => InvoiceEntity, (invoice) => invoice.user)
invoices: InvoiceEntity[];

@OneToMany(() => ComplaintEntity, (complaint) => complaint.user)
complaints: ComplaintEntity[];

@OneToMany(() => SupportRequestEntity, (supportRequest) => supportRequest.user)
supportRequests: SupportRequestEntity[];


}