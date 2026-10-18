const API="https://api.jolpi.ca/ergast/f1/",$=id=>document.getElementById(id);
// Запасные данные 2026 (после Гран-при Сингапура), если архив недоступен
const FB=[["Kimi_Antonelli","Kimi Antonelli","Mercedes",340],["George_Russell_(racing_driver)","George Russell","Mercedes",238],["Lewis_Hamilton","Lewis Hamilton","Ferrari",229],["Max_Verstappen","Max Verstappen","Red Bull",221],["Charles_Leclerc","Charles Leclerc","Ferrari",215],["Lando_Norris","Lando Norris","McLaren",201],["Oscar_Piastri","Oscar Piastri","McLaren",138],["Isack_Hadjar","Isack Hadjar","Red Bull",97],["Liam_Lawson","Liam Lawson","Racing Bulls",75],["Pierre_Gasly","Pierre Gasly","Alpine",41],["Arvid_Lindblad","Arvid Lindblad","Racing Bulls",38],["Franco_Colapinto","Franco Colapinto","Alpine",27],["Oliver_Bearman","Oliver Bearman","Haas",23],["Nico_Hülkenberg","Nico Hülkenberg","Audi",13],["Gabriel_Bortoleto","Gabriel Bortoleto","Audi",10],["Esteban_Ocon","Esteban Ocon","Haas",7],["Fernando_Alonso","Fernando Alonso","Aston Martin",7],["Carlos_Sainz_Jr.","Carlos Sainz","Williams",7],["Alexander_Albon","Alex Albon","Williams",5],["Yuki_Tsunoda","Yuki Tsunoda","Racing Bulls",1],["Lance_Stroll","Lance Stroll","Aston Martin",0],["Valtteri_Bottas","Valtteri Bottas","Cadillac",0],["Sergio_Pérez","Sergio Pérez","Cadillac",0]];
const WC={},esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const wiki=t=>WC[t]||(WC[t]=fetch("https://en.wikipedia.org/api/rest_v1/page/summary/"+encodeURIComponent(t)).then(r=>r.json()).catch(()=>({})));
const color=s=>{let h=0;for(const c of s)h=(h*31+c.charCodeAt(0))%360;return `hsl(${h} 55% 40%)`};
let list=[],token=0;
$("yr").innerHTML=Array.from({length:77},(_,i)=>2026-i).map(y=>`<option>${y}</option>`).join("");
const io="IntersectionObserver" in window?new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){io.unobserve(e.target);photo(e.target)}}),{rootMargin:"200px"}):null;
function photo(el){const d=list[+el.dataset.i];if(!d)return;wiki(d.wiki).then(w=>{const u=w.thumbnail&&w.thumbnail.source;if(u&&document.body.contains(el))el.innerHTML=`<img src="${esc(u)}" alt="Фото: ${esc(d.name)}">`})}
async function load(){
  const y=+$("yr").value,my=++token,note=$("note");
  note.textContent="Загружаю…";$("cards").innerHTML="";
  let fb=false;
  try{
    const j=await (await fetch(`${API}${y}/driverStandings.json?limit=100`)).json(),s=j.MRData.StandingsTable.StandingsLists[0];
    if(!s)throw 0;
    list=s.DriverStandings.map(d=>({pos:d.positionText,name:d.Driver.givenName+" "+d.Driver.familyName,team:d.Constructors.map(c=>c.name).join(", "),pts:d.points,wins:d.wins,wiki:decodeURIComponent(d.Driver.url.split("/").pop())}));
  }catch(e){
    if(y!==2026){if(my===token)note.textContent="Не удалось загрузить сезон "+y+" (архив недоступен).";return}
    fb=true;list=FB.map((f,i)=>({pos:i+1,name:f[1],team:f[2],pts:f[3],wins:"—",wiki:f[0]}));
  }
  if(my!==token)return;
  note.textContent=`Сезон ${y}: пилотов в таблице — ${list.length}.`+(fb?" Показаны данные после Гран-при Сингапура.":y===2026?" Сезон ещё идёт.":"");
  $("cards").innerHTML=list.map((d,i)=>`<button type="button" class="card" data-i="${i}" style="--c:${color(d.team)}" aria-label="${esc(d.name)}: подробнее"><div class="ph" data-i="${i}">${esc(d.name.split(" ").map(w=>w[0]).slice(0,2).join(""))}</div><b>${esc(d.name)}</b><small>${esc(d.pos)}-е место, ${esc(d.pts)} оч.</small></button>`).join("");
  document.querySelectorAll(".ph").forEach(el=>io?io.observe(el):photo(el));
}
$("yr").onchange=load;
$("cards").onclick=e=>{const b=e.target.closest(".card");if(!b)return;const d=list[+b.dataset.i],y=$("yr").value;
  $("dName").textContent=d.name;$("dTeam").textContent="Команда: "+d.team;$("dImg").src="";$("dImg").alt="Фото: "+d.name;$("bio").textContent="";
  $("stat").textContent=`Сезон ${y}: ${d.pos}-е место, ${d.pts} очков, побед: ${d.wins}.`;$("dlg").showModal();
  wiki(d.wiki).then(w=>{if($("dName").textContent!==d.name)return;if(w.thumbnail)$("dImg").src=w.thumbnail.source;$("bio").textContent=w.extract?"Википедия (англ.): "+w.extract:""})};
$("dClose").onclick=()=>$("dlg").close();$("dlg").onclick=e=>{if(e.target===$("dlg"))$("dlg").close()};
load();
