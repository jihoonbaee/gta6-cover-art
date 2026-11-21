import { applyGrade } from './grades.js';
import { drawChromeTitle } from './lettering.js';

export function drawPoster(ctx, state, rects, width, height) {
  const unit=Math.min(width,height), pad=Math.max(7,unit*.009), border=Math.max(3,unit*.005);
  ctx.clearRect(0,0,width,height);ctx.fillStyle='#080a11';ctx.fillRect(0,0,width,height);
  rects.forEach((rect,index)=>{
    const panelX=rect.x*width,panelY=rect.y*height,panelW=rect.width*width,panelH=rect.height*height;
    ctx.save();ctx.shadowColor='rgba(0,0,0,.45)';ctx.shadowBlur=unit*.014;ctx.shadowOffsetY=unit*.004;ctx.fillStyle='#f7f1e8';ctx.fillRect(panelX,panelY,panelW,panelH);ctx.restore();
    const photo=state.photos[index]||state.photos[0];
    if(photo){
      const inset=border*.6,ix=panelX+inset,iy=panelY+inset,iw=panelW-inset*2,ih=panelH-inset*2;
      ctx.save();ctx.beginPath();ctx.rect(ix,iy,iw,ih);ctx.clip();
      const crop=calculateCrop(photo,iw,ih,state.crops[index]||state.crops[0]);applyGrade(ctx,photo.image,ix,iy,iw,ih,state.grade,crop);ctx.restore();
      const label=state.tags[index]||`SCENE 0${index+1}`;drawPanelTag(ctx,label,panelX+pad,panelY+panelH-pad*1.45,Math.min(panelW*.54,unit*.24),unit);
    }else{ctx.fillStyle='#282a30';ctx.fillRect(panelX+border,panelY+border,panelW-border*2,panelH-border*2);}
  });
  drawFooter(ctx,state,width,height,unit,pad);
}

function calculateCrop(photo,dw,dh,controls){
  const iw=photo.image.naturalWidth||photo.image.width,ih=photo.image.naturalHeight||photo.image.height;
  if(controls.fit==='fit'){
    const scale=Math.min(dw/iw,dh/ih)*(controls.zoom||1),drawW=iw*scale,drawH=ih*scale;
    return {fit:true,dx:(dw-drawW)*(controls.x??.5),dy:(dh-drawH)*(controls.y??.5),dw:drawW,dh:drawH};
  }
  const fill=Math.max(dw/iw,dh/ih),fit=controls.fit==='fit'?Math.min(dw/iw,dh/ih):fill,scale=fit*(controls.zoom||1);
  const sw=Math.min(iw,dw/scale),sh=Math.min(ih,dh/scale);
  const maxX=iw-sw,maxY=ih-sh,sx=Math.max(0,Math.min(maxX,(maxX*(controls.x||.5)))),sy=Math.max(0,Math.min(maxY,(maxY*(controls.y||.38))));
  return {sx,sy,sw,sh};
}

function drawPanelTag(ctx,text,x,y,maxWidth,unit){
  const h=unit*.034,pad=unit*.011,font=unit*.013;ctx.save();ctx.font=`${font}px Bebas, sans-serif`;const label=String(text).toUpperCase().slice(0,22),w=Math.min(maxWidth,ctx.measureText(label).width+pad*2);ctx.fillStyle='rgba(9,11,18,.73)';ctx.fillRect(x,y-h,w,h);ctx.fillStyle='#fff';ctx.textAlign='left';ctx.textBaseline='middle';ctx.fillText(label,x+pad,y-h/2,w-pad*2);ctx.restore();
}

function drawFooter(ctx,state,width,height,unit,pad){
  const landscape=width/height>1.45,bandH=height*(landscape?.285:.22),base=height-bandH;
  const fade=ctx.createLinearGradient(0,base-bandH*.18,0,height);fade.addColorStop(0,'rgba(7,8,15,0)');fade.addColorStop(.23,'rgba(8,8,15,.73)');fade.addColorStop(1,'rgba(8,8,15,.96)');ctx.fillStyle=fade;ctx.fillRect(0,base-bandH*.2,width,bandH*1.2);
  const titleY=base+bandH*.39,titleSize=unit*(landscape?.112:.108),titleWidth=width*.84;
  drawChromeTitle(ctx,state.caption,pad+titleWidth/2,titleY,titleWidth,titleSize,state.titleStyle);
  ctx.save();ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`${unit*.025}px Bebas, sans-serif`;ctx.fillStyle='rgba(255,255,255,.9)';ctx.letterSpacing=`${unit*.004}px`;ctx.fillText((state.subtitle||'A CITY AFTER DARK').toUpperCase(),width/2,base+bandH*.68,width*.7);ctx.restore();
  drawStars(ctx,width*.5,base+bandH*.84,unit);
  drawSeal(ctx,width-pad-unit*.072,base+bandH*.57,unit);
  drawSticker(ctx,pad+unit*.075,base+bandH*.56,unit);
  ctx.save();ctx.textAlign='center';ctx.font=`${unit*.012}px Bebas, sans-serif`;ctx.fillStyle='rgba(255,255,255,.53)';ctx.fillText('AN ORIGINAL CITY STORY  •  A SUNSET VICE STUDIO EDITION',width/2,height-pad*.7,width*.74);ctx.restore();
}
function drawStars(ctx,x,y,unit){ctx.save();ctx.font=`${unit*.019}px sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#ffe082';ctx.shadowColor='#ffb442';ctx.shadowBlur=unit*.012;ctx.fillText('★  ★  ★  ★  ★',x,y);ctx.restore();}
function drawSeal(ctx,x,y,unit){const r=unit*.045;ctx.save();ctx.translate(x,y);ctx.rotate(-.12);ctx.fillStyle='#d9f16f';ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#1d2512';ctx.lineWidth=unit*.002;ctx.stroke();ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#18200d';ctx.font=`${unit*.013}px Anton,sans-serif`;ctx.fillText('NIGHT',0,-r*.22);ctx.font=`${unit*.009}px Bebas,sans-serif`;ctx.fillText('EDITION',0,r*.21);ctx.restore();}
function drawSticker(ctx,x,y,unit){const r=unit*.04;ctx.save();ctx.translate(x,y);ctx.rotate(-.12);ctx.fillStyle='#ff5e91';ctx.beginPath();for(let i=0;i<20;i++){const a=-Math.PI/2+i*Math.PI/10,rad=i%2?r*.78:r;ctx.lineTo(Math.cos(a)*rad,Math.sin(a)*rad);}ctx.closePath();ctx.fill();ctx.strokeStyle='#fff1e8';ctx.lineWidth=unit*.002;ctx.stroke();ctx.fillStyle='#fff';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`${unit*.017}px Anton,sans-serif`;ctx.fillText('NEW',0,0);ctx.restore();}

export function cropForPanel(photo,dw,dh,controls){return calculateCrop(photo,dw,dh,controls);}
