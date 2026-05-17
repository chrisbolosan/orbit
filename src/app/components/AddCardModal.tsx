"use client";
import { useState } from "react";
import { CATEGORIES } from "@/lib/srs";
import { X } from "lucide-react";

interface AddCardModalProps {
  onAdd: (data: { title: string; description: string; category: string }) => void;
  onClose: () => void;
}

export function AddCardModal({ onAdd, onClose }: AddCardModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("programming");

  const handleSubmit = () => {
    if (!title.trim()) return;
    onAdd({ title: title.trim(), description: description.trim(), category });
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(5,5,8,0.85)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        padding: "20px",
        backdropFilter: "blur(8px)",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: "#10101e",
          border: "1px solid rgba(124,106,255,0.2)",
          borderRadius: "20px",
          padding: "28px",
          width: "100%",
          maxWidth: "460px",
          boxShadow: "0 0 60px rgba(124,106,255,0.1)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 500, color: "#e2e8f0" }}>
            Add to orbit
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "8px",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#64748b",
            }}
          >
            <X size={16} />
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ fontSize: "12px", color: "#64748b", display: "block", marginBottom: "6px" }}>
              Topic *
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Binary Search Algorithm"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              style={{
                width: "100%",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "10px",
                padding: "10px 14px",
                color: "#e2e8f0",
                fontSize: "14px",
                fontFamily: "'DM Sans', sans-serif",
                outline: "none",
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: "12px", color: "#64748b", display: "block", marginBottom: "6px" }}>
              Notes (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What do you want to remember about this?"
              rows={3}
              style={{
                width: "100%",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "10px",
                padding: "10px 14px",
                color: "#e2e8f0",
                fontSize: "14px",
                fontFamily: "'DM Sans', sans-serif",
                outline: "none",
                resize: "vertical",
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: "12px", color: "#64748b", display: "block", marginBottom: "8px" }}>
              Category
            </label>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "8px",
                    border: `1px solid ${category === cat.id ? cat.color + "60" : "rgba(255,255,255,0.08)"}`,
                    background: category === cat.id ? cat.color + "20" : "rgba(255,255,255,0.03)",
                    color: category === cat.id ? cat.color : "#64748b",
                    fontSize: "12px",
                    cursor: "pointer",
                    fontFamily: "'DM Sans', sans-serif",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  {cat.icon} {cat.name}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!title.trim()}
            style={{
              padding: "12px",
              borderRadius: "12px",
              border: "none",
              background: title.trim() ? "linear-gradient(135deg, #7c6aff, #4f43d4)" : "rgba(255,255,255,0.05)",
              color: title.trim() ? "#fff" : "#475569",
              fontSize: "14px",
              fontWeight: 500,
              cursor: title.trim() ? "pointer" : "not-allowed",
              fontFamily: "'DM Sans', sans-serif",
              marginTop: "4px",
              transition: "opacity 0.2s",
            }}
          >
            Launch into orbit 🚀
          </button>
        </div>
      </div>
    </div>
  );
}
