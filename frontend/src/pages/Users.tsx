import { useEffect, useState } from "react";

type Job = { id: number; label: string };
type User = {
  id: number;
  email: string;
  firstname: string;
  lastname: string;
  job?: Job | null;
};

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [email, setEmail] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const API_URL = "http://127.0.0.1:8000";

  // Recupere tous les utilisateurs
  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/users/`);
      const data = await res.json();
      // Trier par firstname
      const sorted = data.sort((a: { firstname: string; }, b: { firstname: any; }) => a.firstname.localeCompare(b.firstname));
      setUsers(sorted);
    } catch (err) {
      setError("Impossible de charger les utilisateurs");
    }
  };

  const fetchJobs = async () => {
    try {
      const res = await fetch(`${API_URL}/jobs`);
      const data = await res.json();
      console.log("data jobs:", data); // 🔍 vérifier le format
      setJobs(Array.isArray(data) ? data : []); // s'assurer que c'est un tableau
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchJobs();
  }, []);

  const handleAssignJob = async (userId: number, jobId: number) => {
    await fetch(`${API_URL}/users/${userId}/job/${jobId}`, { method: "PUT" });
    fetchUsers();
  };

  // Creation utilisateur
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`${API_URL}/users/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, firstname, lastname }),
      });

      if (!res.ok) {
        throw new Error("Erreur lors de la création");
      }

      setSuccess("Utilisateur créé avec succès");
      setEmail("");
      setFirstname("");
      setLastname("");
      fetchUsers();
    } catch (err) {
      setError("Erreur lors de la création de l'utilisateur");
    } finally {
      setLoading(false);
    }
  };

  // Supprimer utilisateur
  const handleDelete = async (id: number) => {
    try {
      await fetch(`${API_URL}/users/${id}`, {
        method: "DELETE",
      });

      fetchUsers(); // refresh
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
    <h2>Créer un utilisateur</h2>

    <form onSubmit={handleSubmit}>
      <div>
        <input
          type="email"
          placeholder="Email"
          value={email}
          required
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: "100%", marginBottom: "10px" }}
        />
      </div>

      <div>
        <input
          type="text"
          placeholder="First Name"
          value={firstname}
          required
          onChange={(e) => setFirstname(e.target.value)}
          style={{ width: "100%", marginBottom: "10px" }}
        />
      </div>

      <div>
        <input
          type="text"
          placeholder="Last Name"
          value={lastname}
          required
          onChange={(e) => setLastname(e.target.value)}
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

    <h3>Liste des utilisateurs</h3>
    <ul style={{ listStyle: "none", padding: 0 }}>
      {users.map((user) => (
        <li
          key={user.id}
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
              <div>
                {user.lastname} {user.firstname}
                <select
                  value={user.job?.id || ""}
                  onChange={e =>{ 
                    const jobId = Number(e.target.value);
                    if (jobId > 0) {
                      handleAssignJob(user.id, Number(e.target.value))
                    }
                  }}
                  style={{ marginLeft: "10px" }}
                >
                  <option value="">-- Aucun job --</option>
                  {jobs?.map(job => <option key={job.id} value={job.id}>{job.label}</option>)}
                </select>
              </div>
          

          <button
            onClick={() => handleDelete(user.id)}
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
