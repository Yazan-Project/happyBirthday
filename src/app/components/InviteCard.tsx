import { Calendar, MapPin } from "lucide-react";

interface InviteCardProps {
  cardRef: React.RefObject<HTMLDivElement | null>;
  guestName?: string;
}

export function InviteCard({ cardRef, guestName }: InviteCardProps) {
  const displayName = guestName || "Convidado Especial";

  return (
    <div
      ref={cardRef}
      style={{
        width: "100%",
        maxWidth: "420px",
        background: "linear-gradient(135deg, #F3E8FF 0%, #DCFCE7 100%)",
        borderRadius: "20px",
        padding: "10px",
        boxShadow: "0 20px 40px rgba(139, 92, 246, 0.15)",
        fontFamily: "'Lato', sans-serif",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{
        border: "2px solid #8B5CF6",
        borderRadius: "16px",
        padding: "2rem 1.5rem",
        background: "white",
        height: "100%",
        boxSizing: "border-box"
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
          <img src="/hulk-logo-png_seeklogo-344713.png" alt="Hulk Logo" style={{ height: '55px', filter: 'drop-shadow(0 2px 4px rgba(34,197,94,0.2))' }} />
        </div>
        <h2 style={{ fontFamily: "'Hulkbusters', 'Playfair Display', serif", fontSize: "1.6rem", color: "#5B21B6", margin: "0 0 0.5rem 0", letterSpacing: "1px", textTransform: "uppercase" }}>
          ANIVERSARIO HULK
        </h2>
        <h3 style={{ fontFamily: "'Hulkbusters', 'Dancing Script', cursive", fontSize: "2.2rem", color: "#166534", margin: "0 0 2rem 0", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Victor Gabriel
        </h3>

        {/* Guest Name */}
        <div style={{ padding: "0.5rem 0", borderTop: "1px dashed #8B5CF6", borderBottom: "1px dashed #8B5CF6", marginBottom: "2rem" }}>
          <p style={{ fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "2px", color: "#7C3AED", margin: "0 0 0.25rem 0" }}>
            Convidado(a) Especial
          </p>
          <p style={{ fontSize: "1.4rem", fontWeight: 700, color: "#5B21B6", margin: 0, fontFamily: "'Hulkbusters', 'Playfair Display', serif", textTransform: "uppercase" }}>
            {displayName}
          </p>
        </div>

        {/* Details Grid */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem", textAlign: "left", background: "#f8fafc", padding: "1.5rem", borderRadius: "12px", fontSize: "0.95rem", color: "#5B21B6", border: "1px solid #EDE9FE" }}>
          <p style={{ margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
            <Calendar size={18} color="#8B5CF6" /> <strong>Data:</strong> 24 de Outubro de 2026 às 18h
          </p>
          <p style={{ margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
            <MapPin size={18} color="#8B5CF6" /> <strong>Local:</strong> Rua Joaquim Cruz 1137A, Bairro Aeroporto
          </p>
        </div>

      </div>
    </div>
  );
}