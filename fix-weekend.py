c = open('src/App.jsx').read()

old = 'var isWeekend=new Date().getDay()>=5||new Date().getDay()===0;if(activeFilter==="Today"&&e.time_bucket!=="Today"&&e.time_bucket!=="Tonight")return false;'

new = 'var dow=new Date().getDay();var todayIsWeekend=dow>=5||dow===0;var tomorrowIsWeekend=(dow+1)%7>=5||(dow+1)%7===0||dow===5;if(activeFilter==="Today"&&e.time_bucket!=="Today"&&e.time_bucket!=="Tonight")return false;'

c = c.replace(old, new)

old2 = 'if(activeFilter==="This Weekend"&&(e.time_bucket==="Today"||e.time_bucket==="Tonight")&&isWeekend){}else if(activeFilter!=="Today"&&e.time_bucket!==activeFilter)return false;'

new2 = 'if(activeFilter==="This Weekend"&&(e.time_bucket==="Today"||e.time_bucket==="Tonight")&&todayIsWeekend){}else if(activeFilter==="This Weekend"&&e.time_bucket==="Tomorrow"&&tomorrowIsWeekend){}else if(activeFilter!=="Today"&&e.time_bucket!==activeFilter)return false;'

c = c.replace(old2, new2)

open('src/App.jsx','w').write(c)
print("Done")
