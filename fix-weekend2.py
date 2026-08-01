c = open('refresh-buckets.js').read()

old = '''if(diff===0)newBucket="Today";
else if(diff===1)newBucket="Tomorrow";
else if(diff<=2){var dow=now.getUTCDay();if(dow>=5||dow===0)newBucket="This Weekend";else newBucket="This Weekend";}
else if(diff<=7){var eDay=d.getUTCDay();if(eDay===0||eDay===5||eDay===6)newBucket="This Weekend";}'''

new = '''if(diff===0)newBucket="Today";
else if(diff===1)newBucket="Tomorrow";
else{
var dow=now.getUTCDay();
var daysToSunday=0;
if(dow===5)daysToSunday=2;
else if(dow===6)daysToSunday=1;
else if(dow===0)daysToSunday=0;
else daysToSunday=7-dow;
if(diff<=daysToSunday)newBucket="This Weekend";
}'''

c = c.replace(old, new)
open('refresh-buckets.js','w').write(c)
print("Done")
