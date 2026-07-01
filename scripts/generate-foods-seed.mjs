import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '../src/data/seeds/foods.json');
const PUBLIC_OUT = join(__dirname, '../public/data/foods.json');

const now = new Date().toISOString();

function n(cal, p, c, f, fib = 0, sug = 0, sod = 0) {
  return { calories: cal, protein: p, carbs: c, fat: f, fiber: fib, sugar: sug, sodium: sod };
}

function units(grams, extra = []) {
  const base = [
    { unit: 'g', grams: 1 },
    { unit: 'katori', grams: 150 },
    { unit: 'bowl', grams: 180 },
  ];
  return [...base, ...extra];
}

function liquidUnits(ml, extra = []) {
  return [
    { unit: 'ml', grams: 1 },
    { unit: 'glass', grams: 250 },
    { unit: 'cup', grams: 240 },
    ...extra,
  ];
}

function fruitUnits(pieceGrams, extra = []) {
  return [{ unit: 'g', grams: 1 }, { unit: 'piece', grams: pieceGrams }, ...extra];
}

function dedupeUnits(unitList) {
  const seen = new Map();
  for (const item of unitList) {
    if (!seen.has(item.unit)) {
      seen.set(item.unit, item);
    }
  }
  return Array.from(seen.values());
}

function food(id, name, category, nutrition, opts = {}) {
  const aliases = opts.aliases ?? [];
  const tags = opts.tags ?? [];
  const baseUnit = opts.baseUnit ?? 'g';
  const rawUnits =
    opts.availableUnits ??
    (baseUnit === 'ml' ? liquidUnits(1, opts.extraUnits ?? []) : units(1, opts.extraUnits ?? []));
  const availableUnits = dedupeUnits(rawUnits);
  const defaultServing = opts.defaultServing ?? availableUnits[1] ?? availableUnits[0];
  const searchText = [name, ...aliases, ...tags, category, opts.subcategory].filter(Boolean).join(' ').toLowerCase();

  return {
    id,
    name,
    aliases,
    category,
    subcategory: opts.subcategory,
    brand: opts.brand,
    isVegetarian: opts.isVegetarian ?? true,
    isVegan: opts.isVegan ?? false,
    isCustom: false,
    isRecipe: false,
    baseUnit,
    defaultServing,
    availableUnits,
    nutritionPer100g: nutrition,
    image: opts.image,
    tags,
    isFavorite: false,
    searchText,
    createdAt: now,
    updatedAt: now,
  };
}

const foods = [];

// ── Rice (35) ──
const riceItems = [
  ['Cooked White Rice', ['Rice', 'Cooked Rice', 'Steamed Rice', 'Plain Rice'], n(130, 2.7, 28, 0.3, 0.4)],
  ['Basmati Rice (Cooked)', ['Basmati Rice', 'Basmati Chawal'], n(121, 2.6, 25, 0.4, 0.4)],
  ['Brown Rice (Cooked)', ['Brown Rice', 'Whole Grain Rice'], n(112, 2.6, 24, 0.9, 1.8)],
  ['Red Rice (Cooked)', ['Kerala Red Rice', 'Matta Rice'], n(109, 2.5, 23, 0.8, 1.6)],
  ['Jeera Rice', ['Cumin Rice'], n(145, 2.8, 27, 2.5, 0.5)],
  ['Lemon Rice', ['Chitranna', 'Nimmakaya Annam'], n(155, 2.9, 28, 3.2, 0.6)],
  ['Curd Rice', ['Thayir Sadam', 'Dahi Chawal'], n(118, 3.2, 20, 2.8, 0.3)],
  ['Tomato Rice', ['Tomato Bath'], n(142, 2.8, 26, 2.9, 0.8)],
  ['Coconut Rice', ['Thengai Sadam'], n(168, 2.7, 26, 5.8, 0.9)],
  ['Vegetable Fried Rice', ['Veg Fried Rice'], n(168, 3.5, 28, 4.8, 1.2)],
  ['Chicken Fried Rice', ['Murgh Fried Rice'], n(185, 8.5, 26, 5.5, 0.8)],
  ['Egg Fried Rice', ['Anda Fried Rice'], n(175, 6.8, 27, 5.2, 0.7)],
  ['Pulao (Vegetable)', ['Veg Pulao', 'Pulav'], n(148, 3.2, 25, 3.8, 1.0)],
  ['Peas Pulao', ['Matar Pulao'], n(152, 4.5, 27, 3.2, 1.5)],
  ['Biryani Rice (Plain)', ['Biryani Chawal'], n(162, 3.5, 28, 4.2, 0.6)],
  ['Chicken Biryani', ['Hyderabadi Chicken Biryani', 'Murgh Biryani'], n(195, 10.5, 24, 7.2, 0.8)],
  ['Mutton Biryani', ['Gosht Biryani'], n(210, 11.8, 23, 8.5, 0.7)],
  ['Egg Biryani', ['Anda Biryani'], n(178, 8.2, 25, 6.0, 0.6)],
  ['Vegetable Biryani', ['Veg Biryani'], n(158, 3.8, 27, 4.0, 1.2)],
  ['Khichdi (Moong)', ['Khichri', 'Moong Dal Khichdi'], n(115, 4.2, 18, 2.5, 1.8)],
  ['Pongal (Ven Pongal)', ['Ven Pongal', 'Khara Pongal'], n(142, 4.5, 22, 3.8, 0.8)],
  ['Sweet Pongal', ['Sakkarai Pongal', 'Chakkara Pongal'], n(185, 3.2, 35, 4.5, 0.5)],
  ['Bisi Bele Bath', ['Bisi Bele Huliyanna'], n(128, 3.8, 20, 3.5, 1.5)],
  ['Tamarind Rice', ['Puliyodharai', 'Puli Sadam'], n(152, 2.8, 28, 3.5, 0.7)],
  ['Soya Rice', ['Soya Chunk Rice'], n(155, 8.5, 24, 3.2, 2.0)],
  ['Saffron Rice', ['Kesar Chawal', 'Zaffrani Rice'], n(135, 2.7, 27, 1.5, 0.4)],
  ['Ghee Rice', ['Nei Choru'], n(175, 2.8, 26, 6.5, 0.3)],
  ['Sambar Rice', ['Sambar Sadam'], n(125, 3.8, 22, 2.2, 1.2)],
  ['Rice Flakes (Dry)', ['Poha Raw', 'Aval'], n(394, 7.0, 87, 1.5, 2.0)],
  ['Poha (Cooked)', ['Flattened Rice Cooked', 'Avalakki'], n(110, 2.2, 23, 0.8, 0.5)],
  ['Puffed Rice', ['Murmura', 'Kurmura', 'Mamra'], n(402, 6.5, 89, 0.5, 1.0)],
  ['Flattened Rice (Thick)', ['Thick Poha'], n(380, 6.8, 85, 1.2, 1.8)],
  ['Bamboo Rice', ['Mulayari'], n(356, 7.2, 78, 2.0, 2.5)],
  ['Black Rice (Cooked)', ['Forbidden Rice'], n(143, 3.2, 30, 1.2, 1.5)],
  ['Sona Masoori (Cooked)', ['Sona Masuri Rice'], n(128, 2.5, 28, 0.3, 0.4)],
];

riceItems.forEach(([name, aliases, nutrition], i) => {
  foods.push(food(`food-rice-${i + 1}`, name, 'Rice', nutrition, { aliases, subcategory: 'Rice', availableUnits: units(1, [{ unit: 'bowl', grams: 180 }, { unit: 'katori', grams: 150 }]) }));
});

// ── Dal & Legumes (35) ──
const dalItems = [
  ['Toor Dal (Cooked)', ['Arhar Dal', 'Tuvar Dal', 'Pigeon Pea Dal'], n(118, 7.5, 18, 1.5, 3.5)],
  ['Moong Dal (Cooked)', ['Mung Dal', 'Green Gram Dal'], n(105, 7.0, 16, 0.8, 3.0)],
  ['Masoor Dal (Cooked)', ['Red Lentil Dal'], n(116, 9.0, 20, 0.4, 2.8)],
  ['Chana Dal (Cooked)', ['Bengal Gram Dal', 'Split Chickpea Dal'], n(125, 8.5, 18, 2.5, 4.0)],
  ['Urad Dal (Cooked)', ['Black Gram Dal', 'Ulundu'], n(130, 8.8, 17, 2.8, 3.5)],
  ['Rajma (Cooked)', ['Kidney Beans', 'Red Kidney Beans'], n(127, 8.7, 22, 0.5, 6.4)],
  ['Chole (Cooked)', ['Chickpeas', 'Kabuli Chana', 'Garbanzo Beans'], n(164, 8.9, 27, 2.6, 7.6)],
  ['Black Chana (Cooked)', ['Kala Chana', 'Black Chickpea'], n(155, 8.5, 25, 2.2, 7.0)],
  ['Lobia (Cooked)', ['Black Eyed Peas', 'Cowpea'], n(116, 7.8, 20, 0.6, 5.5)],
  ['Moth Dal (Cooked)', ['Matki', 'Moth Beans'], n(120, 8.2, 19, 1.0, 4.5)],
  ['Horsegram (Cooked)', ['Kulthi', 'Kollu'], n(105, 8.0, 15, 0.5, 3.8)],
  ['Dal Fry', ['Fried Dal', 'Tadka Dal'], n(135, 7.8, 16, 5.5, 3.2)],
  ['Dal Makhani', ['Maa Ki Dal', 'Butter Dal'], n(155, 7.5, 14, 8.5, 3.0)],
  ['Sambar', ['Sambhar', 'South Indian Sambar'], n(85, 3.5, 12, 2.5, 2.5)],
  ['Rasam', ['Saaru', 'Charu'], n(45, 1.5, 7, 1.2, 0.8)],
  ['Dal Tadka', ['Yellow Dal Tadka'], n(128, 7.2, 17, 4.8, 3.0)],
  ['Panchmel Dal', ['Mixed Dal', 'Panchratna Dal'], n(122, 8.0, 17, 2.5, 4.0)],
  ['Sprouted Moong', ['Moong Sprouts', 'Ankurit Moong'], n(30, 3.0, 5.5, 0.2, 1.5)],
  ['Sprouted Chana', ['Chana Sprouts'], n(35, 3.5, 5.0, 0.3, 2.0)],
  ['Green Peas (Cooked)', ['Matar', 'Green Peas'], n(84, 5.5, 15, 0.2, 4.5)],
  ['Soya Chunks (Cooked)', ['Nutri Nuggets', 'Meal Maker'], n(120, 15.0, 8.0, 2.5, 4.0)],
  ['Soya Granules', ['Soya Keema'], n(130, 16.0, 7.0, 3.0, 4.5)],
  ['Hummus', ['Chickpea Dip'], n(166, 7.9, 14, 9.6, 6.0)],
  ['Dal Palak', ['Spinach Dal'], n(110, 6.5, 14, 3.5, 2.8)],
  ['Dal Amritsari', ['Amritsari Dal'], n(140, 7.5, 15, 6.5, 3.0)],
  ['Whole Moong (Cooked)', ['Green Moong Whole', 'Sabut Moong'], n(105, 7.2, 16, 0.8, 4.0)],
  ['Whole Urad (Cooked)', ['Sabut Urad', 'Black Gram Whole'], n(125, 8.5, 17, 2.5, 4.5)],
  ['Val Dal (Cooked)', ['Field Bean Dal'], n(115, 7.8, 18, 1.0, 4.0)],
  ['Mixed Beans (Cooked)', ['Bean Salad Mix'], n(120, 8.0, 19, 1.2, 5.0)],
  ['Chickpea Flour (Besan) Cooked', ['Besan Curry'], n(145, 8.5, 15, 6.0, 3.5)],
  ['Dal Dhokli', ['Gujarati Dal Dhokli'], n(135, 5.5, 20, 3.8, 1.5)],
  ['Paruppu Usili', ['Dal Crumble'], n(155, 9.5, 16, 6.0, 3.5)],
  ['Kadhi (Besan)', ['Punjabi Kadhi', 'Gujarati Kadhi'], n(95, 3.5, 10, 4.5, 0.8)],
  ['Dal Baati', ['Rajasthani Dal'], n(130, 7.0, 16, 5.5, 3.0)],
  ['Misal (Usal)', ['Maharashtrian Misal'], n(145, 7.5, 15, 6.5, 3.5)],
];

