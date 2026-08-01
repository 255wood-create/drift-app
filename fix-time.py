c = open('src/App.jsx').read()
c = c.replace(
    'var timeStr="";if(event.starts_at){var d=new Date(event.starts_at);var mo=d.getUTCMonth()+1;var day=d.getUTCDate();var hr=d.getUTCHours();var mn=d.getUTCMinutes();var ampm=hr>=12?"PM":"AM";hr=hr%12||12;timeStr=mo+"/"+day+" · "+hr+":"+(mn<10?"0":"")+mn+" "+ampm;}',
    'var timeStr="";if(event.starts_at){var d=new Date(event.starts_at);var h=d.getHours();var m=d.getMinutes();timeStr=(d.getMonth()+1)+"/"+d.getDate();if(h!==0||m!==0){timeStr+=" · "+d.toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit"});}}'
)
open('src/App.jsx','w').write(c)
print("Done")
