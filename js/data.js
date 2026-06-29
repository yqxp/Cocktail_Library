// data.js — constants, state vars, localStorage, seed defaults, migration

export const STORAGE_KEY = 'yue_cocktail_library';
export const INVENTORY_KEY = 'yue_cocktail_inventory';
export const AVATAR_KEY = 'yue_cocktail_avatar';
export const ALIAS_MAP_KEY = 'yue_cocktail_alias_map';
export const THEME_KEY = 'yue_cocktail_theme';

export const PRESET_TAGS = ['sour','sweet','bitter','creamy','refreshing','dry','fruity','herbal','smoky','strong','floral','spicy'];
export const UNIT_OPTIONS = ['oz','ml','cl','dash','滴','茶匙','汤匙','片','个','颗','杯','份','__custom'];

// ── State ──
export let recipes = [];
export let inventory = [];
export let currentFilter = 'all';
export let currentSort = 'default';
export let activeTagFilters = [];
export let aliasMap = [];
export let currentRating = 0;
export let currentTags = [];

// ── State setters (for cross-module reassignment; import bindings are read-only) ──
export function setCurrentFilter(val) { currentFilter = val; }
export function setCurrentSort(val) { currentSort = val; }
export function setCurrentRating(val) { currentRating = val; }
export function setRecipes(val) { recipes = val; }
export function setActiveTagFilters(val) { activeTagFilters = val; }
export function setInventory(val) { inventory = val; }
export function setAliasMap(val) { aliasMap = val; }

// ── Load / Save ──
export function load() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        recipes = raw ? JSON.parse(raw) : getDefaults();
    } catch(e) { recipes = getDefaults(); }
    migrateRecipes();
}

export function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
}

export function loadInventory() {
    try {
        const raw = localStorage.getItem(INVENTORY_KEY);
        inventory = raw ? JSON.parse(raw) : getDefaultInventory();
    } catch(e) { inventory = getDefaultInventory(); }
}

export function saveInventory() {
    localStorage.setItem(INVENTORY_KEY, JSON.stringify(inventory));
}

export function getDefaultInventory() {
    return [
        'White Rum', 'Aged Rum', 'Gin', 'Vodka',
        'Lime', 'Simple Syrup',
        'Cream de Cacao (White)', 'Cream de Cacao (Black)',
        'Baileys'
    ];
}

export function loadAliasMap() {
    try {
        const raw = localStorage.getItem(ALIAS_MAP_KEY);
        aliasMap = raw ? JSON.parse(raw) : getDefaultAliasMap();
    } catch(e) { aliasMap = getDefaultAliasMap(); }
}

export function saveAliasMap() {
    localStorage.setItem(ALIAS_MAP_KEY, JSON.stringify(aliasMap));
}

export function getDefaultAliasMap() {
    return [
        { id: 'a1', primary: 'White Rum', aliases: ['白朗姆', 'Light Rum', '白朗姆酒'] },
        { id: 'a2', primary: 'Aged Rum', aliases: ['陈年朗姆', 'Dark Rum', '黑朗姆'] },
        { id: 'a3', primary: 'Gin', aliases: ['金酒', '琴酒', '杜松子酒', 'Dry Gin'] },
        { id: 'a4', primary: 'Vodka', aliases: ['伏特加'] },
        { id: 'a5', primary: 'Lime', aliases: ['青柠', '青柠汁', 'Lime Juice', '莱姆', '莱姆汁'] },
        { id: 'a6', primary: 'Simple Syrup', aliases: ['糖浆', 'Sugar Syrup', '单糖浆'] },
        { id: 'a7', primary: 'Cream de Cacao (White)', aliases: ['白色可可利口酒', '白可可'] },
        { id: 'a8', primary: 'Cream de Cacao (Black)', aliases: ['黑色可可利口酒', '黑可可'] },
        { id: 'a9', primary: 'Baileys', aliases: ['百利甜', '百利甜酒'] },
        { id: 'a10', primary: 'Sweet Vermouth', aliases: ['甜味美思', '红味美思', 'Rosso Vermouth'] },
        { id: 'a11', primary: 'Dry Vermouth', aliases: ['干味美思', '白味美思'] },
        { id: 'a12', primary: 'Campari', aliases: ['金巴利'] },
        { id: 'a13', primary: 'Coffee Liqueur', aliases: ['咖啡利口酒', 'Kahlua', '甘露咖啡'] },
        { id: 'a14', primary: 'Cointreau', aliases: ['橙味利口酒', '君度', 'Triple Sec'] },
        { id: 'a15', primary: 'Orgeat', aliases: ['杏仁糖浆', 'Orgeat Syrup'] },
        { id: 'a16', primary: 'Mint', aliases: ['薄荷', '薄荷叶'] },
        { id: 'a17', primary: 'Soda Water', aliases: ['苏打水', '苏打', 'Club Soda'] },
        { id: 'a18', primary: 'Tonic Water', aliases: ['汤力水'] },
        { id: 'a19', primary: 'Sugar', aliases: ['砂糖', '白糖', '白砂糖'] },
        { id: 'a20', primary: 'Espresso', aliases: ['浓缩咖啡', '意式浓缩'] }
    ];
}

