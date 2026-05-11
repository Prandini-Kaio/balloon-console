export type ApiSuccess<T> = { ok: true; data: T; status: number }
export type ApiFailure = {
  ok: false
  status: number
  message: string
  body?: unknown
}

export type ApiResult<T> = ApiSuccess<T> | ApiFailure

export function isApiFailure<T>(r: ApiResult<T>): r is ApiFailure {
  return !r.ok
}
