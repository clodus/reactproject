import { useMemo, useEffect, useState } from "react";
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



const TASK_COLORS: Record<string, string> = {
  BUILD: "#3b82f6",
  REFACTO: "#8b5cf6",
  DISCO: "#10b981",
  RUN: "#b91010",
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

export default function Roadmap() {
  const [flatAssignments, setFlatAssignments] = useState<FlatAssignment[]>([]);

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

  const resources = useMemo(() => groupByResource(flatAssignments), [flatAssignments]);

  return (
      <Gantt data={resources} />
  );
}