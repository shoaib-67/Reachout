import React, { useEffect, useMemo, useState } from "react";
import DonorRegistrationForm from "../components/blood/DonorRegistrationForm";
import DonorSearchPanel from "../components/blood/DonorSearchPanel";
import RequestBoard from "../components/blood/RequestBoard";
import InfoNote from "../components/blood/InfoNote";
import {
  STATUS,
  STORAGE_KEYS,
  areaOptions,
  bloodGroupOptions,
  dayOptions,
  initialDonors,
  initialRequests,
  safeLoad,
  resolveArea,
  toMinutes,
  normalizeText,
  createRequestFromForm,
  restRuleInfo,
  isDonorAvailableNow,
  urgencyOptions
} from "./bloodDonationUtils";

function BloodDonationPage() {
  const [donors, setDonors] = useState(() => safeLoad(STORAGE_KEYS.donors, initialDonors));
  const [requests, setRequests] = useState(() => safeLoad(STORAGE_KEYS.requests, initialRequests));
  const [notifications, setNotifications] = useState(() => safeLoad(STORAGE_KEYS.notifications, []));
  const [actingDonorId, setActingDonorId] = useState(() => safeLoad(STORAGE_KEYS.actingDonorId, "BD-201"));
  const [searchBloodGroup, setSearchBloodGroup] = useState("All");
  const [searchArea, setSearchArea] = useState("All");
  const [eligibilityResult, setEligibilityResult] = useState(null);
  const [donorPreview, setDonorPreview] = useState(null);
  const [donorFormError, setDonorFormError] = useState("");
  const [requestFormError, setRequestFormError] = useState("");
  const [nowMs, setNowMs] = useState(Date.now());

  const donorById = useMemo(() => Object.fromEntries(donors.map((donor) => [donor.id, donor])), [donors]);
  const actingDonor = donorById[actingDonorId];
  const actingDonorRest = actingDonor ? restRuleInfo(actingDonor) : null;
  const openRequests = requests.filter((request) => request.status === STATUS.OPEN).length;
  const availableNowCount = donors.filter((donor) => isDonorAvailableNow(donor)).length;

  useEffect(() => localStorage.setItem(STORAGE_KEYS.donors, JSON.stringify(donors)), [donors]);
  useEffect(() => localStorage.setItem(STORAGE_KEYS.requests, JSON.stringify(requests)), [requests]);
  useEffect(() => localStorage.setItem(STORAGE_KEYS.notifications, JSON.stringify(notifications)), [notifications]);
  useEffect(() => localStorage.setItem(STORAGE_KEYS.actingDonorId, JSON.stringify(actingDonorId)), [actingDonorId]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const now = Date.now();
      setNowMs(now);
      setRequests((current) =>
        current.map((request) => {
          if (request.status !== STATUS.OPEN || request.donorResponse !== "Pending") return request;
          if (now > new Date(request.expiresAt).getTime()) return { ...request, status: STATUS.EXPIRED };
          return request;
        })
      );
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const filteredDonors = donors.filter((donor) => {
    const matchGroup = searchBloodGroup === "All" || donor.bloodGroup === searchBloodGroup;
    const matchArea = searchArea === "All" || donor.area === searchArea;
    return matchGroup && matchArea;
  });

  function pushNotification(text) {
    const notification = { id: `n-${Date.now()}`, text, ts: new Date().toLocaleString() };
    setNotifications((current) => [notification, ...current].slice(0, 8));
  }

  function handleDonorRegistration(event) {
    event.preventDefault();
    setDonorFormError("");
    const data = new FormData(event.currentTarget);
    const areaRaw = (data.get("area") || "").toString();
    const area = resolveArea(areaRaw);
    const availableFrom = (data.get("availableFrom") || "09:00").toString();
    const availableTo = (data.get("availableTo") || "17:00").toString();
    const name = (data.get("name") || "").toString().trim();
    const bloodGroup = (data.get("bloodGroup") || "Unknown").toString();

    if (!area) {
      setDonorFormError(`Area must be one of: ${areaOptions.join(", ")}.`);
      return;
    }
    if (toMinutes(availableFrom) >= toMinutes(availableTo)) {
      setDonorFormError("Availability time is invalid. 'From' must be earlier than 'To'.");
      return;
    }

    const isDuplicate = donors.some(
      (donor) =>
        normalizeText(donor.name) === normalizeText(name) &&
        donor.bloodGroup === bloodGroup &&
        normalizeText(donor.area) === normalizeText(area)
    );
    if (isDuplicate) {
      setDonorFormError("Duplicate donor detected (same name, blood group, and area).");
      return;
    }

    const newDonor = {
      id: `BD-${200 + donors.length + 1}`,
      name: name || "Unnamed donor",
      bloodGroup,
      area,
      scheduleDays: dayOptions.filter((day) => data.getAll("scheduleDays").includes(day)),
      availableFrom,
      availableTo,
      donationHistory: []
    };

    if (!newDonor.scheduleDays.length) newDonor.scheduleDays = ["Sun"];
    setDonors((current) => [newDonor, ...current]);
    setDonorPreview(newDonor);
    event.currentTarget.reset();
  }

  function handleRequestCreation(event) {
    event.preventDefault();
    setRequestFormError("");
    const data = new FormData(event.currentTarget);
    const newRequest = createRequestFromForm(data, requests.length + 1);
    const resolvedArea = resolveArea(newRequest.location);
    if (!resolvedArea) {
      setRequestFormError(`Location must be one of: ${areaOptions.join(", ")}.`);
      return;
    }
    newRequest.location = resolvedArea;
    setRequests((current) => [newRequest, ...current]);

    const matchingDonors = donors.filter(
      (donor) =>
        donor.bloodGroup === newRequest.bloodGroup &&
        normalizeText(donor.area) === normalizeText(newRequest.location) &&
        isDonorAvailableNow(donor)
    );
    if (matchingDonors.length > 0) {
      matchingDonors.forEach((donor) =>
        pushNotification(`Urgent alert sent to ${donor.name} (${donor.bloodGroup}) in ${donor.area} for ${newRequest.id}.`)
      );
    } else {
      pushNotification(`No instantly available nearby donor matched ${newRequest.id} (${newRequest.bloodGroup}, ${newRequest.location}).`);
    }
    event.currentTarget.reset();
  }

  function handleEligibilityCheck(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const age = Number(data.get("age"));
    const weight = Number(data.get("weight"));
    const recentIllness = (data.get("recentIllness") || "no").toString();
    const eligible = age >= 18 && age <= 60 && weight >= 50 && recentIllness === "no";
    setEligibilityResult(
      eligible
        ? "Eligible for donation based on quick check."
        : "Not eligible from quick check (age/weight/recent illness). Please verify medically."
    );
  }

  function handleDonorAction(requestId, action) {
    if (!actingDonor) return;
    if (action === "accept") {
      if (!eligibilityResult || !eligibilityResult.startsWith("Eligible")) {
        pushNotification(`Accept blocked for ${actingDonor.name}. Complete eligibility check first.`);
        return;
      }
      if (!actingDonorRest?.canDonate) {
        pushNotification(`Accept blocked for ${actingDonor.name}. ${actingDonorRest.message}`);
        return;
      }
    }
    setRequests((current) =>
      current.map((request) =>
        request.id === requestId && (request.status === STATUS.OPEN || request.status === STATUS.ACCEPTED)
          ? {
              ...request,
              donorResponse: action === "accept" ? "Accepted" : "Declined",
              acceptedBy: action === "accept" ? actingDonor.name : null,
              status: action === "accept" ? STATUS.ACCEPTED : STATUS.OPEN
            }
          : request
      )
    );

    if (action === "accept") {
      const donatedOn = new Date().toISOString().slice(0, 10);
      setDonors((current) =>
        current.map((donor) =>
          donor.id === actingDonorId ? { ...donor, donationHistory: [donatedOn, ...donor.donationHistory] } : donor
        )
      );
      setEligibilityResult(null);
    }
  }

  function handleRequesterClose(requestId, nextStatus) {
    setRequests((current) =>
      current.map((request) =>
        request.id === requestId && (request.status === STATUS.OPEN || request.status === STATUS.ACCEPTED)
          ? { ...request, status: nextStatus }
          : request
      )
    );
  }

  return (
    <main className="blood-page">
      <section className="blood-hero">
        <div className="container blood-hero-grid">
          <div>
            <p className="mini">Blood Donation</p>
            <h1>Register donors, raise emergency requests, and track responses.</h1>
            <p>Frontend-only demo flow for donor registration, donor search, request response, and case closure.</p>
          </div>
          <div className="blood-kpi">
            <article>
              <strong>{donors.length}</strong>
              <span>Registered donors</span>
            </article>
            <article>
              <strong>{openRequests}</strong>
              <span>Open requests</span>
            </article>
            <article>
              <strong>{availableNowCount}</strong>
              <span>Available now (by schedule)</span>
            </article>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container blood-grid">
          <DonorRegistrationForm onSubmit={handleDonorRegistration} donorPreview={donorPreview} error={donorFormError} />
          <DonorSearchPanel
            donors={filteredDonors}
            searchBloodGroup={searchBloodGroup}
            setSearchBloodGroup={setSearchBloodGroup}
            searchArea={searchArea}
            setSearchArea={setSearchArea}
          />
        </div>
      </section>

      <section className="section blood-request-section">
        <div className="container blood-grid">
          <RequestCreationForm onSubmit={handleRequestCreation} error={requestFormError} />
          <RequestBoard
            donors={donors}
            requests={requests}
            actingDonorId={actingDonorId}
            setActingDonorId={setActingDonorId}
            actingDonor={actingDonor}
            actingDonorRest={actingDonorRest}
            eligibilityResult={eligibilityResult}
            onEligibilityCheck={handleEligibilityCheck}
            onDonorAction={handleDonorAction}
            onRequesterClose={handleRequesterClose}
            notifications={notifications}
            nowMs={nowMs}
          />
        </div>
      </section>
    </main>
  );
}

function RequestCreationForm({ onSubmit, error }) {
  return (
    <form className="blood-panel" onSubmit={onSubmit}>
      <p className="mini">Emergency request</p>
      <h2>Create blood request</h2>
      <div className="blood-form-grid">
        <label>
          <span>Patient name</span>
          <input name="patient" placeholder="Patient full name" required />
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
          <span>Hospital</span>
          <input name="hospital" placeholder="Hospital name" required />
        </label>
        <label>
          <span>Urgency level</span>
          <select name="urgency" required>
            {urgencyOptions.map((urgency) => (
              <option value={urgency} key={urgency}>
                {urgency}
              </option>
            ))}
          </select>
        </label>
        <label className="wide-field">
          <span>Location</span>
          <input name="location" placeholder="Mirpur / Uttara / Dhanmondi" required />
        </label>
      </div>
      <button className="btn btn-primary" type="submit">
        Create Request
      </button>
      {error ? <InfoNote variant="error">{error}</InfoNote> : null}
      <p className="sub-note">Each request auto-expires after 48 hours if no donor response.</p>
    </form>
  );
}

export default BloodDonationPage;
