c = open('src/App.jsx').read()
c = c.replace(
    'var timeStr="";if(event.starts_at){var d=new Date(event.starts_at);var h=d.getUTCHours();var m=d.getUTCMinutes();var ampm=h>=12?"PM":"AM";h=h%12||12;timeStr=(d.getUTCMonth()+1)+"/"+d.getUTCDate();if(!(h===12&&m===0&&ampm==="AM")){timeStr+=" · "+h+":"+(m<10?"0":"")+m+" "+ampm;}}',
    'var timeStr="";if(event.starts_at){var d=new Date(event.starts_at);var uh=d.getUTCHours();var um=d.getUTCMinutes();timeStr=(d.getUTCMonth()+1)+"/"+d.getUTCDate();if(!((uh===0&&um===0)||(uh===6&&um===0))){var ampm=uh>=12?"PM":"AM";var h=uh%12||12;timeStr+=" · "+h+":"+(um<10?"0":"")+um+" "+ampm;}}'
)
open('src/App.jsx','w').write(c)
print("Done")
