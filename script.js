/* ============ BioVermi Bangladesh — Core Script ============ */
const BV = {
  data: {},
  init(){
    this.loadAll();
    this.applyTheme();
    this.bindNav();
    this.bindModules();
    this.bindSearch();
    this.bindCalculators();
    this.bindTasks();
    this.bindLogs();
    this.bindInventory();
    this.bindExportImport();
    this.renderDashboard();
    this.renderTasks();
    this.renderInventory();
    this.renderLogs();
  },
  /* ---------- Storage ---------- */
  key(k){return 'bv_'+k},
  get(k,def){try{const v=localStorage.getItem(this.key(k));return v?JSON.parse(v):def}catch(e){return def}},
  set(k,v){localStorage.setItem(this.key(k),JSON.stringify(v))},
  loadAll(){
    this.data.demo = this.get('demo',true);
    this.data.theme = this.get('theme','light');
    this.data.tasks = this.get('tasks',[
      {id:'t1',text:'গবাদির গোবর সংগ্রহ ও প্রস্তুতি',done:false},
      {id:'t2',text:'ডাইজেস্টারে ফিডিং (দৈনিক)',done:false},
      {id:'t3',text:'গ্যাস প্রোডাকশন মনিটরিং',done:false},
      {id:'t4',text:'ডাইজেস্টেট সংগ্রহ ও পরীক্ষা',done:false},
      {id:'t5',text:'কেঁচোর বেডে ফিডিং',done:false},
      {id:'t6',text:'বেডের তাপমাত্রা ও আর্দ্রতা মাপা',done:false},
      {id:'t7',text:'ভার্মিকম্পোস্ট হার্ভেস্টিং',done:false},
      {id:'t8',text:'পণ্য প্যাকেজিং',done:false}
    ]);
    this.data.inventory = this.get('inventory',[
      {id:'i1',item:'গোবর',unit:'কেজি',opening:500,purchase:0,production:0,consumption:0,sales:0,wastage:0},
      {id:'i2',item:'ডাইজেস্টেট',unit:'কেজি',opening:200,purchase:0,production:0,consumption:0,sales:0,wastage:0},
      {id:'i3',item:'ভার্মিকম্পোস্ট',unit:'কেজি',opening:100,purchase:0,production:0,consumption:0,sales:0,wastage:0},
      {id:'i4',item:'কেঁচো স্টক',unit:'কেজি',opening:20,purchase:0,production:0,consumption:0,sales:0,wastage:0},
      {id:'i5',item:'প্যাকেজিং ব্যাগ',unit:'পিস',opening:1000,purchase:0,production:0,consumption:0,sales:0,wastage:0}
    ]);
    this.data.logs = this.get('logs',[]);
  },
  /* ---------- Theme ---------- */
  applyTheme(){
    document.documentElement.setAttribute('data-theme', this.data.theme);
  },
  toggleTheme(){
    this.data.theme = this.data.theme==='light'?'dark':'light';
    this.set('theme',this.data.theme);
    this.applyTheme();
  },
  /* ---------- Navigation ---------- */
  bindNav(){
    const ham=document.getElementById('hamburger');
    const sb=document.getElementById('sidebar');
    const ov=document.getElementById('overlay');
    if(ham)ham.addEventListener('click',()=>{sb.classList.toggle('open');ov.classList.toggle('show')});
    if(ov)ov.addEventListener('click',()=>{sb.classList.remove('open');ov.classList.remove('show')});
    const tt=document.getElementById('themeToggle');
    if(tt)tt.addEventListener('click',()=>this.toggleTheme());
    // set active link
    const path = location.pathname.split('/').pop()||'index.html';
    document.querySelectorAll('.sidebar a').forEach(a=>{
      if(a.getAttribute('href')===path) a.classList.add('active');
    });
  },
  /* ---------- Modules accordion ---------- */
  bindModules(){
    document.querySelectorAll('.module-header').forEach(h=>{
      h.addEventListener('click',()=>h.parentElement.classList.toggle('open'));
    });
  },
  /* ---------- Search ---------- */
  bindSearch(){
    const s=document.getElementById('siteSearch');
    if(!s)return;
    s.addEventListener('input',e=>{
      const q=e.target.value.trim().toLowerCase();
      document.querySelectorAll('.module').forEach(m=>{
        if(!q){m.style.display='';return}
        const txt=m.textContent.toLowerCase();
        m.style.display=txt.includes(q)?'':'none';
      });
      document.querySelectorAll('[data-searchable]').forEach(el=>{
        if(!q){el.style.display='';return}
        el.style.display=el.textContent.toLowerCase().includes(q)?'':'none';
      });
    });
  },
  /* ---------- Calculators ---------- */
  bindCalculators(){
    // Cow Dung Preparation
    const cd=document.getElementById('cdCalc');
    if(cd)cd.addEventListener('click',()=>{
      const dung=+document.getElementById('cdDung').value||0;
      const moist=+document.getElementById('cdMoist').value||0;
      const target=+document.getElementById('cdTarget').value||0;
      if(!dung||!target||moist<0||moist>=100)return alert('সব ঘর সঠিকভাবে পূরণ করুন');
      // TS in dung = (1 - moist/100)
      const tsIn = dung*(1-moist/100);
      // target TS fraction
      const totalSlurry = tsIn/(target/100);
      const water = Math.max(0,totalSlurry-dung);
      document.getElementById('cdResult').innerHTML=`
        <h4>📊 ফলাফল <span class="badge badge-est">Estimated</span></h4>
        <div class="res-line"><span>গোবরে Total Solids</span><b>${tsIn.toFixed(2)} কেজি</b></div>
        <div class="res-line"><span>প্রয়োজনীয় পানি</span><b>${water.toFixed(2)} লিটার</b></div>
        <div class="res-line"><span>মোট Slurry</span><b>${totalSlurry.toFixed(2)} কেজি</b></div>
        <div class="res-line"><span>দৈনিক Feed Volume (আনুমানিক)</span><b>${(totalSlurry/1000).toFixed(3)} m³</b></div>
        <div class="formula">TS = গোবর × (1 − Moisture%)<br>Slurry = TS ÷ (Target TS%)<br>পানি = Slurry − গোবর</div>
        <small>⚠️ এটি আনুমানিক হিসাব। বাস্তব গোবরের প্রকৃত TS পরীক্ষা করে মান সমন্বয় করুন।</small>`;
    });

    // Biogas Sizing
    const bg=document.getElementById('bgCalc');
    if(bg)bg.addEventListener('click',()=>{
      const dung=+document.getElementById('bgDung').value||0;
      const hrt=+document.getElementById('bgHRT').value||0;
      const ts=+document.getElementById('bgTS').value||8;
      const yld=+document.getElementById('bgYield').value||0.04;
      if(!dung||!hrt)return alert('দৈনিক গোবর ও HRT দিন');
      const slurry=dung*(100/ts); // kg slurry
      const digester=slurry*hrt/1000; // m3
      const gas=dung*yld; // m3/day
      const storage=gas*0.6;
      const digestate=slurry*0.85;
      document.getElementById('bgResult').innerHTML=`
        <h4>📊 ফলাফল <span class="badge badge-est">Estimated</span></h4>
        <div class="res-line"><span>Daily Slurry Volume</span><b>${(slurry/1000).toFixed(3)} m³</b></div>
        <div class="res-line"><span>Estimated Digester Volume</span><b>${digester.toFixed(2)} m³</b></div>
        <div class="res-line"><span>Estimated Gas Production</span><b>${gas.toFixed(2)} m³/day</b></div>
        <div class="res-line"><span>Required Gas Storage</span><b>${storage.toFixed(2)} m³</b></div>
        <div class="res-line"><span>Estimated Digestate Output</span><b>${(digestate/1000).toFixed(3)} m³/day</b></div>
        <div class="formula">Slurry = Dung ÷ (TS/100)<br>Digester = Slurry × HRT<br>Gas ≈ Dung × Yield (m³/kg)<br>Storage ≈ Gas × 0.6</div>
        <div class="alert alert-warn">⚠️ এটি প্রাথমিক অনুমান। বাস্তব নির্মাণের জন্য Site-specific Engineering Design ও যোগ্য প্রকৌশলীর পরামর্শ আবশ্যক।</div>`;
    });

    // Worm Population
    const wp=document.getElementById('wpCalc');
    if(wp)wp.addEventListener('click',()=>{
      const init=+document.getElementById('wpInit').value||0;
      const days=+document.getElementById('wpDays').value||0;
      const rate=+document.getElementById('wpRate').value||0; // % per day
      if(!init||!days)return alert('প্রাথমিক সংখ্যা ও দিন দিন');
      const final=init*Math.pow(1+rate/100,days);
      document.getElementById('wpResult').innerHTML=`
        <h4>📊 ফলাফল <span class="badge badge-est">Estimated</span></h4>
        <div class="res-line"><span>প্রাথমিক কেঁচো</span><b>${init}</b></div>
        <div class="res-line"><span>দিন</span><b>${days}</b></div>
        <div class="res-line"><span>আনুমানিক চূড়ান্ত সংখ্যা</span><b>${Math.round(final)}</b></div>
        <div class="formula">N = N₀ × (1 + r)^t</div>
        <small>r = দৈনিক বৃদ্ধির হার (%), t = দিন। প্রকৃত হার প্রজাতি, তাপমাত্রা, খাদ্য ও ব্যবস্থাপনার ওপর নির্ভর করে।</small>`;
    });

    // Feeding Calculator
    const fc=document.getElementById('feedCalc');
    if(fc)fc.addEventListener('click',()=>{
      const biomass=+document.getElementById('feedBio').value||0;
      const rate=+document.getElementById('feedRate').value||50; // percent
      const uneaten=+document.getElementById('feedUneaten').value||0;
      if(!biomass)return alert('কেঁচোর biomass দিন');
      const suggested=biomass*(rate/100)-uneaten;
      const next= new Date(); next.setDate(next.getDate()+3);
      document.getElementById('feedResult').innerHTML=`
        <h4>📊 ফলাফল <span class="badge badge-est">Trial Suggestion</span></h4>
        <div class="res-line"><span>কেঁচো Biomass</span><b>${biomass} কেজি</b></div>
        <div class="res-line"><span>প্রস্তাবিত Feed</span><b>${Math.max(0,suggested).toFixed(2)} কেজি</b></div>
        <div class="res-line"><span>পরবর্তী Feeding</span><b>${next.toLocaleDateString('bn-BD')}</b></div>
        <div class="formula">Feed ≈ Biomass × (Rate%) − Uneaten</div>
        <small>⚠️ এটি শুধু trial suggestion। কেঁচোর সক্রিয়তা, তাপমাত্রা ও আগের feed গ্রহণ দেখে সমন্বয় করুন।</small>`;
    });

    // Biogas Business
    const bb=document.getElementById('bizCalc');
    if(bb)bb.addEventListener('click',()=>{
      const g=(id)=>+document.getElementById(id).value||0;
      const capex=g('bCost'); const dailyGas=g('bGas');
      const gasPrice=g('bGasPrice'); const digSales=g('bDig');
      const days=g('bDays')||30; const opex=g('bOpex');
      const revDay = dailyGas*gasPrice + digSales;
      const revMonth = revDay*days;
      const expMonth = opex;
      const net = revMonth-expMonth;
      const payback = net>0 ? capex/net : 0;
      document.getElementById('bizResult').innerHTML=`
        <h4>📊 ফলাফল <span class="badge badge-est">Estimated</span></h4>
        <div class="res-line"><span>Daily Revenue</span><b>৳ ${revDay.toFixed(0)}</b></div>
        <div class="res-line"><span>Monthly Revenue</span><b>৳ ${revMonth.toFixed(0)}</b></div>
        <div class="res-line"><span>Monthly Expense</span><b>৳ ${expMonth.toFixed(0)}</b></div>
        <div class="res-line"><span>Monthly Net</span><b>৳ ${net.toFixed(0)}</b></div>
        <div class="res-line"><span>Payback (মাস)</span><b>${payback>0?payback.toFixed(1):'—'}</b></div>
        <div class="formula">Revenue = Gas×Price + Digestate Sales<br>Net = Revenue − Expense<br>Payback = CAPEX ÷ Net/Month</div>
        <small>সব দাম ব্যবহারকারী নিজে দিয়েছেন। বাজারদর যাচাই করে ব্যবহার করুন।</small>`;
    });
  },
  /* ---------- Tasks ---------- */
  bindTasks(){
    const form=document.getElementById('taskForm');
    if(form)form.addEventListener('submit',e=>{
      e.preventDefault();
      const inp=document.getElementById('taskInput');
      const t=inp.value.trim(); if(!t)return;
      this.data.tasks.push({id:'t'+Date.now(),text:t,done:false});
      this.set('tasks',this.data.tasks); inp.value='';
      this.renderTasks();
    });
  },
  renderTasks(){
    const wrap=document.getElementById('taskList'); if(!wrap)return;
    wrap.innerHTML=this.data.tasks.map(t=>`
      <div class="task-item ${t.done?'done':''}">
        <input type="checkbox" ${t.done?'checked':''} onchange="BV.toggleTask('${t.id}')">
        <span style="flex:1">${t.text}</span>
        <button class="btn btn-sm btn-danger" onclick="BV.delTask('${t.id}')">✕</button>
      </div>`).join('');
    const done=this.data.tasks.filter(t=>t.done).length;
    const pct=this.data.tasks.length?Math.round(done/this.data.tasks.length*100):0;
    const p=document.getElementById('taskProgress');
    if(p){p.style.width=pct+'%';document.getElementById('taskPct').textContent=pct+'%'}
  },
  toggleTask(id){const t=this.data.tasks.find(x=>x.id===id);if(t){t.done=!t.done;this.set('tasks',this.data.tasks);this.renderTasks()}},
  delTask(id){this.data.tasks=this.data.tasks.filter(x=>x.id!==id);this.set('tasks',this.data.tasks);this.renderTasks()},
  /* ---------- Logs ---------- */
  bindLogs(){
    const f=document.getElementById('logForm');
    if(f)f.addEventListener('submit',e=>{
      e.preventDefault();
      const log={
        date:document.getElementById('logDate').value,
        type:document.getElementById('logType').value,
        item:document.getElementById('logItem').value,
        qty:+document.getElementById('logQty').value||0,
        unit:document.getElementById('logUnit').value,
        note:document.getElementById('logNote').value
      };
      if(!log.date||!log.item)return alert('তারিখ ও বিবরণ দিন');
      this.data.logs.push({...log,id:'l'+Date.now()});
      this.set('logs',this.data.logs); f.reset(); this.renderLogs();
    });
  },
  renderLogs(){
    const w=document.getElementById('logList'); if(!w)return;
    if(!this.data.logs.length){w.innerHTML='<p style="color:var(--text-soft)">কোনো লগ নেই। প্রথম এন্ট্রি তৈরি করুন।</p>';return}
    w.innerHTML=`<div class="table-wrap"><table><thead><tr>
      <th>তারিখ</th><th>ধরন</th><th>বিবরণ</th><th>পরিমাণ</th><th>নোট</th><th></th>
    </tr></thead><tbody>${this.data.logs.map(l=>`<tr>
      <td>${l.date}</td><td>${l.type}</td><td>${l.item}</td>
      <td>${l.qty} ${l.unit}</td><td>${l.note||'—'}</td>
      <td><button class="btn btn-sm btn-danger" onclick="BV.delLog('${l.id}')">✕</button></td>
    </tr>`).join('')}</tbody></table></div>`;
  },
  delLog(id){this.data.logs=this.data.logs.filter(x=>x.id!==id);this.set('logs',this.data.logs);this.renderLogs()},
  /* ---------- Inventory ---------- */
  bindInventory(){},
  renderInventory(){
    const w=document.getElementById('invList'); if(!w)return;
    w.innerHTML=`<div class="table-wrap"><table><thead><tr>
      <th>আইটেম</th><th>একক</th><th>Opening</th><th>Purchase</th><th>Production</th>
      <th>Consumption</th><th>Sales</th><th>Wastage</th><th>Closing</th>
    </tr></thead><tbody>${this.data.inventory.map(i=>{
      const closing=i.opening+i.purchase+i.production-i.consumption-i.sales-i.wastage;
      return `<tr><td>${i.item}</td><td>${i.unit}</td><td>${i.opening}</td><td>${i.purchase}</td>
      <td>${i.production}</td><td>${i.consumption}</td><td>${i.sales}</td><td>${i.wastage}</td>
      <td><b>${closing}</b></td></tr>`;
    }).join('')}</tbody></table></div>`;
  },
  /* ---------- Dashboard ---------- */
  renderDashboard(){
    const set=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=v};
    // demo values (editable via logs)
    set('dTotalGas','০');
    set('dDailyGas','০');
    set('dDung','০');
    set('dDigestate','০');
    set('dBeds','৩');
    set('dWorms','০');
    set('dFeed','০');
    set('dVermi','০');
    set('dStock','০');
    set('dRev','৳ ০');
    set('dExp','৳ ০');
    set('dProfit','৳ ০');
    set('dTasks',this.data.tasks.filter(t=>!t.done).length);
    set('dAlerts','০');
  },
  /* ---------- Export / Import ---------- */
  bindExportImport(){
    const ex=document.getElementById('exportBtn');
    if(ex)ex.addEventListener('click',()=>{
      const dump=JSON.stringify(this.data,null,2);
      const blob=new Blob([dump],{type:'application/json'});
      const a=document.createElement('a');
      a.href=URL.createObjectURL(blob);
      a.download='biovermi-backup-'+new Date().toISOString().slice(0,10)+'.json';
      a.click();
    });
    const imp=document.getElementById('importBtn');
    if(imp)imp.addEventListener('click',()=>{
      const f=document.getElementById('importFile');
      if(!f||!f.files.length)return alert('ফাইল নির্বাচন করুন');
      const r=new FileReader();
      r.onload=e=>{
        try{
          const d=JSON.parse(e.target.result);
          Object.keys(d).forEach(k=>{localStorage.setItem(this.key(k),JSON.stringify(d[k]))});
          alert('ইমপোর্ট সফল! রিলোড করুন।');
          location.reload();
        }catch(err){alert('ভুল ফাইল ফরম্যাট')}
      };
      r.readAsText(f.files[0]);
    });
  }
};
document.addEventListener('DOMContentLoaded',()=>BV.init());
window.BV=BV;
