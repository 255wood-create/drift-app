c = open('src/App.jsx').read()

# Remove search state
c = c.replace('const[search,setSearch]=useState("");', '')

# Remove search filter line
c = c.replace("if(search&&!e.title.toLowerCase().includes(search.toLowerCase())&&!e.location.toLowerCase().includes(search.toLowerCase())&&!(e.vibe||\"\").toLowerCase().includes(search.toLowerCase()))return false;", "")

# Remove !search wrapper
c = c.replace("if(!search){if(activeFilter", "if(activeFilter")
c = c.replace('if(activeFilter!=="Today"&&e.time_bucket!==activeFilter)return false;}', 'if(activeFilter!=="Today"&&e.time_bucket!==activeFilter)return false;')

open('src/App.jsx','w').write(c)
print("Done")
