// app.js — DOM ready, event listeners wiring, keyboard shortcuts, init calls

import {
    recipes, inventory, aliasMap,
    currentFilter, currentSort, activeTagFilters,
    currentRating, currentTags,
    setCurrentFilter, setCurrentSort, setCurrentRating,
    THEME_KEY,
    load, save, loadInventory, loadAliasMap, loadAvatar
} from './data.js';
import { loadTheme, applyTheme, updateThemeButtons } from './theme.js';
import { render, renderTagFilters, esc, escAttr, toast } from './render.js';
import {
    openModal, closeModal, saveRecipe,
    editRecipe, deleteRecipe,
    addIngredientRow, fillIngredients,
    renderTagEditor, setRatingStars,
    uploadImageForCard
} from './modal.js';
import {
    openDrawer, closeDrawer,
    setupAvatar
} from './inventory.js';

// ── Sidebar toggle ──
document.getElementById('toggleSidebar').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('collapsed');
});

// ── Nav items ──
document.querySelectorAll('.nav-item').forEach(el => {
    el.addEventListener('click', () => {
        setCurrentFilter(el.dataset.filter);
        render();
    });
});

// ── Search ──
document.getElementById('searchInput').addEventListener('input', render);

// ── Sort ──
document.getElementById('sortSelect').addEventListener('change', function() {
    setCurrentSort(this.value);
    render();
});

// ── Theme buttons ──
document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        applyTheme(btn.dataset.theme);
    });
});

// ── Tag filter clear ──
document.getElementById('tagFilterClear').addEventListener('click', () => {
    activeTagFilters.length = 0;
    renderTagFilters();
    render();
});

// ── Add recipe button ──
document.getElementById('btnAdd').addEventListener('click', () => {
    // clearForm is called inside openModal via closeModal pattern; do explicit clear first
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
    addIngredientRow(null);
    openModal('新配方');
});

// ── Save button ──
document.getElementById('btnSave').addEventListener('click', saveRecipe);

// ── Add ingredient row button ──
document.getElementById('addIngredientBtn').addEventListener('click', () => addIngredientRow(null));

// ── Custom tag ──
document.getElementById('addCustomTagBtn').addEventListener('click', () => {
    const input = document.getElementById('customTagInput');
    const val = input.value.trim().toLowerCase();
    if (!val) return;
    if (currentTags.includes(val)) { import('./render.js').then(m => m.toast('该标签已存在')); return; }
    currentTags.push(val);
    renderTagEditor();
    input.value = '';
    input.focus();
});
document.getElementById('customTagInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('addCustomTagBtn').click();
});

// ── Star rating editor ──
document.getElementById('starRatingEdit').addEventListener('click', e => {
    const star = e.target.closest('.star');
    if (!star) return;
    const val = parseInt(star.dataset.val);
    setRatingStars(currentRating === val ? 0 : val);
});

// ── Card action delegation (edit / delete / image upload) ──
document.getElementById('recipeGrid').addEventListener('click', e => {
    // Edit button
    const editBtn = e.target.closest('.card-edit-btn');
    if (editBtn) {
        const card = editBtn.closest('.card');
        if (card) editRecipe(card.dataset.id);
        return;
    }
    // Delete button
    const delBtn = e.target.closest('.card-delete-btn');
    if (delBtn) {
        const card = delBtn.closest('.card');
        if (card) deleteRecipe(card.dataset.id);
        return;
    }
    // Card image click
    const cardImg = e.target.closest('.card-img');
    if (cardImg) {
        const cardId = cardImg.dataset.cardId;
        if (cardId) uploadImageForCard(cardId);
        return;
    }
});

// ── Avatar setup ──
setupAvatar();

// ── Keyboard ──
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeModal(); closeDrawer(); }
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('searchInput').focus();
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        document.getElementById('sidebar').classList.toggle('collapsed');
    }
});

// ── Init ──
applyTheme(loadTheme());
load();
loadInventory();
loadAliasMap();
loadAvatar();
render();
