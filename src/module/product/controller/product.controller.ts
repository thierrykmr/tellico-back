import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    UseGuards,
    Request,
    ParseIntPipe,
    HttpCode,
    HttpStatus,
    
} from '@nestjs/common';
import { ProductService } from '../service/product.service';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { ProductEntity } from '../entities/product.entity';
import { NotFoundException } from '@nestjs/common';
import { AccessTokenGuard } from 'src/module/auth/guards/accessToken.guard';
import { AuthenticatedUserDto } from 'src/module/user/dto/authenticated-user.dto';


@Controller()
@UseGuards(AccessTokenGuard)
export class ProductController {
    constructor(private readonly productService: ProductService) {}

    //Créer un nouveau produit
    @Post('create')
    async create(@Body() createProductDto: CreateProductDto, @Request() req: { user: AuthenticatedUserDto }): Promise<ProductEntity> {
        const userId = req.user.sub;
        return await this.productService.create(createProductDto, userId);
    }

    //Récupérer tous les produits publics (actifs)
    @Get('all-products')
    async findAllPublic(): Promise<ProductEntity[]> {
        return await this.productService.findAllActive();
    }

    //Récupérer tous les produits de l'utilisateur connecté
    @Get('my-products')
    async findMyProducts(@Request() req: { user: AuthenticatedUserDto }, @Query('includeInactive') includeInactive?: string): Promise<ProductEntity[]> {
        const userId = req.user.sub;
        const includeInactiveFlag = includeInactive === 'true';
        return await this.productService.findAllByUser(userId, includeInactiveFlag);
    }

    //Récupérer les statistiques de mes produits
    @Get('my-stats')
    async getMyProductStats(@Request() req: { user: AuthenticatedUserDto }) {
        const userId = req.user.sub;
        return await this.productService.getUserProductStats(userId);
    }

    //Rechercher mes produits
    @Get('search-my-products')
    async searchMyProducts(@Query('q') searchTerm: string, @Query('myProducts') myProducts: string, @Request() req: { user: AuthenticatedUserDto }): Promise<ProductEntity[]> {
        if (!searchTerm) {
            throw new Error('Le terme de recherche est requis');
        }
        
        const userId = myProducts === 'true' ? req.user.sub : undefined;
        return await this.productService.search(searchTerm, userId);
    }

    //Rechercher mes produits
    @Get('search')
    async search(@Query('q') searchTerm: string, @Query('myProducts') myProducts: string, @Request() req: { user: AuthenticatedUserDto }): Promise<ProductEntity[]> {
        if (!searchTerm) {
            throw new Error('Le terme de recherche est requis');
        }
        
        const userId = myProducts === 'false' ? req.user.sub : undefined;
        return await this.productService.search(searchTerm, userId);
    }

    //Récupérer les produits par catégorie de l'utilisateur connecté
    @Get('my-category/:category')
    async findMyProductsByCategory(@Param('category') category: string, @Request() req: { user: AuthenticatedUserDto }): Promise<ProductEntity[]> {
        const userId = req.user.sub;
        return await this.productService.findByCategory(category, userId);
    }

    //Récupérer les produits par catégorie
    @Get('category/:category')
    async findByCategory(@Param('category') category: string): Promise<ProductEntity[]> {
        return await this.productService.findByCategory(category);
    }

    //Récupérer un produit spécifique
    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number, @Request() req: { user: AuthenticatedUserDto }): Promise<ProductEntity> { //ParseIntPipe convertit automatiquement le paramètre id en nombre.
        const userId = req.user.sub;
        return await this.productService.findOne(id, userId);
    }
    
     // Mettre à jour un produit
    @Patch(':id')
    async update(@Param('id', ParseIntPipe) id: number, @Body() updateProductDto: UpdateProductDto, @Request() req: { user: AuthenticatedUserDto }): Promise<ProductEntity> {
        const userId = req.user.sub;
        return await this.productService.update(id, updateProductDto, userId);
    }
    
     // Activer/désactiver un produit    
    @Patch(':id/toggle-status')
    async toggleActiveStatus(@Param('id', ParseIntPipe) id: number, @Request() req: { user: AuthenticatedUserDto }): Promise<ProductEntity> {
        const userId = req.user.sub;
        return await this.productService.toggleActiveStatus(id, userId);
    }
    
    // Desactiver un produit (soft delete)
    @Delete(':id/desactivate')
    async remove(@Param('id', ParseIntPipe) id: number, @Request() req: { user: AuthenticatedUserDto }): Promise<void> {
        const userId = req.user.sub;
        return await this.productService.desactivate(id, userId);
    }

     // Supprimer définitivement un produit
    @Delete(':id')
    async hardRemove(@Param('id', ParseIntPipe) id: number, @Request() req: { user: AuthenticatedUserDto }): Promise<void> {
        const userId = req.user.sub;
        return await this.productService.remove(id, userId);
    }
}




/**
 * Contrôleur public pour les produits (sans authentification)
 */

@Controller('public/products')
export class PublicProductController {
    constructor(private readonly productService: ProductService) {}

    // Récupérer tous les produits publics actifs (sans auth)
    @Get()
    async findAllPublic(): Promise<ProductEntity[]> {
        return await this.productService.findAllActive();
    }

    // Récupérer un produit public par ID (sans auth)

    @Get(':id')
    async findOnePublic(@Param('id', ParseIntPipe) id: number ): Promise<ProductEntity> {
        const product = await this.productService.findOne(id);
        
        // Vérifier que le produit est actif pour l'accès public
        if (!product.isActive) {
            throw new NotFoundException('Produit non disponible');
        }
        
        return product;
    }


     // Rechercher des produits publics (sans auth)

    @Get('search/:searchTerm')
    async searchPublic( @Param('searchTerm') searchTerm: string): Promise<ProductEntity[]> {
        return await this.productService.search(searchTerm);
    }


     //Récupérer les produits publics par catégorie (sans auth)

    @Get('category/:category')
    async findByCategoryPublic( @Param('category') category: string): Promise<ProductEntity[]> {
        return await this.productService.findByCategory(category);
    }
}