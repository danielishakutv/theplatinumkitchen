import type { Order } from "./types";

const MIN = 60_000;
const HR = 60 * MIN;

const now = () => Date.now();

export const orders: Order[] = [
  {
    id: "o-1042",
    number: "PK-2026-0042",
    createdAt: new Date(now() - 8 * MIN).toISOString(),
    status: "received",
    fulfilment: "delivery",
    customer: { name: "Tobi Adeleke", phone: "+234 803 412 9087", email: "tobi@example.com" },
    address: {
      street: "12 Aminu Kano Crescent",
      area: "Wuse 2",
      city: "Abuja",
      state: "FCT",
      landmark: "Beside Sahad Stores",
    },
    lines: [
      {
        id: "l1",
        itemId: "i-platinum-jollof",
        itemName: "Platinum Jollof",
        imageUrl:
          "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&q=80&auto=format&fit=crop",
        quantity: 2,
        unitPrice: 7500,
        addons: [
          { groupId: "protein", optionId: "chicken", name: "Grilled chicken", priceDelta: 0 },
          { groupId: "spice", optionId: "hot", name: "Hot", priceDelta: 0 },
          { groupId: "extras", optionId: "plantain", name: "Sweet plantain", priceDelta: 1000 },
        ],
        notes: "Extra crispy plantain please",
      },
      {
        id: "l2",
        itemId: "i-zobo",
        itemName: "House Zobo",
        imageUrl:
          "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&q=80&auto=format&fit=crop",
        quantity: 2,
        unitPrice: 2200,
        addons: [],
      },
    ],
    subtotal: 21400,
    serviceCharge: 1070,
    deliveryFee: 1500,
    total: 23970,
    paymentMethod: "cod",
    paymentStatus: "unpaid",
    notes: "Call when you arrive — gate code 4421",
  },
  {
    id: "o-1041",
    number: "PK-2026-0041",
    createdAt: new Date(now() - 22 * MIN).toISOString(),
    status: "preparing",
    fulfilment: "delivery",
    customer: { name: "Ngozi Eze", phone: "+234 705 882 3320" },
    address: {
      street: "House 14, 5th Avenue",
      area: "Gwarinpa",
      city: "Abuja",
      state: "FCT",
    },
    lines: [
      {
        id: "l1",
        itemId: "i-egusi-royale",
        itemName: "Egusi Royale",
        imageUrl:
          "https://images.unsplash.com/photo-1574484284002-952d92456975?w=400&q=80&auto=format&fit=crop",
        quantity: 1,
        unitPrice: 8800,
        addons: [
          { groupId: "swallow", optionId: "pounded-yam", name: "Pounded yam", priceDelta: 0 },
          { groupId: "spice", optionId: "medium", name: "Medium", priceDelta: 0 },
        ],
      },
      {
        id: "l2",
        itemId: "i-suya-board",
        itemName: "Suya Board",
        imageUrl:
          "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&q=80&auto=format&fit=crop",
        quantity: 1,
        unitPrice: 9500,
        addons: [
          { groupId: "skewers", optionId: "5", name: "5 skewers", priceDelta: 2200 },
          { groupId: "spice", optionId: "fire", name: "Fire", priceDelta: 0 },
        ],
      },
    ],
    subtotal: 20500,
    serviceCharge: 1025,
    deliveryFee: 2000,
    total: 23525,
    paymentMethod: "paystack",
    paymentStatus: "paid",
  },
  {
    id: "o-1040",
    number: "PK-2026-0040",
    createdAt: new Date(now() - 38 * MIN).toISOString(),
    status: "ready",
    fulfilment: "pickup",
    customer: { name: "Chika Nwosu", phone: "+234 802 100 2200", email: "chika@example.com" },
    lines: [
      {
        id: "l1",
        itemId: "i-grilled-tilapia",
        itemName: "Grilled Tilapia",
        imageUrl:
          "https://images.unsplash.com/photo-1535473895227-bdecb20fb157?w=400&q=80&auto=format&fit=crop",
        quantity: 1,
        unitPrice: 9500,
        addons: [
          { groupId: "spice", optionId: "hot", name: "Hot", priceDelta: 0 },
          { groupId: "extras", optionId: "plantain", name: "Sweet plantain", priceDelta: 1000 },
        ],
      },
    ],
    subtotal: 10500,
    serviceCharge: 525,
    deliveryFee: 0,
    total: 11025,
    paymentMethod: "paystack",
    paymentStatus: "paid",
  },
  {
    id: "o-1039",
    number: "PK-2026-0039",
    createdAt: new Date(now() - 1.5 * HR).toISOString(),
    status: "out_for_delivery",
    fulfilment: "delivery",
    customer: { name: "Hauwa Garba", phone: "+234 909 555 1010" },
    address: {
      street: "Plot 87, Ahmadu Bello Way",
      area: "Garki",
      city: "Abuja",
      state: "FCT",
    },
    lines: [
      {
        id: "l1",
        itemId: "i-asun-platter",
        itemName: "Asun Platter",
        imageUrl:
          "https://images.unsplash.com/photo-1544025162-d76694265947?w=400&q=80&auto=format&fit=crop",
        quantity: 1,
        unitPrice: 11000,
        addons: [
          { groupId: "spice", optionId: "fire", name: "Fire", priceDelta: 0 },
          { groupId: "size", optionId: "share", name: "Sharing platter", priceDelta: 4000 },
        ],
      },
      {
        id: "l2",
        itemId: "i-chapman",
        itemName: "Classic Chapman",
        imageUrl:
          "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=400&q=80&auto=format&fit=crop",
        quantity: 2,
        unitPrice: 2500,
        addons: [],
      },
    ],
    subtotal: 20000,
    serviceCharge: 1000,
    deliveryFee: 1800,
    total: 22800,
    paymentMethod: "cod",
    paymentStatus: "unpaid",
  },
  {
    id: "o-1038",
    number: "PK-2026-0038",
    createdAt: new Date(now() - 3 * HR).toISOString(),
    status: "delivered",
    fulfilment: "delivery",
    customer: { name: "Bola Adeyinka", phone: "+234 813 040 9912" },
    address: {
      street: "9 Mike Akhigbe Way",
      area: "Jabi",
      city: "Abuja",
      state: "FCT",
    },
    lines: [
      {
        id: "l1",
        itemId: "i-fried-rice",
        itemName: "Nigerian Fried Rice",
        imageUrl:
          "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&q=80&auto=format&fit=crop",
        quantity: 3,
        unitPrice: 6200,
        addons: [
          { groupId: "protein", optionId: "chicken", name: "Grilled chicken", priceDelta: 0 },
        ],
      },
      {
        id: "l2",
        itemId: "i-small-chops-platter",
        itemName: "Small Chops Platter",
        imageUrl:
          "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=400&q=80&auto=format&fit=crop",
        quantity: 1,
        unitPrice: 6500,
        addons: [
          { groupId: "size", optionId: "share", name: "Sharing platter", priceDelta: 4000 },
        ],
      },
    ],
    subtotal: 29100,
    serviceCharge: 1455,
    deliveryFee: 2000,
    total: 32555,
    paymentMethod: "paystack",
    paymentStatus: "paid",
  },
  {
    id: "o-1037",
    number: "PK-2026-0037",
    createdAt: new Date(now() - 5 * HR).toISOString(),
    status: "delivered",
    fulfilment: "delivery",
    customer: { name: "Kemi Olajide", phone: "+234 802 998 3344" },
    address: {
      street: "16 Yedseram St",
      area: "Maitama",
      city: "Abuja",
      state: "FCT",
    },
    lines: [
      {
        id: "l1",
        itemId: "i-ofada-rice",
        itemName: "Ofada Rice & Ayamase",
        imageUrl:
          "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400&q=80&auto=format&fit=crop",
        quantity: 2,
        unitPrice: 6800,
        addons: [
          { groupId: "protein", optionId: "beef", name: "Slow-braised beef", priceDelta: 800 },
          { groupId: "spice", optionId: "hot", name: "Hot", priceDelta: 0 },
        ],
      },
    ],
    subtotal: 15200,
    serviceCharge: 760,
    deliveryFee: 1500,
    total: 17460,
    paymentMethod: "cod",
    paymentStatus: "paid",
  },
  {
    id: "o-1036",
    number: "PK-2026-0036",
    createdAt: new Date(now() - 7 * HR).toISOString(),
    status: "delivered",
    fulfilment: "dine_in",
    customer: { name: "Walk-in (Table 6)", phone: "—" },
    lines: [
      {
        id: "l1",
        itemId: "i-pepper-soup",
        itemName: "Goat Pepper Soup",
        imageUrl:
          "https://images.unsplash.com/photo-1547592180-85f173990554?w=400&q=80&auto=format&fit=crop",
        quantity: 2,
        unitPrice: 7200,
        addons: [{ groupId: "spice", optionId: "fire", name: "Fire", priceDelta: 0 }],
      },
      {
        id: "l2",
        itemId: "i-palmwine",
        itemName: "Fresh Palm Wine",
        imageUrl:
          "https://images.unsplash.com/photo-1559847844-5315695dadae?w=400&q=80&auto=format&fit=crop",
        quantity: 1,
        unitPrice: 3500,
        addons: [],
      },
    ],
    subtotal: 17900,
    serviceCharge: 895,
    deliveryFee: 0,
    total: 18795,
    paymentMethod: "paystack",
    paymentStatus: "paid",
  },
  {
    id: "o-1035",
    number: "PK-2026-0035",
    createdAt: new Date(now() - 26 * HR).toISOString(),
    status: "cancelled",
    fulfilment: "delivery",
    customer: { name: "Anonymous", phone: "+234 706 200 4040" },
    address: { street: "—", area: "Asokoro", city: "Abuja", state: "FCT" },
    lines: [
      {
        id: "l1",
        itemId: "i-shawarma",
        itemName: "House Shawarma",
        imageUrl:
          "https://images.unsplash.com/photo-1561651823-34feb02250e4?w=400&q=80&auto=format&fit=crop",
        quantity: 2,
        unitPrice: 4200,
        addons: [
          { groupId: "protein", optionId: "chicken", name: "Grilled chicken", priceDelta: 0 },
          { groupId: "spice", optionId: "medium", name: "Medium", priceDelta: 0 },
        ],
      },
    ],
    subtotal: 8400,
    serviceCharge: 0,
    deliveryFee: 0,
    total: 8400,
    paymentMethod: "cod",
    paymentStatus: "unpaid",
    notes: "Customer cancelled — duplicate order",
  },
];

export function getOrderById(id: string): Order | undefined {
  return orders.find((o) => o.id === id);
}

export function getOrderByNumber(num: string): Order | undefined {
  return orders.find((o) => o.number === num);
}
