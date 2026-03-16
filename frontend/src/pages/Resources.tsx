import { useEffect, useState } from "react";
import ConflictModal, {
  type ConflictDetail,
  type ConflictEntry,
  type Assignment,
} from "../components/ConflictModal";
import AbsenceModal from "../components/AbsenceModal";

type Job = { id: number; label: string };
type Resource = {
  id: number;
  email: string;
  firstname: string;
  lastname: string;
  job?: Job | null;
};

type ResourceRequest = {
  id: number;
  project_id: number;
  project: { id: number; name: string };
};

export default function Resources() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [conflictMap, setConflictMap] = useState<Record<number, ConflictDetail[]>>({});
  const [isConflictModalOpen, setIsConflictModalOpen] = useState(false);
  const [isAbsenceModalOpen, setIsAbsenceModalOpen] = useState(false);
  const [selectedResourceForAbsence, setSelectedResourceForAbsence] = useState<Resource | null>(null);
  const [email, setEmail] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const API_URL = "http://127.0.0.1:8000";

  // ─── Fetch ───────────────────────────────────────────────────────────────────

  const fetchResources = async () => {
    try {
      const res = await fetch(`${API_URL}/resources/`);
      const data = await res.json();
      const sorted = data.sort((a: Resource, b: Resource) =>
        a.firstname.localeCompare(b.firstname)
      );
      setResources(sorted);
    } catch {
      setError("Impossible de charger les ressources");
    }
  };

  const fetchJobs = async () => {
    try {
      const res = await fetch(`${API_URL}/jobs/`);
      const data = await res.json();
      setJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAssignmentsAndDetectConflicts = async () => {
    try {
      const [assignRes, requestRes] = await Promise.all([
        fetch(`${API_URL}/assignments/`),
        fetch(`${API_URL}/requests/`),
      ]);

      const assignments: Assignment[] = await assignRes.json();
      const requests: ResourceRequest[] = await requestRes.json();

      const requestMap: Record<number, ResourceRequest> = {};
      for (const r of requests) requestMap[r.id] = r;

      const getProjectName = (a: Assignment): string => {
        const req = requestMap[a.resource_request_id];
        return req?.project?.name ?? `Projet #${req?.project_id ?? a.resource_request_id}`;
      };

      const byResource: Record<number, Assignment[]> = {};
      for (const a of assignments) {
        if (!byResource[a.resource_id]) byResource[a.resource_id] = [];
        byResource[a.resource_id].push(a);
      }

      const newConflictMap: Record<number, ConflictDetail[]> = {};

      for (const [resourceIdStr, asgns] of Object.entries(byResource)) {
        const resourceId = Number(resourceIdStr);
        const sorted = [...asgns].sort(
          (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );

        const conflicts: ConflictDetail[] = [];

        for (let i = 0; i < sorted.length; i++) {
          for (let j = i + 1; j < sorted.length; j++) {
            const older = sorted[i];
            const newer = sorted[j];

            if (!newer.detect_conflict) continue;

            const aStart = new Date(older.assigned_start_date).getTime();
            const aEnd   = new Date(older.assigned_end_date).getTime();
            const bStart = new Date(newer.assigned_start_date).getTime();
            const bEnd   = new Date(newer.assigned_end_date).getTime();

            if (aStart <= bEnd && bStart <= aEnd) {
              conflicts.push({
                olderAssignment: older,
                newerAssignment: newer,
                olderProject: getProjectName(older),
                newerProject: getProjectName(newer),
              });
            }
          }
        }

        if (conflicts.length > 0) newConflictMap[resourceId] = conflicts;
      }

      setConflictMap(newConflictMap);
    } catch (err) {
      console.error("Erreur lors du chargement des assignments", err);
    }
  };

  useEffect(() => {
    fetchResources();
    fetchJobs();
    fetchAssignmentsAndDetectConflicts();
  }, []);

  // ─── Handlers ────────────────────────────────────────────────────────────────

  const handleAssignJob = async (resourceId: number, jobId: number) => {
    await fetch(`${API_URL}/resources/${resourceId}/job/${jobId}`, { method: "PUT" });
    fetchResources();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`${API_URL}/resources/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, firstname, lastname }),
      });
      if (!res.ok) throw new Error();
      setSuccess("Ressource créée avec succès");
      setEmail("");
      setFirstname("");
      setLastname("");
      fetchResources();
    } catch {
      setError("Erreur lors de la création de la ressource");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await fetch(`${API_URL}/resources/${id}`, { method: "DELETE" });
      fetchResources();
      fetchAssignmentsAndDetectConflicts();
    } catch {
      setError("Erreur lors de la suppression");
    }
  };

  const handleOpenAbsenceModal = (resource: Resource) => {
    setSelectedResourceForAbsence(resource);
    setIsAbsenceModalOpen(true);
  };

  // ─── Derived ─────────────────────────────────────────────────────────────────

  const conflictEntries: ConflictEntry[] = resources
    .filter((r) => !!conflictMap[r.id]?.length)
    .map((r) => ({ resource: r, conflicts: conflictMap[r.id] }));

  const totalConflicts = conflictEntries.reduce((sum, e) => sum + e.conflicts.length, 0);

  // ─── Render ──────────────────────────────────────────────────────────────────

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
        {/* ── Formulaire ── */}
        <h2 style={{ marginBottom: "25px", fontWeight: 600 }}>Créer une ressource</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
          />
          <input
            type="text"
            placeholder="First Name"
            value={firstname}
            required
            onChange={(e) => setFirstname(e.target.value)}
            style={inputStyle}
          />
          <input
            type="text"
            placeholder="Last Name"
            value={lastname}
            required
            onChange={(e) => setLastname(e.target.value)}
            style={{ ...inputStyle, marginBottom: "20px" }}
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
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.2s ease",
            }}
          >
            {loading ? "Création..." : "Créer"}
          </button>
        </form>

        {error && (
          <div style={{ marginTop: "15px", padding: "10px", background: "#fee2e2", color: "#b91c1c", borderRadius: "8px" }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{ marginTop: "15px", padding: "10px", background: "#dcfce7", color: "#166534", borderRadius: "8px" }}>
            {success}
          </div>
        )}

        <hr style={{ margin: "35px 0", border: "none", borderTop: "1px solid #eee" }} />

        {/* ── Header liste + bouton conflits ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h3 style={{ margin: 0 }}>Liste des ressources</h3>

          {totalConflicts > 0 && (
            <button
              onClick={() => setIsConflictModalOpen(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 14px",
                background: "#fffbeb",
                border: "1.5px solid #fcd34d",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: 600,
                color: "#92400e",
              }}
            >
              ⚠️ {totalConflicts} conflit{totalConflicts > 1 ? "s" : ""} — Voir le détail
            </button>
          )}
        </div>

        {/* ── Liste ── */}
        <ul style={{ listStyle: "none", padding: 0 }}>
          {resources.map((resource) => {
            const hasConflict = !!conflictMap[resource.id]?.length;
            return (
              <li
                key={resource.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "14px 16px",
                  marginBottom: "12px",
                  background: hasConflict ? "#fffbeb" : "#f8fafc",
                  borderRadius: "10px",
                  border: `1px solid ${hasConflict ? "#fcd34d" : "#edf2f7"}`,
                  transition: "all 0.2s ease",
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" }}>
                    <span>{resource.lastname} {resource.firstname}</span>

                    {hasConflict && (
                      <span
                        onClick={() => setIsConflictModalOpen(true)}
                        title="Voir les conflits"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: "22px",
                          height: "22px",
                          borderRadius: "50%",
                          background: "#fef3c7",
                          border: "1.5px solid #f59e0b",
                          cursor: "pointer",
                          flexShrink: 0,
                        }}
                      >
                        <svg viewBox="0 0 20 20" fill="none" width="13" height="13">
                          <path
                            d="M10 2L1.5 17h17L10 2z"
                            fill="#f59e0b"
                            stroke="#d97706"
                            strokeWidth="1"
                            strokeLinejoin="round"
                          />
                          <rect x="9.25" y="8" width="1.5" height="5" rx="0.75" fill="#78350f" />
                          <rect x="9.25" y="14.5" width="1.5" height="1.5" rx="0.75" fill="#78350f" />
                        </svg>
                      </span>
                    )}
                  </div>

                  <div style={{ marginTop: "6px" }}>
                    <select
                      value={resource.job?.id || ""}
                      onChange={(e) => {
                        const jobId = Number(e.target.value);
                        if (jobId > 0) handleAssignJob(resource.id, jobId);
                      }}
                      style={{
                        padding: "6px 8px",
                        borderRadius: "6px",
                        border: "1px solid #dcdcdc",
                        fontSize: "13px",
                      }}
                    >
                      <option value="">-- Assigner un job --</option>
                      {jobs.map((job) => (
                        <option key={job.id} value={job.id}>
                          {job.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* ── Actions ── */}
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <button
                    onClick={() => handleOpenAbsenceModal(resource)}
                    style={{
                      background: "#eff6ff",
                      border: "1px solid #bfdbfe",
                      padding: "6px 12px",
                      borderRadius: "6px",
                      cursor: "pointer",
                      color: "#1d4ed8",
                      fontWeight: 600,
                      fontSize: "13px",
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    🗓️ Poser des absences
                  </button>

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
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* ── Conflict Modal ── */}
      <ConflictModal
        isOpen={isConflictModalOpen}
        onClose={() => setIsConflictModalOpen(false)}
        conflictEntries={conflictEntries}
        onConflictResolved={fetchAssignmentsAndDetectConflicts}
      />

      {/* ── Absence Modal ── */}
      <AbsenceModal
        isOpen={isAbsenceModalOpen}
        onClose={() => {
          setIsAbsenceModalOpen(false);
          setSelectedResourceForAbsence(null);
        }}
        resource={selectedResourceForAbsence}
      />
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  marginBottom: "15px",
  borderRadius: "8px",
  border: "1px solid #dcdcdc",
  fontSize: "14px",
  outline: "none",
};
