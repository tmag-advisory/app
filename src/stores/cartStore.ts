import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
    ebookVersionId: number;
    ebookId: number;
    ebookTitle: string;
    ebookSlug: string;
    coverUrl: string | null;
    versionLabel: string;
    countryName: string | null;
    price: number;
    currency: string;
    currencySymbol: string;
}

interface CartState {
    items: CartItem[];
    panelOpen: boolean;

    addItem: (item: CartItem) => void;
    removeItem: (ebookVersionId: number) => void;
    clearCart: () => void;
    setItems: (items: CartItem[]) => void;
    hasItem: (ebookVersionId: number) => boolean;
    itemCount: () => number;
    totalAmount: () => number;
    currency: () => string | null;
    currencySymbol: () => string | null;

    openPanel: () => void;
    closePanel: () => void;
    togglePanel: () => void;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            panelOpen: false,

            addItem: (item) => {
                const exists = get().items.some(i => i.ebookVersionId === item.ebookVersionId);
                if (!exists) {
                    set((s) => ({ items: [...s.items, item] }));
                }
            },

            removeItem: (ebookVersionId) => {
                set((s) => ({
                    items: s.items.filter(i => i.ebookVersionId !== ebookVersionId),
                }));
            },

            clearCart: () => set({ items: [] }),

            setItems: (items) => set({ items }),

            hasItem: (ebookVersionId) => {
                return get().items.some(i => i.ebookVersionId === ebookVersionId);
            },

            itemCount: () => get().items.length,

            totalAmount: () => {
                return get().items.reduce((sum, i) => sum + i.price, 0);
            },

            currency: () => {
                const items = get().items;
                return items.length > 0 ? items[0].currency : null;
            },

            currencySymbol: () => {
                const items = get().items;
                return items.length > 0 ? items[0].currencySymbol : null;
            },

            openPanel: () => set({ panelOpen: true }),
            closePanel: () => set({ panelOpen: false }),
            togglePanel: () => set((s) => ({ panelOpen: !s.panelOpen })),
        }),
        {
            name: "tmag-cart",
            partialize: (state) => ({ items: state.items }),
        }
    )
);
