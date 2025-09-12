import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductEntity } from '../entities/product.entity';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { UserEntity } from '../../user/entities/user.entity';
import { Not } from 'typeorm';

@Injectable()
export class ProductService {
    constructor(
        @InjectRepository(ProductEntity)
        private readonly productRepository: Repository<ProductEntity>,
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
    ) {}

    /**
     * Créer un nouveau produit
     * @param createProductDto - Données du produit à créer
     */
    async create(createProductDto: CreateProductDto, userId: number): Promise<ProductEntity> {
        // Vérifier que l'utilisateur existe
        const user = await this.userRepository.findOne({
            where: { id: userId }
        });

        if (!user) {
            throw new NotFoundException(`Utilisateur avec l'ID ${userId} non trouvé`);
        }

        // Validation du prix
        const price = parseFloat(createProductDto.price);
        if (price <= 0) {
            throw new BadRequestException('Le prix doit être supérieur à 0');
        }

        // Validation de la quantité
        if (createProductDto.quantity < 0) {
            throw new BadRequestException('La quantité ne peut pas être négative');
        }

        // Validation du taux de promotion si fourni
        if (createProductDto.promotionRate) {
            const promotionRate = parseFloat(createProductDto.promotionRate);
            if (promotionRate < 0 || promotionRate > 100) {
                throw new BadRequestException('Le taux de promotion doit être entre 0 et 100');
            }
        }

        const product = this.productRepository.create({
            ...createProductDto,
            user: user,
            isPromoted: !!createProductDto.promotionRate
        });

        return await this.productRepository.save(product);
    }

    /**
     * Récupérer tous les produits d'un utilisateur
     * @param includeInactive - Inclure les produits inactifs
     */
    async findAllByUser(userId: number, includeInactive: boolean = false): Promise<ProductEntity[]> {
        const whereCondition: any = { user: { id: userId } };
        
        if (!includeInactive) {
            whereCondition.isActive = true;
        }

        return await this.productRepository.find({
            where: whereCondition,
            relations: ['user', 'images'],
            order: { createdAt: 'DESC',
                     //isPromoted: 'DESC'
             }
        });
    }
     
    //Récupérer tous les produits actifs (pour les autres utilisateurs)
    async findAllActive(): Promise<ProductEntity[]> {// Pensée: mettre coté front une zone seulement pour les produit inactifs
        const whereCondition: any = { isActive: true };

        return await this.productRepository.find({
            where: whereCondition,
            relations: ['user', 'images'],
            order: { 
                isPromoted: 'DESC', // Les produits promus en premier
                createdAt: 'DESC' 
            }
        });
    }

    /**
     * Récupérer un produit par son ID
     * @param userId - ID de l'utilisateur (optionnel pour vérification de propriété)
     */
    async findOne(id: number, userId?: number): Promise<ProductEntity> {// Pensée: mettre coté front une zone seulement pour les produit inactifs
        const product = await this.productRepository.findOne({
            where: { id },
            relations: ['user', 'images']
        });

        if (!product) {
            throw new NotFoundException(`Produit avec l'ID ${id} non trouvé`);
        }

        // Si userId est fourni, vérifier que l'utilisateur est le propriétaire ou que le produit est actif
        if (userId && product.user.id !== userId && !product.isActive) {
            throw new ForbiddenException('Accès non autorisé à ce produit');
        }

        return product;
    }

    /**
     * Mettre à jour un produit
     * @param updateProductDto - Nouvelles données du produit
     */
    async update(id: number, updateProductDto: UpdateProductDto, userId: number): Promise<ProductEntity> {
        const product = await this.findOne(id);

        // Vérifier que l'utilisateur est le propriétaire du produit
        if (product.user.id !== userId) {
            throw new ForbiddenException('Vous ne pouvez modifier que vos propres produits');
        }

        // Validations similaires à la création
        if (updateProductDto.price) {
            const price = parseFloat(updateProductDto.price);
            if (price <= 0) {
                throw new BadRequestException('Le prix doit être supérieur à 0');
            }
        }

        if (updateProductDto.quantity !== undefined && updateProductDto.quantity < 0) {
            throw new BadRequestException('La quantité ne peut pas être négative');
        }

        if (updateProductDto.promotionRate) {
            const promotionRate = parseFloat(updateProductDto.promotionRate);
            if (promotionRate < 0 || promotionRate > 100) {
                throw new BadRequestException('Le taux de promotion doit être entre 0 et 100');
            }
        }

        // Mise à jour des données
        Object.assign(product, updateProductDto);

        // Mettre à jour le statut de promotion
        if (updateProductDto.promotionRate !== undefined) {
            product.isPromoted = !!updateProductDto.promotionRate;
        }

        product.updatedAt = new Date();

        return await this.productRepository.save(product);
    }

