import {
  Entity,
  Column,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { UserEntity } from '../../user/entities/user.entity';
import { BaseEntity } from 'src/common/base.entity';
import { ComplaintEntity } from 'src/module/complaint/entities/complaint.entity';

export enum SupportRequestStatus {
    RESOLVED = 'resolved',
    IN_PROGRESS = 'in_progress',
    PENDING = 'pending',
}

@Entity({ name: 'support_requests' })
export class SupportRequestEntity extends BaseEntity {

  @Column()
  title: string;

  @Column('text')
  message: string;

  @Column({
            type: 'enum',
            enum: SupportRequestStatus,
            default: SupportRequestStatus.PENDING,
        })
    status: SupportRequestStatus;

  @ManyToOne(() => UserEntity, (user) => user.supportRequests)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @OneToOne(() => ComplaintEntity, { nullable: true })
  complaint?: ComplaintEntity;
}
