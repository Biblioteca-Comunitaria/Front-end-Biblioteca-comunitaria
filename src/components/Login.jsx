import {useEffect, useState} from "react";
import AuthPage from "./AuthPage";

export default function Login({onLogin, onShowRegister, onShowForgot, initialUser}) {
  const [user, setUser] = useState(initialUser || "");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialUser) setUser(initialUser);
  }, [initialUser]);

  const submit = async e => {
    e.preventDefault();
    if (!user.trim() || !pass) return setErr("Preencha usuário e senha.");
    setErr("");
    setLoading(true);
    try {
      await onLogin(user, pass);
    } catch (e) {
      setErr(e.status === 401 ? "Usuário ou senha inválidos." : (e.message || "Não foi possível entrar."));
    } finally {
      setLoading(false);
    }
  };

  return (<AuthPage>
    <form className="login-box" onSubmit={submit} noValidate>
      <h1>LOGIN</h1>
      <p className="welcome">Bem-vindo de volta, bibliotecário!</p>

      <input className="login-input" placeholder="Usuário" aria-label="Usuário" autoComplete="username"
        value={user} onChange={e => setUser(e.target.value)}/>
      <input className="login-input" type="password" placeholder="Senha" aria-label="Senha" autoComplete="current-password"
        value={pass} onChange={e => setPass(e.target.value)}/>

      {err && (<div className="login-err" role="alert">{err}</div>)}
      <button className="login-confirm" type="submit" disabled={loading}>
        {loading ? "Entrando..." : "Confirmar"}
      </button>

      <button type="button" className="login-link" onClick={onShowForgot}>Esqueci a senha!</button>
      <p className="login-small">
        Ainda não possui login?{" "}
        <button type="button" className="login-link" onClick={onShowRegister}>Cadastre-se</button>
      </p>
    </form>
  </AuthPage>);
}
