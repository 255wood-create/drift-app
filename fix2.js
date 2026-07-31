const U="https://lknoxozdbkikysxoarzu.supabase.co";
const S="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxrbm94b3pkYmtpa3lzeG9hcnp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4NzA4MTYsImV4cCI6MjA5NTQ0NjgxNn0.Im1uwq7Fz6wxOKZNhiIwD8UW1rfxYazS5r53N17OH5c";
var evts=await fetch(U+"/rest/v1/events?select=id,title,category",{headers:{apikey:S,Authorization:"Bearer "+S}}).then(r=>r.json());
var fixes={"friends/romans":"music","house party":"music","liam st":"music","davis corley":"music","farmers market":"food"};
for(var i=0;i<evts.length;i++){var e=evts[i];var t=e.title.toLowerCase();
for(var k in fixes){if(t.indexOf(k)>=0&&e.category!==fixes[k]){
await fetch(U+"/rest/v1/events?id=eq."+e.id,{method:"PATCH",headers:{apikey:S,Authorization:"Bearer "+S,"Content-Type":"application/json"},body:JSON.stringify({category:fixes[k]})});
console.log(e.category+" -> "+fixes[k]+": "+e.title);break;}}}
console.log("Done!");
