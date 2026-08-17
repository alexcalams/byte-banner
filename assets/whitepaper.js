(() => {
  const MOBILE_WIDTH = 390;
  const VARIANTS = [
    {
      id: "current",
      name: "Current · Sticky to header",
      desc: "Pins under the nav, then dies at the hero/body split",
    },
    {
      id: "proposed",
      name: "Proposed · Pin to body heading",
      desc: "Form top stops at “In this white paper…”",
    },
  ];

  const ICONS = {
    flask: `<svg class="exp-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2v7.5L4.5 19a2 2 0 0 0 1.7 3h11.6a2 2 0 0 0 1.7-3L14 9.5V2M8.5 2h7M7 16h10"/></svg>`,
    chevron: `<svg class="exp-icon exp-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>`,
    desktop: `<svg class="exp-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="3" rx="2"/><path d="M8 21h8M12 17v4"/></svg>`,
    mobile: `<svg class="exp-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="20" x="5" y="2" rx="2"/><path d="M12 18h.01"/></svg>`,
  };

  const isShell = document.body?.classList?.contains("exp-viewer");
  const isPreview = document.body?.classList?.contains("wp-page");

  const state = {
    variant: "proposed",
    device: "desktop",
    panelOpen: true,
    scrollDepth: 0,
    formTop: 0,
    headingTop: 0,
    pinCeiling: 148,
    aligned: false,
  };

  const nodes = {
    panel: null,
    scrollValue: null,
    scrollFill: null,
    alignMeta: null,
    deviceMeta: null,
    stage: null,
    iframe: null,
  };

  function computeFormTop({ naturalTop, pinCeiling, formHeight, footerTop }) {
    let top = naturalTop;
    if (top < pinCeiling) top = pinCeiling;
    if (footerTop < top + formHeight) top = footerTop - formHeight;
    return top;
  }

  function computePinCeiling({ headerHeight, headingOffsetInBody }) {
    return headerHeight + headingOffsetInBody;
  }

  function postToPreview(payload) {
    const win = nodes.iframe?.contentWindow;
    if (win) win.postMessage({ source: "wp-sticky", ...payload }, "*");
  }

  function postToParent(payload) {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ source: "wp-sticky", ...payload }, "*");
    }
  }

  function buildPanel(mount) {
    const panel = document.createElement("div");
    panel.className = "exp-panel exp-reset";
    panel.innerHTML = `
      <button type="button" class="exp-panel-toggle" data-exp="toggle">
        <span style="color:var(--exp-emerald-400);display:inline-flex">${ICONS.flask}</span>
        <span class="exp-panel-title">
          Form sticky
          <span class="exp-panel-pill">Whitepaper</span>
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
        <div class="exp-label">Sticky behavior</div>
        <div class="exp-variants" data-exp="variants"></div>
        <div class="exp-scroll-meta">
          <div class="exp-scroll-row">
            <span>Scroll depth</span>
            <span class="exp-scroll-value" data-exp="scroll-value">0%</span>
          </div>
          <div class="exp-scroll-track">
            <div class="exp-scroll-fill" data-exp="scroll-fill"></div>
          </div>
          <p class="exp-device-meta" data-exp="align-meta" style="margin-top:0.65rem">
            Scroll the preview to compare pin lines.
          </p>
        </div>
        <p class="exp-device-meta" style="margin-top:0.75rem">
          Live page:
          <a href="https://join.elevenlabs.io/whitepapers/enterprise-agent-operating-model" style="color:#6ee7b7">
            join.elevenlabs.io
          </a>
        </p>
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

    panel.querySelector('[data-exp="toggle"]').addEventListener("click", () => {
      state.panelOpen = !state.panelOpen;
      panel.classList.toggle("collapsed", !state.panelOpen);
    });

    nodes.panel = panel;
    nodes.scrollValue = panel.querySelector('[data-exp="scroll-value"]');
    nodes.scrollFill = panel.querySelector('[data-exp="scroll-fill"]');
    nodes.alignMeta = panel.querySelector('[data-exp="align-meta"]');
    nodes.deviceMeta = panel.querySelector('[data-exp="device-meta"]');

    (mount || document.documentElement).appendChild(panel);
    syncPanelActive();
    syncDeviceUI();
  }

  function syncPanelActive() {
    if (!nodes.panel) return;
    nodes.panel.querySelectorAll(".exp-variant").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.id === state.variant);
    });
  }

  function syncDeviceUI() {
    if (!nodes.panel) return;
    nodes.panel.querySelectorAll(".exp-device-btn").forEach((btn) => {
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

  function applyAlignMeta() {
    if (!nodes.alignMeta) return;
    if (state.variant !== "proposed") {
      nodes.alignMeta.textContent =
        "Current: form docks under the header, then unsticks when the hero pair ends.";
      return;
    }
    const delta = Math.round(state.formTop - state.headingTop);
    if (state.aligned) {
      nodes.alignMeta.textContent = `Aligned · form top ${Math.round(state.formTop)}px = heading`;
    } else if (state.headingTop > state.formTop + 8) {
      nodes.alignMeta.textContent = `Form pinned at body-area line · heading ${delta}px below`;
    } else {
      nodes.alignMeta.textContent = `Form top ${Math.round(state.formTop)}px · heading ${Math.round(state.headingTop)}px`;
    }
  }

  function setVariant(id, { fromParent = false } = {}) {
    if (!VARIANTS.some((v) => v.id === id)) return;
    state.variant = id;
    syncPanelActive();
    applyAlignMeta();

    if (isShell) {
      postToPreview({ type: "setVariant", variant: id });
      return;
    }
    if (isPreview) {
      document.body.dataset.variant = id;
      syncPreviewLayout();
      measurePreview();
      if (!fromParent) postToParent({ type: "variant", variant: id });
    }
  }

  function applyScrollDepth(depth) {
    state.scrollDepth = depth;
    if (nodes.scrollValue) nodes.scrollValue.textContent = `${depth}%`;
    if (nodes.scrollFill) nodes.scrollFill.style.width = `${depth}%`;
  }

  function isNativePhone() {
    return window.matchMedia("(max-width: 720px)").matches;
  }

  function syncPhoneShellClass() {
    document.body.classList.toggle("exp-viewer--phone", isNativePhone());
  }

  function syncPreviewLayout() {
    const body = document.querySelector("[data-wp='body']");
    const scope = document.querySelector(".wp-scope");
    const hero = document.querySelector(".wp-hero");
    const spacer = document.querySelector(".wp-pin-spacer");
    if (!body || !scope || !hero) return;

    if (state.variant === "proposed") {
      scope.appendChild(body);
      if (spacer) scope.appendChild(spacer);
    } else {
      scope.insertAdjacentElement("afterend", body);
    }
  }

  function measurePreview() {
    const header = document.querySelector("[data-wp='header']");
    const heading = document.querySelector("[data-wp='heading']");
    const body = document.querySelector("[data-wp='body']");
    const form = document.querySelector("[data-wp='form']");
    if (!header || !heading || !body || !form) return;

    const headerH = header.getBoundingClientRect().height;
    const headingOffset = heading.getBoundingClientRect().top - body.getBoundingClientRect().top;
    const pinCeiling = computePinCeiling({
      headerHeight: headerH,
      headingOffsetInBody: headingOffset,
    });

    document.documentElement.style.setProperty("--wp-header-h", `${Math.round(headerH)}px`);
    document.documentElement.style.setProperty("--wp-pin-top", `${Math.round(pinCeiling)}px`);
    state.pinCeiling = pinCeiling;

    const formBox = form.getBoundingClientRect();
    const headingBox = heading.getBoundingClientRect();
    state.formTop = formBox.top;
    state.headingTop = headingBox.top;
    state.aligned = Math.abs(formBox.top - headingBox.top) <= 8;

    const el = document.documentElement;
    const max = el.scrollHeight - window.innerHeight;
    const depth = max > 0 ? Math.min(100, Math.round((window.scrollY / max) * 100)) : 0;
    applyScrollDepth(depth);

    postToParent({
      type: "metrics",
      depth,
      formTop: formBox.top,
      headingTop: headingBox.top,
      pinCeiling,
      aligned: state.aligned,
      variant: state.variant,
    });
  }

  function bootShell() {
    nodes.stage = document.querySelector(".exp-viewer-stage");
    nodes.iframe = document.getElementById("exp-preview");
    const host = document.getElementById("exp-panel-host");

    if (isNativePhone()) {
      state.panelOpen = false;
      state.device = "mobile";
    }
    syncPhoneShellClass();
    buildPanel(host);
    if (!state.panelOpen && nodes.panel) nodes.panel.classList.add("collapsed");
    syncDeviceUI();

    const mq = window.matchMedia("(max-width: 720px)");
    const onViewportChange = () => syncPhoneShellClass();
    if (mq.addEventListener) mq.addEventListener("change", onViewportChange);
    else mq.addListener(onViewportChange);

    window.addEventListener("message", (event) => {
      const data = event.data;
      if (!data || data.source !== "wp-sticky") return;
      if (data.type === "metrics") {
        applyScrollDepth(data.depth);
        state.formTop = data.formTop;
        state.headingTop = data.headingTop;
        state.pinCeiling = data.pinCeiling;
        state.aligned = data.aligned;
        if (data.variant) state.variant = data.variant;
        syncPanelActive();
        applyAlignMeta();
      }
      if (data.type === "ready") {
        postToPreview({ type: "setVariant", variant: state.variant });
      }
    });

    nodes.iframe?.addEventListener("load", () => {
      postToPreview({ type: "setVariant", variant: state.variant });
    });
  }

  function bootPreview() {
    const params = new URLSearchParams(location.search);
    if (params.get("variant") === "current") state.variant = "current";
    document.body.dataset.variant = state.variant;
    syncPreviewLayout();

    measurePreview();
    window.addEventListener("scroll", measurePreview, { passive: true });
    window.addEventListener("resize", measurePreview, { passive: true });

    window.addEventListener("message", (event) => {
      const data = event.data;
      if (!data || data.source !== "wp-sticky") return;
      if (data.type === "setVariant") setVariant(data.variant, { fromParent: true });
    });
    postToParent({ type: "ready" });
  }

  function boot() {
    if (isShell) bootShell();
    else if (isPreview) bootPreview();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  window.__wpSticky = { computeFormTop, computePinCeiling };
})();
