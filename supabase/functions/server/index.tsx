import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";

const app = new Hono();

app.use('*', logger(console.log));
app.use('*', cors());

const PRE_REGISTERED_GUESTS = [
  "João Silva",
  "Maria Oliveira",
  "Ana Carolina",
  "Carlos Eduardo",
  "Tia Rosa",
  "Avó Lourdes",
  "Rafael (Pai)",
  "Mariana (Mãe)"
];

// Initialize guests if they don't exist
app.get('/make-server-100bda85/init', async (c) => {
  try {
    for (const name of PRE_REGISTERED_GUESTS) {
       const key = `guest:${name.toLowerCase().trim()}`;
       const existing = await kv.get(key);
       if (!existing) {
         await kv.set(key, { name, code: null });
       }
    }
    return c.json({ success: true, message: "Guests initialized" });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// Search for guest
app.get('/make-server-100bda85/guest/search', async (c) => {
  try {
    const query = c.req.query('q')?.toLowerCase().trim();
    if (!query) return c.json({ results: [] });
    
    const allGuests = await kv.getByPrefix('guest:');
    const results = allGuests.filter(g => g.name.toLowerCase().includes(query));
    
    return c.json({ results });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// Generate invite code
app.post('/make-server-100bda85/guest/generate', async (c) => {
  try {
    const body = await c.req.json();
    const name = body.name;
    const key = `guest:${name.toLowerCase().trim()}`;
    const guest = await kv.get(key);
    
    if (!guest) {
      return c.json({ error: "Convidado não encontrado." }, 404);
    }
    
    if (guest.code) {
      return c.json({ guest });
    }
    
    // Generate random code like 6GK-99A
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 3; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
    code += '-';
    for (let i = 0; i < 3; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
    
    guest.code = code;
    await kv.set(key, guest);
    await kv.set(`code:${code}`, { name, valid: true }); // store reverse lookup for verification
    
    return c.json({ guest });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// Verify code
app.post('/make-server-100bda85/verify', async (c) => {
  try {
    const body = await c.req.json();
    const code = body.code;
    if (!code) return c.json({ valid: false, error: "Código não fornecido." }, 400);
    
    const invite = await kv.get(`code:${code}`);
    if (!invite) {
      return c.json({ valid: false, error: "Código inválido ou não encontrado." });
    }
    
    return c.json({ valid: true, guestName: invite.name });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// Get poll results
app.get('/make-server-100bda85/poll', async (c) => {
  try {
    let poll = await kv.get('poll_results');
    if (!poll) poll = { boy: 0, girl: 0 };
    return c.json(poll);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// Vote
app.post('/make-server-100bda85/poll/vote', async (c) => {
  try {
    const body = await c.req.json();
    const { vote } = body;
    if (vote !== 'boy' && vote !== 'girl') {
      return c.json({ error: "Voto inválido" }, 400);
    }
    
    let poll = await kv.get('poll_results');
    if (!poll) poll = { boy: 0, girl: 0 };
    
    poll[vote]++;
    await kv.set('poll_results', poll);
    
    return c.json(poll);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

Deno.serve(app.fetch);
