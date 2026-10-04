# Histórico de Desenvolvimento - Projeto MYRO 🚀

Este ficheiro guarda a memória de todo o trabalho e das funcionalidades que já implementámos no MYRO, para que em sessões futuras o assistente saiba exatamente onde parámos e como o projeto está estruturado.

## 📅 Sessão: 04 de Outubro de 2026

### 1. Painel Admin Real & Dinâmico
- **O que fizemos:** Substituímos os dados falsos do dashboard. O painel de controlo do administrador (`DashboardPage.jsx`) agora lê os dados em tempo real da base de dados Firebase (Firestore).
- **Funcionalidade:** Mostra o total exato de vídeos, categorias ativas, e um feed real dos últimos vídeos importados.
- **Autenticação Admin:** Corrigimos o `AuthModal.jsx`. O administrador (`jaimitonhama@gmail.com`) faz login normalmente e o sistema apresenta-lhe uma aba vermelha exclusiva "Painel Admin" no seu menu de utilizador, sem o forçar a sair da página inicial.

### 2. Importador de Vídeos Inteligente (YouTube)
- **O que fizemos:** Construímos o `ImportPage.jsx` para importar vídeos de forma fácil.
- **Chave de API:** O sistema guarda a chave da API do YouTube de forma inteligente no `localStorage`, não sendo preciso colá-la repetidamente.
- **Leitura de @handles:** O importador consegue ler links do tipo `youtube.com/@Canal` e encontrar a playlist secreta de "uploads" desse canal.

### 3. A Minha Lista (Favoritos)
- **O que fizemos:** Criámos a funcionalidade real de "Likes" ou Favoritos.
- **Como funciona:** O utilizador tem um ícone de Coração (♥) debaixo do ecrã de vídeo. Ao clicar, o sistema grava o vídeo no `localStorage`.
- **Aba de Perfil:** A aba "A Minha Lista" dentro do perfil do utilizador (`UserProfileModal.jsx`) foi programada para ler os favoritos e exibi-los numa grelha dinâmica onde podem ser visualizados ou removidos.

### 4. Categoria "Novelas" (Playlists Auto-atualizáveis)
- **O que fizemos:** Introduzimos as séries e novelas no sistema.
- **Como funciona:** No Importador, ativámos uma checkbox especial que permite gravar uma Playlist inteira do YouTube como um único card (ao invés de 50 episódios soltos).
- **Magia:** O `VideoPlayer.jsx` reconhece que é uma playlist e reproduz os episódios todos. Se o dono do canal adicionar um novo capítulo à playlist no YouTube, ele entra automaticamente no MYRO sem precisarmos de intervir!

### 5. Auto-Limpeza de Vídeos Quebrados (Auto-Delete)
- **O que fizemos:** Tornámos o MYRO num sistema auto-sustentável que faz a sua própria manutenção.
- **Como funciona:** Se o `VideoPlayer.jsx` detetar um Erro 100, 101 ou 150 do YouTube (vídeo apagado, privado ou bloqueado por direitos de autor), ele comunica com o Firebase e **apaga o vídeo definitivamente** da base de dados, passando imediatamente para o próximo canal.

### 6. Shuffle (Embrulhador) de Categorias
- **O que fizemos:** Para combater a monotonia e dar a sensação de catálogo infinito, programámos um algoritmo em `App.jsx`.
- **Como funciona:** A cada 10 minutos (baseado num relógio global determinístico), os vídeos dentro de cada categoria são trocados de lugar aleatoriamente.
- **Regra de Ouro:** Os Animes nunca se misturam com os Filmes. A mistura acontece *apenas* de forma interna e organizada dentro da própria categoria do vídeo.

---

**Nota para a próxima sessão:** O projeto já tem a espinha dorsal de conteúdos perfeitamente montada, bem como o sistema de contas, importação e consumo de vídeos. Os próximos passos podem incluir integração de pagamentos reais, melhorias de SEO, ou a aba de histórico.
