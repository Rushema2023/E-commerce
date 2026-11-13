import { json, methodNotAllowed } from '../_lib/http'
import { requireAdmin, serviceSupabase } from '../_lib/supabase'

const allowedStatuses = new Set(['confirmed', 'processing', 'shipped', 'delivered', 'cancelled'])

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return methodNotAllowed(res)
  try {
    await requireAdmin(req.headers.authorization)
    const { order_id, status } = req.body ?? {}
    if (typeof order_id !== 'string' || typeof status !== 'string' || !allowedStatuses.has(status)) {
      return json(res, 400, { error: 'A valid order and fulfilment status are required' })
    }
    const client = serviceSupabase()
    const { data: current, error: currentError } = await client
      .from('orders')
      .select('id, status')
      .eq('id', order_id)
      .single()
    if (currentError || !current) return json(res, 404, { error: 'Order not found' })
    const transitions: Record<string, string[]> = {
      confirmed: ['processing', 'cancelled'],
      processing: ['shipped', 'cancelled'],
      shipped: ['delivered'],
    }
    if (!transitions[current.status]?.includes(status)) {
      return json(res, 409, { error: 'This order status transition is not allowed' })
    }
    const { data, error } = await client
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', order_id)
      .eq('status', current.status)
      .select('id, status')
      .single()
    if (error || !data) return json(res, 409, { error: 'This order cannot be updated in its current state' })
    return json(res, 200, { order: data })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to update the order'
    return json(res, message.includes('access') || message.includes('Authentication') || message.includes('session') ? 403 : 500, { error: message })
  }
}
