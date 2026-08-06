index-D71uXuZ9.js:3703 [echo-adapter] Skills geradas: 1219 | Classes com skills: 131
index-D71uXuZ9.js:4790 [GameBootstrap] Jogo inicializado com sucesso em modo modular reativo!
firestore.googleapis.com/google.firestore.v1.Firestore/Write/channel?gsessionid=xNMqMJsufhYf-0eO_1MbjGMIxUrl2K64QkgbavbSGk2ND3AsXAvtvQ&VER=8&database=projects%2Fadenarena-6e448%2Fdatabases%2F(default)&RID=rpc&SID=4N711vZXA0K1CFSs4Uu9Hg&AID=59&CI=0&TYPE=xmlhttp&zx=o46n12fauudj&t=1:1  Failed to load resource: the server responded with a status of 400 ()
firestore.googleapis.com/google.firestore.v1.Firestore/Write/channel?VER=8&database=projects%2Fadenarena-6e448%2Fdatabases%2F(default)&gsessionid=xNMqMJsufhYf-0eO_1MbjGMIxUrl2K64QkgbavbSGk2ND3AsXAvtvQ&SID=4N711vZXA0K1CFSs4Uu9Hg&RID=3987&AID=59&zx=uigz7zqok2y6&t=1:1  Failed to load resource: the server responded with a status of 400 ()
index-D71uXuZ9.js:9617 [2026-08-06T00:50:28.381Z]  @firebase/firestore: Firestore (12.16.0): WebChannelConnection RPC 'Write' stream 0x174ed445 transport errored. Name: undefined Message: undefined
LG @ index-D71uXuZ9.js:9617
 Container pai ID:  | Class: l2inv-doll-col
 hair
 gloves
 weapon
 necklace
 ring
 belt
 helmet
 armor
 legs
 shield
 boots
 hair2
 earring1
 earring2
 ring2
 cloak
 talisman
 agathion
[NOVO] Explique os erros do Console usando o Copilot no Edge: clique em  para explicar um erro.Saiba maisNão mostrar novamente
// Descobre qual STYLE tag controla o inventário
const root = document.getElementById('idle-host')?.shadowRoot || document;
const styles = root.querySelectorAll('style[id]');
console.log('=== STYLES INJETADOS ===');
styles.forEach(s => {
  const hasDoll = s.textContent.includes('l2inv-doll') || s.textContent.includes('equip-slot') || s.textContent.includes('inv-slot');
  console.log(`id="${s.id}" | controla inventário? ${hasDoll ? 'SIM ✅' : 'não'}`);
});
VM69:4 === STYLES INJETADOS ===
VM69:7 id="stage-ui-styles-final" | controla inventário? não
VM69:7 id="inventory-ui-styles" | controla inventário? SIM ✅
undefined
