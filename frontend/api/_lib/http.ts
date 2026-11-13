export function json(res: any, status: number, body: unknown) {
  res.status(status).json(body)
}

export function methodNotAllowed(res: any) {
  res.setHeader('Allow', 'POST')
  json(res, 405, { error: 'Method not allowed' })
}
