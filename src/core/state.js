// state


const KEY='tailorsWorkbench.v2';
const SHIRT_SIZES={S:{chest:38,neck:15,shoulder:17,sleeve:24.5,length:29,wrist:6.5},M:{chest:40,neck:15.5,shoulder:17.5,sleeve:25,length:29.5,wrist:7},L:{chest:42,neck:16,shoulder:18,sleeve:25.5,length:30,wrist:7},XL:{chest:44,neck:16.5,shoulder:18.5,sleeve:26,length:30.5,wrist:7.5},XXL:{chest:46,neck:17.5,shoulder:19,sleeve:26.5,length:31,wrist:7.5}};
const PANT_SIZES=[28,30,32,34,36,38,40,42,44];
const r4=x=>Math.round(x*4)/4, r2=x=>Math.round(x*2)/2;
const pantPreset=w=>({waist:w,hip:w+6,rise:r4((w+6)/8+5.5),outseam:r4(40+(w-28)*.125),bottom:r2(15.5+(w-28)*.2)});
let S={garment:'shirt',unit:'in',shirtSize:'L',pantSize:34,fit:'regular',shirt:{...SHIRT_SIZES.L},pant:pantPreset(34),seen:{},voice:true,view:null};
try{const s=JSON.parse(localStorage.getItem(KEY)||'null');if(s&&s.shirt&&s.pant)S={...S,...s,view:null};}catch(e){}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify({...S,view:null}));}catch(e){}};

export { KEY, SHIRT_SIZES, PANT_SIZES, r4, r2, pantPreset, S, save };
