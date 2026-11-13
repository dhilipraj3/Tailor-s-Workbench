// speech


const canSpeak='speechSynthesis' in window;
let speakingBtn=null;
function speak(text){
  if(!canSpeak)return;
  try{speechSynthesis.cancel();if(!text)return;const u=new SpeechSynthesisUtterance(text);u.rate=.92;
    u.onstart=()=>document.getElementById('b-say')?.classList.add('speaking');
    u.onend=u.onerror=()=>document.getElementById('b-say')?.classList.remove('speaking');
    speechSynthesis.speak(u);}catch(e){}
}

export { canSpeak, speak };
