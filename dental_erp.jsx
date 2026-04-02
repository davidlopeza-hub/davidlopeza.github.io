import { useState, useRef, useMemo } from "react";

const SEGUROS = ['Particular','OSDE','Swiss Medical','Galeno','Medicus','Sancor Salud','PAMI','IOMA','DOSEP','APROSS','Omint','Federada Salud','Luis Pasteur','Accord Salud','Jerárquicos Salud','Cemic','Medifé','Avalian'];
const SPECIALTIES = ['Odontología General','Ortodoncia','Periodoncia','Endodoncia','Cirugía Maxilofacial','Odontopediatría','Prostodoncia','Implantología','Estética Dental'];

const d = new Date(), todayStr = d.toISOString().split('T')[0];
const tom = new Date(d); tom.setDate(d.getDate()+1); const tomStr = tom.toISOString().split('T')[0];
const nw = new Date(d); nw.setDate(d.getDate()+5); const nwStr = nw.toISOString().split('T')[0];

const INIT_USERS = [
  {id:1,username:'admin',password:'Admin2024!',role:'admin',name:'Administrador Principal',email:'admin@clinica.com',salary:0,active:true,phone:'011-4000-0001',created:'2024-01-01'},
  {id:2,username:'dr.garcia',password:'Garcia2024!',role:'specialist',name:'Dr. Carlos García',specialty:'Odontología General',email:'garcia@clinica.com',salary:450000,active:true,license:'MP-45231',phone:'011-4000-0002',created:'2024-01-15'},
  {id:3,username:'dra.lopez',password:'Lopez2024!',role:'specialist',name:'Dra. María López',specialty:'Ortodoncia',email:'lopez@clinica.com',salary:520000,active:true,license:'MP-38762',phone:'011-4000-0003',created:'2024-02-01'},
  {id:4,username:'dra.martinez',password:'Martinez2024!',role:'specialist',name:'Dra. Ana Martínez',specialty:'Periodoncia',email:'martinez@clinica.com',salary:480000,active:true,license:'MP-51208',phone:'011-4000-0004',created:'2024-02-15'},
];
const INIT_PATIENTS = [
  {id:1,nombre:'Juan',apellido:'Pérez',dni:'32456789',tel:'011-4567-8901',email:'juan.perez@email.com',nacimiento:'1985-03-15',seguro:'OSDE',plan:'Plan 210',dir:'Av. Corrientes 1234, CABA',gs:'A+',alergias:'Penicilina',historial:[{fecha:'2024-10-05',desc:'Caries molar inferior izquierdo',esp:'Dr. Carlos García',trat:'Obturación con composite',notas:'Sin complicaciones'},{fecha:'2024-11-20',desc:'Control y limpieza dental',esp:'Dr. Carlos García',trat:'Detartráje supra e infragingival',notas:''}],activo:true},
  {id:2,nombre:'María',apellido:'González',dni:'28765432',tel:'011-5678-9012',email:'maria.gonzalez@email.com',nacimiento:'1992-07-22',seguro:'Swiss Medical',plan:'Gold',dir:'Florida 890, CABA',gs:'O+',alergias:'Ninguna',historial:[{fecha:'2024-09-10',desc:'Inicio tratamiento ortodoncia',esp:'Dra. María López',trat:'Colocación de brackets metálicos',notas:'Control en 4 semanas'}],activo:true},
  {id:3,nombre:'Carlos',apellido:'Rodríguez',dni:'35123456',tel:'011-6789-0123',email:'carlos.rodriguez@email.com',nacimiento:'1978-11-08',seguro:'Particular',plan:'-',dir:'Callao 456, CABA',gs:'B-',alergias:'Látex',historial:[],activo:true},
  {id:4,nombre:'Laura',apellido:'Fernández',dni:'40234567',tel:'011-7890-1234',email:'laura.fernandez@email.com',nacimiento:'1998-05-14',seguro:'IOMA',plan:'Plan Básico',dir:'Rivadavia 2310, CABA',gs:'AB+',alergias:'Ninguna',historial:[],activo:true},
  {id:5,nombre:'Roberto',apellido:'Silva',dni:'25678901',tel:'011-8901-2345',email:'roberto.silva@email.com',nacimiento:'1965-09-30',seguro:'PAMI',plan:'Estándar',dir:'Independencia 780, CABA',gs:'A-',alergias:'Aspirina, AINEs',historial:[],activo:true},
];
const INIT_APPTS = [
  {id:1,pacienteId:1,especId:2,fecha:todayStr,hora:'09:00',motivo:'Control rutinario',estado:'pendiente',notas:'',costo:8000},
  {id:2,pacienteId:2,especId:3,fecha:todayStr,hora:'11:30',motivo:'Ajuste de brackets',estado:'pendiente',notas:'',costo:12000},
  {id:3,pacienteId:3,especId:2,fecha:tomStr,hora:'10:00',motivo:'Extracción molar',estado:'pendiente',notas:'',costo:15000},
  {id:4,pacienteId:4,especId:4,fecha:tomStr,hora:'14:00',motivo:'Evaluación periodontal',estado:'pendiente',notas:'',costo:10000},
  {id:5,pacienteId:1,especId:2,fecha:'2024-11-15',hora:'10:00',motivo:'Revisión post-operatoria',estado:'completada',notas:'Evolución favorable',costo:8000},
  {id:6,pacienteId:5,especId:3,fecha:nwStr,hora:'16:00',motivo:'Consulta ortodoncia',estado:'pendiente',notas:'',costo:9000},
  {id:7,pacienteId:2,especId:2,fecha:'2024-11-20',hora:'09:30',motivo:'Caries incisivo',estado:'completada',notas:'',costo:11000},
  {id:8,pacienteId:3,especId:4,fecha:'2024-12-01',hora:'11:00',motivo:'Enfermedad periodontal',estado:'cancelada',notas:'Paciente no se presentó',costo:0},
];
const INIT_INV = [
  {id:1,nombre:'Guantes de látex (caja 100)',cat:'Insumos',stock:15,min:5,precio:8500,unidad:'caja',proveedor:'MedSupply SA',cod:'INS-001'},
  {id:2,nombre:'Mascarillas N95 (caja 20)',cat:'Insumos',stock:3,min:5,precio:6200,unidad:'caja',proveedor:'MedSupply SA',cod:'INS-002'},
  {id:3,nombre:'Composite A2',cat:'Material Dental',stock:12,min:4,precio:15000,unidad:'tubo',proveedor:'DentPro Argentina',cod:'MAT-001'},
  {id:4,nombre:'Anestesia Lidocaína 2%',cat:'Medicación',stock:45,min:20,precio:850,unidad:'ampolla',proveedor:'FarmaPlus',cod:'MED-001'},
  {id:5,nombre:'Hilo de sutura 3-0',cat:'Material Dental',stock:30,min:10,precio:2300,unidad:'unidad',proveedor:'DentPro Argentina',cod:'MAT-002'},
  {id:6,nombre:'Fresas diamantadas (set)',cat:'Instrumental',stock:6,min:3,precio:22000,unidad:'set',proveedor:'Instrumental Dental SRL',cod:'INS-003'},
  {id:7,nombre:'Cemento ionómero vítreo',cat:'Material Dental',stock:2,min:4,precio:18000,unidad:'frasco',proveedor:'DentPro Argentina',cod:'MAT-003'},
  {id:8,nombre:'Revelador de placa (250ml)',cat:'Insumos',stock:8,min:3,precio:3200,unidad:'frasco',proveedor:'MedSupply SA',cod:'INS-004'},
  {id:9,nombre:'Eyectores saliva (bolsa 100)',cat:'Insumos',stock:20,min:8,precio:1800,unidad:'bolsa',proveedor:'MedSupply SA',cod:'INS-005'},
];
const INIT_USAGE = [
  {id:1,especId:2,pacId:1,matId:3,cant:1,fecha:'2024-11-20',motivo:'Obturación molar inferior'},
  {id:2,especId:2,pacId:1,matId:4,cant:2,fecha:'2024-11-20',motivo:'Anestesia para extracción'},
  {id:3,especId:4,pacId:2,matId:5,cant:1,fecha:'2024-11-18',motivo:'Sutura post-extracción'},
];
const INIT_REQUESTS = [
  {id:1,especId:2,material:'Composite A3 Shade',cant:5,urgencia:'alta',estado:'pendiente',fecha:'2024-12-10',notas:'Stock muy bajo, urgente'},
  {id:2,especId:3,material:'Bandas ortodoncia pequeñas',cant:20,urgencia:'media',estado:'aprobado',fecha:'2024-12-08',notas:''},
  {id:3,especId:4,material:'Anestesia Articaína 4%',cant:50,urgencia:'baja',estado:'pendiente',fecha:'2024-12-12',notas:'Para reposición'},
];
const INIT_PAYMENTS = [
  {id:1,tipo:'sueldo',benef:'Dr. Carlos García',bruto:450000,neto:373275,fecha:'2024-11-30',estado:'pagado',desc:'Sueldo noviembre 2024',uid:2,ded:76725},
  {id:2,tipo:'sueldo',benef:'Dra. María López',bruto:520000,neto:431600,fecha:'2024-11-30',estado:'pagado',desc:'Sueldo noviembre 2024',uid:3,ded:88400},
  {id:3,tipo:'sueldo',benef:'Dra. Ana Martínez',bruto:480000,neto:398640,fecha:'2024-11-30',estado:'pagado',desc:'Sueldo noviembre 2024',uid:4,ded:81360},
  {id:4,tipo:'proveedor',benef:'MedSupply SA',bruto:125000,fecha:'2024-12-01',estado:'pagado',desc:'Factura #2341 - Insumos médicos'},
  {id:5,tipo:'proveedor',benef:'DentPro Argentina',bruto:89000,fecha:'2024-12-05',estado:'pendiente',desc:'Factura #8892 - Materiales dentales'},
  {id:6,tipo:'proveedor',benef:'FarmaPlus',bruto:42500,fecha:'2024-12-08',estado:'pendiente',desc:'Factura #1122 - Medicamentos'},
];
const CLINICS = [{id:1,nombre:'Sede Central - Palermo',dir:'Av. Santa Fe 3210, CABA'},{id:2,nombre:'Sede Norte - Belgrano',dir:'Cabildo 1890, CABA'}];

const fc = (n) => new Intl.NumberFormat('es-AR',{style:'currency',currency:'ARS',maximumFractionDigits:0}).format(n||0);
const fd = (s) => s?new Date(s+'T12:00:00').toLocaleDateString('es-AR'):'';
const calcDed = (g) => { const j=g*0.11,i=g*0.03,o=g*0.03,a=g*0.0165; return {j,i,o,a,total:j+i+o+a}; };
const uid = () => Date.now()+Math.random().toString(36).slice(2);

// ═══════════════ UI PRIMITIVES ═══════════════

function Modal({open,onClose,title,children,wide}){
  if(!open) return null;
  return (
    <div onClick={e=>e.target===e.currentTarget&&onClose()} style={{position:'fixed',inset:0,background:'rgba(15,23,42,0.6)',zIndex:900,display:'flex',alignItems:'center',justifyContent:'center',padding:'1rem',backdropFilter:'blur(2px)'}}>
      <div style={{background:'#fff',borderRadius:16,width:'100%',maxWidth:wide?780:520,maxHeight:'90vh',overflowY:'auto',boxShadow:'0 24px 64px rgba(0,0,0,0.25)'}}>
        <div style={{padding:'1.1rem 1.5rem',borderBottom:'1px solid #F1F5F9',display:'flex',justifyContent:'space-between',alignItems:'center',position:'sticky',top:0,background:'#fff',zIndex:1}}>
          <span style={{fontWeight:700,fontSize:16,color:'#0F172A'}}>{title}</span>
          <button onClick={onClose} style={{border:'none',background:'none',cursor:'pointer',fontSize:22,color:'#94A3B8',lineHeight:1,padding:'0 4px'}}>×</button>
        </div>
        <div style={{padding:'1.5rem'}}>{children}</div>
      </div>
    </div>
  );
}

function Badge({t,c='blue'}){
  const M={blue:{bg:'#EFF6FF',tx:'#1D4ED8'},green:{bg:'#F0FDF4',tx:'#166534'},red:{bg:'#FEF2F2',tx:'#991B1B'},yellow:{bg:'#FEFCE8',tx:'#854D0E'},gray:{bg:'#F8FAFC',tx:'#475569'},purple:{bg:'#FAF5FF',tx:'#6B21A8'},orange:{bg:'#FFF7ED',tx:'#9A3412'},teal:{bg:'#F0FDFA',tx:'#115E59'}};
  const s=M[c]||M.blue;
  return <span style={{display:'inline-block',padding:'2px 10px',borderRadius:20,background:s.bg,color:s.tx,fontSize:11,fontWeight:600,whiteSpace:'nowrap'}}>{t}</span>;
}

function Inp({lbl,val,set,type='text',opts,ph,req,rows,style:xs}){
  const base={width:'100%',padding:'8px 11px',border:'1.5px solid #E2E8F0',borderRadius:8,fontSize:13,color:'#1E293B',outline:'none',boxSizing:'border-box',background:'#fff',...xs};
  return (
    <div style={{marginBottom:12}}>
      {lbl&&<label style={{display:'block',fontSize:12,fontWeight:600,color:'#64748B',marginBottom:4,textTransform:'uppercase',letterSpacing:'0.03em'}}>{lbl}{req&&<span style={{color:'#EF4444'}}> *</span>}</label>}
      {type==='select'?<select value={val} onChange={e=>set(e.target.value)} style={base}><option value="">{ph||'Seleccionar...'}</option>{opts.map(o=><option key={typeof o==='string'?o:o.v} value={typeof o==='string'?o:o.v}>{typeof o==='string'?o:o.l}</option>)}</select>
      :type==='textarea'?<textarea value={val} onChange={e=>set(e.target.value)} rows={rows||3} placeholder={ph} style={{...base,resize:'vertical'}}/>
      :<input type={type} value={val} onChange={e=>set(e.target.value)} placeholder={ph} style={base}/>}
    </div>
  );
}

