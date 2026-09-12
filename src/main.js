import './style.css';
import QRCode from 'qrcode';

const PAYMENT_ID = 'ejoabhilash11@oksbi';
const ESP32_URL_KEY = 'vending-esp32-url';
const items = [
    { name: 'Coca-Cola Zero Sugar', price: 35, servo: 1, direction: 'left', image: '/en_coca-cola_prod_zero%20sugar%20_750x750_v1.webp' },
    { name: "Lay's American Cream & Onion", price: 15, servo: 1, direction: 'right', image: '/greenlays.webp' },
    { name: 'Monster Energy', price: 60, servo: 2, direction: 'left', image: '/960px-Monster_Energy_drink_(cropped).webp' },
    { name: 'MB Protein Bar', price: 70, servo: 2, direction: 'right', image: '/prd_3596287-MuscleBlaze-Protein-Bar-20-gm-Protein-6-bars-Choco-Almond_o.webp' }
];

const quips = {
    steal: ['The machine accepts your payment.', 'A brave payment. The machine keeps it.', 'Thank you for supporting the snacks.'],
    win: ['Payment accepted. Enjoy your snack.', 'The hatch is open. Collect your item.', 'The machine approves this payment.']
};

let round = null;
let transactions = JSON.parse(localStorage.getItem('vending-log') || '[]');

const app = document.querySelector('#app');

function money(value) { return `₹${value.toLocaleString('en-IN')}`; }
function pickItem() { return items[Math.floor(Math.random() * items.length)]; }
function saveHistory() {
    localStorage.setItem('vending-log', JSON.stringify(transactions));
}
function getEsp32Url() {
    return localStorage.getItem(ESP32_URL_KEY) || '';
}
async function dispenseFromEsp32(servo, direction) {
    const baseUrl = getEsp32Url().replace(/\/$/, '');
    if (!baseUrl) return { ok: false, skipped: true };
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 4000);
    try {
        const response = await fetch(`${baseUrl}/dispense?servo=${servo}&direction=${direction}`, { signal: controller.signal });
        return { ok: response.ok, skipped: false };
    } catch {
        return { ok: false, skipped: false };
    } finally {
        window.clearTimeout(timeout);
    }
}
function qrData(amount) {
    return `upi://pay?pa=${encodeURIComponent(PAYMENT_ID)}&pn=Vending%20Machine&am=${amount}&cu=INR`;
}
function renderPaymentQr() {
    const canvas = document.querySelector('#payment-qr');
    if (!canvas || !round?.amount) return;
    QRCode.toCanvas(canvas, qrData(Number(round.amount)), { width: 142, margin: 2, errorCorrectionLevel: 'M' });
}
function newRound() {
    round = { item: null, price: null, amount: '', paid: false, outcome: null };
    render('idle');
}
function render(screen) {
    app.innerHTML = `
    <main class="shell">
      <header class="topbar">
        <a class="brand" href="#" aria-label="Vending machine home" data-action="reset"><span class="brand-dot"></span>SNACK / SELECT</a>
        <div class="machine-id">SELF-SERVICE 01</div>
      </header>
      <section class="machine-wrap">
        <div class="machine-shadow"></div>
        <div class="machine">
          <div class="machine-top">
            <span class="machine-label">SNACK / SELECT</span>
            <span class="machine-phase">ONLINE <i></i></span>
          </div>
          <div class="machine-window">
            ${screenContent(screen)}
          </div>
          <div class="machine-controls">
            <div class="status-light ${screen === 'result' ? round.outcome : ''}"></div>
            <span>${screen === 'idle' ? 'SELECT AN ITEM' : screen === 'result' ? 'DISPENSING COMPLETE' : 'OPERATOR CONTROL PANEL'}</span>
            <div class="vent"><i></i><i></i><i></i><i></i><i></i></div>
          </div>
        </div>
      </section>
      <footer class="footer"><span>PAYMENT ID / ${PAYMENT_ID}</span><span>TRANSACTION ${String(transactions.length + (round?.outcome ? 0 : 1)).padStart(3, '0')}</span><button class="setup-button" data-action="configure">ESP32 SETUP</button></footer>
    </main>`;
    bindEvents();
    renderPaymentQr();
}

