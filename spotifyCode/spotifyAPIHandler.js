const clientId = '1075eb768432412fa4ae12020b26c749';
const redirectUri = window.location.href.includes('gjb.one') ? 'https://gjb.one/spotify' : 'https://localhost:5500/spotify.html';

const generateRandomString = (length) => {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const values = crypto.getRandomValues(new Uint8Array(length));
    return values.reduce((acc, x) => acc + possible[x % possible.length], "");
}
  
const codeVerifier = generateRandomString(64);

const sha256 = async (plain) => {
    const encoder = new TextEncoder()
    const data = encoder.encode(plain)
    return window.crypto.subtle.digest('SHA-256', data)
}

const base64encode = (input) => {
    return btoa(String.fromCharCode(...new Uint8Array(input)))
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

}

const requestSpotifyOAuth = async () => {
    const hashed = await sha256(codeVerifier)
    const codeChallenge = base64encode(hashed);

    const scope = 'user-read-recently-played user-read-email user-read-private streaming';
    const authUrl = new URL("https://accounts.spotify.com/authorize")


    window.localStorage.setItem('code_verifier', codeVerifier);

    const params =  {
        response_type: 'code',
        client_id: clientId,
        scope,
        code_challenge_method: 'S256',
        code_challenge: codeChallenge,
        redirect_uri: redirectUri,
    }

    authUrl.search = new URLSearchParams(params).toString();
    window.location.href = authUrl.toString();
    
    return;
}

const checkForCode = () => {
    const urlParams = new URLSearchParams(window.location.href.split('?')[1]);
    
    if(!urlParams.has('code')){
        requestSpotifyOAuth();
    } else {
        beginOAuthCycle(urlParams.get('code'));
    }
}

const beginOAuthCycle = async (code) => {
    const userAccessToken = await getToken(code);
    const tokenGrantedEvent = new CustomEvent('tokenGranted', {
        detail: {
            token: userAccessToken
        }
    });
    document.body.dispatchEvent(tokenGrantedEvent);

    return;
}

const getToken = async (code) => {
    const codeVerifier = localStorage.getItem('code_verifier');
  
    const url = "https://accounts.spotify.com/api/token";
    const payload = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        code_verifier: codeVerifier,
      }),
    }
    
    const body = await fetch(url, payload);
    const response = await body.json();

    if(response.error) window.location.href = redirectUri;

    return response.access_token;    
}

checkForCode();