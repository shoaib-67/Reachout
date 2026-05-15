import React from "react";
import { areaOptions, bloodGroupOptions, isDonorAvailableNow } from "../../pages/bloodDonationUtils";

function DonorCard({ donor }) {
  const availableNow = isDonorAvailableNow(donor);
  return (
    <article className="blood-card">
      <div>
        <h3>{donor.name}</h3>
        <p>
          {donor.bloodGroup} | {donor.area}
        </p>
        <p>
          {donor.scheduleDays.join(", ")} | {donor.availableFrom}-{donor.availableTo}
        </p>
        <p>Donated: {donor.donationHistory.length} time(s)</p>
      </div>
      <span className={`status-chip ${availableNow ? "open" : "declined"}`}>{availableNow ? "Available Now" : "Not In Time Slot"}</span>
    </article>
  );
}

function DonorSearchPanel({ donors, searchBloodGroup, setSearchBloodGroup, searchArea, setSearchArea }) {
  return (
    <div className="blood-panel">
      <div className="blood-panel-heading">
        <div>
          <p className="mini">Search donors</p>
          <h2>Filter by blood group and area</h2>
        </div>
        <span>{donors.length} matches</span>
      </div>
      <div className="blood-search-grid">
        <label>
          <span>Blood group</span>
          <select value={searchBloodGroup} onChange={(event) => setSearchBloodGroup(event.target.value)}>
            <option value="All">All</option>
            {bloodGroupOptions.map((group) => (
              <option value={group} key={group}>
                {group}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Area</span>
          <select value={searchArea} onChange={(event) => setSearchArea(event.target.value)}>
            <option value="All">All</option>
            {areaOptions.map((areaOption) => (
              <option value={areaOption} key={areaOption}>
                {areaOption}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="blood-list">
        {donors.length === 0 ? (
          <p className="empty-state">No donors found for this filter.</p>
        ) : (
          donors.map((donor) => <DonorCard donor={donor} key={donor.id} />)
        )}
      </div>
    </div>
  );
}

export default DonorSearchPanel;
