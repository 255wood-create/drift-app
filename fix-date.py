c = open('fetch3.js').read()

old = 'if(parts.length===2){sd=new Date(parts[0]+" "+parts[1]+", "+new Date().getFullYear()).toISOString();}'
new = 'if(parts.length===2){try{sd=new Date(parts[0]+" "+parts[1]+", "+new Date().getFullYear()).toISOString();}catch(e){sd=null;}}'

old2 = 'else{sd=new Date(e.date.start_date).toISOString();}'
new2 = 'else{try{sd=new Date(e.date.start_date).toISOString();}catch(e2){sd=null;}}'

c = c.replace(old, new)
c = c.replace(old2, new2)
open('fetch3.js','w').write(c)
print("Done")
