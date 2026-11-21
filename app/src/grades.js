const treatments = {
  'Vice Sunset': { filter: 'saturate(1.18) contrast(1.08)', colors: ['#ff9b52','#d82f85'], alpha: .2 },
  'Neon Nights': { filter: 'saturate(1.32) contrast(1.1)', colors: ['#17c9d4','#e82a95'], alpha: .22 },
  'Palm Noir': { filter: 'saturate(.58) contrast(1.35)', colors: ['#126d71','#b8e7cc'], alpha: .17 },
  'Golden Hour': { filter: 'sepia(.34) saturate(1.18) contrast(1.04)', colors: ['#ffcb63','#d17b35'], alpha: .2 },
  'Bubblegum': { filter: 'saturate(1.24) hue-rotate(-12deg)', colors: ['#ff71be','#793bd5'], alpha: .21 },
  'Mono Pop': { filter: 'grayscale(1) contrast(1.22)', colors: ['#f5f1e9','#f05283'], alpha: .15 }
};

export function gradeNames() { return Object.keys(treatments); }

export function applyGrade(ctx, image, x, y, width, height, grade, crop) {
  const treatment = treatments[grade] || treatments['Vice Sunset'];
  ctx.save();
  ctx.filter = treatment.filter;
  if(crop.fit){ctx.drawImage(image,x+crop.dx,y+crop.dy,crop.dw,crop.dh);}
  else{ctx.drawImage(image, crop.sx, crop.sy, crop.sw, crop.sh, x, y, width, height);}
  ctx.filter = 'none';
  const overlay = ctx.createLinearGradient(x, y, x + width, y + height);
  overlay.addColorStop(0, treatment.colors[0]);
  overlay.addColorStop(.55, 'transparent');
  overlay.addColorStop(1, treatment.colors[1]);
  ctx.globalCompositeOperation = 'soft-light';
  ctx.globalAlpha = treatment.alpha;
  ctx.fillStyle = overlay;
  ctx.fillRect(x, y, width, height);
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;
  const vignette = ctx.createRadialGradient(x + width*.5, y + height*.42, Math.min(width,height)*.18, x + width*.5, y + height*.5, Math.max(width,height)*.78);
  vignette.addColorStop(0, 'transparent'); vignette.addColorStop(1, 'rgba(7,8,16,.43)');
  ctx.fillStyle = vignette; ctx.fillRect(x,y,width,height);
  ctx.restore();
}
