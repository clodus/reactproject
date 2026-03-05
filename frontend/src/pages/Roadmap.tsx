import { useMemo, useRef, useEffect, useState, useCallback } from "react";

type Assignment = {
  id: number;
  assigned_start_date: string;
  assigned_end_date: string;
  resource: {
    id: number;
    firstname: string;
    lastname: string;
  };
  project: string;
  color: string;
};

/* =========================
   CONSTANTES UI
========================= */
const DAY_WIDTH = 35;
const ROW_HEIGHT = 40;
const HEADER_HEIGHT = 40;
const NAME_COL_WIDTH = 200;
const HANDLE_WIDTH = 8;
const DURATION_ADJUSTMENT = 1;

/* =========================
   UTILS
========================= */
const parseLocalDate = (dateStr: string) => {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const formatDate = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

/* =========================
   RESIZABLE BAR COMPONENT
========================= */
type ResizableBarProps = {
  assignment: Assignment;
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
  const barRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<{
    type: "left" | "right" | "move" | null;
    startX: number;
    origStartIndex: number;
    origEndIndex: number;
  }>({ type: null, startX: 0, origStartIndex: 0, origEndIndex: 0 });

  const duration = endIndex - startIndex + DURATION_ADJUSTMENT;
  const left = NAME_COL_WIDTH + startIndex * DAY_WIDTH;
  const top = rowIndex * ROW_HEIGHT + 6;
  const width = duration * DAY_WIDTH;

  const clampIndex = (idx: number) =>
    Math.max(0, Math.min(dates.length - 1, idx));

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, type: "left" | "right" | "move") => {
      e.preventDefault();
      e.stopPropagation();

      dragState.current = {
        type,
        startX: e.clientX,
        origStartIndex: startIndex,
        origEndIndex: endIndex,
      };

      const onMouseMove = (ev: MouseEvent) => {
        const dx = ev.clientX - dragState.current.startX;
        const daysDelta = Math.round(dx / DAY_WIDTH);
        const { origStartIndex, origEndIndex } = dragState.current;

        let newStart = origStartIndex;
        let newEnd = origEndIndex;

        if (type === "left") {
          newStart = clampIndex(origStartIndex + daysDelta);
          if (newStart >= newEnd) newStart = newEnd - 1;
        } else if (type === "right") {
          newEnd = clampIndex(origEndIndex + daysDelta);
          if (newEnd <= newStart) newEnd = newStart + 1;
        } else {
          // move
          const len = origEndIndex - origStartIndex;
          newStart = clampIndex(origStartIndex + daysDelta);
          newEnd = clampIndex(newStart + len);
          if (newEnd >= dates.length) {
            newEnd = dates.length - 1;
            newStart = newEnd - len;
          }
        }

        onResize(
          assignment.id,
          formatDate(dates[newStart]),
          formatDate(dates[newEnd])
        );
      };

      const onMouseUp = () => {
        dragState.current.type = null;
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
      };

      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    },
    [startIndex, endIndex, dates, assignment.id, onResize]
  );

  return (
    <div
      ref={barRef}
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
        transition: "box-shadow 0.15s",
        pointerEvents: "auto",
      }}
      onMouseDown={(e) => handleMouseDown(e, "move")}
      title={`${assignment.id} (${assignment.assigned_start_date} → ${assignment.assigned_end_date})`}
    >
      {/* Left resize handle */}
      <div
        onMouseDown={(e) => handleMouseDown(e, "left")}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: HANDLE_WIDTH,
          height: "100%",
          cursor: "ew-resize",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(0,0,0,0.15)",
          borderRadius: "6px 0 0 6px",
          zIndex: 10,
          flexShrink: 0,
          pointerEvents: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
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

      {/* Label */}
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
        {assignment.project}
      </span>

      {/* Right resize handle */}
      <div
        onMouseDown={(e) => handleMouseDown(e, "right")}
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          width: HANDLE_WIDTH,
          height: "100%",
          cursor: "ew-resize",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(0,0,0,0.15)",
          borderRadius: "0 6px 6px 0",
          zIndex: 10,
          flexShrink: 0,
          pointerEvents: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
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
    </div>
  );
}

