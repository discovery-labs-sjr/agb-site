const catalog={
 pause:{label:"PAUSE-CAFÉ",items:[
  {name:"Café & douceurs",desc:"Une pause chaleureuse accompagnée de petites douceurs à partager.",type:"coffee"},
  {name:"Viennoiseries",desc:"Des bouchées gourmandes pour bien commencer la journée.",type:"dessert"},
  {name:"Mini-sandwichs",desc:"Une option salée, pratique et savoureuse pour vos réunions.",type:"meal"},
  {name:"Jus frais",desc:"Une touche de fraîcheur pour accompagner votre pause.",type:"juice"}]},
 repas:{label:"PAUSE DÉJEUNER",items:[
  {name:"Plats du jour",desc:"Des repas généreux pour une vraie pause déjeuner.",type:"meal"},
  {name:"Cuisine locale",desc:"Des saveurs inspirées des traditions culinaires locales.",type:"meal"},
  {name:"Formules déjeuner",desc:"Une solution pratique pour vos équipes et rendez-vous.",type:"dessert"},
  {name:"Boissons fraîches",desc:"Pour accompagner votre repas avec fraîcheur.",type:"juice"}]},
 boissons:{label:"BOISSONS & DOUCEURS",items:[
  {name:"Jus naturels",desc:"Des boissons fruitées pour un moment rafraîchissant.",type:"juice"},
  {name:"Desserts",desc:"Une note sucrée pour terminer sur une belle impression.",type:"dessert"},
  {name:"Gourmandises",desc:"De petites attentions à partager à tout moment.",type:"dessert"},
  {name:"Boissons maison",desc:"Des boissons à découvrir selon vos envies.",type:"coffee"}]}
};
const explorer=document.getElementById('explorer'),list=document.getElementById('related-list');
let currentCategory='pause',currentIndex=0;
const waBase='https://wa.me/22676596496?text=';
function openExplorer(category){currentCategory=category;currentIndex=0;renderExplorer();explorer.classList.add('open');explorer.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';document.getElementById('back').focus()}
function closeExplorer(){explorer.classList.remove('open');explorer.setAttribute('aria-hidden','true');document.body.style.overflow=''}
function renderExplorer(){
 const data=catalog[currentCategory],item=data.items[currentIndex];
 document.getElementById('product-kicker').textContent=data.label+' / SÉLECTION';
 document.getElementById('product-name').textContent=item.name;
 document.getElementById('product-description').textContent=item.desc;
 document.getElementById('product-count').textContent=String(currentIndex+1).padStart(2,'0')+' / '+String(data.items.length).padStart(2,'0');
 document.getElementById('related-total').textContent=String(data.items.length).padStart(2,'0')+' ARTICLES';
 const art=document.getElementById('product-art');art.className='stage-illustration '+item.type;
 document.getElementById('product-order').href=waBase+encodeURIComponent('Bonjour AGB, je souhaite avoir des informations sur : '+item.name+'. Pouvez-vous me renseigner ?');
 list.innerHTML='';
 data.items.forEach((product,index)=>{
  const button=document.createElement('button');button.type='button';button.className='related-item'+(index===currentIndex?' active':'');button.setAttribute('aria-pressed',String(index===currentIndex));
  button.innerHTML='<span class="related-thumb '+product.type+'"><i></i></span><span><span class="related-name"></span><span class="related-meta">Découvrir le produit</span></span><span class="related-arrow">↗</span>';
  button.querySelector('.related-name').textContent=product.name;
  button.addEventListener('click',()=>{currentIndex=index;renderExplorer()});
  list.appendChild(button);
 });
}
document.querySelectorAll('[data-category]').forEach(card=>card.addEventListener('click',()=>openExplorer(card.dataset.category)));
document.getElementById('back').addEventListener('click',closeExplorer);
document.getElementById('close').addEventListener('click',closeExplorer);
document.addEventListener('keydown',event=>{if(!explorer.classList.contains('open'))return;if(event.key==='Escape')closeExplorer();if(event.key==='ArrowDown'||event.key==='ArrowRight'){event.preventDefault();currentIndex=(currentIndex+1)%catalog[currentCategory].items.length;renderExplorer()}if(event.key==='ArrowUp'||event.key==='ArrowLeft'){event.preventDefault();currentIndex=(currentIndex-1+catalog[currentCategory].items.length)%catalog[currentCategory].items.length;renderExplorer()}});
const menu=document.querySelector('.menu-toggle'),nav=document.querySelector('.nav');
menu.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));menu.textContent=open?'×':'☰'});
nav.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.textContent='☰'}));
document.getElementById('year').textContent=new Date().getFullYear();