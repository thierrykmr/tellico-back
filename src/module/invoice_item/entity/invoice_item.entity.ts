import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { InvoiceEntity } from 'src/module/invoice/entity/invoice.entity'; 
import { ProductEntity } from '../../product/entity/product.entity';
import { BaseEntity } from 'src/common/base.entity';

@Entity({ name: 'invoice_items' })
export class InvoiceItemEntity extends BaseEntity {

  @Column()
  quantity: number;

  @Column('decimal')
  unitPrice: number;

  @ManyToOne(() => InvoiceEntity, (invoice) => invoice.items)
  @JoinColumn({ name: 'invoice_id' })
  invoice: InvoiceEntity;

  @ManyToOne(() => ProductEntity, (product) => product.invoiceItems)
  @JoinColumn({ name: 'product_id' })
  product: ProductEntity;
}