/* =========================
   COMPONENT PRINCIPAL
========================= */
export default function Roadmap() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resAssignments = await fetch("http://127.0.0.1:8000/assignments/");
        const assignmentsData: Assignment[] = await resAssignments.json();
        setAssignments(assignmentsData);
      } catch (err) {
        console.error("Erreur fetch roadmap:", err);
      }
    };
    fetchData();
  }, []);






  useEffect(() => {
    const fetchData = async () => {
      try {
        const e = await fetch("http://127.0.0.1:8000/requests/");
        const r: Assignment[] = await e.json();
        console.log(r)
      } catch (err) {
        console.error("Erreur fetch roadmap:", err);
      }
    };
    fetchData();
  }, []);








  const today = new Date();
  const [yearOffset, setYearOffset] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const baseYear = today.getFullYear() + yearOffset;

  const dates = useMemo(() => {
    const start = new Date(baseYear, 0, 1);
    const end = new Date(baseYear, 11, 31);
    const result: Date[] = [];
    const current = new Date(start);
    while (current <= end) {
      result.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return result;
  }, [baseYear]);

  const scrollToToday = () => {
    if (!scrollRef.current) return;
    const todayIndex = dates.findIndex(
      (d) =>
        d.getFullYear() === today.getFullYear() &&
        d.getMonth() === today.getMonth() &&
        d.getDate() === today.getDate()
    );
    if (todayIndex >= 0) {
      scrollRef.current.scrollTo({ left: todayIndex * DAY_WIDTH, behavior: "smooth" });
    }
  };

  useEffect(() => {
    if (yearOffset === 0) setTimeout(scrollToToday, 100);
  }, [yearOffset]);

  const handleResize = useCallback(
    (id: number, newStart: string, newEnd: string) => {
      setAssignments((prev) =>
        prev.map((a) =>
          a.id === id
            ? { ...a, assigned_start_date: newStart, assigned_end_date: newEnd }
            : a
        )
      );
    },
    []
  );

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
        <table
          style={{ borderCollapse: "collapse", width: "max-content", boxSizing: "border-box" }}
        >
          <thead>
            <tr>
              <th
                style={{
                  position: "sticky",
                  left: 0,
                  width: NAME_COL_WIDTH,
                  background: "#f9fafb",
                  zIndex: 2,
                  boxSizing: "border-box",
                  padding: 0,
                }}
              >
                Ressource
              </th>
              {dates.map((date, index) => (
                <th
                  key={index}
                  style={{
                    width: DAY_WIDTH,
                    height: HEADER_HEIGHT,
                    fontSize: 10,
                    background:
                      date.getFullYear() === today.getFullYear() &&
                      date.getMonth() === today.getMonth() &&
                      date.getDate() === today.getDate()
                        ? "#fde68a"
                        : "#fafafa",
                    boxSizing: "border-box",
                    padding: 0,
                  }}
                >
                  {date.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {assignments.map((assignment) => (
              <tr key={assignment.id}>
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
                    boxSizing: "border-box",
                    padding: "0 8px",
                  }}
                >
                  {assignment.resource.firstname} {assignment.resource.lastname}
                </td>
                {dates.map((_, index) => (
                  <td
                    key={index}
                    style={{
                      width: DAY_WIDTH,
                      height: ROW_HEIGHT,
                      borderRight: "1px solid #f3f4f6",
                      boxSizing: "border-box",
                      padding: 0,
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
            pointerEvents: "none", // les barres individuelles remettent pointerEvents: "auto"
          }}
        >
          {assignments.map((assignment, rowIndex) => {
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
          })}


         
        </div>
      </div>
    </div>
  );
}