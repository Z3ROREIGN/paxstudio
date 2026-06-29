# 🚀 Guia de Configuração - PaxStudio

## Configuração Inicial Rápida

### 1. Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
# Database
DATABASE_URL=mysql://root:password@localhost:3306/paxstudio

# JWT
JWT_SECRET=seu-secret-jwt-super-seguro-aqui

# MisticPay (Pagamentos)
MISTICKPAY_API_KEY=sk_test_sua_chave_aqui
MISTICKPAY_WEBHOOK_SECRET=whsec_sua_secret_aqui
MISTICKPAY_MERCHANT_ID=seu_merchant_id

# AWS S3 (Armazenamento)
AWS_ACCESS_KEY_ID=sua_chave_acesso_aws
AWS_SECRET_ACCESS_KEY=seu_secret_aws
AWS_REGION=us-east-1
S3_BUCKET_NAME=paxstudio-uploads

# URLs
APP_URL=http://localhost:3000
VITE_API_URL=http://localhost:3000
```

### 2. Banco de Dados

```bash
# Criar banco de dados
mysql -u root -p -e "CREATE DATABASE paxstudio CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Executar migrations
pnpm db:push
```

### 3. Conta de Suporte Pré-criada

A conta de suporte é criada automaticamente na primeira inicialização:

- **Email**: willianwca2011@gmail.com
- **Senha**: willian72011
- **Role**: admin

### 4. Iniciar Desenvolvimento

```bash
# Instalar dependências
pnpm install

# Iniciar servidor
pnpm dev

# Abrir no navegador
# http://localhost:3000
```

## 🔧 Configuração Avançada

### MisticPay Integration

1. Criar conta em https://mistickpay.com
2. Gerar API keys no dashboard
3. Configurar webhook URL: `https://seu-dominio.com/api/webhooks/mistickpay`
4. Adicionar chaves ao `.env.local`

### Amazon S3

1. Criar bucket S3 no AWS Console
2. Gerar access keys
3. Configurar CORS:
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST"],
    "AllowedOrigins": ["http://localhost:3000", "https://seu-dominio.com"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```
4. Adicionar credenciais ao `.env.local`

### WebSocket (Chat em Tempo Real)

Para habilitar chat em tempo real com WebSocket:

1. Instalar dependências:
```bash
pnpm add socket.io socket.io-client
```

2. Configurar WebSocket no servidor (`server/_core/index.ts`):
```typescript
import { Server } from "socket.io";

const io = new Server(server, {
  cors: {
    origin: process.env.APP_URL,
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  // Implementar handlers de chat
});
```

3. Conectar no cliente (`client/src/pages/Chat.tsx`):
```typescript
import { io } from "socket.io-client";

const socket = io(process.env.VITE_API_URL);
```

## 📊 Estrutura do Banco de Dados

### Tabela: users
```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  passwordHash VARCHAR(255),
  role ENUM('user', 'admin') DEFAULT 'user',
  isBanned BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Tabela: tickets
```sql
CREATE TABLE tickets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  fileName VARCHAR(255),
  fileSize BIGINT,
  filePath VARCHAR(512),
  status ENUM('pending', 'in_progress', 'completed') DEFAULT 'pending',
  paymentStatus ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
  amount DECIMAL(10, 2),
  paymentId VARCHAR(255),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id)
);
```

### Tabela: messages
```sql
CREATE TABLE messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ticketId INT NOT NULL,
  userId INT NOT NULL,
  message TEXT,
  type ENUM('text', 'image', 'file') DEFAULT 'text',
  filePath VARCHAR(512),
  fileName VARCHAR(255),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ticketId) REFERENCES tickets(id),
  FOREIGN KEY (userId) REFERENCES users(id)
);
```

## 🧪 Testes

### Executar todos os testes
```bash
pnpm test
```

### Testes específicos
```bash
# Testes de autenticação
pnpm test auth

# Testes de upload
pnpm test upload

# Testes de pagamento
pnpm test payment
```

### Cobertura de testes
```bash
pnpm test:coverage
```

## 🐛 Debugging

### Habilitar logs detalhados
```env
DEBUG=paxstudio:*
LOG_LEVEL=debug
```

### Inspecionar requisições HTTP
```bash
# No navegador, abrir DevTools (F12)
# Network tab para ver requisições
# Console para ver logs
```

### Verificar banco de dados
```bash
# Conectar ao MySQL
mysql -u root -p paxstudio

# Ver tabelas
SHOW TABLES;

# Ver usuários
SELECT * FROM users;

# Ver tickets
SELECT * FROM tickets;
```

## 📱 Testes em Dispositivos Reais

### Acessar de outro computador
```bash
# Descobrir IP local
ifconfig | grep "inet "

# Acessar via: http://seu-ip:3000
```

### Testar em mobile
```bash
# Usar ngrok para expor localhost
ngrok http 3000

# Acessar via URL fornecida pelo ngrok
```

## 🚀 Deploy

### Vercel
```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Railway
```bash
# Instalar Railway CLI
npm i -g @railway/cli

# Deploy
railway up
```

### Heroku
```bash
# Instalar Heroku CLI
npm i -g heroku

# Login
heroku login

# Deploy
git push heroku main
```

## 📞 Suporte e Troubleshooting

### Erro: "Cannot find module 'bcryptjs'"
```bash
pnpm add bcryptjs
pnpm restart
```

### Erro: "Database connection failed"
```bash
# Verificar credenciais
echo $DATABASE_URL

# Verificar se MySQL está rodando
mysql -u root -p -e "SELECT 1;"
```

### Erro: "CORS error"
```env
# Adicionar ao .env.local
VITE_API_URL=http://localhost:3000
```

### Chat não funciona
- Verificar se WebSocket está habilitado
- Verificar console do navegador (F12)
- Verificar logs do servidor

## ✅ Checklist de Configuração

- [ ] Variáveis de ambiente configuradas
- [ ] Banco de dados criado e migrations executadas
- [ ] Conta de suporte verificada (login com willianwca2011@gmail.com)
- [ ] MisticPay API keys configuradas
- [ ] AWS S3 bucket criado e configurado
- [ ] Servidor iniciado sem erros
- [ ] Página home acessível (http://localhost:3000)
- [ ] Login/Registro funcionando
- [ ] Upload de arquivo funcionando
- [ ] Painel admin acessível (/admin)

---

Para mais informações, veja [README.md](./README.md)
