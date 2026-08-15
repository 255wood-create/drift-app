import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from '@supabase/supabase-js';
import { LocalNotifications } from '@capacitor/local-notifications';

function notifId(eventId){
  let h=0;
  for(let i=0;i<eventId.length;i++){h=(h*31+eventId.charCodeAt(i))|0;}
  return Math.abs(h)%2147483647;
}
async function scheduleReminder(event){
  if(!event.starts_at)return;
  const notifyAt=new Date(new Date(event.starts_at).getTime()-3600000);
  if(notifyAt<=new Date())return;
  try{
    const perm=await LocalNotifications.checkPermissions();
    if(perm.display!=="granted"){
      const req=await LocalNotifications.requestPermissions();
      if(req.display!=="granted")return;
    }
    await LocalNotifications.schedule({notifications:[{id:notifId(event.id),title:"Starting soon: "+event.title,body:(event.location||"go janey.")+" — starts in 1 hour",schedule:{at:notifyAt}}]});
  }catch(e){console.error("notif schedule failed",e);}
}
async function cancelReminder(eventId){
  try{await LocalNotifications.cancel({notifications:[{id:notifId(eventId)}]});}catch(e){console.error("notif cancel failed",e);}
}

const T = {
  fog:"#F5F3EF",stone:"#D9D6CF",stoneDark:"#B8B4AC",
  charcoal:"#1F2320",charcoalSoft:"#3D4240",charcoalMute:"#6B706C",
  pine:"#2F5D50",pineLt:"#E8F0EC",
  sky:"#4F86A6",skyLt:"#E5EEF3",
  amber:"#D9A441",amberLt:"#FDF3DC",
  sage:"#8FAF9A",sageLt:"#F0F5EC",
  white:"#FFFFFF",
  shadow:"rgba(31,35,32,0.09)",shadowMd:"rgba(31,35,32,0.15)",
};


const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL  || "https://lknoxozdbkikysxoarzu.supabase.co";
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxrbm94b3pkYmtpa3lzeG9hcnp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4NzA4MTYsImV4cCI6MjA5NTQ0NjgxNn0.Im1uwq7Fz6wxOKZNhiIwD8UW1rfxYazS5r53N17OH5c";
const SUPABASE_READY = true;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);
const GOOGLE_MAPS_KEY = "AIzaSyA1yS3PDKvTFW5OmPzQHb2JW7AlCRHdSjw";

function loadGoogleMaps(){
  return new Promise((resolve)=>{
    if(window.google&&window.google.maps){resolve();return;}
    const existing=document.getElementById("gmaps-script");
    if(existing){existing.addEventListener("load",resolve);return;}
    const script=document.createElement("script");
    script.id="gmaps-script";
    script.src=`https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_KEY}`;
    script.async=true;
    script.onload=resolve;
    document.head.appendChild(script);
  });
}

function isPastEvent(startsAt){
  if(!startsAt) return false;
  const d=new Date(startsAt);
  const uh=d.getUTCHours(), um=d.getUTCMinutes();
  const isPlaceholderTime=um===0&&(uh===0||uh===6||uh===7);
  if(isPlaceholderTime){
    const today=new Date(); today.setHours(0,0,0,0);
    const eventDay=new Date(d.getFullYear(),d.getMonth(),d.getDate());
    return eventDay<today;
  }
  return d<new Date();
}
function computeBucket(startsAt){
  const d=new Date(startsAt);
  const today=new Date(); today.setHours(0,0,0,0);
  const eventDay=new Date(d.getFullYear(),d.getMonth(),d.getDate());
  const diff=Math.round((eventDay-today)/86400000);
  if(diff<=0) return "Today";
  if(diff===1) return "Tomorrow";
  if(diff<=6) return "This Weekend";
  return "Upcoming";
}
async function fetchEventsFromDb(){
  const { data, error } = await supabase.from('events').select('*').order('starts_at');
  if (error) throw new Error(error.message);
  return (data || []).filter(e=>!isPastEvent(e.starts_at));
}
async function toggleSavedDb(userId, eventId, wasSaved){
  if(wasSaved) await supabase.from('saved_events').delete().match({user_id:userId, event_id:eventId});
  else await supabase.from('saved_events').insert({user_id:userId, event_id:eventId});
}
async function toggleIntDb(userId, eventId, wasInt){
  if(wasInt) await supabase.from('interested').delete().match({user_id:userId, event_id:eventId});
  else await supabase.from('interested').insert({user_id:userId, event_id:eventId});
}
const CATEGORIES=[
  {id:"music",label:"Live Music",icon:"♪"},{id:"comedy",label:"Comedy",icon:"🎤"},
  {id:"food",label:"Food & Culture",icon:"🍴"},
];

