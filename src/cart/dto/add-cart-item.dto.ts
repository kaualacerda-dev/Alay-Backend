import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class AddCartItemDto {
  @IsInt()
  @IsNotEmpty()
  productId!: number;

  @IsInt()
  @IsNotEmpty()
  @Min(1)
  quantity!: number;
}
