import{r as n,j as P}from"./index-DgiHi__Q.js";import{L as i,d as T,i as U,S as k,a as L,I as $,f as O,H as f,b as N}from"./index-P_o94koY.js";import"./types-BojgJe0w.js";delete i.Icon.Default.prototype._getIconUrl;i.Icon.Default.mergeOptions({iconRetinaUrl:"https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",iconUrl:"https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",shadowUrl:"https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"});function B(t,r){const c=t.status==="resolved"?L.resolved:$[t.incident_type]||$.other,m=N[t.incident_type]||N.other,s=36+Math.min(10,t.confirmations_count*2),x=t.status==="resolved"?"resolved":"",g=r?"marker-pulse":"",l=r?"marker-drop":"",d=k[t.severity]||k.medium,h=`
    <div class="incident-marker ${x} ${g} ${l}"
         style="width:${s}px;height:${s}px;background:${c};--pulse-color:${c}80;position:relative;">
      <span style="font-size:${Math.round(s*.44)}px;filter:drop-shadow(0 1px 1px rgba(0,0,0,0.3));">${m}</span>
      ${t.severity==="critical"||t.severity==="high"?`
        <span class="badge-urgent" style="position:absolute;top:-4px;right:-4px;width:12px;height:12px;border-radius:50%;background:${d};border:2px solid white;"></span>
      `:""}
    </div>
  `;return i.divIcon({html:h,className:"",iconSize:[s,s],iconAnchor:[s/2,s/2],popupAnchor:[0,-(s/2)-4]})}function K({user:t,radius:r,reports:c,pings:m,onVoteReport:s,onConfirmPing:x,onSelectReport:g}){const l=n.useRef(null),d=n.useRef(null),h=n.useRef(null),I=n.useRef(null),E=n.useRef(null),z=n.useRef(new Set);n.useEffect(()=>{if(!l.current||d.current)return;const o=i.map(l.current,{zoomControl:!1}).setView([t.lat,t.lng],15);return i.control.zoom({position:"bottomright"}).addTo(o),i.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:"© OpenStreetMap",maxZoom:19}).addTo(o),d.current=o,h.current=i.layerGroup().addTo(o),c.forEach(a=>z.current.add(a.id)),()=>{o.remove(),d.current=null}},[]),n.useEffect(()=>{const o=d.current;if(o){if(I.current)I.current.setLatLng([t.lat,t.lng]);else{const a=`<div style="position:relative;width:22px;height:22px;">
        <div style="position:absolute;inset:0;border-radius:9999px;background:oklch(0.55 0.16 155);border:3px solid white;box-shadow:0 0 0 2px oklch(0.55 0.16 155 / 0.4);"></div>
        <div style="position:absolute;inset:-6px;border-radius:9999px;border:2px solid oklch(0.55 0.16 155 / 0.3);"></div>
      </div>`;I.current=i.marker([t.lat,t.lng],{icon:i.divIcon({html:a,className:"",iconSize:[22,22],iconAnchor:[11,11]}),zIndexOffset:1e3}).addTo(o)}E.current&&E.current.remove(),E.current=i.circle([t.lat,t.lng],{radius:r,color:"oklch(0.55 0.16 155)",weight:2,fillColor:"oklch(0.55 0.16 155)",fillOpacity:.06,dashArray:"6 6"}).addTo(o)}},[t.lat,t.lng,r]),n.useEffect(()=>{const o=a=>{const b=a.detail,e=document.querySelector(`[data-report-id="${b}"]`);e&&(e.classList.add("marker-pulse"),setTimeout(()=>e.classList.remove("marker-pulse"),6e3))};return window.addEventListener("pulse-marker",o),()=>window.removeEventListener("pulse-marker",o)},[]);const R=n.useRef(s);R.current=s;const _=n.useRef(x);_.current=x;const S=n.useRef(g);return S.current=g,n.useEffect(()=>{const o=d.current,a=h.current;if(!o||!a)return;a.clearLayers();const b=new Set;c.forEach(e=>{b.add(e.id);const p=T(t,{lat:e.latitude,lng:e.longitude});if(p>r)return;const C=!z.current.has(e.id)||U(e.created_at,5),y=B(e,C),u=i.marker([e.latitude,e.longitude],{icon:y,zIndexOffset:e.status==="resolved"?100:500}).addTo(a),v=u.getElement();v&&v.setAttribute("data-report-id",e.id);const w=e.confirmations_count-e.flags_count,M=w>0?"#10b981":w<0?"#dc2626":"#777",D=k[e.severity]||k.medium,j=L[e.status]||L.active,A=`
        <div style="font-family:Inter,sans-serif;min-width:220px;max-width:280px;">
          <div style="display:flex;gap:6px;align-items:center;margin-bottom:8px;">
            <span style="background:${$[e.incident_type]||$.other};color:white;padding:2px 8px;border-radius:6px;font-size:11px;font-weight:700;text-transform:uppercase;">${e.incident_type}</span>
            <span style="background:${D};color:white;padding:2px 8px;border-radius:6px;font-size:11px;font-weight:700;text-transform:uppercase;">${e.severity}</span>
            <span style="background:${j};color:white;padding:2px 8px;border-radius:6px;font-size:11px;font-weight:700;text-transform:uppercase;">${e.status}</span>
          </div>
          ${e.description?`<div style="font-size:13px;color:#444;margin-bottom:8px;line-height:1.4;">${G(e.description.slice(0,120))}${e.description.length>120?"…":""}</div>`:""}
          <div style="font-size:12px;color:#777;margin-bottom:10px;display:flex;align-items:center;gap:4px;">
            📍 ${O(p)} away
          </div>
          <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;padding:8px 10px;background:#f3f4f6;border-radius:10px;margin-bottom:10px;">
            <span style="font-size:12px;color:#555;">Credibility</span>
            <span style="font-weight:800;font-size:14px;color:${M};">${w>0?"+":""}${w}</span>
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
        </div>`;u.bindPopup(A,{maxWidth:300,className:"incident-popup"}),u.on("popupopen",()=>{document.getElementById(`up-${e.id}`)?.addEventListener("click",()=>{R.current(e.id,"confirm"),o.closePopup()}),document.getElementById(`down-${e.id}`)?.addEventListener("click",()=>{R.current(e.id,"flag"),o.closePopup()}),document.getElementById(`detail-${e.id}`)?.addEventListener("click",()=>{S.current(e),o.closePopup()})})}),z.current=b,m.forEach(e=>{const p=T(t,{lat:e.latitude,lng:e.longitude});if(p>Math.max(r,1500))return;const C=`<div style="position:relative;width:32px;height:32px;">
        <div class="ping-ring" style="position:absolute;inset:0;border-radius:9999px;background:${f.danger};opacity:0.5;"></div>
        <div class="marker-glow-ring" style="position:absolute;inset:-8px;border-radius:9999px;border:2px solid ${f.danger};opacity:0.4;"></div>
        <div style="position:absolute;inset:6px;border-radius:9999px;background:${f.danger};border:3px solid white;display:flex;align-items:center;justify-content:center;">
          <span style="font-size:10px;">🚨</span>
        </div>
      </div>`,y=i.marker([e.latitude,e.longitude],{icon:i.divIcon({html:C,className:"",iconSize:[32,32],iconAnchor:[16,16]}),zIndexOffset:900}).addTo(a),u=Math.max(0,Math.round((new Date(e.expires_at).getTime()-Date.now())/6e4)),v=`
        <div style="font-family:Inter,sans-serif;min-width:200px;">
          <div style="font-weight:700;color:${f.danger};font-size:15px;margin-bottom:4px;">🚨 URGENT PING</div>
          <div style="font-size:12px;color:#555;margin-top:4px;">${O(p)} away · ${e.confirmations_count} confirms</div>
          <div style="font-size:11px;color:#777;margin-top:2px;">Expires in ${u} min</div>
          <button id="cping-${e.id}" style="margin-top:10px;width:100%;padding:8px 10px;border:0;border-radius:8px;background:${f.danger};color:white;font-weight:600;cursor:pointer;font-size:12px;">Confirm I see it</button>
        </div>`;y.bindPopup(v),y.on("popupopen",()=>{document.getElementById(`cping-${e.id}`)?.addEventListener("click",()=>{_.current(e.id),o.closePopup()})})})},[c,m,r,t]),P.jsx("div",{ref:l,className:"absolute inset-0"})}function G(t){return t.replace(/[&<>"']/g,r=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[r])}export{K as default};
