export const AUTH_LOGOUT_EVENT = 'balloon:auth:logout'

export function emitAuthLogout(): void {
  window.dispatchEvent(new CustomEvent(AUTH_LOGOUT_EVENT))
}

export function onAuthLogout(handler: () => void): () => void {
  window.addEventListener(AUTH_LOGOUT_EVENT, handler)
  return () => window.removeEventListener(AUTH_LOGOUT_EVENT, handler)
}
