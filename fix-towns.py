c = open('fetch3.js').read()

c = c.replace(
    'var r=await getJson({engine:"google_events",q:"Things to do in Boulder CO this week",api_key:K});',
    '''var queries=["Things to do in Boulder CO this week","Events in Lyons CO","Events in Louisville CO","Events in Lafayette CO","Events in Nederland CO"];
var allEvts=[];
for(var q=0;q<queries.length;q++){
console.log("Searching: "+queries[q]);
var r=await getJson({engine:"google_events",q:queries[q],api_key:K});
var e=r.events_results||[];
allEvts=allEvts.concat(e);
}
console.log("Total found: "+allEvts.length);
var r={events_results:allEvts};'''
)

open('fetch3.js','w').write(c)
print("Done")
