c = open('src/App.jsx').read()
c = c.replace(
    '        if(activeFilter==="Today"&&e.time_bucket!=="Today"&&e.time_bucket!=="Tonight")return false;\n    if(activeFilter!=="Today"&&e.time_bucket!==activeFilter)return false;\n    if(search',
    '        if(!search){if(activeFilter==="Today"&&e.time_bucket!=="Today"&&e.time_bucket!=="Tonight")return false;\n    if(activeFilter!=="Today"&&e.time_bucket!==activeFilter)return false;}\n    if(search'
)
open('src/App.jsx','w').write(c)
print("Done")
