import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { $ as ShieldCheck, _ as ShieldAlert, C as Check, q as Copy } from "../_libs/lucide-react.mjs";
function EvidenceHashBox({ hash, verified = true, label = "SHA-256 Evidence Hash", className = "" }) {
  const [copied, setCopied] = reactExports.useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(hash);
    setCopied(true);
    toast.success("Evidence SHA-256 copied to clipboard!");
    setTimeout(() => setCopied(false), 2e3);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono ${className}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2 mb-1.5 vajra-body-small text-slate-300", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5 font-sans font-medium text-slate-300", children: [
        verified ? /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "w-4 h-4 text-emerald-400 shrink-0" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, { className: "w-4 h-4 text-rose-400 shrink-0" }),
        label
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "span",
        {
          className: `vajra-status px-1.5 py-1 rounded font-mono ${verified ? "bg-emerald-950 text-emerald-400 border border-emerald-800" : "bg-rose-950 text-rose-400 border border-rose-800"}`,
          children: verified ? "INTEGRITY VERIFIED" : "VERIFICATION FAILED"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2 bg-slate-900 px-2.5 py-1.5 rounded border border-slate-800", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-emerald-300 tracking-normal break-all select-all font-mono", children: hash }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: handleCopy,
          className: "p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0",
          title: "Copy SHA-256 Hash",
          children: copied ? /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "w-3.5 h-3.5 text-emerald-400" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "w-3.5 h-3.5" })
        }
      )
    ] })
  ] });
}
export {
  EvidenceHashBox as E
};
