import { GUARDS_METADATA } from '@nestjs/common/constants';
import { UserRole } from '@prisma/client';
import { ROLES_KEY } from '../auth/decorators/roles.decorator';
import { ProductController } from './product.controller';

describe('ProductController authorization', () => {
  it('keeps product listing public', () => {
    const getProducts = ProductController.prototype.getProducts;

    expect(Reflect.getMetadata(GUARDS_METADATA, getProducts)).toBeUndefined();
    expect(Reflect.getMetadata(ROLES_KEY, getProducts)).toBeUndefined();
  });

  it('keeps product creation restricted to admin users', () => {
    const create = ProductController.prototype.create;

    expect(Reflect.getMetadata(GUARDS_METADATA, create)).toBeDefined();
    expect(Reflect.getMetadata(ROLES_KEY, create)).toEqual([UserRole.ADMIN]);
  });
});
