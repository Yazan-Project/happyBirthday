const fs = require('fs');

const csv = fs.readFileSync('D:/proj/InteractiveInvite/Dados Planilha/Chá de bebe Darcy.csv', 'utf8');
const lines = csv.split('\n').map(l => l.trim()).filter(l => l);

const guests = [];
for (let i = 1; i < lines.length; i++) {
  const line = lines[i];
  if (!line || line.startsWith(',')) continue;
  
  // Custom split handling commas inside strings if any, though here it looks simple
  const parts = line.split(',');
  const name = parts[0]?.trim();
  const phone = parts[1]?.trim();
  const max_entries = parseInt(parts[2], 10) || 1;
  const diaper = parts[3]?.trim() || '';
  const gift = parts[6]?.trim() || '';

  if (name && phone) {
    guests.push({ name, phone, max_entries, diaper, gift });
  }
}

let sql = `-- Setup Completo do Supabase
-- Tabelas
CREATE TABLE IF NOT EXISTS guests (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  max_entries INTEGER DEFAULT 1,
  diaper_size TEXT,
  gift TEXT,
  invite_code TEXT UNIQUE,
  checked_in BOOLEAN DEFAULT FALSE,
  checked_in_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS poll_results (
  id INTEGER PRIMARY KEY DEFAULT 1,
  boy INTEGER DEFAULT 0,
  girl INTEGER DEFAULT 0
);

INSERT INTO poll_results (id, boy, girl) VALUES (1, 0, 0) ON CONFLICT (id) DO NOTHING;

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
  IF vote_type = 'boy' THEN
    UPDATE poll_results SET boy = boy + 1 WHERE id = 1 RETURNING boy, girl INTO res;
  ELSIF vote_type = 'girl' THEN
    UPDATE poll_results SET girl = girl + 1 WHERE id = 1 RETURNING boy, girl INTO res;
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

-- Seed de Convidados
`;

guests.forEach(g => {
  sql += `INSERT INTO guests (name, phone, max_entries, diaper_size, gift) VALUES ('${g.name.replace(/'/g, "''")}', '${g.phone}', ${g.max_entries}, '${g.diaper}', '${g.gift.replace(/'/g, "''")}') ON CONFLICT (phone) DO NOTHING;\n`;
});

fs.writeFileSync('D:/proj/InteractiveInvite/supabase/setup.sql', sql);
console.log('setup.sql gerado com sucesso!');
