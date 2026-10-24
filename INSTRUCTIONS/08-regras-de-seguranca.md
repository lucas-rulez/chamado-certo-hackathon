# 08 · Regras de segurança (travas)

Estas regras **já funcionam na tela** do Builder (alertas e bloqueios). Aqui estão escritas para o agente seguir
igual na geração.

| Situação | Nível | O que acontece |
|---|---|---|
| Nenhum destinatário escolhido | info | não copia contexto nem salva combinação |
| Canal WhatsApp e destinatário **sem opt-in** | **bloqueio** | geração bloqueada; a tela oferece trocar o canal para e-mail |
| Métrica com **uso não autorizado** | forte | a métrica é omitida da peça; diretriz "não citar" vai no contexto |
| Notícia de **tom crítico** | aviso | diretriz: não expor o gestor nem citar culpados |
| Notícia de **outra cidade** | aviso | diretriz: apresentar como referência regional |

## Regras extras do agente
- Não usar dado pessoal de cidadão. Os insumos são públicos (cargo, notícia, contrato) ou do próprio cliente autorizado.
- Na dúvida entre "peça mais forte" e "regra", vale a regra.
