import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { UserEntity } from '../../user/entities/user.entity';
import { BaseEntity } from 'src/common/base.entity';
import { ProductEntity } from '../../product/entities/product.entity';
import { SupportRequestEntity } from 'src/module/supportRequest/entities/supportRequest.entity';
import { InvoiceEntity } from 'src/module/invoice/entities/invoice.entity';

export enum ComplaintStatus {
    OPEN = 'open',
    CLOSED = 'closed',
    PENDING = 'pending',
}

@Entity({name :'complaints'})
export class ComplaintEntity extends BaseEntity {


    @Column({name: 'userId'})
    userId: number;


    @Column({ name: 'productId', nullable: true })
    productId?: number;

    @Column('text')
    content: string;

    @Column({ name: 'invoiceId', nullable: true })
    invoiceId?: number;

    @Column({ name: 'supportRequestId', nullable: true })
    supportRequestId?: number;

    @Column({
        type: 'enum',
        enum: ComplaintStatus,
        default: ComplaintStatus.PENDING,
    })
    status: ComplaintStatus;

    @ManyToOne(() => ProductEntity, (product) => product.complaints, { nullable: true })
    @JoinColumn({ name: 'productId' })
    product?: ProductEntity;


    @OneToOne(() => InvoiceEntity, (invoice) => invoice.complaint, { nullable: true})
    @JoinColumn({ name: 'invoiceId' })
    invoice?: InvoiceEntity;

    @ManyToOne(() => UserEntity, user => user.complaints)
    @JoinColumn({ name: 'userId' })
    user: UserEntity;

    @OneToOne(() => SupportRequestEntity, (supportRequest) => supportRequest.complaint, { nullable: true })
    @JoinColumn({ name: 'supportRequestId' })
    supportRequest?: SupportRequestEntity;

}