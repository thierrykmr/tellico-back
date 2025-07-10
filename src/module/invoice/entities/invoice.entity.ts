import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, OneToOne } from 'typeorm';
import { UserEntity } from '../../user/entities/user.entity';
import { InvoiceItemEntity } from 'src/module/invoice_item/entities/invoice_item.entity';
import { BaseEntity } from 'src/common/base.entity';
import { ComplaintEntity } from 'src/module/complaint/entities/complaint.entity';
export enum InvoiceStatus {
    PAID = 'paid',
    FAILED = 'failed',
    PENDING = 'pending',
}

@Entity({ name: 'invoices' })
export class InvoiceEntity extends BaseEntity {

  @Column('decimal')
  totalPrice: number;

  @Column()
  paymentMethod: string; // "whatsapp", "mobile_money", "cash", "OM", "Bank Card",

  @Column({
          type: 'enum',
          enum: InvoiceStatus,
          default: InvoiceStatus.PENDING,
      })
  status: InvoiceStatus;

  @ManyToOne(() => UserEntity, (user) => user.invoices)
  user: UserEntity;

  @OneToMany(() => InvoiceItemEntity, (item) => item.invoice, { cascade: true })
  items: InvoiceItemEntity[];

  @OneToOne(() => ComplaintEntity, (complaint) => complaint.invoice, { nullable: true})
  complaint?: ComplaintEntity;

}