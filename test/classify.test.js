/* Testes da lógica fiscal do index.html. Rode com: node test/classify.test.js */
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const script = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].pop()[1];

function el() {
  return { textContent: '', value: '', innerHTML: '', style: {}, disabled: false,
    classList: { add() {}, remove() {} }, addEventListener() {}, appendChild() {} };
}
const ids = {};
global.document = { getElementById: (id) => ids[id] || (ids[id] = el()), createElement: el };
global.window = { addEventListener() {} };
global.FileReader = function () {};
global.Blob = function () {};
global.confirm = () => false;

vm.runInThisContext(script);
const api = window.__IDENTIFICACRT__;

let fail = 0;
function eq(label, got, want) {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) { fail++; console.log('FALHOU ' + label + ': obtido ' + JSON.stringify(got) + ', esperado ' + JSON.stringify(want)); }
  else console.log('ok     ' + label);
}
function tem(label, lista, trecho) {
  const ok = lista.some((c) => c.indexOf(trecho) >= 0);
  if (!ok) { fail++; console.log('FALHOU ' + label + ': nao achou "' + trecho + '" em ' + JSON.stringify(lista)); }
  else console.log('ok     ' + label);
}
function vazio(label, lista) {
  if (lista.length) { fail++; console.log('FALHOU ' + label + ': esperava sem alertas, veio ' + JSON.stringify(lista)); }
  else console.log('ok     ' + label);
}

/* classificação: CRT + tpRegimeIBSCBS */
const casos = [
  ['1', '1', '1', true], ['1', '', '1', null], ['1', '2', 'X', null],
  ['2', '1', '2', true], ['2', '', '2', null],
  ['3', '2', '3P', false], ['3', '3', '3P', false], ['3', '4', '3P', true],
  ['3', '', '3', false], ['3', '1', 'X', null],
  ['4', '', '4', false], ['4', '1', '4', false],
  ['', '', '0', null], ['9', '', '0', null], ['1', '9', 'X', null]
];
casos.forEach(([crt, tp, key, rr]) => {
  const r = api.classify(crt, tp, NaN);
  eq('CRT ' + (crt || 'vazio') + ' tp ' + (tp || 'vazio'), [r.key, r.rr], [key, rr]);
});

/* ibs: regime regular x simples x nao informado */
[
  ['1', '1', 'regular'], ['1', '', 'nao_informado'], ['1', '2', '?'],
  ['2', '1', 'regular'], ['2', '', 'nao_informado'],
  ['3', '2', 'regular'], ['3', '3', 'regular'], ['3', '4', 'regular'], ['3', '', 'regular'], ['3', '1', '?'],
  ['4', '', 'mei'], ['', '', '?']
].forEach(([crt, tp, ibs]) => eq('ibs CRT ' + crt + ' tp ' + (tp || 'vazio'), api.classify(crt, tp, NaN).ibs, ibs));

/* conferência NT 2026.005 */
const base = { crt: '3', tp: '2', cAtiv: ['01'], camposNT: true, hasItem: true, temIBSSN: true,
  itemIBSCBS: false, gTot: true, vIBSSNtot: 10, vIBSSNsum: 10, vCBSSNtot: 9, vCBSSNsum: 9 };
const c = (o) => api.conferir(Object.assign({}, base, o));

vazio('tp=2 completo', c({}));
tem('tp=2 sem cAtivSN', c({ cAtiv: [] }), 'cAtivSN ausente');
tem('tp=3 com gIBSSN', c({ tp: '3', temIBSSN: true }), 'gIBSSN');
vazio('tp=3 só gCBSSN', c({ tp: '3', temIBSSN: false }));
tem('CRT 2 sem tp com gIBSSN', c({ crt: '2', tp: '', temIBSSN: true }), 'gIBSSN');
tem('tp=1 com gTribSN', c({ crt: '1', tp: '1', temIBSSN: false }), 'gTribSN não deve');
tem('tp=4 com gTribSN', c({ tp: '4', temIBSSN: false }), 'gTribSN não deve');
vazio('tp=1 limpo', c({ crt: '1', tp: '1', cAtiv: ['01'], hasItem: false, gTot: false, temIBSSN: false }));
tem('regra 1275', c({ gTot: false }), '1275');
tem('regra 1276', c({ hasItem: false }), '1276');
tem('regra 1277', c({ vIBSSNtot: 99 }), '1277');
tem('regra 1284', c({ vCBSSNtot: 99 }), '1284');
tem('MEI com IBSCBS', c({ crt: '4', tp: '', itemIBSCBS: true }), 'MEI');
vazio('XML anterior à NT não acusa cAtivSN', c({ crt: '1', tp: '', camposNT: false, hasItem: false, gTot: false, temIBSSN: false }));

console.log(fail ? '\nRESULTADO: ' + fail + ' falha(s)' : '\nRESULTADO: todos os casos ok');
process.exit(fail ? 1 : 0);
