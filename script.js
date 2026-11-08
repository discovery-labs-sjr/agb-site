const catalog = {
  pause: {
    label: "PAUSE-CAFÉ",
    intro: "Des instants chaleureux, à savourer et à partager.",
    items: [
      { name: "Café & douceurs", desc: "Une pause chaleureuse accompagnée de petites douceurs à partager.", type: "coffee", photo: "photo-1509042239860-f550ce710b93", note: "LE MOMENT CAFÉ" },
      { name: "Viennoiseries", desc: "Des bouchées gourmandes pour commencer la journée avec douceur.", type: "dessert", photo: "photo-1555507036-ab1f4038808a", note: "DOUCEUR DU MATIN" },
      { name: "Mini-sandwichs", desc: "Une option salée, pratique et savoureuse pour vos réunions.", type: "meal", photo: "photo-1528735602780-2552fd46c7af", note: "À PARTAGER" },
      { name: "Jus frais", desc: "Une touche de fraîcheur pour accompagner votre pause.", type: "juice", photo: "photo-1546173159-315724a31696", note: "FRAÎCHEUR" }
    ]
  },
  repas: {
    label: "PAUSE DÉJEUNER",
    intro: "Une parenthèse généreuse au milieu de la journée.",
    items: [
      { name: "Plats du jour", desc: "Des repas généreux pour une vraie pause déjeuner.", type: "meal", photo: "photo-1547592180-85f173990554", note: "LE RENDEZ-VOUS DU MIDI" },
      { name: "Cuisine locale", desc: "Des saveurs inspirées des traditions culinaires locales.", type: "meal", photo: "photo-1512621776951-a57141f2eefd", note: "SAVEURS D'ICI" },
      { name: "Formules déjeuner", desc: "Une solution pratique pour vos équipes et rendez-vous.", type: "sandwich", photo: "photo-1540189549336-e6e99c3679fe", note: "LA PAUSE COMPLÈTE" },
      { name: "Boissons fraîches", desc: "Pour accompagner votre repas avec fraîcheur.", type: "juice", photo: "photo-1546173159-315724a31696", note: "UNE TOUCHE DE FRAÎCHEUR" }
    ]
  },
  boissons: {
    label: "BOISSONS & DOUCEURS",
    intro: "Des notes fraîches et sucrées pour prolonger le plaisir.",
    items: [
      { name: "Jus naturels", desc: "Des boissons fruitées pour un moment rafraîchissant.", type: "juice", photo: "photo-1546173159-315724a31696", note: "FRAÎCHEUR NATURELLE" },
      { name: "Desserts", desc: "Une note sucrée pour terminer sur une belle impression.", type: "dessert", photo: "photo-1488477181946-6428a0291777", note: "LA NOTE SUCRÉE" },
      { name: "Gourmandises", desc: "De petites attentions à partager à tout moment.", type: "pastry", photo: "photo-1490645935967-10de6ba17061", note: "PETIT PLAISIR" },
      { name: "Boissons maison", desc: "Des boissons à découvrir selon vos envies.", type: "coffee", photo: "photo-1513558161293-c-da6e89d6b5f4", note: "À DÉCOUVRIR" }
    ]
  }
};

