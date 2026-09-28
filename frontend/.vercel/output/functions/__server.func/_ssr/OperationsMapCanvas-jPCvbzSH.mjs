import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
const loadClientMap = () => {
  throw new Error("createClientOnlyFn() functions can only be called on the client!");
};
function OperationsMapCanvas(props) {
  const [ClientMap, setClientMap] = reactExports.useState(null);
  reactExports.useEffect(() => {
    let active = true;
    void loadClientMap()?.then(({
      OperationsMapCanvasClient
    }) => {
      if (active) setClientMap(() => OperationsMapCanvasClient);
    });
    return () => {
      active = false;
    };
  }, []);
  if (!ClientMap) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `relative flex h-full min-h-[450px] items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-sm text-slate-300 ${props.className || ""}`, children: "Initializing map..." });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ClientMap, { ...props });
}
export {
  OperationsMapCanvas as O
};
