/* ========================================
   FIFO Food Tracker — Application Logic
   ======================================== */

(function () {
  'use strict';

  // ---- Constants ----
  const DB_NAME = 'fifo-tracker';
  const DB_VERSION = 1;
  const STORE_NAME = 'items';

  const CATEGORIES = [
    'Canned Fish', 'Canned Meat', 'Canned Fruit & Veg',
    'Dry Goods', 'Grains & Pasta', 'Rice', 'Legumes',
    'Freeze-Dried', 'Water', 'Medical', 'Snacks & Bars',
    'Condiments', 'Dairy', 'Frozen', 'Beverages', 'Other'
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

  // Food-to-category mapping for auto-suggest
  const FOOD_CATEGORIES = {
    'Canned Fish': ['tuna','salmon','sardines','anchovies','mackerel','crab','clams','oysters','shrimp','herring','kippered','fish'],
    'Canned Meat': ['spam','corned beef','chicken breast','vienna sausage','chili','ravioli','beef stew','ham','turkey','canned meat','potted meat'],
    'Canned Fruit & Veg': ['corn','peas','tomato','tomatoes','green beans','beans','soup','chickpeas','coconut milk','fruit cocktail','peaches','pears','pineapple','mandarin','olives','artichoke','beets','hominy','evaporated milk','condensed milk','carrots','mushrooms','spinach','asparagus','applesauce','cranberry'],
    'Dry Goods': ['flour','sugar','salt','baking soda','baking powder','yeast','powdered milk','cornstarch','oats','oatmeal','cornmeal','breadcrumbs','cocoa','tea','coffee','instant coffee'],
    'Grains & Pasta': ['pasta','spaghetti','penne','macaroni','noodles','ramen','couscous','crackers','bread','tortillas','cereal','granola','rice noodles','egg noodles','lasagna','fettuccine','angel hair','orzo','quinoa'],
    'Rice': ['rice','basmati','jasmine','brown rice','white rice','wild rice','arborio','sushi rice','sticky rice','rice pilaf'],
    'Legumes': ['lentils','split peas','black beans','kidney beans','pinto beans','navy beans','lima beans','garbanzo','chickpeas','mung beans','adzuki','edamame','dried beans','bean soup mix'],
    'Freeze-Dried': ['freeze-dried','mountain house','backpacker','emergency food','mre','survival food','astronaut','dehydrated'],
    'Water': ['water','sparkling water','spring water','purified water','water jug','water bottle'],
    'Medical': ['bandage','aspirin','ibuprofen','tylenol','first aid','antiseptic','gauze','medical','medicine','vitamin','vitamins','supplement','electrolyte','pedialyte'],
    'Snacks & Bars': ['granola bar','protein bar','jerky','beef jerky','trail mix','nuts','almonds','peanuts','cashews','chips','pretzels','popcorn','dried fruit','raisins','candy','chocolate','energy bar','fruit snacks','cookies'],
    'Condiments': ['ketchup','mustard','mayo','mayonnaise','soy sauce','hot sauce','vinegar','olive oil','vegetable oil','honey','maple syrup','jam','jelly','peanut butter','salsa','bbq sauce','sriracha','relish','worcestershire','tabasco','ranch','dressing'],
    'Dairy': ['cheese','butter','milk','yogurt','cream cheese','sour cream','whipped cream','eggs','ghee','parmesan','mozzarella','cheddar'],
    'Frozen': ['frozen vegetables','frozen fruit','frozen pizza','frozen dinner','ice cream','frozen chicken','frozen fish','frozen burrito','frozen fries','frozen berries','frozen corn','frozen peas','frozen spinach'],
    'Beverages': ['juice','soda','pop','gatorade','sports drink','energy drink','beer','wine','lemonade','iced tea','cider','kombucha','milk','almond milk','oat milk']
  };

  const els = {
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
    settingsDrawer: $('#settings-drawer'),
    settingsOverlay: $('#settings-overlay'),
    drawerClose: $('#drawer-close'),
    toast: $('#toast'),
    expiryReminder: $('#expiry-reminder'),
    expiryReminderClose: $('#expiry-reminder-close'),
    expiryReminderContent: $('#expiry-reminder-content')
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
    const yyyy = String(d.getFullYear());
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return yyyy + '/' + mm + '/' + dd;
  }

  function daysUntil(isoStr) {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const exp = new Date(isoStr + 'T00:00:00');
    exp.setHours(0, 0, 0, 0);
    return Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
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

  function showApp() {
    renderAll();
    showExpiryReminder();
  }

  // ========================================
  // Expiry Reminder Popup
  // ========================================

  async function showExpiryReminder() {
    const items = await dbGetAll();
    const urgent = items
      .filter(i => !i.eaten && daysUntil(i.expirationDate) <= 3)
      .sort((a, b) => a.expirationDate.localeCompare(b.expirationDate))
      .slice(0, 5);

    if (urgent.length === 0) return;

    let html = '<div class="expiry-reminder-title">Items expiring soon</div>';
    urgent.forEach(item => {
      const days = daysUntil(item.expirationDate);
      let label;
      if (days <= 0) label = 'OVERDUE';
      else if (days === 1) label = 'TODAY';
      else label = days + 'd left';
      html += '<div class="expiry-reminder-item">' +
        '<span class="expiry-reminder-item-name">' + escapeHTML(item.name) + '</span>' +
        '<span class="expiry-reminder-item-days">' + label + '</span>' +
      '</div>';
    });

    els.expiryReminderContent.innerHTML = html;
    els.expiryReminder.hidden = false;
    els.expiryReminder.classList.remove('closing');
  }

  function closeExpiryReminder() {
    els.expiryReminder.classList.add('closing');
    els.expiryReminder.addEventListener('animationend', function handler() {
      els.expiryReminder.hidden = true;
      els.expiryReminder.classList.remove('closing');
      els.expiryReminder.removeEventListener('animationend', handler);
    });
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
    renderAll();
  }

  // ========================================
  // Settings Drawer
  // ========================================

  function openDrawer() {
    els.settingsOverlay.hidden = false;
    requestAnimationFrame(() => {
      els.settingsOverlay.classList.add('visible');
      els.settingsDrawer.classList.add('open');
    });
  }

  function closeDrawer() {
    els.settingsOverlay.classList.remove('visible');
    els.settingsDrawer.classList.remove('open');
    setTimeout(() => { els.settingsOverlay.hidden = true; }, 300);
  }

  // ========================================
  // Category Auto-Suggest
  // ========================================

  function suggestCategory(name) {
    const lower = name.toLowerCase().trim();
    if (!lower) return null;

    for (const [category, keywords] of Object.entries(FOOD_CATEGORIES)) {
      for (const kw of keywords) {
        if (lower.includes(kw) || kw.includes(lower)) {
          return category;
        }
      }
    }
    return null;
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
        '<span class="item-check-label">Eaten</span>' +
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
    // Tabs
    $$('.nav-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const name = tab.id.replace('tab-', '');
        switchTab(name);
      });
    });

    // Expiry reminder close
    els.expiryReminderClose.addEventListener('click', closeExpiryReminder);

    // Settings drawer
    els.settingsBtn.addEventListener('click', openDrawer);
    els.drawerClose.addEventListener('click', closeDrawer);
    els.settingsOverlay.addEventListener('click', closeDrawer);

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

    // Auto-suggest category as user types item name
    let suggestTimeout = null;
    els.itemName.addEventListener('input', () => {
      clearTimeout(suggestTimeout);
      suggestTimeout = setTimeout(() => {
        if (editingId) return; // don't override when editing
        const suggestion = suggestCategory(els.itemName.value);
        if (suggestion) {
          els.itemCategory.value = suggestion;
        }
      }, 300);
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

    showApp();
  }

  // Start
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
