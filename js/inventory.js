// inventory.js — openDrawer / closeDrawer / renderInventory / addInventoryItem / alias table / avatar / autocomplete

import {
    inventory, aliasMap,
    AVATAR_KEY,
    saveInventory, saveAliasMap, loadAvatar, resolveToPrimary
} from './data.js';
import { esc, escAttr, toast, render } from './render.js';

// ── Inventory Drawer ──
const drawerOverlay = document.getElementById('drawerOverlay');
const inventoryDrawer = document.getElementById('inventoryDrawer');
const drawerClose = document.getElementById('drawerClose');
const inventoryInput = document.getElementById('inventoryInput');
const inventoryAddBtn = document.getElementById('inventoryAddBtn');

export function renderAliasTable() {
    const table = document.getElementById('aliasTable');
    let html = '<tr><th>主名称</th><th>别名列表</th><th style="text-align:right;">操作</th></tr>';
    aliasMap.forEach((entry, idx) => {
        html += `<tr>
            <td class="alias-primary">${esc(entry.primary)}</td>
            <td class="alias-aliases">${entry.aliases.map(a => `<span class="alias-chip-sm">${esc(a)}</span>`).join(' ')}</td>
            <td class="alias-actions">
                <span class="act-edit" data-eidx="${idx}" title="编辑">✎</span>
                <span class="act-del" data-didx="${idx}" title="删除">×</span>
            </td>
        </tr>`;
    });
    table.innerHTML = html;

    table.querySelectorAll('.act-del').forEach(el => {
        el.addEventListener('click', () => {
            if (!confirm('确定删除"' + aliasMap[parseInt(el.dataset.didx)].primary + '"的映射吗？')) return;
            aliasMap.splice(parseInt(el.dataset.didx), 1);
            saveAliasMap();
            renderAliasTable();
            render();
            toast('别名映射已删除');
        });
    });

    table.querySelectorAll('.act-edit').forEach(el => {
        el.addEventListener('click', () => {
            const idx = parseInt(el.dataset.eidx);
            editAliasRow(idx);
        });
    });

    document.getElementById('aliasAddBtn').onclick = () => addAliasRow();
}

export function editAliasRow(idx) {
    const entry = aliasMap[idx];
    const table = document.getElementById('aliasTable');
    const row = table.rows[idx + 1];
    row.innerHTML = `<td><input class="alias-edit-input" id="editPrimary" value="${escAttr(entry.primary)}"></td>
        <td><input class="alias-edit-aliases-input" id="editAliases" value="${escAttr(entry.aliases.join(', '))}" placeholder="逗号分隔"></td>
        <td class="alias-actions">
            <span class="act-edit" id="saveEdit" style="color:var(--gold);">✓</span>
            <span id="cancelEdit" style="margin-left:8px;">✕</span>
        </td>`;
    document.getElementById('saveEdit').addEventListener('click', () => {
        const primary = document.getElementById('editPrimary').value.trim();
        const aliases = document.getElementById('editAliases').value.split(',').map(s => s.trim()).filter(Boolean);
        if (!primary) { toast('主名称不能为空'); return; }
        aliasMap[idx] = { ...entry, primary, aliases };
        saveAliasMap();
        renderAliasTable();
        render();
        toast('别名映射已更新');
    });
    document.getElementById('cancelEdit').addEventListener('click', () => renderAliasTable());
}

export function addAliasRow() {
    const newId = 'a' + Date.now();
    aliasMap.push({ id: newId, primary: '', aliases: [] });
    const idx = aliasMap.length - 1;
    saveAliasMap();
    renderAliasTable();
    editAliasRow(idx);
}

export function openDrawer() {
    drawerOverlay.classList.add('active');
    inventoryDrawer.classList.add('active');
    renderInventory();
    renderAliasTable();
    inventoryInput.focus();
}

export function closeDrawer() {
    drawerOverlay.classList.remove('active');
    inventoryDrawer.classList.remove('active');
}

