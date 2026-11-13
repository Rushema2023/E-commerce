import { json, methodNotAllowed } from '../_lib/http'
import { requireAdmin, serviceSupabase } from '../_lib/supabase'

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return methodNotAllowed(res)
  try {
    const adminId = await requireAdmin(req.headers.authorization)
    const { order_id, admin_notes } = req.body ?? {}
    if (typeof order_id !== 'string') return json(res, 400, { error: 'A valid order is required' })
    if (typeof admin_notes !== 'string' || admin_notes.trim().length < 3) return json(res, 400, { error: 'Add a short note explaining why the payment was rejected' })
    const client = serviceSupabase()
    const { data: payment, error: paymentError } = await client.from('payments').select('id, status').eq('order_id', order_id).single()
    if (paymentError || !payment) return json(res, 404, { error: 'Payment not found' })
    if (payment.status !== 'submitted') return json(res, 409, { error: 'Only submitted payments can be rejected' })
    const { error } = await client.from('payments')
      .update({ status: 'rejected', admin_notes: admin_notes.trim(), reviewed_by: adminId, reviewed_at: new Date().toISOString() })
      .eq('id', payment.id).eq('status', 'submitted')
    if (error) throw error
    return json(res, 200, { ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to reject payment'
    return json(res, message.includes('access') || message.includes('Authentication') || message.includes('session') ? 403 : 500, { error: message })
  }
}
