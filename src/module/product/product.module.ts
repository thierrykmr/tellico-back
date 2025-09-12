import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from './entities/product.entity';
import { ProductService } from './service/product.service';
import { ProductController } from './controller/product.controller';
import { UserService } from '../user/service/user.service';
import { UserEntity } from '../user/entities/user.entity';
@Module({
  imports: [TypeOrmModule.forFeature([ProductEntity, UserEntity])],
  controllers: [ProductController],
  providers: [ProductService, UserService],
  exports: [ProductService]
})
export class ProductModule {}
