# Documento de implantação

**Projeto:** Portal do aluno Mente & Corpo  
**Responsável:** Lucas Pimentel Bento  
**Data-base:** 03/09/2026

## 1. Arquitetura proposta

- **Frontend:** arquivos estáticos HTML, CSS e JavaScript publicados em Amazon S3 + CloudFront (ou GitHub Pages para homologação).
- **API:** AWS API Gateway com Lambda `POST /reservas` e `GET /reservas`.
- **Banco:** DynamoDB, tabela `Reservas`, com `id` como chave e `aulaId` como índice secundário.
- **Domínio:** `mentecorpo.yoga` (simulado nesta prova) administrado no Route 53.
- **Segurança:** HTTPS obrigatório, CORS restrito ao domínio, validação de nome/aula na API, IAM com menor privilégio e logs no CloudWatch.

Nesta entrega, o `localStorage` representa a camada de persistência em ambiente de demonstração. A interface, as regras de lotação e o fluxo de operação são os mesmos da versão publicada.

## 2. Provisionamento

1. Criar bucket S3 privado para artefatos e distribuição CloudFront com Origin Access Control.
2. Criar distribuição CloudFront com certificado ACM para `mentecorpo.yoga` e `www.mentecorpo.yoga`.
3. Criar tabela DynamoDB `Reservas` em `sa-east-1`, com TTL opcional em `createdAt` após a retenção definida pela empresa.
4. Criar Lambda com funções de leitura e gravação. A função deve rejeitar aula inexistente e reservas acima da capacidade de oito tapetes.
5. Publicar os arquivos do portal e configurar invalidation da distribuição a cada release.
6. Ativar alarmes de erro 5xx da API, latência e disponibilidade do CloudFront.

## 3. Domínio simulado e DNS

Domínio de homologação usado neste documento: `mentecorpo.yoga`.

- Registro `A/AAAA` (alias) para `mentecorpo.yoga` apontando para CloudFront.
- Registro `CNAME` `www` apontando para o domínio CloudFront.
- Registro `TXT` do ACM para validar o certificado.
- Redirecionamento de `www` para o domínio canônico.

Não há compra ou alteração de domínio nesta prova; os registros acima são o plano de configuração.

## 4. Teste de estabilidade

Checklist de aceite executado no protótipo:

- A página abre sem servidor de aplicação e em viewport móvel.
- Agenda renderiza oito aulas e indica a capacidade restante.
- Nome vazio ou aula não selecionada não gera reserva.
- Uma reserva aparece imediatamente no painel do instrutor.
- Lotação é bloqueada quando a capacidade da aula é atingida.
- Recarregar a página preserva as reservas do mesmo navegador.
- Limpar reservas exige confirmação.

Para produção, repetir com teste de carga de 50 requisições por minuto, monitorar 5xx por 30 minutos e validar restauração de uma reserva a partir do backup DynamoDB.

## 5. Operação e rollback

Cada publicação recebe um identificador de release. Em caso de erro, restaurar o último artefato conhecido no bucket, invalidar o cache CloudFront e verificar o fluxo de criação de reserva. Logs e alarmes ficam retidos por 30 dias. Mudanças de schema exigem backup e plano de reversão antes da publicação.
