import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { CartEntity } from '../../cart/entities/cart.entity';
import { ProductEntity } from '../../product/entities/product.entity';
import { BaseEntity } from 'src/common/base.entity';

@Entity({ name: 'cart_items' })
export class CartItemEntity extends BaseEntity {

    @Column({ name: 'cart_id' })
    cartId: number;

    @Column({ name: 'product_id' })
    productId: number;

    @Column({ type: 'int', nullable: false })
    quantity: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    unitPrice: string;    
    
    @ManyToOne(() => CartEntity, cart => cart.items)
    @JoinColumn({ name: 'cart_id' })
    cart: CartEntity;

    @ManyToOne(() => ProductEntity, (product) => product.cartItems, { eager: true })
    @JoinColumn({ name: 'product_id' })
    product: ProductEntity;
}