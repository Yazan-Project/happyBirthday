import { FloatingElements } from "../components/FloatingElements";
import { Countdown } from "../components/Countdown";
import styles from "../App.module.css";
import { Calendar, MapPin, Clock, Heart, Cake, Zap, Navigation } from 'lucide-react';

export function Home() {
  return (
    <div className={styles.page}>
      <FloatingElements />

      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={styles.heroBg} />
        <div className={styles.heroContent}>
          <div style={{ position: 'relative' }}>
            <span className={styles.badge}>✦ Você está convidado ✦</span>
            <span className={styles.eyebrow}>Chegou a hora de</span>
            <h1 className={styles.title}>
              <span className={styles.titleAccent}>SMASH</span><br />
              Aniversario
            </h1>
            <p className={styles.subtitle}>Victor Gabriel</p>
          </div>

          <img src="/hulk.png" alt="Hulk" style={{ width: '100%', maxWidth: '320px', margin: '0 auto 2rem', filter: 'drop-shadow(0 10px 25px rgba(34,197,94,0.4))', animation: 'smashIn 1s cubic-bezier(0.34, 1.56, 0.64, 1) 0.5s both', position: 'relative', zIndex: 2 }} />

          <div className={styles.heroMeta}>
            <div className={styles.metaItem}>
              <span className={styles.metaIcon}><Calendar size={18} strokeWidth={2.5} /></span>
              <span className={styles.metaText}>24 de Outubro de 2026</span>
            </div>
            <div className={styles.metaDivider} />
            <div className={styles.metaItem}>
              <span className={styles.metaIcon}><Clock size={18} strokeWidth={2.5} /></span>
              <span className={styles.metaText}>18h00</span>
            </div>
            <div className={styles.metaDivider} />
            <div className={styles.metaItem}>
              <span className={styles.metaIcon}><MapPin size={18} strokeWidth={2.5} /></span>
              <span className={styles.metaText}>Rua Joaquim Cruz 1137A</span>
            </div>
          </div>

          <div className={styles.buttonGroup}>
            <a 
              href="https://share.google/bfPzBqoD9rGAvbVRo" 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.mapLink}
            >
              <Navigation size={16} strokeWidth={2.5} />
              <span>Ver localização no mapa</span>
            </a>

            <button className={styles.generateButton} onClick={() => window.location.href = '/convite'}>
              Gerar meu convite
            </button>
          </div>
        </div>


      </section>

      {/* ── Birthday Kid ── */}
      <section className={styles.couple}>
        <div className={styles.coupleNames}>
          Victor Gabriel
        </div>
      </section>

      {/* ── Divider ── */}
      <div className={styles.divider}>
        <div className={styles.dividerLine} />
        <span className={styles.dividerOrb}><Cake size={24} color="#8B5CF6" /></span>
        <div className={styles.dividerLine} />
      </div>

      {/* ── Countdown ── */}
      <Countdown />

      {/* ── Divider ── */}
      <div className={styles.divider}>
        <div className={styles.dividerLine} />
        <span className={styles.dividerOrb}><Zap size={24} color="#22C55E" /></span>
        <div className={styles.dividerLine} />
      </div>

      {/* ── Details card ── */}
      <div className={styles.detailsWrap}>
        <div className={styles.detailsCard}>
          <div className={styles.detailsGrid}>
            <div className={styles.detailItem}>
              <span className={styles.detailIcon}><Calendar size={22} strokeWidth={2} /></span>
              <span className={styles.detailTitle}>Data</span>
              <span className={styles.detailValue}>24 de Outubro de 2026</span>
              <span className={styles.detailSub}>Sábado</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailIcon}><Clock size={22} strokeWidth={2} /></span>
              <span className={styles.detailTitle}>Horário</span>
              <span className={styles.detailValue}>18h00</span>
              <span className={styles.detailSub}>Chegar pontualmente para o SMASH!</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailIcon}><MapPin size={22} strokeWidth={2} /></span>
              <span className={styles.detailTitle}>Local</span>
              <span className={styles.detailValue}>Rua Joaquim Cruz 1137A</span>
              <span className={styles.detailSub}>Bairro Aeroporto</span>
              <a href="https://share.google/bfPzBqoD9rGAvbVRo" target="_blank" rel="noopener noreferrer" className={styles.mapsButton}>
                Ver no Mapa
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className={styles.footer}>
        <span className={styles.footerScript} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          Venha comemorar com a gente! <Heart size={20} fill="#8B5CF6" stroke="none" />
        </span>
        <p className={styles.footerText}>Victor Gabriel · Outubro 2026</p>
      </footer>
    </div>
  );
}