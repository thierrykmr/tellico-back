import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, In } from 'typeorm';
import { UserEntity } from '../../user/entities/user.entity';
import { BaseEntity } from '../../../common/base.entity';
import { CartItemEntity } from '../../cart_item/entities/cart_item.entity';
import { HistoryEntity } from '../../history/entities/history.entity';
import { ComplaintEntity } from '../../complaint/entities/complaint.entity';
import { ProductImageEntity } from 'src/module/productImage/entities/productImage.entity';
import { InvoiceItemEntity } from 'src/module/invoice_item/entities/invoice_item.entity';

@Entity({name: 'products'})
export class ProductEntity extends BaseEntity {

    @Column({ type: 'varchar'})
    title: string;

    @Column({ type: 'text'})
    description: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    price: string;

    @Column({ type: 'int'})
    quantity: number;

    @Column({ type: 'varchar' })
    category: string;

    @Column({ type: 'varchar', nullable: true })
    location?: string;

    @Column({ type: 'varchar', nullable: true })
    phone?: string;

    @Column({ type: 'boolean', default: true })
    isActive: boolean;

    @Column({ type: 'boolean', default: false })
    isPromoted: boolean;

    @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
    promotionRate?: string;

    @ManyToOne(() => UserEntity, (user) => user.products)
    @JoinColumn({ name: 'user_id' })
    user: UserEntity;

    @OneToMany(() => CartItemEntity, (item) => item.product)
    cartItems: CartItemEntity[];

    @OneToMany(() => HistoryEntity, (history) => history.product)
    histories: HistoryEntity[];

    @OneToMany(() => ComplaintEntity, (complaint) => complaint.product)
    complaints: ComplaintEntity[];

    @OneToMany(()=> InvoiceItemEntity, (invoiceItem) => invoiceItem.product)
    invoiceItems: InvoiceItemEntity[];

    @OneToMany(() => ProductImageEntity, (image) => image.product, {
        eager: true, // pour charger les images automatiquement
    })
    images: ProductImageEntity[];

}