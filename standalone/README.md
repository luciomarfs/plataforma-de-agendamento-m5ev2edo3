# Plataforma de Agendamento — Pacote Standalone (SaveinCloud)

Pacote monorepo compatível com **Turborepo** contendo o backend **Node.js + Knex + PostgreSQL** (com **Arquitetura Hexagonal**) e **dois frontends React + Vite + TypeScript totalmente independentes**:

1. **`apps/api`**: Backend REST em Node.js/Express + Knex + PostgreSQL.
2. **`apps/web-empresa`**: Frontend para gestão de academias/clínicas, profissionais, grade de horários/slots e contratos.
3. **`apps/web-usuario`**: Frontend para alunos/pacientes realizarem agendamentos, verem vagas disponíveis e histórico.

---

## 🏗️ Arquitetura Hexagonal (Backend)

O backend em `apps/api/src` é estruturado com inversão de dependência:

```
apps/api/src/
├── domain/                         # Núcleo de domínio (Entidades, Regras e Portas)
│   ├── entities.ts                 # Modelos Usuario, Organizacao, Slot, Agendamento, Contrato
│   ├── errors.ts                   # Erros canônicos de domínio (DomainError, NotFoundError, etc.)
│   └── repositories/
│       └── interfaces.ts           # Portas (Interfaces) dos repositórios e UnitOfWork
├── application/                    # Casos de Uso e Portas de Serviços
│   ├── services/
│   │   └── ports.ts                # ITokenService, IHashService, IMailerService
│   └── use-cases/
│       ├── auth.use-case.ts        # Registro, login JWT, esqueci/redefinir/alterar senha
│       ├── agendamento.use-case.ts # Validação transacional de saldo/capacidade e estorno
│       └── empresa.use-case.ts     # CRUD de orgs, slots, profissionais, contratos e dashboard
└── infrastructure/                 # Adapters de Tecnologia (Banco, Web, Cripto)
    ├── database/
    │   ├── connection.ts           # Conexão Knex com pool Postgres
    │   ├── knexfile.ts             # Configuração Knex para migrations e seeds
    │   ├── unit-of-work.ts         # Implementação de transação Knex
    │   ├── migrations/             # DDL das 7 tabelas e índices
    │   ├── seeds/                  # Seed completo de demonstração
    │   └── repositories/           # Implementações Knex das portas de repositório
    │       ├── usuario.repository.ts
    │       ├── acesso.repository.ts
    │       ├── acessoeorganizacao.repository.ts
    │       ├── organizacao.repository.ts
    │       ├── slot.repository.ts
    │       ├── agendamento.repository.ts
    │       └── contrato.repository.ts
    ├── services/
    │   ├── jwt-token.service.ts    # JWT token signing & verification
    │   ├── bcrypt-hash.service.ts  # Bcrypt hash & compare
    │   └── console-mailer.service.ts # Adapter de e-mail (Console/Mock extensível para SMTP)
    ├── http/
    │   ├── middlewares/            # authMiddleware (Bearer JWT) e requireRole
    │   └── controllers/            # Rotas Express REST
    ├── server.ts                   # Montagem e injeção de dependências do Express
    └── index.ts                    # Entrypoint da aplicação
```

---

## ⚙️ Variáveis de Ambiente

No diretório `apps/api`, crie o arquivo `.env` (baseado no `env.example`):

```bash
PORT=3333
NODE_ENV=production
DATABASE_URL=postgresql://postgres:suasenha@localhost:5432/agendamento_db
JWT_SECRET=defina_um_segredo_jwt_longo_e_seguro_aqui_123456
JWT_EXPIRES_IN=7d
CORS_ORIGIN=*
```

Para os frontends (`apps/web-empresa` e `apps/web-usuario`), configure `.env` se a API rodar em domínio/porta diferente:
```bash
VITE_API_URL=http://SEU_IP_OU_DOMINIO:3333/api
```

---

