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

  const form = help.querySelector(".customer-chat-form");
  const log = help.querySelector(".customer-chat-log");
  const input = form.elements.question;
  const { questions, unknown, contact, contactUrl } = JSON.parse(help.querySelector(".customer-chat-topics").textContent);

  function normalize(value) {
    return value.toLocaleLowerCase()
      .normalize("NFD")
      .replace(/\p{M}/gu, "")
      .replace(/[^\p{L}\p{N}]+/gu, " ")
      .trim();
  }

  const topics = questions.map((topic) => ({
    topic,
    terms: (topic.keywords || []).map(normalize).filter(Boolean)
  }));

  function findAnswer(query) {
    const normalized = " " + normalize(query) + " ";
    let best = null;
    let bestScore = 0;
    for (const { topic, terms } of topics) {
      let score = 0;
      for (const term of terms) {
        if (normalized.includes(" " + term + " ")) score += term.includes(" ") ? 3 : 1;
      }
      if (score > bestScore) {
        best = topic;
        bestScore = score;
      }
    }
    return best;
  }

  function addMessage(text, cssClass, url, label) {
    const message = document.createElement("p");
    message.className = cssClass;
    message.append(document.createTextNode(text));
    if (url && label) {
      const link = document.createElement("a");
      link.href = url;
      link.textContent = label;
      message.append(document.createTextNode(" "), link);
    }
    log.append(message);
  }

  form.hidden = false;
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const question = input.value.trim();
    if (!question) return;
    const result = findAnswer(question);
    log.hidden = false;
    addMessage(question, "customer-chat-user");
    addMessage(result?.answer || unknown, "customer-chat-answer", result ? result.url : contactUrl, result ? result.link : contact);
    while (log.children.length > 12) log.firstElementChild.remove();
    log.scrollTop = log.scrollHeight;
    input.value = "";
  });
});
