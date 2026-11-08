import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

/* AGB — données modifiables. Les images ci-dessous sont des visuels fictifs.
   Les produits et pauses publiés dans l'espace admin remplacent automatiquement ces exemples. */
const WHATSAPP = "22676596496";
const DEVISE = "FCFA";
const INFOS = { horaires: "À confirmer", adresse: "Ouagadougou, Burkina Faso", telephone: "+226 76 59 64 96" };
const SUPABASE_URL = "https://dknihnqjwyluanqvylfu.supabase.co";
const SUPABASE_KEY = "sb_publishable__8brYWj8mnD3sebQgGKpxA_WcCdWXQk";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const demoPhoto = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1100&q=82`;
const PAUSES = [
 {nom:"Pause-café",description:"Une parenthèse chaleureuse autour de boissons et petites douceurs.",photo:demoPhoto("photo-1495474472287-4d71bcdd2085"),position:"50% 58%"},
 {nom:"Viennoiseries",description:"Des douceurs dorées pour commencer la journée avec gourmandise.",photo:demoPhoto("photo-1555507036-ab1f4038808a"),position:"50% 54%"},
 {nom:"Bouchées salées",description:"Des formats à partager pour vos réunions et moments de convivialité.",photo:demoPhoto("photo-1528735602780-2552fd46c7af"),position:"50% 50%"},
 {nom:"Pause déjeuner",description:"Une pause généreuse pour reprendre la journée du bon pied.",photo:demoPhoto("photo-1547592180-85f173990554"),position:"50% 52%"},
 {nom:"Saveurs locales",description:"Des recettes inspirées des habitudes et saveurs du Burkina.",photo:demoPhoto("photo-1512621776951-a57141f2eefd"),position:"50% 50%"},
 {nom:"Boissons & douceurs",description:"Une touche fraîche et sucrée pour prolonger le plaisir.",photo:demoPhoto("photo-1546173159-315724a31696"),position:"50% 50%"}
];
const DEMO_PRODUCTS = [
 ["Thé Lipton","pause","photo-1544787219-7f47-8d1b3d2"],["Café","pause","photo-1509042239860-f550ce710b93"],["Crêpes","pause","photo-1519676867240-f03562e64548"],["Croissants","pause","photo-1555507036-ab1f4038808a"],
 ["Mini-sandwich foie","pause","photo-1528735602780-2552fd46c7af"],["Sandwich saucisse","pause","photo-1553909489-cd47e0ef937f"],["Pastels","pause","photo-1601050690597-df0568f70950"],["Gâteau au four","boissons","photo-1578985545062-69928b1d9587"],
 ["Pain aux raisins","pause","photo-1509440159596-0249088772ff"],["Riz & accompagnement","repas","photo-1512058564366-18510be2db19"],["Couscous","repas","photo-1512621776951-a57141f2eefd"],["Jus naturels","boissons","photo-1546173159-315724a31696"]
].map(([name,category,id],i)=>({id:"demo-"+i,name,description:"Exemple de présentation — détails à compléter dans l’espace administrateur.",category,price:null,photo:demoPhoto(id),position:"50% 50%",demo:true}));

const $ = id => document.getElementById(id);
const explorer=$("explorer"), scene=$("scene-window"), track=$("scene-track"), list=$("related-list");
let pauses=PAUSES.map((x,i)=>({...x,id:"pause-"+i}));
let products=[...DEMO_PRODUCTS], activeCategory="all", p=0, target=0, lastFrame=0, raf=0, wheelTimer=0, drag=null, basket=0, reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
const mod=(n,m)=>((n%m)+m)%m;
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
// Courbes de profondeur reprises du HTML de référence Pause Café.
const KX=[1.2,.744,.496,.346,.235,.15,.085];
const KF=[1.14,.89,.777,.704,.651,.616,.59];
const KH=[1.18,.832,.574,.436,.334,.258,.19];
const KB=[0,0,1.5,4,8,12,17], KO=[1,1,1,1,.86,.5,0];
const SCENE_RATIO=.7;
const wa=(text)=>"https://wa.me/"+WHATSAPP+"?text="+encodeURIComponent(text);
function currentProducts(){const rows=products.filter(x=>activeCategory==="all"||x.category===activeCategory);return rows.length?rows:products}
function photoFor(row){if(row.photo)return row.photo;if(row.image_path)return supabase.storage.from("agb-products").getPublicUrl(row.image_path).data.publicUrl;return ""}
let displayedScene=-1,captionTimer=0;
function syncScene(){
 const index=mod(Math.round(p),pauses.length),selected=pauses[index];
 if(index!==displayedScene){
  displayedScene=index;
  const caption=document.querySelector(".scene-caption");
  caption.classList.add("changing");
  if(captionTimer)clearTimeout(captionTimer);
  captionTimer=setTimeout(()=>{
   $("scene-title").textContent=selected.nom;
   $("scene-description").textContent=selected.description;
   $("scene-order").href=wa("Bonjour AGB, je souhaite commander ou obtenir des informations concernant : "+selected.nom+".");
   caption.classList.remove("changing");
  },reduced?0:130);
 }
 $("scene-counter").textContent=String(index+1).padStart(2,"0")+" / 06";
 $("scene-number").textContent=String(index+1).padStart(2,"0");
}
let sceneBase=0,sceneWidth=0,sceneHeight=0,railCardSize=0,railCards=[];
function resizeExplorer(){
 sceneWidth=scene.clientWidth;sceneHeight=scene.clientHeight;
 sceneBase=sceneHeight*1.2;
 [...track.children].forEach(card=>{
  card.style.width=(sceneBase*SCENE_RATIO)+"px";
  card.style.height=sceneBase+"px";
 });
 const mobile=matchMedia("(max-width:800px)").matches;
 railCardSize=mobile?160:(list.clientHeight/3);
 railCards.forEach(card=>{
  if(mobile){card.style.width="160px";card.style.height="100%";}
  else{card.style.width="100%";card.style.height=railCardSize+"px";}
 });
 layoutScene();layoutRail();
}
function buildScene(){
 track.innerHTML="";
 pauses.forEach((pause,i)=>{
  const card=document.createElement("article");
  card.className="scene-card";card.dataset.index=i;
  const img=document.createElement("img");
  img.src=photoFor(pause);img.alt=pause.nom+" — visuel de présentation";
  img.width=800;img.height=1000;img.loading=i===0?"eager":"lazy";
  img.draggable=false;img.style.objectPosition=pause.position||"50% 50%";
  card.append(img);const shade=document.createElement("span");shade.className="scene-shade";card.append(shade);track.append(card);
 });
 resizeExplorer();syncScene();
}
function layoutScene(){
 if(!sceneWidth||!sceneHeight||!sceneBase)return;
 const cards=[...track.children],n=pauses.length;
 cards.forEach((card,i)=>{
  const d=mod(i-p,n);
  const k=clamp(d+1,0,6),a=Math.floor(k),b=Math.min(6,a+1),t=k-a;
  const mix=arr=>arr[a]+(arr[b]-arr[a])*t;
  const h=mix(KH)*sceneHeight,scale=h/sceneBase,w=sceneBase*SCENE_RATIO;
  const x=mix(KX)*sceneWidth-w/2,y=mix(KF)*sceneHeight-h;
  card.style.transform=`translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) scale(${scale.toFixed(4)})`;
  card.style.zIndex=String(100-Math.round(d*10));
  const blur=mix(KB)/Math.max(scale,.01);
  const filter=blur<.2?"none":`blur(${blur.toFixed(1)}px)`;
  if(card.dataset.filter!==filter){card.style.filter=filter;card.dataset.filter=filter;}
  const opacity=mix(KO).toFixed(3);
  if(card.dataset.opacity!==opacity){card.style.opacity=opacity;card.dataset.opacity=opacity;}
 });
}
function buildRail(){
 const rows=currentProducts().slice(0,12);
 list.innerHTML="";railCards=[];
 rows.forEach((item,idx)=>{
  const card=document.createElement("article");card.className="rail-card";card.dataset.product=item.id;
  const thumb=document.createElement("div");thumb.className="rail-photo";
  const img=document.createElement("img");img.src=photoFor(item);img.alt=item.name;img.width=180;img.height=180;img.loading="lazy";img.draggable=false;img.style.objectPosition=item.position||"50% 50%";thumb.append(img);
  const info=document.createElement("div");info.className="rail-copy";
  const name=document.createElement("strong");name.textContent=item.name;
  const price=document.createElement("small");price.textContent=item.price==null?"Prix sur demande":Number(item.price).toLocaleString("fr-FR")+" "+DEVISE;
  info.append(name,price);
  const add=document.createElement("button");add.className="add-product";add.type="button";add.textContent="+";
  add.dataset.product=item.id;add.setAttribute("aria-label","Ajouter "+item.name+" au panier");
  card.append(thumb,info,add);list.append(card);railCards.push(card);
 });
 $("rail-count").textContent=String(rows.length).padStart(2,"0")+" ARTICLES";
 $("rail-category").textContent=activeCategory==="all"?"NOS PROPOSITIONS":activeCategory.toUpperCase();
 resizeExplorer();
}
function layoutRail(){
 if(!railCards.length||!railCardSize)return;
 const mobile=matchMedia("(max-width:800px)").matches,all=railCardSize*railCards.length;
 railCards.forEach((card,i)=>{
  let offset=mod(i*railCardSize-p*2*railCardSize,all);
  if(offset>all-railCardSize)offset-=all;
  card.style.transform=mobile?`translate3d(${offset.toFixed(1)}px,0,0)`:`translate3d(0,${offset.toFixed(1)}px,0)`;
 });
}
function animate(time){
 if(!lastFrame)lastFrame=time;
 const dt=Math.min(50,time-lastFrame);lastFrame=time;
 if(reduced)p=target;else p+=(target-p)*(1-Math.exp(-dt*.0072));
 if(Math.abs(target-p)<.0008)p=target;
 layoutScene();layoutRail();syncScene();
 if(p!==target||drag)raf=requestAnimationFrame(animate);else{raf=0;lastFrame=0;}
}
function go(value,snap=false){target=value;if(snap)target=Math.round(target);if(!raf)raf=requestAnimationFrame(animate)}
let basketItems=new Map();
list.addEventListener("click",e=>{
 const add=e.target.closest(".add-product");if(!add)return;
 const id=add.dataset.product;
 basketItems.set(id,(basketItems.get(id)||0)+1);
 basket++;
 $("basket-count").textContent="Panier ("+basket+")";
 add.classList.add("added");add.textContent="✓";
 add.setAttribute("aria-label","Article ajouté. Ajouter encore");
 setTimeout(()=>{if(add.isConnected){add.textContent="+";add.classList.remove("added");add.setAttribute("aria-label","Ajouter "+(add.closest(".rail-card")?.querySelector("strong")?.textContent||"cet article")+" au panier");}},650);
});
function renderRail(){buildRail()}
function openExplorer(category){
 activeCategory=category||"all";p=target=0;displayedScene=-1;
 explorer.classList.add("open");explorer.setAttribute("aria-hidden","false");
 document.body.style.overflow="hidden";
 buildScene();renderRail();resizeExplorer();
 $("back").focus();
 if(!raf)raf=requestAnimationFrame(animate);
}
function closeExplorer(){explorer.classList.remove("open");explorer.setAttribute("aria-hidden","true");document.body.style.overflow="";if(raf)cancelAnimationFrame(raf);raf=0;lastFrame=0}
function renderDBRows(dbProducts,dbPauses,dbCategories){if(dbPauses?.length){const live=dbPauses.slice(0,6).map(x=>({id:x.id,nom:x.title,description:x.description||"Une proposition AGB à découvrir.",photo:x.image_path?supabase.storage.from("agb-products").getPublicUrl(x.image_path).data.publicUrl:PAUSES[0].photo,position:x.image_position||"50% 50%"}));pauses=[...live,...PAUSES.slice(live.length)].slice(0,6)}if(dbProducts?.length){const live=dbProducts.slice(0,12).map(x=>({id:x.id,name:x.name,description:x.description,category:x.categories?.slug||"all",price:x.price,photo:x.image_path?supabase.storage.from("agb-products").getPublicUrl(x.image_path).data.publicUrl:DEMO_PRODUCTS[0].photo,position:x.image_position||"50% 50%",demo:false}));products=[...live,...DEMO_PRODUCTS.slice(live.length)].slice(0,12)}else products=[...DEMO_PRODUCTS];if(explorer.classList.contains("open")){buildScene();renderRail();}}
async function loadPublicCatalog(){try{const [pRes,hRes,cRes]=await Promise.all([supabase.from("products").select("id,name,description,price,image_path,image_position,sort_order,categories(slug)").eq("is_active",true).order("sort_order").limit(12),supabase.from("pauses").select("id,title,description,image_path,image_position,sort_order").eq("is_active",true).order("sort_order").limit(6),supabase.from("categories").select("id,slug,name").eq("is_active",true)]);if(!pRes.error&&!hRes.error&&!cRes.error)renderDBRows(pRes.data,hRes.data,cRes.data)}catch(e){console.info("Catalogue de démonstration affiché.",e)}}
document.querySelectorAll("[data-category]").forEach(btn=>btn.addEventListener("click",()=>openExplorer(btn.dataset.category)));
$("back").addEventListener("click",closeExplorer);$("close").addEventListener("click",closeExplorer);
document.addEventListener("keydown",e=>{if(!explorer.classList.contains("open"))return;if(e.key==="Escape")closeExplorer();if(["ArrowDown","ArrowRight"].includes(e.key)){e.preventDefault();go(Math.round(target)+1,true)}if(["ArrowUp","ArrowLeft"].includes(e.key)){e.preventDefault();go(Math.round(target)-1,true)}});
scene.addEventListener("pointerdown",e=>{
 if(e.target.closest("a,button"))return;
 if(e.pointerType==="mouse"&&e.button!==0)return;
 drag={x:e.clientX,start:target,id:e.pointerId,moved:0};
 scene.classList.add("dragging");
 try{scene.setPointerCapture(e.pointerId)}catch(_){}
});
scene.addEventListener("pointermove",e=>{
 if(!drag)return;
 const dx=e.clientX-drag.x;drag.moved=Math.max(drag.moved,Math.abs(dx));
 target=drag.start+dx/Math.max(150,scene.clientWidth*.2);
 if(!raf)raf=requestAnimationFrame(animate);
});
function endDrag(e){
 if(!drag)return;
 const moved=drag.moved;
 drag=null;scene.classList.remove("dragging");
 if(moved<6){
  const hit=document.elementsFromPoint(e.clientX,e.clientY).find(el=>el.classList?.contains("scene-card"));
  if(hit){
   const current=Math.round(target),currentIndex=mod(current,pauses.length);
   let delta=mod(Number(hit.dataset.index)-currentIndex,pauses.length);
   if(delta>pauses.length/2)delta-=pauses.length;
   target=current+delta;
  }
 }else target=Math.round(target);
 if(!raf)raf=requestAnimationFrame(animate);
}
scene.addEventListener("pointerup",endDrag);scene.addEventListener("pointercancel",endDrag);
scene.addEventListener("wheel",e=>{
 e.preventDefault();target+=clamp(e.deltaY+e.deltaX,-120,120)/420;
 if(wheelTimer)clearTimeout(wheelTimer);
 wheelTimer=setTimeout(()=>{target=Math.round(target);if(!raf)raf=requestAnimationFrame(animate)},150);
 if(!raf)raf=requestAnimationFrame(animate);
},{passive:false});
window.addEventListener("resize",()=>{if(explorer.classList.contains("open"))resizeExplorer()});
const menu=document.querySelector(".menu-toggle"),nav=document.querySelector(".nav");menu.addEventListener("click",()=>{const open=nav.classList.toggle("open");menu.setAttribute("aria-expanded",String(open));menu.textContent=open?"×":"☰"});nav.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>{nav.classList.remove("open");menu.setAttribute("aria-expanded","false");menu.textContent="☰"}));$("year").textContent=new Date().getFullYear();
const cursor=document.createElement("span");cursor.className="agb-cursor";cursor.setAttribute("aria-hidden","true");document.body.append(cursor);if(matchMedia("(hover: hover) and (pointer: fine)").matches){document.addEventListener("pointermove",e=>{cursor.style.transform=`translate3d(${e.clientX}px,${e.clientY}px,0) translate(-50%,-50%)`;cursor.classList.add("visible")});scene.addEventListener("pointerdown",()=>cursor.classList.add("pressed"));scene.addEventListener("pointerup",()=>cursor.classList.remove("pressed"));scene.addEventListener("pointerleave",()=>cursor.classList.remove("visible"));document.querySelectorAll("button,a").forEach(el=>{el.addEventListener("pointerenter",()=>cursor.classList.add("hover"));el.addEventListener("pointerleave",()=>cursor.classList.remove("hover"))})}loadPublicCatalog();
