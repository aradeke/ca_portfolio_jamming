
const clientId = '367b01d4ad344b72bb67556725e4f2df'
const redirectUri = 'http://127.0.0.1:3000';
const response_type = 'code';

const scope = [
  "playlist-read-private",
  "playlist-read-collaborative",
  "playlist-modify-public",
  "playlist-modify-private",
  "user-read-private",
  "user-read-email"
].join(" ");

const authUrl = new URL("https://accounts.spotify.com/authorize")

const authorizationEndpoint = "https://accounts.spotify.com/authorize";
const tokenEndpoint = "https://accounts.spotify.com/api/token";

// Helper: generate random string
const generateRandomString = (length: number): string => {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const values = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(values)
    .map((x) => possible[x % possible.length])
    .join('');
};

//const codeVerifier  = generateRandomString(64);
export const getCodeVerifier = (): string => {
  let verifier = localStorage.getItem('code_verifier');
  if (!verifier) {
    verifier = generateRandomString(64);
    localStorage.setItem('code_verifier', verifier);
  }
  return verifier;
};

//Code Challenge
const sha256 = async (plain: string): Promise<ArrayBuffer> => {
  const encoder = new TextEncoder()
  const data = encoder.encode(plain)
  return window.crypto.subtle.digest('SHA-256', data)
}

const base64encode = (arrayBuffer: ArrayBuffer) => {
  const bytes = new Uint8Array(arrayBuffer);
  let binary = '';
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
};


// To request authorization from the user, 
// a GET request must be made to the /authorize endpoint. 
// This request should include the same parameters as 
// the authorization code flow, along with two additional parameters: 
// code_challenge and code_challenge_method 
// https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow


// Main function to redirect user to Spotify authorization
export const redirectToSpotifyAuth = async () => {
  const codeVerifier = getCodeVerifier();
  const hashed = await sha256(codeVerifier);
  const codeChallenge = base64encode(hashed);

  // Store verifier for later

  window.localStorage.setItem('code_verifier', codeVerifier);

  const params = {
    response_type: 'code',
    client_id: clientId,
    scope,
    code_challenge_method: 'S256',
    code_challenge: codeChallenge,
    redirect_uri: redirectUri,
  };

  const authUrl = new URL('https://accounts.spotify.com/authorize');
  authUrl.search = new URLSearchParams(params).toString();

  window.location.href = authUrl.toString();
};


// Call this when user clicks login
// redirectToSpotifyAuth();

export interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
}

export const getToken = async (code: string | null): Promise<SpotifyTokenResponse | null> => {
  if (!code) {
    console.error('Authorization code is missing');
    return null;
  }

  const codeVerifier = localStorage.getItem('code_verifier');
  if (!codeVerifier) {
    console.error('Code verifier missing from localStorage');
    return null;
  }

  const url = 'https://accounts.spotify.com/api/token';
  const payload = {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier,
    }),
  };

 try {
    const res = await fetch(url, payload);
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Spotify token request failed: ${res.status} ${res.statusText} — ${text}`);
    }

    const data = (await res.json()) as SpotifyTokenResponse;
    if (!data?.access_token) {
      console.error('No access_token in Spotify response', data);
      return null;
    }

    const expiresAt = Date.now() + data.expires_in * 1000; // expires_in is in seconds
    localStorage.setItem("access_token", data.access_token);
    localStorage.setItem("expires_at", expiresAt.toString());
    if (data.refresh_token) localStorage.setItem("refresh_token", data.refresh_token);

    return data;
    
  } catch (err) {
    console.error('Error requesting Spotify token:', err);
    return null;
  }
};


interface SpotifyRefreshTokenResponse {
  access_token: string;
  token_type: string;
  scope?: string;
  expires_in: number;
  refresh_token?: string; // only sometimes returned
}


export const getRefreshToken = async (): Promise<string | null> => {
  const refreshToken = localStorage.getItem('refresh_token');
  if (!refreshToken) {
    console.error('No refresh token found in localStorage');
    return null;
  }

  const url = "https://accounts.spotify.com/api/token";

  const payload: RequestInit = {
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: clientId
    }),
  };

  const res = await fetch(url, payload);
  const data = (await res.json()) as SpotifyTokenResponse;

  const expiresAt = Date.now() + data.expires_in * 1000; // expires_in is in seconds

  if (data.access_token) {
    localStorage.setItem("access_token", data.access_token);
    localStorage.setItem("expires_at", expiresAt.toString());
  }
  if (data.refresh_token) localStorage.setItem("refresh_token", data.refresh_token);


  return data.access_token;
};

export const isTokenExpired = (): boolean => {
  const expiresAt = localStorage.getItem("expires_at");
  if (!expiresAt) return true;
  return Date.now() > parseInt(expiresAt, 10);
};

export const getValidToken = async (currentToken: string | null): Promise<string | null> => {
  const storedToken = currentToken || localStorage.getItem("access_token");

  if (!storedToken || isTokenExpired()) {
    // attempt refresh first
    const newToken = await getRefreshToken();
    if (newToken) return newToken;

    // fallback: redirect to login
    redirectToSpotifyAuth();
    return null;
  }

  return storedToken;
};

  