c = open('refresh-buckets.js').read()

old = '''var newBucket="Coming Up";
if(diff<=0)newBucket="Today";
else if(diff===1)newBucket="Tomorrow";
else if(diff<=6)newBucket="This Weekend";'''

new = '''var newBucket="Coming Up";
var dow=now.getDay();
var eventDay=d.getDay();
if(diff<=0)newBucket="Today";
else if(diff===1)newBucket="Tomorrow";
else if((dow===5&&diff<=2)||(dow===6&&diff<=1)||(dow===0&&diff<=0))newBucket="This Weekend";
else if(eventDay===0||eventDay===5||eventDay===6){if(diff<=7)newBucket="This Weekend";}'''

c = c.replace(old, new)
open('refresh-buckets.js','w').write(c)
print("Done")
