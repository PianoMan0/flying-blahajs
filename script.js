const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
function resize(){ canvas.width = innerWidth; canvas.height = innerHeight; }
addEventListener('resize', resize);
resize();

let useLocal = true;

function loadImage(src, cb){
	const img = new Image();
	img.crossOrigin = 'anonymous';
	img.onload = ()=>cb(img);
	img.onerror = ()=>cb(null);
	img.src = src;
}

let imgCache = null;
function ensureImage(cb){
	if(imgCache){ cb(imgCache); return; }
	if(useLocal){
		loadImage('blahaj.png', (img)=>{
			if(img){ imgCache = img; cb(img); }
			else { loadImage(fallbackUrl, (f)=>{ imgCache = f; cb(f); }); }
		});
	} else {
		loadImage(fallbackUrl, (f)=>{ imgCache = f; cb(f); });
	}
}

let params = { count:3, speed:1, amp:60 };
const countEl = document.getElementById('count');
const speedEl = document.getElementById('speed');
const ampEl = document.getElementById('amp');
countEl.value = params.count;
speedEl.value = params.speed;
ampEl.value = params.amp;

countEl.addEventListener('input', ()=>{ params.count = +countEl.value; initEntities(); });
speedEl.addEventListener('input', ()=>{ params.speed = +speedEl.value; });
ampEl.addEventListener('input', ()=>{ params.amp = +ampEl.value; });

document.getElementById('toggleImage').addEventListener('click', ()=>{
	useLocal = !useLocal;
	imgCache = null;
});

let entities = [];
function initEntities(){
	entities = [];
	for(let i=0;i<params.count;i++){
		entities.push({
			x: Math.random()*canvas.width,
			y: canvas.height/2 + (Math.random()-0.5)*200,
			speed: 20 + Math.random()*80,
			phase: Math.random()*Math.PI*2,
			scale: 0.25 + Math.random()*0.6,
			rotation: 0
		});
	}
}
initEntities();

let last = performance.now();
function loop(now){
	const dt = Math.min(0.05, (now - last)/1000);
	last = now;
	ctx.clearRect(0,0,canvas.width,canvas.height);
	ensureImage((img)=>{
		entities.forEach((e,i)=>{
			e.x += e.speed * params.speed * dt;
			if(e.x - img.width*e.scale/2 > canvas.width) e.x = -img.width*e.scale/2;
			e.y = canvas.height/2 + Math.sin((now/1000)*(0.7 + i*0.1) + e.phase) * params.amp;
			e.rotation = Math.sin((now/800)+e.phase) * 0.4;
			const w = img.width * e.scale;
			const h = img.height * e.scale;
			ctx.save();
			ctx.translate(e.x, e.y);
			ctx.rotate(e.rotation);
			ctx.drawImage(img, -w/2, -h/2, w, h);
			ctx.restore();
		});
	});
	requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
