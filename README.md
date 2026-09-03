# Mente & Corpo

Portal institucional do Estúdio de Yoga Mente & Corpo, com agenda semanal, reserva antecipada de tapetes e painel de acompanhamento do instrutor.

## Executar

Abra `index.html` diretamente no navegador. Para simular hospedagem local, execute um servidor estático na pasta, por exemplo:

```bash
python -m http.server 8080
```

Acesse `http://localhost:8080`.

## Escopo da prova

O formulário grava reservas no `localStorage` do navegador para simular o banco de dados do instrutor sem credenciais ou infraestrutura externa. Os procedimentos para substituir esse armazenamento por um backend em nuvem, configurar DNS e publicar o domínio estão em `docs/implantacao.md`.
