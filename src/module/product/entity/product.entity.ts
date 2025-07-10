import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, In } from 'typeorm';
import { UserEntity } from '../../user/entity/user.entity';
import { BaseEntity } from '../../../common/base.entity';
import { CartItemEntity } from '../../cart_item/entity/cart_item.entity';
import { HistoryEntity } from '../../history/entity/history.entity';
import { ComplaintEntity } from '../../complaint/entity/complaint.entity';
import { ProductImageEntity } from 'src/module/productImage/entity/productImage.entity';
import { InvoiceItemEntity } from 'src/module/invoice_item/entity/invoice_item.entity';

@Entity({name: 'products'})
export class ProductEntity extends BaseEntity {

    @Column({ type: 'varchar', nullable: false })
    title: string;

    @Column({ type: 'text', nullable: false })
    description: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
    price: number;

    @Column({ type: 'int', nullable: false })
    quantity: number;

    @Column({ type: 'varchar', nullable: false })
    category: string;

    @Column({ type: 'varchar', nullable: false })
    location: string;

    @Column({ type: 'varchar', nullable: false })
    phone: string;

    @Column({ type: 'boolean', default: true })
    isActive: boolean;

    // @ManyToOne(() => UserEntity, user => user.products, { nullable: false })
    // seller: UserEntity;

    @Column({ type: 'boolean', default: false })
    isPromoted: boolean;

    @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
    promotionRate: number | null;

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
        cascade: true,
        eager: true, // pour charger les images automatiquement
    })
    images: ProductImageEntity[];

}