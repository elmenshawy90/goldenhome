// Seed data — used for file-DB fallback AND prisma seed.
// Images: Unsplash furniture photos (replaceable from Admin later).

export type SeedCategory = {
  id: string;
  name: string;
  slug: string;
  description: string;
  coverImage: string;
  sortOrder: number;
};

export type SeedProduct = {
  id: string;
  name: string;
  slug: string;
  categorySlug: string;
  description: string;
  price: number;
  oldPrice?: number;
  isOnSale: boolean;
  size: string;
  color: string;
  material: string;
  specifications: string;
  availability: "IN_STOCK" | "OUT_OF_STOCK" | "PREORDER";
  isFeatured: boolean;
  isNew: boolean;
  images: string[];
};

export const seedCategories: SeedCategory[] = [
  {
    id: "cat-bedrooms",
    name: "غرف النوم",
    slug: "bedrooms",
    description: "غرف نوم مودرن وكلاسيك بخشب طبيعي وتشطيب فاخر.",
    coverImage:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200&q=80&auto=format&fit=crop",
    sortOrder: 1,
  },
  {
    id: "cat-kids",
    name: "غرف الأطفال",
    slug: "kids-rooms",
    description: "غرف أطفال عملية ومرحة بسراير دورين ومكاتب.",
    coverImage:
      "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=1200&q=80&auto=format&fit=crop",
    sortOrder: 2,
  },
  {
    id: "cat-corners",
    name: "الركن",
    slug: "corners",
    description: "ركن مودرن مريحة بمساحات متعددة وخامات متينة.",
    coverImage:
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200&q=80&auto=format&fit=crop",
    sortOrder: 3,
  },
  {
    id: "cat-living",
    name: "الانتريهات",
    slug: "living-rooms",
    description: "انتريهات وصالونات فاخرة للضيوف والمعيشة.",
    coverImage:
      "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=1200&q=80&auto=format&fit=crop",
    sortOrder: 4,
  },
  {
    id: "cat-mattress",
    name: "المراتب",
    slug: "mattresses",
    description: "مراتب طبية وسوست منفصلة براحة مضمونة.",
    coverImage:
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80&auto=format&fit=crop",
    sortOrder: 5,
  },
];

const U = (id: string) => `https://images.unsplash.com/${id}?w=1000&q=80&auto=format&fit=crop`;

