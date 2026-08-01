const U="https://lknoxozdbkikysxoarzu.supabase.co";
const S="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxrbm94b3pkYmtpa3lzeG9hcnp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4NzA4MTYsImV4cCI6MjA5NTQ0NjgxNn0.Im1uwq7Fz6wxOKZNhiIwD8UW1rfxYazS5r53N17OH5c";
var evts=await fetch(U+"/rest/v1/events?select=id,title,location,category",{headers:{apikey:S,Authorization:"Bearer "+S}}).then(r=>r.json());
for(var i=0;i<evts.length;i++){var e=evts[i];var loc=(e.location||"").toLowerCase();
if(loc.indexOf("denver")>=0||loc.indexOf("fillmore")>=0||loc.indexOf("club vinyl")>=0||loc.indexOf("comedy works - denver")>=0){
await fetch(U+"/rest/v1/events?id=eq."+e.id,{method:"DELETE",headers:{apikey:S,Authorization:"Bearer "+S}});
console.log("deleted denver: "+e.title);}}
console.log("Done!");
