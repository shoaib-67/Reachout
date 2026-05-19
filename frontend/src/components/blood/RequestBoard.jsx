import React from "react";
import { STATUS, getCountdownLabel } from "../../pages/bloodDonationUtils";

function RequestBoard({
  requests,
  onDonorAction,
  onRequesterClose,
  notifications,
  nowMs
}) {
  return (
    <div className="blood-panel">
      <div className="blood-panel-heading">
        <div>
          <p className="mini">Request status</p>
          <h2>Donor response and closure</h2>
        </div>
        <span>{requests.length} total</span>
      </div>

      <div className="blood-list">
        {requests.map((request) => (
          <article className="request-card" key={request.id}>
            <div className="request-head">
              <h3>
                {request.bloodGroup} | {request.patient}
              </h3>
              <strong>{request.id}</strong>
            </div>
            <p>
              {request.hospital} | {request.location}
            </p>
            {request.contactPhone ? <p>Emergency contact: {request.contactPhone}</p> : null}
            {request.postedByName || request.postedByEmail ? (
              <p>
                Posted by: {request.postedByName || "Unknown"} {request.postedByEmail ? `(${request.postedByEmail})` : ""}
                {request.postedByPhone ? ` | ${request.postedByPhone}` : ""}
              </p>
            ) : null}
            <div className="request-meta">
              <span className={`status-chip ${request.status === STATUS.OPEN || request.status === STATUS.ACCEPTED ? "open" : "declined"}`}>
                {request.status}
              </span>
              <span className={`status-chip ${request.donorResponse === "Accepted" ? "open" : request.donorResponse === "Declined" ? "declined" : ""}`}>
                Donor: {request.donorResponse}
              </span>
              <span className="status-chip">Urgency: {request.urgency}</span>
              {request.donorResponse !== "Declined" ? (
                <span className="status-chip">Expires in: {getCountdownLabel(request.expiresAt, nowMs)}</span>
              ) : null}
              {request.acceptedBy ? <span className="status-chip">Accepted by: {request.acceptedBy}</span> : null}
            </div>
            <div className="request-actions">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => onRequesterClose(request.id, STATUS.COMPLETED)}
                disabled={request.status !== STATUS.OPEN && request.status !== STATUS.ACCEPTED}
              >
                Mark Completed
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => onRequesterClose(request.id, STATUS.CANCELLED)}
                disabled={request.status !== STATUS.OPEN && request.status !== STATUS.ACCEPTED}
              >
                Cancel Request
              </button>
            </div>
          </article>
        ))}
      </div>

      <div className="notification-panel">
        <h3>Urgency notifications</h3>
        {notifications.length === 0 ? (
          <p className="empty-state">No notifications yet. Create a request to trigger donor alerts.</p>
        ) : (
          <div className="notification-list">
            {notifications.map((item) => (
              <article key={item.id} className="notification-card">
                <p>{item.text}</p>
                <small>{item.ts}</small>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default RequestBoard;
