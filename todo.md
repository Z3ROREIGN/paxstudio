# PaxStudio - Code Support Service - TODO

## Autenticação & Usuários
- [x] Implementar sistema de autenticação com email/senha (sem OAuth)
- [x] Criar tabela de usuários com campos: id, email, nome, senha (hash), role (user/admin), createdAt, updatedAt
- [x] Implementar registro de novo usuário com validação de email
- [x] Implementar login com geração de JWT
- [x] Criar conta pré-cadastrada: willianwca2011@gmail.com / willian72011 (role: admin)
- [x] Implementar logout
- [x] Adicionar proteção de rotas (apenas usuários autenticados)

## Upload de Arquivos & Cálculo de Cobrança
- [x] Criar tabela de tickets: id, userId, fileName, fileSize, filePath (S3), status, amount, createdAt, updatedAt
- [x] Implementar upload de arquivo .ZIP para S3
- [x] Implementar cálculo automático de cobrança (R$ 1/MB ou R$ 3,50 fixo para KB)
- [x] Validar tipo de arquivo (apenas .ZIP)
- [x] Criar página de upload com preview de arquivo

## Integração MisticPay
- [x] Configurar credenciais da MisticPay
- [x] Implementar criação de pagamento na MisticPay
- [x] Implementar webhook para confirmação de pagamento
- [x] Atualizar status do ticket após pagamento confirmado
- [x] Exibir status de pagamento na interface

## Chat em Tempo Real
- [x] Criar tabela de mensagens: id, ticketId, userId, message, type (text/image/file), filePath, createdAt
- [x] Implementar WebSocket para chat em tempo real
- [x] Liberar acesso ao chat apenas após pagamento confirmado
- [x] Implementar envio de mensagens de texto
- [x] Implementar upload de imagens no chat
- [x] Implementar upload de arquivos .ZIP no chat
- [x] Exibir histórico de chat
- [x] Notificações em tempo real para novo suporte/cliente

## Painel Administrativo do Suporte
- [x] Criar layout do painel administrativo com sidebar
- [x] Listar todos os tickets com filtros (status, cliente, data)
- [x] Visualizar detalhes do ticket e histórico de chat
- [x] Confirmar entrega do arquivo .ZIP corrigido
- [x] Encerrar atendimento
- [x] Dashboard com estatísticas (tickets abertos, pagamentos, clientes)

## Funcionalidades Administrativas Avançadas
- [x] Listar todos os usuários/clientes
- [x] Implementar sistema de ban de usuários
- [x] Visualizar histórico de pagamentos
- [x] Configurações do sistema (taxa de cobrança, mensagens automáticas, etc)
- [x] Logs de atividades administrativas

## UI/UX - Tema Escuro Profissional
- [x] Definir paleta de cores (preto, cinza, azul/roxo para destaque)
- [x] Implementar tema escuro em toda a aplicação
- [x] Criar componentes reutilizáveis (botões, cards, inputs, etc)
- [x] Implementar animações suaves
- [x] Garantir responsividade em mobile/tablet/desktop
- [x] Criar página de landing/home
- [x] Criar página de login/registro
- [x] Criar página de upload
- [x] Criar página de chat
- [x] Criar painel administrativo

## Testes & Deploy
- [x] Testes unitários para autenticação
- [x] Testes para cálculo de cobrança
- [x] Testes para integração MisticPay
- [x] Testes para chat
- [x] Testes para painel administrativo
- [x] Fazer commit e push para GitHub
- [x] Deploy da aplicação

## Bugs & Melhorias (adicionados durante desenvolvimento)
