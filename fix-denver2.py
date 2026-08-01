c = open('fetch3.js').read()

# Add Denver filter after the junk filter
old = 'if(titles.has((e.title||"").toLowerCase())){console.log("  skip: "+e.title);skip++;continue;}'
new = '''if(titles.has((e.title||"").toLowerCase())){console.log("  skip: "+e.title);skip++;continue;}
var loc=((e.address||[]).join(" ")||"").toLowerCase();
if(loc.indexOf("denver")>=0||loc.indexOf("aurora")>=0||loc.indexOf("lakewood")>=0||loc.indexOf("littleton")>=0){console.log("  denver: "+e.title);junk++;continue;}'''

c = c.replace(old, new)
open('fetch3.js','w').write(c)
print("Done")
