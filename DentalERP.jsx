
import { useState, useMemo } from "react";
import {
  Users, Calendar, Package, DollarSign, Home, LogOut, Search, Plus,
  Bell, Eye, EyeOff, Edit, Trash2, X, ChevronLeft, ChevronRight,
  Clock, CheckCircle, XCircle, AlertCircle, Stethoscope, ShoppingCart,
  BarChart2, FileText, TrendingUp, Save, CreditCard, Menu, Settings
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";

// ─── HELPERS ───────────────────────────────────────────────────────────────
const fmt = (n) => new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);
const today = new Date();
const todayStr = today.toISOString().split("T")[0];
const pad = (n) => String(n).padStart(2, "0");
const dateStr = (d) => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const daysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
const firstDay = (y, m) => new Date(y, m, 1).getDay();

// ─── INITIAL DATA ──────────────────────────────────────────────────────────
const SPECIALTIES = ["Ortodoncia","Endodoncia","Periodoncia","Odontología General","Implantología","Cirugía Maxilofacial"];
const COVERAGES = {
  "Particular": "particular",
  "OSDE": "prepaga",
  "Swiss Medical": "prepaga",
  "Galeno": "prepaga",
  "Medicus": "prepaga",
  "Accord Salud": "prepaga",
  "IOMA": "obra_social",
  "PAMI": "obra_social",
  "OSECAC": "obra_social",
  "OSPEDYC": "obra_social",
  "OSDOP": "obra_social",
};
const COVERAGE_TYPE = { particular:"Particular", prepaga:"Prepaga", obra_social:"Obra Social" };

const INIT_USERS = [
  { id:1, name:"Admin Principal", email:"admin@dental.com", password:"Admin123", role:"admin", active:true },
  { id:2, name:"Dra. María García", email:"dra.garcia@dental.com", password:"Esp123", role:"specialist", active:true, specialty:"Ortodoncia", license:"MP 12345", salary:450000 },
  { id:3, name:"Dr. Carlos López", email:"dr.lopez@dental.com", password:"Esp456", role:"specialist", active:true, specialty:"Endodoncia", license:"MP 67890", salary:480000 },
  { id:4, name:"Dra. Laura Rodríguez", email:"dra.rodriguez@dental.com", password:"Esp789", role:"specialist", active:true, specialty:"Periodoncia", license:"MP 11111", salary:420000 },
];

const INIT_PATIENTS = [
  { id:1, name:"Juan Pérez", dni:"28456789", phone:"11-4567-8901", email:"juan.perez@gmail.com", birth:"1985-03-15", coverage:"IOMA", address:"Av. Corrientes 1234", notes:"Alérgico a penicilina" },
  { id:2, name:"Ana Martínez", dni:"32145678", phone:"11-5678-9012", email:"ana.martinez@gmail.com", birth:"1992-07-22", coverage:"OSDE", address:"Av. Santa Fe 4567", notes:"" },
  { id:3, name:"Roberto Silva", dni:"25789012", phone:"11-6789-0123", email:"roberto.silva@gmail.com", birth:"1978-11-30", coverage:"Particular", address:"Cabrera 789", notes:"Hipertenso" },
  { id:4, name:"Sofía Torres", dni:"38901234", phone:"11-7890-1234", email:"sofia.torres@gmail.com", birth:"1998-04-10", coverage:"Swiss Medical", address:"Thames 2345", notes:"" },
];

const d = (offset, h="10:00") => { const x=new Date(today); x.setDate(x.getDate()+offset); return dateStr(x)+"T"+h; };
const INIT_APPOINTMENTS = [
  { id:1, patientId:1, specialistId:2, datetime:d(0,"09:00"), reason:"Control ortodoncia", notes:"", status:"pending" },
  { id:2, patientId:2, specialistId:3, datetime:d(0,"10:00"), reason:"Tratamiento de conducto", notes:"2da sesión", status:"pending" },
  { id:3, patientId:3, specialistId:4, datetime:d(0,"11:30"), reason:"Limpieza periodontal", notes:"", status:"completed" },
  { id:4, patientId:4, specialistId:2, datetime:d(1,"09:30"), reason:"Ajuste de brackets", notes:"", status:"pending" },
  { id:5, patientId:1, specialistId:3, datetime:d(1,"15:00"), reason:"Seguimiento endodoncia", notes:"", status:"pending" },
  { id:6, patientId:2, specialistId:4, datetime:d(-1,"10:00"), reason:"Revisión encías", notes:"", status:"completed" },
  { id:7, patientId:3, specialistId:2, datetime:d(-2,"11:00"), reason:"Consulta inicial", notes:"", status:"cancelled" },
];

const INIT_INVENTORY = [
  { id:1, name:"Guantes de látex", category:"Descartable", unit:"caja", stock:8, minStock:10, price:2500, supplier:"MedSupply" },
  { id:2, name:"Resina compuesta", category:"Material dental", unit:"jeringa", stock:15, minStock:5, price:4200, supplier:"DentalPro" },
  { id:3, name:"Anestesia lidocaína", category:"Fármaco", unit:"caja", stock:3, minStock:5, price:8900, supplier:"FarmaOdonto" },
  { id:4, name:"Mascarillas N95", category:"Descartable", unit:"caja", stock:5, minStock:10, price:3800, supplier:"MedSupply" },
  { id:5, name:"Hilo de sutura", category:"Material dental", unit:"caja", stock:7, minStock:3, price:5600, supplier:"DentalPro" },
  { id:6, name:"Alcohol en gel", category:"Higiene", unit:"litro", stock:12, minStock:5, price:1200, supplier:"MedSupply" },
];

const INIT_PAYMENTS = {
  salaries: [
    { id:1, userId:2, month:"2025-03", gross:450000, paid:false },
    { id:2, userId:3, month:"2025-03", gross:480000, paid:false },
    { id:3, userId:4, month:"2025-03", gross:420000, paid:true, paidDate:"2025-03-05" },
  ],
  suppliers: [
    { id:1, supplier:"MedSupply", invoice:"FC-0001-00345", concept:"Materiales descartables", amount:28000, status:"paid", date:"2025-03-10" },
    { id:2, supplier:"DentalPro", invoice:"FC-0002-00789", concept:"Materiales dentales", amount:52000, status:"pending", date:"2025-03-18" },
  ],
};

const INIT_REQUESTS = [
  { id:1, specialistId:2, date:d(-3,""), items:[{name:"Guantes de látex",qty:2,reason:"Bajo stock en consultorio"},{name:"Mascarillas N95",qty:1,reason:""}], notes:"Urgente por favor", status:"pending" },
  { id:2, specialistId:3, date:d(-5,""), items:[{name:"Anestesia lidocaína",qty:3,reason:"Varios tratamientos esta semana"}], notes:"", status:"approved" },
];

const INIT_RECORDS = [
  { id:1, patientId:1, date:d(-30,""), specialistId:2, description:"Control ortodoncia mensual", treatment:"Ajuste de brackets, cambio de ligaduras", observations:"Progreso satisfactorio" },
  { id:2, patientId:2, date:d(-15,""), specialistId:3, description:"1ra sesión endodoncia molar inf", treatment:"Apertura cameral, conformación", observations:"Próxima sesión en 15 días" },
];

const INIT_MOVEMENTS = [
  { id:1, itemId:1, type:"out", qty:1, specialistId:2, reason:"Uso en consulta", date:d(-2,"") },
  { id:2, itemId:3, type:"out", qty:1, specialistId:3, reason:"Procedimiento endodoncia", date:d(-1,"") },
];

// ─── UI PRIMITIVES ─────────────────────────────────────────────────────────
const Btn = ({ onClick, children, variant="primary", size="md", disabled=false, className="" }) => {
  const base = "inline-flex items-center gap-2 font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed";
  const sizes = { sm:"px-3 py-1.5 text-sm", md:"px-4 py-2 text-sm", lg:"px-5 py-2.5 text-base" };
  const variants = {
    primary:"bg-teal-600 text-white hover:bg-teal-700 focus:ring-teal-500",
    secondary:"bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-gray-400",
    danger:"bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    ghost:"bg-transparent text-gray-600 hover:bg-gray-100 focus:ring-gray-400",
    success:"bg-green-600 text-white hover:bg-green-700 focus:ring-green-500",
    warning:"bg-amber-500 text-white hover:bg-amber-600 focus:ring-amber-400",
  };
  return <button onClick={onClick} disabled={disabled} className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}>{children}</button>;
};

const Inp = ({ label, value, onChange, type="text", placeholder="", required=false, className="" }) => (
  <div className={className}>
    {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}{required&&<span className="text-red-500 ml-1">*</span>}</label>}
    <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
  </div>
);

const Sel = ({ label, value, onChange, options, required=false, className="" }) => (
  <div className={className}>
    {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}{required&&<span className="text-red-500 ml-1">*</span>}</label>}
    <select value={value} onChange={e=>onChange(e.target.value)}
      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white">
      <option value="">-- Seleccionar --</option>
      {options.map(o => <option key={o.value??o} value={o.value??o}>{o.label??o}</option>)}
    </select>
  </div>
);

