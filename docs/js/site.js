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
