import React, { useState, useEffect } from "react";

const sampleProducts = [
  { id: "p1", title: "Cá mú", price: 285000, desc: "1kg" , image:"C:\Users\Suz\OneDrive\Desktop\cá mú.jpg" },
  { id: "p2", title: "Cá cờ mỡ", price: 165000, desc: " 400gr" },
  { id: "p3", title: "Cá bóp", price: 270000, desc: "500gr" },
  { id: "p4", title: "Cá hố", price: 210000, desc: "500gr" },
  { id: "p5", title: "Cá ồ", price: 80000, desc: "300gr" },
  { id: "p6", title: "Cá trác", price: 115000, desc: "300gr" },
  { id: "p7", title: "Cá dìa bông", price: 255000, desc: "400gr" },
  { id: "p8", title: "Cá mó", price: 145000, desc: "300gr" },
];

function currency(v) {
  return v.toLocaleString("vi-VN") + " ₫";
}

export default function EcommerceApp() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user")) || null);
  const [page, setPage] = useState("shop"); 
  const [products] = useState(sampleProducts);
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem("cart")) || {});
  const [toast, setToast] = useState(null);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  function addToCart(productId, qty = 1) {
    setCart(prev => {
      const next = { ...prev };
      next[productId] = (next[productId] || 0) + qty;
      setToast("Đã thêm vào giỏ hàng");
      return next;
    });
  }

  function removeFromCart(productId) {
    setCart(prev => {
      const next = { ...prev };
      delete next[productId];
      return next;
    });
  }

  function setQty(productId, qty) {
    setCart(prev => {
      const next = { ...prev };
      if (qty <= 0) delete next[productId];
      else next[productId] = qty;
      return next;
    });
  }

  function cartItems() {
    return Object.entries(cart).map(([id, qty]) => {
      const p = products.find(x => x.id === id);
      return { ...p, qty };
    });
  }

  function cartTotal() {
    return cartItems().reduce((s, it) => s + it.price * it.qty, 0);
  }

  async function handleCheckout() {
    if (!user) {
      setToast("Bạn cần đăng nhập để thanh toán");
      setPage("account");
      return;
    }
    setToast("Khởi tạo thanh toán...");
    setTimeout(() => {
      setCart({});
      setToast("Thanh toán thành công — Cảm ơn bạn!");
      setPage("shop");
    }, 1000);
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6">
      <header className="max-w-6xl mx-auto flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Xóm Cá Nẫu</h1>
        <nav className="flex items-center gap-3">
          <button onClick={() => setPage("shop")}>Cửa hàng</button>
          <button onClick={() => setPage("cart")}>Giỏ hàng ({Object.keys(cart).length})</button>
          <button onClick={() => setPage("account")}>{user ? `Xin chào, ${user.name}` : "Đăng nhập / Đăng ký"}</button>
        </nav>
      </header>

      <main className="max-w-6xl mx-auto">
        {page === "shop" && (
          <section>
            <h2>Sản phẩm</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {products.map(p => (
                <article key={p.id} className="bg-white p-4 rounded shadow-sm">
                  <div className="h-40 bg-slate-100 rounded mb-3 flex items-center justify-center">Ảnh {p.title}</div>
                  <h3>{p.title}</h3>
                  <p>{p.desc}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <strong>{currency(p.price)}</strong>
                    <button onClick={() => addToCart(p.id, 1)} className="px-3 py-1 rounded bg-slate-900 text-white">Thêm</button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {page === "cart" && (
          <section>
            <h2>Giỏ hàng</h2>
            {Object.keys(cart).length === 0 ? (
              <div>Giỏ hàng trống.</div>
            ) : (
              <div>
                <ul>
                  {cartItems().map(it => (
                    <li key={it.id}>{it.title} x {it.qty} — {currency(it.price * it.qty)}</li>
                  ))}
                </ul>
                <div>Tổng: <strong>{currency(cartTotal())}</strong></div>
                <button onClick={() => setPage("checkout")}>Thanh toán</button>
              </div>
            )}
          </section>
        )}

        {page === "account" && (
          <AccountArea user={user} onLogin={u => { setUser(u); localStorage.setItem("user", JSON.stringify(u)); setToast("Đăng nhập thành công"); }} onLogout={() => { setUser(null); localStorage.removeItem("user"); setToast("Đã đăng xuất"); }} />
        )}

        {page === "checkout" && (
          <section>
            <h2>Thanh toán</h2>
            <div>
              <ul>
                {cartItems().map(i => (
                  <li key={i.id}>{i.title} × {i.qty} — {currency(i.price * i.qty)}</li>
                ))}
              </ul>
              <div>Tổng tiền: <strong>{currency(cartTotal())}</strong></div>
              <button onClick={handleCheckout}>Thanh toán online</button>
            </div>
          </section>
        )}
      </main>

      {toast && <div className="fixed bottom-6 right-6 bg-black text-white px-4 py-2 rounded shadow">{toast}</div>}
    </div>
  );
}

function AccountArea({ user, onLogin, onLogout }) {
  const [mode, setMode] = useState("login"); 
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  function handleRegister(e) {
    e.preventDefault();
    if (!name || !email || !password) return alert("Vui lòng điền đầy đủ thông tin");
    const users = JSON.parse(localStorage.getItem("demo_users") || "[]");
    if (users.find(u => u.email === email)) return alert("Email đã được sử dụng");
    const newUser = { id: Date.now().toString(), name, email, password };
    users.push(newUser);
    localStorage.setItem("demo_users", JSON.stringify(users));
    onLogin({ id: newUser.id, name: newUser.name, email: newUser.email });
  }

  function handleLogin(e) {
    e.preventDefault();
    const users = JSON.parse(localStorage.getItem("demo_users") || "[]");
    const found = users.find(u => u.email === email && u.password === password);
    if (!found) return alert("Email hoặc mật khẩu không đúng");
    onLogin({ id: found.id, name: found.name, email: found.email });
  }

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded shadow-sm">
      {user ? (
        <div>
          <h3>Tài khoản của bạn</h3>
          <p>Tên: {user.name}</p>
          <p>Email: {user.email}</p>
          <button onClick={onLogout}>Đăng xuất</button>
        </div>
      ) : (
        <div>
          <div>
            <button onClick={() => setMode("login")}>Đăng nhập</button>
            <button onClick={() => setMode("register")}>Đăng ký</button>
          </div>
          {mode === "register" ? (
            <form onSubmit={handleRegister}>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Họ và tên" />
              <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
              <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Mật khẩu" type="password" />
              <button type="submit">Tạo tài khoản</button>
            </form>
          ) : (
            <form onSubmit={handleLogin}>
              <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
              <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Mật khẩu" type="password" />
              <button type="submit">Đăng nhập</button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
