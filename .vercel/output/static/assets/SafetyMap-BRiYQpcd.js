const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/leaflet-src-DCrOTxid.js","assets/index-CzkQHexe.js"])))=>i.map(i=>d[i]);
import{r as i,_ as L,j as P}from"./index-CzkQHexe.js";import{d as O,i as B,S as k,a as S,I as $,f as N,H as m,b as D}from"./index-DE9zP-br.js";import"./types-CW2--ojl.js";function G(n,t,r){const a=t.status==="resolved"?S.resolved:$[t.incident_type]||$.other,c=D[t.incident_type]||D.other,s=36+Math.min(10,t.confirmations_count*2),x=t.status==="resolved"?"resolved":"",g=r?"marker-pulse":"",p=r?"marker-drop":"",l=k[t.severity]||k.medium,h=`
    <div class="incident-marker ${x} ${g} ${p}"
         style="width:${s}px;height:${s}px;background:${a};--pulse-color:${a}80;position:relative;">
      <span style="font-size:${Math.round(s*.44)}px;filter:drop-shadow(0 1px 1px rgba(0,0,0,0.3));">${c}</span>
      ${t.severity==="critical"||t.severity==="high"?`
        <span class="badge-urgent" style="position:absolute;top:-4px;right:-4px;width:12px;height:12px;border-radius:50%;background:${l};border:2px solid white;"></span>
      `:""}
    </div>
  `;return n.divIcon({html:h,className:"",iconSize:[s,s],iconAnchor:[s/2,s/2],popupAnchor:[0,-(s/2)-4]})}function H({L:n,user:t,radius:r,reports:a,pings:c,onVoteReport:s,onConfirmPing:x,onSelectReport:g}){const p=i.useRef(null),l=i.useRef(null),h=i.useRef(null),I=i.useRef(null),E=i.useRef(null),z=i.useRef(new Set);i.useEffect(()=>{if(!p.current||l.current)return;const o=n.map(p.current,{zoomControl:!1}).setView([t.lat,t.lng],15);return n.control.zoom({position:"bottomright"}).addTo(o),n.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:"© OpenStreetMap",maxZoom:19}).addTo(o),l.current=o,h.current=n.layerGroup().addTo(o),a.forEach(d=>z.current.add(d.id)),()=>{o.remove(),l.current=null}},[]),i.useEffect(()=>{const o=l.current;if(o){if(I.current)I.current.setLatLng([t.lat,t.lng]);else{const d=`<div style="position:relative;width:22px;height:22px;">
        <div style="position:absolute;inset:0;border-radius:9999px;background:oklch(0.55 0.16 155);border:3px solid white;box-shadow:0 0 0 2px oklch(0.55 0.16 155 / 0.4);"></div>
        <div style="position:absolute;inset:-6px;border-radius:9999px;border:2px solid oklch(0.55 0.16 155 / 0.3);"></div>
      </div>`;I.current=n.marker([t.lat,t.lng],{icon:n.divIcon({html:d,className:"",iconSize:[22,22],iconAnchor:[11,11]}),zIndexOffset:1e3}).addTo(o)}E.current&&E.current.remove(),E.current=n.circle([t.lat,t.lng],{radius:r,color:"oklch(0.55 0.16 155)",weight:2,fillColor:"oklch(0.55 0.16 155)",fillOpacity:.06,dashArray:"6 6"}).addTo(o)}},[t.lat,t.lng,r,n]),i.useEffect(()=>{const o=d=>{const b=d.detail,e=document.querySelector(`[data-report-id="${b}"]`);e&&(e.classList.add("marker-pulse"),setTimeout(()=>e.classList.remove("marker-pulse"),6e3))};return window.addEventListener("pulse-marker",o),()=>window.removeEventListener("pulse-marker",o)},[]);const _=i.useRef(s);_.current=s;const C=i.useRef(x);C.current=x;const T=i.useRef(g);return T.current=g,i.useEffect(()=>{const o=l.current,d=h.current;if(!o||!d)return;d.clearLayers();const b=new Set;a.forEach(e=>{b.add(e.id);const u=O(t,{lat:e.latitude,lng:e.longitude});if(u>r)return;const R=!z.current.has(e.id)||B(e.created_at,5),y=G(n,e,R),f=n.marker([e.latitude,e.longitude],{icon:y,zIndexOffset:e.status==="resolved"?100:500}).addTo(d),v=f.getElement();v&&v.setAttribute("data-report-id",e.id);const w=e.confirmations_count-e.flags_count,j=w>0?"#10b981":w<0?"#dc2626":"#777",A=k[e.severity]||k.medium,M=S[e.status]||S.active,U=`
        <div style="font-family:Inter,sans-serif;min-width:220px;max-width:280px;">
          <div style="display:flex;gap:6px;align-items:center;margin-bottom:8px;">
            <span style="background:${$[e.incident_type]||$.other};color:white;padding:2px 8px;border-radius:6px;font-size:11px;font-weight:700;text-transform:uppercase;">${e.incident_type}</span>
            <span style="background:${A};color:white;padding:2px 8px;border-radius:6px;font-size:11px;font-weight:700;text-transform:uppercase;">${e.severity}</span>
            <span style="background:${M};color:white;padding:2px 8px;border-radius:6px;font-size:11px;font-weight:700;text-transform:uppercase;">${e.status}</span>
          </div>
          ${e.description?`<div style="font-size:13px;color:#444;margin-bottom:8px;line-height:1.4;">${V(e.description.slice(0,120))}${e.description.length>120?"…":""}</div>`:""}
          <div style="font-size:12px;color:#777;margin-bottom:10px;display:flex;align-items:center;gap:4px;">
            📍 ${N(u)} away
          </div>
          <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;padding:8px 10px;background:#f3f4f6;border-radius:10px;margin-bottom:10px;">
            <span style="font-size:12px;color:#555;">Credibility</span>
            <span style="font-weight:800;font-size:14px;color:${j};">${w>0?"+":""}${w}</span>
          </div>
          <div style="display:flex;gap:6px;margin-bottom:8px;">
            <button id="up-${e.id}" title="Upvote — this looks accurate" style="flex:1;padding:7px 8px;border:0;border-radius:8px;background:#10b981;color:white;font-weight:600;cursor:pointer;font-size:12px;display:flex;align-items:center;justify-content:center;gap:4px;">
              👍 ${e.confirmations_count}
            </button>
            <button id="down-${e.id}" title="Debunk — this seems inaccurate" style="flex:1;padding:7px 8px;border:0;border-radius:8px;background:#dc2626;color:white;font-weight:600;cursor:pointer;font-size:12px;display:flex;align-items:center;justify-content:center;gap:4px;">
              👎 ${e.flags_count}
            </button>
          </div>
          <button id="detail-${e.id}" style="width:100%;padding:8px;border:2px solid #e5e7eb;border-radius:8px;background:white;color:#333;font-weight:600;cursor:pointer;font-size:12px;">
            View Full Details →
          </button>
        </div>`;f.bindPopup(U,{maxWidth:300,className:"incident-popup"}),f.on("popupopen",()=>{document.getElementById(`up-${e.id}`)?.addEventListener("click",()=>{_.current(e.id,"confirm"),o.closePopup()}),document.getElementById(`down-${e.id}`)?.addEventListener("click",()=>{_.current(e.id,"flag"),o.closePopup()}),document.getElementById(`detail-${e.id}`)?.addEventListener("click",()=>{T.current(e),o.closePopup()})})}),z.current=b,c.forEach(e=>{const u=O(t,{lat:e.latitude,lng:e.longitude});if(u>Math.max(r,1500))return;const R=`<div style="position:relative;width:32px;height:32px;">
        <div class="ping-ring" style="position:absolute;inset:0;border-radius:9999px;background:${m.danger};opacity:0.5;"></div>
        <div class="marker-glow-ring" style="position:absolute;inset:-8px;border-radius:9999px;border:2px solid ${m.danger};opacity:0.4;"></div>
        <div style="position:absolute;inset:6px;border-radius:9999px;background:${m.danger};border:3px solid white;display:flex;align-items:center;justify-content:center;">
          <span style="font-size:10px;">🚨</span>
        </div>
      </div>`,y=n.marker([e.latitude,e.longitude],{icon:n.divIcon({html:R,className:"",iconSize:[32,32],iconAnchor:[16,16]}),zIndexOffset:900}).addTo(d),f=new Intl.DateTimeFormat("en-US",{hour:"numeric",minute:"numeric",hour12:!0,month:"short",day:"numeric"}).format(new Date(e.created_at)),v=`
        <div style="font-family:Inter,sans-serif;min-width:200px;">
          <div style="font-weight:700;color:${m.danger};font-size:15px;margin-bottom:4px;">🚨 URGENT PING</div>
          <div style="font-size:12px;color:#555;margin-top:4px;">${N(u)} away · ${e.confirmations_count} confirms</div>
          <div style="font-size:11px;color:#777;margin-top:2px;">Pinged at ${f}</div>
          <button id="cping-${e.id}" style="margin-top:10px;width:100%;padding:8px 10px;border:0;border-radius:8px;background:${m.danger};color:white;font-weight:600;cursor:pointer;font-size:12px;">Confirm I see it</button>
        </div>`;y.bindPopup(v),y.on("popupopen",()=>{document.getElementById(`cping-${e.id}`)?.addEventListener("click",()=>{C.current(e.id),o.closePopup()})})})},[a,c,r,t,n]),P.jsx("div",{ref:p,className:"absolute inset-0"})}function Y(n){const[t,r]=i.useState(null);return i.useEffect(()=>{L(()=>import("./leaflet-src-DCrOTxid.js").then(a=>a.l),__vite__mapDeps([0,1])).then(a=>{const c=a.default;delete c.Icon.Default.prototype._getIconUrl,c.Icon.Default.mergeOptions({iconRetinaUrl:"https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",iconUrl:"https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",shadowUrl:"https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"}),r(c)})},[]),t?P.jsx(H,{L:t,...n}):null}function V(n){return n.replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}export{Y as default};
