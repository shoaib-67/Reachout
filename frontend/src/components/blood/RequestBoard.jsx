import React from "react";
import InfoNote from "./InfoNote";
import { STATUS, getCountdownLabel } from "../../pages/bloodDonationUtils";

function RequestBoard({
  donors,
  requests,
  actingDonorId,
  setActingDonorId,
  actingDonor,
  actingDonorRest,
  eligibilityResult,
  onEligibilityCheck,
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
      <div className="request-tool-grid">
        <label>
          <span>Acting donor</span>
          <select value={actingDonorId} onChange={(event) => setActingDonorId(event.target.value)}>
            {donors.map((donor) => (
              <option value={donor.id} key={donor.id}>
                {donor.name} ({donor.bloodGroup}, {donor.area})
              </option>
            ))}
          </select>
        </label>
        <form onSubmit={onEligibilityCheck} className="eligibility-form">
          <label>
            <span>Age</span>
            <input name="age" type="number" min="0" required />
          </label>
          <label>
            <span>Weight (kg)</span>
            <input name="weight" type="number" min="0" required />
          </label>
          <label>
            <span>Recent illness</span>
            <select name="recentIllness" defaultValue="no">
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
          </label>
          <button className="btn btn-outline-strong" type="submit">
            Check Eligibility
          </button>
        </form>
      </div>
      {actingDonor ? (
        <InfoNote>
          {actingDonor.name}: {actingDonorRest?.message} | History:{" "}
          {actingDonor.donationHistory.length ? actingDonor.donationHistory.join(", ") : "No donation history"}
        </InfoNote>
      ) : null}
      {eligibilityResult ? <InfoNote>{eligibilityResult}</InfoNote> : null}

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
            <div className="request-meta">
              <span className={`status-chip ${request.status === STATUS.OPEN || request.status === STATUS.ACCEPTED ? "open" : "declined"}`}>
                {request.status}
              </span>
              <span className={`status-chip ${request.donorResponse === "Accepted" ? "open" : request.donorResponse === "Declined" ? "declined" : ""}`}>
                Donor: {request.donorResponse}
              </span>
              <span className="status-chip">Urgency: {request.urgency}</span>
              <span className="status-chip">Expires in: {getCountdownLabel(request.expiresAt, nowMs)}</span>
              {request.acceptedBy ? <span className="status-chip">Accepted by: {request.acceptedBy}</span> : null}
            </div>
            <div className="request-actions">
              <button type="button" className="btn btn-outline-strong" onClick={() => onDonorAction(request.id, "accept")} disabled={request.status !== STATUS.OPEN}>
                Accept
              </button>
              <button type="button" className="btn btn-outline-strong" onClick={() => onDonorAction(request.id, "decline")} disabled={request.status !== STATUS.OPEN}>
                Decline
              </button>
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