const CAT_META={
  music:{color:"#6B4FA0",bg:"#F0EDF8",label:"Live Music",gradBg:"linear-gradient(160deg,#3A2060,#0D0520)",gradAccent:"rgba(217,164,65,0.35)"},
  sports:{color:T.sky,bg:T.skyLt,label:"Sports / Fitness",gradBg:"linear-gradient(160deg,#1A3A5C,#0D2040)",gradAccent:"rgba(79,134,166,0.4)"},
  outdoor:{color:T.pine,bg:T.pineLt,label:"Outdoor Activities",gradBg:"linear-gradient(160deg,#2A4A3A,#0F1F18)",gradAccent:"rgba(143,175,154,0.25)"},
  wellness:{color:"#8B7A3A",bg:"#F5F0DC",label:"Wellness / Fitness",gradBg:"linear-gradient(160deg,#5C4A1A,#3D2E0A)",gradAccent:"rgba(217,164,65,0.4)"},
  comedy:{color:"#C75C8A",bg:"#F8ECF1",label:"Comedy",gradBg:"linear-gradient(160deg,#5C1A3A,#3D0820)",gradAccent:"rgba(199,92,138,0.3)"},
  food:{color:T.amber,bg:T.amberLt,label:"Food & Culture",gradBg:"linear-gradient(160deg,#5C3A1A,#3D2008)",gradAccent:"rgba(217,164,65,0.3)"},
  community:{color:T.sage,bg:T.sageLt,label:"Community",gradBg:"linear-gradient(160deg,#2A3D30,#151F18)",gradAccent:"rgba(143,175,154,0.3)"},
};

const FILTERS=["Today","Tomorrow","This Weekend","Upcoming"];

const MOCK_EVENTS=[
  {id:1,cat:"music",time:"Today",is_trending:true,title:"Leftover Salmon — Acoustic Set",location:"The Sink · The Hill",vibe:"Bluegrass jam · Outdoor patio",lat:40.0090,lng:-105.2711},
  {id:2,cat:"outdoor",time:"Today",is_trending:false,title:"Sunset Hike — Royal Arch Trail",location:"Chautauqua Park · S Boulder",vibe:"Moderate · Golden hour views",lat:39.9995,lng:-105.2811},
  {id:3,cat:"food",time:"Tonight",is_trending:true,title:"Tap Release Night",location:"Avery Brewing Co. · Gunbarrel",vibe:"Limited IPA drop · Patio open",lat:40.0374,lng:-105.2518},
  {id:4,cat:"wellness",time:"Tonight",is_trending:false,title:"Flow Yoga Under the Stars",location:"Boulder Creek Path · Downtown",vibe:"All levels · BYO mat",lat:40.0143,lng:-105.2766},
  {id:5,cat:"sports",time:"Today",is_trending:true,title:"Pickup Ultimate Frisbee",location:"Scott Carpenter Park · E Boulder",vibe:"All levels · Free to join",lat:40.0142,lng:-105.2487},
  {id:6,cat:"community",time:"Tonight",is_trending:false,title:"Farmers Market Wind-Down",location:"13th & Canyon · Downtown",vibe:"Local vendors · Pet friendly",lat:40.0165,lng:-105.2795},
  {id:7,cat:"music",time:"Tonight",is_trending:false,title:"Jazz on the Creek",location:"Foolish Craig's · The Hill",vibe:"Live jazz trio · Outdoor seating",lat:40.0093,lng:-105.2723},
  {id:8,cat:"outdoor",time:"This Weekend",is_trending:true,title:"Dawn Paddle — Boulder Reservoir",location:"Boulder Reservoir · N Boulder",vibe:"Kayak rental available · Calm water",lat:40.0603,lng:-105.2257},
  {id:9,cat:"wellness",time:"This Weekend",is_trending:false,title:"Forest Bathing Walk",location:"Betasso Preserve · Boulder Canyon",vibe:"Guided · Meditative · 2 hrs",lat:40.0031,lng:-105.3437},
  {id:10,cat:"sports",time:"This Weekend",is_trending:true,title:"Saturday Soccer — Open Run",location:"Valmont Sports Park",vibe:"Co-ed · All skill levels",lat:40.0208,lng:-105.2366},
];

