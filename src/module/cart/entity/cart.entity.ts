import { BaseEntity } from 'src/common/base.entity';
import {

Entity,
PrimaryGeneratedColumn,
Column,
ManyToOne,
JoinColumn,
CreateDateColumn,
UpdateDateColumn,
BeforeInsert,
BeforeUpdate,
} from 'typeorm';

export enum CartStatus {
OPEN = 'open',
ORDERED = 'ordered',
CANCELLED = 'cancelled',
}

@Entity({name:'cart'})
export class Cart extends BaseEntity {


@Column({ name: 'user_id' })
userId: string;

// Example: You may want to add a relation to the User entity
// @ManyToOne(() => User, user => user.carts)
// @JoinColumn({ name: 'userId' })
// user: User;

@Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
totalPrice: string;

@Column({ type: 'enum', enum: CartStatus, default: CartStatus.OPEN })
status: CartStatus;



// If you want to automatically calculate totalPrice, you can add hooks here
// @BeforeInsert()
// @BeforeUpdate()
// async calculateTotalPrice() {
//   // Implement calculation logic here
// }
}