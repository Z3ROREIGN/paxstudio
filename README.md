# PaxStudio - Versão HTML/CSS/JavaScript

Sistema profissional de suporte a código desenvolvido em **HTML puro, CSS e JavaScript vanilla** (sem frameworks).

## 🎯 Características

### ✅ Autenticação
- Login e registro com email/senha
- Armazenamento seguro em localStorage
- Proteção de rotas autenticadas
- Dois níveis de acesso: usuário e admin

### 📦 Upload de Arquivos
- Upload de arquivos .ZIP com validação
- Cálculo automático de preço:
  - **R$ 1,00 por MB** para arquivos ≥ 1 MB
  - **R$ 3,50 fixo** para arquivos < 1 MB
- Limite máximo de 500 MB
- Drag & drop suportado

### 💳 Pagamento
- Interface profissional de pagamento
- Suporte a múltiplos métodos:
  - MisticPay (cartão de crédito/débito)
  - PIX
  - Boleto Bancário
- Validação de dados de pagamento
- Simulação de processamento

### 💬 Chat em Tempo Real
- Interface de chat limpa e profissional
- Envio de mensagens de texto
- Histórico persistente
- Timestamps das mensagens
- Suporte a múltiplos tickets

### 🛠️ Painel Administrativo
- Gerenciamento de tickets
- Gerenciamento de usuários
- Sistema de ban de usuários
- Configurações do sistema
- Visualização de pagamentos

### 🎨 Design
- Tema escuro profissional (preto/cinza/azul)
- Totalmente responsivo (mobile/tablet/desktop)
- Animações suaves
- Componentes reutilizáveis
- Paleta de cores consistente

## 📁 Estrutura de Arquivos

```
paxstudio-html/
├── index.html              # Página inicial
├── login.html              # Login/Registro
├── dashboard.html          # Dashboard do cliente
├── payment.html            # Página de pagamento
├── css/
│   └── styles.css         # Estilos globais
├── js/
│   ├── main.js            # Funcionalidades gerais
│   ├── auth.js            # Autenticação
│   ├── storage.js         # Gerenciamento de dados
│   ├── dashboard.js       # Dashboard
│   └── payment.js         # Pagamento
└── README.md              # Documentação
```

## 🚀 Como Usar

### 1. Abrir o Projeto
Simplesmente abra `index.html` em um navegador moderno.

### 2. Criar Conta
- Clique em "Começar Agora" ou "Registrar"
- Preencha os dados: nome, email e senha
- Clique em "Registrar"

### 3. Fazer Login
- Acesse a página de login
- Digite email e senha
- Clique em "Entrar"

### 4. Enviar Arquivo
- Acesse o dashboard
- Clique em "Upload"
- Arraste um arquivo .ZIP ou clique para selecionar
- Veja o preço calculado automaticamente
- Clique em "Prosseguir para Pagamento"

### 5. Realizar Pagamento
- Preencha os dados do pagamento
- Selecione o método de pagamento
- Clique em "Pagar Agora"
- Aguarde o processamento

### 6. Chat com Suporte
- Após o pagamento, acesse a seção de Chat
- Selecione o ticket
- Envie mensagens para o suporte

### 7. Painel Admin
- Faça login com conta admin
- Acesse o painel administrativo
- Gerencie tickets, usuários e configurações

## 👤 Contas de Teste

### Usuário Comum
- Email: `user@example.com`
- Senha: `password123`

### Administrador
- Email: `admin@paxstudio.com`
- Senha: `admin123`

**Nota**: Estas são contas de demonstração. Em produção, use um banco de dados real com senhas criptografadas.

## 💾 Armazenamento de Dados

O projeto usa **localStorage** para armazenar dados:
- `users` - Lista de usuários registrados
- `tickets` - Tickets de suporte
- `messages` - Mensagens de chat
- `settings` - Configurações do sistema
- `user` - Usuário logado (sessão)
- `token` - Token de autenticação

**Importante**: localStorage é apenas para demonstração. Em produção, use um backend com banco de dados.

## 🔧 Configurações

Edite `js/storage.js` para alterar as configurações padrão:

```javascript
getSettings() {
    return JSON.parse(localStorage.getItem('settings') || JSON.stringify({
        rateMB: 1.00,        // Taxa por MB
        rateFixed: 3.50,     // Taxa fixa para arquivos pequenos
        maxFileSize: 500     // Tamanho máximo em MB
    }));
}
```

## 🎨 Customização

### Cores
Edite as variáveis CSS em `css/styles.css`:

```css
:root {
    --color-primary: #3b82f6;      /* Azul principal */
    --color-bg: #0f0f0f;           /* Fundo preto */
    --color-text: #ffffff;         /* Texto branco */
    /* ... mais cores ... */
}
```

### Tipografia
Adicione fontes Google em `index.html`:

```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
```

## 🔒 Segurança

**Aviso**: Este é um projeto de demonstração. Para produção:

1. **Nunca armazene senhas em localStorage**
   - Use um backend com bcrypt/Argon2
   - Implemente autenticação JWT

2. **Valide dados no servidor**
   - Não confie apenas em validação client-side
   - Implemente rate limiting

3. **Use HTTPS**
   - Sempre criptografe dados em trânsito

4. **Proteja dados sensíveis**
   - Não exponha IDs de usuários/tickets
   - Implemente autorização adequada

## 📱 Responsividade

O projeto é totalmente responsivo:
- **Desktop**: Layout completo com sidebar
- **Tablet**: Layout adaptado
- **Mobile**: Layout em coluna única

## 🌐 Compatibilidade

Funciona em todos os navegadores modernos:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Opera 76+

## 📞 Suporte

Para dúvidas sobre a implementação:
1. Consulte o código comentado
2. Verifique as funções em `js/main.js`
3. Leia a documentação inline

## 📄 Licença

Projeto de demonstração. Sinta-se livre para usar e modificar.

## 🚀 Próximos Passos

Para transformar em produção:

1. **Implementar Backend**
   - Node.js + Express ou similar
   - Banco de dados (PostgreSQL, MySQL, etc)
   - Autenticação JWT

2. **Integração com MisticPay**
   - Configurar credenciais reais
   - Implementar webhooks
   - Validar assinaturas

3. **Armazenamento em Cloud**
   - Amazon S3 ou similar
   - Fazer upload de arquivos .ZIP
   - Gerar URLs presigned

4. **Chat em Tempo Real**
   - Implementar WebSocket (Socket.io)
   - Notificações push
   - Histórico persistente

5. **Deploy**
   - Usar Vercel, Netlify, GitHub Pages
   - Configurar domínio customizado
   - SSL/HTTPS

---

**Desenvolvido com ❤️ para PaxStudio**
