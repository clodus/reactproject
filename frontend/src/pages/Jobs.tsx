import { useEffect, useState } from "react";

type Job = {
  id: number;
  label: string;
  description: string;
};

export default function Jobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [label, setLabel] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const API_URL = "http://127.0.0.1:8000";

  // Recupere tous les jobs
  const fetchJobs = async () => {
    try {
      const res = await fetch(`${API_URL}/jobs/`);
      const data = await res.json();
      setJobs(data);
    } catch (err) {
      setError("Impossible de charger les jobs");
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // Creation utilisateur
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`${API_URL}/jobs/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ label, description }),
      });

      if (!res.ok) {
        throw new Error("Erreur lors de la création");
      }

      setSuccess("Job créé avec succès");
      setLabel("");
      setDescription("");
      fetchJobs();
    } catch (err) {
      setError("Erreur lors de la création du job");
    } finally {
      setLoading(false);
    }
  };

  // Supprimer job
  const handleDelete = async (id: number) => {
    try {
      await fetch(`${API_URL}/jobs/${id}`, {
        method: "DELETE",
      });

      fetchJobs(); // refresh
    } catch (err) {
      setError("Erreur lors de la suppression");
    }
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
          maxWidth: "800px",
          background: "#ffffff",
          padding: "40px",
          borderRadius: "16px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
        }}
      >
        <h2 style={{ marginBottom: "25px", fontWeight: 600 }}>
          Créer un job
        </h2>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Label"
            value={label}
            required
            onChange={(e) => setLabel(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 14px",
              marginBottom: "15px",
              borderRadius: "8px",
              border: "1px solid #dcdcdc",
              fontSize: "14px",
              outline: "none",
              transition: "border 0.2s ease",
            }}
          />

          <input
            type="text"
            placeholder="Description"
            value={description}
            required
            onChange={(e) => setDescription(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 14px",
              marginBottom: "20px",
              borderRadius: "8px",
              border: "1px solid #dcdcdc",
              fontSize: "14px",
              outline: "none",
            }}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              border: "none",
              background: loading ? "#94a3b8" : "#2563eb",
              color: "white",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            {loading ? "Création..." : "Créer"}
          </button>
        </form>

        {error && (
          <div
            style={{
              marginTop: "15px",
              padding: "10px",
              background: "#fee2e2",
              color: "#b91c1c",
              borderRadius: "8px",
            }}
          >
            {error}
          </div>
        )}

        {success && (
          <div
            style={{
              marginTop: "15px",
              padding: "10px",
              background: "#dcfce7",
              color: "#166534",
              borderRadius: "8px",
            }}
          >
            {success}
          </div>
        )}

        <hr style={{ margin: "35px 0", border: "none", borderTop: "1px solid #eee" }} />

        <h3 style={{ marginBottom: "15px" }}>Liste des jobs</h3>

        <ul style={{ listStyle: "none", padding: 0 }}>
          {jobs.map((job) => (
            <li
              key={job.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "14px 16px",
                marginBottom: "12px",
                background: "#f8fafc",
                borderRadius: "10px",
                transition: "all 0.2s ease",
                border: "1px solid #edf2f7",
              }}
            >
              <div>
                <div style={{ fontWeight: 600 }}>{job.label}</div>
                <div style={{ fontSize: "13px", color: "#64748b" }}>
                  {job.description}
                </div>
              </div>

              <button
                onClick={() => handleDelete(job.id)}
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
