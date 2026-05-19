import React, { useEffect, useMemo, useState } from "react";
import DonorSearchPanel from "../components/blood/DonorSearchPanel";
import RequestBoard from "../components/blood/RequestBoard";
import InfoNote from "../components/blood/InfoNote";
import {
  STATUS,
  areaOptions,
  bloodGroupOptions,
  resolveArea,
  normalizeText,
  restRuleInfo,
  isDonorAvailableNow,
  urgencyOptions
} from "./bloodDonationUtils";
import { incrementUserPostCount } from "../services/userPostStats";
import {
  listBloodDonors,
  listBloodRequests,
  createBloodRequest,
  submitDonorResponse,
  updateBloodRequestStatus
} from "../services/bloodApi";

function BloodDonationPage() {
  const BLOOD_VIEW_STORAGE_KEY = "reachout_blood_active_view";
  const BLOOD_VIEWS = {
    SEARCH: "search",
    EMERGENCY: "emergency",
    STATUS: "status",
    COMMUNITY: "community"
  };

  const [donors, setDonors] = useState([]);
  const [requests, setRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [actingDonorId, setActingDonorId] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [searchBloodGroup, setSearchBloodGroup] = useState("All");
  const [searchArea, setSearchArea] = useState("All");
  const [eligibilityResult, setEligibilityResult] = useState(null);
  const [requestFormError, setRequestFormError] = useState("");
  const [activeBloodView, setActiveBloodView] = useState(() => {
    try {
      const saved = sessionStorage.getItem(BLOOD_VIEW_STORAGE_KEY);
      if (saved && Object.values(BLOOD_VIEWS).includes(saved)) return saved;
    } catch {
      // ignore storage errors
    }
    return BLOOD_VIEWS.SEARCH;
  });
  const [nowMs, setNowMs] = useState(Date.now());

  function getCurrentUserSnapshot() {
    if (currentUser?.email || currentUser?.name) return currentUser;
    try {
      const rawUser = sessionStorage.getItem("reachout_user") || localStorage.getItem("reachout_user");
      return rawUser ? JSON.parse(rawUser) : null;
    } catch {
      return null;
    }
  }

  function getMyPostedRequestIds(email) {
    if (!email) return [];
    try {
      const raw = localStorage.getItem(`reachout_blood_my_requests_${email.toLowerCase()}`);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function saveMyPostedRequestId(email, requestId) {
    if (!email || !requestId) return;
    const key = `reachout_blood_my_requests_${email.toLowerCase()}`;
    const current = getMyPostedRequestIds(email);
    const next = Array.from(new Set([requestId, ...current])).slice(0, 200);
    localStorage.setItem(key, JSON.stringify(next));
  }

  const donorById = useMemo(() => Object.fromEntries(donors.map((donor) => [donor.id, donor])), [donors]);
  const actingDonor = donorById[actingDonorId];
  const actingDonorRest = actingDonor ? restRuleInfo(actingDonor) : null;
  const openRequests = requests.filter((request) => request.status === STATUS.OPEN).length;
  const availableNowCount = donors.filter((donor) => isDonorAvailableNow(donor) && restRuleInfo(donor).canDonate).length;

  useEffect(() => {
    const timer = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(BLOOD_VIEW_STORAGE_KEY, activeBloodView);
    } catch {
      // ignore storage errors
    }
  }, [activeBloodView]);

  useEffect(() => {
    try {
      const rawUser = sessionStorage.getItem("reachout_user") || localStorage.getItem("reachout_user");
      setCurrentUser(rawUser ? JSON.parse(rawUser) : null);
    } catch {
      setCurrentUser(null);
    }
  }, []);

  useEffect(() => {
    async function loadBloodData() {
      try {
        const [donorRes, requestRes] = await Promise.all([listBloodDonors(), listBloodRequests()]);
        const loadedDonors = donorRes?.donors || [];
        const loadedRequests = requestRes?.requests || [];
        setDonors(loadedDonors);
        setRequests(loadedRequests);
        setActingDonorId((current) => {
          if (current && loadedDonors.some((donor) => donor.id === current)) return current;
          return loadedDonors[0]?.id || "";
        });
      } catch (error) {
        setRequestFormError(error.message || "Failed to load blood donation data.");
      }
    }

    loadBloodData();
  }, []);

  useEffect(() => {
    const poll = window.setInterval(async () => {
      try {
        const requestRes = await listBloodRequests();
        setRequests(requestRes?.requests || []);
      } catch {
        // Silent polling failure to avoid noisy UI
      }
    }, 10000);
    return () => window.clearInterval(poll);
  }, []);

  const filteredDonors = donors.filter((donor) => {
    const matchGroup = searchBloodGroup === "All" || donor.bloodGroup === searchBloodGroup;
    const matchArea = searchArea === "All" || donor.area === searchArea;
    const eligibleByRestRule = restRuleInfo(donor).canDonate;
    return matchGroup && matchArea && eligibleByRestRule;
  });
  const communityRequests = useMemo(() => {
    const myEmail = (currentUser?.email || "").toLowerCase();
    const myName = normalizeText(currentUser?.name || "");
    return requests.filter((request) => {
      const isClosed = request.status === STATUS.COMPLETED || request.status === STATUS.CANCELLED;
      if (isClosed) return false;
      const requestEmail = (request.postedByEmail || "").toLowerCase();
      const requestName = normalizeText(request.postedByName || "");
      const isMineByEmail = myEmail && requestEmail === myEmail;
      const isMineByName = !requestEmail && myName && requestName === myName;
      return !(isMineByEmail || isMineByName);
    });
  }, [requests, currentUser?.email, currentUser?.name]);
  const myRequests = useMemo(() => {
    const myEmail = (currentUser?.email || "").toLowerCase();
    const myName = normalizeText(currentUser?.name || "");
    const myIds = getMyPostedRequestIds(myEmail);
    const owned = requests.filter((request) => {
      const requestEmail = (request.postedByEmail || "").toLowerCase();
      const requestName = normalizeText(request.postedByName || "");
      const isMineByEmail = myEmail && requestEmail === myEmail;
      const isMineByName = !requestEmail && myName && requestName === myName;
      const isMineByLocalId = myIds.includes(request.id);
      return Boolean(isMineByEmail || isMineByName || isMineByLocalId);
    });

    const statusRank = {
      [STATUS.OPEN]: 1,
      [STATUS.ACCEPTED]: 2,
      [STATUS.EXPIRED]: 3,
      [STATUS.COMPLETED]: 4,
      [STATUS.CANCELLED]: 5
    };

    return owned.sort((a, b) => {
      const rankA = statusRank[a.status] || 99;
      const rankB = statusRank[b.status] || 99;
      if (rankA !== rankB) return rankA - rankB;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [requests, currentUser?.email, currentUser?.name]);

  function pushNotification(text) {
    const notification = { id: `n-${Date.now()}`, text, ts: new Date().toLocaleString() };
    setNotifications((current) => [notification, ...current].slice(0, 8));
  }

  async function handleRequestCreation(event) {
    event.preventDefault();
    const form = event.currentTarget;
    setRequestFormError("");
    const data = new FormData(form);
    const userSnapshot = getCurrentUserSnapshot();
    const payload = {
      patient: (data.get("patient") || "").toString().trim() || "Unknown patient",
      contactPhone: (data.get("contactPhone") || "").toString().trim() || null,
      bloodGroup: (data.get("bloodGroup") || "Unknown").toString(),
      hospital: (data.get("hospital") || "").toString().trim() || "Hospital not provided",
      urgency: (data.get("urgency") || "Medium").toString(),
      location: (data.get("location") || "").toString().trim() || "Location not provided",
      postedByName: userSnapshot?.name || null,
      postedByEmail: userSnapshot?.email || null,
      postedByPhone: userSnapshot?.phone || null
    };

    const resolvedArea = resolveArea(payload.location);
    if (!resolvedArea) {
      setRequestFormError(`Location must be one of: ${areaOptions.join(", ")}.`);
      return;
    }
    payload.location = resolvedArea;

    try {
      const response = await createBloodRequest(payload);
      const newRequest = response?.request;
      if (!newRequest) throw new Error("Server did not return request.");
      setRequests((current) => [newRequest, ...current]);
      if (userSnapshot?.email) {
        saveMyPostedRequestId(userSnapshot.email, newRequest.id);
      }
      incrementUserPostCount("blood");

      const matchingDonors = donors.filter(
        (donor) =>
          donor.bloodGroup === newRequest.bloodGroup &&
          normalizeText(donor.area) === normalizeText(newRequest.location) &&
          isDonorAvailableNow(donor) &&
          restRuleInfo(donor).canDonate
      );
      if (matchingDonors.length > 0) {
        matchingDonors.forEach((donor) =>
          pushNotification(`Urgent alert sent to ${donor.name} (${donor.bloodGroup}) in ${donor.area} for ${newRequest.id}.`)
        );
      } else {
        pushNotification(`No instantly available nearby donor matched ${newRequest.id} (${newRequest.bloodGroup}, ${newRequest.location}).`);
      }
      form.reset();
    } catch (error) {
      setRequestFormError(error.message || "Server error while creating request.");
    }
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

  async function handleDonorAction(requestId, action) {
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

    try {
      const response = await submitDonorResponse(requestId, {
        action,
        donorId: actingDonor.id,
        donorName: actingDonor.name
      });
      const updatedRequest = response?.request;
      if (!updatedRequest) throw new Error("Server did not return request.");

      setRequests((current) => current.map((request) => (request.id === requestId ? updatedRequest : request)));
      if (action === "accept") {
        const donorRes = await listBloodDonors();
        setDonors(donorRes?.donors || []);
        setEligibilityResult(null);
      }
    } catch (error) {
      pushNotification(error.message || "Failed to update donor response.");
    }
  }

  async function handleRequesterClose(requestId, nextStatus) {
    try {
      const response = await updateBloodRequestStatus(requestId, { status: nextStatus });
      const updatedRequest = response?.request;
      if (!updatedRequest) throw new Error("Server did not return request.");
      setRequests((current) => current.map((request) => (request.id === requestId ? updatedRequest : request)));
    } catch (error) {
      pushNotification(error.message || "Failed to update request status.");
    }
  }

  return (
    <main className="blood-page">
      <section className="blood-hero">
        <div className="container blood-hero-grid">
          <div>
            <p className="mini">Blood Donation</p>
            <h1>Register donors, raise emergency requests, and track responses.</h1>
            <p>MySQL-backed flow for donor registration, donor search, request response, and case closure.</p>
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
        <div className="container">
          <div className="blood-option-switcher">
            <button
              className={`blood-option-btn ${activeBloodView === BLOOD_VIEWS.SEARCH ? "active" : ""}`}
              type="button"
              onClick={() => setActiveBloodView(BLOOD_VIEWS.SEARCH)}
            >
              Search Donor
            </button>
            <button
              className={`blood-option-btn ${activeBloodView === BLOOD_VIEWS.EMERGENCY ? "active" : ""}`}
              type="button"
              onClick={() => setActiveBloodView(BLOOD_VIEWS.EMERGENCY)}
            >
              Emergency Request
            </button>
            <button
              className={`blood-option-btn ${activeBloodView === BLOOD_VIEWS.STATUS ? "active" : ""}`}
              type="button"
              onClick={() => setActiveBloodView(BLOOD_VIEWS.STATUS)}
            >
              Request Status
            </button>
            <button
              className={`blood-option-btn ${activeBloodView === BLOOD_VIEWS.COMMUNITY ? "active" : ""}`}
              type="button"
              onClick={() => setActiveBloodView(BLOOD_VIEWS.COMMUNITY)}
            >
              Community Requests
            </button>
          </div>

          <div className="blood-single-panel">
            {activeBloodView === BLOOD_VIEWS.SEARCH ? (
              <DonorSearchPanel
                donors={filteredDonors}
                searchBloodGroup={searchBloodGroup}
                setSearchBloodGroup={setSearchBloodGroup}
                searchArea={searchArea}
                setSearchArea={setSearchArea}
              />
            ) : null}

            {activeBloodView === BLOOD_VIEWS.EMERGENCY ? (
              <RequestCreationForm onSubmit={handleRequestCreation} error={requestFormError} />
            ) : null}

            {activeBloodView === BLOOD_VIEWS.STATUS ? (
              <RequestBoard
                donors={donors}
                requests={myRequests}
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
            ) : null}

            {activeBloodView === BLOOD_VIEWS.COMMUNITY ? <CommunityRequestsPanel requests={communityRequests} /> : null}
          </div>
        </div>
      </section>
    </main>
  );
}

function CommunityRequestsPanel({ requests }) {
  return (
    <div className="blood-panel">
      <div className="blood-panel-heading">
        <div>
          <p className="mini">Community requests</p>
          <h2>Requests posted by other users</h2>
        </div>
        <span>{requests.length} visible</span>
      </div>
      <div className="blood-list">
        {requests.length === 0 ? (
          <p className="empty-state">No other user requests found right now.</p>
        ) : (
          requests.map((request) => (
            <article className="request-card" key={request.id}>
              <div className="request-head">
                <h3>
                  {request.bloodGroup} | {request.patient}
                </h3>
                <strong>{request.id}</strong>
              </div>
              <p>
                Hospital: {request.hospital}
              </p>
              <p>Location: {request.location || "Not provided"}</p>
              <p>Emergency contact phone: {request.contactPhone || "Not provided"}</p>
              {request.postedByName || request.postedByEmail ? (
                <p>
                  Posted by: {request.postedByName || "Unknown"}
                  {request.postedByPhone ? ` | Phone: ${request.postedByPhone}` : " | Phone: Not provided"}
                </p>
              ) : null}
              <div className="request-meta">
                <span className="status-chip">{request.status}</span>
                <span className="status-chip">Urgency: {request.urgency}</span>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
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
          <span>Contact phone</span>
          <input name="contactPhone" placeholder="Phone for urgent call" required />
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
