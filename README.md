# IdentificaCRT — Regime de Tributação via XML (NF-e)

Site estático (arquivo único `identificador-regime-crt.html`) que identifica o **regime de tributação do emitente** a partir da tag `<CRT>` dos XMLs de **NF-e / NFC-e**. Sem backend, sem instalação: tudo roda no navegador e nenhum arquivo sai da sua máquina.

## Como identifica

Lê `<CRT>` dentro de `<emit>` de cada XML:

| CRT | Regime |
| --- | ------ |
| 1 | Simples Nacional |
| 2 | Simples Nacional — excesso de sublimite de receita bruta |
| 3 | Regime Normal — desdobrado pelo PIS: `<pPIS>` **0,65%** = Lucro Presumido (cumulativo), **1,65%** = Lucro Real (não-cumulativo) |
| 4 | MEI — Microempreendedor Individual |

Se o PIS vier com outra alíquota ou ausente, o CRT 3 aparece como **“Regime Normal (a confirmar)”**. Somente NF-e/NFC-e são aceitas (arquivos sem `<infNFe>` são rejeitados).

## Recursos

- **Upload em lote** — arrastar e soltar ou selecionar vários `.xml`
- **7 cards em linha única** — valores somados por regime (CRT 1, CRT 2, CRT 3 total, Presumido, Real, MEI) + Total geral, cada um com a quantidade de notas
- **Valor da NF** — lê `<vNF>` do `ICMSTot` (ou soma os `<vProd>` como fallback) por nota, com soma por regime e soma total
- **Tabela detalhada** — emitente/CNPJ, arquivo/NF, CRT, regime, PIS (`pPIS` + CST), valor e interpretação
- **Busca, filtro por regime, paginação** (10/25/50/100 linhas por página)
- **“Corrigir…” por linha** — ajuste manual do regime quando o XML não traz marcador suficiente (ex.: CRT 3 sem PIS); cards e totais recalculam na hora
- **Exportar CSV** (com linha de totais por regime + total geral) e **impressão/PDF** (coluna CRT ocultada no papel)
- **Limpar tudo** — esvazia a base para carregar outros XMLs

## Como usar

1. Baixe ou clone este repositório.
2. Abra `identificador-regime-crt.html` em qualquer navegador moderno (duplo clique basta).
3. Arraste os XMLs para a área de upload.
4. Consulte os cards, filtre, corrija se preciso, exporte em CSV ou imprima.

## Arquivos

| Arquivo | Descrição |
| ------- | --------- |
| `identificador-regime-crt.html` | O site completo (HTML + CSS + JS em um só arquivo) |
| `README.md` | Esta documentação |

## Privacidade

Todo o processamento é local (FileReader + DOMParser no navegador). Nenhum XML é enviado para servidores.
