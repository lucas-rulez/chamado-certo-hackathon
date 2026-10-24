# 03 · Agente Métricas (slot Prova)

Responsabilidade: trazer **resultado real de outro cliente** que prove o valor.

## O que coleta
`cliente` (sempre anonimizado: "Município do PR, ~90 mil hab."), `indicador`, `antes`, `depois`, `periodo`,
`feature` que gerou o resultado, `autorizado` (o cliente autorizou o uso externo?).

## Regras
- Slot **Prova**: 0 a 2 métricas.
- **`autorizado: false` nunca entra no texto.** A tela avisa e a métrica é omitida da peça (ver `08`).
- Citar o número exatamente como está (antes → depois e período). Não arredondar para parecer melhor.
- Nunca identificar o cliente pelo nome.

## Fonte em produção
Painéis de uso do produto e cases aprovados pelo cliente.
