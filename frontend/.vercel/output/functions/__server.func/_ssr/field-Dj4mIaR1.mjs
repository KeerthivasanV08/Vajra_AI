import { r as reactExports, j as jsxRuntimeExports, R as React } from "../_libs/react.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { f as fetchActiveFieldDispatch, C as updateFieldDispatchStatus, B as submitFieldDispatchOutcome } from "./api-03VgCQYK.mjs";
import { O as OperationsMapCanvas } from "./OperationsMapCanvas-jPCvbzSH.mjs";
import { T as Radio, _ as ShieldAlert, p as Clock3, N as Navigation, K as Phone, l as CircleCheck } from "../_libs/lucide-react.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
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
import "../_libs/isbot.mjs";
const steps = ["DISPATCHED", "EN_ROUTE", "ON_SITE", "ACTION_TAKEN"];
function toCoordinate(value) {
  if (value === null || value === void 0 || value === "") return null;
  const numeric = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}
function BeatOfficerFieldPage() {
  const [dispatch, setDispatch] = reactExports.useState(null);
  const [events, setEvents] = reactExports.useState([]);
  const [status, setStatus] = reactExports.useState("DISPATCHED");
  const [loading, setLoading] = reactExports.useState(true);
  const [loadError, setLoadError] = reactExports.useState(false);
  const [seconds, setSeconds] = reactExports.useState(null);
  const [outcomeOpen, setOutcomeOpen] = reactExports.useState(false);
  const [offline, setOffline] = reactExports.useState(() => typeof navigator !== "undefined" && !navigator.onLine);
  const [syncing, setSyncing] = reactExports.useState(false);
  const [gpsStatus, setGpsStatus] = reactExports.useState("UNAVAILABLE");
  const [officerPosition, setOfficerPosition] = reactExports.useState();
  const loadDispatch = async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const result = await fetchActiveFieldDispatch();
      setDispatch(result.dispatch);
      setEvents(result.events ?? []);
      setStatus(result.dispatch?.field_status ?? "DISPATCHED");
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  };
  reactExports.useEffect(() => {
    void loadDispatch();
  }, []);
  reactExports.useEffect(() => {
    const online = () => setOffline(false);
    const offlineEvent = () => setOffline(true);
    window.addEventListener("online", online);
    window.addEventListener("offline", offlineEvent);
    return () => {
      window.removeEventListener("online", online);
      window.removeEventListener("offline", offlineEvent);
    };
  }, []);
  reactExports.useEffect(() => {
    if (!navigator.geolocation) return void 0;
    const watch = navigator.geolocation.watchPosition((position) => {
      setGpsStatus("ACTIVE");
      setOfficerPosition([position.coords.latitude, position.coords.longitude]);
    }, () => {
      setGpsStatus("UNAVAILABLE");
      setOfficerPosition(void 0);
    }, {
      enableHighAccuracy: true,
      maximumAge: 3e4,
      timeout: 1e4
    });
    return () => navigator.geolocation.clearWatch(watch);
  }, []);
  reactExports.useEffect(() => {
    if (!dispatch?.deadline) {
      setSeconds(null);
      return void 0;
    }
    const tick = () => setSeconds(Math.max(0, Math.floor((new Date(dispatch.deadline).getTime() - Date.now()) / 1e3)));
    tick();
    const timer = window.setInterval(tick, 1e3);
    return () => window.clearInterval(timer);
  }, [dispatch]);
  const target = dispatch?.node ?? null;
  const latitude = toCoordinate(dispatch?.target_coordinates?.latitude ?? target?.latitude);
  const longitude = toCoordinate(dispatch?.target_coordinates?.longitude ?? target?.longitude);
  const hasTargetCoordinates = latitude !== null && longitude !== null;
  const targetNode = target ?? (hasTargetCoordinates && dispatch?.target_node_id ? {
    node_id: dispatch.target_node_id,
    node_type: "UNKNOWN",
    latitude,
    longitude
  } : null);
  const countdown = reactExports.useMemo(() => seconds === null ? "NO DEADLINE ASSIGNED" : seconds === 0 ? "EXPIRED" : `${Math.floor(seconds / 60).toString().padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`, [seconds]);
  const countdownState = seconds === null ? "NO DEADLINE" : seconds === 0 ? "EXPIRED" : seconds <= 300 ? "NEARING DEADLINE" : "ACTIVE";
  const advance = async (next) => {
    if (!dispatch) return;
    const idempotency_key = globalThis.crypto?.randomUUID?.() || `${dispatch.dispatch_id}-${next}-${Date.now()}`;
    const payload = {
      status: next,
      gps_lat: officerPosition?.[0],
      gps_lon: officerPosition?.[1],
      idempotency_key
    };
    if (offline) {
      const queue = JSON.parse(localStorage.getItem("vajra.field.queue") || "[]");
      localStorage.setItem("vajra.field.queue", JSON.stringify([...queue, {
        dispatchId: dispatch.dispatch_id,
        payload
      }]));
      toast.warning("Saved offline - will sync");
      return;
    }
    try {
      await updateFieldDispatchStatus(dispatch.dispatch_id, payload);
      setStatus(next);
      await loadDispatch();
      toast.success(`Status updated: ${next.replace("_", " ")}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Status update failed.");
    }
  };
  reactExports.useEffect(() => {
    const sync = async () => {
      if (!navigator.onLine) return;
      const queue = JSON.parse(localStorage.getItem("vajra.field.queue") || "[]");
      if (!queue.length) return;
      setSyncing(true);
      const remaining = [];
      for (const item of queue) {
        try {
          await updateFieldDispatchStatus(item.dispatchId, item.payload);
        } catch {
          remaining.push(item);
        }
      }
      localStorage.setItem("vajra.field.queue", JSON.stringify(remaining));
      setSyncing(false);
      if (queue.length !== remaining.length) {
        toast.success("Offline field updates synchronized.");
        void loadDispatch();
      }
    };
    window.addEventListener("online", sync);
    void sync();
    return () => window.removeEventListener("online", sync);
  }, []);
  const report = async (outcome) => {
    if (!dispatch) return;
    try {
      await submitFieldDispatchOutcome(dispatch.dispatch_id, {
        outcome,
        actual_cashout_confirmed: outcome === "intercepted",
        notes: "Reported from Beat Officer Mode"
      });
      setOutcomeOpen(false);
      await loadDispatch();
      toast.success("Outcome synchronized to dispatch events.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Outcome submission failed.");
    }
  };
  if (loading) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-full items-center justify-center bg-slate-950 p-6 text-sm text-slate-300", children: "Loading active dispatch..." });
  if (loadError) return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-h-full flex-col items-center justify-center gap-3 bg-slate-950 p-6 text-center text-slate-300", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-semibold", children: "Unable to load dispatch" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-slate-500", children: "The field assignment could not be retrieved." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => void loadDispatch(), className: "min-h-12 rounded-xl bg-rose-600 px-5 text-sm font-bold text-white", children: "Retry" })
  ] });
  if (!dispatch) return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-h-full flex-col items-center justify-center gap-3 bg-slate-950 p-6 text-center text-slate-300", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Radio, { className: "h-10 w-10 text-slate-600" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-semibold", children: "No active dispatch" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-slate-500", children: "No current field assignment is available for this officer." })
  ] });
  const caseReference = dispatch.case_id ? `CASE ${dispatch.case_id}` : dispatch.alert_id ? `ALERT ${dispatch.alert_id} - Case not created` : "CASE NOT LINKED";
  const destination = target?.district || target?.state || (hasTargetCoordinates ? `${latitude.toFixed(6)}, ${longitude.toFixed(6)}` : "DESTINATION LOCATION UNAVAILABLE");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex min-h-full max-w-lg flex-col gap-4 overflow-y-auto bg-slate-950 p-4 text-slate-100", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border-2 border-rose-600 bg-rose-950 p-4 text-center shadow-2xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-flex items-center gap-2 rounded-full border border-rose-500 bg-rose-900 px-3 py-1 text-sm font-mono font-bold", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, { className: "h-4 w-4" }),
        " HIGH PRIORITY PATROL DISPATCH"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-2 text-2xl font-extrabold", children: dispatch.target_node_id || "Target node unavailable" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-rose-200", children: caseReference })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-hidden rounded-2xl border border-slate-800", children: targetNode && hasTargetCoordinates ? /* @__PURE__ */ jsxRuntimeExports.jsx(OperationsMapCanvas, { nodes: [targetNode], center: [latitude, longitude], zoom: 13, officerPosition }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-52 items-center justify-center bg-slate-900 p-6 text-center text-sm text-slate-400", children: "DESTINATION LOCATION UNAVAILABLE" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 rounded-2xl border border-slate-800 bg-slate-900 p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "block text-sm text-slate-400", children: "LIVE COUNTDOWN" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `font-mono text-xl font-bold ${seconds === 0 ? "text-rose-500" : "text-amber-400"}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Clock3, { className: "mr-1 inline h-5 w-5" }),
          countdown
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mt-1 block text-xs text-slate-500", children: countdownState })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "block text-sm text-slate-400", children: "DESTINATION" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mt-1 block text-sm text-emerald-300", children: destination }),
        hasTargetCoordinates && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "mt-1 block font-mono text-xs text-slate-500", children: [
          latitude.toFixed(6),
          ", ",
          longitude.toFixed(6)
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-slate-800 bg-slate-900 p-3 text-sm text-slate-300", children: [
      gpsStatus === "ACTIVE" ? "GPS ACTIVE" : "GPS UNAVAILABLE",
      offline && " - SAVED OFFLINE ACTIONS WILL SYNC",
      syncing && " - SYNCING"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-slate-800 bg-slate-900 p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-between gap-1", children: steps.map((step, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs(React.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { disabled: index !== steps.indexOf(status) + 1, onClick: () => void advance(step), className: `flex min-h-14 flex-1 flex-col items-center justify-center rounded-xl px-1 text-xs font-bold disabled:cursor-default ${steps.indexOf(step) <= steps.indexOf(status) ? "bg-emerald-900 text-emerald-300" : "bg-slate-950 text-slate-400"}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: index + 1 }),
          step.replace("_", " ")
        ] }),
        index < steps.length - 1 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-600", children: "›" })
      ] }, step)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 space-y-2 border-t border-slate-800 pt-3", children: events.map((event) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between gap-3 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-slate-300", children: event.status.replace("_", " ") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-slate-500", children: event.status_timestamp ? new Date(event.status_timestamp).toLocaleString() : "Time unavailable" })
      ] }, `${event.dispatch_id}-${event.status}-${event.status_timestamp}`)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { disabled: !hasTargetCoordinates, onClick: () => window.open(`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`, "_blank", "noopener,noreferrer"), className: "flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 text-sm font-extrabold text-white disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-500", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Navigation, { className: "h-5 w-5" }),
        hasTargetCoordinates ? "START GOOGLE MAPS NAVIGATION" : "DESTINATION UNAVAILABLE"
      ] }),
      dispatch.bank_nodal_phone ? /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: `tel:${dispatch.bank_nodal_phone}`, className: "flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-slate-800 text-sm font-extrabold", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-5 w-5" }),
        " CALL BANK NODAL OFFICER"
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-xl border border-slate-800 p-3 text-center text-sm text-slate-500", children: "BANK NODAL CONTACT UNAVAILABLE" }),
      (status === "ON_SITE" || status === "ACTION_TAKEN") && /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setOutcomeOpen(true), className: "flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-rose-600 text-sm font-extrabold", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-5 w-5" }),
        " REPORT OUTCOME"
      ] })
    ] }),
    outcomeOpen && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-20 flex items-end bg-black/70 p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto w-full max-w-lg space-y-3 rounded-2xl border border-slate-700 bg-slate-900 p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold", children: "Report Outcome" }),
      ["intercepted", "missed", "false_alarm"].map((outcome) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => void report(outcome), className: "min-h-12 w-full rounded-xl bg-slate-800 text-sm font-bold uppercase", children: outcome.replace("_", " ") }, outcome)),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setOutcomeOpen(false), className: "w-full p-3 text-sm text-slate-400", children: "Cancel" })
    ] }) })
  ] });
}
export {
  BeatOfficerFieldPage as component
};
