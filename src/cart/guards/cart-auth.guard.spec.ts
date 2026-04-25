import { UnauthorizedException } from '@nestjs/common';
import { CartAuthGuard } from './cart-auth.guard';

describe('CartAuthGuard', () => {
  let guard: CartAuthGuard;

  beforeEach(() => {
    guard = new CartAuthGuard();
  });

  it('shows a clear message when the user is not authenticated', () => {
    expect(() => guard.handleRequest(null, null)).toThrow(
      new UnauthorizedException(
        'Voce precisa estar logado para poder adicionar itens no carrinho.',
      ),
    );
  });

  it('keeps the authenticated user available to the controller', () => {
    const user = {
      userId: 'user-1',
      email: 'user@email.com',
      role: 'CUSTOMER',
    };

    expect(guard.handleRequest(null, user)).toBe(user);
  });
});
