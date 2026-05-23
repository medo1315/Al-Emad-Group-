import { useState, useEffect } from "react";
// @ts-ignore
import { createPortal } from "react-dom";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";
import { formatPrice } from "../../utils/currency";
import { Search, Plus, Edit, Trash2, Eye, X, Loader2, Save, Sparkles, Package, FileText, Image as ImageIcon } from "lucide-react";
import { API_BASE_URL } from "../../config";
import { toast } from "sonner";

interface Product {
  id: number;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  price: number;
  image: string;
  rating: number;
  inStock: boolean;
  stock: number;
  sizesJson: string;
  imagesJson: string;
  category: string;
  categoryAr: string;
  isNew: boolean;
  discount: number;
  benefitsJson?: string;
  featuresJson?: string;
  nutritionalJson?: string;
}

export function AdminProducts() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const isRtl = language === "ar";
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"add" | "edit">("add");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Dynamic Size List state
  const [sizesList, setSizesList] = useState<{ size: string; price: number }[]>([]);
  const [newSizeName, setNewSizeName] = useState("");
  const [newSizePrice, setNewSizePrice] = useState<number>(0);

  // Dynamic Image Gallery state
  const [imagesList, setImagesList] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState("");

  // Benefits List State
  const [benefitsList, setBenefitsList] = useState<{ text: string; textAr: string }[]>([]);
  const [newBenefitText, setNewBenefitText] = useState("");
  const [newBenefitTextAr, setNewBenefitTextAr] = useState("");

  // Features List State
  const [featuresList, setFeaturesList] = useState<{ text: string; textAr: string }[]>([]);
  const [newFeatureText, setNewFeatureText] = useState("");
  const [newFeatureTextAr, setNewFeatureTextAr] = useState("");

  // Nutritional Info State
  const [nutritionalFootnote, setNutritionalFootnote] = useState("");
  const [nutritionalFootnoteAr, setNutritionalFootnoteAr] = useState("");
  const [nutritionalRows, setNutritionalRows] = useState<{ label: string; labelAr: string; value: string; valueAr: string }[]>([]);
  const [newNutrLabel, setNewNutrLabel] = useState("");
  const [newNutrLabelAr, setNewNutrLabelAr] = useState("");
  const [newNutrVal, setNewNutrVal] = useState("");
  const [newNutrValAr, setNewNutrValAr] = useState("");

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    nameAr: "",
    description: "",
    descriptionAr: "",
    price: 19.99,
    image: "",
    category: "extra-virgin",
    categoryAr: "extra-virgin",
    inStock: true,
    isNew: false,
    discount: 0,
    rating: 5.0,
    stock: 50,
  });

  const categories = [
    { id: "extra-virgin", nameEn: "Extra Virgin", nameAr: "بكر ممتاز" },
    { id: "organic", nameEn: "Organic", nameAr: "عضوي" },
    { id: "infused", nameEn: "Infused Oils", nameAr: "منكهة" },
    { id: "premium", nameEn: "Premium", nameAr: "فاخر" },
  ];

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/products`);
      if (!response.ok) throw new Error("Failed to fetch products");
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      toast.error(isRtl ? "فشل تحميل المنتجات من الخادم." : "Failed to load products from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenAddModal = () => {
    setModalType("add");
    setSelectedProduct(null);
    setFormData({
      name: "",
      nameAr: "",
      description: "",
      descriptionAr: "",
      price: 24.99,
      image: "https://images.unsplash.com/photo-1759749597861-e90685f026b4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
      category: "extra-virgin",
      categoryAr: "extra-virgin",
      inStock: true,
      isNew: false,
      discount: 0,
      rating: 5.0,
      stock: 50,
    });
    setSizesList([
      { size: "250ml", price: 14.99 },
      { size: "500ml", price: 24.99 },
      { size: "750ml", price: 34.99 },
      { size: "1L", price: 42.99 }
    ]);
    setImagesList([
      "https://images.unsplash.com/photo-1759749597861-e90685f026b4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
      "https://images.unsplash.com/photo-1760445528823-fd942d4b459b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
      "https://images.unsplash.com/photo-1759749597905-e2fed85d8cd5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800"
    ]);
    setBenefitsList([
      { text: "Free shipping on orders over EGP 500", textAr: "شحن مجاني للطلبات فوق 500 ج.م" },
      { text: "100% satisfaction guarantee", textAr: "ضمان رضا 100%" },
      { text: "30-day easy returns", textAr: "إرجاع سهل خلال 30 يومًا" }
    ]);
    setFeaturesList([
      { text: "100% Cold-pressed extra virgin", textAr: "عصرة أولى على البارد 100%" },
      { text: "First harvest premium olives", textAr: "زيتون ممتاز من القطفة الأولى" },
      { text: "Rich in antioxidants", textAr: "غني بمضادات الأكسدة" },
      { text: "Perfect for cooking & dressing", textAr: "مثالي للطبخ والتتبيل" },
      { text: "Glass bottle packaging", textAr: "تعبئة في زجاجة فاخرة" },
      { text: "Certified organic", textAr: "عضوي معتمد" }
    ]);
    setNutritionalFootnote("* Percent Daily Values are based on a 2,000 calorie diet");
    setNutritionalFootnoteAr("* تعتمد النسب المئوية للقيم اليومية على نظام غذائي يحتوي على 2000 سعرة حرارية");
    setNutritionalRows([
      { label: "Calories", labelAr: "السعرات الحرارية", value: "120 per tbsp", valueAr: "120 لكل ملعقة كبيرة" },
      { label: "Total Fat", labelAr: "الدهون الكلية", value: "14g", valueAr: "14 جرام" },
      { label: "Saturated Fat", labelAr: "الدهون المشبعة", value: "2g", valueAr: "2 جرام" },
      { label: "Vitamin E", labelAr: "فيتامين E", value: "15% DV", valueAr: "15% من القيمة اليومية" },
      { label: "Polyphenols", labelAr: "البوليفينول", value: "High", valueAr: "مرتفع" }
    ]);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setModalType("edit");
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      nameAr: product.nameAr,
      description: product.description,
      descriptionAr: product.descriptionAr,
      price: product.price,
      image: product.image,
      category: product.category,
      categoryAr: product.categoryAr,
      inStock: product.inStock,
      isNew: product.isNew,
      discount: product.discount,
      rating: product.rating,
      stock: product.stock,
    });
    try {
      setSizesList(JSON.parse(product.sizesJson || "[]"));
    } catch (e) {
      setSizesList([]);
    }
    try {
      setImagesList(JSON.parse(product.imagesJson || "[]"));
    } catch (e) {
      setImagesList(product.image ? [product.image] : []);
    }
    try {
      setBenefitsList(JSON.parse(product.benefitsJson || "[]"));
    } catch (e) {
      setBenefitsList([]);
    }
    try {
      setFeaturesList(JSON.parse(product.featuresJson || "[]"));
    } catch (e) {
      setFeaturesList([]);
    }
    try {
      const nutr = JSON.parse(product.nutritionalJson || "{}");
      setNutritionalFootnote(nutr.footnote || "");
      setNutritionalFootnoteAr(nutr.footnoteAr || "");
      setNutritionalRows(nutr.info || []);
    } catch (e) {
      setNutritionalFootnote("");
      setNutritionalFootnoteAr("");
      setNutritionalRows([]);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.token) {
      toast.error(isRtl ? "غير مصرح. يرجى تسجيل الدخول كمسؤول." : "Unauthorized. Please login as admin.");
      return;
    }

    if (!formData.name || !formData.nameAr || !formData.description || !formData.descriptionAr || !formData.image) {
      toast.error(isRtl ? "يرجى تعبئة جميع الحقول المطلوبة." : "Please fill in all required fields.");
      return;
    }

    if (sizesList.length === 0) {
      toast.error(isRtl ? "يرجى إضافة حجم وسعر واحد على الأقل للمنتج." : "Please add at least one size and price.");
      return;
    }

    if (imagesList.length === 0) {
      toast.error(isRtl ? "يرجى إضافة صورة واحدة على الأقل لمعرض صور المنتج." : "Please add at least one image to the gallery.");
      return;
    }

    setSubmitting(true);
    const url = modalType === "add" ? `${API_BASE_URL}/products` : `${API_BASE_URL}/products/${selectedProduct?.id}`;
    const method = modalType === "add" ? "POST" : "PUT";

    const basePrice = sizesList.length > 0 ? sizesList[0].price : formData.price;
    const firstImage = imagesList.length > 0 ? imagesList[0] : formData.image;
    const payload = {
      ...formData,
      price: basePrice,
      image: firstImage,
      stock: parseInt(formData.stock.toString()) || 0,
      sizesJson: JSON.stringify(sizesList),
      imagesJson: JSON.stringify(imagesList),
      benefitsJson: JSON.stringify(benefitsList),
      featuresJson: JSON.stringify(featuresList),
      nutritionalJson: JSON.stringify({
        footnote: nutritionalFootnote,
        footnoteAr: nutritionalFootnoteAr,
        info: nutritionalRows
      })
    };

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Operation failed.");
      }

      toast.success(
        isRtl 
          ? (modalType === "add" ? "تم إضافة المنتج بنجاح!" : "تم تعديل المنتج بنجاح!")
          : (modalType === "add" ? "Product added successfully!" : "Product updated successfully!")
      );

      handleCloseModal();
      fetchProducts();
    } catch (err: any) {
      toast.error(err.message || (isRtl ? "حدث خطأ ما." : "Something went wrong."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    const confirmDelete = window.confirm(
      isRtl ? "هل أنت متأكد من حذف هذا المنتج؟" : "Are you sure you want to delete this product?"
    );
    if (!confirmDelete) return;

    if (!user?.token) {
      toast.error(isRtl ? "غير مصرح." : "Unauthorized.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${user.token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete product.");
      }

      toast.success(isRtl ? "تم حذف المنتج بنجاح!" : "Product deleted successfully!");
      fetchProducts();
    } catch (err: any) {
      toast.error(err.message || (isRtl ? "فشل الحذف." : "Failed to delete."));
    }
  };

  const getProductSizesText = (product: Product) => {
    try {
      const list = JSON.parse(product.sizesJson || "[]");
      if (list.length > 0) {
        return list.map((item: any) => `${item.size} (${formatPrice(item.price, language)})`).join(" ، ");
      }
    } catch (e) {}
    return isRtl ? "غير محدد" : "Not configured";
  };

  const getProductDisplayPrice = (product: Product) => {
    try {
      const list = JSON.parse(product.sizesJson || "[]");
      if (list.length > 0) {
        return list[0].price;
      }
    } catch (e) {}
    return product.price;
  };

  const filteredProducts = products.filter(product => {
    const name = isRtl ? (product.nameAr || product.name) : product.name;
    const cat = isRtl ? (product.categoryAr || product.category) : product.category;
    return name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           cat.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="p-6 lg:p-8 min-h-screen bg-petroleum-dark/40">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl text-white mb-2 flex items-center gap-2">
            <Package className="w-8 h-8 text-teal-accent" />
            <span>{isRtl ? "إدارة المنتجات" : "Product Catalog"}</span>
          </h1>
          <p className="text-sage-green-light">
            {isRtl ? "إضافة، تعديل وحذف منتجات متجر العماد" : "Manage your premium products from Our Farms"}
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-accent to-petroleum-light text-white rounded-xl hover:from-petroleum-light hover:to-teal-dark transition-all shadow-xl font-medium"
        >
          <Plus className="w-5 h-5" />
          <span>{isRtl ? "إضافة منتج جديد" : "Add Product"}</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className={`absolute ${isRtl ? "right-4" : "left-4"} top-1/2 -translate-y-1/2 w-5 h-5 text-teal-accent/80`} />
          <input
            type="text"
            placeholder={isRtl ? "البحث عن منتج..." : "Search products..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full ${isRtl ? "pr-12 pl-4" : "pl-12 pr-4"} py-3 bg-petroleum-blue/30 backdrop-blur-sm text-white rounded-xl border border-teal-accent/30 focus:outline-none focus:ring-2 focus:ring-teal-accent`}
          />
        </div>
      </div>

      {/* Loader */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-white">
          <Loader2 className="w-12 h-12 animate-spin text-teal-accent" />
          <p className="text-sage-green-light">{isRtl ? "جاري تحميل قائمة المنتجات..." : "Loading products list..."}</p>
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="grid gap-6">
          {filteredProducts.map((product) => {
            const productName = isRtl ? (product.nameAr || product.name) : product.name;
            const categoryObj = categories.find(c => c.id === product.category);
            const categoryName = isRtl 
              ? (categoryObj?.nameAr || product.categoryAr || product.category) 
              : (categoryObj?.nameEn || product.category);

            return (
              <div
                key={product.id}
                className="bg-petroleum-blue/20 backdrop-blur-sm rounded-2xl p-6 border border-teal-accent/20 hover:border-teal-accent/40 hover:shadow-2xl transition-all duration-300"
              >
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <img
                    src={product.image}
                    alt={productName}
                    className="w-24 h-24 rounded-2xl object-cover flex-shrink-0 border border-teal-accent/20"
                  />

                  <div className="flex-1 min-w-0 text-center md:text-left">
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-1">
                      <h3 className="font-display text-2xl text-white font-semibold">
                        {productName}
                      </h3>
                      {product.isNew && (
                        <span className="px-2 py-0.5 bg-teal-accent/20 text-teal-accent text-xs rounded-full font-semibold">
                          {isRtl ? "جديد" : "New"}
                        </span>
                      )}
                      {product.discount > 0 && (
                        <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full font-semibold">
                          -{product.discount}%
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-sage-green-light mb-3">{categoryName} • <span className="text-white/80">{getProductSizesText(product)}</span></p>
                    <div className="flex items-center justify-center md:justify-start gap-4">
                      <span className="text-teal-accent text-xl font-bold">{formatPrice(getProductDisplayPrice(product), language)}</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${product.inStock && product.stock > 0
                          ? "bg-sage-green/20 text-sage-green"
                          : "bg-red-500/20 text-red-400"
                        }`}>
                        {product.inStock && product.stock > 0 
                          ? (isRtl ? `متوفر (${product.stock})` : `In Stock (${product.stock})`) 
                          : (isRtl ? "نفذت الكمية (0)" : "Out of Stock (0)")}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => window.open(`/products/${product.id}`, "_blank")}
                      className="p-3 bg-petroleum-blue/40 hover:bg-teal-accent/20 text-sage-green-light hover:text-teal-accent rounded-xl transition-all"
                      title={isRtl ? "عرض في المتجر" : "View in store"}
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleOpenEditModal(product)}
                      className="p-3 bg-petroleum-blue/40 hover:bg-olive-green/20 text-sage-green-light hover:text-olive-green-light rounded-xl transition-all"
                      title={isRtl ? "تعديل" : "Edit"}
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="p-3 bg-petroleum-blue/40 hover:bg-red-500/20 text-sage-green-light hover:text-red-400 rounded-xl transition-all"
                      title={isRtl ? "حذف" : "Delete"}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-petroleum-blue/10 rounded-2xl border border-teal-accent/10">
          <Package className="w-16 h-16 text-teal-accent/40 mx-auto mb-4" />
          <p className="text-xl text-white/70">{isRtl ? "لا توجد منتجات مطابقة للبحث." : "No products found matching search."}</p>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {isModalOpen && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div 
            className="relative w-full max-w-3xl bg-petroleum-dark/95 border border-teal-accent/30 rounded-3xl p-6 lg:p-8 max-h-[85vh] overflow-y-auto shadow-2xl"
            dir={isRtl ? "rtl" : "ltr"}
          >
            {/* Close Button */}
            <button
              onClick={handleCloseModal}
              className={`absolute top-6 ${isRtl ? "left-6" : "right-6"} p-2 hover:bg-white/10 text-white/70 hover:text-white rounded-xl transition-all`}
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="font-display text-3xl text-white mb-6 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-teal-accent animate-pulse" />
              <span>{modalType === "add" ? (isRtl ? "إضافة منتج جديد" : "Add New Product") : (isRtl ? "تعديل المنتج" : "Edit Product")}</span>
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* English & Arabic Product Name */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-white/90 mb-2 font-medium flex items-center gap-1">
                    <FileText className="w-4 h-4 text-teal-accent" />
                    <span>Product Name (English) *</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. Extra Virgin Olive Oil"
                    className="w-full px-4 py-3 bg-petroleum-blue/30 text-white placeholder:text-white/30 rounded-xl border border-teal-accent/20 focus:outline-none focus:ring-2 focus:ring-teal-accent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/90 mb-2 font-medium flex items-center gap-1">
                    <FileText className="w-4 h-4 text-teal-accent" />
                    <span>اسم المنتج (بالعربية) *</span>
                  </label>
                  <input
                    type="text"
                    name="nameAr"
                    value={formData.nameAr}
                    onChange={handleInputChange}
                    placeholder="مثال: زيت زيتون بكر ممتاز"
                    className="w-full px-4 py-3 bg-petroleum-blue/30 text-white placeholder:text-white/30 rounded-xl border border-teal-accent/20 focus:outline-none focus:ring-2 focus:ring-teal-accent text-right"
                    required
                  />
                </div>
              </div>

              {/* Category & Stock Selector */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-white/90 mb-2 font-medium">
                    {isRtl ? "الفئة *" : "Category *"}
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData(prev => ({
                        ...prev,
                        category: val,
                        categoryAr: val // sync categoryAr to match category ID for frontend filtering
                      }));
                    }}
                    className="w-full px-4 py-3 bg-petroleum-blue/30 text-white rounded-xl border border-teal-accent/20 focus:outline-none focus:ring-2 focus:ring-teal-accent"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id} className="bg-petroleum-dark text-white">
                        {isRtl ? c.nameAr : c.nameEn}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-white/90 mb-2 font-medium">
                    {isRtl ? "الكمية المتاحة في المخزن *" : "Available Stock Quantity *"}
                  </label>
                  <input
                    type="number"
                    name="stock"
                    min="0"
                    value={formData.stock}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-petroleum-blue/30 text-white rounded-xl border border-teal-accent/20 focus:outline-none focus:ring-2 focus:ring-teal-accent"
                    required
                  />
                </div>
              </div>

              {/* Dynamic Sizes & Prices List Editor */}
              <div className="bg-petroleum-blue/10 rounded-2xl p-6 border border-teal-accent/20 space-y-4">
                <h3 className="font-display text-lg text-teal-accent font-semibold flex items-center gap-2">
                  <Package className="w-5 h-5 animate-pulse" />
                  <span>{isRtl ? "إعداد أسعار الأحجام المختلفة للمنتج" : "Configure Size Options & Custom Prices"}</span>
                </h3>
                
                {/* Inputs to Add a New Size */}
                <div className="flex flex-col sm:flex-row items-end gap-3 bg-petroleum-dark/40 p-4 rounded-xl border border-teal-accent/10">
                  <div className="flex-1">
                    <label className="block text-xs text-white/70 mb-1">
                      {isRtl ? "الحجم (مثال: 500ml ، 1L)" : "Size (e.g. 250ml, 500ml, 1L)"}
                    </label>
                    <input
                      type="text"
                      value={newSizeName}
                      onChange={(e) => setNewSizeName(e.target.value)}
                      placeholder={isRtl ? "مثال: 500ml" : "e.g. 500ml"}
                      className="w-full px-3 py-2 bg-petroleum-blue/30 text-white placeholder:text-white/20 rounded-xl border border-teal-accent/20 focus:outline-none focus:ring-1 focus:ring-teal-accent text-sm"
                    />
                  </div>
                  <div className="w-full sm:w-36">
                    <label className="block text-xs text-white/70 mb-1">
                      {isRtl ? "السعر (ج.م)" : "Price (EGP)"}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={newSizePrice || ""}
                      onChange={(e) => setNewSizePrice(parseFloat(e.target.value))}
                      placeholder="19.99"
                      className="w-full px-3 py-2 bg-petroleum-blue/30 text-white placeholder:text-white/20 rounded-xl border border-teal-accent/20 focus:outline-none focus:ring-1 focus:ring-teal-accent text-sm"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (!newSizeName || !newSizePrice || newSizePrice <= 0) {
                        toast.error(isRtl ? "يرجى إدخال حجم وسعر صالحين." : "Please enter a valid size and price.");
                        return;
                      }
                      if (sizesList.some(s => s.size.trim().toLowerCase() === newSizeName.trim().toLowerCase())) {
                        toast.error(isRtl ? "هذا الحجم مضاف بالفعل لهذا المنتج!" : "This size option is already added!");
                        return;
                      }
                      setSizesList([...sizesList, { size: newSizeName.trim(), price: newSizePrice }]);
                      setNewSizeName("");
                      setNewSizePrice(0);
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 bg-teal-accent hover:bg-teal-dark text-white rounded-xl transition-all text-sm font-semibold flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{isRtl ? "إضافة حجم" : "Add Size"}</span>
                  </button>
                </div>

                {/* Display Sizes added */}
                {sizesList.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                    {sizesList.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-dark-olive/50 rounded-xl border border-teal-accent/20 text-sm">
                        <div className="text-white min-w-0 truncate">
                          <span className="font-semibold">{item.size}</span>:{" "}
                          <span className="text-teal-accent font-bold">{formatPrice(item.price, language)}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSizesList(sizesList.filter((_, i) => i !== idx))}
                          className="p-1 hover:bg-white/10 rounded-lg text-red-400 hover:text-red-300 transition-colors ml-2"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-sage-green-light italic text-center pt-2">
                    {isRtl ? "لا توجد أحجام وأسعار مضافة. يرجى إضافة حجم واحد على الأقل." : "No sizes configured. You must add at least one size."}
                  </p>
                )}
              </div>

              {/* Product Image Gallery Manager */}
              <div className="bg-petroleum-blue/10 rounded-2xl p-6 border border-teal-accent/20 space-y-4">
                <h3 className="font-display text-lg text-teal-accent font-semibold flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 animate-pulse" />
                  <span>{isRtl ? "معرض صور المنتج (صور متعددة)" : "Product Image Gallery (Multiple Images)"}</span>
                </h3>
                <p className="text-xs text-sage-green-light">
                  {isRtl 
                    ? "الصورة الأولى هي الصورة الرئيسية للمنتج. يمكنك تغيير الترتيب بتعيين صورة أخرى كصورة رئيسية." 
                    : "The first image is the primary display image. You can change this by setting another image as primary."}
                </p>

                {/* Add new image URL */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder={isRtl ? "أدخل رابط الصورة..." : "Enter image URL..."}
                    className="flex-1 px-4 py-3 bg-petroleum-blue/30 text-white placeholder:text-white/20 rounded-xl border border-teal-accent/20 focus:outline-none focus:ring-2 focus:ring-teal-accent text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!newImageUrl || !newImageUrl.trim().startsWith("http")) {
                        toast.error(isRtl ? "يرجى إدخال رابط صورة صالح يبدأ بـ http" : "Please enter a valid image URL starting with http");
                        return;
                      }
                      setImagesList([...imagesList, newImageUrl.trim()]);
                      setNewImageUrl("");
                    }}
                    className="px-6 py-3 bg-teal-accent hover:bg-teal-dark text-white rounded-xl transition-all text-sm font-semibold flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{isRtl ? "إضافة" : "Add"}</span>
                  </button>
                </div>

                {/* Gallery Grid */}
                {imagesList.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
                    {imagesList.map((url, idx) => (
                      <div key={idx} className="relative group bg-petroleum-dark/40 rounded-2xl overflow-hidden border border-teal-accent/20">
                        <img
                          src={url}
                          alt={`Gallery ${idx + 1}`}
                          className="w-full h-28 object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1759749597861-e90685f026b4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800";
                          }}
                        />
                        {/* Delete Button overlay */}
                        <button
                          type="button"
                          onClick={() => setImagesList(imagesList.filter((_, i) => i !== idx))}
                          className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-red-500/80 text-white hover:text-white rounded-lg transition-all"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        
                        {/* Primary Badge or Set Primary Action */}
                        <div className="absolute bottom-0 inset-x-0 bg-black/60 p-2 flex items-center justify-center">
                          {idx === 0 ? (
                            <span className="text-[10px] uppercase font-bold text-gold-accent flex items-center gap-1">
                              <Sparkles className="w-3 h-3 fill-gold-accent" />
                              {isRtl ? "الرئيسية" : "Primary"}
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                const newList = [...imagesList];
                                const [removed] = newList.splice(idx, 1);
                                newList.unshift(removed);
                                setImagesList(newList);
                              }}
                              className="text-[10px] text-white hover:text-teal-accent font-medium transition-colors"
                            >
                              {isRtl ? "تعيين كرئيسية" : "Set Primary"}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-sage-green-light italic text-center pt-2">
                    {isRtl ? "لا توجد صور مضافة للمنتج." : "No images added for this product."}
                  </p>
                )}
              </div>

              {/* English & Arabic Product Description */}
              <div>
                <label className="block text-sm text-white/90 mb-2 font-medium">
                  Description (English) *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Describe the product details and properties..."
                  className="w-full px-4 py-3 bg-petroleum-blue/30 text-white placeholder:text-white/30 rounded-xl border border-teal-accent/20 focus:outline-none focus:ring-2 focus:ring-teal-accent resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-white/90 mb-2 font-medium text-right">
                  الوصف (بالعربية) *
                </label>
                <textarea
                  name="descriptionAr"
                  value={formData.descriptionAr}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="اكتب تفاصيل المنتج وخصائصه باللغة العربية..."
                  className="w-full px-4 py-3 bg-petroleum-blue/30 text-white placeholder:text-white/30 rounded-xl border border-teal-accent/20 focus:outline-none focus:ring-2 focus:ring-teal-accent resize-none text-right"
                  required
                />
              </div>

              {/* Benefits List Editor */}
              <div className="bg-petroleum-blue/10 rounded-2xl p-6 border border-teal-accent/20 space-y-4">
                <h3 className="font-display text-lg text-teal-accent font-semibold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                  <span>{isRtl ? "مزايا المنتج (الضمان والشحن والإرجاع)" : "Product Benefits (Guarantees & Shipping)"}</span>
                </h3>
                <div className="flex flex-col sm:flex-row items-end gap-3 bg-petroleum-dark/40 p-4 rounded-xl border border-teal-accent/10">
                  <div className="flex-1">
                    <label className="block text-xs text-white/70 mb-1">Benefit Text (English)</label>
                    <input
                      type="text"
                      value={newBenefitText}
                      onChange={(e) => setNewBenefitText(e.target.value)}
                      placeholder="e.g. Free shipping on orders over EGP 500"
                      className="w-full px-3 py-2 bg-petroleum-blue/30 text-white placeholder:text-white/20 rounded-xl border border-teal-accent/20 focus:outline-none focus:ring-1 focus:ring-teal-accent text-sm"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs text-white/70 mb-1 font-sans text-right">نص الميزة (بالعربية)</label>
                    <input
                      type="text"
                      value={newBenefitTextAr}
                      onChange={(e) => setNewBenefitTextAr(e.target.value)}
                      placeholder="مثال: شحن مجاني للطلبات فوق 500 ج.م"
                      className="w-full px-3 py-2 bg-petroleum-blue/30 text-white placeholder:text-white/20 rounded-xl border border-teal-accent/20 focus:outline-none focus:ring-1 focus:ring-teal-accent text-sm text-right"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (!newBenefitText.trim() || !newBenefitTextAr.trim()) {
                        toast.error(isRtl ? "يرجى كتابة نص الميزة باللغتين الإنجليزية والعربية." : "Please enter the benefit text in both English and Arabic.");
                        return;
                      }
                      setBenefitsList([...benefitsList, { text: newBenefitText.trim(), textAr: newBenefitTextAr.trim() }]);
                      setNewBenefitText("");
                      setNewBenefitTextAr("");
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 bg-teal-accent hover:bg-teal-dark text-white rounded-xl transition-all text-sm font-semibold flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{isRtl ? "إضافة" : "Add"}</span>
                  </button>
                </div>
                {benefitsList.length > 0 ? (
                  <div className="grid gap-2 pt-2">
                    {benefitsList.map((b, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-dark-olive/50 rounded-xl border border-teal-accent/20 text-sm">
                        <div className="text-white min-w-0 flex-1 grid grid-cols-2 gap-4">
                          <div><span className="text-white/50">EN:</span> {b.text}</div>
                          <div className="text-right"><span className="text-white/50">AR:</span> {b.textAr}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setBenefitsList(benefitsList.filter((_, i) => i !== idx))}
                          className="p-1 hover:bg-white/10 rounded-lg text-red-400 hover:text-red-300 transition-colors ml-4"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-sage-green-light italic text-center pt-2">
                    {isRtl ? "لا توجد مزايا مضافة." : "No benefits configured."}
                  </p>
                )}
              </div>

              {/* Features List Editor */}
              <div className="bg-petroleum-blue/10 rounded-2xl p-6 border border-teal-accent/20 space-y-4">
                <h3 className="font-display text-lg text-teal-accent font-semibold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                  <span>{isRtl ? "خصائص المنتج (المواصفات والشهادات)" : "Product Features (Specs & Certifications)"}</span>
                </h3>
                <div className="flex flex-col sm:flex-row items-end gap-3 bg-petroleum-dark/40 p-4 rounded-xl border border-teal-accent/10">
                  <div className="flex-1">
                    <label className="block text-xs text-white/70 mb-1">Feature (English)</label>
                    <input
                      type="text"
                      value={newFeatureText}
                      onChange={(e) => setNewFeatureText(e.target.value)}
                      placeholder="e.g. 100% Cold-pressed extra virgin"
                      className="w-full px-3 py-2 bg-petroleum-blue/30 text-white placeholder:text-white/20 rounded-xl border border-teal-accent/20 focus:outline-none focus:ring-1 focus:ring-teal-accent text-sm"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs text-white/70 mb-1 text-right">الخاصية (بالعربية)</label>
                    <input
                      type="text"
                      value={newFeatureTextAr}
                      onChange={(e) => setNewFeatureTextAr(e.target.value)}
                      placeholder="مثال: عصرة أولى على البارد 100%"
                      className="w-full px-3 py-2 bg-petroleum-blue/30 text-white placeholder:text-white/20 rounded-xl border border-teal-accent/20 focus:outline-none focus:ring-1 focus:ring-teal-accent text-sm text-right"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (!newFeatureText.trim() || !newFeatureTextAr.trim()) {
                        toast.error(isRtl ? "يرجى كتابة نص الخاصية باللغتين الإنجليزية والعربية." : "Please enter the feature text in both English and Arabic.");
                        return;
                      }
                      setFeaturesList([...featuresList, { text: newFeatureText.trim(), textAr: newFeatureTextAr.trim() }]);
                      setNewFeatureText("");
                      setNewFeatureTextAr("");
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 bg-teal-accent hover:bg-teal-dark text-white rounded-xl transition-all text-sm font-semibold flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{isRtl ? "إضافة" : "Add"}</span>
                  </button>
                </div>
                {featuresList.length > 0 ? (
                  <div className="grid gap-2 pt-2">
                    {featuresList.map((f, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-dark-olive/50 rounded-xl border border-teal-accent/20 text-sm">
                        <div className="text-white min-w-0 flex-1 grid grid-cols-2 gap-4">
                          <div><span className="text-white/50">EN:</span> {f.text}</div>
                          <div className="text-right"><span className="text-white/50">AR:</span> {f.textAr}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setFeaturesList(featuresList.filter((_, i) => i !== idx))}
                          className="p-1 hover:bg-white/10 rounded-lg text-red-400 hover:text-red-300 transition-colors ml-4"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-sage-green-light italic text-center pt-2">
                    {isRtl ? "لا توجد خصائص مضافة." : "No features configured."}
                  </p>
                )}
              </div>

              {/* Nutritional Info Editor */}
              <div className="bg-petroleum-blue/10 rounded-2xl p-6 border border-teal-accent/20 space-y-4">
                <h3 className="font-display text-lg text-teal-accent font-semibold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                  <span>{isRtl ? "المعلومات الغذائية" : "Nutritional Facts"}</span>
                </h3>
                
                {/* Footnote configuration */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-white/70 mb-1">Footnote (English)</label>
                    <input
                      type="text"
                      value={nutritionalFootnote}
                      onChange={(e) => setNutritionalFootnote(e.target.value)}
                      placeholder="e.g. * Percent Daily Values are based on a 2,000 calorie diet"
                      className="w-full px-3 py-2.5 bg-petroleum-blue/30 text-white placeholder:text-white/20 rounded-xl border border-teal-accent/20 focus:outline-none focus:ring-1 focus:ring-teal-accent text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/70 mb-1 text-right">ملاحظة الحاشية (بالعربية)</label>
                    <input
                      type="text"
                      value={nutritionalFootnoteAr}
                      onChange={(e) => setNutritionalFootnoteAr(e.target.value)}
                      placeholder="مثال: * تعتمد النسب المئوية للقيم اليومية على نظام غذائي يحتوي على 2000 سعرة حرارية"
                      className="w-full px-3 py-2.5 bg-petroleum-blue/30 text-white placeholder:text-white/20 rounded-xl border border-teal-accent/20 focus:outline-none focus:ring-1 focus:ring-teal-accent text-sm text-right"
                    />
                  </div>
                </div>

                {/* Add row for nutritional info table */}
                <div className="bg-petroleum-dark/40 p-4 rounded-xl border border-teal-accent/10 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-white/70 mb-1">Label (English) - e.g. Calories</label>
                      <input
                        type="text"
                        value={newNutrLabel}
                        onChange={(e) => setNewNutrLabel(e.target.value)}
                        placeholder="e.g. Calories"
                        className="w-full px-3 py-2 bg-petroleum-blue/30 text-white placeholder:text-white/20 rounded-xl border border-teal-accent/20 focus:outline-none focus:ring-1 focus:ring-teal-accent text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-white/70 mb-1 text-right">العنوان (بالعربية) - مثل: السعرات الحرارية</label>
                      <input
                        type="text"
                        value={newNutrLabelAr}
                        onChange={(e) => setNewNutrLabelAr(e.target.value)}
                        placeholder="مثال: السعرات الحرارية"
                        className="w-full px-3 py-2 bg-petroleum-blue/30 text-white placeholder:text-white/20 rounded-xl border border-teal-accent/20 focus:outline-none focus:ring-1 focus:ring-teal-accent text-sm text-right"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-white/70 mb-1">Value (English) - e.g. 120 per tbsp</label>
                      <input
                        type="text"
                        value={newNutrVal}
                        onChange={(e) => setNewNutrVal(e.target.value)}
                        placeholder="e.g. 120 per tbsp"
                        className="w-full px-3 py-2 bg-petroleum-blue/30 text-white placeholder:text-white/20 rounded-xl border border-teal-accent/20 focus:outline-none focus:ring-1 focus:ring-teal-accent text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-white/70 mb-1 text-right">القيمة (بالعربية) - مثل: 120 لكل ملعقة كبيرة</label>
                      <input
                        type="text"
                        value={newNutrValAr}
                        onChange={(e) => setNewNutrValAr(e.target.value)}
                        placeholder="مثال: 120 لكل ملعقة كبيرة"
                        className="w-full px-3 py-2 bg-petroleum-blue/30 text-white placeholder:text-white/20 rounded-xl border border-teal-accent/20 focus:outline-none focus:ring-1 focus:ring-teal-accent text-sm text-right"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        if (!newNutrLabel.trim() || !newNutrLabelAr.trim() || !newNutrVal.trim() || !newNutrValAr.trim()) {
                          toast.error(isRtl ? "يرجى كتابة العنوان والقيمة باللغتين الإنجليزية والعربية." : "Please enter the label and value in both English and Arabic.");
                          return;
                        }
                        setNutritionalRows([...nutritionalRows, {
                          label: newNutrLabel.trim(),
                          labelAr: newNutrLabelAr.trim(),
                          value: newNutrVal.trim(),
                          valueAr: newNutrValAr.trim()
                        }]);
                        setNewNutrLabel("");
                        setNewNutrLabelAr("");
                        setNewNutrVal("");
                        setNewNutrValAr("");
                      }}
                      className="px-5 py-2.5 bg-teal-accent hover:bg-teal-dark text-white rounded-xl transition-all text-sm font-semibold flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{isRtl ? "إضافة سطر" : "Add Row"}</span>
                    </button>
                  </div>
                </div>

                {nutritionalRows.length > 0 ? (
                  <div className="grid gap-2 pt-2">
                    {nutritionalRows.map((n, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-dark-olive/50 rounded-xl border border-teal-accent/20 text-xs">
                        <div className="text-white min-w-0 flex-1 grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-teal-accent font-semibold">{n.label}:</span> {n.value}
                          </div>
                          <div className="text-right">
                            <span className="text-teal-accent font-semibold">{n.labelAr}:</span> {n.valueAr}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setNutritionalRows(nutritionalRows.filter((_, i) => i !== idx))}
                          className="p-1 hover:bg-white/10 rounded-lg text-red-400 hover:text-red-300 transition-colors ml-4"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-sage-green-light italic text-center pt-2">
                    {isRtl ? "لا توجد قيم مضافة للمعلومات الغذائية." : "No nutritional values configured."}
                  </p>
                )}
              </div>

              {/* Discount & Tags */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-white/90 mb-2 font-medium">
                    {isRtl ? "الخصم (%)" : "Discount (%)"}
                  </label>
                  <input
                    type="number"
                    name="discount"
                    min="0"
                    max="100"
                    value={formData.discount}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-petroleum-blue/30 text-white rounded-xl border border-teal-accent/20 focus:outline-none focus:ring-2 focus:ring-teal-accent"
                  />
                </div>
                
                {/* Checkboxes */}
                <div className="flex items-center justify-start gap-6 h-full pt-6">
                  <label className="flex items-center gap-2 text-white cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.inStock}
                      onChange={(e) => handleCheckboxChange("inStock", e.target.checked)}
                      className="w-5 h-5 rounded border-teal-accent/30 text-teal-accent focus:ring-teal-accent accent-teal-accent"
                    />
                    <span>{isRtl ? "متوفر في المخزن" : "In Stock"}</span>
                  </label>

                  <label className="flex items-center gap-2 text-white cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.isNew}
                      onChange={(e) => handleCheckboxChange("isNew", e.target.checked)}
                      className="w-5 h-5 rounded border-teal-accent/30 text-teal-accent focus:ring-teal-accent accent-teal-accent"
                    />
                    <span>{isRtl ? "منتج جديد (New Tag)" : "Show 'New' Badge"}</span>
                  </label>
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end gap-4 pt-4 border-t border-teal-accent/20">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-3 border border-teal-accent/30 text-white rounded-xl hover:bg-white/5 transition-all font-medium"
                >
                  {isRtl ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-teal-accent to-petroleum-light text-white rounded-xl hover:from-petroleum-light hover:to-teal-dark transition-all shadow-xl font-semibold disabled:opacity-55"
                >
                  {submitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                  <span>{isRtl ? "حفظ المنتج" : "Save Product"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