## 🗄️ Banco de Dados: Migrations e Seeds

O schema cria as 7 tabelas com seus índices e chaves estrangeiras:
- `usuario`
- `acesso` (perfis de usuário)
- `organizacao`
- `acessoeorganizacao` (papel do usuário em cada unidade)
- `slot` (grade de horários com quantidade de vagas e quantidade utilizada)
- `agendamento` (status agendado, cancelado, etc.)
- `contrato` (vínculo aluno-organização com saldo_slots e limites por dia/semana/mês)

### Comandos de Migração:
A partir da raiz da pasta `standalone`:
```bash
# Executar as migrations (criação do schema)
npm run migrate

# Desfazer a última migration
npm run migrate:rollback

# Popular dados de teste e demonstração
npm run seed
```

### Contas criadas pelo Seed:
- **Administrador:** `admin@biofit.com.br` | Senha: `12345678`
- **Profissional:** `carlos.fisioterapia@biofit.com.br` | Senha: `12345678`
- **Aluna com contrato ativo:** `mariana.silva@gmail.com` | Senha: `12345678` (Plano com 10 slots e limite de 2 por dia na BioFit)

---

## 🚀 Como Subir na VM Linux (SaveinCloud)

### 1. Pré-requisitos na VM
Instale Node.js 20+ ou 22, Git, PostgreSQL e PM2:
```bash
# Atualizar pacotes
sudo apt update && sudo apt upgrade -y

# Instalar Node.js LTS
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs postgresql postgresql-contrib nginx

# Instalar PM2 globalmente
sudo npm install -g pm2
```

### 2. Configurar o PostgreSQL
```bash
sudo -u postgres psql
```
No prompt do PostgreSQL:
```sql
CREATE DATABASE agendamento_db;
CREATE USER saveincloud_user WITH ENCRYPTED PASSWORD 'sua_senha_segura';
GRANT ALL PRIVILEGES ON DATABASE agendamento_db TO saveincloud_user;
\q
```

### 3. Clonar e Instalar o Monorepo
```bash
cd /var/www/
git clone <url-do-repositorio>
cd <repositorio>/standalone

# Instalar dependências de todos os workspaces
npm install
```

### 4. Rodar Migrations e Seeds
Configure o `.env` em `apps/api/.env` com a sua `DATABASE_URL` e execute:
```bash
npm run migrate
npm run seed
```

### 5. Compilar Todos os Pacotes (Turborepo)
```bash
npm run build
```
Isso compila a API (`apps/api/dist`) e gera os builds otimizados dos frontends em `apps/web-empresa/dist` e `apps/web-usuario/dist`.

---

## 🔄 Gerenciamento dos Processos com PM2

### Subir a API Node.js:
```bash
cd /var/www/<repositorio>/standalone/apps/api
pm2 start dist/index.js --name "agendamento-api"
pm2 save
pm2 startup
```

---

## 🌐 Configuração do Nginx (Servindo Frontends e API)

Exemplo de configuração `/etc/nginx/sites-available/agendamento`:

```nginx
# API Backend
server {
    listen 80;
    server_name api.seudominio.com.br;

    location / {
        proxy_pass http://127.0.0.1:3333;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Frontend Empresa (Gestão)
server {
    listen 80;
    server_name empresa.seudominio.com.br;
    root /var/www/<repositorio>/standalone/apps/web-empresa/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}

# Frontend Usuário (Alunos / Pacientes)
server {
    listen 80;
    server_name app.seudominio.com.br;
    root /var/www/<repositorio>/standalone/apps/web-usuario/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Habilite e reinicie o Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/agendamento /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 🧪 Desenvolvimento Local

Para rodar localmente durante desenvolvimento:

```bash
# Iniciar a API em modo watch
npm run dev:api

# Iniciar o painel da empresa (porta 5174)
npm run dev:empresa

# Iniciar o app do usuário (porta 5173)
npm run dev:usuario
```