export const seedProducts: SeedProduct[] = [
  {
    id: "p-bedroom-1",
    name: "غرفة نوم مودرن — بيج فاخر",
    slug: "bedroom-modern-beige",
    categorySlug: "bedrooms",
    description:
      "غرفة نوم مودرن كاملة: سرير 160سم + 2 كومود + دولاب 200سم + تسريحة. خشب زان وكونتر بتشطيب دوكو فرن، مع إضاءة مخفية وتنجيد كابوتنيه.",
    price: 29999,
    oldPrice: 35000,
    isOnSale: true,
    size: "سرير 160×200 — دولاب 200×220",
    color: "بيج / بني",
    material: "خشب زان + كونتر + قماش قطيفة",
    specifications: "ضمان 5 سنوات • إمكانية تغيير المقاس واللون • توصيل وتركيب مجاني داخل القاهرة",
    availability: "IN_STOCK",
    isFeatured: true,
    isNew: false,
    images: [U("photo-1505693416388-ac5ce068fe85"), U("photo-1616594039964-ae9021a400a0"), U("photo-1617325247661-675ab4b64ae2")],
  },
  {
    id: "p-bedroom-2",
    name: "غرفة نوم كلاسيك — بني ملكي",
    slug: "bedroom-classic-brown",
    categorySlug: "bedrooms",
    description: "غرفة نوم كلاسيك فاخرة بتفاصيل أويما يدوية وقماش شانيل مستورد.",
    price: 42000,
    isOnSale: false,
    size: "سرير 180×200",
    color: "بني غامق / ذهبي",
    material: "خشب زان روماني",
    specifications: "دهان بوليستر • مفصلات سوفت كلوز • ضمان 5 سنوات",
    availability: "IN_STOCK",
    isFeatured: true,
    isNew: true,
    images: [U("photo-1595526114035-0d45ed16cfbf"), U("photo-1616594039964-ae9021a400a0")],
  },
  {
    id: "p-kids-1",
    name: "غرفة أطفال — سرير دورين + مكتب",
    slug: "kids-bunk-desk",
    categorySlug: "kids-rooms",
    description: "غرفة أطفال عملية بسرير دورين ومكتب مذاكرة ودولاب، ألوان مرحة وآمنة للأطفال.",
    price: 18500,
    oldPrice: 22000,
    isOnSale: true,
    size: "سرير 120×200 دورين",
    color: "أبيض / رمادي / أزرق",
    material: "كونتر + MDF",
    specifications: "دهانات آمنة • حواف دائرية • ضمان 3 سنوات",
    availability: "IN_STOCK",
    isFeatured: true,
    isNew: false,
    images: [U("photo-1560185127-6ed189bf02f4"), U("photo-1598928506311-c55ded91a20c")],
  },
  {
    id: "p-corner-1",
    name: "ركنة مودرن حرف L — رمادي",
    slug: "corner-l-grey",
    categorySlug: "corners",
    description: "ركنة حرف L بمساحة كبيرة، سفنج كثافة عالية وقماش مقاوم للبقع، مع سحارة تخزين.",
    price: 14999,
    oldPrice: 17999,
    isOnSale: true,
    size: "280×180 سم",
    color: "رمادي / بيج",
    material: "خشب زان + سفنج 33 + قماش جاكار",
    specifications: "سحارة تخزين • كنبة تفتح سرير • ضمان 3 سنوات",
    availability: "IN_STOCK",
    isFeatured: true,
    isNew: true,
    images: [U("photo-1555041469-a586c61ea9bc"), U("photo-1493663284031-b7e3aefcae8e")],
  },
  {
    id: "p-living-1",
    name: "انتريه مودرن — 2 كنبة + 2 فوتيه",
    slug: "living-modern-set",
    categorySlug: "living-rooms",
    description: "انتريه مودرن أنيق: كنبة 3 مقاعد + كنبة مقعدين + 2 فوتيه + ترابيزة.",
    price: 26000,
    isOnSale: false,
    size: "كنبة 220سم + 180سم",
    color: "كافيه / زيتي",
    material: "زان + قطيفة مستوردة",
    specifications: "شلت فايبر وسفنج • أرجل خشب زان • ضمان 3 سنوات",
    availability: "IN_STOCK",
    isFeatured: true,
    isNew: false,
    images: [U("photo-1493663284031-b7e3aefcae8e"), U("photo-1555041469-a586c61ea9bc")],
  },
  {
    id: "p-mattress-1",
    name: "مرتبة سوست منفصلة — 160سم طبية",
    slug: "mattress-pocket-160",
    categorySlug: "mattresses",
    description: "مرتبة سوست منفصلة بارتفاع 25سم، طبقة ميموري فوم وقماش قطن معالج ضد البكتيريا.",
    price: 8999,
    oldPrice: 10999,
    isOnSale: true,
    size: "160×200×25",
    color: "أبيض",
    material: "سوست منفصلة + ميموري فوم",
    specifications: "ضمان 10 سنوات • وجه صيفي/شتوي • توصيل مجاني",
    availability: "IN_STOCK",
    isFeatured: true,
    isNew: false,
    images: [U("photo-1631049307264-da0ec9d70304"), U("photo-1631049552057-403cdb8f0658")],
  },
  {
    id: "p-mattress-2",
    name: "مرتبة أطفال طبية — 120سم",
    slug: "mattress-kids-120",
    categorySlug: "mattresses",
    description: "مرتبة أطفال طبية مضغوطة بارتفاع 20سم، دعم مثالي للعمود الفقري.",
    price: 4200,
    isOnSale: false,
    size: "120×200×20",
    color: "أبيض",
    material: "فوم طبي عالي الكثافة",
    specifications: "ضمان 5 سنوات • غطاء قابل للفك والغسيل",
    availability: "PREORDER",
    isFeatured: false,
    isNew: true,
    images: [U("photo-1631049552057-403cdb8f0658")],
  },
  {
    id: "p-bedroom-3",
    name: "غرفة نوم شبابي — أبيض × خشبي",
    slug: "bedroom-youth-white",
    categorySlug: "bedrooms",
    description: "غرفة نوم شبابي عصرية بسرير 150 ودولاب جرار موفر للمساحة.",
    price: 24000,
    isOnSale: false,
    size: "سرير 150×200",
    color: "أبيض / خشبي",
    material: "MDF إسباني",
    specifications: "دولاب جرار • إضاءة LED • ضمان 3 سنوات",
    availability: "OUT_OF_STOCK",
    isFeatured: false,
    isNew: false,
    images: [U("photo-1617325247661-675ab4b64ae2")],
  },
];
