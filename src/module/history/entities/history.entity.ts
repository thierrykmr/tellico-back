import { BaseEntity } from 'src/common/base.entity';
import {

Entity,
PrimaryGeneratedColumn,
Column,
ManyToOne,
JoinColumn,
} from 'typeorm';
import { UserEntity } from '../../user/entities/user.entity';
import { CartEntity } from '../../cart/entities/cart.entity';

export enum HistoryStatus {
CONFIRMED = 'confirmed',
PENDING = 'pending',
CANCELLED = 'cancelled',
}

@Entity({ name: 'histories'})
export class HistoryEntity extends BaseEntity {

@Column({name: 'product_id'})
productId: number;

@Column({name: 'user_id'})
userId: number;

@Column('int')
quantity: number;

@Column('decimal', { precision: 10, scale: 2 })
unitPrice: string;

@Column('decimal', { precision: 10, scale: 2 })
total: string;

@Column({
    type: 'enum',
    enum: HistoryStatus,
})
status: HistoryStatus;

@Column({ type: 'boolean', default: false })
confirmedBySeller: boolean;

@ManyToOne(() => UserEntity, (user) => user.histories, { eager: true })
@JoinColumn({ name: 'user_id' })
user: UserEntity;


@ManyToOne(() => CartEntity, (cart) => cart.histories, { eager: true })
@JoinColumn({ name: 'cart_id' })
cart: CartEntity;

}

