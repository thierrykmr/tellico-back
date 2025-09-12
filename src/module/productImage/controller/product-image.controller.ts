import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Request,
    ParseIntPipe,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { ProductImageService } from '../service/product-image.service';
import { CreateProductImageDto } from '../dto/create-product-image.dto';
import { UpdateProductImageDto } from '../dto/update-product-image.dto';
import { ProductImageEntity } from '../entities/productImage.entity';
import { NotFoundException } from '@nestjs/common';
import { AccessTokenGuard } from 'src/module/auth/guards/accessToken.guard';
import { AuthenticatedUserDto } from 'src/module/user/dto/authenticated-user.dto';


@Controller()
@UseGuards(AccessTokenGuard)
export class ProductImageController {
    constructor(private readonly productImageService: ProductImageService) {}

    @Post('create/:productId')
    async create( @Param('productId', ParseIntPipe) productId: number, @Body() createProductImageDto: CreateProductImageDto, @Request() req: { user: AuthenticatedUserDto }): Promise<ProductImageEntity> {
        const userId = req.user.sub;
        return await this.productImageService.create(createProductImageDto, userId, productId);
    }

    // // Récupérer toutes les images d'un produit 
    // @Get('product/:productId')
    // async findAllByProduct(@Param('productId', ParseIntPipe) productId: number): Promise<ProductImageEntity[]> {
    //     return await this.productImageService.findAllByProduct(productId);
    // }

     // Récupérer toutes les images d'un produit
    @Get('product/:productId')
    async findAllByMyProduct(@Param('productId', ParseIntPipe) productId: number, @Request() req: { user: AuthenticatedUserDto }): Promise<ProductImageEntity[]> {
        const userId = req.user.sub;
        return await this.productImageService.findAllByProduct(productId, userId);
    }

    // Récupérer l'image principale d'un produit
    @Get('product/:productId/main')
    async getMainImage(@Param('productId', ParseIntPipe) productId: number): Promise<ProductImageEntity> { // pensée : faire que dans le front, la premier image soit la Main Image du produit
        const mainImage = await this.productImageService.getMainImage(productId);
        if (!mainImage) {
            throw new NotFoundException('Aucune image principale trouvée pour ce produit');
        }
        return mainImage;
    }

    // Récupérer l'image la plus ancienne d'un produit ~ alternative à MainImage
    @Get('product/:productId/oldest')
    async getOldestImage(@Param('productId', ParseIntPipe) productId: number): Promise<ProductImageEntity> {
        const oldestImage = await this.productImageService.getOldestImage(productId);
        if (!oldestImage) {
            throw new NotFoundException('Aucune image trouvée pour ce produit');
        }
        return oldestImage;
    }

    // Récupérer une image spécifique
    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number, @Request() req: { user: AuthenticatedUserDto }): Promise<ProductImageEntity> {
        const userId = req.user.sub;
        return await this.productImageService.findOne(id, userId);
    }

    //Mettre à jour une image
    @Patch(':id')
    async update(@Param('id', ParseIntPipe) id: number, @Body() updateProductImageDto: UpdateProductImageDto, @Request() req: { user: AuthenticatedUserDto }): Promise<ProductImageEntity> {
        const userId = req.user.sub;
        return await this.productImageService.update(id, updateProductImageDto, userId);
    }

 
   //Définir une image comme image principale
    @Patch(':id/set-main')
    async setAsMain(@Param('id', ParseIntPipe) id: number, @Request() req: { user: AuthenticatedUserDto }): Promise<ProductImageEntity> {
        const userId = req.user.sub;
        return await this.productImageService.setAsMain(id, userId);
    }


    // Supprimer une image
    @Delete(':id')
    async remove(@Param('id', ParseIntPipe) id: number, @Request() req: { user: AuthenticatedUserDto }): Promise<void> {
        const userId = req.user.sub;
        return await this.productImageService.remove(id, userId);
    }
}






/**
 * Contrôleur public pour les images de produits (sans authentification)
 */

@Controller('public/product-images')
export class PublicProductImageController {
    constructor(private readonly productImageService: ProductImageService) {}


    // Récupérer toutes les images d'un produit public
    @Get('product/:productId')
    async findAllByProductPublic(@Param('productId', ParseIntPipe) productId: number): Promise<ProductImageEntity[]> {
        // Pas d'userId pour l'accès public - seuls les produits actifs seront accessibles
        return await this.productImageService.findAllByProduct(productId);
    }

    // Récupérer l'image principale d'un produit public
    @Get('product/:productId/main')
    async getMainImagePublic(@Param('productId', ParseIntPipe) productId: number): Promise<ProductImageEntity> {
        const mainImage = await this.productImageService.getMainImage(productId);
        if (!mainImage) {
            throw new NotFoundException('Aucune image principale trouvée pour ce produit');
        }
        return mainImage;
    }

    // Récupérer une image publique spécifique
    @Get(':id')
    async findOnePublic(@Param('id', ParseIntPipe) id: number): Promise<ProductImageEntity> {
        // Pas d'userId pour l'accès public - seuls les produits actifs seront accessibles
        return await this.productImageService.findOne(id);
    }
}