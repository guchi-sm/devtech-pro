// src/pages/NetworkTopology.jsx
// NetViz Pro Enterprise NOC — React Component
// Drop-in replacement for your old network topology visualizer
// Stack: React 18, Vite, Tailwind, React Router DOM

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

// ─────────────────────────────────────────────
//  Inject required external styles once
// ─────────────────────────────────────────────
function useExternalStyles() {
  useEffect(() => {
    const ids = ['leaflet-css', 'orbitron-font'];
    const hrefs = [
      'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css',
      'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Share+Tech+Mono&display=swap'
    ];
    hrefs.forEach((href, i) => {
      if (!document.getElementById(ids[i])) {
        const link = document.createElement('link');
        link.id = ids[i]; link.rel = 'stylesheet'; link.href = href;
        document.head.appendChild(link);
      }
    });
  }, []);
}

// ─────────────────────────────────────────────
//  Lazy-load Leaflet (not in npm deps, CDN)
// ─────────────────────────────────────────────
function useLeaflet(onReady) {
  const readyRef = useRef(false);
  useEffect(() => {
    if (window.L) { onReady(window.L); return; }
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
    script.onload = () => { readyRef.current = true; onReady(window.L); };
    document.head.appendChild(script);
  }, [onReady]);
}

// ─────────────────────────────────────────────
//  CONSTANTS
// ─────────────────────────────────────────────
const TILES = {
  dark:      'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
};

const DEVICE_TYPES = {
  cloud:    { emoji: '☁️',  color: '#d500f9', label: 'Cloud/ISP'   },
  router:   { emoji: '⬡',  color: '#00e5ff', label: 'Core Router' },
  firewall: { emoji: '🛡',  color: '#ff1744', label: 'Firewall'    },
  switch:   { emoji: '◈',  color: '#00e676', label: 'L3 Switch'   },
  server:   { emoji: '▣',  color: '#ffea00', label: 'Server'      },
  ap:       { emoji: '◉',  color: '#ff6d00', label: 'Access Point' },
  dc:       { emoji: '⬚',  color: '#00bcd4', label: 'Datacenter'  },
  endpoint: { emoji: '◇',  color: '#78909c', label: 'Endpoint'    },
};

const FALLBACK = { lat: -1.2921, lng: 36.8219, city: 'Nairobi' };

// ─────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────
const clamp  = (v, mn, mx) => Math.max(mn, Math.min(mx, v));
const lerp   = (a, b, t)   => a + (b - a) * t;
const fmtBw  = (gbps)      => gbps < 1 ? `${(gbps * 1000).toFixed(0)} Mbps` : `${gbps.toFixed(1)} Gbps`;
const fmtUTC = ()          => new Date().toISOString().replace('T', ' ').split('.')[0] + ' UTC';

function utilColor(u) {
  if (u > 0.85) return '#ff1744';
  if (u > 0.65) return '#ffea00';
  return '#00e5ff';
}
function cpuColor(v) {
  if (v > 80) return '#ff1744';
  if (v > 60) return '#ffea00';
  return '#00e676';
}
function hexToRgb(hex) {
  return [parseInt(hex.slice(1,3),16), parseInt(hex.slice(3,5),16), parseInt(hex.slice(5,7),16)];
}

// ─────────────────────────────────────────────
//  TOPOLOGY GENERATOR
// ─────────────────────────────────────────────
function generateTopology(lat, lng, city) {
  const s = 0.022;
  const r = (n=1) => (Math.random()-0.5)*n;
  const c = city.substring(0,3).toUpperCase();

  const devices = [
    { id:'isp-gw',      name:`${city.toUpperCase()}-ISP-GW`,  type:'cloud',    lat: lat+s*1.0+r(s*.2), lng: lng-s*.8+r(s*.2), ip:`196.${~~(Math.random()*50+200)}.10.1`,  vendor:'ISP Upstream/BGP Peer',    interfaces:4,  tags:['BGP','AS36925','MPLS','Tier-1'] },
    { id:'core-r1',     name:`${c}-CORE-R1`,                  type:'router',   lat: lat+s*.5+r(s*.1),  lng: lng+s*.1+r(s*.1),  ip:'10.0.0.1',                              vendor:'Cisco ASR 1002-X',         interfaces:12, tags:['OSPF','BGP','MPLS','QoS'] },
    { id:'fw-01',       name:'FW-PERIMETER-01',               type:'firewall', lat: lat+r(s*.2),       lng: lng+s*.5+r(s*.15), ip:'10.0.1.1',                              vendor:'Palo Alto PA-5260',        interfaces:8,  tags:['IPS','DPI','SSL-Inspect'] },
    { id:'sw-dist1',    name:`${c}-SW-DIST1`,                 type:'switch',   lat: lat-s*.4+r(s*.15), lng: lng-s*.3+r(s*.1),  ip:'10.1.0.1',                              vendor:'Cisco Catalyst 9500',      interfaces:48, tags:['VLAN','40GbE','LACP'] },
    { id:'sw-dist2',    name:`${c}-SW-DIST2`,                 type:'switch',   lat: lat-s*.4+r(s*.15), lng: lng+s*.4+r(s*.1),  ip:'10.1.0.2',                              vendor:'Cisco Catalyst 9400',      interfaces:48, tags:['VLAN','PoE+','LACP'] },
    { id:'srv-farm',    name:'DC-SERVER-FARM',                type:'server',   lat: lat-s*.9+r(s*.1),  lng: lng-s*.1+r(s*.1),  ip:'10.2.0.0/24',                           vendor:'Dell PowerEdge R750 ×16',  interfaces:32, tags:['VMware','NFS','vSAN'] },
    { id:'wifi-campus', name:'WIFI-CAMPUS-AP',                type:'ap',       lat: lat-s*.5+r(s*.1),  lng: lng+s*.7+r(s*.1),  ip:'10.3.0.0/22',                           vendor:'Cisco Aironet 9120 ×32',   interfaces:128,tags:['WiFi6E','WPA3','802.11ax'] },
    { id:'dr-site',     name:'DR-DATACENTER',                 type:'dc',       lat: lat+s*.2+r(s*.1),  lng: lng-s*1.0+r(s*.1), ip:'10.4.0.0/24',                           vendor:`${city} DR Facility`,      interfaces:24, tags:['Backup','Replication','DR'] },
  ];

  devices.forEach(d => {
    d.status  = d.id === 'sw-dist2' ? 'warn' : 'up';
    d.cpu     = ~~(Math.random()*55+10);
    d.mem     = ~~(Math.random()*50+20);
    d.bw_in   = +(Math.random()*8+0.5).toFixed(1);
    d.bw_out  = +(Math.random()*6+0.3).toFixed(1);
  });

  const connections = [
    { id:'l0',  from:'isp-gw',   to:'core-r1',    label:'10 GbE',    utilization: Math.random()*.4+0.5 },
    { id:'l1',  from:'core-r1',  to:'fw-01',       label:'10 GbE',    utilization: Math.random()*.4+0.4 },
    { id:'l2',  from:'fw-01',    to:'sw-dist1',    label:'10 GbE',    utilization: Math.random()*.35+0.3 },
    { id:'l3',  from:'fw-01',    to:'sw-dist2',    label:'10 GbE',    utilization: Math.random()*.3+0.55 },
    { id:'l4',  from:'sw-dist1', to:'srv-farm',    label:'40 GbE',    utilization: Math.random()*.3+0.4 },
    { id:'l5',  from:'sw-dist1', to:'wifi-campus', label:'10 GbE',    utilization: Math.random()*.3+0.2 },
    { id:'l6',  from:'sw-dist2', to:'wifi-campus', label:'10 GbE',    utilization: Math.random()*.3+0.25 },
    { id:'l7',  from:'sw-dist1', to:'sw-dist2',    label:'10G LAG',   utilization: Math.random()*.2+0.2 },
    { id:'l8',  from:'core-r1',  to:'dr-site',     label:'MPLS',      utilization: Math.random()*.3+0.3 },
    { id:'l9',  from:'srv-farm', to:'dr-site',     label:'Replication',utilization:Math.random()*.2+0.15 },
    { id:'l10', from:'isp-gw',   to:'dr-site',     label:'Failover',  utilization: Math.random()*.15+0.05 },
  ];

  return { devices, connections };
}

