# PaxStudio - Versão HTML/CSS/JavaScript

Sistema profissional de suporte a código desenvolvido em **HTML puro, CSS e JavaScript vanilla**.

## 🚀 Acessar o Site

### URLs Diretas (Recomendado)
- **Página Inicial**: https://z3roreign.github.io/paxstudio/index.html
- **Login/Registro**: https://z3roreign.github.io/paxstudio/login.html
- **Dashboard**: https://z3roreign.github.io/paxstudio/dashboard.html
- **Pagamento**: https://z3roreign.github.io/paxstudio/payment.html

### Usar Localmente
1. Clone o repositório:
   ```bash
   git clone https://github.com/Z3ROREIGN/paxstudio.git
   cd paxstudio
   git checkout master
   ```

2. Abra `index.html` em um navegador moderno

3. Ou use um servidor local:
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Node.js
   npx http-server
   
   # PHP
   php -S localhost:8000
   ```

## 🎯 Funcionalidades

### ✅ Autenticação
- Login e registro com email/senha
- Sem exposição de credenciais
- Proteção de rotas autenticadas
- Dois níveis de acesso (user/admin)

### 📦 Upload & Cobrança
- Upload de .ZIP com validação
- **R$ 1,00/MB** ou **R$ 3,50 fixo** (até 1MB)
- Limite de 500MB
- Drag & drop suportado

### 💳 Pagamento
- Interface profissional
- Suporte a: MisticPay, PIX, Boleto
- Validação de dados
- Simulação de processamento

### 💬 Chat
- Interface limpa e profissional
- Envio de mensagens
- Histórico persistente
- Timestamps

### 🛠️ Admin
- Gerenciamento de tickets
- Gerenciamento de usuários
- Sistema de ban
- Configurações do sistema

### 🎨 Design
- **Tema escuro profissional** (preto/cinza/azul)
- Totalmente responsivo
- Animações suaves
- Paleta consistente

## 👤 Contas de Teste

### Usuário Comum
- Email: `user@example.com`
- Senha: `password123`

### Administrador
- Email: `admin@paxstudio.com`
- Senha: `admin123`

## 📁 Estrutura de Arquivos

```
paxstudio/
├── index.html              # Página inicial
├── login.html              # Login/Registro
├── dashboard.html          # Dashboard do cliente e admin
├── payment.html            # Página de pagamento
├── css/
│   └── styles.css         # Estilos globais (tema escuro)
├── js/
│   ├── main.js            # Funcionalidades gerais
│   ├── auth.js            # Autenticação
│   ├── storage.js         # Gerenciamento de dados
│   ├── dashboard.js       # Dashboard
│   └── payment.js         # Pagamento
├── README.md              # Este arquivo
├── _config.yml            # Configuração do GitHub Pages
└── .nojekyll              # Desabilitar Jekyll
```

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

## 📞 Suporte

Para dúvidas sobre a implementação:
1. Consulte o código comentado
2. Verifique as funções em `js/main.js`
3. Leia a documentação inline

## 📄 Licença

Projeto de demonstração. Sinta-se livre para usar e modificar.

## 🙏 Agradecimentos

Desenvolvido com ❤️ para PaxStudio

---

**Versão**: 1.0.0  
**Última atualização**: Junho 2026  
**Status**: ✅ Pronto para uso
