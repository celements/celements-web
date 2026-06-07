export declare enum SignInType {
  Window = 0,
  Popup = 1,
}

export interface AuthOptions {
  appBaseUrl: string;
  authBaseUrl: string;
  realm: string;
  clientId: string;
  clientSecret: string;
}
