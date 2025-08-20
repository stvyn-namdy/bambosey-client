// client/src/data/products.js

// Fallback sample products for development/testing
export const products = [
  {
    id: 1,
    name: "Classic Cotton T-Shirt",
    description: "Comfortable and stylish cotton t-shirt perfect for everyday wear. Made from 100% organic cotton for ultimate comfort and breathability. Features a relaxed fit with ribbed collar and cuffs.",
    longDescription: "This classic cotton t-shirt is a wardrobe essential that combines comfort with timeless style. Crafted from premium 100% organic cotton, it offers exceptional softness and breathability. The relaxed fit ensures comfortable wear throughout the day, while the ribbed collar and cuffs add a refined touch. Perfect for casual outings, layering, or lounging at home.",
    price: "$29.99",
    priceNumber: 29.99,
    image: "/images/products/placeholder-1.jpg",
    images: [
      "/images/products/placeholder-1.jpg",
      "/images/products/placeholder-1-alt1.jpg",
      "/images/products/placeholder-1-alt2.jpg"
    ],
    category: "men",
    subcategory: "t-shirts",
    colors: ["White", "Black", "Gray", "Navy"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    variants: [
      { color: "White", size: "S", stock: 15, sku: "CT-001-WH-S" },
      { color: "White", size: "M", stock: 20, sku: "CT-001-WH-M" },
      { color: "White", size: "L", stock: 18, sku: "CT-001-WH-L" },
      { color: "White", size: "XL", stock: 12, sku: "CT-001-WH-XL" },
      { color: "Black", size: "S", stock: 10, sku: "CT-001-BK-S" },
      { color: "Black", size: "M", stock: 25, sku: "CT-001-BK-M" },
      { color: "Black", size: "L", stock: 22, sku: "CT-001-BK-L" },
      { color: "Black", size: "XL", stock: 8, sku: "CT-001-BK-XL" },
      { color: "Gray", size: "S", stock: 5, sku: "CT-001-GR-S" },
      { color: "Gray", size: "M", stock: 14, sku: "CT-001-GR-M" },
      { color: "Gray", size: "L", stock: 16, sku: "CT-001-GR-L" },
      { color: "Navy", size: "M", stock: 0, sku: "CT-001-NV-M" },
      { color: "Navy", size: "L", stock: 3, sku: "CT-001-NV-L" }
    ],
    stockStatus: "IN_STOCK",
    allowPreorder: true,
    isActive: true,
    sku: "CT-001",
    tags: ["casual", "cotton", "organic", "everyday"],
    brand: "BamBosey",
    weight: "150g",
    material: "100% Organic Cotton",
    careInstructions: "Machine wash cold, tumble dry low, do not bleach",
    features: ["Organic cotton", "Ribbed collar", "Relaxed fit", "Pre-shrunk"],
    createdAt: "2024-01-15T00:00:00Z",
    updatedAt: "2024-01-20T00:00:00Z"
  },
  {
    id: 2,
    name: "Summer Dress",
    description: "Light and breezy summer dress perfect for warm weather occasions. Features a flattering A-line silhouette with adjustable straps.",
    longDescription: "Embrace the summer season with this effortlessly elegant dress. The lightweight fabric drapes beautifully, creating a flattering A-line silhouette that suits all body types. Adjustable straps ensure the perfect fit, while the midi length offers versatility for both casual and semi-formal occasions. The breathable material keeps you cool and comfortable all day long.",
    price: "$45.99",
    priceNumber: 45.99,
    image: "/images/products/placeholder-2.jpg",
    images: [
      "/images/products/placeholder-2.jpg",
      "/images/products/placeholder-2-alt1.jpg",
      "/images/products/placeholder-2-alt2.jpg",
      "/images/products/placeholder-2-alt3.jpg"
    ],
    category: "women",
    subcategory: "dresses",
    colors: ["Blue", "Pink", "Yellow", "White"],
    sizes: ["XS", "S", "M", "L", "XL"],
    variants: [
      { color: "Blue", size: "XS", stock: 8, sku: "SD-001-BL-XS" },
      { color: "Blue", size: "S", stock: 12, sku: "SD-001-BL-S" },
      { color: "Blue", size: "M", stock: 15, sku: "SD-001-BL-M" },
      { color: "Blue", size: "L", stock: 10, sku: "SD-001-BL-L" },
      { color: "Pink", size: "S", stock: 6, sku: "SD-001-PK-S" },
      { color: "Pink", size: "M", stock: 9, sku: "SD-001-PK-M" },
      { color: "Pink", size: "L", stock: 7, sku: "SD-001-PK-L" },
      { color: "Yellow", size: "XS", stock: 4, sku: "SD-001-YL-XS" },
      { color: "Yellow", size: "S", stock: 11, sku: "SD-001-YL-S" },
      { color: "White", size: "M", stock: 0, sku: "SD-001-WH-M" },
      { color: "White", size: "L", stock: 2, sku: "SD-001-WH-L" }
    ],
    stockStatus: "IN_STOCK",
    allowPreorder: true,
    isActive: true,
    sku: "SD-001",
    tags: ["summer", "dress", "casual", "feminine"],
    brand: "BamBosey",
    weight: "200g",
    material: "Cotton Blend (60% Cotton, 40% Polyester)",
    careInstructions: "Machine wash warm, hang dry, iron on low heat",
    features: ["Adjustable straps", "A-line silhouette", "Midi length", "Side pockets"],
    createdAt: "2024-01-16T00:00:00Z",
    updatedAt: "2024-01-21T00:00:00Z"
  },
  {
    id: 3,
    name: "Kids Playful T-Shirt",
    description: "Fun and colorful t-shirt designed for active kids. Soft, durable fabric that can keep up with playtime adventures.",
    longDescription: "Let your little ones express their playful side with this vibrant t-shirt. Made from soft, durable fabric that's gentle on sensitive skin yet tough enough for playground adventures. The fun designs and bright colors make it a favorite among kids, while parents love the easy-care fabric and quality construction.",
    price: "$19.99",
    priceNumber: 19.99,
    image: "/images/products/placeholder-3.jpg",
    images: [
      "/images/products/placeholder-3.jpg",
      "/images/products/placeholder-3-alt1.jpg",
      "/images/products/placeholder-3-alt2.jpg"
    ],
    category: "kids",
    subcategory: "t-shirts",
    colors: ["Rainbow", "Blue", "Pink", "Green"],
    sizes: ["2T", "3T", "4T", "XS", "S", "M"],
    variants: [
      { color: "Rainbow", size: "2T", stock: 15, sku: "KT-001-RB-2T" },
      { color: "Rainbow", size: "3T", stock: 18, sku: "KT-001-RB-3T" },
      { color: "Rainbow", size: "4T", stock: 12, sku: "KT-001-RB-4T" },
      { color: "Blue", size: "XS", stock: 10, sku: "KT-001-BL-XS" },
      { color: "Blue", size: "S", stock: 14, sku: "KT-001-BL-S" },
      { color: "Pink", size: "2T", stock: 8, sku: "KT-001-PK-2T" },
      { color: "Pink", size: "XS", stock: 11, sku: "KT-001-PK-XS" },
      { color: "Green", size: "3T", stock: 6, sku: "KT-001-GR-3T" },
      { color: "Green", size: "S", stock: 9, sku: "KT-001-GR-S" }
    ],
    stockStatus: "IN_STOCK",
    allowPreorder: false,
    isActive: true,
    sku: "KT-001",
    tags: ["kids", "playful", "colorful", "durable"],
    brand: "BamBosey Kids",
    weight: "120g",
    material: "100% Cotton Jersey",
    careInstructions: "Machine wash cold, tumble dry low, do not bleach",
    features: ["Kid-friendly designs", "Soft cotton jersey", "Reinforced seams", "Tag-free labels"],
    createdAt: "2024-01-17T00:00:00Z",
    updatedAt: "2024-01-22T00:00:00Z"
  },
  {
    id: 4,
    name: "Leather Handbag",
    description: "Elegant leather handbag crafted from premium materials. Perfect for everyday use with ample storage and timeless style.",
    longDescription: "This sophisticated leather handbag combines functionality with timeless elegance. Crafted from genuine leather with meticulous attention to detail, it features multiple compartments to keep your essentials organized. The classic design makes it versatile enough for both professional and casual settings, while the durable construction ensures it will be a cherished accessory for years to come.",
    price: "$89.99",
    priceNumber: 89.99,
    image: "/images/products/placeholder-4.jpg",
    images: [
      "/images/products/placeholder-4.jpg",
      "/images/products/placeholder-4-alt1.jpg",
      "/images/products/placeholder-4-alt2.jpg",
      "/images/products/placeholder-4-detail.jpg"
    ],
    category: "accessories",
    subcategory: "bags",
    colors: ["Black", "Brown", "Tan", "Burgundy"],
    sizes: ["One Size"],
    variants: [
      { color: "Black", size: "One Size", stock: 25, sku: "LH-001-BK-OS" },
      { color: "Brown", size: "One Size", stock: 18, sku: "LH-001-BR-OS" },
      { color: "Tan", size: "One Size", stock: 12, sku: "LH-001-TN-OS" },
      { color: "Burgundy", size: "One Size", stock: 8, sku: "LH-001-BG-OS" }
    ],
    stockStatus: "IN_STOCK",
    allowPreorder: true,
    isActive: true,
    sku: "LH-001",
    tags: ["leather", "handbag", "elegant", "everyday"],
    brand: "BamBosey Leather",
    weight: "450g",
    material: "Genuine Leather with Cotton Lining",
    careInstructions: "Clean with leather conditioner, avoid water exposure",
    features: ["Multiple compartments", "Adjustable strap", "Magnetic closure", "Interior pockets"],
    dimensions: "30cm x 25cm x 12cm",
    createdAt: "2024-01-18T00:00:00Z",
    updatedAt: "2024-01-23T00:00:00Z"
  },
];

// Sample categories with subcategories for admin management
export const categories = [
  { 
    id: 1, 
    name: "Men", 
    slug: "men",
    description: "Men's clothing and accessories",
    subcategories: [
      { id: 1, name: "T-Shirts", slug: "t-shirts" },
      { id: 2, name: "Shirts", slug: "shirts" },
      { id: 3, name: "Pants", slug: "pants" },
      { id: 4, name: "Jackets", slug: "jackets" },
      { id: 5, name: "Accessories", slug: "accessories" }
    ]
  },
  { 
    id: 2, 
    name: "Women", 
    slug: "women",
    description: "Women's fashion and apparel",
    subcategories: [
      { id: 6, name: "Dresses", slug: "dresses" },
      { id: 7, name: "Tops", slug: "tops" },
      { id: 8, name: "Bottoms", slug: "bottoms" },
      { id: 9, name: "Outerwear", slug: "outerwear" },
      { id: 10, name: "Intimates", slug: "intimates" }
    ]
  },
  { 
    id: 3, 
    name: "Kids", 
    slug: "kids",
    description: "Children's clothing and accessories",
    subcategories: [
      { id: 11, name: "T-Shirts", slug: "t-shirts" },
      { id: 12, name: "Dresses", slug: "dresses" },
      { id: 13, name: "Pants", slug: "pants" },
      { id: 14, name: "Outerwear", slug: "outerwear" },
      { id: 15, name: "Sleepwear", slug: "sleepwear" }
    ]
  },
  { 
    id: 4, 
    name: "Accessories", 
    slug: "accessories",
    description: "Fashion accessories and lifestyle items",
    subcategories: [
      { id: 16, name: "Bags", slug: "bags" },
      { id: 17, name: "Jewelry", slug: "jewelry" },
      { id: 18, name: "Watches", slug: "watches" },
      { id: 19, name: "Belts", slug: "belts" },
      { id: 20, name: "Hats", slug: "hats" }
    ]
  },
];

// Sample colors with hex codes for admin color picker
export const colors = [
  { id: 1, name: "Black", hexCode: "#000000" },
  { id: 2, name: "White", hexCode: "#FFFFFF" },
  { id: 3, name: "Gray", hexCode: "#808080" },
  { id: 4, name: "Navy", hexCode: "#000080" },
  { id: 5, name: "Blue", hexCode: "#0066CC" },
  { id: 6, name: "Red", hexCode: "#FF0000" },
  { id: 7, name: "Pink", hexCode: "#FF69B4" },
  { id: 8, name: "Yellow", hexCode: "#FFD700" },
  { id: 9, name: "Green", hexCode: "#228B22" },
  { id: 10, name: "Brown", hexCode: "#8B4513" },
  { id: 11, name: "Tan", hexCode: "#D2B48C" },
  { id: 12, name: "Burgundy", hexCode: "#800020" },
  { id: 13, name: "Rainbow", hexCode: "#FF6B6B" }, // Multi-color represented as coral
];

// Sample sizes for different categories
export const sizes = {
  clothing: ["XS", "S", "M", "L", "XL", "XXL"],
  kids: ["2T", "3T", "4T", "XS", "S", "M", "L"],
  shoes: ["6", "6.5", "7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11", "11.5", "12"],
  accessories: ["One Size"],
};

// Product status options for admin
export const productStatuses = [
  { value: "IN_STOCK", label: "In Stock", color: "green" },
  { value: "LOW_STOCK", label: "Low Stock", color: "yellow" },
  { value: "OUT_OF_STOCK", label: "Out of Stock", color: "red" },
  { value: "DISCONTINUED", label: "Discontinued", color: "gray" },
];

// Admin helper function to get total stock for a product
export const getTotalStock = (product) => {
  if (!product.variants || product.variants.length === 0) return 0;
  return product.variants.reduce((total, variant) => total + variant.stock, 0);
};

// Admin helper function to get low stock variants
export const getLowStockVariants = (product, threshold = 5) => {
  if (!product.variants) return [];
  return product.variants.filter(variant => variant.stock <= threshold && variant.stock > 0);
};

// Admin helper function to get out of stock variants
export const getOutOfStockVariants = (product) => {
  if (!product.variants) return [];
  return product.variants.filter(variant => variant.stock === 0);
};