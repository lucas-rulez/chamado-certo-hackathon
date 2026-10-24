# Banco de Insumos · Builder de Entregáveis

Hackathon Aprova · 24/10/2026 · **Desafio CS**

> Como tirar o CSA da operação para gerar valor e expansão com quem decide?

## O problema
Depois da implantação, o CSA deveria cuidar do relacionamento com secretários e prefeito para garantir
renovação e expansão. Na prática, fica preso na operação, e montar um material personalizado para cada
gestor (com o assunto da cidade, um resultado que prove valor e o momento certo) leva horas. O cliente é
ocupado, pouco técnico e vive no WhatsApp.

## A solução
Um **banco de insumos por cidade**, alimentado por 6 agentes, e um **builder** que transforma a escolha do
CSA em uma peça pronta para enviar.

1. **Insumos:** para a cidade-alvo, a tela mostra o que já se sabe:
   pessoas (destinatários), notícias, métricas de outros clientes, visuais, telas do produto e sinais de compra.
2. **Composição:** o CSA escolhe um insumo por slot (Destinatário, Gancho, Prova, Visual, Telas, Momento),
   o canal (e-mail ou WhatsApp) e o objetivo (primeiro contato, nutrição, convite para reunião, reativação).
3. **Travas:** a tela bloqueia o que não pode sair (WhatsApp sem opt-in, métrica sem autorização de uso)
   e orienta o tom (notícia crítica, notícia de outra cidade).
4. **Entregável:** gera WhatsApp, e-mail, PDF one-pager, card de prova, animação da tela ou carrossel,
   com três ângulos de texto (problema → solução, prova primeiro, urgência).

## O que o CSA consegue (critérios do desafio)

| Critério da aba CS | Como a solução atende |
|---|---|
| Criar materiais personalizados com os resultados obtidos | slot **Prova** com métricas reais (antes → depois), só as autorizadas |
| Chegar a secretários e diretores de outras secretarias com conteúdo feito para cada um | slot **Destinatário** por cargo e secretaria, texto adaptado ao cargo |
| Captar pistas de expansão | slot **Momento**: contrato vencendo, dotação na LOA, ata no PNCP |
| Mostrar o que a plataforma faz | slots **Visual** e **Telas**, com roteiro que vira animação |
| Nível de automação do trabalho do CSA | da escolha dos insumos à peça pronta em poucos cliques |

## Como rodar
Não precisa instalar nada.

1. Abra `banco-insumos-builder.html` no navegador (Chrome recomendado).
2. Escolha a **cidade-alvo** (A, B ou C).
3. Adicione insumos aos slots, escolha canal e objetivo.
4. Veja o contexto montado e gere a peça na aba **Entregável**.

Os dados são fictícios (cidades A, B e C). `banco-insumos.html` é a primeira versão (só monta o contexto) e
`__exemplo/catalogo.html` é a tela do produto usada no slot Telas.

## INSTRUCTIONS (o que o agente segue)

| Arquivo | Quando entra | Responsabilidade |
|---|---|---|
| `00-orquestrador.md` | sempre | papel do agente, fluxo e regras gerais |
| `01-agente-personas.md` | coleta · slot Destinatário | quem recebe, cargo, opt-in do WhatsApp |
| `02-agente-noticias.md` | coleta · slot Gancho | assunto do momento na cidade e o tom |
| `03-agente-metricas.md` | coleta · slot Prova | resultado de outro cliente, só com uso autorizado |
| `04-agente-design.md` | coleta · slot Visual | imagem ou animação do benefício |
| `05-agente-produto.md` | coleta · slot Telas | telas reais e roteiro do que destacar |
| `06-agente-sinais.md` | coleta · slot Momento | por que agora: contratos, LOA, PNCP |
| `07-montar-contexto.md` | botão Copiar contexto | junta a composição num contexto único |
| `08-regras-de-seguranca.md` | a cada mudança na composição | travas: opt-in, autorização, tom, cidade |
| `09-gerar-entregavel.md` | aba Entregável | como escrever cada formato e ângulo |

**Na demo**, a coleta usa dados de exemplo e a geração é feita pelo próprio HTML seguindo essas regras,
sem chamar um modelo de IA. As travas do `08` e o contexto do `07` são exatamente o que a tela já faz.
Em produção, cada arquivo é o prompt da sua etapa e os agentes de coleta puxam das fontes reais
(Diário Oficial, PNCP, portal da transparência, painéis de uso do produto).

## Estrutura
```
banco-insumos-builder.html   tela principal (insumos → composição → entregável)
banco-insumos.html           primeira versão (insumos → contexto)
__exemplo/catalogo.html      tela do produto usada no slot Telas
INSTRUCTIONS/                instruções do agente, uma por etapa
nova-compra.html, css/, js/  template base de editor com régua validadora
```

## Próximos passos
- Ligar a geração (`09`) a um modelo de IA e os agentes de coleta (`01` a `06`) às fontes reais.
- Registrar no CRM cada peça enviada e a resposta do gestor, para medir quais insumos convertem.
