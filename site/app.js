(() => {
"use strict";
const $ = s => document.querySelector(s);
const html = value => String(value ?? "").replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
const hasRecipe = r => Array.isArray(r.ingredients) && r.ingredients.length>0 && Array.isArray(r.instructions) && r.instructions.length>0;
const category = r => ["meat","dairy","pareve","fish_pareve"].includes(r.kosher_category) ? r.kosher_category : "pareve";
const label = r => ({"meat":"Meat","dairy":"Dairy","pareve":"Pareve","fish_pareve":"Fish · Pareve"})[category(r)];
const emoji = r => {
 const t = r.title.toLowerCase();
 if (/pizza|flatbread/.test(t)) return "🍕";
 if (/taco|enchilada|quesadilla|fajita/.test(t)) return "🌮";
 if (/pasta|spaghetti|ziti|orzo|ravioli|gnocchi|noodle|lo mein|lasagna|mac & cheese/.test(t)) return "🍝";
 if (/soup|stew|chowder|minestrone|chili|shakshuka/.test(t)) return "🍲";
 if (/rice|bibimbap|couscous|polenta|quinoa|bowl/.test(t)) return "🥘";
 if (/pita|sandwich|wrap|burger/.test(t)) return "🥙";
 if (category(r)==="fish_pareve") return "🐟";
 if (r.primary_category==="chicken") return "🍗";
 if (category(r)==="dairy") return "🧀";
 return "🥗";
};
const summary = r => {
 const s = r.summary || "";
 return (!s || /^Kosher (meat|dairy|pareve|fish)/i.test(s))
  ? ((r.components_from_title || []).slice(0,3).join(" · ") || "A family dinner favorite from the archives.") : s;
};
const storeKey = "family-table-saved";
let saved;
try { saved = new Set(JSON.parse(localStorage.getItem(storeKey) || "[]")); } catch { saved = new Set(); }
let recipes=[], type="all", search="", sort="new", savedOnly=false, shown=12, active=null, priorFocus=null;
function matches(r) {
 if (type==="chicken" && r.primary_category!=="chicken") return false;
 if (type==="fish" && category(r)!=="fish_pareve") return false;
 if (type==="dairy" && category(r)!=="dairy") return false;
 if (type==="pareve" && category(r)!=="pareve") return false;
 if (type==="shabbat" && !r.shabbat_friendly) return false;
 if (savedOnly && !saved.has(r.number)) return false;
 const searchable=[r.title,r.summary,(r.components_from_title||[]).join(" "),(r.ingredients||[]).join(" "),(r.meal_formats||[]).join(" ")].join(" ").toLowerCase();
 return !search || searchable.includes(search);
}
function card(r) {
 const group=category(r), isSaved=saved.has(r.number), time=r.estimated_total_minutes;
 return '<article class="recipe-card"><div class="card-art '+group+'"><span class="number">RECIPE '+String(r.number).padStart(3,"0")+'</span>'+
  '<span class="food-emoji" aria-hidden="true">'+emoji(r)+'</span>'+
  '<button class="heart'+(isSaved?" saved":"")+'" type="button" data-save="'+r.number+'" aria-label="'+(isSaved?"Remove saved recipe":"Save recipe")+'">'+(isSaved?"♥":"♡")+'</button></div>'+
  '<div class="card-body"><div class="card-meta"><span class="type '+group+'">'+html(label(r))+'</span>'+(time?'<span class="time">◷ '+html(time)+' min</span>':"")+'</div>'+
  '<h3>'+html(r.title)+'</h3><p>'+html(summary(r))+'</p><div class="card-footer"><small>'+(r.shabbat_friendly?"✳ Shabbat friendly":hasRecipe(r)?"✺ Full recipe":"✳ Dinner idea")+'</small>'+
  '<button type="button" data-open="'+html(r.slug)+'" class="open-recipe">'+(hasRecipe(r)?"View recipe":"Explore idea")+' <span>↗</span></button></div></div></article>';
}
function render() {
 let list=recipes.filter(matches);
 list.sort(sort==="old" ? (a,b)=>a.number-b.number : sort==="az" ? (a,b)=>a.title.localeCompare(b.title) : (a,b)=>b.number-a.number);
 $("#recipe-grid").innerHTML=list.slice(0,shown).map(card).join("");
 $("#result-count").textContent="Showing "+Math.min(shown,list.length)+" of "+list.length+" dinner ideas";
 $("#empty").hidden=list.length!==0; $("#more").hidden=shown>=list.length;
 $("#saved-total").textContent=saved.size;
 $("#show-saved").setAttribute("aria-pressed",String(savedOnly));
 document.querySelectorAll("#filters [data-filter]").forEach(btn=>{
  const isActive=btn.dataset.filter===type;
  btn.classList.toggle("active",isActive);
  btn.setAttribute("aria-pressed",String(isActive));
 });
}
function save(number) {
 if(saved.has(number)) saved.delete(number); else saved.add(number);
 try {localStorage.setItem(storeKey,JSON.stringify([...saved]));} catch {}
 render();
 const btn=$("#modal-save");if(btn && active && active.number===number) btn.textContent=saved.has(number)?"♥ Saved":"♡ Save recipe";
}
function detail(r) {
 const info=[
 r.estimated_total_minutes ? "◷ "+r.estimated_total_minutes+" min total" : null,
 r.estimated_active_minutes ? "⏱ "+r.estimated_active_minutes+" min active" : null,
 r.shabbat_friendly ? "✳ Shabbat friendly" : null,
 hasRecipe(r) ? "Complete instructions" : "Dinner inspiration"
 ].filter(Boolean).map(s=>"<span>"+html(s)+"</span>").join("");
 let content;
 if (hasRecipe(r)) {
  content='<div class="detail-columns"><div><h3>Ingredients</h3><ul class="ingredient-list">'+r.ingredients.map(s=>'<li><label><input type="checkbox"><span>'+html(s)+'</span></label></li>').join("")+'</ul></div>'+
  '<div><h3>Let’s cook</h3><ol class="step-list">'+r.instructions.map(s=>"<li>"+html(s)+"</li>").join("")+"</ol></div></div>";
 } else {
  content='<div class="archive-warning"><h3>From the early dinner archive</h3><p>This dinner idea was saved before complete recipes were being recorded. These are the original components, not a full recipe:</p><ul>'+
  (r.components_from_title||[]).map(s=>"<li>"+html(s)+"</li>").join("")+'</ul><p>We preserved the original idea without inventing ingredients or steps.</p></div>';
 }
 const note=(title,text)=>text?'<div class="detail-note"><h3>'+title+'</h3><p>'+html(text)+'</p></div>':"";
 $("#modal-content").innerHTML='<article class="detail"><p class="eyebrow">RECIPE '+String(r.number).padStart(3,"0")+' · '+html(label(r))+'</p>'+
  '<h2 id="modal-title">'+html(r.title)+'</h2><p>'+html(summary(r))+'</p><div class="detail-info">'+info+'</div>'+content+
  note("For little eaters",r.child_friendly_modifications)+note("Tomorrow’s leftovers",r.leftovers)+
  '<div class="detail-actions"><button id="modal-save" data-save="'+r.number+'" class="button primary" type="button">'+(saved.has(r.number)?"♥ Saved":"♡ Save recipe")+
  '</button><button class="button outlined" id="detail-print" type="button">Print recipe ⎙</button></div></article>';
}
function openRecipe(slug,writeUrl=true) {
 const r=recipes.find(item=>item.slug===slug);
 if(!r)return;
 active=r;priorFocus=document.activeElement;detail(r);
 $("#modal").hidden=false;document.body.style.overflow="hidden";
 if(writeUrl){const url=new URL(location.href);url.searchParams.set("recipe",slug);history.pushState({recipe:slug},"",url);}
 const close=document.querySelector('.modal-header [data-close]');if(close)close.focus();
}
function closeRecipe(writeUrl=true) {
 $("#modal").hidden=true;document.body.style.overflow="";active=null;
 if(writeUrl){const url=new URL(location.href);url.searchParams.delete("recipe");history.replaceState({},"",url);}
 if(priorFocus && document.contains(priorFocus))priorFocus.focus();
}
function fromUrl() {
 const slug=new URLSearchParams(location.search).get("recipe");
 if(slug)openRecipe(slug,false);else if(!$("#modal").hidden)closeRecipe(false);
}
let toastTimer=null;
function notify(message){const n=$("#toast");n.textContent=message;n.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>n.hidden=true,2300);}
document.addEventListener("click",e=>{
 const saveButton=e.target.closest("[data-save]");
 if(saveButton){save(Number(saveButton.dataset.save));return;}
 const open=e.target.closest("[data-open]");
 if(open){openRecipe(open.dataset.open);return;}
 const close=e.target.closest("[data-close]");
 if(close && !$("#modal").hidden){closeRecipe();return;}
 if(e.target.closest("#print") || e.target.closest("#detail-print"))window.print();
});
$("#search").addEventListener("input",e=>{search=e.target.value.trim().toLowerCase();shown=12;render();});
$("#filters").addEventListener("click",e=>{const b=e.target.closest("[data-filter]");if(b){type=b.dataset.filter;shown=12;render();}});
$("#sort").addEventListener("change",e=>{sort=e.target.value;shown=12;render();});
$("#show-saved").addEventListener("click",()=>{savedOnly=!savedOnly;shown=12;render();});
$("#more").addEventListener("click",()=>{shown+=12;render();});
$("#clear").addEventListener("click",()=>{search="";type="all";shown=12;savedOnly=false;$("#search").value="";render();});
$("#surprise-button").addEventListener("click",()=>{let full=recipes.filter(hasRecipe);if(!full.length)full=recipes;if(full.length)openRecipe(full[Math.floor(Math.random()*full.length)].slug);});
$("#copy").addEventListener("click",async()=>{if(!active)return;try{await navigator.clipboard.writeText(location.href);notify("Recipe link copied!");}catch{notify("Copy the page URL to share this recipe.");}});
document.addEventListener("keydown",e=>{
 if(e.key==="Escape" && !$("#modal").hidden)closeRecipe();
 if((e.ctrlKey||e.metaKey) && e.key.toLowerCase()==="k"){e.preventDefault();$("#search").focus();}
});
window.addEventListener("popstate",fromUrl);
async function init(){
 try{
  const response=await fetch("./data/dinners.json",{cache:"no-store"});
  if(!response.ok)throw Error("Could not load catalog: "+response.status);
  const data=await response.json();
  if(!Array.isArray(data.dinners))throw Error("Unexpected catalog format");
  recipes=data.dinners.filter(r=>typeof r.number==="number"&&typeof r.slug==="string"&&typeof r.title==="string");
  $("#stat-recipes").textContent=recipes.length;
  $("#stat-complete").textContent=recipes.filter(hasRecipe).length;
  $("#stat-shabbat").textContent=recipes.filter(r=>r.shabbat_friendly).length;
  render();fromUrl();
 }catch(err){
  console.error(err);
  $("#result-count").textContent="Recipe collection unavailable";
  $("#recipe-grid").innerHTML='<div class="archive-warning"><h3>Could not load recipes</h3><p>Please refresh the published site. If you’re viewing GitHub’s source files, open the GitHub Pages website instead.</p></div>';
 }
}
init();
})();