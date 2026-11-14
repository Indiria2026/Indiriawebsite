import { t, onLanguageChange } from './i18n.js';

const products = {
  corpo: {
    hash: '#crema-corpo', name: 'Crema corpo', status: 'Corpo · Prototipo',
    photo: 'body', alt: 'Vaso porpora INDIRIA accanto a una pennellata di crema rosa.',
    intro: 'Il primo progetto INDIRIA è una crema pensata per la pelle secca e a tendenza psoriasica, soprattutto dove la superficie cutanea appare ruvida e desquamata.'
  },
  capelli: {
    hash: '#cuoio-capelluto', name: 'Cuoio capelluto', status: 'Cuoio capelluto · In sviluppo',
    photo: 'scalp', alt: 'Ipotesi di confezione con beccuccio sottile per raggiungere le radici dei capelli.',
    intro: 'Tra i capelli, un prodotto difficile da distribuire può lasciare residui visibili o richiedere un lavaggio in più. Da questa esigenza nasce il nostro secondo progetto.'
  },
  delicate: {
    hash: '#zone-delicate', name: 'Zone delicate', status: 'Pelli sensibili · In sviluppo',
    photo: 'delicate', alt: 'Ipotesi di confezione in tubo color avorio con tappo bordeaux.',
    intro: 'Il viso è esposto al vento e ai lavaggi. Nelle zone intime esterne, invece, contano il contatto con i tessuti e lo sfregamento. Studiamo formule specifiche per queste esigenze.'
  }
};

const menu = document.querySelector('.mobile-menu');
const navigation = document.querySelector('#site-nav');
function setMenu(open) {
  navigation.classList.toggle('open',open);
  document.body.classList.toggle('menu-open',open);
  document.querySelector('main').inert=open;
  document.querySelector('footer').inert=open;
  menu.setAttribute('aria-expanded',String(open));
  menu.querySelector('.sr').textContent = t(open ? 'Chiudi il menu' : 'Apri il menu');
}
menu.addEventListener('click',()=>setMenu(menu.getAttribute('aria-expanded') !== 'true'));
navigation.addEventListener('click',e=>{if(e.target.closest('a'))setMenu(false);});
document.addEventListener('keydown',e=>{
  if(e.key==='Escape' && navigation.classList.contains('open')){setMenu(false);menu.focus();}
  if(e.key==='Tab' && navigation.classList.contains('open')){
    const last=navigation.querySelector('a:last-child');
    if(e.shiftKey && document.activeElement===menu){e.preventDefault();last.focus();}
    else if(!e.shiftKey && document.activeElement===last){e.preventDefault();menu.focus();}
  }
});
matchMedia('(min-width:1361px)').addEventListener('change',e=>{if(e.matches)setMenu(false);});

