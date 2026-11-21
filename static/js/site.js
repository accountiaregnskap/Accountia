// Close the mobile menu and language dropdown when navigating.
// Helps avoid the "curtain/drawer" staying open after switching language on some browsers.
document.addEventListener("DOMContentLoaded", () => {
  const guide = document.querySelector(".service-guide");
  if (guide) {
    const toolbar = guide.querySelector(".guide-choices");
    const choices = Array.from(toolbar.querySelectorAll("button"));
    const results = Array.from(guide.querySelectorAll(".guide-result"));
    function select(index) {
      choices.forEach((choice, position) => {
        choice.setAttribute("aria-pressed", String(index === position));
        results[position].hidden = index !== position;
      });
    }
    choices.forEach((choice, index) => choice.addEventListener("click", () => select(index)));
    select(0);
    toolbar.hidden = false;
  }

  const contactData = document.querySelector(".guide-contact-data");
  const message = document.getElementById("message");
  if (contactData && message && !message.value) {
    const selected = new URLSearchParams(location.search).get("behov");
    const match = JSON.parse(contactData.textContent).find(({ id }) => id === selected);
    if (match) message.value = match.message;
  }
});

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
  const send = form.querySelector("button");
  const endpoint = help.dataset.agentEndpoint;
  const { questions, unknown, contact, contactUrl } = JSON.parse(help.querySelector(".customer-chat-topics").textContent);

  function normalize(value) {
    return value.toLocaleLowerCase()
      .normalize("NFD")
      .replace(/\p{M}/gu, "")
      .replace(/æ/g, "ae")
      .replace(/ø/g, "o")
      .replace(/ى/g, "ي")
      .replace(/(^|\s)و(?=ال\p{L}{3,})/gu, "$1و ")
      .replace(/[^\p{L}\p{N}]+/gu, " ")
      .trim();
  }

  const topics = questions.map((topic) => ({
    topic,
    terms: (topic.keywords || []).map(normalize).filter(Boolean)
  }));

  function nearMatch(word, term) {
    if (word.length < 5 || term.length < 5 || Math.abs(word.length - term.length) > 1) return false;
    let offset = 0;
    while (word[offset] === term[offset] && offset < word.length) offset++;
    if (word.length === term.length) {
      return word.slice(offset + 1) === term.slice(offset + 1) ||
        (word[offset] === term[offset + 1] && word[offset + 1] === term[offset] &&
          word.slice(offset + 2) === term.slice(offset + 2));
    }
    const [longer, shorter] = word.length > term.length ? [word, term] : [term, word];
    return longer.slice(offset + 1) === shorter.slice(offset);
  }

  function findAnswer(segment) {
    const normalized = " " + segment + " ";
    const words = segment.split(" ");
    let best = null;
    let bestScore = 0;
    for (const { topic, terms } of topics) {
      let score = 0;
      for (const term of terms) {
        if (normalized.includes(" " + term + " ")) score = Math.max(score, term.includes(" ") ? 5 : 3);
        else if (!term.includes(" ") && words.some((word) => nearMatch(word, term))) score = Math.max(score, 1);
      }
      if (score > bestScore) {
        best = topic;
        bestScore = score;
      }
    }
    return best;
  }

  function findAnswers(query) {
    const normalized = normalize(query);
    const byPart = normalized.split(/\s+(?:og|samt|and|y|و)\s+/u).map(findAnswer).filter(Boolean);
    const answers = [...new Set(byPart)];
    if (answers.length > 1) return answers.slice(0, 2);
    const main = findAnswer(normalized);
    return main ? [main] : [];
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

  async function askAgent(question) {
    if (!endpoint) return null;
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lang: document.documentElement.lang, question }),
        signal: AbortSignal.timeout(14000)
      });
      if (!response.ok) return null;
      const data = await response.json();
      return typeof data?.answer === "string" && data.answer.trim() ? data.answer : null;
    } catch {
      return null;
    }
  }

  form.hidden = false;
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const question = input.value.trim();
    if (!question || send.disabled) return;
    const results = findAnswers(question);
    log.hidden = false;
    addMessage(question, "customer-chat-user");
    input.value = "";
    if (endpoint) {
      send.disabled = true;
      form.setAttribute("aria-busy", "true");
    }
    const answer = await askAgent(question);
    send.disabled = false;
    form.removeAttribute("aria-busy");
    if (answer) {
      addMessage(answer, "customer-chat-answer", contactUrl, contact);
    } else if (results.length) {
      results.forEach(({ answer: text, url, link }) => addMessage(text, "customer-chat-answer", url, link));
    } else {
      addMessage(unknown, "customer-chat-answer", contactUrl, contact);
    }
    while (log.children.length > 12) log.firstElementChild.remove();
    log.scrollTop = log.scrollHeight;
  });
});
