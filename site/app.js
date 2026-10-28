'use strict';
const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clock=s=>`${Math.floor(s/60).toString().padStart(2,'0')}:${Math.floor(s%60).toString().padStart(2,'0')}`;
let content, transcript;
function seek(seconds){
 const sec=Math.max(0,Math.floor(seconds));
 $('video').innerHTML=`<iframe title="Lex Clips: Is RFK Jr an antivaxxer?" src="https://www.youtube-nocookie.com/embed/iWTCcZwuIZ8?start=${sec}&autoplay=1" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>`;
 $('video-status').textContent=`Player opened at ${clock(sec)}. Transcript timestamps are minute boundaries; claim markers are approximate.`;
 $('video').scrollIntoView({behavior:'smooth',block:'center'});
}
function renderClaims(){
 const q=$('claim-search').value.toLowerCase().trim(),v=$('verdict-filter').value;
 const rows=content.claims.filter(c=>(!v||c.verdict===v)&&JSON.stringify(c).toLowerCase().includes(q));
 $('result-count').textContent=`${rows.length} of ${content.claims.length} claims`;
 $('claim-list').innerHTML=rows.map(c=>{
 const cls=/Contradicted|Not established/.test(c.verdict)?'red':c.verdict==='Scope note'?'gray':c.verdict==='Partly supported'?'green':'';
 return `<details class="claim" id="claim-${c.id}"><summary><span class="time">${clock(c.time)}</span><span class="claim-title">${esc(c.title)}<small>${esc(c.summary)}</small></span><span class="badge ${cls}">${esc(c.verdict)}</span><span class="toggle" aria-hidden="true">+</span></summary><div class="claim-content"><p class="claim-context"><span>What he says · paraphrase</span>${esc(c.said)}</p><div class="analysis-grid"><div><h3>What deserves a fair hearing</h3><p>${esc(c.fair)}</p></div><div><h3>What the evidence supports</h3><p>${esc(c.analysis)}</p></div></div><div class="limits"><h3>Limits and remaining questions</h3><p>${esc(c.limits)}</p></div><div class="claim-links"><button type="button" class="watch" data-seek="${c.time}">Hear the claim ↗ ${clock(c.time)}</button>${c.refs.map(id=>{const s=content.sources.find(s=>s.id===id);return `<a href="#source-${id}" data-source="${id}">${esc(s.title.split(',')[0])} ↘</a>`}).join('')}</div></div></details>`;
 }).join('')||'<p class="empty">No matching claims. Try another search or assessment.</p>';
 $('expand-all').textContent='Expand all';
}
function renderSources(){
 const q=$('source-search').value.toLowerCase().trim(),kind=$('source-filter').value;
 const rows=content.sources.filter(s=>(!kind||s.kind===kind)&&JSON.stringify(s).toLowerCase().includes(q));
 $('source-results').textContent=`${rows.length} of ${content.sources.length} sources`;
 $('source-list').innerHTML=rows.map(s=>`<article id="source-${s.id}" class="source-card"><span class="source-kind">${esc(s.kind)}</span><h3>${esc(s.title)}</h3><p>${esc(s.note)}</p><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">Open source ↗</a></article>`).join('')||'<p class="empty">No matching sources.</p>';
}
function renderTranscript(){
 const q=$('transcript-search').value.toLowerCase().trim();
 const rows=transcript.segments.filter(s=>(s.text+' '+s.speaker).toLowerCase().includes(q));
 $('transcript-list').innerHTML=rows.map(s=>`<article class="segment"><button type="button" data-seek="${s.start}" aria-label="Play audio chunk starting at ${clock(s.start)}">${clock(s.start)} ↗</button><strong>${esc(s.speaker)}</strong><p>${esc(s.text)}</p></article>`).join('')||'<p class="empty">No transcript matches.</p>';
}
const estimates={
 girls:{value:9.98,lo:.81,hi:123,label:'Girls, 2017',type:'Hazard ratio',note:'The female subgroup interval crosses 1 and is extremely wide. The point estimate alone overstates how much is known.'},
 all:{value:5,lo:1.53,hi:16.3,label:'All infants, 2017',type:'Hazard ratio',note:'The overall interval excludes 1. That supports a statistical association under the model; it does not remove possible confounding.'},
 pooled:{value:1.38,lo:.92,hi:2.08,label:'Systematic review, 2016',type:'Risk ratio',note:'The pooled interval crosses 1. The review rated the contributing DTP studies at high risk of bias and predates the 2017 paper.'}
};
function drawEstimate(){
 const e=estimates[$('study-select').value],x=v=>60+(Math.log10(v)+1)*165;
 const ticks=[.1,1,10,100];
 $('interval-plot').innerHTML=`<title>${esc(e.label)}: ${e.type} ${e.value}, 95 percent confidence interval ${e.lo} to ${e.hi}</title><line x1="60" y1="130" x2="605" y2="130" stroke="#aab8b0"/>${ticks.map(t=>`<line x1="${x(t)}" y1="125" x2="${x(t)}" y2="138" stroke="#aab8b0"/><text x="${x(t)}" y="160" text-anchor="middle" fill="#5e6d6b" font-size="13">${t}</text>`).join('')}<line x1="${x(1)}" y1="25" x2="${x(1)}" y2="130" stroke="#849a8d" stroke-dasharray="4 5"/><text x="${x(1)}" y="17" text-anchor="middle" fill="#5e6d6b" font-size="11">No difference = 1</text><line x1="${x(e.lo)}" y1="80" x2="${x(e.hi)}" y2="80" stroke="#c04f2b" stroke-width="4"/><line x1="${x(e.lo)}" y1="70" x2="${x(e.lo)}" y2="90" stroke="#c04f2b" stroke-width="2"/><line x1="${x(e.hi)}" y1="70" x2="${x(e.hi)}" y2="90" stroke="#c04f2b" stroke-width="2"/><circle cx="${x(e.value)}" cy="80" r="8" fill="#183337"/><text x="330" y="190" text-anchor="middle" fill="#5e6d6b" font-size="11">${e.type} · logarithmic scale</text>`;
 $('point').textContent=e.value.toFixed(2);$('ci').textContent=`${e.lo} to ${e.hi}`;$('estimate-note').textContent=e.note;
}
function drawDetection(){const n=Number($('sample-size').value),pct=100*(-Math.expm1(n*Math.log1p(-1/20000)));$('sample-output').value=n.toLocaleString();$('detection-value').textContent=pct.toFixed(1)+'%';$('detection-meter').style.width=pct+'%';$('detection-note').textContent=`With ${n.toLocaleString()} recipients, there is a ${(100-pct).toFixed(1)}% chance of observing none of these hypothetical attributable events.`;}
async function init(){
 try{
  const responses=await Promise.all([fetch('content.json'),fetch('transcript.json')]);
  if(responses.some(r=>!r.ok))throw Error('Could not load site data');
  [content,transcript]=await Promise.all(responses.map(r=>r.json()));
  $('claim-count').textContent=content.claims.length+' claims reviewed';$('source-count').textContent=content.sources.length+' source records';
  for(const v of [...new Set(content.claims.map(c=>c.verdict))])$('verdict-filter').add(new Option(v,v));
  for(const v of [...new Set(content.sources.map(s=>s.kind))].sort())$('source-filter').add(new Option(v,v));
  renderClaims();renderSources();renderTranscript();drawEstimate();drawDetection();
  $('claim-search').addEventListener('input',renderClaims);$('verdict-filter').addEventListener('change',renderClaims);
  $('source-search').addEventListener('input',renderSources);$('source-filter').addEventListener('change',renderSources);$('transcript-search').addEventListener('input',renderTranscript);
  $('study-select').addEventListener('change',drawEstimate);$('sample-size').addEventListener('input',drawDetection);
  $('expand-all').addEventListener('click',()=>{const rows=[...document.querySelectorAll('.claim')],open=rows.some(r=>!r.open);rows.forEach(r=>r.open=open);$('expand-all').textContent=open?'Collapse all':'Expand all';});
  $('load-video').addEventListener('click',()=>seek(0));
  document.addEventListener('click',ev=>{const btn=ev.target.closest('[data-seek]');if(btn)seek(Number(btn.dataset.seek));const ref=ev.target.closest('[data-source]');if(ref){$('source-search').value='';$('source-filter').value='';renderSources();}});
  if(location.hash){const target=document.querySelector(location.hash);if(target){if(target.tagName==='DETAILS')target.open=true;target.scrollIntoView();}}
 }catch(e){$('claim-list').innerHTML='<p class="empty">The data could not load. Serve this folder over HTTP or use the hosted website; browsers may block data loading from a file URL.</p>';console.error(e);}
}
init();
