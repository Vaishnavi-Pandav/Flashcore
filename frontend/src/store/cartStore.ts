import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  slug: string;
  qty: number;
  stock: number;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  // Actions
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: Omit<CartItem, 'qty'>) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clearCart: () => void;
  // Derived
  total: () => number;
  count: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      addItem: (incoming) => {
        const existing = get().items.find((i) => i.id === incoming.id);
        if (existing) {
          set((state) => ({
            items: state.items.map((i) =>
              i.id === incoming.id
                ? { ...i, qty: Math.min(i.qty + 1, i.stock) }
                : i
            ),
          }));
        } else {
          set((state) => ({ items: [...state.items, { ...incoming, qty: 1 }] }));
        }
      },

      removeItem: (id) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== id) })),

      updateQty: (id, qty) => {
        if (qty < 1) {
          get().removeItem(id);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id ? { ...i, qty: Math.min(qty, i.stock) } : i
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      total: () =>
        get().items.reduce((sum, i) => sum + i.price * i.qty, 0),

      count: () =>
        get().items.reduce((sum, i) => sum + i.qty, 0),
    }),
    { name: 'flashcore-cart' }
  )
);
