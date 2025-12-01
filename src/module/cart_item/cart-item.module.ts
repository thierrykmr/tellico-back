import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartItemEntity } from './entities/cart_item.entity';
import { CartItemService } from './service/cart-item.service';
import { CartItemController } from './controller/cart-item.controller';
import { CartEntity } from '../cart/entities/cart.entity';
import { ProductEntity } from '../product/entities/product.entity';
import { CartModule } from '../cart/cart.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([CartItemEntity, CartEntity, ProductEntity]),
        CartModule
    ],
    controllers: [CartItemController],
    providers: [CartItemService],
    exports: [CartItemService],
})
export class CartItemModule {}