dalItems.forEach(([name, aliases, nutrition], i) => {
  foods.push(food(`food-dal-${i + 1}`, name, 'Dal & Legumes', nutrition, { aliases, availableUnits: units(1, [{ unit: 'katori', grams: 150 }, { unit: 'bowl', grams: 200 }]) }));
});

function bulk(cat, prefix, items, opts = {}) {
  items.forEach(([name, aliases, nutrition, extra], i) => {
    foods.push(food(`food-${prefix}-${i + 1}`, name, cat, nutrition, { aliases, ...opts, ...extra }));
  });
}

// Breads & Roti (30)
bulk('Breads & Roti', 'bread', [
  ['Chapati (Whole Wheat)', ['Roti', 'Phulka', 'Tawa Roti'], n(297, 9.0, 58, 2.5, 8.0), { availableUnits: [{ unit: 'g', grams: 1 }, { unit: 'chapati', grams: 40 }, { unit: 'roti', grams: 40 }, { unit: 'piece', grams: 40 }] }],
  ['Tandoori Roti', ['Naan Roti', 'Tandoor Roti'], n(310, 9.5, 55, 4.0, 7.0), { availableUnits: [{ unit: 'g', grams: 1 }, { unit: 'roti', grams: 50 }] }],
  ['Naan (Plain)', ['Butter Naan', 'Plain Naan'], n(310, 8.5, 52, 6.5, 2.5)],
  ['Garlic Naan', ['Lahsun Naan'], n(325, 8.8, 50, 8.0, 2.5)],
  ['Paratha (Plain)', ['Plain Paratha'], n(326, 7.5, 42, 14.0, 2.5), { availableUnits: [{ unit: 'g', grams: 1 }, { unit: 'piece', grams: 80 }] }],
  ['Aloo Paratha', ['Potato Paratha'], n(340, 7.0, 45, 15.0, 3.0)],
  ['Gobi Paratha', ['Cauliflower Paratha'], n(320, 7.5, 42, 13.0, 3.5)],
  ['Paneer Paratha', ['Cottage Cheese Paratha'], n(350, 11.0, 38, 16.0, 2.5)],
  ['Methi Paratha', ['Fenugreek Paratha'], n(310, 8.0, 40, 13.0, 4.0)],
  ['Lachha Paratha', ['Layered Paratha'], n(355, 7.0, 40, 18.0, 2.0)],
  ['Puri', ['Poori', 'Deep Fried Puri'], n(350, 7.5, 42, 16.0, 2.0), { availableUnits: [{ unit: 'g', grams: 1 }, { unit: 'piece', grams: 30 }] }],
  ['Bhatura', ['Chole Bhature Bhatura'], n(380, 8.0, 45, 18.0, 2.0)],
  ['Kulcha', ['Amritsari Kulcha'], n(330, 9.0, 48, 12.0, 2.5)],
  ['Missi Roti', ['Besan Roti'], n(305, 10.0, 42, 10.0, 5.0)],
  ['Thepla', ['Gujarati Thepla', 'Methi Thepla'], n(295, 8.5, 38, 12.0, 3.5)],
  ['Bhakri', ['Jowar Bhakri', 'Bajra Bhakri'], n(280, 7.5, 48, 6.0, 5.5)],
  ['Appam', ['Palappam', 'Kerala Appam'], n(165, 3.5, 32, 2.0, 0.8), { availableUnits: [{ unit: 'g', grams: 1 }, { unit: 'piece', grams: 60 }] }],
  ['Dosa (Plain)', ['Sada Dosa', 'Plain Dosa'], n(168, 4.0, 28, 4.0, 0.8), { availableUnits: [{ unit: 'g', grams: 1 }, { unit: 'piece', grams: 120 }] }],
  ['Masala Dosa', ['Mysore Masala Dosa'], n(185, 5.5, 28, 5.5, 1.2)],
  ['Rava Dosa', ['Semolina Dosa', 'Sooji Dosa'], n(175, 4.5, 30, 4.5, 0.6)],
  ['Uttapam', ['Oothapam'], n(155, 4.5, 26, 3.5, 1.0), { availableUnits: [{ unit: 'g', grams: 1 }, { unit: 'piece', grams: 150 }] }],
  ['Idli', ['Plain Idli'], n(155, 4.5, 30, 1.0, 0.5), { availableUnits: [{ unit: 'g', grams: 1 }, { unit: 'piece', grams: 40 }] }],
  ['Rava Idli', ['Semolina Idli'], n(160, 4.8, 31, 1.2, 0.6)],
  ['Medu Vada', ['Uddina Vada', 'Dal Vada'], n(290, 8.5, 28, 15.0, 2.0), { availableUnits: [{ unit: 'g', grams: 1 }, { unit: 'piece', grams: 50 }] }],
  ['Pesarattu', ['Moong Dal Dosa'], n(145, 6.5, 22, 3.0, 2.5)],
  ['Set Dosa', ['Sponge Dosa'], n(160, 4.2, 29, 3.0, 0.8)],
  ['Neer Dosa', ['Water Dosa'], n(140, 2.5, 28, 1.5, 0.3)],
  ['Roomali Roti', ['Rumali Roti'], n(280, 8.0, 50, 4.0, 2.0)],
  ['Tandoori Naan', ['Tandoor Naan'], n(315, 8.5, 52, 6.0, 2.5)],
  ['Stuffed Paratha (Mixed)', ['Mixed Stuffed Paratha'], n(335, 8.5, 42, 14.5, 3.0)],
]);

// Flour & Grains (25)
bulk('Flour & Grains', 'grain', [
  ['Wheat Flour (Atta)', ['Atta', 'Whole Wheat Flour'], n(340, 13.0, 72, 2.5, 11.0)],
  ['Maida (Refined Flour)', ['All Purpose Flour', 'Refined Wheat Flour'], n(364, 10.0, 76, 1.0, 2.7)],
  ['Besan (Gram Flour)', ['Chickpea Flour', 'Gram Flour'], n(387, 22.0, 58, 7.0, 11.0)],
  ['Rice Flour', ['Chawal Ka Atta'], n(366, 6.0, 80, 1.4, 2.4)],
  ['Rava (Semolina)', ['Sooji', 'Semolina'], n(360, 12.0, 73, 1.5, 3.5)],
  ['Jowar Flour', ['Sorghum Flour'], n(349, 10.0, 72, 3.3, 6.7)],
  ['Bajra Flour', ['Pearl Millet Flour'], n(361, 11.0, 67, 5.0, 8.0)],
  ['Ragi Flour', ['Finger Millet Flour', 'Nachni'], n(328, 7.3, 72, 1.3, 3.6)],
  ['Oats (Rolled)', ['Oatmeal', 'Oats'], n(389, 17.0, 66, 7.0, 10.0)],
  ['Quinoa (Cooked)', ['Quinoa'], n(120, 4.4, 21, 1.9, 2.8)],
  ['Barley (Cooked)', ['Jau', 'Barley'], n(123, 2.3, 28, 0.4, 3.8)],
  ['Corn Flour', ['Makki Ka Atta'], n(361, 6.9, 76, 3.9, 7.3)],
  ['Sattu', ['Roasted Gram Flour'], n(375, 20.0, 58, 6.0, 10.0)],
  ['Poha (Thick Raw)', ['Thick Aval'], n(380, 6.8, 85, 1.2, 1.8)],
  ['Vermicelli (Raw)', ['Seviyan', 'Semiya'], n(371, 12.0, 75, 1.5, 2.5)],
  ['Broken Wheat (Dalia)', ['Dalia', 'Cracked Wheat'], n(342, 12.0, 72, 1.5, 10.0)],
  ['Buckwheat Flour', ['Kuttu Ka Atta'], n(343, 13.0, 71, 3.4, 10.0)],
  ['Amaranth Flour', ['Rajgira Atta'], n(371, 14.0, 65, 7.0, 7.0)],
  ['Multigrain Flour', ['Multigrain Atta'], n(345, 12.5, 68, 3.5, 9.0)],
  ['Couscous (Cooked)', ['Couscous'], n(112, 3.8, 23, 0.2, 1.4)],
  ['Millets (Cooked Mix)', ['Mixed Millets'], n(119, 3.5, 23, 1.0, 2.5)],
  ['Foxtail Millet (Cooked)', ['Kangni', 'Thinai'], n(115, 3.0, 23, 1.0, 2.0)],
  ['Barnyard Millet (Cooked)', ['Sanwa', 'Vrat Ke Chawal'], n(118, 3.2, 24, 0.8, 2.2)],
  ['Kodo Millet (Cooked)', ['Kodra'], n(116, 3.0, 23, 1.0, 2.0)],
  ['Little Millet (Cooked)', ['Kutki', 'Samai'], n(114, 3.0, 23, 0.9, 2.0)],
]);

// South Indian (40)
bulk('South Indian', 'south', [
  ['Masala Dosa with Sambar', ['South Indian Breakfast'], n(195, 6.5, 30, 5.8, 1.5)],
  ['Rava Upma', ['Upma', 'Sooji Upma'], n(145, 4.0, 22, 4.5, 1.2)],
  ['Vegetable Upma', ['Veg Upma'], n(140, 3.8, 21, 4.2, 1.8)],
  ['Pongal with Ghee', ['Ghee Pongal'], n(155, 4.8, 23, 5.0, 0.8)],
  ['Coconut Chutney', ['Nariyal Chutney', 'Thengai Chutney'], n(180, 2.0, 6, 16, 2.5)],
  ['Tomato Chutney', ['Tamatar Chutney'], n(95, 1.5, 8, 6.5, 1.0)],
  ['Mint Chutney', ['Pudina Chutney'], n(75, 1.8, 6, 5.0, 1.5)],
  ['Coriander Chutney', ['Dhaniya Chutney'], n(70, 1.5, 5, 4.8, 1.2)],
  ['Gunpowder (Podi)', ['Milagai Podi', 'Idli Podi'], n(420, 12.0, 45, 20, 8.0)],
  ['Avial', ['Aviyal', 'Kerala Avial'], n(95, 2.5, 8, 6.0, 2.5)],
  ['Kootu', ['Vegetable Kootu'], n(85, 3.5, 10, 3.5, 2.0)],
  ['Poriyal', ['Vegetable Poriyal', 'Thoran'], n(75, 2.0, 8, 4.0, 2.5)],
  ['Rasam Rice', ['Saaru Annam'], n(115, 3.0, 20, 2.0, 0.8)],
  ['Curd Rice with Tempering', ['Seasoned Curd Rice'], n(125, 3.5, 21, 3.2, 0.3)],
  ['Lemon Rice with Peanuts', ['Peanut Lemon Rice'], n(165, 4.5, 27, 5.0, 0.8)],
  ['Tamarind Rice with Peanuts', ['Pulihora'], n(158, 3.5, 28, 4.0, 0.7)],
  ['Coconut Rice with Nuts', ['Thengai Sadam with Nuts'], n(175, 3.5, 26, 6.5, 1.0)],
  ['Paniyaram', ['Kuzhi Paniyaram', 'Appe'], n(195, 5.5, 28, 6.5, 0.8), { availableUnits: [{ unit: 'g', grams: 1 }, { unit: 'piece', grams: 25 }] }],
  ['Adai', ['Adai Dosa'], n(175, 7.5, 25, 4.5, 3.0)],
  ['Puttu', ['Kerala Puttu'], n(195, 4.5, 35, 4.0, 1.5)],
  ['Idiyappam', ['String Hoppers', 'Nool Puttu'], n(155, 3.0, 32, 1.5, 0.5)],
  ['Kappa (Tapioca)', ['Tapioca Boiled', 'Maracheeni'], n(112, 0.8, 27, 0.1, 1.0)],
  ['Fish Curry (Kerala)', ['Meen Curry'], n(145, 12.0, 5, 8.5, 0.5), { isVegetarian: false }],
  ['Chicken Chettinad', ['Chettinad Chicken'], n(195, 18.0, 4, 12.0, 0.5), { isVegetarian: false }],
  ['Hyderabadi Veg Biryani', ['Veg Dum Biryani'], n(165, 4.0, 26, 5.0, 1.5)],
  ['Tomato Bath', ['Tomato Rice Bath'], n(145, 2.8, 26, 3.0, 0.8)],
  ['Bisi Bele Bath with Ghee', ['Bisi Bele Bath'], n(135, 4.0, 21, 4.0, 1.5)],
  ['Mysore Pak', ['Mysorepa'], n(480, 4.0, 55, 26, 0.5)],
  ['Payasam (Rice)', ['Kheer South Style', 'Pal Payasam'], n(165, 3.5, 28, 4.5, 0.3)],
  ['Kesari Bath', ['Sheera', 'Sooji Halwa'], n(285, 4.0, 42, 11, 0.5)],
  ['Filter Coffee', ['South Indian Coffee', 'Kaapi'], n(35, 1.5, 4, 1.5, 0, 5), { baseUnit: 'ml', availableUnits: liquidUnits(1), isVegan: true }],
  ['Mor Kuzhambu', ['Buttermilk Curry'], n(65, 2.5, 5, 3.5, 0.3), { baseUnit: 'ml' }],
  ['Vatha Kuzhambu', ['Tamarind Curry'], n(95, 2.0, 10, 5.5, 1.0)],
  ['Sambar with Vegetables', ['Mixed Veg Sambar'], n(90, 3.8, 13, 2.8, 2.5)],
  ['Rasam with Dal', ['Dal Rasam', 'Paruppu Rasam'], n(55, 2.5, 8, 1.5, 0.8)],
  ['Curry Leaves Rice', ['Karuveppilai Sadam'], n(150, 2.8, 27, 3.5, 0.6)],
  ['Mango Rice', ['Mangai Sadam', 'Mamidikaya Pulihora'], n(155, 2.5, 28, 3.8, 0.8)],
  ['Capsicum Rice', ['Bell Pepper Rice'], n(140, 2.8, 25, 3.2, 1.0)],
  ['Brinjal Rice', ['Vangi Bath', 'Kathirikai Sadam'], n(145, 2.5, 26, 3.5, 1.2)],
  ['Coconut Stew (Vegetable)', ['Ishtu', 'Vegetable Stew'], n(95, 2.0, 8, 6.5, 1.5)],
]);

