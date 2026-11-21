import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync } from 'node:fs';

const browser='/home/hatch/.cache/ms-playwright/chromium_headless_shell-1187/chrome-linux/headless_shell';
const scenes=[
  {name:'1-cover',shot:'cover',size:'1280,720'},
  {name:'2-editor',shot:'editor',size:'1280,1280'},
  {name:'3-cover-portrait',shot:'portrait',size:'1080,1350'},
  {name:'4-cover-square',shot:'square',size:'1080,1080'}
];
mkdirSync('screenshots',{recursive:true});
for(const scene of scenes){
  const png=`/tmp/${scene.name}.png`;rmSync(png,{force:true});
  execFileSync(browser,['--no-sandbox','--disable-gpu',`--window-size=${scene.size}`,'--virtual-time-budget=10000',`--screenshot=${png}`,`http://localhost:8080/?shot=${scene.shot}`],{stdio:'inherit'});
  execFileSync('python3',['-c',"from PIL import Image; import sys; im=Image.open(sys.argv[1]).convert('RGB'); im.thumbnail((1280,1280),Image.Resampling.LANCZOS);\nfor q in range(86,44,-1):\n im.save(sys.argv[2],format='JPEG',quality=q,optimize=True,progressive=True)\n if __import__('os').path.getsize(sys.argv[2])<=262144: break\nprint(sys.argv[2],im.size,__import__('os').path.getsize(sys.argv[2]),'quality',q)",png,`screenshots/${scene.name}.jpg`],{stdio:'inherit'});
}
