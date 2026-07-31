const U="https://lknoxozdbkikysxoarzu.supabase.co";
const S="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxrbm94b3pkYmtpa3lzeG9hcnp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4NzA4MTYsImV4cCI6MjA5NTQ0NjgxNn0.Im1uwq7Fz6wxOKZNhiIwD8UW1rfxYazS5r53N17OH5c";
var evts=await fetch(U+"/rest/v1/events?select=id,title,category",{headers:{apikey:S,Authorization:"Bearer "+S}}).then(r=>r.json());
var toMusic=["gringos","house party","julius caesar","liam st","fan halen","friends/romans","rio rosa"];
var toDelete=["Holst's The Planets","Liam St John"];
var seen={};
for(var i=0;i<evts.length;i++){var e=evts[i];var t=e.title.toLowerCase();
var isDupe=false;for(var j=0;j<toDelete.length;j++){if(e.title===toDelete[j]){isDupe=true;}}
if(isDupe){await fetch(U+"/rest/v1/events?id=eq."+e.id,{method:"DELETE",headers:{apikey:S,Authorization:"Bearer "+S}});console.log("deleted: "+e.title);continue;}
var newCat=null;for(var j=0;j<toMusic.length;j++){if(t.indexOf(toMusic[j])>=0)newCat="music";}
if(newCat&&newCat!==e.category){await fetch(U+"/rest/v1/events?id=eq."+e.id,{method:"PATCH",headers:{apikey:S,Authorization:"Bearer "+S,"Content-Type":"application/json"},body:JSON.stringify({category:newCat})});console.log(e.category+" -> "+newCat+": "+e.title);}
}console.log("Done!");
