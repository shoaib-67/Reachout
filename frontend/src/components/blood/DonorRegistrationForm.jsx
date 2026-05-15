import React from "react";
import InfoNote from "./InfoNote";
import { bloodGroupOptions, dayOptions } from "../../pages/bloodDonationUtils";

function DonorRegistrationForm({ onSubmit, donorPreview, error }) {
  return (
    <form className="blood-panel" onSubmit={onSubmit}>
      <p className="mini">Donor registration</p>
      <h2>Register as blood donor</h2>
      <div className="blood-form-grid">
        <label>
          <span>Name</span>
          <input name="name" placeholder="Donor full name" required />
        </label>
        <label>
          <span>Blood group</span>
          <select name="bloodGroup" required>
            {bloodGroupOptions.map((group) => (
              <option value={group} key={group}>
                {group}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Area</span>
          <input name="area" placeholder="Mirpur / Uttara / Dhanmondi" required />
        </label>
        <label className="wide-field">
          <span>Available days</span>
          <div className="day-check-grid">
            {dayOptions.map((day) => (
              <label key={day} className="mini-check">
                <input type="checkbox" name="scheduleDays" value={day} />
                <span>{day}</span>
              </label>
            ))}
          </div>
        </label>
        <label>
          <span>From</span>
          <input name="availableFrom" type="time" defaultValue="09:00" required />
        </label>
        <label>
          <span>To</span>
          <input name="availableTo" type="time" defaultValue="17:00" required />
        </label>
      </div>
      <button className="btn btn-primary" type="submit">
        Save Donor
      </button>
      {error ? <InfoNote variant="error">{error}</InfoNote> : null}
      {donorPreview ? (
        <InfoNote>
          Latest donor: {donorPreview.name} ({donorPreview.bloodGroup}, {donorPreview.area}) -{" "}
          {donorPreview.scheduleDays.join(", ")} ({donorPreview.availableFrom}-{donorPreview.availableTo})
        </InfoNote>
      ) : null}
    </form>
  );
}

export default DonorRegistrationForm;
