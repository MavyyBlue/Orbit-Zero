// A contract fixture only; it cannot certify CSS layout or real browser touch.
export function roomDOM(width=360,height=420){
  const elements=new Map(),listeners=new Map();
  class Element {
    constructor(id=''){this.id=id;this.hidden=false;this.disabled=false;this.value='';this.textContent='';this.dataset={};this.style={setProperty(k,v){this[k]=v;}};this.classes=new Set();this.classList={toggle:(k,on)=>{on?this.classes.add(k):this.classes.delete(k);}};this.html='';}
    setAttribute(k,v){this[k]=v;}
    set innerHTML(html){this.html=html;for(const tag of html.matchAll(/<[^>]*\bid="([^"]+)"[^>]*>/g)){const e=new Element(tag[1]);e.hidden=/\bhidden\b/.test(tag[0]);e.disabled=/\bdisabled\b/.test(tag[0]);e.value=tag[0].match(/value="([^"]*)"/)?.[1]||'';const placement=tag[0].match(/data-placement="([^"]*)"/);if(placement)e.dataset.placement=placement[1];elements.set(e.id,e);}}
    get innerHTML(){return this.html;}
    querySelector(selector){if(selector[0]==='#')return elements.get(selector.slice(1));if(selector==='.single-decal'&&this.html.includes('single-decal'))return new Element();return null;}
    getBoundingClientRect(){return {left:0,top:0,width,height};}setPointerCapture(id){this.captured=id;}append(){}closest(selector){return selector==='[data-placement]'&&this.dataset.placement?this:selector===`#${this.id}`?this:null;}
  }
  const root=new Element('root');
  globalThis.document={hidden:false,createElement:()=>new Element(),addEventListener:(key,fn)=>listeners.set(key,fn),removeEventListener:(key)=>listeners.delete(key)};
  globalThis.ResizeObserver=class{constructor(fn){this.fn=fn;}observe(){}disconnect(){}};
  return {root,elements,listeners,Element};
}
