(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  // Nav scroll state
  const nav = $(".nav");
  if (nav) {
    const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  // Code tabs + copy
  $$(".code-shell").forEach((shell) => {
    const tabs = $$(".code-tab", shell);
    const panels = $$(".code-panel", shell);
    const copyBtn = $(".code-copy", shell);

    const activate = (id) => {
      tabs.forEach((t) => t.setAttribute("aria-selected", String(t.dataset.tab === id)));
      panels.forEach((p) => {
        p.hidden = p.dataset.panel !== id;
      });
    };

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => activate(tab.dataset.tab));
    });

    if (copyBtn) {
      copyBtn.addEventListener("click", async () => {
        const panel = panels.find((p) => !p.hidden) || panels[0];
        const text = panel?.innerText || "";
        try {
          await navigator.clipboard.writeText(text);
          const prev = copyBtn.textContent;
          copyBtn.textContent = "Copied";
          setTimeout(() => {
            copyBtn.textContent = prev;
          }, 1200);
        } catch {
          copyBtn.textContent = "Copy failed";
        }
      });
    }
  });

  // Sticky CTA reveal
  const sticky = $(".sticky-cta");
  if (sticky) {
    const revealAt = Number(sticky.dataset.revealAt || 280);
    const update = () => sticky.classList.toggle("is-visible", window.scrollY > revealAt);
    update();
    window.addEventListener("scroll", update, { passive: true });
  }

  // Q2 checklist
  $$(".check-item").forEach((item) => {
    const box = $(".check-box", item);
    if (!box) return;
    const sync = () => item.classList.toggle("is-done", box.checked);
    box.addEventListener("change", sync);
    sync();
  });

  // UD intent router
  const intentRoot = $("[data-intent-router]");
  if (intentRoot) {
    const cards = $$(".intent-card", intentRoot);
    const chips = $$(".chip", intentRoot);
    const continueBtn = $("[data-continue]", intentRoot);
    let intent = null;
    let stack = chips.find((c) => c.getAttribute("aria-pressed") === "true")?.dataset.stack || "python";

    const escapeUrl = intentRoot.dataset.escapeUrl;
    const syncContinue = () => {
      if (!continueBtn) return;
      if (!intent) {
        continueBtn.classList.add("is-disabled");
        continueBtn.setAttribute("aria-disabled", "true");
        continueBtn.href = escapeUrl || "#";
        return;
      }
      continueBtn.classList.remove("is-disabled");
      continueBtn.setAttribute("aria-disabled", "false");
      const url = new URL(intent, window.location.href);
      url.searchParams.set("stack", stack);
      continueBtn.href = url.toString();
    };

    cards.forEach((card) => {
      card.addEventListener("click", () => {
        cards.forEach((c) => c.setAttribute("aria-pressed", "false"));
        card.setAttribute("aria-pressed", "true");
        intent = card.dataset.href;
        syncContinue();
      });
    });

    chips.forEach((chip) => {
      chip.addEventListener("click", () => {
        chips.forEach((c) => c.setAttribute("aria-pressed", "false"));
        chip.setAttribute("aria-pressed", "true");
        stack = chip.dataset.stack;
        syncContinue();
      });
    });

    syncContinue();
  }

  // Disruptive gate (soft overlay)
  const gate = $("[data-gate]");
  if (gate) {
    const delay = Number(gate.dataset.delayMs || 300);
    const dismiss = () => gate.classList.remove("is-open");
    setTimeout(() => gate.classList.add("is-open"), delay);
    $$("[data-gate-dismiss]", gate).forEach((el) => el.addEventListener("click", dismiss));
  }

  // Forced sticky bar (STT disruptive) — non-dismissible for N seconds
  const forceBar = $("[data-force-bar]");
  if (forceBar) {
    const lockMs = Number(forceBar.dataset.lockMs || 5000);
    forceBar.classList.add("is-visible");
    const closeBtn = $("[data-force-close]", forceBar);
    if (closeBtn) {
      closeBtn.disabled = true;
      closeBtn.style.opacity = "0.4";
      setTimeout(() => {
        closeBtn.disabled = false;
        closeBtn.style.opacity = "1";
      }, lockMs);
      closeBtn.addEventListener("click", () => forceBar.classList.remove("is-visible"));
    }
  }

  // VD prompt gate: require text before CTA
  const promptForm = $("[data-prompt-cta]");
  if (promptForm) {
    const input = $("textarea", promptForm);
    const btn = $("[data-prompt-submit]", promptForm);
    const base = btn?.dataset.href || "#";
    const sync = () => {
      const ok = (input?.value || "").trim().length >= 8;
      if (!btn) return;
      btn.classList.toggle("is-disabled", !ok);
      btn.setAttribute("aria-disabled", String(!ok));
      if (ok) {
        const url = new URL(base, window.location.href);
        url.searchParams.set("voice_description", input.value.trim().slice(0, 240));
        btn.href = url.toString();
      }
    };
    input?.addEventListener("input", sync);
    sync();
  }

  // Markets counter animation
  const counter = $("[data-count-to]");
  if (counter) {
    const target = Number(counter.dataset.countTo || 90);
    let start = null;
    const dur = 900;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min(1, (ts - start) / dur);
      const eased = 1 - (1 - p) ** 3;
      counter.textContent = String(Math.round(target * eased));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
})();
