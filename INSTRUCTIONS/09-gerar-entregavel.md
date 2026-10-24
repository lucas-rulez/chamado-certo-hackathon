# 09 · Gerar o entregável

Entrada: o contexto do `07` + o formato escolhido + o ângulo do texto.

## Formatos (aba Entregável)

| Formato | Saída | Canal | Precisa de |
|---|---|---|---|
| Mensagem de WhatsApp | texto até ~600 caracteres | WhatsApp | Destinatário (com opt-in) |
| E-mail | assunto + corpo | e-mail | Destinatário |
| PDF one-pager | A4, 1 página | ambos | Destinatário + (Gancho ou Prova) |
| Card de prova | imagem 1080×1080 | ambos | Prova autorizada |
| Animação da tela | vídeo 16:9 ou 9:16, 10 a 15 s | ambos | Visual ou Telas |
| Carrossel | 3 a 5 slides 1080×1350 | ambos | Gancho + Prova autorizada |

## Ângulos do texto

| Ângulo | Como abre | Precisa de |
|---|---|---|
| Problema → solução | pelo desafio da notícia, depois como a Aprova ajuda | um Gancho |
| Prova primeiro | pelo resultado (antes → depois) de outro município | uma Prova autorizada |
| Urgência | pelo momento (contrato vencendo, dotação na LOA) | um Momento |

## Regras de escrita
- **WhatsApp:** curto, primeira pessoa, uma pergunta no fim. Sem anexo pesado na primeira mensagem.
- **E-mail:** assunto com o tema do gestor (não com o nome do produto); 3 parágrafos curtos; um único convite.
- Chamar o destinatário pelo nome e cargo; citar a cidade dele.
- Fechar com o **Objetivo** (ex. convite para reunião = propor 2 horários; nutrição = só entregar valor, sem pedir nada).
- Assinatura do CSA, nunca "Equipe".

## Na demo do hackathon
A geração é feita pelo próprio `banco-insumos-builder.html`, a partir das mesmas regras e do mesmo contexto,
sem chamar um modelo de IA. Em produção, este arquivo é o prompt da etapa de geração.
