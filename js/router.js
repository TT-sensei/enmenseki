const routes=[];
export function addRoute(pattern,handler){routes.push({pattern,handler})}
export function navigate(path){location.hash=path.startsWith('#')?path:`#${path}`}
export function startRouter(fallback){const resolve=()=>{const hash=location.hash||'#home';for(const r of routes){const match=hash.match(r.pattern);if(match){r.handler(...match.slice(1));return}}fallback(hash)};addEventListener('hashchange',resolve);resolve()}
