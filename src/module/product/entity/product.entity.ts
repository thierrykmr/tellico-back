import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { UserEntity } from '../../user/entity/user.entity';
import { BaseEntity } from '../../../common/base.entity';

@Entity({name: 'products'})
export class Product extends BaseEntity {

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

    // @OneToMany(() => ProductImage, image => image.product, {
    // cascade: true,
    // eager: true, // pour charger les images automatiquement
    // })
    // images: ProductImage[];
}