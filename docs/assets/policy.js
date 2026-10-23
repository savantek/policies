(() => {
    "use strict";

    const printButton = document.querySelector("[data-print]");
    if (printButton && typeof window.print === "function") {
        printButton.hidden = false;
        printButton.addEventListener("click", () => window.print());
    }

    const contents = document.querySelector(".contents");
    const links = Array.from(document.querySelectorAll(".contents a[href^='#']"));
    const sections = links.map((link) => document.getElementById(link.hash.slice(1)));
    if (!contents || sections.some((section) => !section)) return;

    const compact = window.matchMedia("(max-width: 760px)");
    const setContentsLayout = () => { contents.open = !compact.matches; };
    setContentsLayout();
    compact.addEventListener("change", setContentsLayout);

    links.forEach((link) => {
        link.addEventListener("click", () => {
            if (!compact.matches) return;
            // Collapse before native fragment navigation calculates its destination.
            contents.open = false;
            const destination = document.getElementById(link.hash.slice(1));
            destination.focus({ preventScroll: true });
        });
    });

    let scheduled = false;
    let current = -1;
    const updateCurrentSection = () => {
        let index = 0;
        sections.forEach((section, position) => {
            if (section.getBoundingClientRect().top <= 120) index = position;
        });
        if (window.scrollY > 0 && window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
            index = sections.length - 1;
        }
        if (index !== current) {
            links.forEach((link, position) => {
                if (position === index) link.setAttribute("aria-current", "location");
                else link.removeAttribute("aria-current");
            });
            current = index;
        }
        scheduled = false;
    };
    const scheduleUpdate = () => {
        if (!scheduled) {
            scheduled = true;
            window.requestAnimationFrame(updateCurrentSection);
        }
    };
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    window.addEventListener("hashchange", scheduleUpdate);
    updateCurrentSection();
})();
