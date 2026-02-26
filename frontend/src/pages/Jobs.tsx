import { useEffect, useState } from "react";

type Job = {
  id: number;
  label: string;
  role: string;
};

export default function Jobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [label, setLabel] = useState("");
  const [role, setRole] = useState("");

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
        body: JSON.stringify({ label, role }),
      });

      if (!res.ok) {
        throw new Error("Erreur lors de la création");
      }

      setSuccess("Job créé avec succès");
      setLabel("");
      setRole("");
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
    width: "100%",
    padding: "40px 20px",
    display: "flex",
    justifyContent: "center",
  }}
>
  <div style={{ width: "100%", maxWidth: "800px" }}>
    <h2>Créer un job</h2>

    <form onSubmit={handleSubmit}>
      <div>
        <input
          type="text"
          placeholder="Label"
          value={label}
          required
          onChange={(e) => setLabel(e.target.value)}
          style={{ width: "100%", marginBottom: "10px" }}
        />
      </div>

      <div>
        <input
          type="text"
          placeholder="Role"
          value={role}
          required
          onChange={(e) => setRole(e.target.value)}
          style={{ width: "100%", marginBottom: "10px" }}
        />
      </div>

      <button type="submit" disabled={loading}>
        {loading ? "Création..." : "Créer"}
      </button>
    </form>

    {error && <p style={{ color: "red" }}>{error}</p>}
    {success && <p style={{ color: "green" }}>{success}</p>}

    <hr />

    <h3>Liste des jobs</h3>
    <ul style={{ listStyle: "none", padding: 0 }}>
      {jobs.map((job) => (
        <li
          key={job.id}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "8px",
            padding: "10px",
            border: "1px solid #ddd",
            borderRadius: "6px",
          }}
        >
          <span>{job.label}</span>

          <button
            onClick={() => handleDelete(job.id)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "red",
              fontWeight: "bold",
            }}
          >
            ❌
          </button>
        </li>
      ))}
    </ul>
  </div>
</div>
  );
}