function Btn({onClick,children,v='primary',sz='md',xs,disabled,full}){
  const V={primary:{background:'linear-gradient(135deg,#0284C7,#0369A1)',color:'#fff',border:'none'},secondary:{background:'#F8FAFC',color:'#475569',border:'1px solid #E2E8F0'},danger:{background:'linear-gradient(135deg,#EF4444,#DC2626)',color:'#fff',border:'none'},success:{background:'linear-gradient(135deg,#10B981,#059669)',color:'#fff',border:'none'},ghost:{background:'transparent',color:'#64748B',border:'1px solid #E2E8F0'},purple:{background:'linear-gradient(135deg,#8B5CF6,#7C3AED)',color:'#fff',border:'none'}};
  const SZ={sm:{padding:'5px 12px',fontSize:12},md:{padding:'8px 16px',fontSize:13},lg:{padding:'11px 22px',fontSize:14}};
  return <button disabled={disabled} onClick={onClick} style={{...V[v],...SZ[sz],borderRadius:8,cursor:disabled?'not-allowed':'pointer',fontWeight:600,opacity:disabled?0.6:1,width:full?'100%':'auto',transition:'opacity 0.15s',...xs}}>{children}</button>;
}

function Stat({lbl,val,sub,clr='#0284C7',icon}){
  return (
    <div style={{background:'#fff',borderRadius:14,padding:'1.2rem',border:'1px solid #F1F5F9',flex:1,minWidth:140}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
        <div style={{flex:1}}>
          <p style={{margin:'0 0 2px',fontSize:12,color:'#94A3B8',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.04em'}}>{lbl}</p>
          <p style={{margin:0,fontSize:26,fontWeight:800,color:'#0F172A'}}>{val}</p>
          {sub&&<p style={{margin:'3px 0 0',fontSize:11,color:'#94A3B8'}}>{sub}</p>}
        </div>
        {icon&&<div style={{width:42,height:42,borderRadius:10,background:clr+'18',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>{icon}</div>}
      </div>
    </div>
  );
}

function Row({label,value}){
  return <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'7px 0',borderBottom:'1px solid #F8FAFC'}}>
    <span style={{fontSize:13,color:'#94A3B8',fontWeight:500}}>{label}</span>
    <span style={{fontSize:13,color:'#1E293B',fontWeight:600}}>{value}</span>
  </div>;
}

// ═══════════════ VIEWS ═══════════════

function Dashboard({users,patients,appts,inv,payments}){
  const specs=users.filter(u=>u.role==='specialist'&&u.active);
  const todayA=appts.filter(a=>a.fecha===todayStr);
  const pending=appts.filter(a=>a.estado==='pendiente');
  const revenue=appts.filter(a=>a.estado==='completada').reduce((s,a)=>s+(a.costo||0),0);
  const lowStock=inv.filter(i=>i.stock<=i.min);
  const pendPay=payments.filter(p=>p.estado==='pendiente').reduce((s,p)=>s+p.bruto,0);
  const months=['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  const monthData=months.map((_,i)=>appts.filter(a=>new Date(a.fecha).getMonth()===i&&a.estado==='completada').length);
  const maxM=Math.max(...monthData,1);

  return (
    <div>
      <div style={{marginBottom:'1.5rem'}}>
        <h2 style={{margin:0,fontSize:22,fontWeight:800,color:'#0F172A'}}>Panel Principal</h2>
        <p style={{margin:'3px 0 0',fontSize:13,color:'#94A3B8'}}>Resumen general de la clínica</p>
      </div>

      <div style={{display:'flex',gap:12,flexWrap:'wrap',marginBottom:'1.25rem'}}>
        <Stat lbl="Pacientes" val={patients.filter(p=>p.activo).length} sub={`${todayA.length} citas hoy`} clr="#0284C7" icon="👥"/>
        <Stat lbl="Especialistas" val={specs.length} sub="activos" clr="#7C3AED" icon="🦷"/>
        <Stat lbl="Citas Pendientes" val={pending.length} sub="totales" clr="#D97706" icon="📅"/>
        <Stat lbl="Ingresos" val={fc(revenue)} sub="consultas completadas" clr="#059669" icon="💰"/>
        <Stat lbl="Sedes" val={CLINICS.length} sub="activas" clr="#0891B2" icon="🏥"/>
      </div>

      {lowStock.length>0&&<div style={{background:'#FEF2F2',border:'1px solid #FECACA',borderRadius:10,padding:'10px 14px',marginBottom:12,display:'flex',gap:10,alignItems:'center'}}>
        <span>⚠️</span><div><b style={{color:'#991B1B',fontSize:13}}>Stock bajo:</b><span style={{fontSize:12,color:'#B91C1C',marginLeft:6}}>{lowStock.map(i=>i.nombre).join(' · ')}</span></div>
      </div>}
      {pendPay>0&&<div style={{background:'#FFFBEB',border:'1px solid #FDE68A',borderRadius:10,padding:'10px 14px',marginBottom:12,display:'flex',gap:10,alignItems:'center'}}>
        <span>💸</span><span style={{fontSize:13,color:'#92400E'}}><b>Pagos pendientes:</b> {fc(pendPay)}</span>
      </div>}

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:14,marginBottom:14}}>
        <div style={{background:'#fff',borderRadius:14,padding:'1.25rem',border:'1px solid #F1F5F9'}}>
          <p style={{margin:'0 0 12px',fontWeight:700,fontSize:14,color:'#0F172A'}}>📅 Citas de Hoy ({todayA.length})</p>
          {todayA.length===0?<p style={{color:'#94A3B8',fontSize:13}}>Sin citas programadas hoy</p>:
          todayA.map(a=>{const p=patients.find(x=>x.id===a.pacienteId);const e=users.find(x=>x.id===a.especId);return(
            <div key={a.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'7px 0',borderBottom:'1px solid #F8FAFC'}}>
              <div><p style={{margin:0,fontSize:13,fontWeight:600,color:'#1E293B'}}>{p?.nombre} {p?.apellido}</p><p style={{margin:'1px 0 0',fontSize:11,color:'#94A3B8'}}>{a.hora} · {e?.name}</p></div>
              <Badge t={a.estado} c={a.estado==='completada'?'green':a.estado==='cancelada'?'red':'yellow'}/>
            </div>
          );})}
        </div>

        <div style={{background:'#fff',borderRadius:14,padding:'1.25rem',border:'1px solid #F1F5F9'}}>
          <p style={{margin:'0 0 12px',fontWeight:700,fontSize:14,color:'#0F172A'}}>📦 Inventario - Estado</p>
          {inv.slice(0,6).map(i=>{const pct=Math.min(100,(i.stock/i.min)*100);const clr=pct<=100?'#EF4444':pct<=150?'#F59E0B':'#10B981';return(
            <div key={i.id} style={{marginBottom:8}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:2}}>
                <span style={{fontSize:12,color:'#374151',fontWeight:500}}>{i.nombre.length>30?i.nombre.slice(0,30)+'…':i.nombre}</span>
                <span style={{fontSize:11,fontWeight:700,color:clr}}>{i.stock}/{i.min}</span>
              </div>
              <div style={{height:4,background:'#F1F5F9',borderRadius:4}}><div style={{height:'100%',width:`${pct}%`,background:clr,borderRadius:4}}/></div>
            </div>
          );})}
        </div>
      </div>

      <div style={{background:'#fff',borderRadius:14,padding:'1.25rem',border:'1px solid #F1F5F9'}}>
        <p style={{margin:'0 0 16px',fontWeight:700,fontSize:14,color:'#0F172A'}}>📊 Consultas Completadas por Mes</p>
        <div style={{display:'flex',gap:6,alignItems:'flex-end',height:120}}>
          {monthData.map((v,i)=>(
            <div key={i} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:4}}>
              <span style={{fontSize:10,color:'#64748B',fontWeight:600}}>{v||''}</span>
              <div style={{width:'100%',background:v>0?'linear-gradient(180deg,#0284C7,#0369A1)':'#F1F5F9',borderRadius:'4px 4px 0 0',height:`${(v/maxM)*90}px`,minHeight:4,transition:'height 0.3s'}}/>
              <span style={{fontSize:9,color:'#94A3B8'}}>{months[i]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PatientsView({patients,setPatients,users,appts,setAppts,currentUser}){
  const [search,setSearch]=useState('');
  const [suggestions,setSuggestions]=useState([]);
  const [showSug,setShowSug]=useState(false);
  const [selPat,setSelPat]=useState(null);
  const [modal,setModal]=useState('');
  const [form,setForm]=useState({});
  const [histForm,setHistForm]=useState({});
  const searchRef=useRef();
  const isAdmin=currentUser.role==='admin';

  const handleSearch=v=>{
    setSearch(v);
    if(v.length>=2){
      const r=patients.filter(p=>(`${p.nombre} ${p.apellido}`.toLowerCase().includes(v.toLowerCase())||p.dni.includes(v))&&p.activo);
      setSuggestions(r); setShowSug(true);
    } else {setSuggestions([]);setShowSug(false);}
  };

  const filtered=useMemo(()=>patients.filter(p=>{
    if(!search) return p.activo;
    return p.activo&&(`${p.nombre} ${p.apellido}`.toLowerCase().includes(search.toLowerCase())||p.dni.includes(search)||p.email.toLowerCase().includes(search.toLowerCase()));
  }),[patients,search]);

  const openNew=()=>{ setForm({nombre:'',apellido:'',dni:'',tel:'',email:'',nacimiento:'',seguro:'Particular',plan:'',dir:'',gs:'O+',alergias:''}); setModal('new'); };
  const openEdit=p=>{ setForm({...p}); setModal('edit'); };
  const openDetail=p=>{ setSelPat(p); setModal('detail'); };
  const openHist=p=>{ setSelPat(p); setHistForm({fecha:todayStr,desc:'',esp:currentUser.role==='specialist'?currentUser.name:'',trat:'',notas:''}); setModal('hist'); };

  const savePatient=()=>{
    if(!form.nombre||!form.apellido||!form.dni){alert('Nombre, apellido y DNI son requeridos');return;}
    if(modal==='new'){
      const exists=patients.find(p=>p.dni===form.dni);
      if(exists){alert('Ya existe un paciente con ese DNI');return;}
      setPatients(ps=>[...ps,{...form,id:Date.now(),historial:[],activo:true}]);
    } else {
      setPatients(ps=>ps.map(p=>p.id===form.id?{...form}:p));
    }
    setModal('');
  };

  const addHist=()=>{
    if(!histForm.desc){alert('Descripción requerida');return;}
    setPatients(ps=>ps.map(p=>p.id===selPat.id?{...p,historial:[...p.historial,histForm]}:p));
    setModal('');
  };

  const deactivate=id=>{ if(confirm('¿Desactivar paciente?')) setPatients(ps=>ps.map(p=>p.id===id?{...p,activo:false}:p)); };

  const GS=['A+','A-','B+','B-','AB+','AB-','O+','O-'];

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.25rem',flexWrap:'wrap',gap:8}}>
        <div><h2 style={{margin:0,fontSize:20,fontWeight:800,color:'#0F172A'}}>Pacientes</h2><p style={{margin:'2px 0 0',fontSize:12,color:'#94A3B8'}}>{patients.filter(p=>p.activo).length} pacientes activos</p></div>
        {isAdmin&&<Btn onClick={openNew}>+ Nuevo Paciente</Btn>}
      </div>

      <div style={{position:'relative',marginBottom:'1rem'}} ref={searchRef}>
        <input value={search} onChange={e=>handleSearch(e.target.value)} onFocus={()=>search.length>=2&&setShowSug(true)} onBlur={()=>setTimeout(()=>setShowSug(false),200)} placeholder="🔍 Buscar por nombre, apellido o DNI..." style={{width:'100%',padding:'10px 14px',border:'1.5px solid #E2E8F0',borderRadius:10,fontSize:13,color:'#1E293B',outline:'none',boxSizing:'border-box'}}/>
        {showSug&&suggestions.length>0&&(
          <div style={{position:'absolute',top:'100%',left:0,right:0,background:'#fff',border:'1px solid #E2E8F0',borderRadius:10,boxShadow:'0 8px 24px rgba(0,0,0,0.12)',zIndex:100,maxHeight:200,overflowY:'auto',marginTop:4}}>
            {suggestions.map(p=>(
              <div key={p.id} onMouseDown={()=>{setSearch(`${p.nombre} ${p.apellido}`);setShowSug(false);openDetail(p);}} style={{padding:'9px 14px',cursor:'pointer',borderBottom:'1px solid #F8FAFC',display:'flex',justifyContent:'space-between',alignItems:'center'}} onMouseEnter={e=>e.currentTarget.style.background='#F8FAFC'} onMouseLeave={e=>e.currentTarget.style.background='#fff'}>
                <div><b style={{fontSize:13,color:'#1E293B'}}>{p.nombre} {p.apellido}</b><span style={{fontSize:11,color:'#94A3B8',marginLeft:8}}>DNI: {p.dni}</span></div>
                <Badge t={p.seguro} c="blue"/>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{background:'#fff',borderRadius:14,border:'1px solid #F1F5F9',overflow:'hidden'}}>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead><tr style={{background:'#F8FAFC'}}>{['Paciente','DNI','Teléfono','Seguro','Historial','Acciones'].map(h=><th key={h} style={{padding:'10px 14px',textAlign:'left',fontSize:11,fontWeight:700,color:'#64748B',textTransform:'uppercase',letterSpacing:'0.04em'}}>{h}</th>)}</tr></thead>
          <tbody>{filtered.map((p,i)=>(
            <tr key={p.id} style={{borderBottom:'1px solid #F8FAFC',background:i%2?'#FAFAFA':'#fff'}}>
              <td style={{padding:'11px 14px'}}><p style={{margin:0,fontWeight:600,fontSize:13,color:'#1E293B'}}>{p.nombre} {p.apellido}</p><p style={{margin:'1px 0 0',fontSize:11,color:'#94A3B8'}}>{p.email}</p></td>
              <td style={{padding:'11px 14px',fontSize:13,color:'#475569'}}>{p.dni}</td>
              <td style={{padding:'11px 14px',fontSize:13,color:'#475569'}}>{p.tel}</td>
              <td style={{padding:'11px 14px'}}><Badge t={p.seguro} c={p.seguro==='Particular'?'gray':'blue'}/>{p.plan&&p.plan!=='-'&&<p style={{margin:'2px 0 0',fontSize:10,color:'#94A3B8'}}>{p.plan}</p>}</td>
              <td style={{padding:'11px 14px'}}><Badge t={`${p.historial.length} registros`} c={p.historial.length>0?'teal':'gray'}/></td>
              <td style={{padding:'11px 14px'}}>
                <div style={{display:'flex',gap:6}}>
                  <Btn v="ghost" sz="sm" onClick={()=>openDetail(p)}>Ver</Btn>
                  {isAdmin&&<Btn v="ghost" sz="sm" onClick={()=>openEdit(p)}>Editar</Btn>}
                  <Btn v="secondary" sz="sm" onClick={()=>openHist(p)}>+ Historial</Btn>
                  {isAdmin&&<Btn v="danger" sz="sm" onClick={()=>deactivate(p.id)}>✕</Btn>}
                </div>
              </td>
            </tr>
          ))}</tbody>
        </table>
        {filtered.length===0&&<p style={{textAlign:'center',color:'#94A3B8',padding:'2rem',fontSize:13}}>No se encontraron pacientes</p>}
      </div>

      <Modal open={modal==='new'||modal==='edit'} onClose={()=>setModal('')} title={modal==='new'?'Nuevo Paciente':'Editar Paciente'} wide>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0 16px'}}>
          <Inp lbl="Nombre" val={form.nombre||''} set={v=>setForm(f=>({...f,nombre:v}))} req/>
          <Inp lbl="Apellido" val={form.apellido||''} set={v=>setForm(f=>({...f,apellido:v}))} req/>
          <Inp lbl="DNI" val={form.dni||''} set={v=>setForm(f=>({...f,dni:v}))} req ph="Sin puntos"/>
          <Inp lbl="Teléfono" val={form.tel||''} set={v=>setForm(f=>({...f,tel:v}))} ph="011-XXXX-XXXX"/>
          <Inp lbl="Email" val={form.email||''} set={v=>setForm(f=>({...f,email:v}))} type="email"/>
          <Inp lbl="Fecha de nacimiento" val={form.nacimiento||''} set={v=>setForm(f=>({...f,nacimiento:v}))} type="date"/>
          <Inp lbl="Cobertura médica" val={form.seguro||''} set={v=>setForm(f=>({...f,seguro:v}))} type="select" opts={SEGUROS}/>
          <Inp lbl="Plan" val={form.plan||''} set={v=>setForm(f=>({...f,plan:v}))} ph="Ej: Plan 210"/>
          <Inp lbl="Grupo sanguíneo" val={form.gs||''} set={v=>setForm(f=>({...f,gs:v}))} type="select" opts={GS}/>
          <Inp lbl="Alergias" val={form.alergias||''} set={v=>setForm(f=>({...f,alergias:v}))} ph="Ninguna / especificar"/>
        </div>
        <Inp lbl="Dirección" val={form.dir||''} set={v=>setForm(f=>({...f,dir:v}))} ph="Calle, número, localidad"/>
        <div style={{display:'flex',gap:8,justifyContent:'flex-end',marginTop:8}}>
          <Btn v="secondary" onClick={()=>setModal('')}>Cancelar</Btn>
          <Btn onClick={savePatient}>{modal==='new'?'Crear Paciente':'Guardar Cambios'}</Btn>
        </div>
      </Modal>

      <Modal open={modal==='detail'} onClose={()=>setModal('')} title="Ficha del Paciente" wide>
        {selPat&&<div>
          <div style={{display:'flex',gap:14,alignItems:'center',marginBottom:'1.25rem',background:'#F8FAFC',borderRadius:10,padding:'12px 14px'}}>
            <div style={{width:52,height:52,borderRadius:'50%',background:'linear-gradient(135deg,#0284C7,#7C3AED)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:800,fontSize:18}}>{selPat.nombre[0]}{selPat.apellido[0]}</div>
            <div><p style={{margin:0,fontWeight:800,fontSize:16,color:'#0F172A'}}>{selPat.nombre} {selPat.apellido}</p><p style={{margin:'2px 0 0',fontSize:12,color:'#94A3B8'}}>DNI: {selPat.dni} · Grupo: {selPat.gs}</p></div>
            <div style={{marginLeft:'auto'}}><Badge t={selPat.seguro} c="blue"/></div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0 24px',marginBottom:'1rem'}}>
            <Row label="Teléfono" value={selPat.tel}/>
            <Row label="Email" value={selPat.email}/>
            <Row label="Nacimiento" value={fd(selPat.nacimiento)}/>
            <Row label="Plan" value={selPat.plan||'-'}/>
            <Row label="Dirección" value={selPat.dir}/>
            <Row label="Alergias" value={selPat.alergias||'Ninguna'}/>
          </div>
          <p style={{fontWeight:700,fontSize:13,color:'#0F172A',margin:'12px 0 8px'}}>📋 Historial Clínico ({selPat.historial.length})</p>
          {selPat.historial.length===0?<p style={{color:'#94A3B8',fontSize:13}}>Sin registros clínicos</p>:
          [...selPat.historial].reverse().map((h,i)=>(
            <div key={i} style={{background:'#F8FAFC',borderRadius:8,padding:'10px 12px',marginBottom:8,borderLeft:'3px solid #0284C7'}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                <span style={{fontSize:12,fontWeight:700,color:'#0284C7'}}>{fd(h.fecha)}</span>
                <span style={{fontSize:11,color:'#94A3B8'}}>{h.esp}</span>
              </div>
              <p style={{margin:0,fontSize:13,fontWeight:600,color:'#1E293B'}}>{h.desc}</p>
              <p style={{margin:'2px 0 0',fontSize:12,color:'#64748B'}}>Tratamiento: {h.trat}</p>
              {h.notas&&<p style={{margin:'2px 0 0',fontSize:11,color:'#94A3B8',fontStyle:'italic'}}>{h.notas}</p>}
            </div>
          ))}
          <div style={{display:'flex',gap:8,justifyContent:'flex-end',marginTop:12}}>
            <Btn v="secondary" sz="sm" onClick={()=>openHist(selPat)}>+ Agregar al historial</Btn>
            {isAdmin&&<Btn v="ghost" sz="sm" onClick={()=>openEdit(selPat)}>Editar datos</Btn>}
          </div>
        </div>}
      </Modal>

      <Modal open={modal==='hist'} onClose={()=>setModal('')} title={`Agregar Registro - ${selPat?.nombre} ${selPat?.apellido}`}>
        <Inp lbl="Fecha" val={histForm.fecha||''} set={v=>setHistForm(f=>({...f,fecha:v}))} type="date" req/>
        <Inp lbl="Descripción / Diagnóstico" val={histForm.desc||''} set={v=>setHistForm(f=>({...f,desc:v}))} type="textarea" ph="Diagnóstico o motivo de consulta" req/>
        <Inp lbl="Tratamiento realizado" val={histForm.trat||''} set={v=>setHistForm(f=>({...f,trat:v}))} type="textarea" ph="Descripción del tratamiento"/>
        <Inp lbl="Notas adicionales" val={histForm.notas||''} set={v=>setHistForm(f=>({...f,notas:v}))} type="textarea" ph="Observaciones, indicaciones, seguimiento"/>
        <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
          <Btn v="secondary" onClick={()=>setModal('')}>Cancelar</Btn>
          <Btn onClick={addHist}>Guardar Registro</Btn>
        </div>
      </Modal>
    </div>
  );
}

function CalendarView({patients,appts,setAppts,users,currentUser}){
  const [year,setYear]=useState(new Date().getFullYear());
  const [month,setMonth]=useState(new Date().getMonth());
  const [filter,setFilter]=useState('all');
  const [modal,setModal]=useState('');
  const [selDate,setSelDate]=useState('');
  const [selAppt,setSelAppt]=useState(null);
  const [form,setForm]=useState({});
  const [patSearch,setPatSearch]=useState('');
  const [patSug,setPatSug]=useState([]);
  const [selPat,setSelPat]=useState(null);
  const isAdmin=currentUser.role==='admin';

  const monthNames=['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const first=new Date(year,month,1).getDay();
  const days=new Date(year,month+1,0).getDate();
  const prevMonth=()=>{ if(month===0){setMonth(11);setYear(y=>y-1);}else setMonth(m=>m-1); };
  const nextMonth=()=>{ if(month===11){setMonth(0);setYear(y=>y+1);}else setMonth(m=>m+1); };

  const specAppts=currentUser.role==='specialist'?appts.filter(a=>a.especId===currentUser.id):appts;
  const filteredAppts=filter==='all'?specAppts:specAppts.filter(a=>a.estado===filter);

  const dayAppts=day=>{
    const ds=`${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    return filteredAppts.filter(a=>a.fecha===ds);
  };

  const openDay=day=>{
    const ds=`${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    setSelDate(ds); setSelAppt(null);
    setForm({pacienteId:'',especId:currentUser.role==='specialist'?currentUser.id:'',fecha:ds,hora:'09:00',motivo:'',notas:'',costo:'',estado:'pendiente'});
    setSelPat(null); setPatSearch(''); setModal('day');
  };

  const handlePatSearch=v=>{
    setPatSearch(v); setSelPat(null); setForm(f=>({...f,pacienteId:''}));
    if(v.length>=2) setPatSug(patients.filter(p=>p.activo&&(`${p.nombre} ${p.apellido}`.toLowerCase().includes(v.toLowerCase())||p.dni.includes(v))));
    else setPatSug([]);
  };

  const selectPat=p=>{setSelPat(p);setPatSearch(`${p.nombre} ${p.apellido}`);setPatSug([]);setForm(f=>({...f,pacienteId:p.id}));};

  const saveAppt=()=>{
    if(!form.pacienteId){alert('Seleccione un paciente');return;}
    if(!form.especId){alert('Seleccione un especialista');return;}
    if(!form.hora||!form.motivo){alert('Hora y motivo requeridos');return;}
    if(selAppt){
      setAppts(as=>as.map(a=>a.id===selAppt.id?{...a,...form,costo:Number(form.costo)||0}:a));
    } else {
      setAppts(as=>[...as,{...form,id:Date.now(),costo:Number(form.costo)||0}]);
    }
    setModal('');
  };

  const openAppt=a=>{
    setSelAppt(a);
    const p=patients.find(x=>x.id===a.pacienteId);
    setSelPat(p);
    setPatSearch(p?`${p.nombre} ${p.apellido}`:'');
    setForm({...a,costo:String(a.costo||'')});
    setModal('appt');
  };

  const changeStatus=(id,s)=>setAppts(as=>as.map(a=>a.id===id?{...a,estado:s}:a));
  const deleteAppt=id=>{ if(confirm('¿Eliminar cita?')) setAppts(as=>as.filter(a=>a.id!==id)); };

  const specs=users.filter(u=>u.role==='specialist'&&u.active);
  const stateColor={pendiente:'#F59E0B',completada:'#10B981',cancelada:'#EF4444'};

  const ApptForm=()=>(
    <div>
      <div style={{position:'relative',marginBottom:12}}>
        <label style={{display:'block',fontSize:12,fontWeight:700,color:'#64748B',marginBottom:4,textTransform:'uppercase'}}>Paciente *</label>
        <input value={patSearch} onChange={e=>handlePatSearch(e.target.value)} placeholder="Buscar por nombre o DNI..." style={{width:'100%',padding:'8px 11px',border:'1.5px solid #E2E8F0',borderRadius:8,fontSize:13,outline:'none',boxSizing:'border-box'}}/>
        {patSug.length>0&&<div style={{position:'absolute',top:'100%',left:0,right:0,background:'#fff',border:'1px solid #E2E8F0',borderRadius:8,zIndex:200,maxHeight:160,overflowY:'auto',boxShadow:'0 8px 20px rgba(0,0,0,0.1)',marginTop:2}}>
          {patSug.map(p=><div key={p.id} onMouseDown={()=>selectPat(p)} style={{padding:'8px 12px',cursor:'pointer',fontSize:13,borderBottom:'1px solid #F8FAFC'}} onMouseEnter={e=>e.currentTarget.style.background='#F8FAFC'} onMouseLeave={e=>e.currentTarget.style.background='#fff'}><b>{p.nombre} {p.apellido}</b><span style={{color:'#94A3B8',fontSize:11,marginLeft:6}}>DNI: {p.dni} · {p.seguro}</span></div>)}
          <div onMouseDown={()=>{setSelPat(null);setPatSearch(patSearch);setPatSug([]);setModal('newpat');}} style={{padding:'8px 12px',cursor:'pointer',fontSize:12,color:'#0284C7',fontWeight:600,background:'#EFF6FF'}} onMouseEnter={e=>e.currentTarget.style.background='#DBEAFE'} onMouseLeave={e=>e.currentTarget.style.background='#EFF6FF'}>+ Crear nuevo paciente</div>
        </div>}
        {selPat&&<div style={{marginTop:6,background:'#F0FDF4',borderRadius:6,padding:'6px 10px',fontSize:12,color:'#166534'}}>✓ {selPat.nombre} {selPat.apellido} — {selPat.seguro} {selPat.plan&&selPat.plan!=='-'?`(${selPat.plan})`:''} — Alergias: {selPat.alergias||'Ninguna'}</div>}
      </div>
      {isAdmin&&<Inp lbl="Especialista" val={form.especId||''} set={v=>setForm(f=>({...f,especId:Number(v)}))} type="select" opts={specs.map(s=>({v:s.id,l:s.name}))} req/>}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0 12px'}}>
        <Inp lbl="Fecha" val={form.fecha||''} set={v=>setForm(f=>({...f,fecha:v}))} type="date" req/>
        <Inp lbl="Hora" val={form.hora||''} set={v=>setForm(f=>({...f,hora:v}))} type="time" req/>
        <Inp lbl="Motivo de consulta" val={form.motivo||''} set={v=>setForm(f=>({...f,motivo:v}))} req ph="Descripción del motivo"/>
        <Inp lbl="Costo estimado ($)" val={form.costo||''} set={v=>setForm(f=>({...f,costo:v}))} type="number" ph="0"/>
      </div>
      <Inp lbl="Estado" val={form.estado||'pendiente'} set={v=>setForm(f=>({...f,estado:v}))} type="select" opts={['pendiente','completada','cancelada']}/>
      <Inp lbl="Notas" val={form.notas||''} set={v=>setForm(f=>({...f,notas:v}))} type="textarea" ph="Observaciones adicionales"/>
      <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
        <Btn v="secondary" onClick={()=>setModal(selAppt?'day':'')}>Cancelar</Btn>
        {selAppt&&<Btn v="danger" onClick={()=>{deleteAppt(selAppt.id);setModal('');}}>Eliminar</Btn>}
        <Btn onClick={saveAppt}>{selAppt?'Guardar Cambios':'Crear Cita'}</Btn>
      </div>
    </div>
  );

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1rem',flexWrap:'wrap',gap:8}}>
        <div><h2 style={{margin:0,fontSize:20,fontWeight:800,color:'#0F172A'}}>Calendario de Citas</h2></div>
        <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
          {['all','pendiente','completada','cancelada'].map(f=>(
            <button key={f} onClick={()=>setFilter(f)} style={{padding:'5px 12px',borderRadius:20,border:'none',cursor:'pointer',fontSize:12,fontWeight:600,background:filter===f?'#0284C7':'#F1F5F9',color:filter===f?'#fff':'#64748B',transition:'all 0.15s'}}>
              {f==='all'?'Todas':f.charAt(0).toUpperCase()+f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div style={{background:'#fff',borderRadius:14,border:'1px solid #F1F5F9',overflow:'hidden'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'14px 18px',borderBottom:'1px solid #F1F5F9'}}>
          <button onClick={prevMonth} style={{border:'none',background:'#F1F5F9',borderRadius:8,padding:'6px 12px',cursor:'pointer',fontWeight:700}}>←</button>
          <h3 style={{margin:0,fontSize:16,fontWeight:700,color:'#0F172A'}}>{monthNames[month]} {year}</h3>
          <button onClick={nextMonth} style={{border:'none',background:'#F1F5F9',borderRadius:8,padding:'6px 12px',cursor:'pointer',fontWeight:700}}>→</button>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)'}}>
          {['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'].map(d=><div key={d} style={{padding:'8px',textAlign:'center',fontSize:11,fontWeight:700,color:'#94A3B8',background:'#F8FAFC',textTransform:'uppercase'}}>{d}</div>)}
          {Array(first===0?6:first-1).fill(null).map((_,i)=><div key={`e${i}`} style={{padding:'6px',minHeight:80,background:'#FAFAFA'}}/>)}
          {Array(days).fill(null).map((_,i)=>{
            const day=i+1;
            const ds=`${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
            const da=dayAppts(day);
            const isToday=ds===todayStr;
            return (
              <div key={day} onClick={()=>isAdmin&&openDay(day)} style={{padding:'6px',minHeight:80,borderTop:'1px solid #F1F5F9',borderLeft:'1px solid #F1F5F9',cursor:isAdmin?'pointer':'default',background:isToday?'#EFF6FF':'#fff',transition:'background 0.1s'}} onMouseEnter={e=>{if(isAdmin)e.currentTarget.style.background=isToday?'#DBEAFE':'#F8FAFC'}} onMouseLeave={e=>e.currentTarget.style.background=isToday?'#EFF6FF':'#fff'}>
                <span style={{display:'inline-block',width:22,height:22,borderRadius:'50%',background:isToday?'#0284C7':'transparent',color:isToday?'#fff':'#374151',textAlign:'center',lineHeight:'22px',fontSize:12,fontWeight:isToday?700:400}}>{day}</span>
                {da.map(a=>{const p=patients.find(x=>x.id===a.pacienteId);return(
                  <div key={a.id} onClick={e=>{e.stopPropagation();openAppt(a);}} style={{background:stateColor[a.estado]+'22',border:`1px solid ${stateColor[a.estado]}44`,borderLeft:`3px solid ${stateColor[a.estado]}`,borderRadius:4,padding:'2px 5px',marginTop:3,cursor:'pointer',fontSize:10,color:stateColor[a.estado],fontWeight:600,lineHeight:1.3}} title={`${a.hora} - ${p?.nombre} ${p?.apellido}`}>
                    {a.hora} {p?.nombre?.slice(0,8)}…
                  </div>
                );})}
              </div>
            );
          })}
        </div>
      </div>

      <Modal open={modal==='day'} onClose={()=>setModal('')} title={`Citas: ${fd(selDate)}`} wide>
        <div style={{marginBottom:'1rem'}}>
          <p style={{fontWeight:700,fontSize:13,color:'#0F172A',margin:'0 0 8px'}}>Citas del día ({filteredAppts.filter(a=>a.fecha===selDate).length})</p>
          {filteredAppts.filter(a=>a.fecha===selDate).map(a=>{
            const p=patients.find(x=>x.id===a.pacienteId);
            const e=users.find(x=>x.id===a.especId);
            return (
              <div key={a.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 10px',background:'#F8FAFC',borderRadius:8,marginBottom:6,cursor:'pointer'}} onClick={()=>openAppt(a)}>
                <div><b style={{fontSize:13,color:'#1E293B'}}>{a.hora} — {p?.nombre} {p?.apellido}</b><p style={{margin:'2px 0 0',fontSize:11,color:'#94A3B8'}}>{e?.name} · {a.motivo}</p></div>
                <div style={{display:'flex',gap:6,alignItems:'center'}}>
                  <Badge t={a.estado} c={a.estado==='completada'?'green':a.estado==='cancelada'?'red':'yellow'}/>
                  <button onClick={e=>{e.stopPropagation();changeStatus(a.id,'completada');}} style={{fontSize:10,padding:'2px 8px',border:'none',background:'#F0FDF4',color:'#166534',borderRadius:4,cursor:'pointer',fontWeight:600}}>✓ Completar</button>
                  <button onClick={e=>{e.stopPropagation();changeStatus(a.id,'cancelada');}} style={{fontSize:10,padding:'2px 8px',border:'none',background:'#FEF2F2',color:'#991B1B',borderRadius:4,cursor:'pointer',fontWeight:600}}>✕ Cancelar</button>
                </div>
              </div>
            );
          })}
        </div>
        <hr style={{border:'none',borderTop:'1px solid #F1F5F9',margin:'1rem 0'}}/>
        <p style={{fontWeight:700,fontSize:13,color:'#0F172A',margin:'0 0 12px'}}>➕ Nueva Cita</p>
        <ApptForm/>
      </Modal>

      <Modal open={modal==='appt'} onClose={()=>setModal('')} title="Editar Cita"><ApptForm/></Modal>
    </div>
  );
}

function InventoryView({inv,setInv,usage,setUsage,users,patients,currentUser}){
  const [modal,setModal]=useState('');
  const [form,setForm]=useState({});
  const [useForm,setUseForm]=useState({especId:currentUser.id,patId:'',matId:'',cant:1,fecha:todayStr,motivo:''});
  const [filter,setFilter]=useState('');
  const isAdmin=currentUser.role==='admin';

  const filtered=inv.filter(i=>!filter||i.cat===filter||i.nombre.toLowerCase().includes(filter.toLowerCase()));
  const cats=[...new Set(inv.map(i=>i.cat))];

  const save=()=>{
    if(!form.nombre||!form.cat){alert('Nombre y categoría requeridos');return;}
    if(modal==='new') setInv(is=>[...is,{...form,id:Date.now(),stock:Number(form.stock)||0,min:Number(form.min)||1,precio:Number(form.precio)||0}]);
    else setInv(is=>is.map(i=>i.id===form.id?{...form,stock:Number(form.stock),min:Number(form.min),precio:Number(form.precio)}:i));
    setModal('');
  };

  const logUsage=()=>{
    if(!useForm.matId||!useForm.cant||!useForm.motivo){alert('Complete todos los campos');return;}
    const mat=inv.find(i=>i.id===Number(useForm.matId));
    if(!mat){return;}
    if(mat.stock<Number(useForm.cant)){alert(`Stock insuficiente. Disponible: ${mat.stock}`);return;}
    setInv(is=>is.map(i=>i.id===Number(useForm.matId)?{...i,stock:i.stock-Number(useForm.cant)}:i));
    setUsage(us=>[...us,{...useForm,id:Date.now(),matId:Number(useForm.matId),cant:Number(useForm.cant),especId:currentUser.id}]);
    setModal('');
  };

  const adjustStock=(id,delta)=>setInv(is=>is.map(i=>i.id===id?{...i,stock:Math.max(0,i.stock+delta)}:i));

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1rem',flexWrap:'wrap',gap:8}}>
        <div><h2 style={{margin:0,fontSize:20,fontWeight:800,color:'#0F172A'}}>Inventario</h2></div>
        <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
          <select value={filter} onChange={e=>setFilter(e.target.value)} style={{padding:'7px 11px',border:'1.5px solid #E2E8F0',borderRadius:8,fontSize:13,outline:'none'}}>
            <option value="">Todas las categorías</option>
            {cats.map(c=><option key={c} value={c}>{c}</option>)}
          </select>
          <Btn v="secondary" onClick={()=>{setUseForm({especId:currentUser.id,patId:'',matId:'',cant:1,fecha:todayStr,motivo:''});setModal('use');}}>📝 Registrar Uso</Btn>
          {isAdmin&&<Btn onClick={()=>{setForm({nombre:'',cat:'',stock:0,min:1,precio:0,unidad:'',proveedor:'',cod:''});setModal('new');}}>+ Nuevo Material</Btn>}
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:10,marginBottom:'1.25rem'}}>
        <Stat lbl="Total Items" val={inv.length} clr="#0284C7" icon="📦"/>
        <Stat lbl="Stock Bajo" val={inv.filter(i=>i.stock<=i.min).length} clr="#EF4444" icon="⚠️"/>
        <Stat lbl="Sin Stock" val={inv.filter(i=>i.stock===0).length} clr="#DC2626" icon="🚫"/>
        <Stat lbl="Valor Total" val={fc(inv.reduce((s,i)=>s+i.stock*i.precio,0))} clr="#059669" icon="💰"/>
      </div>

      <div style={{background:'#fff',borderRadius:14,border:'1px solid #F1F5F9',overflow:'hidden',marginBottom:'1.25rem'}}>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead><tr style={{background:'#F8FAFC'}}>{['Código','Nombre','Categoría','Stock','Mín.','Precio','Proveedor','Estado',isAdmin?'Acciones':''].filter(Boolean).map(h=><th key={h} style={{padding:'9px 12px',textAlign:'left',fontSize:11,fontWeight:700,color:'#64748B',textTransform:'uppercase',letterSpacing:'0.04em'}}>{h}</th>)}</tr></thead>
          <tbody>{filtered.map((i,idx)=>{
            const ok=i.stock>i.min,warn=i.stock<=i.min&&i.stock>0,empty=i.stock===0;
            return (
              <tr key={i.id} style={{borderBottom:'1px solid #F8FAFC',background:idx%2?'#FAFAFA':'#fff'}}>
                <td style={{padding:'9px 12px',fontSize:11,color:'#94A3B8',fontWeight:600}}>{i.cod}</td>
                <td style={{padding:'9px 12px',fontSize:13,fontWeight:500,color:'#1E293B'}}>{i.nombre}</td>
                <td style={{padding:'9px 12px'}}><Badge t={i.cat} c={i.cat==='Medicación'?'purple':i.cat==='Instrumental'?'orange':'teal'}/></td>
                <td style={{padding:'9px 12px',fontWeight:700,fontSize:14,color:empty?'#EF4444':warn?'#F59E0B':'#10B981'}}>{i.stock} {i.unidad}</td>
                <td style={{padding:'9px 12px',fontSize:12,color:'#94A3B8'}}>{i.min}</td>
                <td style={{padding:'9px 12px',fontSize:13,color:'#475569'}}>{fc(i.precio)}</td>
                <td style={{padding:'9px 12px',fontSize:12,color:'#64748B'}}>{i.proveedor}</td>
                <td style={{padding:'9px 12px'}}><Badge t={empty?'Sin stock':warn?'Stock bajo':'OK'} c={empty?'red':warn?'yellow':'green'}/></td>
                {isAdmin&&<td style={{padding:'9px 12px'}}>
                  <div style={{display:'flex',gap:4}}>
                    <button onClick={()=>adjustStock(i.id,-1)} style={{width:24,height:24,border:'1px solid #E2E8F0',borderRadius:4,cursor:'pointer',background:'#FEF2F2',color:'#991B1B',fontSize:14,lineHeight:1}}>−</button>
                    <button onClick={()=>adjustStock(i.id,1)} style={{width:24,height:24,border:'1px solid #E2E8F0',borderRadius:4,cursor:'pointer',background:'#F0FDF4',color:'#166534',fontSize:14,lineHeight:1}}>+</button>
                    <Btn v="ghost" sz="sm" onClick={()=>{setForm({...i,stock:String(i.stock),min:String(i.min),precio:String(i.precio)});setModal('edit');}}>Edit</Btn>
                  </div>
                </td>}
              </tr>
            );
          })}</tbody>
        </table>
      </div>

      <div style={{background:'#fff',borderRadius:14,border:'1px solid #F1F5F9',padding:'1.25rem'}}>
        <p style={{margin:'0 0 12px',fontWeight:700,fontSize:14,color:'#0F172A'}}>📋 Registro de Uso Reciente</p>
        {usage.length===0?<p style={{color:'#94A3B8',fontSize:13}}>Sin registros de uso</p>:
        [...usage].reverse().slice(0,8).map(u=>{
          const mat=inv.find(i=>i.id===u.matId);
          const esp=users.find(x=>x.id===u.especId);
          const pac=patients.find(p=>p.id===u.patId);
          return (
            <div key={u.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'7px 0',borderBottom:'1px solid #F8FAFC',fontSize:12}}>
              <div><b style={{color:'#1E293B'}}>{mat?.nombre}</b> · <span style={{color:'#94A3B8'}}>{u.cant} {mat?.unidad}</span></div>
              <div style={{textAlign:'right',color:'#64748B'}}><span>{esp?.name}</span>{pac&&<span> · Pac: {pac?.nombre} {pac?.apellido}</span>}<p style={{margin:'1px 0 0',fontSize:10,color:'#94A3B8'}}>{fd(u.fecha)} · {u.motivo}</p></div>
            </div>
          );
        })}
      </div>

      <Modal open={modal==='new'||modal==='edit'} onClose={()=>setModal('')} title={modal==='new'?'Nuevo Material':'Editar Material'}>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0 12px'}}>
          <Inp lbl="Nombre" val={form.nombre||''} set={v=>setForm(f=>({...f,nombre:v}))} req/>
          <Inp lbl="Categoría" val={form.cat||''} set={v=>setForm(f=>({...f,cat:v}))} type="select" opts={['Insumos','Material Dental','Medicación','Instrumental','Otros']} req/>
          <Inp lbl="Stock actual" val={form.stock||''} set={v=>setForm(f=>({...f,stock:v}))} type="number" ph="0"/>
          <Inp lbl="Stock mínimo" val={form.min||''} set={v=>setForm(f=>({...f,min:v}))} type="number" ph="0"/>
          <Inp lbl="Precio unitario ($)" val={form.precio||''} set={v=>setForm(f=>({...f,precio:v}))} type="number" ph="0"/>
          <Inp lbl="Unidad" val={form.unidad||''} set={v=>setForm(f=>({...f,unidad:v}))} ph="caja, unidad, frasco..."/>
          <Inp lbl="Proveedor" val={form.proveedor||''} set={v=>setForm(f=>({...f,proveedor:v}))} ph="Nombre del proveedor"/>
          <Inp lbl="Código" val={form.cod||''} set={v=>setForm(f=>({...f,cod:v}))} ph="Ej: INS-001"/>
        </div>
        <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
          <Btn v="secondary" onClick={()=>setModal('')}>Cancelar</Btn>
          <Btn onClick={save}>{modal==='new'?'Crear':'Guardar'}</Btn>
        </div>
      </Modal>

      <Modal open={modal==='use'} onClose={()=>setModal('')} title="Registrar Uso de Material">
        <Inp lbl="Material" val={useForm.matId||''} set={v=>setUseForm(f=>({...f,matId:v}))} type="select" opts={inv.map(i=>({v:i.id,l:`${i.nombre} (Stock: ${i.stock})`}))} req/>
        <Inp lbl="Paciente" val={useForm.patId||''} set={v=>setUseForm(f=>({...f,patId:v}))} type="select" opts={patients.filter(p=>p.activo).map(p=>({v:p.id,l:`${p.nombre} ${p.apellido}`}))}/>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0 12px'}}>
          <Inp lbl="Cantidad" val={useForm.cant||''} set={v=>setUseForm(f=>({...f,cant:v}))} type="number" ph="1" req/>
          <Inp lbl="Fecha" val={useForm.fecha||''} set={v=>setUseForm(f=>({...f,fecha:v}))} type="date" req/>
        </div>
        <Inp lbl="Motivo / Procedimiento" val={useForm.motivo||''} set={v=>setUseForm(f=>({...f,motivo:v}))} type="textarea" ph="Descripción del procedimiento realizado" req/>
        <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
          <Btn v="secondary" onClick={()=>setModal('')}>Cancelar</Btn>
          <Btn onClick={logUsage}>Registrar Uso</Btn>
        </div>
      </Modal>
    </div>
  );
}

function SpecialistsView({users,setUsers}){
  const [modal,setModal]=useState('');
  const [form,setForm]=useState({});
  const specs=users.filter(u=>u.role==='specialist');

  const save=()=>{
    if(!form.name||!form.specialty||!form.username||!form.password){alert('Complete todos los campos obligatorios');return;}
    if(modal==='new'){
      if(users.find(u=>u.username===form.username)){alert('Usuario ya existe');return;}
      setUsers(us=>[...us,{...form,id:Date.now(),role:'specialist',active:true,salary:Number(form.salary)||0,created:todayStr}]);
    } else {
      setUsers(us=>us.map(u=>u.id===form.id?{...form,salary:Number(form.salary)||0}:u));
    }
    setModal('');
  };

  const toggle=id=>setUsers(us=>us.map(u=>u.id===id?{...u,active:!u.active}:u));

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.25rem'}}>
        <div><h2 style={{margin:0,fontSize:20,fontWeight:800,color:'#0F172A'}}>Especialistas</h2><p style={{margin:'2px 0 0',fontSize:12,color:'#94A3B8'}}>{specs.filter(s=>s.active).length} activos</p></div>
        <Btn onClick={()=>{setForm({name:'',specialty:'',email:'',phone:'',license:'',salary:'',username:'',password:''});setModal('new');}}>+ Nuevo Especialista</Btn>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:14}}>
        {specs.map(s=>(
          <div key={s.id} style={{background:'#fff',borderRadius:14,border:'1px solid #F1F5F9',padding:'1.25rem',opacity:s.active?1:0.6}}>
            <div style={{display:'flex',gap:12,alignItems:'center',marginBottom:'1rem'}}>
              <div style={{width:48,height:48,borderRadius:'50%',background:'linear-gradient(135deg,#7C3AED,#0284C7)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:800,fontSize:16}}>{s.name.charAt(0)}</div>
              <div style={{flex:1}}><p style={{margin:0,fontWeight:700,fontSize:14,color:'#0F172A'}}>{s.name}</p><p style={{margin:'1px 0 0',fontSize:12,color:'#94A3B8'}}>{s.specialty}</p></div>
              <Badge t={s.active?'Activo':'Inactivo'} c={s.active?'green':'gray'}/>
            </div>
            <Row label="Matrícula" value={s.license||'-'}/>
            <Row label="Email" value={s.email||'-'}/>
            <Row label="Teléfono" value={s.phone||'-'}/>
            <Row label="Sueldo bruto" value={fc(s.salary)}/>
            <Row label="Usuario" value={s.username}/>
            <div style={{display:'flex',gap:6,marginTop:12}}>
              <Btn v="ghost" sz="sm" onClick={()=>{setForm({...s,salary:String(s.salary)});setModal('edit');}}>Editar</Btn>
              <Btn v={s.active?'danger':'success'} sz="sm" onClick={()=>toggle(s.id)}>{s.active?'Desactivar':'Activar'}</Btn>
            </div>
          </div>
        ))}
      </div>

      <Modal open={modal==='new'||modal==='edit'} onClose={()=>setModal('')} title={modal==='new'?'Nuevo Especialista':'Editar Especialista'}>
        <Inp lbl="Nombre completo" val={form.name||''} set={v=>setForm(f=>({...f,name:v}))} req/>
        <Inp lbl="Especialidad" val={form.specialty||''} set={v=>setForm(f=>({...f,specialty:v}))} type="select" opts={SPECIALTIES} req/>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0 12px'}}>
          <Inp lbl="Email" val={form.email||''} set={v=>setForm(f=>({...f,email:v}))} type="email"/>
          <Inp lbl="Teléfono" val={form.phone||''} set={v=>setForm(f=>({...f,phone:v}))}/>
          <Inp lbl="Matrícula profesional" val={form.license||''} set={v=>setForm(f=>({...f,license:v}))} ph="MP-XXXXX"/>
          <Inp lbl="Sueldo bruto ($)" val={form.salary||''} set={v=>setForm(f=>({...f,salary:v}))} type="number" ph="0"/>
          <Inp lbl="Usuario de acceso" val={form.username||''} set={v=>setForm(f=>({...f,username:v}))} req ph="Ej: dr.perez"/>
          <Inp lbl="Contraseña" val={form.password||''} set={v=>setForm(f=>({...f,password:v}))} req ph="Mínimo 8 caracteres"/>
        </div>
        <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
          <Btn v="secondary" onClick={()=>setModal('')}>Cancelar</Btn>
          <Btn onClick={save}>{modal==='new'?'Crear':'Guardar'}</Btn>
        </div>
      </Modal>
    </div>
  );
}

function PaymentsView({payments,setPayments,users}){
  const [tab,setTab]=useState('sueldos');
  const [modal,setModal]=useState('');
  const [form,setForm]=useState({});
  const [liquidar,setLiquidar]=useState({uid:'',periodo:''});
  const [liqResult,setLiqResult]=useState(null);

  const specs=users.filter(u=>u.role==='specialist'&&u.active);
  const sueldos=payments.filter(p=>p.tipo==='sueldo');
  const proveedores=payments.filter(p=>p.tipo==='proveedor');

  const calcLiquidacion=()=>{
    if(!liquidar.uid){alert('Seleccione especialista');return;}
    const u=users.find(x=>x.id===Number(liquidar.uid));
    if(!u){return;}
    const ded=calcDed(u.salary);
    setLiqResult({user:u,ded,neto:u.salary-ded.total,periodo:liquidar.periodo||`${new Date().toLocaleDateString('es-AR',{month:'long',year:'numeric'})}`});
  };

  const saveLiquidacion=()=>{
    if(!liqResult){return;}
    setPayments(ps=>[...ps,{id:Date.now(),tipo:'sueldo',benef:liqResult.user.name,bruto:liqResult.user.salary,neto:Math.round(liqResult.neto),ded:Math.round(liqResult.ded.total),fecha:todayStr,estado:'pendiente',desc:`Sueldo ${liqResult.periodo}`,uid:liqResult.user.id}]);
    setLiqResult(null); setLiquidar({uid:'',periodo:''}); setModal('');
  };

  const saveProveedor=()=>{
    if(!form.benef||!form.bruto){alert('Beneficiario y monto requeridos');return;}
    setPayments(ps=>[...ps,{...form,id:Date.now(),tipo:'proveedor',bruto:Number(form.bruto),fecha:form.fecha||todayStr,estado:'pendiente'}]);
    setModal('');
  };

  const marcarPagado=id=>setPayments(ps=>ps.map(p=>p.id===id?{...p,estado:'pagado'}:p));

  const MONTHS=['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const YEARS=[2024,2025,2026];

  return (
    <div>
      <div style={{marginBottom:'1.25rem'}}>
        <h2 style={{margin:0,fontSize:20,fontWeight:800,color:'#0F172A'}}>Gestión de Pagos</h2>
      </div>

      <div style={{display:'flex',gap:10,marginBottom:'1.25rem'}}>
        <Stat lbl="Sueldos pagados" val={fc(sueldos.filter(p=>p.estado==='pagado').reduce((s,p)=>s+p.bruto,0))} clr="#059669" icon="💰"/>
        <Stat lbl="Prov. pendientes" val={fc(proveedores.filter(p=>p.estado==='pendiente').reduce((s,p)=>s+p.bruto,0))} clr="#D97706" icon="🏭"/>
        <Stat lbl="Total pagado" val={fc(payments.filter(p=>p.estado==='pagado').reduce((s,p)=>s+p.bruto,0))} clr="#0284C7" icon="📊"/>
      </div>

      <div style={{display:'flex',gap:6,marginBottom:'1rem'}}>
        {[['sueldos','💼 Liquidación Sueldos'],['proveedores','🏭 Proveedores'],['historial','📋 Historial']].map(([k,l])=>(
          <button key={k} onClick={()=>setTab(k)} style={{padding:'8px 16px',borderRadius:8,border:'none',cursor:'pointer',fontSize:13,fontWeight:600,background:tab===k?'#0284C7':'#F1F5F9',color:tab===k?'#fff':'#64748B',transition:'all 0.15s'}}>{l}</button>
        ))}
      </div>

      {tab==='sueldos'&&(
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
          <div style={{background:'#fff',borderRadius:14,border:'1px solid #F1F5F9',padding:'1.25rem'}}>
            <p style={{margin:'0 0 14px',fontWeight:700,fontSize:14,color:'#0F172A'}}>🧮 Liquidar Sueldo</p>
            <Inp lbl="Especialista" val={liquidar.uid||''} set={v=>setLiquidar(l=>({...l,uid:v}))} type="select" opts={specs.map(s=>({v:s.id,l:`${s.name} — ${fc(s.salary)}`}))} ph="Seleccionar..." req/>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0 10px'}}>
              <Inp lbl="Mes" val={liquidar.mes||''} set={v=>setLiquidar(l=>({...l,mes:v,periodo:`${v} ${l.year||new Date().getFullYear()}`}))} type="select" opts={MONTHS}/>
              <Inp lbl="Año" val={liquidar.year||''} set={v=>setLiquidar(l=>({...l,year:v,periodo:`${l.mes||''} ${v}`}))} type="select" opts={YEARS.map(String)}/>
            </div>
            <Btn full onClick={calcLiquidacion}>Calcular Liquidación</Btn>

            {liqResult&&(
              <div style={{marginTop:14,background:'#F8FAFC',borderRadius:10,padding:'14px'}}>
                <p style={{margin:'0 0 10px',fontWeight:700,fontSize:13,color:'#0F172A'}}>📄 Recibo: {liqResult.user.name}</p>
                <p style={{margin:'0 0 8px',fontSize:11,color:'#94A3B8',fontStyle:'italic'}}>Período: {liqResult.periodo}</p>
                <Row label="Sueldo bruto" value={fc(liqResult.user.salary)}/>
                <div style={{borderLeft:'3px solid #EF4444',paddingLeft:8,marginTop:6}}>
                  <p style={{margin:'0 0 4px',fontSize:11,fontWeight:700,color:'#EF4444'}}>DESCUENTOS EMPLEADO</p>
                  <Row label="Jubilación (11%)" value={`-${fc(liqResult.ded.j)}`}/>
                  <Row label="INSSJP/PAMI (3%)" value={`-${fc(liqResult.ded.i)}`}/>
                  <Row label="Obra Social (3%)" value={`-${fc(liqResult.ded.o)}`}/>
                  <Row label="ANSSAL (1.65%)" value={`-${fc(liqResult.ded.a)}`}/>
                  <Row label="Total descuentos" value={`-${fc(liqResult.ded.total)}`}/>
                </div>
                <div style={{background:'#F0FDF4',borderRadius:8,padding:'10px 12px',marginTop:10,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <span style={{fontWeight:700,fontSize:14,color:'#166534'}}>SUELDO NETO A PAGAR</span>
                  <span style={{fontWeight:800,fontSize:18,color:'#059669'}}>{fc(Math.round(liqResult.neto))}</span>
                </div>
                <div style={{display:'flex',gap:8,marginTop:10}}>
                  <Btn v="secondary" full onClick={()=>setLiqResult(null)}>Cancelar</Btn>
                  <Btn v="success" full onClick={saveLiquidacion}>✓ Registrar Pago</Btn>
                </div>
              </div>
            )}
          </div>

          <div style={{background:'#fff',borderRadius:14,border:'1px solid #F1F5F9',padding:'1.25rem'}}>
            <p style={{margin:'0 0 12px',fontWeight:700,fontSize:14,color:'#0F172A'}}>Sueldos Registrados</p>
            {sueldos.length===0?<p style={{color:'#94A3B8',fontSize:13}}>Sin registros</p>:
            [...sueldos].reverse().map(p=>(
              <div key={p.id} style={{padding:'9px 0',borderBottom:'1px solid #F8FAFC'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                  <div><p style={{margin:0,fontSize:13,fontWeight:600,color:'#1E293B'}}>{p.benef}</p><p style={{margin:'1px 0 0',fontSize:11,color:'#94A3B8'}}>{p.desc} · {fd(p.fecha)}</p></div>
                  <div style={{textAlign:'right'}}>
                    <p style={{margin:0,fontSize:13,fontWeight:700,color:'#059669'}}>Neto: {fc(p.neto)}</p>
                    <p style={{margin:'1px 0 0',fontSize:11,color:'#94A3B8'}}>Bruto: {fc(p.bruto)}</p>
                    <Badge t={p.estado} c={p.estado==='pagado'?'green':'yellow'}/>
                  </div>
                </div>
                {p.estado==='pendiente'&&<Btn v="success" sz="sm" onClick={()=>marcarPagado(p.id)} xs={{marginTop:6}}>✓ Marcar pagado</Btn>}
              </div>
            ))}
          </div>
        </div>
      )}

      {tab==='proveedores'&&(
        <div>
          <div style={{display:'flex',justifyContent:'flex-end',marginBottom:12}}>
            <Btn onClick={()=>{setForm({benef:'',bruto:'',desc:'',fecha:todayStr});setModal('prov');}}>+ Nuevo Pago Proveedor</Btn>
          </div>
          <div style={{background:'#fff',borderRadius:14,border:'1px solid #F1F5F9',overflow:'hidden'}}>
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead><tr style={{background:'#F8FAFC'}}>{['Proveedor','Descripción','Monto','Fecha','Estado','Acción'].map(h=><th key={h} style={{padding:'9px 12px',textAlign:'left',fontSize:11,fontWeight:700,color:'#64748B',textTransform:'uppercase'}}>{h}</th>)}</tr></thead>
              <tbody>{proveedores.map((p,i)=>(
                <tr key={p.id} style={{borderBottom:'1px solid #F8FAFC',background:i%2?'#FAFAFA':'#fff'}}>
                  <td style={{padding:'10px 12px',fontSize:13,fontWeight:600,color:'#1E293B'}}>{p.benef}</td>
                  <td style={{padding:'10px 12px',fontSize:12,color:'#64748B'}}>{p.desc}</td>
                  <td style={{padding:'10px 12px',fontSize:13,fontWeight:700,color:'#0F172A'}}>{fc(p.bruto)}</td>
                  <td style={{padding:'10px 12px',fontSize:12,color:'#64748B'}}>{fd(p.fecha)}</td>
                  <td style={{padding:'10px 12px'}}><Badge t={p.estado} c={p.estado==='pagado'?'green':'yellow'}/></td>
                  <td style={{padding:'10px 12px'}}>{p.estado==='pendiente'&&<Btn v="success" sz="sm" onClick={()=>marcarPagado(p.id)}>✓ Pagar</Btn>}</td>
                </tr>
              ))}</tbody>
            </table>
            {proveedores.length===0&&<p style={{textAlign:'center',color:'#94A3B8',padding:'2rem',fontSize:13}}>Sin registros</p>}
          </div>
        </div>
      )}

      {tab==='historial'&&(
        <div style={{background:'#fff',borderRadius:14,border:'1px solid #F1F5F9',overflow:'hidden'}}>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead><tr style={{background:'#F8FAFC'}}>{['Tipo','Beneficiario','Descripción','Bruto','Neto','Fecha','Estado'].map(h=><th key={h} style={{padding:'9px 12px',textAlign:'left',fontSize:11,fontWeight:700,color:'#64748B',textTransform:'uppercase'}}>{h}</th>)}</tr></thead>
            <tbody>{[...payments].reverse().map((p,i)=>(
              <tr key={p.id} style={{borderBottom:'1px solid #F8FAFC',background:i%2?'#FAFAFA':'#fff'}}>
                <td style={{padding:'9px 12px'}}><Badge t={p.tipo==='sueldo'?'Sueldo':'Proveedor'} c={p.tipo==='sueldo'?'purple':'orange'}/></td>
                <td style={{padding:'9px 12px',fontSize:13,fontWeight:500}}>{p.benef}</td>
                <td style={{padding:'9px 12px',fontSize:12,color:'#64748B'}}>{p.desc}</td>
                <td style={{padding:'9px 12px',fontSize:13,fontWeight:600}}>{fc(p.bruto)}</td>
                <td style={{padding:'9px 12px',fontSize:12,color:'#94A3B8'}}>{p.neto?fc(p.neto):'-'}</td>
                <td style={{padding:'9px 12px',fontSize:12,color:'#64748B'}}>{fd(p.fecha)}</td>
                <td style={{padding:'9px 12px'}}><Badge t={p.estado} c={p.estado==='pagado'?'green':'yellow'}/></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}

      <Modal open={modal==='prov'} onClose={()=>setModal('')} title="Registrar Pago a Proveedor">
        <Inp lbl="Proveedor / Beneficiario" val={form.benef||''} set={v=>setForm(f=>({...f,benef:v}))} req ph="Nombre del proveedor"/>
        <Inp lbl="Monto ($)" val={form.bruto||''} set={v=>setForm(f=>({...f,bruto:v}))} type="number" ph="0" req/>
        <Inp lbl="Descripción" val={form.desc||''} set={v=>setForm(f=>({...f,desc:v}))} ph="Factura #, concepto..."/>
        <Inp lbl="Fecha" val={form.fecha||''} set={v=>setForm(f=>({...f,fecha:v}))} type="date"/>
        <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
          <Btn v="secondary" onClick={()=>setModal('')}>Cancelar</Btn>
          <Btn onClick={saveProveedor}>Registrar</Btn>
        </div>
      </Modal>
    </div>
  );
}

function RequestsView({requests,setRequests,currentUser,users}){
  const [modal,setModal]=useState(false);
  const [form,setForm]=useState({material:'',cant:1,urgencia:'media',notas:''});
  const isAdmin=currentUser.role==='admin';

  const myReqs=isAdmin?requests:requests.filter(r=>r.especId===currentUser.id);

  const save=()=>{
    if(!form.material){alert('Especifique el material');return;}
    setRequests(rs=>[...rs,{...form,id:Date.now(),especId:currentUser.id,estado:'pendiente',fecha:todayStr,cant:Number(form.cant)||1}]);
    setForm({material:'',cant:1,urgencia:'media',notas:''});
    setModal(false);
  };

  const changeState=(id,s)=>setRequests(rs=>rs.map(r=>r.id===id?{...r,estado:s}:r));

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.25rem'}}>
        <div><h2 style={{margin:0,fontSize:20,fontWeight:800,color:'#0F172A'}}>{isAdmin?'Solicitudes de Materiales':'Mis Solicitudes'}</h2></div>
        {!isAdmin&&<Btn onClick={()=>setModal(true)}>+ Nueva Solicitud</Btn>}
      </div>

      <div style={{background:'#fff',borderRadius:14,border:'1px solid #F1F5F9',overflow:'hidden'}}>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead><tr style={{background:'#F8FAFC'}}>{['Material',isAdmin?'Especialista':'','Cantidad','Urgencia','Estado','Fecha','Notas',isAdmin?'Acciones':''].filter(Boolean).map(h=><th key={h} style={{padding:'9px 12px',textAlign:'left',fontSize:11,fontWeight:700,color:'#64748B',textTransform:'uppercase'}}>{h}</th>)}</tr></thead>
          <tbody>{myReqs.map((r,i)=>{
            const esp=users.find(u=>u.id===r.especId);
            return (
              <tr key={r.id} style={{borderBottom:'1px solid #F8FAFC',background:i%2?'#FAFAFA':'#fff'}}>
                <td style={{padding:'10px 12px',fontSize:13,fontWeight:600,color:'#1E293B'}}>{r.material}</td>
                {isAdmin&&<td style={{padding:'10px 12px',fontSize:12,color:'#64748B'}}>{esp?.name}</td>}
                <td style={{padding:'10px 12px',fontSize:13,color:'#475569'}}>{r.cant}</td>
                <td style={{padding:'10px 12px'}}><Badge t={r.urgencia} c={r.urgencia==='alta'?'red':r.urgencia==='media'?'yellow':'green'}/></td>
                <td style={{padding:'10px 12px'}}><Badge t={r.estado} c={r.estado==='aprobado'?'green':r.estado==='rechazado'?'red':r.estado==='entregado'?'teal':'yellow'}/></td>
                <td style={{padding:'10px 12px',fontSize:12,color:'#94A3B8'}}>{fd(r.fecha)}</td>
                <td style={{padding:'10px 12px',fontSize:12,color:'#64748B'}}>{r.notas||'-'}</td>
                {isAdmin&&<td style={{padding:'10px 12px'}}>
                  <div style={{display:'flex',gap:4}}>
                    {r.estado==='pendiente'&&<><Btn v="success" sz="sm" onClick={()=>changeState(r.id,'aprobado')}>✓</Btn><Btn v="danger" sz="sm" onClick={()=>changeState(r.id,'rechazado')}>✕</Btn></>}
                    {r.estado==='aprobado'&&<Btn v="secondary" sz="sm" onClick={()=>changeState(r.id,'entregado')}>Entregar</Btn>}
                  </div>
                </td>}
              </tr>
            );
          })}</tbody>
        </table>
        {myReqs.length===0&&<p style={{textAlign:'center',color:'#94A3B8',padding:'2rem',fontSize:13}}>Sin solicitudes</p>}
      </div>

      <Modal open={modal} onClose={()=>setModal(false)} title="Nueva Solicitud de Material">
        <Inp lbl="Material / Medicación solicitada" val={form.material} set={v=>setForm(f=>({...f,material:v}))} req ph="Nombre del material o medicamento"/>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0 12px'}}>
          <Inp lbl="Cantidad" val={form.cant} set={v=>setForm(f=>({...f,cant:v}))} type="number" ph="1"/>
          <Inp lbl="Urgencia" val={form.urgencia} set={v=>setForm(f=>({...f,urgencia:v}))} type="select" opts={[{v:'baja',l:'Baja'},{v:'media',l:'Media'},{v:'alta',l:'Alta - Urgente'}]}/>
        </div>
        <Inp lbl="Notas adicionales" val={form.notas} set={v=>setForm(f=>({...f,notas:v}))} type="textarea" ph="Especificaciones, marca preferida, etc."/>
        <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
          <Btn v="secondary" onClick={()=>setModal(false)}>Cancelar</Btn>
          <Btn onClick={save}>Enviar Solicitud</Btn>
        </div>
      </Modal>
    </div>
  );
}

function UsersView({users,setUsers}){
  const [modal,setModal]=useState('');
  const [form,setForm]=useState({});

  const save=()=>{
    if(!form.name||!form.username||!form.password||!form.role){alert('Complete todos los campos');return;}
    if(users.find(u=>u.username===form.username)){alert('El usuario ya existe');return;}
    setUsers(us=>[...us,{...form,id:Date.now(),active:true,created:todayStr,salary:Number(form.salary)||0}]);
    setModal('');
  };

  const toggle=id=>setUsers(us=>us.map(u=>u.id===id?{...u,active:!u.active}:u));
  const resetPwd=(id)=>{
    const newPwd=prompt('Nueva contraseña:');
    if(newPwd) setUsers(us=>us.map(u=>u.id===id?{...u,password:newPwd}:u));
  };

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.25rem'}}>
        <div><h2 style={{margin:0,fontSize:20,fontWeight:800,color:'#0F172A'}}>Gestión de Usuarios</h2><p style={{margin:'2px 0 0',fontSize:12,color:'#94A3B8'}}>{users.filter(u=>u.active).length} activos · {users.length} total</p></div>
        <Btn onClick={()=>{setForm({name:'',username:'',password:'',role:'',email:'',phone:'',specialty:'',license:'',salary:''});setModal('new');}}>+ Nuevo Usuario</Btn>
      </div>

      <div style={{background:'#fff',borderRadius:14,border:'1px solid #F1F5F9',overflow:'hidden'}}>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead><tr style={{background:'#F8FAFC'}}>{['Nombre','Usuario','Contraseña','Rol','Estado','Creado','Acciones'].map(h=><th key={h} style={{padding:'9px 14px',textAlign:'left',fontSize:11,fontWeight:700,color:'#64748B',textTransform:'uppercase'}}>{h}</th>)}</tr></thead>
          <tbody>{users.map((u,i)=>(
            <tr key={u.id} style={{borderBottom:'1px solid #F8FAFC',background:i%2?'#FAFAFA':'#fff'}}>
              <td style={{padding:'10px 14px'}}><p style={{margin:0,fontSize:13,fontWeight:600,color:'#1E293B'}}>{u.name}</p><p style={{margin:'1px 0 0',fontSize:11,color:'#94A3B8'}}>{u.email}</p></td>
              <td style={{padding:'10px 14px'}}><code style={{fontSize:12,background:'#F1F5F9',padding:'2px 8px',borderRadius:4,color:'#0284C7'}}>{u.username}</code></td>
              <td style={{padding:'10px 14px'}}><code style={{fontSize:12,background:'#FEF3C7',padding:'2px 8px',borderRadius:4,color:'#92400E'}}>{u.password}</code></td>
              <td style={{padding:'10px 14px'}}><Badge t={u.role==='admin'?'Admin':'Especialista'} c={u.role==='admin'?'purple':'blue'}/></td>
              <td style={{padding:'10px 14px'}}><Badge t={u.active?'Activo':'Inactivo'} c={u.active?'green':'gray'}/></td>
              <td style={{padding:'10px 14px',fontSize:11,color:'#94A3B8'}}>{fd(u.created)}</td>
              <td style={{padding:'10px 14px'}}>
                <div style={{display:'flex',gap:4}}>
                  <Btn v="ghost" sz="sm" onClick={()=>resetPwd(u.id)}>🔑 Clave</Btn>
                  <Btn v={u.active?'danger':'success'} sz="sm" onClick={()=>toggle(u.id)}>{u.active?'Desactivar':'Activar'}</Btn>
                </div>
              </td>
            </tr>
          ))}</tbody>
        </table>
      </div>

      <Modal open={modal==='new'} onClose={()=>setModal('')} title="Nuevo Usuario">
        <Inp lbl="Nombre completo" val={form.name||''} set={v=>setForm(f=>({...f,name:v}))} req/>
        <Inp lbl="Rol" val={form.role||''} set={v=>setForm(f=>({...f,role:v}))} type="select" opts={[{v:'admin',l:'Administrador'},{v:'specialist',l:'Especialista/Dentista'}]} req/>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0 12px'}}>
          <Inp lbl="Usuario" val={form.username||''} set={v=>setForm(f=>({...f,username:v}))} req ph="nombre.apellido"/>
          <Inp lbl="Contraseña" val={form.password||''} set={v=>setForm(f=>({...f,password:v}))} req/>
          <Inp lbl="Email" val={form.email||''} set={v=>setForm(f=>({...f,email:v}))} type="email"/>
          <Inp lbl="Teléfono" val={form.phone||''} set={v=>setForm(f=>({...f,phone:v}))}/>
          {form.role==='specialist'&&<><Inp lbl="Especialidad" val={form.specialty||''} set={v=>setForm(f=>({...f,specialty:v}))} type="select" opts={SPECIALTIES}/><Inp lbl="Matrícula" val={form.license||''} set={v=>setForm(f=>({...f,license:v}))} ph="MP-XXXXX"/><Inp lbl="Sueldo bruto ($)" val={form.salary||''} set={v=>setForm(f=>({...f,salary:v}))} type="number"/></>}
        </div>
        <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
          <Btn v="secondary" onClick={()=>setModal('')}>Cancelar</Btn>
          <Btn onClick={save}>Crear Usuario</Btn>
        </div>
      </Modal>
    </div>
  );
}

function ReportsView({patients,appts,payments,inv,users}){
  const specs=users.filter(u=>u.role==='specialist');
  const totalRev=appts.filter(a=>a.estado==='completada').reduce((s,a)=>s+(a.costo||0),0);
  const totalPaid=payments.filter(p=>p.estado==='pagado').reduce((s,p)=>s+p.bruto,0);
  const bySpec=specs.map(s=>({...s,count:appts.filter(a=>a.especId===s.id&&a.estado==='completada').length,rev:appts.filter(a=>a.especId===s.id&&a.estado==='completada').reduce((sum,a)=>sum+(a.costo||0),0)}));
  const byInsurance=SEGUROS.map(sg=>({sg,count:patients.filter(p=>p.seguro===sg&&p.activo).length})).filter(x=>x.count>0).sort((a,b)=>b.count-a.count);
  const maxI=Math.max(...byInsurance.map(x=>x.count),1);

  return (
    <div>
      <h2 style={{margin:'0 0 1.25rem',fontSize:20,fontWeight:800,color:'#0F172A'}}>Reportes y Estadísticas</h2>

      <div style={{display:'flex',gap:10,flexWrap:'wrap',marginBottom:'1.25rem'}}>
        <Stat lbl="Total consultas" val={appts.filter(a=>a.estado==='completada').length} clr="#0284C7" icon="🦷"/>
        <Stat lbl="Ingresos totales" val={fc(totalRev)} clr="#059669" icon="💰"/>
        <Stat lbl="Total pagado" val={fc(totalPaid)} clr="#D97706" icon="💸"/>
        <Stat lbl="Balance" val={fc(totalRev-totalPaid)} clr={totalRev>=totalPaid?'#059669':'#EF4444'} icon={totalRev>=totalPaid?'📈':'📉'}/>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:14}}>
        <div style={{background:'#fff',borderRadius:14,border:'1px solid #F1F5F9',padding:'1.25rem'}}>
          <p style={{margin:'0 0 14px',fontWeight:700,fontSize:14,color:'#0F172A'}}>👨‍⚕️ Productividad por Especialista</p>
          {bySpec.map(s=>(
            <div key={s.id} style={{padding:'9px 0',borderBottom:'1px solid #F8FAFC'}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                <span style={{fontSize:13,fontWeight:600,color:'#1E293B'}}>{s.name}</span>
                <span style={{fontSize:12,color:'#64748B'}}>{s.count} consultas</span>
              </div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div style={{flex:1,height:6,background:'#F1F5F9',borderRadius:4,marginRight:8}}><div style={{height:'100%',width:`${(s.count/Math.max(...bySpec.map(x=>x.count),1))*100}%`,background:'linear-gradient(90deg,#0284C7,#7C3AED)',borderRadius:4}}/></div>
                <span style={{fontSize:12,fontWeight:700,color:'#059669'}}>{fc(s.rev)}</span>
              </div>
            </div>
          ))}
        </div>

        <div style={{background:'#fff',borderRadius:14,border:'1px solid #F1F5F9',padding:'1.25rem'}}>
          <p style={{margin:'0 0 14px',fontWeight:700,fontSize:14,color:'#0F172A'}}>🏥 Pacientes por Cobertura</p>
          {byInsurance.slice(0,8).map(x=>(
            <div key={x.sg} style={{padding:'6px 0',borderBottom:'1px solid #F8FAFC'}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:3}}>
                <span style={{fontSize:12,fontWeight:500,color:'#374151'}}>{x.sg}</span>
                <span style={{fontSize:12,fontWeight:700,color:'#0284C7'}}>{x.count}</span>
              </div>
              <div style={{height:4,background:'#F1F5F9',borderRadius:4}}><div style={{height:'100%',width:`${(x.count/maxI)*100}%`,background:'linear-gradient(90deg,#0284C7,#0EA5E9)',borderRadius:4}}/></div>
            </div>
          ))}
        </div>

        <div style={{background:'#fff',borderRadius:14,border:'1px solid #F1F5F9',padding:'1.25rem'}}>
          <p style={{margin:'0 0 14px',fontWeight:700,fontSize:14,color:'#0F172A'}}>📅 Estado de Citas</p>
          {[['pendiente','Pendientes','#F59E0B'],['completada','Completadas','#10B981'],['cancelada','Canceladas','#EF4444']].map(([k,l,c])=>{
            const cnt=appts.filter(a=>a.estado===k).length;
            const pct=appts.length?Math.round((cnt/appts.length)*100):0;
            return <div key={k} style={{display:'flex',alignItems:'center',gap:12,marginBottom:10}}>
              <div style={{width:12,height:12,borderRadius:'50%',background:c,flexShrink:0}}/>
              <span style={{fontSize:13,flex:1,color:'#374151'}}>{l}</span>
              <span style={{fontSize:13,fontWeight:700,color:'#1E293B'}}>{cnt} ({pct}%)</span>
            </div>;
          })}
        </div>

        <div style={{background:'#fff',borderRadius:14,border:'1px solid #F1F5F9',padding:'1.25rem'}}>
          <p style={{margin:'0 0 14px',fontWeight:700,fontSize:14,color:'#0F172A'}}>📦 Inventario Crítico</p>
          {inv.filter(i=>i.stock<=i.min).length===0?<p style={{color:'#10B981',fontSize:13}}>✓ Todo el stock está en niveles óptimos</p>:
          inv.filter(i=>i.stock<=i.min).map(i=>(
            <div key={i.id} style={{display:'flex',justifyContent:'space-between',padding:'7px 0',borderBottom:'1px solid #F8FAFC'}}>
              <span style={{fontSize:12,color:'#1E293B',fontWeight:500}}>{i.nombre}</span>
              <Badge t={`${i.stock}/${i.min}`} c={i.stock===0?'red':'yellow'}/>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MyAgenda({currentUser,appts,patients,users}){
  const myAppts=appts.filter(a=>a.especId===currentUser.id).sort((a,b)=>(a.fecha+a.hora).localeCompare(b.fecha+b.hora));
  const todayA=myAppts.filter(a=>a.fecha===todayStr);
  const upcoming=myAppts.filter(a=>a.fecha>todayStr&&a.estado==='pendiente');
  const past=myAppts.filter(a=>a.fecha<todayStr||a.estado==='completada').reverse();

  const ApptCard=({a})=>{
    const p=patients.find(x=>x.id===a.pacienteId);
    return (
      <div style={{background:'#F8FAFC',borderRadius:10,padding:'12px 14px',marginBottom:8,borderLeft:`4px solid ${a.estado==='completada'?'#10B981':a.estado==='cancelada'?'#EF4444':'#F59E0B'}`}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
          <div><p style={{margin:0,fontSize:14,fontWeight:700,color:'#1E293B'}}>{a.hora} — {p?.nombre} {p?.apellido}</p>
          <p style={{margin:'2px 0 0',fontSize:12,color:'#64748B'}}>{a.motivo}</p>
          {p&&<p style={{margin:'2px 0 0',fontSize:11,color:'#94A3B8'}}>Seguro: {p.seguro} {p.plan&&p.plan!=='-'?`· ${p.plan}`:''} · Alergias: {p.alergias||'Ninguna'}</p>}</div>
          <div style={{textAlign:'right'}}><Badge t={a.estado} c={a.estado==='completada'?'green':a.estado==='cancelada'?'red':'yellow'}/><p style={{margin:'4px 0 0',fontSize:11,color:'#94A3B8'}}>{fd(a.fecha)}</p></div>
        </div>
        {a.notas&&<p style={{margin:'6px 0 0',fontSize:12,color:'#64748B',fontStyle:'italic'}}>Notas: {a.notas}</p>}
      </div>
    );
  };

  return (
    <div>
      <div style={{marginBottom:'1.25rem'}}>
        <h2 style={{margin:0,fontSize:20,fontWeight:800,color:'#0F172A'}}>Mi Agenda</h2>
        <p style={{margin:'2px 0 0',fontSize:12,color:'#94A3B8'}}>Bienvenido/a, {currentUser.name}</p>
      </div>
      <div style={{display:'flex',gap:10,marginBottom:'1.25rem'}}>
        <Stat lbl="Hoy" val={todayA.length} sub="citas hoy" clr="#0284C7" icon="📅"/>
        <Stat lbl="Próximas" val={upcoming.length} sub="pendientes" clr="#D97706" icon="⏰"/>
        <Stat lbl="Completadas" val={myAppts.filter(a=>a.estado==='completada').length} sub="históricas" clr="#059669" icon="✅"/>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
        <div style={{background:'#fff',borderRadius:14,border:'1px solid #F1F5F9',padding:'1.25rem'}}>
          <p style={{margin:'0 0 12px',fontWeight:700,fontSize:14,color:'#0F172A'}}>📅 Citas de Hoy ({todayA.length})</p>
          {todayA.length===0?<p style={{color:'#94A3B8',fontSize:13}}>Sin citas para hoy</p>:todayA.map(a=><ApptCard key={a.id} a={a}/>)}
        </div>
        <div style={{background:'#fff',borderRadius:14,border:'1px solid #F1F5F9',padding:'1.25rem'}}>
          <p style={{margin:'0 0 12px',fontWeight:700,fontSize:14,color:'#0F172A'}}>⏰ Próximas Citas ({upcoming.length})</p>
          {upcoming.length===0?<p style={{color:'#94A3B8',fontSize:13}}>Sin citas próximas</p>:upcoming.slice(0,6).map(a=><ApptCard key={a.id} a={a}/>)}
        </div>
      </div>
    </div>
  );
}

// ═══════════════ SIDEBAR ═══════════════

const ADMIN_MENU=[
  {id:'dashboard',label:'Dashboard',icon:'⚡'},
  {id:'patients',label:'Pacientes',icon:'👥'},
  {id:'calendar',label:'Calendario',icon:'📅'},
  {id:'inventory',label:'Inventario',icon:'📦'},
  {id:'specialists',label:'Especialistas',icon:'🦷'},
  {id:'payments',label:'Pagos',icon:'💰'},
  {id:'requests',label:'Solicitudes',icon:'📋'},
  {id:'reports',label:'Reportes',icon:'📊'},
  {id:'users',label:'Usuarios',icon:'👤'},
];
const SPEC_MENU=[
  {id:'agenda',label:'Mi Agenda',icon:'📅'},
  {id:'patients',label:'Pacientes',icon:'👥'},
  {id:'inventory',label:'Materiales',icon:'📦'},
  {id:'requests',label:'Solicitudes',icon:'📋'},
];

function Sidebar({active,setActive,user,onLogout}){
  const menu=user.role==='admin'?ADMIN_MENU:SPEC_MENU;
  return (
    <div style={{width:220,background:'#0F172A',display:'flex',flexDirection:'column',height:'100vh',position:'sticky',top:0,flexShrink:0}}>
      <div style={{padding:'1.25rem 1rem',borderBottom:'1px solid #1E293B'}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:36,height:36,borderRadius:10,background:'linear-gradient(135deg,#0284C7,#7C3AED)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>🦷</div>
          <div><p style={{margin:0,fontSize:14,fontWeight:800,color:'#fff'}}>DentalERP</p><p style={{margin:0,fontSize:10,color:'#64748B'}}>Sistema de Gestión</p></div>
        </div>
      </div>

      <div style={{padding:'12px 8px',flex:1,overflowY:'auto'}}>
        {menu.map(m=>(
          <button key={m.id} onClick={()=>setActive(m.id)} style={{width:'100%',display:'flex',alignItems:'center',gap:10,padding:'9px 12px',borderRadius:8,border:'none',cursor:'pointer',background:active===m.id?'#1E40AF':'transparent',color:active===m.id?'#fff':'#94A3B8',fontWeight:active===m.id?600:400,fontSize:13,textAlign:'left',marginBottom:2,transition:'all 0.15s'}}>
            <span style={{fontSize:16}}>{m.icon}</span>{m.label}
          </button>
        ))}
      </div>

      <div style={{padding:'12px 8px',borderTop:'1px solid #1E293B'}}>
        <div style={{padding:'8px 12px',marginBottom:6}}>
          <p style={{margin:0,fontSize:12,fontWeight:600,color:'#e2e8f0'}}>{user.name}</p>
          <p style={{margin:'1px 0 0',fontSize:10,color:'#64748B'}}>{user.role==='admin'?'Administrador':user.specialty}</p>
        </div>
        <button onClick={onLogout} style={{width:'100%',padding:'8px 12px',borderRadius:8,border:'none',cursor:'pointer',background:'#1E293B',color:'#94A3B8',fontSize:12,fontWeight:500,textAlign:'left'}}>🚪 Cerrar sesión</button>
      </div>
    </div>
  );
}

// ═══════════════ LOGIN ═══════════════

function Login({users,onLogin}){
  const [role,setRole]=useState('');
  const [un,setUn]=useState('');
  const [pw,setPw]=useState('');
  const [err,setErr]=useState('');
  const [showCreds,setShowCreds]=useState(true);

  const handleLogin=()=>{
    setErr('');
    const u=users.find(x=>x.username===un&&x.password===pw);
    if(!u){setErr('Usuario o contraseña incorrectos');return;}
    if(!u.active){setErr('Usuario inactivo. Contacte al administrador');return;}
    if(role&&u.role!==role){setErr(`Este usuario no tiene rol de ${role==='admin'?'Administrador':'Especialista'}`);return;}
    onLogin(u);
  };

  const filtered=role?users.filter(u=>u.role===role&&u.active):users.filter(u=>u.active);

  return (
    <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#0F172A 0%,#1E3A5F 50%,#0F172A 100%)',display:'flex',alignItems:'center',justifyContent:'center',padding:'1rem',fontFamily:'system-ui,sans-serif'}}>
      <div style={{width:'100%',maxWidth:900,display:'grid',gridTemplateColumns:'1fr 1fr',gap:24,alignItems:'start'}}>

        <div style={{background:'rgba(255,255,255,0.05)',backdropFilter:'blur(12px)',borderRadius:20,padding:'2rem',border:'1px solid rgba(255,255,255,0.1)'}}>
          <div style={{textAlign:'center',marginBottom:'1.5rem'}}>
            <div style={{width:64,height:64,borderRadius:16,background:'linear-gradient(135deg,#0284C7,#7C3AED)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:32,margin:'0 auto 12px'}}>🦷</div>
            <h1 style={{margin:0,fontSize:24,fontWeight:800,color:'#fff'}}>DentalERP</h1>
            <p style={{margin:'4px 0 0',fontSize:13,color:'#94A3B8'}}>Sistema de Gestión Odontológica</p>
          </div>

          <div style={{marginBottom:'1.25rem'}}>
            <p style={{fontSize:12,fontWeight:700,color:'#94A3B8',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:8}}>¿Eres especialista o admin?</p>
            <div style={{display:'flex',gap:8}}>
              {[['','Todos'],['admin','🔐 Administrador'],['specialist','🦷 Especialista']].map(([r,l])=>(
                <button key={r} onClick={()=>setRole(r)} style={{flex:1,padding:'8px 4px',borderRadius:10,border:`2px solid ${role===r?'#0284C7':'rgba(255,255,255,0.15)'}`,cursor:'pointer',background:role===r?'#0284C7':'transparent',color:'#fff',fontSize:12,fontWeight:600,transition:'all 0.15s'}}>{l}</button>
              ))}
            </div>
          </div>

          <div style={{marginBottom:12}}>
            <label style={{display:'block',fontSize:12,fontWeight:700,color:'#94A3B8',marginBottom:4,textTransform:'uppercase'}}>Usuario</label>
            <input value={un} onChange={e=>setUn(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleLogin()} placeholder="nombre.usuario" style={{width:'100%',padding:'10px 14px',border:'1.5px solid rgba(255,255,255,0.15)',borderRadius:10,fontSize:14,color:'#fff',background:'rgba(255,255,255,0.08)',outline:'none',boxSizing:'border-box'}}/>
          </div>
          <div style={{marginBottom:'1.25rem'}}>
            <label style={{display:'block',fontSize:12,fontWeight:700,color:'#94A3B8',marginBottom:4,textTransform:'uppercase'}}>Contraseña</label>
            <input type="password" value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleLogin()} placeholder="••••••••" style={{width:'100%',padding:'10px 14px',border:'1.5px solid rgba(255,255,255,0.15)',borderRadius:10,fontSize:14,color:'#fff',background:'rgba(255,255,255,0.08)',outline:'none',boxSizing:'border-box'}}/>
          </div>
          {err&&<div style={{background:'rgba(239,68,68,0.2)',border:'1px solid rgba(239,68,68,0.4)',borderRadius:8,padding:'8px 12px',fontSize:13,color:'#FCA5A5',marginBottom:12}}>{err}</div>}
          <button onClick={handleLogin} style={{width:'100%',padding:'12px',borderRadius:10,border:'none',cursor:'pointer',background:'linear-gradient(135deg,#0284C7,#7C3AED)',color:'#fff',fontSize:15,fontWeight:700}}>Iniciar Sesión →</button>
        </div>

        <div style={{background:'rgba(255,255,255,0.04)',borderRadius:20,padding:'1.5rem',border:'1px solid rgba(255,255,255,0.08)'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1rem'}}>
            <p style={{margin:0,fontSize:13,fontWeight:700,color:'#94A3B8',textTransform:'uppercase',letterSpacing:'0.04em'}}>Usuarios del Sistema</p>
            <button onClick={()=>setShowCreds(!showCreds)} style={{border:'none',background:'rgba(255,255,255,0.1)',borderRadius:6,padding:'4px 10px',cursor:'pointer',color:'#94A3B8',fontSize:11}}>{showCreds?'Ocultar':'Mostrar'}</button>
          </div>
          <div style={{overflowX:'auto'}}>
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead><tr>{['Nombre','Rol','Usuario','Contraseña'].map(h=><th key={h} style={{padding:'7px 10px',textAlign:'left',fontSize:10,fontWeight:700,color:'#475569',textTransform:'uppercase',letterSpacing:'0.04em',borderBottom:'1px solid rgba(255,255,255,0.08)'}}>{h}</th>)}</tr></thead>
              <tbody>{filtered.map(u=>(
                <tr key={u.id} onClick={()=>{setUn(u.username);setPw(u.password);setRole(u.role);}} style={{cursor:'pointer',borderBottom:'1px solid rgba(255,255,255,0.05)'}} onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.05)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <td style={{padding:'8px 10px',fontSize:12,color:'#e2e8f0',fontWeight:500}}>{u.name}</td>
                  <td style={{padding:'8px 10px'}}><span style={{fontSize:10,padding:'2px 8px',borderRadius:10,background:u.role==='admin'?'rgba(124,58,237,0.3)':'rgba(2,132,199,0.3)',color:u.role==='admin'?'#C4B5FD':'#7DD3FC',fontWeight:700}}>{u.role==='admin'?'Admin':'Especialista'}</span></td>
                  <td style={{padding:'8px 10px'}}><code style={{fontSize:11,color:'#60A5FA',background:'rgba(59,130,246,0.15)',padding:'2px 6px',borderRadius:4}}>{u.username}</code></td>
                  <td style={{padding:'8px 10px'}}><code style={{fontSize:11,color:showCreds?'#FCD34D':'#4B5563',background:'rgba(252,211,77,0.1)',padding:'2px 6px',borderRadius:4}}>{showCreds?u.password:'••••••••'}</code></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
          <p style={{margin:'10px 0 0',fontSize:11,color:'#475569',textAlign:'center'}}>Clic en una fila para autocompletar las credenciales</p>
        </div>
      </div>
    </div>
  );
}

// ═══════════════ APP ROOT ═══════════════

export default function App(){
  const [users,setUsers]=useState(INIT_USERS);
  const [patients,setPatients]=useState(INIT_PATIENTS);
  const [appts,setAppts]=useState(INIT_APPTS);
  const [inv,setInv]=useState(INIT_INV);
  const [usage,setUsage]=useState(INIT_USAGE);
  const [requests,setRequests]=useState(INIT_REQUESTS);
  const [payments,setPayments]=useState(INIT_PAYMENTS);
  const [currentUser,setCurrentUser]=useState(null);
  const [view,setView]=useState('dashboard');

  if(!currentUser) return <Login users={users} onLogin={u=>{setCurrentUser(u);setView(u.role==='admin'?'dashboard':'agenda');}}/>;

  const renderView=()=>{
    const props={users,patients,setPatients,appts,setAppts,inv,setInv,usage,setUsage,requests,setRequests,payments,setPayments,currentUser};
    switch(view){
      case 'dashboard': return <Dashboard {...props}/>;
      case 'patients': return <PatientsView {...props}/>;
      case 'calendar': return <CalendarView {...props}/>;
      case 'inventory': return <InventoryView {...props}/>;
      case 'specialists': return <SpecialistsView users={users} setUsers={setUsers}/>;
      case 'payments': return <PaymentsView payments={payments} setPayments={setPayments} users={users}/>;
      case 'requests': return <RequestsView requests={requests} setRequests={setRequests} currentUser={currentUser} users={users}/>;
      case 'reports': return <ReportsView {...props}/>;
      case 'users': return <UsersView users={users} setUsers={setUsers}/>;
      case 'agenda': return <MyAgenda currentUser={currentUser} appts={appts} patients={patients} users={users}/>;
      default: return <Dashboard {...props}/>;
    }
  };

  return (
    <div style={{display:'flex',minHeight:'100vh',background:'#F8FAFC',fontFamily:"'system-ui',-apple-system,sans-serif"}}>
      <Sidebar active={view} setActive={setView} user={currentUser} onLogout={()=>setCurrentUser(null)}/>
      <div style={{flex:1,overflow:'auto'}}>
        <div style={{borderBottom:'1px solid #F1F5F9',padding:'0.875rem 1.5rem',background:'#fff',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div style={{display:'flex',gap:6,alignItems:'center'}}>
            {CLINICS.map(c=><span key={c.id} style={{fontSize:11,padding:'4px 10px',background:'#EFF6FF',color:'#1D4ED8',borderRadius:20,fontWeight:600}}>🏥 {c.nombre}</span>)}
          </div>
          <div style={{display:'flex',gap:10,alignItems:'center'}}>
            <span style={{fontSize:12,color:'#94A3B8'}}>{new Date().toLocaleDateString('es-AR',{weekday:'long',day:'numeric',month:'long'})}</span>
            <div style={{width:32,height:32,borderRadius:'50%',background:'linear-gradient(135deg,#0284C7,#7C3AED)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:700,fontSize:13}}>{currentUser.name[0]}</div>
          </div>
        </div>
        <div style={{padding:'1.5rem'}}>{renderView()}</div>
      </div>
    </div>
  );
}
