import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartEntity } from './entities/cart.entity';
import { CartService } from './service/cart.service';
import { CartController, AdminCartController } from './controller/cart.controller';
import { UserEntity } from '../user/entities/user.entity';
import { CartItemEntity } from '../cart_item/entities/cart_item.entity';
import { ProductEntity } from '../product/entities/product.entity';
import { InvoiceEntity } from '../invoice/entities/invoice.entity';

@Module({
    imports: [TypeOrmModule.forFeature([CartEntity, UserEntity, CartItemEntity, ProductEntity, InvoiceEntity])],
    controllers: [CartController, AdminCartController],
    providers: [CartService],
    exports: [CartService],
})
export class CartModule {}
