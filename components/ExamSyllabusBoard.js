"use client";
import { useEffect, useState } from "react";

export default function ExamSyllabusBoard() {
  const [exams, setExams] = useState(null);

  useEffect(() => {
    fetch("/api/exams")
      .then((r) => r.json())
      .then((data) => setExams(data.exams || []))
      .catch(() => setExams([]));
  }, []);

  if (!exams || exams.length === 0) return null;

  return (
    <div className="exam-board">
      <div className="exam-board-head">
        <span className="exam-warning-icon">⚠</span>
        <span>UPCOMING EXAM SYLLABUS</span>
      </div>
      <div className="exam-grid">
        {exams.map((e) => (
          <div className="exam-card" key={e._id}>
            <div className="exam-card-title">{e.title}</div>
            {e.examDate && <div className="exam-card-date">{e.examDate}</div>}
            {e.details && <p className="exam-card-details">{e.details}</p>}
            {e.link && (
              <a href={e.link} target="_blank" rel="noreferrer" className="exam-card-link">
                View full syllabus →
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
