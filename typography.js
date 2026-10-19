// Decorate text nodes only. Document text never becomes executable HTML.
export function mixedScriptParts(text,paragraphHasHan=false){
 if(!paragraphHasHan&&!/\p{Script=Han}/u.test(text))return [{text,english:false}];
 const parts=[];let end=0;
 for(const m of text.matchAll(/[A-Za-z][A-Za-z0-9]*(?:[ \u00a0]+[A-Za-z][A-Za-z0-9]*)*/g)){
  if(m.index>end)parts.push({text:text.slice(end,m.index),english:false});
  parts.push({text:m[0],english:true});end=m.index+m[0].length;
 }
 if(end<text.length)parts.push({text:text.slice(end),english:false});
 return parts;
}
export function applyMixedTypography(root){
 if(!globalThis.document?.createTreeWalker||!root)return;
 const walker=document.createTreeWalker(root,4),nodes=[];
 while(walker.nextNode())nodes.push(walker.currentNode);
 for(const node of nodes){
  const parent=node.parentElement;
  if(!parent?.closest('p,li,.info,.intro,.more-subtitle,.workflow-step')||parent.closest('script,style,textarea,input,pre,code,svg,.latin-run,.money,[data-source-text]'))continue;
  const paragraph=parent.closest('p,li,.info,.intro,.more-subtitle,.workflow-step');
  const parts=mixedScriptParts(node.textContent,/\p{Script=Han}/u.test(paragraph.textContent||''));
  if(!parts.some(p=>p.english))continue;
  const fragment=document.createDocumentFragment();
  for(const p of parts){if(p.english){const span=document.createElement('span');span.className='latin-run';span.lang='en';span.textContent=p.text;fragment.append(span);}else fragment.append(document.createTextNode(p.text));}
  node.replaceWith(fragment);
 }
}
if(globalThis.document?.createTreeWalker&&globalThis.MutationObserver){
 const roots=['app','modalroot'].map(id=>document.getElementById(id)).filter(Boolean);
 const observer=new MutationObserver(()=>{observer.disconnect();for(const root of roots)applyMixedTypography(root);watch();});
 function watch(){for(const root of roots)observer.observe(root,{childList:true,subtree:true,characterData:true});}
 for(const root of roots)applyMixedTypography(root);watch();
}
