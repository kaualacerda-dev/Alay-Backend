import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { CartService } from './cart.service';
import { CartAuthGuard } from './guards/cart-auth.guard';

type RequestWithUser = {
  user: {
    userId: string;
    email: string;
    role: string;
  };
};

@UseGuards(CartAuthGuard)
@Controller('cart')
export class CartController {
  constructor(private cartService: CartService) {}

  @Get()
  getCart(@Req() req: RequestWithUser) {
    return this.cartService.getCart(req.user.userId);
  }

  @Post('items')
  addItem(@Req() req: RequestWithUser, @Body() dto: AddCartItemDto) {
    return this.cartService.addItem(req.user.userId, dto);
  }
}
