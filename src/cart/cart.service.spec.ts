import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CartService } from './cart.service';

const cartInclude = {
  items: {
    include: {
      product: true,
    },
  },
};

describe('CartService', () => {
  let service: CartService;

  const prisma = {
    product: {
      findUnique: jest.fn(),
    },
    cart: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    cartItem: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new CartService(prisma as never);
  });

  it('creates a cart and adds the product when the user does not have a cart yet', async () => {
    prisma.product.findUnique.mockResolvedValue({ id: 10, stock: 5 });
    prisma.cart.findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        id: 1,
        userId: 'user-1',
        items: [{ id: 1, productId: 10, quantity: 2 }],
      });
    prisma.cart.create.mockResolvedValue({ id: 1, userId: 'user-1' });
    prisma.cartItem.findUnique.mockResolvedValue(null);
    prisma.cartItem.create.mockResolvedValue({ id: 1 });

    const result = await service.addItem('user-1', {
      productId: 10,
      quantity: 2,
    });

    expect(prisma.cart.create).toHaveBeenCalledWith({
      data: { userId: 'user-1' },
    });
    expect(prisma.cartItem.create).toHaveBeenCalledWith({
      data: {
        cartId: 1,
        productId: 10,
        quantity: 2,
      },
    });
    expect(prisma.cart.findUnique).toHaveBeenLastCalledWith({
      where: { userId: 'user-1' },
      include: cartInclude,
    });
    expect(result).toEqual({
      id: 1,
      userId: 'user-1',
      items: [{ id: 1, productId: 10, quantity: 2 }],
    });
  });

  it('increases quantity when the product is already in the cart', async () => {
    prisma.product.findUnique.mockResolvedValue({ id: 10, stock: 5 });
    prisma.cart.findUnique
      .mockResolvedValueOnce({ id: 1, userId: 'user-1' })
      .mockResolvedValueOnce({
        id: 1,
        userId: 'user-1',
        items: [{ id: 1, productId: 10, quantity: 5 }],
      });
    prisma.cartItem.findUnique.mockResolvedValue({
      id: 1,
      cartId: 1,
      productId: 10,
      quantity: 3,
    });
    prisma.cartItem.update.mockResolvedValue({ id: 1, quantity: 5 });

    await service.addItem('user-1', {
      productId: 10,
      quantity: 2,
    });

    expect(prisma.cartItem.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { quantity: 5 },
    });
    expect(prisma.cartItem.create).not.toHaveBeenCalled();
  });

  it('rejects products that do not exist', async () => {
    prisma.product.findUnique.mockResolvedValue(null);

    await expect(
      service.addItem('user-1', {
        productId: 999,
        quantity: 1,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('rejects quantities greater than product stock', async () => {
    prisma.product.findUnique.mockResolvedValue({ id: 10, stock: 1 });

    await expect(
      service.addItem('user-1', {
        productId: 10,
        quantity: 2,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
