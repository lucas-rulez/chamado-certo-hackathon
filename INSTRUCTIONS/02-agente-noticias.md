# 02 · Agente Notícias (slot Gancho)

Responsabilidade: achar **o assunto do momento** na cidade que abre a conversa.

## O que coleta
`titulo`, `resumo`, `tema` (finanças, saúde…), `tom` (positivo, neutro, crítico), `desafio` (ex. "licitações desertas"),
`fonte`, `link`, `cidade`.

## Regras
- Slot **Gancho**: 0 a 2 notícias.
- Notícia de **tom crítico**: nunca expor o gestor nem apontar culpados. Tratar como desafio comum aos municípios
  e posicionar a Aprova como apoio.
- Notícia de **outra cidade**: usar como referência regional, nunca como fato do município do destinatário.

## Fonte em produção
Portais de notícia locais, site da prefeitura e da câmara, portal da transparência.
