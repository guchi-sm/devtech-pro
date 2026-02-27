import { useState, useEffect, useRef, useCallback } from 'react'
import * as d3 from 'd3'

const DEVICE_TYPES = {
  router:   { label: 'Router',    color: '#00f5a0', icon: '⬡' },
  switch:   { label: 'Switch',    color: '#00c3ff', icon: '◈' },
  firewall: { label: 'Firewall',  color: '#ff4d6d', icon: '⛨' },
  server:   { label: 'Server',    color: '#c77dff', icon: '▣' },
  ap:       { label: 'WiFi AP',   color: '#ffd60a', icon: '◉' },
  pc:       { label: 'PC/WS',     color: '#48cae4', icon: '▢' },
  cloud:    { label: 'Cloud/ISP', color: '#a8dadc', icon: '☁' },
}

const LINK_TYPES = {
  fiber:    { dash: '0',    speed: '10 Gbps',  color: '#00f5a0' },
  ethernet: { dash: '0',    speed: '1 Gbps',   color: '#00c3ff' },
  wireless: { dash: '6,3',  speed: '300 Mbps', color: '#ffd60a' },
  vpn:      { dash: '10,4', speed: '500 Mbps', color: '#c77dff' },
}

const INIT_NODES = [
  { id:'cloud', type:'cloud',    label:'Internet / ISP', status:'online',  ip:'0.0.0.0/0',   load:45 },
  { id:'fw1',   type:'firewall', label:'Firewall',        status:'online',  ip:'192.168.1.1', load:62 },
  { id:'r1',    type:'router',   label:'Core Router',     status:'online',  ip:'10.0.0.1',    load:38 },
  { id:'sw1',   type:'switch',   label:'Core Switch',     status:'online',  ip:'10.0.1.1',    load:54 },
  { id:'sw2',   type:'switch',   label:'Edge Switch',     status:'online',  ip:'10.0.2.1',    load:31 },
  { id:'srv1',  type:'server',   label:'Web Server',      status:'online',  ip:'10.0.1.10',   load:78 },
  { id:'srv2',  type:'server',   label:'DB Server',       status:'warning', ip:'10.0.1.11',   load:91 },
  { id:'ap1',   type:'ap',       label:'WiFi AP-01',      status:'online',  ip:'10.0.2.50',   load:22 },
  { id:'pc1',   type:'pc',       label:'WS-Finance',      status:'online',  ip:'10.0.2.101',  load:15 },
  { id:'pc2',   type:'pc',       label:'WS-Dev',          status:'offline', ip:'10.0.2.102',  load:0  },
]

const INIT_LINKS = [
  { source:'cloud', target:'fw1',  type:'fiber'    },
  { source:'fw1',   target:'r1',   type:'fiber'    },
  { source:'r1',    target:'sw1',  type:'fiber'    },
  { source:'r1',    target:'sw2',  type:'ethernet' },
  { source:'sw1',   target:'srv1', type:'ethernet' },
  { source:'sw1',   target:'srv2', type:'ethernet' },
  { source:'sw2',   target:'ap1',  type:'wireless' },
  { source:'ap1',   target:'pc1',  type:'wireless' },
  { source:'ap1',   target:'pc2',  type:'wireless' },
  { source:'srv1',  target:'srv2', type:'vpn'      },
]

let _nc = INIT_NODES.length
const sc = (s) => s === 'online' ? '#00f5a0' : s === 'warning' ? '#ffd60a' : '#ff4d6d'

