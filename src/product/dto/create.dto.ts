import {
  IsEnum,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ProductCategory } from '@prisma/client';

export class CreateDto {
  @IsString({ message: 'Nome deve ser um texto.' })
  @IsNotEmpty({ message: 'Nome e obrigatorio.' })
  @MinLength(4, { message: 'Nome deve ter pelo menos 4 caracteres.' })
  @MaxLength(38, { message: 'Nome deve ter no maximo 38 caracteres.' })
  name!: string;

  @IsString({ message: 'Descricao deve ser um texto.' })
  @IsOptional()
  @MinLength(10, { message: 'Descricao deve ter pelo menos 10 caracteres.' })
  @MaxLength(100, { message: 'Descricao deve ter no maximo 100 caracteres.' })
  description?: string;

  @IsString({ message: 'URL da imagem deve ser um texto.' })
  @IsOptional()
  imageUrl?: string;

  @IsString({ message: 'SKU deve ser um texto.' })
  @IsNotEmpty({ message: 'SKU e obrigatorio.' })
  @MinLength(6, { message: 'SKU deve ter pelo menos 6 caracteres.' })
  @MaxLength(10, { message: 'SKU deve ter no maximo 10 caracteres.' })
  sku!: string;

  @IsNumberString({}, { message: 'Preco deve ser numerico.' })
  @IsNotEmpty({ message: 'Preco e obrigatorio.' })
  price!: string;

  @IsNumberString({}, { message: 'Estoque deve ser numerico.' })
  @IsNotEmpty({ message: 'Estoque e obrigatorio.' })
  stock!: string;

  @IsNotEmpty({ message: 'Categoria e obrigatoria.' })
  @IsEnum(ProductCategory, {
    message: 'Categoria deve ser Camisetas, Bermudas, Calcas ou Moletons.',
  })
  category!: ProductCategory;
}
