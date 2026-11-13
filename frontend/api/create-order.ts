import { json, methodNotAllowed } from './_lib/http'
import { requireUserId, serviceSupabase } from './_lib/supabase'
import { getCurrencyQuote } from './_lib/currency'

interface RequestBody {
  full_name?: string
  phone?: string
  district?: string
  address?: string
  delivery_instructions?: string
  payment_method?: string
  display_currency?: string
  items?: Array<{ product_id?: string; quantity?: number; size?: string; color?: string }>
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return methodNotAllowed(res)

  try {
    const userId = await requireUserId(req.headers.authorization)
    const body = (req.body ?? {}) as RequestBody
    const quote = await getCurrencyQuote(body.display_currency)
    const { data, error } = await serviceSupabase().rpc('create_secure_order', {
      p_user_id: userId,
      p_customer_name: body.full_name,
      p_customer_phone: body.phone,
      p_district: body.district,
      p_address: body.address,
      p_delivery_instructions: body.delivery_instructions ?? null,
      p_payment_method: body.payment_method,
      p_items: body.items ?? [],
      p_display_currency: quote.currency,
      p_exchange_rate: quote.rate,
    })

    if (error) {
      console.error('Order creation failed', error.code)
      return json(res, 400, { error: error.message || 'Unable to create the order' })
    }

    const order = Array.isArray(data) ? data[0] : data
    if (!order) return json(res, 500, { error: 'The order was created without a response' })
    return json(res, 201, { order })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to create the order'
    const status = message.includes('Authentication') || message.includes('session') ? 401 : message.includes('currency') || message.includes('exchange rates') ? 503 : 500
    return json(res, status, { error: message })
  }
}
