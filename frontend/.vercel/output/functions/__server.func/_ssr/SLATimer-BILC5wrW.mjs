import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
function SLATimer({ dueAt }) {
  const [now, setNow] = reactExports.useState(null);
  reactExports.useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1e3);
    return () => clearInterval(id);
  }, []);
  if (dueAt == null || now == null) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `mono text-[11px] px-1.5 py-0.5 rounded border bg-muted/40 text-muted-foreground border-border`, children: "—" });
  }
  const ms = dueAt - now;
  const breached = ms <= 0;
  const sec = Math.abs(Math.floor(ms / 1e3));
  const h = Math.floor(sec / 3600);
  const m = Math.floor(sec % 3600 / 60);
  const s = sec % 60;
  const fmt = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  const urgent = !breached && ms < 5 * 6e4;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "span",
    {
      className: `mono text-[11px] px-1.5 py-0.5 rounded border ${breached ? "bg-critical/15 text-critical border-critical/50 pulse-critical" : urgent ? "bg-warning/15 text-warning border-warning/40" : "bg-muted/40 text-muted-foreground border-border"}`,
      children: breached ? "SLA BREACHED" : fmt
    }
  );
}
export {
  SLATimer as S
};