const Txt = ({ label, value, onChange, rows=3, className="" }) => (
  <div className={className}>
    {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
    <textarea value={value} onChange={e=>onChange(e.target.value)} rows={rows}
      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none" />
  </div>
);

const Badge = ({ children, color="gray" }) => {
  const colors = {
    gray:"bg-gray-100 text-gray-700", green:"bg-green-100 text-green-700",
    red:"bg-red-100 text-red-700", yellow:"bg-amber-100 text-amber-700",
    blue:"bg-blue-100 text-blue-700", teal:"bg-teal-100 text-teal-700",
    purple:"bg-purple-100 text-purple-700",
  };
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[color]}`}>{children}</span>;
};

const Stat = ({ label, value, icon: Icon, color="teal", sub="" }) => {
  const colors = { teal:"bg-teal-50 text-teal-600", blue:"bg-blue-50 text-blue-600", purple:"bg-purple-50 text-purple-600", amber:"bg-amber-50 text-amber-600", green:"bg-green-50 text-green-600", red:"bg-red-50 text-red-600" };
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
      <div className={`p-3 rounded-xl ${colors[color]}`}><Icon size={22}/></div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
};

const Modal = ({ title, onClose, children, size="md" }) => {
  const sizes = { sm:"max-w-sm", md:"max-w-lg", lg:"max-w-2xl", xl:"max-w-4xl" };
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-2xl shadow-2xl w-full ${sizes[size]} max-h-[90vh] flex flex-col`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"><X size={18}/></button>
        </div>
        <div className="overflow-y-auto p-6 flex-1">{children}</div>
      </div>
    </div>
  );
};

const Card = ({ children, className="" }) => <div className={`bg-white rounded-xl border border-gray-200 ${className}`}>{children}</div>;

const statusConfig = {
  pending: { label:"Pendiente", color:"yellow", icon:Clock },
  completed: { label:"Completada", color:"green", icon:CheckCircle },
  cancelled: { label:"Cancelada", color:"red", icon:XCircle },
  approved: { label:"Aprobado", color:"green", icon:CheckCircle },
  rejected: { label:"Rechazado", color:"red", icon:XCircle },
};

const StatusBadge = ({ status }) => {
  const cfg = statusConfig[status] || { label:status, color:"gray", icon:AlertCircle };
  return <Badge color={cfg.color}><cfg.icon size={11} className="mr-1"/>{cfg.label}</Badge>;
};

// ─── LOGIN ─────────────────────────────────────────────────────────────────
const LoginScreen = ({ onLogin, users }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState("");

  const specialists = users.filter(u=>u.role==="specialist" && u.active);
  const admins = users.filter(u=>u.role==="admin" && u.active);

  const handleLogin = () => {
    const u = users.find(x=>x.email===email && x.password===password && x.active);
    if (u) { setErr(""); onLogin(u); }
    else setErr("Credenciales incorrectas o usuario inactivo.");
  };

  const fill = (u) => { setEmail(u.email); setPassword(u.password); setErr(""); };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900 flex items-center justify-center p-4">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap'); * { font-family: 'Inter', sans-serif; }`}</style>
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Login form */}
        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-teal-600 p-2.5 rounded-xl"><Stethoscope size={24} className="text-white"/></div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">DentalERP</h1>
              <p className="text-xs text-gray-500">Sistema de Gestión Clínica</p>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Bienvenido/a</h2>
          <p className="text-sm text-gray-500 mb-6">Ingresá tus credenciales para continuar</p>
          <div className="space-y-4">
            <Inp label="Email" value={email} onChange={setEmail} type="email" placeholder="tu@email.com"/>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
              <div className="relative">
                <input type={show?"text":"password"} value={password} onChange={e=>setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-teal-500"/>
                <button onClick={()=>setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {show?<EyeOff size={16}/>:<Eye size={16}/>}
                </button>
              </div>
            </div>
            {err && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{err}</p>}
            <Btn onClick={handleLogin} className="w-full justify-center" size="lg">Ingresar</Btn>
          </div>
        </div>
        {/* Quick access */}
        <div className="space-y-4">
          <div className="bg-white/10 backdrop-blur rounded-2xl p-5">
            <p className="text-white font-semibold mb-3 flex items-center gap-2"><Users size={16}/>Administradores</p>
            <div className="space-y-2">
              {admins.map(u=>(
                <button key={u.id} onClick={()=>fill(u)}
                  className="w-full bg-white/10 hover:bg-white/20 text-left rounded-xl p-3 transition-all border border-white/10">
                  <p className="text-white font-medium text-sm">{u.name}</p>
                  <p className="text-teal-200 text-xs">{u.email} · {u.password}</p>
                </button>
              ))}
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-2xl p-5">
            <p className="text-white font-semibold mb-3 flex items-center gap-2"><Stethoscope size={16}/>Especialistas</p>
            <div className="space-y-2">
              {specialists.map(u=>(
                <button key={u.id} onClick={()=>fill(u)}
                  className="w-full bg-white/10 hover:bg-white/20 text-left rounded-xl p-3 transition-all border border-white/10">
                  <p className="text-white font-medium text-sm">{u.name} <span className="text-teal-300 text-xs">· {u.specialty}</span></p>
                  <p className="text-teal-200 text-xs">{u.email} · {u.password}</p>
                </button>
              ))}
            </div>
          </div>
          <p className="text-white/50 text-xs text-center">Hacé clic en un usuario para autocompletar credenciales</p>
        </div>
      </div>
    </div>
  );
};

