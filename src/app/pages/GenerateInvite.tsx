import { useState, useRef } from "react";
import { useNavigate } from "react-router";
import styles from "./GenerateInvite.module.css";
import { InviteCard } from "../components/InviteCard";
import { toPng } from "html-to-image";
import confetti from "canvas-confetti";

export function GenerateInvite() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [guestName, setGuestName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const cardRef = useRef<HTMLDivElement>(null);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim()) {
      setError("Digite seu nome para gerar o convite.");
      return;
    }

    setLoading(true);
    try {
      setGuestName(name.trim());
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ["#8B5CF6", "#22C55E", "#5B21B6"] });
    } catch (err: any) {
      console.error(err);
      setError("Erro ao gerar convite.");
    } finally {
      setLoading(false);
    }
  }

  const [isDownloading, setIsDownloading] = useState(false);

  async function downloadCard() {
    if (!cardRef.current) return;
    setIsDownloading(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        cacheBust: true
      });
      const link = document.createElement('a');
      link.download = `convite-${guestName.replace(/ /g, '-')}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Erro ao gerar imagem", err);
      alert("Não foi possível gerar a imagem. Verifique o console.");
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <div className={styles.container}>
      <button className={styles.backButton} onClick={() => navigate("/")}>
        ← Voltar
      </button>

      {!guestName ? (
        <div className={styles.card}>
          <h2 className={styles.title}>Gerar Convite</h2>
          <p className={styles.subtitle}>Digite seu nome para criar seu convite personalizado.</p>

          <form onSubmit={handleGenerate}>
            <input
              className={styles.input}
              placeholder="Seu nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
            {error && <p style={{ color: '#ef4444', fontSize: '0.9rem', marginTop: '0.5rem' }}>{error}</p>}
            <button type="submit" className={styles.button} style={{ marginTop: '1.5rem', width: '100%' }} disabled={loading}>
              {loading ? "Gerando..." : "Gerar Convite"}
            </button>
          </form>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', width: '100%' }}>
          <InviteCard guestName={guestName} cardRef={cardRef} />

          <button className={styles.button} onClick={downloadCard} style={{ width: '100%', maxWidth: '400px' }} disabled={isDownloading}>
            {isDownloading ? "Gerando Imagem..." : "⬇ Baixar Convite"}
          </button>
        </div>
      )}
    </div>
  );
}