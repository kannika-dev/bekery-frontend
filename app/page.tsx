"use client";
import React, { useState, useEffect } from "react";
import { Sparkles, Plus, Edit2, Trash2, Utensils, Heart, CheckCircle, XCircle } from "lucide-react";

interface BakeryItem {
  id: number;
  name: string;
  category: string;
  price: number;
  description: string;
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

  const API_URL = "https://bekery-backend.onrender.com/api/bakery";

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_URL);
      const data = await res.json();
      setItems(data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { name, category, price: Number(price), description, is_available: 1 };

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
    setDescription(item.description);
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
  };

  return (
    <div className="min-h-screen bg-rose-50/60 text-amber-950 font-sans pb-12">
      {/* Header สดใส น่ารัก */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-10 border-b border-rose-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="bg-rose-400 text-white p-2.5 rounded-2xl shadow-md group-hover:rotate-12 transition-transform duration-300">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-black bg-gradient-to-r from-rose-500 to-amber-600 bg-clip-text text-transparent">
                Sweet Bakery Studio ✨
              </h1>
              <p className="text-xs text-rose-400 font-medium">ร้านเบเกอรี่อบสดใหม่ทุกวัน 🥐💗</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4">
        {/* ฝั่งฟอร์มเพิ่ม/แก้ไขเมนู */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-3xl shadow-xl shadow-rose-100/50 border border-rose-100 sticky top-24">
            <h2 className="text-lg font-bold text-rose-600 mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5 fill-rose-400 text-rose-400" />
              {editingId ? "แก้ไขเมนูขนมหวาน" : "เพิ่มเมนูใหม่สุดน่ารัก"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-amber-800 mb-1">ชื่อเมนูขนม</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น สตรอว์เบอร์รีชีสเค้ก"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-300 transition-all text-sm bg-rose-50/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-amber-800 mb-1">หมวดหมู่</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-300 transition-all text-sm bg-rose-50/30"
                  >
                    <option value="Cake">Cake 🍰</option>
                    <option value="Bread">Bread 🍞</option>
                    <option value="Cookie">Cookie 🍪</option>
                    <option value="Drink">Drink 🧋</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-amber-800 mb-1">ราคา (บาท)</label>
                  <input
                    type="number"
                    required
                    placeholder="89"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-300 transition-all text-sm bg-rose-50/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-amber-800 mb-1">รายละเอียดขนม</label>
                <textarea
                  rows={3}
                  placeholder="อธิบายความอร่อยละมุน..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-300 transition-all text-sm bg-rose-50/30"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-rose-400 to-rose-500 hover:from-rose-500 hover:to-rose-600 text-white font-semibold py-2.5 px-4 rounded-xl shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all text-sm flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  {editingId ? "บันทึกการแก้ไข" : "เพิ่มเมนูเลย!"}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="bg-amber-100 hover:bg-amber-200 text-amber-800 font-semibold py-2.5 px-4 rounded-xl hover:scale-[1.02] active:scale-95 transition-all text-sm"
                  >
                    ยกเลิก
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* ฝั่งแสดงรายการเมนูขนม */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-bold text-amber-900 flex items-center gap-2">
              เมนูทั้งหมดของเรา 🧁
            </h2>
            <span className="text-xs bg-rose-100 text-rose-600 font-bold px-3 py-1 rounded-full">
              {items.length} รายการ
            </span>
          </div>

          {loading ? (
            <div className="text-center py-12 text-rose-400 font-medium animate-pulse">
              กำลังอบขนมร้อนๆ กรุณารอสักครู่... 🥐
            </div>
          ) : items.length === 0 ? (
            <div className="bg-white/60 rounded-3xl p-12 text-center border border-rose-100">
              <p className="text-amber-700">ยังไม่มีรายการขนมเลย ลองเพิ่มเมนูแรกดูสิคะ! ✨</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white p-5 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-rose-100/80 flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="bg-rose-50 text-rose-500 text-xs font-bold px-2.5 py-1 rounded-lg border border-rose-100">
                        {item.category}
                      </span>
                      <span className="text-lg font-black text-rose-500">
                        ฿{item.price}
                      </span>
                    </div>

                    <h3 className="font-bold text-lg text-amber-950 group-hover:text-rose-500 transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-amber-800/70 text-sm mt-1 line-clamp-2">
                      {item.description || "ขนมหวานแสนอร่อย อบใหม่ใส่ใจทุกขั้นตอน 💕"}
                    </p>
                  </div>

                  {/* ปุ่มจัดการ Edit / Delete */}
                  <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-rose-50">
                    <button
                      onClick={() => handleEdit(item)}
                      className="p-2 text-amber-600 hover:bg-amber-50 rounded-xl hover:scale-110 active:scale-90 transition-all"
                      title="แก้ไข"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl hover:scale-110 active:scale-90 transition-all"
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