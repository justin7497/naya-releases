(() => {
  const $ = (id) => document.getElementById(id);

  let heroIdx = 0;
  let heroLbIdx = 0;
  let tapLock = 0;

  const pinch = {
    scale: 1,
    tx: 0,
    ty: 0,
    min: 1,
    max: 4,
  };

  function slides() {
    return [...document.querySelectorAll(".home-hero-slide")];
  }

  function imageAt(idx) {
    const slide = slides()[idx];
    if (!slide) return null;
    const img = slide.querySelector(".home-hero-img, img");
    if (!img) return null;
    const src = img.currentSrc || img.getAttribute("src") || img.src;
    if (!src) return null;
    return { src, alt: img.alt || "" };
  }

  function heroImgIndex(img) {
    if (!img) return heroIdx;
    const raw = img.getAttribute("data-hero-zoom");
    if (raw != null && raw !== "") {
      const n = Number(raw);
      if (!Number.isNaN(n)) return n;
    }
    const list = slides();
    const found = list.findIndex((slide) => slide.contains(img));
    return found >= 0 ? found : heroIdx;
  }

  function lightboxHtml() {
    return (
      '<button type="button" class="hero-lightbox-close" id="heroLightboxClose" aria-label="닫기">×</button>' +
      '<button type="button" class="hero-lightbox-nav prev" id="heroLightboxPrev" aria-label="이전 배너">‹</button>' +
      '<button type="button" class="hero-lightbox-nav next" id="heroLightboxNext" aria-label="다음 배너">›</button>' +
      '<div class="hero-lightbox-body" id="heroLightboxBody">' +
      '<div class="hero-lightbox-pinch" id="heroLightboxPinch">' +
      '<img id="heroLightboxImg" src="" alt="" draggable="false" />' +
      "</div>" +
      '<p class="hero-lightbox-pinch-hint" id="heroLightboxPinchHint">두 손가락으로 확대 · 드래그로 이동</p>' +
      '<p class="hero-lightbox-cap" id="heroLightboxCap"></p>' +
      "</div>"
    );
  }

  function ensureLightbox() {
    let box = $("heroLightbox");
    if (box) return box;
    box = document.createElement("div");
    box.className = "hero-lightbox";
    box.id = "heroLightbox";
    box.hidden = true;
    box.setAttribute("aria-modal", "true");
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-label", "배너 확대 보기");
    box.innerHTML = lightboxHtml();
    document.body.appendChild(box);
    return box;
  }

  function ensurePinchStage() {
    const body = $("heroLightboxBody");
    const img = $("heroLightboxImg");
    if (!body || !img) return null;
    let stage = $("heroLightboxPinch");
    if (!stage) {
      stage = document.createElement("div");
      stage.className = "hero-lightbox-pinch";
      stage.id = "heroLightboxPinch";
      body.insertBefore(stage, img);
      stage.appendChild(img);
    }
    if (!$("heroLightboxPinchHint")) {
      const hint = document.createElement("p");
      hint.className = "hero-lightbox-pinch-hint";
      hint.id = "heroLightboxPinchHint";
      hint.textContent = "두 손가락으로 확대 · 드래그로 이동";
      const cap = $("heroLightboxCap");
      if (cap) body.insertBefore(hint, cap);
      else body.appendChild(hint);
    }
    return stage;
  }

  function mountLightbox() {
    const box = ensureLightbox();
    if (box.parentElement !== document.body) document.body.appendChild(box);
    ensurePinchStage();
    return box;
  }

  function applyPinchTransform() {
    const img = $("heroLightboxImg");
    const stage = $("heroLightboxPinch");
    if (!img) return;
    img.style.transform = `translate3d(${pinch.tx}px, ${pinch.ty}px, 0) scale(${pinch.scale})`;
    stage?.classList.toggle("is-zoomed", pinch.scale > 1.04);
  }

  function clampPan() {
    const stage = $("heroLightboxPinch");
    if (!stage) return;
    const maxX = (stage.clientWidth * (pinch.scale - 1)) / 2;
    const maxY = (stage.clientHeight * (pinch.scale - 1)) / 2;
    pinch.tx = Math.max(-maxX, Math.min(maxX, pinch.tx));
    pinch.ty = Math.max(-maxY, Math.min(maxY, pinch.ty));
  }

  function resetPinch() {
    pinch.scale = 1;
    pinch.tx = 0;
    pinch.ty = 0;
    applyPinchTransform();
  }

  function renderLightbox(idx) {
    const box = mountLightbox();
    const imgEl = $("heroLightboxImg");
    const capEl = $("heroLightboxCap");
    const list = slides();
    if (!imgEl || !list.length) return false;
    heroLbIdx = ((idx % list.length) + list.length) % list.length;
    const data = imageAt(heroLbIdx);
    if (!data) return false;
    resetPinch();
    imgEl.src = data.src;
    imgEl.alt = data.alt;
    if (capEl) capEl.textContent = data.alt;
    const prev = $("heroLightboxPrev");
    const next = $("heroLightboxNext");
    if (prev) prev.hidden = list.length < 2;
    if (next) next.hidden = list.length < 2;
    box.classList.add("is-open");
    return true;
  }

  function openLightbox(idx) {
    if (Date.now() - tapLock < 280) return false;
    tapLock = Date.now();
    const box = mountLightbox();
    const target =
      typeof idx === "number" && !Number.isNaN(idx)
        ? idx
        : Number.isFinite(heroIdx)
          ? heroIdx
          : 0;
    if (!renderLightbox(target)) return false;
    box.removeAttribute("hidden");
    box.hidden = false;
    box.setAttribute("aria-hidden", "false");
    document.body.classList.add("hero-lb-open");
    document.body.style.overflow = "hidden";
    return true;
  }

  function closeLightbox() {
    const box = $("heroLightbox");
    if (!box || box.hidden) return false;
    resetPinch();
    box.hidden = true;
    box.setAttribute("hidden", "");
    box.setAttribute("aria-hidden", "true");
    box.classList.remove("is-open");
    document.body.classList.remove("hero-lb-open");
    document.body.style.overflow = "";
    return true;
  }

  function resolveIdx(el, rawIdx) {
    if (typeof rawIdx === "number" && !Number.isNaN(rawIdx)) return rawIdx;
    const attr = el?.getAttribute?.("data-hero-zoom");
    if (attr != null && attr !== "") return Number(attr);
    return heroIdx;
  }

  window.__nayaHeroZoom = (e, idx) => {
    if (e?.preventDefault) e.preventDefault();
    if (e?.stopPropagation) e.stopPropagation();
    openLightbox(resolveIdx(e?.currentTarget, idx));
    return false;
  };
  window.__nayaHeroOpen = openLightbox;
  window.__nayaHeroClose = closeLightbox;
  window.__nayaHeroIsPinchZoomed = () => pinch.scale > 1.04;

  function syncHeroIdx() {
    const track = $("homeHeroTrack");
    const list = slides();
    if (!track || !list.length) return;
    const i = Math.round(track.scrollLeft / Math.max(1, track.clientWidth));
    heroIdx = Math.max(0, Math.min(list.length - 1, i));
  }

  function bindPinchZoom() {
    const stage = ensurePinchStage();
    if (!stage || stage.dataset.pinchBound === "1") return;
    stage.dataset.pinchBound = "1";

    let pinchStartDist = 0;
    let pinchStartScale = 1;
    let panAnchor = null;
    let lastTapAt = 0;
    let swipeStartX = 0;

    const touchDist = (a, b) => Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);

    stage.addEventListener(
      "touchstart",
      (e) => {
        if (e.touches.length === 2) {
          pinchStartDist = touchDist(e.touches[0], e.touches[1]);
          pinchStartScale = pinch.scale;
          panAnchor = null;
          e.preventDefault();
          return;
        }
        if (e.touches.length === 1) {
          swipeStartX = e.touches[0].clientX;
          const now = Date.now();
          if (now - lastTapAt < 320) {
            if (pinch.scale > 1.08) resetPinch();
            else {
              pinch.scale = 2.2;
              clampPan();
              applyPinchTransform();
            }
            lastTapAt = 0;
            e.preventDefault();
            return;
          }
          lastTapAt = now;
          if (pinch.scale > 1.04) {
            panAnchor = {
              x: e.touches[0].clientX - pinch.tx,
              y: e.touches[0].clientY - pinch.ty,
            };
          }
        }
      },
      { passive: false },
    );

    stage.addEventListener(
      "touchmove",
      (e) => {
        if (e.touches.length === 2 && pinchStartDist > 0) {
          e.preventDefault();
          const d = touchDist(e.touches[0], e.touches[1]);
          pinch.scale = Math.min(pinch.max, Math.max(pinch.min, pinchStartScale * (d / pinchStartDist)));
          clampPan();
          applyPinchTransform();
          return;
        }
        if (e.touches.length === 1 && panAnchor && pinch.scale > 1.04) {
          e.preventDefault();
          pinch.tx = e.touches[0].clientX - panAnchor.x;
          pinch.ty = e.touches[0].clientY - panAnchor.y;
          clampPan();
          applyPinchTransform();
        }
      },
      { passive: false },
    );

    stage.addEventListener("touchend", (e) => {
      if (e.touches.length < 2) pinchStartDist = 0;
      if (e.touches.length === 0) panAnchor = null;
      if (pinch.scale < 1.05) resetPinch();
      else clampPan();
      applyPinchTransform();

      if (
        e.changedTouches.length === 1 &&
        pinch.scale <= 1.04 &&
        Math.abs(e.changedTouches[0].clientX - swipeStartX) > 56
      ) {
        if (e.changedTouches[0].clientX < swipeStartX) renderLightbox(heroLbIdx + 1);
        else renderLightbox(heroLbIdx - 1);
      }
    });

    stage.addEventListener(
      "wheel",
      (e) => {
        if (!stage.closest(".hero-lightbox") || $("heroLightbox")?.hidden) return;
        e.preventDefault();
        const delta = e.deltaY < 0 ? 0.12 : -0.12;
        pinch.scale = Math.min(pinch.max, Math.max(pinch.min, pinch.scale + delta));
        clampPan();
        applyPinchTransform();
      },
      { passive: false },
    );
  }

  function bindHomeHeroImageTap() {
    const track = $("homeHeroTrack");
    if (!track || track.dataset.imgTapBound === "1") return;
    track.dataset.imgTapBound = "1";

    let touchStart = null;
    let lastImageTapAt = 0;
    let swipeGesture = false;

    const clearTouch = () => {
      touchStart = null;
      swipeGesture = false;
    };

    track.addEventListener(
      "touchstart",
      (e) => {
        if (e.touches.length !== 1) {
          clearTouch();
          return;
        }
        const img = e.target.closest(".home-hero-img");
        if (!img) {
          clearTouch();
          return;
        }
        swipeGesture = false;
        touchStart = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
          t: Date.now(),
          img,
          scrollLeft: track.scrollLeft,
        };
      },
      { passive: true },
    );

    track.addEventListener(
      "touchmove",
      (e) => {
        if (!touchStart || e.touches.length !== 1) return;
        const dx = Math.abs(e.touches[0].clientX - touchStart.x);
        const dy = Math.abs(e.touches[0].clientY - touchStart.y);
        if (dx > 5 || dx >= dy) swipeGesture = true;
        if (Math.abs(track.scrollLeft - touchStart.scrollLeft) > 1) swipeGesture = true;
      },
      { passive: true },
    );

    track.addEventListener("touchcancel", clearTouch, { passive: true });

    track.addEventListener(
      "scroll",
      () => {
        if (touchStart) swipeGesture = true;
      },
      { passive: true },
    );

    track.addEventListener(
      "touchend",
      (e) => {
        if (!touchStart) return;
        const t = e.changedTouches[0];
        const dx = Math.abs(t.clientX - touchStart.x);
        const dy = Math.abs(t.clientY - touchStart.y);
        const dt = Date.now() - touchStart.t;
        const img = touchStart.img;
        const scrolled = Math.abs(track.scrollLeft - touchStart.scrollLeft) > 2;
        const wasSwipe = swipeGesture;
        clearTouch();

        if (wasSwipe || scrolled) return;
        if (dx > 7 || dy > 10 || dt > 550) return;
        if (dx > dy * 0.35) return;

        lastImageTapAt = Date.now();
        openLightbox(heroImgIndex(img));
      },
      { passive: true },
    );

    track.addEventListener("click", (e) => {
      if ("ontouchstart" in window) return;
      if (Date.now() - lastImageTapAt < 450) return;
      const img = e.target.closest(".home-hero-img");
      if (!img) return;
      openLightbox(heroImgIndex(img));
    });
  }

  function bindControls() {
    if (document.body.dataset.heroZoomJs === "1") return;
    document.body.dataset.heroZoomJs = "1";
    mountLightbox();
    bindPinchZoom();
    bindHomeHeroImageTap();

    $("heroLightboxClose")?.addEventListener("click", () => closeLightbox());
    $("heroLightboxPrev")?.addEventListener("click", () => renderLightbox(heroLbIdx - 1));
    $("heroLightboxNext")?.addEventListener("click", () => renderLightbox(heroLbIdx + 1));
    $("heroLightboxBody")?.addEventListener("click", (e) => {
      if (e.target === e.currentTarget) closeLightbox();
    });

    const track = $("homeHeroTrack");
    if (track) {
      track.addEventListener("scroll", syncHeroIdx, { passive: true });
      syncHeroIdx();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindControls);
  } else {
    bindControls();
  }
})();
