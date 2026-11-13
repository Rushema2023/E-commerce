import { json, methodNotAllowed } from './_lib/http'
import { requireUserId, serviceSupabase } from './_lib/supabase'

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return methodNotAllowed(res)

  try {
    const userId = await requireUserId(req.headers.authorization)
    const { order_id, transaction_reference, receipt_path } = req.body ?? {}
    if (typeof order_id !== 'string' || typeof transaction_reference !== 'string' || transaction_reference.trim().length < 3) {
      return json(res, 400, { error: 'Provide a valid order and payment transaction reference' })
    }
    if (receipt_path !== undefined && (typeof receipt_path !== 'string' || !receipt_path.startsWith(`${userId}/${order_id}/`))) {
      return json(res, 400, { error: 'Invalid receipt upload path' })
    }

    const client = serviceSupabase()
    const { data: order, error: orderError } = await client
      .from('orders')
      .select('id, user_id, status')
      .eq('id', order_id)
      .single()
    if (orderError || !order || order.user_id !== userId) return json(res, 404, { error: 'Order not found' })
    if (order.status !== 'pending_payment') return json(res, 409, { error: 'This order is no longer awaiting payment' })

    const update: { transaction_reference: string; status: string; receipt_storage_path?: string } = {
      transaction_reference: transaction_reference.trim(),
      status: 'submitted',
    }
    if (receipt_path) update.receipt_storage_path = receipt_path
    const { data, error } = await client
      .from('payments')
      .update(update)
      .eq('order_id', order_id)
      .eq('status', 'awaiting_payment')
      .select('id, status')
      .single()
    if (error || !data) return json(res, 409, { error: 'Payment information has already been submitted or could not be updated' })
    return json(res, 200, { payment: data })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to submit payment information'
    return json(res, message.includes('Authentication') || message.includes('session') ? 401 : 500, { error: message })
  }
}
