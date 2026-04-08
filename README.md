# Encurtador Privado

Aplicação de encurtamento de URLs para uso interno, com painel administrativo, login, tracking de cliques e backup semanal.

## Stack

- Next.js + TypeScript
- PostgreSQL (Neon)
- Prisma ORM
- NextAuth (credenciais)
- Deploy recomendado: Vercel

## Funcionalidades

- Slug automático com 6 caracteres
- Slug personalizável a qualquer momento
- Edição de URL de destino
- Histórico de mudança de destino (data + usuário + antigo/novo)
- Métricas de cliques (total, 7 dias, país, navegador)
- Redirecionamento por slug
- Slug inexistente cai na página inicial
- Backup semanal automático via GitHub Actions

## Configuração local

1. Instale dependências:

```bash
npm install
```

2. Configure o arquivo `.env` com seus dados reais (Neon e credenciais admin):

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DBNAME?sslmode=require"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="um-segredo-forte"
ADMIN_EMAIL="seu-email@empresa.com"
ADMIN_PASSWORD="sua-senha-forte"
```

3. Gere o client Prisma e rode migração:

```bash
npm run db:generate
npm run db:migrate -- --name init
```

4. Crie/atualize o usuário admin:

```bash
npm run admin:create
```

5. Rode o projeto:

```bash
npm run dev
```

## Rotas principais

- `/` página inicial
- `/login` login
- `/admin` dashboard
- `/:slug` redirecionamento

## Deploy na Vercel

1. Conecte o repositório no Vercel.
2. Defina as variáveis de ambiente (`DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`).
3. Rode migrações em ambiente de produção (`prisma migrate deploy`) no pipeline ou manualmente.

## Backup semanal

Workflow criado em `.github/workflows/weekly-backup.yml`:

- agenda: domingo, 03:00 (America/Sao_Paulo)
- usa `pg_dump`
- salva artefato com retenção de 56 dias

Você precisa configurar o secret `DATABASE_URL` no GitHub Actions.
