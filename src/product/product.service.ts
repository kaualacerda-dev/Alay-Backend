import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { v2 as cloudinary } from 'cloudinary';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDto } from './dto/create.dto';

type UploadedImageFile = {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
  size: number;
};

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {
    this.configureCloudinary();
  }

  async create(dto: CreateDto, file?: UploadedImageFile) {
    const productExists = await this.prisma.product.findUnique({
      where: { sku: dto.sku },
    });

    if (productExists) {
      throw new BadRequestException('Produto ja existe!');
    }

    const price = Number(dto.price);
    const stock = Number(dto.stock);

    if (Number.isNaN(price) || Number.isNaN(stock)) {
      throw new BadRequestException('Preco e stock precisam ser numericos.');
    }

    const uploadedImage = file ? await this.uploadImage(file) : null;
    const imageUrl = uploadedImage?.url || dto.imageUrl;

    const product = await this.prisma.product.create({
      data: {
        name: dto.name,
        category: dto.category,
        price,
        stock,
        sku: dto.sku,
        imageUrl,
        description: dto.description,
      },
      select: this.productSelect,
    });

    return { product };
  }

  async uploadImage(file: UploadedImageFile) {
    if (!file.mimetype?.startsWith('image/')) {
      throw new BadRequestException('Apenas arquivos de imagem sao permitidos.');
    }

    if (!process.env.CLOUDINARY_URL) {
      throw new InternalServerErrorException(
        'CLOUDINARY_URL nao configurada no ambiente.',
      );
    }

    try {
      const result = await new Promise<{
        secure_url: string;
        public_id: string;
      }>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: 'products',
            resource_type: 'image',
            use_filename: true,
            unique_filename: true,
          },
          (error, result) => {
            if (error) {
              reject(error);
              return;
            }

            if (!result?.secure_url || !result.public_id) {
              reject(new Error('Cloudinary nao retornou a URL da imagem.'));
              return;
            }

            resolve({
              secure_url: result.secure_url,
              public_id: result.public_id,
            });
          },
        );

        stream.end(file.buffer);
      });

      return {
        url: result.secure_url,
        publicId: result.public_id,
      };
    } catch (error) {
      throw new BadRequestException(
        this.getCloudinaryErrorMessage(error),
      );
    }
  }

  async getProducts(params: {
    page?: number;
    limit?: number;
    sku?: string;
    name?: string;
    orderBy?: 'price' | 'createdAt';
    order?: 'asc' | 'desc';
  }) {
    const {
      page = 1,
      limit = 10,
      sku,
      name,
      orderBy = 'createdAt',
      order = 'desc',
    } = params;

    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      sku,
      name: name
        ? {
            contains: name,
            mode: 'insensitive',
          }
        : undefined,
    };

    const products = await this.prisma.product.findMany({
      skip,
      take: limit,
      where,
      orderBy: {
        [orderBy]: order,
      },
      select: this.productSelect,
    });

    const total = await this.prisma.product.count({
      where,
    });

    return {
      data: products,
      meta: {
        total,
        page,
        limit,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async delete(productId: number) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Produto nao encontrado');
    }

    return this.prisma.product.delete({
      where: {
        id: productId,
      },
    });
  }

  private readonly productSelect = {
    id: true,
    sku: true,
    stock: true,
    price: true,
    description: true,
    imageUrl: true,
    name: true,
    category: true,
    createdAt: true,
  } satisfies Prisma.ProductSelect;

  private configureCloudinary() {
    const cloudinaryUrl = process.env.CLOUDINARY_URL;

    if (!cloudinaryUrl) {
      return;
    }

    let parsedUrl: URL;

    try {
      parsedUrl = new URL(cloudinaryUrl);
    } catch {
      throw new InternalServerErrorException(
        'CLOUDINARY_URL invalida no ambiente.',
      );
    }

    if (
      parsedUrl.protocol !== 'cloudinary:' ||
      !parsedUrl.username ||
      !parsedUrl.password ||
      !parsedUrl.hostname
    ) {
      throw new InternalServerErrorException(
        'CLOUDINARY_URL invalida no ambiente.',
      );
    }

    cloudinary.config({
      cloud_name: parsedUrl.hostname,
      api_key: decodeURIComponent(parsedUrl.username),
      api_secret: decodeURIComponent(parsedUrl.password),
      secure: true,
    });
  }

  private getCloudinaryErrorMessage(error: unknown) {
    if (error instanceof Error && error.message) {
      return error.message;
    }

    if (
      typeof error === 'object' &&
      error !== null &&
      'message' in error &&
      typeof error.message === 'string'
    ) {
      return error.message;
    }

    return 'Falha ao enviar imagem para o Cloudinary.';
  }
}
