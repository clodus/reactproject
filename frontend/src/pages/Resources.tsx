import { useEffect, useState } from "react";

type Job = { id: number; label: string };
type Resource = {
  id: number;
  email: string;
  firstname: string;
  lastname: string;
  job?: Job | null;
};

export default function Resources() {
  const [Resources, setResources] = useState<Resource[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [email, setEmail] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const API_URL = "http://127.0.0.1:8000";

  // Recupere tous les utilisateurs
  const fetchResources = async () => {
    try {
      const res = await fetch(`${API_URL}/resources/`);
      const data = await res.json();
      // Trier par firstname
      const sorted = data.sort((a: { firstname: string; }, b: { firstname: any; }) => a.firstname.localeCompare(b.firstname));
      setResources(sorted);
    } catch (err) {
      setError("Impossible de charger les utilisateurs");
    }
  };

  const fetchJobs = async () => {
    try {
      const res = await fetch(`${API_URL}/jobs/`);
      const data = await res.json();
      setJobs(Array.isArray(data) ? data : []); // s'assurer que c'est un tableau
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchResources();
    fetchJobs();
  }, []);

  const handleAssignJob = async (resourceId: number, jobId: number) => {
    await fetch(`${API_URL}/resources/${resourceId}/job/${jobId}`, { method: "PUT" });
    fetchResources();
  };

  // Creation utilisateur
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`${API_URL}/resources/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, firstname, lastname }),
      });

      if (!res.ok) {
        throw new Error("Erreur lors de la création");
      }

      setSuccess("Ressource créé avec succès");
      setEmail("");
      setFirstname("");
      setLastname("");
      fetchResources();
    } catch (err) {
      setError("Erreur lors de la création de la ressource");
    } finally {
      setLoading(false);
    }
  };

  // Supprimer utilisateur
  const handleDelete = async (id: number) => {
    try {
      await fetch(`${API_URL}/resources/${id}`, {
        method: "DELETE",
      });

      fetchResources(); // refresh
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
          Créer une ressource
        </h2>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 14px",
              marginBottom: "15px",
              borderRadius: "8px",
              border: "1px solid #dcdcdc",
              fontSize: "14px",
              outline: "none",
            }}
          />

          <input
            type="text"
            placeholder="First Name"
            value={firstname}
            required
            onChange={(e) => setFirstname(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 14px",
              marginBottom: "15px",
              borderRadius: "8px",
              border: "1px solid #dcdcdc",
              fontSize: "14px",
              outline: "none",
            }}
          />

          <input
            type="text"
            placeholder="Last Name"
            value={lastname}
            required
            onChange={(e) => setLastname(e.target.value)}
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

        <h3 style={{ marginBottom: "15px" }}>Liste des ressources</h3>

        <ul style={{ listStyle: "none", padding: 0 }}>
          {Resources.map((resource) => (
            <li
              key={resource.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "14px 16px",
                marginBottom: "12px",
                background: "#f8fafc",
                borderRadius: "10px",
                border: "1px solid #edf2f7",
                transition: "all 0.2s ease",
              }}
            >
              <div>
                <div style={{ fontWeight: 600 }}>
                  {resource.lastname} {resource.firstname}
                </div>

                <div style={{ marginTop: "6px" }}>
                  <select
                    value={resource.job?.id || ""}
                    onChange={(e) => {
                      const jobId = Number(e.target.value);
                      if (jobId > 0) {
                        handleAssignJob(resource.id, jobId);
                      }
                    }}
                    style={{
                      padding: "6px 8px",
                      borderRadius: "6px",
                      border: "1px solid #dcdcdc",
                      fontSize: "13px",
                    }}
                  >
                    <option value="">-- Assigner un job --</option>
                    {jobs?.map((job) => (
                      <option key={job.id} value={job.id}>
                        {job.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={() => handleDelete(resource.id)}
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
