const initial={route:'#home',problem:null,step:1,strategy:null,expression:'',answer:'',unit:'cm²',hintsUsed:0,attempts:0,correct:false,streak:0};
let state={...initial};const listeners=new Set();
export const getState=()=>state;
export function setState(patch){state={...state,...patch};listeners.forEach(fn=>fn(state))}
export function resetProblem(problem){state={...state,problem,step:1,strategy:null,expression:'',answer:'',unit:problem?.unit||'cm²',hintsUsed:0,attempts:0,correct:false};listeners.forEach(fn=>fn(state))}
export const subscribe=fn=>(listeners.add(fn),()=>listeners.delete(fn));
