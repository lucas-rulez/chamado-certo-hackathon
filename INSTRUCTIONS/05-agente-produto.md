# 05 · Agente Produto (slot Telas do produto)

Responsabilidade: mostrar **o produto de verdade** e montar o roteiro do que destacar.

## O que coleta
Telas reais do produto, com `descricao`, `beneficio` e **regiões** marcadas na tela:

| Tela | Arquivo | Regiões |
|---|---|---|
| Catálogo de serviços | `__exemplo/catalogo.html` | menu, busca, botão "Criar processo", lista de serviços, card "Solicitar"… (por seletor CSS) |
| Solicitação de processo | `__exemplo/solicitacao.html` | passos do formulário, painel de dicas, aviso de campo obrigatório, "Salvar rascunho", "Finalizar"… (retângulos sobre a captura da tela) |

## Regras
- Slot **Telas do produto**: 0 a 3 itens.
- O roteiro (ordem das regiões) vira a animação: cada passo destaca uma região e explica em uma frase.
- Só destacar o que existe na tela. Não prometer funcionalidade que não aparece.

## Fonte em produção
Telas do ambiente de demonstração do Aprova.