const USER={name:"Jordan Rivera",handle:"@jrivera",location:"Boulder, CO",bio:"Always chasing sunsets and live music 🎸🏔️",interests:["Live Music","Outdoor Activities","Food & Social","Wellness"],avatar:"JR"};

function LivePip(){return(<span style={{position:"relative",display:"inline-flex",width:7,height:7,flexShrink:0}}><span style={{position:"absolute",inset:0,borderRadius:"50%",background:T.amber,opacity:0.4,animation:"pipPing 1.6s cubic-bezier(0,0,.2,1) infinite"}}/><span style={{position:"relative",width:7,height:7,borderRadius:"50%",background:T.amber}}/></span>);}

function TimeBadge({time}){
  const s={Now:{bg:T.amber,color:T.charcoal},Tonight:{bg:T.skyLt,color:T.sky},"This Weekend":{bg:T.pineLt,color:T.pine},Trending:{bg:T.amberLt,color:T.amber}}[time]||{bg:T.stone,color:T.charcoalMute};
  return(<span style={{display:"inline-flex",alignItems:"center",gap:4,background:s.bg,color:s.color,padding:"1px 7px",fontFamily:"'Inter',sans-serif",fontSize:9,fontWeight:700,letterSpacing:"0.05em",textTransform:"uppercase"}}>{time==="Today"&&<LivePip/>}{time}</span>);
}