// North Indian (40)
bulk('North Indian', 'north', [
  ['Paneer Butter Masala', ['Butter Paneer', 'Paneer Makhani'], n(175, 9.0, 8, 13, 0.5)],
  ['Palak Paneer', ['Saag Paneer', 'Spinach Paneer'], n(145, 8.5, 6, 10, 2.0)],
  ['Kadai Paneer', ['Karahi Paneer'], n(165, 9.5, 7, 12, 0.8)],
  ['Shahi Paneer', ['Royal Paneer'], n(185, 9.0, 8, 14, 0.5)],
  ['Paneer Tikka', ['Grilled Paneer Tikka'], n(195, 14.0, 5, 14, 0.5)],
  ['Chole Bhature', ['Chana Bhatura'], n(245, 7.5, 30, 10, 3.5)],
  ['Chole Kulche', ['Chana Kulcha'], n(220, 7.0, 28, 8.5, 3.0)],
  ['Aloo Gobi', ['Potato Cauliflower'], n(95, 2.5, 12, 4.5, 2.5)],
  ['Aloo Matar', ['Potato Peas Curry'], n(105, 3.0, 14, 4.0, 2.5)],
  ['Aloo Jeera', ['Jeera Aloo', 'Cumin Potatoes'], n(110, 2.5, 15, 5.0, 2.0)],
  ['Baingan Bharta', ['Brinjal Bharta', 'Eggplant Bharta'], n(85, 2.0, 8, 5.0, 3.0)],
  ['Bhindi Masala', ['Okra Masala', 'Lady Finger Curry'], n(90, 2.5, 8, 5.5, 3.0)],
  ['Mix Veg Curry', ['Mixed Vegetable Curry'], n(85, 2.8, 10, 4.0, 2.5)],
  ['Malai Kofta', ['Cream Kofta'], n(195, 6.5, 12, 14, 1.0)],
  ['Navratan Korma', ['Navratna Korma'], n(155, 4.5, 12, 10, 1.5)],
  ['Dum Aloo', ['Kashmiri Dum Aloo'], n(125, 2.5, 12, 7.5, 1.5)],
  ['Rajma Chawal', ['Rajma Rice'], n(145, 7.5, 20, 3.5, 4.0)],
  ['Kadhi Chawal', ['Kadhi Rice'], n(115, 4.0, 15, 4.0, 0.8)],
  ['Butter Chicken', ['Murgh Makhani'], n(195, 15.0, 6, 13, 0.3), { isVegetarian: false }],
  ['Chicken Tikka Masala', ['Tikka Masala'], n(185, 16.0, 7, 11, 0.5), { isVegetarian: false }],
  ['Tandoori Chicken', ['Tandoori Murgh'], n(175, 22.0, 2, 9, 0, 0, 400), { isVegetarian: false }],
  ['Chicken Curry (Home Style)', ['Murgh Curry', 'Chicken Gravy'], n(165, 16.0, 5, 9, 0.3), { isVegetarian: false }],
  ['Mutton Curry', ['Gosht Curry', 'Lamb Curry'], n(195, 17.0, 4, 13, 0, 0, 350), { isVegetarian: false }],
  ['Keema (Mutton)', ['Mutton Keema', 'Qeema'], n(210, 18.0, 3, 14, 0, 0, 380), { isVegetarian: false }],
  ['Egg Curry', ['Anda Curry', 'Egg Masala'], n(155, 10.0, 5, 11, 0.3), { isVegetarian: false }],
  ['Boondi Raita', ['Boondi Ka Raita'], n(95, 3.5, 8, 5.5, 0.3)],
  ['Cucumber Raita', ['Kheera Raita'], n(55, 2.5, 5, 2.5, 0.3)],
  ['Onion Salad', ['Kachumber', 'Laccha Pyaz'], n(35, 1.0, 7, 0.2, 1.5)],
  ['Green Salad', ['Mixed Salad'], n(25, 1.2, 4, 0.3, 1.8)],
  ['Papad (Roasted)', ['Papad', 'Papadum'], n(371, 22.0, 50, 4.0, 18, 0, 800), { availableUnits: [{ unit: 'g', grams: 1 }, { unit: 'piece', grams: 10 }] }],
  ['Pickle (Mango)', ['Aam Ka Achar', 'Mango Pickle'], n(145, 1.5, 8, 12, 2.0, 3, 1200)],
  ['Pickle (Mixed)', ['Mixed Indian Pickle'], n(130, 1.2, 7, 11, 1.5, 2, 1100)],
  ['Lassi (Sweet)', ['Meethi Lassi', 'Sweet Lassi'], n(85, 3.0, 12, 2.5, 0, 10), { baseUnit: 'ml', availableUnits: liquidUnits(1, [{ unit: 'glass', grams: 300 }]) }],
  ['Lassi (Salted)', ['Namkeen Lassi', 'Salted Buttermilk'], n(45, 2.5, 4, 1.5, 0, 2), { baseUnit: 'ml', availableUnits: liquidUnits(1) }],
  ['Chaas (Buttermilk)', ['Mattha', 'Chaach'], n(40, 2.0, 4, 1.2, 0, 3), { baseUnit: 'ml', availableUnits: liquidUnits(1) }],
  ['Stuffed Kulcha (Aloo)', ['Aloo Kulcha'], n(310, 8.0, 45, 11, 2.5)],
  ['Stuffed Kulcha (Paneer)', ['Paneer Kulcha'], n(325, 11.0, 42, 13, 2.0)],
  ['Makki Ki Roti', ['Corn Roti', 'Makki Roti'], n(295, 7.5, 48, 8.0, 5.0)],
  ['Sarson Ka Saag', ['Mustard Greens', 'Sarson Saag'], n(75, 4.5, 5, 4.5, 3.0)],
]);

console.log(`Generated ${foods.length} so far (batch 2)...`);

