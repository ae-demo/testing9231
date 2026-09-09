// The keys this component's src/env.ts actually declares — its USER_AUTH_*
// OIDC config. There is no sibling API URL here: /api is same-origin, and a
// browser key for it would hide the one defect this arrangement exists to
// catch (see react-webapp's mock-mode.md).
export const mockEnv = {
  USER_AUTH_CLIENT_ID: "mock-client",
  USER_AUTH_ISSUER: "https://mock-idp.test",
  USER_AUTH_JWKS_URL: "https://mock-idp.test/.well-known/jwks.json",
  USER_AUTH_SCOPES: "openid profile email group ou",
};
