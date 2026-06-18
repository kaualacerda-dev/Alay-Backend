import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class CartAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = unknown>(
    error: unknown,
    user: TUser | false | null,
  ): TUser {
    if (error || !user) {
      throw new UnauthorizedException(
        'Voce precisa estar logado para poder adicionar itens no carrinho.',
      );
    }

    return user;
  }
}