// Vegetables (100)
const vegNames = [
  ['Potato (Boiled)', ['Aloo', 'Alu', 'Potato'], n(87, 2.0, 20, 0.1, 1.8)],
  ['Sweet Potato (Boiled)', ['Shakarkandi', 'Sweet Potato'], n(86, 1.6, 20, 0.1, 3.0)],
  ['Onion (Raw)', ['Pyaz', 'Kanda'], n(40, 1.1, 9, 0.1, 1.7)],
  ['Tomato (Raw)', ['Tamatar'], n(18, 0.9, 3.9, 0.2, 1.2)],
  ['Carrot (Raw)', ['Gajar', 'Carrot'], n(41, 0.9, 10, 0.2, 2.8)],
  ['Cauliflower (Cooked)', ['Gobi', 'Phool Gobi'], n(25, 2.0, 4, 0.3, 2.0)],
  ['Cabbage (Raw)', ['Patta Gobi', 'Cabbage'], n(25, 1.3, 6, 0.1, 2.5)],
  ['Spinach (Cooked)', ['Palak', 'Saag'], n(23, 3.0, 3.5, 0.3, 2.4)],
  ['Fenugreek Leaves', ['Methi', 'Methi Leaves'], n(49, 4.4, 6, 0.9, 2.7)],
  ['Bottle Gourd (Cooked)', ['Lauki', 'Doodhi', 'Ghiya'], n(14, 0.6, 3.0, 0.1, 1.0)],
  ['Ridge Gourd (Cooked)', ['Turai', 'Jhinge', 'Peerkangai'], n(18, 0.8, 3.5, 0.1, 1.2)],
  ['Bitter Gourd (Cooked)', ['Karela', 'Pavakkai'], n(22, 1.0, 4.0, 0.2, 2.0)],
  ['Snake Gourd (Cooked)', ['Chichinda', 'Padavalanga'], n(17, 0.7, 3.2, 0.1, 1.0)],
  ['Ash Gourd (Cooked)', ['Petha', 'White Pumpkin'], n(13, 0.4, 3.0, 0.1, 0.8)],
  ['Pumpkin (Cooked)', ['Kaddu', 'Sitaphal Vegetable'], n(20, 0.7, 4.5, 0.1, 1.0)],
  ['Brinjal (Cooked)', ['Baingan', 'Eggplant', 'Kathirikai'], n(25, 0.8, 5.5, 0.2, 2.5)],
  ['Okra (Cooked)', ['Bhindi', 'Lady Finger', 'Vendakkai'], n(33, 2.0, 7, 0.2, 3.2)],
  ['Green Beans (Cooked)', ['French Beans', 'Beans'], n(35, 1.8, 7, 0.2, 2.7)],
  ['Cluster Beans', ['Gavar', 'Guar Phali'], n(32, 2.5, 6, 0.3, 2.5)],
  ['Drumstick (Cooked)', ['Moringa', 'Sahjan', 'Murungakkai'], n(37, 2.1, 8, 0.2, 3.2)],
  ['Capsicum (Raw)', ['Bell Pepper', 'Shimla Mirch'], n(31, 1.0, 6, 0.3, 2.1)],
  ['Green Chilli', ['Hari Mirch', 'Chilli'], n(40, 2.0, 8, 0.2, 1.5)],
  ['Cucumber (Raw)', ['Kheera', 'Kakdi'], n(15, 0.7, 3.6, 0.1, 0.5)],
  ['Beetroot (Cooked)', ['Chukandar', 'Beetroot'], n(44, 1.7, 10, 0.2, 2.0)],
  ['Radish (Raw)', ['Mooli', 'Radish'], n(16, 0.7, 3.4, 0.1, 1.6)],
  ['Turnip (Cooked)', ['Shalgam', 'Turnip'], n(28, 0.9, 6, 0.1, 1.8)],
  ['Colocasia (Cooked)', ['Arbi', 'Taro Root', 'Seppankizhangu'], n(112, 1.5, 26, 0.1, 4.1)],
  ['Yam (Cooked)', ['Suran', 'Jimikand', 'Elephant Foot Yam'], n(118, 1.5, 28, 0.2, 4.0)],
  ['Tapioca (Cooked)', ['Sabudana Cooked', 'Kappa'], n(112, 0.8, 27, 0.1, 1.0)],
  ['Raw Banana (Cooked)', ['Kacha Kela', 'Plantain'], n(122, 1.3, 32, 0.4, 2.3)],
  ['Ripe Banana', ['Kela', 'Banana'], n(89, 1.1, 23, 0.3, 2.6), { availableUnits: [{ unit: 'g', grams: 1 }, { unit: 'banana', grams: 120 }, { unit: 'piece', grams: 120 }] }],
  ['Broccoli (Cooked)', ['Broccoli'], n(35, 2.4, 7, 0.4, 2.6)],
  ['Zucchini (Cooked)', ['Courgette', 'Turai Western'], n(17, 1.2, 3.0, 0.3, 1.0)],
  ['Mushroom (Cooked)', ['Dhingri', 'Khumb', 'Kalan'], n(28, 2.5, 4, 0.5, 1.5)],
  ['Baby Corn (Cooked)', ['Baby Corn'], n(26, 2.0, 5, 0.3, 1.5)],
  ['Corn (Boiled)', ['Makai', 'Sweet Corn', 'Bhutta'], n(96, 3.4, 21, 1.5, 2.4)],
  ['Green Peas (Boiled)', ['Matar', 'Peas'], n(84, 5.5, 15, 0.2, 4.5)],
  ['Broad Beans', ['Sem Phali', 'Papdi'], n(42, 3.0, 7, 0.3, 2.5)],
  ['Ivy Gourd (Cooked)', ['Tindora', 'Kovakkai', 'Tendli'], n(18, 0.8, 3.5, 0.1, 1.5)],
  ['Pointed Gourd (Cooked)', ['Parwal', 'Potol', 'Patol'], n(20, 1.0, 4.0, 0.1, 1.5)],
  ['Sponge Gourd (Cooked)', ['Gilki', 'Turai Sponge'], n(16, 0.6, 3.2, 0.1, 1.0)],
  ['Raw Papaya (Cooked)', ['Kacha Papita'], n(32, 0.5, 7, 0.1, 1.5)],
  ['Ripe Papaya', ['Papita', 'Papaya'], n(43, 0.5, 11, 0.3, 1.7)],
  ['Lettuce (Raw)', ['Salad Patta'], n(15, 1.4, 2.9, 0.2, 1.3)],
  ['Spring Onion', ['Hara Pyaz', 'Scallion'], n(32, 1.8, 7, 0.2, 2.6)],
  ['Garlic (Raw)', ['Lahsun', 'Garlic'], n(149, 6.4, 33, 0.5, 2.1)],
  ['Ginger (Raw)', ['Adrak', 'Ginger'], n(80, 1.8, 18, 0.8, 2.0)],
  ['Curry Leaves', ['Kadi Patta', 'Karuveppilai'], n(108, 6.1, 18, 1.0, 6.4)],
  ['Coriander Leaves', ['Dhaniya', 'Cilantro'], n(23, 2.1, 3.7, 0.5, 2.8)],
  ['Mint Leaves', ['Pudina', 'Mint'], n(44, 3.8, 8, 0.7, 6.8)],
  ['Amaranth Leaves (Cooked)', ['Chaulai', 'Thotakura'], n(28, 2.5, 4, 0.3, 2.0)],
  ['Mustard Greens (Cooked)', ['Sarson Saag Leaves'], n(22, 2.5, 3, 0.3, 2.5)],
  ['Colocasia Leaves (Cooked)', ['Arbi Ke Patte', 'Alu Chi Bhaji'], n(42, 2.5, 7, 0.5, 2.5)],
  ['Dill Leaves', ['Suva Bhaji', 'Shepu'], n(43, 3.5, 7, 1.1, 2.0)],
  ['Bathua (Cooked)', ['Chenopodium', 'Bathua Saag'], n(30, 3.0, 4, 0.5, 2.5)],
  ['Radish Leaves (Cooked)', ['Mooli Ke Patte'], n(26, 2.5, 4, 0.3, 2.0)],
  ['Jackfruit (Raw Cooked)', ['Kathal', 'Raw Jackfruit'], n(95, 1.7, 23, 0.3, 1.5)],
  ['Jackfruit (Ripe)', ['Kathal Ripe', 'Ripe Jackfruit'], n(95, 1.5, 23, 0.6, 1.5)],
  ['Lotus Stem (Cooked)', ['Kamal Kakdi', 'Bhein'], n(74, 2.5, 17, 0.1, 4.0)],
  ['Bamboo Shoot (Cooked)', ['Baans', 'Bamboo Shoot'], n(27, 2.6, 5, 0.3, 2.2)],
  ['Water Chestnut (Boiled)', ['Singhara', 'Water Chestnut'], n(97, 1.4, 24, 0.1, 3.0)],
  ['Elephant Yam (Cooked)', ['Suran Curry'], n(118, 1.5, 28, 0.2, 4.0)],
  ['Raw Mango', ['Kacha Aam', 'Green Mango'], n(60, 0.5, 15, 0.3, 1.6)],
  ['Ridge Gourd Peel Chutney Base', ['Turai Chutney'], n(25, 1.0, 5, 0.5, 1.5)],
  ['Stuffed Capsicum', ['Bharwan Shimla Mirch'], n(85, 3.0, 10, 4.0, 2.0)],
  ['Stuffed Brinjal', ['Bharwan Baingan'], n(95, 2.5, 10, 5.5, 2.5)],
  ['Stuffed Okra', ['Bharwan Bhindi'], n(105, 2.8, 10, 6.0, 3.0)],
  ['Vegetable Korma', ['Navratan Style Veg'], n(120, 3.0, 10, 8.5, 1.5)],
  ['Vegetable Jalfrezi', ['Veg Jalfrezi'], n(75, 2.5, 8, 4.0, 2.0)],
  ['Vegetable Handi', ['Veg Handi'], n(90, 2.8, 9, 5.0, 2.0)],
  ['Vegetable Pulao Base', ['Veg Pulao Mix'], n(130, 3.0, 22, 3.5, 1.5)],
  ['Sprouts Salad', ['Mixed Sprout Salad'], n(45, 4.0, 6, 0.5, 2.0)],
  ['Cucumber Raita Base', ['Kheera Mix'], n(40, 1.5, 5, 1.5, 0.5)],
  ['Tomato Onion Salad', ['Tamatar Pyaz Salad'], n(30, 1.0, 6, 0.2, 1.2)],
  ['Beetroot Salad', ['Chukandar Salad'], n(45, 1.5, 9, 0.3, 1.8)],
  ['Carrot Beans Poriyal', ['Carrot Beans Stir Fry'], n(55, 2.0, 8, 2.0, 2.5)],
  ['Cabbage Poriyal', ['Cabbage Thoran'], n(65, 2.0, 8, 3.0, 2.5)],
  ['Beans Poriyal', ['French Beans Thoran'], n(60, 2.2, 8, 2.5, 2.5)],
  ['Beetroot Poriyal', ['Beetroot Thoran'], n(55, 1.8, 8, 2.0, 2.0)],
  ['Carrot Poriyal', ['Carrot Thoran'], n(58, 1.5, 9, 2.5, 2.0)],
  ['Drumstick Sambar Veg', ['Murungakkai Sambar'], n(80, 3.0, 11, 2.5, 2.0)],
  ['Mixed Veg Sambar', ['Sambar Vegetables'], n(85, 3.5, 12, 2.5, 2.5)],
  ['Rasam Tomato Base', ['Tomato Rasam'], n(40, 1.2, 6, 1.2, 0.5)],
  ['Lemon Rasam', ['Nimbu Rasam'], n(35, 1.0, 5, 1.0, 0.3)],
  ['Pepper Rasam', ['Milagu Rasam'], n(38, 1.2, 5, 1.2, 0.5)],
  ['Garlic Rasam', ['Poondu Rasam'], n(42, 1.5, 5, 1.5, 0.5)],
  ['Tomato Pachadi', ['Tomato Chutney Base'], n(70, 1.5, 7, 4.0, 1.0)],
  ['Onion Tomato Masala Base', ['Pyaz Tamatar Masala'], n(65, 1.5, 8, 3.5, 1.2)],
  ['Ginger Garlic Paste', ['Adrak Lahsun Paste'], n(95, 2.5, 15, 2.5, 1.5)],
  ['Green Chutney Base', ['Hari Chutney'], n(60, 1.5, 6, 3.5, 1.5)],
  ['Tamarind Paste', ['Imli Paste'], n(75, 1.0, 18, 0.2, 1.5)],
  ['Coconut (Grated Fresh)', ['Nariyal', 'Fresh Coconut'], n(354, 3.3, 15, 33, 9.0, 6, 20)],
  ['Coconut (Dry Grated)', ['Sookha Nariyal', 'Desiccated Coconut'], n(660, 6.9, 24, 64, 16, 7, 37)],
  ['Tamarind (Soaked Pulp)', ['Imli Pulp'], n(57, 0.5, 14, 0.1, 0.5, 3)],
  ['Jaggery', ['Gur', 'Gud'], n(383, 0.4, 98, 0.1, 0, 97, 25)],
  ['Tofu (Firm)', ['Soy Paneer', 'Tofu'], n(76, 8.0, 1.9, 4.8, 0.3, 0.3, 7), { isVegan: true }],
  ['Soya Milk (Unsweetened)', ['Soy Milk'], n(33, 3.0, 1.5, 1.8, 0.5, 0.5, 40), { baseUnit: 'ml', isVegan: true }],
  ['Edamame (Boiled)', ['Green Soybeans'], n(122, 11.0, 9, 5.2, 5.2, 2.2, 6), { isVegan: true }],
  ['Seaweed (Dried)', ['Kelp'], n(43, 1.7, 10, 0.6, 1.3, 0.6, 233), { isVegan: true }],
  ['Kimchi Style Cabbage', ['Fermented Cabbage'], n(24, 1.5, 4, 0.5, 2.0, 1.5, 500)],
  ['Kimchi Cucumber', ['Fermented Cucumber'], n(18, 0.8, 3, 0.3, 0.5, 1.0, 400)],
  ['Pickled Vegetables', ['Achar Vegetables'], n(55, 1.0, 8, 2.5, 1.5, 2, 800)],
  ['Sun Dried Tomatoes', ['Sukhe Tamatar'], n(258, 14.0, 55, 3.0, 12, 35, 200)],
  ['Artichoke (Cooked)', ['Artichoke'], n(47, 3.3, 11, 0.2, 5.4, 1.0, 94)],
  ['Asparagus (Cooked)', ['Shatavari Vegetable'], n(22, 2.4, 4, 0.2, 2.0, 1.3, 14)],
  ['Leeks (Cooked)', ['Leek'], n(31, 0.8, 7, 0.2, 1.0, 2.5, 20)],
  ['Celery (Raw)', ['Ajmoda', 'Celery'], n(16, 0.7, 3, 0.2, 1.6, 1.3, 80)],
  ['Red Bell Pepper', ['Lal Shimla Mirch'], n(31, 1.0, 6, 0.3, 2.1, 4.2, 4)],
  ['Yellow Bell Pepper', ['Pila Shimla Mirch'], n(27, 1.0, 6, 0.2, 0.9, 4.0, 2)],
];

vegNames.forEach(([name, aliases, nutrition], i) => {
  foods.push(food(`food-veg-${i + 1}`, name, 'Vegetables', nutrition, { aliases, subcategory: 'Vegetables' }));
});

