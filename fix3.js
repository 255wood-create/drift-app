const U="https://lknoxozdbkikysxoarzu.supabase.co";
const S="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxrbm94b3pkYmtpa3lzeG9hcnp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4NzA4MTYsImV4cCI6MjA5NTQ0NjgxNn0.Im1uwq7Fz6wxOKZNhiIwD8UW1rfxYazS5r53N17OH5c";
var evts=await fetch(U+"/rest/v1/events?select=id,title,category,time_bucket",{headers:{apikey:S,Authorization:"Bearer "+S}}).then(r=>r.json());
for(var i=0;i<evts.length;i++){var e=evts[i];var t=e.title.toLowerCase();var patch={};
if(t.indexOf("bluegrass")>=0)patch.category="music";
if(t.indexOf("farmers market")>=0&&t.indexOf("boulder")>=0)patch.time_bucket="This Weekend";
if(t.indexOf("saturday")>=0&&t.indexOf("farmers")>=0)patch.time_bucket="This Weekend";
if(Object.keys(patch).length>0){await fetch(U+"/rest/v1/events?id=eq."+e.id,{method:"PATCH",headers:{apikey:S,Authorization:"Bearer "+S,"Content-Type":"application/json"},body:JSON.stringify(patch)});console.log("fixed: "+e.title+" -> "+JSON.stringify(patch));}
}console.log("Done!");
