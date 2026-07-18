"use client";
import { useEffect, useState } from "react";

export default function NoticeBoard() {
  const [notices, setNotices] = useState(null);

  useEffect(() => {
    fetch("/api/notices")
      .then((r) => r.json())
      .then((data) => setNotices(data.notices || []))
      .catch(() => setNotices([]));
  }, []);

  if (!notices || notices.length === 0) return null;

  const combined = notices.map((n) => n.message).join("     •     ");

  return (
    <div className="notice-board">
      <div className="notice-board-label">
        <span className="notice-dot" /> NOTICE
      </div>
      <div className="notice-ticker">
        <div className="notice-ticker-track">{combined}</div>
      </div>
    </div>
  );
}