// Fruits (65+)
bulk('Fruits', 'fruit', [
  ['Apple', ['Seb', 'Apple'], n(52, 0.3, 14, 0.2, 2.4, 10), { availableUnits: fruitUnits(180, [{ unit: 'apple', grams: 180 }]) }],
  ['Green Apple', ['Hara Seb', 'Green Apple'], n(52, 0.3, 14, 0.2, 2.4, 10), { availableUnits: fruitUnits(170) }],
  ['Mango (Ripe)', ['Aam', 'Mango'], n(60, 0.8, 15, 0.4, 1.6, 14), { availableUnits: fruitUnits(200, [{ unit: 'mango', grams: 200 }]) }],
  ['Alphonso Mango', ['Hapus', 'Alphonso Aam'], n(65, 0.8, 16, 0.4, 1.8, 14), { availableUnits: fruitUnits(220) }],
  ['Dasheri Mango', ['Dasheri Aam'], n(60, 0.8, 15, 0.4, 1.6, 14), { availableUnits: fruitUnits(210) }],
  ['Langra Mango', ['Langra Aam'], n(60, 0.8, 15, 0.4, 1.6, 14), { availableUnits: fruitUnits(200) }],
  ['Banganapalli Mango', ['Benishan', 'Safeda Aam'], n(62, 0.8, 15, 0.4, 1.7, 14), { availableUnits: fruitUnits(230) }],
  ['Totapuri Mango', ['Totapuri Aam', 'Collector Aam'], n(58, 0.7, 14, 0.3, 1.5, 13), { availableUnits: fruitUnits(190) }],
  ['Raw Mango (Kaccha Aam)', ['Keri', 'Kacha Aam', 'Kairi'], n(44, 0.8, 10, 0.2, 2.6, 7), { availableUnits: fruitUnits(150) }],
  ['Banana (Ripe)', ['Kela'], n(89, 1.1, 23, 0.3, 2.6, 12), { availableUnits: fruitUnits(120, [{ unit: 'banana', grams: 120 }]) }],
  ['Red Banana', ['Lal Kela', 'Red Banana'], n(90, 1.1, 23, 0.3, 2.6, 12), { availableUnits: fruitUnits(110) }],
  ['Orange', ['Santra', 'Narangi'], n(47, 0.9, 12, 0.1, 2.4, 9), { availableUnits: fruitUnits(130) }],
  ['Kinnow', ['Kinnow Orange', 'Punjab Orange'], n(47, 0.9, 12, 0.1, 2.4, 9), { availableUnits: fruitUnits(140) }],
  ['Nagpur Orange', ['Santra Nagpur', 'Nagpur Santra'], n(47, 0.9, 12, 0.1, 2.4, 9), { availableUnits: fruitUnits(135) }],
  ['Malta (Blood Orange)', ['Malta', 'Malta Fruit'], n(47, 0.9, 12, 0.1, 2.4, 9), { availableUnits: fruitUnits(130) }],
  ['Sweet Lime (Mosambi)', ['Mosambi', 'Mausambi'], n(43, 0.7, 10, 0.2, 0.5, 8), { availableUnits: fruitUnits(180) }],
  ['Pomegranate', ['Anar', 'Pomegranate Seeds'], n(83, 1.7, 19, 1.2, 4.0, 14), { availableUnits: fruitUnits(280) }],
  ['Grapes (Green)', ['Angoor Hara', 'Green Grapes'], n(69, 0.7, 18, 0.2, 0.9, 16), { availableUnits: [{ unit: 'g', grams: 1 }, { unit: 'bowl', grams: 150 }] }],
  ['Grapes (Black)', ['Angoor Kala', 'Black Grapes'], n(69, 0.7, 18, 0.2, 0.9, 16), { availableUnits: [{ unit: 'g', grams: 1 }, { unit: 'bowl', grams: 150 }] }],
  ['Grapes', ['Angoor', 'Grapes'], n(69, 0.7, 18, 0.2, 0.9, 16), { availableUnits: [{ unit: 'g', grams: 1 }, { unit: 'bowl', grams: 150 }] }],
  ['Watermelon', ['Tarbooz', 'Watermelon'], n(30, 0.6, 8, 0.2, 0.4, 6), { availableUnits: [{ unit: 'g', grams: 1 }, { unit: 'slice', grams: 250 }] }],
  ['Muskmelon', ['Kharbooja', 'Cantaloupe'], n(34, 0.8, 8, 0.2, 0.9, 8), { availableUnits: fruitUnits(300) }],
  ['Honeydew Melon', ['Honeydew', 'Kharbooja Safed'], n(36, 0.5, 9, 0.1, 0.8, 8), { availableUnits: fruitUnits(300) }],
  ['Papaya (Ripe)', ['Papita'], n(43, 0.5, 11, 0.3, 1.7, 8), { availableUnits: fruitUnits(250) }],
  ['Guava', ['Amrud', 'Peru'], n(68, 2.6, 14, 1.0, 5.4, 9), { availableUnits: fruitUnits(150) }],
  ['Pineapple', ['Ananas'], n(50, 0.5, 13, 0.1, 1.4, 10), { availableUnits: [{ unit: 'g', grams: 1 }, { unit: 'slice', grams: 80 }] }],
  ['Chikoo (Sapota)', ['Sapota', 'Chiku'], n(83, 0.4, 20, 1.1, 5.3, 14), { availableUnits: fruitUnits(100) }],
  ['Litchi', ['Lychee'], n(66, 0.8, 17, 0.4, 1.3, 15), { availableUnits: fruitUnits(10, [{ unit: 'piece', grams: 10 }]) }],
  ['Custard Apple (Sitaphal)', ['Sharifa', 'Sitaphal'], n(94, 1.7, 24, 0.3, 2.4, 18), { availableUnits: fruitUnits(150) }],
  ['Ramphal', ['Ramphal', 'Bullock Heart'], n(101, 1.7, 25, 0.6, 2.4, 18), { availableUnits: fruitUnits(160) }],
  ['Jackfruit (Ripe)', ['Kathal Ripe', 'Phanas'], n(95, 1.5, 23, 0.6, 1.5, 19), { availableUnits: fruitUnits(50) }],
  ['Pear', ['Nashpati', 'Pear'], n(57, 0.4, 15, 0.1, 3.1, 10), { availableUnits: fruitUnits(170) }],
  ['Plum', ['Aloo Bukhara', 'Plum'], n(46, 0.7, 11, 0.3, 1.4, 10), { availableUnits: fruitUnits(60) }],
  ['Peach', ['Aadu', 'Peach'], n(39, 0.9, 10, 0.3, 1.5, 8), { availableUnits: fruitUnits(150) }],
  ['Apricot (Fresh)', ['Khubani Taza', 'Fresh Apricot'], n(48, 1.4, 11, 0.4, 2.0, 9), { availableUnits: fruitUnits(35) }],
  ['Apricot (Dried)', ['Khubani', 'Dried Apricot'], n(241, 3.4, 63, 0.5, 7.3, 53)],
  ['Strawberry', ['Strawberry'], n(32, 0.7, 8, 0.3, 2.0, 4.9), { availableUnits: [{ unit: 'g', grams: 1 }, { unit: 'bowl', grams: 150 }] }],
  ['Blueberry', ['Blueberry'], n(57, 0.7, 14, 0.3, 2.4, 10), { availableUnits: [{ unit: 'g', grams: 1 }, { unit: 'bowl', grams: 120 }] }],
  ['Kiwi', ['Kiwi'], n(61, 1.1, 15, 0.5, 3.0, 9), { availableUnits: fruitUnits(75) }],
  ['Dragon Fruit', ['Pitaya'], n(60, 1.2, 13, 0.4, 3.0, 8), { availableUnits: fruitUnits(200) }],
  ['Coconut Water', ['Nariyal Pani', 'Coconut Water'], n(19, 0.7, 4, 0.2, 1.1, 2.6, 105), { baseUnit: 'ml', availableUnits: liquidUnits(1, [{ unit: 'glass', grams: 300 }]), isVegan: true }],
  ['Tender Coconut Malai', ['Nariyal Malai'], n(230, 2.0, 6, 24, 3.0, 3), { availableUnits: fruitUnits(30) }],
  ['Coconut Flesh (Fresh)', ['Nariyal Giri', 'Coconut Meat'], n(354, 3.3, 15, 33, 9.0, 6), { availableUnits: [{ unit: 'g', grams: 1 }, { unit: 'piece', grams: 30 }] }],
  ['Dates (Dry)', ['Khajoor', 'Dates'], n(282, 2.5, 75, 0.4, 8.0, 66), { availableUnits: fruitUnits(8) }],
  ['Figs (Dry)', ['Anjeer', 'Dried Figs'], n(249, 3.3, 64, 0.9, 9.8, 48), { availableUnits: fruitUnits(12) }],
  ['Figs (Fresh)', ['Anjeer Taza', 'Fresh Fig'], n(74, 0.8, 19, 0.3, 2.9, 16), { availableUnits: fruitUnits(50) }],
  ['Raisins', ['Kishmish', 'Raisins'], n(299, 3.1, 79, 0.5, 3.7, 59)],
  ['Prunes (Dry)', ['Dried Plums'], n(240, 2.2, 64, 0.4, 7.1, 38)],
  ['Cranberries (Dried)', ['Dried Cranberries'], n(308, 0.1, 82, 1.4, 5.7, 65)],
  ['Amla (Indian Gooseberry)', ['Amla', 'Indian Gooseberry'], n(44, 0.9, 10, 0.6, 4.3, 0.5), { availableUnits: fruitUnits(15) }],
  ['Ber (Indian Jujube)', ['Ber Fruit', 'Bor'], n(79, 1.2, 20, 0.2, 0.5, 16), { availableUnits: fruitUnits(12) }],
  ['Jamun (Black Plum)', ['Java Plum', 'Jamun'], n(60, 0.7, 14, 0.2, 0.9, 12), { availableUnits: fruitUnits(10) }],
  ['Wood Apple (Bael)', ['Bael Fruit'], n(78, 1.8, 18, 0.3, 1.5, 12), { availableUnits: fruitUnits(200) }],
  ['Tamarind (Fruit Pulp)', ['Imli'], n(57, 0.5, 14, 0.1, 0.5, 3)],
  ['Star Fruit', ['Kamrakh', 'Carambola'], n(31, 1.0, 7, 0.3, 2.8, 4), { availableUnits: fruitUnits(90) }],
  ['Passion Fruit', ['Passion Fruit'], n(97, 2.2, 23, 0.7, 10.4, 11), { availableUnits: fruitUnits(18) }],
  ['Avocado', ['Avocado'], n(160, 2.0, 9, 15, 6.7, 0.7, 7), { isVegan: true, availableUnits: fruitUnits(150) }],
  ['Phalsa', ['Falsa', 'Phalsa Berry'], n(53, 0.9, 12, 0.3, 1.2, 9), { availableUnits: [{ unit: 'g', grams: 1 }, { unit: 'bowl', grams: 100 }] }],
  ['Karonda', ['Caronda', 'Karonda Berry'], n(58, 0.8, 13, 0.3, 1.0, 10), { availableUnits: fruitUnits(8) }],
  ['Mulberry (Shahtoot)', ['Shahtoot', 'Mulberry'], n(43, 1.4, 10, 0.4, 1.7, 8), { availableUnits: [{ unit: 'g', grams: 1 }, { unit: 'bowl', grams: 100 }] }],
  ['Kokum', ['Kokum', 'Garcinia'], n(60, 0.5, 14, 0.2, 1.0, 8)],
  ['Rose Apple (Jamfal)', ['Jamfal', 'Jambu'], n(25, 0.6, 6, 0.3, 1.5, 4), { availableUnits: fruitUnits(50) }],
  ['Elephant Apple (Chalta)', ['Chalta', 'Dillenia'], n(49, 0.8, 11, 0.2, 2.0, 8), { availableUnits: fruitUnits(250) }],
  ['Persimmon (Japani Phal)', ['Japani Phal', 'Persimmon'], n(70, 0.6, 18, 0.2, 3.6, 13), { availableUnits: fruitUnits(170) }],
  ['Pomelo (Chakotra)', ['Chakotra', 'Pomelo'], n(38, 0.8, 10, 0.0, 1.0, 0), { availableUnits: fruitUnits(400) }],
  ['Grapefruit', ['Chakotra Angrezi', 'Grapefruit'], n(42, 0.8, 11, 0.1, 1.6, 7), { availableUnits: fruitUnits(250) }],
  ['Lemon', ['Nimbu', 'Lemon'], n(29, 1.1, 9, 0.3, 2.8, 2.5), { availableUnits: fruitUnits(60) }],
  ['Sweet Tamarind', ['Imli Meetha', 'Sweet Tamarind'], n(57, 0.5, 14, 0.1, 0.5, 3), { availableUnits: fruitUnits(15) }],
  ['Cherry', ['Cherry'], n(50, 1.0, 12, 0.3, 1.6, 8), { availableUnits: fruitUnits(8) }],
  ['Loquat (Lokat)', ['Lokat', 'Loquat'], n(47, 0.4, 12, 0.2, 1.7, 9), { availableUnits: fruitUnits(40) }],
  ['Indian Fig (Anjeer Wild)', ['Gular', 'Cluster Fig'], n(74, 0.8, 19, 0.3, 2.9, 16), { availableUnits: fruitUnits(50) }],
  ['Sharbat Berry (Grewia)', ['Phalsa Grewia', 'Falsa Berry'], n(53, 0.9, 12, 0.3, 1.2, 9), { availableUnits: [{ unit: 'g', grams: 1 }, { unit: 'bowl', grams: 100 }] }],
]);

