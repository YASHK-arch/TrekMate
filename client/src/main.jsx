import React, {useEffect,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {BrowserRouter,Routes,Route,Link,useNavigate,useLocation,useParams} from 'react-router-dom';
import axios from 'axios';
import {Chart as ChartJS,CategoryScale,LinearScale,BarElement,ArcElement,Tooltip,Legend} from 'chart.js';
import {Bar,Doughnut} from 'react-chartjs-2';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import './style.css';
marked.setOptions({ gfm: true, breaks: true });
function MarkdownView({content,className=''}){
  if(!content)return null;
  const rawHtml=marked.parse(String(content));
  const cleanHtml=DOMPurify.sanitize(rawHtml);
  return <div className={`markdown-body-custom ${className}`} dangerouslySetInnerHTML={{__html:cleanHtml}}/>;
}
ChartJS.register(CategoryScale,LinearScale,BarElement,ArcElement,Tooltip,Legend);
const api=axios.create({baseURL:'/api'});
api.interceptors.request.use(c=>{const t=localStorage.getItem('trek-token');if(t)c.headers.Authorization=`Bearer ${t}`;return c;});
const imageFor=t=>t?.imageUrl||'/static/uploads/everest-base-camp.jpg';
function useSession(){const [user,setUser]=useState(()=>{try{return JSON.parse(localStorage.getItem('trek-user'))}catch{return null}});return {user,setUser};}
function App(){const {user,setUser}=useSession();const [notice,setNotice]=useState(null);const loc=useLocation();
 useEffect(()=>{if(!localStorage.getItem('trek-token'))return;api.get('/auth/me').then(r=>{setUser(r.data.user);localStorage.setItem('trek-user',JSON.stringify(r.data.user))}).catch(()=>{localStorage.removeItem('trek-token');localStorage.removeItem('trek-user');setUser(null)})},[]);
 const notify=(msg,type='success')=>{setNotice({msg,type});window.scrollTo({top:0,behavior:'smooth'});setTimeout(()=>setNotice(null),4500)};
 const logout=()=>{localStorage.removeItem('trek-token');localStorage.removeItem('trek-user');setUser(null);notify('Logged out successfully.');};
 return <div className="app-shell"><header className="navbar navbar-expand-lg navbar-light bg-white border-bottom sticky-top px-3 px-lg-4"><Link className="navbar-brand fw-bold d-flex align-items-center gap-2" to={user?home(user):'/login'}><span className="brand-mark"><i className="bi bi-compass-fill"/></span><span>Trek<span className="text-primary">Mate</span></span></Link><button className="navbar-toggler" data-bs-toggle="collapse" data-bs-target="#mainNav"><span className="navbar-toggler-icon"/></button><div className="collapse navbar-collapse" id="mainNav"><ul className="navbar-nav me-auto ms-lg-4">{user&&navItems(user).map(n=><li className="nav-item" key={n.to}><Link className={`nav-link ${loc.pathname===n.to?'active':''}`} to={n.to}>{n.label}</Link></li>)}</ul><div className="d-flex align-items-center gap-3">{user?<><span className="small text-secondary d-none d-md-inline"><i className="bi bi-person-circle me-1"/>{user.name} <span className="badge text-bg-light">{user.role}</span></span><Link to="/profile" className="btn btn-outline-secondary btn-sm rounded-pill px-3">Profile</Link><button className="btn btn-outline-secondary btn-sm rounded-pill px-3" onClick={logout}>Log out</button></>:<><Link className="btn btn-outline-primary rounded-pill px-3" to="/login">Login</Link><Link className="btn btn-primary rounded-pill px-3" to="/register">Get Started</Link></>}</div></div></header>
 {notice&&<div className={`alert alert-${notice.type} alert-dismissible fade show m-3 mb-0`} role="alert">{notice.msg}<button className="btn-close" onClick={()=>setNotice(null)}/></div>}
 <main className="container-fluid px-3 px-lg-5 py-4 page-container"><Routes>
 <Route path="/" element={<Landing user={user}/>}/><Route path="/login" element={<Auth mode="login" setUser={setUser} notify={notify}/>}/><Route path="/register" element={<Auth mode="register" notify={notify}/>}/>
 <Route path="/user/dashboard" element={<Protected user={user} role="User"><TrekBrowse notify={notify}/></Protected>}/><Route path="/user/trek/:id" element={<Protected user={user} role="User"><TrekDetails notify={notify}/></Protected>}/><Route path="/user/bookings" element={<Protected user={user} role="User"><Bookings history={false} notify={notify}/></Protected>}/><Route path="/user/history" element={<Protected user={user} role="User"><Bookings history notify={notify}/></Protected>}/>
 <Route path="/admin/dashboard" element={<Protected user={user} role="Admin"><AdminDashboard/></Protected>}/><Route path="/admin/treks" element={<Protected user={user} role="Admin"><ManageTreks notify={notify}/></Protected>}/><Route path="/admin/treks/add" element={<Protected user={user} role="Admin"><TrekForm notify={notify}/></Protected>}/><Route path="/admin/treks/edit/:id" element={<Protected user={user} role="Admin"><TrekForm notify={notify}/></Protected>}/><Route path="/admin/users" element={<Protected user={user} role="Admin"><ManageUsers notify={notify}/></Protected>}/><Route path="/admin/staff" element={<Protected user={user} role="Admin"><ManageStaff notify={notify}/></Protected>}/><Route path="/admin/bookings" element={<Protected user={user} role="Admin"><AllBookings/></Protected>}/>
 <Route path="/staff/dashboard" element={<Protected user={user} role="Staff"><StaffDashboard notify={notify}/></Protected>}/><Route path="/staff/trek/:id" element={<Protected user={user} role="Staff"><StaffTrek notify={notify}/></Protected>}/><Route path="/profile" element={<Protected user={user}><Profile notify={notify} setUser={setUser}/></Protected>}/><Route path="*" element={<div className="empty-state"><h3>Page not found</h3><Link to={user?home(user):'/login'} className="btn btn-primary">Go back</Link></div>}/>
 </Routes></main><footer className="footer mt-auto"><div className="container py-4 d-flex flex-column flex-md-row justify-content-between gap-2"><span className="fw-semibold"><i className="bi bi-compass me-2"/>TrekMate</span><span className="small text-secondary">Plan better. Trek farther.</span></div></footer></div>;
}
function home(u){return u?.role==='Admin'?'/admin/dashboard':u?.role==='Staff'?'/staff/dashboard':'/user/dashboard'}
function navItems(u){if(u.role==='Admin')return [{label:'Dashboard',to:'/admin/dashboard'},{label:'Manage Treks',to:'/admin/treks'},{label:'Staff',to:'/admin/staff'},{label:'Users',to:'/admin/users'},{label:'Bookings',to:'/admin/bookings'}];if(u.role==='Staff')return [{label:'Dashboard',to:'/staff/dashboard'}];return [{label:'Explore Treks',to:'/user/dashboard'},{label:'My Bookings',to:'/user/bookings'},{label:'History',to:'/user/history'}]}
function Protected({user,role,children}){const loc=useLocation();if(!user)return <div className="text-center py-5"><h4>Please log in to continue</h4><Link to="/login" state={{from:loc.pathname}} className="btn btn-primary mt-2">Login</Link></div>;if(role&&user.role!==role)return <div className="text-center py-5"><h4>You do not have permission to access this page.</h4><Link to={home(user)} className="btn btn-primary mt-2">Go to dashboard</Link></div>;return children}
function Landing({user}){const go=useNavigate();useEffect(()=>{if(user)go(home(user),{replace:true})},[user]);return <div className="hero-wrap"><div className="hero-copy"><span className="eyebrow"><i className="bi bi-mountains me-2"/>YOUR NEXT ADVENTURE STARTS HERE</span><h1>Find your next<br/><span>great escape.</span></h1><p>Discover trails, plan unforgettable treks, and make every step count. Your next adventure is closer than you think.</p><div className="d-flex gap-3 flex-wrap"><Link to="/register" className="btn btn-primary btn-lg rounded-pill px-4">Start exploring <i className="bi bi-arrow-up-right ms-2"/></Link><Link to="/login" className="btn btn-outline-secondary btn-lg rounded-pill px-4">Sign in</Link></div><div className="hero-points"><span><i className="bi bi-check-circle-fill"/> Curated trails</span><span><i className="bi bi-check-circle-fill"/> Trusted guides</span><span><i className="bi bi-check-circle-fill"/> Easy booking</span></div></div><div className="hero-image"><img src="/static/uploads/wp7728998-4k-landscape-wallpapers.jpg" alt="Mountain landscape"/><div className="floating-card"><i className="bi bi-geo-alt-fill"/><div><strong>Explore the outdoors</strong><small>One trail at a time</small></div></div></div></div>}
function Auth({mode,setUser,notify}){const login=mode==='login',go=useNavigate(),loc=useLocation();const [form,setForm]=useState({name:'',email:'',password:'',confirmPassword:'',role:'User'});const [busy,setBusy]=useState(false);const [showPassword,setShowPassword]=useState(false);const [showConfirmPassword,setShowConfirmPassword]=useState(false);const change=e=>setForm({...form,[e.target.name]:e.target.value});async function submit(e){e.preventDefault();setBusy(true);try{if(login){const r=await api.post('/auth/login',form);localStorage.setItem('trek-token',r.data.token);localStorage.setItem('trek-user',JSON.stringify(r.data.user));setUser(r.data.user);go(home(r.data.user),{replace:true});notify('Welcome back!')}else{const r=await api.post('/auth/register',form);notify(r.data.message);go('/login')}}catch(e){notify(e.response?.data?.message||'Something went wrong. Please try again.','danger')}finally{setBusy(false)}}return <div className="auth-layout"><div className="auth-visual"><img src="/static/uploads/wp15082136.webp" alt="Mountain trail"/><div><span className="eyebrow">THE MOUNTAINS ARE CALLING</span><h2>Make memories<br/>that move you.</h2><p>Great adventures begin with a single step.</p></div></div><div className="auth-form-wrap"><form className="auth-form" onSubmit={submit}><span className="eyebrow">{login?'WELCOME BACK':'JOIN THE COMMUNITY'}</span><h2 className="fw-bold mt-2">{login?'Sign in to TrekMate':'Create your account'}</h2><p className="text-secondary mb-4">{login?'Your next adventure is waiting.':'Start planning your next adventure today.'}</p>{!login&&<><label className="form-label">Full name</label><input className="form-control form-control-lg mb-3" name="name" value={form.name} onChange={change} required placeholder="Your name"/><label className="form-label">Register as</label><select className="form-select form-select-lg mb-3" name="role" value={form.role} onChange={change}><option value="User">Trekker</option><option value="Staff">Trek Staff / Guide</option></select></>}<label className="form-label">{form.role==='Staff'&&!login?'Email or contact details':'Email address'}</label><input className="form-control form-control-lg mb-3" type={login?'text':'text'} name="email" value={form.email} onChange={change} required placeholder="you@example.com"/><label className="form-label">Password</label><div className="input-group mb-3"><input className="form-control form-control-lg" type={showPassword?"text":"password"} name="password" value={form.password} onChange={change} required minLength="6" placeholder="Enter your password"/><button className="btn btn-outline-secondary" type="button" onClick={()=>setShowPassword(!showPassword)}><i className={`bi ${showPassword?'bi-eye-slash':'bi-eye'}`}/></button></div>{!login&&<><label className="form-label">Confirm password</label><div className="input-group mb-3"><input className="form-control form-control-lg" type={showConfirmPassword?"text":"password"} name="confirmPassword" value={form.confirmPassword} onChange={change} required placeholder="Repeat your password"/><button className="btn btn-outline-secondary" type="button" onClick={()=>setShowConfirmPassword(!showConfirmPassword)}><i className={`bi ${showConfirmPassword?'bi-eye-slash':'bi-eye'}`}/></button></div></>}{login&&<div className="d-flex justify-content-between align-items-center mb-4"><label className="form-check"><input className="form-check-input" type="checkbox"/> <span className="form-check-label small">Remember me</span></label></div>}<button className="btn btn-primary btn-lg w-100 rounded-pill" disabled={busy}>{busy?'Please wait…':login?'Sign in':'Create account'} <i className="bi bi-arrow-right ms-2"/></button><p className="text-center text-secondary mt-4 mb-0 small">{login?'New to TrekMate? ':'Already have an account? '}<Link to={login?'/register':'/login'}>{login?'Create an account':'Sign in'}</Link></p>{!login&&form.role==='Staff'&&<p className="small text-secondary mt-3 mb-0">Staff accounts need admin approval before sign-in.</p>}</form></div></div>}
function PageTitle({eyebrow,title,subtitle,action}){return <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3 mb-4"><div>{eyebrow&&<div className="eyebrow mb-2">{eyebrow}</div>}<h2 className="page-title">{title}</h2>{subtitle&&<p className="text-secondary mb-0">{subtitle}</p>}</div>{action}</div>}
function Loading(){return <div className="text-center py-5"><div className="spinner-border text-primary"/><p className="text-secondary mt-2">Loading…</p></div>}
function TrekCard({t,admin=false,onDelete,onViewDetails}){
  const difficultyLevel=t.difficulty==='Easy'?1:t.difficulty==='Moderate'?2:3;
  const price=t.price!==undefined&&t.price!==null&&t.price!==''?t.price:(t._id?1200:Math.floor(Math.random()*2000)+200);
  const avgTime=t.avgTime||'6 h 22m';
  const avgDistance=t.avgDistance||'13.0 km';
  const avgGain=t.avgGain||'+743 m';
  const avgLoss=t.avgLoss||'-697 m';
  const fmtStat=(v,prefix='')=>{
    if(!v)return '—';
    let s=String(v).trim();
    if(prefix&&!s.startsWith(prefix))s=`${prefix} ${s}`;
    if(!s.toLowerCase().includes('/day'))s=`${s} /day`;
    return s;
  };
  return <div className="card trek-card h-100 border-0 shadow-sm"><div className="trek-image-wrap"><img src={imageFor(t)} className="card-img-top trek-image" alt={t.name}/><span className="trek-duration-badge">{t.duration} days</span><span className="trek-price-badge">${price}</span></div><div className="card-body p-4"><div className="trek-difficulty-circles mb-2">{[1,2,3].map(i=><span key={i} className={`difficulty-circle ${i<=difficultyLevel?'active':''}`}/>)}<span className="difficulty-label ms-2">{t.difficulty}</span></div><h5 className="fw-bold mb-2">{t.name}</h5><p className="text-secondary small trek-description mb-3">{t.description||'Get ready for a memorable outdoor adventure through beautiful landscapes.'}</p><div className="trek-stats-box mb-3"><div className="stat-item"><i className="bi bi-clock"/><span>{fmtStat(avgTime)}</span></div><div className="stat-item"><i className="bi bi-signpost-2"/><span>{fmtStat(avgDistance)}</span></div><div className="stat-item"><i className="bi bi-arrow-up-circle"/><span>{fmtStat(avgGain,'↑')}</span></div><div className="stat-item"><i className="bi bi-arrow-down-circle"/><span>{fmtStat(avgLoss,'↓')}</span></div></div><div className="d-flex justify-content-between align-items-center border-top pt-3"><span className="small text-secondary"><i className="bi bi-geo-alt-fill me-1"/>{t.region}</span><div className="d-flex align-items-center gap-2">{admin?<><Link to={`/admin/treks/edit/${t.id}`} className="btn btn-sm btn-outline-primary rounded-pill px-3">Edit</Link><button type="button" className="btn btn-sm btn-outline-danger rounded-circle trek-delete-button" onClick={onDelete} aria-label={`Delete ${t.name}`} title="Delete trek"><i className="bi bi-trash" aria-hidden="true"/></button></>:<button type="button" className="btn btn-sm btn-outline-primary rounded-pill px-3" onClick={()=>onViewDetails(t)}>View Details</button>}</div></div></div></div>}
function dateFmt(d){if(!d)return '—';return new Date(d).toLocaleDateString('en-IN',{day:'2-digit',month:'short'})}
const FILTER_KEY='trekmate-filters';
function loadFilters(){try{return JSON.parse(sessionStorage.getItem(FILTER_KEY))||{}}catch{return{}}}
function saveFilters(patch){try{const cur=loadFilters();sessionStorage.setItem(FILTER_KEY,JSON.stringify({...cur,...patch}))}catch{}}
function TrekBrowse({notify,admin=false}){
  const _f=loadFilters();
  const [treks,setTreks]=useState([]);
  const [search,setSearch]=useState(_f.search||'');
  const [loading,setLoading]=useState(true);
  const [difficulty,setDifficulty]=useState(_f.difficulty||'');
  const [timespan,setTimespan]=useState(_f.timespan||'');
  const [selectedRegion,setSelectedRegion]=useState(_f.selectedRegion||'');
  const [startDate,setStartDate]=useState(_f.startDate||'');
  const [sortBy,setSortBy]=useState(_f.sortBy||'price-asc');
  const [trekToDelete,setTrekToDelete]=useState(null);
  const [deleting,setDeleting]=useState(false);
  const [selectedTrek,setSelectedTrek]=useState(null);

  const regions=[
    {name:'Nepal',image:'/static/uploads/everest-base-camp.jpg'},
    {name:'Northern India',image:'/static/uploads/deoria-tal-india.jpg'},
    {name:'Southern India',image:'/static/uploads/nilgiri-hills-india.jpg'},
    {name:'Japan',image:'/static/uploads/mount-fuji.jpg'},
    {name:'Vietnam',image:'/static/uploads/sapa-vietnam.jpg'},
    {name:'Kyrgyzstan',image:'/static/uploads/tian-shan-kyrgyzstan.jpg'},
    {name:'Bhutan',image:'/static/uploads/paro-taktsang-bhutan.jpg'},
    {name:'Sri Lanka',image:'/static/uploads/kirigalpotta-sri-lanka.jpg'},
    {name:'China',image:'/static/uploads/great-wall-china.jpg'},
  ];

  async function load(){
    setLoading(true);
    try{
      const params=admin?{}:{public:'true'};
      if(difficulty)params.difficulty=difficulty;
      if(selectedRegion)params.region=selectedRegion;
      const r=await api.get('/treks',{params});
      let data=[...r.data];
      if(search){
        const s=search.toLowerCase();
        data=data.filter(t=>`${t.name} ${t.region||''} ${t.id}`.toLowerCase().includes(s));
      }
      if(timespan==='1-3')data=data.filter(t=>t.duration>=1&&t.duration<=3);
      else if(timespan==='4-7')data=data.filter(t=>t.duration>=4&&t.duration<=7);
      else if(timespan==='8+')data=data.filter(t=>t.duration>=8);
      if(startDate)data=data.filter(t=>t.startDate&&new Date(t.startDate)>=new Date(startDate));
      if(sortBy==='price-desc')data.sort((a,b)=>(b.price||0)-(a.price||0));
      else data.sort((a,b)=>(a.price||0)-(b.price||0));
      setTreks(data);
    }catch(e){notify(e.response?.data?.message||'Could not load treks.','danger')}
    finally{setLoading(false)}
  }

  useEffect(()=>{load()},[selectedRegion,difficulty,timespan,startDate,sortBy,search]);
  useEffect(()=>{saveFilters({search,difficulty,timespan,selectedRegion,startDate,sortBy})},[search,difficulty,timespan,selectedRegion,startDate,sortBy]);

  function clearAll(){setDifficulty('');setTimespan('');setSelectedRegion('');setStartDate('');setSortBy('price-asc');setSearch('');try{sessionStorage.removeItem(FILTER_KEY)}catch{}}

  async function confirmDelete(){
    if(!trekToDelete)return;
    setDeleting(true);
    try{
      await api.delete(`/treks/${trekToDelete.id}`);
      notify(`"${trekToDelete.name}" deleted successfully.`);
      setTrekToDelete(null);
      load();
    }catch(e){
      notify(e.response?.data?.message||'Delete failed.','danger');
    }finally{
      setDeleting(false);
    }
  }

  const activeFilterCount=[difficulty,timespan,startDate,selectedRegion,search].filter(Boolean).length;

  return (
    <div className="trek-browse-root">
      {admin&&(
        <PageTitle
          eyebrow="ADMINISTRATION"
          title="Manage treks"
          subtitle="Create, update, and manage trek listings with interactive region and side filters."
          action={
            <Link to="/admin/treks/add" className="btn btn-primary rounded-pill">
              <i className="bi bi-plus-lg me-2"/>Add trek
            </Link>
          }
        />
      )}
      {/* ── Region strip ── */}
      <div className="region-strip-wrapper">
        <button
          className={`region-chip ${selectedRegion===''?'active':''}`}
          onClick={()=>setSelectedRegion('')}
        >
          <div className="region-chip-img-wrap">
            <img src="/static/uploads/annapurna-circuit.jpg" alt="All"/>
          </div>
          <span>All Regions</span>
        </button>
        {regions.map(r=>(
          <button
            key={r.name}
            className={`region-chip ${selectedRegion===r.name?'active':''}`}
            onClick={()=>setSelectedRegion(r.name)}
          >
            <div className="region-chip-img-wrap">
              <img src={r.image} alt={r.name}/>
            </div>
            <span>{r.name.split(' ').map((w,i)=><span key={i}>{w}</span>)}</span>
          </button>
        ))}
      </div>

      {/* ── Body: sidebar + grid ── */}
      <div className="trek-browse-body">
        {/* Left Sidebar */}
        <aside className="browse-sidebar">
          {activeFilterCount>0&&(
            <button className="sidebar-clear-btn" onClick={clearAll}>
              <i className="bi bi-x-circle me-1"/>Clear filters ({activeFilterCount})
            </button>
          )}

          {/* Calendar / When */}
          <div className="sidebar-block">
            <div className="sidebar-section-header">
              <span className="sidebar-block-label">
                <i className="bi bi-calendar-event"/> When
              </span>
              {startDate&&(
                <button type="button" className="sidebar-sec-clear" onClick={()=>setStartDate('')} title="Clear date filter">
                  Clear <i className="bi bi-x"/>
                </button>
              )}
            </div>
            <div className="sidebar-block-body">
              <input
                type="date"
                className="form-control sidebar-date-input"
                value={startDate}
                onChange={e=>setStartDate(e.target.value)}
              />
            </div>
          </div>

          <div className="sidebar-divider"/>

          {/* Timespan / Days */}
          <div className="sidebar-block">
            <div className="sidebar-section-header">
              <span className="sidebar-block-label">
                <i className="bi bi-arrow-left-right"/> Days
              </span>
              {timespan!==''&&(
                <button type="button" className="sidebar-sec-clear" onClick={()=>setTimespan('')} title="Reset days filter">
                  Clear <i className="bi bi-x"/>
                </button>
              )}
            </div>
            <div className="sidebar-block-body">
              <div className="sidebar-radio-group">
                {[['','Any'],['1-3','1‑3 days'],['4-7','4‑7 days'],['8+','8+ days']].map(([val,label])=>(
                  <button
                    key={val}
                    type="button"
                    className={`sidebar-radio-pill ${timespan===val?'active':''}`}
                    onClick={()=>setTimespan(timespan===val?'':val)}
                  >
                    <span>{label}</span>
                    {timespan===val&&val!==''&&<i className="bi bi-check2 active-check"/>}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="sidebar-divider"/>

          {/* Difficulty */}
          <div className="sidebar-block">
            <div className="sidebar-section-header">
              <span className="sidebar-block-label">
                <i className="bi bi-person-walking"/> Difficulty
              </span>
              {difficulty!==''&&(
                <button type="button" className="sidebar-sec-clear" onClick={()=>setDifficulty('')} title="Reset difficulty filter">
                  Clear <i className="bi bi-x"/>
                </button>
              )}
            </div>
            <div className="sidebar-block-body">
              <div className="sidebar-diff-list">
                {[
                  {val:'',dots:0,label:'Any'},
                  {val:'Easy',dots:1,label:'Easy'},
                  {val:'Moderate',dots:2,label:'Moderate'},
                  {val:'Difficult',dots:3,label:'Difficult'},
                ].map(({val,dots,label})=>(
                  <button
                    key={label}
                    type="button"
                    className={`sidebar-diff-row ${difficulty===val?'active':''}`}
                    onClick={()=>setDifficulty(difficulty===val?'':val)}
                  >
                    <span className="diff-dots-sm">
                      {[1,2,3].map(i=>(
                        <span key={i} className={`dd ${i<=dots?'on':''}`}/>
                      ))}
                    </span>
                    <span className="diff-label-text">{label}</span>
                    {difficulty===val&&val!==''&&<i className="bi bi-check2 active-check ms-auto"/>}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="sidebar-divider"/>

          {/* Sort */}
          <div className="sidebar-block">
            <div className="sidebar-section-header">
              <span className="sidebar-block-label">
                <i className="bi bi-sort-down"/> Sort by
              </span>
              {sortBy!=='price-asc'&&(
                <button type="button" className="sidebar-sec-clear" onClick={()=>setSortBy('price-asc')} title="Reset sorting">
                  Reset <i className="bi bi-x"/>
                </button>
              )}
            </div>
            <div className="sidebar-block-body">
              <select
                className="form-select sidebar-select"
                value={sortBy}
                onChange={e=>setSortBy(e.target.value)}
              >
                <option value="price-asc">Price: Low → High</option>
                <option value="price-desc">Price: High → Low</option>
              </select>
            </div>
          </div>
        </aside>

        {/* Trek Grid */}
        <div className="browse-grid-area">
          <div className="browse-grid-header">
            <span className="browse-result-count">
              {loading?'Loading…':`${treks.length} trek${treks.length!==1?'s':''} found`}
              {selectedRegion&&<> in <strong>{selectedRegion}</strong></>}
            </span>
          </div>

          <div className="input-group search-input mb-4">
            <span className="input-group-text"><i className="bi bi-search"/></span>
            <input
              className="form-control"
              placeholder="Search treks by name or region…"
              value={search}
              onChange={e=>setSearch(e.target.value)}
            />
            {search&&(
              <button className="btn btn-outline-secondary" type="button" onClick={()=>setSearch('')}>
                <i className="bi bi-x"/>
              </button>
            )}
          </div>

          {loading?(
            <Loading/>
          ):treks.length?(
            <div className="browse-trek-grid">
              {treks.map(t=>(
                <div key={t.id} className="browse-trek-item">
                  <TrekCard t={t} admin={admin} onDelete={()=>setTrekToDelete(t)} onViewDetails={t=>setSelectedTrek(t)}/>
                </div>
              ))}
            </div>
          ):(
            <div className="empty-state">
              <i className="bi bi-compass"/>
              <h5>No treks found</h5>
              <p>Try adjusting your filters or check back later for new adventures.</p>
              <button className="btn btn-outline-secondary rounded-pill" onClick={clearAll}>
                Clear filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Custom Delete Confirmation Modal Container ── */}
      {trekToDelete&&(
        <div className="modal-backdrop-custom" onClick={()=>!deleting&&setTrekToDelete(null)}>
          <div className="modal-container-custom" onClick={e=>e.stopPropagation()}>
            <div className="modal-header-custom">
              <div className="modal-icon-badge danger">
                <i className="bi bi-trash3-fill"/>
              </div>
              <button
                type="button"
                className="btn-close ms-auto"
                aria-label="Close"
                disabled={deleting}
                onClick={()=>setTrekToDelete(null)}
              />
            </div>

            <div className="modal-body-custom">
              <h4 className="fw-bold mb-2">Delete Trek Confirmation</h4>
              <p className="text-secondary mb-3">
                Are you sure you want to delete <strong>"{trekToDelete.name}"</strong>?
              </p>
              <div className="delete-warning-box">
                <i className="bi bi-exclamation-triangle-fill me-2 text-danger flex-shrink-0 mt-1"/>
                <small>
                  This action cannot be undone. It will permanently remove this trek and cancel any registered booking records.
                </small>
              </div>
            </div>

            <div className="modal-footer-custom">
              <button
                type="button"
                className="btn btn-outline-secondary rounded-pill px-4"
                disabled={deleting}
                onClick={()=>setTrekToDelete(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger rounded-pill px-4 d-inline-flex align-items-center gap-2"
                disabled={deleting}
                onClick={confirmDelete}
              >
                {deleting?(
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"/>
                    <span>Deleting…</span>
                  </>
                ):(
                  <>
                    <i className="bi bi-trash3-fill"/>
                    <span>Yes, delete trek</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── View Trek Details Pop-up Modal Container ── */}
      {selectedTrek && (
        <div className="modal-backdrop-custom" onClick={()=>setSelectedTrek(null)}>
          <div className="modal-container-custom trek-detail-modal-container" onClick={e=>e.stopPropagation()}>
            <div className="trek-modal-hero">
              <img src={imageFor(selectedTrek)} alt={selectedTrek.name}/>
              <span className={`detail-hero-badge ${(selectedTrek.difficulty||'Easy').toLowerCase()}`}>
                {selectedTrek.difficulty}
              </span>
              <button
                type="button"
                className="trek-modal-close-btn"
                onClick={()=>setSelectedTrek(null)}
                aria-label="Close"
              >
                <i className="bi bi-x-lg"/>
              </button>
              <div className="trek-modal-hero-overlay">
                <span className="trek-modal-region-badge"><i className="bi bi-geo-alt-fill me-1"/>{selectedTrek.region}</span>
                <h3 className="fw-bold text-white mb-0">{selectedTrek.name}</h3>
              </div>
            </div>

            <div className="modal-body-custom trek-modal-body">
              <div className="row g-3 mb-4">
                <div className="col-6 col-md-3">
                  <div className="trek-modal-stat-card">
                    <i className="bi bi-geo-alt text-primary"/>
                    <div>
                      <small className="text-secondary d-block">Region</small>
                      <strong>{selectedTrek.region}</strong>
                    </div>
                  </div>
                </div>
                <div className="col-6 col-md-3">
                  <div className="trek-modal-stat-card">
                    <i className="bi bi-cash-stack text-success"/>
                    <div>
                      <small className="text-secondary d-block">Price</small>
                      <strong>${selectedTrek.price!==undefined?selectedTrek.price:1200}</strong>
                    </div>
                  </div>
                </div>
                <div className="col-6 col-md-3">
                  <div className="trek-modal-stat-card">
                    <i className="bi bi-calendar2-range text-info"/>
                    <div>
                      <small className="text-secondary d-block">Dates</small>
                      <strong>{dateFmt(selectedTrek.startDate)} – {dateFmt(selectedTrek.endDate)}</strong>
                    </div>
                  </div>
                </div>
                <div className="col-6 col-md-3">
                  <div className="trek-modal-stat-card">
                    <i className="bi bi-people text-warning"/>
                    <div>
                      <small className="text-secondary d-block">Availability</small>
                      <strong>{selectedTrek.availableSlots} spots left</strong>
                    </div>
                  </div>
                </div>
              </div>

              <div className="trek-modal-metrics-box mb-4">
                <div className="metric-col">
                  <i className="bi bi-clock text-primary me-2"/>
                  <div>
                    <span className="metric-label">Time / day</span>
                    <span className="metric-val">{selectedTrek.avgTime || '6 h 30m'}</span>
                  </div>
                </div>
                <div className="metric-col">
                  <i className="bi bi-signpost-2 text-primary me-2"/>
                  <div>
                    <span className="metric-label">Distance / day</span>
                    <span className="metric-val">{selectedTrek.avgDistance || '12.0 km'}</span>
                  </div>
                </div>
                <div className="metric-col">
                  <i className="bi bi-arrow-up-circle text-success me-2"/>
                  <div>
                    <span className="metric-label">Elevation Gain</span>
                    <span className="metric-val">{selectedTrek.avgGain || '+750 m'}</span>
                  </div>
                </div>
                <div className="metric-col">
                  <i className="bi bi-arrow-down-circle text-danger me-2"/>
                  <div>
                    <span className="metric-label">Elevation Loss</span>
                    <span className="metric-val">{selectedTrek.avgLoss || '-650 m'}</span>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <h6 className="fw-bold mb-2 text-dark"><i className="bi bi-info-circle me-2 text-primary"/>About this trek</h6>
                <p className="text-secondary trek-modal-desc mb-0">
                  {selectedTrek.description || 'Experience the outdoors on this memorable trek. Prepare for changing weather and follow your guide’s instructions throughout the journey.'}
                </p>
              </div>

              <div className="p-3 bg-light rounded-3 border">
                <h6 className="fw-bold mb-3 text-dark">
                  <i className="bi bi-file-earmark-text me-2 text-primary"/>
                  Detailed Description
                </h6>
                <MarkdownView
                  content={
                    selectedTrek.detailedDescription ||
                    `### 🗺️ Expedition Overview\n- **Terrain**: Alpine ridges, rhododendron woodlands, and high glacial passes.\n- **Pace**: Steady 5–6 hour daily stages with dedicated acclimatization rest stops.\n\n### 🎒 Daily Trail Highlights\n1. **Base Approach**: Scenic valley trek with gradual elevation gain.\n2. **High Ridge Crossing**: Sweeping panoramic viewpoints of snow-capped peaks.\n3. **Descent & Celebration**: Traditional village stays and authentic trail banquet.\n\n> **Guide Tip**: Drink at least 3L of water daily and layer windproof clothing for abrupt altitude weather shifts.`
                  }
                />
              </div>
            </div>

            <div className="modal-footer-custom justify-content-between">
              <Link
                to={`/user/trek/${selectedTrek.id}`}
                className="btn btn-outline-secondary rounded-pill px-3"
                onClick={()=>setSelectedTrek(null)}
              >
                Full Page <i className="bi bi-box-arrow-up-right ms-1"/>
              </Link>
              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-light rounded-pill px-4"
                  onClick={()=>setSelectedTrek(null)}
                >
                  Close
                </button>
                <Link
                  to={`/user/trek/${selectedTrek.id}`}
                  className="btn btn-primary rounded-pill px-4"
                  onClick={()=>setSelectedTrek(null)}
                >
                  Book Trek <i className="bi bi-arrow-right ms-1"/>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TrekDetails({notify}){const {id}=useParams(),go=useNavigate(),[t,setT]=useState(null),[booking,setBooking]=useState(null);useEffect(()=>{Promise.all([api.get(`/treks/${id}`),api.get('/bookings/mine')]).then(([a,b])=>{setT(a.data);setBooking(b.data.find(x=>x.trek?.id===id||String(x.trek?._id)===id))}).catch(e=>notify(e.response?.data?.message||'Could not load trek.','danger'))},[id]);async function book(){try{const r=await api.post(`/treks/${id}/book`);notify(r.data.message);location.href='/user/bookings'}catch(e){notify(e.response?.data?.message||'Booking failed.','danger')}}if(!t)return <Loading/>;return <><button type="button" className="back-link" onClick={()=>go(-1)}><i className="bi bi-arrow-left me-2"/>Back to treks</button><div className="detail-hero mt-3"><img src={imageFor(t)} alt={t.name}/><span className={`detail-hero-badge ${(t.difficulty||'Easy').toLowerCase()}`}>{t.difficulty}</span><div className="detail-overlay"><h1>{t.name}</h1><p><i className="bi bi-geo-alt-fill me-2"/>{t.region}</p></div></div><div className="row g-4 mt-1"><div className="col-lg-8"><section className="panel p-4 p-lg-5"><h4 className="fw-bold mb-3">About this trek</h4><p className="text-secondary detail-copy">{t.description||'Experience the outdoors on this memorable trek. Prepare for changing weather and follow your guide’s instructions throughout the journey.'}</p><div className="row g-3 mt-3"><Info icon="geo-alt" label="Region" value={t.region}/><Info icon="calendar-event" label="Dates" value={`${dateFmt(t.startDate)} – ${dateFmt(t.endDate)}`}/><Info icon="clock" label="Duration" value={`${t.duration} days`}/><Info icon="people" label="Available slots" value={t.availableSlots}/><Info icon="person-badge" label="Trek guide" value={t.assignedStaffName||'To be assigned'}/></div>{t.detailedDescription&&<div className="mt-4 pt-4 border-top"><h5 className="fw-bold mb-3"><i className="bi bi-file-earmark-text me-2 text-primary"/>Detailed Description</h5><MarkdownView content={t.detailedDescription}/></div>}</section></div><div className="col-lg-4"><div className="panel p-4 booking-panel"><span className="eyebrow">YOUR ADVENTURE</span><h4 className="fw-bold mt-2">Ready to go?</h4><p className="text-secondary small">Check availability and reserve your place on this trek.</p><div className="d-flex justify-content-between py-3 border-top border-bottom mb-3"><span className="text-secondary">Availability</span><strong>{t.availableSlots} spots left</strong></div>{booking?.status==='Booked'?<div className="alert alert-success">You have already booked this trek.</div>:t.status!=='Open'?<div className="alert alert-secondary">Bookings are not open yet.</div>:t.availableSlots<=0?<div className="alert alert-warning">This trek is fully booked.</div>:<button className="btn btn-primary btn-lg rounded-pill w-100" onClick={book}>Book this trek <i className="bi bi-arrow-right ms-2"/></button>}<div className="small text-secondary mt-3"><i className="bi bi-shield-check me-2"/>Secure booking with instant confirmation</div></div></div></div></>}
function Info({icon,label,value}){return <div className="col-sm-6"><div className="info-tile"><i className={`bi bi-${icon}`}/><div><small>{label}</small><strong>{value||'—'}</strong></div></div></div>}
function Bookings({history,notify}){const [items,setItems]=useState(null);async function load(){try{const r=await api.get('/bookings/mine');setItems(r.data.filter(b=>history?(b.status==='Cancelled'||b.status==='Completed'||b.trek?.status==='Completed'):(b.status==='Booked'&&b.trek?.status!=='Completed')))}catch(e){notify(e.response?.data?.message||'Could not load bookings.','danger');setItems([])}}useEffect(()=>{load()},[]);async function cancel(id){if(!confirm('Are you sure you want to cancel this booking?'))return;try{const r=await api.post(`/bookings/${id}/cancel`);notify(r.data.message);load()}catch(e){notify(e.response?.data?.message||'Could not cancel booking.','danger')}}return <><PageTitle eyebrow="YOUR TREK JOURNEY" title={history?'Booking history':'My bookings'} subtitle={history?'Look back on your completed and cancelled adventures.':'Keep track of the treks you have reserved.'}/>{items===null?<Loading/>:items.length?<div className="panel table-responsive"><table className="table table-hover align-middle mb-0"><thead><tr><th className="ps-4">Booking ID</th><th>Trek</th><th>Dates</th><th>Booking date</th><th>Status</th><th className="text-end pe-4">Action</th></tr></thead><tbody>{items.map(b=><tr key={b.id}><td className="ps-4 fw-semibold">B{String(b.id).slice(-5).toUpperCase()}</td><td><div className="d-flex align-items-center gap-3"><img className="mini-thumb" src={imageFor(b.trek)} alt=""/><div><strong>{b.trek?.name||'Trek unavailable'}</strong><div className="small text-secondary">{b.trek?.region}</div></div></div></td><td>{dateFmt(b.trek?.startDate)} – {dateFmt(b.trek?.endDate)}</td><td>{dateFmt(b.bookingDate)}</td><td><span className={`status-pill status-${b.status.toLowerCase()}`}>{b.status}</span></td><td className="text-end pe-4">{!history&&b.status==='Booked'&&<button className="btn btn-sm btn-outline-danger rounded-pill" onClick={()=>cancel(b.id)}>Cancel</button>}</td></tr>)}</tbody></table></div>:<div className="empty-state"><i className="bi bi-calendar2-week"/><h5>{history?'No trek history yet':'No bookings yet'}</h5><p>{history?'Your completed and cancelled treks will appear here.':'Your next adventure is just around the corner.'}</p><Link to="/user/dashboard" className="btn btn-primary rounded-pill">Explore treks</Link></div>}</>}
function AdminDashboard(){const [d,setD]=useState(null);useEffect(()=>{api.get('/admin/summary').then(r=>setD(r.data)).catch(()=>setD({error:true}))},[]);if(!d)return <Loading/>;if(d.error)return <div className="alert alert-danger">Unable to load dashboard.</div>;return <><PageTitle eyebrow="OVERVIEW" title="Dashboard" subtitle="Here’s what’s happening across your trekking platform." action={<Link to="/admin/treks/add" className="btn btn-primary rounded-pill"><i className="bi bi-plus-lg me-2"/>Add a trek</Link>}/><div className="row g-3 mb-4">{[['Total Treks',d.totalTreks,'image','#2a9d8f'],['Total Users',d.totalUsers,'person','#e76f51'],['Total Staff',d.totalStaff,'people','#f4a261'],['Total Bookings',d.totalBookings,'calendar2-week','#1b263b']].map(([label,val,icon,color])=><div className="col-6 col-xl-3" key={label}><div className="stat-card"><div><span>{label}</span><strong>{val}</strong></div><i className={`bi bi-${icon}`} style={{color}}/></div></div>)}</div><div className="row g-4 mb-4"><div className="col-lg-6"><div className="panel p-4"><h5 className="fw-bold mb-3">Most Popular Treks</h5><div className="chart-box"><Bar data={{labels:d.popularTreks.map(x=>x.trek_name),datasets:[{label:'Number of Bookings',data:d.popularTreks.map(x=>x.booking_count),backgroundColor:'#2a9d8f',borderRadius:4}]}} options={{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}}}}/></div></div></div><div className="col-lg-6"><div className="panel p-4"><h5 className="fw-bold mb-3">Booking Status Distribution</h5><div className="chart-box"><Doughnut data={{labels:Object.keys(d.statusDistribution),datasets:[{data:Object.values(d.statusDistribution),backgroundColor:['#2a9d8f','#1b263b','#e76f51','#f4a261','#264653']}]}} options={{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom'}}}}/></div></div></div></div><div className="panel"><div className="p-4 border-bottom"><h5 className="fw-bold mb-0">Recent bookings</h5></div><div className="table-responsive"><table className="table table-hover align-middle mb-0"><thead><tr><th className="ps-4">Booking ID</th><th>User</th><th>Trek</th><th>Booking date</th><th>Status</th></tr></thead><tbody>{d.recentBookings.map(b=><tr key={b.id}><td className="ps-4 fw-semibold">B{String(b.id).slice(-5).toUpperCase()}</td><td>{b.user?.name}</td><td>{b.trek?.name}</td><td>{dateFmt(b.bookingDate)}</td><td><span className={`status-pill status-${b.status.toLowerCase()}`}>{b.status}</span></td></tr>)}</tbody></table></div><div className="p-3 text-end"><Link to="/admin/bookings" className="btn btn-sm btn-outline-primary rounded-pill">View all bookings <i className="bi bi-arrow-right ms-1"/></Link></div></div></>}
function ManageTreks({notify}){return <TrekBrowse notify={notify} admin={true}/>;}
function TrekForm({notify}){
  const {id}=useParams(),edit=Boolean(id),go=useNavigate();
  const [staff,setStaff]=useState([]);
  const [form,setForm]=useState({
    name:'',
    region:'Nepal',
    difficulty:'Moderate',
    duration:1,
    availableSlots:10,
    price:1200,
    avgTime:'6 h 30m',
    avgDistance:'12.0 km',
    avgGain:'+750 m',
    avgLoss:'-650 m',
    assignedStaffId:'',
    startDate:'',
    endDate:'',
    description:'',
    detailedDescription:''
  });
  const [busy,setBusy]=useState(false);
  const regions=['Nepal','Northern India','Southern India','Japan','Vietnam','Kyrgyzstan','Bhutan','Sri Lanka','China'];

  useEffect(()=>{
    api.get('/admin/staff').then(r=>setStaff(r.data.filter(s=>s.status==='Approved')));
    if(edit){
      api.get(`/treks/${id}`).then(r=>{
        const t=r.data;
        setForm({
          name:t.name||'',
          region:t.region||'Nepal',
          difficulty:t.difficulty||'Moderate',
          duration:t.duration||1,
          availableSlots:t.availableSlots||10,
          price:t.price!==undefined&&t.price!==null?t.price:1200,
          avgTime:t.avgTime||'6 h 30m',
          avgDistance:t.avgDistance||'12.0 km',
          avgGain:t.avgGain||'+750 m',
          avgLoss:t.avgLoss||'-650 m',
          assignedStaffId:t.assignedStaffId||'',
          startDate:t.startDate?.slice(0,10)||'',
          endDate:t.endDate?.slice(0,10)||'',
          description:t.description||'',
          detailedDescription:t.detailedDescription||''
        });
      }).catch(e=>notify(e.response?.data?.message||'Could not load trek.','danger'));
    }
  },[id]);

  const change=e=>{
    const name=e.target.name;
    const value=e.target.value;
    let updatedForm={...form,[name]:value};
    if(name==='startDate'&&form.duration){
      const start=new Date(value);
      const end=new Date(start);
      end.setDate(start.getDate()+parseInt(form.duration));
      updatedForm.endDate=end.toISOString().slice(0,10);
    }else if(name==='duration'&&form.startDate){
      const start=new Date(form.startDate);
      const end=new Date(start);
      end.setDate(start.getDate()+parseInt(value));
      updatedForm.endDate=end.toISOString().slice(0,10);
    }else if(name==='endDate'&&form.startDate){
      const start=new Date(form.startDate);
      const end=new Date(value);
      const diffTime=end-start;
      const diffDays=Math.ceil(diffTime/(1000*60*60*24));
      if(diffDays>=0)updatedForm.duration=diffDays+1;
    }else if(name==='endDate'&&form.duration){
      const end=new Date(value);
      const start=new Date(end);
      start.setDate(end.getDate()-parseInt(form.duration));
      updatedForm.startDate=start.toISOString().slice(0,10);
    }
    setForm(updatedForm);
  };

  async function submit(e){
    e.preventDefault();
    setBusy(true);
    try{
      const body=new FormData();
      Object.entries(form).forEach(([k,v])=>body.append(k,v));
      const file=e.target.image?.files?.[0];
      if(file)body.append('image',file);
      const r=edit?await api.patch(`/treks/${id}`,body):await api.post('/treks',body);
      notify(r.data.message);
      go('/admin/treks');
    }catch(e){
      notify(e.response?.data?.message||'Could not save trek.','danger');
    }finally{
      setBusy(false);
    }
  }

  return (
    <>
      <PageTitle
        eyebrow="TREK MANAGEMENT"
        title={edit?'Edit trek':'Add a trek'}
        subtitle="Configure trek identity, pricing, daily trail metrics, and schedule details."
      />
      <form className="panel p-4 p-lg-5 form-panel" onSubmit={submit}>
        {/* Section 1: Trek Overview */}
        <div className="mb-4 pb-2 border-bottom">
          <h5 className="fw-bold mb-1 text-primary"><i className="bi bi-info-circle me-2"/>General Information</h5>
          <p className="text-secondary small mb-0">Basic trek identity and region</p>
        </div>
        <div className="row g-4 mb-4">
          <div className="col-md-6">
            <label className="form-label fw-semibold">Trek name <span className="text-danger">*</span></label>
            <input className="form-control" name="name" value={form.name} onChange={change} required placeholder="e.g. Everest Base Camp Trek"/>
          </div>
          <div className="col-md-3">
            <label className="form-label fw-semibold">Region <span className="text-danger">*</span></label>
            <select className="form-select" name="region" value={form.region} onChange={change} required>
              {regions.map(r=><option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="col-md-3">
            <label className="form-label fw-semibold">Difficulty <span className="text-danger">*</span></label>
            <select className="form-select" name="difficulty" value={form.difficulty} onChange={change}>
              <option>Easy</option>
              <option>Moderate</option>
              <option>Difficult</option>
            </select>
          </div>
        </div>

        {/* Section 2: Pricing & Daily Trail Metrics */}
        <div className="mb-4 pb-2 border-bottom">
          <h5 className="fw-bold mb-1 text-primary"><i className="bi bi-speedometer2 me-2"/>Pricing & Daily Trail Metrics</h5>
          <p className="text-secondary small mb-0">Card badges and stats shown on trek browse and detail views</p>
        </div>
        <div className="row g-4 mb-4">
          <div className="col-md-4">
            <label className="form-label fw-semibold">Trek price ($ USD) <span className="text-danger">*</span></label>
            <div className="input-group">
              <span className="input-group-text">$</span>
              <input type="number" min="0" step="1" className="form-control" name="price" value={form.price} onChange={change} required placeholder="e.g. 1970"/>
            </div>
          </div>
          <div className="col-md-4">
            <label className="form-label fw-semibold">Time per day <span className="text-danger">*</span></label>
            <div className="input-group">
              <span className="input-group-text"><i className="bi bi-clock"/></span>
              <input className="form-control" name="avgTime" value={form.avgTime} onChange={change} required placeholder="e.g. 7 h 12m"/>
            </div>
          </div>
          <div className="col-md-4">
            <label className="form-label fw-semibold">Distance per day <span className="text-danger">*</span></label>
            <div className="input-group">
              <span className="input-group-text"><i className="bi bi-signpost-2"/></span>
              <input className="form-control" name="avgDistance" value={form.avgDistance} onChange={change} required placeholder="e.g. 14.6 km"/>
            </div>
          </div>
          <div className="col-md-6">
            <label className="form-label fw-semibold">Elevation gain per day (↑) <span className="text-danger">*</span></label>
            <div className="input-group">
              <span className="input-group-text text-success"><i className="bi bi-arrow-up-circle"/></span>
              <input className="form-control" name="avgGain" value={form.avgGain} onChange={change} required placeholder="e.g. +1196 m"/>
            </div>
          </div>
          <div className="col-md-6">
            <label className="form-label fw-semibold">Elevation loss per day (↓) <span className="text-danger">*</span></label>
            <div className="input-group">
              <span className="input-group-text text-danger"><i className="bi bi-arrow-down-circle"/></span>
              <input className="form-control" name="avgLoss" value={form.avgLoss} onChange={change} required placeholder="e.g. -789 m"/>
            </div>
          </div>
        </div>

        {/* Section 3: Schedule & Staff */}
        <div className="mb-4 pb-2 border-bottom">
          <h5 className="fw-bold mb-1 text-primary"><i className="bi bi-calendar-check me-2"/>Schedule & Staffing</h5>
          <p className="text-secondary small mb-0">Trek dates, participant capacity, and assigned guide</p>
        </div>
        <div className="row g-4 mb-4">
          <div className="col-md-6">
            <label className="form-label fw-semibold">Duration (days) <span className="text-danger">*</span></label>
            <input type="number" min="1" className="form-control" name="duration" value={form.duration} onChange={change} required/>
          </div>
          <div className="col-md-6">
            <label className="form-label fw-semibold">Available slots <span className="text-danger">*</span></label>
            <input type="number" min="1" className="form-control" name="availableSlots" value={form.availableSlots} onChange={change} required/>
          </div>
          <div className="col-md-6">
            <label className="form-label fw-semibold">Start date <span className="text-danger">*</span></label>
            <input type="date" className="form-control" name="startDate" value={form.startDate} onChange={change} required/>
          </div>
          <div className="col-md-6">
            <label className="form-label fw-semibold">End date <span className="text-danger">*</span></label>
            <input type="date" className="form-control" name="endDate" value={form.endDate} onChange={change} required/>
          </div>
          <div className="col-md-6">
            <label className="form-label fw-semibold">Assign approved staff</label>
            <select className="form-select" name="assignedStaffId" value={form.assignedStaffId} onChange={change}>
              <option value="">Not assigned (Pending)</option>
              {staff.map(s=><option key={s.id} value={s.id}>{s.name} — {s.email}</option>)}
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label fw-semibold">Cover image</label>
            <input type="file" accept="image/*" className="form-control" name="image"/>
          </div>
          <div className="col-12">
            <label className="form-label fw-semibold">Description</label>
            <textarea className="form-control" rows="3" name="description" value={form.description} onChange={change} placeholder="Describe the trail highlights, terrain, preparation tips..."/>
          </div>
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <label className="form-label fw-semibold mb-0">Detailed description (Markdown supported)</label>
              <span className="badge text-bg-light border text-secondary font-monospace" style={{fontSize:'0.72rem'}}>
                Markdown enabled: # Headings, **bold**, *italic*, - lists, `code`, &gt; quotes
              </span>
            </div>
            <textarea className="form-control font-monospace" rows="6" name="detailedDescription" value={form.detailedDescription} onChange={change} placeholder="### Day 1: Kathmandu to Lukla&#10;- Morning flight to Tenzing-Hillary Airport&#10;- **Trek duration**: 4 hours&#10;&#10;### Day 2: Namche Bazaar&#10;Acclimatization day with panoramic views of Mt. Everest..."/>
            {form.detailedDescription&&(
              <div className="mt-2 p-3 bg-light rounded-3 border">
                <small className="text-secondary fw-semibold d-block mb-2 text-uppercase" style={{letterSpacing:'0.5px'}}>
                  <i className="bi bi-eye me-1"/>Live Markdown Preview
                </small>
                <MarkdownView content={form.detailedDescription}/>
              </div>
            )}
          </div>
        </div>

        <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
          <Link to="/admin/treks" className="btn btn-outline-secondary rounded-pill px-4">Cancel</Link>
          <button className="btn btn-primary rounded-pill px-4" disabled={busy}>
            {busy?'Saving…':edit?'Save changes':'Create trek'}
          </button>
        </div>
      </form>
    </>
  );
}
function ManageUsers({notify}){const [users,setUsers]=useState(null),[search,setSearch]=useState('');async function load(){try{setUsers((await api.get('/admin/users',{params:{search}})).data)}catch(e){notify(e.response?.data?.message||'Could not load users.','danger')}}useEffect(()=>{load()},[]);async function toggle(u){try{const r=await api.patch(`/admin/users/${u.id}/toggle-blacklist`);notify(r.data.message);load()}catch(e){notify(e.response?.data?.message||'Action failed.','danger')}}return <><PageTitle eyebrow="ADMINISTRATION" title="Manage users" subtitle="Review registered trekkers and manage account access."/><form className="input-group search-input mb-4" onSubmit={e=>{e.preventDefault();load()}}><span className="input-group-text"><i className="bi bi-search"/></span><input className="form-control" placeholder="Search by name or ID" value={search} onChange={e=>setSearch(e.target.value)}/><button className="btn btn-primary">Search</button></form>{!users?<Loading/>:<div className="panel table-responsive"><table className="table table-hover align-middle mb-0"><thead><tr><th className="ps-4">User</th><th>Email</th><th>Status</th><th className="text-end pe-4">Action</th></tr></thead><tbody>{users.map(u=><tr key={u.id}><td className="ps-4"><strong>{u.name}</strong><div className="small text-secondary">U{String(u.id).slice(-5).toUpperCase()}</div></td><td>{u.email}</td><td><span className={`status-pill status-${u.status.toLowerCase()}`}>{u.status}</span></td><td className="text-end pe-4"><button className={`btn btn-sm rounded-pill ${u.status==='Blacklisted'?'btn-outline-success':'btn-outline-danger'}`} onClick={()=>toggle(u)}>{u.status==='Blacklisted'?'Unblock':'Blacklist'}</button></td></tr>)}</tbody></table></div>}</>}
function ManageStaff({notify}){const [staff,setStaff]=useState(null);async function load(){try{setStaff((await api.get('/admin/staff')).data)}catch(e){notify(e.response?.data?.message||'Could not load staff.','danger')}}useEffect(()=>{load()},[]);async function status(s,v){try{const r=await api.patch(`/admin/staff/${s.id}/status`,{status:v});notify(r.data.message);load()}catch(e){notify(e.response?.data?.message||'Action failed.','danger')}}return <><PageTitle eyebrow="ADMINISTRATION" title="Manage staff" subtitle="Approve guides and maintain staff account access."/><div className="panel table-responsive"><table className="table table-hover align-middle mb-0"><thead><tr><th className="ps-4">Staff member</th><th>Contact</th><th>Status</th><th className="text-end pe-4">Actions</th></tr></thead><tbody>{!staff?<tr><td colSpan="4"><Loading/></td></tr>:staff.map(s=><tr key={s.id}><td className="ps-4 fw-semibold">{s.name}</td><td>{s.email}</td><td><span className={`status-pill status-${s.status.toLowerCase()}`}>{s.status}</span></td><td className="text-end pe-4"><div className="d-flex justify-content-end gap-2 flex-wrap">{s.status!=='Approved'&&s.status!=='Blacklisted'&&<button className="btn btn-sm btn-outline-success rounded-pill" onClick={()=>status(s,'Approved')}>Approve</button>}{s.status!=='Rejected'&&s.status!=='Blacklisted'&&<button className="btn btn-sm btn-outline-danger rounded-pill" onClick={()=>status(s,'Rejected')}>Reject</button>}<button className="btn btn-sm btn-outline-secondary rounded-pill" onClick={()=>status(s,s.status==='Blacklisted'?'Approved':'Blacklisted')}>{s.status==='Blacklisted'?'Unblock':'Blacklist'}</button></div></td></tr>)}</tbody></table></div></>}
function AllBookings(){const [items,setItems]=useState(null);useEffect(()=>{api.get('/admin/bookings').then(r=>setItems(r.data)).catch(()=>setItems([]))},[]);return <><PageTitle eyebrow="ADMINISTRATION" title="Manage bookings" subtitle="Review booking activity across every trek."/>{items===null?<Loading/>:items.length?<div className="panel table-responsive"><table className="table table-hover align-middle mb-0"><thead><tr><th className="ps-4">Booking ID</th><th>User</th><th>Trek</th><th>Booking date</th><th>Status</th></tr></thead><tbody>{items.map(b=><tr key={b.id}><td className="ps-4 fw-semibold">B{String(b.id).slice(-5).toUpperCase()}</td><td>{b.user?.name||'Deleted user'}</td><td>{b.trek?.name||'Deleted trek'}</td><td>{dateFmt(b.bookingDate)}</td><td><span className={`status-pill status-${b.status.toLowerCase()}`}>{b.status}</span></td></tr>)}</tbody></table></div>:<div className="empty-state"><i className="bi bi-calendar2-week"/><h5>No bookings yet</h5></div>}</>}
function StaffDashboard({notify}){const [d,setD]=useState(null);async function load(){try{setD((await api.get('/staff/summary')).data)}catch(e){notify(e.response?.data?.message||'Could not load staff dashboard.','danger')}}useEffect(()=>{load()},[]);if(!d)return <Loading/>;return <><PageTitle eyebrow="STAFF WORKSPACE" title="Your assigned treks" subtitle="Coordinate participants and keep trek status up to date."/><div className="row g-3 mb-4">{[['Assigned treks',d.totalAssigned,'map'],['Open for booking',d.openTreks,'door-open'],['Participants',d.totalParticipants,'people']].map(([l,v,i])=><div className="col-md-4" key={l}><div className="stat-card"><div><span>{l}</span><strong>{v}</strong></div><i className={`bi bi-${i}`}/></div></div>)}</div>{d.treks.length?<div className="row g-4">{d.treks.map(t=><div className="col-sm-6 col-xl-4" key={t.id}><div className="card trek-card h-100 border-0 shadow-sm"><img className="card-img-top trek-image" src={imageFor(t)} alt={t.name}/><div className="card-body p-4"><span className={`status-pill status-${t.status.toLowerCase()}`}>{t.status}</span><h5 className="fw-bold mt-3">{t.name}</h5><p className="text-secondary small"><i className="bi bi-geo-alt me-1"/>{t.region}</p><div className="d-flex justify-content-between small text-secondary mb-3"><span>{t.duration} days</span><span>{t.availableSlots} slots</span></div><Link to={`/staff/trek/${t.id}`} className="btn btn-outline-primary rounded-pill w-100">Manage trek</Link></div></div></div>)}</div>:<div className="empty-state"><i className="bi bi-map"/><h5>No treks assigned</h5><p>Your assigned treks will appear here after the admin assigns them.</p></div>}</>}
function StaffTrek({notify}){const {id}=useParams(),[data,setData]=useState(null);async function load(){try{setData((await api.get(`/staff/treks/${id}`)).data)}catch(e){notify(e.response?.data?.message||'Could not load trek.','danger')}}useEffect(()=>{load()},[id]);async function status(s){try{const r=await api.patch(`/staff/treks/${id}/status`,{status:s});notify(r.data.message);load()}catch(e){notify(e.response?.data?.message||'Could not update status.','danger')}}if(!data)return <Loading/>;const t=data.trek;return <><Link to="/staff/dashboard" className="back-link"><i className="bi bi-arrow-left me-2"/>Back to dashboard</Link><PageTitle eyebrow="TREK OPERATIONS" title={t.name} subtitle={`${t.region} · ${t.duration} days`}/><div className="row g-4"><div className="col-lg-5"><div className="panel p-4"><img className="w-100 rounded-3 mb-3" style={{height:220,objectFit:'cover'}} src={imageFor(t)} alt={t.name}/><div className="mb-3"><span className={`status-pill status-${t.status.toLowerCase()}`}>{t.status}</span></div><label className="form-label">Update trek status</label><select id="trekStatus" className="form-select mb-3" defaultValue={t.status}><option>Approved</option><option>Open</option><option>Started</option><option>Completed</option></select><button className="btn btn-primary rounded-pill w-100" onClick={()=>status(document.getElementById('trekStatus').value)}>Save status</button><p className="small text-secondary mt-3 mb-0">Marking a trek completed automatically completes all active bookings.</p></div></div><div className="col-lg-7"><div className="panel"><div className="p-4 border-bottom"><h5 className="fw-bold mb-0">Participants ({data.bookings.length})</h5></div><div className="table-responsive"><table className="table table-hover mb-0"><thead><tr><th className="ps-4">Participant</th><th>Booking date</th><th>Status</th></tr></thead><tbody>{data.bookings.map(b=><tr key={b._id}><td className="ps-4">{b.user?.name}<div className="small text-secondary">{b.user?.email}</div></td><td>{dateFmt(b.bookingDate)}</td><td><span className={`status-pill status-${b.status.toLowerCase()}`}>{b.status}</span></td></tr>)}</tbody></table></div></div></div></div></>}
function Profile({notify,setUser}){const [form,setForm]=useState({name:'',email:'',password:''});useEffect(()=>{api.get('/auth/me').then(r=>setForm({name:r.data.user.name,email:r.data.user.email||'',password:''}))},[]);async function submit(e){e.preventDefault();try{const r=await api.patch('/profile',form);setUser(r.data.user);localStorage.setItem('trek-user',JSON.stringify(r.data.user));notify(r.data.message);setForm({...form,password:''})}catch(e){notify(e.response?.data?.message||'Could not update profile.','danger')}}return <><PageTitle eyebrow="ACCOUNT SETTINGS" title="Edit profile" subtitle="Keep your account information up to date."/><form className="panel p-4 p-lg-5 form-panel" onSubmit={submit}><div className="row g-4"><div className="col-md-6"><label className="form-label">Full name</label><input className="form-control" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required/></div><div className="col-md-6"><label className="form-label">Email / contact details</label><input className="form-control" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></div><div className="col-md-6"><label className="form-label">New password (optional)</label><input type="password" minLength="6" className="form-control" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder="Leave blank to keep current password"/></div></div><div className="text-end mt-4"><button className="btn btn-primary rounded-pill px-4">Save changes</button></div></form></>}
createRoot(document.getElementById('root')).render(<BrowserRouter><App/></BrowserRouter>);