    /**
     * Supprimer ou desactiverun produit (soft delete - désactiver)
     */
    async desactivate(id: number, userId: number): Promise<void> {
        const product = await this.findOne(id);

        // Vérifier que l'utilisateur est le propriétaire du produit
        if (product.user.id !== userId) {
            throw new ForbiddenException('Vous ne pouvez supprimer que vos propres produits');
        }

        // Soft delete - désactiver le produit au lieu de le supprimer
        product.isActive = false;
        product.updatedAt = new Date();

        await this.productRepository.save(product);
    }

    /**
     * Supprimer définitivement un produit
     */
    async remove(id: number, userId: number): Promise<void> {
        const product = await this.findOne(id);

        // Vérifier que l'utilisateur est le propriétaire du produit
        if (product.user.id !== userId) {
            throw new ForbiddenException('Vous ne pouvez supprimer que vos propres produits');
        }

        await this.productRepository.remove(product);
    }

    /**
     * Activer/désactiver un produit
     */
    async toggleActiveStatus(id: number, userId: number): Promise<ProductEntity> {
        const product = await this.findOne(id);

        // Vérifier que l'utilisateur est le propriétaire du produit
        if (product.user.id !== userId) {
            throw new ForbiddenException('Vous ne pouvez modifier que vos propres produits');
        }

        product.isActive = !product.isActive;
        product.updatedAt = new Date();

        return await this.productRepository.save(product);
    }

    /**
     * Rechercher des produits par catégorie
     * @param category - Catégorie à rechercher
     * @param userId - ID de l'utilisateur (optionnel)
     */
    async findByCategory(category: string, userId?: number): Promise<ProductEntity[]> {
        const whereCondition: any = { 
            category: category,
            isActive: true 
        };

        if (userId) {
            whereCondition.user = { id: userId };
        }

        return await this.productRepository.find({
            where: whereCondition,
            relations: ['user', 'images'],
            order: { 
                isPromoted: 'DESC',
                createdAt: 'DESC' 
            }
        });
    }

    /**
     * Rechercher des produits par titre ou description
     * @param searchTerm - Terme de recherche
     * @param userId - ID de l'utilisateur (optionnel pour limiter à ses produits)
     */
    async search(searchTerm: string, userId?: number): Promise<ProductEntity[]> {
        const query = this.productRepository
            .createQueryBuilder('product')
            .leftJoinAndSelect('product.user', 'user')
            .leftJoinAndSelect('product.images', 'images')
            .where('product.isActive = :isActive', { isActive: true })
            .andWhere(
                '(LOWER(product.title) LIKE LOWER(:search) OR LOWER(product.description) LIKE LOWER(:search))',
                { search: `%${searchTerm}%` }
            );

        if (userId) {
            query.andWhere('user.id = :userId', { userId });
        }

        return await query
            .orderBy('product.isPromoted', 'DESC')
            .addOrderBy('product.createdAt', 'DESC')
            .getMany();
    }

    /**
     * Obtenir les statistiques des produits d'un utilisateur
     */
    async getUserProductStats(userId: number): Promise<{
        total: number;
        active: number;
        inactive: number;
        promoted: number;
    }> {
        const [total, active, promoted] = await Promise.all([
            this.productRepository.count({ where: { user: { id: userId } } }),
            this.productRepository.count({ where: { user: { id: userId }, isActive: true } }),
            this.productRepository.count({ where: { user: { id: userId }, isPromoted: true, isActive: true } })
        ]);

        return {
            total,
            active,
            inactive: total - active,
            promoted
        };
    }


    
}