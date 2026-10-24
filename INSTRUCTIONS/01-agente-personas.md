# 01 · Agente Personas (slot Destinatário)

Responsabilidade: dizer **para quem** é a peça.

## O que coleta, por cidade
`nome`, `cargo`, `secretaria`, `email`, `whatsapp`, `optin` (aceitou receber WhatsApp?), `fonte` (Diário Oficial,
Portal da transparência…).

## Regras
- O slot **Destinatário** aceita **exatamente 1** pessoa. Sem destinatário, não dá para copiar o contexto nem salvar.
- `optin: false` bloqueia qualquer peça de WhatsApp para essa pessoa (ver `08`).
- O cargo define o tom: secretário e prefeito querem resultado e prazo; diretor e pregoeiro querem como funciona no dia a dia.

## Fonte em produção
Diário Oficial (nomeações), portal da transparência e o CRM da Aprova.
Na demo: dados fictícios das cidades A, B e C.
