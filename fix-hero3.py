c = open('src/App.jsx').read()

# Move the image and overlay outside the 180px div to cover the whole header
# Current structure: header > div(180px with image) > div(filters) > div(categories)
# New: header > image covering all > overlay covering all > content on top

old = '''<header style={{position:"sticky",top:0,zIndex:40}}>
            <div style={{position:"relative",height:180,overflow:"hidden",background:T.pine}}>
              <img src="/hero.jpg" style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover"}}/>
              <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(47,93,80,0.85) 0%,rgba(47,93,80,0.4) 50%,rgba(47,93,80,0.2) 100%)"}}/>'''

new = '''<header style={{position:"sticky",top:0,zIndex:40,overflow:"hidden"}}>
            <div style={{position:"absolute",inset:0}}>
              <img src="/hero.jpg" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
              <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(47,93,80,0.9) 0%,rgba(47,93,80,0.6) 40%,rgba(47,93,80,0.3) 100%)"}}/>
            </div>
            <div style={{position:"relative",height:180}}>'''

# Also need to close the extra div and make filters relative
old2 = '''            <div style={{background:T.pine,padding:"10px 16px",display:"flex",gap:6,justifyContent:"center"}}>'''
new2 = '''            <div style={{position:"relative",padding:"10px 16px",display:"flex",gap:6,justifyContent:"center"}}>'''

old3 = '''            <div style={{background:T.pine,display:"flex",gap:6,padding:"0 16px 12px",justifyContent:"center"}}>'''
new3 = '''            <div style={{position:"relative",display:"flex",gap:6,padding:"0 16px 12px",justifyContent:"center"}}>'''

c = c.replace(old, new)
c = c.replace(old2, new2)
c = c.replace(old3, new3)
open('src/App.jsx','w').write(c)
print("Done")
