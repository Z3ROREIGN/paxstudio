# PaxStudio - Professional Code Support Service

Uma plataforma web profissional para suporte técnico a código com sistema de pagamento integrado, chat em tempo real e painel administrativo completo.

## 🎯 Características Principais

### Para Clientes
- **Autenticação Segura**: Sistema de login/registro com email e senha
- **Upload de Arquivos**: Envio de arquivos .ZIP para análise
- **Cálculo Automático**: Preço calculado automaticamente (R$ 1,00/MB ou R$ 3,50 fixo para KB)
- **Pagamento Seguro**: Integração com MisticPay para processamento de pagamentos
- **Chat em Tempo Real**: Comunicação direta com o suporte
- **Compartilhamento de Arquivos**: Envio de imagens e arquivos .ZIP corrigidos

### Para Suporte (Admin)
- **Painel Administrativo**: Interface completa para gerenciamento
- **Gerenciamento de Tickets**: Visualizar, atualizar status e resolver tickets
- **Histórico de Chat**: Acompanhar toda a comunicação com clientes
- **Gerenciamento de Usuários**: Listar clientes e aplicar banimentos
- **Confirmação de Entrega**: Confirmar envio do código corrigido
- **Análise de Pagamentos**: Visualizar histórico e status de pagamentos

## 🏗️ Arquitetura Técnica

### Stack Tecnológico
- **Frontend**: React 19 + TypeScript + Tailwind CSS 4
- **Backend**: Express.js + tRPC + Node.js
- **Banco de Dados**: MySQL/TiDB
- **Autenticação**: JWT + Cookies
- **Pagamentos**: MisticPay API
- **Armazenamento**: Amazon S3 (preparado)
- **Comunicação**: WebSocket (preparado para tempo real)

### Estrutura de Pastas
```
paxstudio-app/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── pages/         # Páginas (Home, Auth, Dashboard, etc)
│   │   ├── components/    # Componentes reutilizáveis
│   │   ├── contexts/      # React Contexts
│   │   ├── hooks/         # Custom Hooks
│   │   └── lib/           # Utilitários e tRPC client
│   └── public/            # Arquivos estáticos
├── server/                # Backend Node.js
│   ├── _core/            # Core do servidor (OAuth, upload, webhooks)
│   ├── db.ts             # Funções de banco de dados
│   ├── routers.ts        # Procedimentos tRPC
│   ├── mistickpay.ts     # Integração MisticPay
│   └── init-data.ts      # Inicialização de dados
├── drizzle/              # Schema e migrations do banco
└── shared/               # Código compartilhado
```

## 🚀 Como Começar

### Pré-requisitos
- Node.js 22+
- pnpm 10+
- MySQL/TiDB

### Instalação

1. **Clonar o repositório**
```bash
git clone https://github.com/seu-usuario/paxstudio.git
cd paxstudio-app
```

2. **Instalar dependências**
```bash
pnpm install
```

3. **Configurar variáveis de ambiente**
```bash
# Criar arquivo .env.local
cp .env.example .env.local

# Configurar:
DATABASE_URL=mysql://user:password@localhost/paxstudio
JWT_SECRET=seu-secret-jwt
MISTICKPAY_API_KEY=sua-chave-mistickpay
AWS_ACCESS_KEY_ID=sua-chave-aws
AWS_SECRET_ACCESS_KEY=seu-secret-aws
S3_BUCKET_NAME=seu-bucket
```

4. **Executar migrations do banco**
```bash
pnpm db:push
```

5. **Iniciar o servidor de desenvolvimento**
```bash
pnpm dev
```

O servidor estará disponível em `http://localhost:3000`

## 📝 Contas Pré-cadastradas

### Conta de Suporte (Admin)
- **Email**: willianwca2011@gmail.com
- **Senha**: willian72011
- **Acesso**: Painel administrativo completo

## 🔐 Autenticação

O sistema usa JWT com cookies seguros:
- Tokens JWT armazenados em cookies HTTP-only
- Renovação automática de sessão
- Logout seguro com limpeza de cookies
- Proteção contra CSRF

## 💳 Sistema de Pagamento

### Cálculo de Cobrança
- **Arquivos < 1 MB**: R$ 3,50 (taxa fixa)
- **Arquivos ≥ 1 MB**: R$ 1,00 por MB (arredondado para cima)

### Fluxo de Pagamento
1. Cliente faz upload do arquivo .ZIP
2. Sistema calcula o valor automaticamente
3. Cliente é redirecionado para pagamento via MisticPay
4. Após confirmação, chat é liberado
5. Suporte pode enviar código corrigido
6. Cliente confirma recebimento

