(() => {
  const $ = (id) => document.getElementById(id);

  let heroIdx = 0;
  let heroLbIdx = 0;
  let tapLock = 0;

  function slides() {
    return [...document.querySelectorAll(".home-hero-slide")];
  }

  function imageAt(idx) {
    const slide = slides()[idx];
    if (!slide) return null;
    const img = slide.querySelector("img");
    if (!img) return null;
    const src = img.currentSrc || img.getAttribute("src") || img.src;
    if (!src) return null;
    return { src, alt: img.alt || "" };
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
    box.innerHTML =
      '<button type="button" class="hero-lightbox-close" id="heroLightboxClose" aria-label="닫기">×</button>' +
      '<button type="button" class="hero-lightbox-nav prev" id="heroLightboxPrev" aria-label="이전 배너">‹</button>' +
      '<button type="button" class="hero-lightbox-nav next" id="heroLightboxNext" aria-label="다음 배너">›</button>' +
      '<div class="hero-lightbox-body" id="heroLightboxBody">' +
      '<img id="heroLightboxImg" src="" alt="" />' +
      '<p class="hero-lightbox-cap" id="heroLightboxCap"></p>' +
      "</div>";
    document.body.appendChild(box);
    return box;
  }

  function mountLightbox() {
    const box = ensureLightbox();
    if (box.parentElement !== document.body) document.body.appendChild(box);
    return box;
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

  function syncHeroIdx() {
    const track = $("homeHeroTrack");
    const list = slides();
    if (!track || !list.length) return;
    const i = Math.round(track.scrollLeft / Math.max(1, track.clientWidth));
    heroIdx = Math.max(0, Math.min(list.length - 1, i));
  }

  function bindControls() {
    if (document.body.dataset.heroZoomJs === "1") return;
    document.body.dataset.heroZoomJs = "1";
    mountLightbox();

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

    document.querySelectorAll(".home-hero-zoom").forEach((btn) => {
      if (btn.dataset.heroZoomJs === "1") return;
      btn.dataset.heroZoomJs = "1";
      const idx = Number(btn.getAttribute("data-hero-zoom") || 0);
      btn.addEventListener("click", (e) => window.__nayaHeroZoom(e, idx));
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindControls);
  } else {
    bindControls();
  }
})();