drawerClose.addEventListener('click', closeDrawer);
drawerOverlay.addEventListener('click', e => { if (e.target === drawerOverlay) closeDrawer(); });

document.getElementById('aliasToggle').addEventListener('click', () => {
    const header = document.getElementById('aliasToggle');
    const wrap = document.getElementById('aliasTableWrap');
    const isOpen = header.classList.toggle('open');
    wrap.style.display = isOpen ? 'block' : 'none';
});

export function renderInventory() {
    const drawerBody = document.getElementById('inventoryChips');
    if (inventory.length === 0) {
        drawerBody.innerHTML = '<div style="color:var(--text-dim);font-size:0.82rem;text-align:center;padding:40px 0;">酒柜空空如也</div>';
        return;
    }
    drawerBody.innerHTML = inventory.map((item, i) => `
        <span class="inventory-chip">
            ${esc(item)}
            <span class="chip-del" data-idx="${i}">×</span>
        </span>
    `).join('');
    drawerBody.querySelectorAll('.chip-del').forEach(el => {
        el.addEventListener('click', () => {
            inventory.splice(parseInt(el.dataset.idx), 1);
            saveInventory();
            renderInventory();
            render();
            toast('材料已移除');
        });
    });
}

export function addInventoryItem() {
    const val = inventoryInput.value.trim();
    if (!val) return;
    const primary = resolveToPrimary(val);
    if (inventory.some(i => i.toLowerCase() === primary.toLowerCase())) {
        toast('该材料已存在');
        return;
    }
    inventory.push(primary);
    saveInventory();
    renderInventory();
    render();
    inventoryInput.value = '';
    inventoryInput.focus();
    toast('材料已添加');
}

inventoryAddBtn.addEventListener('click', addInventoryItem);
inventoryInput.addEventListener('keydown', e => { if (e.key === 'Enter') addInventoryItem(); });

// Inventory input autocomplete
inventoryInput.addEventListener('input', function() {
    const val = this.value.toLowerCase().trim();
    let existing = document.getElementById('inventoryAutocomplete');
    if (existing) existing.remove();
    if (!val) return;
    const matches = [];
    const seen = new Set();
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
    dropdown.id = 'inventoryAutocomplete';
    dropdown.className = 'autocomplete-dropdown active';
    dropdown.style.cssText = 'position:absolute; bottom:100%; left:0; width:100%; margin-bottom:4px;';
    matches.slice(0, 6).forEach(m => {
        const item = document.createElement('div');
        item.className = 'autocomplete-item';
        item.textContent = m;
        item.addEventListener('mousedown', e => {
            e.preventDefault();
            inventoryInput.value = m;
            dropdown.remove();
        });
        dropdown.appendChild(item);
    });
    inventoryInput.parentElement.style.position = 'relative';
    inventoryInput.parentElement.appendChild(dropdown);
});

inventoryInput.addEventListener('blur', () => {
    setTimeout(() => {
        const existing = document.getElementById('inventoryAutocomplete');
        if (existing) existing.remove();
    }, 200);
});

// ── Avatar ──
export function setupAvatar() {
    document.getElementById('avatarWrap').addEventListener('click', openDrawer);
    const hiddenAvatarInput = document.getElementById('hiddenAvatarInput');

    document.getElementById('avatarWrap').addEventListener('contextmenu', e => {
        e.preventDefault();
        hiddenAvatarInput.click();
    });
    document.getElementById('avatarWrap').addEventListener('dblclick', e => {
        hiddenAvatarInput.click();
    });

    hiddenAvatarInput.addEventListener('change', function() {
        if (!this.files || !this.files[0]) return;
        const reader = new FileReader();
        reader.onload = function(e) {
            localStorage.setItem(AVATAR_KEY, e.target.result);
            loadAvatar();
            toast('头像已更新');
        };
        reader.readAsDataURL(this.files[0]);
        this.value = '';
    });
}
