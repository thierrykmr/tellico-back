import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Cart } from '../../cart/entity/cart.entity';
import { Product } from '../../product/entity/product.entity';
import { BaseEntity } from 'src/common/base.entity';

@Entity({ name: 'cart_items' })
export class CartItem extends BaseEntity {

    @Column({ name: 'cart_id' })
    cartId: string;

    @Column({ name: 'product_id' })
    productId: string;

    @Column({ type: 'int', nullable: false })
    quantity: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    unitPrice: string;

    // @ManyToOne(() => Cart, cart => cart.items, { onDelete: 'CASCADE' })
    // @JoinColumn({ name: 'cartId' })
    // cart: Cart;

    // @ManyToOne(() => Product, { eager: true })
    // @JoinColumn({ name: 'productId' })
    // product: Product;
}