import logo from "../assets/logo.png";

export default function AuthPage({children}) {
  return (<div className="login-page">
    <div className="login-brand">
      <img src={logo} alt="Logo Biblioteca Luiz Brasil"/>
      <h2>BIBLIOTECA</h2>
      <span className="script">Luiz Brasil</span>
    </div>
    {children}
  </div>);
}
