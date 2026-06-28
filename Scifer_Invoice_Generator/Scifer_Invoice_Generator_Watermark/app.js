(() => {
  'use strict';

  const STORAGE_KEY = 'scifer_invoice_generator_v3';
  const LEGACY_STORAGE_KEYS = ['scifer_invoice_generator_v2', 'scifer_invoice_generator_v1'];
  const DEFAULT_NOTES = 'Electronic products are supplied with the applicable manufacturer or supplier warranty. Warranty excludes misuse, liquid damage, power surges, unauthorised repair, and normal wear. Rental items remain Scifer property; the customer is responsible for safe use, loss, theft, damage, late return, and related charges. Services, installation, and support are limited to the agreed scope; approved extra work and materials are billed separately. Returns require prior approval and inspection. Payment is due upon receipt unless agreed otherwise in writing.';
  const LEGACY_DEFAULT_NOTES = 'Payment is due by the stated due date. Please quote the invoice number as your payment reference. Prices exclude applicable VAT/tax unless shown above. Products and services are supplied subject to the agreed scope and terms.';
  const DEFAULT_ITEM_COUNT = 1;
  const MAX_INVOICE_ROWS = 10;
  const currencySymbols = { BDT: '৳', USD: '$', EUR: '€', GBP: '£' };

  const state = { items: Array.from({ length: DEFAULT_ITEM_COUNT }, () => ({ description: '', quantity: '', unitPrice: '' })) };

  const elements = {
    invoiceNo: document.getElementById('invoiceNo'), currency: document.getElementById('currency'), invoiceDate: document.getElementById('invoiceDate'),
    customerName: document.getElementById('customerName'), customerAddress: document.getElementById('customerAddress'), customerContact: document.getElementById('customerContact'),
    discount: document.getElementById('discount'), taxRate: document.getElementById('taxRate'), paymentStatus: document.getElementById('paymentStatus'), paidAmount: document.getElementById('paidAmount'), paymentMethod: document.getElementById('paymentMethod'), notes: document.getElementById('notes'),
    itemsEditor: document.getElementById('itemsEditor'), itemsPreview: document.getElementById('itemsPreview'), addItemButton: document.getElementById('addItemButton'),
    printButton: document.getElementById('printButton'), downloadPdfButton: document.getElementById('downloadPdfButton'), saveButton: document.getElementById('saveButton'), newButton: document.getElementById('newButton'), statusMessage: document.getElementById('statusMessage'),
    previewInvoiceNo: document.getElementById('previewInvoiceNo'), previewInvoiceDate: document.getElementById('previewInvoiceDate'), previewCustomerName: document.getElementById('previewCustomerName'),
    previewCustomerAddress: document.getElementById('previewCustomerAddress'), previewCustomerContact: document.getElementById('previewCustomerContact'), previewNotes: document.getElementById('previewNotes'),
    previewPaymentMethod: document.getElementById('previewPaymentMethod'), subtotalValue: document.getElementById('subtotalValue'), discountValue: document.getElementById('discountValue'), taxValue: document.getElementById('taxValue'), grandTotalValue: document.getElementById('grandTotalValue'), paidValue: document.getElementById('paidValue'), balanceValue: document.getElementById('balanceValue'), balanceLabel: document.getElementById('balanceLabel'), balanceRow: document.getElementById('balanceRow'),
  };

  const inputIds = ['invoiceNo', 'currency', 'invoiceDate', 'customerName', 'customerAddress', 'customerContact', 'discount', 'taxRate', 'paymentStatus', 'paidAmount', 'paymentMethod', 'notes'];

  function todayISO() { const now = new Date(); const offset = now.getTimezoneOffset(); return new Date(now.getTime() - offset * 60 * 1000).toISOString().slice(0, 10); }
  function escapeHtml(value) { return String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;'); }
  function numberOrZero(value) { const parsed = Number.parseFloat(value); return Number.isFinite(parsed) && parsed > 0 ? parsed : 0; }
  function displayText(value, fallback) { return value && String(value).trim() ? String(value).trim() : fallback; }
  function setPreviewText(element, value, fallback) { const text = displayText(value, fallback); element.textContent = text; element.classList.toggle('placeholder', text === fallback); }
  function formatDate(dateValue) { if (!dateValue) return '[DD MMM YYYY]'; const [year, month, day] = dateValue.split('-').map(Number); if (!year || !month || !day) return '[DD MMM YYYY]'; return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(year, month - 1, day)); }
  function formatMoney(value) { const currency = elements.currency.value || 'BDT'; const symbol = currencySymbols[currency] || currency; const amount = Number.isFinite(value) ? value : 0; return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`; }
  function getGrossTotals() {
    const subtotal = state.items.reduce((total, item) => total + numberOrZero(item.quantity) * numberOrZero(item.unitPrice), 0);
    const discount = Math.min(numberOrZero(elements.discount.value), subtotal);
    const taxable = Math.max(0, subtotal - discount);
    const tax = taxable * (numberOrZero(elements.taxRate.value) / 100);
    return { subtotal, discount, tax, total: taxable + tax };
  }
  function syncPaidAmountForStatus() {
    const gross = getGrossTotals();
    const status = elements.paymentStatus.value || 'unpaid';
    if (status === 'paid') {
      elements.paidAmount.value = gross.total > 0 ? gross.total.toFixed(2) : '0';
      elements.paidAmount.disabled = true;
    } else {
      elements.paidAmount.disabled = false;
      if (status === 'unpaid') elements.paidAmount.value = '0';
    }
  }
  function syncStatusFromPaidAmount() {
    const gross = getGrossTotals();
    const paid = Math.min(numberOrZero(elements.paidAmount.value), gross.total);
    if (gross.total > 0 && paid >= gross.total) elements.paymentStatus.value = 'paid';
    else if (paid > 0) elements.paymentStatus.value = 'partial';
    else elements.paymentStatus.value = 'unpaid';
  }
  function getTotals() {
    const gross = getGrossTotals();
    const paid = Math.min(numberOrZero(elements.paidAmount.value), gross.total);
    const balance = Math.max(0, gross.total - paid);
    return { ...gross, paid, balance };
  }

  function renderItemsEditor() {
    elements.itemsEditor.innerHTML = state.items.map((item, index) => `
      <div class="item-editor-row" data-index="${index}">
        <div class="item-editor-top"><strong>Item ${index + 1}</strong>${state.items.length > 1 ? `<button type="button" class="remove-item" data-action="remove" data-index="${index}">Remove</button>` : ''}</div>
        <div class="item-fields">
          <input type="text" data-field="description" data-index="${index}" value="${escapeHtml(item.description)}" placeholder="Description" aria-label="Item ${index + 1} description" />
          <input type="number" data-field="quantity" data-index="${index}" value="${escapeHtml(item.quantity)}" min="0" step="0.01" placeholder="Qty" aria-label="Item ${index + 1} quantity" />
          <input type="number" data-field="unitPrice" data-index="${index}" value="${escapeHtml(item.unitPrice)}" min="0" step="0.01" placeholder="Price" aria-label="Item ${index + 1} unit price" />
        </div>
      </div>`).join('');
  }

  function itemHasContent(item) {
    return Boolean(
      String(item?.description || '').trim()
      || String(item?.quantity || '').trim()
      || String(item?.unitPrice || '').trim()
    );
  }

  function getPrintableItems() {
    return state.items.filter(itemHasContent).slice(0, MAX_INVOICE_ROWS);
  }

  function renderItemsPreview() {
    const printableItems = getPrintableItems();
    const rows = printableItems.length ? printableItems : [{ description: '', quantity: '', unitPrice: '' }];
    elements.itemsPreview.innerHTML = rows.map((item, index) => {
      const hasDescription = Boolean(String(item.description || '').trim());
      const quantity = numberOrZero(item.quantity); const unitPrice = numberOrZero(item.unitPrice); const amount = quantity * unitPrice;
      const description = hasDescription ? escapeHtml(item.description) : '<span class="item-placeholder">[Item / service description]</span>';
      return `<tr><td>${index + 1}</td><td>${description}</td><td>${quantity > 0 ? escapeHtml(item.quantity) : ''}</td><td>${unitPrice > 0 ? formatMoney(unitPrice) : ''}</td><td>${amount > 0 ? formatMoney(amount) : ''}</td></tr>`;
    }).join('');
  }

  function updatePreview() {
    setPreviewText(elements.previewCustomerName, elements.customerName.value, '[Customer / Company Name]');
    setPreviewText(elements.previewCustomerAddress, elements.customerAddress.value, '[Customer address]');
    setPreviewText(elements.previewCustomerContact, elements.customerContact.value, '[Phone / Email]');
    elements.previewInvoiceNo.textContent = displayText(elements.invoiceNo.value, 'INV-0001');
    elements.previewInvoiceDate.textContent = formatDate(elements.invoiceDate.value);
    elements.previewNotes.textContent = displayText(elements.notes.value, DEFAULT_NOTES);
    elements.previewPaymentMethod.textContent = displayText(elements.paymentMethod.value, 'Cash / Bank Transfer / Mobile Financial Service');
    renderItemsPreview();
    syncPaidAmountForStatus();
    const totals = getTotals();
    const paidInFull = totals.total > 0 && totals.balance <= 0.005;
    elements.subtotalValue.textContent = formatMoney(totals.subtotal);
    elements.discountValue.textContent = formatMoney(totals.discount);
    elements.taxValue.textContent = formatMoney(totals.tax);
    elements.grandTotalValue.textContent = formatMoney(totals.total);
    elements.paidValue.textContent = formatMoney(totals.paid);
    elements.balanceValue.textContent = formatMoney(totals.balance);
    elements.balanceLabel.textContent = paidInFull ? 'PAID IN FULL' : 'BALANCE DUE';
    elements.balanceRow.classList.toggle('is-paid', paidInFull);
  }

  function getDraft() { const fields = {}; inputIds.forEach((id) => { fields[id] = elements[id].value; }); return { fields, items: state.items }; }
  function normalizeFields(fields) {
    const output = { ...(fields || {}) };
    if (!output.customerAddress) output.customerAddress = [output.address1, output.address2].filter(Boolean).join(', ');
    if (!output.notes || output.notes.trim() === LEGACY_DEFAULT_NOTES) output.notes = DEFAULT_NOTES;
    if (!['unpaid', 'partial', 'paid'].includes(output.paymentStatus)) output.paymentStatus = 'unpaid';
    if (output.paidAmount === undefined || output.paidAmount === null || output.paidAmount === '') output.paidAmount = '0';
    return output;
  }
  function applyDraft(draft) {
    if (!draft || typeof draft !== 'object') return false;
    const fields = normalizeFields(draft.fields);
    inputIds.forEach((id) => { if (typeof fields[id] === 'string') elements[id].value = fields[id]; });
    if (Array.isArray(draft.items) && draft.items.length) state.items = draft.items.slice(0, MAX_INVOICE_ROWS).map((item) => ({ description: String(item.description || ''), quantity: String(item.quantity || ''), unitPrice: String(item.unitPrice || '') }));
    renderItemsEditor(); updatePreview(); return true;
  }
  function showStatus(message) { elements.statusMessage.textContent = message; window.clearTimeout(showStatus.timeout); showStatus.timeout = window.setTimeout(() => { elements.statusMessage.textContent = ''; }, 3000); }
  function createNewInvoice() {
    const nextNumber = elements.invoiceNo.value.match(/(.*?)(\d+)$/); const invoiceNo = nextNumber ? `${nextNumber[1]}${String(Number(nextNumber[2]) + 1).padStart(nextNumber[2].length, '0')}` : 'INV-0001';
    const preserved = { currency: elements.currency.value || 'BDT', paymentMethod: elements.paymentMethod.value || 'Cash / Bank Transfer / Mobile Financial Service', notes: elements.notes.value || DEFAULT_NOTES };
    inputIds.forEach((id) => { if (id !== 'currency') elements[id].value = ''; });
    elements.currency.value = preserved.currency; elements.invoiceNo.value = invoiceNo; elements.invoiceDate.value = todayISO(); elements.paymentMethod.value = preserved.paymentMethod; elements.notes.value = preserved.notes; elements.discount.value = '0'; elements.taxRate.value = '0'; elements.paymentStatus.value = 'unpaid'; elements.paidAmount.value = '0';
    state.items = Array.from({ length: DEFAULT_ITEM_COUNT }, () => ({ description: '', quantity: '', unitPrice: '' })); renderItemsEditor(); updatePreview(); showStatus('New invoice is ready.');
  }
  function bindEvents() {
    inputIds.filter((id) => !['paymentStatus', 'paidAmount']).forEach((id) => { elements[id].addEventListener('input', updatePreview); elements[id].addEventListener('change', updatePreview); });
    elements.paymentStatus.addEventListener('change', () => { syncPaidAmountForStatus(); updatePreview(); });
    elements.paidAmount.addEventListener('input', () => { syncStatusFromPaidAmount(); updatePreview(); });
    elements.paidAmount.addEventListener('change', () => { syncStatusFromPaidAmount(); updatePreview(); });
    elements.itemsEditor.addEventListener('input', (event) => { const input = event.target.closest('input[data-field]'); if (!input) return; const index = Number(input.dataset.index); const field = input.dataset.field; if (state.items[index] && field) { state.items[index][field] = input.value; updatePreview(); } });
    elements.itemsEditor.addEventListener('click', (event) => { const button = event.target.closest('[data-action="remove"]'); if (!button) return; const index = Number(button.dataset.index); state.items.splice(index, 1); renderItemsEditor(); updatePreview(); });
    elements.addItemButton.addEventListener('click', () => { if (state.items.length >= MAX_INVOICE_ROWS) { showStatus('This invoice-pad layout supports up to 10 item rows.'); return; } state.items.push({ description: '', quantity: '', unitPrice: '' }); renderItemsEditor(); });
    elements.downloadPdfButton.addEventListener('click', () => { updatePreview(); if (!window.SciferPdfGenerator) { showStatus('The PDF generator could not be loaded.'); return; } try { window.SciferPdfGenerator.downloadInvoicePdf(getDraft()); showStatus('PDF downloaded successfully.'); } catch (error) { console.error(error); showStatus('Could not create the PDF. Please use Print Invoice instead.'); } });
    elements.printButton.addEventListener('click', () => { updatePreview(); window.print(); });
    elements.saveButton.addEventListener('click', () => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(getDraft())); showStatus('Draft saved on this device.'); } catch { showStatus('Could not save this draft in the browser.'); } });
    elements.newButton.addEventListener('click', () => { if (window.confirm('Start a new invoice? Current unsaved changes will be cleared.')) createNewInvoice(); });
  }
  function readSavedDraft() { try { const current = localStorage.getItem(STORAGE_KEY); if (current) return JSON.parse(current); for (const key of LEGACY_STORAGE_KEYS) { const legacy = localStorage.getItem(key); if (legacy) return JSON.parse(legacy); } } catch {} return null; }
  function initialize() { if (!applyDraft(readSavedDraft())) elements.invoiceDate.value = todayISO(); renderItemsEditor(); updatePreview(); bindEvents(); }
  initialize();
})();
