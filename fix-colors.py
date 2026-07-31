c = open('src/App.jsx').read()

# Time filter buttons - active background to white, text to dark gray
c = c.replace(
    'background:activeFilter===f?T.amber:"rgba(245,243,239,0.1)",color:activeFilter===f?T.charcoal:"rgba(245,243,239,0.6)"',
    'background:activeFilter===f?"#FFFFFF":"rgba(245,243,239,0.1)",color:activeFilter===f?"#3D4240":"#3D4240"'
)

# Category buttons - active background to white, text to dark gray
c = c.replace(
    'background:isA?(meta?.bg||"rgba(245,243,239,0.9)"):"rgba(245,243,239,0.1)",color:isA?(meta?.color||T.charcoal):"rgba(245,243,239,0.6)"',
    'background:isA?"#FFFFFF":"rgba(245,243,239,0.1)",color:isA?"#3D4240":"#3D4240"'
)

# Category border - simplify
c = c.replace(
    'border:"0.5px solid "+(isA?(meta?.color||T.fog):"rgba(245,243,239,0.2)")',
    'border:isA?"0.5px solid #FFFFFF":"0.5px solid rgba(245,243,239,0.2)"'
)

open('src/App.jsx','w').write(c)
print("Done")
