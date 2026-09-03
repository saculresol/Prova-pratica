-- Schema de referência para PostgreSQL.
-- Em produção, a regra de capacidade deve ser transacional no endpoint POST /reservas.
CREATE TABLE aulas (
  id VARCHAR(32) PRIMARY KEY,
  dia VARCHAR(3) NOT NULL,
  data_aula DATE NOT NULL,
  horario TIME NOT NULL,
  nome VARCHAR(120) NOT NULL,
  instrutor VARCHAR(120) NOT NULL,
  capacidade SMALLINT NOT NULL DEFAULT 8 CHECK (capacidade > 0)
);

CREATE TABLE reservas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_praticante VARCHAR(160) NOT NULL CHECK (char_length(trim(nome_praticante)) >= 3),
  aula_id VARCHAR(32) NOT NULL REFERENCES aulas(id),
  status VARCHAR(20) NOT NULL DEFAULT 'confirmada' CHECK (status IN ('confirmada', 'cancelada')),
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX reservas_aula_id_idx ON reservas (aula_id);
CREATE INDEX reservas_criado_em_idx ON reservas (criado_em DESC);

-- Evita duplicar o mesmo aluno na mesma aula enquanto a reserva estiver ativa.
CREATE UNIQUE INDEX reservas_praticante_aula_ativa_idx
  ON reservas (lower(nome_praticante), aula_id)
  WHERE status = 'confirmada';
