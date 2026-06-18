import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async getCart(userId: string) {
    return this.findCartWithItems(userId);
  }

  async addItem(userId: string, dto: AddCartItemDto) {
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
      select: {
        id: true,
        stock: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Produto nao encontrado.');
    }

    if (dto.quantity > product.stock) {
      throw new BadRequestException('Quantidade maior que o estoque.');
    }

    const cart = await this.getOrCreateCart(userId);
    const existingItem = await this.prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId: product.id,
        },
      },
    });

    if (existingItem) {
      const newQuantity = existingItem.quantity + dto.quantity;

      if (newQuantity > product.stock) {
        throw new BadRequestException('Quantidade maior que o estoque.');
      }

      await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      });
    } else {
      await this.prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: product.id,
          quantity: dto.quantity,
        },
      });
    }

    return this.findCartWithItems(userId);
  }

  private async getOrCreateCart(userId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
    });

    if (cart) {
      return cart;
    }

    return this.prisma.cart.create({
      data: { userId },
    });
  }

  private async findCartWithItems(userId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: this.cartInclude,
    });

    if (cart) {
      return cart;
    }

    return this.prisma.cart.create({
      data: { userId },
      include: this.cartInclude,
    });
  }

  private readonly cartInclude = {
    items: {
      include: {
        product: true,
      },
    },
  } satisfies Prisma.CartInclude;
}
