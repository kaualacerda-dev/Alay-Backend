import { BadRequestException } from '@nestjs/common';
import { createValidationException } from './validation-exception.factory';

describe('createValidationException', () => {
  it('formats validation messages as a readable sentence', () => {
    const exception = createValidationException([
      {
        property: 'name',
        constraints: {
          minLength: 'Nome deve ter pelo menos 4 caracteres.',
          isNotEmpty: 'Nome e obrigatorio.',
        },
      },
      {
        property: 'description',
        constraints: {
          minLength: 'Descricao deve ter pelo menos 10 caracteres.',
        },
      },
    ]);

    expect(exception).toBeInstanceOf(BadRequestException);
    expect(exception.getResponse()).toEqual({
      statusCode: 400,
      error: 'Bad Request',
      message:
        'Nome deve ter pelo menos 4 caracteres. Nome e obrigatorio. Descricao deve ter pelo menos 10 caracteres.',
    });
  });
});
