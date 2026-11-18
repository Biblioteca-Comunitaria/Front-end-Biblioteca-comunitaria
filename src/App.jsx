import {useEffect,useState} from "react";
import {iso,fmt,getRoute} from "./utils";
import * as api from "./api";
import Icon from "./components/Icon";
import Login from "./components/Login";
import Register from "./components/Register";
import ForgotPassword from "./components/ForgotPassword";
import logo from "./assets/logo.png";
import {Books,BookDetail,AddBook} from "./components/Books";
import {Loans,LoanDetail} from "./components/Loans";

const VAZIO={books:[],readers:[],loans:[]};

export default function App(){
  const[db,setDb]=useState(VAZIO);
  const[route,setRoute]=useState(getRoute);
  const[toast,setToast]=useState(null);
  const[sel,setSel]=useState(null);       // livro selecionado
  const[selLoan,setSelLoan]=useState(null);
  const[adding,setAdding]=useState(false);
  const[q,setQ]=useState("");
  const[tab,setTab]=useState("todos");
  const[session,setSession]=useState(api.getSession);
  const[authView,setAuthView]=useState("login");
  const[authUser,setAuthUser]=useState("");
  const[loading,setLoading]=useState(Boolean(api.getSession()));

  useEffect(()=>{
    const h=()=>{setRoute(getRoute());setSel(null);setSelLoan(null);setAdding(false);setQ("");setTab("todos")};
    addEventListener("hashchange",h);
    return()=>removeEventListener("hashchange",h);
  },[]);

  useEffect(()=>{
    if(session)refresh().catch(()=>{});
  },[]); // a sessão salva é validada no primeiro carregamento

  const say=(msg,bad)=>{setToast({msg,bad});setTimeout(()=>setToast(null),3500)};
  const today=iso(Date.now());

  async function refresh(){
    setLoading(true);
    try{
      const dados=await api.carregarDados();
      setDb(dados);
      return dados;
    }catch(e){
      if(e.status===401)handleExpired();
      else say(e.message||"Não foi possível carregar os dados do servidor.",1);
      throw e;
    }finally{
      setLoading(false);
    }
  }

  function handleExpired(){
    api.logout();
    setSession(null);
    setDb(VAZIO);
    setAuthView("login");
    setAuthUser("");
    say("Sua sessão expirou. Entre novamente.",1);
  }

  const book=id=>db.books.find(b=>b.id===id);
  const reader=id=>db.readers.find(r=>r.id===id);
  const avail=b=>Math.max(0,b?.available??0);
  const status=l=>!l?"—":(l.returned?"Devolvido":(l.due<today?"Atrasado":"Ativo"));

  const go=r=>{if(location.hash.slice(1)===r)setRoute(r);else location.hash=r};

  async function login(usuario,senha){
    const s=await api.login(usuario,senha);
    setSession(s);
    setAuthUser(s.usuario||"");
    await refresh();
    go("livros");
  }

  async function register(dados){
    await api.cadastrarBibliotecario(dados);
    await login(dados.usuario,dados.senha);
  }

  async function resetPassword(email,codigo,novaSenha){
    await api.redefinirSenha(email,codigo,novaSenha);
    setAuthUser("");
    setAuthView("login");
    say("Senha alterada com sucesso. Faça login com a nova senha.");
  }

  const logout=()=>{
    api.logout();
    setSession(null);
    setDb(VAZIO);
    setAuthView("login");
    setAuthUser("");
    if(location.hash)location.hash="";
  };

  // RF1
  async function addBook(f){
    const title=f.title.trim(),author=f.author.trim(),isbn=f.isbn.trim();
    const copies=Number(f.copies);
    const year=f.year===""||f.year===null||f.year===undefined?null:Number(f.year);
    if(!title||!author||!isbn)return say("Preencha título, autor e ISBN.",1);
    if(year!==null&&(!Number.isInteger(year)||year<1000||year>new Date().getFullYear()+1))return say("Informe um ano de publicação válido.",1);
    if(!Number.isInteger(copies)||copies<1)return say("A quantidade de exemplares deve ser ao menos 1.",1);
    if(db.books.some(b=>b.isbn.toLowerCase()===isbn.toLowerCase()))return say("Já existe um livro com esse ISBN.",1);
    try{
      await api.cadastrarLivro(f);
      await refresh();
      setAdding(false);
      say("Livro cadastrado!");
      return true;
    }catch(e){
      say(e.message||"Não foi possível cadastrar o livro.",1);
      return false;
    }
  }

  // RF3
  async function lend(bookId,leitorId){
    const r=reader(leitorId);
    const b=book(bookId);
    if(!r)return say("Selecione um leitor.",1);
    if(!b)return say("Livro não encontrado.",1);
    if(avail(b)<1)return say("Não há exemplares disponíveis.",1);
    if(db.loans.filter(l=>l.readerId===r.id&&!l.returned).length>=2)return say(r.name+" já tem 2 empréstimos ativos.",1);
    try{
      const criado=await api.emprestar(bookId,leitorId);
      await refresh();
      say("Empréstimo feito para "+r.name+". Devolução até "+fmt(criado.due)+".");
      return true;
    }catch(e){
      say(e.message||"Não foi possível realizar o empréstimo.",1);
      return false;
    }
  }

  // RF4
  async function giveBack(id){
    try{
      await api.devolver(id);
      await refresh();
      setSelLoan(null);
      say("Devolução registrada em "+fmt(today)+".");
    }catch(e){
      say(e.message||"Não foi possível registrar a devolução.",1);
    }
  }

  const titles={livros:"Livros",emprestimos:"Empréstimo"};
  const showSearch=(route==="livros"&&!sel&&!adding)||(route==="emprestimos"&&!selLoan);

  if(!session)return (<>
    {authView==="login"&&(<Login onLogin={login} onShowRegister={()=>setAuthView("register")} onShowForgot={()=>setAuthView("forgot")} initialUser={authUser}/>)}
    {authView==="register"&&(<Register onRegister={register} onBack={()=>setAuthView("login")}/>)}
    {authView==="forgot"&&(<ForgotPassword onSendCode={api.esqueciSenha} onReset={resetPassword} onBack={()=>setAuthView("login")}/>)}
    {toast&&(<div className={"toast"+(toast.bad?" bad":"")} role="status">{toast.msg}</div>)}
  </>);

  return (<div className="app">
    <nav aria-label="Menu">
      {["livros","emprestimos"].map(n=>(<button key={n} className={route===n?"on":""} onClick={()=>go(n)} aria-label={titles[n]} title={titles[n]}><Icon n={n}/></button>))}
    </nav>
    <main>
      <header>
        <div className="logo"><img src={logo} alt="Logo Biblioteca Luiz Brasil" className="logo-img"/><div>BIBLIOTECA<small>Luiz Brasil</small></div></div>
        <div className="hi"><span>Olá, {session.nome||session.usuario}!</span><div className="av">👤</div><button className="btn alt sm" onClick={logout}>Sair</button></div>
      </header>
      <div className="titlebar">
        <h1>{adding?"Cadastro de novo livro":titles[route]}</h1>
        {showSearch&&(<input className="search" placeholder={route==="livros"?"Buscar por título ou autor...":"Buscar por livro ou leitor..."} value={q} onInput={e=>setQ(e.target.value)} aria-label="Buscar"/>)}
        {route==="livros"&&!sel&&!adding&&(<button className="btn" onClick={()=>setAdding(true)}>+ Novo livro</button>)}
      </div>

      {loading&&db.books.length===0?(<div className="empty">Carregando dados do servidor...</div>):(<>
        {route==="livros"&&(adding?(<AddBook onSave={addBook} onCancel={()=>setAdding(false)}/>):
          sel?(<BookDetail b={book(sel)} loans={db.loans.filter(l=>l.bookId===sel&&!l.returned)} reader={reader} readers={db.readers} onLend={lend} back={()=>setSel(null)} status={status}/>):
          (<Books db={db} q={q} tab={tab} setTab={setTab} open={setSel}/>))}
        {route==="emprestimos"&&(selLoan?(<LoanDetail l={db.loans.find(l=>l.id===selLoan)} book={book} reader={reader} status={status} onReturn={giveBack} back={()=>setSelLoan(null)}/>):
          (<Loans db={db} q={q} tab={tab} setTab={setTab} status={status} book={book} reader={reader} open={setSelLoan}/>))}
      </>)}
    </main>
    {toast&&(<div className={"toast"+(toast.bad?" bad":"")} role="status">{toast.msg}</div>)}
  </div>);
}