// ─────────────────────────────────────────────
//  SPARKLINE
// ─────────────────────────────────────────────
function Sparkline({ data, color }) {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const dpr = window.devicePixelRatio || 1;
    c.width  = c.offsetWidth  * dpr;
    c.height = c.offsetHeight * dpr;
    const ctx = c.getContext('2d');
    ctx.scale(dpr, dpr);
    const W = c.offsetWidth, H = c.offsetHeight;
    ctx.clearRect(0,0,W,H);
    if (!data.length) return;
    const max = Math.max(...data, 1);
    const pts = data.map((v,i) => ({ x: i*(W/(data.length-1)), y: H-(v/max)*(H-4)-2 }));
    const [r,g,b] = hexToRgb(color);
    const grad = ctx.createLinearGradient(0,0,0,H);
    grad.addColorStop(0, `rgba(${r},${g},${b},0.3)`);
    grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
    ctx.beginPath();
    ctx.moveTo(pts[0].x, H);
    pts.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.lineTo(pts[pts.length-1].x, H);
    ctx.fillStyle = grad; ctx.fill();
    ctx.beginPath();
    pts.forEach((p,i) => i===0 ? ctx.moveTo(p.x,p.y) : ctx.lineTo(p.x,p.y));
    ctx.strokeStyle = color; ctx.lineWidth = 1.5; ctx.stroke();
  }, [data, color]);
  return <canvas ref={ref} style={{ width:'100%', height:'36px', display:'block' }}/>;
}

// ─────────────────────────────────────────────
//  DEVICE POPUP (rendered into Leaflet popup DOM)
// ─────────────────────────────────────────────
function buildPopupHTML(d) {
  const type = DEVICE_TYPES[d.type] || DEVICE_TYPES.endpoint;
  const sc   = d.status==='up' ? '#00e676' : d.status==='warn' ? '#ffea00' : '#ff1744';
  const cc   = cpuColor(d.cpu||0);
  const mc   = cpuColor(d.mem||0);
  return `
  <div style="padding:16px;width:268px;font-family:'DM Sans',sans-serif;color:#fff;">
    <div style="display:flex;gap:12px;align-items:flex-start;margin-bottom:12px">
      <div style="font-size:26px">${type.emoji}</div>
      <div style="flex:1">
        <div style="font-size:14px;font-weight:700">${d.name}</div>
        <div style="font-family:'Share Tech Mono',monospace;font-size:9px;color:rgba(255,255,255,0.4);margin-top:2px">${d.vendor}</div>
        <div style="font-family:'Share Tech Mono',monospace;font-size:10px;color:#00e5ff;margin-top:3px">${d.ip}</div>
        <div style="display:flex;align-items:center;gap:6px;margin-top:5px">
          <div style="width:6px;height:6px;border-radius:50%;background:${sc};box-shadow:0 0 5px ${sc}"></div>
          <span style="font-family:'Share Tech Mono',monospace;font-size:10px;color:${sc}">${d.status.toUpperCase()} · ${d.interfaces} INTERFACES</span>
        </div>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:7px">
      ${[
        ['CPU',`${d.cpu||0}%`,cc],['MEM',`${d.mem||0}%`,mc],
        ['IN',fmtBw(d.bw_in||0),'#00e676'],['OUT',fmtBw(d.bw_out||0),'#00e5ff']
      ].map(([label,val,col])=>`
        <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:7px;padding:8px">
          <div style="font-family:'Share Tech Mono',monospace;font-size:8px;color:rgba(255,255,255,0.3);letter-spacing:2px">${label}</div>
          <div style="font-family:'Share Tech Mono',monospace;font-size:15px;color:${col};margin-top:2px">${val}</div>
        </div>`).join('')}
    </div>
    <div style="display:flex;gap:5px;flex-wrap:wrap;margin-top:10px">
      ${(d.tags||[]).map(t=>`<span style="padding:2px 8px;border-radius:3px;font-family:'Share Tech Mono',monospace;font-size:9px;background:rgba(0,229,255,0.08);border:1px solid rgba(0,229,255,0.2);color:#00e5ff">${t}</span>`).join('')}
    </div>
  </div>`;
}

// ─────────────────────────────────────────────
//  PACKET ENGINE CLASS
// ─────────────────────────────────────────────
class PacketEngine {
  constructor() {
    this.packets = []; this.id = 0;
    this.mapRef = null; this.devMap = {}; this.connections = [];
    this._spawnTimer = null; this._threatTimer = null;
    this.threatNodes = new Set(); this.threatMode = false;
  }
  _pos(id) {
    const d = this.devMap[id];
    if (!d || !this.mapRef) return null;
    const p = this.mapRef.latLngToContainerPoint([d.lat, d.lng]);
    return { x: p.x, y: p.y };
  }
  _spawn(fromId, toId, props) {
    const s = this._pos(fromId), e = this._pos(toId);
    if (!s || !e) return;
    this.packets.push({ id: this.id++, fromId, toId, t: 0, currentPos:{...s}, alpha:0.9, ...props });
  }
  spawnNormal() {
    if (!this.connections.length) return;
    const c = this.connections[~~(Math.random()*this.connections.length)];
    const rev = Math.random()>.5;
    this._spawn(rev?c.to:c.from, rev?c.from:c.to, { color: utilColor(c.utilization||0.3), radius: 3+Math.random()*2, speed: 0.0008+Math.random()*0.0005 });
  }
  spawnThreat() {
    const targets = [...this.threatNodes];
    if (!targets.length) return;
    const target = targets[~~(Math.random()*targets.length)];
    const inc = this.connections.filter(c => c.to===target||c.from===target);
    if (!inc.length) return;
    const conn = inc[~~(Math.random()*inc.length)];
    for (let i=0;i<4;i++) setTimeout(()=>this._spawn(conn.to===target?conn.from:conn.to, target, { color:'#ff1744', radius:4+Math.random()*3, speed:0.0014+Math.random()*0.001, type:'threat' }), i*55);
  }
  start() {
    this._spawnTimer = setInterval(()=>this.spawnNormal(), 340);
  }
  startThreat(nodes) {
    this.threatNodes = nodes;
    clearInterval(this._threatTimer);
    this._threatTimer = setInterval(()=>this.spawnThreat(), 110);
  }
  stopThreat() { clearInterval(this._threatTimer); this.threatNodes = new Set(); }
  stop() { clearInterval(this._spawnTimer); clearInterval(this._threatTimer); }
  update(dt) {
    this.packets = this.packets.filter(pkt => {
      pkt.t += pkt.speed * dt;
      if (pkt.t >= 1) return false;
      const s = this._pos(pkt.fromId), e = this._pos(pkt.toId);
      if (!s || !e) return false;
      const t = pkt.t, ease = t<.5 ? 2*t*t : -1+(4-2*t)*t;
      pkt.currentPos = { x: lerp(s.x,e.x,ease), y: lerp(s.y,e.y,ease) };
      if (t > 0.85) pkt.alpha = (1-t)/0.15;
      return true;
    });
    if (this.packets.length > 300) this.packets = this.packets.slice(-200);
  }
}

