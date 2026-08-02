export function toast(message){const root=document.querySelector('#toast-root');root.innerHTML=`<div class="toast">${message}</div>`;setTimeout(()=>root.replaceChildren(),2400)}
