import { useEffect, useMemo, useState } from 'react'
import { Plus, Pencil, Trash2, Eye, EyeOff, Search, X } from 'lucide-react'
import { toast } from 'sonner'
import { formatPrice } from '../../lib/utils'
import { supabase } from '../../lib/supabase'
import type { Category, Product, ProductImage } from '../../types'

interface CategoryRecord { id: string; name: string; slug: Category }
interface ProductRow extends Omit<Product, 'category' | 'images'> { categories?: { slug?: string } | null; product_images?: ProductImage[] }
interface ProductForm { name: string; sku: string; price: string; stock_quantity: string; category: Category; description: string; image_url: string; is_featured: boolean; is_new_arrival: boolean }

const emptyForm: ProductForm = { name: '', sku: '', price: '', stock_quantity: '', category: 'men', description: '', image_url: '', is_featured: false, is_new_arrival: false }

function toProduct(row: ProductRow): Product {
    const category = row.categories?.slug
    return { ...row, category: category === 'men' || category === 'women' || category === 'accessories' ? category : 'accessories', images: [...(row.product_images ?? [])].sort((a, b) => a.sort_order - b.sort_order) }
}

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [categories, setCategories] = useState<CategoryRecord[]>([])
    const [query, setQuery] = useState('')
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editing, setEditing] = useState<Product | null>(null)
    const [form, setForm] = useState<ProductForm>(emptyForm)
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
    const [saving, setSaving] = useState(false)

    const loadProducts = async () => {
        setLoading(true)
        const [productsResult, categoriesResult] = await Promise.all([
            supabase.from('products').select('id, name, description, price, slug, sku, stock_quantity, is_featured, is_new_arrival, is_active, sizes, colors, created_at, categories(slug), product_images(id, product_id, url, alt, is_primary, sort_order)').order('created_at', { ascending: false }),
            supabase.from('categories').select('id, name, slug').order('sort_order'),
        ])
        if (productsResult.error || categoriesResult.error) {
            toast.error('Unable to load product management data')
        } else {
            setProducts((productsResult.data ?? []).map((product) => toProduct(product as unknown as ProductRow)))
            setCategories((categoriesResult.data ?? []).filter((category): category is CategoryRecord => category.slug === 'men' || category.slug === 'women' || category.slug === 'accessories'))
        }
        setLoading(false)
    }

    useEffect(() => { loadProducts() }, [])

    const filtered = useMemo(() => {
        const term = query.trim().toLowerCase()
        return term ? products.filter((product) => product.name.toLowerCase().includes(term) || product.sku.toLowerCase().includes(term)) : products
    }, [products, query])

    const openCreate = () => { setEditing(null); setForm({ ...emptyForm, category: categories[0]?.slug ?? 'men' }); setShowForm(true) }
    const openEdit = (product: Product) => {
        setEditing(product)
        setForm({ name: product.name, sku: product.sku, price: String(product.price), stock_quantity: String(product.stock_quantity), category: product.category, description: product.description ?? '', image_url: product.images[0]?.url ?? '', is_featured: product.is_featured, is_new_arrival: product.is_new_arrival })
        setShowForm(true)
    }
    const updateForm = <K extends keyof ProductForm>(key: K, value: ProductForm[K]) => setForm((previous) => ({ ...previous, [key]: value }))

    const saveProduct = async (event: React.FormEvent) => {
        event.preventDefault()
        const category = categories.find((item) => item.slug === form.category)
        const price = Number(form.price)
        const stock = Number(form.stock_quantity)
        if (!category || !form.name.trim() || !form.sku.trim() || !Number.isInteger(price) || price < 0 || !Number.isInteger(stock) || stock < 0) {
            toast.error('Enter a name, unique SKU, non-negative whole price and stock quantity')
            return
        }
        setSaving(true)
        try {
            let productId = editing?.id
            const payload = { name: form.name.trim(), description: form.description.trim() || null, category_id: category.id, price, sku: form.sku.trim().toUpperCase(), stock_quantity: stock, is_featured: form.is_featured, is_new_arrival: form.is_new_arrival }
            if (editing) {
                const { error } = await supabase.from('products').update(payload).eq('id', editing.id)
                if (error) throw error
            } else {
                const baseSlug = form.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'product'
                const { data, error } = await supabase.from('products').insert({ ...payload, slug: `${baseSlug}-${crypto.randomUUID().slice(0, 8)}`, sizes: [], colors: [], is_active: true }).select('id').single()
                if (error || !data) throw error ?? new Error('Product was created without an ID')
                productId = data.id
            }
            if (form.image_url.trim() && productId) {
                const existingImage = editing?.images[0]
                const imagePayload = { url: form.image_url.trim(), alt: form.name.trim(), is_primary: true, sort_order: 0 }
                const imageResult = existingImage
                    ? await supabase.from('product_images').update(imagePayload).eq('id', existingImage.id)
                    : await supabase.from('product_images').insert({ product_id: productId, ...imagePayload })
                if (imageResult.error) throw imageResult.error
            }
            toast.success(editing ? 'Product updated' : 'Product created')
            setShowForm(false)
            setEditing(null)
            await loadProducts()
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Unable to save product')
        } finally {
            setSaving(false)
        }
    }

    const toggleActive = async (product: Product) => {
        const { error } = await supabase.from('products').update({ is_active: !product.is_active }).eq('id', product.id)
        if (error) toast.error('Unable to update product status')
        else { setProducts((previous) => previous.map((item) => item.id === product.id ? { ...item, is_active: !item.is_active } : item)); toast.success('Product status updated') }
    }

    const deleteProduct = async () => {
        if (!deleteConfirm) return
        const { error } = await supabase.from('products').delete().eq('id', deleteConfirm)
        if (error) toast.error(error.message)
        else { setProducts((previous) => previous.filter((product) => product.id !== deleteConfirm)); setDeleteConfirm(null); toast.success('Product deleted') }
    }

    return <div className="space-y-6">
        <div className="flex items-center justify-between"><div><h1 className="text-2xl font-serif font-bold text-[#343B32]">Products</h1><p className="text-[#777] text-sm mt-0.5">{products.length} products total</p></div><button onClick={openCreate} className="flex items-center gap-2 bg-[#343B32] text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#A8C3A0] hover:text-[#343B32]"><Plus size={16} />Add Product</button></div>
        <div className="relative max-w-sm"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#777]" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by name or SKU…" className="w-full pl-9 pr-9 py-2.5 border border-[#EDE4D8] rounded-lg bg-white text-sm text-[#343B32] focus:outline-none focus:border-[#A8C3A0]" />{query && <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#777]" aria-label="Clear search"><X size={14} /></button>}</div>
        <div className="bg-white rounded-2xl border border-[#EDE4D8] overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-[#FAF8F4] border-b border-[#EDE4D8]"><tr>{['Product', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map((heading) => <th key={heading} className="px-5 py-3 text-left text-xs font-semibold text-[#777] uppercase tracking-wider whitespace-nowrap">{heading}</th>)}</tr></thead><tbody className="divide-y divide-[#EDE4D8]">{loading ? <tr><td colSpan={6} className="px-5 py-10 text-center text-[#777]">Loading products…</td></tr> : filtered.map((product) => <tr key={product.id} className="hover:bg-[#FAF8F4]"><td className="px-5 py-3"><div className="flex items-center gap-3">{product.images[0]?.url ? <img src={product.images[0].url} alt="" className="w-11 h-11 rounded-lg object-cover bg-[#EDE4D8]" /> : <div className="w-11 h-11 rounded-lg bg-[#EDE4D8]" />}<div><p className="font-medium text-[#343B32] text-sm">{product.name}</p><p className="text-xs text-[#777]">{product.sku}</p></div></div></td><td className="px-5 py-3 capitalize text-[#777]">{product.category}</td><td className="px-5 py-3 font-semibold text-[#343B32]">{formatPrice(product.price)}</td><td className="px-5 py-3"><span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${product.stock_quantity === 0 ? 'bg-red-100 text-red-700' : product.stock_quantity <= 5 ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>{product.stock_quantity} in stock</span></td><td className="px-5 py-3"><button onClick={() => toggleActive(product)} className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${product.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{product.is_active ? <Eye size={11} /> : <EyeOff size={11} />}{product.is_active ? 'Active' : 'Inactive'}</button></td><td className="px-5 py-3"><div className="flex items-center gap-1"><button onClick={() => openEdit(product)} className="p-2 text-[#777] hover:text-[#343B32] hover:bg-[#EDE4D8] rounded-lg" aria-label="Edit product"><Pencil size={14} /></button><button onClick={() => setDeleteConfirm(product.id)} className="p-2 text-[#777] hover:text-red-500 hover:bg-red-50 rounded-lg" aria-label="Delete product"><Trash2 size={14} /></button></div></td></tr>)}</tbody></table></div></div>
        {showForm && <div className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center p-4 overflow-y-auto"><form onSubmit={saveProduct} className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-xl my-8"><div className="flex items-center justify-between mb-6"><h3 className="font-semibold text-[#343B32] text-lg">{editing ? 'Edit Product' : 'Add New Product'}</h3><button type="button" onClick={() => setShowForm(false)} className="text-[#777]" aria-label="Close form"><X size={20} /></button></div><div className="space-y-4"><label className="block text-sm font-medium text-[#343B32]">Product name *<input value={form.name} onChange={(event) => updateForm('name', event.target.value)} required className="mt-1.5 w-full px-4 py-2.5 border border-[#EDE4D8] rounded-lg text-sm bg-[#FAF8F4]" /></label><label className="block text-sm font-medium text-[#343B32]">SKU *<input value={form.sku} onChange={(event) => updateForm('sku', event.target.value)} required className="mt-1.5 w-full px-4 py-2.5 border border-[#EDE4D8] rounded-lg text-sm bg-[#FAF8F4]" /></label><div className="grid grid-cols-2 gap-4"><label className="block text-sm font-medium text-[#343B32]">Price (RWF) *<input type="number" min="0" step="1" value={form.price} onChange={(event) => updateForm('price', event.target.value)} required className="mt-1.5 w-full px-4 py-2.5 border border-[#EDE4D8] rounded-lg text-sm bg-[#FAF8F4]" /></label><label className="block text-sm font-medium text-[#343B32]">Stock quantity *<input type="number" min="0" step="1" value={form.stock_quantity} onChange={(event) => updateForm('stock_quantity', event.target.value)} required className="mt-1.5 w-full px-4 py-2.5 border border-[#EDE4D8] rounded-lg text-sm bg-[#FAF8F4]" /></label></div><label className="block text-sm font-medium text-[#343B32]">Category *<select value={form.category} onChange={(event) => updateForm('category', event.target.value as Category)} className="mt-1.5 w-full px-4 py-2.5 border border-[#EDE4D8] rounded-lg text-sm bg-[#FAF8F4]">{categories.map((category) => <option key={category.id} value={category.slug}>{category.name}</option>)}</select></label><label className="block text-sm font-medium text-[#343B32]">Primary image URL<label className="sr-only" htmlFor="primary-image">Primary image URL</label><input id="primary-image" type="url" value={form.image_url} onChange={(event) => updateForm('image_url', event.target.value)} placeholder="https://…" className="mt-1.5 w-full px-4 py-2.5 border border-[#EDE4D8] rounded-lg text-sm bg-[#FAF8F4]" /></label><label className="block text-sm font-medium text-[#343B32]">Description<textarea value={form.description} onChange={(event) => updateForm('description', event.target.value)} rows={3} className="mt-1.5 w-full px-4 py-2.5 border border-[#EDE4D8] rounded-lg text-sm bg-[#FAF8F4] resize-none" /></label><div className="flex gap-4"><label className="flex items-center gap-2 text-sm text-[#343B32]"><input type="checkbox" checked={form.is_featured} onChange={(event) => updateForm('is_featured', event.target.checked)} />Featured</label><label className="flex items-center gap-2 text-sm text-[#343B32]"><input type="checkbox" checked={form.is_new_arrival} onChange={(event) => updateForm('is_new_arrival', event.target.checked)} />New arrival</label></div></div><div className="flex gap-3 mt-6"><button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-[#EDE4D8] text-[#343B32] rounded-lg py-2.5 text-sm font-medium">Cancel</button><button disabled={saving} className="flex-1 bg-[#343B32] text-white rounded-lg py-2.5 text-sm font-semibold disabled:opacity-60">{saving ? 'Saving…' : editing ? 'Save Changes' : 'Create Product'}</button></div></form></div>}
        {deleteConfirm && <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"><div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl"><h3 className="font-semibold text-[#343B32] text-lg mb-2">Delete Product?</h3><p className="text-[#777] text-sm mb-6">This permanently removes the product from the catalogue. Existing order item snapshots remain intact.</p><div className="flex gap-3"><button onClick={() => setDeleteConfirm(null)} className="flex-1 border border-[#EDE4D8] text-[#343B32] rounded-lg py-2.5 text-sm font-medium">Cancel</button><button onClick={deleteProduct} className="flex-1 bg-red-500 text-white rounded-lg py-2.5 text-sm font-semibold">Delete</button></div></div></div>}
    </div>
}