function buildNodes(nodeG, sim, onSelect, nodesRef) {
  nodeG.selectAll('.ng').data(nodesRef.current, d => d.id).join(
    enter => {
      const g = enter.append('g').attr('class', 'ng').style('cursor', 'pointer')
      g.append('circle').attr('class', 'sr').attr('r', 22).attr('fill', 'none')
        .attr('stroke', d => sc(d.status)).attr('stroke-width', 1.5).attr('opacity', 0.5).attr('filter', 'url(#glow)')
      g.append('circle').attr('class', 'pr').attr('r', 22).attr('fill', 'none')
        .attr('stroke', d => sc(d.status)).attr('stroke-width', 0.8).attr('opacity', 0)
        .each(function (d) {
          if (d.status !== 'offline') {
            const el = d3.select(this);
            (function p() { el.attr('r', 22).attr('opacity', 0.4).transition().duration(1400).attr('r', 36).attr('opacity', 0).on('end', p) })()
          }
        })
      g.append('circle').attr('r', 18)
        .attr('fill', d => `${DEVICE_TYPES[d.type]?.color || '#336'}22`)
        .attr('stroke', d => DEVICE_TYPES[d.type]?.color || '#336').attr('stroke-width', 1.5)
      g.append('text').attr('text-anchor', 'middle').attr('dominant-baseline', 'central')
        .attr('font-size', 15).attr('fill', d => DEVICE_TYPES[d.type]?.color || '#fff').attr('filter', 'url(#glow)')
        .text(d => DEVICE_TYPES[d.type]?.icon || '?')
      g.append('circle').attr('class', 'sd').attr('cx', 13).attr('cy', -13).attr('r', 5)
        .attr('fill', d => sc(d.status)).attr('stroke', '#070d16').attr('stroke-width', 1.5)
      g.append('text').attr('text-anchor', 'middle').attr('dy', 32).attr('font-size', 9.5)
        .attr('font-family', "'JetBrains Mono',monospace").attr('fill', '#8899aa').text(d => d.label)
      g.append('text').attr('text-anchor', 'middle').attr('dy', 44).attr('font-size', 8.5)
        .attr('font-family', "'JetBrains Mono',monospace").attr('fill', '#3a5a7a').text(d => d.ip)
      g.call(d3.drag()
        .on('start', (e, d) => { if (!e.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y })
        .on('drag',  (e, d) => { d.fx = e.x; d.fy = e.y })
        .on('end',   (e, d) => { if (!e.active) sim.alphaTarget(0); d.fx = null; d.fy = null }))
      g.on('click', (e, d) => { e.stopPropagation(); onSelect({ ...d }) })
      g.attr('opacity', 0).transition().duration(400).attr('opacity', 1)
      return g
    },
    u => u,
    x => x.transition().duration(300).attr('opacity', 0).remove()
  )
}

export default function NetworkTopologyVisualizer() {
  const svgRef = useRef(null)
  const gRef   = useRef(null)
  const simRef = useRef(null)
  const nRef   = useRef(INIT_NODES.map(n => ({ ...n })))
  const lRef   = useRef(INIT_LINKS.map(l => ({ ...l })))
  const [sel, setSel]     = useState(null)
  const [stats, setStats] = useState({ on: 0, warn: 0, off: 0, lk: 0 })
  const [menu, setMenu]   = useState(false)

  const refreshStats = useCallback(() => {
    const n = nRef.current
    setStats({
      on:   n.filter(x => x.status === 'online').length,
      warn: n.filter(x => x.status === 'warning').length,
      off:  n.filter(x => x.status === 'offline').length,
      lk:   lRef.current.length,
    })
  }, [])

  const rebuildLinks = useCallback((g) => {
    g.select('.lG').selectAll('line').data(lRef.current).join('line')
      .attr('stroke', d => LINK_TYPES[d.type]?.color || '#336')
      .attr('stroke-width', d => d.type === 'fiber' ? 2.5 : 1.5)
      .attr('stroke-dasharray', d => LINK_TYPES[d.type]?.dash || '0')
      .attr('stroke-opacity', 0.55)
      .attr('marker-end', 'url(#arr)')
  }, [])

  useEffect(() => {
    const el = svgRef.current
    if (!el) return
    const W = el.clientWidth || 860
    const H = el.clientHeight || 520
    const svg = d3.select(el)
    svg.selectAll('*').remove()

    const defs = svg.append('defs')
    const f = defs.append('filter').attr('id', 'glow').attr('x', '-60%').attr('y', '-60%').attr('width', '220%').attr('height', '220%')
    f.append('feGaussianBlur').attr('stdDeviation', '3.5').attr('result', 'blur')
    const fm = f.append('feMerge')
    fm.append('feMergeNode').attr('in', 'blur')
    fm.append('feMergeNode').attr('in', 'SourceGraphic')
    defs.append('marker').attr('id', 'arr').attr('viewBox', '0 -5 10 10')
      .attr('refX', 22).attr('refY', 0).attr('markerWidth', 5).attr('markerHeight', 5).attr('orient', 'auto')
      .append('path').attr('d', 'M0,-5L10,0L0,5').attr('fill', '#223344')

    const bg = svg.append('g')
    for (let x = 0; x < W; x += 40)
      bg.append('line').attr('x1', x).attr('x2', x).attr('y1', 0).attr('y2', H).attr('stroke', '#121e2e').attr('stroke-width', 0.5)
    for (let y = 0; y < H; y += 40)
      bg.append('line').attr('x1', 0).attr('x2', W).attr('y1', y).attr('y2', y).attr('stroke', '#121e2e').attr('stroke-width', 0.5)

    const g = svg.append('g')
    gRef.current = g
    svg.call(d3.zoom().scaleExtent([0.25, 3]).on('zoom', e => g.attr('transform', e.transform)))

    const sim = d3.forceSimulation(nRef.current)
      .force('link',   d3.forceLink(lRef.current).id(d => d.id).distance(130).strength(0.9))
      .force('charge', d3.forceManyBody().strength(-450))
      .force('center', d3.forceCenter(W / 2, H / 2))
      .force('col',    d3.forceCollide(42))
    simRef.current = sim

    g.append('g').attr('class', 'lG')
    rebuildLinks(g)
    const nG = g.append('g').attr('class', 'nG')
    buildNodes(nG, sim, setSel, nRef)

    sim.on('tick', () => {
      g.select('.lG').selectAll('line')
        .attr('x1', d => d.source.x).attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x).attr('y2', d => d.target.y)
      g.selectAll('.ng').attr('transform', d => `translate(${d.x},${d.y})`)
    })

    const spawnPkt = () => {
      const ls = lRef.current
      if (!ls.length) return
      const lk  = ls[Math.floor(Math.random() * ls.length)]
      const sid = typeof lk.source === 'object' ? lk.source.id : lk.source
      const tid = typeof lk.target === 'object' ? lk.target.id : lk.target
      const src = nRef.current.find(n => n.id === sid)
      const tgt = nRef.current.find(n => n.id === tid)
      if (!src || !tgt || src.status === 'offline' || tgt.status === 'offline') return
      const lt  = LINK_TYPES[lk.type] || LINK_TYPES.ethernet
      const pkt = g.append('circle').attr('r', 4).attr('fill', lt.color).attr('filter', 'url(#glow)').attr('opacity', 0.9)
      const dur = 700 + Math.random() * 600
      const t0  = performance.now();
      (function tick(now) {
        const p = Math.min((now - t0) / dur, 1)
        pkt.attr('cx', src.x + (tgt.x - src.x) * p).attr('cy', src.y + (tgt.y - src.y) * p)
        if (p < 1) requestAnimationFrame(tick)
        else pkt.remove()
      })(performance.now())
    }
    const iv = setInterval(spawnPkt, 550)
    refreshStats()
    return () => { clearInterval(iv); sim.stop() }
  }, [refreshStats, rebuildLinks])

  const addNode = useCallback((type) => {
    setMenu(false)
    const id = `node_${++_nc}`
    const nn = {
      id, type,
      label:  `New ${DEVICE_TYPES[type].label}`,
      status: 'online',
      ip:     `10.99.0.${Math.floor(Math.random() * 200 + 10)}`,
      load:   Math.floor(Math.random() * 50 + 5),
      x: 300 + Math.random() * 260,
      y: 180 + Math.random() * 180,
    }
    nRef.current.push(nn)
    const avail = nRef.current.filter(n => n.id !== id && n.status === 'online')
    if (avail.length)
      lRef.current.push({ source: id, target: avail[Math.floor(Math.random() * avail.length)].id, type: 'ethernet' })
    const g = gRef.current
    const sim = simRef.current
    if (!g || !sim) return
    sim.nodes(nRef.current)
    sim.force('link').links(lRef.current)
    rebuildLinks(g)
    buildNodes(g.select('.nG'), sim, setSel, nRef)
    sim.alpha(0.5).restart()
    refreshStats()
  }, [refreshStats, rebuildLinks])

  const removeNode = useCallback(() => {
    if (!sel) return
    nRef.current = nRef.current.filter(n => n.id !== sel.id)
    lRef.current = lRef.current.filter(l => {
      const s = typeof l.source === 'object' ? l.source.id : l.source
      const t = typeof l.target === 'object' ? l.target.id : l.target
      return s !== sel.id && t !== sel.id
    })
    setSel(null)
    const g = gRef.current
    const sim = simRef.current
    if (!g || !sim) return
    sim.nodes(nRef.current)
    sim.force('link').links(lRef.current)
    rebuildLinks(g)
    buildNodes(g.select('.nG'), sim, setSel, nRef)
    sim.alpha(0.5).restart()
    refreshStats()
  }, [sel, refreshStats, rebuildLinks])

  const toggleStatus = useCallback(() => {
    if (!sel) return
    const n = nRef.current.find(x => x.id === sel.id)
    if (!n) return
    const cyc = { online: 'warning', warning: 'offline', offline: 'online' }
    n.status = cyc[n.status] || 'online'
    const g = gRef.current
    if (g) {
      g.selectAll('.ng').filter(d => d.id === n.id).select('.sr').attr('stroke', sc(n.status))
      g.selectAll('.ng').filter(d => d.id === n.id).select('.sd').attr('fill', sc(n.status))
    }
    setSel({ ...n })
    refreshStats()
  }, [sel, refreshStats])

  const connCount = sel
    ? lRef.current.filter(l => {
        const s = typeof l.source === 'object' ? l.source.id : l.source
        const t = typeof l.target === 'object' ? l.target.id : l.target
        return s === sel.id || t === sel.id
      }).length
    : 0

  return (
    <div className="flex flex-col rounded-2xl overflow-hidden border"
      style={{ background: '#070d16', borderColor: '#1a2a3a', fontFamily: "'JetBrains Mono','Courier New',monospace", minHeight: 620, boxShadow: '0 0 60px #00f5a015' }}>

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 px-6 py-4 border-b"
        style={{ background: '#090f1d', borderColor: '#1a2a3a' }}>
        <div className="flex items-center gap-4">
          <span style={{ fontSize: 28, color: '#00f5a0', filter: 'drop-shadow(0 0 10px #00f5a0)' }}>⬡</span>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#ddeeff', letterSpacing: 1 }}>Network Topology Visualizer</div>
            <div style={{ fontSize: 10, color: '#3a5a7a', marginTop: 2 }}>Interactive Infrastructure Map · Live Packet Simulation</div>
          </div>
        </div>
        <div className="flex gap-3 flex-wrap">
          {[
            { l: 'Online',  v: stats.on,   c: '#00f5a0' },
            { l: 'Warning', v: stats.warn, c: '#ffd60a' },
            { l: 'Offline', v: stats.off,  c: '#ff4d6d' },
            { l: 'Links',   v: stats.lk,   c: '#00c3ff' },
          ].map(x => (
            <div key={x.l} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border"
              style={{ background: '#101828', borderColor: '#1a2a3a' }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: x.c }} />
              <span style={{ color: x.c, fontWeight: 700, fontSize: 13 }}>{x.v}</span>
              <span style={{ fontSize: 10, color: '#4a5a6a' }}>{x.l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-wrap px-6 py-2.5 border-b"
        style={{ background: '#080c18', borderColor: '#1a2a3a', position: 'relative' }}>
        <div style={{ position: 'relative' }}>
          <button onClick={() => setMenu(v => !v)}
            className="px-4 py-1.5 rounded-lg border text-xs cursor-pointer hover:opacity-80 transition-opacity"
            style={{ background: '#0e1929', borderColor: '#1a3a5a', color: '#00c3ff', fontFamily: 'inherit' }}>
            ＋ Add Device
          </button>
          {menu && (
            <div className="absolute top-full left-0 mt-1 rounded-xl border p-1.5 z-50"
              style={{ background: '#0d1927', borderColor: '#1a3a5a', minWidth: 155 }}>
              {Object.entries(DEVICE_TYPES).map(([k, v]) => (
                <button key={k} onClick={() => addNode(k)}
                  className="flex items-center gap-2 w-full px-3 py-1.5 rounded-lg text-left text-xs hover:opacity-80 transition-opacity cursor-pointer"
                  style={{ background: 'none', border: 'none', color: '#99aacc', fontFamily: 'inherit' }}>
                  <span style={{ color: v.color }}>{v.icon}</span>{v.label}
                </button>
              ))}
            </div>
          )}
        </div>
        {sel && <>
          <button onClick={toggleStatus}
            className="px-4 py-1.5 rounded-lg border text-xs cursor-pointer hover:opacity-80 transition-opacity"
            style={{ background: '#0e1929', borderColor: '#2a2a0a', color: '#ffd60a', fontFamily: 'inherit' }}>
            ⟳ Toggle Status
          </button>
          <button onClick={removeNode}
            className="px-4 py-1.5 rounded-lg border text-xs cursor-pointer hover:opacity-80 transition-opacity"
            style={{ background: '#0e1929', borderColor: '#2a0a0a', color: '#ff4d6d', fontFamily: 'inherit' }}>
            ✕ Remove
          </button>
        </>}
        <div className="ml-auto text-xs" style={{ color: '#223344' }}>
          Drag nodes · Scroll to zoom · Click to inspect
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative" style={{ minHeight: 480 }}>
        <svg ref={svgRef} style={{ width: '100%', height: '100%', minHeight: 480 }}
          onClick={() => setSel(null)} />

        {/* Legend */}
        <div className="absolute bottom-4 left-4 rounded-xl border p-3"
          style={{ background: '#090f1dee', borderColor: '#1a2a3a', fontSize: 10, backdropFilter: 'blur(4px)', maxWidth: 175 }}>
          <div style={{ color: '#3a6a8a', fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>Link Types</div>
          {Object.entries(LINK_TYPES).map(([k, v]) => (
            <div key={k} className="flex items-center gap-2 mb-1">
              <svg width={34} height={10}><line x1={0} y1={5} x2={34} y2={5} stroke={v.color} strokeWidth={2} strokeDasharray={v.dash} /></svg>
              <span style={{ color: '#7799aa', flex: 1 }}>{k}</span>
              <span style={{ color: '#334455', fontSize: 9 }}>{v.speed}</span>
            </div>
          ))}
          <div style={{ color: '#3a6a8a', fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', marginTop: 10, marginBottom: 6 }}>Devices</div>
          {Object.entries(DEVICE_TYPES).map(([k, v]) => (
            <div key={k} className="flex items-center gap-2 mb-1">
              <span style={{ color: v.color, width: 18, fontSize: 13 }}>{v.icon}</span>
              <span style={{ color: '#7799aa' }}>{v.label}</span>
            </div>
          ))}
        </div>

        {/* Detail Panel */}
        {sel && (
          <div className="absolute top-4 right-4 rounded-xl border p-4"
            style={{ background: '#090f1df0', borderColor: '#1a3a5a', width: 230, backdropFilter: 'blur(8px)' }}>
            <div className="flex items-center gap-3 mb-4">
              <span style={{ color: DEVICE_TYPES[sel.type]?.color || '#fff', fontSize: 22 }}>{DEVICE_TYPES[sel.type]?.icon}</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#ddeeff' }}>{sel.label}</div>
                <div style={{ fontSize: 10, color: '#3a5a7a' }}>{DEVICE_TYPES[sel.type]?.label}</div>
              </div>
              <button onClick={() => setSel(null)}
                style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#334455', cursor: 'pointer', fontSize: 15 }}>✕</button>
            </div>
            {[
              { k: 'IP Address',  v: sel.ip },
              { k: 'Type',        v: DEVICE_TYPES[sel.type]?.label },
              { k: 'Connections', v: connCount },
            ].map(r => (
              <div key={r.k} className="flex items-center gap-2 mb-2.5">
                <span style={{ fontSize: 9, color: '#3a5a7a', width: 82, flexShrink: 0, textTransform: 'uppercase', letterSpacing: 1 }}>{r.k}</span>
                <span style={{ fontSize: 11, color: '#c8d8e8', fontWeight: 600 }}>{r.v}</span>
              </div>
            ))}
            <div className="flex items-center gap-2 mb-2.5">
              <span style={{ fontSize: 9, color: '#3a5a7a', width: 82, flexShrink: 0, textTransform: 'uppercase', letterSpacing: 1 }}>Status</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: sc(sel.status) }}>● {sel.status.toUpperCase()}</span>
            </div>
            <div className="flex items-center gap-2 mb-2.5">
              <span style={{ fontSize: 9, color: '#3a5a7a', width: 82, flexShrink: 0, textTransform: 'uppercase', letterSpacing: 1 }}>CPU Load</span>
              <div style={{ flex: 1, height: 5, background: '#1a2a3a', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: 3, width: `${sel.load}%`, background: sel.load > 80 ? '#ff4d6d' : sel.load > 60 ? '#ffd60a' : '#00f5a0' }} />
              </div>
              <span style={{ fontSize: 11, color: '#c8d8e8', fontWeight: 600, marginLeft: 6 }}>{sel.load}%</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}