// Close the mobile menu and language dropdown when navigating.
// Helps avoid the "curtain/drawer" staying open after switching language on some browsers.
document.addEventListener("DOMContentLoaded", () => {
  const navToggle = document.getElementById("nav-toggle");
  const langDetails = document.querySelector(".lang-dd details");

  const closeAll = () => {
    if (navToggle) navToggle.checked = false;
    if (langDetails) langDetails.removeAttribute("open");
  };

  document.querySelectorAll(".nav a, .lang-dd a").forEach((a) => {
    a.addEventListener("click", () => {
      // close immediately before navigation
      closeAll();
    });
  });

  // Close dropdown if user clicks outside
  document.addEventListener("click", (e) => {
    if (!langDetails) return;
    if (!langDetails.contains(e.target)) {
      langDetails.removeAttribute("open");
    }
  });

  // Close dropdown on Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeAll();
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const help = document.querySelector(".customer-help");
  if (!help) return;

  const toggle = help.querySelector(".customer-help-toggle");
  const closeButton = help.querySelector(".customer-help-close");
  function closeHelp() {
    help.open = false;
    toggle.focus();
  }

  closeButton.hidden = false;
  closeButton.addEventListener("click", closeHelp);
  help.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && help.open) {
      event.preventDefault();
      closeHelp();
    }
  });
  help.querySelector(".customer-help-contact").addEventListener("click", () => {
    help.open = false;
  });
});
