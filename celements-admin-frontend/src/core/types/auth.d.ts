export type SessionProfile = {
  userId: string;
  profileId?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  isAdmin?: boolean;
};

export type JwtMeta = {
  accessToken: string;
  idToken?: string;
  expiresAt?: number;
  issuedAt?: number;
  issuer: string;
  scopes: string[];
};

export type SessionUser = SessionProfile & JwtMeta;

export type AuthState = {
  sessionUser: SessionUser | null;
};
