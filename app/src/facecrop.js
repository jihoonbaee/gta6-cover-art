// Conservative skin-tone saliency experiment. Manual positioning remains available for every panel.
export function estimateSalientRegion(image) {
  const side = 96;
  const sample = document.createElement('canvas'); sample.width = side; sample.height = side;
  const ctx = sample.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(image, 0, 0, side, side);
  const pixels = ctx.getImageData(0, 0, side, side).data;
  const visited = new Uint8Array(side * side); const clusters = [];
  const isSkin = (x, y) => {
    const i = (y * side + x) * 4, r = pixels[i], g = pixels[i+1], b = pixels[i+2];
    return r > 68 && g > 34 && b > 18 && r > g * 1.08 && r > b * 1.16 && Math.abs(r-g) > 12 && r-g < 125;
  };
  for (let y=0;y<side;y++) for(let x=0;x<side;x++) {
    const start=y*side+x; if(visited[start] || !isSkin(x,y)) continue;
    const stack=[[x,y]], points=[]; visited[start]=1;
    while(stack.length){const [px,py]=stack.pop();points.push([px,py]);for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const nx=px+dx,ny=py+dy,idx=ny*side+nx;if(nx<0||ny<0||nx>=side||ny>=side||visited[idx]||!isSkin(nx,ny))continue;visited[idx]=1;stack.push([nx,ny]);}}
    if(points.length<Math.max(28,side*side*.004))continue;
    const xs=points.map(p=>p[0]),ys=points.map(p=>p[1]),left=Math.min(...xs),right=Math.max(...xs),top=Math.min(...ys),bottom=Math.max(...ys),w=right-left+1,h=bottom-top+1;
    if(bottom>=side-2 || w>h*2)continue;
    const cx=(left+right)/2/side,cy=(top+bottom)/2/side;
    const centerPrior=Math.max(0,1-Math.hypot(cx-.5,cy-.37)/.62),upperPrior=Math.max(.12,1-Math.abs(cy-.34)/.75);
    clusters.push({cx,cy,w:w/side,h:h/side,score:points.length*centerPrior*upperPrior});
  }
  clusters.sort((a,b)=>b.score-a.score);
  const best=clusters[0];
  if(!best||best.score<20)return null;
  return {x:best.cx,y:best.cy,width:best.w,height:best.h,confidence:Math.min(1,best.score/130)};
}
