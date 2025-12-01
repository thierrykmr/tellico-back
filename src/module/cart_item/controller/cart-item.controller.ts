import { NotFoundException, BadRequestException, UseGuards } from '@nestjs/common';import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Request,
} from '@nestjs/common';
import { CartItemService } from '../service/cart-item.service';
import { CreateCartItemDto } from '../dto/create-cart-item.dto';
import { UpdateCartItemDto } from '../dto/update-cart-item.dto';
import { CartItemEntity } from '../entities/cart_item.entity';
import { UserEntity } from 'src/module/user/entities/user.entity';
import { UserService } from 'src/module/user/service/user.service';
import { AuthenticatedUserDto } from 'src/module/user/dto/authenticated-user.dto';
import { CreateCartDto } from 'src/module/cart/dto/create-cart.dto';
import { CartEntity } from 'src/module/cart/entities/cart.entity';
import { AccessTokenGuard } from 'src/module/auth/guards/accessToken.guard';

@Controller()
@UseGuards(AccessTokenGuard)
export class CartItemController {
  constructor(private readonly cartItemService: CartItemService) {}
 
  //creer une cart item
  @Post('add-product/:productId')
  async addProduct(@Param('productId', ParseIntPipe) productId: number, @Body() body: { quantity?: number }, @Request() req: { user: AuthenticatedUserDto }): Promise<CartItemEntity> {
    const quantity = body.quantity || 1;
    const createCartItemDto = { quantity };

    return await this.cartItemService.create(createCartItemDto, req.user.sub, productId);}

  @Get()
  async findAll(): Promise<CartItemEntity[]> {
    return await this.cartItemService.findAll();
  }
  

  @Get('cart/:cartId')
  async findByCartId(@Param('cartId', ParseIntPipe) cartId: number): Promise<{
    message: string;
    data: CartItemEntity[];
    count: number;
    total: string;
  }> {
    const cartItems = await this.cartItemService.findByCartId(cartId);
    const count = await this.cartItemService.getCartItemsCount(cartId);
    const total = await this.cartItemService.getCartItemsTotal(cartId);
    
    return {
      message: 'Items du panier récupérés avec succès',
      data: cartItems,
      count,
      total,
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<{message: string;data: CartItemEntity;}> {
    const cartItem = await this.cartItemService.findOne(id);
    return {
      message: 'Item récupéré avec succès',
      data: cartItem,
    };
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number, @Body() updateCartItemDto: UpdateCartItemDto,): Promise<{ message: string;data: CartItemEntity;}> {
    const cartItem = await this.cartItemService.update(id, updateCartItemDto);
    return {
      message: 'Item mis à jour avec succès',
      data: cartItem,
    };
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<{message: string;}> {
    await this.cartItemService.remove(id);
    return {
      message: 'Item supprimé du panier avec succès',
    };
  }

  @Delete('cart/:cartId')
  async removeByCartId(@Param('cartId', ParseIntPipe) cartId: number): Promise<{
    message: string;
  }> {
    await this.cartItemService.removeByCartId(cartId);
    return {
      message: 'Tous les items du panier ont été supprimés avec succès',
    };
  }

  @Post('cart/:cartId/clear')
  async clearCart(@Param('cartId', ParseIntPipe) cartId: number): Promise<{
    message: string;
  }> {
    await this.cartItemService.clearCart(cartId);
    return {
      message: 'Panier vidé avec succès',
    };
  }

  @Patch('cart/:cartId/product/:productId/adjust')
  async adjustQuantity( @Param('cartId', ParseIntPipe) cartId: number, @Param('productId', ParseIntPipe) productId: number, @Body() body: { quantityChange: number },): Promise<{
    message: string;
    data?: CartItemEntity;
  }> {
    const cartItem = await this.cartItemService.adjustQuantity(
      cartId,
      productId,
      body.quantityChange,
    );
    
    if (!cartItem) {
      return {
        message: 'Item supprimé du panier (quantité = 0)',
      };
    }
    
    return {
      message: 'Quantité ajustée avec succès',
      data: cartItem,
    };
  }

  @Get('cart/:cartId/summary')
  async getCartSummary(@Param('cartId', ParseIntPipe) cartId: number): Promise<{message: string;
    data: {
      itemsCount: number;
      totalAmount: string;
      items: CartItemEntity[];
    };}> {
    const items = await this.cartItemService.findByCartId(cartId);
    const count = await this.cartItemService.getCartItemsCount(cartId);
    const total = await this.cartItemService.getCartItemsTotal(cartId);
    
    return {
      message: 'Résumé du panier récupéré avec succès',
      data: {
        itemsCount: count,
        totalAmount: total,
        items,
      },
    };
  }

  // Endpoint pour ajouter rapidement un item ou augmenter sa quantité
  /*@Post('cart/:cartId/add-product/:productId')
  async addProductToCart(
    @Param('cartId', ParseIntPipe) cartId: number,
    @Param('productId', ParseIntPipe) productId: number,
    @Body() body: { quantity?: number },
    @Request() req: { user: AuthenticatedUserDto }
  ): Promise<{
    message: string;
    data: CartItemEntity;
  }> {
    const quantity = body.quantity || 1;
    const createCartItemDto = {
      cartId,
      quantity,
    };

    const cartItem = await this.cartItemService.create(createCartItemDto, req.user.sub, productId);
    return {
      message: 'Produit ajouté au panier avec succès',
      data: cartItem,
    };
  }*/

  // Endpoint pour mettre à jour directement la quantité d'un item
  /*@Patch('cart/:cartId/product/:productId/quantity')
  async updateQuantity(
    @Param('cartId', ParseIntPipe) cartId: number,
    @Param('productId', ParseIntPipe) productId: number,
    @Body() body: { quantity: number },
  ): Promise<{
    message: string;
    data?: CartItemEntity;
  }> {
    // Trouver l'item existant
    const items = await this.cartItemService.findByCartId(cartId);
    const existingItem = items.find(item => item.productId === productId);
    
    if (!existingItem) {
      throw new NotFoundException('Item non trouvé dans le panier');
    }

    if (body.quantity <= 0) {
      await this.cartItemService.remove(existingItem.id);
      return {
        message: 'Item supprimé du panier',
      };
    }

    const updateDto: UpdateCartItemDto = { quantity: body.quantity };
    const updatedItem = await this.cartItemService.update(existingItem.id, updateDto);
    
    return {
      message: 'Quantité mise à jour avec succès',
      data: updatedItem,
    };
  }*/
}