import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductImageEntity } from '../entities/productImage.entity';
import { CreateProductImageDto } from '../dto/create-product-image.dto';
import { UpdateProductImageDto } from '../dto/update-product-image.dto';
import { ProductEntity } from '../../product/entities/product.entity';

@Injectable()
export class ProductImageService {
    constructor(
        @InjectRepository(ProductImageEntity)
        private readonly productImageRepository: Repository<ProductImageEntity>,
        @InjectRepository(ProductEntity)
        private readonly productRepository: Repository<ProductEntity>,
    ) {}
 
    async create(createProductImageDto: CreateProductImageDto, userId: number, productId: number): Promise<ProductImageEntity> {
        // Vérifier que le produit existe et appartient à l'utilisateur
        const product = await this.productRepository.findOne({
            where: { id: productId },
            relations: ['user']
        });

        if (!product) {
            throw new NotFoundException(`Produit avec l'ID ${productId} non trouvé`);
        }

        if (product.user.id !== userId) {
            throw new ForbiddenException('Vous ne pouvez ajouter des images qu\'à vos propres produits');
        }

        // Vérifier le nombre d'images existantes (limite optionnelle)
        const existingImagesCount = await this.productImageRepository.count({
            where: { product: { id: productId } }
        });

        if (existingImagesCount >= 3) { // Limite de 3 images par produit
            throw new BadRequestException('Nombre maximum d\'images atteint (3 images par produit)');
        }

        // Si c'est la première image, elle devient automatiquement principale
        let isMain = false;
        if (existingImagesCount === 0) {
            isMain = true;
        }

        const productImage = this.productImageRepository.create({
            url: createProductImageDto.url,
            isMain,
            altText: createProductImageDto.altText,
            product: product
        });

        return await this.productImageRepository.save(productImage);
    }

    //Recupérer toutes les images d'un produit, avec vérification de propriété si userId est fourni
    async findAllByProduct(productId: number, userId?: number): Promise<ProductImageEntity[]> {
        // Vérifier que le produit existe
        const product = await this.productRepository.findOne({
            where: { id: productId },
            relations: ['user']
        });

        if (!product) {
            throw new NotFoundException(`Produit avec l'ID ${productId} non trouvé`);
        }

        // Si userId est fourni, vérifier la propriété ou que le produit est actif
        if (userId && product.user.id !== userId && !product.isActive) {
            throw new ForbiddenException('Accès non autorisé aux images de ce produit');
        }

        return await this.productImageRepository.find({
            where: { product: { id: productId } },
            order: { 
                isMain: 'DESC', // Image principale en premier
                createdAt: 'ASC' // Du plus ancien au plus récent
            }
        });
    }

    async findOne(id: number, userId?: number): Promise<ProductImageEntity> {
        const productImage = await this.productImageRepository.findOne({
            where: { id },
            relations: ['product', 'product.user']
        });

        if (!productImage) {
            throw new NotFoundException(`Image avec l'ID ${id} non trouvée`);
        }

        // Vérifier les droits d'accès
        if (userId && productImage.product.user.id !== userId && !productImage.product.isActive) {
            throw new ForbiddenException('Accès non autorisé à cette image');
        }

        return productImage;
    }

    async update(id: number, updateProductImageDto: UpdateProductImageDto, userId: number): Promise<ProductImageEntity> {
        const productImage = await this.findOne(id);

        if (productImage.product.user.id !== userId) {
            throw new ForbiddenException('Vous ne pouvez modifier que les images de vos propres produits');
        }

        // Si cette image devient l'image principale, désactiver les autres
        if (updateProductImageDto.isMain && !productImage.isMain) {
            await this.unsetMainImages(productImage.product.id);
        }

        // Mettre à jour les données
        Object.assign(productImage, updateProductImageDto);
        productImage.updatedAt = new Date();

        return await this.productImageRepository.save(productImage);
    }

    async remove(id: number, userId: number): Promise<void> {
        const productImage = await this.findOne(id);

        // Vérifier que l'utilisateur est le propriétaire du produit
        if (productImage.product.user.id !== userId) {
            throw new ForbiddenException('Vous ne pouvez supprimer que les images de vos propres produits');
        }

        await this.productImageRepository.remove(productImage);

        // Si c'était l'image principale, définir une nouvelle image principale
        if (productImage.isMain) {
            await this.setNewMainImage(productImage.product.id);
        }
    }

    // Définir une image comme image principale
    async setAsMain(id: number, userId: number): Promise<ProductImageEntity> {
        const productImage = await this.findOne(id);

        // Vérifier que l'utilisateur est le propriétaire du produit
        if (productImage.product.user.id !== userId) {
            throw new ForbiddenException('Vous ne pouvez modifier que les images de vos propres produits');
        }

        // Désactiver toutes les autres images principales du produit
        await this.unsetMainImages(productImage.product.id);

        // Définir cette image comme principale
        productImage.isMain = true;
        productImage.updatedAt = new Date();

        return await this.productImageRepository.save(productImage);
    }

   // Récupérer l'image principale d'un produit
    async getMainImage(productId: number): Promise<ProductImageEntity | null> {
        return await this.productImageRepository.findOne({
            where: { 
                product: { id: productId },
                isMain: true 
            }
        });
    }

    // Récupérer l'image la plus ancienne d'un produit
    async getOldestImage(productId: number): Promise<ProductImageEntity | null> {
        return await this.productImageRepository.findOne({
            where: { product: { id: productId } },
            order: { createdAt: 'ASC' }
        });
    }


     // Désactiver toutes les images principales d'un produit
    async unsetMainImages(productId: number): Promise<void> {
        await this.productImageRepository.update(
            { product: { id: productId }, isMain: true },
            { isMain: false, updatedAt: new Date() }
        );
    }


     //Définir automatiquement une nouvelle image principale lorsqu'une image principale est supprimée
    async setNewMainImage(productId: number): Promise<void> {
        const firstImage = await this.productImageRepository.findOne({
            where: { product: { id: productId } },
            order: { createdAt: 'ASC' }
        });

        if (firstImage) {
            firstImage.isMain = true;
            firstImage.updatedAt = new Date();
            await this.productImageRepository.save(firstImage);
        }
    }
}