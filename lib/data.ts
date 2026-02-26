import type { Product, Category, Banner, StoreSettings } from "@/lib/types"

export const categories: Category[] = [
  {
    id: "cat-1",
    name: "Men's Collection",
    slug: "mens-collection",
    description: "Premium Eid kurtas, shalwar kameez, and sherwani for men",
    image: "/images/cat-men.jpg",
  },
  {
    id: "cat-2",
    name: "Women's Collection",
    slug: "womens-collection",
    description: "Elegant Eid dresses, lawn suits, and formal wear for women",
    image: "/images/cat-women.jpg",
  },
  {
    id: "cat-3",
    name: "Kids' Collection",
    slug: "kids-collection",
    description: "Adorable Eid outfits for boys and girls",
    image: "/images/cat-kids.jpg",
  },
  {
    id: "cat-4",
    name: "Accessories",
    slug: "accessories",
    description: "Dupattas, shawls, jewelry, and footwear",
    image: "/images/cat-accessories.jpg",
  },
]

export const products: Product[] = [
  {
    id: "prod-1",
    name: "Royal Emerald Sherwani",
    slug: "royal-emerald-sherwani",
    description:
      "Exquisite emerald green sherwani with intricate gold embroidery. Perfect for Eid celebrations and formal occasions. Made from premium silk blend fabric with detailed handwork on collar, cuffs, and front panel.",
    price: 12500,
    originalPrice: 16000,
    images: ["/images/prod-1.jpg"],
    category: "mens-collection",
    sizes: ["S", "M", "L", "XL", "XXL"],
    stockPerSize: { S: 5, M: 8, L: 10, XL: 6, XXL: 3 },
    featured: true,
    tags: ["sherwani", "eid", "formal", "embroidered"],
    createdAt: "2026-01-15T00:00:00Z",
  },
  {
    id: "prod-2",
    name: "Classic White Kurta Pajama",
    slug: "classic-white-kurta-pajama",
    description:
      "Timeless white cotton kurta pajama set with minimalist gold button details. Breathable cotton fabric ensures comfort throughout Eid prayers and festivities.",
    price: 4500,
    images: ["/images/prod-2.jpg"],
    category: "mens-collection",
    sizes: ["S", "M", "L", "XL"],
    stockPerSize: { S: 12, M: 15, L: 15, XL: 10 },
    featured: true,
    tags: ["kurta", "eid", "cotton", "classic"],
    createdAt: "2026-01-18T00:00:00Z",
  },
  {
    id: "prod-3",
    name: "Gold Embroidered Shalwar Kameez",
    slug: "gold-embroidered-shalwar-kameez",
    description:
      "Luxurious beige shalwar kameez with stunning gold thread embroidery on the neckline and sleeves. A statement piece for Eid gatherings.",
    price: 8500,
    originalPrice: 10500,
    images: ["/images/prod-3.jpg"],
    category: "mens-collection",
    sizes: ["M", "L", "XL"],
    stockPerSize: { M: 6, L: 8, XL: 4 },
    featured: false,
    tags: ["shalwar-kameez", "embroidered", "gold"],
    createdAt: "2026-01-20T00:00:00Z",
  },
  {
    id: "prod-4",
    name: "Emerald Green Anarkali Suit",
    slug: "emerald-green-anarkali-suit",
    description:
      "Stunning floor-length emerald Anarkali suit with heavy gold zardozi work. Comes with matching dupatta and churidar. Perfect for Eid dinners and celebrations.",
    price: 15000,
    originalPrice: 19500,
    images: ["/images/prod-4.jpg"],
    category: "womens-collection",
    sizes: ["S", "M", "L", "XL"],
    stockPerSize: { S: 4, M: 7, L: 6, XL: 3 },
    featured: true,
    tags: ["anarkali", "formal", "eid", "zardozi"],
    createdAt: "2026-01-22T00:00:00Z",
  },
  {
    id: "prod-5",
    name: "Premium Lawn Suit - Floral Garden",
    slug: "premium-lawn-suit-floral-garden",
    description:
      "Three-piece premium lawn suit featuring delicate floral prints in sage green and gold tones. Includes printed shirt, dyed trouser, and chiffon dupatta.",
    price: 6500,
    images: ["/images/prod-5.jpg"],
    category: "womens-collection",
    sizes: ["S", "M", "L", "XL"],
    stockPerSize: { S: 10, M: 15, L: 12, XL: 8 },
    featured: true,
    tags: ["lawn", "printed", "three-piece", "summer"],
    createdAt: "2026-02-01T00:00:00Z",
  },
  {
    id: "prod-6",
    name: "Bridal Gold Lehenga Choli",
    slug: "bridal-gold-lehenga-choli",
    description:
      "Magnificent gold and maroon lehenga choli with heavy embellishment and mirror work. A showstopper for Eid weddings and formal events.",
    price: 28000,
    originalPrice: 35000,
    images: ["/images/prod-6.jpg"],
    category: "womens-collection",
    sizes: ["S", "M", "L"],
    stockPerSize: { S: 2, M: 3, L: 2 },
    featured: false,
    tags: ["lehenga", "bridal", "formal", "heavy-work"],
    createdAt: "2026-02-05T00:00:00Z",
  },
  {
    id: "prod-7",
    name: "White Chiffon Dupatta with Gold Border",
    slug: "white-chiffon-dupatta-gold-border",
    description:
      "Delicate white chiffon dupatta with elegant gold lace border. Versatile accessory that pairs beautifully with any outfit for Eid.",
    price: 2200,
    images: ["/images/prod-7.jpg"],
    category: "accessories",
    sizes: ["Free Size"],
    stockPerSize: { "Free Size": 25 },
    featured: false,
    tags: ["dupatta", "chiffon", "accessory"],
    createdAt: "2026-02-08T00:00:00Z",
  },
  {
    id: "prod-8",
    name: "Boys Eid Kurta - Mini Nawab",
    slug: "boys-eid-kurta-mini-nawab",
    description:
      "Adorable cream and gold kurta set for boys. Features delicate embroidery on collar and pocket. Comfortable cotton blend fabric perfect for little ones.",
    price: 3200,
    originalPrice: 4000,
    images: ["/images/prod-8.jpg"],
    category: "kids-collection",
    sizes: ["2-3Y", "4-5Y", "6-7Y", "8-9Y"],
    stockPerSize: { "2-3Y": 8, "4-5Y": 10, "6-7Y": 10, "8-9Y": 6 },
    featured: true,
    tags: ["kids", "boys", "kurta", "eid"],
    createdAt: "2026-02-10T00:00:00Z",
  },
  {
    id: "prod-9",
    name: "Girls Eid Gharara Set",
    slug: "girls-eid-gharara-set",
    description:
      "Beautiful pink and green gharara set for girls with sequin embellishment and matching dupatta. Made from soft fabric for all-day Eid comfort.",
    price: 3800,
    images: ["/images/prod-9.jpg"],
    category: "kids-collection",
    sizes: ["2-3Y", "4-5Y", "6-7Y", "8-9Y"],
    stockPerSize: { "2-3Y": 6, "4-5Y": 8, "6-7Y": 8, "8-9Y": 5 },
    featured: false,
    tags: ["kids", "girls", "gharara", "eid"],
    createdAt: "2026-02-12T00:00:00Z",
  },
  {
    id: "prod-10",
    name: "Velvet Prince Coat Suit",
    slug: "velvet-prince-coat-suit",
    description:
      "Elegant deep green velvet prince coat with matching waistcoat and shalwar. Perfect for men who want a regal look this Eid.",
    price: 18000,
    originalPrice: 22000,
    images: ["/images/prod-10.jpg"],
    category: "mens-collection",
    sizes: ["M", "L", "XL"],
    stockPerSize: { M: 4, L: 5, XL: 3 },
    featured: false,
    tags: ["prince-coat", "velvet", "formal"],
    createdAt: "2026-02-14T00:00:00Z",
  },
  {
    id: "prod-11",
    name: "Silk Embroidered Khussa",
    slug: "silk-embroidered-khussa",
    description:
      "Handcrafted silk khussa shoes with intricate gold threadwork. Traditional Punjabi craftsmanship meets modern comfort. Ideal for completing your Eid look.",
    price: 3500,
    images: ["/images/prod-11.jpg"],
    category: "accessories",
    sizes: ["7", "8", "9", "10", "11"],
    stockPerSize: { "7": 6, "8": 10, "9": 12, "10": 8, "11": 4 },
    featured: true,
    tags: ["khussa", "footwear", "handcrafted"],
    createdAt: "2026-02-16T00:00:00Z",
  },
  {
    id: "prod-12",
    name: "Pearl & Gold Statement Necklace",
    slug: "pearl-gold-statement-necklace",
    description:
      "Elegant pearl and gold-plated statement necklace that elevates any Eid outfit. Hypoallergenic and lightweight for all-day wear.",
    price: 4800,
    originalPrice: 6000,
    images: ["/images/prod-12.jpg"],
    category: "accessories",
    sizes: ["Free Size"],
    stockPerSize: { "Free Size": 15 },
    featured: false,
    tags: ["jewelry", "necklace", "pearl", "gold"],
    createdAt: "2026-02-18T00:00:00Z",
  },
  {
    id: "prod-13",
    name: "Pastel Rose Chikan Kari Suit",
    slug: "pastel-rose-chikan-kari-suit",
    description:
      "Soft pastel rose three-piece suit with hand-embroidered Chikan Kari work. Comes with cotton trouser and organza dupatta. A graceful choice for Eid.",
    price: 9500,
    images: ["/images/prod-13.jpg"],
    category: "womens-collection",
    sizes: ["S", "M", "L", "XL"],
    stockPerSize: { S: 5, M: 8, L: 7, XL: 4 },
    featured: false,
    tags: ["chikan-kari", "pastel", "embroidered"],
    createdAt: "2026-02-20T00:00:00Z",
  },
  {
    id: "prod-14",
    name: "Boys Waistcoat Shalwar Kameez",
    slug: "boys-waistcoat-shalwar-kameez",
    description:
      "Dapper three-piece set for boys featuring a gold waistcoat over white shalwar kameez. Perfect for Eid family gatherings and celebrations.",
    price: 4200,
    images: ["/images/prod-14.jpg"],
    category: "kids-collection",
    sizes: ["2-3Y", "4-5Y", "6-7Y", "8-9Y", "10-11Y"],
    stockPerSize: { "2-3Y": 5, "4-5Y": 7, "6-7Y": 8, "8-9Y": 6, "10-11Y": 4 },
    featured: false,
    tags: ["kids", "boys", "waistcoat", "formal"],
    createdAt: "2026-02-22T00:00:00Z",
  },
]

