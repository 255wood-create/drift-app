c = open('src/App.jsx').read()

old = '''      <div style={{flex:1,minWidth:0}}>
        <div style={{fontFamily:"Inter,sans-serif",fontSize:15,fontWeight:600,color:"#1F2320"}}>{event.title}</div>
        <div style={{fontFamily:"Inter,sans-serif",fontSize:13,color:"#6B706C",marginTop:2}}>{event.location}{timeStr?" · "+timeStr:""}</div>
      </div>
    </div>'''

new = '''      <div style={{flex:1,minWidth:0}}>
        <div style={{fontFamily:"Inter,sans-serif",fontSize:15,fontWeight:600,color:"#1F2320"}}>{event.title}</div>
        <div style={{fontFamily:"Inter,sans-serif",fontSize:13,color:"#6B706C",marginTop:2}}>{event.location}{timeStr?" · "+timeStr:""}</div>
      </div>
      <button onClick={e=>{e.stopPropagation();onSave();}} style={{background:"none",border:"none",cursor:"pointer",fontSize:18,opacity:saved?1:0.3,flexShrink:0,marginLeft:8,padding:4}}>{saved?"\\u2764":"\\u2661"}</button>
    </div>'''

c = c.replace(old, new)
open('src/App.jsx','w').write(c)
print("Save button added")
