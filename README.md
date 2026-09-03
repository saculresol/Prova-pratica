# Mente & Corpo

Portal institucional do Estúdio de Yoga Mente & Corpo, com agenda semanal e reserva antecipada de tapetes. A operação fica em uma tela separada.

## Executar

Abra `index.html` diretamente no navegador. Para simular hospedagem local, execute um servidor estático na pasta, por exemplo:

```bash
python -m http.server 8080
```

Acesse `http://localhost:8080` para o portal do aluno. Acesse `http://localhost:8080/operador.html` para a tela restrita do operador.

## Escopo da prova

O formulário grava reservas no `localStorage` do navegador para simular o banco de dados do instrutor sem credenciais ou infraestrutura externa. Os procedimentos para substituir esse armazenamento por um backend em nuvem, configurar DNS e publicar o domínio estão em `docs/implantacao.md`.

## Conectar um backend

1. Execute o schema de referência em `database/schema.sql` ou adapte-o ao banco escolhido.
2. Implemente os endpoints descritos em `docs/api.md`.
3. Edite `api-config.js` e preencha `window.MENTE_CORPO_API_URL` com a URL HTTPS da API.
4. Publique novamente os arquivos estáticos. A tela do aluno usará `POST /reservas` e a tela do operador usará `GET /reservas` e `DELETE /reservas`.
