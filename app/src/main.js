import { definePosterLayouts, listLayoutNames } from './layouts.js';
import { gradeNames } from './grades.js';
import { drawPoster, cropForPanel } from './panels.js';
import { exportCoverPNG } from './exporter.js';
import { estimateSalientRegion } from './facecrop.js';
import { getShotScene } from './shots.js';

const $=selector=>document.querySelector(selector), canvas=$('#coverCanvas'),ctx=canvas.getContext('2d',{alpha:false});
const params=new URLSearchParams(location.search),shot=params.get('shot');if(shot)document.body.dataset.shot=shot;
const state={size:'portrait',layout:'Hero Left',grade:'Vice Sunset',caption:'SUNSET DRIVE',subtitle:'A CITY AFTER DARK',titleStyle:'chrome',photos:[],crops:[],tags:[]};
const images={};let activePanel=0,drag=null,toastTimer;
const sizes={square:[1080,1080],portrait:[1080,1350],landscape:[1920,1080]};
const photoFiles=[['boulevard.jpg','Palm Blvd'],['pier.jpg','Blue Pier'],['vicecity1.jpg','South Shore'],['vicecity2.jpg','Afterglow'],['vicecity3.jpg','Boardwalk'],['vicecity4.jpg','Night Drive']];

function imageFrom(url){return new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=reject;image.src=url;});}
async function loadSamples(){for(const [file] of photoFiles){try{images[file]={image:await imageFrom(`./samples/${file}`),name:file.replace('.jpg','').replace('vicecity','SCENE ')};}catch{}}}
function freshCrop(){return {x:.5,y:.37,zoom:1,fit:'fill'};}
function setCropDefault(index){state.crops[index]=freshCrop();}
function createControls(){
  const layoutSelect=$('#layoutSelect');for(const name of listLayoutNames()){const option=document.createElement('option');option.value=name;option.textContent=name;layoutSelect.append(option);}layoutSelect.value=state.layout;
  for(const grade of gradeNames()){const button=document.createElement('button');button.type='button';button.className=`grade-chip${grade===state.grade?' active':''}`;button.dataset.grade=grade;button.innerHTML=`<i class="grade-swatch"></i><span>${grade}</span>`;button.addEventListener('click',()=>{state.grade=grade;document.querySelectorAll('.grade-chip').forEach(el=>el.classList.toggle('active',el===button));render();});$('#gradeGrid').append(button);}
  const samples=$('#samples');for(const [file,label] of photoFiles){const button=document.createElement('button');button.type='button';button.className='scene-chip';button.innerHTML=`<img src="./samples/${file}" alt=""><span>${label}</span>`;button.addEventListener('click',()=>applyPhoto(images[file],true));samples.append(button);}
  bindEvents();
}
function bindEvents(){
  $('#layoutSelect').addEventListener('change',event=>{state.layout=event.target.value;updatePanels();render();});
  $('#captionInput').addEventListener('input',event=>{state.caption=event.target.value||'SUNSET DRIVE';render();});
  $('#subtitleInput').addEventListener('input',event=>{state.subtitle=event.target.value;render();});
  $('#titleStyle').addEventListener('change',event=>{state.titleStyle=event.target.value;render();});
  $('#onePhotoMode').addEventListener('change',event=>{if(event.target.checked&&state.photos[0]){const photo=state.photos[0],count=definePosterLayouts()[state.size][state.layout].length;state.photos=Array.from({length:count},()=>photo);state.crops=Array.from({length:count},(_,i)=>state.crops[i]||freshCrop());}updatePanels();render();});
  $('#panelSelect').addEventListener('change',event=>{activePanel=Number(event.target.value);syncCropControls();});
  $('#tagInput').addEventListener('input',event=>{state.tags[activePanel]=event.target.value||`SCENE 0${activePanel+1}`;updatePanels();render();});
  $('#zoomSlider').addEventListener('input',event=>{state.crops[activePanel].zoom=Number(event.target.value);$('#zoomValue').value=`${Number(event.target.value).toFixed(1)}×`;render();});
  $('#fitToggle').addEventListener('click',()=>{const crop=state.crops[activePanel];crop.fit=crop.fit==='fill'?'fit':'fill';$('#fitToggle').textContent=crop.fit.toUpperCase();render();});
  $('#uploadButton').addEventListener('click',()=>$('#photoInput').click());
  $('#photoInput').addEventListener('change',async event=>{const file=event.target.files[0];if(!file)return;try{const image=await imageFrom(URL.createObjectURL(file));applyPhoto({image,name:file.name.replace(/\.[^.]+$/,'')},$('#onePhotoMode').checked);}catch{notify('Could not open that image.');}event.target.value='';});
  document.querySelectorAll('.export-buttons button').forEach(button=>button.addEventListener('click',async()=>{try{state.size=button.dataset.size;updatePanels();render();syncCropControls();await exportCoverPNG(state,button.dataset.size);notify(`${button.textContent.trim().split('\n')[0]} PNG exported`);}catch{notify('Export could not be created.');}}));
  canvas.addEventListener('pointerdown',event=>{const rect=canvas.getBoundingClientRect(),nx=(event.clientX-rect.left)/rect.width,ny=(event.clientY-rect.top)/rect.height,rects=definePosterLayouts()[state.size][state.layout];for(let index=rects.length-1;index>=0;index--){const panel=rects[index];if(nx>=panel.x&&nx<=panel.x+panel.width&&ny>=panel.y&&ny<=panel.y+panel.height){activePanel=index;$('#panelSelect').value=String(index);syncCropControls();break;}}if(!state.crops[activePanel])state.crops[activePanel]=freshCrop();drag={startX:event.clientX,startY:event.clientY,cropX:state.crops[activePanel].x,cropY:state.crops[activePanel].y,rect};canvas.setPointerCapture(event.pointerId);});
  canvas.addEventListener('pointermove',event=>{if(!drag)return;const crop=state.crops[activePanel];crop.x=Math.max(0,Math.min(1,drag.cropX-(event.clientX-drag.startX)/drag.rect.width));crop.y=Math.max(0,Math.min(1,drag.cropY-(event.clientY-drag.startY)/drag.rect.height));render();});
  canvas.addEventListener('pointerup',()=>drag=null);canvas.addEventListener('wheel',event=>{event.preventDefault();const crop=state.crops[activePanel];crop.zoom=Math.max(1,Math.min(2.6,crop.zoom+(event.deltaY<0?.08:-.08)));$('#zoomSlider').value=crop.zoom;$('#zoomValue').value=`${crop.zoom.toFixed(1)}×`;render();},{passive:false});
}
function applyPhoto(photo,all){if(!photo)return;if(all){const count=definePosterLayouts()[state.size][state.layout].length;state.photos=Array.from({length:count},()=>photo);state.crops=Array.from({length:count},()=>freshCrop());state.tags=Array.from({length:count},(_,i)=>i===0?'LEAD SCENE':`SCENE 0${i+1}`);}else{state.photos[activePanel]=photo;setCropDefault(activePanel);state.tags[activePanel]=photo.name.toUpperCase().slice(0,16);}document.querySelectorAll('.scene-chip').forEach(button=>button.classList.remove('active'));const sampleIndex=photoFiles.findIndex(([file])=>photo.name===file.replace('.jpg',''));if(sampleIndex>=0)$('#samples').children[sampleIndex].classList.add('active');updatePanels();render();}
function updatePanels(){const rects=definePosterLayouts()[state.size][state.layout],select=$('#panelSelect');if($('#onePhotoMode').checked&&state.photos[0]){for(let i=0;i<rects.length;i++){state.photos[i]=state.photos[0];if(!state.crops[i])state.crops[i]=freshCrop();if(!state.tags[i])state.tags[i]=i===0?'LEAD SCENE':`SCENE 0${i+1}`;}}select.replaceChildren();rects.forEach((_,index)=>{const option=document.createElement('option');option.value=String(index);option.textContent=`Panel ${String(index+1).padStart(2,'0')} · ${state.tags[index]||'SCENE'}`;select.append(option);});activePanel=Math.min(activePanel,rects.length-1);select.value=String(activePanel);$('#tagInput').value=state.tags[activePanel]||`SCENE 0${activePanel+1}`;$('#panelCount').textContent=`${String(rects.length).padStart(2,'0')} PANELS`;}
function syncCropControls(){const crop=state.crops[activePanel]||freshCrop();$('#zoomSlider').value=crop.zoom;$('#zoomValue').value=`${crop.zoom.toFixed(1)}×`;$('#fitToggle').textContent=crop.fit.toUpperCase();}
function render(){const [width,height]=sizes[state.size];if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;}const rects=definePosterLayouts()[state.size][state.layout];drawPoster(ctx,state,rects,width,height);$('#stageHint').style.display=state.photos.some(Boolean)?'none':'block';$('#resolutionLabel').textContent=`${state.size.toUpperCase()} · ${width} × ${height}`;document.querySelectorAll('.export-buttons button').forEach(button=>button.classList.toggle('selected',button.dataset.size===state.size));}
function notify(message){const toast=$('#toast');toast.textContent=message;toast.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('visible'),2200);}

async function boot(){
  await loadSamples();createControls();
  const scene=getShotScene(shot);
  if(scene){state.size=scene.size;state.layout=scene.layout;state.grade=scene.grade;state.caption=scene.caption;state.subtitle=scene.subtitle;$('#layoutSelect').value=state.layout;$('#captionInput').value=state.caption;$('#subtitleInput').value=state.subtitle;document.querySelectorAll('.grade-chip').forEach(button=>button.classList.toggle('active',button.dataset.grade===state.grade));applyPhoto(images[scene.photo],true);}
  else{const initial=images['boulevard.jpg'];if(initial)applyPhoto(initial,true);}
  updatePanels();render();await document.fonts.ready;render();
  if(shot)window.__shotReady=true;
  window.__posterLayouts=definePosterLayouts();window.__cropTest=estimateSalientRegion;window.__renderTest=(layout,size)=>{state.layout=layout;state.size=size;updatePanels();render();};window.__cropDiagnostics=Object.fromEntries(Object.entries(images).map(([name,photo])=>[name,estimateSalientRegion(photo.image)]));
}
boot().catch(error=>{console.error(error);document.body.insertAdjacentHTML('beforeend','<p class="render-error">Cover render could not start.</p>');});
