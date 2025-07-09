import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { UserEntity } from '../../user/entity/user.entity';
import { BaseEntity } from 'src/common/base.entity';

export enum ComplaintStatus {
    OPEN = 'open',
    CLOSED = 'closed',
    PENDING = 'pending',
}

@Entity({name :'complaints'})
export class Complaint extends BaseEntity {


    @Column({name: 'userId'})
    userId: string;

    // @ManyToOne(() => User, user => user.complaints, { onDelete: 'CASCADE' })
    // @JoinColumn({ name: 'userId' })
    // user: User;

    @Column('text')
    content: string;

    @Column({
        type: 'enum',
        enum: ComplaintStatus,
        default: ComplaintStatus.PENDING,
    })
    status: ComplaintStatus;
}