// Images d'ambiance illustratives, à remplacer par les photos réelles des produits AGB.
function photoUrl(id, width = 1200) {
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=85`;
}

const explorer = document.getElementById("explorer");
const list = document.getElementById("related-list");
const stage = document.getElementById("product-stage");
let currentCategory = "pause";
let currentIndex = 0;
let pointerStart = null;
let wheelLock = false;
const waBase = "https://wa.me/22676596496?text=";

function openExplorer(category) {
  currentCategory = category;
  currentIndex = 0;
  renderExplorer();
  explorer.classList.add("open");
  explorer.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  document.getElementById("back").focus();
}

function closeExplorer() {
  explorer.classList.remove("open");
  explorer.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function selectProduct(index) {
  const items = catalog[currentCategory].items;
  currentIndex = (index + items.length) % items.length;
  renderExplorer();
}

function renderExplorer() {
  const data = catalog[currentCategory];
  const item = data.items[currentIndex];
  document.getElementById("product-kicker").textContent = data.label + " / SÉLECTION";
  document.getElementById("product-name").textContent = item.name;
  document.getElementById("product-description").textContent = item.desc;
  document.getElementById("product-count").textContent =
    String(currentIndex + 1).padStart(2, "0") + " / " + String(data.items.length).padStart(2, "0");
  document.getElementById("related-total").textContent =
    String(data.items.length).padStart(2, "0") + " ARTICLES";
  document.querySelector(".related-foot").textContent = data.intro;

  const art = document.getElementById("product-art");
  art.className = "stage-illustration " + item.type;
  art.innerHTML = "";
  const image = document.createElement("img");
  image.className = "stage-photo";
  image.src = photoUrl(item.photo);
  image.alt = item.name + " — photo d'ambiance illustrative";
  image.loading = "eager";
  image.onerror = () => { image.hidden = true; art.classList.add("photo-unavailable"); };
  art.appendChild(image);
  const decor = document.createElement("span");
  decor.className = "stage-glint";
  decor.setAttribute("aria-hidden", "true");
  art.appendChild(decor);

  const orderText = "Bonjour AGB, je souhaite avoir des informations et connaître les disponibilités pour : " + item.name + ". Pouvez-vous me renseigner ?";
  document.getElementById("product-order").href = waBase + encodeURIComponent(orderText);

  list.innerHTML = "";
  data.items.forEach((product, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "related-item" + (index === currentIndex ? " active" : "");
    button.setAttribute("aria-pressed", String(index === currentIndex));
    button.setAttribute("aria-label", "Découvrir " + product.name);
    const thumb = document.createElement("span");
    thumb.className = "related-thumb " + product.type;
    const thumbImage = document.createElement("img");
    thumbImage.src = photoUrl(product.photo, 260);
    thumbImage.alt = "";
    thumbImage.loading = "lazy";
    thumbImage.onerror = () => { thumbImage.hidden = true; thumb.classList.add("thumb-fallback"); };
    thumb.appendChild(thumbImage);
    const copy = document.createElement("span");
    copy.className = "related-copy";
    const name = document.createElement("span");
    name.className = "related-name";
    name.textContent = product.name;
    const meta = document.createElement("span");
    meta.className = "related-meta";
    meta.textContent = index === currentIndex ? "EN CE MOMENT" : "Voir le produit";
    copy.append(name, meta);
    const arrow = document.createElement("span");
    arrow.className = "related-arrow";
    arrow.textContent = "↗";
    button.append(thumb, copy, arrow);
    button.addEventListener("click", () => selectProduct(index));
    list.appendChild(button);
  });
}

document.querySelectorAll("[data-category]").forEach(card => {
  card.addEventListener("click", () => openExplorer(card.dataset.category));
});
document.getElementById("back").addEventListener("click", closeExplorer);
document.getElementById("close").addEventListener("click", closeExplorer);

document.addEventListener("keydown", event => {
  if (!explorer.classList.contains("open")) return;
  if (event.key === "Escape") closeExplorer();
  if (event.key === "ArrowDown" || event.key === "ArrowRight") {
    event.preventDefault();
    selectProduct(currentIndex + 1);
  }
  if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
    event.preventDefault();
    selectProduct(currentIndex - 1);
  }
});

// Glissement horizontal dans la scène : souris, stylet et écran tactile.
stage.addEventListener("pointerdown", event => {
  if (event.pointerType === "mouse" && event.button !== 0) return;
  pointerStart = { x: event.clientX, y: event.clientY, id: event.pointerId };
  stage.classList.add("is-grabbing");
  stage.setPointerCapture(event.pointerId);
});
stage.addEventListener("pointerup", event => {
  if (!pointerStart) return;
  const dx = event.clientX - pointerStart.x;
  if (Math.abs(dx) > 45) selectProduct(currentIndex + (dx < 0 ? 1 : -1));
  pointerStart = null;
  stage.classList.remove("is-grabbing");
});
stage.addEventListener("pointercancel", () => {
  pointerStart = null;
  stage.classList.remove("is-grabbing");
});
stage.addEventListener("wheel", event => {
  if (!explorer.classList.contains("open") || wheelLock || Math.abs(event.deltaY) < 18) return;
  event.preventDefault();
  wheelLock = true;
  selectProduct(currentIndex + (event.deltaY > 0 ? 1 : -1));
  window.setTimeout(() => { wheelLock = false; }, 520);
}, { passive: false });

const menu = document.querySelector(".menu-toggle");
const nav = document.querySelector(".nav");
menu.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  menu.setAttribute("aria-expanded", String(open));
  menu.textContent = open ? "×" : "☰";
});
nav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
  nav.classList.remove("open");
  menu.setAttribute("aria-expanded", "false");
  menu.textContent = "☰";
}));
document.getElementById("year").textContent = new Date().getFullYear();
