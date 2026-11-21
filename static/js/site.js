document.addEventListener("DOMContentLoaded", () => {
  const featured = document.querySelector(".featured-services");
  if (!featured) return;
  const track = featured.querySelector(".featured-track");
  const controls = featured.querySelector(".featured-controls");
  const slides = Array.from(track.querySelectorAll(".featured-card"));
  const dots = Array.from(controls.querySelectorAll("[data-slide]"));
  const status = controls.querySelector(".featured-status");
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const rtl = getComputedStyle(track).direction === "rtl";
  let active = -1;
  let frame = 0;

  function updateActive() {
    frame = 0;
    const index = Math.min(slides.length - 1, Math.round(Math.abs(track.scrollLeft) / track.clientWidth));
    if (active === index || !Number.isFinite(index)) return;
    active = index;
    slides.forEach((slide, position) => {
      const selected = position === active;
      if (!selected && slide.contains(document.activeElement)) track.focus({ preventScroll: true });
      slide.inert = !selected;
      if (selected) dots[position].setAttribute("aria-current", "true");
      else dots[position].removeAttribute("aria-current");
    });
    status.textContent = featured.dataset.summary.replace("{current}", active + 1).replace("{total}", slides.length);
  }

  function select(index) {
    const item = (index + slides.length) % slides.length;
    const left = (rtl ? -1 : 1) * item * track.clientWidth;
    const wrap = index < 0 || index >= slides.length;
    track.scrollTo({ left, behavior: reduceMotion.matches || wrap ? "instant" : "smooth" });
  }

  featured.classList.add("is-slider");
  controls.hidden = false;
  track.tabIndex = 0;
  updateActive();
  track.addEventListener("scroll", () => {
    if (!frame) frame = requestAnimationFrame(updateActive);
  }, { passive: true });
  controls.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;
    if (button.hasAttribute("data-slide")) select(Number(button.dataset.slide));
    else select(active + Number(button.dataset.direction));
  });
  featured.addEventListener("keydown", (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const right = event.key === "ArrowRight";
    select(active + (right === rtl ? -1 : 1));
  });
  if ("ResizeObserver" in window) {
    const resize = new ResizeObserver(updateActive);
    resize.observe(track);
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const catalog = document.querySelector(".accountia-catalog");
  if (!catalog) return;

  const controls = catalog.querySelector(".catalog-controls");
  const search = controls.querySelector('input[type="search"]');
  const views = Array.from(controls.querySelectorAll("button"));
  const entries = Array.from(catalog.querySelectorAll("[data-catalog-item]"));
  const count = catalog.querySelector(".catalog-count");
  const empty = catalog.querySelector(".catalog-empty");
  const normalize = (value) => value.toLocaleLowerCase().normalize("NFKD").replace(/\p{Mark}/gu, "");
  const names = entries.map(entry => normalize(entry.textContent));

  function filter() {
    const words = normalize(search.value).trim().split(/\s+/);
    let visible = 0;
    entries.forEach((entry, index) => {
      const match = words.every(word => names[index].includes(word));
      entry.hidden = !match;
      if (match) visible++;
    });
    count.textContent = count.dataset.count.replace("{shown}", visible).replace("{total}", entries.length);
    empty.hidden = visible !== 0;
  }

  search.addEventListener("input", filter);
  search.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
  });
  views.forEach(button => button.addEventListener("click", () => {
    catalog.dataset.layout = button.dataset.view;
    views.forEach(option => option.setAttribute("aria-pressed", String(option === button)));
  }));
  catalog.querySelector(".industry-jumps")?.addEventListener("click", (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;
    const item = document.getElementById(link.hash.slice(1));
    if (!item?.hidden) return;
    search.value = "";
    filter();
  });
  window.addEventListener("pageshow", filter);
  filter();
  count.hidden = false;
  controls.hidden = false;
});

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
    const requested = new URLSearchParams(location.search).get("behov");
    const index = results.findIndex((result) => result.id === "guide-" + requested);
    select(Math.max(0, index));
    toolbar.hidden = false;
  }

  const contactData = document.querySelector(".guide-contact-data");
  const message = document.getElementById("message");
  const params = new URLSearchParams(location.search);
  if (contactData && message && !message.value && params.get("tilbud") !== "1") {
    const selected = params.get("behov");
    const match = JSON.parse(contactData.textContent).find(({ id }) => id === selected);
    if (match) message.value = match.message;
  }

  const checklist = document.querySelector(".switch-checklist");
  if (checklist) {
    const choices = Array.from(checklist.querySelectorAll('input[type="checkbox"]'));
    const bar = checklist.querySelector(".switch-progress");
    const progress = bar.querySelector("progress");
    const output = bar.querySelector("output");
    function updateCount() {
      const done = choices.filter((choice) => choice.checked).length;
      progress.value = done;
      output.textContent = bar.dataset.count.replace("{done}", done).replace("{total}", choices.length);
    }
    checklist.addEventListener("change", updateCount);
    updateCount();
    bar.hidden = false;
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const month = document.querySelector(".working-month");
  if (!month) return;

  const controls = month.querySelector(".month-controls");
  const buttons = Array.from(controls.querySelectorAll("button"));
  const panels = Array.from(month.querySelectorAll(".month-panel"));
  function showStep(active) {
    buttons.forEach((button, index) => {
      button.setAttribute("aria-pressed", String(index === active));
      panels[index].hidden = index !== active;
    });
    controls.style.setProperty("--month-progress", (active + 1) / buttons.length);
  }

  buttons.forEach((button, index) => button.addEventListener("click", () => showStep(index)));
  showStep(0);
  controls.hidden = false;
});

