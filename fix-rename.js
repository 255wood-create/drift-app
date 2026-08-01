const U="https://lknoxozdbkikysxoarzu.supabase.co";
const S="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxrbm94b3pkYmtpa3lzeG9hcnp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4NzA4MTYsImV4cCI6MjA5NTQ0NjgxNn0.Im1uwq7Fz6wxOKZNhiIwD8UW1rfxYazS5r53N17OH5c";
var res=await fetch(U+"/rest/v1/events?time_bucket=eq.Coming%20Up",{method:"PATCH",headers:{apikey:S,Authorization:"Bearer "+S,"Content-Type":"application/json",Prefer:"return=representation"},body:JSON.stringify({time_bucket:"Upcoming"})});
var data=await res.json();console.log("Renamed "+data.length+" events to Upcoming");
