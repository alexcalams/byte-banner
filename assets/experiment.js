(() => {
  const DOCS_PATH = "/docs/overview/capabilities/text-to-speech?embed=1";
  const MOBILE_WIDTH = 390;

  const VARIANTS = [
    { id: "none", name: "Control", desc: "No CTA (baseline)" },
    { id: "A", name: "A · Above-the-fold banner", desc: "Inline under the H1" },
    { id: "B", name: "B · Sticky bottom bar", desc: "Persistent, dismissible" },
    { id: "C", name: "C · Scroll-depth card", desc: "Slides in past 40% depth" },
    { id: "D", name: "D · Inline mid-content", desc: "In the reading flow" },
  ];

  const ICONS = {
    flask: `<svg class="exp-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2v7.5L4.5 19a2 2 0 0 0 1.7 3h11.6a2 2 0 0 0 1.7-3L14 9.5V2M8.5 2h7M7 16h10"/></svg>`,
    chevron: `<svg class="exp-icon exp-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>`,
    terminal: `<svg class="exp-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m4 17 6-6-6-6M12 19h8"/></svg>`,
    arrow: `<svg class="exp-icon exp-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>`,
    x: `<svg class="exp-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>`,
    check: `<svg class="exp-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`,
    desktop: `<svg class="exp-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="3" rx="2"/><path d="M8 21h8M12 17v4"/></svg>`,
    mobile: `<svg class="exp-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="20" x="5" y="2" rx="2"/><path d="M12 18h.01"/></svg>`,
    sun: `<svg class="exp-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>`,
    moon: `<svg class="exp-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`,
  };

  const isShell = document.body?.classList?.contains("exp-viewer");
  const isEmbed =
    !isShell &&
    (window.parent !== window || /(?:\?|&)embed=1(?:&|$)/.test(location.search));

  const state = {
    variant: "A",
    device: "desktop",
    theme: "light",
    panelOpen: true,
    scrollDepth: 0,
    dismissedB: false,
    dismissedC: false,
    revealedC: false,
  };

  const nodes = {
    panel: null,
    scrollValue: null,
    scrollFill: null,
    deviceMeta: null,
    stage: null,
    iframe: null,
    slotA: null,
    stickyB: null,
    scrollC: null,
    slotD: null,
  };

  function logClick(variant) {
    console.log("[experiment] docs_cta_click", { variant });
  }

  function iconTile(inner) {
    return `<div class="exp-icon-tile">${inner}</div>`;
  }

  function primaryButton(label, variantId, extraClass = "") {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `exp-btn-primary ${extraClass}`.trim();
    btn.innerHTML = `${label}${ICONS.arrow}`;
    btn.addEventListener("click", () => logClick(variantId));
    return btn;
  }

  function dismissButton(onClick) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "exp-dismiss";
    btn.setAttribute("aria-label", "Dismiss");
    btn.innerHTML = ICONS.x;
    btn.addEventListener("click", onClick);
    return btn;
  }

  function postToPreview(payload) {
    const win = nodes.iframe?.contentWindow;
    if (win) win.postMessage({ source: "cta-experiment", ...payload }, "*");
  }

  function postToParent(payload) {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ source: "cta-experiment", ...payload }, "*");
    }
  }

  function buildPanel(mount) {
    const panel = document.createElement("div");
    panel.className = "exp-panel exp-reset";
    panel.innerHTML = `
      <button type="button" class="exp-panel-toggle" data-exp="toggle">
        <span style="color:var(--exp-emerald-400);display:inline-flex">${ICONS.flask}</span>
        <span class="exp-panel-title">
          CTA Experiments
          <span class="exp-panel-pill">Alex Calams</span>
        </span>
        ${ICONS.chevron}
      </button>
      <div class="exp-panel-body">
        <div class="exp-device">
          <div class="exp-label">Viewport</div>
          <div class="exp-device-toggle" data-exp="devices">
            <button type="button" class="exp-device-btn active" data-device="desktop">
              ${ICONS.desktop}<span style="margin-left:0.35rem">Desktop</span>
            </button>
            <button type="button" class="exp-device-btn" data-device="mobile">
              ${ICONS.mobile}<span style="margin-left:0.35rem">Mobile</span>
            </button>
          </div>
          <p class="exp-device-meta" data-exp="device-meta">Full-width preview</p>
        </div>
        <div class="exp-theme">
          <div class="exp-label">Theme</div>
          <div class="exp-device-toggle" data-exp="themes">
            <button type="button" class="exp-device-btn active" data-theme="light">
              ${ICONS.sun}<span style="margin-left:0.35rem">Light</span>
            </button>
            <button type="button" class="exp-device-btn" data-theme="dark">
              ${ICONS.moon}<span style="margin-left:0.35rem">Dark</span>
            </button>
          </div>
        </div>
        <div class="exp-label">Active variant</div>
        <div class="exp-variants" data-exp="variants"></div>
        <div class="exp-scroll-meta">
          <div class="exp-scroll-row">
            <span>Scroll depth</span>
            <span class="exp-scroll-value" data-exp="scroll-value">0%</span>
          </div>
          <div class="exp-scroll-track">
            <div class="exp-scroll-fill" data-exp="scroll-fill"></div>
          </div>
        </div>
      </div>
    `;

    const variantsEl = panel.querySelector('[data-exp="variants"]');
    for (const v of VARIANTS) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "exp-variant";
      btn.dataset.id = v.id;
      btn.innerHTML = `<strong>${v.name}</strong><span>${v.desc}</span>`;
      btn.addEventListener("click", () => setVariant(v.id));
      variantsEl.appendChild(btn);
    }

    panel.querySelectorAll("[data-device]").forEach((btn) => {
      btn.addEventListener("click", () => setDevice(btn.dataset.device));
    });

    panel.querySelectorAll("[data-theme]").forEach((btn) => {
      btn.addEventListener("click", () => setTheme(btn.dataset.theme));
    });

    panel.querySelector('[data-exp="toggle"]').addEventListener("click", () => {
      state.panelOpen = !state.panelOpen;
      panel.classList.toggle("collapsed", !state.panelOpen);
    });

    nodes.panel = panel;
    nodes.scrollValue = panel.querySelector('[data-exp="scroll-value"]');
    nodes.scrollFill = panel.querySelector('[data-exp="scroll-fill"]');
    nodes.deviceMeta = panel.querySelector('[data-exp="device-meta"]');

    (mount || document.documentElement).appendChild(panel);
    syncPanelActive();
    syncDeviceUI();
    syncThemeUI();
  }

  function syncPanelActive() {
    if (!nodes.panel) return;
    nodes.panel.querySelectorAll(".exp-variant").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.id === state.variant);
    });
  }

  function syncDeviceUI() {
    if (!nodes.panel) return;
    nodes.panel.querySelectorAll("[data-device]").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.device === state.device);
    });
    if (nodes.stage) nodes.stage.dataset.device = state.device;
    if (nodes.deviceMeta) {
      nodes.deviceMeta.textContent =
        state.device === "mobile"
          ? `Mobile preview · ${MOBILE_WIDTH}px`
          : "Full-width preview";
    }
  }

  function setDevice(device) {
    if (device !== "desktop" && device !== "mobile") return;
    if (state.device === device) return;
    state.device = device;
    syncDeviceUI();
  }

  function syncThemeUI() {
    if (!nodes.panel) return;
    nodes.panel.querySelectorAll("[data-theme]").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.theme === state.theme);
    });
  }

  function applyDocsTheme(theme) {
    if (theme !== "light" && theme !== "dark") return;
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    root.style.colorScheme = theme;
    try {
      localStorage.setItem("theme", theme);
    } catch (_) {
      /* ignore quota / private mode */
    }
  }

  function setTheme(theme, { fromParent = false } = {}) {
    if (theme !== "light" && theme !== "dark") return;
    if (state.theme === theme && fromParent) {
      if (!isShell) applyDocsTheme(theme);
      return;
    }
    if (state.theme === theme) return;
    state.theme = theme;
    syncThemeUI();

    if (isShell && !fromParent) {
      postToPreview({ type: "setTheme", theme });
      return;
    }

    applyDocsTheme(theme);
  }

  function buildCTA_A() {
    const wrap = document.createElement("div");
    wrap.className = "exp-slot-a exp-reset";
    wrap.dataset.expSlot = "A";

    const card = document.createElement("div");
    card.className = "exp-cta-card exp-cta-a";
    card.innerHTML = `
      <div class="exp-cta-row">
        ${iconTile(ICONS.terminal)}
        <div>
          <div class="exp-cta-title">Start building with the API in minutes</div>
          <p class="exp-cta-sub">10,000 free credits per month. No credit card required.</p>
        </div>
      </div>
    `;
    card.appendChild(primaryButton("Get your free API key", "A_inline_hero", "shrink-0"));
    wrap.appendChild(card);
    nodes.slotA = wrap;
    return wrap;
  }

  function buildCTA_B() {
    const bar = document.createElement("div");
    bar.className = "exp-sticky-b exp-reset";
    bar.dataset.expSlot = "B";
    bar.innerHTML = `
      <div class="exp-sticky-b-inner">
        ${iconTile(ICONS.terminal)}
        <div class="exp-copy">
          <div class="exp-cta-title">Ready to try Text to Speech in your own app?</div>
          <p class="exp-cta-sub">Create a free account and generate your first audio in under a minute.</p>
        </div>
        <div class="exp-sticky-b-actions"></div>
      </div>
    `;
    const actions = bar.querySelector(".exp-sticky-b-actions");
    actions.appendChild(primaryButton("Get your free API key", "B_sticky_bar", "shrink-0"));
    actions.appendChild(
      dismissButton(() => {
        state.dismissedB = true;
        renderCTAs();
      })
    );
    nodes.stickyB = bar;
    if (typeof ResizeObserver !== "undefined") {
      const ro = new ResizeObserver(() => syncHelpWidgetRaise());
      ro.observe(bar);
    }
    return bar;
  }

  function buildCTA_C() {
    const card = document.createElement("div");
    card.className = "exp-scroll-c exp-reset hidden-anim";
    card.dataset.expSlot = "C";
    card.innerHTML = `
      <div class="exp-dismiss-abs"></div>
      ${iconTile(ICONS.terminal)}
      <div class="exp-cta-title" style="margin-top:0.75rem">Still reading? Try it live.</div>
      <p class="exp-cta-sub" style="margin-top:0.25rem">Skip the setup. Run this exact TTS example against your own key - free tier included.</p>
      <div class="exp-code"><span class="muted">$ </span><span class="cmd">curl -X POST </span><span class="accent">api.elevenlabs.io/v1/text-to-speech</span></div>
    `;
    card.querySelector(".exp-dismiss-abs").appendChild(
      dismissButton(() => {
        state.dismissedC = true;
        renderCTAs();
      })
    );
    card.appendChild(primaryButton("Get your free API key", "C_scroll_card", "full"));
    nodes.scrollC = card;
    return card;
  }

  function buildCTA_D() {
    const wrap = document.createElement("div");
    wrap.className = "exp-slot-d exp-reset";
    wrap.dataset.expSlot = "D";

    const card = document.createElement("div");
    card.className = "exp-cta-card exp-cta-d";

    const left = document.createElement("div");
    left.className = "exp-cta-d-copy";
    left.innerHTML = `
      ${iconTile(ICONS.terminal)}
      <div class="exp-cta-title">Put this into production today</div>
      <p class="exp-cta-sub">Everything above is available on the free tier. Grab a key and ship your first voice feature this afternoon.</p>
      <ul class="exp-cta-d-list">
        <li>${ICONS.check}<span>10,000 free credits every month</span></li>
        <li>${ICONS.check}<span>70+ languages, 10,000+ voices</span></li>
        <li>${ICONS.check}<span>Copy-paste SDKs for Python &amp; JS</span></li>
      </ul>
    `;
    card.appendChild(left);
    card.appendChild(primaryButton("Get your free API key", "D_inline_mid"));
    wrap.appendChild(card);
    nodes.slotD = wrap;
    return wrap;
  }

  function findArticleRoot() {
    return (
      document.querySelector("article") ||
      document.querySelector("main") ||
      document.querySelector('[class*="markdown"]') ||
      document.body
    );
  }

  function findPageH1() {
    return (
      [...document.querySelectorAll("h1")].find((h) =>
        /text to speech/i.test(h.textContent || "")
      ) || document.querySelector("article h1, main h1, h1")
    );
  }

  function findHeroAnchor() {
    const h1 = findPageH1();
    if (!h1) return null;

    const header = h1.closest("header");
    if (header && header.parentElement) {
      return { parent: header.parentElement, after: header };
    }

    let node = h1.parentElement;
    while (node && node !== document.body) {
      const cls = (node.className || "").toString();
      const isRow =
        cls.includes("flex-row") ||
        getComputedStyle(node).flexDirection === "row";
      if (isRow && node.parentElement) {
        node = node.parentElement;
        continue;
      }
      break;
    }
    if (!node) return null;
    const cluster = [...node.children].find((c) => c.contains(h1));
    return { parent: node, after: cluster || h1 };
  }

  function findMidAnchor() {
    const headings = [...document.querySelectorAll("h2, h3")];
    const voiceOptions = headings.find((h) =>
      /voice options/i.test(h.textContent || "")
    );

    // Prefer the "Supported output formats" accordion under Voice options.
    const formatAccordion = [...document.querySelectorAll(".fern-accordion, details, [class*='accordion']")].find(
      (el) => /supported output formats/i.test(el.textContent || "")
    );
    if (formatAccordion?.parentElement) {
      return { parent: formatAccordion.parentElement, after: formatAccordion };
    }

    // Fallback: first accordion-like block after the Voice options heading.
    if (voiceOptions?.parentElement) {
      let node = voiceOptions.nextElementSibling;
      while (node) {
        const cls = (node.className || "").toString();
        const text = node.textContent || "";
        if (
          /supported output formats/i.test(text) ||
          cls.includes("accordion") ||
          node.tagName === "DETAILS"
        ) {
          return { parent: node.parentElement, after: node };
        }
        if (/^H[1-6]$/.test(node.tagName)) break;
        node = node.nextElementSibling;
      }
      return { parent: voiceOptions.parentElement, after: voiceOptions };
    }

    const voiceQuality = headings.find((h) =>
      /voice quality/i.test(h.textContent || "")
    );
    if (voiceQuality) {
      return { parent: voiceQuality.parentElement, before: voiceQuality };
    }

    const faq = headings.find((h) => /^faq$/i.test((h.textContent || "").trim()));
    if (faq) return { parent: faq.parentElement, before: faq };
    const article = findArticleRoot();
    return { parent: article, before: null };
  }

  function ensureCtasMounted() {
    if (!nodes.slotA) buildCTA_A();
    if (!nodes.stickyB) buildCTA_B();
    if (!nodes.scrollC) buildCTA_C();
    if (!nodes.slotD) buildCTA_D();
  }

  function clearInlineSlots() {
    document.querySelectorAll("[data-exp-slot='A'], [data-exp-slot='D']").forEach((el) => {
      el.remove();
    });
    nodes.slotA = null;
    nodes.slotD = null;
  }

  function placeInlineA() {
    if (state.variant !== "A") return;
    const anchor = findHeroAnchor();
    if (!anchor || !anchor.parent) return;
    const el = buildCTA_A();
    if (anchor.after && anchor.after.parentElement === anchor.parent) {
      anchor.after.insertAdjacentElement("afterend", el);
    } else {
      anchor.parent.insertBefore(el, anchor.parent.firstChild);
    }
  }

  function placeInlineD() {
    if (state.variant !== "D") return;
    const anchor = findMidAnchor();
    if (!anchor || !anchor.parent) return;
    const el = buildCTA_D();
    if (anchor.after && anchor.after.parentElement === anchor.parent) {
      anchor.after.insertAdjacentElement("afterend", el);
    } else if (anchor.before && anchor.before.parentElement === anchor.parent) {
      anchor.parent.insertBefore(el, anchor.before);
    } else {
      anchor.parent.appendChild(el);
    }
  }

  function syncHelpWidgetRaise() {
    const host = document.querySelector("elevenlabs-convai");
    if (!host) return;

    // Keep agent under Fern search / mobile menu overlays.
    const overlayOpen = document.documentElement.classList.contains(
      "exp-chrome-overlay-open"
    );
    host.style.setProperty("z-index", overlayOpen ? "10" : "40", "important");

    const raised =
      state.variant === "B" && !state.dismissedB && nodes.stickyB?.isConnected;

    if (raised) {
      const barH = Math.round(nodes.stickyB.getBoundingClientRect().height) || 76;
      const gap = 12;
      host.style.setProperty("bottom", `${barH + gap}px`);
      if (!/bottom/.test(host.style.transition || "")) {
        const existing = host.style.transition || "right 0.5s ease-out";
        host.style.transition = `${existing}, bottom 0.3s ease`;
      }
    } else {
      host.style.removeProperty("bottom");
    }
  }

  function isChromeOverlayOpen() {
    if (document.querySelector('[role="dialog"][data-state="open"]')) return true;
    if (document.querySelector("[data-radix-dialog-overlay]")) return true;
    if (document.querySelector('[data-vaul-drawer][data-state="open"]')) return true;

    const searchBtn = document.getElementById("fern-search-button");
    if (
      searchBtn &&
      (searchBtn.getAttribute("aria-expanded") === "true" ||
        searchBtn.getAttribute("data-state") === "open")
    ) {
      return true;
    }

    // Mobile hamburger → X means the nav sheet is open (Fern keeps this in-header).
    const menuBtn = document.querySelector(".fern-header-mobile-menu-button button");
    if (menuBtn) {
      const label = menuBtn.getAttribute("aria-label") || "";
      if (/close/i.test(label)) return true;
      if (menuBtn.querySelector(".lucide-x, svg.lucide-x")) return true;
      if (
        menuBtn.getAttribute("aria-expanded") === "true" ||
        menuBtn.getAttribute("data-state") === "open"
      ) {
        return true;
      }
    }

    // Fern mobile nav reuses #fern-sidebar as an overlay sheet.
    const sidebar = document.getElementById("fern-sidebar");
    if (sidebar) {
      const viewport = (sidebar.getAttribute("data-viewport") || "").toLowerCase();
      if (viewport && viewport !== "desktop") return true;
      const state = (sidebar.getAttribute("data-state") || "").toLowerCase();
      if (state === "open" || state === "opened" || state === "visible") return true;
      if (
        sidebar.classList.contains("open") ||
        sidebar.classList.contains("is-open") ||
        sidebar.dataset.open === "true"
      ) {
        return true;
      }
      // Heuristic: on small screens, a near-fullscreen fixed/absolute sidebar is open.
      if (window.innerWidth < 1024) {
        const style = getComputedStyle(sidebar);
        const rect = sidebar.getBoundingClientRect();
        const covers =
          rect.width > window.innerWidth * 0.55 &&
          rect.height > window.innerHeight * 0.55 &&
          rect.left < window.innerWidth * 0.2;
        const shown =
          style.display !== "none" &&
          style.visibility !== "hidden" &&
          style.opacity !== "0" &&
          (style.position === "fixed" || style.position === "absolute" || covers);
        if (covers && shown) return true;
      }
    }

    for (const portal of document.querySelectorAll("[data-radix-portal]")) {
      const dialog = portal.querySelector(
        '[role="dialog"], [cmdk-dialog], [data-radix-dialog-content]'
      );
      if (!dialog) continue;
      const rect = dialog.getBoundingClientRect();
      if (rect.width > 80 && rect.height > 80) return true;
    }

    return false;
  }

  function syncChromeOverlayStack() {
    const open = isChromeOverlayOpen();
    document.documentElement.classList.toggle("exp-chrome-overlay-open", open);

    // Ensure the mobile sidebar sheet stacks above the agent while open.
    const sidebar = document.getElementById("fern-sidebar");
    if (sidebar) {
      if (open && window.innerWidth < 1024) {
        sidebar.style.setProperty("z-index", "100000", "important");
      } else {
        sidebar.style.removeProperty("z-index");
      }
    }

    syncHelpWidgetRaise();
  }

  function renderCTAs() {
    ensureCtasMounted();
    clearInlineSlots();

    if (nodes.stickyB?.isConnected) nodes.stickyB.remove();
    if (nodes.scrollC?.isConnected) nodes.scrollC.remove();

    if (state.variant === "B" && !state.dismissedB) {
      document.documentElement.appendChild(nodes.stickyB);
    }

    if (state.variant === "C" && !state.dismissedC) {
      document.documentElement.appendChild(nodes.scrollC);
      nodes.scrollC.classList.toggle("visible-anim", state.revealedC);
      nodes.scrollC.classList.toggle("hidden-anim", !state.revealedC);
    }

    placeInlineA();
    placeInlineD();
    syncPanelActive();
    requestAnimationFrame(syncHelpWidgetRaise);
  }

  function setVariant(id, { fromParent = false } = {}) {
    if (!VARIANTS.some((v) => v.id === id)) return;
    if (state.variant === id && fromParent) {
      // Still re-render when parent re-sends after iframe reload.
      renderCTAs();
      return;
    }
    if (state.variant === id) return;

    state.variant = id;
    state.dismissedB = false;
    state.dismissedC = false;
    if (id !== "C") state.revealedC = state.scrollDepth >= 40;

    if (isShell) {
      syncPanelActive();
      // On real phones, tuck the lab away after a choice so docs stay readable.
      if (isNativePhone() && nodes.panel && state.panelOpen) {
        state.panelOpen = false;
        nodes.panel.classList.add("collapsed");
      }
      postToPreview({ type: "setVariant", variant: id });
      return;
    }

    renderCTAs();
  }

  function applyScrollDepth(depth) {
    state.scrollDepth = depth;
    if (nodes.scrollValue) nodes.scrollValue.textContent = `${depth}%`;
    if (nodes.scrollFill) nodes.scrollFill.style.width = `${depth}%`;
  }

  function updateScroll() {
    const el = document.documentElement;
    const max = el.scrollHeight - window.innerHeight;
    const depth = max > 0 ? Math.min(100, Math.round((window.scrollY / max) * 100)) : 0;
    applyScrollDepth(depth);
    postToParent({ type: "scroll", depth });

    if (state.variant === "C" && !state.dismissedC && depth >= 40 && !state.revealedC) {
      state.revealedC = true;
      if (nodes.scrollC) {
        nodes.scrollC.classList.add("visible-anim");
        nodes.scrollC.classList.remove("hidden-anim");
      }
    }
  }

  function isNativePhone() {
    return window.matchMedia("(max-width: 720px)").matches;
  }

  function syncPhoneShellClass() {
    document.body.classList.toggle("exp-viewer--phone", isNativePhone());
  }

  function bootShell() {
    nodes.stage = document.querySelector(".exp-viewer-stage");
    nodes.iframe = document.getElementById("exp-preview");
    const host = document.getElementById("exp-panel-host");

    // On a real phone, start with the lab collapsed so docs are full-bleed.
    if (isNativePhone()) {
      state.panelOpen = false;
      state.device = "mobile";
    }
    syncPhoneShellClass();

    buildPanel(host);
    if (!state.panelOpen && nodes.panel) {
      nodes.panel.classList.add("collapsed");
    }
    syncDeviceUI();

    const mq = window.matchMedia("(max-width: 720px)");
    const onViewportChange = () => syncPhoneShellClass();
    if (mq.addEventListener) mq.addEventListener("change", onViewportChange);
    else mq.addListener(onViewportChange);

    window.addEventListener("message", (event) => {
      const data = event.data;
      if (!data || data.source !== "cta-experiment") return;
      if (data.type === "scroll") applyScrollDepth(data.depth);
      if (data.type === "ready") {
        postToPreview({ type: "setVariant", variant: state.variant });
        postToPreview({ type: "setTheme", theme: state.theme });
      }
    });

    nodes.iframe?.addEventListener("load", () => {
      postToPreview({ type: "setVariant", variant: state.variant });
      postToPreview({ type: "setTheme", theme: state.theme });
    });
  }

  function detectDocsTheme() {
    const root = document.documentElement;
    if (root.classList.contains("dark")) return "dark";
    if (root.classList.contains("light")) return "light";
    try {
      const stored = localStorage.getItem("theme");
      if (stored === "dark" || stored === "light") return stored;
      if (stored === "system") {
        return window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
      }
    } catch (_) {
      /* ignore */
    }
    return "light";
  }

  function bootDocs() {
    // Direct docs visit (not in shell): show floating panel + CTAs.
    if (!isEmbed) buildPanel(document.documentElement);
    state.theme = detectDocsTheme();
    syncThemeUI();
    applyDocsTheme(state.theme);
    renderCTAs();
    updateScroll();
    syncChromeOverlayStack();

    window.addEventListener("scroll", updateScroll, { passive: true });
    window.addEventListener(
      "resize",
      () => {
        updateScroll();
        syncHelpWidgetRaise();
        syncChromeOverlayStack();
      },
      { passive: true }
    );
    document.addEventListener("click", () => {
      // Search / menu open asynchronously after the click.
      requestAnimationFrame(() => {
        syncChromeOverlayStack();
        setTimeout(syncChromeOverlayStack, 50);
        setTimeout(syncChromeOverlayStack, 200);
      });
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" || event.key === "/" || event.key === "k") {
        requestAnimationFrame(syncChromeOverlayStack);
        setTimeout(syncChromeOverlayStack, 50);
      }
    });

    if (isEmbed) {
      window.addEventListener("message", (event) => {
        const data = event.data;
        if (!data || data.source !== "cta-experiment") return;
        if (data.type === "setVariant") setVariant(data.variant, { fromParent: true });
        if (data.type === "setTheme") setTheme(data.theme, { fromParent: true });
      });
      postToParent({ type: "ready" });
    }

    const mo = new MutationObserver(() => {
      if (state.variant === "A" && !document.querySelector("[data-exp-slot='A']")) {
        placeInlineA();
      }
      if (state.variant === "D" && !document.querySelector("[data-exp-slot='D']")) {
        placeInlineD();
      }
      if (!isEmbed && nodes.panel && !document.querySelector(".exp-panel")) {
        document.documentElement.appendChild(nodes.panel);
      }
      syncHelpWidgetRaise();
      syncChromeOverlayStack();
    });
    mo.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["data-state", "aria-expanded", "class", "style"],
    });

    let tries = 0;
    const timer = setInterval(() => {
      tries += 1;
      if (state.variant === "A" || state.variant === "D") renderCTAs();
      syncHelpWidgetRaise();
      syncChromeOverlayStack();
      if (tries >= 10) clearInterval(timer);
    }, 500);
  }

  function boot() {
    if (isShell) bootShell();
    else bootDocs();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
