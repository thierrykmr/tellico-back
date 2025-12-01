import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { UserEntity } from '../../user/entities/user.entity';
import { BaseEntity } from 'src/common/base.entity';
import { ComplaintEntity } from 'src/module/complaint/entities/complaint.entity';
import { CartEntity } from 'src/module/cart/entities/cart.entity';

export enum InvoiceStatus {
    PAID = 'paid',
    FAILED = 'failed',
    PENDING = 'pending',
}

@Entity({ name: 'invoices' })
export class InvoiceEntity extends BaseEntity {

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalPrice: string;

  @Column()
  paymentMethod: string; // "whatsapp", "mobile_money", "cash", "OM", "Bank Card",

  @Column({
          type: 'enum',
          enum: InvoiceStatus,
          default: InvoiceStatus.PENDING,
      })
  status: InvoiceStatus;

  @Column({ name: 'cart_id', unique: true })
  cartId: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ type: 'int', nullable: true })
  totalItems: number; // Nombre total d'articles

  @Column({ type: 'int', nullable: true })
  uniqueProducts: number; // Nombre de produits différents

  // Date de paiement (quand le statut passe à PAID)
  @Column({ type: 'timestamp', nullable: true })
  paidAt?: Date;

  // Informations supplémentaires pour la facture
  @Column({ type: 'varchar', nullable: true })
  paymentReference?: string; // Référence du paiement

  @Column()
  notes?: string; 

  @ManyToOne(() => UserEntity, (user) => user.invoices)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @OneToOne(() => CartEntity, (cart) => cart.invoice)
  @JoinColumn({ name: 'cart_id' })
  cart: CartEntity;

  @OneToOne(() => ComplaintEntity, (complaint) => complaint.invoice, { nullable: true})
  complaint?: ComplaintEntity;

}