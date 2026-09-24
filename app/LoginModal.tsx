"use client";
import React, { useState } from "react";
import { X, Store, ShieldCheck, ShoppingCart, LogIn, UserPlus, Eye, EyeOff } from "lucide-react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: { username: string; role: string; email?: string; phone?: string; shopName?: string }) => void;
}

export default function LoginModal({ isOpen, onClose, onLoginSuccess }: LoginModalProps) {
  // Mode: "select_role" | "admin_login" | "user_auth" | "forgot_password"
  const [mode, setMode] = useState<"select_role" | "admin_login" | "user_auth" | "forgot_password">("select_role");  
  const [selectedRole, setSelectedRole] = useState<"buyer" | "seller">("buyer");
  const [authType, setAuthType] = useState<"login" | "register">("login");

  // Form States
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [shopName, setShopName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const resetForm = () => {
    setUsername("");
    setPassword("");
    setEmail("");
    setPhone("");
    setShopName("");
    setMode("select_role");
    setShowPassword(false);
    setIsLoading(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // 1. เข้าสู่ระบบ Admin (ยิงหา API Backend + TiDB)
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      alert("กรุณากรอกชื่อผู้ใช้และรหัสผ่านค่ะ");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("https://bekery-backend.onrender.com/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          password,
          role: "admin",
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert(`ยินดีต้อนรับคุณ ${data.user.username} ผู้ดูแลระบบค่ะ!`);
        localStorage.setItem("user", JSON.stringify(data.user));
        onLoginSuccess(data.user);
        handleClose();
      } else {
        alert(data.message || "ชื่อผู้ใช้ รหัสผ่าน หรือสิทธิ์ Admin ไม่ถูกต้องค่ะ!");
      }
    } catch (error) {
      alert("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ค่ะ");
    } finally {
      setIsLoading(false);
    }
  };

  // 2. ล็อกอิน / สมัครสมาชิก ผู้ซื้อ หรือ ผู้ขาย
  const handleUserAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    if (authType === "login") {
      // ---------------- [1] เข้าสู่ระบบ ----------------
      if (!username || !password) {
        alert("กรุณากรอกชื่อผู้ใช้และรหัสผ่านค่ะ");
        return;
      }

      setIsLoading(true);
      try {
        const res = await fetch("https://bekery-backend.onrender.com/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username,
            password,
            role: selectedRole,
          }),
        });

        const data = await res.json();

        if (res.ok) {
          alert("เข้าสู่ระบบสำเร็จ!");
          localStorage.setItem("user", JSON.stringify(data.user));
          onLoginSuccess(data.user);
          handleClose();
        } else {
          const wantsToRegister = confirm(
            "คุณยังไม่ได้สมัครสมาชิก หรือข้อมูลไม่ถูกต้องค่ะ\n\nต้องการไปที่หน้าสมัครสมาชิกตอนนี้เลยไหมคะ?"
          );
          if (wantsToRegister) {
            setAuthType("register");
          }
        }
      } catch (error) {
        alert("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ค่ะ");
      } finally {
        setIsLoading(false);
      }

    } else {
      // ---------------- [2] สมัครสมาชิก ----------------
      if (!username || !password || !email || !phone) {
        alert("กรุณากรอกข้อมูลให้ครบถ้วนค่ะ");
        return;
      }

      if (selectedRole === "seller" && !shopName) {
        alert("กรุณากรอกชื่อร้านค้าด้วยค่ะ");
        return;
      }

      setIsLoading(true);
      try {
        const res = await fetch("https://bekery-backend.onrender.com/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username,
            email,
            password,
            phone,
            shopName: selectedRole === "seller" ? shopName : undefined,
            role: selectedRole,
          }),
        });

        const data = await res.json();

        if (res.ok) {
          alert("สมัครสมาชิกสำเร็จเรียบร้อยแล้วค่ะ! กรุณาเข้าสู่ระบบ");
          setAuthType("login");
          setPassword("");
        } else {
          alert(data.message || "เกิดข้อผิดพลาดในการสมัครสมาชิกค่ะ");
        }
      } catch (error) {
        alert("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ค่ะ");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden relative">
        <button onClick={handleClose} className="absolute top-4 right-4 text-stone-400 hover:text-stone-600">
          <X className="w-5 h-5" />
        </button>

        <div className="p-6">
          {/* STEP 1: เลือกประเภทผู้ใช้งาน */}
          {mode === "select_role" && (
            <div>
              <h2 className="text-xl font-bold text-stone-800 text-center mb-2">เลือกประเภทผู้ใช้งาน</h2>
              <p className="text-xs text-stone-500 text-center mb-6">กรุณาเลือกรูปแบบบัญชีที่คุณต้องการเข้าใช้งาน</p>

              <div className="space-y-3">
                <button
                  onClick={() => { setSelectedRole("buyer"); setMode("user_auth"); }}
                  className="w-full flex items-center gap-4 p-4 border border-amber-200 rounded-xl hover:bg-amber-50/50 transition-all text-left"
                >
                  <div className="p-3 bg-amber-100 rounded-lg text-amber-700">
                    <ShoppingCart className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-bold text-stone-800 text-sm">ผู้ซื้อสินค้า (Buyer)</div>
                    <div className="text-xs text-stone-500">เลือกชมสินค้า ใส่ตะกร้า และสั่งซื้อ</div>
                  </div>
                </button>

                <button
                  onClick={() => { setSelectedRole("seller"); setMode("user_auth"); }}
                  className="w-full flex items-center gap-4 p-4 border border-amber-200 rounded-xl hover:bg-amber-50/50 transition-all text-left"
                >
                  <div className="p-3 bg-amber-100 rounded-lg text-amber-700">
                    <Store className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-bold text-stone-800 text-sm">ผู้ขายสินค้า (Seller)</div>
                    <div className="text-xs text-stone-500">สำหรับเปิดร้านขายขนม จัดการสินค้า ออกบิล</div>
                  </div>
                </button>

                <button
                  onClick={() => setMode("admin_login")}
                  className="w-full flex items-center gap-4 p-4 border border-stone-200 bg-stone-50 rounded-xl hover:bg-stone-100 transition-all text-left"
                >
                  <div className="p-3 bg-stone-200 rounded-lg text-stone-700">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-bold text-stone-800 text-sm">ผู้ดูแลระบบ (Admin)</div>
                    <div className="text-xs text-stone-500">เข้าสู่ระบบจัดการสิทธิ์สูงสุด</div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: เข้าสู่ระบบ Admin */}
          {mode === "admin_login" && (
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <h2 className="text-xl font-bold text-stone-800 text-center mb-1">เข้าสู่ระบบผู้ดูแลระบบ (Admin)</h2>
              <p className="text-xs text-stone-500 text-center mb-4">ระบุชื่อและรหัสผ่านเฉพาะของผู้ดูแลระบบ</p>

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">ชื่อผู้ใช้ (Username)</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="กรอกชื่อผู้ใช้..."
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">รหัสผ่าน (Password)</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm focus:outline-none focus:border-amber-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-stone-800 hover:bg-stone-900 text-white font-semibold py-2.5 rounded-xl text-sm shadow-md disabled:opacity-50"
              >
                {isLoading ? "กำลังตรวจสอบ..." : "เข้าสู่ระบบ Admin"}
              </button>

              <button
                type="button"
                onClick={() => setMode("select_role")}
                className="w-full text-xs text-stone-500 hover:underline text-center block mt-2"
              >
                ← ย้อนกลับไปเลือกประเภทผู้ใช้
              </button>
            </form>
          )}

          {/* STEP 3: เข้าสู่ระบบ / สมัครสมาชิก (Buyer & Seller) */}
          {mode === "user_auth" && (
            <form onSubmit={handleUserAuth} className="space-y-3">
              <div className="flex justify-center gap-2 mb-2 bg-stone-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setAuthType("login")}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    authType === "login" ? "bg-white text-stone-800 shadow-sm" : "text-stone-500"
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5 inline mr-1" />
                  เข้าสู่ระบบ
                </button>
                <button
                  type="button"
                  onClick={() => setAuthType("register")}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    authType === "register" ? "bg-white text-stone-800 shadow-sm" : "text-stone-500"
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5 inline mr-1" />
                  สมัครสมาชิก
                </button>
              </div>

              <h3 className="text-sm font-bold text-amber-800 text-center mb-3">
                {authType === "login" ? "เข้าสู่ระบบ" : "สมัครสมาชิก"} สำหรับ {selectedRole === "seller" ? "ผู้ขาย (Seller)" : "ผู้ซื้อ (Buyer)"}
              </h3>

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">ชื่อผู้ใช้งาน (Username) *</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              {authType === "register" && (
                <>
                  {selectedRole === "seller" && (
                    <div>
                      <label className="block text-xs font-semibold text-amber-800 mb-1">🏪 ชื่อร้านค้าของคุณ *</label>
                      <input
                        type="text"
                        required
                        value={shopName}
                        onChange={(e) => setShopName(e.target.value)}
                        placeholder="เช่น ขนมเบเกอรี่บ้านคุณป้า"
                        className="w-full px-3 py-2 border border-amber-300 rounded-xl text-sm bg-amber-50/30 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1">อีเมล *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="example@email.com"
                      className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1">เบอร์โทรศัพท์ติดต่อ *</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="08X-XXX-XXXX"
                      className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">รหัสผ่าน (Password) *</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm focus:outline-none focus:border-amber-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {authType === "login" && (
                <div className="text-right mt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setMode("forgot_password");
                      setIsVerified(false);
                      setResetEmail("");
                      setNewPassword("");
                    }}
                    className="text-xs text-amber-700 hover:underline"
                  >
                    ลืมรหัสผ่าน?
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2.5 rounded-xl text-sm transition-all shadow-md mt-2 disabled:opacity-50"
              >
                {isLoading ? "กำลังดำเนินการ..." : authType === "login" ? "เข้าสู่ระบบ" : "ยืนยันการสมัครสมาชิก"}
              </button>

              <button
                type="button"
                onClick={() => setMode("select_role")}
                className="w-full text-xs text-stone-500 hover:underline text-center block mt-2"
              >
                ← ย้อนกลับไปเลือกประเภทผู้ใช้
              </button>
            </form>
          )}

          {/* STEP 4: ลืมรหัสผ่าน */}
          {mode === "forgot_password" && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-amber-800 text-center mb-2">
                🔑 กู้คืนรหัสผ่าน
              </h3>

              {!isVerified ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1">
                      ระบุอีเมลที่ใช้ลงทะเบียน *
                    </label>
                    <input
                      type="email"
                      required
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="example@email.com"
                      className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (resetEmail.trim()) {
                        setIsVerified(true);
                      } else {
                        alert("กรุณากรอกอีเมลด้วยค่ะ");
                      }
                    }}
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2 rounded-xl text-sm transition-all"
                  >
                    ตรวจสอบข้อมูล
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1">
                      รหัสผ่านใหม่ (New Password) *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm focus:outline-none focus:border-amber-500 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (newPassword.trim()) {
                        alert("ตั้งรหัสผ่านใหม่เรียบร้อยแล้วค่ะ! กรุณาเข้าสู่ระบบอีกครั้ง");
                        setMode("user_auth");
                        setAuthType("login");
                      } else {
                        alert("กรุณากรอกรหัสผ่านใหม่ด้วยค่ะ");
                      }
                    }}
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2 rounded-xl text-sm transition-all"
                  >
                    บันทึกรหัสผ่านใหม่
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={() => setMode("select_role")}
                className="w-full text-xs text-stone-500 hover:underline text-center block mt-2"
              >
                ← ย้อนกลับไปเลือกประเภทผู้ใช้
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}