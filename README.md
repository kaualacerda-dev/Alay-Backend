# ALAY BACKEND

Backend do projeto Alay, um sistema de loja com cadastro de usuarios, autenticação, produtos, estoque e carrinho.

O projeto faz parte de uma aplicacao completa com dois frontends:

- Admin em Angular, usado para cadastro de produtos e controle de estoque: https://github.com/kaualacerda-dev/Alay-Admin
- Ecommerce em Next.js, usado como loja para o cliente final: https://github.com/kaualacerda-dev/Alay-front

## Tecnologias

- Node.js
- NestJS
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT para autenticacao
- Cloudinary para upload de imagens

## Funcionalidades basicas

- Cadastro e login de usuarios
- Controle de permissoes por role (`CUSTOMER` e `ADMIN`)
- Cadastro, listagem, busca e remoção de produtos
- Upload de imagem de produto
- Carrinho de compras para usuários logados

## Variaveis de ambiente

Crie um arquivo `.env` na raiz do projeto com as variaveis abaixo:

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/nome_do_banco"
JWT_SECRET="sua_chave_secreta"
CLOUDINARY_URL="cloudinary://api_key:api_secret@cloud_name"
PORT=3001
```

Observacoes:

- `DATABASE_URL` e obrigatoria para o Prisma conectar no PostgreSQL.
- `JWT_SECRET` e usado para gerar e validar tokens de login.
- `CLOUDINARY_URL` e necessaria para cadastrar produtos com upload de imagem.
- `PORT` e opcional. Se nao for definida, a API roda na porta `3001`.

## Como rodar o projeto

Instale as dependencias:

```bash
npm install
```

Gere o Prisma Client:

```bash
npx prisma generate
```

Rode as migrations no banco:

```bash
npx prisma migrate dev
```

Inicie o servidor em modo desenvolvimento:

```bash
npm run start:dev
```

A API ficara disponivel em:

```txt
http://localhost:3001
```

## Rotas principais

```txt
POST /auth/register
POST /auth/login

GET /product
POST /product/create
DELETE /product/:id

GET /cart
POST /cart/items

GET /users/me
```

## Comandos uteis

Rodar os testes:

```bash
npm run test
```

Gerar build de produção:

```bash
npm run build
```

Rodar a versão compilada:

```bash
npm run start:prod
```

Formatar arquivos:

```bash
npm run format
```
