export const DAY=86400000;

export const getRoute=()=>{
  const h=location.hash.slice(1);
  return ["livros","emprestimos"].includes(h)?h:"livros";
};

export const iso=d=>{
  const x=new Date(d);
  return x.getFullYear()+"-"+String(x.getMonth()+1).padStart(2,"0")+"-"+String(x.getDate()).padStart(2,"0");
};

export const fmt=s=>{
  if(!s)return "—";
  const [y,m,d]=s.split("-");
  return new Date(y,m-1,d).toLocaleDateString("pt-BR",{day:"numeric",month:"short",year:"numeric"});
};

export const digits=s=>String(s??"").replace(/\D/g,"");

export const norm=s=>String(s??"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
