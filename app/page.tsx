"use client";
import React, { useState, useEffect } from "react";
import { Sparkles, Plus, Edit2, Trash2, Utensils, RefreshCw, User, LogOut, Store, X, ShieldAlert, Users, ShoppingBag, Megaphone, Layers } from "lucide-react";
import LoginModal from "./LoginModal";

interface BakeryItem {
  id: number;
  name: string;
  category: string;
  price: number;
  description?: string;
  image_url?: string;
  shopName?: string;
  userId?: number;
}

interface UserProfile {
  id?: number;
  username: string;
  role: string;
  shopName?: string;
}

export default function BakeryPage() {
  const [items, setItems] = useState<BakeryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [selectedShopFilter, setSelectedShopFilter] = useState<string | null>(null);
  
  // เพิ่ม State สำหรับจัดการตะกร้าและ Return URL
  const [cart, setCart] = useState<BakeryItem[]>([]);
  const [pendingCartItem, setPendingCartItem] = useState<BakeryItem | null>(null);
  
  // ระบบแท็บเมนูหลัก (Marketplace, Shop Management, Ads/Promotion, Admin Panel)
  const [currentTab, setCurrentTab] = useState<"marketplace" | "manage" | "promotion" | "admin_users">("marketplace");

  // สำหรับมุมมอง Admin ในการจัดการผู้ใช้
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);

  // Form states สำหรับเพิ่ม/แก้ไขสินค้า
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Cake");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const API_URL = "https://bekery-backend.onrender.com/api/bakery";
  const USERS_API_URL = "https://bekery-backend.onrender.com/api/users";

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Failed to parse user from localStorage", e);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setSelectedShopFilter(null);
    setCurrentTab("marketplace");
    alert("ออกจากระบบเรียบร้อยแล้วค่ะ 🌟");
  };

  const handleBuyNow = (item: BakeryItem) => {
    if (!user) {
      setPendingCartItem(item);
      setIsAuthOpen(true);
      alert("⚠️ กรุณาเข้าสู่ระบบก่อนทำการสั่งซื้อสินค้าค่ะ 🔒");
      return;
    }
    
    // เพิ่มสินค้าลงในตะกร้า (Cart)
    setCart((prevCart) => [...prevCart, item]);
    alert(`🛒 เพิ่มเมนู "${item.name}" ลงในตะกร้าเรียบร้อยแล้วค่ะ!`);
  };

  const handleInquiry = (item: BakeryItem) => {
    alert(`💬 สอบถามข้อมูลเพิ่มเติมเกี่ยวกับเมนู "${item.name}" จากร้าน ${item.shopName || 'Admin Official'}`);
  };

  const handleDeleteAccount = async () => {
    if (!user || !user.id) {
      alert("ไม่พบข้อมูลผู้ใช้งาน กรุณาเข้าสู่ระบบใหม่ค่ะ");
      return;
    }

    const confirmDelete = window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบบัญชีนี้? การกระทำนี้ไม่สามารถย้อนกลับได้ค่ะ ⚠️");
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${USERS_API_URL}/${user.id}`, {
        method: "DELETE",
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });

      if (response.ok) {
        alert("ลบบัญชีของคุณเรียบร้อยแล้วค่ะ");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        window.location.reload();
      } else {
        const data = await response.json();
        alert(data.message || "เกิดข้อผิดพลาดในการลบบัญชีค่ะ");
      }
    } catch (error) {
      console.error("Delete Account Error:", error);
      alert("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ค่ะ");
    }
  };

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_URL);
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch error:", err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllUsers = async () => {
    if (user?.role !== "admin") return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(USERS_API_URL, {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });
      const data = await res.json();
      if (Array.isArray(data)) setAllUsers(data);
    } catch (err) {
      console.error("Fetch users error:", err);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    if (user?.role === "admin" && currentTab === "admin_users") {
      fetchAllUsers();
    }
  }, [user, currentTab]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    
    if (!user) {
      alert("กรุณาเข้าสู่ระบบก่อนเพิ่มหรือแก้ไขรายการค่ะ 🔒");
      setIsAuthOpen(true);
      return;
    }

    const payload = { 
      name, 
      category, 
      price: Number(price), 
      description, 
      image_url: imageUrl, 
      is_available: 1,
      shopName: user.shopName || (user.role === 'admin' ? 'Admin Official' : user.username)
    };

    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      let res;
      if (editingId) {
        res = await fetch(`${API_URL}/${editingId}`, {
          method: "PUT",
          headers,
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(API_URL, {
          method: "POST",
          headers,
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        resetForm();
        fetchItems();
        setCurrentTab("marketplace");
        alert("✨ บันทึกข้อมูลสำเร็จเรียบร้อยค่ะ!");
      } else {
        const errData = await res.json();
        alert(`❌ บันทึกไม่สำเร็จ: ${errData.message || "กรุณาตรวจสอบสิทธิ์"}`);
      }
    } catch (err) {
      console.error("Submit error:", err);
      alert("❌ เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    }
  };

  const handleEdit = (item: BakeryItem) => {
    if (user?.role !== "admin" && item.shopName !== user?.shopName) {
      alert("⚠️ คุณไม่มีสิทธิ์แก้ไขเมนูของร้านอื่นค่ะ");
      return;
    }
    setEditingId(item.id);
    setName(item.name);
    setCategory(item.category);
    setPrice(item.price.toString());
    setDescription(item.description || "");
    setImageUrl(item.image_url || "");
    setCurrentTab("manage");
  };

  const handleDelete = async (item: BakeryItem) => {
    if (user?.role !== "admin" && item.shopName !== user?.shopName) {
      alert("⚠️ คุณไม่มีสิทธิ์ลบเมนูของร้านอื่นค่ะ");
      return;
    }

    if (!confirm(`คุณต้องการลบเมนู "${item.name}" นี้ใช่ไหมคะ? 🥺`)) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/${item.id}`, { 
        method: "DELETE",
        headers: { Authorization: token ? `Bearer ${token}` : "" }
      });
      if (res.ok) {
        fetchItems();
        alert("🗑️ ลบเมนูเรียบร้อยแล้วค่ะ");
      } else {
        alert("❌ ไม่สามารถลบเมนูได้ เนื่องจากข้อจำกัดสิทธิ์");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("❌ เกิดข้อผิดพลาดในการลบเมนู");
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setCategory("Cake");
    setPrice("");
    setDescription("");
    setImageUrl("");
  };

  const filteredItems = selectedShopFilter 
    ? items.filter((item) => item.shopName === selectedShopFilter)
    : items;

  return (
    <div className="min-h-screen bg-amber-50/60 text-stone-800 font-sans pb-16">
      {/* Header & Navigation Bar */}
      <header className="max-w-6xl mx-auto p-4 md:p-6 border-b border-amber-200/80 mb-6 bg-white/70 backdrop-blur-md rounded-b-3xl shadow-xs">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setSelectedShopFilter(null); setCurrentTab("marketplace"); }}>
            <div className="bg-gradient-to-tr from-amber-600 to-orange-500 text-white p-3 rounded-2xl shadow-md">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-amber-950 tracking-tight">
                Bakery Hub & Cafe 🥐
              </h1>
              <p className="text-xs text-amber-700 font-medium">ศูนย์รวมเบเกอรี่โฮมเมด สดใหม่ทุกวัน</p>
            </div>
          </div>

          {/* User Profile & Auth Actions */}
          <div className="flex items-center gap-3 flex-wrap justify-end">
            <button 
              onClick={fetchItems}
              className="flex items-center gap-1.5 text-xs bg-amber-100 hover:bg-amber-200 text-amber-900 font-semibold px-3 py-2 rounded-xl transition-all shadow-2xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              รีเฟรช
            </button>

            {user ? (
              <div className="flex items-center gap-2.5 bg-amber-100/90 px-3.5 py-2 rounded-2xl text-xs font-semibold text-amber-950 border border-amber-200 shadow-2xs">
                <span className="flex items-center gap-1.5">
                  <User className="w-4 h-4 text-amber-700" />
                  <span className="font-bold">{user.username}</span> 
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    user.role === 'admin' ? 'bg-red-200 text-red-800' : 'bg-amber-300 text-amber-900'
                  }`}>
                    {user.role === 'admin' ? '🛡️ Admin' : `🏪 ${user.shopName || 'Partner'}`}
                  </span>
                </span>
                
                <button onClick={handleLogout} className="text-stone-500 hover:text-red-600 p-1" title="ออกจากระบบ">
                  <LogOut className="w-4 h-4" />
                </button>

                {user.role !== 'admin' && (
                  <button onClick={handleDeleteAccount} className="text-stone-500 hover:text-red-600 p-1" title="ลบบัญชีผู้ใช้งาน">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="flex items-center gap-1.5 text-xs bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-2.5 rounded-xl transition-all shadow-md active:scale-95"
              >
                <User className="w-4 h-4" />
                เข้าสู่ระบบ / เปิดร้านค้า
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation Menu */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 border-t border-amber-200/50 pt-3">
          <button
            onClick={() => setCurrentTab("marketplace")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-extrabold transition-all shrink-0 ${
              currentTab === "marketplace" 
                ? "bg-amber-600 text-white shadow-md scale-105" 
                : "bg-white/80 text-amber-900 hover:bg-amber-200/50"
            }`}
          >
            <ShoppingBag className="w-4 h-4" /> เลือกซื้อสินค้า (Marketplace)
          </button>

          <button
            onClick={() => setCurrentTab("manage")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-extrabold transition-all shrink-0 ${
              currentTab === "manage" 
                ? "bg-amber-600 text-white shadow-md scale-105" 
                : "bg-white/80 text-amber-900 hover:bg-amber-200/50"
            }`}
          >
            <Utensils className="w-4 h-4" /> จัดการสินค้า / เพิ่มเมนูร้าน
          </button>

          <button
            onClick={() => setCurrentTab("promotion")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-extrabold transition-all shrink-0 ${
              currentTab === "promotion" 
                ? "bg-amber-600 text-white shadow-md scale-105" 
                : "bg-white/80 text-amber-900 hover:bg-amber-200/50"
            }`}
          >
            <Megaphone className="w-4 h-4" /> โฆษณา & โปรโมชันเด่น 🔥
          </button>

          {user?.role === "admin" && (
            <button
              onClick={() => setCurrentTab("admin_users")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-extrabold transition-all shrink-0 ${
                currentTab === "admin_users" 
                  ? "bg-red-600 text-white shadow-md scale-105" 
                  : "bg-red-50 text-red-800 hover:bg-red-100"
              }`}
            >
              <ShieldAlert className="w-4 h-4" /> จัดการผู้ใช้งานระบบ (Admin)
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 md:px-6">

        {/* 1. หน้าเลือกซื้อสินค้า (Marketplace View) */}
        {currentTab === "marketplace" && (
          <div className="flex flex-col lg:flex-row gap-6 items-start">
    
    {/* 🛒 ฝั่งซ้าย: การ์ดตะกร้าสินค้าส่วนตัว */}
    <div className="w-full lg:w-80 bg-white rounded-3xl p-5 shadow-lg border border-amber-100 sticky top-6 shrink-0">
      <h3 className="text-base font-extrabold text-stone-800 mb-3 flex items-center justify-between border-b pb-3">
        <span>🛒 ตะกร้าสินค้า</span>
        <span className="bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded-full font-bold">
          {cart.length} รายการ
        </span>
      </h3>

      {cart.length === 0 ? (
        <div className="text-center py-6 text-stone-400">
          <p className="text-2xl mb-1">🛍️</p>
          <p className="text-xs">ยังไม่มีสินค้าในตะกร้า</p>
        </div>
      ) : (
        <div>
          <div className="space-y-2 mb-4 max-h-60 overflow-y-auto pr-1">
            {cart.map((item, index) => (
              <div key={index} className="flex justify-between items-center bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                <div>
                  <h4 className="font-bold text-stone-800 text-xs">{item.name}</h4>
                  <p className="text-[11px] text-amber-700 font-semibold">฿{item.price}</p>
                </div>
                <button 
                  onClick={() => {
                    const newCart = cart.filter((_, i) => i !== index);
                    setCart(newCart);
                  }}
                  className="text-red-500 hover:text-red-700 text-xs font-semibold px-1.5 py-0.5"
                >
                  ลบ
                </button>
              </div>
            ))}
          </div>

          <div className="border-t pt-3 mb-4">
            <div className="flex justify-between text-sm font-extrabold text-stone-800">
              <span>ยอดรวมทั้งสิ้น:</span>
              <span className="text-amber-700">
                ฿{cart.reduce((sum, item) => sum + Number(item.price), 0)}
              </span>
            </div>
          </div>

          <button 
            onClick={() => {
              alert("🎉 ยืนยันคำสั่งซื้อสำเร็จ! เตรียมแนบสลิปการโอนเงินกันต่อเลยค่ะ 💸");
              setCart([]);
            }}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white py-2 rounded-xl font-bold shadow-md transition text-xs"
          >
            ยืนยันคำสั่งซื้อ
          </button>
        </div>
      )}
    </div>

    {/* 🍰 ฝั่งขวา: เริ่มเนื้อหา Marketplace เดิม */}
    <div className="flex-1 w-full space-y-6">            <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-3xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="space-y-2 relative z-10 text-center md:text-left">
                <span className="bg-white/25 text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Special Promotion 🎉
                </span>
                <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">เบเกอรี่โฮมเมดอบสดใหม่ทุกวัน ส่งตรงถึงมือคุณ!</h2>
                <p className="text-amber-100 text-xs md:text-sm max-w-xl">เลือกซื้อขนมอร่อยจากหลากหลายร้านค้าพาร์ทเนอร์ หรือเปิดร้านของคุณเองได้ง่ายๆ แค่ปลายนิ้ว</p>
              </div>
              <button 
                onClick={() => {
                  if(!user) setIsAuthOpen(true);
                  else setCurrentTab("manage");
                }} 
                className="bg-white text-amber-900 hover:bg-amber-50 font-extrabold px-6 py-3 rounded-2xl text-xs shadow-md transition-all active:scale-95 shrink-0 relative z-10"
              >
                {user ? "✨ ไปที่หน้าจัดการร้านของคุณ" : "🚀 สมัครเปิดร้านฟรีวันนี้"}
              </button>
            </div>

            <div className="flex justify-between items-center flex-wrap gap-2">
              <h2 className="text-lg font-extrabold text-amber-950 flex items-center gap-2">
                รายการเบเกอรี่ทั้งหมด
                {selectedShopFilter && (
                  <span className="inline-flex items-center gap-1 bg-amber-200/90 text-amber-950 text-xs px-3 py-1 rounded-full font-bold shadow-2xs">
                    <Store className="w-3.5 h-3.5 text-amber-700" /> ร้าน: {selectedShopFilter}
                    <button 
                      onClick={() => setSelectedShopFilter(null)}
                      className="hover:text-red-600 transition-colors ml-1 p-0.5"
                      title="แสดงร้านค้าทั้งหมด"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                )}
              </h2>
              <span className="text-xs bg-amber-200/80 text-amber-950 font-extrabold px-3.5 py-1.5 rounded-full shadow-2xs">
                {filteredItems.length} รายการ
              </span>
            </div>

            {loading ? (
              <div className="text-center py-20 text-amber-800 font-bold animate-pulse bg-white/50 rounded-3xl border border-amber-200/60 shadow-xs">
                กำลังโหลดเมนูความอร่อย... 🥐✨
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="bg-white/75 backdrop-blur-md rounded-3xl p-16 text-center border border-amber-200/60 shadow-xs space-y-3">
                <p className="text-stone-500 font-medium">
                  {selectedShopFilter ? `ยังไม่มีเมนูสำหรับร้าน "${selectedShopFilter}"` : "ยังไม่มีรายการขนมในระบบ"}
                </p>
                {selectedShopFilter && (
                  <button onClick={() => setSelectedShopFilter(null)} className="text-xs text-amber-700 hover:underline font-bold bg-amber-100 px-4 py-2 rounded-xl inline-block">
                    ดูสินค้าจากทุกร้านค้า
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white/90 backdrop-blur-md p-5 rounded-3xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border border-amber-200/60 flex flex-col justify-between group overflow-hidden"
                  >
                    <div>
                      {item.image_url ? (
                        <div className="w-full h-48 mb-3.5 overflow-hidden rounded-2xl bg-amber-50 shadow-2xs">
                          <img 
                            src={item.image_url} 
                            alt={item.name} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-36 mb-3.5 rounded-2xl bg-gradient-to-tr from-amber-100 to-orange-50 flex items-center justify-center text-amber-700/40 text-xs font-bold">
                          ไม่มีรูปภาพประกอบ
                        </div>
                      )}

                      <div className="flex justify-between items-start mb-2 gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="bg-amber-100/80 text-amber-900 text-xs font-bold px-2.5 py-1 rounded-xl border border-amber-200">
                            {item.category}
                          </span>

                          {item.shopName && (
                            <button
                              onClick={() => setSelectedShopFilter(item.shopName || null)}
                              className={`flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-xl border font-semibold transition-all ${
                                selectedShopFilter === item.shopName
                                  ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                                  : "bg-amber-50 text-amber-800 hover:bg-amber-100 border-amber-200"
                              }`}
                              title={`กรองดูสินค้าจากร้าน ${item.shopName}`}
                            >
                              <Store className="w-3 h-3" />
                              {item.shopName}
                            </button>
                          )}
                        </div>

                        <span className="text-base font-extrabold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-xl">
                          ฿{item.price}
                        </span>
                      </div>

                      <h3 className="font-extrabold text-stone-900 text-base group-hover:text-amber-700 transition-colors">
                        {item.name}
                      </h3>
                      <p className="text-stone-500 text-xs mt-1.5 line-clamp-2 leading-relaxed">
                        {item.description || "ขนมหวานแสนอร่อย อบสดใหม่ใส่ใจทุกขั้นตอน 🥐"}
                      </p>
                    </div>

                    {/* ปุ่มการทำงาน 2 ปุ่มบนการ์ดสินค้า */}
                    <div className="flex items-center gap-2 mt-4 pt-3 border-t border-amber-100">
                      <button
                        onClick={() => handleBuyNow(item)}
                        className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-3 rounded-xl transition-all text-xs flex items-center justify-center gap-1 shadow-2xs"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        สั่งซื้อ / ใส่ตะกร้า
                      </button>
                      <button
                        onClick={() => handleInquiry(item)}
                        className="bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold py-2 px-3 rounded-xl transition-all text-xs flex items-center justify-center gap-1"
                        title="สอบถามร้านค้า / ดูรายละเอียด"
                      >
                        💬 สอบถาม
                      </button>
                    </div>

                    {/* ปุ่มจัดการสำหรับ Admin หรือ เจ้าของร้าน */}
                    {(user?.role === "admin" || (user && item.shopName === user.shopName)) && (
                      <div className="flex justify-end gap-1.5 mt-2 pt-2 border-t border-amber-50">
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-1.5 text-amber-700 hover:bg-amber-100 rounded-lg transition-all text-xs"
                          title="แก้ไขเมนู"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all text-xs"
                          title="ลบเมนู"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div/>
        )}

        {/* 2. หน้าจัดการสินค้าสำหรับเจ้าของร้าน (Shop Management View) */}
        {currentTab === "manage" && (
          <div className="max-w-xl mx-auto">
            <div className="bg-white/90 backdrop-blur-md p-6 md:p-8 rounded-3xl shadow-sm border border-amber-200/60">
              <h2 className="text-lg font-extrabold text-amber-950 mb-4 flex items-center gap-2">
                <Utensils className="w-5 h-5 text-amber-600" />
                {editingId ? "แก้ไขรายการขนมของคุณ 📝" : "เพิ่มเมนูขนมใหม่เข้าสู่ระบบ 🧁"}
              </h2>

              {!user ? (
                <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-6 text-center space-y-4">
                  <p className="text-xs text-amber-900 font-medium">กรุณาเข้าสู่ระบบก่อนจัดการเมนูขนมของร้านคุณค่ะ</p>
                  <button
                    onClick={() => setIsAuthOpen(true)}
                    className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 px-6 rounded-xl text-xs transition-all shadow-md"
                  >
                    เข้าสู่ระบบ / สมัครสมาชิก
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1">ชื่อเมนูขนม</label>
                    <input
                      type="text"
                      required
                      placeholder="เช่น เค้กส้มหนิ่ม, ครัวซองต์เนยสด"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/60 text-sm bg-amber-50/20"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-600 mb-1">หมวดหมู่</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-3 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/60 text-sm bg-amber-50/20"
                      >
                        <option value="Cake">Cake 🍰</option>
                        <option value="Bread">Bread 🍞</option>
                        <option value="Cookie">Cookie 🍪</option>
                        <option value="Drink">Drink 🧋</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-600 mb-1">ราคา (บาท)</label>
                      <input
                        type="number"
                        required
                        placeholder="65"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/60 text-sm bg-amber-50/20"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1">
                      รูปภาพสินค้า <span className="text-stone-400 font-normal">(อัปโหลดไฟล์ หรือ วางลิงก์)</span>
                    </label>
                    <div className="space-y-2">
                      <input
                        type="file"
                        accept="image/jpeg, image/png, image/webp"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => setImageUrl(reader.result as string);
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="w-full text-xs text-stone-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-100 file:text-amber-800 hover:file:bg-amber-200 border border-stone-200 rounded-xl p-1"
                      />
                      <input
                        type="text"
                        placeholder="หรือวางลิงก์รูปภาพ https://..."
                        value={imageUrl.startsWith("data:") ? "" : imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/60 text-xs bg-amber-50/30"
                      />
                    </div>
                    {imageUrl && (
                      <div className="mt-2.5 relative w-24 h-24 rounded-2xl overflow-hidden border border-amber-200 shadow-xs">
                        <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setImageUrl("")}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center shadow-xs"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1">รายละเอียด</label>
                    <textarea
                      rows={3}
                      placeholder="คำอธิบายสั้นๆ เกี่ยวกับขนม..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/60 text-sm bg-amber-50/20"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all text-sm flex items-center justify-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      {editingId ? "บันทึกการแก้ไข" : "เพิ่มเมนูใหม่"}
                    </button>
                    {editingId && (
                      <button
                        type="button"
                        onClick={resetForm}
                        className="bg-stone-200 hover:bg-stone-300 text-stone-700 font-bold py-3 px-4 rounded-xl transition-all text-sm"
                      >
                        ยกเลิก
                      </button>
                    )}
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* 3. หน้าโฆษณา & โปรโมชันเด่น (Ads & Promotion View) */}
        {currentTab === "promotion" && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="bg-white/90 backdrop-blur-md p-8 rounded-3xl shadow-sm border border-amber-200/60 space-y-6">
              <div className="border-b border-amber-100 pb-4">
                <h2 className="text-xl font-extrabold text-amber-950 flex items-center gap-2">
                  <Megaphone className="w-6 h-6 text-amber-600" /> พื้นที่ประชาสัมพันธ์และโปรโมชันร้านค้า
                </h2>
                <p className="text-stone-500 text-xs mt-1">อัปเดตอีเวนต์ แคมเปญส่วนลด และเบเกอรี่ตัวท็อปประจำสัปดาห์</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 p-6 rounded-3xl space-y-3">
                  <span className="bg-amber-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">HOT DEAL</span>
                  <h3 className="text-lg font-bold text-amber-950">🍰 เซตบอกรักต้อนรับเทศกาล</h3>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    รวมเค้กช็อกโกแลตหนานุ่มและครัวซองต์เนยสดแท้จากฝรั่งเศส ซื้อคู่กันรับส่วนลดทันที 15% ทุกร้านค้าใน Hub!
                  </p>
                  <button onClick={() => setCurrentTab("marketplace")} className="text-xs text-amber-700 font-extrabold hover:underline inline-flex items-center gap-1">
                    ไปเลือกซื้อเลย ➔
                  </button>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-amber-200 p-6 rounded-3xl space-y-3">
                  <span className="bg-orange-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">PARTNER WANTED</span>
                  <h3 className="text-lg font-bold text-amber-950">🏪 เปิดร้านเบเกอรี่ฟรีไม่มีค่าใช้จ่าย</h3>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    สำหรับเจ้าของร้านคาเฟ่หรือเบเกอรี่โฮมเมดที่ต้องการเพิ่มช่องทางขายออนไลน์ สมัครสมาชิกแล้วลงเมนูได้ทันที!
                  </p>
                  <button onClick={() => { if(!user) setIsAuthOpen(true); else setCurrentTab("manage"); }} className="text-xs text-orange-700 font-extrabold hover:underline inline-flex items-center gap-1">
                    {user ? "จัดการร้านของคุณ ➔" : "สมัครเปิดร้าน ➔"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. หน้า Admin Panel (จัดการผู้ใช้งาน) */}
        {user?.role === "admin" && currentTab === "admin_users" && (
          <div className="bg-white/90 backdrop-blur-md p-6 md:p-8 rounded-3xl shadow-sm border border-amber-200/60">
            <h2 className="text-xl font-extrabold text-amber-950 mb-4 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-600" />
              รายชื่อผู้ใช้งานทั้งหมดในระบบ (Admin Control Panel)
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-amber-200 text-xs text-stone-500 bg-amber-50/50">
                    <th className="p-3">ID</th>
                    <th className="p-3">ชื่อผู้ใช้ (Username)</th>
                    <th className="p-3">สิทธิ์ (Role)</th>
                    <th className="p-3">ชื่อร้านค้า</th>
                    <th className="p-3 text-center">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {allUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-stone-400">กำลังโหลดข้อมูลผู้ใช้...</td>
                    </tr>
                  ) : (
                    allUsers.map((u) => (
                      <tr key={u.id} className="border-b border-amber-100 hover:bg-amber-50/40">
                        <td className="p-3 text-stone-500">#{u.id}</td>
                        <td className="p-3 font-semibold text-stone-800">{u.username}</td>
                        <td className="p-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            u.role === 'admin' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="p-3 text-stone-600">{u.shopName || "-"}</td>
                        <td className="p-3 text-center">
                          {u.id !== user.id && (
                            <button 
                              onClick={async () => {
                                if(confirm(`ต้องการลบบัญชีผู้ใช้ ${u.username} ใช่หรือไม่?`)) {
                                  try {
                                    const token = localStorage.getItem("token");
                                    await fetch(`${USERS_API_URL}/${u.id}`, {
                                      method: "DELETE",
                                      headers: { Authorization: token ? `Bearer ${token}` : "" }
                                    });
                                    fetchAllUsers();
                                  } catch(err) { alert("ลบไม่สำเร็จ"); }
                                }
                              }}
                              className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 transition-all"
                              title="ลบผู้ใช้นี้"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Login / Auth Modal */}
      <LoginModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        onLoginSuccess={(userData) => {
          setUser(userData);
          fetchItems();
          setCurrentTab("marketplace");

          if (pendingCartItem) {
            const itemToBuy = pendingCartItem;
            setPendingCartItem(null);
            setTimeout(() => {
              alert(`🛍️ เข้าสู่ระบบสำเร็จ! พาคุณไปยังรายการสั่งซื้อ: "${itemToBuy.name}"`);
            }, 300);
          }
        }} 
      />
    </div>
  );
}