(() => {
  function bindPrivacyPager(root) {
    const scope = root || document;
    const pager = scope.querySelector("[data-privacy-pager]");
    if (!pager) return;

    const pages = [...pager.querySelectorAll(".privacy-page")];
    const nav = scope.querySelector("[data-privacy-nav]") || pager.parentElement?.querySelector("[data-privacy-nav]");
    if (!pages.length || !nav) return;

    const prevBtn = nav.querySelector("[data-privacy-prev]");
    const nextBtn = nav.querySelector("[data-privacy-next]");
    const dots = [...nav.querySelectorAll(".privacy-dot")];
    let idx = 0;
    const total = pages.length;

    function show(n) {
      idx = Math.max(0, Math.min(total - 1, n));
      pages.forEach((p, i) => p.classList.toggle("is-active", i === idx));
      dots.forEach((d, i) => d.classList.toggle("is-active", i === idx));
      if (prevBtn) prevBtn.disabled = idx === 0;
      if (nextBtn) {
        nextBtn.disabled = idx === total - 1;
        nextBtn.textContent = idx === total - 1 ? "끝" : "다음";
      }
    }

    if (pager.dataset.bound !== "1") {
      pager.dataset.bound = "1";
      prevBtn?.addEventListener("click", () => show(idx - 1));
      nextBtn?.addEventListener("click", () => show(idx + 1));
      dots.forEach((d) => {
        d.addEventListener("click", () => show(Number(d.getAttribute("data-go") || 0)));
      });
    }
    show(0);

    pager._nayaPrivacyGoBack = () => {
      if (idx > 0) {
        show(idx - 1);
        return true;
      }
      return false;
    };
  }

  window.NayaPrivacyPager = {
    bind: bindPrivacyPager,
    goBack: () => {
      const pager = document.querySelector("#sub-privacy [data-privacy-pager], [data-privacy-pager]");
      return !!(pager && pager._nayaPrivacyGoBack && pager._nayaPrivacyGoBack());
    },
  };
  bindPrivacyPager(document);
})();
