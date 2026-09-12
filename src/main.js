import './style.css';

const PAYMENT_ID = 'ejoabhilash11@oksbi';
const items = [
  { name: 'Coca-Cola Zero Sugar', price: 35, image: 'https://images.unsplash.com/photo-1629203849820-fdd70d49c38e?auto=format&fit=crop&w=500&q=85' },
  { name: "Lay's American Cream & Onion", price: 15, image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=500&q=85' },
  { name: 'Monster Energy', price: 60, image: 'https://images.unsplash.com/photo-1622543925917-763c34d1a86e?auto=format&fit=crop&w=500&q=85' },
  { name: 'MB Protein Bar', price: 70, image: 'https://images.unsplash.com/photo-1622484212850-eb596d769edc?auto=format&fit=crop&w=500&q=85' }
];

const quips = {
  steal: ['The machine accepts your generosity.', 'A bold guess. A profitable one.', 'Thank you for sponsoring the snacks.'],
  win: ['Correct enough to be dangerous.', 'The machine reluctantly approves.', 'You beat the price oracle.']
};

let round = null;
let transactions = JSON.parse(localStorage.getItem('vending-log') || '[]');

const app = document.querySelector('#app');

function money(value) { return `₹${value.toLocaleString('en-IN')}`; }
function pickItem() { return items[Math.floor(Math.random() * items.length)]; }
function saveHistory() {
  localStorage.setItem('vending-log', JSON.stringify(transactions));
}
function qrUrl(amount) {
  const upi = `upi://pay?pa=${encodeURIComponent(PAYMENT_ID)}&pn=Vending%20Machine&am=${amount}&cu=INR`;
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=10&data=${encodeURIComponent(upi)}`;
}
function newRound() {
  round = { item: null, paid: false, outcome: null };
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
      <footer class="footer"><span>PAYMENT ID / ${PAYMENT_ID}</span><span>TRANSACTION ${String(transactions.length + (round?.outcome ? 0 : 1)).padStart(3, '0')}</span></footer>
    </main>`;
  bindEvents();
}

function itemCard(item) {
  return `<button class="product-card" data-item="${items.indexOf(item)}"><div class="product-image"><img src="${item.image}" alt="${item.name}" /></div><strong>${item.name}</strong></button>`;
}
function screenContent(screen) {
  if (screen === 'idle') return `<div class="screen-pad selection-screen"><div class="screen-heading"><p class="eyebrow">CHOOSE YOUR SNACK</p><h2>Make a selection.<br><em>We will do the rest.</em></h2></div><div class="product-grid">${items.map(itemCard).join('')}</div></div>`;
  if (screen === 'pay') return `<div class="screen-pad pay-layout"><div class="selected-product"><img src="${round.item.image}" alt="${round.item.name}" /><div><p class="eyebrow">YOUR SELECTION</p><h2>${round.item.name}</h2></div></div><div class="screen-heading"><p class="eyebrow">PAYMENT WINDOW</p><h2>Pay ${money(round.item.price)}<br><em>to release your item.</em></h2></div><div class="qr-frame"><img src="${qrUrl(round.item.price)}" alt="UPI payment QR code" /><span>SCAN TO PAY</span></div><div class="pay-meta"><span>AMOUNT DUE</span><strong>${money(round.item.price)}</strong></div><button class="primary full" data-action="confirm">Payment received <b>→</b></button><button class="text-button" data-action="reset">← Choose another item</button></div>`;
  if (screen === 'confirm') return `<div class="screen-pad confirm-screen"><div class="confirm-icon">✓</div><p class="eyebrow">PAYMENT RECEIVED</p><h2>Thank you.<br><em>Releasing item.</em></h2><p class="muted">${round.item.name} is ready to dispense.</p><button class="primary" data-action="result">Open hatch <b>→</b></button></div>`;
  if (screen === 'result') return `<div class="screen-pad result-screen win"><div class="outcome-symbol">✓</div><p class="eyebrow">DISPENSE COMPLETE</p><h2>ENJOY</h2><p class="result-note">Please collect your ${round.item.name} below.</p><div class="receipt"><span>PRICE PAID</span><strong>${money(round.item.price)}</strong></div><button class="primary win-button" data-action="receipt">View receipt <b>→</b></button></div>`;
  return `<div class="screen-pad receipt-screen"><div class="receipt-head"><p class="eyebrow">SNACK / SELECT RECEIPT</p><span>#${String(transactions.length).padStart(3, '0')}</span></div><div class="receipt-lines"><div><span>ITEM</span><strong>${round.item.name}</strong></div><div><span>AMOUNT PAID</span><strong>${money(round.item.price)}</strong></div><div class="kept"><span>STATUS</span><strong>DISPENSED</strong></div></div><p class="quip">“${quips.win[transactions.length % quips.win.length]}”</p><button class="primary full" data-action="reset">Next customer <b>↗</b></button></div>`;
}

function bindEvents() {
  document.querySelectorAll('[data-action]').forEach(button => button.addEventListener('click', () => handleAction(button.dataset.action)));
  document.querySelectorAll('[data-item]').forEach(button => button.addEventListener('click', () => {
    round.item = items[Number(button.dataset.item)];
    render('pay');
  }));
}
function handleAction(action) {
  if (action === 'confirm') { round.paid = true; render('confirm'); }
  if (action === 'result') {
    round.outcome = 'dispensed';
    transactions.push({ item: round.item.name, price: round.item.price, outcome: round.outcome, at: new Date().toISOString() });
    saveHistory(); render('result');
  }
  if (action === 'receipt') render('receipt');
  if (action === 'reset') newRound();
}

newRound();
