# 📚 Biblioteca Comunitária Luiz Brasil

Sistema web para controlar empréstimos e devoluções de uma biblioteca de bairro mantida por voluntários. Ele substitui o caderno de anotações e responde de imediato a duas perguntas: **quantos exemplares estão disponíveis** e **quem está com qual livro**.


---

## 🎯 Contexto e objetivo

**Contexto:** uma biblioteca de bairro empresta livros anotando tudo num caderno. Ninguém sabe ao certo quantos exemplares estão disponíveis nem quem está com qual livro.

**Usuário:** voluntário no balcão da biblioteca.

**Objetivo:** controlar empréstimos e devoluções, com limite por leitor e lista de atrasos.

---

## ✅ Requisitos atendidos

| Código | Requisito | Como funciona |
|---|---|---|
| **RF1** | Cadastrar livro | Formulário com título, nome do autor, gênero, editora, ano de publicação, ISBN (fictício e **único**), exemplares disponíveis (**≥ 1**) e status. |
| **RF2** | Buscar livros por título ou autor | Busca sem distinção de acentos ou maiúsculas. Cada card mostra os exemplares disponíveis (ex.: `2 de 4`). |
| **RF3** | Emprestar | Informe o CPF do leitor na tela do livro. Só é permitido se houver exemplar disponível **e** o leitor tiver **menos de 2 empréstimos ativos**. A devolução prevista é a data do empréstimo **+ 14 dias**. |
| **RF4** | Devolver | Em Empréstimos, abra o registro e use **Marcar como devolvido**. A data da devolução fica registrada. |
| **RF5** | Listar empréstimos atrasados | Aba **Atrasados**: empréstimos não devolvidos cuja data prevista já passou. |

Os leitores são fictícios e vêm de um script de dados iniciais (`src/utils.js`).

---

## 📏 Regras de negócio

- **Disponibilidade** = total de exemplares − empréstimos ativos do livro.
- **Limite por leitor:** no máximo 2 empréstimos ativos ao mesmo tempo.
- **Prazo:** 14 dias corridos a partir do dia do empréstimo.
- **Atrasado:** empréstimo sem devolução cuja data prevista é anterior a hoje.
- **ISBN único:** o cadastro recusa ISBN repetido (a comparação ignora pontuação).
- **Status manual:** um livro marcado como *Indisponível* (por exemplo, danificado ou em restauro) não pode ser emprestado, mesmo que existam exemplares.

---

## 🖥️ Telas

- **Livros:** grade de livros com busca e filtros (Todos, Disponíveis e Indisponíveis), mais o botão **+ Novo livro**.
- **Detalhe do livro:** informações adicionais, empréstimos em andamento e formulário **Realizar empréstimo**.
- **Cadastro de novo livro:** formulário com validações.
- **Empréstimos:** abas Todos, Ativos, Atrasados e Devolvidos, com busca por livro ou leitor.
- **Detalhe do empréstimo:** dados do leitor e botão de devolução.

O layout é responsivo: no celular o menu lateral vira uma barra inferior. Há também tema claro e escuro automático.

---

## 🛠️ Tecnologias

- [React 18](https://react.dev/)
- - CSS puro (variáveis para tema claro e escuro)


## 🚀 Como rodar

Pré-requisito: [Node.js](https://nodejs.org/) 18 ou superior.

```bash
# instalar dependências
npm install

# ambiente de desenvolvimento
npm run dev

# build de produção (gera a pasta dist/)
npm run build

# pré-visualizar o build
npm run preview
```

---

## 🗂️ Estrutura do projeto

```
biblioteca-react/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx              # ponto de entrada
    ├── App.jsx               # estado, regras (cadastrar, emprestar, devolver) e navegação
    ├── utils.js              # datas, busca sem acento e dados iniciais
    ├── styles.css            # estilos, tema e responsividade
    └── components/
        ├── Books.jsx         # lista, detalhe/empréstimo e cadastro de livros
        ├── Loans.jsx         # lista e detalhe de empréstimos
        └── Icon.jsx          # ícones do menu
```

---

## 🧪 Dados iniciais para teste

Ao abrir pela primeira vez, a aplicação carrega:

- 6 leitores fictícios (por exemplo, Abigail Maria, CPF `222.333.444-55`);
- 6 livros de exemplo;
- 4 empréstimos de exemplo: 2 atrasados, 1 ativo e 1 devolvido.

**Cenários para testar**

1. **Limite por leitor:** Abigail já tem 2 empréstimos ativos. Tente emprestar outro livro para ela e o sistema bloqueia.
2. **Sem exemplar:** *Vidas Secas* tem 1 exemplar, que já está emprestado.
3. **Livro indisponível:** *O Quinze* está marcado como Indisponível.
4. **Atrasos:** abra Empréstimos › Atrasados.

---

## ⚠️ Limitações conhecidas

- Os dados ficam apenas no navegador (`localStorage`): não são compartilhados entre computadores e se perdem se o armazenamento for limpo.
- O controle é feito pela **quantidade de exemplares de cada título**, sem identificar cada exemplar físico individualmente (por exemplo, por número de tombamento).
- Não há cadastro de leitores pela interface, nem login: os leitores vêm do script de dados iniciais.
- Não há renovação de empréstimo.

## 🔭 Próximos passos

- Backend e banco de dados para persistência compartilhada.
- Cadastro e edição de leitores.
- Identificação de cada exemplar (número de tombamento).
- Renovação de empréstimo e histórico por leitor.
- Autenticação dos voluntários.

---

## 📄 Licença

Defina a licença do projeto (por exemplo, MIT) antes de publicar.
