c = open('src/App.jsx').read()

old = '''<div style={{position:"relative",height:180,background:"url('https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&q=80') center/cover",overflow:"hidden"}}>
              <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(47,93,80,0.95) 0%,rgba(47,93,80,0.4) 50%,rgba(47,93,80,0.2) 100%)"}}/>'''

new = '''<div style={{position:"relative",height:180,overflow:"hidden",background:T.pine}}>
              <video autoPlay muted loop playsInline style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover"}}>
                <source src="https://cdn.pixabay.com/video/2016/09/05/4899-182438404_tiny.mp4" type="video/mp4"/>
              </video>
              <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(47,93,80,0.85) 0%,rgba(47,93,80,0.5) 50%,rgba(47,93,80,0.3) 100%)"}}/>'''

c = c.replace(old, new)
open('src/App.jsx','w').write(c)
print("Done")
