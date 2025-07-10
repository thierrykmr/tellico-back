import { BaseEntity } from 'src/common/base.entity';
import {

Entity,
Column,
ManyToOne,
JoinColumn,
OneToMany,
} from 'typeorm';
import { UserEntity } from '../../user/entity/user.entity';
import { CartItemEntity } from 'src/module/cart_item/entity/cart_item.entity';

export enum CartStatus {
OPEN = 'open',
ORDERED = 'ordered',
CANCELLED = 'cancelled',
};

@Entity({name:'carts'})
export class CartEntity extends BaseEntity {


@Column({ name: 'user_id' })
userId: number;


@Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
totalPrice: string;

@Column({ type: 'enum', enum: CartStatus, default: CartStatus.OPEN })
status: CartStatus;

 @ManyToOne(() => UserEntity, (user) => user.carts)
 @JoinColumn({ name: 'user_id' })
 user: UserEntity;

 @OneToMany(() => CartItemEntity, (item) => item.cart, { cascade: true })
  items: CartItemEntity[];



// If you want to automatically calculate totalPrice, you can add hooks here
// @BeforeInsert()
// @BeforeUpdate()
// async calculateTotalPrice() {
//   // Implement calculation logic here
// }
}