export const banners: Banner[] = [
  {
    id: "banner-1",
    title: "Eid Mubarak Collection 2026",
    subtitle: "Celebrate in style with our exclusive festive wear",
    ctaText: "Shop Now",
    ctaLink: "/shop",
    image: "/images/banner-1.jpg",
    active: true,
  },
  {
    id: "banner-2",
    title: "Up to 50% Off",
    subtitle: "Premium Eid fashion at unbeatable prices",
    ctaText: "View Deals",
    ctaLink: "/shop?sort=sale",
    image: "/images/banner-2.jpg",
    active: true,
  },
  {
    id: "banner-3",
    title: "Kids Eid Special",
    subtitle: "Dress your little ones in joy this Eid",
    ctaText: "Explore Kids",
    ctaLink: "/shop?category=kids-collection",
    image: "/images/banner-3.jpg",
    active: true,
  },
]

export const defaultSettings: StoreSettings = {
  storeName: "Eid Collection",
  storePhone: "+880 171 0000000",
  storeEmail: "info@eidcollection.bd",
  deliveryCharge: 250,
  freeDeliveryThreshold: 5000,
}

export const districts = [
  "Dhaka",
  "Chattogram",
  "Khulna",
  "Rajshahi",
  "Sylhet",
  "Barishal",
  "Rangpur",
  "Mymensingh",
  "Cox's Bazar",
  "Narayanganj",
  "Gazipur",
  "Comilla",
]

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug)
}

export function getProductsByCategory(categorySlug: string): Product[] {
  return products.filter((p) => p.category === categorySlug)
}

export function getFeaturedProducts(): Product[] {
  return products.filter((p) => p.featured)
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug)
}

export function formatPrice(price: number | string | undefined | null): string {
  const n = Number(price ?? 0)
  if (Number.isNaN(n)) return `BDT. 0.00`
  return `BDT. ${n.toLocaleString("en-BD", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
