import {useState} from "react";
import AuthPage from "./AuthPage";

const USUARIO = /^[A-Za-z0-9._-]{3,50}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Register({onRegister, onBack}) {
  const [f, setF] = useState({nome: "", usuario: "", email: "", senha: "", confirmar: ""});
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const set = k => e => setF({...f, [k]: e.target.value});

  const submit = async e => {
    e.preventDefault();
    const nome = f.nome.trim();
    const usuario = f.usuario.trim();
    const email = f.email.trim();

    if (!nome || !usuario || !email || !f.senha || !f.confirmar) return setErr("Preencha todos os campos.");
    if (!USUARIO.test(usuario)) return setErr("O usuário deve ter de 3 a 50 letras, números, ponto, hífen ou sublinhado.");
    if (!EMAIL.test(email)) return setErr("Informe um e-mail válido.");
    if (f.senha.length < 8 || f.senha.length > 72) return setErr("A senha deve ter de 8 a 72 caracteres.");
    if (f.senha !== f.confirmar) return setErr("As senhas não conferem.");

    setErr("");
    setLoading(true);
    try {
      await onRegister({nome, usuario, email, senha: f.senha});
    } catch (e) {
      setErr(e.message || "Não foi possível concluir o cadastro.");
    } finally {
      setLoading(false);
    }
  };

  return (<AuthPage>
    <form className="login-box login-box-wide" onSubmit={submit} noValidate>
      <h1>CADASTRO</h1>
      <p className="welcome">Crie o acesso do bibliotecário</p>

      <input className="login-input" placeholder="Nome completo" aria-label="Nome completo" autoComplete="name"
        value={f.nome} onChange={set("nome")}/>
      <input className="login-input" placeholder="Usuário" aria-label="Usuário" autoComplete="username"
        value={f.usuario} onChange={set("usuario")}/>
      <input className="login-input" type="email" placeholder="E-mail" aria-label="E-mail" autoComplete="email"
        value={f.email} onChange={set("email")}/>

      <div className="login-grid">
        <input className="login-input" type="password" placeholder="Senha" aria-label="Senha" autoComplete="new-password"
          value={f.senha} onChange={set("senha")}/>
        <input className="login-input" type="password" placeholder="Confirmar senha" aria-label="Confirmar senha" autoComplete="new-password"
          value={f.confirmar} onChange={set("confirmar")}/>
      </div>

      <p className="login-hint">A senha deve ter de 8 a 72 caracteres. O e-mail é usado para recuperar a senha.</p>

      {err && (<div className="login-err" role="alert">{err}</div>)}
      <button className="login-confirm" type="submit" disabled={loading}>
        {loading ? "Cadastrando..." : "Confirmar"}
      </button>

      <p className="login-small">
        Já possui login?{" "}
        <button type="button" className="login-link" onClick={onBack}>Entrar</button>
      </p>
    </form>
  </AuthPage>);
}