## 💬 Chat em Tempo Real

### Funcionalidades
- Mensagens de texto em tempo real
- Envio de imagens (JPG, PNG, GIF)
- Compartilhamento de arquivos .ZIP
- Histórico persistente de conversas
- Notificações de novas mensagens

### Arquitetura
- WebSocket para comunicação em tempo real
- Fallback para polling se WebSocket não disponível
- Armazenamento de mensagens em banco de dados
- Sincronização automática entre cliente e suporte

## 🛠️ Painel Administrativo

### Funcionalidades
- **Gerenciamento de Tickets**: Listar, filtrar, atualizar status
- **Visualização de Chat**: Acompanhar conversas com clientes
- **Confirmação de Entrega**: Marcar código como entregue
- **Gerenciamento de Usuários**: Ban/unban de usuários
- **Análise de Pagamentos**: Histórico e status de transações
- **Busca e Filtros**: Buscar por cliente, email, status, data

### Acesso
- Apenas usuários com role `admin` podem acessar
- URL: `/admin`
- Requer autenticação

## 🧪 Testes

### Executar testes
```bash
pnpm test
```

### Cobertura de testes
- Autenticação (login, registro, logout)
- Cálculo de cobrança
- Upload de arquivos
- Integração com MisticPay
- Gerenciamento de tickets

## 📦 Build e Deploy

### Build para produção
```bash
pnpm build
```

### Iniciar servidor de produção
```bash
pnpm start
```

### Deploy
O projeto está pronto para deploy em:
- Vercel
- Netlify
- Railway
- Heroku
- Cloud Run

## 🔗 Integrações Externas

### MisticPay
- Processamento de pagamentos
- Webhooks para confirmação
- Documentação: https://docs.mistickpay.com

### Amazon S3
- Armazenamento de arquivos .ZIP
- Armazenamento de imagens do chat
- Configuração via variáveis de ambiente

## 📚 Documentação de API

### Autenticação
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

### Upload
```
POST /api/upload (multipart/form-data)
```

### Webhooks
```
POST /api/webhooks/mistickpay
GET  /api/webhooks/health
```

### tRPC Endpoints
```
GET  /api/trpc/auth.me
POST /api/trpc/auth.logout
```

## 🎨 Design e UX

### Tema
- **Cores**: Preto (fundo), Cinza (secundário), Azul (destaque)
- **Tipografia**: Inter (Google Fonts)
- **Componentes**: shadcn/ui + Tailwind CSS
- **Animações**: Suaves e responsivas

### Responsividade
- Mobile-first design
- Breakpoints: 640px, 768px, 1024px, 1280px
- Totalmente responsivo em todos os dispositivos

## 🔒 Segurança

- ✅ Autenticação JWT segura
- ✅ Cookies HTTP-only
- ✅ Validação de entrada em todas as rotas
- ✅ Rate limiting em endpoints críticos
- ✅ Proteção contra CSRF
- ✅ Sanitização de uploads
- ✅ Encriptação de senhas com bcrypt

## 📊 Monitoramento

### Logs
- Logs de autenticação
- Logs de upload
- Logs de pagamento
- Logs de webhook

### Métricas
- Tickets criados/resolvidos
- Pagamentos processados
- Usuários ativos
- Taxa de sucesso de pagamentos

## 🐛 Troubleshooting

### Servidor não inicia
```bash
# Verificar variáveis de ambiente
echo $DATABASE_URL

# Limpar cache
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Erro de conexão com banco
```bash
# Verificar conexão
mysql -u user -p -h localhost

# Executar migrations
pnpm db:push
```

### Erro de upload
```bash
# Verificar permissões de S3
# Verificar limite de tamanho
# Verificar tipo de arquivo
```

## 📝 Licença

MIT License - veja LICENSE para detalhes

## 👥 Suporte

Para suporte, entre em contato através do painel de suporte ou envie um email para support@paxstudio.com

## 🚀 Roadmap

- [ ] Integração com mais gateways de pagamento
- [ ] Sistema de avaliações e feedback
- [ ] Relatórios e analytics avançados
- [ ] Integração com GitHub/GitLab
- [ ] Suporte a múltiplos idiomas
- [ ] App mobile (React Native)
- [ ] Integração com Slack/Discord

---

**PaxStudio** - Suporte profissional para seu código. Rápido, confiável e acessível.
