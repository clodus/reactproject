import { useEffect, useState } from "react";

type Resource = {
  id: number;
  firstname: string;
  lastname: string;
};

type AbsenceAssignment = {
  id: number;
  assigned_start_date: string;
  assigned_end_date: string;
  resource_request_id: number;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  resource: Resource | null;
};

const API_URL = "http://127.0.0.1:8000";

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
};

export default function AbsenceModal({ isOpen, onClose, resource }: Props) {
  const [absences, setAbsences] = useState<AbsenceAssignment[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [absenceRequestId, setAbsenceRequestId] = useState<number | null>(null);

  // Fetch the ABSENCE resource_request id
  const fetchAbsenceRequest = async () => {
    try {
      const res = await fetch(`${API_URL}/requests/`);
      const data = await res.json();
      const absenceReq = data.find(
        (r: { id: number; task_type?: string }) => r.task_type === "ABSENCE"
      );
      if (!absenceReq) {
        setAbsenceRequestId(null);
        setError("Aucune demande de type ABSENCE trouvée dans la base de données.");
      } else {
        setAbsenceRequestId(absenceReq.id);
        setError(null);
      }
    } catch {
      setError("Erreur lors de la récupération des demandes.");
    }
  };

  // Fetch absences for the selected resource
  const fetchAbsences = async () => {
    if (!resource || absenceRequestId === null) return;
    try {
      const res = await fetch(`${API_URL}/assignments/?resource_id=${resource.id}`);
      const data: AbsenceAssignment[] = await res.json();
      const filtered = data.filter(
        (a) => a.resource_request_id === absenceRequestId
      );
      setAbsences(filtered);
    } catch {
      setError("Erreur lors du chargement des absences.");
    }
  };

  useEffect(() => {
    if (isOpen && resource) {
      setError(null);
      setSuccess(null);
      setStartDate("");
      setEndDate("");
      fetchAbsenceRequest();
    }
  }, [isOpen, resource]);

  useEffect(() => {
    if (absenceRequestId !== null) {
      fetchAbsences();
    }
  }, [absenceRequestId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resource || absenceRequestId === null) return;
    if (startDate > endDate) {
      setError("La date de début doit être antérieure à la date de fin.");
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`${API_URL}/assignments/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resource_id: resource.id,
          resource_request_id: absenceRequestId,
          assigned_start_date: startDate,
          assigned_end_date: endDate,
        }),
      });
      if (!res.ok) throw new Error();
      setSuccess("Absence enregistrée avec succès.");
      setStartDate("");
      setEndDate("");
      fetchAbsences();
    } catch {
      setError("Erreur lors de l'enregistrement de l'absence.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await fetch(`${API_URL}/assignments/${id}`, { method: "DELETE" });
      setAbsences((prev) => prev.filter((a) => a.id !== id));
    } catch {
      setError("Erreur lors de la suppression de l'absence.");
    }
  };

  if (!isOpen || !resource) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "16px",
          padding: "36px",
          width: "100%",
          maxWidth: "540px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
          <div>
            <h2 style={{ margin: 0, fontWeight: 700, fontSize: "18px" }}>
              Absences
            </h2>
            <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: "14px" }}>
              {resource.lastname} {resource.firstname}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "20px",
              cursor: "pointer",
              color: "#94a3b8",
              lineHeight: 1,
              padding: "4px",
            }}
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
            <div>
              <label style={labelStyle}>Date de début</label>
              <input
                type="date"
                value={startDate}
                required
                onChange={(e) => setStartDate(e.target.value)}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Date de fin</label>
              <input
                type="date"
                value={endDate}
                required
                onChange={(e) => setEndDate(e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || absenceRequestId === null}
            style={{
              width: "100%",
              padding: "11px",
              borderRadius: "8px",
              border: "none",
              background: loading || absenceRequestId === null ? "#94a3b8" : "#2563eb",
              color: "white",
              fontWeight: 600,
              fontSize: "14px",
              cursor: loading || absenceRequestId === null ? "not-allowed" : "pointer",
              transition: "background 0.2s",
            }}
          >
            {loading ? "Enregistrement..." : "Poser l'absence"}
          </button>
        </form>

        {/* Feedback */}
        {error && (
          <div style={{ marginTop: "12px", padding: "10px 14px", background: "#fee2e2", color: "#b91c1c", borderRadius: "8px", fontSize: "13px" }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{ marginTop: "12px", padding: "10px 14px", background: "#dcfce7", color: "#166534", borderRadius: "8px", fontSize: "13px" }}>
            {success}
          </div>
        )}

        {/* Absences list */}
        <div style={{ marginTop: "28px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#374151", marginBottom: "12px" }}>
            Absences enregistrées ({absences.length})
          </h3>

          {absences.length === 0 ? (
            <div style={{ textAlign: "center", padding: "24px", background: "#f8fafc", borderRadius: "10px", color: "#94a3b8", fontSize: "13px" }}>
              Aucune absence enregistrée.
            </div>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {absences.map((absence) => (
                <li
                  key={absence.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px 14px",
                    marginBottom: "8px",
                    background: "#f8fafc",
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "16px" }}>🗓️</span>
                    <span style={{ fontSize: "13px", color: "#374151" }}>
                      Du <strong>{formatDate(absence.assigned_start_date)}</strong> au <strong>{formatDate(absence.assigned_end_date)}</strong>
                    </span>
                  </div>
                  <button
                    onClick={() => handleDelete(absence.id)}
                    style={{
                      background: "#fee2e2",
                      border: "none",
                      padding: "5px 10px",
                      borderRadius: "6px",
                      cursor: "pointer",
                      color: "#b91c1c",
                      fontWeight: 600,
                      fontSize: "12px",
                    }}
                  >
                    Supprimer
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "12px",
  fontWeight: 600,
  color: "#64748b",
  marginBottom: "6px",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: "8px",
  border: "1px solid #dcdcdc",
  fontSize: "14px",
  outline: "none",
  boxSizing: "border-box",
};
