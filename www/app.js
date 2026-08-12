(() => {
  const native = window.NotiSiren;
  const $ = (id) => document.getElementById(id);

  /** 앱에 내장된 Web UI 번호. publishWebUi 시 서버에서 자동 증가 */
  const WEB_UI_REVISION = 47;
  const WEB_UI_REV_KEY = "naya_webui_applied_rev";
  const WEB_UI_DISMISS_KEY = "naya_webui_dismiss_rev";
  const REMOTE_WWW_FALLBACK = "https://justin7497.github.io/naya-releases/www";

  let currentTab = "home";
  let currentSub = null;
  let currentRules = [];
  let currentRuleId = null;
  let installedApps = [];
  const selectedInstalledPackages = new Set();
  const ruleEditState = {
    level: "NORMAL",
    soundId: "",
  };

  const designState = {
    themeSet: "classic",
    themeStyle: "kakao_talk",
    themeFrame: "thick",
    themeFont: "giant",
    themeSound: "naya",
    tts: false,
    catalog: null,
    styleGroup: "classic",
    frameGroup: "box",
    fontGroup: "classic",
  };

  const defaultCatalog = {
    sets: [
      {
        id: "classic",
        label: "카카오톡 스타일",
        desc: "채팅방 노란 말풍선 알림",
        defaultStyle: "kakao_talk",
        defaultFrame: "rounded",
        defaultFont: "rounded",
      },
      {
        id: "laser_scan",
        label: "레이저 슬릿 스캔",
        desc: "레이저가 화면을 훑고 네온 바가 나타나는 연출",
        defaultStyle: "neon_night",
        defaultFrame: "neon_ring",
        defaultFont: "neon_slab",
      },
      {
        id: "heartbeat_pulse",
        label: "하트비트 펄스",
        desc: "가장자리 링이 중앙으로 박동하며 카드가 나타나는 연출",
        defaultStyle: "rose_punch",
        defaultFrame: "card",
        defaultFont: "rounded",
      },
    ],
    styles: [
      { id: "kakao_talk", label: "카카오톡" },
      { id: "siren_classic", label: "사이렌 레드" },
      { id: "amber_alert", label: "선셋 경고" },
      { id: "neon_night", label: "네온 시티" },
      { id: "police", label: "폴리스 플래시" },
      { id: "soft_day", label: "소프트 데이" },
      { id: "glass_mint", label: "글래스 민트" },
      { id: "midnight", label: "미드나잇" },
      { id: "rose_punch", label: "로즈 펀치" },
      { id: "aurora", label: "오로라" },
      { id: "cyber_lime", label: "사이버 라임" },
    ],
    frames: [
      { id: "bleed", label: "와이드 카드" },
      { id: "thick", label: "두꺼운 테두리" },
      { id: "double_ring", label: "더블 링" },
      { id: "card", label: "중앙 카드" },
      { id: "inset", label: "인셋 카드" },
      { id: "rounded", label: "라운드 박스" },
      { id: "neon_ring", label: "네온 링" },
      { id: "glass_float", label: "글래스 플로트" },
      { id: "spotlight", label: "스포트라이트" },
      { id: "minimal", label: "미니멀" },
      { id: "halo", label: "헤일로" },
      { id: "cinema", label: "시네마 와이드" },
    ],
    fonts: [
      { id: "bold_sans", label: "굵은 고딕" },
      { id: "giant", label: "초대형" },
      { id: "rounded", label: "라운드" },
      { id: "digital", label: "디지털" },
      { id: "serif", label: "명조" },
      { id: "compact", label: "컴팩트" },
      { id: "neon_slab", label: "네온 슬랩" },
      { id: "airy", label: "에어리" },
      { id: "poster", label: "포스터" },
      { id: "soft_serif", label: "소프트 명조" },
      { id: "cyber_mono", label: "사이버 모노" },
      { id: "display", label: "디스플레이" },
    ],
    sounds: [
      { id: "naya", label: "나야나야" },
      { id: "ding", label: "딩동" },
      { id: "siren", label: "사이렌" },
      { id: "alarm", label: "알람음" },
      { id: "soft", label: "부드러운 알림" },
    ],
  };

  const THEME_SWATCH = {
    kakao_talk: ["#fee500", "#f5dc00"],
    siren_classic: ["#ef4444", "#3b82f6"],
    amber_alert: ["#f59e0b", "#ef4444"],
    neon_night: ["#ec4899", "#22d3ee"],
    police: ["#dc2626", "#2563eb"],
    soft_day: ["#fca5a5", "#fde68a"],
    glass_mint: ["#2dd4bf", "#38bdf8"],
    midnight: ["#6366f1", "#8b5cf6"],
    rose_punch: ["#fb7185", "#e11d48"],
    aurora: ["#34d399", "#6366f1"],
    cyber_lime: ["#a3e635", "#0f172a"],
  };

  const STYLE_TAG = {
    kakao_talk: "카톡",
    siren_classic: "클래식",
    amber_alert: "경고",
    neon_night: "트렌드",
    police: "긴급",
    soft_day: "부드러움",
    glass_mint: "트렌드",
    midnight: "야간",
    rose_punch: "NEW",
    aurora: "트렌드",
    cyber_lime: "사이버",
  };

  const STYLE_CLASSIC = ["kakao_talk", "siren_classic", "amber_alert", "police", "soft_day"];
  const STYLE_TREND = [
    "neon_night",
    "glass_mint",
    "midnight",
    "rose_punch",
    "aurora",
    "cyber_lime",
  ];

  const FRAME_BOX = [
    "bleed",
    "thick",
    "double_ring",
    "card",
    "inset",
    "rounded",
    "neon_ring",
    "glass_float",
    "spotlight",
    "minimal",
    "halo",
    "cinema",
  ];
  const FRAME_TAG = {
    bleed: "와이드",
    thick: "박스",
    double_ring: "박스",
    card: "기본",
    inset: "박스",
    rounded: "박스",
    neon_ring: "박스",
    glass_float: "박스",
    spotlight: "박스",
    minimal: "박스",
    halo: "박스",
    cinema: "박스",
  };

  const FONT_CLASSIC = ["bold_sans", "giant", "rounded", "serif", "digital", "compact"];
  const FONT_TREND = ["neon_slab", "airy", "poster", "soft_serif", "cyber_mono", "display"];

  const FONT_TAG = {
    bold_sans: "클래식",
    giant: "기본",
    rounded: "클래식",
    digital: "클래식",
    serif: "클래식",
    compact: "클래식",
    neon_slab: "트렌드",
    airy: "라이트",
    poster: "트렌드",
    soft_serif: "트렌드",
    cyber_mono: "사이버",
    display: "NEW",
  };

  function catalog() {
    const c = designState.catalog;
    if (!c) return defaultCatalog;
    const mergeList = (key) => {
      const base = Array.isArray(c[key]) && c[key].length ? c[key] : defaultCatalog[key];
      const seen = new Set(base.map((x) => x.id));
      const extra = (defaultCatalog[key] || []).filter((x) => !seen.has(x.id));
      return extra.length ? base.concat(extra) : base;
    };
    return {
      styles: mergeList("styles"),
      frames: mergeList("frames"),
      fonts: mergeList("fonts"),
      sounds: c.sounds || defaultCatalog.sounds,
    };
  }
  function labelOf(list, id) {
    return (list.find((x) => x.id === id) || {}).label || "—";
  }

  function closeSubpage() {
    navigate({ tab: currentTab, sub: null });
  }

  function openSubpage(name) {
    navigate({ tab: currentTab, sub: name });
  }

  function applyGroupFromEl(el) {
    if (!el) return;
    if (el.hasAttribute("data-style-group")) {
      designState.styleGroup = el.getAttribute("data-style-group") || "classic";
    }
    if (el.hasAttribute("data-frame-group")) {
      designState.frameGroup = el.getAttribute("data-frame-group") || "box";
    }
    if (el.hasAttribute("data-font-group")) {
      designState.fontGroup = el.getAttribute("data-font-group") || "classic";
    }
  }

  /** @type {{ tab: string, sub: string|null }[]} */
  const navStack = [];

  function navSnap() {
    return { tab: currentTab, sub: currentSub };
  }

  function navSame(a, b) {
    return !!a && !!b && a.tab === b.tab && a.sub === b.sub;
  }

  function applyState(state) {
    const tab = state.tab || "home";
    const sub = state.sub || null;
    currentTab = tab;
    currentSub = sub;

    document.querySelectorAll(".page").forEach((p) => {
      p.classList.toggle("is-active", p.dataset.page === tab);
    });
    document.querySelectorAll(".tab").forEach((t) => {
      const on = t.dataset.tab === tab;
      t.classList.toggle("is-active", on);
      t.setAttribute("aria-selected", on ? "true" : "false");
    });

    document.querySelectorAll(".subpage").forEach((p) => {
      p.classList.toggle("is-active", !!sub && p.dataset.sub === sub);
    });
    document.querySelector(".app-shell")?.classList.toggle("sub-open", !!sub);

    if (sub) {
      const active = document.querySelector(`.subpage[data-sub="${sub}"]`);
      if (active) {
        active.scrollTop = 0;
        active.scrollLeft = 0;
      }
      try {
        if (sub === "privacy") {
          window.NayaPrivacyPager?.bind(active);
        }
        if (sub === "design-style") renderStylePicker();
        if (sub === "design-frame") renderFramePicker();
        if (sub === "design-font") renderFontPicker();
        if (sub === "design-sound") renderSoundPicker();
        if (sub === "design-detail") {
          updateDesignLabels();
          updateDesignPreview();
        }
        if (sub === "rule-alert") renderRuleAlertEditor();
        if (sub === "app-add") loadInstalledApps();
        if (sub === "notif-link") {
          renderLinkAppPicker(cachedAppPresets);
          if (!$("notifLinkResults")?.children?.length) {
            renderNotifLinkResults([], "검색 결과");
          }
        }
      } catch (err) {
        console.error("applyState render error:", sub, err);
      }
    }

    if (tab === "home" && !sub) startHeroAutoplay();
    else stopHeroAutoplay();
    if (tab === "design") renderDesignPickers();
  }

  /** 화면 이동. 뒤로가기는 직전 상태로 복귀한다. */
  function navigate(state, opts) {
    const next = {
      tab: state.tab || currentTab,
      sub: state.sub === undefined ? null : state.sub,
    };
    const cur = navSnap();
    if (navSame(cur, next)) {
      if (next.sub === "design-style") renderStylePicker();
      if (next.sub === "design-frame") renderFramePicker();
      if (next.sub === "design-font") renderFontPicker();
      if (next.sub === "design-sound") renderSoundPicker();
      if (next.sub === "rule-alert") renderRuleAlertEditor();
      if (next.sub === "app-add") loadInstalledApps();
      return;
    }
    if (!(opts && opts.replace)) {
      navStack.push(cur);
      if (navStack.length > 40) navStack.shift();
    }
    /* 도착 화면이 스택 맨 위와 같으면 제거 → 뒤로가기 시 같은 화면 반복 방지 */
    while (navStack.length && navSame(navStack[navStack.length - 1], next)) {
      navStack.pop();
    }
    applyState(next);
  }

  function goBack() {
    if (currentSub === "privacy" && window.NayaPrivacyPager?.goBack?.()) {
      return true;
    }
    if (navStack.length) {
      applyState(navStack.pop());
      return true;
    }
    if (currentSub || currentTab !== "home") {
      applyState({ tab: "home", sub: null });
      return true;
    }
    return false;
  }

  function switchTab(tab) {
    navigate({ tab, sub: null });
  }

  /* Home hero carousel */
  let heroIdx = 0;
  let heroTimer = null;
  let heroPaused = false;
  const HERO_INTERVAL = 4200;

  function heroSlides() {
    return [...document.querySelectorAll(".home-hero-slide")];
  }
  function heroTrack() {
    return $("homeHeroTrack");
  }
  function setHeroDots(i) {
    document.querySelectorAll(".home-hero-dot").forEach((d, n) => {
      d.classList.toggle("is-active", n === i);
    });
  }
  function goHero(i, smooth) {
    const track = heroTrack();
    const slides = heroSlides();
    if (!track || !slides.length) return;
    heroIdx = ((i % slides.length) + slides.length) % slides.length;
    const left = slides[heroIdx].offsetLeft;
    if (smooth === false) track.scrollLeft = left;
    else track.scrollTo({ left, behavior: "smooth" });
    setHeroDots(heroIdx);
  }
  function stopHeroAutoplay() {
    if (heroTimer) {
      clearInterval(heroTimer);
      heroTimer = null;
    }
  }
  function startHeroAutoplay() {
    stopHeroAutoplay();
    if (heroPaused || heroSlides().length < 2) return;
    if (currentTab !== "home" || currentSub) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    heroTimer = setInterval(() => {
      if (document.hidden || heroPaused) return;
      goHero(heroIdx + 1);
    }, HERO_INTERVAL);
  }
  function pauseHeroBriefly() {
    heroPaused = true;
    stopHeroAutoplay();
    clearTimeout(pauseHeroBriefly._t);
    pauseHeroBriefly._t = setTimeout(() => {
      heroPaused = false;
      startHeroAutoplay();
    }, 6000);
  }
  function bindHeroCarousel() {
    const track = heroTrack();
    if (!track || track.dataset.bound === "1") return;
    track.dataset.bound = "1";

    let scrollEnd;
    track.addEventListener("scroll", () => {
      clearTimeout(scrollEnd);
      scrollEnd = setTimeout(() => {
        const slides = heroSlides();
        if (!slides.length) return;
        const i = Math.round(track.scrollLeft / Math.max(1, track.clientWidth));
        heroIdx = Math.max(0, Math.min(slides.length - 1, i));
        setHeroDots(heroIdx);
      }, 80);
    }, { passive: true });

    ["touchstart", "pointerdown", "wheel"].forEach((ev) => {
      track.addEventListener(ev, pauseHeroBriefly, { passive: true });
    });

    document.querySelectorAll(".home-hero-dot").forEach((dot) => {
      dot.addEventListener("click", () => {
        pauseHeroBriefly();
        goHero(Number(dot.getAttribute("data-hero-idx") || 0));
      });
    });

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stopHeroAutoplay();
      else startHeroAutoplay();
    });

    startHeroAutoplay();
  }

  /* 모든 화면 이동은 이벤트 위임 한 곳에서 처리 */
  document.addEventListener("click", (ev) => {
    const target = ev.target;
    if (!target || typeof target.closest !== "function") return;

    const doneBtn = target.closest("#btnStyleDone, #btnFrameDone, #btnFontDone, #btnSoundDone");
    if (doneBtn) {
      // 세부 조정 → 스타일/프레임 등에서 완료 시 직전 화면(세부 조정)으로
      if (!goBack()) navigate({ tab: "design", sub: "design-detail" }, { replace: true });
      return;
    }

    const subBtn = target.closest("button[data-sub], a[data-sub], [role='button'][data-sub]");
    if (subBtn && !subBtn.classList.contains("subpage")) {
      applyGroupFromEl(subBtn);
      openSubpage(subBtn.getAttribute("data-sub"));
      return;
    }

    const gotoBtn = target.closest("[data-goto]");
    if (gotoBtn) {
      switchTab(gotoBtn.getAttribute("data-goto"));
      return;
    }

    const tabBtn = target.closest(".tab[data-tab]");
    if (tabBtn) {
      switchTab(tabBtn.getAttribute("data-tab"));
    }
  });

  function call(method, ...args) {
    if (!native || typeof native[method] !== "function") {
      console.warn("Native bridge missing:", method);
      return null;
    }
    return native[method](...args);
  }
  function parseJson(raw, fallback) {
    try {
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  }
  function escapeHtml(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
  function toast(msg, targetId) {
    const el = $(targetId || "saveMsg");
    if (el) el.textContent = msg || "";
  }

  function renderChoiceGrid(containerId, items, selectedId, onPick) {
    const box = $(containerId);
    if (!box) return;
    box.innerHTML = "";
    (items || []).forEach((item) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "choice" + (item.id === selectedId ? " selected" : "");
      btn.textContent = item.label;
      btn.addEventListener("click", () => {
        onPick(item.id);
        updateDesignLabels();
        updateDesignPreview();
      });
      box.appendChild(btn);
    });
  }

  function resolvePackHost(container) {
    if (!container) return null;
    if (typeof container === "string") return $(container);
    return container;
  }

  function renderSectionedPacks(hostId, sections, fillGrid) {
    const host = $(hostId);
    if (!host) return;
    host.innerHTML = "";
    sections.forEach((sec) => {
      const label = document.createElement("p");
      label.className = "design-pick-group-label";
      label.textContent = sec.title;
      host.appendChild(label);
      const grid = document.createElement("div");
      grid.className = "theme-pack-grid";
      grid.setAttribute("role", "listbox");
      grid.setAttribute("aria-label", sec.title);
      host.appendChild(grid);
      fillGrid(grid, sec.ids);
    });
  }

  function renderThemePacks(containerId, selectedId, onPick, filterIds) {
    const row = resolvePackHost(containerId);
    if (!row) return;
    row.innerHTML = "";
    const byId = new Map((catalog().styles || []).map((s) => [s.id, s]));
    (defaultCatalog.styles || []).forEach((s) => {
      if (!byId.has(s.id)) byId.set(s.id, s);
    });
    let styles = filterIds
      ? filterIds.map((id) => byId.get(id)).filter(Boolean)
      : [...byId.values()];
    if (!styles.length) {
      row.innerHTML = '<p class="empty-hint">분위기 목록을 불러오지 못했습니다.</p>';
      return;
    }
    styles.forEach((style) => {
      const sw = THEME_SWATCH[style.id] || ["#94a3b8", "#64748b"];
      const tag = STYLE_TAG[style.id] || "";
      const card = document.createElement("button");
      card.type = "button";
      card.className = "theme-pack" + (style.id === selectedId ? " is-selected" : "");
      card.setAttribute("role", "option");
      card.setAttribute("aria-selected", style.id === selectedId ? "true" : "false");
      card.innerHTML = `
        ${tag ? `<span class="theme-pack-tag">${escapeHtml(tag)}</span>` : ""}
        <span class="theme-pack-swatch" style="background:linear-gradient(135deg,${sw[0]},${sw[1]})"></span>
        <span class="theme-pack-label">${escapeHtml(style.label)}</span>`;
      card.addEventListener("click", () => {
        onPick(style.id);
        renderStylePicker();
        renderDesignPickers();
      });
      row.appendChild(card);
    });
  }

  function renderFramePacks(containerId, selectedId, onPick, filterIds) {
    const row = resolvePackHost(containerId);
    if (!row) return;
    row.innerHTML = "";
    const byId = new Map((catalog().frames || []).map((f) => [f.id, f]));
    (defaultCatalog.frames || []).forEach((f) => {
      if (!byId.has(f.id)) byId.set(f.id, f);
    });
    let frames = filterIds
      ? filterIds.map((id) => byId.get(id)).filter(Boolean)
      : [...byId.values()];
    if (!frames.length) {
      row.innerHTML = '<p class="empty-hint">프레임 목록을 불러오지 못했습니다.</p>';
      return;
    }
    frames.forEach((frame) => {
      const tag = FRAME_TAG[frame.id] || "";
      const card = document.createElement("button");
      card.type = "button";
      card.className = "theme-pack frame-pack" + (frame.id === selectedId ? " is-selected" : "");
      card.setAttribute("role", "option");
      card.setAttribute("aria-selected", frame.id === selectedId ? "true" : "false");
      card.innerHTML = `
        ${tag ? `<span class="theme-pack-tag">${escapeHtml(tag)}</span>` : ""}
        <span class="frame-pack-mock" data-frame="${escapeHtml(frame.id)}">
          <span class="frame-pack-flash"><span class="frame-pack-sheet"></span></span>
        </span>
        <span class="theme-pack-label">${escapeHtml(frame.label)}</span>`;
      card.addEventListener("click", () => {
        onPick(frame.id);
        renderFramePicker();
        renderDesignPickers();
      });
      row.appendChild(card);
    });
  }

  function renderFontPacks(containerId, selectedId, onPick, filterIds) {
    const row = resolvePackHost(containerId);
    if (!row) return;
    row.innerHTML = "";
    const byId = new Map((catalog().fonts || []).map((f) => [f.id, f]));
    (defaultCatalog.fonts || []).forEach((f) => {
      if (!byId.has(f.id)) byId.set(f.id, f);
    });
    let fonts = filterIds
      ? filterIds.map((id) => byId.get(id)).filter(Boolean)
      : [...byId.values()];
    if (!fonts.length) {
      row.innerHTML = '<p class="empty-hint">글꼴 목록을 불러오지 못했습니다.</p>';
      return;
    }
    fonts.forEach((font) => {
      const tag = FONT_TAG[font.id] || "";
      const card = document.createElement("button");
      card.type = "button";
      card.className = "theme-pack font-pack" + (font.id === selectedId ? " is-selected" : "");
      card.setAttribute("role", "option");
      card.setAttribute("aria-selected", font.id === selectedId ? "true" : "false");
      card.innerHTML = `
        ${tag ? `<span class="theme-pack-tag">${escapeHtml(tag)}</span>` : ""}
        <span class="font-pack-mock" data-font="${escapeHtml(font.id)}">
          <span class="font-pack-sample">아내</span>
        </span>
        <span class="theme-pack-label">${escapeHtml(font.label)}</span>`;
      card.addEventListener("click", () => {
        onPick(font.id);
        renderFontPicker();
        renderDesignPickers();
      });
      row.appendChild(card);
    });
  }

  function renderFontPicker() {
    const pick = (id) => {
      designState.themeFont = id;
    };
    renderSectionedPacks(
      "designFontPickGrid",
      [
        { title: "클래식", ids: FONT_CLASSIC },
        { title: "트렌드", ids: FONT_TREND },
      ],
      (grid, ids) => renderFontPacks(grid, designState.themeFont, pick, ids),
    );
    updateDesignLabels();
    updateDesignPreview();
  }

  function renderSoundPicker() {
    const grid = $("designSoundPickGrid");
    if (!grid) return;
    grid.innerHTML = "";
    (catalog().sounds || []).forEach((sound) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `sound-pick${sound.id === designState.themeSound ? " is-selected" : ""}`;
      btn.innerHTML = `
        <span class="sound-pick-icon" aria-hidden="true">♪</span>
        <span class="sound-pick-label">${escapeHtml(sound.label)}</span>
        <span class="sound-pick-preview">미리듣기</span>`;
      btn.addEventListener("click", () => {
        designState.themeSound = sound.id;
        call("previewSound", sound.id);
        renderSoundPicker();
        updateDesignLabels();
      });
      grid.appendChild(btn);
    });

    const tts = $("tts");
    if (tts) {
      tts.checked = !!designState.tts;
      if (tts.dataset.bound !== "1") {
        tts.dataset.bound = "1";
        tts.addEventListener("change", () => {
          designState.tts = tts.checked;
          updateDesignLabels();
        });
      }
    }
  }

  function renderFramePicker() {
    const pick = (id) => {
      designState.themeFrame = id;
    };
    renderSectionedPacks(
      "designFramePickGrid",
      [{ title: "프레임", ids: FRAME_BOX }],
      (grid, ids) => renderFramePacks(grid, designState.themeFrame, pick, ids),
    );
    updateDesignLabels();
    updateDesignPreview();
  }

  function renderStylePicker() {
    const pick = (id) => {
      designState.themeStyle = id;
    };
    renderSectionedPacks(
      "designStylePickGrid",
      [
        { title: "클래식", ids: STYLE_CLASSIC },
        { title: "트렌드", ids: STYLE_TREND },
      ],
      (grid, ids) => renderThemePacks(grid, designState.themeStyle, pick, ids),
    );
    updateDesignLabels();
    updateDesignPreview();
  }

  function updateLockPreviewClock() {
    const now = new Date();
    const time = now.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const date = now.toLocaleDateString("ko-KR", {
      month: "long",
      day: "numeric",
      weekday: "short",
    });
    ["lockPreviewTime"].forEach((id) => {
      if ($(id)) $(id).textContent = time;
    });
    ["lockPreviewDate"].forEach((id) => {
      if ($(id)) $(id).textContent = date;
    });
  }

  function formatLastSkip(raw) {
    const text = (raw || "").trim();
    if (!text) return "아직 처리한 알림이 없습니다.";
    if (text.startsWith("필터 미일치") || text.startsWith("무시됨")) {
      const detail = text.replace(/^필터 미일치:\s*/, "").replace(/^무시됨 · 조건 불일치:\s*/, "");
      return `무시됨 · 등록 대상·키워드에 맞지 않음\n${detail}`;
    }
    return text;
  }

  function updateDesignPreview() {
    document.querySelectorAll(".design-preview").forEach((prev) => {
      prev.dataset.set = designState.themeSet;
      prev.dataset.style = designState.themeStyle;
      prev.dataset.frame = designState.themeFrame;
      prev.dataset.font = designState.themeFont;
    });
  }

  function themeSets() {
    const fromNative = (catalog().sets || []).filter((s) => s && s.id);
    return fromNative.length ? fromNative : defaultCatalog.sets;
  }

  function renderThemeSets() {
    const host = $("themeSetList");
    if (!host) return;
    host.innerHTML = "";
    themeSets().forEach((set) => {
      const card = document.createElement("button");
      card.type = "button";
      card.className =
        "theme-set-card" + (set.id === designState.themeSet ? " is-selected" : "");
      card.setAttribute("role", "option");
      card.setAttribute("aria-selected", set.id === designState.themeSet ? "true" : "false");
      card.innerHTML = `
        <span class="theme-set-visual" data-set="${escapeHtml(set.id)}" aria-hidden="true">
          <span class="theme-set-bar"></span>
        </span>
        <span class="theme-set-text">
          <span class="theme-set-label">${escapeHtml(set.label)}</span>
          <span class="theme-set-desc">${escapeHtml(set.desc || "")}</span>
        </span>
        <span class="theme-set-check" aria-hidden="true">✓</span>`;
      card.addEventListener("click", () => {
        if (designState.themeSet === set.id) return;
        designState.themeSet = set.id;
        if (set.defaultStyle) designState.themeStyle = set.defaultStyle;
        if (set.defaultFrame) designState.themeFrame = set.defaultFrame;
        if (set.defaultFont) designState.themeFont = set.defaultFont;
        const result = call("saveSettings", JSON.stringify(designPayload()));
        const parsed = parseJson(result, { ok: false, message: "저장 실패" });
        toast(
          parsed.ok ? `「${set.label}」 테마가 적용되었습니다` : parsed.message,
          "designMsg",
        );
        renderThemeSets();
        updateDesignLabels();
        updateDesignPreview();
      });
      host.appendChild(card);
    });
  }

  function updateDesignLabels() {
    const cat = catalog();
    const laser = designState.themeSet === "laser_scan";
    const heartbeat = designState.themeSet === "heartbeat_pulse";
    const fixedSet = laser || heartbeat;
    if ($("styleLabel")) {
      $("styleLabel").textContent = laser
        ? "세트 고정 (네온)"
        : heartbeat
          ? "세트 고정 (로즈)"
          : labelOf(cat.styles, designState.themeStyle);
    }
    if ($("frameLabel")) {
      $("frameLabel").textContent = laser
        ? "세트 고정 (슬림 바)"
        : heartbeat
          ? "세트 고정 (중앙 카드)"
          : labelOf(cat.frames, designState.themeFrame);
    }
    if ($("fontLabel")) $("fontLabel").textContent = labelOf(cat.fonts, designState.themeFont);
    if ($("soundLabel")) {
      const sound = labelOf(cat.sounds || [], designState.themeSound);
      $("soundLabel").textContent = `${sound} · TTS ${designState.tts ? "켜짐" : "꺼짐"}`;
    }
    if ($("designDetailSetLabel")) {
      const set = themeSets().find((s) => s.id === designState.themeSet);
      $("designDetailSetLabel").textContent = set
        ? `현재 테마 · ${set.label}`
        : "현재 테마";
    }
    // 세트 자체가 고정하는 항목은 화살표가 있는 선택 메뉴로 노출하지 않는다.
    // 레이저 세트는 슬림 바 레이아웃과 네온 스타일이 연출의 일부이므로 글꼴·소리만 조정한다.
    if ($("detailStyleItem")) $("detailStyleItem").hidden = fixedSet;
    if ($("detailFrameItem")) $("detailFrameItem").hidden = fixedSet;
    if ($("designDetailHint")) {
      $("designDetailHint").textContent = laser
        ? "레이저 연출은 글꼴과 소리만 조정할 수 있습니다."
        : heartbeat
          ? "하트비트 연출은 글꼴과 소리만 조정할 수 있습니다."
          : "스타일·프레임·글꼴·소리를 원하는 대로 조정할 수 있습니다.";
    }
    if ($("styleSubPreviewLabel")) {
      $("styleSubPreviewLabel").textContent = labelOf(cat.styles, designState.themeStyle);
    }
    if ($("frameSubPreviewLabel")) {
      $("frameSubPreviewLabel").textContent = labelOf(cat.frames, designState.themeFrame);
    }
    if ($("fontSubPreviewLabel")) {
      $("fontSubPreviewLabel").textContent = labelOf(cat.fonts, designState.themeFont);
    }
  }

  function renderDesignPickers() {
    renderThemeSets();
    updateDesignLabels();
    updateDesignPreview();
    if (currentSub === "design-style") renderStylePicker();
    if (currentSub === "design-frame") renderFramePicker();
    if (currentSub === "design-font") renderFontPicker();
    if (currentSub === "design-sound") renderSoundPicker();
  }

  function designPayload() {
    return {
      themeSet: designState.themeSet,
      themeStyle: designState.themeStyle,
      themeFrame: designState.themeFrame,
      themeFont: designState.themeFont,
      themeSound: designState.themeSound,
      tts: designState.tts,
    };
  }

  function renderApps(presets) {
    const box = $("appList");
    if (!box) return;
    box.innerHTML = "";
    let on = 0;
    const items = presets || [];
    const renderGroup = (title, apps) => {
      if (!apps.length) return;
      const heading = document.createElement("p");
      heading.className = "app-list-title";
      heading.textContent = title;
      box.appendChild(heading);
      apps.forEach((app) => {
        if (app.enabled) on++;
        const row = document.createElement("div");
        row.className = "app-item";

        const control = document.createElement("label");
        control.className = "app-item-control";
        control.innerHTML = `
          <span class="app-item-name">
            <strong>${escapeHtml(app.label)}</strong>
            ${app.installed === false ? "<small>설치되지 않음</small>" : ""}
          </span>`;
        const cb = document.createElement("input");
        cb.type = "checkbox";
        cb.checked = !!app.enabled;
        cb.dataset.package = app.packageName;
        control.appendChild(cb);
        row.appendChild(control);

        if (app.isCustom) {
          const remove = document.createElement("button");
          remove.type = "button";
          remove.className = "app-remove";
          remove.textContent = "삭제";
          remove.addEventListener("click", () => {
            const result = parseJson(call("removeCustomWatchedApp", app.packageName), {
              ok: false,
              message: "삭제 실패",
            });
            toast(result.message || "삭제됨", "appsMsg");
            if (result.ok) refresh();
          });
          row.appendChild(remove);
        }
        box.appendChild(row);
      });
    };
    renderGroup("기본 추천 앱", items.filter((app) => !app.isCustom));
    renderGroup("내가 추가한 앱", items.filter((app) => app.isCustom));
    if ($("appsCount")) $("appsCount").textContent = `${on}개 선택`;
  }

  function loadInstalledApps() {
    installedApps = parseJson(call("getInstalledLaunchableApps"), []);
    selectedInstalledPackages.clear();
    if ($("appAddSearch")) $("appAddSearch").value = "";
    renderInstalledApps();
  }

  function renderInstalledApps() {
    const box = $("installedAppList");
    if (!box) return;
    box.innerHTML = "";
    const query = ($("appAddSearch")?.value || "").trim().toLowerCase();
    const visible = (installedApps || []).filter((app) => {
      if (!query) return true;
      return `${app.label} ${app.packageName}`.toLowerCase().includes(query);
    });
    if (!visible.length) {
      box.innerHTML = '<p class="empty-hint">추가할 수 있는 앱이 없습니다.</p>';
    } else {
      visible.forEach((app) => {
        const row = document.createElement("label");
        row.className = `installed-app-item${app.added ? " is-added" : ""}`;
        row.innerHTML = `
          <span class="installed-app-name">
            <strong>${escapeHtml(app.label)}</strong>
            <small>${app.added ? "이미 목록에 있음" : escapeHtml(app.packageName)}</small>
          </span>`;
        const cb = document.createElement("input");
        cb.type = "checkbox";
        cb.disabled = !!app.added;
        cb.checked = selectedInstalledPackages.has(app.packageName);
        cb.addEventListener("change", () => {
          if (cb.checked) selectedInstalledPackages.add(app.packageName);
          else selectedInstalledPackages.delete(app.packageName);
          updateInstalledSelectionCount();
        });
        row.appendChild(cb);
        box.appendChild(row);
      });
    }
    updateInstalledSelectionCount();
  }

  function updateInstalledSelectionCount() {
    if ($("appAddCount")) {
      $("appAddCount").textContent = `${selectedInstalledPackages.size}개 선택`;
    }
    if ($("btnAddSelectedApps")) {
      $("btnAddSelectedApps").disabled = selectedInstalledPackages.size === 0;
    }
  }

  function recentCardHtml(n, withActions) {
    const actions = withActions
      ? `<div class="recent-card-top">
           <div class="recent-card-meta">
             <div class="app">${escapeHtml(n.appLabel || n.packageName)}</div>
             <div class="title">${escapeHtml(n.title || "(제목 없음)")}</div>
           </div>
         </div>
         <div class="body">${escapeHtml(n.body || "")}</div>
         <div class="recent-actions recent-actions-status">
           <button type="button" class="btn primary btn-add-rule" data-id="${escapeHtml(n.id)}" data-enabled="true">활성</button>
           <button type="button" class="btn ghost btn-add-rule" data-id="${escapeHtml(n.id)}" data-enabled="false">비활성</button>
           <button type="button" class="btn ghost btn-del-recent" data-id="${escapeHtml(n.id)}">삭제</button>
         </div>`
      : `
         <div class="app">${escapeHtml(n.appLabel || n.packageName)}</div>
         <div class="title">${escapeHtml(n.title || "(제목 없음)")}</div>
         <div class="body">${escapeHtml(n.body || "")}</div>`;
    return actions;
  }

  function bindAddRule(scope) {
    scope.querySelectorAll(".btn-add-rule").forEach((btn) => {
      btn.addEventListener("click", () => {
        const payload = JSON.stringify({
          recentId: btn.getAttribute("data-id"),
          level: "NORMAL",
          enabled: btn.getAttribute("data-enabled") !== "false",
        });
        const result = parseJson(call("addRuleFromRecent", payload), { ok: false, message: "등록 실패" });
        toast(result.message || (result.ok ? "등록되었습니다" : "실패"), "filtersMsg");
        refresh();
      });
    });
    scope.querySelectorAll(".btn-del-recent").forEach((btn) => {
      btn.addEventListener("click", () => {
        const result = parseJson(
          call("removeRecentNotification", btn.getAttribute("data-id")),
          { ok: false, message: "삭제 실패" },
        );
        toast(result.message || (result.ok ? "삭제됨" : "삭제 실패"), "filtersMsg");
        if (result.ok) refresh();
      });
    });
  }

  function renderRecent(items) {
    const full = $("recentList");
    if (full) {
      full.innerHTML = "";
      if (!items || !items.length) {
        full.innerHTML = '<p class="empty-hint">아직 감지된 알림이 없습니다.</p>';
      } else {
        items.forEach((n) => {
          const card = document.createElement("div");
          card.className = "recent-card";
          card.innerHTML = recentCardHtml(n, true);
          full.appendChild(card);
        });
        bindAddRule(full);
      }
    }
    if ($("recentCount")) $("recentCount").textContent = `${(items || []).length}건`;
  }

  let linkSelectedPackage = "";
  let cachedAppPresets = [];

  function renderLinkAppPicker(apps) {
    const box = $("linkAppPicker");
    if (!box) return;
    const enabled = (apps || []).filter((app) => app.enabled);
    cachedAppPresets = apps || [];
    box.innerHTML = "";
    if (!enabled.length) {
      box.innerHTML = '<p class="empty-hint">감시할 앱을 먼저 선택하세요.</p>';
      linkSelectedPackage = "";
      return;
    }
    if (!linkSelectedPackage || !enabled.some((app) => app.packageName === linkSelectedPackage)) {
      linkSelectedPackage = enabled[0].packageName;
    }
    enabled.forEach((app) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `link-app-chip${app.packageName === linkSelectedPackage ? " selected" : ""}`;
      btn.textContent = app.label;
      btn.dataset.package = app.packageName;
      btn.addEventListener("click", () => {
        linkSelectedPackage = app.packageName;
        renderLinkAppPicker(cachedAppPresets);
      });
      box.appendChild(btn);
    });
  }

  function notifLinkCardHtml(n) {
    const title = n.title || "";
    return `<div class="recent-card">
      <div class="recent-card-top">
        <div class="recent-card-meta">
          <div class="app">${escapeHtml(n.appLabel || n.packageName)}</div>
          <div class="title">${escapeHtml(title || "(제목 없음)")}</div>
        </div>
      </div>
      <div class="body">${escapeHtml(n.body || "")}</div>
      <div class="recent-actions recent-actions-status link-result-actions">
        <button type="button" class="btn primary btn-link-register" data-package="${escapeHtml(n.packageName)}" data-title="${escapeHtml(title)}" data-enabled="true">활성</button>
        <button type="button" class="btn ghost btn-link-register" data-package="${escapeHtml(n.packageName)}" data-title="${escapeHtml(title)}" data-enabled="false">비활성</button>
      </div>
    </div>`;
  }

  function bindNotifLinkResults(scope) {
    scope.querySelectorAll(".btn-link-register").forEach((btn) => {
      btn.addEventListener("click", () => {
        registerFromLink(
          btn.getAttribute("data-package"),
          btn.getAttribute("data-title"),
          btn.getAttribute("data-enabled") !== "false",
        );
      });
    });
  }

  function registerFromLink(packageName, matchTitle, enabled) {
    const title = String(matchTitle || "").trim();
    if (!packageName || !title) {
      toast("앱과 대상 이름을 확인하세요", "notifLinkMsg");
      return;
    }
    const payload = JSON.stringify({
      packageName,
      matchTitle: title,
      level: "NORMAL",
      enabled,
    });
    const result = parseJson(call("registerFromNotification", payload), { ok: false });
    toast(result.message || (result.ok ? "등록되었습니다" : "실패"), "notifLinkMsg");
    if (result.ok) refresh();
  }

  function renderNotifLinkResults(items, title) {
    const box = $("notifLinkResults");
    const titleEl = $("notifLinkResultsTitle");
    if (titleEl) titleEl.textContent = title || "검색 결과";
    if (!box) return;
    if (!items || !items.length) {
      box.innerHTML = '<p class="empty-hint">표시할 항목이 없습니다.</p>';
      return;
    }
    box.innerHTML = items.map((n) => notifLinkCardHtml(n)).join("");
    bindNotifLinkResults(box);
  }

  function scanActiveLinkNotifications() {
    if (!linkSelectedPackage) {
      toast("앱을 선택하세요", "notifLinkMsg");
      return;
    }
    const payload = JSON.stringify({ packageName: linkSelectedPackage });
    const result = parseJson(call("scanActiveNotifications", payload), { ok: false, items: [] });
    const items = result.items || [];
    toast(result.message || (result.ok ? "스캔 완료" : "스캔 실패"), "notifLinkMsg");
    renderNotifLinkResults(items, `알림창 스캔 (${items.length}건)`);
  }

  function searchNotificationLog() {
    const query = ($("notifLogSearch")?.value || "").trim();
    const payload = JSON.stringify({
      query,
      packageName: linkSelectedPackage || "",
    });
    const result = parseJson(call("searchNotificationLog", payload), { ok: false, items: [] });
    const items = result.items || [];
    toast(result.message || (result.ok ? "검색 완료" : "검색 실패"), "notifLinkMsg");
    renderNotifLinkResults(items, `수신 기록 (${items.length}건)`);
  }

  function openLinkApp() {
    if (!linkSelectedPackage) {
      toast("앱을 선택하세요", "notifLinkMsg");
      return;
    }
    const result = parseJson(call("openWatchedApp", linkSelectedPackage), { ok: false });
    toast(result.message || (result.ok ? "앱을 엽니다" : "실패"), "notifLinkMsg");
  }

  function openRuleAlertEditor(ruleId) {
    const rule = currentRules.find((item) => item.id === ruleId);
    if (!rule) return;
    currentRuleId = rule.id;
    ruleEditState.level = rule.level === "CRITICAL" ? "CRITICAL" : "NORMAL";
    ruleEditState.soundId = rule.soundId || "";
    navigate({ tab: "rules", sub: "rule-alert" });
    renderRuleAlertEditor();
  }

  function ruleInitial(rule) {
    const name = String(rule?.matchTitle || rule?.appLabel || "?").trim();
    return Array.from(name)[0] || "?";
  }

  function ruleAvatarDataUrl(rule) {
    if (!rule?.avatarPath) return "";
    const value = call("getRuleAvatarDataUrl", rule.id);
    return typeof value === "string" && /^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(value)
      ? value
      : "";
  }

  function ruleAvatarHtml(rule, dataUrl) {
    const content = dataUrl
      ? `<img src="${dataUrl}" alt="" />`
      : `<span aria-hidden="true">${escapeHtml(ruleInitial(rule))}</span>`;
    return `<div class="rule-avatar-thumb" aria-label="${escapeHtml(rule.matchTitle || "대상")} 프로필">${content}</div>`;
  }

  function renderRuleAvatarEditor(rule) {
    const dataUrl = ruleAvatarDataUrl(rule);
    const image = $("ruleAvatarImage");
    const initial = $("ruleAvatarInitial");
    if (image) {
      if (dataUrl) image.src = dataUrl;
      else image.removeAttribute("src");
      image.hidden = !dataUrl;
    }
    if (initial) {
      initial.textContent = ruleInitial(rule);
      initial.hidden = Boolean(dataUrl);
    }
    if ($("btnClearRuleAvatar")) $("btnClearRuleAvatar").disabled = !dataUrl;
  }

  function renderRuleAlertEditor() {
    const rule = currentRules.find((item) => item.id === currentRuleId);
    if (!rule) return;
    if ($("ruleAlertName")) {
      $("ruleAlertName").textContent = `${rule.matchTitle} · 알림 설정`;
    }
    renderRuleAvatarEditor(rule);

    document.querySelectorAll("[data-rule-level]").forEach((btn) => {
      const selected = btn.getAttribute("data-rule-level") === ruleEditState.level;
      btn.classList.toggle("is-selected", selected);
      btn.setAttribute("aria-pressed", selected ? "true" : "false");
      if (btn.dataset.bound !== "1") {
        btn.dataset.bound = "1";
        btn.addEventListener("click", () => {
          ruleEditState.level = btn.getAttribute("data-rule-level") || "NORMAL";
          renderRuleAlertEditor();
        });
      }
    });

    const grid = $("ruleSoundPickGrid");
    if (!grid) return;
    grid.innerHTML = "";
    const sounds = [
      { id: "", label: "전역 설정 따름" },
      ...(catalog().sounds || []),
    ];
    sounds.forEach((sound) => {
      const selected = sound.id === ruleEditState.soundId;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `sound-pick${selected ? " is-selected" : ""}`;
      btn.setAttribute("aria-pressed", selected ? "true" : "false");
      btn.innerHTML = `
        <span class="sound-pick-icon" aria-hidden="true">${sound.id ? "♪" : "↻"}</span>
        <span class="sound-pick-label">${escapeHtml(sound.label)}</span>
        <span class="sound-pick-preview">${sound.id ? "미리듣기" : "기본값 사용"}</span>`;
      btn.addEventListener("click", () => {
        ruleEditState.soundId = sound.id;
        if (sound.id) call("previewSound", sound.id);
        else call("previewSound", designState.themeSound);
        renderRuleAlertEditor();
      });
      grid.appendChild(btn);
    });
  }

  function isRuleDeleted(rule) {
    return Number(rule?.deletedAt || 0) > 0;
  }

  function isRuleActive(rule) {
    return rule?.enabled !== false && !isRuleDeleted(rule);
  }

  function isRuleInactive(rule) {
    return rule?.enabled === false && !isRuleDeleted(rule);
  }

  function setRuleEnabled(ruleId, enabled) {
    const payload = JSON.stringify({ id: ruleId, enabled });
    const result = parseJson(call("updateWatchRule", payload), { ok: false });
    toast(
      result.message || (enabled ? "활성화되었습니다" : "일시 정지되었습니다"),
      "targetsMsg",
    );
    if (result.ok) refresh();
  }

  function restoreWatchRule(ruleId) {
    const result = parseJson(call("restoreWatchRule", ruleId), { ok: false });
    toast(result.message || (result.ok ? "활성화되었습니다" : "실패"), "archiveMsg");
    if (result.ok) refresh();
  }

  function renderArchiveRuleCard(rule, mode) {
    const crit = rule.level === "CRITICAL";
    const avatarDataUrl = ruleAvatarDataUrl(rule);
    const actions = mode === "deleted"
      ? `<div class="rule-actions rule-actions-status rule-actions-two">
           <button type="button" class="btn primary btn-restore-rule" data-id="${escapeHtml(rule.id)}">활성</button>
           <button type="button" class="btn ghost btn-purge-rule" data-id="${escapeHtml(rule.id)}">완전삭제</button>
         </div>`
      : `<div class="rule-actions rule-actions-status rule-actions-two">
           <button type="button" class="btn primary btn-restore-rule" data-id="${escapeHtml(rule.id)}">활성</button>
           <button type="button" class="btn ghost btn-archive-delete" data-id="${escapeHtml(rule.id)}">삭제</button>
         </div>`;
    return `
      <div class="rule-card rule-card--paused">
        <div class="rule-card-head">
          ${ruleAvatarHtml(rule, avatarDataUrl)}
          <div class="rule-card-meta">
            <div class="app">${escapeHtml(rule.appLabel || rule.packageName)}</div>
            <div class="title">${escapeHtml(rule.matchTitle)}</div>
            <span class="pill ${mode === "deleted" ? "deleted" : "paused"}">${mode === "deleted" ? "삭제됨" : "비활성"}</span>
            <span class="pill ${crit ? "crit" : ""}">${crit ? "초긴급" : "일반"}</span>
          </div>
        </div>
        ${actions}
      </div>`;
  }

  function bindArchiveRuleActions(scope) {
    scope.querySelectorAll(".btn-restore-rule").forEach((btn) => {
      btn.addEventListener("click", () => {
        restoreWatchRule(btn.getAttribute("data-id"));
      });
    });
    scope.querySelectorAll(".btn-archive-delete").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (!window.confirm("삭제 목록으로 옮길까요?")) return;
        const result = parseJson(call("removeWatchRule", btn.getAttribute("data-id")), { ok: false });
        toast(result.message || (result.ok ? "삭제 목록으로 이동됨" : "실패"), "archiveMsg");
        if (result.ok) refresh();
      });
    });
    scope.querySelectorAll(".btn-purge-rule").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (!window.confirm("완전 삭제할까요? 복구할 수 없습니다.")) return;
        const result = parseJson(call("purgeWatchRule", btn.getAttribute("data-id")), { ok: false });
        toast(result.message || (result.ok ? "완전 삭제됨" : "실패"), "archiveMsg");
        if (result.ok) refresh();
      });
    });
  }

  function renderArchivedRules(rules) {
    const inactiveBox = $("inactiveRulesList");
    const deletedBox = $("deletedRulesList");
    if (!inactiveBox || !deletedBox) return;

    const all = rules || [];
    const inactive = all.filter(isRuleInactive);
    const deleted = all.filter(isRuleDeleted);

    if ($("archiveCountHint")) {
      const total = inactive.length + deleted.length;
      if (!total) $("archiveCountHint").textContent = "없음";
      else {
        const parts = [];
        if (inactive.length) parts.push(`비활성 ${inactive.length}`);
        if (deleted.length) parts.push(`삭제 ${deleted.length}`);
        $("archiveCountHint").textContent = parts.join(" · ");
      }
    }

    inactiveBox.innerHTML = inactive.length
      ? inactive.map((r) => renderArchiveRuleCard(r, "inactive")).join("")
      : '<p class="empty-hint">비활성 대상이 없습니다.</p>';
    deletedBox.innerHTML = deleted.length
      ? deleted.map((r) => renderArchiveRuleCard(r, "deleted")).join("")
      : '<p class="empty-hint">삭제된 대상이 없습니다.</p>';

    bindArchiveRuleActions(inactiveBox);
    bindArchiveRuleActions(deletedBox);
  }

  function renderRules(rules) {
    const box = $("rulesList");
    if (!box) return;
    currentRules = (rules || []).filter((r) => !isRuleDeleted(r));
    const activeRules = currentRules.filter(isRuleActive);
    box.innerHTML = "";
    const count = activeRules.length;
    const pausedCount = currentRules.filter(isRuleInactive).length;
    if ($("rulesCount")) $("rulesCount").textContent = `${count}명`;
    if ($("rulesCountHint")) {
      if (!count && !pausedCount) $("rulesCountHint").textContent = "대상 관리";
      else if (pausedCount) $("rulesCountHint").textContent = `${count}명 활성 · 비활성 ${pausedCount}`;
      else $("rulesCountHint").textContent = `${count}명 등록`;
    }
    if (!count) {
      box.innerHTML = '<p class="empty-hint">등록된 대상이 없습니다.</p>';
      renderArchivedRules(rules);
      return;
    }
    activeRules.forEach((r) => {
      const card = document.createElement("div");
      card.className = "rule-card";
      const crit = r.level === "CRITICAL";
      const avatarDataUrl = ruleAvatarDataUrl(r);
      const soundLabel = r.soundId
        ? labelOf(catalog().sounds || [], r.soundId)
        : "전역 사운드";
      card.innerHTML = `
        <div class="rule-card-head">
          ${ruleAvatarHtml(r, avatarDataUrl)}
          <div class="rule-card-meta">
            <div class="app">${escapeHtml(r.appLabel || r.packageName)}</div>
            <div class="title">${escapeHtml(r.matchTitle)}</div>
            <span class="pill">활성</span>
            <span class="pill ${crit ? "crit" : ""}">${crit ? "초긴급" : "일반"}</span>
            <span class="pill rule-sound">${escapeHtml(soundLabel)}</span>
          </div>
        </div>
        <div class="rule-actions rule-actions-status rule-actions-two">
          <button type="button" class="btn ghost btn-rule-disable" data-id="${escapeHtml(r.id)}">비활성</button>
          <button type="button" class="btn ghost btn-del-rule" data-id="${escapeHtml(r.id)}">삭제</button>
        </div>
        <div class="rule-actions">
          <button type="button" class="btn primary btn-edit-rule-alert" data-id="${escapeHtml(r.id)}">알림 설정</button>
        </div>`;
      box.appendChild(card);
    });
    box.querySelectorAll(".btn-edit-rule-alert").forEach((btn) => {
      btn.addEventListener("click", () => {
        openRuleAlertEditor(btn.getAttribute("data-id"));
      });
    });
    box.querySelectorAll(".btn-rule-disable").forEach((btn) => {
      btn.addEventListener("click", () => {
        setRuleEnabled(btn.getAttribute("data-id"), false);
      });
    });
    box.querySelectorAll(".btn-del-rule").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (!window.confirm("삭제 목록으로 옮길까요? 설정에서 다시 활성화할 수 있습니다.")) return;
        const result = parseJson(call("removeWatchRule", btn.getAttribute("data-id")), { ok: false });
        toast(result.message || "삭제 목록으로 이동됨", "targetsMsg");
        refresh();
      });
    });
    renderArchivedRules(rules);
    if (currentSub === "rule-alert") renderRuleAlertEditor();
  }

  function readFormSettings() {
    const packages = [...document.querySelectorAll("#appList input[type=checkbox]")]
      .filter((el) => el.checked)
      .map((el) => el.dataset.package);
    return {
      enabled: $("enabled")?.checked ?? true,
      tts: $("tts")?.checked ?? false,
      sticky: $("sticky")?.checked ?? false,
      flash: $("flash")?.checked ?? false,
      requireKeyword: $("requireKeyword")?.checked ?? false,
      snoozeMinutes: Number($("snoozeMinutes")?.value || 0),
      keywords: $("keywords")?.value.trim() || "",
      criticalKeywords: $("criticalKeywords")?.value.trim() || "",
      watchedPackages: packages,
      ...designPayload(),
    };
  }

  function fillSettings(s) {
    if (!s) return;
    if ($("enabled")) $("enabled").checked = !!s.enabled;
    designState.tts = !!s.tts;
    if ($("tts")) $("tts").checked = designState.tts;
    if ($("sticky")) $("sticky").checked = !!s.sticky;
    if ($("flash")) $("flash").checked = !!s.flash;
    if ($("requireKeyword")) $("requireKeyword").checked = !!s.requireKeyword;
    if ($("snoozeMinutes")) $("snoozeMinutes").value = String(s.snoozeMinutes ?? 5);
    if ($("keywords")) $("keywords").value = s.keywords || "";
    if ($("criticalKeywords")) $("criticalKeywords").value = s.criticalKeywords || "";
    renderApps(s.appPresets || []);
    if (s.themeSet) designState.themeSet = s.themeSet;
    if (s.themeStyle) designState.themeStyle = s.themeStyle;
    if (s.themeFrame) designState.themeFrame = s.themeFrame;
    if (s.themeFont) designState.themeFont = s.themeFont;
    if (s.themeSound) designState.themeSound = s.themeSound;
    if (s.themeCatalog) designState.catalog = s.themeCatalog;
    // 지원 종료된 프레임 id(구 형태 프레임)는 기본 카드로 정규화
    if (!(catalog().frames || []).some((f) => f.id === designState.themeFrame)) {
      designState.themeFrame = "card";
    }
    renderDesignPickers();
  }

  let appReady = false;
  let caps = {
    distribution: "sideload",
    selfUpdateEnabled: true,
    fsiSupported: true,
    exactAlarmEnabled: true,
  };

  function applyDistributionUi() {
    const isPlay = caps.distribution === "play" || caps.selfUpdateEnabled === false;
    document.querySelectorAll(".play-hide-update").forEach((el) => {
      el.hidden = isPlay;
    });
    document.querySelectorAll(".play-only-update").forEach((el) => {
      el.hidden = !isPlay;
    });
    document.querySelectorAll(".play-hide-fsi").forEach((el) => {
      el.hidden = !caps.fsiSupported;
    });
    const intro = $("setupIntroTitle");
    if (intro) {
      intro.textContent = caps.fsiSupported
        ? "3단계면 준비 끝"
        : "2단계면 준비 끝 (잠금화면 팝업은 오버레이 필수)";
    }
    const stickyLabel = $("stickyLabel");
    if (stickyLabel) {
      stickyLabel.textContent = caps.exactAlarmEnabled ? "확인 전까지 유지" : "확인 전 재알림";
    }
    const snoozeLabel = $("snoozeLabel");
    if (snoozeLabel) {
      snoozeLabel.textContent = caps.exactAlarmEnabled
        ? "재알림 간격 (분)"
        : "재알림 간격 (분 · 대략)";
    }
  }

  function fillStatus(st) {
    if (!st) return;
    caps = {
      distribution: st.distribution || "sideload",
      selfUpdateEnabled: st.selfUpdateEnabled !== false,
      fsiSupported: st.fsiSupported !== false,
      exactAlarmEnabled: st.exactAlarmEnabled !== false,
    };
    applyDistributionUi();
    applyUpdateNotice(st);
    checkWebUiUpdate(st);

    const ver = st.versionName || "—";
    const uiTag = st.webUiSource === "remote" ? " · UI 원격" : "";
    if ($("versionLabel")) $("versionLabel").textContent = `나야나야 ${ver}${uiTag}`;
    if ($("versionShort")) $("versionShort").textContent = `v${ver}`;

    const listenerOk = !!st.listenerGranted;
    const overlayOk = !!st.overlayGranted;
    const fsiOk = !caps.fsiSupported || !!st.fsiGranted;
    const isPlay = caps.distribution === "play";
    const ready = st.enabled !== false && listenerOk && fsiOk && (!isPlay || overlayOk);
    appReady = ready;

    const top = $("topbarStatus");
    const topLabel = $("topbarStatusLabel");
    if (top) {
      top.classList.toggle("is-on", ready);
      top.classList.toggle("is-off", !ready);
      top.setAttribute("aria-label", ready ? "나야나야 작동 중 ON" : "나야나야 꺼짐 OFF · 시작하기로 이동");
    }
    if (topLabel) topLabel.textContent = ready ? "ON" : "OFF";

    const badge = $("statusBadge");
    if (badge) {
      badge.textContent = ready ? "준비 완료" : "설정 필요";
      badge.classList.toggle("ok", ready);
      badge.classList.toggle("warn", !ready);
      badge.classList.add("pill");
    }

    const parts = [];
    if (st.enabled === false) parts.push("알람 꺼짐");
    else parts.push("알람 켜짐");
    if (!listenerOk) parts.push("알림 접근 필요");
    if (isPlay && !overlayOk) parts.push("오버레이 필요");
    if (caps.fsiSupported && !fsiOk) parts.push("잠금 화면 필요");
    const short = ready ? "정상" : parts.slice(0, 2).join(" · ");
    const permParts = [
      st.enabled === false ? "알람 꺼짐" : "알람 켜짐",
      listenerOk ? "알림 접근 허용됨" : "알림 접근 필요",
      overlayOk ? "오버레이 허용됨" : "오버레이 필요",
    ];
    if (caps.fsiSupported) {
      permParts.push(fsiOk ? "잠금 화면 허용됨" : "잠금 화면 필요");
    }
    const permText = permParts.join(" · ");

    if ($("statusDetail")) $("statusDetail").textContent = ready ? "지금 바로 사용할 수 있습니다." : short;
    const homeStatus = document.querySelector(".home-status-text");
    if (homeStatus) homeStatus.textContent = ready ? "준비 완료" : short;
    if ($("permDetail")) $("permDetail").textContent = permText;
    if ($("permShort")) $("permShort").textContent = ready ? "완료" : "확인";
    if ($("setupHint")) $("setupHint").textContent = ready ? "완료됨" : "권한 설정";
    if ($("masterHint")) $("masterHint").textContent = st.enabled === false ? "꺼져 있습니다" : "켜져 있습니다";

    if ($("logBox")) $("logBox").textContent = formatLastSkip(st.lastSkip);

    renderRecent(st.recentNotifications || parseJson(call("getRecentNotifications"), []));
    renderRules(st.watchRules || parseJson(call("getWatchRules"), []));
    cachedAppPresets = st.appPresets || [];
    renderLinkAppPicker(cachedAppPresets);
    if ($("notifLinkHint")) {
      $("notifLinkHint").textContent = cachedAppPresets.filter((app) => app.enabled).length
        ? "스캔·검색"
        : "앱 선택 필요";
    }
  }

  function applyUpdateNotice(st) {
    const banner = $("updateBanner");
    const title = $("updateBannerTitle");
    const sub = $("updateBannerSub");
    if (!banner) return;
    const notice = st?.updateNotice || {};
    const show = notice.show === true;
    banner.hidden = !show;
    if (!show) return;
    const isPlay = notice.distribution === "play" || caps.distribution === "play";
    if (notice.installReady) {
      if (title) title.textContent = "업데이트 설치 준비 완료";
      if (sub) {
        sub.textContent = isPlay
          ? "다운로드가 끝났습니다. 지금 설치하세요"
          : "다운로드가 끝났습니다. 지금 설치하세요";
      }
      return;
    }
    const ver = notice.versionName || "";
    if (title) {
      title.textContent = ver ? `새 버전 ${ver} 사용 가능` : "새 버전 사용 가능";
    }
    if (sub) {
      sub.textContent = isPlay
        ? "Google Play에서 업데이트할 수 있습니다"
        : "삭제 없이 덮어쓰기 설치됩니다";
    }
  }

  function webUiRevStorage() {
    try {
      return window.localStorage;
    } catch (_) {
      return null;
    }
  }

  function getDismissedWebUiRev() {
    const ls = webUiRevStorage();
    if (!ls) return 0;
    const n = parseInt(ls.getItem(WEB_UI_DISMISS_KEY) || "0", 10);
    return Number.isFinite(n) ? n : 0;
  }

  function remoteWwwBase(st) {
    const fromStatus = String(st?.webUiBaseUrl || "").replace(/\/$/, "");
    if (fromStatus) return fromStatus;
    return REMOTE_WWW_FALLBACK;
  }

  async function checkWebUiUpdate(st) {
    const banner = $("webUiBanner");
    if (!banner) return;
    const base = remoteWwwBase(st);
    if (!base) {
      banner.hidden = true;
      return;
    }
    try {
      const res = await fetch(`${base}/version.json?_=${Date.now()}`, { cache: "no-store" });
      if (!res.ok) {
        banner.hidden = true;
        return;
      }
      const data = await res.json();
      const remoteRev = Number(data.webUiRevision) || 0;
      const dismissed = getDismissedWebUiRev();
      if (remoteRev <= WEB_UI_REVISION || remoteRev <= dismissed) {
        banner.hidden = true;
        return;
      }
      const title = $("webUiBannerTitle");
      const sub = $("webUiBannerSub");
      if (title) title.textContent = "새 화면 사용 가능";
      if (sub) {
        sub.textContent = `화면 ${WEB_UI_REVISION} → ${remoteRev} · 앱 설치 없이 업데이트`;
      }
      banner.dataset.remoteRev = String(remoteRev);
      banner.hidden = false;
    } catch (_) {
      banner.hidden = true;
    }
  }

  function refresh() {
    const settings = parseJson(call("getSettings"), null);
    const status = parseJson(call("getStatus"), null);
    if (settings) {
      if (!settings.appPresets && status?.appPresets) settings.appPresets = status.appPresets;
      fillSettings(settings);
    } else if (status?.appPresets) {
      renderApps(status.appPresets);
    }
    fillStatus(status || {});
  }

  $("btnSave")?.addEventListener("click", () => {
    const result = call("saveSettings", JSON.stringify(readFormSettings()));
    const parsed = parseJson(result, { ok: false });
    toast(parsed.message || "저장되었습니다", "saveMsg");
    refresh();
  });
  $("btnSaveFilters")?.addEventListener("click", () => {
    const result = call("saveSettings", JSON.stringify(readFormSettings()));
    const parsed = parseJson(result, { ok: false });
    toast(parsed.message || "저장되었습니다", "filtersMsg");
    refresh();
  });
  $("btnSaveApps")?.addEventListener("click", () => {
    const result = call("saveSettings", JSON.stringify(readFormSettings()));
    const parsed = parseJson(result, { ok: false });
    toast(parsed.message || "저장되었습니다", "appsMsg");
    refresh();
  });
  $("appAddSearch")?.addEventListener("input", renderInstalledApps);
  $("btnAddSelectedApps")?.addEventListener("click", () => {
    const selected = installedApps
      .filter((app) => selectedInstalledPackages.has(app.packageName))
      .map((app) => ({ packageName: app.packageName, label: app.label }));
    if (!selected.length) return;
    const parsed = parseJson(call("addCustomWatchedApps", JSON.stringify(selected)), {
      ok: false,
      message: "앱 추가 실패",
    });
    toast(parsed.message || (parsed.ok ? "앱이 추가되었습니다" : "추가 실패"), "appAddMsg");
    if (parsed.ok) {
      setTimeout(() => {
        goBack();
        refresh();
      }, 350);
    }
  });
  $("btnSaveRuleAlert")?.addEventListener("click", () => {
    if (!currentRuleId) return;
    const payload = JSON.stringify({
      id: currentRuleId,
      level: ruleEditState.level,
      soundId: ruleEditState.soundId,
    });
    const parsed = parseJson(call("updateWatchRule", payload), {
      ok: false,
      message: "저장 실패",
    });
    toast(parsed.message || (parsed.ok ? "저장되었습니다" : "저장 실패"), "ruleAlertMsg");
    if (parsed.ok) {
      setTimeout(() => {
        goBack();
        refresh();
      }, 350);
    }
  });
  $("btnOpenLinkApp")?.addEventListener("click", openLinkApp);
  $("btnScanActive")?.addEventListener("click", scanActiveLinkNotifications);
  $("btnSearchLog")?.addEventListener("click", searchNotificationLog);
  $("notifLogSearch")?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") searchNotificationLog();
  });
  $("btnManualRegisterActive")?.addEventListener("click", () => {
    registerFromLink(linkSelectedPackage, $("manualMatchTitle")?.value, true);
  });
  $("btnManualRegisterInactive")?.addEventListener("click", () => {
    registerFromLink(linkSelectedPackage, $("manualMatchTitle")?.value, false);
  });

  $("btnPickRuleAvatar")?.addEventListener("click", () => {
    if (!currentRuleId) return;
    call("pickRuleAvatar", currentRuleId);
  });
  $("btnClearRuleAvatar")?.addEventListener("click", () => {
    if (!currentRuleId) return;
    const parsed = parseJson(call("clearRuleAvatar", currentRuleId), {
      ok: false,
      message: "사진 삭제 실패",
    });
    toast(parsed.message || (parsed.ok ? "사진을 삭제했습니다" : "사진 삭제 실패"), "ruleAlertMsg");
    if (parsed.ok) refresh();
  });
  $("btnSaveDesign")?.addEventListener("click", () => {
    const result = call("saveSettings", JSON.stringify(designPayload()));
    const parsed = parseJson(result, { ok: false });
    const msgId = $("designDetailMsg") ? "designDetailMsg" : "designMsg";
    toast(parsed.ok ? "저장되었습니다" : parsed.message, msgId);
  });

  $("enabled")?.addEventListener("change", () => {
    call("saveSettings", JSON.stringify({ enabled: $("enabled").checked }));
    setTimeout(refresh, 200);
  });

  $("updateBannerDismiss")?.addEventListener("click", () => {
    try {
      call("dismissUpdateNotice");
    } catch (_) {
      const banner = $("updateBanner");
      if (banner) banner.hidden = true;
    }
    refresh();
  });

  $("webUiBannerDismiss")?.addEventListener("click", () => {
    const banner = $("webUiBanner");
    const rev = parseInt(banner?.dataset?.remoteRev || "0", 10);
    const ls = webUiRevStorage();
    if (ls && rev > 0) ls.setItem(WEB_UI_DISMISS_KEY, String(rev));
    if (banner) banner.hidden = true;
  });

  document.querySelectorAll("[data-action]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const action = btn.getAttribute("data-action");
      switch (action) {
        case "openListener": call("openListenerSettings"); break;
        case "openOverlay": call("openOverlaySettings"); break;
        case "openFsi": call("openFullScreenSettings"); break;
        case "checkUpdate": call("checkForUpdate"); break;
        case "reloadWebUi": {
          const rev = parseInt($("webUiBanner")?.dataset?.remoteRev || "0", 10);
          const ls = webUiRevStorage();
          if (ls && rev > 0) ls.setItem(WEB_UI_REV_KEY, String(rev));
          call("reloadWebUi");
          break;
        }
        case "testNormal":
          call("saveSettings", JSON.stringify(designPayload()));
          call("testAlert", "normal");
          break;
        case "testCritical":
          call("saveSettings", JSON.stringify(designPayload()));
          call("testAlert", "critical");
          break;
        case "clearRecent": {
          const r = parseJson(call("clearRecentNotifications"), { ok: false });
          toast(r.message || "비웠습니다", "filtersMsg");
          break;
        }
        case "statusTap":
          if (!appReady) {
            switchTab("home");
            openSubpage("setup");
          } else {
            refresh();
          }
          break;
        case "refresh": break;
        default: break;
      }
      setTimeout(refresh, 400);
    });
  });

  window.NotiSirenWeb = {
    onResume: refresh,
    onUpdateAvailable: refresh,
    onAppLinkReturn: (packageName) => {
      if (packageName) linkSelectedPackage = packageName;
      renderLinkAppPicker(cachedAppPresets);
      if (currentSub === "notif-link") {
        toast("앱에서 돌아왔습니다. 알림창을 스캔합니다", "notifLinkMsg");
        scanActiveLinkNotifications();
      } else {
        refresh();
      }
    },
    onAvatarPicked: (ruleId, saved) => {
      refresh();
      if (ruleId === currentRuleId) {
        toast(saved ? "프로필 사진을 저장했습니다" : "사진을 저장하지 못했습니다", "ruleAlertMsg");
      }
    },
    /** @returns {boolean} true = 인앱에서 처리(이전화면), false = 홈이라 앱 백그라운드 */
    onBack: () => {
      return goBack();
    },
  };

  function fitShellToScreen() {
    const shell = document.querySelector(".app-shell");
    if (!shell || window.matchMedia("(max-width: 519px)").matches) {
      if (shell) {
        shell.style.height = "";
        shell.style.top = "";
      }
      return;
    }
    const cap = Math.max(480, Math.min(760, (window.screen?.height || 720) - 48));
    shell.style.height = cap + "px";
    shell.style.top = "8px";
  }

  updateLockPreviewClock();
  renderDesignPickers();
  bindHeroCarousel();
  const hashTab = (location.hash || "").replace("#", "");
  navigate(
    { tab: ["home", "rules", "design", "settings"].includes(hashTab) ? hashTab : "home", sub: null },
    { replace: true },
  );
  fitShellToScreen();
  window.addEventListener("resize", fitShellToScreen);
  refresh();
  setTimeout(refresh, 200);

  window.NayaNav = {
    openSubpage,
    closeSubpage,
    switchTab,
    navigate,
    goBack,
    openDetailPick: () => openSubpage("design-detail"),
    openStylePick: () => openSubpage("design-style"),
    openFramePick: () => openSubpage("design-frame"),
    openFontPick: () => openSubpage("design-font"),
    openSoundPick: () => openSubpage("design-sound"),
  };
})();
