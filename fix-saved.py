c = open('src/App.jsx').read()

# Replace demo-user with real user ID in toggleSave
c = c.replace(
    'const toggleSave=async id=>{const was=saved.has(id);setSaved(s=>{const n=new Set(s);was?n.delete(id):n.add(id);return n;});if(SUPABASE_READY)await toggleSavedDb("demo-user",id,was).catch(console.error);};',
    'const toggleSave=async id=>{if(!user){setScreen("profile");return;}const was=saved.has(id);setSaved(s=>{const n=new Set(s);was?n.delete(id):n.add(id);return n;});await toggleSavedDb(user.id,id,was).catch(console.error);};'
)

# Replace demo-user in toggleInt
c = c.replace(
    'const toggleInt=async id=>{const was=interested.has(id);setInterested(s=>{const n=new Set(s);was?n.delete(id):n.add(id);return n;});if(SUPABASE_READY)await toggleIntDb("demo-user",id,was).catch(console.error);};',
    'const toggleInt=async id=>{if(!user){setScreen("profile");return;}const was=interested.has(id);setInterested(s=>{const n=new Set(s);was?n.delete(id):n.add(id);return n;});await toggleIntDb(user.id,id,was).catch(console.error);};'
)

# Add loading saved events when user signs in - after the onAuthStateChange
old = '''const{data:{subscription}}=supabase.auth.onAuthStateChange((_,session)=>{
      setUser(session?.user||null);
    });'''

new = '''const{data:{subscription}}=supabase.auth.onAuthStateChange(async(_,session)=>{
      setUser(session?.user||null);
      if(session?.user){
        const{data:savedData}=await supabase.from('saved_events').select('event_id').eq('user_id',session.user.id);
        if(savedData)setSaved(new Set(savedData.map(s=>s.event_id)));
        const{data:intData}=await supabase.from('interested').select('event_id').eq('user_id',session.user.id);
        if(intData)setInterested(new Set(intData.map(s=>s.event_id)));
      }
    });'''

c = c.replace(old, new)

open('src/App.jsx','w').write(c)
print("Saved events fixed")
