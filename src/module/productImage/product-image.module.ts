import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductImageEntity } from './entities/productImage.entity';
import { ProductImageService } from './service/product-image.service';
import { ProductImageController } from './controller/product-image.controller';
import { ProductEntity } from '../product/entities/product.entity';
import { ProductService } from '../product/service/product.service';
import { UserEntity } from '../user/entities/user.entity';
import { UserService } from '../user/service/user.service';

@Module({
    imports: [TypeOrmModule.forFeature([ProductImageEntity, ProductEntity, UserEntity])],
    controllers: [ProductImageController],
    providers: [ProductImageService, ProductService, UserService],
    exports: [ProductImageService]
})
export class ProductImageModule {}
