c = open('src/App.jsx').read()
c = c.replace(
    'var timeStr="";if(event.starts_at){var d=new Date(event.starts_at);var h=d.getHours();var m=d.getMinutes();timeStr=(d.getMonth()+1)+"/"+d.getDate();if(h!==0||m!==0){timeStr+=" · "+d.toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit"});}}',
    'var timeStr="";if(event.starts_at){var d=new Date(event.starts_at);timeStr=(d.getMonth()+1)+"/"+d.getDate();}'
)
open('src/App.jsx','w').write(c)
print("Done")
