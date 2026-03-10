import { useEffect, useState } from "react";
import AssignmentsModal from "../components/AssignmentsModal";

type Project = {
  id: number;
  name: string;
};

type Job = {
  id: number;
  label: string;
};

type ResourceRequest = {
  id: number;
  task_type: string;
  due_date: string;
  duration_days: number;
  assignments_count: number;
  project: {
    id: number;
    name: string;
  };
  job: {
    id: number;
    label: string;
  };
};

// Group requests by month (sorted by due_date)
function groupByMonth(requests: ResourceRequest[]): Record<string, ResourceRequest[]> {
  const sorted = [...requests].sort(
    (b, a) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
  );

  return sorted.reduce<Record<string, ResourceRequest[]>>((acc, r) => {
    const date = new Date(r.due_date);
    const key = date.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
    if (!acc[key]) acc[key] = [];
    acc[key].push(r);
    return acc;
  }, {});
}

export default function Requests() {
  const API_URL = "http://127.0.0.1:8000";

  const [projects, setProjects] = useState<Project[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [requests, setRequests] = useState<ResourceRequest[]>([]);

  const [projectId, setProjectId] = useState("");
  const [jobId, setJobId] = useState("");
  const [taskType, setTaskType] = useState("RUN");
  const [dueDate, setDueDate] = useState("");
  const [durationDays, setDurationDays] = useState("");

  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  // Filter states
  const [filterProjectId, setFilterProjectId] = useState("");
  const [filterJobId, setFilterJobId] = useState("");

  const fetchData = async () => {
    const resProjects = await fetch(`${API_URL}/projects/`);
    const resJobs = await fetch(`${API_URL}/jobs/`);
    const resRequests = await fetch(`${API_URL}/requests/`);

    setProjects(await resProjects.json());
    setJobs(await resJobs.json());
    setRequests(await resRequests.json());
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await fetch(`${API_URL}/requests/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        project_id: Number(projectId),
        job_id: Number(jobId),
        task_type: taskType,
        due_date: dueDate,
        duration_days: Number(durationDays),
      }),
    });

    setProjectId("");
    setJobId("");
    setDurationDays("");
    fetchData();
  };

  const handleDelete = async (id: number) => {
    await fetch(`${API_URL}/requests/${id}/`, {
      method: "DELETE",
    });
    fetchData();
  };

  const inputStyle: React.CSSProperties = {
    padding: "12px 14px",
    borderRadius: "8px",
    border: "1px solid #dcdcdc",
    fontSize: "14px",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  };

  const badgeStyle: React.CSSProperties = {
    display: "inline-block",
    padding: "4px 8px",
    borderRadius: "6px",
    background: "#e0f2fe",
    color: "#0369a1",
    fontSize: "12px",
    fontWeight: 600,
  };

  // Apply filters
  const filteredRequests = requests.filter(r => {
    const matchProject = filterProjectId === "" || r.project?.id === Number(filterProjectId);
    const matchJob = filterJobId === "" || r.job?.id === Number(filterJobId);
    return matchProject && matchJob;
  });

  const groupedRequests = groupByMonth(filteredRequests);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f5f7fa, #e4ecf5)",
        padding: "60px 20px",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "900px",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
        }}
      >
        {/* ── Collapsible Form Card ── */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: "16px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
            overflow: "hidden",
          }}
        >
          {/* Toggle header */}
          <button
            onClick={() => setFormOpen(prev => !prev)}
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "22px 32px",
              background: "none",
              border: "none",
              cursor: "pointer",
              borderBottom: formOpen ? "1px solid #eee" : "none",
              transition: "border 0.2s",
            }}
          >
            <h2 style={{ margin: 0, fontWeight: 600, fontSize: "18px" }}>
              ➕ Créer une Resource Request
            </h2>
            <span
              style={{
                fontSize: "20px",
                color: "#94a3b8",
                transform: formOpen ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.25s ease",
                display: "inline-block",
              }}
            >
              ▾
            </span>
          </button>

          {/* Collapsible content */}
          <div
            style={{
              maxHeight: formOpen ? "600px" : "0px",
              overflow: "hidden",
              transition: "max-height 0.35s ease",
            }}
          >
            <form onSubmit={handleSubmit} style={{ padding: "28px 32px" }}>
              <div style={{ display: "grid", gap: "15px" }}>
                <select
                  value={projectId}
                  onChange={e => setProjectId(e.target.value)}
                  required
                  style={inputStyle}
                >
                  <option value="">-- Projet --</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>

                <select
                  value={jobId}
                  onChange={e => setJobId(e.target.value)}
                  required
                  style={inputStyle}
                >
                  <option value="">-- Job --</option>
                  {jobs.map(j => (
                    <option key={j.id} value={j.id}>{j.label}</option>
                  ))}
                </select>

                <select
                  value={taskType}
                  onChange={e => setTaskType(e.target.value)}
                  style={inputStyle}
                >
                  <option value="RUN">RUN</option>
                  <option value="BUILD">BUILD</option>
                  <option value="DISCO">DISCO</option>
                  <option value="ESTIMATION">ESTIMATION</option>
                  <option value="REFACTO">REFACTO</option>
                  <option value="KT">KT</option>
                </select>

                <input
                  type="date"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  required
                  style={inputStyle}
                />

                <input
                  type="number"
                  placeholder="Durée (jours)"
                  value={durationDays}
                  onChange={e => setDurationDays(e.target.value)}
                  required
                  style={inputStyle}
                />

                <button
                  type="submit"
                  style={{
                    padding: "12px",
                    borderRadius: "8px",
                    border: "none",
                    background: "#2563eb",
                    color: "white",
                    fontWeight: 600,
                    cursor: "pointer",
                    fontSize: "15px",
                  }}
                >
                  Créer
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* ── Requests List Card ── */}
        <div
          style={{
            background: "#ffffff",
            padding: "32px",
            borderRadius: "16px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
          }}
        >
          {/* Header + Filters */}
          <div style={{ marginBottom: "24px" }}>
            <h3 style={{ marginTop: 0, marginBottom: "16px", fontWeight: 600 }}>
              Liste des demandes
            </h3>

            {/* Filters row */}
            <div style={{ display: "flex", gap: "12px" }}>
              <select
                value={filterProjectId}
                onChange={e => setFilterProjectId(e.target.value)}
                style={{
                  ...inputStyle,
                  background: filterProjectId ? "#eff6ff" : "#f8fafc",
                  borderColor: filterProjectId ? "#93c5fd" : "#dcdcdc",
                  color: filterProjectId ? "#1d4ed8" : "#64748b",
                  fontWeight: filterProjectId ? 600 : 400,
                  flex: 1,
                }}
              >
                <option value="">Tous les projets</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>

              <select
                value={filterJobId}
                onChange={e => setFilterJobId(e.target.value)}
                style={{
                  ...inputStyle,
                  background: filterJobId ? "#eff6ff" : "#f8fafc",
                  borderColor: filterJobId ? "#93c5fd" : "#dcdcdc",
                  color: filterJobId ? "#1d4ed8" : "#64748b",
                  fontWeight: filterJobId ? 600 : 400,
                  flex: 1,
                }}
              >
                <option value="">Tous les jobs</option>
                {jobs.map(j => (
                  <option key={j.id} value={j.id}>{j.label}</option>
                ))}
              </select>

              {(filterProjectId || filterJobId) && (
                <button
                  onClick={() => { setFilterProjectId(""); setFilterJobId(""); }}
                  style={{
                    padding: "10px 16px",
                    borderRadius: "8px",
                    border: "1px solid #fca5a5",
                    background: "#fff1f2",
                    color: "#b91c1c",
                    fontWeight: 600,
                    fontSize: "13px",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}
                >
                  ✕ Réinitialiser
                </button>
              )}
            </div>
          </div>

          {Object.keys(groupedRequests).length === 0 && (
            <p style={{ color: "#94a3b8", textAlign: "center", padding: "20px 0" }}>
              Aucune demande pour le moment.
            </p>
          )}

          {Object.entries(groupedRequests).map(([month, items]) => (
            <div key={month} style={{ marginBottom: "32px" }}>
              {/* Month title */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "14px",
                }}
              >
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: "13px",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "#2563eb",
                  }}
                >
                  {month}
                </span>
                <div style={{ flex: 1, height: "1px", background: "#e2e8f0" }} />
                <span
                  style={{
                    fontSize: "12px",
                    color: "#94a3b8",
                    fontWeight: 500,
                  }}
                >
                  {items.length} demande{items.length > 1 ? "s" : ""}
                </span>
              </div>

              {/* Requests for this month */}
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
                {items.map(r => (
                  <li
                    key={r.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "18px",
                      background: "#f8fafc",
                      borderRadius: "12px",
                      border: "1px solid #edf2f7",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "15px" }}>
                        {r.project?.name}
                      </div>

                      <div style={{ marginTop: "6px", color: "#475569" }}>
                        {r.job?.label}
                      </div>

                      <div style={{ marginTop: "8px" }}>
                        <span style={badgeStyle}>{r.task_type}</span>
                      </div>

                      <div style={{ marginTop: "8px", fontSize: "13px", color: "#64748b" }}>
                        {r.duration_days} jour{r.duration_days > 1 ? "s" : ""} • Avant le{" "}
                        {new Date(r.due_date).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "10px", flexShrink: 0 }}>
                      <button
                        onClick={() => setSelectedRequestId(r.id)}
                        style={{
                          background: r.assignments_count === 0 ? "#ff6600" : "#0ed439",
                          color: "#ffffff",
                          border: "none",
                          padding: "6px 10px",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontWeight: 600,
                          fontSize: "13px",
                        }}
                      >
                        Assignations ({r.assignments_count})
                      </button>

                      <button
                        onClick={() => handleDelete(r.id)}
                        style={{
                          background: "#fee2e2",
                          border: "none",
                          padding: "6px 10px",
                          borderRadius: "6px",
                          cursor: "pointer",
                          color: "#b91c1c",
                          fontWeight: 600,
                          fontSize: "13px",
                        }}
                      >
                        Supprimer
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {selectedRequestId && (
          <AssignmentsModal
            requestId={selectedRequestId}
            jobId={requests.find(r => r.id === selectedRequestId)?.job.id!}
            onClose={() => setSelectedRequestId(null)}
            onAssignmentsChange={(newCount: number) => {
              setRequests(prev =>
                prev.map(r =>
                  r.id === selectedRequestId
                    ? { ...r, assignments_count: newCount }
                    : r
                )
              );
            }}
          />
        )}
      </div>
    </div>
  );
}
