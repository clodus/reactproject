import { useEffect, useState } from "react";

type User = {
  id: number;
  email: string;
  firstname: string;
  lastname: string;
};

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
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
      setUsers(data);
    } catch (err) {
      setError("Impossible de charger les utilisateurs");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

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
          <span>{user.lastname}</span>

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
