"use client"
import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Loader2, ListTree, Package, DollarSign, X } from "lucide-react"

export default function MenuPage() {
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [variants, setVariants] = useState([])
  
  const [loading, setLoading] = useState(true)
  
  // Modals
  const [showCatModal, setShowCatModal] = useState(false)
  const [showProdModal, setShowProdModal] = useState(false)
  const [showVarModal, setShowVarModal] = useState(false)
  
  const [selectedCatId, setSelectedCatId] = useState(null)
  const [selectedProdId, setSelectedProdId] = useState(null)

  // Forms
  const [catForm, setCatForm] = useState({ id: null, name: "", description: "", active: true })
  const [prodForm, setProdForm] = useState({ id: null, name: "", description: "", image: "", active: true, categoryId: "", isBestseller: false, isDailyCombo: false })
  const [varForm, setVarForm] = useState({ id: null, name: "", price: "", minQuantity: 1, active: true, productId: "" })
  const [imageFile, setImageFile] = useState(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("admin_token")
      const headers = { Authorization: `Bearer ${token}` }
      
      const [catRes, prodRes, varRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/catalog/categories`, { headers }).then(r => r.json()),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/catalog/products`, { headers }).then(r => r.json()),
        // Wait, there's no GET /variants endpoint in catalog.routes.js that returns all variants directly. 
        // We'd have to fetch product by id to get variants or get menu. 
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/catalog/menu`, { headers }).then(r => r.json())
      ])

      if (catRes.success) setCategories(catRes.data)
      if (prodRes.success) setProducts(prodRes.data)
      
      // Extract all variants from the menu endpoint
      if (varRes.success && varRes.data) {
        let allVars = []
        Object.values(varRes.data).forEach(catProds => {
           catProds.forEach(p => {
             if (p.singleVariantId) allVars.push({ _id: p.singleVariantId, name: 'Single', price: p.price, minQuantity: 1, productId: p.id, active: true })
             if (p.packVariantId) allVars.push({ _id: p.packVariantId, name: `Pack of ${p.packQty}`, price: p.packPrice, minQuantity: p.packQty, productId: p.id, active: true })
           })
        })
        setVariants(allVars)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // === CATEGORY ===
  const handleSaveCat = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem("admin_token")
      const url = catForm.id 
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1/catalog/categories/${catForm.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/v1/catalog/categories`
      
      const res = await fetch(url, {
        method: catForm.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: catForm.name, description: catForm.description, active: catForm.active })
      })
      if (res.ok) {
        setShowCatModal(false)
        fetchData()
      }
    } catch(err) { console.error(err) }
  }

  const handleDeleteCat = async (id) => {
    if(!confirm("Delete this category and all its products?")) return;
    const token = localStorage.getItem("admin_token")
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/catalog/categories/${id}`, {
      method: "DELETE", headers: { Authorization: `Bearer ${token}` }
    })
    fetchData()
  }

  // === PRODUCT ===
  const handleSaveProd = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const token = localStorage.getItem("admin_token")
      
      let imageUrl = prodForm.image;
      
      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);
        
        const uploadRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/catalog/products/upload`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData
        });
        
        const uploadData = await uploadRes.json();
        if (uploadData.success) {
          imageUrl = uploadData.data.imageUrl;
        } else {
          alert('Image upload failed: ' + uploadData.message);
          setLoading(false);
          return;
        }
      }

      const url = prodForm.id 
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1/catalog/products/${prodForm.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/v1/catalog/products`
      
      const res = await fetch(url, {
        method: prodForm.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ 
          name: prodForm.name, description: prodForm.description, 
          images: imageUrl ? [imageUrl] : [], active: prodForm.active, categoryId: prodForm.categoryId,
          isBestseller: prodForm.isBestseller, isDailyCombo: prodForm.isDailyCombo
        })
      })
      if (res.ok) {
        setShowProdModal(false)
        setImageFile(null)
        fetchData()
      } else {
        setLoading(false)
      }
    } catch(err) { console.error(err); setLoading(false); }
  }

  const handleDeleteProd = async (id) => {
    if(!confirm("Delete this product?")) return;
    const token = localStorage.getItem("admin_token")
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/catalog/products/${id}`, {
      method: "DELETE", headers: { Authorization: `Bearer ${token}` }
    })
    fetchData()
  }

  // === VARIANT ===
  const handleSaveVar = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem("admin_token")
      const url = varForm.id 
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1/catalog/variants/${varForm.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/v1/catalog/variants`
      
      const res = await fetch(url, {
        method: varForm.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ 
          name: varForm.name, price: Number(varForm.price), 
          minQuantity: Number(varForm.minQuantity), active: varForm.active, productId: varForm.productId 
        })
      })
      if (res.ok) {
        setShowVarModal(false)
        fetchData()
      }
    } catch(err) { console.error(err) }
  }

  const handleDeleteVar = async (id) => {
    if(!confirm("Delete this variant?")) return;
    const token = localStorage.getItem("admin_token")
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/catalog/variants/${id}`, {
      method: "DELETE", headers: { Authorization: `Bearer ${token}` }
    })
    fetchData()
  }

  if (loading) return <div className="flex justify-center mt-20"><Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" /></div>

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--foreground)] mb-2">Menu CMS</h1>
          <p className="text-[var(--muted-foreground)] font-medium">Manage your categories, products and pricing.</p>
        </div>
        <button onClick={() => { setCatForm({id:null, name:"", description:"", active:true}); setShowCatModal(true) }} className="bg-[var(--primary)] text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-[var(--primary)]/90 font-bold shadow-md">
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {categories.map(cat => (
        <div key={cat._id} className="glass-panel rounded-2xl p-6 mb-6 premium-shadow">
          <div className="flex justify-between items-center border-b border-[var(--border)] pb-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[var(--primary)]/10 text-[var(--primary)] rounded-full flex items-center justify-center">
                <ListTree className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[var(--foreground)]">{cat.name}</h2>
                <p className="text-xs text-[var(--muted-foreground)]">{cat.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => { setProdForm({id:null, name:"", description:"", image:"", active:true, categoryId: cat._id}); setShowProdModal(true) }} className="text-sm bg-[#F2ECE4] dark:bg-[var(--sidebar)] text-[var(--foreground)] px-3 py-1.5 rounded-lg flex items-center gap-1 font-semibold hover:bg-[var(--border)] border border-[var(--border)]">
                <Plus className="w-3.5 h-3.5" /> Product
              </button>
              <button onClick={() => { setCatForm({id:cat._id, name:cat.name, description:cat.description||"", active:cat.active}); setShowCatModal(true) }} className="text-[var(--primary)] hover:bg-[var(--primary)]/10 p-2 rounded-md"><Edit className="w-4 h-4" /></button>
              <button onClick={() => handleDeleteCat(cat._id)} className="text-red-500 hover:bg-red-50 p-2 rounded-md"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.filter(p => p.categoryId && (p.categoryId._id === cat._id || p.categoryId === cat._id)).map(prod => (
              <div key={prod._id} className="border border-[var(--border)] rounded-xl p-4 bg-white dark:bg-[var(--sidebar)]">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex gap-3">
                    {prod.images?.[0] && <img src={prod.images[0]} alt="" className="w-12 h-12 rounded-lg object-cover" />}
                    <div>
                      <h3 className="font-bold text-[var(--foreground)] leading-tight">{prod.name}</h3>
                      <p className="text-xs text-[var(--muted-foreground)] line-clamp-1">{prod.description}</p>
                    </div>
                  </div>
                  <div className="flex">
                    <button onClick={() => { setProdForm({id:prod._id, name:prod.name, description:prod.description, image:prod.images?.[0]||"", active:prod.active, categoryId:cat._id, isBestseller:prod.isBestseller||false, isDailyCombo:prod.isDailyCombo||false}); setImageFile(null); setShowProdModal(true) }} className="text-[var(--primary)] p-1 hover:bg-[var(--primary)]/10 rounded"><Edit className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDeleteProd(prod._id)} className="text-red-500 p-1 hover:bg-red-50 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
                
                <div className="flex gap-2 mt-2">
                  {prod.isBestseller && <span className="text-[9px] bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border border-amber-200">★ Bestseller</span>}
                  {prod.isDailyCombo && <span className="text-[9px] bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border border-green-200">🍽️ Combo Meal</span>}
                </div>
                <div className="mt-3 bg-[#FAF8F5] dark:bg-black/20 rounded-lg p-2 border border-[#EAE5D9] dark:border-white/5">
                  <div className="flex justify-between items-center mb-2 px-1">
                    <span className="text-xs font-bold text-[var(--muted-foreground)] uppercase">Pricing Variants</span>
                    <button onClick={() => { setVarForm({id:null, name:"", price:"", minQuantity:1, active:true, productId: prod._id}); setShowVarModal(true) }} className="text-[10px] bg-[var(--primary)]/10 text-[var(--primary)] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 hover:bg-[var(--primary)]/20">
                      <Plus className="w-3 h-3" /> Add
                    </button>
                  </div>
                  {variants.filter(v => v.productId === prod._id).map(v => (
                    <div key={v._id} className="flex justify-between items-center text-sm py-1 px-1 border-b border-[var(--border)]/50 last:border-0">
                      <span className="font-medium">{v.name} (Qty {v.minQuantity})</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[var(--primary)]">₹{v.price}</span>
                        <button onClick={() => { setVarForm({id:v._id, name:v.name, price:v.price, minQuantity:v.minQuantity, active:v.active, productId:prod._id}); setShowVarModal(true) }} className="text-gray-400 hover:text-[var(--primary)]"><Edit className="w-3 h-3" /></button>
                        <button onClick={() => handleDeleteVar(v._id)} className="text-gray-400 hover:text-red-500"><Trash2 className="w-3 h-3" /></button>
                      </div>
                    </div>
                  ))}
                  {variants.filter(v => v.productId === prod._id).length === 0 && <div className="text-xs text-center py-2 text-red-400">No prices added!</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Category Modal */}
      {showCatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[var(--sidebar)] rounded-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">{catForm.id ? "Edit Category" : "New Category"}</h3>
              <button onClick={() => setShowCatModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSaveCat} className="space-y-4">
              <div><label className="text-sm font-medium">Name</label><input required value={catForm.name} onChange={e=>setCatForm({...catForm, name:e.target.value})} className="w-full mt-1 px-3 py-2 border rounded-lg" /></div>
              <div><label className="text-sm font-medium">Description</label><input value={catForm.description} onChange={e=>setCatForm({...catForm, description:e.target.value})} className="w-full mt-1 px-3 py-2 border rounded-lg" /></div>
              <button className="w-full bg-[var(--primary)] text-white py-2 rounded-lg font-bold">Save Category</button>
            </form>
          </div>
        </div>
      )}

      {/* Product Modal */}
      {showProdModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[var(--sidebar)] rounded-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">{prodForm.id ? "Edit Product" : "New Product"}</h3>
              <button onClick={() => { setShowProdModal(false); setImageFile(null); }}><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSaveProd} className="space-y-4">
              <div><label className="text-sm font-medium">Name</label><input required value={prodForm.name} onChange={e=>setProdForm({...prodForm, name:e.target.value})} className="w-full mt-1 px-3 py-2 border rounded-lg" /></div>
              <div><label className="text-sm font-medium">Description</label><input value={prodForm.description} onChange={e=>setProdForm({...prodForm, description:e.target.value})} className="w-full mt-1 px-3 py-2 border rounded-lg" /></div>
              
              <div>
                <label className="text-sm font-medium block mb-1">Product Image</label>
                {prodForm.image && !imageFile && (
                  <div className="mb-2 relative w-fit">
                    <img src={prodForm.image.startsWith('/') ? `${process.env.NEXT_PUBLIC_API_URL}${prodForm.image}` : prodForm.image} alt="Preview" className="w-20 h-20 object-cover rounded-lg border border-[var(--border)]" />
                    <button type="button" onClick={() => setProdForm({...prodForm, image: ""})} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5"><X className="w-3 h-3" /></button>
                  </div>
                )}
                {imageFile && (
                  <div className="mb-2 text-xs text-[var(--primary)] font-medium">New file selected: {imageFile.name}</div>
                )}
                <input type="file" accept="image/jpeg, image/png, image/webp" onChange={e => setImageFile(e.target.files[0])} className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[var(--primary)]/10 file:text-[var(--primary)] hover:file:bg-[var(--primary)]/20" />
              </div>
              <div className="flex gap-4 mt-2">
                <label className="flex items-center gap-2 text-sm font-medium">
                  <input type="checkbox" checked={prodForm.isBestseller} onChange={e=>setProdForm({...prodForm, isBestseller:e.target.checked})} className="w-4 h-4 text-[var(--primary)] rounded focus:ring-[var(--primary)]" />
                  Feature as Signature Bestseller
                </label>
                <label className="flex items-center gap-2 text-sm font-medium">
                  <input type="checkbox" checked={prodForm.isDailyCombo} onChange={e=>setProdForm({...prodForm, isDailyCombo:e.target.checked})} className="w-4 h-4 text-[var(--primary)] rounded focus:ring-[var(--primary)]" />
                  Feature as Daily Combo Meal
                </label>
              </div>
              <button className="w-full bg-[var(--primary)] text-white py-2 rounded-lg font-bold">Save Product</button>
            </form>
          </div>
        </div>
      )}

      {/* Variant Modal */}
      {showVarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[var(--sidebar)] rounded-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">{varForm.id ? "Edit Price/Variant" : "New Price/Variant"}</h3>
              <button onClick={() => setShowVarModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSaveVar} className="space-y-4">
              <div><label className="text-sm font-medium">Variant Name (e.g. Single, Pack of 5)</label><input required value={varForm.name} onChange={e=>setVarForm({...varForm, name:e.target.value})} className="w-full mt-1 px-3 py-2 border rounded-lg" /></div>
              <div><label className="text-sm font-medium">Price (₹)</label><input required type="number" value={varForm.price} onChange={e=>setVarForm({...varForm, price:e.target.value})} className="w-full mt-1 px-3 py-2 border rounded-lg" /></div>
              <div><label className="text-sm font-medium">Minimum Quantity</label><input required type="number" value={varForm.minQuantity} onChange={e=>setVarForm({...varForm, minQuantity:e.target.value})} className="w-full mt-1 px-3 py-2 border rounded-lg" /></div>
              <button className="w-full bg-[var(--primary)] text-white py-2 rounded-lg font-bold">Save Variant</button>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
