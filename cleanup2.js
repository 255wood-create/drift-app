const U="https://lknoxozdbkikysxoarzu.supabase.co";
const S="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxrbm94b3pkYmtpa3lzeG9hcnp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4NzA4MTYsImV4cCI6MjA5NTQ0NjgxNn0.Im1uwq7Fz6wxOKZNhiIwD8UW1rfxYazS5r53N17OH5c";
var dupes=["Julius Caesar - Play","Liam St John","Holst's The Planets"];
var evts=await fetch(U+"/rest/v1/events?select=id,title",{headers:{apikey:S,Authorization:"Bearer "+S}}).then(r=>r.json());
for(var i=0;i<evts.length;i++){var e=evts[i];
for(var j=0;j<dupes.length;j++){if(e.title===dupes[j]){
await fetch(U+"/rest/v1/events?id=eq."+e.id,{method:"DELETE",headers:{apikey:S,Authorization:"Bearer "+S}});
console.log("deleted: "+e.title);break;}}}
console.log("Done!");