// Dairy (25)
bulk('Dairy', 'dairy', [
  ['Milk (Full Cream)', ['Doodh', 'Full Fat Milk', 'Cow Milk'], n(61, 3.2, 4.8, 3.3, 0, 5, 44), { baseUnit: 'ml', availableUnits: liquidUnits(1, [{ unit: 'glass', grams: 250 }]) }],
  ['Milk (Toned)', ['Toned Milk', 'Low Fat Milk'], n(48, 3.3, 5.0, 1.5, 0, 5, 44), { baseUnit: 'ml', availableUnits: liquidUnits(1) }],
  ['Milk (Skimmed)', ['Skim Milk', 'Fat Free Milk'], n(34, 3.4, 5.0, 0.1, 0, 5, 44), { baseUnit: 'ml', availableUnits: liquidUnits(1) }],
  ['Curd (Plain)', ['Dahi', 'Yogurt', 'Yoghurt'], n(59, 3.5, 4.7, 3.3, 0, 4.7, 36), { baseUnit: 'ml', availableUnits: liquidUnits(1, [{ unit: 'katori', grams: 150 }, { unit: 'bowl', grams: 200 }]) }],
  ['Greek Yogurt', ['Greek Curd', 'Hung Curd'], n(97, 9.0, 3.6, 5.0, 0, 3.6, 36), { baseUnit: 'ml' }],
  ['Buttermilk (Plain)', ['Chaas', 'Mattha', 'Chaach'], n(40, 2.0, 4, 1.2, 0, 3, 36), { baseUnit: 'ml', availableUnits: liquidUnits(1) }],
  ['Paneer', ['Cottage Cheese', 'Indian Cottage Cheese'], n(265, 18.0, 1.2, 20, 0, 1.2, 18), { availableUnits: [{ unit: 'g', grams: 1 }, { unit: 'katori', grams: 100 }, { unit: 'piece', grams: 50 }] }],
  ['Low Fat Paneer', ['Diet Paneer'], n(180, 20.0, 2.0, 8, 0, 2, 15)],
  ['Cheese (Processed)', ['Processed Cheese', 'Cheese Slice'], n(313, 22.0, 2.0, 24, 0, 1, 620), { availableUnits: [{ unit: 'g', grams: 1 }, { unit: 'slice', grams: 20 }] }],
  ['Mozzarella Cheese', ['Mozzarella'], n(280, 28.0, 3.1, 17, 0, 1, 627)],
  ['Cheddar Cheese', ['Cheddar'], n(403, 25.0, 1.3, 33, 0, 0.5, 621)],
  ['Cream (Fresh)', ['Malai', 'Fresh Cream'], n(340, 2.0, 3.0, 36, 0, 3, 34), { baseUnit: 'ml' }],
  ['Butter', ['Makhan', 'White Butter'], n(717, 0.9, 0.1, 81, 0, 0.1, 11), { availableUnits: [{ unit: 'g', grams: 1 }, { unit: 'tbsp', grams: 14 }] }],
  ['Ghee', ['Clarified Butter', 'Desi Ghee'], n(900, 0, 0, 100, 0, 0, 0), { availableUnits: [{ unit: 'g', grams: 1 }, { unit: 'tbsp', grams: 14 }, { unit: 'tsp', grams: 5 }] }],
  ['Khoya (Mawa)', ['Mawa', 'Khoa'], n(412, 14.0, 32, 26, 0, 28, 120)],
  ['Rabri', ['Rabdi'], n(185, 5.5, 22, 8.5, 0, 20, 45), { baseUnit: 'ml' }],
  ['Condensed Milk', ['Milkmaid', 'Sweetened Condensed Milk'], n(321, 7.9, 55, 8.7, 0, 55, 127), { baseUnit: 'ml' }],
  ['Evaporated Milk', ['Evaporated Milk'], n(134, 6.8, 10, 7.6, 0, 10, 106), { baseUnit: 'ml' }],
  ['Milk Powder', ['Doodh Powder', 'Skimmed Milk Powder'], n(496, 26.0, 38, 27, 0, 38, 380)],
  ['Whey Protein (with Milk base)', ['Whey Shake'], n(55, 5.5, 4, 1.5, 0, 4, 40), { baseUnit: 'ml' }],
  ['Flavoured Milk (Rose)', ['Rose Milk'], n(75, 3.0, 12, 2.0, 0, 11, 45), { baseUnit: 'ml' }],
  ['Flavoured Milk (Chocolate)', ['Chocolate Milk'], n(80, 3.2, 12, 2.5, 0, 11, 50), { baseUnit: 'ml' }],
  ['Shrikhand', ['Shrikhand Sweet'], n(185, 5.0, 28, 6.0, 0, 25, 40)],
  ['Ice Cream (Vanilla)', ['Vanilla Ice Cream'], n(207, 3.5, 24, 11, 0, 21, 80), { baseUnit: 'ml' }],
]);

// Protein - Chicken (15)
bulk('Protein - Chicken', 'chicken', [
  ['Chicken Breast (Grilled)', ['Grilled Chicken Breast', 'Murgh Breast'], n(165, 31.0, 0, 3.6, 0, 0, 74), { isVegetarian: false }],
  ['Chicken Thigh (Cooked)', ['Chicken Thigh', 'Murgh Thigh'], n(209, 26.0, 0, 11, 0, 0, 84), { isVegetarian: false }],
  ['Chicken Drumstick (Cooked)', ['Chicken Leg', 'Murgh Leg'], n(195, 24.0, 0, 10, 0, 0, 90), { isVegetarian: false, availableUnits: [{ unit: 'g', grams: 1 }, { unit: 'piece', grams: 80 }] }],
  ['Chicken Curry (Home)', ['Murgh Curry'], n(165, 16.0, 5, 9, 0.3, 1, 350), { isVegetarian: false }],
  ['Chicken Tikka', ['Murgh Tikka'], n(185, 25.0, 3, 8, 0.3, 1, 400), { isVegetarian: false }],
  ['Chicken Biryani Piece', ['Biryani Chicken'], n(195, 18.0, 8, 9, 0.3, 1, 380), { isVegetarian: false }],
  ['Chicken Keema', ['Chicken Mince', 'Murgh Keema'], n(175, 20.0, 2, 9, 0, 0, 360), { isVegetarian: false }],
  ['Chicken Soup (Clear)', ['Murgh Soup'], n(45, 5.5, 2, 1.5, 0, 0.5, 380), { isVegetarian: false, baseUnit: 'ml' }],
  ['Chicken Sandwich Filling', ['Chicken Sandwich Mix'], n(195, 15.0, 10, 10, 0.5, 2, 420), { isVegetarian: false }],
  ['Chicken Sausage', ['Chicken Sausage'], n(195, 14.0, 3, 14, 0, 1, 680), { isVegetarian: false }],
  ['Chicken Momos (Steamed)', ['Chicken Momo'], n(175, 12.0, 18, 6, 0.8, 1, 380), { isVegetarian: false, availableUnits: [{ unit: 'g', grams: 1 }, { unit: 'piece', grams: 35 }] }],
  ['Chicken Fried Piece', ['Fried Chicken'], n(250, 20.0, 8, 15, 0.3, 0.5, 450), { isVegetarian: false }],
  ['Chicken Liver (Cooked)', ['Murgh Kaleji', 'Chicken Liver'], n(167, 26.0, 4, 5, 0, 0, 78), { isVegetarian: false }],
  ['Chicken Gizzard (Cooked)', ['Murgh Pota'], n(154, 28.0, 0, 4, 0, 0, 75), { isVegetarian: false }],
  ['Chicken Seekh Kebab', ['Murgh Seekh Kebab'], n(195, 18.0, 4, 12, 0.3, 0.5, 420), { isVegetarian: false }],
], { isVegetarian: false });

// Protein - Fish (15)
bulk('Protein - Fish', 'fish', [
  ['Rohu Fish (Cooked)', ['Rohu', 'Indian Carp'], n(130, 18.0, 0, 6, 0, 0, 55), { isVegetarian: false }],
  ['Katla Fish (Cooked)', ['Katla', 'Catla'], n(125, 17.5, 0, 5.5, 0, 0, 50), { isVegetarian: false }],
  ['Pomfret (Cooked)', ['Paplet', 'Pomfret'], n(140, 19.0, 0, 7, 0, 0, 60), { isVegetarian: false }],
  ['Bangda (Mackerel Cooked)', ['Mackerel', 'Bangda'], n(180, 20.0, 0, 11, 0, 0, 70), { isVegetarian: false }],
  ['Surmai (Kingfish Cooked)', ['Kingfish', 'Surmai'], n(145, 20.0, 0, 7, 0, 0, 65), { isVegetarian: false }],
  ['Rawas (Salmon Indian)', ['Indian Salmon', 'Rawas'], n(155, 20.0, 0, 8, 0, 0, 60), { isVegetarian: false }],
  ['Hilsa (Cooked)', ['Ilish', 'Hilsa Fish'], n(195, 18.0, 0, 13, 0, 0, 55), { isVegetarian: false }],
  ['Bombay Duck (Cooked)', ['Bombil', 'Bombay Duck'], n(110, 18.0, 0, 4, 0, 0, 450), { isVegetarian: false }],
  ['Prawns (Cooked)', ['Jhinga', 'Shrimp', 'Prawn'], n(99, 21.0, 0, 1.5, 0, 0, 230), { isVegetarian: false }],
  ['Crab (Cooked)', ['Kekda', 'Crab Meat'], n(97, 20.0, 0, 1.5, 0, 0, 320), { isVegetarian: false }],
  ['Fish Curry (Home)', ['Machli Curry', 'Meen Curry'], n(145, 15.0, 4, 8, 0.3, 1, 380), { isVegetarian: false }],
  ['Fish Fry', ['Machli Fry', 'Meen Fry'], n(195, 18.0, 6, 11, 0.3, 0.5, 420), { isVegetarian: false }],
  ['Tuna (Canned in Water)', ['Canned Tuna'], n(116, 26.0, 0, 1, 0, 0, 320), { isVegetarian: false }],
  ['Sardines (Cooked)', ['Tarli', 'Sardine'], n(175, 21.0, 0, 10, 0, 0, 90), { isVegetarian: false }],
  ['Fish Tikka', ['Machli Tikka'], n(155, 22.0, 2, 7, 0, 0, 400), { isVegetarian: false }],
], { isVegetarian: false });

function eggUnits(grams) {
  return [
    { unit: 'g', grams: 1 },
    { unit: 'egg', grams },
  ];
}

// Protein - Egg (9)
bulk('Protein - Egg', 'egg', [
  ['Boiled Egg (Whole)', ['Anda Ubalna', 'Hard Boiled Egg'], n(155, 13.0, 1.1, 11, 0, 1.1, 124), { isVegetarian: false, availableUnits: eggUnits(50), defaultServing: { unit: 'egg', grams: 50 } }],
  ['Egg White (Boiled)', ['Anda Safed', 'Egg White'], n(52, 11.0, 0.7, 0.2, 0, 0.7, 166), { isVegetarian: false, availableUnits: eggUnits(33), defaultServing: { unit: 'egg', grams: 33 } }],
  ['Egg Yolk (Boiled)', ['Anda Pila', 'Egg Yolk'], n(322, 16.0, 3.6, 27, 0, 0.6, 48), { isVegetarian: false, availableUnits: eggUnits(17), defaultServing: { unit: 'egg', grams: 17 } }],
  ['Omelette (Plain)', ['Anda Omelette', 'Omlet'], n(154, 11.0, 1.0, 12, 0, 0.5, 140), { isVegetarian: false, availableUnits: eggUnits(50), defaultServing: { unit: 'egg', grams: 50 } }],
  ['Omelette (Masala)', ['Masala Omelette'], n(165, 11.5, 2.0, 12, 0.3, 0.8, 180), { isVegetarian: false, availableUnits: eggUnits(50), defaultServing: { unit: 'egg', grams: 50 } }],
  ['Scrambled Egg', ['Anda Bhurji Base', 'Scrambled Eggs'], n(148, 10.0, 2.0, 11, 0, 1, 150), { isVegetarian: false, availableUnits: eggUnits(50), defaultServing: { unit: 'egg', grams: 50 } }],
  ['Egg Bhurji', ['Anda Bhurji', 'Indian Scrambled Egg'], n(175, 12.0, 3.0, 13, 0.3, 1, 200), { isVegetarian: false, availableUnits: eggUnits(50), defaultServing: { unit: 'egg', grams: 50 } }],
  ['Egg Bhurji Curry', ['Anda Bhurji Curry', 'Egg Bhurgi Curry', 'Anda Curry Bhurji'], n(185, 11.5, 5.0, 14, 0.8, 1.5, 220), { isVegetarian: false, availableUnits: eggUnits(50), defaultServing: { unit: 'egg', grams: 50 } }],
  ['Poached Egg', ['Poached Anda'], n(143, 13.0, 0.7, 10, 0, 0.4, 140), { isVegetarian: false, availableUnits: eggUnits(50), defaultServing: { unit: 'egg', grams: 50 } }],
], { isVegetarian: false });

