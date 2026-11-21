export function drawChromeTitle(ctx, text, x, y, maxWidth, size, style = 'chrome') {
  const value = (text || 'SUNSET DRIVE').toUpperCase();
  let fontSize = size;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
  do { ctx.font = `${fontSize}px Anton, Impact, sans-serif`; if (ctx.measureText(value).width <= maxWidth) break; fontSize -= 2; } while(fontSize > 10);
  const measured = Math.min(ctx.measureText(value).width, maxWidth);
  ctx.save(); ctx.shadowColor='rgba(0,0,0,.72)'; ctx.shadowBlur=fontSize*.12; ctx.shadowOffsetY=fontSize*.075;
  if(style==='outline'){
    ctx.strokeStyle='#fff6ef';ctx.lineWidth=Math.max(2,fontSize*.045);ctx.strokeText(value,x,y,maxWidth);
    ctx.shadowBlur=0;ctx.shadowOffsetY=0;ctx.fillStyle='rgba(19,17,25,.54)';ctx.fillText(value,x,y,maxWidth);
  }else if(style==='solid'){
    const solid=ctx.createLinearGradient(0,y-fontSize*.5,0,y+fontSize*.5);solid.addColorStop(0,'#fff8e8');solid.addColorStop(.55,'#f9cce0');solid.addColorStop(1,'#f778a5');ctx.fillStyle=solid;ctx.fillText(value,x,y,maxWidth);
  }else{
    ctx.strokeStyle='rgba(12,12,20,.76)';ctx.lineWidth=Math.max(3,fontSize*.095);ctx.strokeText(value,x,y,maxWidth);
    const chrome=ctx.createLinearGradient(0,y-fontSize*.55,0,y+fontSize*.55);chrome.addColorStop(0,'#ffffff');chrome.addColorStop(.16,'#b8f5ff');chrome.addColorStop(.29,'#fff');chrome.addColorStop(.47,'#94a8ba');chrome.addColorStop(.52,'#fff');chrome.addColorStop(.72,'#f3bfd9');chrome.addColorStop(1,'#fff');
    ctx.fillStyle=chrome;ctx.fillText(value,x,y,maxWidth);
    ctx.save();ctx.beginPath();ctx.rect(x-measured*.51,y-fontSize*.4,measured*1.02,fontSize*.8);ctx.clip();ctx.shadowColor='transparent';ctx.shadowBlur=0;ctx.shadowOffsetY=0;
    ctx.globalAlpha=.58;for(let stripe=y-fontSize*.22;stripe<y+fontSize*.32;stripe+=Math.max(3,fontSize*.075)){ctx.fillStyle=stripe<y?'#fff':'#688393';ctx.fillRect(x-measured*.53,stripe,measured*1.06,Math.max(1,fontSize*.018));}ctx.restore();
    ctx.save();ctx.shadowColor='transparent';ctx.shadowBlur=0;ctx.shadowOffsetY=0;ctx.globalAlpha=.65;ctx.strokeStyle='#fff';ctx.lineWidth=Math.max(1,fontSize*.012);ctx.beginPath();ctx.moveTo(x-measured*.47,y-fontSize*.37);ctx.lineTo(x+measured*.47,y-fontSize*.37);ctx.stroke();ctx.restore();
  }
  ctx.restore(); return {fontSize,width:measured};
}
