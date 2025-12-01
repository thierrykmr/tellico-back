import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  ParseIntPipe, 
  Request, 
  UseGuards, 
  Query 
} from '@nestjs/common';
import { CartService } from '../service/cart.service';
import { CreateCartDto } from '../dto/create-cart.dto';
import { UpdateCartDto } from '../dto/update-cart.dto';
import { CartEntity, CartStatus } from '../entities/cart.entity';
import { AuthenticatedUserDto } from 'src/module/user/dto/authenticated-user.dto';
import { AccessTokenGuard } from 'src/module/auth/guards/accessToken.guard';

@Controller()
@UseGuards(AccessTokenGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  // Créer un nouveau panier
  /*@Post('create')
  async create( @Body() createCartDto: CreateCartDto, @Request() req: { user: AuthenticatedUserDto }): Promise<{
    message: string;
    data: CartEntity;
  }> {
    const cartData = {
      ...createCartDto,
      userId: req.user.sub
    };
    const cart = await this.cartService.create(cartData);
    return {
      message: 'Panier créé avec succès',
      data: cart,
    };
  }*/

  // Récupérer tous les paniers de l'utilisateur connecté
  @Get('my-carts')
  async findMyCart(@Request() req: { user: AuthenticatedUserDto }, @Query('status') status?: CartStatus): Promise<{
    message: string;
    data: CartEntity[];
  }> {
    const carts = await this.cartService.findByUserId(req.user.sub, status);
    return {
      message: 'Paniers récupérés avec succès',
      data: carts,
    };
  }

  // Récupérer le panier actif (ouvert) de l'utilisateur
  @Get('active')
  async getActiveCart(@Request() req: { user: AuthenticatedUserDto }): Promise<{ message: string;data: CartEntity;}> {
    const cart = await this.cartService.findActiveCartByUserId(req.user.sub);
    return {
      message: 'Panier actif récupéré avec succès',
      data: cart,
    };
  }

  // Récupérer un panier spécifique
  @Get(':id')
  async findOne( @Param('id', ParseIntPipe) id: number,  @Request() req: { user: AuthenticatedUserDto } ): Promise<{
    message: string;
    data: CartEntity;}> {
    const cart = await this.cartService.findOne(id, req.user.sub);
    return {
      message: 'Panier récupéré avec succès',
      data: cart,
    };
  }

  // Mettre à jour un panier
  /*@Patch(':id')
  async update( @Param('id', ParseIntPipe) id: number,@Body() updateCartDto: UpdateCartDto, @Request() req: { user: AuthenticatedUserDto }): Promise<{
    message: string;
    data: CartEntity;}> 
    {const cart = await this.cartService.update(id, updateCartDto, req.user.sub);
    return {
      message: 'Panier mis à jour avec succès',
      data: cart,
    };
  }

  // Supprimer un panier
  @Delete(':id')
  async remove( @Param('id', ParseIntPipe) id: number,  @Request() req: { user: AuthenticatedUserDto }): Promise<{
    message: string;
  }> {
    await this.cartService.remove(id, req.user.sub);
    return {
      message: 'Panier supprimé avec succès',
    };
  }*/

  // Commander un panier, voir le système de paiement
  @Post(':id/order')
  async orderCart(@Param('id', ParseIntPipe) id: number, @Request() req: { user: AuthenticatedUserDto }): Promise<{
    message: string;
    data: CartEntity;
  }> {
    const cart = await this.cartService.orderCart(id, req.user.sub);
    return {
      message: 'Commande passée avec succès',
      data: cart,
    };
  }

  // Annuler un panier
  @Post(':id/cancel')
  async cancelCart( @Param('id', ParseIntPipe) id: number, @Request() req: { user: AuthenticatedUserDto }): Promise<{
    message: string;
    data: CartEntity;}> {
    const cart = await this.cartService.cancelCart(id, req.user.sub);
    return {
      message: 'Panier annulé avec succès',
      data: cart,
    };
  }

  // Obtenir le résumé d'un panier
  @Get(':id/summary')
  async getCartSummary( @Param('id', ParseIntPipe) id: number, @Request() req: { user: AuthenticatedUserDto }): Promise<{
    message: string;
    data: {
      cart: CartEntity;
      itemsCount: number;
      uniqueProductsCount: number;
      totalAmount: number;
    };
  }> {
    const summary = await this.cartService.getCartSummary(id, req.user.sub);
    return {
      message: 'Résumé du panier récupéré avec succès',
      data: summary,
    };
  }

  // Obtenir l'historique des paniers de l'utilisateur
  @Get('history')
  async getUserCartHistory(@Request() req: { user: AuthenticatedUserDto }): Promise<{ message: string; data: CartEntity[];}> {
    const carts = await this.cartService.getUserCartHistory(req.user.sub);
    return {
      message: 'Historique des paniers récupéré avec succès',
      data: carts,
    };
  }

  // Recalculer le total d'un panier
  /*@Post(':id/recalculate')
  async recalculateTotal(
    @Param('id', ParseIntPipe) id: number, 
    @Request() req: { user: AuthenticatedUserDto }
  ): Promise<{
    message: string;
    data: CartEntity;
  }> {
    const cart = await this.cartService.recalculateTotal(id, req.user.sub);
    return {
      message: 'Total du panier recalculé avec succès',
      data: cart,
    };
  }

  // Dupliquer un panier
  @Post(':id/duplicate')
  async duplicateCart(
    @Param('id', ParseIntPipe) id: number, 
    @Request() req: { user: AuthenticatedUserDto }
  ): Promise<{
    message: string;
    data: CartEntity;
  }> {
    const cart = await this.cartService.duplicateCart(id, req.user.sub);
    return {
      message: 'Panier dupliqué avec succès',
      data: cart,
    };
  }*/

  // Vider un panier
  @Delete(':id/clear')
  async clearCart(
    @Param('id', ParseIntPipe) id: number, 
    @Request() req: { user: AuthenticatedUserDto }
  ): Promise<{
    message: string;
    data: CartEntity;
  }> {
    const cart = await this.cartService.clearCart(id, req.user.sub);
    return {
      message: 'Panier vidé avec succès',
      data: cart,
    };
  }

  // Obtenir les statistiques des paniers de l'utilisateur
  @Get('my-stats')
  async getMyCartStats(@Request() req: { user: AuthenticatedUserDto }): Promise<{
    message: string;
    data: {
      total: number;
      open: number;
      ordered: number;
      cancelled: number;
    };
  }> {
    const stats = await this.cartService.getUserCartStats(req.user.sub);
    return {
      message: 'Statistiques des paniers récupérées avec succès',
      data: stats,
    };
  }
}

