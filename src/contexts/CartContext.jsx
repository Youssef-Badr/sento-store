import { createContext, useState, useEffect, useContext } from "react";

// eslint-disable-next-line react-refresh/only-export-components
export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  // ⬇️ تحميل الكارت من localStorage + تحقق من صلاحية 24 ساعة
  useEffect(() => {
    const storedCart = localStorage.getItem("cart");
    if (storedCart) {
      try {
        const parsed = JSON.parse(storedCart);

        // ✅ لو الكارت قديم (من غير expiry) نعتبره صالح
        if (!parsed.expiry) {
          setCart(parsed.items || parsed);
          return;
        }

        // ✅ لو انتهت صلاحية الكارت
        if (Date.now() > parsed.expiry) {
          localStorage.removeItem("cart");
          setCart([]);
        } else {
          setCart(parsed.items || []);
        }
      } catch (e) {
        console.error("Failed to parse cart from localStorage", e);
        setCart([]);
      }
    }
  }, []);

  // ⬇️ حفظ الكارت في localStorage مع Expiry = 24 ساعة
  useEffect(() => {
    if (cart.length > 0) {
      const data = {
        items: cart,
        expiry: Date.now() + 24 * 60 * 60 * 1000, // 24 ساعة
      };
      localStorage.setItem("cart", JSON.stringify(data));
    } else {
      localStorage.removeItem("cart"); // ✅ لو الكارت فاضي نمسحه
    }
  }, [cart]);

  // ✅ الدالة الصحيحة لإضافة منتج إلى السلة
  const addToCart = (product, selectedColorId, selectedSizeId, qty) => {
    if (!product || !selectedColorId || !selectedSizeId || !qty) {
      console.error("❌ Cannot add product: missing data.");
      return;
    }

    const selectedVariation = product.variations.find(
      (v) => v._id === selectedColorId
    );
    if (!selectedVariation) {
      console.error("❌ Cannot find selected variation.");
      return;
    }

    const selectedSize = selectedVariation.sizes.find(
      (s) => s._id === selectedSizeId
    );
    if (!selectedSize) {
      console.error("❌ Cannot find selected size.");
      return;
    }

    const newItem = {
      product: product._id,
      variationId: selectedVariation._id,
      name: product.name,
      price: product.salePrice || product.originalPrice,
      color: selectedVariation.color,
      size: selectedSize.size,
      sizeId: selectedSize._id,
      image:
        selectedVariation.images?.[0]?.url || product.images?.[0]?.url || "",
      qty,
    };

    setCart((prev) => {
      const exist = prev.find(
        (item) =>
          item.product === newItem.product && item.sizeId === newItem.sizeId
      );

      if (exist) {
        return prev.map((item) =>
          item.product === newItem.product && item.sizeId === newItem.sizeId
            ? { ...item, qty: item.qty + newItem.qty }
            : item
        );
      } else {
        return [...prev, newItem];
      }
    });
  };

  const removeFromCart = (productId, sizeId) => {
    setCart((prev) =>
      prev.filter(
        (item) => !(item.product === productId && item.sizeId === sizeId)
      )
    );
  };

  const updateQty = (productId, sizeId, qty) => {
    setCart((prev) =>
      prev.map((item) =>
        item.product === productId && item.sizeId === sizeId
          ? { ...item, qty }
          : item
      )
    );
  };

  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, updateQty, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => useContext(CartContext);
