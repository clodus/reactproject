import { useEffect, useState } from "react";

type Project = {
  id: number;
  name: string;
  description: string;
};

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const API_URL = "http://127.0.0.1:8000";

  // Recupere tous les projects
  const fetchProjects = async () => {
    try {
      const res = await fetch(`${API_URL}/projects/`);
      const data = await res.json();
      setProjects(data);
    } catch (err) {
      setError("Impossible de charger les projects");
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Creation projet
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`${API_URL}/projects/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, description }),
      });

      if (!res.ok) {
        throw new Error("Erreur lors de la création");
      }

      setSuccess("Projet créé avec succès");
      setName("");
      setDescription("");
      fetchProjects();
    } catch (err) {
      setError("Erreur lors de la création du projet");
    } finally {
      setLoading(false);
    }
  };

  // Supprimer job
  const handleDelete = async (id: number) => {
    try {
      await fetch(`${API_URL}/projects/${id}`, {
        method: "DELETE",
      });

      fetchProjects(); // refresh
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
    <h2>Créer un projet</h2>

    <form onSubmit={handleSubmit}>
      <div>
        <input
          type="text"
          placeholder="Name"
          value={name}
          required
          onChange={(e) => setName(e.target.value)}
          style={{ width: "100%", marginBottom: "10px" }}
        />
      </div>

      <div>
        <input
          type="text"
          placeholder="Description"
          value={description}
          required
          onChange={(e) => setDescription(e.target.value)}
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

    <h3>Liste des projets</h3>
    <ul style={{ listStyle: "none", padding: 0 }}>
      {projects.map((project) => (
        <li
          key={project.id}
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
          <span>{project.name}</span>

          <button
            onClick={() => handleDelete(project.id)}
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
