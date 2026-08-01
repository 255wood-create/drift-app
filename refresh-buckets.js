import {getJson} from "serpapi";
const K="8009708977be74eb28810d1217841b8240b45558804ab846967afe7d7ac11b0a";
const U="https://lknoxozdbkikysxoarzu.supabase.co";
const S="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxrbm94b3pkYmtpa3lzeG9hcnp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4NzA4MTYsImV4cCI6MjA5NTQ0NjgxNn0.Im1uwq7Fz6wxOKZNhiIwD8UW1rfxYazS5r53N17OH5c";
var evts=await fetch(U+"/rest/v1/events?select=id,title,starts_at,time_bucket",{headers:{apikey:S,Authorization:"Bearer "+S}}).then(r=>r.json());
var now=new Date();var updated=0;var deleted=0;
var todayStr=now.getUTCFullYear()+"-"+(now.getUTCMonth()+1)+"-"+now.getUTCDate();
var todayDate=new Date(todayStr);
for(var i=0;i<evts.length;i++){var e=evts[i];
if(!e.starts_at){continue;}
var d=new Date(e.starts_at);
var eStr=d.getUTCFullYear()+"-"+(d.getUTCMonth()+1)+"-"+d.getUTCDate();
var eDate=new Date(eStr);
var diff=Math.round((eDate-todayDate)/(86400000));
if(diff<0){await fetch(U+"/rest/v1/events?id=eq."+e.id,{method:"DELETE",headers:{apikey:S,Authorization:"Bearer "+S}});console.log("  deleted past: "+e.title);deleted++;continue;}
var newBucket="Upcoming";
if(diff===0)newBucket="Today";
else if(diff===1)newBucket="Tomorrow";
else{
var dow=now.getUTCDay();
var daysToSunday=0;
if(dow===5)daysToSunday=2;
else if(dow===6)daysToSunday=1;
else if(dow===0)daysToSunday=0;
else daysToSunday=7-dow;
if(diff<=daysToSunday)newBucket="This Weekend";
}
if(newBucket!==e.time_bucket){await fetch(U+"/rest/v1/events?id=eq."+e.id,{method:"PATCH",headers:{apikey:S,Authorization:"Bearer "+S,"Content-Type":"application/json"},body:JSON.stringify({time_bucket:newBucket})});console.log("  "+e.time_bucket+" -> "+newBucket+": "+e.title+" (diff:"+diff+")");updated++;}
}console.log("Done! Updated:"+updated+" Deleted:"+deleted);