document.addEventListener("DOMContentLoaded", () => {
  const data = document.querySelector(".quote-data");
  if (!data) return;
  const quote = JSON.parse(data.textContent);
  const makeRows = (params) => {
    const rows = [];
    for (const field of quote.fields) {
      const option = field.options.find(({ id }) => id === params.get(field.name));
      if (option) rows.push([field.label, option.label]);
    }

    const requested = params.getAll("tjeneste");
    const services = quote.options.filter(({ id }) => requested.includes(id)).map(({ label }) => label);
    if (services.length) {
      const list = new Intl.ListFormat(document.documentElement.lang).format(services);
      rows.push([quote.servicesLabel, list]);
    }
    return rows;
  };

  const form = document.querySelector(".quote-form");
  if (form) {
    const empty = form.querySelector(".quote-empty");
    const list = form.querySelector("dl");
    function updateSummary() {
      const rows = makeRows(new FormData(form));
      const details = rows.map(([label, value]) => {
        const row = document.createElement("div");
        const term = document.createElement("dt");
        const definition = document.createElement("dd");
        term.textContent = label;
        definition.textContent = value;
        row.append(term, definition);
        return row;
      });
      list.replaceChildren(...details);
      empty.hidden = details.length !== 0;
      list.hidden = details.length === 0;
    }
    form.addEventListener("change", updateSummary);
    window.addEventListener("pageshow", updateSummary);
    updateSummary();
    form.hidden = false;
  }

  const message = document.querySelector(".contact-form textarea[name='message']");
  const params = new URLSearchParams(location.search);
  if (message && !message.value && params.get("tilbud") === "1") {
    const rows = makeRows(params);
    message.value = [quote.message, ...rows.map(([label, value]) => `${label}: ${value}`)].join("\n");
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector(".brandbar");
  if (!header) return;
  const menus = Array.from(header.querySelectorAll("details")).reverse();
  const closeOutside = ({ target }) => {
    menus.forEach((menu) => {
      if (menu.open && !menu.contains(target)) menu.open = false;
    });
  };
  document.addEventListener("pointerdown", closeOutside);
  document.addEventListener("focusin", closeOutside);
  header.addEventListener("click", (event) => {
    if (event.target.closest("a")) menus.forEach((menu) => { menu.open = false; });
  });
  header.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    const open = menus.find((menu) => menu.open && menu.contains(event.target));
    if (!open) return;
    event.preventDefault();
    open.open = false;
    open.querySelector("summary").focus();
  });
  matchMedia("(min-width: 1061px)").addEventListener("change", () => {
    menus.forEach((menu) => { menu.open = false; });
  });
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) menus.forEach((menu) => { menu.open = false; });
  });
});

document.addEventListener("DOMContentLoaded", () => {
  if (!("IntersectionObserver" in window) || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add("motion-in");
      observer.unobserve(entry.target);
    }
  }, { threshold: 0.04 });
  document.querySelectorAll("[data-reveal]").forEach((section) => observer.observe(section));
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