/**
 * Contrôleur admin pour les paniers (avec permissions élevées)
 */
@Controller('admin/carts')
@UseGuards(AccessTokenGuard)
// @UseGuards(RoleGuard) // À décommenter quand le guard de rôle sera implémenté
export class AdminCartController {
  constructor(private readonly cartService: CartService) {}

  // Récupérer tous les paniers (admin seulement)
  @Get()
  async findAll(): Promise<{
    message: string;
    data: CartEntity[];
  }> {
    const carts = await this.cartService.findAll();
    return {
      message: 'Tous les paniers récupérés avec succès',
      data: carts,
    };
  }

  // Récupérer les paniers par statut (admin seulement)
  @Get('by-status/:status')
  async getCartsByStatus(@Param('status') status: CartStatus): Promise<{
    message: string;
    data: CartEntity[];
  }> {
    const carts = await this.cartService.getCartsByStatus(status);
    return {
      message: `Paniers avec le statut '${status}' récupérés avec succès`,
      data: carts,
    };
  }

  // Obtenir les statistiques globales des paniers (admin seulement)
  @Get('stats')
  async getCartStats(): Promise<{
    message: string;
    data: {
      total: number;
      open: number;
      ordered: number;
      cancelled: number;
    };
  }> {
    const stats = await this.cartService.getCartStats();
    return {
      message: 'Statistiques globales des paniers récupérées avec succès',
      data: stats,
    };
  }

  // Récupérer les paniers abandonnés (admin seulement)
  @Get('abandoned')
  async getAbandonedCarts(@Query('days') days?: number): Promise<{
    message: string;
    data: CartEntity[];
  }> {
    const daysOld = days ? parseInt(days.toString()) : 7;
    const carts = await this.cartService.getAbandonedCarts(daysOld);
    return {
      message: `Paniers abandonnés depuis ${daysOld} jours récupérés avec succès`,
      data: carts,
    };
  }
}
