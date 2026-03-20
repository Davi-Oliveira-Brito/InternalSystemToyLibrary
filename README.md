# Sistema Interno Ludoteca

Sistema web interno para controle de empréstimos de jogos nas ludotecas do Colégio Porto Seguro. Cada unidade escolar possui seu próprio acervo, e os estagiários registram empréstimos e devoluções durante os intervalos.

## Unidades atendidas

- Morumbi
- Valinhos
- Panamby
- Vila Andrade

## Stack

- **Framework:** Next.js 16 (App Router)
- **Linguagem:** TypeScript
- **Estilização:** SCSS Modules
- **Banco de dados:** Supabase (PostgreSQL)
- **Armazenamento de arquivos:** Supabase Storage
- **Autenticação:** JWT com cookies httpOnly
- **Deploy:** Vercel

## Estrutura do banco de dados

```
unidades       — cadastro das unidades escolares
admins         — administradores do sistema (acesso global)
users          — estagiários (acesso por unidade)
games          — jogos cadastrados por unidade
loans          — registro de empréstimos e devoluções
```

Buckets no Supabase Storage:
- `games` — imagens dos jogos
- `avatars` — fotos de perfil de usuários e admins

## Variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto com base no `.env.example`:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
JWT_SECRET=
```

- `NEXT_PUBLIC_SUPABASE_URL` — URL do projeto Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — chave pública do Supabase (exposta no browser, intencional)
- `SUPABASE_SERVICE_ROLE_KEY` — chave privada do Supabase, usada apenas no servidor
- `JWT_SECRET` — string aleatória para assinar os tokens JWT

Para gerar o `JWT_SECRET`:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Instalação

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev

# Build de produção
npm run build
```

## Configuração do banco de dados

Execute o arquivo `schema.sql` no SQL Editor do Supabase para criar as tabelas, buckets e dados iniciais.

Após executar o schema, atualize as senhas dos usuários iniciais com hash bcrypt. Gere os hashes no terminal:

```bash
node -e "const b = require('bcryptjs'); b.hash('sua_senha', 10).then(h => console.log(h))"
```

E atualize no banco:

```sql
update admins set password = 'hash_gerado' where email = 'email_do_admin';
update users set password = 'hash_gerado' where email = 'email_do_usuario';
```

## Políticas de Storage

Execute no SQL Editor do Supabase para liberar acesso aos buckets:

```sql
create policy "Public upload games" on storage.objects for insert to anon with check (bucket_id = 'games');
create policy "Public read games" on storage.objects for select to anon using (bucket_id = 'games');
create policy "Public delete games" on storage.objects for delete to anon using (bucket_id = 'games');

create policy "Public upload avatars" on storage.objects for insert to anon with check (bucket_id = 'avatars');
create policy "Public read avatars" on storage.objects for select to anon using (bucket_id = 'avatars');
create policy "Public delete avatars" on storage.objects for delete to anon using (bucket_id = 'avatars');
```

## Perfis de acesso

**Administrador**
- Acessa o painel em `/admin`
- Gerencia estagiários de todas as unidades
- Visualiza análises de qualquer unidade
- Não está vinculado a uma unidade específica

**Estagiário**
- Acessa o sistema em `/home`
- Visualiza e gerencia apenas os jogos da sua unidade
- Registra empréstimos e devoluções
- Acessa análises da própria unidade

## Funcionalidades

**Gerenciar Jogos (`/jogos`)**
Cadastro, edição e exclusão de jogos. Suporte a upload de imagem via Supabase Storage ou URL externa. Filtro por categoria e busca por nome. Categorias disponíveis: Cartas, Tabuleiro, RPG, Cooperativo, Estratégia.

**Modo Trabalho (`/trabalho`)**
Interface para registrar empréstimos durante o intervalo. O estagiário seleciona o jogo, informa nome, RA e turma do aluno. Devolução individual por aluno via modal com lista de empréstimos ativos.

**Resumo da Semana (`/analises`)**
Estatísticas semanais incluindo total de empréstimos, devoluções, jogos mais utilizados, alunos e turmas mais ativas, horário de pico e jogos sem uso na semana.

**Perfil (`/perfil`)**
Edição de nome, senha e foto de perfil com compressão e crop automático antes do upload.

## Autenticação

O sistema utiliza JWT armazenado em cookie `httpOnly`, que não é acessível via JavaScript no browser. O middleware do Next.js (`src/middleware.ts`) intercepta todas as requisições e valida o token antes de permitir acesso às páginas protegidas. Rotas `/admin` são bloqueadas para usuários com role diferente de `admin`.

O token expira em 24 horas. Após expiração, o usuário é redirecionado para `/login` automaticamente.

## Estrutura de pastas

```
src/
├── app/
│   ├── splash/
│   ├── login/
│   ├── home/
│   ├── jogos/
│   ├── trabalho/
│   ├── analises/
│   ├── perfil/
│   ├── admin/
│   │   ├── page.tsx
│   │   ├── usuarios/
│   │   ├── analises/
│   │   └── perfil/
│   └── api/
│       ├── auth/
│       ├── games/
│       ├── loans/
│       ├── analises/
│       ├── perfil/
│       └── admin/
├── components/
├── hooks/
├── lib/
│   ├── supabase.ts
│   ├── jwt.ts
│   └── imageUtils.ts
└── types/
    └── index.ts
```

## Deploy

O projeto está configurado para deploy automático na Vercel a partir da branch `main`. Certifique-se de adicionar todas as variáveis de ambiente no painel da Vercel antes do primeiro deploy.