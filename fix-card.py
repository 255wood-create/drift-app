with open('src/App.jsx', 'r') as f:
    content = f.read()

start = content.find('function EventCard(')
if start == -1:
    print("Not found")
    exit()

depth = 0
end = -1
for i in range(start, len(content)):
    if content[i] == '{': depth += 1
    elif content[i] == '}':
        depth -= 1
        if depth == 0:
            end = i + 1
            break

new_card = """function EventCard({event,saved,interested,onSave,onInterest,index,distMiles,timeBucket}){
  const meta=CAT_META[event.cat||event.category]||CAT_META.community;
  const timeStr=event.starts_at?new Date(event.starts_at).toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit"}):"";
  return(
    <div style={{padding:"12px 0",borderBottom:"0.5px solid #E8E4DF",animation:"cardUp .3s ease both",animationDelay:index*30+"ms",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontFamily:"'Inter',sans-serif",fontSize:15,fontWeight:600,color:T.charcoal,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{event.title}</div>
        <div style={{fontFamily:"'Inter',sans-serif",fontSize:13,color:T.charcoalMute,marginTop:2}}>{event.location}{timeStr?" \\u00b7 "+timeStr:""}{distMiles!=null?" \\u00b7 "+fmt(distMiles):""}</div>
      </div>
      <span style={{fontFamily:"'Inter',sans-serif",fontSize:10,fontWeight:600,color:meta.color,background:meta.bg,padding:"2px 8px",textTransform:"uppercase",letterSpacing:"0.04em",flexShrink:0,marginLeft:12}}>{meta.label}</span>
    </div>
  );
}"""

content = content[:start] + new_card + content[end:]

with open('src/App.jsx', 'w') as f:
    f.write(content)
print("Done!")
