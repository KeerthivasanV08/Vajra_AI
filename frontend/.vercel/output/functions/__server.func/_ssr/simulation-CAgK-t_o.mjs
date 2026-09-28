import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { y as runLiveAttackSimulation } from "./api-03VgCQYK.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { ae as Zap, Q as Play, _ as ShieldAlert, d as ArrowRight } from "../_libs/lucide-react.mjs";
import "./caseNormalizer-BzVobBFG.mjs";
import "./router-DXMls9-H.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
function SimulationPage() {
  const [victimId, setVictimId] = reactExports.useState("ACC_VICTIM_999");
  const [stolenAmount, setStolenAmount] = reactExports.useState(25e4);
  const [simResult, setSimResult] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(false);
  const handleRunSim = async () => {
    setLoading(true);
    try {
      const res = await runLiveAttackSimulation({
        victim_account_id: victimId.trim() || void 0,
        initial_amount_inr: Number(stolenAmount) || 25e4
      });
      setSimResult(res);
      toast.success("Live Multi-Hop Fraud Simulation Complete!");
    } catch (err) {
      toast.error(`Simulation failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col h-full bg-slate-950 text-slate-200 p-4 space-y-4 overflow-y-auto select-none", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between p-4 rounded-xl bg-slate-900 border border-slate-800 shrink-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "w-6 h-6 text-amber-400" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-sm font-bold text-white font-mono tracking-wider", children: "LIVE MULTI-HOP FRAUD ATTACK SIMULATOR" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-slate-400", children: "Simulate Real-Time Victim-to-Mule Layering & Predicted Physical Cash-Out Interception" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: handleRunSim, disabled: loading, className: "px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition-colors flex items-center gap-2 shadow-lg shadow-amber-950/50 disabled:opacity-50 font-mono", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "w-4 h-4 fill-current" }),
        loading ? "Simulating Attack Stream..." : "TRIGGER LIVE FRAUD ATTACK SIMULATION"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 text-xs font-mono", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-400", children: "Victim Account ID" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: victimId, onChange: (e) => setVictimId(e.target.value), className: "bg-slate-950 border border-slate-800 rounded px-3 py-1 text-slate-200" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-400", children: "Stolen Amount (INR)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", min: 1e3, step: 1e4, value: stolenAmount, onChange: (e) => setStolenAmount(Number(e.target.value) || 0), className: "bg-slate-950 border border-slate-800 rounded px-3 py-1 text-emerald-400 font-bold w-36" })
      ] })
    ] }) }),
    simResult && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-xs font-mono font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, { className: "w-4 h-4 text-amber-400" }),
        "Simulated Event Telemetry Stream"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2 font-mono text-xs", children: simResult.events?.map((ev, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-slate-500 text-[10px]", children: [
            "Step ",
            ev.step
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-300 font-bold", children: ev.from_account }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "w-3.5 h-3.5 text-amber-400" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-300 font-bold", children: ev.to_account })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-emerald-400 font-bold", children: [
            "₹",
            ev.amount?.toLocaleString("en-IN")
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] px-1.5 py-0.2 rounded bg-amber-950 text-amber-400 border border-amber-800", children: ev.risk_tier })
        ] })
      ] }, idx)) })
    ] }) })
  ] });
}
export {
  SimulationPage as component
};
