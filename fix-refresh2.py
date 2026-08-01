c = open('refresh-buckets.js').read()

# Find and replace the entire bucket calculation
old_start = c.find('var now=new Date()')
old_end = c.find('}console.log("Done')

new_logic = '''var now=new Date();var updated=0;var deleted=0;
var todayStr=now.getUTCFullYear()+"-"+(now.getUTCMonth()+1)+"-"+now.getUTCDate();
var todayDate=new Date(todayStr);
for(var i=0;i<evts.length;i++){var e=evts[i];
if(!e.starts_at){continue;}
var d=new Date(e.starts_at);
var eStr=d.getUTCFullYear()+"-"+(d.getUTCMonth()+1)+"-"+d.getUTCDate();
var eDate=new Date(eStr);
var diff=Math.round((eDate-todayDate)/(86400000));
if(diff<0){await fetch(U+"/rest/v1/events?id=eq."+e.id,{method:"DELETE",headers:{apikey:S,Authorization:"Bearer "+S}});console.log("  deleted past: "+e.title);deleted++;continue;}
var newBucket="Coming Up";
if(diff===0)newBucket="Today";
else if(diff===1)newBucket="Tomorrow";
else if(diff<=2){var dow=now.getUTCDay();if(dow>=5||dow===0)newBucket="This Weekend";else newBucket="This Weekend";}
else if(diff<=7){var eDay=d.getUTCDay();if(eDay===0||eDay===5||eDay===6)newBucket="This Weekend";}
if(newBucket!==e.time_bucket){await fetch(U+"/rest/v1/events?id=eq."+e.id,{method:"PATCH",headers:{apikey:S,Authorization:"Bearer "+S,"Content-Type":"application/json"},body:JSON.stringify({time_bucket:newBucket})});console.log("  "+e.time_bucket+" -> "+newBucket+": "+e.title+" (diff:"+diff+")");updated++;}
'''

c = c[:old_start] + new_logic + c[old_end:]
open('refresh-buckets.js','w').write(c)
print("Done")
