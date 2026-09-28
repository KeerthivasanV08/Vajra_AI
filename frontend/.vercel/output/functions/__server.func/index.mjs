globalThis.__nitro_main__ = import.meta.url;
import { d as defineLazyEventHandler, h as headers, a as HTTPError, H as H3Core, m as memoizeRouteRulesMatcher, b as createMatcherFromFind, c as composeMiddleware } from "./_libs/h3.mjs";
import { c as NodeResponse } from "./_libs/srvx.mjs";
import "./_libs/rou3.mjs";
import "node:stream";
const findRouteRules = /* @__PURE__ */ (() => {
  const $0 = { route: "/assets/**", rank: 0, rules: [{ name: "headers", route: "/assets/**", handler: headers, options: { "cache-control": "public, max-age=31536000, immutable" } }] };
  return (m, p) => {
    let r = [];
    if (p.charCodeAt(p.length - 1) === 47) p = p.slice(0, -1);
    let s = p.split("/");
    if (s.length > 1 && s[s.length - 1] === "") {
      s.pop();
      p = p.slice(0, -1);
    }
    let l = s.length;
    if (l > 1) {
      if (s[1] === "assets") {
        r.push({ data: $0, params: { "_": p.slice(8) } });
      }
    }
    return r.reverse();
  };
})();
const _lazy_2299e545a8ab091e = defineLazyEventHandler(() => import("./_chunks/ssr-renderer.mjs"));
const findRoute = /* @__PURE__ */ (() => {
  const data = { route: "/**", handler: _lazy_2299e545a8ab091e };
  return ((_m, p) => {
    return { data, params: { "_": p.slice(1) } };
  });
})();
const errorHandler$1 = (error, event) => {
  const res = defaultHandler(error, event);
  return new NodeResponse(typeof res.body === "string" ? res.body : JSON.stringify(res.body, null, 2), res);
};
function defaultHandler(error, event) {
  const unhandled = error.unhandled ?? !HTTPError.isError(error);
  const { status = 500, statusText = "" } = unhandled ? {} : error;
  if (status === 404) {
    const url = event.url || new URL(event.req.url);
    const baseURL = "/";
    if (/^\/[^/]/.test(baseURL) && !url.pathname.startsWith(baseURL)) {
      return {
        status: 302,
        headers: new Headers({ location: `${baseURL}${url.pathname.slice(1)}${url.search}` })
      };
    }
  }
  const headers2 = new Headers(unhandled ? {} : error.headers);
  headers2.set("content-type", "application/json; charset=utf-8");
  const jsonBody = unhandled ? {
    status,
    unhandled: true
  } : typeof error.toJSON === "function" ? error.toJSON() : {
    status,
    statusText,
    message: error.message
  };
  return {
    status,
    statusText,
    headers: headers2,
    body: {
      error: true,
      ...jsonBody
    }
  };
}
const errorHandlers = [errorHandler$1];
async function errorHandler(error, event) {
  for (const handler of errorHandlers) {
    try {
      const response = await handler(error, event, { defaultHandler });
      if (response) {
        return response;
      }
    } catch (error2) {
      console.error(error2);
    }
  }
}
function createNitroApp() {
  const captureError = (error, errorCtx) => {
    if (errorCtx?.event) {
      const errors = errorCtx.event.req.context?.nitro?.errors;
      if (errors) {
        errors.push({ error, context: errorCtx });
      }
    }
  };
  const h3App = createH3App({
    onError(error, event) {
      return errorHandler(error, event);
    }
  });
  let appHandler = (req) => {
    req.context ||= {};
    req.context.nitro = req.context.nitro || { errors: [] };
    return h3App.fetch(req);
  };
  return {
    fetch: appHandler,
    h3: h3App,
    hooks: void 0,
    captureError
  };
}
function createH3App(config) {
  const h3App = new H3Core(config);
  h3App["~findRoute"] = (event) => {
    event.context.routeRules = getRouteRules(event.req.method, event.url.pathname).routeRules;
    return findRoute(event.req.method, event.url.pathname);
  };
  h3App["~middleware"].push(createRouteRulesMiddleware());
  return h3App;
}
const APP_ID = "default";
function useNitroApp() {
  let instance = useNitroApp._instance;
  if (instance) {
    return instance;
  }
  instance = useNitroApp._instance = createNitroApp();
  globalThis.__nitro__ = globalThis.__nitro__ || {};
  globalThis.__nitro__[APP_ID] = instance;
  return instance;
}
let _matchRouteRules;
function getRouteRules(method, pathname) {
  return (_matchRouteRules ??= memoizeRouteRulesMatcher(createMatcherFromFind(findRouteRules)))(method, pathname);
}
function createRouteRulesMiddleware() {
  const composed = /* @__PURE__ */ new WeakMap();
  const middleware = (event, next) => {
    const ruleMiddleware = getRouteRules(event.req.method, event.url.pathname).routeRuleMiddleware;
    if (ruleMiddleware.length === 0) {
      return next();
    }
    let chain = composed.get(ruleMiddleware);
    if (!chain) {
      chain = composeMiddleware(ruleMiddleware);
      composed.set(ruleMiddleware, chain);
    }
    return chain(event, next);
  };
  return markUntraced(middleware);
}
function markUntraced(middleware) {
  middleware.__traced__ = true;
  return middleware;
}
const ISR_URL_PARAM = "__isr_route";
function isrRouteRewrite(reqUrl, xNowRouteMatches) {
  const queryIndex = reqUrl.indexOf("?");
  const reqParams = queryIndex === -1 ? new URLSearchParams() : new URLSearchParams(reqUrl.slice(queryIndex + 1));
  const isrURL = xNowRouteMatches ? new URLSearchParams(xNowRouteMatches).get(ISR_URL_PARAM) : reqParams.get(ISR_URL_PARAM);
  if (!isrURL) return;
  reqParams.delete(ISR_URL_PARAM);
  return [isrURL, reqParams.toString()];
}
const nitroApp = useNitroApp();
const vercel_web = { async fetch(req, context) {
  const isrURL = isrRouteRewrite(req.url, req.headers.get("x-now-route-matches"));
  if (isrURL) {
    const { routeRules } = getRouteRules("", isrURL[0]);
    if (routeRules?.isr) {
      req = new Request(new URL(isrURL[0] + (isrURL[1] ? `?${isrURL[1]}` : ""), req.url).href, req);
    }
  }
  req.runtime ??= { name: "vercel" };
  req.runtime.vercel = { context };
  let ip;
  Object.defineProperty(req, "ip", { get() {
    const h = req.headers.get("x-forwarded-for");
    return ip ??= h?.split(",").shift()?.trim();
  } });
  req.waitUntil = context?.waitUntil;
  return nitroApp.fetch(req);
} };
export {
  vercel_web as default
};
