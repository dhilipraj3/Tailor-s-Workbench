const s=require('fs').readFileSync(process.argv[2],'utf8');let js=s.split('<script>')[1].split('</script>')[0];
js=js.replace(/render\(\);\s*\}\)\(\);\s*$/,'window.__t={chapters,S};})();');
global.window=global;global.localStorage={getItem:()=>null,setItem(){}};
global.document={getElementById:()=>({set innerHTML(v){}}),addEventListener(){},querySelector:()=>null};
eval(js);const {chapters,S}=window.__t;let n=0,bad=0;
for(const g of ['shirt','trousers'])for(const u of ['in','cm']){S.garment=g;S.unit=u;
 for(const c of chapters())c.steps.forEach((st,i)=>{try{const o=st.svg();const say=typeof st.say==='function'?st.say():(st.sayFn?st.sayFn():st.say);
  if(/NaN|undefined/.test(o)||/NaN|undefined/.test(say)){bad++;console.log('BAD',g,u,c.id,i,st.cap);}n++;}catch(e){bad++;console.log('ERR',g,c.id,i,e.message);}});}
console.log('scenes',n,'problems',bad);