const dialog = document.querySelector('#product-dialog');
const heading = document.querySelector('#product-title');
const facts = document.querySelector('#detail-facts');
const productFromHash = ()=>Object.values(products).find(p=>p.hash===location.hash);
let trigger = null;
let activeProduct = null;
let activeProductPanel = 'benefici';
const productPanels = {
  corpo: {
    benefici: [['Per la pelle secca', 'La formula emolliente è pensata per ammorbidire le aree ruvide e favorire un aspetto più levigato.'], ['Aree di interesse', 'Mani, gomiti, ginocchia e altre aree del corpo, nella popolazione adulta.']],
    texture: [['Consistenza', 'Il prototipo è una crema anidra dal caratteristico colore porpora.'], ['Formato previsto', 'Vaso da 100 ml. La confezione mostrata è un concept.']],
    sviluppo: [['Prototipo formulato', 'Il programma di verifica comprende stabilità, tollerabilità e valutazione dell’aspetto della pelle.'], ['Disponibilità', 'La data di commercializzazione non è ancora definita.']]
  },
  capelli: {
    benefici: [['Tra i capelli', 'Una formula da distribuire direttamente sulla cute. Il progetto considera facilità di applicazione e residui sui capelli.'], ['Esigenza cosmetica', 'La ricerca riguarda la cura della cute secca e l’aspetto della desquamazione.']],
    texture: [['Formula allo studio', 'Una lozione o una spuma: la consistenza definitiva è ancora da definire.'], ['Confezione', 'Il flacone con applicatore è un concept. Il formato definitivo è in fase di studio.']],
    sviluppo: [['In sviluppo', 'Valuteremo facilità di applicazione, residui sui capelli, aspetto della desquamazione e tollerabilità.'], ['Disponibilità', 'Il prodotto non è ancora in commercio.']]
  },
  delicate: {
    benefici: [['Aree di interesse', 'Viso e cute delle zone intime esterne, con valutazioni di tollerabilità dedicate a ogni sede.'], ['Esigenze diverse', 'Il progetto considera l’esposizione del viso e il contatto con i tessuti nelle zone intime esterne.']],
    texture: [['Formulazione dedicata', 'Consistenza e modalità di applicazione sono ancora in fase di studio.'], ['Confezione', 'Il tubo mostrato è un concept; il formato non è definitivo.']],
    sviluppo: [['In sviluppo', 'La destinazione d’uso dipenderà dalle verifiche specifiche per zona e fascia d’età.'], ['Età e sensibilità', 'La ricerca considera anche bambini e anziani; l’eventuale utilizzo richiederà valutazioni dedicate.']]
  }
};
const productTabs = [...document.querySelectorAll('[data-product-tab]')];
function showProductPanel(key) {
  const productKey = Object.keys(products).find(id => products[id] === activeProduct);
  const content = productPanels[productKey]?.[key];
  if (!content) return;
  activeProductPanel = key;
  productTabs.forEach(tab => {
    const selected = tab.dataset.productTab === key;
    tab.setAttribute('aria-selected', String(selected)); tab.tabIndex = selected ? 0 : -1;
  });
  document.querySelector('#product-info').setAttribute('aria-labelledby', `product-tab-${key}`);
  facts.replaceChildren();
  for (const [name, value] of content) {
    const dt = document.createElement('dt'), dd = document.createElement('dd');
    dt.textContent = t(name); dd.textContent = t(value); facts.append(dt, dd);
  }
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches && facts.animate) {
    facts.animate([{opacity:.65},{opacity:1}], {duration:180, easing:'ease-out'});
  }
}
productTabs.forEach((tab, index) => {
  tab.addEventListener('click', () => showProductPanel(tab.dataset.productTab));
  tab.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % productTabs.length;
    else if (event.key === 'ArrowLeft') next = (index + productTabs.length - 1) % productTabs.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = productTabs.length - 1;
    else return;
    event.preventDefault(); productTabs[next].focus(); showProductPanel(productTabs[next].dataset.productTab);
  });
});
function renderProductCopy(p) {
  const img = document.querySelector('#detail-image');
  img.src='assets/'+p.photo+'.webp'; img.alt=t(p.alt);
  document.querySelector('#detail-caption').textContent=t('Concept di confezione');
  document.querySelector('#detail-status').textContent=t(p.status);
  heading.textContent=t(p.name);
  document.querySelector('#detail-intro').textContent=t(p.intro);
}
function presentProduct(p) {
  setMenu(false);
  renderProductCopy(p);
  activeProduct = p;
  showProductPanel('benefici');
  if(!dialog.open)dialog.showModal();
  document.body.classList.add('locked');dialog.scrollTop=0;
  heading.focus({preventScroll:true});
}
function closeProduct(){
  if(!dialog.open)return;
  dialog.close();document.body.classList.remove('locked');
  if(trigger?.isConnected)trigger.focus({preventScroll:true});
}
function closeRoute(){
  if(history.state?.indiriaProduct){history.back();return;}
  if(productFromHash())history.replaceState(null,'','#linea');
  closeProduct();
}
function route(){const p=productFromHash();if(p)presentProduct(p);else closeProduct();}
for(const el of document.querySelectorAll('[data-product]')){
  el.addEventListener('click',e=>{
    if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
    const p=products[el.dataset.product];e.preventDefault();trigger=el;
    if(location.hash!==p.hash)history.pushState({indiriaProduct:true},'',p.hash);
    presentProduct(p);
  });
}
dialog.querySelector('.close').addEventListener('click',closeRoute);
dialog.addEventListener('cancel',e=>{e.preventDefault();closeRoute();});
dialog.addEventListener('click',e=>{
  if(e.target!==dialog)return;
  const r=dialog.getBoundingClientRect();
  if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeRoute();
});
dialog.querySelector('.dialog-partner').addEventListener('click',e=>{
  e.preventDefault();closeProduct();history.replaceState(null,'','#partner');
  const target=document.querySelector('#partner');
  target.scrollIntoView();target.querySelector('a').focus({preventScroll:true});
});
window.addEventListener('hashchange',route);
window.addEventListener('popstate',route);
onLanguageChange(() => {
  menu.querySelector('.sr').textContent = t(navigation.classList.contains('open') ? 'Chiudi il menu' : 'Apri il menu');
  if (activeProduct) { renderProductCopy(activeProduct); showProductPanel(activeProductPanel); }
});
route();
