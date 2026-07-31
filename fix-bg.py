c = open('src/App.jsx').read()

# Replace video with a CSS gradient that looks like mountains
old = '''<video autoPlay muted loop playsInline style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover"}}>
                <source src="https://cdn.pixabay.com/video/2016/09/05/4899-182438404_tiny.mp4" type="video/mp4"/>
              </video>
              <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(47,93,80,0.85) 0%,rgba(47,93,80,0.5) 50%,rgba(47,93,80,0.3) 100%)"}}/>'''

new = '''<div style={{position:"absolute",inset:0,background:"linear-gradient(160deg,#1a3830 0%,#2F5D50 40%,#4F86A6 70%,#D9A441 100%)"}}/>
              <div style={{position:"absolute",bottom:0,left:0,right:0,height:"60%",background:"linear-gradient(to top,rgba(26,56,48,0.95),transparent)"}}/>'''

c = c.replace(old, new)
open('src/App.jsx','w').write(c)
print("Done")
