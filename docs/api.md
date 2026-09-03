# Contrato da API de reservas

Configure `window.MENTE_CORPO_API_URL` em `api-config.js`. Com uma URL preenchida, as duas telas deixam de usar `localStorage` e chamam esta API.

## `GET /reservas`

Retorna HTTP 200 com uma lista:

```json
[
  {
    "id": "uuid",
    "name": "Lucas Pimentel Bento",
    "classId": "seg-0700",
    "className": "Vinyasa suave",
    "day": "SEG",
    "date": "07 OUT",
    "time": "07:00",
    "createdAt": "2026-09-03T12:00:00.000Z"
  }
]
```

## `POST /reservas`

Recebe o mesmo objeto sem `id`. O backend deve validar a aula, impedir duplicidade do praticante e fazer a contagem de vagas dentro de uma transação. Retorna HTTP 201 com a reserva criada.

Erros esperados: `400` para dados inválidos, `409` para turma cheia ou duplicidade e `500` para falha interna.

## `DELETE /reservas`

Rota exclusiva do operador autenticado. Remove ou cancela as reservas conforme a política de retenção. Retorna HTTP 204.

## CORS e autenticação

- Permitir origem apenas do domínio publicado.
- Exigir HTTPS.
- Proteger `GET` e `DELETE` do operador com sessão/JWT e perfil de operador.
- Aplicar rate limit no `POST`.
- Nunca confiar na capacidade enviada pelo navegador; a capacidade vem da tabela `aulas`.