// ─── DASHBOARD ─────────────────────────────────────────────────────────────
const DashboardView = ({ user, users, patients, appointments, inventory, requests }) => {
  const specialists = users.filter(u=>u.role==="specialist");
  const todayAppts = appointments.filter(a=>a.datetime.startsWith(todayStr));
  const myAppts = user.role==="specialist" ? todayAppts.filter(a=>a.specialistId===user.id) : todayAppts;
  const lowStock = inventory.filter(i=>i.stock<=i.minStock);
  const pendReq = requests.filter(r=>r.status==="pending");

  const monthData = useMemo(()=>{
    const map = {};
    appointments.forEach(a=>{
      const m = a.datetime.slice(0,7);
      map[m] = (map[m]||0)+1;
    });
    return Object.entries(map).sort().slice(-6).map(([k,v])=>({ mes:k.slice(5), turnos:v }));
  },[appointments]);

  const pieData = useMemo(()=>{
    const grp = {};
    appointments.forEach(a=>{ grp[a.status]=(grp[a.status]||0)+1; });
    return Object.entries(grp).map(([k,v])=>({ name:statusConfig[k]?.label||k, value:v }));
  },[appointments]);

  const PIE_COLORS = ["#f59e0b","#10b981","#ef4444"];

  const getPatient = id => patients.find(p=>p.id===id);
  const getSpecialist = id => users.find(u=>u.id===id);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-500 text-sm">Bienvenido/a, {user.name}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {user.role==="admin" ? <>
          <Stat label="Total pacientes" value={patients.length} icon={Users} color="teal"/>
          <Stat label="Turnos hoy" value={todayAppts.length} icon={Calendar} color="blue"/>
          <Stat label="Especialistas" value={specialists.length} icon={Stethoscope} color="purple"/>
          <Stat label="Sol. pendientes" value={pendReq.length} icon={Bell} color="amber"/>
        </> : <>
          <Stat label="Mis turnos hoy" value={myAppts.length} icon={Calendar} color="teal"/>
          <Stat label="Pendientes" value={myAppts.filter(a=>a.status==="pending").length} icon={Clock} color="amber"/>
          <Stat label="Completados" value={myAppts.filter(a=>a.status==="completed").length} icon={CheckCircle} color="green"/>
          <Stat label="Stock bajo" value={lowStock.length} icon={Package} color="red"/>
        </>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {user.role==="admin" && (
          <Card className="p-5 lg:col-span-2">
            <h3 className="font-semibold text-gray-900 mb-4">Turnos por mes</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
                <XAxis dataKey="mes" tick={{fontSize:12}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fontSize:12}} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{borderRadius:"12px",border:"none",boxShadow:"0 4px 20px rgba(0,0,0,0.1)"}}/>
                <Bar dataKey="turnos" fill="#0d9488" radius={[6,6,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}
        <Card className="p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Estado de turnos</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value" label={({name,value})=>`${name}: ${value}`} labelLine={false}>
                {pieData.map((_,i)=><Cell key={i} fill={PIE_COLORS[i%PIE_COLORS.length]}/>)}
              </Pie>
              <Tooltip contentStyle={{borderRadius:"12px",border:"none",boxShadow:"0 4px 20px rgba(0,0,0,0.1)"}}/>
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <h3 className="font-semibold text-gray-900 mb-4">{user.role==="admin"?"Turnos de hoy":"Mis turnos de hoy"}</h3>
          {myAppts.length===0 ? <p className="text-gray-400 text-sm py-4 text-center">No hay turnos para hoy</p> : (
            <div className="space-y-3">
              {myAppts.map(a=>{
                const p = getPatient(a.patientId); const sp = getSpecialist(a.specialistId);
                return (
                  <div key={a.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="text-teal-600 font-semibold text-sm w-14 shrink-0">{a.datetime.slice(11,16)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">{p?.name}</p>
                      <p className="text-xs text-gray-500 truncate">{sp?.name} · {a.reason}</p>
                    </div>
                    <StatusBadge status={a.status}/>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <div className="space-y-4">
          {lowStock.length>0 && (
            <Card className="p-5 border-amber-200 bg-amber-50">
              <h3 className="font-semibold text-amber-800 mb-3 flex items-center gap-2"><AlertCircle size={16}/>Stock bajo</h3>
              <div className="space-y-2">
                {lowStock.map(i=>(
                  <div key={i.id} className="flex justify-between text-sm">
                    <span className="text-amber-700">{i.name}</span>
                    <span className="font-medium text-amber-800">{i.stock}/{i.minStock} {i.unit}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
          {user.role==="admin" && pendReq.length>0 && (
            <Card className="p-5 border-blue-200 bg-blue-50">
              <h3 className="font-semibold text-blue-800 mb-3 flex items-center gap-2"><Bell size={16}/>Solicitudes pendientes</h3>
              <div className="space-y-2">
                {pendReq.map(r=>{
                  const sp=getSpecialist(r.specialistId);
                  return <div key={r.id} className="text-sm text-blue-700"><span className="font-medium">{sp?.name}</span> — {r.items.length} ítem(s)</div>;
                })}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── PACIENTES ─────────────────────────────────────────────────────────────
const PatientsView = ({ patients, setPatients, users, appointments, records, setRecords }) => {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [recForm, setRecForm] = useState({ specialistId:"", description:"", treatment:"", observations:"", date:todayStr });
  const [activeTab, setActiveTab] = useState("historia");

  const specialists = users.filter(u=>u.role==="specialist");
  const filtered = patients.filter(p=>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.dni.includes(search) || p.email.toLowerCase().includes(search.toLowerCase())
  );

  const openNew = () => { setForm({ name:"",dni:"",phone:"",email:"",birth:"",coverage:"Particular",address:"",notes:"" }); setModal("new"); };
  const openEdit = (p) => { setForm({...p}); setModal("edit"); };
  const save = () => {
    if (!form.name||!form.dni) return;
    if (modal==="new") { setPatients(ps=>[...ps,{...form,id:Date.now()}]); }
    else { setPatients(ps=>ps.map(p=>p.id===form.id?form:p)); }
    setModal(null);
  };
  const del = (id) => { setPatients(ps=>ps.filter(p=>p.id!==id)); if(selected?.id===id) setSelected(null); };
  const saveRec = () => {
    if (!recForm.description||!recForm.specialistId) return;
    setRecords(rs=>[...rs,{...recForm,id:Date.now(),patientId:selected.id,specialistId:+recForm.specialistId,date:recForm.date+"T12:00"}]);
    setRecForm({ specialistId:"",description:"",treatment:"",observations:"",date:todayStr });
  };

  const patRecs = selected ? records.filter(r=>r.patientId===selected.id).sort((a,b)=>b.date.localeCompare(a.date)) : [];
  const patAppts = selected ? appointments.filter(a=>a.patientId===selected.id).sort((a,b)=>b.datetime.localeCompare(a.datetime)) : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold text-gray-900">Pacientes</h2><p className="text-gray-500 text-sm">{patients.length} pacientes registrados</p></div>
        <Btn onClick={openNew}><Plus size={16}/>Nuevo paciente</Btn>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 space-y-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar por nombre, DNI o email..."
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"/>
          </div>
          <div className="space-y-2 max-h-[60vh] overflow-y-auto">
            {filtered.map(p=>(
              <button key={p.id} onClick={()=>{setSelected(p);setActiveTab("historia");}}
                className={`w-full text-left p-4 rounded-xl border transition-all ${selected?.id===p.id?"border-teal-500 bg-teal-50":"border-gray-200 bg-white hover:border-gray-300"}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{p.name}</p>
                    <p className="text-xs text-gray-500">DNI {p.dni} · {p.phone}</p>
                  </div>
                  <Badge color={COVERAGES[p.coverage]==="prepaga"?"blue":COVERAGES[p.coverage]==="obra_social"?"purple":"gray"}>{p.coverage}</Badge>
                </div>
              </button>
            ))}
            {filtered.length===0 && <p className="text-center text-gray-400 py-8 text-sm">No se encontraron pacientes</p>}
          </div>
        </div>

        <div className="lg:col-span-3">
          {selected ? (
            <Card className="overflow-hidden">
              <div className="p-5 bg-gradient-to-r from-teal-600 to-teal-700 text-white">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold">{selected.name}</h3>
                    <p className="text-teal-100 text-sm">DNI {selected.dni} · {selected.phone}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={()=>openEdit(selected)} className="p-1.5 bg-white/20 rounded-lg hover:bg-white/30"><Edit size={15}/></button>
                    <button onClick={()=>del(selected.id)} className="p-1.5 bg-white/20 rounded-lg hover:bg-white/30"><Trash2 size={15}/></button>
                  </div>
                </div>
                <div className="flex gap-3 mt-3">
                  <Badge color="gray">{selected.coverage}</Badge>
                  <Badge color="gray">{COVERAGE_TYPE[COVERAGES[selected.coverage]]}</Badge>
                </div>
              </div>
              <div className="flex border-b border-gray-100">
                {["historia","turnos"].map(t=>(
                  <button key={t} onClick={()=>setActiveTab(t)}
                    className={`px-5 py-3 text-sm font-medium capitalize transition-colors ${activeTab===t?"border-b-2 border-teal-600 text-teal-600":"text-gray-500 hover:text-gray-700"}`}>
                    {t==="historia"?"Historia Clínica":"Turnos"}
                  </button>
                ))}
              </div>
              <div className="p-5 max-h-[45vh] overflow-y-auto">
                {activeTab==="historia" && (
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                      <h4 className="font-medium text-gray-700 text-sm">Agregar registro</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <Sel label="Especialista" value={recForm.specialistId} onChange={v=>setRecForm(f=>({...f,specialistId:v}))}
                          options={specialists.map(s=>({value:s.id,label:s.name}))} required/>
                        <Inp label="Fecha" value={recForm.date} onChange={v=>setRecForm(f=>({...f,date:v}))} type="date"/>
                      </div>
                      <Inp label="Descripción" value={recForm.description} onChange={v=>setRecForm(f=>({...f,description:v}))} required/>
                      <Inp label="Tratamiento" value={recForm.treatment} onChange={v=>setRecForm(f=>({...f,treatment:v}))}/>
                      <Txt label="Observaciones" value={recForm.observations} onChange={v=>setRecForm(f=>({...f,observations:v}))} rows={2}/>
                      <Btn onClick={saveRec} size="sm"><Save size={14}/>Guardar registro</Btn>
                    </div>
                    {patRecs.length===0 ? <p className="text-gray-400 text-sm text-center py-4">Sin registros clínicos</p> : patRecs.map(r=>{
                      const sp=users.find(u=>u.id===r.specialistId);
                      return (
                        <div key={r.id} className="border border-gray-200 rounded-xl p-4">
                          <div className="flex justify-between text-xs text-gray-500 mb-2">
                            <span className="font-medium text-gray-700">{r.date?.slice(0,10)}</span>
                            <span>{sp?.name}</span>
                          </div>
                          <p className="text-sm font-medium text-gray-900">{r.description}</p>
                          {r.treatment && <p className="text-xs text-gray-600 mt-1"><b>Tratamiento:</b> {r.treatment}</p>}
                          {r.observations && <p className="text-xs text-gray-500 mt-1">{r.observations}</p>}
                        </div>
                      );
                    })}
                  </div>
                )}
                {activeTab==="turnos" && (
                  <div className="space-y-3">
                    {patAppts.length===0 ? <p className="text-gray-400 text-sm text-center py-4">Sin turnos registrados</p> : patAppts.map(a=>{
                      const sp=users.find(u=>u.id===a.specialistId);
                      return (
                        <div key={a.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                          <div className="text-sm text-gray-600 w-32 shrink-0">{a.datetime.slice(0,10)} {a.datetime.slice(11,16)}</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{a.reason}</p>
                            <p className="text-xs text-gray-500">{sp?.name}</p>
                          </div>
                          <StatusBadge status={a.status}/>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </Card>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-400">
              <div className="text-center"><Users size={48} className="mx-auto mb-3 opacity-30"/><p>Seleccioná un paciente</p></div>
            </div>
          )}
        </div>
      </div>

      {modal && (
        <Modal title={modal==="new"?"Nuevo paciente":"Editar paciente"} onClose={()=>setModal(null)} size="lg">
          <div className="grid grid-cols-2 gap-4">
            <Inp label="Nombre completo" value={form.name||""} onChange={v=>setForm(f=>({...f,name:v}))} required className="col-span-2"/>
            <Inp label="DNI" value={form.dni||""} onChange={v=>setForm(f=>({...f,dni:v}))} required/>
            <Inp label="Teléfono" value={form.phone||""} onChange={v=>setForm(f=>({...f,phone:v}))}/>
            <Inp label="Email" value={form.email||""} onChange={v=>setForm(f=>({...f,email:v}))} type="email" className="col-span-2"/>
            <Inp label="Fecha de nacimiento" value={form.birth||""} onChange={v=>setForm(f=>({...f,birth:v}))} type="date"/>
            <Sel label="Cobertura" value={form.coverage||""} onChange={v=>setForm(f=>({...f,coverage:v}))} options={Object.keys(COVERAGES)}/>
            <Inp label="Dirección" value={form.address||""} onChange={v=>setForm(f=>({...f,address:v}))} className="col-span-2"/>
            <Txt label="Notas/Alergias" value={form.notes||""} onChange={v=>setForm(f=>({...f,notes:v}))} rows={2} className="col-span-2"/>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Btn onClick={()=>setModal(null)} variant="secondary">Cancelar</Btn>
            <Btn onClick={save}><Save size={15}/>Guardar</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ─── CALENDARIO ────────────────────────────────────────────────────────────
const CalendarView = ({ user, users, patients, appointments, setAppointments }) => {
  const [curDate, setCurDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDay, setSelectedDay] = useState(todayStr);
  const [filter, setFilter] = useState("all");
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ patientId:"", specialistId:user.role==="specialist"?String(user.id):"", datetime:"", reason:"", notes:"" });

  const specialists = users.filter(u=>u.role==="specialist");
  const year = curDate.getFullYear(), month = curDate.getMonth();
  const days = daysInMonth(year, month), firstD = firstDay(year, month);

  const getDay = (y,m,d) => `${y}-${pad(m+1)}-${pad(d)}`;

  const dayAppts = (ds) => {
    let appts = appointments.filter(a=>a.datetime.startsWith(ds));
    if (user.role==="specialist") appts = appts.filter(a=>a.specialistId===user.id);
    if (filter!=="all") appts = appts.filter(a=>a.status===filter);
    return appts;
  };

  const selectedAppts = dayAppts(selectedDay).sort((a,b)=>a.datetime.localeCompare(b.datetime));

  const saveAppt = () => {
    if (!form.patientId||!form.datetime||!form.reason) return;
    setAppointments(as=>[...as,{...form,id:Date.now(),patientId:+form.patientId,specialistId:+form.specialistId,status:"pending"}]);
    setModal(false);
  };

  const changeStatus = (id, status) => setAppointments(as=>as.map(a=>a.id===id?{...a,status}:a));

  const FILTERS = [["all","Todos"],["pending","Pendiente"],["completed","Completada"],["cancelled","Cancelada"]];
  const DOT_COLORS = { pending:"bg-amber-400", completed:"bg-green-400", cancelled:"bg-red-400" };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold text-gray-900">{user.role==="specialist"?"Mi Agenda":"Calendario"}</h2></div>
        <Btn onClick={()=>{ setForm({ patientId:"",specialistId:user.role==="specialist"?String(user.id):"",datetime:selectedDay+"T09:00",reason:"",notes:"" }); setModal(true); }}>
          <Plus size={16}/>Nuevo turno
        </Btn>
      </div>

      <div className="flex gap-2 flex-wrap">
        {FILTERS.map(([v,l])=>(
          <button key={v} onClick={()=>setFilter(v)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter===v?"bg-teal-600 text-white":"bg-white border border-gray-300 text-gray-600 hover:bg-gray-50"}`}>
            {l}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <button onClick={()=>setCurDate(new Date(year,month-1,1))} className="p-1.5 rounded-lg hover:bg-gray-100"><ChevronLeft size={18}/></button>
              <h3 className="font-semibold text-gray-900 capitalize">
                {curDate.toLocaleDateString("es-AR",{month:"long",year:"numeric"})}
              </h3>
              <button onClick={()=>setCurDate(new Date(year,month+1,1))} className="p-1.5 rounded-lg hover:bg-gray-100"><ChevronRight size={18}/></button>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {["Do","Lu","Ma","Mi","Ju","Vi","Sa"].map(d=>(
                <div key={d} className="text-center text-xs font-medium text-gray-500 py-1">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array(firstD).fill(null).map((_,i)=><div key={`e${i}`}/>)}
              {Array(days).fill(null).map((_,i)=>{
                const ds = getDay(year,month,i+1);
                const appts = dayAppts(ds);
                const isToday = ds===todayStr;
                const isSelected = ds===selectedDay;
                const statuses = [...new Set(appts.map(a=>a.status))];
                return (
                  <button key={i} onClick={()=>setSelectedDay(ds)}
                    className={`relative p-2 rounded-xl text-center text-sm transition-all ${isSelected?"bg-teal-600 text-white":isToday?"bg-teal-50 text-teal-700 font-semibold":"text-gray-700 hover:bg-gray-100"}`}>
                    {i+1}
                    {appts.length>0 && (
                      <div className="flex justify-center gap-0.5 mt-0.5">
                        {statuses.slice(0,3).map(s=>(
                          <span key={s} className={`w-1.5 h-1.5 rounded-full ${isSelected?"bg-white":DOT_COLORS[s]}`}/>
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </Card>
        </div>

        <div>
          <Card className="p-4">
            <h3 className="font-semibold text-gray-900 mb-3">
              {new Date(selectedDay+"T12:00").toLocaleDateString("es-AR",{weekday:"long",day:"numeric",month:"long"})}
            </h3>
            {selectedAppts.length===0 ? (
              <div className="text-center py-8 text-gray-400"><Calendar size={32} className="mx-auto mb-2 opacity-30"/><p className="text-sm">Sin turnos</p></div>
            ) : (
              <div className="space-y-3 max-h-[50vh] overflow-y-auto">
                {selectedAppts.map(a=>{
                  const p=patients.find(x=>x.id===a.patientId);
                  const sp=users.find(u=>u.id===a.specialistId);
                  return (
                    <div key={a.id} className="border border-gray-200 rounded-xl p-3">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-teal-600 font-semibold text-sm">{a.datetime.slice(11,16)}</span>
                        <StatusBadge status={a.status}/>
                      </div>
                      <p className="font-medium text-gray-900 text-sm">{p?.name}</p>
                      <p className="text-xs text-gray-500">{sp?.name} · {a.reason}</p>
                      {a.notes && <p className="text-xs text-gray-400 mt-1 italic">{a.notes}</p>}
                      {a.status==="pending" && (
                        <div className="flex gap-2 mt-3">
                          <button onClick={()=>changeStatus(a.id,"completed")}
                            className="flex-1 bg-green-50 text-green-700 text-xs py-1.5 rounded-lg hover:bg-green-100 font-medium">Completar</button>
                          <button onClick={()=>changeStatus(a.id,"cancelled")}
                            className="flex-1 bg-red-50 text-red-700 text-xs py-1.5 rounded-lg hover:bg-red-100 font-medium">Cancelar</button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>

      {modal && (
        <Modal title="Nuevo turno" onClose={()=>setModal(false)}>
          <div className="space-y-4">
            <Sel label="Paciente" value={form.patientId} onChange={v=>setForm(f=>({...f,patientId:v}))}
              options={patients.map(p=>({value:p.id,label:p.name}))} required/>
            {user.role==="admin" && (
              <Sel label="Especialista" value={form.specialistId} onChange={v=>setForm(f=>({...f,specialistId:v}))}
                options={specialists.map(s=>({value:s.id,label:s.name}))} required/>
            )}
            <Inp label="Fecha y hora" value={form.datetime} onChange={v=>setForm(f=>({...f,datetime:v}))} type="datetime-local" required/>
            <Inp label="Motivo" value={form.reason} onChange={v=>setForm(f=>({...f,reason:v}))} required/>
            <Txt label="Notas" value={form.notes} onChange={v=>setForm(f=>({...f,notes:v}))} rows={2}/>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Btn onClick={()=>setModal(false)} variant="secondary">Cancelar</Btn>
            <Btn onClick={saveAppt}><Save size={15}/>Guardar</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ─── INVENTARIO ─────────────────────────────────────────────────────────────
const InventoryView = ({ inventory, setInventory, users, movements, setMovements }) => {
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [movForm, setMovForm] = useState({ itemId:"", type:"out", qty:1, specialistId:"", reason:"" });
  const [search, setSearch] = useState("");

  const specialists = users.filter(u=>u.role==="specialist");
  const filtered = inventory.filter(i=>!search||i.name.toLowerCase().includes(search.toLowerCase()));

  const openNew = () => { setForm({ name:"",category:"",unit:"",stock:0,minStock:0,price:0,supplier:"" }); setModal("new"); };
  const openEdit = (i) => { setForm({...i}); setModal("edit"); };
  const save = () => {
    if (!form.name) return;
    const item = { ...form, stock:+form.stock, minStock:+form.minStock, price:+form.price };
    if (modal==="new") setInventory(iv=>[...iv,{...item,id:Date.now()}]);
    else setInventory(iv=>iv.map(i=>i.id===item.id?item:i));
    setModal(null);
  };
  const del = (id) => { setInventory(iv=>iv.filter(i=>i.id!==id)); };

  const saveMovement = () => {
    if (!movForm.itemId||!movForm.reason) return;
    const qty=+movForm.qty;
    setInventory(iv=>iv.map(i=>i.id===+movForm.itemId?{...i,stock:movForm.type==="in"?i.stock+qty:Math.max(0,i.stock-qty)}:i));
    setMovements(ms=>[...ms,{...movForm,id:Date.now(),qty,itemId:+movForm.itemId,specialistId:+movForm.specialistId,date:new Date().toISOString()}]);
    setMovForm({ itemId:"",type:"out",qty:1,specialistId:"",reason:"" });
    setModal(null);
  };

  const recentMovements = [...movements].sort((a,b)=>b.date?.localeCompare(a.date)).slice(0,8);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold text-gray-900">Inventario</h2><p className="text-gray-500 text-sm">{inventory.filter(i=>i.stock<=i.minStock).length} items con stock bajo</p></div>
        <div className="flex gap-2">
          <Btn onClick={()=>setModal("movement")} variant="secondary"><ShoppingCart size={16}/>Movimiento</Btn>
          <Btn onClick={openNew}><Plus size={16}/>Nuevo material</Btn>
        </div>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar material..."
          className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-teal-500"/>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-gray-200">
            {["Material","Categoría","Unidad","Stock","Stock mín.","Precio","Proveedor",""].map(h=>(
              <th key={h} className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wide">{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {filtered.map(i=>(
              <tr key={i.id} className={`border-b border-gray-100 hover:bg-gray-50 ${i.stock<=i.minStock?"bg-amber-50":""}`}>
                <td className="py-3 px-4 font-medium text-gray-900">{i.name}</td>
                <td className="py-3 px-4 text-gray-600">{i.category}</td>
                <td className="py-3 px-4 text-gray-600">{i.unit}</td>
                <td className="py-3 px-4">
                  <span className={`font-semibold ${i.stock<=i.minStock?"text-red-600":"text-gray-900"}`}>{i.stock}</span>
                  {i.stock<=i.minStock && <AlertCircle size={13} className="inline ml-1 text-red-500"/>}
                </td>
                <td className="py-3 px-4 text-gray-600">{i.minStock}</td>
                <td className="py-3 px-4 text-gray-600">{fmt(i.price)}</td>
                <td className="py-3 px-4 text-gray-600">{i.supplier}</td>
                <td className="py-3 px-4">
                  <div className="flex gap-1">
                    <button onClick={()=>openEdit(i)} className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg"><Edit size={15}/></button>
                    <button onClick={()=>del(i.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={15}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Últimos movimientos</h3>
        <div className="space-y-2">
          {recentMovements.length===0 ? <p className="text-gray-400 text-sm">Sin movimientos</p> : recentMovements.map(m=>{
            const item=inventory.find(i=>i.id===m.itemId);
            const sp=users.find(u=>u.id===m.specialistId);
            return (
              <div key={m.id} className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl text-sm">
                <span className={`w-2 h-2 rounded-full ${m.type==="in"?"bg-green-500":"bg-red-500"}`}/>
                <span className="font-medium text-gray-900 flex-1">{item?.name}</span>
                <span className={`font-semibold ${m.type==="in"?"text-green-600":"text-red-600"}`}>{m.type==="in"?"+":"-"}{m.qty}</span>
                <span className="text-gray-500">{sp?.name||"—"}</span>
                <span className="text-gray-400">{m.reason}</span>
                <span className="text-gray-400 text-xs">{m.date?.slice(0,10)}</span>
              </div>
            );
          })}
        </div>
      </div>

      {(modal==="new"||modal==="edit") && (
        <Modal title={modal==="new"?"Nuevo material":"Editar material"} onClose={()=>setModal(null)}>
          <div className="grid grid-cols-2 gap-4">
            <Inp label="Nombre" value={form.name||""} onChange={v=>setForm(f=>({...f,name:v}))} required className="col-span-2"/>
            <Inp label="Categoría" value={form.category||""} onChange={v=>setForm(f=>({...f,category:v}))}/>
            <Inp label="Unidad" value={form.unit||""} onChange={v=>setForm(f=>({...f,unit:v}))}/>
            <Inp label="Stock actual" value={form.stock||0} onChange={v=>setForm(f=>({...f,stock:v}))} type="number"/>
            <Inp label="Stock mínimo" value={form.minStock||0} onChange={v=>setForm(f=>({...f,minStock:v}))} type="number"/>
            <Inp label="Precio" value={form.price||0} onChange={v=>setForm(f=>({...f,price:v}))} type="number"/>
            <Inp label="Proveedor" value={form.supplier||""} onChange={v=>setForm(f=>({...f,supplier:v}))}/>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Btn onClick={()=>setModal(null)} variant="secondary">Cancelar</Btn>
            <Btn onClick={save}><Save size={15}/>Guardar</Btn>
          </div>
        </Modal>
      )}

      {modal==="movement" && (
        <Modal title="Registrar movimiento" onClose={()=>setModal(null)}>
          <div className="space-y-4">
            <Sel label="Material" value={movForm.itemId} onChange={v=>setMovForm(f=>({...f,itemId:v}))}
              options={inventory.map(i=>({value:i.id,label:`${i.name} (${i.stock} ${i.unit})`}))} required/>
            <Sel label="Tipo" value={movForm.type} onChange={v=>setMovForm(f=>({...f,type:v}))}
              options={[{value:"in",label:"Entrada"},{value:"out",label:"Salida"}]}/>
            <Inp label="Cantidad" value={movForm.qty} onChange={v=>setMovForm(f=>({...f,qty:v}))} type="number"/>
            <Sel label="Especialista" value={movForm.specialistId} onChange={v=>setMovForm(f=>({...f,specialistId:v}))}
              options={specialists.map(s=>({value:s.id,label:s.name}))}/>
            <Inp label="Motivo" value={movForm.reason} onChange={v=>setMovForm(f=>({...f,reason:v}))} required/>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Btn onClick={()=>setModal(null)} variant="secondary">Cancelar</Btn>
            <Btn onClick={saveMovement}><Save size={15}/>Guardar</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ─── ESPECIALISTAS ─────────────────────────────────────────────────────────
const SpecialistsView = ({ users, setUsers }) => {
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});

  const specialists = users.filter(u=>u.role==="specialist");
  const openNew = () => { setForm({ name:"",email:"",password:"",specialty:"",license:"",salary:0,active:true,role:"specialist" }); setModal("new"); };
  const openEdit = (u) => { setForm({...u}); setModal("edit"); };
  const save = () => {
    if (!form.name||!form.email) return;
    const u = { ...form, salary:+form.salary };
    if (modal==="new") setUsers(us=>[...us,{...u,id:Date.now()}]);
    else setUsers(us=>us.map(x=>x.id===u.id?u:x));
    setModal(null);
  };
  const del = (id) => { setUsers(us=>us.filter(u=>u.id!==id)); };
  const toggle = (id) => setUsers(us=>us.map(u=>u.id===id?{...u,active:!u.active}:u));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold text-gray-900">Especialistas</h2><p className="text-gray-500 text-sm">{specialists.filter(u=>u.active).length} activos</p></div>
        <Btn onClick={openNew}><Plus size={16}/>Nuevo especialista</Btn>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {specialists.map(u=>(
          <Card key={u.id} className={`p-5 ${!u.active?"opacity-60":""}`}>
            <div className="flex justify-between items-start mb-3">
              <div className="bg-teal-100 p-2.5 rounded-xl"><Stethoscope size={20} className="text-teal-600"/></div>
              <div className="flex gap-1">
                <button onClick={()=>toggle(u.id)} className={`px-2.5 py-1 rounded-lg text-xs font-medium ${u.active?"bg-green-50 text-green-700 hover:bg-green-100":"bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                  {u.active?"Activo":"Inactivo"}
                </button>
                <button onClick={()=>openEdit(u)} className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg"><Edit size={15}/></button>
                <button onClick={()=>del(u.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={15}/></button>
              </div>
            </div>
            <h3 className="font-bold text-gray-900">{u.name}</h3>
            <p className="text-teal-600 text-sm font-medium">{u.specialty}</p>
            <p className="text-gray-500 text-xs mt-1">{u.license}</p>
            <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between text-sm">
              <span className="text-gray-500">{u.email}</span>
              <span className="font-semibold text-gray-900">{fmt(u.salary)}</span>
            </div>
          </Card>
        ))}
      </div>

      {modal && (
        <Modal title={modal==="new"?"Nuevo especialista":"Editar especialista"} onClose={()=>setModal(null)}>
          <div className="grid grid-cols-2 gap-4">
            <Inp label="Nombre completo" value={form.name||""} onChange={v=>setForm(f=>({...f,name:v}))} required className="col-span-2"/>
            <Inp label="Email" value={form.email||""} onChange={v=>setForm(f=>({...f,email:v}))} type="email" required className="col-span-2"/>
            <Inp label="Contraseña" value={form.password||""} onChange={v=>setForm(f=>({...f,password:v}))} required/>
            <Sel label="Especialidad" value={form.specialty||""} onChange={v=>setForm(f=>({...f,specialty:v}))} options={SPECIALTIES} required/>
            <Inp label="Matrícula" value={form.license||""} onChange={v=>setForm(f=>({...f,license:v}))}/>
            <Inp label="Sueldo bruto" value={form.salary||0} onChange={v=>setForm(f=>({...f,salary:v}))} type="number"/>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Btn onClick={()=>setModal(null)} variant="secondary">Cancelar</Btn>
            <Btn onClick={save}><Save size={15}/>Guardar</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ─── PAGOS ─────────────────────────────────────────────────────────────────
const PaymentsView = ({ users, payments, setPayments }) => {
  const [tab, setTab] = useState("salaries");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});

  const specialists = users.filter(u=>u.role==="specialist");
  const CONTRIB = 0.17; // 11% jubilación + 3% PAMI + 3% obra social

  const markSalaryPaid = (id) => setPayments(p=>({ ...p, salaries:p.salaries.map(s=>s.id===id?{...s,paid:true,paidDate:todayStr}:s) }));
  const markSupplierPaid = (id) => setPayments(p=>({ ...p, suppliers:p.suppliers.map(s=>s.id===id?{...s,status:"paid",paidDate:todayStr}:s) }));

  const addSupplier = () => {
    if (!form.supplier||!form.amount) return;
    setPayments(p=>({ ...p, suppliers:[...p.suppliers,{...form,id:Date.now(),amount:+form.amount,status:"pending",date:todayStr}] }));
    setModal(null);
  };

  const pendSalaries = payments.salaries.filter(s=>!s.paid).reduce((acc,s)=>acc+s.gross*(1-CONTRIB),0);
  const pendSuppliers = payments.suppliers.filter(s=>s.status==="pending").reduce((acc,s)=>acc+s.amount,0);
  const totalPaid = payments.salaries.filter(s=>s.paid).reduce((acc,s)=>acc+s.gross*(1-CONTRIB),0)
    + payments.suppliers.filter(s=>s.status==="paid").reduce((acc,s)=>acc+s.amount,0);

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold text-gray-900">Pagos</h2></div>

      <div className="grid grid-cols-3 gap-4">
        <Stat label="Sueldos pendientes" value={fmt(pendSalaries)} icon={DollarSign} color="amber"/>
        <Stat label="Proveedores pendientes" value={fmt(pendSuppliers)} icon={CreditCard} color="red"/>
        <Stat label="Total pagado" value={fmt(totalPaid)} icon={CheckCircle} color="green"/>
      </div>

      <div className="flex border-b border-gray-200 gap-6">
        {[["salaries","Sueldos"],["suppliers","Proveedores"]].map(([v,l])=>(
          <button key={v} onClick={()=>setTab(v)}
            className={`pb-3 text-sm font-medium transition-colors ${tab===v?"border-b-2 border-teal-600 text-teal-600":"text-gray-500 hover:text-gray-700"}`}>{l}</button>
        ))}
      </div>

      {tab==="salaries" && (
        <div className="space-y-4">
          {payments.salaries.map(s=>{
            const u=users.find(x=>x.id===s.userId);
            const aportes = s.gross*CONTRIB;
            const neto = s.gross - aportes;
            return (
              <Card key={s.id} className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-bold text-gray-900">{u?.name}</p>
                    <p className="text-sm text-gray-500">{u?.specialty} · {s.month}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {s.paid ? <Badge color="green"><CheckCircle size={11} className="mr-1"/>Pagado {s.paidDate}</Badge>
                      : <Btn onClick={()=>markSalaryPaid(s.id)} size="sm" variant="success"><CheckCircle size={14}/>Marcar pagado</Btn>}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 bg-gray-50 rounded-xl p-4 text-sm">
                  <div><p className="text-gray-500 text-xs">Bruto</p><p className="font-semibold text-gray-900">{fmt(s.gross)}</p></div>
                  <div>
                    <p className="text-gray-500 text-xs">Aportes (17%)</p>
                    <p className="font-semibold text-red-600">-{fmt(aportes)}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Jub. 11% + PAMI 3% + OS 3%</p>
                  </div>
                  <div><p className="text-gray-500 text-xs">Neto a pagar</p><p className="font-semibold text-green-600 text-base">{fmt(neto)}</p></div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {tab==="suppliers" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Btn onClick={()=>{ setForm({ supplier:"",invoice:"",concept:"",amount:0 }); setModal("supplier"); }}><Plus size={16}/>Nuevo pago</Btn>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-200">
                {["Proveedor","Factura","Concepto","Monto","Fecha","Estado",""].map(h=>(
                  <th key={h} className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {payments.suppliers.map(s=>(
                  <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{s.supplier}</td>
                    <td className="py-3 px-4 text-gray-500">{s.invoice}</td>
                    <td className="py-3 px-4 text-gray-600">{s.concept}</td>
                    <td className="py-3 px-4 font-semibold">{fmt(s.amount)}</td>
                    <td className="py-3 px-4 text-gray-500">{s.date}</td>
                    <td className="py-3 px-4"><StatusBadge status={s.status}/></td>
                    <td className="py-3 px-4">
                      {s.status==="pending" && <Btn onClick={()=>markSupplierPaid(s.id)} size="sm" variant="success"><CheckCircle size={13}/>Pagar</Btn>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modal==="supplier" && (
        <Modal title="Nuevo pago a proveedor" onClose={()=>setModal(null)}>
          <div className="space-y-4">
            <Inp label="Proveedor" value={form.supplier||""} onChange={v=>setForm(f=>({...f,supplier:v}))} required/>
            <Inp label="N° Factura" value={form.invoice||""} onChange={v=>setForm(f=>({...f,invoice:v}))}/>
            <Inp label="Concepto" value={form.concept||""} onChange={v=>setForm(f=>({...f,concept:v}))} required/>
            <Inp label="Monto" value={form.amount||0} onChange={v=>setForm(f=>({...f,amount:v}))} type="number" required/>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Btn onClick={()=>setModal(null)} variant="secondary">Cancelar</Btn>
            <Btn onClick={addSupplier}><Save size={15}/>Guardar</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ─── SOLICITUDES ───────────────────────────────────────────────────────────
const RequestsView = ({ user, users, requests, setRequests, inventory }) => {
  const [modal, setModal] = useState(false);
  const [items, setItems] = useState([{ name:"", qty:1, reason:"" }]);
  const [notes, setNotes] = useState("");

  const myRequests = user.role==="specialist" ? requests.filter(r=>r.specialistId===user.id) : requests;
  const sorted = [...myRequests].sort((a,b)=>b.date.localeCompare(a.date));

  const addItem = () => setItems(it=>[...it,{ name:"",qty:1,reason:"" }]);
  const updateItem = (i,k,v) => setItems(its=>its.map((x,j)=>j===i?{...x,[k]:v}:x));
  const removeItem = (i) => setItems(its=>its.filter((_,j)=>j!==i));

  const submit = () => {
    if (!items[0].name) return;
    setRequests(rs=>[...rs,{ id:Date.now(), specialistId:user.id, date:new Date().toISOString(), items:[...items], notes, status:"pending" }]);
    setItems([{ name:"",qty:1,reason:"" }]); setNotes(""); setModal(false);
  };

  const updateStatus = (id, status) => setRequests(rs=>rs.map(r=>r.id===id?{...r,status}:r));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Solicitudes de materiales</h2>
          <p className="text-gray-500 text-sm">{requests.filter(r=>r.status==="pending").length} pendientes</p>
        </div>
        {user.role==="specialist" && <Btn onClick={()=>setModal(true)}><Plus size={16}/>Nueva solicitud</Btn>}
      </div>

      <div className="space-y-4">
        {sorted.length===0 ? (
          <div className="text-center py-16 text-gray-400"><Bell size={48} className="mx-auto mb-3 opacity-30"/><p>Sin solicitudes</p></div>
        ) : sorted.map(r=>{
          const sp=users.find(u=>u.id===r.specialistId);
          return (
            <Card key={r.id} className="p-5">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-bold text-gray-900">{sp?.name}</p>
                  <p className="text-xs text-gray-500">{r.date?.slice(0,10)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={r.status}/>
                  {user.role==="admin" && r.status==="pending" && (
                    <>
                      <Btn onClick={()=>updateStatus(r.id,"approved")} size="sm" variant="success"><CheckCircle size={13}/>Aprobar</Btn>
                      <Btn onClick={()=>updateStatus(r.id,"rejected")} size="sm" variant="danger"><XCircle size={13}/>Rechazar</Btn>
                    </>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                {r.items.map((it,i)=>(
                  <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2 text-sm">
                    <span className="font-medium text-gray-900">{it.name}</span>
                    <span className="text-gray-500">×{it.qty}</span>
                    {it.reason && <span className="text-gray-400 italic">{it.reason}</span>}
                  </div>
                ))}
              </div>
              {r.notes && <p className="text-sm text-gray-600 mt-3 italic">"{r.notes}"</p>}
            </Card>
          );
        })}
      </div>

      {modal && (
        <Modal title="Nueva solicitud de materiales" onClose={()=>setModal(false)} size="lg">
          <div className="space-y-4">
            {items.map((it,i)=>(
              <div key={i} className="grid grid-cols-12 gap-3 items-end">
                <div className="col-span-5"><Inp label={i===0?"Material":""} value={it.name} onChange={v=>updateItem(i,"name",v)} placeholder="Nombre del material" required/></div>
                <div className="col-span-2"><Inp label={i===0?"Cant.":""} value={it.qty} onChange={v=>updateItem(i,"qty",v)} type="number"/></div>
                <div className="col-span-4"><Inp label={i===0?"Motivo":""} value={it.reason} onChange={v=>updateItem(i,"reason",v)} placeholder="Opcional"/></div>
                <div className="col-span-1 pb-0.5">
                  {items.length>1 && <button onClick={()=>removeItem(i)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg"><X size={15}/></button>}
                </div>
              </div>
            ))}
            <Btn onClick={addItem} variant="secondary" size="sm"><Plus size={14}/>Agregar ítem</Btn>
            <Txt label="Notas adicionales" value={notes} onChange={setNotes} rows={2}/>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Btn onClick={()=>setModal(false)} variant="secondary">Cancelar</Btn>
            <Btn onClick={submit}><Save size={15}/>Enviar solicitud</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ─── MATERIALES (Especialista) ─────────────────────────────────────────────
const MaterialsView = ({ user, inventory, setInventory, movements, setMovements }) => {
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ itemId:"", qty:1, reason:"" });

  const myMovements = movements.filter(m=>m.specialistId===user.id).sort((a,b)=>b.date?.localeCompare(a.date));

  const register = () => {
    if (!form.itemId||!form.reason) return;
    const qty=+form.qty;
    setInventory(iv=>iv.map(i=>i.id===+form.itemId?{...i,stock:Math.max(0,i.stock-qty)}:i));
    setMovements(ms=>[...ms,{...form,id:Date.now(),qty,itemId:+form.itemId,specialistId:user.id,type:"out",date:new Date().toISOString()}]);
    setForm({ itemId:"",qty:1,reason:"" }); setModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold text-gray-900">Materiales</h2><p className="text-gray-500 text-sm">Registrá el uso de materiales en tus consultas</p></div>
        <Btn onClick={()=>setModal(true)}><Plus size={16}/>Registrar uso</Btn>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {inventory.map(i=>(
          <Card key={i.id} className={`p-4 ${i.stock<=i.minStock?"border-amber-300 bg-amber-50":""}`}>
            <p className="font-medium text-gray-900 text-sm">{i.name}</p>
            <p className="text-xs text-gray-500 mb-2">{i.category}</p>
            <p className={`text-xl font-bold ${i.stock<=i.minStock?"text-amber-600":"text-teal-600"}`}>{i.stock}</p>
            <p className="text-xs text-gray-400">{i.unit} disponibles</p>
            {i.stock<=i.minStock && <Badge color="yellow" className="mt-2">Stock bajo</Badge>}
          </Card>
        ))}
      </div>

      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Mis movimientos</h3>
        <div className="space-y-2">
          {myMovements.length===0 ? <p className="text-gray-400 text-sm">Sin movimientos registrados</p> : myMovements.map(m=>{
            const item=inventory.find(i=>i.id===m.itemId);
            return (
              <div key={m.id} className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl text-sm">
                <span className="w-2 h-2 rounded-full bg-red-400 shrink-0"/>
                <span className="font-medium text-gray-900 flex-1">{item?.name||"Material eliminado"}</span>
                <span className="text-red-600 font-semibold">-{m.qty} {item?.unit}</span>
                <span className="text-gray-500">{m.reason}</span>
                <span className="text-gray-400 text-xs">{m.date?.slice(0,10)}</span>
              </div>
            );
          })}
        </div>
      </div>

      {modal && (
        <Modal title="Registrar uso de material" onClose={()=>setModal(false)}>
          <div className="space-y-4">
            <Sel label="Material" value={form.itemId} onChange={v=>setForm(f=>({...f,itemId:v}))}
              options={inventory.filter(i=>i.stock>0).map(i=>({value:i.id,label:`${i.name} (${i.stock} ${i.unit})`}))} required/>
            <Inp label="Cantidad utilizada" value={form.qty} onChange={v=>setForm(f=>({...f,qty:v}))} type="number"/>
            <Inp label="Motivo / Consulta" value={form.reason} onChange={v=>setForm(f=>({...f,reason:v}))} required placeholder="Ej: Extracción molar paciente #123"/>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Btn onClick={()=>setModal(false)} variant="secondary">Cancelar</Btn>
            <Btn onClick={register}><Save size={15}/>Registrar</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ─── REPORTES ──────────────────────────────────────────────────────────────
const ReportsView = ({ users, patients, appointments, payments }) => {
  const specialists = users.filter(u=>u.role==="specialist");
  const CONTRIB = 0.17;

  const apptsBySpec = specialists.map(s=>({
    name: s.name.split(" ").slice(-1)[0],
    turnos: appointments.filter(a=>a.specialistId===s.id).length
  }));

  const patsByCoverage = useMemo(()=>{
    const map = {};
    patients.forEach(p=>{ const t=COVERAGE_TYPE[COVERAGES[p.coverage]]||"Otro"; map[t]=(map[t]||0)+1; });
    return Object.entries(map).map(([n,v])=>({ name:n, value:v }));
  },[patients]);

  const totalSalariesPaid = payments.salaries.filter(s=>s.paid).reduce((a,s)=>a+s.gross*(1-CONTRIB),0);
  const totalSuppliersPaid = payments.suppliers.filter(s=>s.status==="paid").reduce((a,s)=>a+s.amount,0);
  const totalPending = payments.salaries.filter(s=>!s.paid).reduce((a,s)=>a+s.gross*(1-CONTRIB),0)
    + payments.suppliers.filter(s=>s.status==="pending").reduce((a,s)=>a+s.amount,0);

  const COLORS = ["#0d9488","#6366f1","#f59e0b","#ef4444","#8b5cf6"];

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold text-gray-900">Reportes</h2></div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Total pacientes" value={patients.length} icon={Users} color="teal"/>
        <Stat label="Total turnos" value={appointments.length} icon={Calendar} color="blue"/>
        <Stat label="Turnos completados" value={appointments.filter(a=>a.status==="completed").length} icon={CheckCircle} color="green"/>
        <Stat label="Tasa completado" value={`${Math.round(appointments.filter(a=>a.status==="completed").length/appointments.length*100)}%`} icon={TrendingUp} color="purple"/>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Turnos por especialista</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={apptsBySpec} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
              <XAxis type="number" tick={{fontSize:12}} axisLine={false} tickLine={false}/>
              <YAxis type="category" dataKey="name" tick={{fontSize:12}} axisLine={false} tickLine={false} width={60}/>
              <Tooltip contentStyle={{borderRadius:"12px",border:"none",boxShadow:"0 4px 20px rgba(0,0,0,0.1)"}}/>
              <Bar dataKey="turnos" fill="#0d9488" radius={[0,6,6,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Pacientes por cobertura</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={patsByCoverage} cx="50%" cy="50%" outerRadius={85} paddingAngle={4} dataKey="value"
                label={({name,value})=>`${name}: ${value}`} labelLine={false}>
                {patsByCoverage.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
              </Pie>
              <Tooltip contentStyle={{borderRadius:"12px",border:"none",boxShadow:"0 4px 20px rgba(0,0,0,0.1)"}}/>
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card className="p-5">
        <h3 className="font-semibold text-gray-900 mb-4">Resumen financiero</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-green-50 rounded-xl p-4 text-center">
            <p className="text-sm text-green-700">Sueldos pagados</p>
            <p className="text-2xl font-bold text-green-800 mt-1">{fmt(totalSalariesPaid)}</p>
          </div>
          <div className="bg-blue-50 rounded-xl p-4 text-center">
            <p className="text-sm text-blue-700">Proveedores pagados</p>
            <p className="text-2xl font-bold text-blue-800 mt-1">{fmt(totalSuppliersPaid)}</p>
          </div>
          <div className="bg-amber-50 rounded-xl p-4 text-center">
            <p className="text-sm text-amber-700">Total pendiente</p>
            <p className="text-2xl font-bold text-amber-800 mt-1">{fmt(totalPending)}</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

// ─── USUARIOS ──────────────────────────────────────────────────────────────
const UsersView = ({ users, setUsers }) => {
  const [show, setShow] = useState({});
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});

  const openNew = () => { setForm({ name:"",email:"",password:"",role:"specialist",active:true,specialty:"",license:"",salary:0 }); setModal("new"); };
  const openEdit = (u) => { setForm({...u}); setModal("edit"); };
  const save = () => {
    if (!form.name||!form.email||!form.password) return;
    const u = { ...form, salary:+form.salary||0 };
    if (modal==="new") setUsers(us=>[...us,{...u,id:Date.now()}]);
    else setUsers(us=>us.map(x=>x.id===u.id?u:x));
    setModal(null);
  };
  const del = (id) => { setUsers(us=>us.filter(u=>u.id!==id)); };
  const toggle = (id) => setUsers(us=>us.map(u=>u.id===id?{...u,active:!u.active}:u));
  const togglePw = (id) => setShow(s=>({...s,[id]:!s[id]}));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold text-gray-900">Usuarios</h2><p className="text-gray-500 text-sm">{users.length} usuarios registrados</p></div>
        <Btn onClick={openNew}><Plus size={16}/>Nuevo usuario</Btn>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-gray-200">
            {["Nombre","Email","Contraseña","Rol","Especialidad","Estado",""].map(h=>(
              <th key={h} className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {users.map(u=>(
              <tr key={u.id} className={`border-b border-gray-100 hover:bg-gray-50 ${!u.active?"opacity-60":""}`}>
                <td className="py-3 px-4 font-medium text-gray-900">{u.name}</td>
                <td className="py-3 px-4 text-gray-600">{u.email}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                      {show[u.id] ? u.password : "••••••••"}
                    </span>
                    <button onClick={()=>togglePw(u.id)} className="text-gray-400 hover:text-gray-600">
                      {show[u.id]?<EyeOff size={13}/>:<Eye size={13}/>}
                    </button>
                  </div>
                </td>
                <td className="py-3 px-4"><Badge color={u.role==="admin"?"teal":"purple"}>{u.role==="admin"?"Admin":"Especialista"}</Badge></td>
                <td className="py-3 px-4 text-gray-500">{u.specialty||"—"}</td>
                <td className="py-3 px-4">
                  <button onClick={()=>toggle(u.id)}>
                    <Badge color={u.active?"green":"gray"}>{u.active?"Activo":"Inactivo"}</Badge>
                  </button>
                </td>
                <td className="py-3 px-4">
                  <div className="flex gap-1">
                    <button onClick={()=>openEdit(u)} className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg"><Edit size={15}/></button>
                    <button onClick={()=>del(u.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={15}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <Modal title={modal==="new"?"Nuevo usuario":"Editar usuario"} onClose={()=>setModal(null)}>
          <div className="grid grid-cols-2 gap-4">
            <Inp label="Nombre" value={form.name||""} onChange={v=>setForm(f=>({...f,name:v}))} required className="col-span-2"/>
            <Inp label="Email" value={form.email||""} onChange={v=>setForm(f=>({...f,email:v}))} type="email" required className="col-span-2"/>
            <Inp label="Contraseña" value={form.password||""} onChange={v=>setForm(f=>({...f,password:v}))} required/>
            <Sel label="Rol" value={form.role||""} onChange={v=>setForm(f=>({...f,role:v}))} options={[{value:"admin",label:"Admin"},{value:"specialist",label:"Especialista"}]}/>
            {form.role==="specialist" && <>
              <Sel label="Especialidad" value={form.specialty||""} onChange={v=>setForm(f=>({...f,specialty:v}))} options={SPECIALTIES}/>
              <Inp label="Matrícula" value={form.license||""} onChange={v=>setForm(f=>({...f,license:v}))}/>
              <Inp label="Sueldo bruto" value={form.salary||0} onChange={v=>setForm(f=>({...f,salary:v}))} type="number" className="col-span-2"/>
            </>}
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Btn onClick={()=>setModal(null)} variant="secondary">Cancelar</Btn>
            <Btn onClick={save}><Save size={15}/>Guardar</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ─── MAIN APP ──────────────────────────────────────────────────────────────
export default function DentalERP() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [users, setUsers] = useState(INIT_USERS);
  const [patients, setPatients] = useState(INIT_PATIENTS);
  const [appointments, setAppointments] = useState(INIT_APPOINTMENTS);
  const [inventory, setInventory] = useState(INIT_INVENTORY);
  const [payments, setPayments] = useState(INIT_PAYMENTS);
  const [requests, setRequests] = useState(INIT_REQUESTS);
  const [records, setRecords] = useState(INIT_RECORDS);
  const [movements, setMovements] = useState(INIT_MOVEMENTS);

  if (!user) return <LoginScreen onLogin={(u)=>{ setUser(u); setView("dashboard"); }} users={users}/>;

  const adminNav = [
    { id:"dashboard", label:"Dashboard", icon:Home },
    { id:"patients", label:"Pacientes", icon:Users },
    { id:"calendar", label:"Calendario", icon:Calendar },
    { id:"inventory", label:"Inventario", icon:Package, badge: inventory.filter(i=>i.stock<=i.minStock).length || null },
    { id:"specialists", label:"Especialistas", icon:Stethoscope },
    { id:"payments", label:"Pagos", icon:DollarSign },
    { id:"requests", label:"Solicitudes", icon:Bell, badge: requests.filter(r=>r.status==="pending").length || null },
    { id:"reports", label:"Reportes", icon:BarChart2 },
    { id:"users", label:"Usuarios", icon:Settings },
  ];
  const specialistNav = [
    { id:"dashboard", label:"Dashboard", icon:Home },
    { id:"calendar", label:"Mi Agenda", icon:Calendar },
    { id:"materials", label:"Materiales", icon:Package },
    { id:"requests", label:"Solicitudes", icon:Bell },
  ];
  const nav = user.role==="admin" ? adminNav : specialistNav;

  const renderView = () => {
    const props = { user, users, patients, appointments, inventory, payments, requests, records, movements };
    switch(view) {
      case "dashboard": return <DashboardView {...props}/>;
      case "patients": return <PatientsView patients={patients} setPatients={setPatients} users={users} appointments={appointments} records={records} setRecords={setRecords}/>;
      case "calendar": return <CalendarView user={user} users={users} patients={patients} appointments={appointments} setAppointments={setAppointments}/>;
      case "inventory": return <InventoryView inventory={inventory} setInventory={setInventory} users={users} movements={movements} setMovements={setMovements}/>;
      case "specialists": return <SpecialistsView users={users} setUsers={setUsers}/>;
      case "payments": return <PaymentsView users={users} payments={payments} setPayments={setPayments}/>;
      case "requests": return <RequestsView user={user} users={users} requests={requests} setRequests={setRequests} inventory={inventory}/>;
      case "reports": return <ReportsView users={users} patients={patients} appointments={appointments} payments={payments}/>;
      case "users": return <UsersView users={users} setUsers={setUsers}/>;
      case "materials": return <MaterialsView user={user} inventory={inventory} setInventory={setInventory} movements={movements} setMovements={setMovements}/>;
      default: return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden" style={{fontFamily:"'Inter',sans-serif"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');`}</style>
      {/* Sidebar */}
      <aside className={`${sidebarOpen?"w-60":"w-16"} bg-slate-900 text-white flex flex-col transition-all duration-200 shrink-0`}>
        <div className={`flex items-center gap-3 px-4 py-5 border-b border-slate-700 ${!sidebarOpen&&"justify-center"}`}>
          <div className="bg-teal-500 p-1.5 rounded-lg shrink-0"><Stethoscope size={18}/></div>
          {sidebarOpen && <span className="font-bold text-base">DentalERP</span>}
        </div>
        <nav className="flex-1 py-4 overflow-y-auto">
          {nav.map(item=>(
            <button key={item.id} onClick={()=>setView(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all relative ${view===item.id?"bg-teal-600 text-white":"text-slate-400 hover:bg-slate-800 hover:text-white"} ${!sidebarOpen&&"justify-center"}`}>
              <item.icon size={18} className="shrink-0"/>
              {sidebarOpen && <span>{item.label}</span>}
              {item.badge && (
                <span className={`bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shrink-0 ${sidebarOpen?"ml-auto":"absolute top-1.5 right-1.5"}`}>
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>
        <div className="border-t border-slate-700 p-3">
          {sidebarOpen ? (
            <div className="flex items-center gap-3">
              <div className="bg-teal-600 rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold shrink-0">
                {user.name.split(" ").map(w=>w[0]).slice(0,2).join("")}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user.name}</p>
                <p className="text-xs text-slate-400 capitalize">{user.role==="admin"?"Administrador":user.specialty}</p>
              </div>
              <button onClick={()=>setUser(null)} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg"><LogOut size={15}/></button>
            </div>
          ) : (
            <button onClick={()=>setUser(null)} className="w-full flex justify-center p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg"><LogOut size={18}/></button>
          )}
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-4 shrink-0">
          <button onClick={()=>setSidebarOpen(o=>!o)} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg"><Menu size={18}/></button>
          <h1 className="text-base font-semibold text-gray-800 flex-1">
            {nav.find(n=>n.id===view)?.label}
          </h1>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>{today.toLocaleDateString("es-AR",{weekday:"long",day:"numeric",month:"long"})}</span>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          {renderView()}
        </main>
      </div>
    </div>
  );
}
