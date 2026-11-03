import {useState} from "react";
import {norm,fmt} from "../utils";

export function Books({db,q,tab,setTab,open}){
  const list=db.books.filter(b=>{
    const m=!q||norm(b.title).includes(norm(q))||norm(b.author).includes(norm(q));
    const a=Math.max(0,b.available??0);
    return m&&(tab==="todos"||(tab==="disp"&&a>0)||(tab==="indisp"&&a<1));
  });
  return (<div>
    <div className="tabs">{[["todos","Todos"],["disp","Disponíveis"],["indisp","Indisponíveis"]].map(([k,t])=>(<button key={k} className={tab===k?"on":""} onClick={()=>setTab(k)}>{t}</button>))}</div>
    {list.length===0?(<div className="empty">Nenhum livro encontrado.</div>):
    (<div className="grid">{list.map(b=>{const a=Math.max(0,b.available??0);return (<button className="card bk" key={b.id} onClick={()=>open(b.id)}>
      <div className="cover"></div><div className="bt">{b.title}</div><div>{b.author}</div>
      <div className={"sm "+(a>0?"ok":"no")}>{a>0?"Disponível":"Indisponível"}: {a} de {b.copies}</div></button>)})}</div>)}
  </div>);
}

export function BookDetail({b,loans,reader,readers,onLend,back,status}){
  const[leitorId,setLeitorId]=useState("");
  const[saving,setSaving]=useState(false);
  const a=Math.max(0,b.available??0);
  const selecionado=leitorId?reader(Number(leitorId)):null;

  const submit=async e=>{
    e.preventDefault();
    if(!leitorId||saving)return;
    setSaving(true);
    const ok=await onLend(b.id,Number(leitorId));
    if(ok)setLeitorId("");
    setSaving(false);
  };

  return (<div className="two">
    <div>
      <div style={{display:"flex",gap:20,alignItems:"center",flexWrap:"wrap"}}>
        <div className="cover big"></div>
        <div><h2 style={{fontSize:26}}>{b.title}</h2><div style={{fontSize:18}}>{b.author}</div></div>
      </div>
      <h3 style={{marginTop:30}}>Realizar empréstimo</h3>
      <form onSubmit={submit}>
        <label htmlFor="leitor">Leitor</label>
        <select id="leitor" className="f" value={leitorId} onChange={e=>setLeitorId(e.target.value)}>
          <option value="">Selecione o leitor...</option>
          {readers.map(r=>(<option key={r.id} value={r.id}>{r.name}</option>))}
        </select>
        {selecionado&&(<div className="sm">Leitor: {selecionado.name}</div>)}
        <div className="row">
          <button className="btn g" type="submit" disabled={a<1||!leitorId||saving} style={{opacity:a<1||!leitorId||saving?.5:1}}>
            {saving?"Salvando...":"Salvar"}
          </button>
          <button className="btn alt" type="button" onClick={back}>Voltar</button>
        </div>
      </form>
      {a<1&&(<div className="no" style={{marginTop:8}}>Sem exemplares disponíveis.</div>)}
      <div className="sm" style={{marginTop:8}}>Prazo: 14 dias a partir de hoje. Máximo de 2 empréstimos ativos por leitor.</div>
    </div>
    <div>
      <div className="panel">
        <h3 style={{margin:"0 0 10px"}}>INFORMAÇÕES ADICIONAIS</h3>
        <p>Total de exemplares – {b.copies}</p>
        <p>Exemplares disponíveis – {a}</p>
        <p>Status – {a>0?"Disponível":"Indisponível"}</p>
        <p>Gênero: {b.genre||"—"}</p>
        <p>Editora: {b.publisher||"—"}</p>
        <p>Ano de publicação: {b.year||"—"}</p>
        <p>ISBN: {b.isbn}</p>
      </div>
      <h3>Empréstimos em andamento</h3>
      {loans.length===0?(<div className="sm">Nenhum.</div>):loans.map(l=>{const r=reader(l.readerId);return (
        <p key={l.id}>👤 {r?r.name:"Leitor removido"} — devolver até {fmt(l.due)} {status(l)==="Atrasado"&&(<span className="warn">◆ Atrasado</span>)}</p>
      )})}
    </div>
  </div>);
}

export function AddBook({onSave,onCancel}){
  const vazio={title:"",author:"",genre:"",publisher:"",year:"",isbn:"",copies:1};
  const[f,setF]=useState(vazio);
  const[saving,setSaving]=useState(false);
  const set=k=>e=>setF({...f,[k]:e.target.value});

  const submit=async e=>{
    e.preventDefault();
    if(saving)return;
    setSaving(true);
    const ok=await onSave(f);
    if(ok)setF(vazio);
    setSaving(false);
  };

  return (<form className="panel" style={{maxWidth:520,margin:"24px auto"}} onSubmit={submit}>
    <h3 style={{margin:0}}>ADICIONE AS INFORMAÇÕES</h3>
    <label>Título *<input className="f" required value={f.title} onInput={set("title")}/></label>
    <label>Nome do autor(a) *<input className="f" required value={f.author} onInput={set("author")}/></label>
    <label>Gênero<input className="f" value={f.genre} onInput={set("genre")}/></label>
    <label>Editora<input className="f" value={f.publisher} onInput={set("publisher")}/></label>
    <label>Ano de publicação<input className="f" type="number" min="1000" max={new Date().getFullYear()+1} value={f.year} onInput={set("year")}/></label>
    <label>ISBN (único) *<input className="f" required value={f.isbn} onInput={set("isbn")}/></label>
    <label>Exemplares disponíveis *<input className="f" type="number" min="1" required value={f.copies} onInput={set("copies")}/></label>
    <div className="sm" style={{marginTop:6}}>A disponibilidade é calculada pelo servidor a partir dos empréstimos ativos.</div>
    <div className="row">
      <button className="btn" type="submit" disabled={saving}>{saving?"Cadastrando...":"Cadastrar novo livro"}</button>
      <button className="btn alt" type="button" onClick={onCancel}>Cancelar</button>
    </div>
  </form>);
}
