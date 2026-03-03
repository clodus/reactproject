import { useEffect, useState } from "react";

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
  project: {
    id: number;
    name: string;
  };
  job: {
    id: number;
    label: string;
  };
};

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

    fetchData(); // refresh la liste
  };

  const inputStyle = {
    padding: "12px 14px",
    borderRadius: "8px",
    border: "1px solid #dcdcdc",
    fontSize: "14px",
    outline: "none",
  };

  const badgeStyle = {
    display: "inline-block",
    padding: "4px 8px",
    borderRadius: "6px",
    background: "#e0f2fe",
    color: "#0369a1",
    fontSize: "12px",
    fontWeight: 600,
  };

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
          background: "#ffffff",
          padding: "40px",
          borderRadius: "16px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
        }}
      >
        <h2 style={{ marginBottom: "25px", fontWeight: 600 }}>
          Créer une Resource Request
        </h2>

        <form onSubmit={handleSubmit} style={{ marginBottom: "30px" }}>
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
              }}
            >
              Créer
            </button>
          </div>
        </form>

        <hr style={{ margin: "35px 0", border: "none", borderTop: "1px solid #eee" }} />

        <h3 style={{ marginBottom: "15px" }}>Liste des demandes</h3>

        <ul style={{ listStyle: "none", padding: 0 }}>
          {requests.map(r => (
            <li
              key={r.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "18px",
                marginBottom: "15px",
                background: "#f8fafc",
                borderRadius: "12px",
                border: "1px solid #edf2f7",
                transition: "all 0.2s ease",
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
                  <span style={badgeStyle}>
                    {r.task_type}
                  </span>
                </div>

                <div style={{ marginTop: "8px", fontSize: "13px", color: "#64748b" }}>
                  {r.duration_days} jours • Avant le {r.due_date}
                </div>
              </div>

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
                }}
              >
                Supprimer
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}