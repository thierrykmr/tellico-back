import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class ProductImage {


    @Column()
    url: string;

    @Column({ default: false })
    isMain: boolean;

    @Column({ nullable: true })
    altText?: string;

    // @ManyToOne(() => Product, product => product.images, { onDelete: 'CASCADE' })
    // product: Product;
}