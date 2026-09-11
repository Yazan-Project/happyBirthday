-- Setup Completo do Supabase
-- Tabelas
CREATE TABLE IF NOT EXISTS guests (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  max_entries INTEGER DEFAULT 1,
  invite_code TEXT UNIQUE,
  checked_in BOOLEAN DEFAULT FALSE,
  checked_in_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS poll_results (
  id INTEGER PRIMARY KEY DEFAULT 1,
  hulk INTEGER DEFAULT 0,
  smash INTEGER DEFAULT 0
);

INSERT INTO poll_results (id, hulk, smash) VALUES (1, 0, 0) ON CONFLICT (id) DO NOTHING;

-- Segurança (RLS)
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Leitura de guests publica" ON guests FOR SELECT USING (true);

ALTER TABLE poll_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Leitura de poll_results publica" ON poll_results FOR SELECT USING (true);

-- Funções RPC
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
    UPDATE poll_results SET hulk = GREATEST(0, hulk - 1) WHERE id = 1 RETURNING hulk, smash INTO res;
  ELSIF vote_type = 'unsmash' THEN
    UPDATE poll_results SET smash = GREATEST(0, smash - 1) WHERE id = 1 RETURNING hulk, smash INTO res;
  ELSE
    RAISE EXCEPTION 'Voto invalido';
  END IF;
  RETURN row_to_json(res);
END;
$$;

CREATE OR REPLACE FUNCTION generate_invite(guest_phone TEXT)
RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  g record;
  new_code TEXT;
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  i INTEGER;
BEGIN
  SELECT * INTO g FROM guests WHERE phone = guest_phone;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Convidado nao encontrado';
  END IF;

  IF g.invite_code IS NOT NULL THEN
    RETURN row_to_json(g);
  END IF;

  -- Gera código aleatório ex: 6GK-99A
  new_code := '';
  FOR i IN 1..3 LOOP new_code := new_code || substr(chars, floor(random() * length(chars) + 1)::integer, 1); END LOOP;
  new_code := new_code || '-';
  FOR i IN 1..3 LOOP new_code := new_code || substr(chars, floor(random() * length(chars) + 1)::integer, 1); END LOOP;

  UPDATE guests SET invite_code = new_code WHERE phone = guest_phone RETURNING * INTO g;
  RETURN row_to_json(g);
END;
$$;

CREATE OR REPLACE FUNCTION verify_and_checkin(invite TEXT)
RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  g record;
BEGIN
  SELECT * INTO g FROM guests WHERE invite_code = invite;
  IF NOT FOUND THEN
    RETURN json_build_object('valid', false, 'error', 'Codigo invalido');
  END IF;

  IF g.checked_in THEN
    RETURN json_build_object('valid', true, 'already_checked_in', true, 'guest', row_to_json(g));
  END IF;

  UPDATE guests SET checked_in = true, checked_in_at = NOW() WHERE invite_code = invite RETURNING * INTO g;
  RETURN json_build_object('valid', true, 'already_checked_in', false, 'guest', row_to_json(g));
END;
$$;

-- Seed de Convidados (exemplos para o aniversário do Victor Gabriel)
INSERT INTO guests (name, phone, max_entries) VALUES ('Victor Gabriel', '(88) 99999-9999', 4) ON CONFLICT (phone) DO NOTHING;
INSERT INTO guests (name, phone, max_entries) VALUES ('Mãe do Victor', '(88) 98888-8888', 3) ON CONFLICT (phone) DO NOTHING;
INSERT INTO guests (name, phone, max_entries) VALUES ('Pai do Victor', '(88) 97777-7777', 3) ON CONFLICT (phone) DO NOTHING;
INSERT INTO guests (name, phone, max_entries) VALUES ('Vovó Maria', '(88) 96666-6666', 2) ON CONFLICT (phone) DO NOTHING;
INSERT INTO guests (name, phone, max_entries) VALUES ('Vovô João', '(88) 95555-5555', 2) ON CONFLICT (phone) DO NOTHING;
INSERT INTO guests (name, phone, max_entries) VALUES ('Titia Ana', '(88) 94444-4444', 2) ON CONFLICT (phone) DO NOTHING;
INSERT INTO guests (name, phone, max_entries) VALUES ('Tio Carlos', '(88) 93333-3333', 2) ON CONFLICT (phone) DO NOTHING;
INSERT INTO guests (name, phone, max_entries) VALUES ('Primos', '(88) 92222-2222', 4) ON CONFLICT (phone) DO NOTHING;