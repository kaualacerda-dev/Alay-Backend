import { BadRequestException } from '@nestjs/common';
import { ValidationError } from 'class-validator';

export function createValidationException(errors: ValidationError[]) {
  const message = getValidationMessages(errors).join(' ');

  return new BadRequestException({
    statusCode: 400,
    error: 'Bad Request',
    message,
  });
}

function getValidationMessages(errors: ValidationError[]): string[] {
  return errors.flatMap((error) => {
    const messages = Object.values(error.constraints ?? {});
    const children = getValidationMessages(error.children ?? []);

    return [...messages, ...children];
  });
}
