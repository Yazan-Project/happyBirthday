-- Atualiza a função vote_poll para suportar troca de votos (unhulk / unsmash)
CREATE OR REPLACE FUNCTION vote_poll(vote_type TEXT)
RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  res record;
BEGIN
  IF vote_type = 'hulk' THEN
    UPDATE poll_results SET hulk = hulk + 1 WHERE id = 1 RETURNING hulk, smash INTO res;
  ELSIF vote_type = 'smash' THEN
    UPDATE poll_results SET smash = smash + 1 WHERE id = 1 RETURNING hulk, smash INTO res;
  ELSIF vote_type = 'unhulk' THEN
    UPDATE poll_results SET hulk = GREATEST(hulk - 1, 0) WHERE id = 1 RETURNING hulk, smash INTO res;
  ELSIF vote_type = 'unsmash' THEN
    UPDATE poll_results SET smash = GREATEST(smash - 1, 0) WHERE id = 1 RETURNING hulk, smash INTO res;
  ELSE
    RAISE EXCEPTION 'Voto invalido';
  END IF;
  RETURN row_to_json(res);
END;
$$;