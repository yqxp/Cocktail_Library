// modal.js — openModal / closeModal / saveRecipe / deleteRecipe / ingredient rows / tag editor / star rating

import {
    recipes, inventory, aliasMap,
    currentRating, currentTags, setCurrentRating, setRecipes,
    PRESET_TAGS, UNIT_OPTIONS,
    save, ingredientListToString,
    resolveToPrimary
} from './data.js';
import { esc, escAttr, toast, render } from './render.js';

// ── Modal ──
const modalOverlay = document.getElementById('modalOverlay');
const modalClose = document.getElementById('modalClose');

export function openModal(title = '新配方') {
    document.getElementById('modalTitle').textContent = title;
    modalOverlay.classList.add('active');
}

export function closeModal() {
    modalOverlay.classList.remove('active');
    clearForm();
}

modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) closeModal(); });

function clearForm() {
    document.getElementById('editId').value = '';
    document.getElementById('formName').value = '';
    document.getElementById('formType').value = 'classic';
    document.getElementById('formBase').value = '';
    document.getElementById('formGlass').value = '';
    document.getElementById('formImage').value = '';
    document.getElementById('formMethod').value = '';
    document.getElementById('ingredientRows').innerHTML = '';
    setRatingStars(0);
    setCurrentRating(0);
    currentTags.length = 0;
    renderTagEditor();
}

// ── Ingredient Editor ──
export function addIngredientRow(data) {
    const row = document.createElement('div');
    row.className = 'form-row ingredient-row';
    row.innerHTML = `
        <div class="form-group" style="flex:1;">
            <input type="text" class="ing-amount" placeholder="数量" value="${escAttr(data?.amount||'')}">
        </div>
        <div class="form-group" style="flex:1;">
            <select class="ing-unit">
                <option value="">—</option>
                ${UNIT_OPTIONS.map(u => `<option value="${u}" ${(data?.unit||'')===u?'selected':''}>${u==='__custom'?'自定义':u}</option>`).join('')}
            </select>
        </div>
        <div class="form-group ing-autocomplete-wrap" style="flex:2;">
            <input type="text" class="ing-material" placeholder="材料名称" value="${escAttr(data?.material||'')}">
        </div>
        <button class="ing-remove-btn" title="移除此行">×</button>
    `;
    const matInput = row.querySelector('.ing-material');
    matInput.addEventListener('input', function() {
        showIngredientAutocomplete(this);
    });
    matInput.addEventListener('blur', function() {
        setTimeout(() => {
            const dd = document.getElementById('ingAutocompleteDropdown');
            if (dd) dd.remove();
        }, 200);
    });
    row.querySelector('.ing-remove-btn').addEventListener('click', () => row.remove());
    document.getElementById('ingredientRows').appendChild(row);
}

export function showIngredientAutocomplete(inputEl) {
    const val = inputEl.value.toLowerCase().trim();
    let existing = document.getElementById('ingAutocompleteDropdown');
    if (existing) existing.remove();
    if (!val) return;

    const matches = [];
    const seen = new Set();
    for (const inv of inventory) {
        if (inv.toLowerCase().includes(val) && !seen.has(inv.toLowerCase())) {
            matches.push(inv);
            seen.add(inv.toLowerCase());
        }
    }
    for (const entry of aliasMap) {
        if (entry.primary.toLowerCase().includes(val) && !seen.has(entry.primary.toLowerCase())) {
            matches.push(entry.primary);
            seen.add(entry.primary.toLowerCase());
        }
        for (const alias of entry.aliases) {
            if (alias.toLowerCase().includes(val) && !seen.has(alias.toLowerCase())) {
                matches.push(alias);
                seen.add(alias.toLowerCase());
            }
        }
    }

    if (matches.length === 0) return;

    const dropdown = document.createElement('div');
    dropdown.id = 'ingAutocompleteDropdown';
    dropdown.className = 'autocomplete-dropdown active';
    matches.slice(0, 8).forEach(m => {
        const item = document.createElement('div');
        item.className = 'autocomplete-item';
        item.textContent = m;
        item.addEventListener('mousedown', e => {
            e.preventDefault();
            inputEl.value = m;
            dropdown.remove();
        });
        dropdown.appendChild(item);
    });
    inputEl.parentElement.appendChild(dropdown);
}

export function getIngredientListFromForm() {
    const rows = document.querySelectorAll('.ingredient-row');
    const list = [];
    rows.forEach(row => {
        const amount = row.querySelector('.ing-amount').value.trim();
        const unit = row.querySelector('.ing-unit').value;
        const material = row.querySelector('.ing-material').value.trim();
        if (material) {
            list.push({ amount, unit, material });
        }
    });
    return list;
}