export function loadAvatar() {
    const data = localStorage.getItem(AVATAR_KEY);
    const img = document.getElementById('avatarImg');
    if (data) {
        img.innerHTML = '';
        const pic = document.createElement('img');
        pic.src = data;
        pic.style.cssText = 'width:100%;height:100%;border-radius:50%;object-fit:cover;';
        img.appendChild(pic);
    }
}

export function getDefaults() {
    return [
        { id:'1', name:'Daiquiri', type:'classic', base:'rum', glass:'Coupe Glass', image:'', ingredients:'2oz Light Rum\n3/4oz Lime Juice\n1/2oz Syrup', method:'所有材料加冰摇匀，双重过滤至冰过的Coupe杯中。青柠轮装饰。', tags:[], rating:0, createdAt:'2025-09-22T00:00:00.000Z' },
        { id:'2', name:'Negroni', type:'classic', base:'gin', glass:'Old Fashioned Glass', image:'', ingredients:'1oz Gin\n1oz Campari\n1oz Sweet Vermouth', method:'直接在加冰的Old Fashioned杯中搅拌。橙皮扭花装饰。', tags:[], rating:0, createdAt:'2025-10-15T00:00:00.000Z' },
        { id:'3', name:'Martini', type:'classic', base:'gin', glass:'Martini Glass', image:'', ingredients:'2 1/2oz Gin\n1/2oz Dry Vermouth', method:'所有材料加冰搅拌至充分冷却，过滤至冰过的马天尼杯中。橄榄或柠檬皮扭花装饰。', tags:[], rating:0, createdAt:'2025-11-03T00:00:00.000Z' },
        { id:'4', name:'Papa Doble', type:'classic', base:'rum', glass:'Coupe Glass', image:'', ingredients:'3oz Light Rum\n1/2oz 青柠汁\n1/2oz 葡萄柚汁\n1/4oz Maraschino利口酒', method:'所有材料加碎冰剧烈摇匀，双重过滤至冰过的Coupe杯中。不加糖，海明威的最爱。', tags:[], rating:0, createdAt:'2025-12-08T00:00:00.000Z' },
        { id:'5', name:"Hitler's Jitters", type:'classic', base:'rum', glass:'Coupe Glass', image:'', ingredients:'3oz Light Rum\n1/2oz Cream de Cacao (White)\n1oz Lime Juice\n1/2oz Simple Syrup', method:'所有材料加冰剧烈摇匀，过滤至冰过的Coupe杯中。可可粉轻撒装饰。', tags:[], rating:0, createdAt:'2026-01-14T00:00:00.000Z' },
        { id:'9', name:'Gin Fizz', type:'classic', base:'gin', glass:'Highball Glass', image:'', ingredients:'2oz Gin\n3/4oz 青柠汁\n1/2oz 糖浆\n苏打水', method:'Gin、青柠汁、糖浆加冰摇匀，过滤至加冰的Highball杯中，注满苏打水。轻轻提拉搅拌。', tags:[], rating:0, createdAt:'2026-05-01T00:00:00.000Z' }
    ];
}

