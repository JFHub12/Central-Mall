import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, Search, PlusCircle, ShoppingCart, ArrowLeft, Tag, MapPin, User, Phone, CheckCircle2, X, CreditCard, Smartphone, DollarSign, Sparkles } from 'lucide-react';
import { Product, ProductCategory, CartItem, PaymentMethod, Order } from '../types';

interface ShopViewProps {
  user: any;
  onBackToDashboard: () => void;
  initialSearchQuery?: string;
}

export const ShopView: React.FC<ShopViewProps> = ({ user, onBackToDashboard, initialSearchQuery = '' }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('All');
  
  // Modals & Drawers
  const [showSellModal, setShowSellModal] = useState(false);
  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);

  // Form State for Listing Item to Sell
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState<ProductCategory>('Textbooks & Books');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [sellerName, setSellerName] = useState(user?.name || '');
  const [sellerContact, setSellerContact] = useState(user?.phone || '');
  const [locationOnCampus, setLocationOnCampus] = useState('Trinity / Destiny Hall');
  const [condition, setCondition] = useState<'Brand New' | 'Like New' | 'Fair'>('Brand New');
  const [submittingProduct, setSubmittingProduct] = useState(false);

  // Checkout Form State
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('momo');
  const [momoNumber, setMomoNumber] = useState(user?.phone || '');
  const [deliveryLocation, setDeliveryLocation] = useState('Trinity Hall Porter Desk');
  const [processingPayment, setProcessingPayment] = useState(false);

  // Fetch Products from API
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.products) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error('Failed to fetch products', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Cart Management
  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Handle Sell Form Submission
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !price || !sellerName || !sellerContact) return;

    setSubmittingProduct(true);
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          price: parseFloat(price),
          category,
          description,
          image: image || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80',
          sellerName,
          sellerContact,
          sellerRole: user?.role === 'merchant' ? 'Campus Merchant' : 'Student Seller',
          locationOnCampus,
          condition,
        }),
      });

      if (res.ok) {
        await fetchProducts();
        setShowSellModal(false);
        // Reset form
        setTitle('');
        setPrice('');
        setDescription('');
        setImage('');
      }
    } catch (err) {
      console.error('Error listing product', err);
    } finally {
      setSubmittingProduct(false);
    }
  };

  // Handle Checkout & Order Placement
  const handleProcessOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setProcessingPayment(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart,
          totalAmount: cartTotal,
          paymentMethod,
          momoNumber: paymentMethod !== 'card' && paymentMethod !== 'cod' ? momoNumber : undefined,
          deliveryLocation,
        }),
      });

      const data = await res.json();
      if (res.ok && data.order) {
        setCompletedOrder(data.order);
        setCart([]);
        setShowCheckoutModal(false);
      }
    } catch (err) {
      console.error('Error placing order', err);
    } finally {
      setProcessingPayment(false);
    }
  };

  // Categories list
  const categories: ProductCategory[] = [
    'All',
    'Textbooks & Books',
    'Electronics & Gadgets',
    'Fashion & Clothing',
    'Food & Snacks',
    'Hostel Essentials',
    'Services & Printing',
  ];

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sellerName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="relative min-h-screen z-10 flex flex-col px-4 py-6 text-slate-800 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 bg-white/90 border border-red-200/80 p-4 rounded-3xl backdrop-blur-md shadow-lg shadow-red-100/50">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToDashboard}
            id="back-to-dashboard-from-shop"
            className="p-2 bg-slate-100 hover:bg-red-50 border border-slate-200 hover:border-red-200 text-slate-600 hover:text-[#CE1126] rounded-full transition-colors cursor-pointer"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-2">
              <ShoppingBag className="w-6 h-6 text-[#CE1126]" />
              Central Marketplace
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Buy & Sell freely on Central University Miotso Campus
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Sell Button */}
          <button
            onClick={() => setShowSellModal(true)}
            id="open-sell-modal-button"
            className="flex items-center gap-2 bg-[#CE1126] hover:bg-[#A00D1D] text-white font-extrabold text-xs md:text-sm px-4 py-2.5 rounded-full shadow-md shadow-red-200 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>List Item to Sell</span>
          </button>

          {/* Cart Button */}
          <button
            onClick={() => setShowCartDrawer(true)}
            id="open-cart-drawer-button"
            className="relative flex items-center gap-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 font-bold text-xs md:text-sm px-4 py-2.5 rounded-full transition-all cursor-pointer"
          >
            <ShoppingCart className="w-4 h-4 text-[#CE1126]" />
            <span>Cart</span>
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-[#CE1126] text-white font-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm animate-bounce">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="space-y-4 mb-8">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-[#CE1126]" />
          <input
            type="text"
            placeholder="Search textbooks, laptops, hoodies, Jollof rice, hostel fridges..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-10 py-3 bg-white border border-red-100 rounded-2xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#CE1126] shadow-sm shadow-red-100/30"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Category Pill Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                selectedCategory === cat
                  ? 'bg-[#CE1126] border-[#CE1126] text-white shadow-md shadow-red-200'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-[#CE1126] hover:text-[#CE1126]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="text-center py-20">
          <div className="w-12 h-12 border-4 border-[#CE1126] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-600 font-medium">Loading Miotso Marketplace items...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-white border border-red-100 rounded-3xl p-8 shadow-xl shadow-red-100/50">
          <ShoppingBag className="w-12 h-12 text-[#CE1126]/50 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900 mb-1">No products found</h3>
          <p className="text-xs text-slate-500 font-medium mb-4">
            Be the first to list an item in this category for students at Central University Miotso!
          </p>
          <button
            onClick={() => setShowSellModal(true)}
            className="px-5 py-2.5 bg-[#CE1126] hover:bg-[#A00D1D] text-white font-extrabold text-xs rounded-full shadow-md shadow-red-200 cursor-pointer"
          >
            Sell Something Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="group bg-white border border-gray-100 hover:border-red-200 rounded-3xl overflow-hidden shadow-xl shadow-gray-100/80 hover:shadow-2xl hover:shadow-red-100 transition-all hover:-translate-y-1 flex flex-col justify-between"
            >
              <div>
                {/* Product Image */}
                <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 left-3 bg-[#CE1126] text-white font-black text-xs px-3 py-1 rounded-full shadow-md">
                    GHS {product.price}
                  </div>
                  <div className="absolute top-3 right-3 bg-white/90 text-slate-700 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm border border-slate-200">
                    {product.condition}
                  </div>
                </div>

                {/* Info Content */}
                <div className="p-5">
                  <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-[#CE1126] mb-2">
                    <Tag className="w-3 h-3" />
                    <span>{product.category}</span>
                  </div>

                  <h3 className="text-base font-extrabold text-slate-900 mb-2 line-clamp-2 leading-snug group-hover:text-[#CE1126] transition-colors">
                    {product.title}
                  </h3>

                  <p className="text-xs text-slate-500 font-medium line-clamp-2 mb-4 leading-relaxed">
                    {product.description}
                  </p>

                  <div className="space-y-1.5 pt-3 border-t border-slate-100 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-[#CE1126]" />
                      <span className="font-bold text-slate-800">{product.sellerName}</span>
                      <span className="text-[10px] bg-red-50 text-[#CE1126] font-bold px-1.5 py-0.5 rounded-full border border-red-100">
                        {product.sellerRole}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#CE1126]" />
                      <span>{product.locationOnCampus}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-[#CE1126]" />
                      <span>{product.sellerContact}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="p-5 pt-0">
                <button
                  onClick={() => addToCart(product)}
                  id={`add-to-cart-${product.id}`}
                  className="w-full py-2.5 bg-[#CE1126] hover:bg-[#A00D1D] text-white font-extrabold text-xs rounded-full shadow-md shadow-red-200 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Add to Order Cart</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* MODAL: LIST ITEM TO SELL */}
      <AnimatePresence>
        {showSellModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white border border-red-100 w-full max-w-lg rounded-3xl p-6 md:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto text-slate-800"
            >
              <button
                onClick={() => setShowSellModal(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-800 bg-slate-100 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-6 text-left">
                <div className="inline-flex items-center gap-2 bg-red-50 border border-red-200 px-3 py-1 rounded-full text-xs font-bold text-[#CE1126] mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#CE1126]" />
                  <span>Open to all Central Students & Sellers</span>
                </div>
                <h2 className="text-2xl font-black text-slate-900">List Your Item for Sale</h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Put your textbooks, electronics, food, or hostel items on Central Mall.
                </p>
              </div>

              <form onSubmit={handleCreateProduct} className="space-y-4 text-left">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Item Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Engineering Maths Textbook / Mini Fridge / Hoodie"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#CE1126] focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Price (GHS / Cedis)
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="e.g. 150"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#CE1126] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as ProductCategory)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-[#CE1126] focus:bg-white"
                    >
                      {categories.filter((c) => c !== 'All').map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Condition
                    </label>
                    <select
                      value={condition}
                      onChange={(e) => setCondition(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-[#CE1126] focus:bg-white"
                    >
                      <option value="Brand New">Brand New</option>
                      <option value="Like New">Like New</option>
                      <option value="Fair">Fair</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Campus Location
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Trinity Hall Block C"
                      value={locationOnCampus}
                      onChange={(e) => setLocationOnCampus(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#CE1126] focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Seller Name
                    </label>
                    <input
                      type="text"
                      required
                      value={sellerName}
                      onChange={(e) => setSellerName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#CE1126] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Contact Phone / MoMo
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+233 24 123 4567"
                      value={sellerContact}
                      onChange={(e) => setSellerContact(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#CE1126] focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Image URL (Optional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#CE1126] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describe your item, features, reason for selling..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#CE1126] focus:bg-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingProduct}
                  id="submit-product-listing-button"
                  className="w-full py-3 bg-[#CE1126] hover:bg-[#A00D1D] text-white font-extrabold rounded-full shadow-lg shadow-red-200 cursor-pointer disabled:opacity-50"
                >
                  {submittingProduct ? 'Publishing Item...' : 'Publish Item to Central Mall'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DRAWER: SHOPPING CART */}
      <AnimatePresence>
        {showCartDrawer && (
          <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="bg-white border-l border-red-100 w-full max-w-md h-full p-6 flex flex-col justify-between shadow-2xl overflow-y-auto text-slate-800"
            >
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-[#CE1126]" />
                    <h2 className="text-xl font-black text-slate-900">Your Order Cart</h2>
                  </div>
                  <button
                    onClick={() => setShowCartDrawer(false)}
                    className="p-1.5 text-slate-400 hover:text-slate-800 bg-slate-100 rounded-full cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {cart.length === 0 ? (
                  <div className="text-center py-16 text-slate-400">
                    <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p className="text-sm font-bold text-slate-700">Your cart is currently empty.</p>
                    <p className="text-xs text-slate-400 mt-1">Add items from the marketplace above.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div
                        key={item.product.id}
                        className="bg-slate-50 border border-slate-200 p-3 rounded-2xl flex items-center gap-3"
                      >
                        <img
                          src={item.product.image}
                          alt={item.product.title}
                          className="w-16 h-16 object-cover rounded-xl bg-slate-200"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-slate-900 truncate">
                            {item.product.title}
                          </h4>
                          <p className="text-xs font-extrabold text-[#CE1126] mt-0.5">
                            GHS {item.product.price}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              onClick={() => updateQuantity(item.product.id, -1)}
                              className="w-6 h-6 rounded-md bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs flex items-center justify-center cursor-pointer"
                            >
                              -
                            </button>
                            <span className="text-xs font-bold text-slate-900 px-2">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.product.id, 1)}
                              className="w-6 h-6 rounded-md bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs flex items-center justify-center cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-slate-400 hover:text-[#CE1126] p-1 cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {cart.length > 0 && (
                <div className="pt-4 border-t border-slate-100 space-y-4">
                  <div className="flex items-center justify-between text-sm font-bold text-slate-900">
                    <span>Total Amount:</span>
                    <span className="text-xl font-black text-[#CE1126]">GHS {cartTotal.toFixed(2)}</span>
                  </div>

                  <button
                    onClick={() => {
                      setShowCartDrawer(false);
                      setShowCheckoutModal(true);
                    }}
                    id="proceed-to-checkout-button"
                    className="w-full py-3 bg-[#CE1126] hover:bg-[#A00D1D] text-white font-extrabold rounded-full shadow-lg shadow-red-200 cursor-pointer"
                  >
                    Proceed to Payment & Checkout
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: CHECKOUT & PAYMENT */}
      <AnimatePresence>
        {showCheckoutModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white border border-red-100 w-full max-w-lg rounded-3xl p-6 md:p-8 shadow-2xl relative text-slate-800"
            >
              <button
                onClick={() => setShowCheckoutModal(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-800 bg-slate-100 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-6 text-left">
                <h2 className="text-2xl font-black text-slate-900">Order Payment Checkout</h2>
                <p className="text-xs text-slate-500 font-medium">
                  Total Payable: <span className="font-extrabold text-[#CE1126]">GHS {cartTotal.toFixed(2)}</span>
                </p>
              </div>

              <form onSubmit={handleProcessOrder} className="space-y-4 text-left">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Select Payment Method
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {/* MTN MoMo */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('momo')}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 cursor-pointer transition-all ${
                        paymentMethod === 'momo'
                          ? 'bg-amber-50 border-amber-400 text-amber-900 font-bold shadow-sm'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-[#CE1126]'
                      }`}
                    >
                      <Smartphone className="w-5 h-5 text-amber-600" />
                      <span className="text-[11px]">MTN MoMo</span>
                    </button>

                    {/* Telecel Cash */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('telecel')}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 cursor-pointer transition-all ${
                        paymentMethod === 'telecel'
                          ? 'bg-red-50 border-[#CE1126] text-[#CE1126] font-bold shadow-sm'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-[#CE1126]'
                      }`}
                    >
                      <Smartphone className="w-5 h-5 text-[#CE1126]" />
                      <span className="text-[11px]">Telecel Cash</span>
                    </button>

                    {/* AT Money */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('at_money')}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 cursor-pointer transition-all ${
                        paymentMethod === 'at_money'
                          ? 'bg-blue-50 border-blue-400 text-blue-900 font-bold shadow-sm'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-[#CE1126]'
                      }`}
                    >
                      <Smartphone className="w-5 h-5 text-blue-600" />
                      <span className="text-[11px]">AT Money</span>
                    </button>

                    {/* Cash on Campus */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('cod')}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 cursor-pointer transition-all ${
                        paymentMethod === 'cod'
                          ? 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold shadow-sm'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-[#CE1126]'
                      }`}
                    >
                      <DollarSign className="w-5 h-5 text-emerald-600" />
                      <span className="text-[11px]">Cash on Campus</span>
                    </button>
                  </div>
                </div>

                {paymentMethod !== 'cod' && paymentMethod !== 'card' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Mobile Money Number
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 0244123456"
                      value={momoNumber}
                      onChange={(e) => setMomoNumber(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#CE1126] focus:bg-white"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      A payment prompt will be dispatched to your mobile money phone.
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Miotso Campus Delivery Location
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Trinity Hall / Destiny Hall / Senate Block / Library"
                    value={deliveryLocation}
                    onChange={(e) => setDeliveryLocation(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#CE1126] focus:bg-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={processingPayment}
                  id="confirm-payment-order-button"
                  className="w-full py-3.5 bg-[#CE1126] hover:bg-[#A00D1D] text-white font-extrabold text-sm rounded-full shadow-lg shadow-red-200 cursor-pointer disabled:opacity-50"
                >
                  {processingPayment ? 'Processing MoMo Payment...' : `Pay GHS ${cartTotal.toFixed(2)} & Order`}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: COMPLETED ORDER RECEIPT */}
      <AnimatePresence>
        {completedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white border-2 border-emerald-400 w-full max-w-md rounded-3xl p-6 text-center shadow-2xl relative text-slate-800"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 border border-emerald-300 flex items-center justify-center mx-auto mb-4 animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <h3 className="text-2xl font-black text-slate-900">Payment Successful!</h3>
              <p className="text-xs text-slate-500 font-medium mt-1 mb-6">
                Your order has been confirmed on Central Mall Miotso.
              </p>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left text-xs space-y-2 mb-6">
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500 font-bold">Order ID:</span>
                  <span className="font-bold text-slate-900">{completedOrder.id}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500 font-bold">Amount Paid:</span>
                  <span className="font-extrabold text-emerald-600">GHS {completedOrder.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500 font-bold">Payment Method:</span>
                  <span className="font-bold text-slate-900 uppercase">{completedOrder.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-bold">Delivery Location:</span>
                  <span className="font-bold text-slate-900">{completedOrder.deliveryLocation}</span>
                </div>
              </div>

              <button
                onClick={() => setCompletedOrder(null)}
                className="w-full py-3 bg-[#CE1126] hover:bg-[#A00D1D] text-white font-extrabold rounded-full shadow-md shadow-red-200 cursor-pointer"
              >
                Back to Marketplace
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
