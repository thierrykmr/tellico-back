import { Injectable, NotFoundException, BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartEntity, CartStatus } from '../entities/cart.entity';
import { UserEntity } from '../../user/entities/user.entity';
import { CartItemEntity } from '../../cart_item/entities/cart_item.entity';
import { CreateCartDto } from '../dto/create-cart.dto';
import { UpdateCartDto } from '../dto/update-cart.dto';
import { ProductEntity } from '../../product/entities/product.entity';
import { InvoiceEntity } from '../../invoice/entities/invoice.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartEntity)
    private readonly cartRepository: Repository<CartEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(CartItemEntity)
    private readonly cartItemRepository: Repository<CartItemEntity>,
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
    @InjectRepository(InvoiceEntity)
    private readonly invoiceRepository: Repository<InvoiceEntity>,
  ) {}

  async create(createCartDto: CreateCartDto): Promise<CartEntity> {
    const { userId } = createCartDto;

    // Vérifier que l'utilisateur existe
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException(`Utilisateur avec l'ID ${userId} non trouvé`);
    }

    // Vérifier qu'il n'y a pas déjà un panier ouvert pour cet utilisateur
    const existingOpenCart = await this.cartRepository.findOne({
      where: { userId, status: CartStatus.OPEN },
    });
    if (existingOpenCart) {
      throw new ConflictException('Un panier ouvert existe déjà pour cet utilisateur');
    }

    // Créer le nouveau panier
    const cart = this.cartRepository.create({
      userId,
      totalPrice: '0.00',
      status: CartStatus.OPEN,
    });

    return this.cartRepository.save(cart);
  }

  async findAll(): Promise<CartEntity[]> {
    return this.cartRepository.find({
      relations: ['user', 'items', 'items.product'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByUserId(userId: number, status?: CartStatus): Promise<CartEntity[]> {
    const where: any = { userId };
    if (status) {
      where.status = status;
    }

    return this.cartRepository.find({
      where,
      relations: ['items', 'items.product'],
      order: { createdAt: 'DESC' },
    });
  }

  async findActiveCartByUserId(userId: number): Promise<CartEntity> {
    const cart = await this.cartRepository.findOne({
      where: { userId, status: CartStatus.OPEN },
      relations: ['items', 'items.product'],
    });

    if (!cart) {
      // Créer automatiquement un panier s'il n'en existe pas
      return this.create({ userId, totalPrice: '0.00', status: CartStatus.OPEN });
    }

    return cart;
  }

  async findOne(id: number, userId?: number): Promise<CartEntity> {
    const cart = await this.cartRepository.findOne({
      where: { id },
      relations: ['user', 'items', 'items.product', 'invoice'],
    });

    if (!cart) {
      throw new NotFoundException(`Panier avec l'ID ${id} non trouvé`);
    }

    // Si userId est fourni, vérifier que l'utilisateur est le propriétaire du panier
    if (userId && cart.userId !== userId) {
      throw new ForbiddenException('Vous ne pouvez accéder qu\'à vos propres paniers');
    }

    return cart;
  }

  /*async update(id: number, updateCartDto: UpdateCartDto, userId: number): Promise<CartEntity> {
    const cart = await this.findOne(id);

    // Vérifier que l'utilisateur est le propriétaire du panier
    if (cart.userId !== userId) {
      throw new ForbiddenException('Vous ne pouvez modifier que vos propres paniers');
    }

    // Mettre à jour les propriétés
    if (updateCartDto.totalPrice !== undefined) {
      cart.totalPrice = updateCartDto.totalPrice;
    }
    if (updateCartDto.status !== undefined) {
      cart.status = updateCartDto.status;
    }

    // Si on passe en ORDERED, enregistrer la date
      if (updateCartDto.status === CartStatus.ORDERED) {
        cart.orderedAt = new Date();
      }

    cart.updatedAt = new Date();

    return this.cartRepository.save(cart);
  }*/

  //pas trop pertinent  par rapport à vider juste le panier
  /*async remove(id: number, userId: number): Promise<void> {
    const cart = await this.findOne(id);
    
    // Vérifier que l'utilisateur est le propriétaire du panier
    if (cart.userId !== userId) {
      throw new ForbiddenException('Vous ne pouvez supprimer que vos propres paniers');
    }
    
    // Ne permettre la suppression que si le panier est vide ou annulé
    if (cart.status === CartStatus.ORDERED) {
      throw new BadRequestException('Impossible de supprimer un panier commandé');
    }

    // Supprimer d'abord tous les items du panier
    await this.cartItemRepository.delete({ cartId: id });
    
    // Puis supprimer le panier
    await this.cartRepository.remove(cart);
  }*/

  async orderCart(id: number, userId: number): Promise<CartEntity> {
    const cart = await this.findOne(id);
    
    // Vérifier que l'utilisateur est le propriétaire du panier
    if (cart.userId !== userId) {
      throw new ForbiddenException('Vous ne pouvez commander que vos propres paniers');
    }
    
    if (cart.status !== CartStatus.OPEN) {
      throw new BadRequestException('Seuls les paniers ouverts peuvent être commandés');
    }

    if (!cart.items || cart.items.length === 0) {
      throw new BadRequestException('Impossible de commander un panier vide');
    }

    // Vérifier la disponibilité des stocks pour tous les produits
    for (const item of cart.items) {
      if (item.product.quantity < item.quantity) {
        throw new BadRequestException(
          `Stock insuffisant pour le produit: ${item.product.title}`,
        );
      }
    }


    // Mettre à jour les stocks des produits
    for (const item of cart.items) {
      const newQuantity = item.product.quantity - item.quantity;
       await this.productRepository.update(item.productId, { quantity: newQuantity });
    }

    cart.status = CartStatus.ORDERED;
    cart.updatedAt = new Date();
    return this.cartRepository.save(cart);
  }

  private async createPaidInvoiceFromCart(cartId: number, paymentData: {
    paymentMethod: string;
    paymentReference?: string;
    notes?: string;
  }): Promise<InvoiceEntity> {
    const cart = await this.findOne(cartId);

    // Calculer les statistiques
    const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    const uniqueProducts = cart.items.length;

    // Créer la facture avec statut PAID
    const invoice = this.invoiceRepository.create({
      cartId: cart.id,
      userId: cart.userId,
      totalPrice: cart.totalPrice,
      totalItems,
      uniqueProducts,
      paymentMethod: paymentData.paymentMethod,
      paymentReference: paymentData.paymentReference,
      notes: paymentData.notes,
      status: 'PAID' as any,
      paidAt: new Date(),
    });

    return this.invoiceRepository.save(invoice);
  }

  private async decrementProductStocks(cartId: number): Promise<void> {
    const cart = await this.findOne(cartId);

    for (const item of cart.items) {
      // Utiliser une requête UPDATE directe pour éviter les problèmes de concurrence
      await this.cartRepository.manager.query(
        'UPDATE products SET quantity = quantity - ? WHERE id = ?',
        [item.quantity, item.productId]
      );
    }
  }

  async processPayment(id: number, paymentData: {
    paymentMethod: string;
    paymentReference?: string;
    notes?: string;
  }): Promise<{
    cart: CartEntity;
    invoice: InvoiceEntity;
  }> {
    const cart = await this.findOne(id);

    if (cart.status !== CartStatus.ORDERED) {
      throw new BadRequestException('Seuls les paniers commandés peuvent être payés');
    }

    if (cart.invoice) {
      throw new ConflictException('Ce panier a déjà une facture associée');
    }

    // Créer la facture avec statut PAID directement
    const invoice = await this.createPaidInvoiceFromCart(cart.id, paymentData);

    // Décrémenter les stocks des produits
    await this.decrementProductStocks(cart.id);

    return { cart, invoice };
  }


  async cancelCart(id: number, userId: number): Promise<CartEntity> {
    const cart = await this.findOne(id);
    
    // Vérifier que l'utilisateur est le propriétaire du panier
    if (cart.userId !== userId) {
      throw new ForbiddenException('Vous ne pouvez annuler que vos propres paniers');
    }
    
    if (cart.status === CartStatus.ORDERED) {
      throw new BadRequestException('Impossible d\'annuler un panier déjà commandé');
    }

    cart.status = CartStatus.CANCELLED;
    cart.updatedAt = new Date();
    return this.cartRepository.save(cart);
  }

  async getCartSummary(id: number, userId: number): Promise<{
    cart: CartEntity;
    itemsCount: number;
    uniqueProductsCount: number;
    totalAmount: number;
  }> {
    const cart = await this.findOne(id);
    
    // Vérifier que l'utilisateur est le propriétaire du panier
    if (cart.userId !== userId) {
      throw new ForbiddenException('Vous ne pouvez accéder qu\'au résumé de vos propres paniers');
    }
    
    const itemsCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    const uniqueProductsCount = cart.items.length;
    const totalAmount = parseFloat(cart.totalPrice);

    return {
      cart,
      itemsCount,
      uniqueProductsCount,
      totalAmount,
    };
  }

  async getUserCartHistory(userId: number): Promise<CartEntity[]> {
    return this.cartRepository.find({
      where: { userId },
      relations: ['items', 'items.product'],
      order: { createdAt: 'DESC' },
    });
  }

  async getCartsByStatus(status: CartStatus): Promise<CartEntity[]> {
    return this.cartRepository.find({
      where: { status },
      relations: ['user', 'items', 'items.product'],
      order: { createdAt: 'DESC' },
    });
  }

  async recalculateTotal(id: number, userId: number): Promise<CartEntity> {
    const cart = await this.findOne(id);
    
    // Vérifier que l'utilisateur est le propriétaire du panier
    if (cart.userId !== userId) {
      throw new ForbiddenException('Vous ne pouvez recalculer que vos propres paniers');
    }
    
    const total = cart.items.reduce((sum, item) => {
      return sum + (parseFloat(item.unitPrice) * item.quantity);
    }, 0);

    cart.totalPrice = total.toFixed(2);
    cart.updatedAt = new Date();
    return this.cartRepository.save(cart);
  }

  async duplicateCart(id: number, requestingUserId: number, targetUserId?: number): Promise<CartEntity> {
    const originalCart = await this.findOne(id);
    
    // Vérifier que l'utilisateur demandant est le propriétaire du panier original
    if (originalCart.userId !== requestingUserId) {
      throw new ForbiddenException('Vous ne pouvez dupliquer que vos propres paniers');
    }
    
    const finalTargetUserId = targetUserId || originalCart.userId;
    
    // Vérifier qu'il n'y a pas déjà un panier ouvert pour cet utilisateur
    const existingOpenCart = await this.cartRepository.findOne({
      where: { userId: finalTargetUserId, status: CartStatus.OPEN },
    });
    
    if (existingOpenCart) {
      throw new ConflictException('Un panier ouvert existe déjà pour cet utilisateur');
    }

    // Créer un nouveau panier
    const newCart = await this.create({
      userId: finalTargetUserId,
      totalPrice: '0.00',
      status: CartStatus.OPEN,
    });

    // Dupliquer tous les items
    for (const item of originalCart.items) {
      const newItem = this.cartItemRepository.create({
        cartId: newCart.id,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      });
      await this.cartItemRepository.save(newItem);
    }

    // Recalculer le total du nouveau panier
    return this.recalculateTotal(newCart.id, finalTargetUserId);
  }

  async clearCart(id: number, userId: number): Promise<CartEntity> {
    const cart = await this.findOne(id);
    
    // Vérifier que l'utilisateur est le propriétaire du panier
    if (cart.userId !== userId) {
      throw new ForbiddenException('Vous ne pouvez vider que vos propres paniers');
    }
    
    if (cart.status !== CartStatus.OPEN) {
      throw new BadRequestException('Impossible de vider un panier fermé');
    }

    // Supprimer tous les items du panier
    const deleteResult = await this.cartItemRepository.delete({ cart: { id } });
    console.log(`${deleteResult.affected} items supprimés du panier ID ${id}`);

    // Recharger le panier pour obtenir l'état mis à jour
    const updatedCart = await this.findOne(id);
    
    // Remettre le total à zéro
    updatedCart.totalPrice = '0.00';
    updatedCart.updatedAt = new Date();
    return this.cartRepository.save(updatedCart);
  }

  
  // Méthodes de statistiques
  async getCartStats(): Promise<{
    total: number;
    open: number;
    ordered: number;
    cancelled: number;
  }> {
    const [total, open, ordered, cancelled] = await Promise.all([
      this.cartRepository.count(),
      this.cartRepository.count({ where: { status: CartStatus.OPEN } }),
      this.cartRepository.count({ where: { status: CartStatus.ORDERED } }),
      this.cartRepository.count({ where: { status: CartStatus.CANCELLED } }),
    ]);

    return { total, open, ordered, cancelled };
  }

  async getAbandonedCarts(daysOld: number = 7): Promise<CartEntity[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    return this.cartRepository
      .createQueryBuilder('cart')
      .leftJoinAndSelect('cart.items', 'items')
      .leftJoinAndSelect('cart.user', 'user')
      .where('cart.status = :status', { status: CartStatus.OPEN })
      .andWhere('cart.updatedAt < :cutoffDate', { cutoffDate })
      .andWhere('items.id IS NOT NULL') // Panier non vide
      .getMany();
  }

  /**
   * Obtenir les statistiques des paniers d'un utilisateur
   */
  async getUserCartStats(userId: number): Promise<{
    total: number;
    open: number;
    ordered: number;
    cancelled: number;
  }> {
    const [total, open, ordered, cancelled] = await Promise.all([
      this.cartRepository.count({ where: { userId } }),
      this.cartRepository.count({ where: { userId, status: CartStatus.OPEN } }),
      this.cartRepository.count({ where: { userId, status: CartStatus.ORDERED } }),
      this.cartRepository.count({ where: { userId, status: CartStatus.CANCELLED } }),
    ]);

    return { total, open, ordered, cancelled };
  }

  /**
   * Vérifier que l'utilisateur est propriétaire du panier
   */
  private async verifyCartOwnership(cartId: number, userId: number): Promise<CartEntity> {
    const cart = await this.findOne(cartId);
    
    if (cart.userId !== userId) {
      throw new ForbiddenException('Vous ne pouvez accéder qu\'à vos propres paniers');
    }
    
    return cart;
  }
}