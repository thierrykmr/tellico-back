import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartItemEntity } from '../entities/cart_item.entity';
import { CartEntity, CartStatus } from '../../cart/entities/cart.entity';
import { ProductEntity } from '../../product/entities/product.entity';
import { CreateCartItemDto } from '../dto/create-cart-item.dto';
import { UpdateCartItemDto } from '../dto/update-cart-item.dto';
import { CartService } from '../../cart/service/cart.service';



@Injectable()
export class CartItemService {
  constructor(
    @InjectRepository(CartItemEntity)
    private readonly cartItemRepository: Repository<CartItemEntity>,
    @InjectRepository(CartEntity)
    private readonly cartRepository: Repository<CartEntity>,
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
    private readonly cartService: CartService,
  ) {}

  async create(createCartItemDto: CreateCartItemDto, userId: number, productId: number): Promise<CartItemEntity> {
        const { cartId, quantity } = createCartItemDto;

        // Récupérer ou créer un cart ouvert pour l'utilisateur
        let cart: CartEntity;
        if (cartId) {
            // Si un cartId est fourni, vérifier qu'il existe et est ouvert
            const foundCart = await this.cartRepository.findOne({ 
                where: { id: cartId, status: CartStatus.OPEN, userId }
            });
            if (!foundCart) {
                throw new NotFoundException('Panier non trouvé, fermé, ou n\'appartient pas à l\'utilisateur');
            }
            cart = foundCart;
        } else {
            // Sinon, chercher un cart ouvert existant pour l'utilisateur
            try {
                cart = await this.cartService.findActiveCartByUserId(userId);
            } catch (error) {
                // Aucun cart ouvert trouvé, en créer un nouveau
                cart = await this.cartService.create({ 
                    userId, 
                    totalPrice: '0.00', 
                    status: CartStatus.OPEN 
                });
            }
        }

        const finalCartId = cart.id;

        // Vérifier que le produit existe et est actif
        const product = await this.productRepository.findOne({ where: { id: productId, isActive: true },});
        if (!product) {
            throw new NotFoundException('Produit non trouvé ou inactif');
        }

        // Vérifier la disponibilité du stock
        if (product.quantity < quantity) {
            throw new BadRequestException('Stock insuffisant');
        }

        // Vérifier si l'item existe déjà dans le panier
        const existingItem = await this.cartItemRepository.findOne({ where: { cartId: finalCartId, productId },});

        if (existingItem) {
        // Mettre à jour la quantité
            const newQuantity = existingItem.quantity + Number(quantity);
            console.log("New Quantity:", newQuantity);
            console.log("Product Stock Quantity:", product.quantity);
            console.log("Requested Quantity:", quantity);
            console.log("newQuantity:", newQuantity);
            console.log("Type of newQuantity:", typeof newQuantity);
            console.log("Type of product.quantity:", typeof product.quantity);
            console.log("Type of quantity:", typeof quantity);
            if (product.quantity < newQuantity) {
                throw new BadRequestException('Stock insuffisant pour cette quantité');}
        
            existingItem.quantity = newQuantity;
            const savedItem = await this.cartItemRepository.save(existingItem);
            await this.updateCartTotal(finalCartId);
            return savedItem;
        }

        // Calculer le prix unitaire avec promotion
        const unitPrice = this.calculateUnitPrice(product);

        // Créer le nouvel item
        const cartItem = this.cartItemRepository.create({
        cartId: finalCartId,
        productId,
        quantity,
        unitPrice,
        });

        const savedItem = await this.cartItemRepository.save(cartItem);
        await this.updateCartTotal(finalCartId);
        return savedItem;
    }

async findAll(): Promise<CartItemEntity[]> {
    return this.cartItemRepository.find({
        relations: ['cart', 'product'],
    });
}

async findActiveCartForUser(userId: number): Promise<CartItemEntity[]> {
    return this.cartItemRepository.find({
        where: { 
            cart: { 
                userId: userId, 
                status: CartStatus.OPEN 
            } 
        },
        relations: ['cart', 'product'],
    });
}

  async findByCartId(cartId: number): Promise<CartItemEntity[]> {
    return this.cartItemRepository.find({
      where: { cartId },
      relations: ['product'],
    });
  }

