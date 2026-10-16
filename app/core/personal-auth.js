const AUTH_URL = 'https://kessel-api.parsec.app/v1/auth';
// Caller supplies credentials from the form; nothing is persisted or logged.
export async function authenticatePersonal({
  email, password, tfa
}, signal, fetcher = fetch) {
  const body = {
    email: email.trim(), password
  };
  if (tfa.trim()) body.tfa = tfa.trim();
  const response = await fetcher(AUTH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body),
    signal,
    mode: 'cors',
    credentials: 'omit',
    redirect: 'error',
    cache: 'no-store',
    referrerPolicy: 'no-referrer',
  });
  let json;
  try {
    json = await response.json();
  } catch {
    return {
      status: response.status, malformed: true
    };
  }
  if (response.status !== 200 && response.status !== 201) return {
    status: response.status
  };
  // The historical personal /v1/auth response uses a top-level session_id.
  // Keep compatibility with the previously supported data.id response.
  const id = json?.session_id ?? json?.data?.id;
  if (typeof id !== 'string' || !id.length || id.length > 4096) {
    return {
      status: response.status, malformed: true
    };
  }
  return {
    status: response.status, id
  };
}
