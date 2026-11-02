const allowed=new Set(['dashboard','profile','slots','reservations','queue','availability','verify','accounts','balance','about','help']);
export function previousWorkspacePage(){
 try{const page=new URLSearchParams(window.location.search).get('page')||sessionStorage.getItem('smart-last-screen')||localStorage.getItem('smart-last-screen');return allowed.has(page)?page:'dashboard';}catch{return 'dashboard';}
}
export function rememberWorkspacePage(page){
 if(window.location.pathname.startsWith('/verify')||!allowed.has(page))return;
 try{sessionStorage.setItem('smart-last-screen',page);localStorage.setItem('smart-last-screen',page);}catch{}
}
export function returnToPreviousScreen(){
 if(window.history.length>1&&document.referrer&&new URL(document.referrer).origin===window.location.origin){window.history.back();return;}
 window.location.assign('/?page='+encodeURIComponent(previousWorkspacePage()));
}
