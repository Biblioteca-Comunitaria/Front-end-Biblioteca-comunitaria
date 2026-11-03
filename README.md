# Biblioteca Luiz Brasil

Aplicação React (Vite) de biblioteca comunitária, versão admin, integrada à API Spring Boot em `../ProjetoBiblioteca`.

## Como rodar

```bash
npm install
npm run dev      # desenvolvimento em http://localhost:5173
npm run build    # build de produção em dist/
npm run preview  # pré-visualização do build
```

O front espera a API em `http://localhost:8081`. Para usar outro endereço, defina `VITE_API_URL`:

```bash
VITE_API_URL=http://192.168.0.10:8081 npm run dev
```

O back libera o CORS para `localhost:5173`, `127.0.0.1:5173`, `localhost:4173` e `127.0.0.1:4173`;
outras origens podem ser liberadas em `BIBLIOTECA_CORS_ORIGINS` no back.

## Telas

- **Login** – autentica com HTTP Basic em `POST /auth/login`.
- **Cadastro** – cria o bibliotecário em `POST /auth/cadastro` e já entra no sistema.
- **Esqueci a senha** – envia um código de 6 dígitos para o e-mail cadastrado (`POST /auth/esqueci-senha`)
  e troca a senha com `POST /auth/redefinir-senha`.
- **Livros** – lista/busca (`GET /livros`), detalhe, empréstimo e cadastro (`POST /livros`).
- **Empréstimos** – lista todos (`GET /emprestimos`), detalhe e devolução (`PUT /emprestimos/{id}/devolucao`).

## Estrutura

- `src/api.js` – cliente da API, sessão HTTP Basic e conversão dos DTOs do back para o formato da tela
- `src/utils.js` – formatação de datas e busca sem acento
- `src/App.jsx` – sessão, carregamento dos dados do banco e navegação
- `src/components/AuthPage.jsx` – layout compartilhado das telas de autenticação
- `src/components/Login.jsx`, `Register.jsx`, `ForgotPassword.jsx` – telas de acesso
- `src/components/Books.jsx` – lista, detalhe/empréstimo e cadastro de livros
- `src/components/Loans.jsx` – lista e detalhe de empréstimos (Todos/Ativos/Devolvidos)
- `src/styles.css` – estilos e tema claro/escuro

Os dados não ficam mais no localStorage: livros, leitores e empréstimos vêm do MySQL pela API.
