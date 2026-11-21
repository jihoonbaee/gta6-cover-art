import { definePosterLayouts } from './layouts.js';
import { drawPoster } from './panels.js';

const sizes={square:[1080,1080],portrait:[1080,1350],landscape:[1920,1080]};
export async function exportCoverPNG(state,size){
  const [width,height]=sizes[size];const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
  const ctx=canvas.getContext('2d',{alpha:false});drawPoster(ctx,state,definePosterLayouts()[size][state.layout],width,height);
  const blob=await new Promise((resolve,reject)=>canvas.toBlob(value=>value?resolve(value):reject(new Error('PNG export failed')),'image/png'));
  const link=document.createElement('a');link.href=URL.createObjectURL(blob);link.download=`sunset-vice-${size}.png`;link.click();setTimeout(()=>URL.revokeObjectURL(link.href),1200);return blob;
}
