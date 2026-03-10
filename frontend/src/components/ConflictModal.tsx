import { useState } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

export type Assignment = {
  id: number;
  resource_id: number;
  resource_request_id: number;
  assigned_start_date: string;
  assigned_end_date: string;
  detect_conflict: boolean;
  created_at: string;
};

export type ConflictDetail = {
  olderAssignment: Assignment;
  newerAssignment: Assignment;
  olderProject: string;
  newerProject: string;
};

export type ConflictEntry = {
  resource: {
    id: number;
    firstname: string;
    lastname: string;
  };
  conflicts: ConflictDetail[];
};

interface ConflictModalProps {
  isOpen: boolean;
  onClose: () => void;
  conflictEntries: ConflictEntry[];
  onConflictResolved: () => Promise<void>;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

const getOverlapDays = (a: Assignment, b: Assignment): number => {
  const start = Math.max(
    new Date(a.assigned_start_date).getTime(),
    new Date(b.assigned_start_date).getTime()
  );
  const end = Math.min(
    new Date(a.assigned_end_date).getTime(),
    new Date(b.assigned_end_date).getTime()
  );
  return Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function ConflictModal({
  isOpen,
  onClose,
  conflictEntries,
  onConflictResolved,
}: ConflictModalProps) {
  const [resolvingId, setResolvingId] = useState<number | null>(null);

  const API_URL = "http://127.0.0.1:8000";

  const handleResolveConflict = async (assignmentId: number) => {
    setResolvingId(assignmentId);
    try {
      await fetch(`${API_URL}/assignments/${assignmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ detect_conflict: false }),
      });
      await onConflictResolved();
    } catch (err) {
      console.error("Erreur lors de la résolution du conflit", err);
    } finally {
      setResolvingId(null);
    }
  };

  if (!isOpen) return null;

  const totalConflicts = conflictEntries.reduce(
    (sum, e) => sum + e.conflicts.length,
    0
  );

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        backdropFilter: "blur(2px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "20px",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: "16px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
          width: "100%",
          maxWidth: "680px",
          maxHeight: "80vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* ── Header ── */}
        <div
          style={{
            padding: "24px 28px 20px",
            borderBottom: "1px solid #f1f5f9",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexShrink: 0,
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span
                style={{
                  background: "#fef3c7",
                  border: "1.5px solid #f59e0b",
                  borderRadius: "8px",
                  padding: "4px 8px",
                  fontSize: "18px",
                }}
              >
                ⚠️
              </span>
              <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#1e293b" }}>
                Conflits d'assignement
              </h2>
            </div>
            <p style={{ margin: "6px 0 0", fontSize: "13px", color: "#94a3b8" }}>
              {totalConflicts} conflit{totalConflicts > 1 ? "s" : ""} détecté
              {totalConflicts > 1 ? "s" : ""} sur {conflictEntries.length} ressource
              {conflictEntries.length > 1 ? "s" : ""}
            </p>
          </div>

          <button
            onClick={onClose}
            style={{
              background: "#f1f5f9",
              border: "none",
              borderRadius: "8px",
              width: "32px",
              height: "32px",
              fontSize: "16px",
              cursor: "pointer",
              color: "#64748b",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            ✕
          </button>
        </div>

        {/* ── Body ── */}
        <div
          style={{
            overflowY: "auto",
            padding: "20px 28px 28px",
            display: "flex",
            flexDirection: "column",
            gap: "24px",
          }}
        >
          {conflictEntries.length === 0 ? (
            <p style={{ color: "#94a3b8", textAlign: "center", padding: "40px 0" }}>
              Aucun conflit détecté.
            </p>
          ) : (
            conflictEntries.map((entry) => (
              <div key={entry.resource.id}>

                {/* ── Resource header ── */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #f59e0b, #ef4444)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontWeight: 700,
                      fontSize: "13px",
                      flexShrink: 0,
                    }}
                  >
                    {entry.resource.firstname[0]}{entry.resource.lastname[0]}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "15px", color: "#1e293b" }}>
                      {entry.resource.lastname} {entry.resource.firstname}
                    </div>
                    <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                      {entry.conflicts.length} conflit{entry.conflicts.length > 1 ? "s" : ""}
                    </div>
                  </div>
                </div>

                {/* ── Conflict cards ── */}
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {entry.conflicts.map((conflict, idx) => {
                    const days = getOverlapDays(conflict.olderAssignment, conflict.newerAssignment);
                    const isResolving = resolvingId === conflict.newerAssignment.id;

                    return (
                      <div
                        key={idx}
                        style={{
                          background: "#fffbeb",
                          border: "1px solid #fcd34d",
                          borderRadius: "10px",
                          padding: "14px 16px",
                        }}
                      >
                        {/* Projets */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            flexWrap: "wrap",
                            marginBottom: "10px",
                          }}
                        >
                          <span style={badgeStyle("#fef9c3", "#fde68a", "#92400e")}>
                            {conflict.newerProject}
                          </span>
                          <span style={{ fontSize: "12px", color: "#78350f" }}>créé après</span>
                          <span style={badgeStyle("#fff7ed", "#fed7aa", "#9a3412")}>
                            {conflict.olderProject}
                          </span>
                          <span style={{ fontSize: "12px", color: "#78350f" }}>entre en conflit</span>
                        </div>

                        {/* Dates */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                          <DateRow
                            color="#f59e0b"
                            label={conflict.newerProject}
                            start={conflict.newerAssignment.assigned_start_date}
                            end={conflict.newerAssignment.assigned_end_date}
                          />
                          <DateRow
                            color="#94a3b8"
                            label={conflict.olderProject}
                            start={conflict.olderAssignment.assigned_start_date}
                            end={conflict.olderAssignment.assigned_end_date}
                          />
                        </div>

                        {/* Footer : overlap + bouton */}
                        <div
                          style={{
                            marginTop: "10px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            flexWrap: "wrap",
                            gap: "8px",
                          }}
                        >
                          <span
                            style={{
                              background: "#fef2f2",
                              border: "1px solid #fecaca",
                              borderRadius: "20px",
                              padding: "3px 10px",
                              fontSize: "12px",
                              fontWeight: 600,
                              color: "#dc2626",
                            }}
                          >
                            {days} jour{days > 1 ? "s" : ""} de chevauchement
                          </span>

                          <button
                            disabled={isResolving}
                            onClick={() => handleResolveConflict(conflict.newerAssignment.id)}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                              padding: "4px 12px",
                              borderRadius: "20px",
                              border: "1px solid #bbf7d0",
                              background: isResolving ? "#f0fdf4" : "#dcfce7",
                              color: "#15803d",
                              fontSize: "12px",
                              fontWeight: 600,
                              cursor: isResolving ? "not-allowed" : "pointer",
                              transition: "all 0.2s ease",
                              opacity: isResolving ? 0.6 : 1,
                            }}
                          >
                            {isResolving ? (
                              "Résolution..."
                            ) : (
                              <>
                                <svg viewBox="0 0 16 16" fill="none" width="12" height="12">
                                  <path
                                    d="M2 8l4 4 8-8"
                                    stroke="#15803d"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                                Lever le conflit
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function DateRow({ color, label, start, end }: { color: string; label: string; start: string; end: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#64748b" }}>
      <span
        style={{
          width: "8px",
          height: "8px",
          borderRadius: "50%",
          background: color,
          flexShrink: 0,
          display: "inline-block",
        }}
      />
      <span>
        <b>{label} :</b> {formatDate(start)} → {formatDate(end)}
      </span>
    </div>
  );
}

function badgeStyle(bg: string, border: string, color: string): React.CSSProperties {
  return {
    background: bg,
    border: `1px solid ${border}`,
    borderRadius: "6px",
    padding: "3px 8px",
    fontSize: "13px",
    fontWeight: 600,
    color,
  };
}