// ─────────────────────────────────────────────
//  CANVAS RENDERER HOOK
// ─────────────────────────────────────────────
function useCanvasRenderer(canvasRef, mapRef, devicesRef, connectionsRef, packetsRef, threatModeRef, threatNodesRef) {
  const rafRef  = useRef(null);
  const lastRef = useRef(0);

  useEffect(() => {
    const draw = (ts) => {
      rafRef.current = requestAnimationFrame(draw);
      if (ts - lastRef.current < 14) return; // ~72fps cap
      lastRef.current = ts;

      const canvas = canvasRef.current;
      const map    = mapRef.current;
      if (!canvas || !map) return;

      const W = window.innerWidth, H = window.innerHeight;
      if (canvas.width !== W || canvas.height !== H) { canvas.width = W; canvas.height = H; }

      const ctx   = canvas.getContext('2d');
      const devs  = devicesRef.current;
      const conns = connectionsRef.current;
      const pkts  = packetsRef.current;
      const threat= threatModeRef.current;
      const tnodes= threatNodesRef.current;

      ctx.clearRect(0, 0, W, H);

      const devMap = {};
      devs.forEach(d => devMap[d.id] = d);
      const getPos = (id) => {
        const d = devMap[id]; if (!d) return null;
        const p = map.latLngToContainerPoint([d.lat, d.lng]);
        return { x: p.x, y: p.y };
      };

      // ── Links ──
      conns.forEach(conn => {
        const p1 = getPos(conn.from), p2 = getPos(conn.to);
        if (!p1 || !p2) return;
        const col = threat && (tnodes.has(conn.from)||tnodes.has(conn.to)) ? '#ff1744' : utilColor(conn.utilization||0.3);
        const [r,g,b] = hexToRgb(col);

        // Glow
        ctx.save();
        ctx.beginPath(); ctx.moveTo(p1.x,p1.y); ctx.lineTo(p2.x,p2.y);
        ctx.strokeStyle=`rgba(${r},${g},${b},0.15)`; ctx.lineWidth=8;
        ctx.filter='blur(4px)'; ctx.stroke(); ctx.restore();

        // Core dashed line
        ctx.save();
        ctx.beginPath(); ctx.moveTo(p1.x,p1.y); ctx.lineTo(p2.x,p2.y);
        ctx.strokeStyle=`rgba(${r},${g},${b},0.75)`; ctx.lineWidth=1.5;
        ctx.setLineDash([6,4]); ctx.lineDashOffset=-(ts*0.04)%10;
        ctx.stroke(); ctx.restore();
      });

      // ── Threat halos ──
      if (threat) {
        devs.forEach(d => {
          if (!tnodes.has(d.id)) return;
          const pos = getPos(d.id); if (!pos) return;
          const pulse = 0.3+0.3*Math.sin(ts*0.005);
          const grad = ctx.createRadialGradient(pos.x,pos.y,0,pos.x,pos.y,65);
          grad.addColorStop(0,`rgba(255,23,68,${pulse})`);
          grad.addColorStop(1,'transparent');
          ctx.save(); ctx.beginPath(); ctx.arc(pos.x,pos.y,65,0,Math.PI*2);
          ctx.fillStyle=grad; ctx.fill(); ctx.restore();
          // Ring
          ctx.save(); ctx.beginPath(); ctx.arc(pos.x,pos.y,28+5*Math.sin(ts*0.007),0,Math.PI*2);
          ctx.strokeStyle=`rgba(255,23,68,${0.5+0.3*Math.sin(ts*0.006)})`; ctx.lineWidth=2; ctx.stroke(); ctx.restore();
        });
      }

      // ── Packets ──
      pkts.forEach(pkt => {
        if (!pkt.currentPos) return;
        const [r,g,b] = hexToRgb(pkt.color||'#00e676');
        ctx.save();
        ctx.beginPath(); ctx.arc(pkt.currentPos.x, pkt.currentPos.y, pkt.radius||4, 0, Math.PI*2);
        ctx.fillStyle=`rgba(${r},${g},${b},${pkt.alpha||0.9})`;
        ctx.shadowBlur=12; ctx.shadowColor=pkt.color||'#00e676';
        ctx.fill(); ctx.restore();
      });
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);
}

// ─────────────────────────────────────────────
//  MAIN COMPONENT
// ─────────────────────────────────────────────
export default function NetworkTopologyVisualizer() {
  useExternalStyles();

  // ── State ──
  const [loading,     setLoading]     = useState(true);
  const [loadMsg,     setLoadMsg]     = useState('Initializing systems...');
  const [topology,    setTopology]    = useState({ devices:[], connections:[] });
  const [tileMode,    setTileMode]    = useState('dark');
  const [threatMode,  setThreatMode]  = useState(false);
  const [sidebarOpen, setSidebar]     = useState(true);
  const [selectedDev, setSelectedDev] = useState(null);
  const [cityName,    setCityName]    = useState('Detecting...');
  const [coords,      setCoords]      = useState(null);
  const [clock,       setClock]       = useState(fmtUTC());
  const [packets,     setPackets]     = useState([]);
  const [alerts,      setAlerts]      = useState([]);
  const [threatEvents,setThreatEvts]  = useState([]);
  const [threatNodes, setThreatNodes] = useState(new Set());
  const [threatPanel, setThreatPanel] = useState(false);
  const [sparkData,   setSparkData]   = useState(Array(50).fill(0).map(()=>Math.random()*70+15));
  const [traffic,     setTraffic]     = useState([
    { label:'NORTH', val:68, color:'#00e5ff' },
    { label:'SOUTH', val:52, color:'#00e676' },
    { label:'EAST',  val:81, color:'#ff1744' },
    { label:'WEST',  val:44, color:'#ffea00' },
  ]);

  // ── Refs ──
  const mapRef       = useRef(null);
  const tileRef      = useRef(null);
  const markersRef   = useRef({});
  const canvasRef    = useRef(null);
  const engineRef    = useRef(new PacketEngine());
  const topoRef      = useRef({ devices:[], connections:[] });
  const packetsRef   = useRef([]);
  const threatMRef   = useRef(false);
  const threatNRef   = useRef(new Set());

  // Keep refs in sync
  useEffect(() => { topoRef.current = topology; }, [topology]);
  useEffect(() => { threatMRef.current = threatMode; }, [threatMode]);
  useEffect(() => { threatNRef.current = threatNodes; }, [threatNodes]);

  // ── Canvas renderer (reads from refs to avoid re-creating rAF loop) ──
  useCanvasRenderer(
    canvasRef, mapRef,
    { current: topology.devices },
    { current: topology.connections },
    packetsRef,
    threatMRef,
    threatNRef,
  );

  // ── Geolocation + Map Init ──
  const initMap = useCallback((L, lat, lng) => {
    if (mapRef.current) return;

    const map = L.map('nvp-map', {
      center: [lat, lng], zoom: 14,
      zoomControl: true, attributionControl: false,
    });

    tileRef.current = L.tileLayer(TILES.dark, { maxZoom: 19 }).addTo(map);
    mapRef.current  = map;

    engineRef.current.mapRef = map;
    map.on('move zoom', () => {/* canvas redraws in rAF */});

    setLoading(false);
  }, []);

  useLeaflet(useCallback((L) => {
    const msgs = ['Detecting location...','Geocoding coordinates...','Loading map tiles...','Generating topology...','Starting telemetry...'];
    let i = 0;
    const iv = setInterval(() => { if(i<msgs.length) setLoadMsg(msgs[i++]); else clearInterval(iv); }, 400);

    const onGeo = (lat, lng, city) => {
      setCoords({ lat, lng });
      setCityName(city);
      setTimeout(() => initMap(L, lat, lng), 600);

      const topo = generateTopology(lat, lng, city.split(',')[0]);
      setTopology(topo);
      engineRef.current.devMap = Object.fromEntries(topo.devices.map(d => [d.id, d]));
      engineRef.current.connections = topo.connections;

      setTimeout(() => {
        topo.devices.forEach(d => createMarker(L, d));
      }, 900);

      setAlerts([
        { sev:'ok',       msg:`Topology loaded · ${city}`,              dev:'system'  },
        { sev:'warn',     msg:'SW-DIST2 CPU utilization at 78%',        dev:'sw-dist2'},
        { sev:'critical', msg:'FW-01: 847 blocked IPs/hr',              dev:'fw-01'   },
        { sev:'info',     msg:'BGP session CORE-R1 ↔ ISP-GW active',   dev:'core-r1' },
      ]);
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude:lat, longitude:lng } = pos.coords;
          try {
            const res  = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`, { headers:{'Accept-Language':'en'} });
            const data = await res.json();
            const city = data.address?.city || data.address?.town || data.address?.county || 'City';
            const cc   = data.address?.country_code?.toUpperCase() || '';
            onGeo(lat, lng, `${city}, ${cc}`);
          } catch { onGeo(lat, lng, 'Your Location'); }
        },
        () => onGeo(FALLBACK.lat, FALLBACK.lng, `${FALLBACK.city}, KE`),
        { timeout: 8000 }
      );
    } else {
      onGeo(FALLBACK.lat, FALLBACK.lng, `${FALLBACK.city}, KE`);
    }
  }, [initMap]));

  // ── Create Leaflet marker ──
  function createMarker(L, device) {
    if (!mapRef.current) return;
    const type = DEVICE_TYPES[device.type] || DEVICE_TYPES.endpoint;
    const col  = type.color;

    const icon = L.divIcon({
      className: '',
      html: `<div style="display:flex;flex-direction:column;align-items:center;cursor:pointer;filter:drop-shadow(0 0 8px ${col}66)">
        <div style="width:46px;height:46px;border-radius:50%;background:${col}18;border:2px solid ${col};display:flex;align-items:center;justify-content:center;font-size:20px;box-shadow:0 0 14px ${col}44">
          ${type.emoji}
        </div>
        <div style="margin-top:5px;padding:2px 8px;border-radius:3px;font-family:'Share Tech Mono',monospace;font-size:9px;letter-spacing:1px;color:rgba(255,255,255,0.9);white-space:nowrap;background:rgba(2,8,16,0.88);border:1px solid rgba(255,255,255,0.1)">
          ${device.name}
        </div>
      </div>`,
      iconSize:   [84, 72],
      iconAnchor: [42, 52],
    });

    const marker = L.marker([device.lat, device.lng], { icon, draggable: true });

    marker.bindPopup(buildPopupHTML(device), {
      maxWidth: 300,
      className: 'nvp-popup',
    });

    marker.on('dragend', () => {
      const ll = marker.getLatLng();
      setTopology(prev => ({
        ...prev,
        devices: prev.devices.map(d => d.id===device.id ? {...d, lat:ll.lat, lng:ll.lng} : d)
      }));
      engineRef.current.devMap[device.id] = { ...engineRef.current.devMap[device.id], lat: ll.lat, lng: ll.lng };
    });

    marker.on('click', () => {
      setSelectedDev(device.id);
      document.getElementById(`nvp-di-${device.id}`)?.scrollIntoView({ behavior:'smooth', block:'nearest' });
    });

    marker.addTo(mapRef.current);
    markersRef.current[device.id] = marker;
  }

  // ── Tile toggle ──
  useEffect(() => {
    const L = window.L;
    if (!mapRef.current || !tileRef.current || !L) return;
    mapRef.current.removeLayer(tileRef.current);
    tileRef.current = L.tileLayer(tileMode==='satellite' ? TILES.satellite : TILES.dark, { maxZoom:19 }).addTo(mapRef.current);
  }, [tileMode]);

  // ── Threat mode ──
  useEffect(() => {
    if (threatMode) {
      setThreatPanel(true);
      const nodes = new Set(['fw-01','core-r1']);
      setThreatNodes(nodes);
      engineRef.current.startThreat(nodes);

      const threatTpls = [
        { type:'DDOS_BURST',  msg:'DDoS burst: 48K req/s from 192 source IPs',     path:'ISP-GW → FW-01'   },
        { type:'PORT_SCAN',   msg:'Port scan: 65,535 ports in 12 seconds',           path:'EXTERNAL → FW-01' },
        { type:'BRUTE_FORCE', msg:'SSH brute-force: 2,847 attempts/min',             path:'EXTERNAL → CORE-R1'},
        { type:'C2_BEACON',   msg:'C2 beacon detected on TCP/8443',                  path:'SW-DIST2 → EXTERN' },
        { type:'DATA_EXFIL',  msg:'Anomalous outbound transfer: 4.2 GB/hr',          path:'SRV-FARM → EXTERN' },
      ];
      let ti = 0;
      const iv = setInterval(() => {
        const ev = threatTpls[ti++ % threatTpls.length];
        setThreatEvts(p => [{ ...ev, time: new Date().toISOString() }, ...p].slice(0, 15));
        setAlerts(p => [{ sev:'critical', msg: ev.msg, dev:'fw-01' }, ...p].slice(0, 30));
      }, 2200);
      return () => clearInterval(iv);
    } else {
      engineRef.current.stopThreat();
      setThreatNodes(new Set());
      setThreatPanel(false);
    }
  }, [threatMode]);

  // ── Packet engine ──
  useEffect(() => {
    engineRef.current.start();
    let last = performance.now();
    const iv = setInterval(() => {
      const now = performance.now();
      engineRef.current.update(now - last);
      last = now;
      packetsRef.current = [...engineRef.current.packets];
      setPackets(p => p.length !== engineRef.current.packets.length ? [...engineRef.current.packets] : p);
    }, 16);
    return () => { engineRef.current.stop(); clearInterval(iv); };
  }, []);

  // ── Mock telemetry (no backend) ──
  useEffect(() => {
    const iv = setInterval(() => {
      setTopology(prev => {
        const devs = prev.devices.map(d => ({
          ...d,
          cpu:    clamp(d.cpu+(Math.random()-.45)*6, 5, 99),
          mem:    clamp(d.mem+(Math.random()-.48)*3, 10, 99),
          bw_in:  clamp(d.bw_in+(Math.random()-.5)*.4, 0.1, 40),
          bw_out: clamp(d.bw_out+(Math.random()-.5)*.3, 0.05, 30),
        }));
        const conns = prev.connections.map(c => ({
          ...c, utilization: clamp((c.utilization||.3)+(Math.random()-.47)*.06, .05, .99)
        }));
        engineRef.current.devMap = Object.fromEntries(devs.map(d => [d.id, d]));
        engineRef.current.connections = conns;
        return { devices: devs, connections: conns };
      });
    }, 2500);
    return () => clearInterval(iv);
  }, []);

  // ── Traffic + Sparkline ──
  useEffect(() => {
    const iv = setInterval(() => {
      setTraffic(p => p.map(t => ({ ...t, val: clamp(t.val+(Math.random()-.46)*7, 10, 99) })));
      setSparkData(p => { const n=[...p.slice(1)]; n.push(Math.random()*80+10); return n; });
    }, 1200);
    return () => clearInterval(iv);
  }, []);

  // ── Clock ──
  useEffect(() => {
    const iv = setInterval(() => setClock(fmtUTC()), 1000);
    return () => clearInterval(iv);
  }, []);

  // ── Fit view ──
  const fitView = useCallback(() => {
    if (!mapRef.current || !topology.devices.length || !window.L) return;
    const bounds = window.L.latLngBounds(topology.devices.map(d => [d.lat, d.lng]));
    mapRef.current.fitBounds(bounds, { padding:[80,80], animate:true });
  }, [topology.devices]);

  // ── Derived stats ──
  const stats = useMemo(() => {
    const devs = topology.devices;
    return {
      up:       devs.filter(d=>d.status==='up').length,
      warn:     devs.filter(d=>d.status==='warn').length,
      critical: alerts.filter(a=>a.sev==='critical').length,
      totalBw:  devs.reduce((a,d)=>a+(d.bw_in||0),0),
      avgCpu:   devs.length ? (devs.reduce((a,d)=>a+(d.cpu||0),0)/devs.length).toFixed(0) : 0,
    };
  }, [topology.devices, alerts]);

  // ─────────────────────────────────────
  //  STYLES (scoped, no Tailwind conflicts)
  // ─────────────────────────────────────
  const css = `
    .nvp-wrap { position:fixed; inset:0; background:#020810; font-family:'DM Sans',sans-serif; overflow:hidden; z-index:50; }
    .nvp-map-container { position:absolute; inset:0; z-index:1; }
    #nvp-map { width:100%; height:100%; }
    .nvp-canvas { position:fixed; inset:0; pointer-events:none; z-index:500; }

    /* Leaflet dark overrides */
    .nvp-wrap .leaflet-control-zoom { border:1px solid rgba(0,229,255,0.15)!important; background:rgba(5,14,28,0.95)!important; border-radius:8px!important; }
    .nvp-wrap .leaflet-control-zoom a { color:#00e5ff!important; background:transparent!important; border-color:rgba(0,229,255,0.15)!important; }
    .nvp-wrap .leaflet-control-zoom a:hover { background:rgba(0,229,255,0.1)!important; }
    .nvp-wrap .leaflet-control-attribution { display:none!important; }
    .nvp-popup .leaflet-popup-content-wrapper { background:rgba(5,14,28,0.97)!important; border:1px solid rgba(0,229,255,0.25)!important; border-radius:10px!important; box-shadow:0 0 30px rgba(0,229,255,0.15),0 20px 60px rgba(0,0,0,0.8)!important; padding:0!important; }
    .nvp-popup .leaflet-popup-tip-container { display:none; }
    .nvp-popup .leaflet-popup-content { margin:0!important; }

    /* Top bar */
    .nvp-topbar { position:fixed;top:0;left:0;right:0;height:54px;z-index:2000;background:linear-gradient(180deg,rgba(2,8,16,0.98),rgba(2,8,16,0.88));border-bottom:1px solid rgba(0,229,255,0.12);backdrop-filter:blur(20px);display:flex;align-items:center;padding:0 16px;gap:0; }
    .nvp-logo { font-family:'Orbitron',sans-serif;font-size:14px;font-weight:900;color:#00e5ff;letter-spacing:3px;text-shadow:0 0 18px rgba(0,229,255,0.4);white-space:nowrap; }
    .nvp-logo-sub { font-family:'Share Tech Mono',monospace;font-size:8px;color:rgba(255,255,255,0.3);letter-spacing:2px;margin-top:1px; }
    .nvp-sep { width:1px;height:32px;background:rgba(0,229,255,0.12);margin:0 16px;flex-shrink:0; }
    .nvp-loc { display:flex;align-items:center;gap:8px;padding:5px 12px;background:rgba(0,229,255,0.07);border:1px solid rgba(0,229,255,0.2);border-radius:6px;flex-shrink:0; }
    .nvp-loc-dot { width:6px;height:6px;border-radius:50%;background:#00e676;box-shadow:0 0 6px #00e676;animation:nvpBlink 2s infinite; }
    .nvp-loc-name { font-family:'Share Tech Mono',monospace;font-size:11px;color:#fff;letter-spacing:1px; }
    .nvp-loc-coords { font-family:'Share Tech Mono',monospace;font-size:8px;color:rgba(255,255,255,0.35); }
    .nvp-stats { display:flex;gap:7px;margin-left:14px;flex:1;overflow:hidden; }
    .nvp-stat { display:flex;align-items:center;gap:6px;padding:4px 10px;border:1px solid rgba(0,229,255,0.1);border-radius:6px;background:rgba(255,255,255,0.02);flex-shrink:0; }
    .nvp-stat-lbl { font-family:'Share Tech Mono',monospace;font-size:8px;color:rgba(255,255,255,0.35);letter-spacing:1px;white-space:nowrap; }
    .nvp-stat-val { font-family:'Share Tech Mono',monospace;font-size:13px;font-weight:700;color:#00e5ff; }
    .nvp-stat-dot { width:6px;height:6px;border-radius:50%; }
    .nvp-controls { display:flex;gap:7px;margin-left:auto;flex-shrink:0; }
    .nvp-btn { display:flex;align-items:center;gap:6px;padding:5px 13px;border-radius:7px;border:1px solid rgba(0,229,255,0.15);background:transparent;font-family:'Share Tech Mono',monospace;font-size:9px;letter-spacing:1px;color:rgba(255,255,255,0.45);cursor:pointer;transition:all .2s;white-space:nowrap; }
    .nvp-btn:hover { border-color:rgba(0,229,255,0.35);color:#fff;background:rgba(0,229,255,0.06); }
    .nvp-btn.active { background:rgba(0,229,255,0.12);border-color:rgba(0,229,255,0.35);color:#00e5ff; }
    .nvp-btn.threat { border-color:rgba(255,23,68,0.25);color:rgba(255,23,68,0.55); }
    .nvp-btn.threat.active { background:rgba(255,23,68,0.1);border-color:rgba(255,23,68,0.45);color:#ff1744;box-shadow:0 0 12px rgba(255,23,68,0.25); }
    .nvp-dot-on  { width:7px;height:7px;border-radius:50%;background:#00e676;box-shadow:0 0 5px #00e676;animation:nvpBlink 2s infinite; }
    .nvp-dot-off { width:7px;height:7px;border-radius:50%;background:rgba(255,255,255,0.2); }
    .nvp-dot-threat { width:7px;height:7px;border-radius:50%;background:#ff1744;box-shadow:0 0 7px #ff1744;animation:nvpBlink .7s infinite; }
    .nvp-clock { font-family:'Share Tech Mono',monospace;font-size:10px;color:rgba(255,255,255,0.3);margin-left:12px;white-space:nowrap; }

    /* Sidebar */
    .nvp-sidebar { position:fixed;top:54px;left:0;bottom:0;width:290px;z-index:1900;background:rgba(5,14,28,0.96);border-right:1px solid rgba(0,229,255,0.1);backdrop-filter:blur(20px);display:flex;flex-direction:column;transition:transform .3s ease; }
    .nvp-sidebar.closed { transform:translateX(-290px); }
    .nvp-sec-hdr { padding:11px 15px;display:flex;align-items:center;gap:8px;border-bottom:1px solid rgba(0,229,255,0.08); }
    .nvp-sec-title { font-family:'Share Tech Mono',monospace;font-size:8px;letter-spacing:3px;color:#00e5ff;text-transform:uppercase;flex:1; }
    .nvp-sec-count { font-family:'Share Tech Mono',monospace;font-size:9px;color:rgba(255,255,255,0.3);background:rgba(255,255,255,0.04);padding:2px 7px;border-radius:10px; }

    /* Device rows */
    .nvp-dev-list { padding:6px;overflow-y:auto;max-height:320px; }
    .nvp-dev-list::-webkit-scrollbar { width:3px; }
    .nvp-dev-list::-webkit-scrollbar-thumb { background:rgba(0,229,255,0.2);border-radius:2px; }
    .nvp-dev-row { display:flex;align-items:center;gap:9px;padding:7px 9px;border-radius:8px;cursor:pointer;transition:all .15s;border:1px solid transparent;margin-bottom:2px; }
    .nvp-dev-row:hover { background:rgba(0,229,255,0.04);border-color:rgba(0,229,255,0.12); }
    .nvp-dev-row.sel { background:rgba(0,229,255,0.08);border-color:rgba(0,229,255,0.25); }
    .nvp-dev-row.thr { background:rgba(255,23,68,0.07)!important;border-color:rgba(255,23,68,0.25)!important; }
    .nvp-dev-icon { width:32px;height:32px;border-radius:7px;display:flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0; }
    .nvp-dev-name { font-size:11px;font-weight:600;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis; }
    .nvp-dev-sub { font-family:'Share Tech Mono',monospace;font-size:8px;color:rgba(255,255,255,0.35);margin-top:1px; }
    .nvp-dev-cpu { width:34px;height:3px;background:rgba(255,255,255,0.07);border-radius:2px;overflow:hidden; }
    .nvp-dev-cpu-fill { height:100%;border-radius:2px;transition:width 1s; }
    .nvp-dev-bw { font-family:'Share Tech Mono',monospace;font-size:8px;color:rgba(255,255,255,0.35); }
    .nvp-ring { width:8px;height:8px;border-radius:50%;flex-shrink:0; }
    .nvp-ring.up   { background:#00e676;box-shadow:0 0 5px #00e676;animation:nvpBlink 3s infinite; }
    .nvp-ring.warn { background:#ffea00;box-shadow:0 0 5px #ffea00;animation:nvpBlink 1.2s infinite; }
    .nvp-ring.down { background:#ff1744;box-shadow:0 0 5px #ff1744; }
    .nvp-ring.thr  { background:#ff1744;box-shadow:0 0 10px #ff1744,0 0 20px #ff1744;animation:nvpBlink .5s infinite; }

    /* Traffic */
    .nvp-traffic { padding:10px 15px 4px; }
    .nvp-t-row { display:flex;align-items:center;gap:9px;margin-bottom:7px; }
    .nvp-t-lbl { font-family:'Share Tech Mono',monospace;font-size:8px;color:rgba(255,255,255,0.35);width:46px; }
    .nvp-t-bar { flex:1;height:4px;background:rgba(255,255,255,0.06);border-radius:2px;overflow:hidden; }
    .nvp-t-fill { height:100%;border-radius:2px;transition:width 1.2s; }
    .nvp-t-val { font-family:'Share Tech Mono',monospace;font-size:8px;width:30px;text-align:right; }

    /* Alerts */
    .nvp-alerts { flex:1;overflow-y:auto;padding:5px 6px; }
    .nvp-alerts::-webkit-scrollbar { width:3px; }
    .nvp-alerts::-webkit-scrollbar-thumb { background:rgba(0,229,255,0.2);border-radius:2px; }
    .nvp-alert { padding:7px 9px;border-radius:6px;margin-bottom:4px;display:flex;gap:8px;align-items:flex-start;border-left:2px solid;animation:nvpFadeIn .4s; }
    .nvp-alert.critical { background:rgba(255,23,68,0.06);border-color:#ff1744; }
    .nvp-alert.warn     { background:rgba(255,234,0,0.05);border-color:#ffea00; }
    .nvp-alert.ok       { background:rgba(0,230,118,0.05);border-color:#00e676; }
    .nvp-alert.info     { background:rgba(0,229,255,0.04);border-color:#00e5ff; }
    .nvp-alert-msg  { font-size:11px;color:rgba(255,255,255,0.85);line-height:1.35; }
    .nvp-alert-meta { font-family:'Share Tech Mono',monospace;font-size:8px;color:rgba(255,255,255,0.3);margin-top:2px; }

    /* Threat panel */
    .nvp-threat-panel { position:fixed;top:54px;right:0;bottom:0;width:280px;z-index:1900;background:rgba(10,2,8,0.97);border-left:1px solid rgba(255,23,68,0.2);backdrop-filter:blur(20px);transform:translateX(100%);transition:transform .35s ease;display:flex;flex-direction:column; }
    .nvp-threat-panel.open { transform:translateX(0); }
    .nvp-thr-hdr { padding:15px;border-bottom:1px solid rgba(255,23,68,0.15);display:flex;align-items:center;gap:10px; }
    .nvp-thr-title { font-family:'Orbitron',sans-serif;font-size:11px;font-weight:700;color:#ff1744;letter-spacing:2px;flex:1; }
    .nvp-scan { padding:10px 15px;border-bottom:1px solid rgba(255,23,68,0.12); }
    .nvp-scan-line { height:2px;background:linear-gradient(90deg,transparent,#ff1744,transparent);animation:nvpScan 2s linear infinite; }
    .nvp-scan-lbl { font-family:'Share Tech Mono',monospace;font-size:8px;color:rgba(255,23,68,0.5);margin-top:5px;letter-spacing:3px; }
    .nvp-thr-events { flex:1;overflow-y:auto;padding:8px; }
    .nvp-thr-events::-webkit-scrollbar { width:3px; }
    .nvp-thr-events::-webkit-scrollbar-thumb { background:rgba(255,23,68,0.25);border-radius:2px; }
    .nvp-thr-ev { padding:9px;border-radius:7px;margin-bottom:5px;background:rgba(255,23,68,0.05);border:1px solid rgba(255,23,68,0.12);animation:nvpFadeIn .4s; }
    .nvp-thr-ev-type { font-family:'Share Tech Mono',monospace;font-size:8px;color:#ff1744;letter-spacing:2px;margin-bottom:3px; }
    .nvp-thr-ev-msg  { font-size:11px;color:rgba(255,255,255,0.85);line-height:1.4; }
    .nvp-thr-ev-path { font-family:'Share Tech Mono',monospace;font-size:8px;color:rgba(255,23,68,0.5);margin-top:3px; }
    .nvp-thr-ev-time { font-family:'Share Tech Mono',monospace;font-size:7px;color:rgba(255,255,255,0.2);margin-top:2px; }

    /* Map toggle */
    .nvp-map-toggle { position:fixed;top:66px;right:16px;z-index:1800;display:flex;border:1px solid rgba(0,229,255,0.15);border-radius:7px;overflow:hidden;backdrop-filter:blur(12px); }
    .nvp-map-toggle.shift { right:296px; }
    .nvp-map-btn { padding:5px 13px;font-family:'Share Tech Mono',monospace;font-size:8px;letter-spacing:1px;border:none;background:rgba(5,14,28,0.95);color:rgba(255,255,255,0.4);cursor:pointer;transition:all .2s; }
    .nvp-map-btn.active { background:rgba(0,229,255,0.1);color:#00e5ff; }

    /* Legend */
    .nvp-legend { position:fixed;bottom:78px;right:16px;z-index:1800;background:rgba(5,14,28,0.95);border:1px solid rgba(0,229,255,0.12);border-radius:10px;padding:13px 15px;backdrop-filter:blur(12px);min-width:148px;transition:right .35s; }
    .nvp-legend.shift { right:296px; }
    .nvp-leg-title { font-family:'Share Tech Mono',monospace;font-size:7px;letter-spacing:3px;color:rgba(255,255,255,0.25);margin-bottom:9px; }
    .nvp-leg-row { display:flex;align-items:center;gap:8px;margin-bottom:5px;font-size:10px;color:rgba(255,255,255,0.55); }
    .nvp-leg-dot { width:8px;height:8px;border-radius:50%;flex-shrink:0; }

    /* Toolbar */
    .nvp-toolbar { position:fixed;bottom:18px;left:50%;transform:translateX(-50%);z-index:2000;display:flex;align-items:center;gap:5px;background:rgba(5,14,28,0.96);border:1px solid rgba(0,229,255,0.12);border-radius:13px;padding:7px 14px;backdrop-filter:blur(16px);box-shadow:0 8px 32px rgba(0,0,0,0.5); }
    .nvp-tb-btn { display:flex;flex-direction:column;align-items:center;gap:2px;padding:7px 11px;border-radius:8px;border:1px solid transparent;background:transparent;color:rgba(255,255,255,0.4);font-family:'Share Tech Mono',monospace;font-size:7px;letter-spacing:1px;cursor:pointer;transition:all .15s;white-space:nowrap; }
    .nvp-tb-btn:hover { background:rgba(0,229,255,0.06);border-color:rgba(0,229,255,0.15);color:rgba(255,255,255,0.8); }
    .nvp-tb-btn.active { background:rgba(0,229,255,0.1);border-color:rgba(0,229,255,0.3);color:#00e5ff; }
    .nvp-tb-btn svg { width:17px;height:17px;stroke:currentColor;fill:none;stroke-width:1.8; }
    .nvp-tb-sep { width:1px;height:28px;background:rgba(0,229,255,0.1); }

    /* Loading */
    .nvp-loading { position:absolute;inset:0;z-index:9999;background:#020810;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px; }
    .nvp-loading.out { animation:nvpFadeOut .5s forwards; }
    .nvp-load-logo { font-family:'Orbitron',sans-serif;font-size:28px;font-weight:900;color:#00e5ff;letter-spacing:6px;text-shadow:0 0 20px rgba(0,229,255,0.4); }
    .nvp-load-sub { font-family:'Share Tech Mono',monospace;font-size:10px;color:rgba(255,255,255,0.35);letter-spacing:3px; }
    .nvp-load-bar { width:180px;height:2px;background:rgba(255,255,255,0.06);border-radius:1px;overflow:hidden; }
    .nvp-load-fill { height:100%;background:#00e5ff;box-shadow:0 0 8px #00e5ff;animation:nvpLoadFill 2s ease forwards; }
    .nvp-load-msg { font-family:'Share Tech Mono',monospace;font-size:8px;color:rgba(255,255,255,0.25);letter-spacing:2px; }

    /* WS badge */
    .nvp-ws { margin:7px 14px 10px;padding:6px 11px;border-radius:6px;display:flex;align-items:center;gap:7px;font-family:'Share Tech Mono',monospace;font-size:9px; }
    .nvp-ws.demo { background:rgba(0,229,255,0.05);border:1px solid rgba(0,229,255,0.15);color:rgba(0,229,255,0.6); }

    @keyframes nvpBlink    { 0%,100%{opacity:1}50%{opacity:.3} }
    @keyframes nvpFadeIn   { from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)} }
    @keyframes nvpFadeOut  { to{opacity:0;pointer-events:none} }
    @keyframes nvpScan     { 0%{transform:translateX(-100%)}100%{transform:translateX(100%)} }
    @keyframes nvpLoadFill { from{width:0}to{width:100%} }
  `;

  const shifted = threatPanel && threatMode;

  // ─────────────────────────────────
  //  RENDER
  // ─────────────────────────────────
  return (
    <div className="nvp-wrap">
      <style>{css}</style>

      {/* ── Map ── */}
      <div className="nvp-map-container">
        <div id="nvp-map"/>
      </div>

      {/* ── Canvas ── */}
      <canvas ref={canvasRef} className="nvp-canvas"/>

      {/* ── Loading ── */}
      {loading && (
        <div className={`nvp-loading`}>
          <div className="nvp-load-logo">NETVIZ PRO</div>
          <div className="nvp-load-sub">ENTERPRISE NOC DASHBOARD</div>
          <div className="nvp-load-bar"><div className="nvp-load-fill"/></div>
          <div className="nvp-load-msg">{loadMsg}</div>
        </div>
      )}

      {/* ── Top Bar ── */}
      <header className="nvp-topbar">
        <div style={{ display:'flex', flexDirection:'column' }}>
          <div className="nvp-logo">NETVIZ PRO</div>
          <div className="nvp-logo-sub">ENTERPRISE NOC</div>
        </div>
        <div className="nvp-sep"/>
        <div className="nvp-loc">
          <div className="nvp-loc-dot"/>
          <div>
            <div className="nvp-loc-name">{cityName}</div>
            {coords && <div className="nvp-loc-coords">{coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}</div>}
          </div>
        </div>
        <div className="nvp-stats">
          {[
            ['UP',    stats.up,       '#00e676'],
            ['WARN',  stats.warn,     '#ffea00'],
            ['CRIT',  stats.critical, '#ff1744'],
            ['BW',    fmtBw(stats.totalBw), '#00e5ff'],
            ['CPU',   `${stats.avgCpu}%`, cpuColor(+stats.avgCpu)],
            ['LINKS', topology.connections.length, '#00e5ff'],
          ].map(([lbl,val,col]) => (
            <div key={lbl} className="nvp-stat">
              <span className="nvp-stat-lbl">{lbl}</span>
              <span className="nvp-stat-val" style={{ color:col }}>{val}</span>
            </div>
          ))}
        </div>
        <div className="nvp-controls">
          <button
            className={`nvp-btn threat ${threatMode?'active':''}`}
            onClick={() => setThreatMode(p => !p)}
          >
            <div className={threatMode ? 'nvp-dot-threat' : 'nvp-dot-off'}/>
            ☠ THREAT
          </button>
          <button
            className={`nvp-btn ${sidebarOpen?'active':''}`}
            onClick={() => setSidebar(p => !p)}
          >
            ☰ PANEL
          </button>
        </div>
        <div className="nvp-clock">{clock}</div>
      </header>

      {/* ── Sidebar ── */}
      <nav className={`nvp-sidebar ${sidebarOpen?'':'closed'}`}>
        {/* Devices */}
        <div className="nvp-sec-hdr">
          <span className="nvp-sec-title">Network Devices</span>
          <span className="nvp-sec-count">{topology.devices.length}</span>
        </div>
        <div className="nvp-dev-list">
          {topology.devices.map(d => {
            const type = DEVICE_TYPES[d.type] || DEVICE_TYPES.endpoint;
            const isThr = threatNodes.has(d.id) && threatMode;
            return (
              <div
                key={d.id}
                id={`nvp-di-${d.id}`}
                className={`nvp-dev-row ${selectedDev===d.id?'sel':''} ${isThr?'thr':''}`}
                onClick={() => {
                  setSelectedDev(d.id);
                  if (mapRef.current && window.L) {
                    mapRef.current.setView([d.lat, d.lng], 16, { animate:true });
                    setTimeout(() => markersRef.current[d.id]?.openPopup(), 400);
                  }
                }}
              >
                <div className="nvp-dev-icon" style={{ background:`${type.color}14`, border:`1px solid ${type.color}30` }}>
                  {type.emoji}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div className="nvp-dev-name">{d.name}</div>
                  <div className="nvp-dev-sub">{d.type.toUpperCase()} · {d.ip}</div>
                </div>
                <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:3 }}>
                  <div className="nvp-dev-cpu">
                    <div className="nvp-dev-cpu-fill" style={{ width:`${d.cpu||0}%`, background:cpuColor(d.cpu||0) }}/>
                  </div>
                  <div className="nvp-dev-bw">{fmtBw(d.bw_in||0)}</div>
                </div>
                <div className={`nvp-ring ${isThr?'thr':d.status||'up'}`}/>
              </div>
            );
          })}
        </div>

        {/* Traffic */}
        <div className="nvp-sec-hdr" style={{ marginTop:4 }}>
          <span className="nvp-sec-title">Traffic Flow</span>
        </div>
        <div className="nvp-traffic">
          {traffic.map(t => (
            <div key={t.label} className="nvp-t-row">
              <span className="nvp-t-lbl">{t.label}</span>
              <div className="nvp-t-bar"><div className="nvp-t-fill" style={{ width:`${t.val}%`, background:t.color }}/></div>
              <span className="nvp-t-val" style={{ color:t.color }}>{t.val.toFixed(0)}%</span>
            </div>
          ))}
        </div>
        <div style={{ padding:'0 14px 10px' }}>
          <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:7, color:'rgba(255,255,255,0.2)', letterSpacing:3, marginBottom:4 }}>AGGREGATE THROUGHPUT</div>
          <Sparkline data={sparkData} color="#00e5ff"/>
        </div>

        {/* Alerts */}
        <div className="nvp-sec-hdr">
          <span className="nvp-sec-title">Live Alerts</span>
          <span className="nvp-sec-count" style={{ color: stats.critical>0 ? '#ff1744' : undefined }}>{alerts.length}</span>
        </div>
        <div className="nvp-alerts">
          {alerts.slice(0,14).map((a,i) => (
            <div key={i} className={`nvp-alert ${a.sev}`}>
              <span style={{ fontSize:12, flexShrink:0 }}>
                {a.sev==='critical'?'⚠':a.sev==='warn'?'⚡':a.sev==='ok'?'✓':'ℹ'}
              </span>
              <div>
                <div className="nvp-alert-msg">{a.msg}</div>
                <div className="nvp-alert-meta">{(a.dev||'SYSTEM').toUpperCase()}</div>
              </div>
            </div>
          ))}
        </div>

        {/* WS status */}
        <div className="nvp-ws demo">
          <div style={{ width:6, height:6, borderRadius:'50%', background:'#00e5ff', boxShadow:'0 0 5px #00e5ff', animation:'nvpBlink 2s infinite' }}/>
          DEMO MODE — MOCK TELEMETRY ACTIVE
        </div>
      </nav>

      {/* ── Threat Panel ── */}
      <div className={`nvp-threat-panel ${threatPanel && threatMode ? 'open' : ''}`}>
        <div className="nvp-thr-hdr">
          <span style={{ fontSize:18 }}>☠</span>
          <div className="nvp-thr-title">THREAT INTELLIGENCE</div>
          <button style={{ background:'none', border:'none', color:'#ff1744', fontSize:16, cursor:'pointer', padding:4 }}
            onClick={() => setThreatPanel(false)}>✕</button>
        </div>
        <div className="nvp-scan">
          <div className="nvp-scan-line"/>
          <div className="nvp-scan-lbl">SCANNING NETWORK PERIMETER</div>
        </div>
        <div className="nvp-thr-events">
          {threatEvents.map((ev, i) => (
            <div key={i} className="nvp-thr-ev">
              <div className="nvp-thr-ev-type">⚠ {ev.type}</div>
              <div className="nvp-thr-ev-msg">{ev.msg}</div>
              {ev.path && <div className="nvp-thr-ev-path">PATH: {ev.path}</div>}
              <div className="nvp-thr-ev-time">{ev.time?.split('T')[1]?.split('.')[0]} UTC</div>
            </div>
          ))}
          {!threatEvents.length && (
            <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:10, color:'rgba(255,23,68,0.35)', textAlign:'center', marginTop:24 }}>
              ACTIVATING THREAT SENSORS...
            </div>
          )}
        </div>
        <div style={{ padding:'11px 15px', borderTop:'1px solid rgba(255,23,68,0.12)' }}>
          <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:8, color:'rgba(255,23,68,0.45)', letterSpacing:2 }}>
            COMPROMISED NODES: {threatNodes.size} · THREAT LEVEL: CRITICAL
          </div>
          <div style={{ height:3, background:'rgba(255,255,255,0.05)', borderRadius:2, marginTop:6, overflow:'hidden' }}>
            <div style={{ width:'73%', height:'100%', background:'#ff1744', boxShadow:'0 0 8px #ff1744', borderRadius:2 }}/>
          </div>
        </div>
      </div>

      {/* ── Map Layer Toggle ── */}
      <div className={`nvp-map-toggle ${shifted ? 'shift' : ''}`}>
        <button className={`nvp-map-btn ${tileMode==='dark'?'active':''}`} onClick={() => setTileMode('dark')}>DARK</button>
        <button className={`nvp-map-btn ${tileMode==='satellite'?'active':''}`} onClick={() => setTileMode('satellite')}>SAT</button>
      </div>

      {/* ── Legend ── */}
      <div className={`nvp-legend ${shifted ? 'shift' : ''}`}>
        <div className="nvp-leg-title">DEVICE TYPES</div>
        {Object.entries(DEVICE_TYPES).map(([k,v]) => (
          <div key={k} className="nvp-leg-row">
            <div className="nvp-leg-dot" style={{ background:v.color, boxShadow:`0 0 4px ${v.color}` }}/>
            {v.label}
          </div>
        ))}
        <div style={{ marginTop:9, borderTop:'1px solid rgba(0,229,255,0.1)', paddingTop:8 }}>
          <div className="nvp-leg-title">LINK LOAD</div>
          {[['#00e5ff','< 65%'],['#ffea00','65–85%'],['#ff1744','> 85%']].map(([c,l]) => (
            <div key={l} className="nvp-leg-row"><div className="nvp-leg-dot" style={{ background:c }}/>{l}</div>
          ))}
        </div>
      </div>

      {/* ── Bottom Toolbar ── */}
      <div className="nvp-toolbar">
        <button className="nvp-tb-btn" onClick={fitView} title="Fit all devices">
          <svg viewBox="0 0 24 24"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
          FIT VIEW
        </button>
        <div className="nvp-tb-sep"/>
        <button className={`nvp-tb-btn ${sidebarOpen?'active':''}`} onClick={() => setSidebar(p=>!p)}>
          <svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/></svg>
          SIDEBAR
        </button>
        <button className={`nvp-tb-btn ${threatPanel&&threatMode?'active':''}`}
          onClick={() => setThreatPanel(p=>!p)} disabled={!threatMode}
          style={{ opacity: threatMode?1:0.3 }}>
          <svg viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          THREATS
        </button>
        <div className="nvp-tb-sep"/>
        <button className="nvp-tb-btn" onClick={() => {
          const city = cityName.split(',')[0];
          if (!coords || !window.L) return;
          Object.values(markersRef.current).forEach(m => mapRef.current?.removeLayer(m));
          markersRef.current = {};
          const topo = generateTopology(coords.lat, coords.lng, city);
          setTopology(topo);
          engineRef.current.devMap = Object.fromEntries(topo.devices.map(d => [d.id, d]));
          engineRef.current.connections = topo.connections;
          topo.devices.forEach(d => createMarker(window.L, d));
        }}>
          <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14"/></svg>
          RESCAN
        </button>
      </div>
    </div>
  );
}
