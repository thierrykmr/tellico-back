import { BaseEntity } from 'src/common/base.entity';
import {

Entity,
PrimaryGeneratedColumn,
Column,
ManyToOne,
JoinColumn,
} from 'typeorm';

export enum HistoryStatus {
CONFIRMED = 'confirmed',
PENDING = 'pending',
CANCELLED = 'cancelled',
}

@Entity({ name: 'history'})
export class History extends BaseEntity {

@Column({name: 'product_id'})
productId: string;

@Column({name: 'user_id'})
userId: string;

@Column({ name: 'seller_id' })
sellerId: string;

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
}