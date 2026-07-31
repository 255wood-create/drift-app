c = open('src/App.jsx').read()

old = '''<div style={{position:"absolute",inset:0,background:"linear-gradient(160deg,#1a3830 0%,#2F5D50 40%,#4F86A6 70%,#D9A441 100%)"}}/>
              <div style={{position:"absolute",bottom:0,left:0,right:0,height:"60%",background:"linear-gradient(to top,rgba(26,56,48,0.95),transparent)"}}/>'''

new = '''<img src="/hero.jpg" style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover"}}/>
              <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(47,93,80,0.85) 0%,rgba(47,93,80,0.4) 50%,rgba(47,93,80,0.2) 100%)"}}/>'''

c = c.replace(old, new)
open('src/App.jsx','w').write(c)
print("Done")