export function fillIngredients(list) {
    const container = document.getElementById('ingredientRows');
    container.innerHTML = '';
    if (!list || list.length === 0) {
        addIngredientRow(null);
    } else {
        list.forEach(ing => addIngredientRow(ing));
    }
}

// ── Tag Editor ──
export function renderTagEditor() {
    const container = document.getElementById('tagEditorChips');
    let html = '';
    PRESET_TAGS.forEach(t => {
        const sel = currentTags.includes(t) ? ' selected' : '';
        html += `<span class="tag-editor-chip${sel}" data-tag="${t}">${t}</span>`;
    });
    currentTags.forEach(t => {
        if (!PRESET_TAGS.includes(t)) {
            html += `<span class="tag-editor-chip selected custom">${esc(t)}<span class="tag-remove" data-tag="${escAttr(t)}">×</span></span>`;
        }
    });
    container.innerHTML = html;

    container.querySelectorAll('.tag-editor-chip:not(.custom)').forEach(chip => {
        chip.addEventListener('click', () => {
            const t = chip.dataset.tag;
            if (currentTags.includes(t)) {
                const idx = currentTags.indexOf(t);
                if (idx !== -1) currentTags.splice(idx, 1);
            } else {
                currentTags.push(t);
            }
            renderTagEditor();
        });
    });

    container.querySelectorAll('.tag-remove').forEach(btn => {
        btn.addEventListener('click', e => {
            e.stopPropagation();
            const t = btn.dataset.tag;
            const idx = currentTags.indexOf(t);
            if (idx !== -1) currentTags.splice(idx, 1);
            renderTagEditor();
        });
    });
}

// ── Star Rating Editor ──
export function setRatingStars(val) {
    setCurrentRating(val);
    const stars = document.querySelectorAll('#starRatingEdit .star');
    stars.forEach(s => {
        const v = parseInt(s.dataset.val);
        s.classList.toggle('filled', v <= val);
    });
}

// ── CRUD (exposed to window for event delegation in app.js) ──
export function editRecipe(id) {
    const r = recipes.find(r => r.id === id);
    if (!r) return;
    document.getElementById('editId').value = r.id;
    document.getElementById('formName').value = r.name;
    document.getElementById('formType').value = r.type;
    document.getElementById('formBase').value = r.base || '';
    document.getElementById('formGlass').value = r.glass || '';
    document.getElementById('formImage').value = r.image || '';
    document.getElementById('formMethod').value = r.method;
    fillIngredients(r.ingredientList || []);
    currentTags.length = 0;
    currentTags.push(...(r.tags || []));
    renderTagEditor();
    setRatingStars(r.rating || 0);
    openModal('编辑配方');
}

export function deleteRecipe(id) {
    if (!confirm('确定删除这个配方吗？')) return;
    setRecipes(recipes.filter(r => r.id !== id));
    save();
    render();
    toast('配方已删除');
}

export function saveRecipe() {
    const id = document.getElementById('editId').value;
    const ingredientList = getIngredientListFromForm();
    if (ingredientList.length === 0) { toast('请至少添加一种配料'); return; }

    const existing = id ? recipes.find(r => r.id === id) : null;

    const data = {
        id: id || Date.now().toString(),
        name: document.getElementById('formName').value.trim(),
        type: document.getElementById('formType').value,
        base: document.getElementById('formBase').value,
        glass: document.getElementById('formGlass').value.trim(),
        image: document.getElementById('formImage').value.trim(),
        ingredientList: ingredientList,
        ingredients: ingredientListToString(ingredientList),
        method: document.getElementById('formMethod').value.trim(),
        tags: [...currentTags],
        rating: currentRating,
        createdAt: existing ? existing.createdAt : new Date().toISOString()
    };
    if (!data.name) { toast('请填写配方名称'); return; }

    if (id) {
        const idx = recipes.findIndex(r => r.id === id);
        if (idx !== -1) recipes[idx] = data;
    } else {
        recipes.push(data);
    }
    save();
    closeModal();
    render();
    toast(id ? '配方已更新' : '配方已保存');
}

// ── Image Upload ──
let pendingCardId = null;
const hiddenInput = document.getElementById('hiddenFileInput');

export function uploadImageForCard(cardId) {
    pendingCardId = cardId;
    hiddenInput.click();
}

hiddenInput.addEventListener('change', function() {
    if (!this.files || !this.files[0]) return;
    const file = this.files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
        const recipe = recipes.find(r => r.id === pendingCardId);
        if (recipe) {
            recipe.image = e.target.result;
            save();
            render();
            toast('图片已更新');
        }
        pendingCardId = null;
    };
    reader.readAsDataURL(file);
    this.value = '';
});