// Protein - Mutton (10)
bulk('Protein - Mutton', 'mutton', [
  ['Mutton Curry (Home)', ['Gosht Curry', 'Lamb Curry'], n(195, 17.0, 4, 13, 0, 0, 350), { isVegetarian: false }],
  ['Mutton Keema', ['Gosht Keema', 'Lamb Mince'], n(210, 18.0, 3, 14, 0, 0, 380), { isVegetarian: false }],
  ['Mutton Biryani Piece', ['Gosht Biryani Meat'], n(210, 16.0, 6, 13, 0, 0, 360), { isVegetarian: false }],
  ['Mutton Rogan Josh', ['Rogan Josh'], n(205, 17.0, 4, 14, 0, 0, 370), { isVegetarian: false }],
  ['Mutton Korma', ['Gosht Korma'], n(215, 16.0, 5, 15, 0, 0, 360), { isVegetarian: false }],
  ['Mutton Seekh Kebab', ['Gosht Seekh Kebab'], n(210, 18.0, 3, 14, 0, 0, 400), { isVegetarian: false }],
  ['Mutton Chops (Cooked)', ['Gosht Chops'], n(225, 19.0, 0, 16, 0, 0, 75), { isVegetarian: false }],
  ['Mutton Liver (Cooked)', ['Kaleji Gosht'], n(175, 24.0, 4, 7, 0, 0, 80), { isVegetarian: false }],
  ['Mutton Soup', ['Gosht Soup'], n(55, 6.5, 2, 2.5, 0, 0.5, 380), { isVegetarian: false, baseUnit: 'ml' }],
  ['Mutton Nihari', ['Nihari Gosht'], n(205, 16.0, 5, 14, 0, 0, 380), { isVegetarian: false }],
], { isVegetarian: false });

// Oils & Fats (10)
bulk('Oils & Fats', 'oil', [
  ['Mustard Oil', ['Sarson Ka Tel', 'Mustard Oil'], n(884, 0, 0, 100, 0, 0, 0), { baseUnit: 'ml', availableUnits: [{ unit: 'ml', grams: 1 }, { unit: 'tbsp', grams: 14 }, { unit: 'tsp', grams: 5 }] }],
  ['Sunflower Oil', ['Sunflower Oil'], n(884, 0, 0, 100, 0, 0, 0), { baseUnit: 'ml', availableUnits: [{ unit: 'ml', grams: 1 }, { unit: 'tbsp', grams: 14 }] }],
  ['Olive Oil', ['Jaitun Ka Tel', 'Olive Oil'], n(884, 0, 0, 100, 0, 0, 2), { baseUnit: 'ml' }],
  ['Coconut Oil', ['Nariyal Tel', 'Coconut Oil'], n(862, 0, 0, 100, 0, 0, 0), { baseUnit: 'ml' }],
  ['Groundnut Oil', ['Mungfali Tel', 'Peanut Oil'], n(884, 0, 0, 100, 0, 0, 0), { baseUnit: 'ml' }],
  ['Rice Bran Oil', ['Rice Bran Oil'], n(884, 0, 0, 100, 0, 0, 0), { baseUnit: 'ml' }],
  ['Sesame Oil', ['Til Ka Tel', 'Gingelly Oil'], n(884, 0, 0, 100, 0, 0, 0), { baseUnit: 'ml' }],
  ['Vanaspati (Dalda)', ['Dalda', 'Vanaspati'], n(900, 0, 0, 100, 0, 0, 0)],
  ['Butter (Salted)', ['Namkeen Makhan'], n(717, 0.9, 0.1, 81, 0, 0.1, 714), { availableUnits: [{ unit: 'g', grams: 1 }, { unit: 'tbsp', grams: 14 }] }],
  ['Margarine', ['Margarine'], n(717, 0.2, 0.7, 81, 0, 0, 690)],
]);

// Dry Fruits & Nuts (20)
bulk('Dry Fruits & Nuts', 'nut', [
  ['Almonds', ['Badam', 'Almond'], n(579, 21.0, 22, 50, 12, 4.4, 1), { availableUnits: [{ unit: 'g', grams: 1 }, { unit: 'piece', grams: 1.2 }] }],
  ['Walnuts', ['Akhrot', 'Walnut'], n(654, 15.0, 14, 65, 6.7, 2.6, 2)],
  ['Cashews', ['Kaju', 'Cashew'], n(553, 18.0, 30, 44, 3.3, 5.9, 12)],
  ['Pistachios', ['Pista', 'Pistachio'], n(560, 20.0, 28, 45, 10, 7.7, 1)],
  ['Raisins', ['Kishmish'], n(299, 3.1, 79, 0.5, 3.7, 59)],
  ['Dates (Dry)', ['Khajoor'], n(282, 2.5, 75, 0.4, 8.0, 66), { availableUnits: [{ unit: 'g', grams: 1 }, { unit: 'piece', grams: 8 }] }],
  ['Figs (Dry)', ['Anjeer'], n(249, 3.3, 64, 0.9, 9.8, 48)],
  ['Dried Apricots', ['Khubani'], n(241, 3.4, 63, 0.5, 7.3, 53)],
  ['Prunes', ['Dried Plums'], n(240, 2.2, 64, 0.4, 7.1, 38)],
  ['Peanuts (Roasted)', ['Mungfali', 'Groundnut'], n(567, 26.0, 16, 49, 8.5, 4.7, 18)],
  ['Roasted Chana', ['Bhuna Chana', 'Roasted Bengal Gram'], n(380, 19.0, 58, 6, 12, 2, 24)],
  ['Fox Nuts (Makhana)', ['Makhana', 'Lotus Seeds'], n(347, 9.7, 77, 0.1, 0.5, 0, 210)],
  ['Pumpkin Seeds', ['Kaddu Ke Beej'], n(559, 30.0, 11, 49, 6.0, 1.3, 7)],
  ['Sunflower Seeds', ['Surajmukhi Ke Beej'], n(584, 21.0, 20, 51, 8.6, 2.6, 9)],
  ['Chia Seeds', ['Chia Seeds'], n(486, 17.0, 42, 31, 34, 0, 16), { isVegan: true }],
  ['Flax Seeds', ['Alsi', 'Flaxseed'], n(534, 18.0, 29, 42, 27, 1.6, 30), { isVegan: true }],
  ['Hazelnuts', ['Hazelnut'], n(628, 15.0, 17, 61, 10, 4.3, 0)],
  ['Macadamia Nuts', ['Macadamia'], n(718, 8.0, 14, 76, 8.6, 4.6, 5)],
  ['Brazil Nuts', ['Brazil Nut'], n(659, 14.0, 12, 67, 7.5, 2.3, 3)],
  ['Pine Nuts', ['Chilgoza', 'Pine Nut'], n(673, 14.0, 13, 68, 3.7, 3.6, 2)],
]);

// Snacks (30)
bulk('Snacks', 'snack', [
  ['Samosa', ['Singhara', 'Samosa'], n(262, 5.5, 28, 14, 2.0, 1, 380), { availableUnits: [{ unit: 'g', grams: 1 }, { unit: 'piece', grams: 80 }] }],
  ['Kachori', ['Khasta Kachori'], n(295, 6.0, 30, 16, 2.5, 1, 400), { availableUnits: [{ unit: 'g', grams: 1 }, { unit: 'piece', grams: 70 }] }],
  ['Pakora (Mixed)', ['Bhajiya', 'Pakoda'], n(245, 5.5, 22, 14, 2.0, 1, 350)],
  ['Vada Pav', ['Vada Pav', 'Mumbai Vada Pav'], n(265, 6.5, 32, 12, 2.0, 2, 420), { availableUnits: [{ unit: 'g', grams: 1 }, { unit: 'piece', grams: 180 }] }],
  ['Pav Bhaji', ['Pav Bhaji'], n(185, 4.5, 22, 8.5, 2.5, 3, 380)],
  ['Dhokla', ['Khaman Dhokla'], n(175, 6.5, 24, 5.5, 1.5, 2, 320), { availableUnits: [{ unit: 'g', grams: 1 }, { unit: 'piece', grams: 50 }] }],
  ['Khandvi', ['Khandvi'], n(155, 5.5, 18, 6.0, 1.0, 1, 280)],
  ['Fafda', ['Fafda'], n(420, 10.0, 55, 18, 3.0, 1, 450)],
  ['Jalebi', ['Jalebi'], n(380, 2.0, 75, 10, 0.5, 55, 80)],
  ['Gulab Jamun', ['Gulab Jamun'], n(320, 4.5, 50, 11, 0.5, 40, 60), { availableUnits: [{ unit: 'g', grams: 1 }, { unit: 'piece', grams: 40 }] }],
  ['Rasgulla', ['Rasgulla', 'Rossogolla'], n(186, 4.0, 38, 2.5, 0, 35, 40), { availableUnits: [{ unit: 'g', grams: 1 }, { unit: 'piece', grams: 50 }] }],
  ['Ladoo (Besan)', ['Besan Ladoo'], n(420, 8.0, 50, 20, 3.0, 30, 50), { availableUnits: [{ unit: 'g', grams: 1 }, { unit: 'piece', grams: 35 }] }],
  ['Barfi (Milk)', ['Milk Barfi'], n(380, 7.0, 48, 17, 0.5, 40, 60)],
  ['Halwa (Sooji)', ['Sooji Halwa', 'Sheera'], n(285, 4.0, 42, 11, 0.5, 25, 40)],
  ['Halwa (Gajar)', ['Gajar Ka Halwa', 'Carrot Halwa'], n(245, 3.5, 32, 11, 1.5, 28, 45)],
  ['Namkeen (Mixture)', ['Mixture', 'Chivda'], n(480, 10.0, 48, 26, 4.0, 2, 650)],
  ['Bhujia (Sev)', ['Bhujia', 'Sev'], n(520, 12.0, 42, 32, 3.0, 1, 700)],
  ['Mathri', ['Mathri'], n(480, 8.0, 48, 28, 2.0, 1, 550)],
  ['Murukku', ['Murukku', 'Chakli'], n(460, 7.0, 50, 24, 2.5, 0.5, 480)],
  ['Banana Chips', ['Kela Chips', 'Nendran Chips'], n(520, 2.5, 58, 32, 4.0, 20, 300)],
  ['Potato Chips', ['Aloo Chips', 'Potato Chips'], n(536, 7.0, 53, 35, 4.8, 0.4, 525)],
  ['Popcorn (Buttered)', ['Popcorn'], n(455, 8.0, 52, 24, 9.0, 0.5, 400)],
  ['Biscuit (Parle G)', ['Parle G', 'Glucose Biscuit'], n(460, 7.0, 76, 14, 1.5, 20, 350)],
  ['Biscuit (Marie)', ['Marie Biscuit'], n(420, 8.0, 72, 10, 2.0, 18, 380)],
  ['Rusk', ['Toast Rusk'], n(400, 9.0, 68, 10, 2.5, 15, 400)],
  ['Bread (White)', ['Safed Bread', 'White Bread'], n(265, 9.0, 49, 3.2, 2.7, 5, 491), { availableUnits: [{ unit: 'g', grams: 1 }, { unit: 'slice', grams: 30 }] }],
  ['Bread (Brown)', ['Brown Bread', 'Whole Wheat Bread'], n(247, 10.0, 43, 3.5, 6.0, 4, 430), { availableUnits: [{ unit: 'g', grams: 1 }, { unit: 'slice', grams: 30 }] }],
  ['Sandwich (Veg)', ['Vegetable Sandwich'], n(195, 5.5, 28, 7.0, 2.0, 3, 380)],
  ['Maggi Noodles (Cooked)', ['Instant Noodles', 'Maggi'], n(145, 3.5, 20, 5.5, 0.8, 1, 520)],
  ['Bhel Puri', ['Bhel', 'Bhel Puri'], n(175, 4.5, 28, 5.5, 2.5, 3, 350)],
]);

