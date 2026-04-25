export function createInteractionShell({
  mount = document.body,
}) {
  const rail = document.createElement("div");
  rail.style.position = "absolute";
  rail.style.left = "0";
  rail.style.right = "0";
  rail.style.bottom = "0";
  rail.style.padding = "14px 14px 18px";
  rail.style.display = "flex";
  rail.style.justifyContent = "center";
  rail.style.pointerEvents = "none";
  rail.style.fontFamily = 'system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif';
  rail.style.zIndex = "20";

  const railInner = document.createElement("div");
  railInner.style.width = "min(92vw, 720px)";
  railInner.style.maxWidth = "720px";
  railInner.style.border = "1px solid rgba(255,255,255,0.10)";
  railInner.style.background = "rgba(4,6,10,0.34)";
  railInner.style.backdropFilter = "blur(10px)";
  railInner.style.webkitBackdropFilter = "blur(10px)";
  railInner.style.boxShadow = "0 10px 30px rgba(0,0,0,0.18)";
  railInner.style.opacity = "0";
  railInner.style.transition = "opacity 220ms ease";
  railInner.style.display = "grid";
  railInner.style.gap = "10px 12px";
  railInner.style.alignItems = "center";

  const railTitle = document.createElement("div");
  railTitle.style.fontSize = "10px";
  railTitle.style.letterSpacing = "0.22em";
  railTitle.style.textTransform = "uppercase";
  railTitle.style.color = "rgba(255,255,255,0.84)";
  railTitle.style.whiteSpace = "nowrap";

  const railCaption = document.createElement("div");
  railCaption.style.fontSize = "12px";
  railCaption.style.lineHeight = "1.45";
  railCaption.style.color = "rgba(255,255,255,0.66)";
  railCaption.style.minWidth = "0";
  railCaption.style.overflow = "hidden";
  railCaption.style.display = "-webkit-box";
  railCaption.style.webkitLineClamp = "2";
  railCaption.style.webkitBoxOrient = "vertical";

  const railHint = document.createElement("div");
  railHint.style.fontSize = "10px";
  railHint.style.letterSpacing = "0.16em";
  railHint.style.textTransform = "uppercase";
  railHint.style.color = "rgba(255,255,255,0.42)";
  railHint.style.whiteSpace = "nowrap";
  railHint.textContent = "C copy · O open";

  const railMeter = document.createElement("div");
  railMeter.style.height = "3px";
  railMeter.style.background = "rgba(255,255,255,0.10)";
  railMeter.style.position = "relative";
  railMeter.style.overflow = "hidden";
  railMeter.style.borderRadius = "999px";
  railMeter.style.minWidth = "120px";

  const railMeterFill = document.createElement("div");
  railMeterFill.style.height = "100%";
  railMeterFill.style.width = "0%";
  railMeterFill.style.background = "linear-gradient(90deg, rgba(155,188,255,0.78), rgba(255,255,255,0.88))";
  railMeterFill.style.borderRadius = "999px";
  railMeterFill.style.boxShadow = "0 0 14px rgba(155,188,255,0.18)";
  railMeterFill.style.transition = "width 120ms linear";

  railMeter.appendChild(railMeterFill);
  railInner.appendChild(railTitle);
  railInner.appendChild(railCaption);
  railInner.appendChild(railHint);
  railInner.appendChild(railMeter);
  rail.appendChild(railInner);

  const desktopHint = document.createElement("div");
  desktopHint.style.position = "absolute";
  desktopHint.style.left = "16px";
  desktopHint.style.top = "16px";
  desktopHint.style.padding = "8px 10px";
  desktopHint.style.border = "1px solid rgba(255,255,255,0.10)";
  desktopHint.style.background = "rgba(4,6,10,0.22)";
  desktopHint.style.backdropFilter = "blur(8px)";
  desktopHint.style.webkitBackdropFilter = "blur(8px)";
  desktopHint.style.color = "rgba(255,255,255,0.68)";
  desktopHint.style.fontSize = "9px";
  desktopHint.style.letterSpacing = "0.16em";
  desktopHint.style.textTransform = "uppercase";
  desktopHint.style.fontFamily = 'system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif';
  desktopHint.style.pointerEvents = "none";
  desktopHint.style.zIndex = "20";
  desktopHint.style.maxWidth = "min(62vw, 420px)";
  desktopHint.style.lineHeight = "1.45";
  desktopHint.textContent = "Desktop Preview";

  const vrHint = document.createElement("div");
  vrHint.style.position = "absolute";
  vrHint.style.left = "50%";
  vrHint.style.top = "16px";
  vrHint.style.transform = "translateX(-50%)";
  vrHint.style.padding = "8px 12px";
  vrHint.style.border = "1px solid rgba(255,255,255,0.10)";
  vrHint.style.background = "rgba(4,6,10,0.22)";
  vrHint.style.backdropFilter = "blur(8px)";
  vrHint.style.webkitBackdropFilter = "blur(8px)";
  vrHint.style.color = "rgba(255,255,255,0.74)";
  vrHint.style.fontSize = "9px";
  vrHint.style.letterSpacing = "0.16em";
  vrHint.style.textTransform = "uppercase";
  vrHint.style.fontFamily = 'system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif';
  vrHint.style.pointerEvents = "none";
  vrHint.style.zIndex = "20";
  vrHint.style.opacity = "0";
  vrHint.style.transition = "opacity 180ms ease";
  vrHint.textContent = "Look to focus · Hold to move forward";

  mount.appendChild(rail);
  mount.appendChild(desktopHint);
  mount.appendChild(vrHint);

  const applyResponsiveLayout = () => {
    const compact = window.innerWidth < 980 || window.innerHeight < 760;

    if (compact) {
      rail.style.padding = "12px 12px 14px";

      railInner.style.padding = "10px 12px";
      railInner.style.gridTemplateColumns = "1fr auto";
      railInner.style.gridTemplateRows = "auto auto auto";
      railInner.style.width = "min(94vw, 620px)";

      railTitle.style.gridColumn = "1 / 2";
      railTitle.style.gridRow = "1 / 2";

      railHint.style.gridColumn = "2 / 3";
      railHint.style.gridRow = "1 / 2";
      railHint.style.display = "none";

      railCaption.style.gridColumn = "1 / 3";
      railCaption.style.gridRow = "2 / 3";

      railMeter.style.gridColumn = "1 / 3";
      railMeter.style.gridRow = "3 / 4";
      railMeter.style.width = "100%";

      desktopHint.style.maxWidth = "min(72vw, 320px)";
      desktopHint.style.fontSize = "8px";
      desktopHint.style.letterSpacing = "0.14em";
    } else {
      rail.style.padding = "14px 14px 18px";

      railInner.style.padding = "12px 14px";
      railInner.style.gridTemplateColumns = "120px 1fr auto 132px";
      railInner.style.gridTemplateRows = "auto";
      railInner.style.width = "min(92vw, 720px)";

      railTitle.style.gridColumn = "1 / 2";
      railTitle.style.gridRow = "1 / 2";

      railCaption.style.gridColumn = "2 / 3";
      railCaption.style.gridRow = "1 / 2";

      railHint.style.gridColumn = "3 / 4";
      railHint.style.gridRow = "1 / 2";
      railHint.style.display = window.innerWidth < 1180 ? "none" : "block";

      railMeter.style.gridColumn = "4 / 5";
      railMeter.style.gridRow = "1 / 2";
      railMeter.style.width = "132px";

      desktopHint.style.maxWidth = "min(62vw, 420px)";
      desktopHint.style.fontSize = "9px";
      desktopHint.style.letterSpacing = "0.16em";
    }
  };

  applyResponsiveLayout();
  window.addEventListener("resize", applyResponsiveLayout);

  const setRail = ({ pid = "", caption = "", visible = false, hintOpacity = 1 } = {}) => {
    if (visible) {
      railInner.style.opacity = "1";
      railTitle.textContent = pid;
      railCaption.textContent = caption;
      railHint.style.opacity = String(hintOpacity);
    } else {
      railInner.style.opacity = "0";
      railTitle.textContent = "";
      railCaption.textContent = "";
      railHint.style.opacity = "0.82";
    }
  };

  const setMeterProgress = (p = 0) => {
    const safe = Math.max(0, Math.min(1, Number.isFinite(p) ? p : 0));
    railMeterFill.style.width = `${Math.round(safe * 100)}%`;
  };

  const setDesktopHint = (text) => {
    if (typeof text === "string" && text.trim()) {
      desktopHint.textContent = text;
    }
  };

  const setDesktopHintVisible = (visible) => {
    desktopHint.style.opacity = visible ? "1" : "0";
  };

  const setVRHint = (text) => {
    if (typeof text === "string" && text.trim()) {
      vrHint.textContent = text;
    }
  };

  const setVRHintVisible = (visible) => {
    vrHint.style.opacity = visible ? "1" : "0";
  };

  const dispose = () => {
    window.removeEventListener("resize", applyResponsiveLayout);
    try { rail.remove(); } catch {}
    try { desktopHint.remove(); } catch {}
    try { vrHint.remove(); } catch {}
  };

  return {
    rail,
    railInner,
    railTitle,
    railCaption,
    railHint,
    railMeter,
    railMeterFill,
    desktopHint,
    vrHint,
    setRail,
    setMeterProgress,
    setDesktopHint,
    setDesktopHintVisible,
    setVRHint,
    setVRHintVisible,
    dispose,
  };
}
