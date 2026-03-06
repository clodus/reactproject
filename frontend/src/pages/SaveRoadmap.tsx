import { useMemo, useRef, useEffect, useState, useCallback } from "react";
import Gantt from "../components/Gantt";

/* =========================
   TYPES
========================= */
type RawAssignment = {
  id: number;
  assigned_start_date: string;
  assigned_end_date: string;
  resource: {
    id: number;
    firstname: string;
    lastname: string;
  };
};

type RawRequest = {
  id: number;
  task_type: string;
  project: { name: string };
  job: { label: string };
  assignments: RawAssignment[];
};

type FlatAssignment = {
  id: number; // assignment id
  task_type: string;
  assigned_start_date: string;
  assigned_end_date: string;
  resource: { id: number; firstname: string; lastname: string };
  project: string;
  job: string;
  color: string;
};

type Resource = {
  id: number;
  firstname: string;
  lastname: string;
  assignments: FlatAssignment[];
};

/* =========================
   CONSTANTES UI
========================= */
const DAY_WIDTH = 35;
const ROW_HEIGHT = 40;
const HEADER_HEIGHT = 40;
const NAME_COL_WIDTH = 200;
const HANDLE_WIDTH = 8;

/* =========================
   UTILS
========================= */
const parseLocalDate = (dateStr: string): Date => {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const formatDate = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const TASK_COLORS: Record<string, string> = {
  BUILD: "#3b82f6",
  REFACTO: "#8b5cf6",
  DISCO: "#10b981",
};

const getTaskColor = (task_type: string): string =>
  TASK_COLORS[task_type] ?? "#6b7280";

function flattenRequests(requests: RawRequest[]): FlatAssignment[] {
  const result: FlatAssignment[] = [];
  for (const request of requests) {
    if (!Array.isArray(request.assignments)) continue;
    for (const assignment of request.assignments) {
      result.push({
        id: assignment.id,
        task_type: request.task_type,
        assigned_start_date: assignment.assigned_start_date,
        assigned_end_date: assignment.assigned_end_date,
        resource: assignment.resource,
        project: request.project.name,
        job: request.job.label,
        color: getTaskColor(request.task_type),
      });
    }
  }
  return result;
}

function groupByResource(flatAssignments: FlatAssignment[]): Resource[] {
  const map = new Map<number, Resource>();
  for (const a of flatAssignments) {
    const rid = a.resource.id;
    if (!map.has(rid)) {
      map.set(rid, {
        id: rid,
        firstname: a.resource.firstname,
        lastname: a.resource.lastname,
        assignments: [],
      });
    }
    map.get(rid)!.assignments.push(a);
  }
  return Array.from(map.values());
}

/* =========================
   RESIZABLE BAR COMPONENT
========================= */
type ResizableBarProps = {
  assignment: FlatAssignment;
  startIndex: number;
  endIndex: number;
  rowIndex: number;
  dates: Date[];
  onResize: (id: number, newStart: string, newEnd: string) => void;
};

function ResizableBar({
  assignment,
  startIndex,
  endIndex,
  rowIndex,
  dates,
  onResize,
}: ResizableBarProps) {
  // Refs to always have latest values during drag without re-creating handlers
  const startIndexRef = useRef(startIndex);
  const endIndexRef = useRef(endIndex);
  const datesRef = useRef(dates);

  useEffect(() => { startIndexRef.current = startIndex; }, [startIndex]);
  useEffect(() => { endIndexRef.current = endIndex; }, [endIndex]);
  useEffect(() => { datesRef.current = dates; }, [dates]);

  const duration = endIndex - startIndex + 1;
  const left = NAME_COL_WIDTH + startIndex * DAY_WIDTH;
  const top = rowIndex * ROW_HEIGHT + 6;
  const width = duration * DAY_WIDTH;

  const clampIndex = (idx: number) =>
    Math.max(0, Math.min(datesRef.current.length - 1, idx));

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, type: "left" | "right" | "move") => {
      e.preventDefault();
      e.stopPropagation();

      const origStart = startIndexRef.current;
      const origEnd = endIndexRef.current;
      const startX = e.clientX;

      const onMouseMove = (ev: MouseEvent) => {
        const dx = ev.clientX - startX;
        const daysDelta = Math.round(dx / DAY_WIDTH);

        let newStart = origStart;
        let newEnd = origEnd;

        if (type === "left") {
          newStart = clampIndex(origStart + daysDelta);
          if (newStart >= newEnd) newStart = newEnd;
        } else if (type === "right") {
          newEnd = clampIndex(origEnd + daysDelta);
          if (newEnd <= newStart) newEnd = newStart;
        } else {
          const len = origEnd - origStart;
          newStart = clampIndex(origStart + daysDelta);
          newEnd = newStart + len;
          if (newEnd >= datesRef.current.length) {
            newEnd = datesRef.current.length - 1;
            newStart = newEnd - len;
          }
        }

        onResize(
          assignment.id,
          formatDate(datesRef.current[newStart]),
          formatDate(datesRef.current[newEnd])
        );
      };

      const onMouseUp = () => {
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
      };

      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    },
    [assignment.id, onResize]
  );

  const Handle = ({ side }: { side: "left" | "right" }) => (
    <div
      onMouseDown={(e) => handleMouseDown(e, side)}
      style={{
        position: "absolute",
        [side]: 0,
        top: 0,
        width: HANDLE_WIDTH,
        height: "100%",
        cursor: "ew-resize",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.15)",
        borderRadius: side === "left" ? "6px 0 0 6px" : "0 6px 6px 0",
        zIndex: 10,
        pointerEvents: "auto",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: 2,
              height: 2,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.8)",
            }}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        width,
        height: 28,
        background: assignment.color,
        borderRadius: 6,
        display: "flex",
        alignItems: "center",
        color: "white",
        fontSize: 12,
        fontWeight: 500,
        boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
        userSelect: "none",
        cursor: "grab",
        overflow: "hidden",
        pointerEvents: "auto",
      }}
      onMouseDown={(e) => handleMouseDown(e, "move")}
      title={`${assignment.project} (${assignment.assigned_start_date} → ${assignment.assigned_end_date})`}
    >
      <Handle side="left" />

      <span
        style={{
          flex: 1,
          textAlign: "center",
          overflow: "hidden",
          whiteSpace: "nowrap",
          textOverflow: "ellipsis",
          paddingLeft: HANDLE_WIDTH + 2,
          paddingRight: HANDLE_WIDTH + 2,
          pointerEvents: "none",
        }}
      >
        {assignment.project} ({assignment.task_type})
      </span>

      <Handle side="right" />
    </div>
  );
}

