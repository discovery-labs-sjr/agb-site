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
 ["Thé Lipton","pause","photo-1544787219-7f47̄8d1b3d2"],["Café","pause","photo-1509042239860-f550ce710b93"],["Crêpes","pause","photo-1519676867240-f03562e64548"],["Croissants","pause","photo-1555507036-ab1f4038808a"],
 ["Mini-sandwich foie","pause","photo-1528735602780-2552fd46c7af"],["Sandwich saucisse","pause","photo-1553909489-cd47e0ef937f"],["Pastels","pause","photo-1601050690597-df0568f70950"],["Gâteau au four","boissons","photo-1578985545062-69928b1d9587"],
 ["Pain aux raisins","pause","photo-1509440159596-0249088772ff"],["Riz & accompagnement","repas","photo-1512058564366-18510be2db19"],["Couscous","repas","photo-1512621776951-a57141f2eefd"],["Jus naturels","boissons","photo-1546173159-315724a31696"]
].map(([name,category,id],i)=>({id:"demo-"+i,name,description:"Exemple de présentation — détails à compléter dans l’espace administrateur.",category,price:null,photo:demoPhoto(id),position:"50% 50%",demo:true}));

const $ = id => document.getElementById(id);
const explorer=$("explorer"), scene=$("scene-window"), track=$("scene-track"), list=$("related-list");
let pauses=PAUSES.map((x,i)=>({...x,id:"pause-"+i}));
let products=[...DEMO_PRODUCTS], activeCategory="all", p=0, target=0, lastFrame=0, raf=0, wheelTimer=0, drag=null, basket=0, reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
const mod=(n,m)=>((n%m)+m)%m;
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const KX=[-1.12,-.82,-.52,-.22,0,.22,.52];
const KF=[12,8,5,2,0,2,5], KH=[.66,.78,.9,1,1.08,1,.9], KB=[.25,.42,.62,.86,1,.86,.62], KO=[.18,.35,.58,.82,1,.82,.58];
const wa=(text)=>"https://wa.me/"+WHATSAPP+"?text="+encodeURIComponent(text);
function currentProducts(){const rows=products.filter(x=>activeCategory==="all"||x.category===activeCategory);return rows.length?rows:products}
function photoFor(row){if(row.photo)return row.photo;if(row.image_path)return supabase.storage.from("agb-products").getPublicUrl(row.image_path).data.publicUrl;return ""}
function syncScene(){const base=Math.floor(p),fraction=p-base;const selected=pauses[mod(Math.round(target),pauses.length)];$("scene-title").textContent=selected.nom;$("scene-description").textContent=selected.description;$("scene-counter").textContent=String(mod(Math.round(p),pauses.length)+1).padStart(2,"0")+" / 06";$("scene-number").textContent=String(mod(Math.round(p),pauses.length)+1).padStart(2,"0");$("scene-order").href=wa("Bonjour AGB, je souhaite commander ou obtenir des informations concernant : "+selected.nom+".");}
function buildScene(){track.innerHTML="";pauses.forEach((pause,i)=>{const card=document.createElement("article");card.className="scene-card";card.dataset.index=i;const img=document.createElement("img");img.src=photoFor(pause);img.alt=pause.nom+" — visuel de présentation";img.width=800;img.height=1000;img.loading=i===0?"eager":"lazy";img.style.objectPosition=pause.position||"50% 50%";card.append(img);const shade=document.createElement("span");shade.className="scene-shade";card.append(shade);track.append(card)});layoutScene();syncScene()}
function layoutScene(){const cards=[...track.children];cards.forEach(card=>{let offset=Number(card.dataset.index)-p;const n=pauses.length;if(offset>n/2)offset-=n;if(offset< -n/2)offset+=n;const step=clamp(Math.round(offset),-1,5);const idx=step+1;const x=KX[idx]??0,blur=KF[idx]??0,h=KH[idx]??1,bright=KB[idx]??1,opacity=KO[idx]??0;card.style.transform=`translate3d(calc(-50% + ${x*100}%), -50%, 0) scale(${h})`;card.style.zIndex=String(10-Math.abs(step));card.style.filter=`blur(${blur/1.2}px)`;card.style.opacity=String(opacity*bright)});}
function animate(time){if(!lastFrame)lastFrame=time;const dt=Math.min(50,time-lastFrame);lastFrame=time;if(reduced)p=target;else p+=(target-p)*(1-Math.exp(-dt*.0072));if(Math.abs(target-p)<.0008)p=target;layoutScene();syncScene();renderRail();if(p!==target||drag)raf=requestAnimationFrame(animate);else{raf=0;lastFrame=0}}
function go(value,snap=false){target=value;if(snap)target=Math.round(target);if(!raf)raf=requestAnimationFrame(animate)}
function renderRail(){const rows=currentProducts().slice(0,12);if(!rows.length)return;const center=mod(Math.round(p*2),rows.length);list.innerHTML="";for(let d=-1;d<=1;d++){const idx=mod(center+d,rows.length),item=rows[idx],card=document.createElement("article");card.className="rail-card"+(d===0?" selected":"");card.dataset.product=item.id;const thumb=document.createElement("button");thumb.className="rail-photo";thumb.type="button";thumb.setAttribute("aria-label","Voir "+item.name);const img=document.createElement("img");img.src=photoFor(item);img.alt=item.name;img.width=180;img.height=180;img.loading="lazy";img.style.objectPosition=item.position||"50% 50%";thumb.append(img);thumb.addEventListener("click",()=>go(idx/2,true));const info=document.createElement("div");info.className="rail-copy";const name=document.createElement("strong");name.textContent=item.name;const price=document.createElement("small");price.textContent=item.price==null?"Prix sur demande":Number(item.price).toLocaleString("fr-FR")+" "+DEVISE;info.append(name,price);const add=document.createElement("button");add.className="add-product";add.type="button";add.textContent="+";add.setAttribute("aria-label","Ajouter "+item.name+" au panier");add.addEventListener("click",()=>{basket++;$("basket-count").textContent="Panier ("+basket+")";});card.append(thumb,info,add);list.append(card)}$("rail-count").textContent=String(rows.length).padStart(2,"0")+" ARTICLES";$("rail-category").textContent=activeCategory==="all"?"NOS PROPOSITIONS":activeCategory.toUpperCase()}
function openExplorer(category){activeCategory=category||"all";p=target=0;buildScene();renderRail();explorer.classList.add("open");explorer.setAttribute("aria-hidden","false");document.body.style.overflow="hidden";$("back").focus();if(!raf)raf=requestAnimationFrame(animate)}
function closeExplorer(){explorer.classList.remove("open");explorer.setAttribute("aria-hidden","true");document.body.style.overflow="";if(raf)cancelAnimationFrame(raf);raf=0;lastFrame=0}
function renderDBRows(dbProducts,dbPauses,dbCategories){if(dbPauses?.length){pauses=dbPauses.slice(0,6).map(x=>({id:x.id,nom:x.title,description:x.description||"Une proposition AGB à découvrir.",photo:x.image_path?supabase.storage.from("agb-products").getPublicUrl(x.image_path).data.publicUrl:PAUSES[0].photo,position:x.image_position||"50% 50%"}))}if(dbProducts?.length){products=dbProducts.slice(0,12).map(x=>({id:x.id,name:x.name,description:x.description,category:x.categories?.slug||"all",price:x.price,photo:x.image_path?supabase.storage.from("agb-products").getPublicUrl(x.image_path).data.publicUrl:"",position:x.image_position||"50% 50%",demo:false}))}else products=[...DEMO_PRODUCTS];}
async function loadPublicCatalog(){try{const [pRes,hRes,cRes]=await Promise.all([supabase.from("products").select("id,name,description,price,image_path,image_position,sort_order,categories(slug)").eq("is_active",true).order("sort_order").limit(12),supabase.from("pauses").select("id,title,description,image_path,image_position,sort_order").eq("is_active",true).order("sort_order").limit(6),supabase.from("categories").select("id,slug,name").eq("is_active",true)]);if(!pRes.error&&!hRes.error&&!cRes.error)renderDBRows(pRes.data,hRes.data,cRes.data)}catch(e){console.info("Catalogue de démonstration affiché.",e)}}
document.querySelectorAll("[data-category]").forEach(btn=>btn.addEventListener("click",()=>openExplorer(btn.dataset.category)));
$("back").addEventListener("click",closeExplorer);$("close").addEventListener("click",closeExplorer);
document.addEventListener("keydown",e=>{if(!explorer.classList.contains("open"))return;if(e.key==="Escape")closeExplorer();if(["ArrowDown","ArrowRight"].includes(e.key)){e.preventDefault();go(Math.round(target)+1,true)}if(["ArrowUp","ArrowLeft"].includes(e.key)){e.preventDefault();go(Math.round(target)-1,true)}});
scene.addEventListener("pointerdown",e=>{if(e.pointerType==="mouse"&&e.button!==0)return;drag={x:e.clientX,start:target,id:e.pointerId};scene.classList.add("dragging");scene.setPointerCapture(e.pointerId)});
scene.addEventListener("pointermove",e=>{if(!drag)return;const dx=e.clientX-drag.x;go(drag.start-dx/Math.max(150,scene.clientWidth*.2))});
function endDrag(e){if(!drag)return;drag=null;scene.classList.remove("dragging");go(Math.round(target),true)}
scene.addEventListener("pointerup",endDrag);scene.addEventListener("pointercancel",endDrag);
scene.addEventListener("wheel",e=>{e.preventDefault();target+=clamp(e.deltaY+e.deltaX,-120,120)/420;if(wheelTimer)clearTimeout(wheelTimer);wheelTimer=setTimeout(()=>go(Math.round(target),true),150);if(!raf)raf=requestAnimationFrame(animate)},{passive:false});
const menu=document.querySelector(".menu-toggle"),nav=document.querySelector(".nav");menu.addEventListener("click",()=>{const open=nav.classList.toggle("open");menu.setAttribute("aria-expanded",String(open));menu.textContent=open?"×":"☰"});nav.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>{nav.classList.remove("open");menu.setAttribute("aria-expanded","false");menu.textContent="☰"}));$("year").textContent=new Date().getFullYear();
loadPublicCatalog();
