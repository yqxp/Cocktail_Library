// render.js — render(), renderTagFilters(), buildCardStarsHtml(), formatIngredientDisplay()

import {
    recipes, inventory, aliasMap,
    currentFilter, currentSort, activeTagFilters,
    PRESET_TAGS,
    save, hasSingleIngredient, typeLabel, baseLabel, setActiveTagFilters
} from './data.js';

// esc / escAttr — used throughout
export function esc(s) {
    const div = document.createElement('div');
    div.textContent = s || '';
    return div.innerHTML;
}

export function escAttr(s) {
    return (s||'').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// formatIngredientDisplay re-exported from data for convenience
import { formatIngredientDisplay } from './data.js';
export { formatIngredientDisplay };

export function buildCardStarsHtml(r) {
    const rating = r.rating || 0;
    let html = '<div class="card-rating" title="点击评分">';
    for (let i = 1; i <= 5; i++) {
        html += `<span class="star${i <= rating ? ' filled' : ''}" data-val="${i}">★</span>`;
    }
    html += '</div>';
    return html;
}

export function render() {
    const col0 = document.getElementById('col0');
    const col1 = document.getElementById('col1');
    const col2 = document.getElementById('col2');
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();

    let filtered = [...recipes];

    if (currentFilter !== 'all') {
        filtered = filtered.filter(r => r.type === currentFilter || r.base === currentFilter);
    }

    if (activeTagFilters.length > 0) {
        filtered = filtered.filter(r =>
            activeTagFilters.every(tag => (r.tags || []).includes(tag))
        );
    }

    if (searchTerm) {
        filtered = filtered.filter(r =>
            r.name.toLowerCase().includes(searchTerm) ||
            (r.ingredientList || []).some(i => (i.material||'').toLowerCase().includes(searchTerm)) ||
            (r.ingredients||'').toLowerCase().includes(searchTerm) ||
            (r.base||'').toLowerCase().includes(searchTerm)
        );
    }

    switch (currentSort) {
        case 'rating':
            filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
            break;
        case 'az':
            filtered.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));
            break;
        case 'za':
            filtered.sort((a, b) => b.name.localeCompare(a.name, 'zh-CN'));
            break;
        case 'random':
            for (let i = filtered.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [filtered[i], filtered[j]] = [filtered[j], filtered[i]];
            }
            break;
        default:
            filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
            break;
    }

    col0.innerHTML = '';
    col1.innerHTML = '';
    col2.innerHTML = '';

    if (filtered.length === 0) {
        col0.innerHTML = `<div class="empty-state"><div class="icon">◇</div><p>暂无匹配的配方</p></div>`;
    } else {
        const cols = [col0, col1, col2];
        filtered.forEach(r => {
            let shortest = cols[0];
            let minH = shortest.scrollHeight;
            for (let i = 1; i < cols.length; i++) {
                const h = cols[i].scrollHeight;
                if (h < minH) { minH = h; shortest = cols[i]; }
            }
            const tagsHtml = (r.tags && r.tags.length > 0)
                ? `<div class="card-tags">${r.tags.map(t => `<span class="tag-chip ${PRESET_TAGS.includes(t)?t:''}">${esc(t)}</span>`).join('')}</div>`
                : '';
            const starsHtml = buildCardStarsHtml(r);
            const list = r.ingredientList || [];
            const ingHtml = list.map(ing => {
                const display = formatIngredientDisplay(ing);
                const has = hasSingleIngredient(ing);
                const cls = has ? '' : 'missing';
                return `<div class="${cls}"><span>—</span> ${esc(display)}</div>`;
            }).join('');

            shortest.insertAdjacentHTML('beforeend', `
                <div class="card" data-id="${r.id}">
                    <div class="card-img" data-card-id="${r.id}">
                        ${r.image ? `<img src="${r.image}" alt="${escAttr(r.name)}" onerror="this.style.display='none';this.parentElement.querySelector('.placeholder-text').style.display='block';">` : ''}
                        <span class="placeholder-text" style="${r.image ? 'display:none' : 'display:flex;align-items:center;justify-content:center;height:100%;'}">点击上传图片</span>
                        <div class="upload-hint">更换图片</div>
                    </div>
                    <div class="card-body">
                        <div class="card-type">${typeLabel(r.type)}${r.base ? ' · ' + baseLabel(r.base) : ''}</div>
                        <div class="card-title">${esc(r.name)}</div>
                        <div class="card-glass">${esc(r.glass) || '未指定杯型'}</div>
                        ${starsHtml}
                        ${tagsHtml}
                        <div class="card-ingredients">${ingHtml}</div>
                        <div class="card-method">${esc(r.method)}</div>
                        <div class="card-actions">
                            <button class="btn card-edit-btn">编辑</button>
                            <button class="btn card-delete-btn" style="border-color:var(--danger-border);color:var(--danger-color);">删除</button>
                        </div>
                    </div>
                </div>
            `);
        });
    }

    // Star click — card rating
    document.querySelectorAll('.card-rating').forEach(el => {
        el.addEventListener('click', function(e) {
            const star = e.target.closest('.star');
            if (!star) return;
            const val = parseInt(star.dataset.val);
            const card = el.closest('.card');
            const id = card.dataset.id;
            const recipe = recipes.find(r => r.id === id);
            if (recipe) {
                recipe.rating = (recipe.rating === val) ? 0 : val;
                save();
                render();
                toast(recipe.rating ? '评分 ' + recipe.rating + ' ★' : '已取消评分');
            }
        });
    });

    updateCounts();
    updateActiveNav();
    renderTagFilters();
}

export function renderTagFilters() {
    const container = document.getElementById('tagFilterChips');
    const clearBtn = document.getElementById('tagFilterClear');
    const allTags = new Set();
    recipes.forEach(r => (r.tags || []).forEach(t => allTags.add(t)));

    if (allTags.size === 0) {
        container.innerHTML = '<span style="color:var(--text-dim);font-size:0.62rem;">暂无标签</span>';
        clearBtn.classList.remove('visible');
        return;
    }

    const sorted = [...allTags].sort();
    container.innerHTML = sorted.map(t => {
        const active = activeTagFilters.includes(t);
        return `<span class="tag-filter-chip${active ? ' active' : ''}" data-tag-filter="${escAttr(t)}">${esc(t)}</span>`;
    }).join('');

    container.querySelectorAll('.tag-filter-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const t = chip.dataset.tagFilter;
            if (activeTagFilters.includes(t)) {
                setActiveTagFilters(activeTagFilters.filter(x => x !== t));
            } else {
                activeTagFilters.push(t);
            }
            renderTagFilters();
            render();
        });
    });

    clearBtn.classList.toggle('visible', activeTagFilters.length > 0);
}

function updateCounts() {
    document.getElementById('countAll').textContent = recipes.length;
    document.getElementById('countClassic').textContent = recipes.filter(r=>r.type==='classic').length;
    document.getElementById('countModern').textContent = recipes.filter(r=>r.type==='modern').length;
    document.getElementById('countTiki').textContent = recipes.filter(r=>r.type==='tiki').length;
    document.getElementById('countMocktail').textContent = recipes.filter(r=>r.type==='mocktail').length;
}

function updateActiveNav() {
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    const match = document.querySelector(`.nav-item[data-filter="${currentFilter}"]`);
    if (match) match.classList.add('active');
}

// ── Toast ──
let toastTimer;
export function toast(msg) {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 2200);
}
