/* ========================================
   FIFO Food Tracker — Application Logic
   ======================================== */

(function () {
  'use strict';

  // ---- Constants ----
  const VALID_HASHES = [
    '29fb83722243dc10847be45ce4b3427a6d2836d8ffd46c79b53fc8fb99ac3ee1', // FIFO2026
    'e6d5caec0eb11034bd1932129cedb0a51133b3ea478110d76578c33cd52246b5', // PREPREADY
    '80ad3145c06badd8cbe5b176e1e33b4d37af34456deb1db3dc4fe25dead50f42'  // FIRSTINFIRSTOUT
  ];
  const DB_NAME = 'fifo-tracker';
  const DB_VERSION = 1;
  const STORE_NAME = 'items';
  const ACCESS_KEY = 'fifo_access_granted';

  const CATEGORIES = [
    'Canned Goods', 'Dry Goods', 'Grains & Pasta', 'Freeze-Dried',
    'Water', 'Medical', 'Snacks & Bars', 'Condiments',
    'Dairy', 'Frozen', 'Beverages', 'Other'
  ];

  // ---- State ----
  let db = null;
  let currentTab = 'inventory';
  let showEaten = false;
  let editingId = null;
  let toastTimer = null;

  // ---- DOM refs ----
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const els = {
    gate: $('#gate'),
    gateForm: $('#gate-form'),
    gateCode: $('#gate-code'),
    gateError: $('#gate-error'),
    app: $('#app'),
    summary: $('#summary'),
    inventoryList: $('#inventory-list'),
    weekList: $('#week-list'),
    monthList: $('#month-list'),
    toggleEaten: $('#toggle-eaten'),
    fab: $('#fab'),
    dialog: $('#item-dialog'),
    dialogTitle: $('#dialog-title'),
    dialogClose: $('#dialog-close'),
    itemForm: $('#item-form'),
    itemId: $('#item-id'),
    itemName: $('#item-name'),
    itemCategory: $('#item-category'),
    itemQty: $('#item-qty'),
    itemStored: $('#item-stored'),
    itemExpires: $('#item-expires'),
    btnAdd: $('#btn-add'),
    btnAddClose: $('#btn-add-close'),
    btnDelete: $('#btn-delete'),
    clearDialog: $('#clear-dialog'),
    clearForm: $('#clear-form'),
    clearConfirm: $('#clear-confirm'),
    clearCancel: $('#clear-cancel'),
    exportBtn: $('#export-btn'),
    importInput: $('#import-input'),
    clearBtn: $('#clear-btn'),
    settingsBtn: $('#settings-btn'),
    toast: $('#toast')
  };

  // ========================================
  // Utility Functions
  // ========================================

  function uuid() {
    return crypto.randomUUID ? crypto.randomUUID() :
      'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
      });
  }

  function todayISO() {
    return new Date().toISOString().split('T')[0];
  }

  function formatDateYYMMDD(isoStr) {
    if (!isoStr) return '';
    const d = new Date(isoStr + 'T00:00:00');
    const yy = String(d.getFullYear()).slice(-2);
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return yy + '/' + mm + '/' + dd;
  }

  function daysUntil(isoStr) {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const exp = new Date(isoStr + 'T00:00:00');
    exp.setHours(0, 0, 0, 0);
    return Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
  }

  async function sha256(text) {
    const encoded = new TextEncoder().encode(text);
    const buffer = await crypto.subtle.digest('SHA-256', encoded);
    return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // ========================================
  // IndexedDB Wrapper
  // ========================================

  function openDB() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const store = req.result.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('expirationDate', 'expirationDate', { unique: false });
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  function dbTx(mode) {
    const tx = db.transaction(STORE_NAME, mode);
    return tx.objectStore(STORE_NAME);
  }

  function dbGetAll() {
    return new Promise((resolve, reject) => {
      const req = dbTx('readonly').getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  function dbPut(item) {
    return new Promise((resolve, reject) => {
      const req = dbTx('readwrite').put(item);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  function dbDelete(id) {
    return new Promise((resolve, reject) => {
      const req = dbTx('readwrite').delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  function dbClear() {
    return new Promise((resolve, reject) => {
      const req = dbTx('readwrite').clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  // ========================================
  // Access Gate
  // ========================================

  function isAccessGranted() {
    return localStorage.getItem(ACCESS_KEY) === 'true';
  }

  function grantAccess() {
    localStorage.setItem(ACCESS_KEY, 'true');
  }

  async function checkAccessCode(code) {
    const hash = await sha256(code.trim().toUpperCase());
    return VALID_HASHES.includes(hash);
  }

  function showApp() {
    els.gate.hidden = true;
    els.app.hidden = false;
    renderAll();
  }

  // ========================================
  // Toast
  // ========================================

  function showToast(msg) {
    clearTimeout(toastTimer);
    els.toast.textContent = msg;
    els.toast.hidden = false;
    requestAnimationFrame(() => {
      els.toast.classList.add('visible');
    });
    toastTimer = setTimeout(() => {
      els.toast.classList.remove('visible');
      setTimeout(() => { els.toast.hidden = true; }, 200);
    }, 3000);
  }

  // ========================================
  // Tabs
  // ========================================

  function switchTab(tabName) {
    currentTab = tabName;
    $$('.nav-tab').forEach(t => {
      const isActive = t.id === 'tab-' + tabName;
      t.classList.toggle('active', isActive);
      t.setAttribute('aria-selected', isActive);
    });
    $$('.tab-panel').forEach(p => {
      const isActive = p.id === 'panel-' + tabName;
      p.classList.toggle('active', isActive);
      p.hidden = !isActive;
    });
    // Show/hide FAB (hide on settings)
    els.fab.style.display = tabName === 'settings' ? 'none' : '';
    renderAll();
  }

  // ========================================
  // Rendering
  // ========================================

  async function renderAll() {
    const items = await dbGetAll();
    renderSummary(items);
    if (currentTab === 'inventory') renderInventory(items);
    else if (currentTab === 'week') renderWeek(items);
    else if (currentTab === 'month') renderMonth(items);
  }

  function renderSummary(items) {
    const active = items.filter(i => !i.eaten);
    const expiringWeek = active.filter(i => daysUntil(i.expirationDate) <= 7);
    const parts = [active.length + ' item' + (active.length !== 1 ? 's' : '')];
    if (expiringWeek.length > 0) {
      parts.push(expiringWeek.length + ' expiring this week');
    }
    els.summary.textContent = parts.join(' · ');
  }

  function createRow(item, showBadge) {
    const days = daysUntil(item.expirationDate);
    const row = document.createElement('div');
    row.className = 'item-row';
    row.dataset.id = item.id;

    if (item.eaten) {
      row.classList.add('row-eaten');
    } else if (days <= 7) {
      row.classList.add('row-urgent');
    } else if (days <= 30) {
      row.classList.add('row-warning');
    }

    // Badge HTML
    let badgeHTML = '';
    if (showBadge && !item.eaten) {
      if (showBadge === 'week') {
        if (days <= 1) badgeHTML = '<span class="item-badge badge-eat-now">EAT NOW</span>';
        else if (days <= 3) badgeHTML = '<span class="item-badge badge-soon">SOON</span>';
        else badgeHTML = '<span class="item-badge badge-this-week">THIS WEEK</span>';
      } else if (showBadge === 'month') {
        if (days <= 7) badgeHTML = '<span class="item-badge badge-eat-now">THIS WEEK</span>';
        else if (days <= 14) badgeHTML = '<span class="item-badge badge-next-2-weeks">NEXT 2 WEEKS</span>';
        else badgeHTML = '<span class="item-badge badge-this-month">THIS MONTH</span>';
      }
    }

    const daysText = item.eaten ? 'Eaten' : (days < 0 ? Math.abs(days) + 'd overdue' : days + 'd left');

    row.innerHTML =
      '<div class="item-info">' +
        '<div class="item-name">' + escapeHTML(item.name) + '</div>' +
        '<div class="item-meta">' +
          '<span>' + escapeHTML(item.category) + '</span>' +
          '<span class="item-qty">Qty: ' + item.quantity + '</span>' +
          '<span>Exp: ' + formatDateYYMMDD(item.expirationDate) + '</span>' +
          '<span class="item-days">' + daysText + '</span>' +
          badgeHTML +
        '</div>' +
      '</div>' +
      '<label class="item-check" onclick="event.stopPropagation()">' +
        '<input type="checkbox" ' + (item.eaten ? 'checked' : '') + ' data-id="' + item.id + '" aria-label="Mark ' + escapeHTML(item.name) + ' as eaten">' +
      '</label>';

    // Click row to edit (not checkbox)
    row.addEventListener('click', () => openEditDialog(item));

    // Checkbox handler
    const cb = row.querySelector('input[type="checkbox"]');
    cb.addEventListener('change', (e) => {
      e.stopPropagation();
      toggleEaten(item.id, cb.checked);
    });

    return row;
  }

  function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function renderInventory(items) {
    const active = items.filter(i => !i.eaten).sort((a, b) => a.expirationDate.localeCompare(b.expirationDate));
    const eaten = items.filter(i => i.eaten).sort((a, b) => (b.eatenDate || '').localeCompare(a.eatenDate || ''));

    els.inventoryList.innerHTML = '';

    if (active.length === 0 && eaten.length === 0) {
      els.inventoryList.innerHTML = '<div class="empty-state">No items yet. Tap the + button to add your first item.</div>';
      els.toggleEaten.hidden = true;
      return;
    }

    active.forEach(item => els.inventoryList.appendChild(createRow(item)));

    if (eaten.length > 0) {
      els.toggleEaten.hidden = false;
      els.toggleEaten.textContent = showEaten ? 'Hide eaten items (' + eaten.length + ')' : 'Show eaten items (' + eaten.length + ')';
      if (showEaten) {
        eaten.forEach(item => els.inventoryList.appendChild(createRow(item)));
      }
    } else {
      els.toggleEaten.hidden = true;
    }
  }

  function renderWeek(items) {
    const filtered = items
      .filter(i => !i.eaten && daysUntil(i.expirationDate) <= 7)
      .sort((a, b) => a.expirationDate.localeCompare(b.expirationDate));

    els.weekList.innerHTML = '';
    if (filtered.length === 0) {
      els.weekList.innerHTML = '<div class="empty-state">Nothing expiring this week — you\'re in good shape.</div>';
      return;
    }
    filtered.forEach(item => els.weekList.appendChild(createRow(item, 'week')));
  }

  function renderMonth(items) {
    const filtered = items
      .filter(i => !i.eaten && daysUntil(i.expirationDate) <= 30)
      .sort((a, b) => a.expirationDate.localeCompare(b.expirationDate));

    els.monthList.innerHTML = '';
    if (filtered.length === 0) {
      els.monthList.innerHTML = '<div class="empty-state">Nothing expiring this month — well stocked.</div>';
      return;
    }
    filtered.forEach(item => els.monthList.appendChild(createRow(item, 'month')));
  }

  // ========================================
  // Add / Edit / Delete
  // ========================================

  function resetForm() {
    els.itemId.value = '';
    els.itemName.value = '';
    els.itemCategory.value = CATEGORIES[0];
    els.itemQty.value = '1';
    els.itemStored.value = todayISO();
    els.itemExpires.value = '';
    editingId = null;
  }

  function openAddDialog() {
    resetForm();
    els.dialogTitle.textContent = 'Add Item';
    els.btnAdd.textContent = 'Add Item';
    els.btnAdd.hidden = false;
    els.btnAddClose.textContent = 'Add & Close';
    els.btnAddClose.hidden = false;
    els.btnDelete.hidden = true;
    els.dialog.showModal();
    els.itemName.focus();
  }

  function openEditDialog(item) {
    editingId = item.id;
    els.itemId.value = item.id;
    els.itemName.value = item.name;
    els.itemCategory.value = item.category;
    els.itemQty.value = item.quantity;
    els.itemStored.value = item.dateStored;
    els.itemExpires.value = item.expirationDate;
    els.dialogTitle.textContent = 'Edit Item';
    els.btnAdd.textContent = 'Save';
    els.btnAdd.hidden = false;
    els.btnAddClose.hidden = true;
    els.btnDelete.hidden = false;
    els.dialog.showModal();
    els.itemName.focus();
  }

  function closeDialog() {
    els.dialog.close();
    editingId = null;
  }

  function getFormData() {
    return {
      name: els.itemName.value.trim(),
      category: els.itemCategory.value,
      quantity: Math.max(1, parseInt(els.itemQty.value) || 1),
      dateStored: els.itemStored.value || todayISO(),
      expirationDate: els.itemExpires.value
    };
  }

  async function saveItem(andClose) {
    const data = getFormData();
    if (!data.name || !data.expirationDate) return;

    const now = new Date().toISOString();

    if (editingId) {
      // Update existing
      const items = await dbGetAll();
      const existing = items.find(i => i.id === editingId);
      if (existing) {
        Object.assign(existing, data, { updatedAt: now });
        await dbPut(existing);
        showToast('✓ ' + data.name + ' updated');
      }
      closeDialog();
    } else {
      // Add new
      const item = {
        id: uuid(),
        ...data,
        eaten: false,
        eatenDate: null,
        createdAt: now,
        updatedAt: now
      };
      await dbPut(item);
      showToast('✓ ' + data.name + ' added');

      if (andClose) {
        closeDialog();
      } else {
        // Keep form open for rapid entry
        els.itemName.value = '';
        els.itemExpires.value = '';
        els.itemQty.value = '1';
        els.itemName.focus();
      }
    }

    renderAll();
  }

  async function deleteItem() {
    if (!editingId) return;
    await dbDelete(editingId);
    showToast('Item deleted');
    closeDialog();
    renderAll();
  }

  async function toggleEaten(id, eaten) {
    const items = await dbGetAll();
    const item = items.find(i => i.id === id);
    if (!item) return;
    item.eaten = eaten;
    item.eatenDate = eaten ? new Date().toISOString().split('T')[0] : null;
    item.updatedAt = new Date().toISOString();
    await dbPut(item);
    renderAll();
  }

  // ========================================
  // CSV Export / Import
  // ========================================

  async function exportCSV() {
    const items = await dbGetAll();
    if (items.length === 0) {
      showToast('No items to export');
      return;
    }

    const headers = ['Name', 'Category', 'Quantity', 'Date Stored', 'Expiration Date', 'Eaten', 'Eaten Date'];
    const rows = items.map(i => [
      '"' + (i.name || '').replace(/"/g, '""') + '"',
      '"' + (i.category || '').replace(/"/g, '""') + '"',
      i.quantity,
      i.dateStored,
      i.expirationDate,
      i.eaten ? 'Yes' : 'No',
      i.eatenDate || ''
    ].join(','));

    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fifo-inventory-' + todayISO() + '.csv';
    a.click();
    URL.revokeObjectURL(url);
    showToast('CSV exported');
  }

  async function importCSV(file) {
    const text = await file.text();
    const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').filter(l => l.trim());
    if (lines.length < 2) {
      showToast('CSV file is empty or invalid');
      return;
    }

    // Skip header row
    let imported = 0;
    const now = new Date().toISOString();

    for (let i = 1; i < lines.length; i++) {
      const cols = parseCSVLine(lines[i]);
      if (cols.length < 5) continue;

      const item = {
        id: uuid(),
        name: cols[0] || 'Unknown',
        category: CATEGORIES.includes(cols[1]) ? cols[1] : 'Other',
        quantity: Math.max(1, parseInt(cols[2]) || 1),
        dateStored: cols[3] || todayISO(),
        expirationDate: cols[4] || todayISO(),
        eaten: (cols[5] || '').toLowerCase() === 'yes',
        eatenDate: cols[6] || null,
        createdAt: now,
        updatedAt: now
      };
      await dbPut(item);
      imported++;
    }

    showToast(imported + ' item' + (imported !== 1 ? 's' : '') + ' imported');
    renderAll();
  }

  function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inQuotes) {
        if (ch === '"') {
          if (i + 1 < line.length && line[i + 1] === '"') {
            current += '"';
            i++;
          } else {
            inQuotes = false;
          }
        } else {
          current += ch;
        }
      } else {
        if (ch === '"') {
          inQuotes = true;
        } else if (ch === ',') {
          result.push(current.trim());
          current = '';
        } else {
          current += ch;
        }
      }
    }
    result.push(current.trim());
    return result;
  }

  // ========================================
  // Clear All Data
  // ========================================

  function openClearDialog() {
    els.clearConfirm.value = '';
    els.clearDialog.showModal();
    els.clearConfirm.focus();
  }

  async function clearAllData() {
    if (els.clearConfirm.value.trim() !== 'DELETE') {
      els.clearConfirm.style.borderColor = '#C0392B';
      return;
    }
    await dbClear();
    els.clearDialog.close();
    showToast('All data cleared');
    renderAll();
  }

  // ========================================
  // Event Binding
  // ========================================

  function bindEvents() {
    // Access gate
    els.gateForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const code = els.gateCode.value;
      if (await checkAccessCode(code)) {
        grantAccess();
        showApp();
      } else {
        els.gateError.hidden = false;
        els.gateCode.value = '';
        els.gateCode.focus();
      }
    });

    // Tabs
    $$('.nav-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const name = tab.id.replace('tab-', '');
        switchTab(name);
      });
    });

    // Settings button in header
    els.settingsBtn.addEventListener('click', () => switchTab('settings'));

    // FAB
    els.fab.addEventListener('click', openAddDialog);

    // Dialog close
    els.dialogClose.addEventListener('click', closeDialog);
    els.dialog.addEventListener('click', (e) => {
      if (e.target === els.dialog) closeDialog();
    });

    // Form submit — "Add Item" / "Save"
    els.itemForm.addEventListener('submit', (e) => {
      e.preventDefault();
      saveItem(false);
    });

    // "Add & Close"
    els.btnAddClose.addEventListener('click', () => saveItem(true));

    // Delete
    els.btnDelete.addEventListener('click', deleteItem);

    // Enter on expiration date triggers add
    els.itemExpires.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !editingId) {
        e.preventDefault();
        saveItem(false);
      }
    });

    // Toggle eaten
    els.toggleEaten.addEventListener('click', () => {
      showEaten = !showEaten;
      renderAll();
    });

    // Export
    els.exportBtn.addEventListener('click', exportCSV);

    // Import
    els.importInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        importCSV(file);
        e.target.value = '';
      }
    });

    // Clear all data
    els.clearBtn.addEventListener('click', openClearDialog);
    els.clearForm.addEventListener('submit', (e) => {
      e.preventDefault();
      clearAllData();
    });
    els.clearCancel.addEventListener('click', () => els.clearDialog.close());
    els.clearDialog.addEventListener('click', (e) => {
      if (e.target === els.clearDialog) els.clearDialog.close();
    });
  }

  // ========================================
  // Service Worker Registration
  // ========================================

  function registerSW() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js').catch(() => {});
    }
  }

  // ========================================
  // Init
  // ========================================

  async function init() {
    db = await openDB();
    bindEvents();
    registerSW();

    if (isAccessGranted()) {
      showApp();
    } else {
      els.gate.hidden = false;
      els.gateCode.focus();
    }
  }

  // Start
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
