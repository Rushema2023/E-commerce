import { isSupabaseConfigured, supabase } from '../lib/supabase'
import { mockProducts } from '../data/mockData'
import type { Category, Product, ProductImage } from '../types'

type ProductRow = Omit<Product, 'category' | 'images'> & {
  categories?: { slug?: string } | null
  product_images?: ProductImage[]
}

function toProduct(row: ProductRow): Product {
  const category = row.categories?.slug
  if (category !== 'men' && category !== 'women' && category !== 'accessories') {
    throw new Error(`Product ${row.id} has an unsupported category`)
  }
  return {
    ...row,
    category: category as Category,
    images: [...(row.product_images ?? [])].sort((a, b) => a.sort_order - b.sort_order),
  }
}

const productSelect = 'id, name, description, price, slug, sku, stock_quantity, is_featured, is_new_arrival, is_active, sizes, colors, created_at, categories(slug), product_images(id, product_id, url, alt, is_primary, sort_order)'

export async function getActiveProducts(): Promise<Product[]> {
  if (!isSupabaseConfigured) return mockProducts.filter((product) => product.is_active)
  const { data, error } = await supabase
    .from('products')
    .select(productSelect)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data as unknown as ProductRow[]).map(toProduct)
}

export async function getActiveProduct(id: string): Promise<Product | null> {
  if (!isSupabaseConfigured) return mockProducts.find((product) => product.id === id && product.is_active) ?? null
  const { data, error } = await supabase
    .from('products')
    .select(productSelect)
    .eq('id', id)
    .eq('is_active', true)
    .maybeSingle()
  if (error) throw error
  return data ? toProduct(data as unknown as ProductRow) : null
}
