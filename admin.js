import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://dknihnqjwyluanqvylfu.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable__8brYWj8mnD3sebQgGKpxA_WcCdWXQk";
const ADMIN_EMAIL = "someremy54@gmail.com";
const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

const $ = (id) => document.getElementById(id);
const notice = $("notice");
let categories = [];
let products = [];
let pauses = [];

function message(text, kind) {
  notice.textContent = text;
  notice.className = "notice show " + (kind || "");
  notice.scrollIntoView({ behavior: "smooth", block: "nearest" });
}
function clearMessage() { notice.className = "notice"; notice.textContent = ""; }
function safeText(value) { return String(value || ""); }
function fileExt(file) {
  const type = file.type.toLowerCase();
  if (type === "image/webp") return "webp";
  if (type === "image/png") return "png";
  return "jpg";
}
async function uploadImage(file, folder) {
  if (!file) return null;
  if (file.size > 5 * 1024 * 1024) throw new Error("La photo dépasse la limite de 5 Mo.");
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) throw new Error("Format non accepté. Utilisez JPG, PNG ou WebP.");
  const path = folder + "/" + Date.now() + "-" + crypto.randomUUID() + "." + fileExt(file);
  const result = await supabase.storage.from("agb-products").upload(path, file, { cacheControl: "3600", upsert: false });
  if (result.error) throw result.error;
  return path;
}
function publicImage(path) {
  if (!path) return "";
  return supabase.storage.from("agb-products").getPublicUrl(path).data.publicUrl;
}
async function requireAdmin() {
  const result = await supabase.auth.getUser();
  const user = result.data.user;
  if (result.error || !user) return false;
  if ((user.email || "").toLowerCase() !== ADMIN_EMAIL) {
    await supabase.auth.signOut();
    message("Cette adresse n’est pas autorisée à accéder à l’administration.", "error");
    return false;
  }
  const check = await supabase.from("admin_users").select("user_id").eq("user_id", user.id).maybeSingle();
  if (check.error || !check.data) {
    message("Ton compte est connecté, mais son autorisation administrateur n’est pas encore confirmée. Déconnecte-toi puis réessaie après validation de ton e-mail.", "error");
    return false;
  }
  $("auth-panel").hidden = true;
  $("dashboard").hidden = false;
  $("signed-user").textContent = user.email;
  await loadAll();
  return true;
}
async function loadAll() {
  clearMessage();
  const [c, p, h] = await Promise.all([
    supabase.from("categories").select("*").order("sort_order"),
    supabase.from("products").select("*, categories(name)").order("sort_order"),
    supabase.from("pauses").select("*").order("sort_order")
  ]);
  const error = c.error || p.error || h.error;
  if (error) throw error;
  categories = c.data || [];
  products = p.data || [];
  pauses = h.data || [];
  renderAll();
}
function renderAll() {
  $("stats").innerHTML = '<div class="stat"><strong>' + products.length + '</strong><span>PRODUITS</span></div><div class="stat"><strong>' + pauses.length + '</strong><span>PAUSES À LA UNE</span></div><div class="stat"><strong>' + categories.length + '</strong><span>CATÉGORIES</span></div>';
  $("product-total").textContent = products.length;
  $("pause-total").textContent = pauses.length;
  $("product-category").innerHTML = categories.map(c => '<option value="' + c.id + '">' + escapeHtml(c.name) + '</option>').join("");
  $("products-list").innerHTML = products.map(p => recordHtml(p, "product")).join("") || '<p class="muted">Aucun produit enregistré pour le moment.</p>';
  $("pauses-list").innerHTML = pauses.map(p => recordHtml(p, "pause")).join("") || '<p class="muted">Aucune pause enregistrée pour le moment.</p>';
  $("categories-list").innerHTML = categories.map(c => '<div class="category-row"><div><strong>' + escapeHtml(c.name) + '</strong><small>' + escapeHtml(c.slug) + ' · ' + (c.is_active ? "Visible" : "Masquée") + '</small></div><button class="mini" data-edit-category="' + c.id + '">Modifier</button><button class="mini" data-toggle-category="' + c.id + '">' + (c.is_active ? "Masquer" : "Afficher") + '</button></div>').join("");
}
function escapeHtml(value) {
  return String(value || "").replace(/[&<>"']/g, ch => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[ch]));
}
function recordHtml(row, type) {
  const name = type === "product" ? row.name : row.title;
  const meta = type === "product" ? ((row.categories && row.categories.name) || "Sans catégorie") + (row.price == null ? " · Prix à confirmer" : " · " + Number(row.price).toLocaleString("fr-FR") + " FCFA") : "Pause mise en avant";
  const image = publicImage(row.image_path);
  return '<div class="record"><img src="' + (image || "") + '" alt="" onerror="this.style.visibility=\'hidden\'"><div class="record-copy"><strong>' + escapeHtml(name) + '</strong><small>' + escapeHtml(meta) + '</small><span class="status ' + (row.is_active ? "" : "off") + '">' + (row.is_active ? "PUBLIÉ" : "MASQUÉ") + '</span></div><div class="record-actions"><button class="mini" data-edit-' + type + '="' + row.id + '">Modifier</button><button class="mini" data-toggle-' + type + '="' + row.id + '">' + (row.is_active ? "Masquer" : "Publier") + '</button><button class="mini danger" data-delete-' + type + '="' + row.id + '">Supprimer</button></div></div>';
}
function resetForm(id) {
  $(id).reset();
  const hidden = $(id).querySelector('input[type="hidden"]');
  if (hidden) hidden.value = "";
  if (id === "product-form") $("product-position").value = "50% 50%";
  if (id === "pause-form") { $("pause-position").value = "50% 50%"; $("pause-order").value = "0"; $("pause-active").checked = true; }
  if (id === "category-form") $("category-active").checked = true;
}
async function saveProduct(event) {
  event.preventDefault();
  try {
    const id = $("product-id").value;
    const current = products.find(p => p.id === id);
    const file = $("product-image").files[0];
    const path = file ? await uploadImage(file, "products") : (current ? current.image_path : null);
    const payload = {
      category_id: $("product-category").value,
      name: $("product-name").value.trim(),
      description: $("product-description").value.trim(),
      price: $("product-price").value === "" ? null : Number($("product-price").value),
      currency: "XOF",
      image_path: path,
      image_position: $("product-position").value.trim() || "50% 50%",
      is_active: $("product-active").checked
    };
    const result = id ? await supabase.from("products").update(payload).eq("id", id) : await supabase.from("products").insert(payload);
    if (result.error) throw result.error;
    message("Produit enregistré.", "success");
    resetForm("product-form");
    await loadAll();
  } catch (error) { message(error.message || "Impossible d’enregistrer le produit.", "error"); }
}
async function savePause(event) {
  event.preventDefault();
  try {
    const id = $("pause-id").value;
    const current = pauses.find(p => p.id === id);
    const file = $("pause-image").files[0];
    const path = file ? await uploadImage(file, "pauses") : (current ? current.image_path : null);
    const payload = {
      title: $("pause-title").value.trim(),
      description: $("pause-description").value.trim(),
      image_path: path,
      image_position: $("pause-position").value.trim() || "50% 50%",
      sort_order: Number($("pause-order").value || 0),
      is_active: $("pause-active").checked
    };
    const result = id ? await supabase.from("pauses").update(payload).eq("id", id) : await supabase.from("pauses").insert(payload);
    if (result.error) throw result.error;
    message("Pause enregistrée.", "success");
    resetForm("pause-form");
    await loadAll();
  } catch (error) { message(error.message || "Impossible d’enregistrer la pause.", "error"); }
}
async function saveCategory(event) {
  event.preventDefault();
  try {
    const id = $("category-id").value;
    const payload = { name: $("category-name").value.trim(), slug: $("category-slug").value.trim(), description: $("category-description").value.trim(), is_active: $("category-active").checked };
    const result = id ? await supabase.from("categories").update(payload).eq("id", id) : await supabase.from("categories").insert(payload);
    if (result.error) throw result.error;
    message("Catégorie enregistrée.", "success");
    resetForm("category-form");
    await loadAll();
  } catch (error) { message(error.message || "Impossible d’enregistrer la catégorie.", "error"); }
}
async function toggleRecord(table, id, active) {
  const result = await supabase.from(table).update({ is_active: !active }).eq("id", id);
  if (result.error) throw result.error;
  await loadAll();
}
async function deleteRecord(table, row) {
  if (!confirm("Supprimer « " + (row.name || row.title) + " » ? Cette action est définitive.")) return;
  const result = await supabase.from(table).delete().eq("id", row.id);
  if (result.error) throw result.error;
  if (row.image_path) {
    const removed = await supabase.storage.from("agb-products").remove([row.image_path]);
    if (removed.error) message("Entrée supprimée, mais la photo n’a pas pu être effacée : " + removed.error.message, "error");
  }
  await loadAll();
  message("Élément supprimé.", "success");
}
$("auth-form").addEventListener("submit", async event => {
  event.preventDefault();
  clearMessage();
  const email = $("auth-email").value.trim().toLowerCase();
  const password = $("auth-password").value;
  if (email !== ADMIN_EMAIL) return message("Seule l’adresse " + ADMIN_EMAIL + " est autorisée.", "error");
  const result = await supabase.auth.signInWithPassword({ email, password });
  if (result.error) return message("Connexion impossible : " + result.error.message, "error");
  try { await requireAdmin(); } catch (error) { message(error.message, "error"); }
});
$("signup-btn").addEventListener("click", async () => {
  clearMessage();
  const email = $("auth-email").value.trim().toLowerCase();
  const password = $("auth-password").value;
  if (email !== ADMIN_EMAIL) return message("La création d’accès est réservée à " + ADMIN_EMAIL + ".", "error");
  if (password.length < 8) return message("Choisis un mot de passe d’au moins 8 caractères.", "error");
  const result = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin + "/admin.html" } });
  if (result.error) return message("Création impossible : " + result.error.message, "error");
  if (result.data.session) {
    try { await requireAdmin(); } catch (error) { message(error.message, "error"); }
  } else {
    message("Demande de création envoyée. Ouvre l’e-mail de confirmation reçu à someremy54@gmail.com, puis reviens ici pour te connecter.", "success");
  }
});
$("logout-btn").addEventListener("click", async () => { await supabase.auth.signOut(); $("dashboard").hidden = true; $("auth-panel").hidden = false; message("Tu es déconnecté.", "success"); });
$("product-form").addEventListener("submit", saveProduct);
$("pause-form").addEventListener("submit", savePause);
$("category-form").addEventListener("submit", saveCategory);
document.querySelectorAll("[data-reset]").forEach(button => button.addEventListener("click", () => resetForm(button.dataset.reset)));
document.addEventListener("click", async event => {
  const target = event.target;
  try {
    if (target.dataset.editProduct) {
      const p = products.find(x => x.id === target.dataset.editProduct);
      $("product-id").value = p.id; $("product-category").value = p.category_id; $("product-name").value = p.name; $("product-description").value = p.description || ""; $("product-price").value = p.price == null ? "" : p.price; $("product-position").value = p.image_position || "50% 50%"; $("product-active").checked = p.is_active;
      $("product-form").scrollIntoView({ behavior: "smooth" });
    }
    if (target.dataset.editPause) {
      const p = pauses.find(x => x.id === target.dataset.editPause);
      $("pause-id").value = p.id; $("pause-title").value = p.title; $("pause-description").value = p.description || ""; $("pause-position").value = p.image_position || "50% 50%"; $("pause-order").value = p.sort_order; $("pause-active").checked = p.is_active;
      $("pause-form").scrollIntoView({ behavior: "smooth" });
    }
    if (target.dataset.editCategory) {
      const c = categories.find(x => x.id === target.dataset.editCategory);
      $("category-id").value = c.id; $("category-name").value = c.name; $("category-slug").value = c.slug; $("category-description").value = c.description || ""; $("category-active").checked = c.is_active;
      $("category-form").scrollIntoView({ behavior: "smooth" });
    }
    if (target.dataset.toggleProduct) { const p = products.find(x => x.id === target.dataset.toggleProduct); await toggleRecord("products", p.id, p.is_active); }
    if (target.dataset.togglePause) { const p = pauses.find(x => x.id === target.dataset.togglePause); await toggleRecord("pauses", p.id, p.is_active); }
    if (target.dataset.toggleCategory) { const c = categories.find(x => x.id === target.dataset.toggleCategory); const r = await supabase.from("categories").update({ is_active: !c.is_active }).eq("id", c.id); if (r.error) throw r.error; await loadAll(); }
    if (target.dataset.deleteProduct) await deleteRecord("products", products.find(x => x.id === target.dataset.deleteProduct));
    if (target.dataset.deletePause) await deleteRecord("pauses", pauses.find(x => x.id === target.dataset.deletePause));
  } catch (error) { message(error.message || "Une opération a échoué.", "error"); }
});
supabase.auth.onAuthStateChange((_event, session) => {
  if (session && !$("dashboard").hidden) return;
});
(async () => {
  const session = await supabase.auth.getSession();
  if (session.data.session) {
    try { await requireAdmin(); } catch (error) { message(error.message, "error"); }
  }
})();