/* =========================
   COMPONENT PRINCIPAL
========================= */
export default function Roadmap() {
  const [flatAssignments, setFlatAssignments] = useState<FlatAssignment[]>([]);

  const today = new Date();
  const [yearOffset, setYearOffset] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const baseYear = today.getFullYear() + yearOffset;

  // Fetch requests from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/requests/");
        const data = await res.json();
        const requests: RawRequest[] = Array.isArray(data) ? data : data.results ?? [];
        setFlatAssignments(flattenRequests(requests));
      } catch (err) {
        console.error("Erreur fetch roadmap:", err);
      }
    };
    fetchData();
  }, []);

  // Generate all dates for the year
  const dates = useMemo(() => {
    const result: Date[] = [];
    const current = new Date(baseYear, 0, 1);
    const end = new Date(baseYear, 11, 31);
    while (current <= end) {
      result.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return result;
  }, [baseYear]);

  const resources = useMemo(() => groupByResource(flatAssignments), [flatAssignments]);


  const scrollToToday = useCallback(() => {
    if (!scrollRef.current) return;
    const todayIndex = dates.findIndex(
      (d) =>
        d.getFullYear() === today.getFullYear() &&
        d.getMonth() === today.getMonth() &&
        d.getDate() === today.getDate()
    );
    if (todayIndex >= 0) {
      scrollRef.current.scrollTo({ left: todayIndex * DAY_WIDTH - 200, behavior: "smooth" });
    }
  }, [dates]);

  useEffect(() => {
    if (yearOffset === 0) setTimeout(scrollToToday, 100);
  }, [yearOffset, scrollToToday]);

  // Update a single assignment's dates after resize
  const handleResize = useCallback((id: number, newStart: string, newEnd: string) => {
    setFlatAssignments((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, assigned_start_date: newStart, assigned_end_date: newEnd }
          : a
      )
    );
  }, []);

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button onClick={() => setYearOffset((y) => y - 1)}>◀</button>
          <h2 style={{ margin: 0 }}>{baseYear}</h2>
          <button onClick={() => setYearOffset((y) => y + 1)}>▶</button>
        </div>
        <button onClick={scrollToToday}>Aujourd'hui</button>
      </div>

      {/* TABLE WRAPPER */}
      <div
        ref={scrollRef}
        style={{
          overflowX: "auto",
          border: "1px solid #eee",
          borderRadius: 8,
          position: "relative",
        }}
      >
        <table style={{ borderCollapse: "collapse", width: "max-content" }}>
          <thead>
            <tr>
              <th
                style={{
                  position: "sticky",
                  left: 0,
                  width: NAME_COL_WIDTH,
                  minWidth: NAME_COL_WIDTH,
                  background: "#f9fafb",
                  zIndex: 2,
                  padding: 0,
                  boxSizing: "border-box",
                }}
              >
                Ressource
              </th>
              {dates.map((date, index) => {
                const isToday =
                  date.getFullYear() === today.getFullYear() &&
                  date.getMonth() === today.getMonth() &&
                  date.getDate() === today.getDate();
                return (
                  <th
                    key={index}
                    style={{
                      width: DAY_WIDTH,
                      minWidth: DAY_WIDTH,
                      height: HEADER_HEIGHT,
                      fontSize: 10,
                      background: isToday ? "#fde68a" : "#fafafa",
                      padding: 0,
                      boxSizing: "border-box",
                      fontWeight: isToday ? 700 : 400,
                    }}
                  >
                    {date.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {resources.map((resource) => (
              <tr key={resource.id}>
                <td
                  style={{
                    position: "sticky",
                    left: 0,
                    width: NAME_COL_WIDTH,
                    background: "white",
                    zIndex: 11,
                    borderRight: "1px solid #ddd",
                    fontWeight: 500,
                    height: ROW_HEIGHT,
                    padding: "0 8px",
                    boxSizing: "border-box",
                  }}
                >
                  {resource.firstname} {resource.lastname}
                </td>
                {dates.map((_, index) => (
                  <td
                    key={index}
                    style={{
                      width: DAY_WIDTH,
                      height: ROW_HEIGHT,
                      borderRight: "1px solid #f3f4f6",
                      padding: 0,
                      boxSizing: "border-box",
                    }}
                  />
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {/* OVERLAY BARRES */}
        <div
          style={{
            position: "absolute",
            top: HEADER_HEIGHT,
            left: 0,
            pointerEvents: "none",
          }}
        >
          {resources.map((resource, rowIndex) =>
            resource.assignments.map((assignment) => {
              const start = parseLocalDate(assignment.assigned_start_date);
              const end = parseLocalDate(assignment.assigned_end_date);

              const startIndex = dates.findIndex(
                (d) =>
                  d.getFullYear() === start.getFullYear() &&
                  d.getMonth() === start.getMonth() &&
                  d.getDate() === start.getDate()
              );
              const endIndex = dates.findIndex(
                (d) =>
                  d.getFullYear() === end.getFullYear() &&
                  d.getMonth() === end.getMonth() &&
                  d.getDate() === end.getDate()
              );

              if (startIndex === -1 || endIndex === -1) return null;

              return (
                <ResizableBar
                  key={assignment.id}
                  assignment={assignment}
                  startIndex={startIndex}
                  endIndex={endIndex}
                  rowIndex={rowIndex}
                  dates={dates}
                  onResize={handleResize}
                />
              );
            })
          )}
        </div>
      </div>

      

    </div>
  );
}