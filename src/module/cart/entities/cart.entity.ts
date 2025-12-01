import { BaseEntity } from 'src/common/base.entity';
import {

Entity,
Column,
ManyToOne,
JoinColumn,
OneToMany,
OneToOne,
} from 'typeorm';
import { UserEntity } from '../../user/entities/user.entity';
import { CartItemEntity } from 'src/module/cart_item/entities/cart_item.entity';
import { InvoiceEntity } from 'src/module/invoice/entities/invoice.entity';
import { HistoryEntity } from 'src/module/history/entities/history.entity';

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

// Date de commande (quand le statut passe à ORDERED)
@Column({ type: 'timestamp', nullable: true })
orderedAt?: Date;

 @ManyToOne(() => UserEntity, (user) => user.carts)
 @JoinColumn({ name: 'user_id' })
 user: UserEntity;

 @OneToMany(() => CartItemEntity, (item) => item.cart, { cascade: true })
 items: CartItemEntity[];

 @OneToMany(() => HistoryEntity, (history) => history.cart)
 histories: HistoryEntity[];

// Relation avec la facture (une facture par panier commandé)
  @OneToOne(() => InvoiceEntity, (invoice) => invoice.cart, { nullable: true })
  invoice?: InvoiceEntity;

}