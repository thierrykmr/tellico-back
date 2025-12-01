import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from './common/datasource';
import { UserModule } from './module/user/user.module';
import { ProductModule } from './module/product/product.module';
import { AuthModule } from './module/auth/auth.module';
import { APP_FILTER, RouterModule } from '@nestjs/core';
import { DuplicateEntryException } from './common/http-filters';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ProductImageModule } from './module/productImage/product-image.module';
import { CartItemModule } from './module/cart_item/cart-item.module';
import { CartModule } from './module/cart/cart.module';

export const API_PREFIX = 'api/v1';

@Module({
  imports: [
    TypeOrmModule.forRoot(dataSourceOptions),
    RouterModule.register([
      {
      path: API_PREFIX,
      children: [
        {
          path: 'users',
          module: UserModule,
        },
        {
          path: 'auth',
          module: AuthModule,
        },
        {
          path: 'products',
          module: ProductModule,
        },
        {
          path: 'product-images',
          module: ProductImageModule,
        },
        {
          path: 'cart-items',
          module: CartItemModule
        },
        {
          path: 'carts',
          module: CartModule
        }
      ],
    },
  ]),
  AuthModule,
  UserModule,
  ProductModule,
  ProductImageModule,
  CartItemModule,
  CartModule,
  EventEmitterModule.forRoot(),


  ],
  
  providers: [
    { provide: APP_FILTER,
      useClass: DuplicateEntryException  // pour gerer les doublons dans la bdd
    },
  ],
})
export class AppModule {}
