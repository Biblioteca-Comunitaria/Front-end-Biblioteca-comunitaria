# 📚 Biblioteca Comunitária Luiz Brasil

Sistema web para controlar empréstimos e devoluções de uma biblioteca de bairro mantida por voluntários. Ele substitui o caderno de anotações e responde de imediato a duas perguntas: **quantos exemplares estão disponíveis** e **quem está com qual livro**.

Aplicação React (Vite), versão admin, integrada à API Spring Boot em `../ProjetoBiblioteca`.

---

## 🎯 Contexto e objetivo

**Contexto:** uma biblioteca de bairro empresta livros anotando tudo num caderno. Ninguém sabe ao certo quantos exemplares estão disponíveis nem quem está com qual livro.

**Usuário:** voluntário (bibliotecário) no balcão da biblioteca.

**Objetivo:** controlar empréstimos e devoluções, com limite por leitor.

---

## ✅ Requisitos atendidos

| Código | Requisito | Como funciona |
|---|---|---|
| **RF1** | Cadastrar livro | Formulário com título, autor, gênero, editora, ano de publicação, ISBN (**único**) e quantidade de exemplares (**≥ 1**). Envia `POST /livros`. |
| **RF2** | Buscar livros por título ou autor | Busca sem distinção de acentos ou maiúsculas. Cada card mostra os exemplares disponíveis (ex.: `2 de 4`). |
| **RF3** | Emprestar | Na tela do livro, selecione o leitor. Só é permitido se houver exemplar disponível **e** o leitor tiver **menos de 2 empréstimos ativos**. A devolução prevista é a data do empréstimo **+ 14 dias**. Envia `POST /emprestimos`. |
| **RF4** | Devolver | Em Empréstimos, abra o registro e use **Marcar como devolvido**. Envia `PUT /emprestimos/{id}/devolucao` e a data da devolução fica registrada. |

---

## 📏 Regras de negócio

- **Disponibilidade** = total de exemplares − empréstimos ativos do livro.
- **Limite por leitor:** no máximo 2 empréstimos ativos ao mesmo tempo.
- **Prazo:** 14 dias corridos a partir do dia do empréstimo.
- **Atrasado:** empréstimo sem devolução cuja data prevista é anterior a hoje (sinalizado com "◆ Atrasado").
- **ISBN único:** o cadastro recusa ISBN repetido.

---

## 🖥️ Telas

- **Login** – autentica com HTTP Basic em `POST /auth/login`.
- **Cadastro** – cria o bibliotecário em `POST /auth/cadastro` e já entra no sistema.
- **Esqueci a senha** – envia um código de 6 dígitos para o e-mail cadastrado (`POST /auth/esqueci-senha`) e troca a senha com `POST /auth/redefinir-senha`.
- **Livros** – grade de livros com busca e filtros (Todos, Disponíveis e Indisponíveis), mais o botão **+ Novo livro** (`GET /livros`).
- **Detalhe do livro** – informações adicionais, empréstimos em andamento e formulário **Realizar empréstimo**.
- **Cadastro de novo livro** – formulário com validações.
- **Empréstimos** – abas Todos, Ativos e Devolvidos, com busca por livro ou leitor (`GET /emprestimos`).
- **Detalhe do empréstimo** – dados do leitor e botão de devolução.

O layout é responsivo: no celular o menu lateral vira uma barra inferior. Há também tema claro e escuro automático.

---

## 🛠️ Tecnologias

- [React 18](https://react.dev/) com [Vite](https://vitejs.dev/)
- CSS puro (variáveis para tema claro e escuro)
- API Spring Boot com banco MySQL (projeto `ProjetoBiblioteca`)

---

## 🚀 Como rodar

Pré-requisito: [Node.js](https://nodejs.org/) 18 ou superior e a API em execução.

```bash
# instalar dependências
npm install

# ambiente de desenvolvimento (http://localhost:5173)
npm run dev

# build de produção (gera a pasta dist/)
npm run build

# pré-visualizar o build
npm run preview
```

O front espera a API em `http://localhost:8081`. Para usar outro endereço, defina `VITE_API_URL`:

```bash
VITE_API_URL=http://192.168.0.10:8081 npm run dev
```

O back libera o CORS para `localhost:5173`, `127.0.0.1:5173`, `localhost:4173` e `127.0.0.1:4173`; outras origens podem ser liberadas em `BIBLIOTECA_CORS_ORIGINS` no back.

---

## 🗂️ Estrutura do projeto

```
biblioteca-react/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx              # ponto de entrada
    ├── App.jsx               # sessão, carregamento dos dados, regras (cadastrar, emprestar, devolver) e navegação
    ├── api.js                # cliente da API, sessão HTTP Basic e conversão dos DTOs do back
    ├── utils.js              # formatação de datas e busca sem acento
    ├── styles.css            # estilos, tema e responsividade
    └── components/
        ├── AuthPage.jsx      # layout compartilhado das telas de autenticação
        ├── Login.jsx         # tela de login
        ├── Register.jsx      # tela de cadastro
        ├── ForgotPassword.jsx # recuperação de senha
        ├── Books.jsx         # lista, detalhe/empréstimo e cadastro de livros
        ├── Loans.jsx         # lista e detalhe de empréstimos
        └── Icon.jsx          # ícones do menu
```

---

## ⚠️ Limitações conhecidas

- O controle é feito pela **quantidade de exemplares de cada título**, sem identificar cada exemplar físico individualmente (por exemplo, por número de tombamento).
- Não há cadastro de leitores pela interface: os leitores vêm da API (`GET /leitores`).
- Ainda não há listagem de empréstimos atrasados, exclusão de empréstimos devolvidos, histórico por leitor nem renovação de empréstimo.

## 🔭 Próximos passos

- **US05:** API para listar empréstimos atrasados e excluir os já devolvidos.
- **US10:** API para consultar o histórico de empréstimos por leitor.
- **US11:** interface para solicitar a renovação de um empréstimo.
- Cadastro e edição de leitores.
- Identificação de cada exemplar (número de tombamento).
