// numbers
import { S } from './state.js';

const FR=['','⅛','¼','⅜','½','⅝','¾','⅞'];
const FRW=['','one eighth','a quarter','three eighths','a half','five eighths','three quarters','seven eighths'];
function split8(x){let w=Math.floor(x),e=Math.round((x-w)*8);if(e===8){w++;e=0;}return [w,e];}
function f(x){if(S.unit==='cm')return (Math.round(x*25.4)/10).toFixed(1).replace(/\.0$/,'')+' cm';const[w,e]=split8(Math.abs(x));return ((w||!e)?w:'')+FR[e]+'″';}
function sn(x){if(S.unit==='cm')return (Math.round(x*25.4)/10).toFixed(1).replace(/\.0$/,'')+' centimetres';const[w,e]=split8(Math.abs(x));
  if(!e)return w+(w===1?' inch':' inches'); if(!w)return FRW[e]+' of an inch'; return w+' and '+FRW[e]+' inches';}

export { FR, FRW, split8, f, sn };
