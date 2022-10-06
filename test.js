let date = new Date();
date.setHours(date.getHours() + 1);
let nd = date.toLocaleString('sv-SE', { timeZone:  'America/Lima' })

console.log(nd);
