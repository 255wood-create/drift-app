c = open('src/App.jsx').read()

start = c.find('function ProfileView(')
depth = 0
end = -1
for i in range(start, len(c)):
    if c[i] == '{': depth += 1
    elif c[i] == '}':
        depth -= 1
        if depth == 0:
            end = i + 1
            break

new_profile = """function ProfileView({user,authEmail,setAuthEmail,authMsg,signIn,signOut,saved,events}){
  if(!user){
    return(
      <div style={{flex:1,padding:"60px 20px",textAlign:"center"}}>
        <div style={{fontSize:40,marginBottom:14}}>&#x1F464;</div>
        <h2 style={{fontFamily:"'Inter',sans-serif",fontSize:20,fontWeight:600,color:"#1F2320",marginBottom:8}}>Sign in to go janey.</h2>
        <p style={{fontFamily:"'Inter',sans-serif",fontSize:13,color:"#6B706C",marginBottom:20}}>Save events and build your profile</p>
        <input value={authEmail} onChange={e=>setAuthEmail(e.target.value)} placeholder="Your email" type="email" style={{width:"100%",maxWidth:300,padding:"10px 14px",border:"1px solid #D9D6CF",fontFamily:"'Inter',sans-serif",fontSize:14,marginBottom:10}}/>
        <br/>
        <button onClick={signIn} style={{background:"#2F5D50",color:"white",border:"none",padding:"10px 24px",fontFamily:"'Inter',sans-serif",fontSize:14,fontWeight:600,cursor:"pointer",marginBottom:10}}>Send Sign-In Link</button>
        {authMsg&&<p style={{fontFamily:"'Inter',sans-serif",fontSize:13,color:authMsg.includes("Check")?"#2F5D50":"#D9A441",marginTop:8}}>{authMsg}</p>}
      </div>
    );
  }
  const sv=events.filter(e=>saved.has(e.id));
  return(
    <div style={{flex:1,overflowY:"auto",padding:"30px 20px 100px"}}>
      <div style={{textAlign:"center",marginBottom:24}}>
        <div style={{width:60,height:60,background:"#2F5D50",color:"white",fontFamily:"'Inter',sans-serif",fontSize:24,fontWeight:600,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 10px"}}>{user.email[0].toUpperCase()}</div>
        <h2 style={{fontFamily:"'Inter',sans-serif",fontSize:18,fontWeight:600,color:"#1F2320"}}>{user.email}</h2>
        <p style={{fontFamily:"'Inter',sans-serif",fontSize:12,color:"#6B706C",marginTop:4}}>Boulder, CO</p>
      </div>
      <div style={{background:"white",padding:"14px",marginBottom:16,boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}>
        <div style={{fontFamily:"'Inter',sans-serif",fontSize:14,fontWeight:600,color:"#1F2320",marginBottom:8}}>Saved Events ({sv.length})</div>
        {sv.length===0?<p style={{fontFamily:"'Inter',sans-serif",fontSize:13,color:"#6B706C"}}>No saved events yet</p>:
        sv.map(e=><div key={e.id} style={{padding:"8px 0",borderBottom:"0.5px solid #E8E4DF",fontFamily:"'Inter',sans-serif",fontSize:13,color:"#1F2320"}}>{e.title}</div>)}
      </div>
      <button onClick={signOut} style={{width:"100%",background:"#F5F3EF",border:"1px solid #D9D6CF",padding:"10px",fontFamily:"'Inter',sans-serif",fontSize:13,fontWeight:600,color:"#6B706C",cursor:"pointer"}}>Sign Out</button>
    </div>
  );
}"""

c = c[:start] + new_profile + c[end:]

c = c.replace(
    '{screen==="profile"&&<ProfileView saved={saved} events={events} userCoords={userCoords} geoState={geoState}/>}',
    '{screen==="profile"&&<ProfileView user={user} authEmail={authEmail} setAuthEmail={setAuthEmail} authMsg={authMsg} signIn={signIn} signOut={signOut} saved={saved} events={events}/>}'
)

open('src/App.jsx','w').write(c)
print("Profile updated")