  async findOne(id: number): Promise<CartItemEntity> {
    const cartItem = await this.cartItemRepository.findOne({
      where: { id },
      relations: ['cart', 'product'],
    });
    
    if (!cartItem) {
      throw new NotFoundException(`CartItem avec l'ID ${id} non trouvé`);
    }
    
    return cartItem;
  }

  async update(id: number, updateCartItemDto: UpdateCartItemDto): Promise<CartItemEntity> {
    const cartItem = await this.findOne(id);
    
    // Vérifier que le panier est ouvert
    if (cartItem.cart.status !== CartStatus.OPEN) {
      throw new BadRequestException('Impossible de modifier un panier fermé');
    }

    console.log("Update DTO Quantity:", updateCartItemDto.quantity);
    if (updateCartItemDto.quantity !== undefined) {
      // Vérifier la disponibilité du stock
      if (cartItem.product.quantity < updateCartItemDto.quantity) {
        throw new BadRequestException('Stock insuffisant');
      }
      cartItem.quantity = updateCartItemDto.quantity;
    }

    // Recalculer le prix unitaire si nécessaire (au cas où la promotion a changé)
    cartItem.unitPrice = this.calculateUnitPrice(cartItem.product);

    const savedItem = await this.cartItemRepository.save(cartItem);
    await this.updateCartTotal(cartItem.cartId);
    return savedItem;
  }

  async remove(id: number): Promise<void> {
    const cartItem = await this.findOne(id);
    
    // Vérifier que le panier est ouvert
    if (cartItem.cart.status !== CartStatus.OPEN) {
      throw new BadRequestException('Impossible de supprimer un item d\'un panier fermé');
    }

    await this.cartItemRepository.remove(cartItem);
    await this.updateCartTotal(cartItem.cartId);
  }

  async removeByCartId(cartId: number): Promise<void> {
    await this.cartItemRepository.delete({ cartId });
    await this.updateCartTotal(cartId);
  }

  async getCartItemsCount(cartId: number): Promise<number> {
    return this.cartItemRepository.count({ where: { cartId } });
  }

  async getCartItemsTotal(cartId: number): Promise<string> {
    const items = await this.cartItemRepository.find({
      where: { cartId },
    });

    const total = items.reduce((sum, item) => {
      return sum + (parseFloat(item.unitPrice) * item.quantity);
    }, 0);

    return total.toFixed(2);
  }

  private calculateUnitPrice(product: ProductEntity): string {
    let price = parseFloat(product.price);
    
    if (product.isPromoted && product.promotionRate) {
      const promotionRate = parseFloat(product.promotionRate);
      const discountAmount = (price * promotionRate) / 100;
      price = price - discountAmount;
    }
    
    return price.toFixed(2);
  }

  private async updateCartTotal(cartId: number): Promise<void> {
    const total = await this.getCartItemsTotal(cartId);
    await this.cartRepository.update(cartId, { totalPrice: total });
  }

  // Méthode pour vider complètement un panier
  async clearCart(cartId: number): Promise<void> {
    const cart = await this.cartRepository.findOne({
      where: { id: cartId, status: CartStatus.OPEN },
    });
    
    if (!cart) {
      throw new NotFoundException('Panier non trouvé ou fermé');
    }

    await this.cartItemRepository.delete({ cartId });
    await this.cartRepository.update(cartId, { totalPrice: '0.00' });
  }

  // Méthode pour ajuster la quantité d'un item (positive ou négative)
  async adjustQuantity(cartId: number, productId: number, quantityChange: number): Promise<CartItemEntity | null> {
    const cartItem = await this.cartItemRepository.findOne({
      where: { cartId, productId },
      relations: ['cart', 'product'],
    });

    if (!cartItem) {
      throw new NotFoundException('Item non trouvé dans le panier');
    }

    if (cartItem.cart.status !== CartStatus.OPEN) {
      throw new BadRequestException('Impossible de modifier un panier fermé');
    }

    const newQuantity = cartItem.quantity + quantityChange;

    if (newQuantity <= 0) {
      await this.cartItemRepository.remove(cartItem);
      await this.updateCartTotal(cartId);
      return null;
    }

    if (cartItem.product.quantity < newQuantity) {
      throw new BadRequestException('Stock insuffisant');
    }

    cartItem.quantity = newQuantity;
    cartItem.unitPrice = this.calculateUnitPrice(cartItem.product);

    const savedItem = await this.cartItemRepository.save(cartItem);
    await this.updateCartTotal(cartId);
    return savedItem;
  }
}