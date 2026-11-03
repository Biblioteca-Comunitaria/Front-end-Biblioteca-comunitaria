import {useState} from "react";
import AuthPage from "./AuthPage";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPassword({onSendCode, onReset, onBack}) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [codigo, setCodigo] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  const enviarCodigo = async e => {
    e.preventDefault();
    const destino = email.trim();
    if (!EMAIL.test(destino)) return setErr("Informe um e-mail válido.");
    setErr("");
    setLoading(true);
    try {
      const resposta = await onSendCode(destino);
      setEmail(destino);
      setInfo(resposta?.mensagem || "Se o e-mail estiver cadastrado, enviaremos um código de recuperação.");
      setStep(2);
    } catch (e) {
      setErr(e.message || "Não foi possível enviar o código.");
    } finally {
      setLoading(false);
    }
  };

  const redefinir = async e => {
    e.preventDefault();
    if (!/^\d{6}$/.test(codigo.trim())) return setErr("Digite os 6 dígitos do código.");
    if (senha.length < 8 || senha.length > 72) return setErr("A nova senha deve ter de 8 a 72 caracteres.");
    if (senha !== confirmar) return setErr("As senhas não conferem.");

    setErr("");
    setLoading(true);
    try {
      await onReset(email.trim(), codigo.trim(), senha);
    } catch (e) {
      setErr(e.message || "Não foi possível redefinir a senha.");
    } finally {
      setLoading(false);
    }
  };

  return (<AuthPage>
    <form className="login-box login-box-wide" onSubmit={step === 1 ? enviarCodigo : redefinir} noValidate>
      <h1>RECUPERAR</h1>
      <p className="welcome">Esqueceu a senha?</p>

      {step === 1 ? (<>
        <p className="login-hint">
          Informe o e-mail cadastrado. Enviaremos um código de 6 dígitos, válido por 15 minutos.
        </p>
        <input className="login-input" type="email" placeholder="E-mail" aria-label="E-mail" autoComplete="email"
          value={email} onChange={e => setEmail(e.target.value)}/>
      </>) : (<>
        {info && <div className="login-success" role="status">{info}</div>}
        <p className="login-hint">Digite o código recebido e escolha a nova senha.</p>
        <input className="login-input login-code" inputMode="numeric" maxLength={6} placeholder="Código"
          aria-label="Código de recuperação" autoComplete="one-time-code"
          value={codigo} onChange={e => setCodigo(e.target.value.replace(/\D/g, "").slice(0, 6))}/>
        <input className="login-input" type="password" placeholder="Nova senha" aria-label="Nova senha" autoComplete="new-password"
          value={senha} onChange={e => setSenha(e.target.value)}/>
        <input className="login-input" type="password" placeholder="Confirmar nova senha" aria-label="Confirmar nova senha" autoComplete="new-password"
          value={confirmar} onChange={e => setConfirmar(e.target.value)}/>
        <p className="login-hint">A nova senha deve ter de 8 a 72 caracteres.</p>
      </>)}

      {err && (<div className="login-err" role="alert">{err}</div>)}
      <button className="login-confirm" type="submit" disabled={loading}>
        {loading ? "Aguarde..." : (step === 1 ? "Enviar código" : "Redefinir senha")}
      </button>

      {step === 2 && (
        <button type="button" className="login-link" disabled={loading}
          onClick={() => { setStep(1); setErr(""); setCodigo(""); setSenha(""); setConfirmar(""); }}>
          Reenviar código
        </button>
      )}
      <button type="button" className="login-link" onClick={onBack}>Voltar para o login</button>
    </form>
  </AuthPage>);
}
