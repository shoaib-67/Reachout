const tabConfigs = {
  person: {
    placeholder: "Name, age, last seen location",
    searchLabel: "Search Person Lost"
  },
  goods: {
    placeholder: "Phone, wallet, bag, documents...",
    searchLabel: "Search Goods Lost"
  },
  blood: {
    placeholder: "Blood group, hospital, urgency",
    searchLabel: "Search Blood Donation"
  }
};

const tabs = document.querySelectorAll(".search-tab");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");

function applySearchMode(mode) {
  const config = tabConfigs[mode];
  if (!config || !searchInput || !searchBtn) {
    return;
  }

  searchInput.placeholder = config.placeholder;
  searchBtn.setAttribute("aria-label", config.searchLabel);
}

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((node) => node.classList.remove("active"));
    tab.classList.add("active");
    applySearchMode(tab.dataset.mode);
  });
});

applySearchMode("person");

const testiCards = document.querySelectorAll(".testi-card");
const prevBtn = document.getElementById("prevTesti");
const nextBtn = document.getElementById("nextTesti");
let testiIndex = 0;
let autoRotateTimer;

function showTestimonial(index) {
  if (testiCards.length === 0) {
    return;
  }

  testiCards.forEach((card) => card.classList.remove("active"));
  testiIndex = (index + testiCards.length) % testiCards.length;
  testiCards[testiIndex].classList.add("active");
}

function restartAutoRotate() {
  if (autoRotateTimer) {
    clearInterval(autoRotateTimer);
  }

  if (testiCards.length > 1) {
    autoRotateTimer = setInterval(() => {
      showTestimonial(testiIndex + 1);
    }, 4200);
  }
}

if (prevBtn) {
  prevBtn.addEventListener("click", () => {
    showTestimonial(testiIndex - 1);
    restartAutoRotate();
  });
}

if (nextBtn) {
  nextBtn.addEventListener("click", () => {
    showTestimonial(testiIndex + 1);
    restartAutoRotate();
  });
}

showTestimonial(0);
restartAutoRotate();

const counters = document.querySelectorAll(".counter");

function animateCounter(node) {
  const target = Number(node.dataset.target);
  if (!target) {
    return;
  }

  let current = 0;
  const increment = Math.max(1, Math.ceil(target / 40));

  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }
    node.textContent = current.toString();
  }, 35);
}

if ("IntersectionObserver" in window) {
  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach((counter) => counterObserver.observe(counter));
} else {
  counters.forEach((counter) => animateCounter(counter));
}

const yearNode = document.getElementById("year");
if (yearNode) {
  yearNode.textContent = new Date().getFullYear().toString();
}

const lostOptionCard = document.getElementById("lostOptionCard");
const lostToggleBtn = document.getElementById("lostToggleBtn");
const lostOptionMenu = document.getElementById("lostOptionMenu");

function setLostOptionMenu(open) {
  if (!lostOptionCard || !lostToggleBtn || !lostOptionMenu) {
    return;
  }

  lostOptionMenu.hidden = !open;
  lostOptionCard.classList.toggle("open", open);
  lostToggleBtn.setAttribute("aria-expanded", String(open));
}

if (lostOptionCard && lostToggleBtn && lostOptionMenu) {
  lostToggleBtn.addEventListener("click", () => {
    const isOpen = lostToggleBtn.getAttribute("aria-expanded") === "true";
    setLostOptionMenu(!isOpen);
  });

  document.addEventListener("click", (event) => {
    if (!lostOptionCard.contains(event.target)) {
      setLostOptionMenu(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setLostOptionMenu(false);
    }
  });
}
