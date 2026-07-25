export default {
  async fetch(request, env) {
    return handleRequest(request, env);
  },
};

const FRONTEND_ORIGIN = "https://opnora.com";
const FRONTEND_ADMIN_URL = "https://opnora.com/admin/";
const API_ORIGIN = "https://opnora-admin-api.manishhaatwa.workers.dev";

function getCorsHeaders(origin) {
  const allowedOrigin = origin === FRONTEND_ORIGIN ? origin : FRONTEND_ORIGIN;
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin",
  };
}

function json(data, status = 200, origin = FRONTEND_ORIGIN, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...getCorsHeaders(origin),
      ...extraHeaders,
    },
  });
}

function redirect(url, headers = {}) {
  return new Response(null, {
    status: 302,
    headers: {
      Location: url,
      ...headers,
    },
  });
}

function parseCookies(cookieHeader = "") {
  const out = {};
  cookieHeader.split(";").forEach(part => {
    const i = part.indexOf("=");
    if (i > -1) {
      const key = part.slice(0, i).trim();
      const value = part.slice(i + 1).trim();
      out[key] = value;
    }
  });
  return out;
}

function toBase64Url(str) {
  return btoa(str).replace(/+/g, "-").replace(///g, "_").replace(/=+$/g, "");
}

function fromBase64Url(str) {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) str += "=";
  return atob(str);
}

async function signHmac(message, secret) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(message)
  );

  return btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/+/g, "-")
    .replace(///g, "_")
    .replace(/=+$/g, "");
}

async function createSession(user, secret) {
  const payload = {
    sub: String(user.id),
    login: user.login || "",
    name: user.name || "",
    avatar_url: user.avatar_url || "",
    iat: Date.now(),
    exp: Date.now() + 1000 * 60 * 60 * 24 * 7
  };

  const encodedPayload = toBase64Url(JSON.stringify(payload));
  const signature = await signHmac(encodedPayload, secret);
  return `${encodedPayload}.${signature}`;
}

async function verifySession(sessionToken, secret) {
  try {
    if (!sessionToken || !sessionToken.includes(".")) return null;

    const [encodedPayload, signature] = sessionToken.split(".");
    const expectedSig = await signHmac(encodedPayload, secret);
    if (signature !== expectedSig) return null;

    const payload = JSON.parse(fromBase64Url(encodedPayload));
    if (!payload.exp || Date.now() > payload.exp) return null;

    return payload;
  } catch {
    return null;
  }
}

async function getGitHubUser(accessToken) {
  const res = await fetch("https://api.github.com/user", {
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Accept": "application/vnd.github+json",
      "User-Agent": "opnora-admin"
    }
  });

  if (!res.ok) {
    throw new Error("Failed to fetch GitHub user");
  }

  return res.json();
}

function buildSessionCookie(value, maxAgeSeconds = 60 * 60 * 24 * 7) {
  return [
    `__Host-opnora_session=${value}`,
    "Path=/",
    "Secure",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${maxAgeSeconds}`
  ].join("; ");
}

function buildClearSessionCookie() {
  return [
    "__Host-opnora_session=",
    "Path=/",
    "Secure",
    "HttpOnly",
    "SameSite=Lax",
    "Max-Age=0"
  ].join("; ");
}

async function handleRequest(request, env) {
  const url = new URL(request.url);
  const origin = request.headers.get("Origin") || FRONTEND_ORIGIN;

  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: getCorsHeaders(origin),
    });
  }

  if (url.pathname === "/auth/login") {
    const githubUrl = new URL("https://github.com/login/oauth/authorize");
    githubUrl.searchParams.set("client_id", env.GITHUB_CLIENT_ID);
    githubUrl.searchParams.set("redirect_uri", `${API_ORIGIN}/auth/callback`);
    githubUrl.searchParams.set("scope", "read:user user:email");
    return redirect(githubUrl.toString());
  }

  if (url.pathname === "/auth/callback") {
    try {
      const code = url.searchParams.get("code");
      if (!code) {
        return redirect(`${FRONTEND_ADMIN_URL}?error=missing_code`);
      }

      const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: env.GITHUB_CLIENT_ID,
          client_secret: env.GITHUB_CLIENT_SECRET,
          code,
          redirect_uri: `${API_ORIGIN}/auth/callback`,
        }),
      });

      const tokenData = await tokenRes.json();

      if (!tokenRes.ok || tokenData.error || !tokenData.access_token) {
        return redirect(`${FRONTEND_ADMIN_URL}?error=oauth_token_failed`);
      }

      const githubUser = await getGitHubUser(tokenData.access_token);
      const session = await createSession(githubUser, env.JWT_SECRET);

      return redirect(FRONTEND_ADMIN_URL, {
        "Set-Cookie": buildSessionCookie(session),
      });
    } catch {
      return redirect(`${FRONTEND_ADMIN_URL}?error=oauth_callback_failed`);
    }
  }

  if (url.pathname === "/api/check-auth") {
    const cookies = parseCookies(request.headers.get("Cookie") || "");
    const sessionToken = cookies["__Host-opnora_session"];
    const payload = await verifySession(sessionToken, env.JWT_SECRET);

    if (!payload) {
      return json({ ok: false, authenticated: false }, 401, origin);
    }

    return json({
      ok: true,
      authenticated: true,
      user: {
        id: payload.sub,
        login: payload.login,
        name: payload.name,
        avatar_url: payload.avatar_url,
      }
    }, 200, origin);
  }

  if (url.pathname === "/api/logout" && request.method === "POST") {
    return json(
      { ok: true, message: "Logged out" },
      200,
      origin,
      { "Set-Cookie": buildClearSessionCookie() }
    );
  }

  return json({ ok: false, error: "Not found" }, 404, origin);
}