// Drinks (25)
bulk('Drinks', 'drink', [
  ['Tea (with Milk & Sugar)', ['Chai', 'Masala Chai', 'Garam Chai'], n(35, 1.2, 5, 1.2, 0, 4, 15), { baseUnit: 'ml', availableUnits: liquidUnits(1, [{ unit: 'cup', grams: 200 }]) }],
  ['Tea (Black No Sugar)', ['Black Tea', 'Kali Chai'], n(1, 0, 0.3, 0, 0, 0, 3), { baseUnit: 'ml', isVegan: true }],
  ['Coffee (Filter with Milk)', ['Filter Coffee', 'Kaapi'], n(35, 1.5, 4, 1.5, 0, 3, 15), { baseUnit: 'ml' }],
  ['Coffee (Black)', ['Black Coffee', 'Americano'], n(2, 0.3, 0, 0, 0, 0, 5), { baseUnit: 'ml', isVegan: true }],
  ['Green Tea', ['Hari Chai', 'Green Tea'], n(1, 0, 0.2, 0, 0, 0, 3), { baseUnit: 'ml', isVegan: true }],
  ['Lassi (Sweet)', ['Meethi Lassi'], n(85, 3.0, 12, 2.5, 0, 10, 36), { baseUnit: 'ml', availableUnits: liquidUnits(1, [{ unit: 'glass', grams: 300 }]) }],
  ['Lassi (Salted)', ['Namkeen Lassi'], n(45, 2.5, 4, 1.5, 0, 2, 40), { baseUnit: 'ml' }],
  ['Buttermilk (Spiced)', ['Masala Chaas'], n(42, 2.0, 4, 1.2, 0, 2, 45), { baseUnit: 'ml' }],
  ['Nimbu Pani (Sweet)', ['Shikanji', 'Lemonade'], n(40, 0.2, 10, 0.1, 0.1, 9, 5), { baseUnit: 'ml', isVegan: true }],
  ['Nimbu Pani (Salted)', ['Namkeen Nimbu Pani'], n(15, 0.2, 3, 0.1, 0.1, 1, 200), { baseUnit: 'ml', isVegan: true }],
  ['Aam Panna', ['Raw Mango Drink'], n(55, 0.3, 14, 0.1, 0.2, 12, 150), { baseUnit: 'ml', isVegan: true }],
  ['Jaljeera', ['Jal Jeera'], n(20, 0.3, 4, 0.1, 0.2, 2, 250), { baseUnit: 'ml', isVegan: true }],
  ['Thandai', ['Thandai'], n(95, 3.0, 10, 5.0, 0.3, 8, 30), { baseUnit: 'ml' }],
  ['Sugarcane Juice', ['Ganne Ka Ras'], n(75, 0.3, 18, 0.1, 0, 16, 5), { baseUnit: 'ml', isVegan: true }],
  ['Tender Coconut Water', ['Nariyal Pani'], n(19, 0.7, 4, 0.2, 1.1, 2.6, 105), { baseUnit: 'ml', isVegan: true }],
  ['Fruit Juice (Orange)', ['Orange Juice', 'Santra Juice'], n(45, 0.7, 10, 0.2, 0.2, 8, 2), { baseUnit: 'ml', isVegan: true }],
  ['Fruit Juice (Apple)', ['Apple Juice', 'Seb Juice'], n(46, 0.1, 11, 0.1, 0.2, 10, 4), { baseUnit: 'ml', isVegan: true }],
  ['Mango Shake', ['Aam Shake', 'Mango Milkshake'], n(75, 2.5, 13, 1.8, 0.2, 12, 35), { baseUnit: 'ml' }],
  ['Banana Shake', ['Kele Ka Shake'], n(80, 2.8, 14, 1.5, 0.3, 12, 35), { baseUnit: 'ml' }],
  ['Protein Shake (Homemade)', ['Protein Shake'], n(65, 6.0, 6, 1.5, 0.2, 5, 40), { baseUnit: 'ml' }],
  ['Soda (Cola)', ['Cola', 'Soft Drink'], n(42, 0, 11, 0, 0, 11, 10), { baseUnit: 'ml', isVegan: true }],
  ['Soda (Sprite/Lemon)', ['Lemon Soda'], n(38, 0, 9, 0, 0, 9, 15), { baseUnit: 'ml', isVegan: true }],
  ['Energy Drink', ['Energy Drink'], n(45, 0, 11, 0, 0, 11, 80), { baseUnit: 'ml', isVegan: true }],
  ['Hot Chocolate', ['Hot Chocolate'], n(77, 3.0, 10, 3.0, 0.5, 8, 45), { baseUnit: 'ml' }],
  ['Badam Milk', ['Almond Milk Drink'], n(85, 3.5, 10, 3.5, 0.3, 8, 40), { baseUnit: 'ml' }],
]);

// Spices & Condiments (20)
bulk('Spices & Condiments', 'spice', [
  ['Turmeric Powder', ['Haldi', 'Turmeric'], n(312, 9.7, 67, 3.3, 22, 3.2, 27), { availableUnits: [{ unit: 'g', grams: 1 }, { unit: 'tsp', grams: 3 }] }],
  ['Red Chilli Powder', ['Lal Mirch Powder'], n(282, 12.0, 50, 14, 27, 10, 40)],
  ['Coriander Powder', ['Dhaniya Powder'], n(298, 12.0, 55, 18, 42, 0, 35)],
  ['Cumin Powder', ['Jeera Powder'], n(375, 18.0, 44, 22, 11, 2.3, 168)],
  ['Garam Masala', ['Garam Masala'], n(325, 14.0, 48, 15, 20, 2, 55)],
  ['Chaat Masala', ['Chaat Masala'], n(280, 10.0, 45, 10, 18, 3, 1200)],
  ['Black Pepper', ['Kali Mirch', 'Pepper'], n(251, 10.0, 64, 3.3, 25, 0.6, 20)],
  ['Cumin Seeds', ['Jeera', 'Cumin'], n(375, 18.0, 44, 22, 11, 2.3, 168)],
  ['Mustard Seeds', ['Rai', 'Sarson Dana'], n(508, 26.0, 28, 36, 12, 7, 13)],
  ['Fenugreek Seeds', ['Methi Dana'], n(323, 23.0, 58, 6.4, 25, 0, 67)],
  ['Cardamom (Green)', ['Elaichi', 'Cardamom'], n(311, 11.0, 68, 7, 28, 0, 18)],
  ['Cinnamon', ['Dalchini', 'Cinnamon'], n(247, 4.0, 81, 1.2, 53, 2.2, 10)],
  ['Cloves', ['Laung', 'Clove'], n(274, 6.0, 66, 13, 34, 2.3, 277)],
  ['Bay Leaf', ['Tej Patta'], n(313, 7.6, 75, 8.4, 26, 0, 23)],
  ['Asafoetida', ['Hing', 'Asafoetida'], n(297, 4.0, 68, 1.1, 4.1, 0, 50)],
  ['Tamarind (Concentrate)', ['Imli Concentrate'], n(75, 1.0, 18, 0.1, 0.5, 3, 30)],
  ['Tomato Ketchup', ['Ketchup', 'Tomato Sauce'], n(112, 1.3, 26, 0.2, 0.4, 22, 907), { baseUnit: 'ml' }],
  ['Soy Sauce', ['Soya Sauce'], n(53, 8.0, 5, 0.1, 0.8, 1.7, 5493), { baseUnit: 'ml' }],
  ['Vinegar', ['Sirka', 'Vinegar'], n(18, 0, 0.9, 0, 0, 0.4, 5), { baseUnit: 'ml', isVegan: true }],
  ['Salt', ['Namak', 'Table Salt'], n(0, 0, 0, 0, 0, 0, 38758), { availableUnits: [{ unit: 'g', grams: 1 }, { unit: 'tsp', grams: 6 }] }],
]);

// Paneer & Tofu (10)
bulk('Paneer & Tofu', 'paneer', [
  ['Paneer (Fresh)', ['Cottage Cheese', 'Fresh Paneer'], n(265, 18.0, 1.2, 20, 0, 1.2, 18)],
  ['Paneer Tikka (Grilled)', ['Grilled Paneer'], n(195, 14.0, 5, 14, 0.3, 1, 380)],
  ['Paneer Butter Masala', ['Butter Paneer'], n(175, 9.0, 8, 13, 0.5, 2, 350)],
  ['Palak Paneer', ['Saag Paneer'], n(145, 8.5, 6, 10, 2.0, 1, 320)],
  ['Paneer Bhurji', ['Paneer Bhurji'], n(195, 14.0, 4, 14, 0.3, 1, 360)],
  ['Paneer Paratha Filling', ['Paneer Paratha Mix'], n(220, 12.0, 15, 14, 1.5, 1, 340)],
  ['Paneer Pakora', ['Paneer Pakoda'], n(245, 10.0, 15, 16, 0.8, 1, 380)],
  ['Tofu (Firm)', ['Soy Paneer', 'Tofu'], n(76, 8.0, 1.9, 4.8, 0.3, 0.3, 7), { isVegan: true }],
  ['Tofu (Silken)', ['Silken Tofu'], n(55, 5.5, 1.5, 3.0, 0.2, 0.2, 5), { isVegan: true }],
  ['Soya Chaap', ['Soya Chaap', 'Mock Meat'], n(145, 16.0, 8, 5, 3.0, 1, 280), { isVegan: true }],
]);

// Other (10)
bulk('Other', 'other', [
  ['Honey', ['Shahad', 'Honey'], n(304, 0.3, 82, 0, 0.2, 82, 4), { baseUnit: 'ml', availableUnits: [{ unit: 'g', grams: 1 }, { unit: 'tbsp', grams: 21 }], isVegan: false }],
  ['Sugar (White)', ['Chini', 'Sugar'], n(387, 0, 100, 0, 0, 100, 1), { availableUnits: [{ unit: 'g', grams: 1 }, { unit: 'tsp', grams: 4 }] }],
  ['Brown Sugar', ['Shakkar', 'Brown Sugar'], n(380, 0, 98, 0, 0, 97, 28)],
  ['Jaggery Powder', ['Gur Powder', 'Gud'], n(383, 0.4, 98, 0.1, 0, 97, 25)],
  ['Baking Powder', ['Baking Powder'], n(53, 0, 28, 0, 0, 0, 10600)],
  ['Baking Soda', ['Meetha Soda'], n(0, 0, 0, 0, 0, 0, 27360)],
  ['Cornstarch', ['Corn Flour Starch', 'Ararot'], n(381, 0.3, 91, 0.1, 0.9, 0, 9)],
  ['Agar Agar', ['China Grass'], n(26, 0.5, 7, 0, 0.5, 0, 9), { isVegan: true }],
  ['Gelatin', ['Gelatin'], n(335, 85.0, 0, 0.1, 0, 0, 196), { isVegan: false }],
  ['Protein Powder (Whey)', ['Whey Protein'], n(400, 80.0, 8, 5, 0, 3, 200)],
]);

mkdirSync(dirname(OUT), { recursive: true });
mkdirSync(dirname(PUBLIC_OUT), { recursive: true });
const payload = JSON.stringify(foods, null, 2);
writeFileSync(OUT, payload);
writeFileSync(PUBLIC_OUT, payload);
console.log(`✅ Generated ${foods.length} foods → ${OUT}`);
console.log(`✅ Copied to ${PUBLIC_OUT}`);