function SaveBtn({saved,onToggle}){
  return(<button onClick={e=>{e.stopPropagation();onToggle();}} style={{width:26,height:26,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(31,35,32,0.5)",border:"none",cursor:"pointer",fontSize:11,flexShrink:0}}>🔖</button>);
}

function EventCard({event,saved,interested,onSave,onInterest,index,timeBucket}){
  const meta=CAT_META[event.cat||event.category]||CAT_META.community;
  var timeStr="";if(event.starts_at){var d=new Date(event.starts_at);var uh=d.getUTCHours();var um=d.getUTCMinutes();timeStr=(d.getMonth()+1)+"/"+d.getDate();if(!(um===0&&(uh===0||uh===6||uh===7))){var lh=d.getHours();var lm=d.getMinutes();var ampm=lh>=12?"PM":"AM";var h=lh%12||12;timeStr+=" · "+h+":"+(lm<10?"0":"")+lm+" "+ampm;}}
  return(
    <div style={{padding:"12px 0",borderBottom:"0.5px solid #E8E4DF",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
      <div style={{width:26,flexShrink:0}}/>
      <div style={{flex:1,minWidth:0,textAlign:"center"}}>
        <div style={{fontFamily:"Inter,sans-serif",fontSize:15,fontWeight:600,color:"#1F2320"}}>{event.title}</div>
        <div style={{fontFamily:"Inter,sans-serif",fontSize:13,color:"#6B706C",marginTop:2}}>{event.location}{timeStr?" · "+timeStr:""}</div>
      </div>
      <button onClick={e=>{e.stopPropagation();onSave();}} style={{background:"none",border:"none",cursor:"pointer",fontSize:18,opacity:saved?1:0.3,flexShrink:0,width:26,padding:4}}>{saved?"\u2764":"\u2661"}</button>
    </div>
  );
}
function MapView({events,saved,interested,onSave,onInterest}){
  const[selected,setSelected]=useState(null);
  const[mapReady,setMapReady]=useState(false);
  const sel=selected?events.find(e=>e.id===selected):null;
  const mapElRef=useRef(null);
  const mapObjRef=useRef(null);
  const markersRef=useRef([]);

  useEffect(()=>{
    let cancelled=false;
    loadGoogleMaps().then(()=>{
      if(cancelled||!mapElRef.current)return;
      mapObjRef.current=new window.google.maps.Map(mapElRef.current,{
        center:{lat:40.0150,lng:-105.2705},
        zoom:13,
        disableDefaultUI:true,
        zoomControl:true,
        clickableIcons:false,
      });
      setMapReady(true);
    });
    return()=>{cancelled=true;};
  },[]);

  useEffect(()=>{
    if(!mapReady||!mapObjRef.current)return;
    markersRef.current.forEach(m=>m.setMap(null));
    markersRef.current=events.map(evt=>{
      const meta=CAT_META[evt.cat||evt.category]||CAT_META.community;
      const isSel=selected===evt.id;
      const marker=new window.google.maps.Marker({
        position:{lat:evt.lat||40.0150,lng:evt.lng||-105.2705},
        map:mapObjRef.current,
        title:evt.title,
        icon:{
          path:window.google.maps.SymbolPath.CIRCLE,
          fillColor:meta.color,
          fillOpacity:1,
          strokeColor:"#fff",
          strokeWeight:2,
          scale:isSel?10:7,
        },
        zIndex:isSel?10:5,
      });
      marker.addListener("click",()=>setSelected(prev=>prev===evt.id?null:evt.id));
      return marker;
    });
  },[mapReady,events,selected]);

  return(
    <div style={{flex:1,position:"relative",overflow:"hidden"}}>
      <div ref={mapElRef} style={{position:"absolute",inset:0,background:"#E8E4DF"}}/>
      <div style={{position:"absolute",top:16,left:16,background:"rgba(245,243,239,0.95)",padding:"8px 14px",boxShadow:`0 2px 12px ${T.shadow}`,zIndex:10}}>
        <div style={{fontFamily:"'Inter',sans-serif",fontSize:14,fontWeight:800,color:T.charcoal}}>Boulder, CO</div>
        <div style={{fontFamily:"'Inter',sans-serif",fontSize:10,color:T.sage,marginTop:1}}>{`${events.length} events`}</div>
      </div>
      {sel&&(
        <div style={{position:"absolute",bottom:0,left:0,right:0,background:T.white,padding:"18px 20px 80px",boxShadow:`0 -4px 32px ${T.shadowMd}`,animation:"slideUp .25s ease",zIndex:20}}>
          <div style={{width:36,height:3,background:T.stone,margin:"0 auto 14px"}}/>
          <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
            <div style={{flex:1}}>
              <h3 style={{fontFamily:"'Inter',sans-serif",fontSize:15,fontWeight:800,color:T.charcoal,margin:"0 0 4px"}}>{sel.title}</h3>
              <p style={{fontFamily:"'Inter',sans-serif",fontSize:12,color:T.sage,margin:"0 0 3px"}}>📍 {sel.location}</p>
              {sel.vibe&&<p style={{fontFamily:"'Inter',sans-serif",fontSize:11,color:T.stone,fontStyle:"italic",margin:0}}>{sel.vibe}</p>}
            </div>
            <SaveBtn saved={saved.has(sel.id)} onToggle={()=>onSave(sel.id)}/>
          </div>
          <div style={{display:"flex",gap:8,marginTop:12,alignItems:"center",justifyContent:"space-between"}}>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <TimeBadge time={sel.time}/>
            </div>
            <button onClick={()=>onInterest(sel.id)} style={{background:interested.has(sel.id)?T.amber:T.fog,color:interested.has(sel.id)?T.charcoal:T.sage,border:`0.5px solid ${interested.has(sel.id)?T.amber:T.stone}`,padding:"6px 14px",fontFamily:"'Inter',sans-serif",fontSize:12,fontWeight:700,cursor:"pointer"}}>
              {interested.has(sel.id)?"✦ Interested":"✦ Going?"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SavedView({events,saved,interested,onSave,onInterest}){
  const sv=events.filter(e=>saved.has(e.id));
  return(
    <div style={{flex:1,overflowY:"auto",padding:"24px 16px 100px"}}>
      <h2 style={{fontFamily:"'Inter',sans-serif",fontSize:22,fontWeight:800,color:T.charcoal,margin:"0 0 4px"}}>Saved</h2>
      <p style={{fontFamily:"'Inter',sans-serif",fontSize:13,color:T.sage,margin:"0 0 20px"}}>{sv.length} {sv.length===1?"event":"events"} bookmarked</p>
      {sv.length===0?(
        <div style={{textAlign:"center",padding:"60px 20px"}}>
          <div style={{fontSize:40,marginBottom:14}}>🔖</div>
          <p style={{fontFamily:"'Inter',sans-serif",fontSize:17,color:T.charcoalMute}}>Nothing saved yet</p>
          <p style={{fontFamily:"'Inter',sans-serif",fontSize:13,color:T.sage,marginTop:6}}>Tap 🔖 on any event</p>
        </div>
      ):(
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {sv.map((e,i)=>(<EventCard key={e.id} event={e} index={i} saved={saved.has(e.id)} interested={interested.has(e.id)} onSave={()=>onSave(e.id)} onInterest={()=>onInterest(e.id)}/>))}
        </div>
      )}
    </div>
  );
}

function ProfileView({user,authEmail,setAuthEmail,authMsg,signIn,signOut,saved,events}){
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
        <a href="/submit.html" style={{display:"block",marginTop:28,fontFamily:"'Inter',sans-serif",fontSize:13,color:"#2F5D50",fontWeight:600,textDecoration:"none"}}>Know about an event? Submit one →</a>
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
      <a href="/submit.html" style={{display:"block",width:"100%",boxSizing:"border-box",background:"#2F5D50",color:"white",border:"none",padding:"10px",fontFamily:"'Inter',sans-serif",fontSize:13,fontWeight:600,textAlign:"center",textDecoration:"none",marginBottom:10}}>Submit an Event</a>
      <button onClick={signOut} style={{width:"100%",background:"#F5F3EF",border:"1px solid #D9D6CF",padding:"10px",fontFamily:"'Inter',sans-serif",fontSize:13,fontWeight:600,color:"#6B706C",cursor:"pointer"}}>Sign Out</button>
    </div>
  );
}

export default function App(){
  const[screen,setScreen]=useState("feed");
  const[user,setUser]=useState(null);
  const[authEmail,setAuthEmail]=useState("");
  const[authMsg,setAuthMsg]=useState("");
  const[activeFilter,setFilter]=useState("Today");
  const[activeCat,setCat]=useState("music");
  const[saved,setSaved]=useState(new Set());
  const[interested,setInterested]=useState(new Set());
  
  const[liveCount,setLiveCount]=useState(214);
  const[events,setEvents]=useState(MOCK_EVENTS);
  const[loading,setLoading]=useState(false);
  const[dbError,setDbError]=useState(null);

  useEffect(()=>{const id=setInterval(()=>setLiveCount(c=>c+Math.floor(Math.random()*3)-1),2800);return()=>clearInterval(id);},[]);

  useEffect(()=>{
    supabase.auth.getSession().then(({data:{session}})=>{
      setUser(session?.user||null);
    });
    const{data:{subscription}}=supabase.auth.onAuthStateChange(async(_,session)=>{
      setUser(session?.user||null);
      if(session?.user){
        const{data:savedData}=await supabase.from('saved_events').select('event_id').eq('user_id',session.user.id);
        if(savedData)setSaved(new Set(savedData.map(s=>s.event_id)));
        const{data:intData}=await supabase.from('interested').select('event_id').eq('user_id',session.user.id);
        if(intData)setInterested(new Set(intData.map(s=>s.event_id)));
      }
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
  };

  const refreshEvents=useCallback(()=>{
    if(!SUPABASE_READY)return;
    setLoading(true);setDbError(null);
    fetchEventsFromDb({timeBucket:activeFilter,category:activeCat})
      .then(rows=>{setEvents(rows.length?rows:MOCK_EVENTS);setLoading(false);})
      .catch(err=>{setDbError(err.message);console.error("Supabase error:", err);setLoading(false);});
  },[activeFilter,activeCat]);

  useEffect(()=>{refreshEvents();},[refreshEvents]);

  const withDist=events.map(e=>({...e,cat:e.cat||e.category,effectiveBucket:e.starts_at?computeBucket(e.starts_at):(e.time_bucket||"Upcoming")}));

  const toggleSave=async id=>{if(!user){setScreen("profile");return;}const was=saved.has(id);setSaved(s=>{const n=new Set(s);was?n.delete(id):n.add(id);return n;});await toggleSavedDb(user.id,id,was).catch(console.error);if(was){cancelReminder(id);}else{const ev=events.find(e=>e.id===id);if(ev)scheduleReminder(ev);}};
  const toggleInt=async id=>{if(!user){setScreen("profile");return;}const was=interested.has(id);setInterested(s=>{const n=new Set(s);was?n.delete(id):n.add(id);return n;});await toggleIntDb(user.id,id,was).catch(console.error);};

  const filtered=withDist.filter(e=>{
    if(activeCat!=="all"&&(e.category||"").trim().toLowerCase()!==activeCat)return false;
        var dow=new Date().getDay();var todayIsWeekend=dow>=5||dow===0;var tomorrowIsWeekend=(dow+1)%7>=5||(dow+1)%7===0||dow===5;if(activeFilter==="Today"&&e.effectiveBucket!=="Today")return false;
    if(activeFilter==="This Weekend"&&e.effectiveBucket==="Today"&&todayIsWeekend){}else if(activeFilter==="This Weekend"&&e.effectiveBucket==="Tomorrow"&&tomorrowIsWeekend){}else if(activeFilter!=="Today"&&e.effectiveBucket!==activeFilter)return false;
    
    return true;
  });

  const NAV=[{id:"feed",icon:"⚡",label:"Discover"},{id:"map",icon:"◎",label:"Map"},{id:"saved",icon:"♥",label:"Saved"},{id:"profile",icon:"👤",label:"Profile"},{id:"refresh",icon:"↻",label:"Refresh"}];

  return(
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Caveat:wght@700&family=JetBrains+Mono:wght@400;500;600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
        html,body,#root{height:100%}
        html,body{position:fixed;inset:0;overflow:hidden;overscroll-behavior:none;width:100%}
        body{background:#E8E4DF;display:flex;justify-content:center}
        @keyframes cardUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pipPing{75%,100%{transform:scale(2.5);opacity:0}}
        @keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes spin{to{transform:rotate(360deg)}}
        ::-webkit-scrollbar{display:none}
        *{scrollbar-width:none}
        input:focus{outline:none}
        button{user-select:none}
      `}</style>
      <div style={{width:"100%",maxWidth:430,minHeight:"100vh",height:"100%",display:"flex",flexDirection:"column",background:T.fog,fontFamily:"'Inter',sans-serif",margin:"0 auto"}}>

        {screen==="feed"&&(
          <header style={{position:"sticky",top:0,zIndex:40,overflow:"hidden"}}>
            <div style={{position:"absolute",inset:0}}>
              <img src="/hero.jpg" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
              <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(47,93,80,0.9) 0%,rgba(47,93,80,0.6) 40%,rgba(47,93,80,0.3) 100%)"}}/>
            </div>
            <div style={{position:"relative",height:180}}>
              <div style={{position:"absolute",top:16,left:16,right:16,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{fontFamily:"'Inter',sans-serif",fontSize:20,fontWeight:600,color:T.fog}}>
                  <span style={{fontFamily:"'Caveat',cursive",fontSize:26,fontWeight:700}}>go</span> janey<span style={{color:T.amber}}>.</span>
                </div>
                <div style={{fontFamily:"'Inter',sans-serif",fontSize:11,color:"rgba(245,243,239,0.6)"}}>Boulder, CO</div>
              </div>
              <div style={{position:"absolute",bottom:16,left:16,right:16}}>
                <div style={{fontFamily:"'Inter',sans-serif",fontSize:22,fontWeight:600,color:T.fog,lineHeight:1.2}}>
                  {activeFilter==="Today"&&"Happening today"}{activeFilter==="Tomorrow"&&"Tomorrow in Boulder"}{activeFilter==="This Weekend"&&"This weekend"}{activeFilter==="Upcoming"&&"Upcoming"}
                </div>
                <div style={{fontFamily:"'Inter',sans-serif",fontSize:12,color:"rgba(245,243,239,0.6)",marginTop:6}}>
                  {filtered.length} {filtered.length===1?"event":"events"} in Boulder
                </div>
              </div>
            </div>
            <div style={{position:"relative",padding:"10px 16px",display:"flex",gap:6,justifyContent:"center"}}>
              {FILTERS.map(f=>(<button key={f} onClick={()=>setFilter(f)} style={{padding:"4px 9px",background:activeFilter===f?"#FFFFFF":"rgba(245,243,239,0.1)",color:activeFilter===f?"#3D4240":"#3D4240",border:"none",fontFamily:"'Inter',sans-serif",fontSize:10,fontWeight:700,letterSpacing:"0.04em",textTransform:"uppercase",cursor:"pointer",transition:"all .18s"}}>{f}</button>))}
            </div>
            <div style={{position:"relative",display:"flex",gap:6,padding:"0 16px 12px",justifyContent:"center",overflowX:"auto",WebkitOverflowScrolling:"touch",scrollbarWidth:"none"}}>
              {CATEGORIES.map(c=>{const isA=activeCat===c.id;const meta=c.id!=="all"?CAT_META[c.id]:null;return(<button key={c.id} onClick={()=>setCat(c.id)} style={{flexShrink:0,padding:"5px 12px",background:isA?"#FFFFFF":"rgba(245,243,239,0.1)",color:isA?"#3D4240":"#3D4240",border:isA?"0.5px solid #FFFFFF":"0.5px solid rgba(245,243,239,0.2)",fontFamily:"'Inter',sans-serif",fontSize:12,fontWeight:isA?700:500,cursor:"pointer",transition:"all .18s",whiteSpace:"nowrap"}}>{c.icon} {c.label}</button>);})}
            </div>
          </header>
        )}

        {screen==="feed"&&(
          <main style={{flex:1,overflowY:"auto",padding:"16px 16px 100px"}}>
            
            {dbError&&<div style={{background:"#FEF0E0",padding:"8px 14px",marginBottom:12}}><span style={{fontFamily:"'Inter',sans-serif",fontSize:10,color:T.amber}}>Connection issue — showing demo events</span></div>}
            {(
              <div style={{marginBottom:14}}>
                <h2 style={{fontFamily:"'Inter',sans-serif",fontSize:19,fontWeight:800,color:T.charcoal,lineHeight:1.2,letterSpacing:"-0.02em"}}>
                  {activeFilter==="Today"&&"Happening today"}
                  {activeFilter==="Tonight"&&"Going on tonight"}
                  {activeFilter==="Tomorrow"&&"Tomorrow in Boulder"}
                  {activeFilter==="This Weekend"&&"This weekend in Boulder"}
                  {activeFilter==="Upcoming"&&"Upcoming"}
                  {activeFilter==="Trending"&&"Trending around town"}
                </h2>
                <p style={{fontFamily:"'Inter',sans-serif",fontSize:12,color:T.sage,marginTop:3}}>
                  {filtered.length} {filtered.length===1?"experience":"experiences"}
                </p>
              </div>
            )}
            {loading?(
              <div style={{display:"flex",justifyContent:"center",padding:"48px 0"}}><div style={{width:24,height:24,border:`2px solid ${T.stone}`,borderTop:`2px solid ${T.pine}`,borderRadius:"50%",animation:"spin .8s linear infinite"}}/></div>
            ):filtered.length>0?(
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {filtered.map((e,i)=>(<EventCard key={e.id} event={e} index={i} saved={saved.has(e.id)} interested={interested.has(e.id)} onSave={()=>toggleSave(e.id)} onInterest={()=>toggleInt(e.id)}/>))}
              </div>
            ):(
              <div style={{textAlign:"center",padding:"60px 20px",animation:"fadeIn .4s ease"}}>
                <div style={{fontSize:40,marginBottom:14}}>🏔️</div>
                <h3 style={{fontFamily:"'Inter',sans-serif",fontSize:18,color:T.charcoalMute,marginBottom:8}}>Nothing here right now</h3>
                <p style={{fontFamily:"'Inter',sans-serif",fontSize:13,color:T.sage}}>Try a different filter or category</p>
              </div>
            )}
          </main>
        )}

        {screen==="map"&&<MapView events={withDist} saved={saved} interested={interested} onSave={toggleSave} onInterest={toggleInt}/>}
        {screen==="saved"&&<SavedView events={withDist} saved={saved} interested={interested} onSave={toggleSave} onInterest={toggleInt}/>}
        {screen==="profile"&&<ProfileView user={user} authEmail={authEmail} setAuthEmail={setAuthEmail} authMsg={authMsg} signIn={signIn} signOut={signOut} saved={saved} events={events}/>}

        <nav style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,background:"rgba(245,243,239,0.97)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",borderTop:`0.5px solid ${T.stone}`,display:"flex",flexDirection:"column",zIndex:50,padding:"10px 0 max(16px,env(safe-area-inset-bottom))"}}>
          <p style={{fontFamily:"'Inter',sans-serif",fontSize:9,color:"#7A9583",textAlign:"center",padding:"0 10px",marginBottom:8}}>Before heading out, pls verify date, time, locations. We're good... not perfect.</p>
          <div style={{display:"flex"}}>
            {NAV.map(n=>{const isRefresh=n.id==="refresh";const a=!isRefresh&&screen===n.id;return(<button key={n.id} onClick={()=>{if(isRefresh){setScreen("feed");refreshEvents();}else{setScreen(n.id);}}} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3,background:"none",border:"none",cursor:"pointer",padding:"4px 0"}}>
              <span style={{fontSize:19,lineHeight:1,filter:a&&n.id!=="profile"&&n.id!=="feed"?`drop-shadow(0 0 4px ${T.pine}88)`:"none",transform:a?"scale(1.1)":"scale(1)",display:"inline-block",animation:isRefresh&&loading?"spin .8s linear infinite":"none",transition:"transform .18s"}}>
                {n.id==="feed"?<svg width="19" height="19" viewBox="0 0 24 24" style={{display:"block"}}><path fill={T.amber} d="M13 2L3 14h7l-1 8 10-12h-7l1-8z"/></svg>:n.icon}
              </span>
              <span style={{fontFamily:"'Inter',sans-serif",fontSize:9,letterSpacing:"0.06em",textTransform:"uppercase",color:a?T.pine:T.sage,fontWeight:a?700:400,transition:"color .18s"}}>{n.label}</span>
            </button>);})}
          </div>
        </nav>
      </div>
    </>
  );
}
