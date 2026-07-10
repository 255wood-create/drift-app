import {getJson} from "serpapi";
const K="8009708977be74eb28810d1217841b8240b45558804ab846967afe7d7ac11b0a";
const U="https://lknoxozdbkikysxoarzu.supabase.co";
const S="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxrbm94b3pkYmtpa3lzeG9hcnp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4NzA4MTYsImV4cCI6MjA5NTQ0NjgxNn0.Im1uwq7Fz6wxOKZNhiIwD8UW1rfxYazS5r53N17OH5c";
const r=await getJson({engine:"google_events",q:"Events in Boulder CO",api_key:K});
const evts=r.events_results||[];
console.log("Found "+evts.length+" events");
for(const e of evts){
const t=((e.title||"")+" "+(e.description||"")).toLowerCase();
let cat="food";
if(t.match(/music|band|jazz|concert|dj|guitar/))cat="music";
if(t.match(/hike|yoga|run|sport|soccer|climb|bike/))cat="sports";
const evt={title:e.title||"X",category:cat,location:(e.address||[]).join(" ")||"Boulder",time_bucket:"Coming Up",lat:40.015,lng:-105.27,is_trending:false};
const res=await fetch(U+"/rest/v1/events",{method:"POST",headers:{apikey:S,Authorization:"Bearer "+S,"Content-Type":"application/json",Prefer:"return=minimal"},body:JSON.stringify(evt)});
console.log(res.ok?"+ "+evt.title:"x "+evt.title);
}
console.log("Done!");
