"use client";
import React, { useState, useEffect } from "react";
import { Sparkles, Plus, Edit2, Trash2, Utensils, RefreshCw } from "lucide-react";

interface BakeryItem {
  id: number;
  name: string;
  category: string;
  price: number;
  description: string;
  image_url?: string; // 👈 เพิ่มฟิลด์รองรับรูปภาพ
  is_available: number;
}

export default function BakeryPage() {
  const [items, setItems] = useState<BakeryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Cake");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState(""); // 👈 State สำหรับกรอก URL รูปภาพ

  const API_URL = "https://bekery-backend.onrender.com/api/bakery";

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_URL);
      const data = await res.json();
      
      if (Array.isArray(data)) {
        setItems(data);
      } else {
        setItems([]);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { 
      name, 
      category, 
      price: Number(price), 
      description, 
      image_url: imageUrl, // 👈 ส่ง image_url ไปยัง Backend
      is_available: 1 
    };

    try {
      if (editingId) {
        await fetch(`${API_URL}/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      resetForm();
      fetchItems();
    } catch (err) {
      alert("❌ เกิดข้อผิดพลาดในการบันทึก");
    }
  };

  const handleEdit = (item: BakeryItem) => {
    setEditingId(item.id);
    setName(item.name);
    setCategory(item.category);
    setPrice(item.price.toString());
    setDescription(item.description || "");
    setImageUrl(item.image_url || ""); // 👈 ดึงรูปภาพเดิมมาใส่ช่องแก้ไข
  };

  const handleDelete = async (id: number) => {
    if (!confirm("คุณต้องการลบเมนูนี้ใช่ไหมคะ? 🥺")) return;
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      if (res.ok) fetchItems();
    } catch (err) {
      alert("❌ ลบเมนูไม่สำเร็จ");
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

  return (
    <div className="min-h-screen bg-amber-50/60 text-stone-800 font-sans pb-12">
      {/* Header */}
      <header className="max-w-6xl mx-auto p-6 flex justify-between items-center border-b border-amber-200/80 mb-6 bg-white/40 backdrop-blur-md rounded-b-2xl shadow-xs">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="bg-gradient-to-tr from-amber-600 to-orange-500 text-white p-2.5 rounded-2xl shadow-md group-hover:rotate-12 transition-transform duration-300">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-amber-950">
              ร้านเบเกอรี่ของฉัน 🥐
            </h1>
            <p className="text-xs text-amber-700 font-medium">จัดการรายการขนมสดใหม่</p>
          </div>
        </div>

        <button 
          onClick={fetchItems}
          className="flex items-center gap-1.5 text-xs bg-amber-100 hover:bg-amber-200 text-amber-900 font-semibold px-3 py-2 rounded-xl transition-all active:scale-95"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          รีเฟรชข้อมูล
        </button>
      </header>

      <main className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ฟอร์มจัดการเมนู */}
        <div className="lg:col-span-1">
          <div className="bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-amber-200/60 sticky top-6">
            <h2 className="text-base font-bold text-amber-950 mb-4 flex items-center gap-2">
              <Utensils className="w-4 h-4 text-amber-600" />
              {editingId ? "แก้ไขรายการขนม" : "เพิ่มรายการขนมใหม่"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">ชื่อเมนูขนม</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น เค้กส้ม, ครัวซองต์"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/60 transition-all text-sm bg-amber-50/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">หมวดหมู่</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/60 transition-all text-sm bg-amber-50/20"
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
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/60 transition-all text-sm bg-amber-50/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">URL รูปภาพ</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/60 transition-all text-sm bg-amber-50/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">รายละเอียด</label>
                <textarea
                  rows={3}
                  placeholder="คำอธิบายขนม..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/60 transition-all text-sm bg-amber-50/20"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2.5 px-4 rounded-xl shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-95 transition-all text-sm flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  {editingId ? "บันทึกการแก้ไข" : "เพิ่มเมนู"}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="bg-stone-200 hover:bg-stone-300 text-stone-700 font-semibold py-2.5 px-4 rounded-xl hover:scale-[1.02] active:scale-95 transition-all text-sm"
                  >
                    ยกเลิก
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* รายการเมนู */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-bold text-amber-950">
              รายการเมนูทั้งหมด
            </h2>
            <span className="text-xs bg-amber-200/60 text-amber-900 font-bold px-3 py-1 rounded-full">
              {Array.isArray(items) ? items.length : 0} รายการ
            </span>
          </div>

          {loading ? (
            <div className="text-center py-12 text-amber-800 font-medium animate-pulse bg-white/40 rounded-2xl border border-amber-200/50">
              กำลังเชื่อมต่อเซิร์ฟเวอร์ดึงข้อมูล... 🥐
            </div>
          ) : !Array.isArray(items) || items.length === 0 ? (
            <div className="bg-white/60 rounded-2xl p-12 text-center border border-amber-200/60">
              <p className="text-stone-500 font-medium">ยังไม่มีรายการขนมในระบบ หรือไม่สามารถดึงข้อมูลได้</p>
              <button 
                onClick={fetchItems} 
                className="mt-3 text-xs text-amber-700 hover:underline font-semibold"
              >
                กดคลิกเพื่อลองดึงข้อมูลใหม่อีกครั้ง
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white p-5 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 border border-amber-200/60 flex flex-col justify-between group overflow-hidden"
                >
                  <div>
                    {/* 📸 แสดงรูปภาพขนมถ้ามี URL */}
                    {item.image_url && (
                      <div className="w-full h-40 mb-3 overflow-hidden rounded-xl bg-amber-50">
                        <img 
                          src={item.image_url} 
                          alt={item.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}

                    <div className="flex justify-between items-start mb-2">
                      <span className="bg-amber-100/70 text-amber-800 text-xs font-semibold px-2.5 py-1 rounded-lg border border-amber-200">
                        {item.category}
                      </span>
                      <span className="text-base font-bold text-amber-700">
                        ฿{item.price}
                      </span>
                    </div>

                    <h3 className="font-bold text-stone-800 group-hover:text-amber-700 transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-stone-500 text-sm mt-1 line-clamp-2">
                      {item.description || "ขนมหวานแสนอร่อย อบใหม่ใส่ใจทุกขั้นตอน"}
                    </p>
                  </div>

                  <div className="flex justify-end gap-1.5 mt-4 pt-3 border-t border-amber-100">
                    <button
                      onClick={() => handleEdit(item)}
                      className="p-2 text-amber-700 hover:bg-amber-50 rounded-lg hover:scale-110 active:scale-90 transition-all"
                      title="แก้ไข"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg hover:scale-110 active:scale-90 transition-all"
                      title="ลบ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}