function itemCard(item) {
    return `<button class="product-card" data-item="${items.indexOf(item)}"><div class="product-image"><img src="${item.image}" alt="${item.name}" /></div><strong>${item.name}</strong></button>`;
}
function screenContent(screen) {
    if (screen === 'idle') return `<div class="screen-pad selection-screen"><div class="screen-heading"><p class="eyebrow">CHOOSE YOUR SNACK</p><h2>Make a selection.<br><em>We will do the rest.</em></h2></div><div class="product-grid">${items.map(itemCard).join('')}</div></div>`;
    if (screen === 'amount') return `<div class="screen-pad amount-screen"><div class="selected-product"><img src="${round.item.image}" alt="${round.item.name}" /><div><p class="eyebrow">YOUR SELECTION</p><h2>${round.item.name}</h2></div></div><div class="screen-heading"><p class="eyebrow">CHOOSE PAYMENT</p><h2>Enter the amount<br><em>you want to pay.</em></h2></div><div class="amount-display">${round.amount ? money(Number(round.amount)) : '₹ — —'}</div><div class="keypad">${[1, 2, 3, 4, 5, 6, 7, 8, 9, 'C', 0, '←'].map(key => `<button data-key="${key}" class="key ${key === 'C' || key === '←' ? 'utility' : ''}">${key}</button>`).join('')}</div><button class="primary full ${round.amount ? '' : 'disabled'}" data-action="to-pay" ${round.amount ? '' : 'disabled'}>Continue to payment <b>→</b></button><button class="text-button" data-action="reset">← Choose another item</button></div>`;
    if (screen === 'pay') return `<div class="screen-pad pay-layout"><div class="selected-product"><img src="${round.item.image}" alt="${round.item.name}" /><div><p class="eyebrow">YOUR SELECTION</p><h2>${round.item.name}</h2></div></div><div class="screen-heading"><p class="eyebrow">PAYMENT WINDOW</p><h2>Pay ${money(Number(round.amount))}<br><em>to try your luck.</em></h2></div><div class="qr-frame"><canvas id="payment-qr" aria-label="UPI payment QR code"></canvas><span>SCAN TO PAY</span></div><div class="pay-meta"><span>AMOUNT TO PAY</span><strong>${money(Number(round.amount))}</strong></div><button class="primary full" data-action="confirm">Payment received <b>→</b></button><button class="text-button" data-action="back">← Change amount</button></div>`;
    if (screen === 'confirm') return `<div class="screen-pad confirm-screen"><div class="confirm-icon">✓</div><p class="eyebrow">PAYMENT RECEIVED</p><h2>Thank you.<br><em>Checking payment.</em></h2><p class="muted">Confirm the amount received to decide whether the item is released.</p><button class="primary" data-action="result">Check result <b>→</b></button></div>`;
    if (screen === 'result') return `<div class="screen-pad result-screen ${round.outcome}"><div class="outcome-symbol">${round.outcome === 'win' ? '✓' : '×'}</div><p class="eyebrow">PAYMENT RESULT</p><h2>${round.outcome === 'win' ? 'YOU GOT IT' : 'YOU LOST'}</h2><p class="result-note">${round.outcome === 'win' ? 'Your payment was enough. Your item is being released.' : 'Your payment was not enough for this item.'}</p><button class="primary ${round.outcome === 'win' ? 'win-button' : 'danger-button'}" data-action="receipt">View receipt <b>→</b></button></div>`;
    return `<div class="screen-pad receipt-screen"><div class="receipt-head"><p class="eyebrow">SNACK / SELECT RECEIPT</p><span>#${String(transactions.length).padStart(3, '0')}</span></div><div class="receipt-lines"><div><span>ITEM</span><strong>${round.item.name}</strong></div><div><span>AMOUNT PAID</span><strong>${money(Number(round.amount))}</strong></div><div class="kept"><span>RESULT</span><strong>${round.outcome === 'win' ? 'GOT IT' : 'LOST'}</strong></div></div><p class="quip">“${round.outcome === 'win' ? quips.win[transactions.length % quips.win.length] : quips.steal[transactions.length % quips.steal.length]}”</p><button class="primary full" data-action="reset">Next customer <b>↗</b></button></div>`;
}

function bindEvents() {
    document.querySelectorAll('[data-action]').forEach(button => button.addEventListener('click', () => handleAction(button.dataset.action)));
    document.querySelectorAll('[data-key]').forEach(button => button.addEventListener('click', () => {
        const key = button.dataset.key;
        if (key === 'C') round.amount = '';
        else if (key === '←') round.amount = round.amount.slice(0, -1);
        else if (round.amount.length < 4) round.amount += key;
        render('amount');
    }));
    document.querySelectorAll('[data-item]').forEach(button => button.addEventListener('click', () => {
        round.item = items[Number(button.dataset.item)];
        round.price = round.item.price;
        render('amount');
    }));
}
function handleAction(action) {
    if (action === 'configure') {
        const currentUrl = getEsp32Url();
        const nextUrl = window.prompt('Enter the ESP32 address, for example http://192.168.1.42', currentUrl);
        if (nextUrl !== null) {
            localStorage.setItem(ESP32_URL_KEY, nextUrl.trim().replace(/\/$/, ''));
            render('idle');
        }
    }
    if (action === 'to-pay') render('pay');
    if (action === 'back') render('amount');
    if (action === 'confirm') { round.paid = true; render('confirm'); }
    if (action === 'result') {
        round.outcome = Number(round.amount) >= round.price ? 'win' : 'lose';
        if (round.outcome === 'win') {
            dispenseFromEsp32(round.item.servo, round.item.direction).then(result => {
                round.hardware = result;
                transactions.push({ item: round.item.name, amount: Number(round.amount), price: round.price, outcome: round.outcome, hardware: result.ok ? 'dispensed' : result.skipped ? 'manual' : 'offline', at: new Date().toISOString() });
                saveHistory(); render('result');
            });
            return;
        }
        transactions.push({ item: round.item.name, amount: Number(round.amount), price: round.price, outcome: round.outcome, hardware: 'not-dispensed', at: new Date().toISOString() });
        saveHistory(); render('result');
    }
    if (action === 'receipt') render('receipt');
    if (action === 'reset') newRound();
}

newRound();
