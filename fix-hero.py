lines = open('src/App.jsx').readlines()

hero = '''          <header style={{position:"sticky",top:0,zIndex:40}}>
            <div style={{position:"relative",height:180,background:"url('https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&q=80') center/cover",overflow:"hidden"}}>
              <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(47,93,80,0.95) 0%,rgba(47,93,80,0.4) 50%,rgba(47,93,80,0.2) 100%)"}}/>
              <div style={{position:"absolute",top:16,left:16,right:16,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{fontFamily:"'Inter',sans-serif",fontSize:20,fontWeight:600,color:T.fog}}>
                  <span style={{fontFamily:"'Caveat',cursive",fontSize:26,fontWeight:700}}>go</span> janey<span style={{color:T.amber}}>.</span>
                </div>
                <div style={{fontFamily:"'Inter',sans-serif",fontSize:11,color:"rgba(245,243,239,0.6)"}}>Boulder, CO</div>
              </div>
              <div style={{position:"absolute",bottom:16,left:16,right:16}}>
                <div style={{fontFamily:"'Inter',sans-serif",fontSize:22,fontWeight:600,color:T.fog,lineHeight:1.2}}>
                  {activeFilter==="Today"&&"Happening today"}{activeFilter==="Tomorrow"&&"Tomorrow in Boulder"}{activeFilter==="This Weekend"&&"This weekend"}{activeFilter==="Coming Up"&&"Coming up soon"}
                </div>
                <div style={{fontFamily:"'Inter',sans-serif",fontSize:12,color:"rgba(245,243,239,0.6)",marginTop:6}}>
                  {filtered.length} {filtered.length===1?"event":"events"} in Boulder
                </div>
              </div>
            </div>
            <div style={{background:T.pine,padding:"10px 16px",display:"flex",gap:6,justifyContent:"center"}}>
              {FILTERS.map(f=>(<button key={f} onClick={()=>setFilter(f)} style={{padding:"4px 9px",background:activeFilter===f?T.amber:"rgba(245,243,239,0.1)",color:activeFilter===f?T.charcoal:"rgba(245,243,239,0.6)",border:"none",fontFamily:"'Inter',sans-serif",fontSize:10,fontWeight:700,letterSpacing:"0.04em",textTransform:"uppercase",cursor:"pointer",transition:"all .18s"}}>{f}</button>))}
            </div>
            <div style={{background:T.pine,display:"flex",gap:6,padding:"0 16px 12px",justifyContent:"center"}}>
              {CATEGORIES.map(c=>{const isA=activeCat===c.id;const meta=c.id!=="all"?CAT_META[c.id]:null;return(<button key={c.id} onClick={()=>setCat(c.id)} style={{flexShrink:0,padding:"5px 12px",background:isA?(meta?.bg||"rgba(245,243,239,0.9)"):"rgba(245,243,239,0.1)",color:isA?(meta?.color||T.charcoal):"rgba(245,243,239,0.6)",border:"0.5px solid "+(isA?(meta?.color||T.fog):"rgba(245,243,239,0.2)"),fontFamily:"'Inter',sans-serif",fontSize:12,fontWeight:isA?700:500,cursor:"pointer",transition:"all .18s",whiteSpace:"nowrap"}}>{c.icon} {c.label}</button>);})}
            </div>
          </header>
'''

out = lines[:321] + [hero] + lines[350:]
open('src/App.jsx','w').writelines(out)
print("Done! Lines:", len(out))
