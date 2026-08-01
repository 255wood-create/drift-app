c = open('src/App.jsx').read()

c = c.replace(
    'const[screen,setScreen]=useState("feed");',
    'const[screen,setScreen]=useState("feed");\n  const[user,setUser]=useState(null);\n  const[authEmail,setAuthEmail]=useState("");\n  const[authMsg,setAuthMsg]=useState("");'
)

# Add auth check after requestGeo
c = c.replace(
    'useEffect(()=>{requestGeo();},[]);',
    '''useEffect(()=>{requestGeo();},[]);

  useEffect(()=>{
    supabase.auth.getSession().then(({data:{session}})=>{
      setUser(session?.user||null);
    });
    const{data:{subscription}}=supabase.auth.onAuthStateChange((_,session)=>{
      setUser(session?.user||null);
    });
    return()=>subscription.unsubscribe();
  },[]);

  const signIn=async()=>{
    if(!authEmail){setAuthMsg("Enter your email");return;}
    setAuthMsg("Sending...");
    const{error}=await supabase.auth.signInWithOtp({email:authEmail,options:{emailRedirectTo:window.location.origin}});
    if(error)setAuthMsg(error.message);
    else setAuthMsg("Check your email for a sign-in link!");
  };

  const signOut=async()=>{
    await supabase.auth.signOut();
    setUser(null);
    setSaved(new Set());
    setInterested(new Set());
  };'''
)

open('src/App.jsx','w').write(c)
print("Auth added")
