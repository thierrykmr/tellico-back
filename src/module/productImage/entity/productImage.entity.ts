import { BaseEntity } from 'src/common/base.entity';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ProductEntity } from '../../product/entity/product.entity';


@Entity({ name: 'product_images' })
export class ProductImageEntity extends BaseEntity {

    @Column()
    url: string;

    @Column({ default: false })
    isMain: boolean;

    @Column({ nullable: true })
    altText?: string;

    @ManyToOne(() => ProductEntity, product => product.images)
    @JoinColumn({ name: 'product_id' })
    product: ProductEntity;
}