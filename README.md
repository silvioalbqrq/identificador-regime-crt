# IdentificaCRT — Regime de Tributação via XML (NF-e / NFC-e)

Site estático de arquivo único (`index.html`) que identifica o **regime de tributação do emitente** a partir do `<CRT>` e do `<tpRegimeIBSCBS>` dos XMLs de NF-e (modelo 55) e NFC-e (modelo 65), conforme a **NT 2026.005 v1.00** (produção em 16/11/2026). Sem backend, sem instalação: tudo roda no navegador e nenhum XML sai da máquina.

## Como identifica

Lê `<emit><CRT>` + `<emit><tpRegimeIBSCBS>` e complementa com `<cAtivSN>` (item) e os grupos `gTribSN` / `gIBSSN` / `gCBSSN`.

| CRT | tpRegimeIBSCBS | Leitura |
| --- | --- | --- |
| 1 ou 2 | 1 | Simples que optou pelo regime regular do IBS/CBS (crédito integral) |
| 1 ou 2 | ausente | Simples sem regime regular informado — em XML anterior à NT o campo não existe |
| 3 | 2 ou 3 | Regime Normal com opção pendente pelo Simples; considerado regime regular |
| 3 | 4 | Opção pendente pelo Simples e optante do regime regular do IBS/CBS |
| 3 | ausente | Regime Normal (regime regular do IBS/CBS) |
| 4 | — | MEI: não informa o grupo IBSCBS |
| outro | qualquer | Inconsistente / CRT inválido |

Regime regular do IBS/CBS = **CRT 3 (qualquer tp válido ou ausente)** ou **CRT 1/2 com tp=1**. O PIS/COFINS **não** define o regime: `pPIS` 0,65% / 1,65% aparece apenas como indício de Lucro Presumido / Real quando o CRT é 3 sem `tp`. A partir de 2027 a coluna passa a mostrar só o `pCBS` (referência da CBS cheia: 11,34%), e a identificação continua a mesma.

## Conferência NT 2026.005

Por nota, o site aponta as rejeições 1275, 1276, 1277 e 1284, o MEI que informa IBSCBS, `gTribSN` indevido em quem optou pelo regime regular, `gIBSSN` indevido nos regimes que só levam `gCBSSN` e `cAtivSN` ausente quando a NT exige. XML anterior à NT recebe aviso neutro, não alerta.

## Recursos

- Upload em lote por arrastar/soltar, seleção de vários arquivos ou de uma pasta inteira (subpastas incluídas); ordem preservada; XML repetido (mesma chave de acesso) é ignorado com aviso
- Arquivo com mais de uma NF-e é dividido: uma linha por nota
- Cards por regime e total geral, com valor e quantidade
- Busca por empresa, arquivo, número da nota ou CNPJ (com ou sem pontuação), filtro por regime (inclui **Regime Regular do IBS/CBS (todos)** e **Com opção explícita pelo Regular (tp 1/4)**), paginação
- “Corrigir…” por linha para ajuste manual do regime
- CSV com os campos da NT (`regime_ibs_cbs`, `cAtivSN`, `vIBSSN`/`vCBSSN` item e total, conferência) e impressão/PDF

## Como usar

1. Abra `index.html` no navegador (no repositório publicado: https://silvioalbqrq.github.io/identificador-regime-crt/).
2. Arraste os XMLs para a área de upload.
3. Consulte, filtre, corrija se preciso, exporte o CSV ou imprima.

## Testes

```bash
node test/classify.test.js
```

Cobre a matriz CRT × `tpRegimeIBSCBS`, o campo `regime_ibs_cbs` e as regras de conferência. Não tem dependências.

## Arquivos

| Arquivo | Descrição |
| --- | --- |
| `index.html` | O site completo (HTML + CSS + JS em um só arquivo) |
| `test/classify.test.js` | Testes da classificação e da conferência |
| `README.md` | Esta documentação |

## Privacidade

Todo o processamento é local (`FileReader` + `DOMParser` no navegador). Nenhum XML é enviado para servidores.
