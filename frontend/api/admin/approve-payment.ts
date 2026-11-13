import { json, methodNotAllowed } from '../_lib/http'
import { requireAdmin, serviceSupabase } from '../_lib/supabase'

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return methodNotAllowed(res)
  try {
    const adminId = await requireAdmin(req.headers.authorization)
    const { order_id, admin_notes } = req.body ?? {}
    if (typeof order_id !== 'string') return json(res, 400, { error: 'A valid order is required' })
    const client = serviceSupabase()
    const { data: payment, error: paymentError } = await client.from('payments').select('id, status').eq('order_id', order_id).single()
    if (paymentError || !payment) return json(res, 404, { error: 'Payment not found' })
    if (payment.status !== 'submitted') return json(res, 409, { error: 'Only submitted payments can be approved' })
    const now = new Date().toISOString()
    const { error: updatePaymentError } = await client.from('payments')
      .update({ status: 'approved', admin_notes: typeof admin_notes === 'string' ? admin_notes.trim() || null : null, reviewed_by: adminId, reviewed_at: now })
      .eq('id', payment.id).eq('status', 'submitted')
    if (updatePaymentError) throw updatePaymentError
    const { error: updateOrderError } = await client.from('orders').update({ status: 'confirmed', updated_at: now }).eq('id', order_id).eq('status', 'pending_payment')
    if (updateOrderError) throw updateOrderError
    return json(res, 200, { ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to approve payment'
    return json(res, message.includes('access') || message.includes('Authentication') || message.includes('session') ? 403 : 500, { error: message })
  }
}
