const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:8081").replace(/\/+$/, "");
const SESSION_KEY = "biblioteca-luiz-brasil-sessao";

export class ApiError extends Error {
  constructor(message, status = 0) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function getSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveSession(session) {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    // Se o armazenamento do navegador estiver bloqueado, a sessão continua só em memória.
  }
}

export function logout() {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // ignora
  }
}

function basicAuth(usuario, senha) {
  const bytes = new TextEncoder().encode(`${usuario}:${senha}`);
  let binario = "";
  bytes.forEach(b => { binario += String.fromCharCode(b); });
  return "Basic " + btoa(binario);
}

async function erroDaResposta(res, fallback) {
  let dados = null;
  try {
    dados = await res.json();
  } catch {
    // resposta sem JSON
  }
  const campo = Array.isArray(dados?.errors) ? dados.errors[0] : null;
  const mensagem = campo?.defaultMessage || campo?.message || dados?.message || dados?.error || fallback;
  return new ApiError(mensagem, res.status);
}

async function request(path, { method = "GET", body, auth, headers = {} } = {}) {
  const sessao = getSession();
  const autorizacao = auth || sessao?.auth;

  let res;
  try {
    res = await fetch(API_URL + path, {
      method,
      headers: {
        Accept: "application/json",
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(autorizacao ? { Authorization: autorizacao } : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError("Não foi possível conectar ao servidor. Verifique se o back-end está rodando.", 0);
  }

  if (!res.ok) {
    const fallback = res.status === 401
      ? "Usuário ou senha inválidos."
      : "O servidor não conseguiu concluir a operação.";
    throw await erroDaResposta(res, fallback);
  }

  if (res.status === 204) return null;
  const texto = await res.text();
  return texto ? JSON.parse(texto) : null;
}

const mapLivro = l => ({
  id: l.id,
  title: l.titulo,
  author: l.autor,
  isbn: l.isbn,
  copies: l.quantidadeExemplares,
  available: l.exemplaresDisponiveis,
  genre: l.genero || "",
  publisher: l.editora || "",
  year: l.anoPublicacao || "",
});

const mapLeitor = l => ({ id: l.id, name: l.nome });

const mapEmprestimo = e => ({
  id: e.id,
  bookId: e.livroId,
  readerId: e.leitorId,
  date: e.dataEmprestimo,
  due: e.dataPrevistaDevolucao,
  returned: e.dataDevolucao,
});

export async function login(usuario, senha) {
  const auth = basicAuth(usuario.trim(), senha);
  const dados = await request("/auth/login", { method: "POST", auth });
  const sessao = { ...dados, auth };
  saveSession(sessao);
  return sessao;
}

export function cadastrarBibliotecario({ nome, usuario, email, senha }) {
  return request("/auth/cadastro", {
    method: "POST",
    body: { nome, usuario, email, senha },
  });
}

export function esqueciSenha(email) {
  return request("/auth/esqueci-senha", { method: "POST", body: { email } });
}

export function redefinirSenha(email, codigo, novaSenha) {
  return request("/auth/redefinir-senha", {
    method: "POST",
    body: { email, codigo, novaSenha },
  });
}

export async function carregarDados() {
  const [livros, leitores, emprestimos] = await Promise.all([
    request("/livros"),
    request("/leitores"),
    request("/emprestimos"),
  ]);
  return {
    books: livros.map(mapLivro),
    readers: leitores.map(mapLeitor),
    loans: emprestimos.map(mapEmprestimo),
  };
}

export async function cadastrarLivro(f) {
  const ano = f.year === "" || f.year === null || f.year === undefined ? null : Number(f.year);
  const dados = await request("/livros", {
    method: "POST",
    body: {
      titulo: f.title.trim(),
      autor: f.author.trim(),
      isbn: f.isbn.trim(),
      quantidadeExemplares: Number(f.copies),
      genero: f.genre.trim() || null,
      editora: f.publisher.trim() || null,
      anoPublicacao: Number.isInteger(ano) ? ano : null,
    },
  });
  return mapLivro(dados);
}

export async function emprestar(livroId, leitorId) {
  const dados = await request("/emprestimos", {
    method: "POST",
    body: { livroId, leitorId },
  });
  return mapEmprestimo(dados);
}

export async function devolver(emprestimoId) {
  const dados = await request(`/emprestimos/${emprestimoId}/devolucao`, { method: "PUT" });
  return mapEmprestimo(dados);
}
