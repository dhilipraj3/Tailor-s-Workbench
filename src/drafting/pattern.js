// PATTERN drafting
import { S } from '../core/state.js';
import { f, sn } from '../core/units.js';
import { n1, TR, st, H } from '../art/svg.js';

const pp=p=>`${n1(p[0])} ${n1(p[1])}`;
function shirtDraft(){
  const m=S.shirt,fit=S.fit,C=m.chest,N=m.neck,Sh=m.shoulder,SL=m.sleeve,L=m.length,Wr=m.wrist;
  const E=fit==='slim'?3.5:5,G=C+E,nw=N/6+.25,armY=G/6+3,yk=4,bx=G/4+.25,fx=G/4-.25,sup=fit==='slim'?1:.25;
  const waistY=L*.55+.75,hemY=L+.75,sideHemY=hemY-3;
  const out=[];
  {const O=[0,0],A=[0,.75],B=[nw,0],C2=[Sh/2,1.75],D=[0,armY],E2=[bx,armY],F=[bx-sup,waistY],Gp=[bx-sup*.5,sideHemY],Hh=[0,hemY],Y=[0,yk];
   const neck=`M${pp(A)} Q ${pp([nw*.85,.75])} ${pp(B)}`,arm=`M${pp(C2)} C ${pp([Sh/2-.55,armY*.55])} ${pp([Sh/2-.35,armY])} ${pp(E2)}`,hem=`M${pp(Gp)} C ${pp([Gp[0]-1.2,hemY])} ${pp([Gp[0]*.45,hemY])} ${pp(Hh)}`;
   const outline=`M${pp(A)} Q ${pp([nw*.85,.75])} ${pp(B)} L ${pp(C2)} C ${pp([Sh/2-.55,armY*.55])} ${pp([Sh/2-.35,armY])} ${pp(E2)} L ${pp(F)} L ${pp(Gp)} C ${pp([Gp[0]-1.2,hemY])} ${pp([Gp[0]*.45,hemY])} ${pp(Hh)} Z`;
   out.push({name:'Back',cut:'fold',box:[-2.2,-1.6,bx+1.2,hemY+.8],outline,steps:[
    {cap:'Draw an L',say:'Take a big paper. Draw a long line down the left side and a line across the top. The corner is point O.',els:[['g',O,[0,hemY+.5]],['g',O,[bx+.8,0]],['p','O',O]]},
    {cap:'Point A',say:`From O, measure ${sn(.75)} down. Mark A.`,els:[['m',O,A,40],['p','A',A]]},
    {cap:'Point B and the neck',say:`From O, measure ${sn(nw)} across. Mark B. Draw a gentle curve from A to B.`,els:[['m',O,B,-34],['p','B',B],['c',neck]]},
    {cap:'Shoulder point C',say:`Measure ${sn(Sh/2)} across from O, then ${sn(1.75)} down. Mark C. Join B to C.`,els:[['m',O,[Sh/2,0],-34],['m',[Sh/2,0],C2,-34],['p','C',C2],['l',B,C2]]},
    {cap:'Chest line D',say:`From O, measure ${sn(armY)} down. Mark D and draw a line across.`,els:[['m',O,D,40],['p','D',D],['g',D,[bx+.6,armY]]]},
    {cap:'Underarm point E',say:`From D, measure ${sn(bx)} across. Mark E.`,els:[['m',D,E2,-34],['p','E',E2]]},
    {cap:'Draw the armhole',say:'Draw a smooth curve from C down to E. It bends in a little, then sweeps out.',els:[['c',arm]]},
    {cap:'Yoke line',say:`Measure ${sn(yk)} down from O. Draw a red line across. The top part is the yoke. Trace it on another paper later.`,els:[['m',O,Y,40],['p','Y',Y],['y',Y,[Sh/2-.2,yk]]]},
    {cap:'Waist point F',say:`Measure ${sn(waistY)} down from O, then ${sn(F[0])} across. Mark F.`,els:[['m',O,[0,waistY],40],['g',[0,waistY],F],['m',[0,waistY],F,-34],['p','F',F]]},
    {cap:'Bottom H and G',say:`Measure ${sn(hemY)} down from O. Mark H. On the side, mark G ${sn(3)} above the bottom line.`,els:[['m',O,Hh,40],['p','H',Hh],['g',Hh,[Gp[0]+.5,hemY]],['m',Gp,[Gp[0],hemY],-34],['p','G',Gp]]},
    {cap:'Side and bottom',say:'Join E to F to G. Then draw a curve from G to H, like a smile.',els:[['l',E2,F],['l',F,Gp],['c',hem]]},
    {cap:'Fold and grain',say:'The left line goes on the fold of the fabric. Draw the double arrow. It must run along the fabric.',els:[['fold',0,yk+1,hemY-2],['gr',bx*.6,armY+2,hemY-5]]},
    {cap:'Add sewing space',say:`Draw a line ${sn(.375)} outside the shape, but not on the fold. This is the sewing space. Cut on this outside line.`,els:[['sa',outline,.375,0]]},
   ]});}
  {const fnd=N/6+.75,csx=Sh/2-.25,O=[0,0],A=[0,fnd],B=[nw,0],C2=[csx,2],D=[0,armY],E2=[fx,armY],F=[fx-sup,waistY],Gp=[fx-sup*.5,sideHemY],Hh=[0,hemY],X=[-.75,fnd];
   const neck=`M${pp(A)} C ${pp([nw*.6,fnd])} ${pp([nw,fnd*.5])} ${pp(B)}`,arm=`M${pp(C2)} C ${pp([csx-.75,armY*.6])} ${pp([csx-.55,armY])} ${pp(E2)}`,hem=`M${pp(Gp)} C ${pp([Gp[0]-1.2,hemY])} ${pp([Gp[0]*.45,hemY])} ${pp(Hh)}`;
   const outline=`M${pp(X)} L ${pp(A)} C ${pp([nw*.6,fnd])} ${pp([nw,fnd*.5])} ${pp(B)} L ${pp(C2)} C ${pp([csx-.75,armY*.6])} ${pp([csx-.55,armY])} ${pp(E2)} L ${pp(F)} L ${pp(Gp)} C ${pp([Gp[0]-1.2,hemY])} ${pp([Gp[0]*.45,hemY])} ${pp(Hh)} L ${pp([-.75,hemY])} Z`;
   const btns=[];for(let y=fnd+3;y<hemY-5;y+=3.5)btns.push(['btn',[0,y]]);
   const px0=2.25,px1=7.25,py=armY-3.25,pocket=`M${px0} ${py} L${px1} ${py} L${px1} ${py+5} L${(px0+px1)/2} ${py+5.6} L${px0} ${py+5} Z`;
   out.push({name:'Front',cut:'2',box:[-2.6,-1.6,fx+1.2,hemY+.8],outline,steps:[
    {cap:'Draw an L',say:'On a new paper, draw a long line down and a line across the top. The corner is O.',els:[['g',O,[0,hemY+.5]],['g',O,[fx+.8,0]],['p','O',O]]},
    {cap:'Front neck',say:`Measure ${sn(nw)} across from O and mark B. Measure ${sn(fnd)} down and mark A. Draw a deep curve from A to B.`,els:[['m',O,B,-34],['m',O,A,40],['p','A',A],['p','B',B],['c',neck]]},
    {cap:'Shoulder point C',say:`Measure ${sn(csx)} across and ${sn(2)} down. Mark C. Join B to C.`,els:[['m',O,[csx,0],-34],['m',[csx,0],C2,-34],['p','C',C2],['l',B,C2]]},
    {cap:'Chest line D to E',say:`Measure ${sn(armY)} down to D. Then ${sn(fx)} across to E.`,els:[['m',O,D,40],['p','D',D],['g',D,[fx+.6,armY]],['m',D,E2,-34],['p','E',E2]]},
    {cap:'Draw the armhole',say:'Draw a curve from C to E. The front curve goes in a bit more than the back.',els:[['c',arm]]},
    {cap:'Waist and bottom',say:`Mark F at the waist, ${sn(F[0])} across. Mark H at the bottom, ${sn(hemY)} down. Mark G ${sn(3)} above the bottom on the side.`,els:[['m',[0,waistY],F,-34],['p','F',F],['m',O,Hh,40],['p','H',Hh],['p','G',Gp]]},
    {cap:'Side and bottom',say:'Join E to F to G. Draw the smile curve from G to H.',els:[['l',E2,F],['l',F,Gp],['c',hem]]},
    {cap:'Button strip',say:`Draw a line ${sn(.75)} outside the front line. This is where the buttons go. Add ${sn(1.5)} more to fold under.`,els:[['m',X,A,-34],['p','X',X],['l',X,[-.75,hemY]],['l',X,A],['l',[-.75,hemY],Hh]]},
    {cap:'Button marks',say:`Mark ${btns.length} buttons on the front line, ${sn(3.5)} apart.`,els:[...btns,['m',[0,fnd+3],[0,fnd+6.5],-34]]},
    {cap:'Pocket mark',say:'Draw the pocket shape on the left front only.',els:[['yc',pocket]]},
    {cap:'Grain and sewing space',say:`Draw the double arrow. Then draw a line ${sn(.375)} outside all around. Cut on that line. Cut two fronts.`,els:[['gr',fx*.62,py+7,hemY-5],['sa',outline,.375,null]]},
   ]});}
  {const bw=G*(fit==='slim'?.35:.37),cap=G/8-.5,SLp=SL-2,cuffL=Wr+2.5,hemW=cuffL+1.5,A=[0,0],B=[-bw/2,cap],C2=[bw/2,cap],D=[-hemW/2,SLp],E2=[hemW/2,SLp];
   const capc=`M${pp(B)} C ${pp([-bw*.3,cap])} ${pp([-bw*.24,0])} ${pp(A)} C ${pp([bw*.24,0])} ${pp([bw*.3,cap])} ${pp(C2)}`;
   const outline=capc+` L ${pp(E2)} L ${pp(D)} Z`,sx=hemW/4;
   out.push({name:'Sleeve',cut:'2',box:[-bw/2-1.5,-1.4,bw/2+1.5,SLp+1],outline,steps:[
    {cap:'Middle line',say:'Draw a long straight line down the middle of the paper. The top is A.',els:[['g',A,[0,SLp+.5]],['p','A',A]]},
    {cap:'Wide line',say:`Measure ${sn(cap)} down from A and draw a line across. Mark B and C, ${sn(bw/2)} on each side.`,els:[['m',A,[0,cap],-40],['g',[-bw/2-.5,cap],[bw/2+.5,cap]],['m',B,[0,cap],34],['m',[0,cap],C2,34],['p','B',B],['p','C',C2]]},
    {cap:'Sleeve length',say:`Measure ${sn(SLp)} down from A. Draw the bottom line. Mark D and E, ${sn(hemW/2)} on each side.`,els:[['m',A,[0,SLp],-40],['g',[-hemW/2-.5,SLp],[hemW/2+.5,SLp]],['m',D,[0,SLp],-34],['m',[0,SLp],E2,-34],['p','D',D],['p','E',E2]]},
    {cap:'Round top',say:'Draw a round hill from B up to A and down to C.',els:[['c',capc]]},
    {cap:'Sides',say:'Join B to D and C to E with straight lines.',els:[['l',B,D],['l',C2,E2],['l',D,E2]]},
    {cap:'Cuff opening',say:`Mark a red line ${sn(5.5)} long at the bottom, for the opening. Mark two small folds next to it.`,els:[['y',[sx,SLp-5.5],[sx,SLp]],['y',[sx+.8,SLp],[sx+1.1,SLp-.8]],['y',[sx+1.9,SLp],[sx+2.2,SLp-.8]]]},
    {cap:'Grain and sewing space',say:`Draw the arrow down the middle. Add ${sn(.375)} sewing space all around. Cut two sleeves.`,els:[['gr',0,cap+2,SLp-7],['sa',outline,.375,null]]},
   ]});}
  {const hs=N/2+.75,cl=N/2-.25,cuffL=Wr+2.5,ly=3,cy=6.8;
   const stand=`M0 0 L${N/4} 0 Q ${hs-.4} .05 ${hs} .55 Q ${hs+.05} 1.25 ${hs-.6} 1.25 L 0 1.25 Z`;
   const leaf=`M0 ${ly} Q ${cl*.6} ${ly} ${cl+.9} ${ly-.5} L ${cl} ${ly+1.5} Q ${cl*.5} ${ly+1.9} 0 ${ly+1.875} Z`;
   const cuff=`M0 ${cy} L ${cuffL} ${cy} L ${cuffL} ${cy+2} Q ${cuffL} ${cy+2.5} ${cuffL-.5} ${cy+2.5} L .5 ${cy+2.5} Q 0 ${cy+2.5} 0 ${cy+2} Z`;
   out.push({name:'Collar & cuff',cut:'small',box:[-1.6,-1.6,Math.max(hs,cuffL)+1.3,cy+3.4],outline:stand+' '+leaf+' '+cuff,steps:[
    {cap:'Collar stand',say:`Draw a band ${sn(hs)} long and ${sn(1.25)} tall. Round off one end. The straight end goes on the fold.`,els:[['m',[0,0],[hs,0],-34],['m',[0,0],[0,1.25],40],['c',stand],['fold',0,0,1.25]]},
    {cap:'Collar',say:`Draw the collar: ${sn(cl)} long at the neck edge, ${sn(1.875)} tall. Make a point at the end. The straight end goes on the fold.`,els:[['m',[0,ly+1.875],[cl,ly+1.5],-34],['c',leaf],['fold',0,ly,ly+1.875]]},
    {cap:'Cuff',say:`Draw the cuff: ${sn(cuffL)} long and ${sn(2.5)} tall, with round corners. Cut four.`,els:[['m',[0,cy],[cuffL,cy],-34],['m',[0,cy],[0,cy+2.5],40],['c',cuff]]},
    {cap:'Sewing space',say:`Add ${sn(.375)} all around each small piece.`,els:[['sa',stand,.375,null],['sa',leaf,.375,null],['sa',cuff,.375,null]]},
   ]});}
  return out;
}
function pantDraft(){
  const m=S.pant,W=m.waist,Hp=m.hip,O=m.outseam,Bt=m.bottom,R=m.rise,L=O-1.5,hipY=R*.66,kneeY=R+(L-R)/2-2,out=[];
  {const Fh=Hp/4,ext=Hp/16,cr=(Fh+ext)/2,hh=(Bt/2-.5)/2,kh=hh+.5;
   const A=[0,0],B=[0,R],C=[0,hipY],D=[0,kneeY],E=[0,L],F=[Fh,hipY],G=[Fh+ext,R],Hc=[cr,R],I=[Fh-.5,0],J=[I[0]-(W/4+.25),0],K=[cr+kh,kneeY],Lk=[cr-kh,kneeY],M=[cr+hh,L],N=[cr-hh,L];
   const crotch=`M${pp(F)} C ${pp([Fh,R-.9])} ${pp([Fh+.5,R])} ${pp(G)}`,side=`M${pp(J)} Q ${pp([0,hipY*.35])} ${pp(C)} C ${pp([0,hipY+1])} ${pp([0,R-1])} ${pp([.25,R])} L ${pp(Lk)} L ${pp(N)}`;
   const outline=`M${pp(J)} L ${pp(I)} L ${pp(F)} C ${pp([Fh,R-.9])} ${pp([Fh+.5,R])} ${pp(G)} L ${pp(K)} L ${pp(M)} L ${pp(N)} L ${pp(Lk)} L ${pp([.25,R])} C ${pp([0,R-1])} ${pp([0,hipY+1])} ${pp(C)} Q ${pp([0,hipY*.35])} ${pp(J)} Z`;
   const cfAt=y=>y<=hipY?I[0]+.5*y/hipY:Fh;
   const fly=`M${pp([I[0]-1.5,0])} L ${pp([cfAt(6.4)-1.5,6.4])} Q ${pp([cfAt(7.5)-1.5,7.6])} ${pp([cfAt(7.6),7.6])}`;
   out.push({name:'Trouser front',cut:'2',box:[-3,-1.5,Fh+ext+1.5,L+1],outline,steps:[
    {cap:'Draw an L',say:'Take a long paper. Draw a long line down the left and a line across the top. The top is the waist. The corner is A.',els:[['g',A,[0,L+.5]],['g',A,[Fh+ext+.5,0]],['p','A',A]]},
    {cap:'Hip C and crotch B',say:`Measure ${sn(hipY)} down and mark C. Measure ${sn(R)} down and mark B. Draw lines across at both.`,els:[['m',A,C,40],['m',A,B,80],['p','C',C],['p','B',B],['g',C,[Fh+.4,hipY]],['g',B,[Fh+ext+.4,R]]]},
    {cap:'Knee D and bottom E',say:`Measure ${sn(kneeY)} down for the knee, D. Measure ${sn(L)} down for the bottom, E. Draw lines across.`,els:[['m',A,D,40],['m',A,E,80],['p','D',D],['p','E',E],['g',D,[Fh+ext,kneeY]],['g',E,[Fh+ext,L]]]},
    {cap:'Front middle F',say:`On the hip line, measure ${sn(Fh)} across from C. Mark F.`,els:[['m',C,F,-34],['p','F',F]]},
    {cap:'Crotch point G',say:`On the crotch line, go ${sn(ext)} further. Mark G.`,els:[['m',[Fh,R],G,-34],['p','G',G],['g',[Fh,hipY],[Fh,R]]]},
    {cap:'Crease line',say:'Find the middle between B and G. Mark H. Draw a red line straight down through H to the bottom. This is the crease line.',els:[['p','H',Hc],['y',[cr,-.5],[cr,L+.5]]]},
    {cap:'Waist I and J',say:`At the top, come in ${sn(.5)} from F's line and mark I. From I, measure ${sn(W/4+.25)} towards the side. Mark J.`,els:[['p','I',I],['m',J,I,-34],['p','J',J]]},
    {cap:'Knee and bottom width',say:`At the knee, mark K and L, ${sn(kh)} on each side of the crease. At the bottom, mark M and N, ${sn(hh)} on each side.`,els:[['m',[cr,kneeY],K,-34],['m',Lk,[cr,kneeY],-34],['m',N,[cr,L],-34],['m',[cr,L],M,-34],['p','K',K],['p','L',Lk],['p','M',M],['p','N',N]]},
    {cap:'Front curve',say:'Join I to F. Then draw a curve from F down to G.',els:[['l',I,F],['c',crotch]]},
    {cap:'Inside leg',say:'Join G to K to M.',els:[['l',G,K],['l',K,M],['l',M,N]]},
    {cap:'Side line',say:'Draw the side: from J, curve through C, then go down through L to N.',els:[['c',side]]},
    {cap:'Pocket and zip marks',say:'Draw the slanted pocket line at the side, and the J-shaped zip line near the front.',els:[['y',[J[0]+1.5,0],[0,6.5]],['yc',fly]]},
    {cap:'Sewing space',say:`Add ${sn(.625)} all around, and ${sn(1.5)} at the bottom. Cut two fronts.`,els:[['sa',outline,.625,null]]},
   ]});}
  {const Bh=Hp/4+1,ext=Hp/10,drop=.375,crB=(Bh+ext)/2-.5,hb=(Bt/2+.5)/2,kb=hb+.5;
   const A=[0,0],B=[0,R],C=[0,hipY],D=[0,kneeY],E=[0,L],F=[Bh,hipY],G=[Bh+ext,R+drop],Hc=[crB,R],I=[Bh-1.75,-1],J=[I[0]-(W/4+.75),0],K=[crB+kb,kneeY],Lk=[crB-kb,kneeY],M=[crB+hb,L],N=[crB-hb,L];
   const seat=`M${pp(F)} C ${pp([Bh+.15,R-.4])} ${pp([Bh+.9,R+drop])} ${pp(G)}`,side=`M${pp(J)} Q ${pp([Math.min(0,J[0]),hipY*.35])} ${pp(C)} C ${pp([0,hipY+1])} ${pp([0,R-1])} ${pp([.25,R])} L ${pp(Lk)} L ${pp(N)}`;
   const outline=`M${pp(J)} L ${pp(I)} L ${pp(F)} C ${pp([Bh+.15,R-.4])} ${pp([Bh+.9,R+drop])} ${pp(G)} L ${pp(K)} L ${pp(M)} L ${pp(N)} L ${pp(Lk)} L ${pp([.25,R])} C ${pp([0,R-1])} ${pp([0,hipY+1])} ${pp(C)} Q ${pp([Math.min(0,J[0]),hipY*.35])} ${pp(J)} Z`;
   const mx=(I[0]+J[0])/2,my=(I[1]+J[1])/2,sl=(I[1]-J[1])/(I[0]-J[0]);
   out.push({name:'Trouser back',cut:'2',box:[-3,-2,Bh+ext+1.5,L+1],outline,steps:[
    {cap:'Same lines as front',say:`Draw the L again. Mark the hip line at ${sn(hipY)} and the crotch line at ${sn(R)}.`,els:[['g',A,[0,L+.5]],['g',A,[Bh+ext+.5,0]],['m',A,C,40],['m',A,B,80],['p','A',A],['p','C',C],['p','B',B],['g',C,[Bh+.4,hipY]],['g',B,[Bh+ext+.4,R+drop]]]},
    {cap:'Knee and bottom',say:`Mark the knee at ${sn(kneeY)} and the bottom at ${sn(L)}.`,els:[['m',A,D,40],['m',A,E,80],['p','D',D],['p','E',E],['g',D,[Bh+ext,kneeY]],['g',E,[Bh+ext,L]]]},
    {cap:'Back middle F',say:`On the hip line, measure ${sn(Bh)} across. Mark F. The back is bigger than the front.`,els:[['m',C,F,-34],['p','F',F]]},
    {cap:'Crotch point G',say:`Go ${sn(drop)} below the crotch line and ${sn(ext)} past F's line. Mark G.`,els:[['m',[Bh,R+drop],G,-34],['p','G',G],['g',[Bh,hipY],[Bh,R+drop]]]},
    {cap:'Back waist I',say:`At the top, come in ${sn(1.75)} and go up ${sn(1)}. Mark I. Join I to F.`,els:[['p','I',I],['l',I,F]]},
    {cap:'Waist J',say:`From I, measure ${sn(W/4+.75)} towards the side. Mark J. Join J to I.`,els:[['m',J,I,-34],['p','J',J],['l',J,I]]},
    {cap:'Dart',say:`In the middle of the waist, draw a narrow V, ${sn(1)} wide and ${sn(4.5)} long. This is the dart.`,els:[['yc',`M${pp([mx-.5,my-.5*sl])} L ${pp([mx+.15,my+4.5])} L ${pp([mx+.5,my+.5*sl])}`]]},
    {cap:'Crease line',say:'Find the middle between B and G, then move half an inch to the left. Draw the red crease line straight down.',els:[['p','H',Hc],['y',[crB,-.8],[crB,L+.5]]]},
    {cap:'Knee and bottom width',say:`Mark K and L, ${sn(kb)} each side at the knee. Mark M and N, ${sn(hb)} each side at the bottom.`,els:[['m',[crB,kneeY],K,-34],['m',[crB,L],M,-34],['p','K',K],['p','L',Lk],['p','M',M],['p','N',N]]},
    {cap:'Seat curve',say:'Draw a deep curve from F down to G.',els:[['c',seat]]},
    {cap:'Inside leg and side',say:'Join G to K to M. Draw the side from J through C and L to N.',els:[['l',G,K],['l',K,M],['l',M,N],['c',side]]},
    {cap:'Back pocket',say:`Draw a red line ${sn(5.5)} wide, ${sn(2.5)} below the waist, for the back pocket.`,els:[['y',[mx-2.75,my+2.5-2.75*sl],[mx+2.75,my+2.5+2.75*sl]]]},
    {cap:'Sewing space',say:`Add ${sn(.625)} all around. Add ${sn(1)} on the seat curve, so you can change it later. Cut two backs.`,els:[['sa',outline,.625,null]]},
   ]});}
  {const len=W/2+2.5,band=`M0 0 L${len} 0 L${len} 3 L0 3 Z`;
   out.push({name:'Waistband',cut:'2',box:[-1.6,-1.6,len+1,4.6],outline:band,steps:[
    {cap:'Waistband',say:`Draw a long strip ${sn(len)} long and ${sn(3)} tall. Cut two.`,els:[['m',[0,0],[len,0],-34],['m',[0,0],[0,3],40],['c',band]]},
    {cap:'Fold line',say:'Draw a red line along the middle. The band folds in half here.',els:[['y',[0,1.5],[len,1.5]]]},
    {cap:'Overlap',say:`Mark ${sn(2)} at one end. This part overlaps for the hook.`,els:[['g',[len-2,0],[len-2,3]],['m',[len-2,3],[len,3],-34]]},
   ]});}
  return out;
}
function draftSvg(pc,idx){
  const [x0,y0,x1,y1]=pc.box,w=x1-x0,h=y1-y0,s=Math.min(760/w,460/h),ox=20+(760-w*s)/2-x0*s,oy=20+(460-h*s)/2-y0*s;
  const M=p=>[ox+p[0]*s,oy+p[1]*s],MD=d=>TR(d,(x,y)=>[ox+x*s,oy+y*s]),L2=(a,b)=>`M${pp(M(a))} L${pp(M(b))}`;
  const gs=(S.unit==='in'?1:2/2.54)*s;
  let o=`<rect x="8" y="8" width="784" height="484" rx="10" class="kraft"/><defs><pattern id="pg" x="${n1(ox)}" y="${n1(oy)}" width="${gs}" height="${gs}" patternUnits="userSpaceOnUse"><path d="M${gs} 0 L0 0 0 ${gs}" fill="none" stroke="rgba(110,85,40,.2)" stroke-width="1"/></pattern></defs><rect x="8" y="8" width="784" height="484" rx="10" fill="url(#pg)"/>`;
  const el=(e,anim,d0)=>{const k=e[0];
   const dr=(d,cls)=>anim?H.draw(d,cls,d0,.9):`<path d="${d}" class="${cls}"/>`;
   switch(k){
    case 'g':return dr(L2(e[1],e[2]),'pencilg');
    case 'l':return dr(L2(e[1],e[2]),'pencil');
    case 'c':return dr(MD(e[1]),'pencil');
    case 'y':return dr(L2(e[1],e[2]),'redm');
    case 'yc':return dr(MD(e[1]),'redm');
    case 'p':{const q=M(e[2]);const g=`<circle cx="${n1(q[0])}" cy="${n1(q[1])}" r="6" class="ptdot"/><text x="${n1(q[0]+9)}" y="${n1(q[1]-9)}" class="ptlet">${e[1]}</text>`;return anim?H.pop(g,d0):g;}
    case 'm':return anim?H.dim(M(e[1]),M(e[2]),Math.hypot(e[2][0]-e[1][0],e[2][1]-e[1][1]),d0,e[3]||0):'';
    case 'btn':{const q=M(e[1]);const g=`<circle cx="${n1(q[0])}" cy="${n1(q[1])}" r="7" fill="none" stroke="#26282a" stroke-width="2.5"/>`;return anim?H.pop(g,d0):g;}
    case 'gr':{const a=M([e[1],e[2]]),b=M([e[1],e[3]]);const g=`<path d="M${pp(a)} L${pp(b)} M${n1(a[0]-8)} ${n1(a[1]+14)} L${pp(a)} L${n1(a[0]+8)} ${n1(a[1]+14)} M${n1(b[0]-8)} ${n1(b[1]-14)} L${pp(b)} L${n1(b[0]+8)} ${n1(b[1]-14)}" class="pencil"/>`;return anim?H.fade(g,d0):g;}
    case 'fold':{const a=M([e[1],e[2]]),b=M([e[1],e[3]]);const g=`<path d="M${n1(a[0])} ${n1(a[1])} L${n1(a[0]+16)} ${n1(a[1])} L${n1(b[0]+16)} ${n1(b[1])} L${n1(b[0])} ${n1(b[1])}" fill="none" stroke="#c2410c" stroke-width="3" marker-end="url(#ah)"/><text x="${n1(a[0]-12)}" y="${n1((a[1]+b[1])/2)}" class="ptlet" style="fill:#c2410c" text-anchor="middle" transform="rotate(-90 ${n1(a[0]-12)} ${n1((a[1]+b[1])/2)})">FOLD</text>`;return anim?H.fade(g,d0):g;}
    case 'sa':{const g=`<path d="${MD(e[1])}" class="saband" style="stroke-width:${n1(e[2]*2*s)}px"/><path d="${MD(e[1])}" class="pencil" style="stroke-width:2"/>`;return anim?H.fade(g,d0)+H.chip(400,470,'+ '+f(e[2]),d0+.3):g;}
   }return '';};
  if(idx<0){o+=pc.steps.flatMap(st=>st.els).map(e=>el(e,false)).join('')+H.chip(690,60,pc.cut==='fold'?'FOLD':pc.cut==='small'?'×2 / ×4':'×'+pc.cut,.3);return o;}
  pc.steps.slice(0,idx).forEach(st=>st.els.forEach(e=>{if(e[0]!=='sa')o+=el(e,false);}));
  let d=.2;pc.steps[idx].els.forEach(e=>{o+=el(e,true,d);d+=e[0]==='p'?.3:.75;});
  return o;
}
function patternSteps(){
  const pcs=S.garment==='shirt'?shirtDraft():pantDraft(),steps=[];
  pcs.forEach((pc,pi)=>{
    steps.push({cap:pc.name,say:`Now let's draw the ${pc.name.toLowerCase()} pattern. ${pc.cut==='fold'?'It is cut on the fold.':pc.cut==='small'?'These are small pieces.':'You will cut two.'} Press next to start.`,svg:()=>draftSvg((S.garment==='shirt'?shirtDraft():pantDraft())[pi],-1)});
    pc.steps.forEach((st,si)=>steps.push({cap:st.cap,say:st.say,svg:()=>draftSvg((S.garment==='shirt'?shirtDraft():pantDraft())[pi],si),sayFn:()=>(S.garment==='shirt'?shirtDraft():pantDraft())[pi].steps[si].say}));
  });
  return steps;
}

export { pp, shirtDraft, pantDraft, draftSvg, patternSteps };
