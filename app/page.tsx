'use client';
import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, ShoppingBag, Store, Image as ImageIcon, X } from 'lucide-react';

interface BakeryItem {
  id: number;
  name: string;
  category: string;
  price: number;
  description: string;
  image_url: string;
  is_available: number;
}

export default function BakeryApp() {
  const [items, setItems] = useState<BakeryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // State สำหรับจัดการการแก้ไข
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Cake');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fetchItems = async () => {
    try {
      const res = await fetch('https://bekery-backend.onrender.com');
      const data = await res.json();
      setItems(data);
    } catch (err) {
      console.error('Error fetching bakery items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // เมื่อกดปุ่มแก้ไข ให้ดึงข้อมูลการ์ดนั้นมาใส่ในฟอร์ม
  const handleEditClick = (item: BakeryItem) => {
    setEditingId(item.id);
    setName(item.name);
    setCategory(item.category);
    setPrice(item.price.toString());
    setDescription(item.description || '');
    setImageUrl(item.image_url || '');
  };

  // ยกเลิกการแก้ไข
  const handleCancelEdit = () => {
    setEditingId(null);
    setName('');
    setPrice('');
    setDescription('');
    setImageUrl('');
    setSelectedFile(null);
  };

  // ส่งข้อมูล (เพิ่มใหม่ หรือ อัปเดต)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      // กรณีแก้ไข (Update)
      try {
        const res = await fetch(`https://bekery-backend.onrender.com/api/bakery/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            category,
            price,
            description,
            is_available: 1
          }),
        });

        if (res.ok) {
          alert('✏️ แก้ไขข้อมูลสำเร็จ!');
          handleCancelEdit();
          fetchItems();
        }
      } catch (err) {
        alert('❌ แก้ไขข้อมูลไม่สำเร็จ');
      }
    } else {
      // กรณีเพิ่มใหม่ (Create)
      const formData = new FormData();
      formData.append('name', name);
      formData.append('category', category);
      formData.append('price', price);
      formData.append('description', description);
      formData.append('image_url', imageUrl);
      if (selectedFile) formData.append('image', selectedFile);

      try {
        const res = await fetch('https://bekery-backend.onrender.com/api/bakery', {
          method: 'POST',
          body: formData,
        });

        if (res.ok) {
          alert('✨ เพิ่มเมนูขนมเรียบร้อยแล้ว!');
          handleCancelEdit();
          fetchItems();
        }
      } catch (err) {
        alert('❌ เกิดข้อผิดพลาดในการบันทึกข้อมูล');
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('คุณต้องการลบเมนูขนมนี้ใช่หรือไม่?')) return;
    try {
      const res = await fetch(`https://bekery-backend.onrender.com/api/bakery/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) fetchItems();
    } catch (err) {
      alert('❌ ลบเมนูไม่สำเร็จ');
    }
  };

  return (
    <div className="min-h-screen bg-amber-50/40 text-stone-800 p-6 font-sans">
      <header className="max-w-6xl mx-auto flex justify-between items-center mb-10 pb-4 border-b border-amber-200">
        <div className="flex items-center gap-3">
          <div className="bg-amber-500 text-white p-2.5 rounded-2xl shadow-md">
            <Store size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-amber-900">Sweet & Warm Bakery</h1>
            <p className="text-sm text-stone-500">ระบบจัดการคลังเมนูขนมเบเกอรี่</p>
          </div>
        </div>
        <div className="bg-amber-100 px-4 py-2 rounded-xl text-amber-800 font-semibold text-sm flex items-center gap-2">
          <ShoppingBag size={18} />
          รวม {items.length} เมนู
        </div>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ฝั่งฟอร์ม */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-amber-100 h-fit">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-amber-900 flex items-center gap-2">
              {editingId ? <Edit size={20} className="text-amber-500" /> : <Plus size={20} className="text-amber-500" />}
              {editingId ? 'แก้ไขเมนูขนม' : 'เพิ่มเมนูขนมใหม่'}
            </h2>
            {editingId && (
              <button onClick={handleCancelEdit} className="text-xs text-rose-500 flex items-center gap-1 hover:underline">
                <X size={14} /> ยกเลิก
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">ชื่อขนม</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="เช่น Butter Croissant"
                className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">หมวดหมู่</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
                >
                  <option value="Cake">Cake</option>
                  <option value="Bread">Bread</option>
                  <option value="Pastry">Pastry</option>
                  <option value="Cookie">Cookie</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">ราคา (บาท)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="85.00"
                  className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">รายละเอียดขนม</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="รสชาติ ความนุ่ม หรือจุดเด่นของขนม..."
                className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
              />
            </div>

            {!editingId && (
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">ลิงก์รูปภาพ (URL)</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 mb-2"
                />
                <p className="text-[11px] text-stone-400 text-center mb-1">- หรืออัปโหลดไฟล์รูป -</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-stone-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-100 file:text-amber-700 hover:file:bg-amber-200 cursor-pointer"
                />
              </div>
            )}

            <button
              type="submit"
              className={`w-full py-2.5 text-white font-semibold rounded-xl shadow-md transition-all text-sm mt-2 ${
                editingId ? 'bg-amber-600 hover:bg-amber-700' : 'bg-amber-500 hover:bg-amber-600'
              }`}
            >
              {editingId ? 'อัปเดตรายการขนม' : 'บันทึกรายการขนม'}
            </button>
          </form>
        </div>

        {/* ฝั่งรายการขนม */}
        <div className="lg:col-span-2">
          <h2 className="text-lg font-bold text-amber-900 mb-4">รายการเมนูในระบบ</h2>

          {loading ? (
            <p className="text-stone-400 text-sm">กำลังโหลดข้อมูลเมนู...</p>
          ) : items.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl text-center text-stone-400 border border-amber-100">
              ยังไม่มีรายการขนมในระบบ
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-4 shadow-sm border border-amber-100 flex flex-col justify-between hover:shadow-md transition-shadow"
                >
                  <div>
                    <div className="h-40 bg-stone-100 rounded-xl overflow-hidden mb-3 relative flex items-center justify-center">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="text-stone-300" size={32} />
                      )}
                      <span className="absolute top-2 right-2 bg-stone-900/60 backdrop-blur-sm text-white text-[11px] px-2 py-0.5 rounded-md font-medium">
                        {item.category}
                      </span>
                    </div>

                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-stone-800 text-base">{item.name}</h3>
                      <span className="font-bold text-amber-600 text-sm">฿{Number(item.price).toFixed(2)}</span>
                    </div>

                    <p className="text-stone-500 text-xs line-clamp-2 mb-3">
                      {item.description || 'ไม่มีคำอธิบายเพิ่มเติม'}
                    </p>
                  </div>

                  {/* ปุ่มแก้ไข และ ปุ่มลบ */}
                  <div className="flex justify-end items-center gap-2 pt-2 border-t border-stone-100">
                    <button
                      onClick={() => handleEditClick(item)}
                      className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors flex items-center gap-1 text-xs"
                      title="แก้ไขรายการ"
                    >
                      <Edit size={16} /> แก้ไข
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                      title="ลบรายการ"
                    >
                      <Trash2 size={16} />
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