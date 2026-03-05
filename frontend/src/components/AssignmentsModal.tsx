import { useEffect, useState } from "react";

type Props = {
  requestId: number;
  jobId: number;
  onClose: () => void;
  onAssignmentsChange: (count: number) => void;
};

export default function AssignmentsModal({ requestId, jobId, onClose, onAssignmentsChange }: Props) {
  const API_URL = "http://127.0.0.1:8000";
  const [resources, setResources] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);

  const [selectedResourceId, setSelectedResourceId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/assignments/?resource_request_id=${requestId}`)
      .then(res => res.json())
      .then(data => setAssignments(data));
  }, [requestId]);

  useEffect(() => {
    fetch(`${API_URL}/resources/?job_id=${jobId}`)
      .then(res => res.json())
      .then(data => setResources(data));
  }, [jobId]);

  const deleteAssignment = async (id: number) => {
    if (!window.confirm("Supprimer cette assignation ?")) return;
    await fetch(`http://127.0.0.1:8000/assignments/${id}`, {
      method: "DELETE",
    });

    const updated = assignments.filter(a => a.id !== id);
    setAssignments(updated);

    onAssignmentsChange(updated.length); // 👈 update parent
  };

  const createAssignment = async (e: React.FormEvent) => {
    e.preventDefault();

    const response = await fetch(`${API_URL}/assignments/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        resource_id: Number(selectedResourceId),
        resource_request_id: requestId,
        assigned_start_date: startDate,
        assigned_end_date: endDate,
      }),
    });

    const newAssignment = await response.json();

    const updated = [...assignments, newAssignment];
    setAssignments(updated);

    onAssignmentsChange?.(updated.length);

    setSelectedResourceId("");
    setStartDate("");
    setEndDate("");
  };

  

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 999,
        backdropFilter: "blur(4px)",
        animation: "fadeIn 0.25s ease",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 500,
          background: "#ffffff",
          borderRadius: 16,
          boxShadow: "0 12px 28px rgba(0,0,0,0.15)",
          padding: 30,
          display: "flex",
          flexDirection: "column",
          gap: 20,
          animation: "slideUp 0.3s ease",
          maxHeight: "80vh",
          overflow: "hidden",
        }}
      >
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: "#111827" }}>
          Ajouter une assignation
        </h2>

        <form onSubmit={createAssignment} style={{ display: "grid", gap: 12 }}>
          <select
            value={selectedResourceId}
            onChange={e => setSelectedResourceId(e.target.value)}
            required
            style={{
              padding: "10px 12px",
              borderRadius: 8,
              border: "1px solid #d1d5db",
              outline: "none",
              fontSize: 14,
              color: "#111827",
              transition: "border 0.2s",
            }}
          >
            <option value="">-- Ressource --</option>
            {resources.map(r => (
              <option key={r.id} value={r.id}>
                {r.firstname} {r.lastname}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            required
            style={{
              padding: "10px 12px",
              borderRadius: 8,
              border: "1px solid #d1d5db",
              outline: "none",
              fontSize: 14,
            }}
          />

          <input
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            required
            style={{
              padding: "10px 12px",
              borderRadius: 8,
              border: "1px solid #d1d5db",
              outline: "none",
              fontSize: 14,
            }}
          />

          <button
            type="submit"
            style={{
              padding: "10px 0",
              borderRadius: 8,
              border: "none",
              background: "#2563eb",
              color: "white",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: 14,
              transition: "background 0.2s",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "#1d4ed8")}
            onMouseLeave={e => (e.currentTarget.style.background = "#2563eb")}
          >
            Ajouter
          </button>
        </form>

        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 500, color: "#374151" }}>
          Ressources assignées
        </h3>

        <div
          style={{
            maxHeight: "250px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 10,
            paddingRight: 5,
          }}
        >
          {assignments.length === 0 ? (
            <p style={{ color: "#6b7280", fontSize: 14 }}>Aucune ressource assignée.</p>
          ) : (
            assignments.map(a => (
              <div
                key={a.id}
                style={{
                  padding: "10px 12px",
                  borderRadius: 10,
                  background: "#f3f4f6",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: 14,
                  color: "#111827",
                }}
              >
                <div>
                  <strong>{a.resource.firstname} {a.resource.lastname}</strong>
                  <div style={{ fontSize: 12, color: "#6b7280" }}>
                    du {a.assigned_start_date} au {a.assigned_end_date}
                  </div>
                </div>

                <button
                  onClick={() => deleteAssignment(a.id)}
                  style={{
                    background: "#fee2e2",
                    border: "none",
                    borderRadius: 6,
                    padding: "6px 8px",
                    cursor: "pointer",
                    color: "#b91c1c",
                    fontWeight: 600,
                    fontSize: 12,
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#fca5a5")}
                  onMouseLeave={e => (e.currentTarget.style.background = "#fee2e2")}
                >
                  ❌
                </button>
              </div>
            ))
          )}
        </div>

        <button
          onClick={onClose}
          style={{
            marginTop: 10,
            padding: "10px 0",
            borderRadius: 8,
            border: "none",
            background: "#6b7280",
            color: "white",
            fontWeight: 600,
            cursor: "pointer",
            fontSize: 14,
            transition: "background 0.2s",
          }}
          onMouseEnter={e => (e.currentTarget.style.background = "#4b5563")}
          onMouseLeave={e => (e.currentTarget.style.background = "#6b7280")}
        >
          Fermer
        </button>
      </div>
    </div>
  );
}