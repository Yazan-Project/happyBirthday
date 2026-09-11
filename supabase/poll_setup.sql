-- Execute este script no SQL Editor do seu painel Supabase

-- 1. Cria a tabela de resultados da enquete
CREATE TABLE poll_results (
  id integer PRIMARY KEY DEFAULT 1,
  hulk integer DEFAULT 0,
  smash integer DEFAULT 0
);

-- 2. Insere a contagem inicial (apenas 1 linha sera usada)
INSERT INTO poll_results (id, hulk, smash) VALUES (1, 0, 0);

-- 3. Habilita seguranca (RLS) para permitir leitura publica segura
ALTER TABLE poll_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Leitura publica" ON poll_results FOR SELECT USING (true);

-- 4. Cria a funcao de incremento atomico (evita conflitos de concorrencia e manipulacao via front-end)
CREATE OR REPLACE FUNCTION vote_poll(vote_type text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result record;
BEGIN
  IF vote_type = 'hulk' THEN
    UPDATE poll_results SET hulk = hulk + 1 WHERE id = 1 RETURNING hulk, smash INTO result;
  ELSIF vote_type = 'smash' THEN
    UPDATE poll_results SET smash = smash + 1 WHERE id = 1 RETURNING hulk, smash INTO result;
  ELSIF vote_type = 'unhulk' THEN
    UPDATE poll_results SET hulk = GREATEST(0, hulk - 1) WHERE id = 1 RETURNING hulk, smash INTO result;
  ELSIF vote_type = 'unsmash' THEN
    UPDATE poll_results SET smash = GREATEST(0, smash - 1) WHERE id = 1 RETURNING hulk, smash INTO result;
  ELSE
    RAISE EXCEPTION 'Voto invalido';
  END IF;
  
  RETURN row_to_json(result);
END;
$$;