// ── MIGRATION: convert string ingredients to structured, add createdAt ──
function parseIngredientLine(line) {
    const trimmed = line.trim();
    if (!trimmed) return null;
    let m = trimmed.match(/^(\d+(?:\s+\d+\/\d+)?(?:\/\d+)?)\s*(ml|oz|cl|滴|茶匙|汤匙|片|个|颗|杯|份|oz\.?)?\s*(.+)$/i);
    if (m) {
        return { amount: m[1] || '', unit: (m[2] || '').replace(/\.$/,''), material: (m[3] || '').trim() };
    }
    m = trimmed.match(/^(\d+)?\s*(dash|barspoon|dashes)\s+(.+)$/i);
    if (m) {
        return { amount: m[1] || '1', unit: 'dash', material: (m[3] || '').trim() };
    }
    return { amount: '', unit: '', material: trimmed };
}

export function migrateRecipes() {
    let changed = false;
    recipes.forEach(r => {
        if (!r.ingredientList) {
            if (typeof r.ingredients === 'string') {
                r.ingredientList = r.ingredients.split('\n').map(parseIngredientLine).filter(Boolean);
            } else {
                r.ingredientList = [];
            }
            changed = true;
        }
        if (!r.tags) { r.tags = []; changed = true; }
        if (r.rating === undefined) { r.rating = 0; changed = true; }
        if (!r.createdAt) { r.createdAt = new Date().toISOString(); changed = true; }
    });
    if (changed) save();
}

export function ingredientListToString(list) {
    return list.map(i => {
        if (!i.material) return '';
        let s = '';
        if (i.amount) s += i.amount;
        if (i.unit && i.unit !== '__custom') s += (i.amount ? '' : '') + i.unit;
        if (s) s += ' ';
        s += i.material;
        return s;
    }).filter(Boolean).join('\n');
}

export function formatIngredientDisplay(ing) {
    if (!ing.material) return '';
    let s = '';
    if (ing.amount) s += ing.amount;
    if (ing.unit && ing.unit !== '__custom') s += (s ? '' : '') + ing.unit;
    if (s) s += ' ';
    s += ing.material;
    return s;
}

// ── hasIngredient (single & per-recipe) ──
export function hasSingleIngredient(ing) {
    const material = (ing.material || '').trim();
    if (!material) return true;
    const core = material.toLowerCase();
    const stockSet = new Set(inventory.map(s => s.toLowerCase().trim()));

    if (stockSet.has(core)) return true;
    const primary = resolveAlias(core);
    if (primary && stockSet.has(primary.toLowerCase())) return true;

    const aliasEntry = aliasMap.find(e => e.primary.toLowerCase() === (primary || core));
    if (aliasEntry) {
        for (const alias of aliasEntry.aliases) {
            if (stockSet.has(alias.toLowerCase())) return true;
        }
    }

    for (const inv of inventory) {
        const invLow = inv.toLowerCase();
        if (core.includes(invLow) || invLow.includes(core)) return true;
    }
    return false;
}

export function hasAllIngredients(recipe) {
    const list = recipe.ingredientList || [];
    if (list.length === 0) return false;
    return list.every(ing => hasSingleIngredient(ing));
}

export function resolveAlias(core) {
    for (const entry of aliasMap) {
        if (entry.primary.toLowerCase() === core) return entry.primary;
        for (const alias of entry.aliases) {
            if (alias.toLowerCase() === core) return entry.primary;
        }
    }
    return null;
}

export function resolveToPrimary(name) {
    const core = name.toLowerCase().trim();
    for (const entry of aliasMap) {
        if (entry.primary.toLowerCase() === core) return entry.primary;
        for (const alias of entry.aliases) {
            if (alias.toLowerCase() === core) return entry.primary;
        }
    }
    return name;
}

export function typeLabel(t) {
    const map = { classic:'经典鸡尾酒', modern:'现代调酒', tiki:'Tiki风格', mocktail:'无酒精' };
    return map[t] || t;
}

export function baseLabel(b) {
    const map = { gin:'Gin', vodka:'Vodka', rum:'Rum', whiskey:'Whiskey', tequila:'Tequila' };
    return map[b] || b;
}
