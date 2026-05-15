import React from "react";

function InfoNote({ children, variant = "info" }) {
  return <div className={`inline-note ${variant === "error" ? "error" : ""}`}>{children}</div>;
}

export default InfoNote;
