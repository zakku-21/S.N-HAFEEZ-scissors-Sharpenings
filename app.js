/* ═══════════════════════════════════════════════════
   S.N.HAFZEE — Simplified App (12 Products)
   Cart & Payment Gateway
   ═══════════════════════════════════════════════════ */

// ── Products (12 Scissors) ────────────────────────
const PRODUCTS = [
  { id: 1,  name: 'ProCut Gold Shears 6"',        price: 449, original: 899, desc: 'Japanese steel professional barber shears with gold-plated handles.', icon: '✂' },
  { id: 2,  name: 'SlimLine Thinning Scissors',    price: 399, original: 799, desc: 'Texturizing thinning shears with 30-tooth blade for perfect blending.', icon: '✂' },
  { id: 3,  name: 'BarberPro Razor Edge 7"',       price: 499, original: 999, desc: 'Convex edge hand-forged shears for ultra-smooth cutting.', icon: '✂' },
  { id: 4,  name: 'TailorMaster 10" Dressmaker',   price: 479, original: 959, desc: 'Heavy-duty dressmaking shears with micro-serrated blade.', icon: '✂' },
  { id: 5,  name: 'PinkingPro Zigzag Scissors',    price: 349, original: 699, desc: 'Professional pinking shears for decorative zigzag edges.', icon: '✂' },
  { id: 6,  name: 'Embroidery Precision Snips',    price: 329, original: 659, desc: 'Ultra-fine tip embroidery scissors for detailed threadwork.', icon: '✂' },
  { id: 7,  name: 'GardenMax Bypass Pruner',       price: 429, original: 859, desc: 'Professional bypass pruning shears with SK5 steel blades.', icon: '✂' },
  { id: 8,  name: 'BonsaiCraft Mini Shears',       price: 379, original: 759, desc: 'Compact bonsai scissors for delicate pruning.', icon: '✂' },
  { id: 9,  name: 'ChefPro Multi-Function 8"',     price: 459, original: 919, desc: 'Heavy-duty kitchen shears with bottle opener & nutcracker.', icon: '✂' },
  { id: 10, name: 'HerbSnip 5-Blade Scissors',     price: 339, original: 679, desc: 'Five parallel blades for quickly shredding herbs.', icon: '✂' },
  { id: 11, name: 'OfficePro Comfort Grip 8"',     price: 309, original: 619, desc: 'Ergonomic soft-grip office scissors for everyday use.', icon: '✂' },
  { id: 12, name: 'DetailCraft Micro Scissors',    price: 359, original: 719, desc: 'Ultra-fine precision scissors for intricate work.', icon: '✂' },
];

// ── State ────────────────────────────────────────
let cart = JSON.parse(localStorage.getItem('snipcart') || '[]');

// ── DOM Ready ────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderProducts();
  setupCart();
  updateCartBadge();
  updateCartUI();
});

// ═══════════════════════════════════════════════════
//  RENDER PRODUCTS
// ═══════════════════════════════════════════════════
function renderProducts() {
  const grid = document.getElementById('products-grid');
  grid.innerHTML = PRODUCTS.map(p => {
    const discount = Math.round((1 - p.price / p.original) * 100);
    return `
      <div class="product-card">
        <div class="product-image">
          <span class="product-icon">${p.icon}</span>
          <span class="product-badge">-${discount}%</span>
        </div>
        <div class="product-info">
          <h3 class="product-name">${p.name}</h3>
          <p class="product-desc">${p.desc}</p>
          <div class="product-price">
            <span class="current-price">₹${p.price.toLocaleString('en-IN')}</span>
            <span class="original-price">₹${p.original.toLocaleString('en-IN')}</span>
          </div>
          <button class="add-to-cart-btn" data-id="${p.id}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="9" cy="21" r="1"/>
              <circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            Add to Cart
          </button>
        </div>
      </div>`;
  }).join('');
}

// ═══════════════════════════════════════════════════
//  CART FUNCTIONALITY
// ═══════════════════════════════════════════════════
function setupCart() {
  // Add to cart buttons
  document.addEventListener('click', e => {
    if (e.target.closest('.add-to-cart-btn')) {
      const btn = e.target.closest('.add-to-cart-btn');
      const id = +btn.dataset.id;
      addToCart(id);
    }
  });

  // Cart sidebar toggle
  const cartBtn = document.getElementById('cart-btn');
  const cartSidebar = document.getElementById('cart-sidebar');
  const cartOverlay = document.getElementById('cart-overlay');
  const cartClose = document.getElementById('cart-close');

  cartBtn.addEventListener('click', () => openCart());
  cartClose.addEventListener('click', () => closeCart());
  cartOverlay.addEventListener('click', () => closeCart());

  // Checkout button
  document.getElementById('checkout-btn').addEventListener('click', () => showCheckout());
  document.getElementById('back-to-cart').addEventListener('click', () => showCartView());
  document.getElementById('proceed-payment').addEventListener('click', () => proceedToPayment());
  document.getElementById('back-to-checkout').addEventListener('click', () => showCheckoutView());

  // Payment methods
  document.querySelectorAll('.payment-option').forEach(option => {
    option.addEventListener('click', () => {
      const method = option.dataset.method;
      showPaymentForm(method);
    });
  });

  // Payment buttons
  document.getElementById('upi-pay-btn').addEventListener('click', () => processPayment('UPI'));
  document.getElementById('card-pay-btn').addEventListener('click', () => processPayment('Card'));

  // Continue shopping
  document.getElementById('continue-shopping').addEventListener('click', () => {
    cart = [];
    localStorage.setItem('snipcart', JSON.stringify(cart));
    updateCartBadge();
    updateCartUI();
    closeCart();
    showCartView();
    showToast('Thank you for shopping!');
  });
}

function addToCart(id) {
  const existing = cart.find(item => item.id === id);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ id, qty: 1 });
  }
  localStorage.setItem('snipcart', JSON.stringify(cart));
  updateCartBadge();
  updateCartUI();
  showToast('Added to cart!');
  
  // Open cart to show the item was added
  openCart();
}

function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  localStorage.setItem('snipcart', JSON.stringify(cart));
  updateCartBadge();
  updateCartUI();
}

function updateQuantity(id, change) {
  const item = cart.find(item => item.id === id);
  if (item) {
    item.qty += change;
    if (item.qty <= 0) {
      removeFromCart(id);
      return;
    }
  }
  localStorage.setItem('snipcart', JSON.stringify(cart));
  updateCartBadge();
  updateCartUI();
}

function updateCartBadge() {
  const total = cart.reduce((sum, item) => sum + item.qty, 0);
  document.getElementById('cart-badge').textContent = total;
}

function updateCartUI() {
  const cartItems = document.getElementById('cart-items');
  const cartSummary = document.getElementById('cart-summary');
  const cartEmpty = document.getElementById('cart-empty');

  if (cart.length === 0) {
    cartItems.innerHTML = '';
    cartSummary.style.display = 'none';
    cartEmpty.style.display = '';
    return;
  }

  cartEmpty.style.display = 'none';
  cartSummary.style.display = '';

  let total = 0;
  cartItems.innerHTML = cart.map(item => {
    const product = PRODUCTS.find(p => p.id === item.id);
    if (!product) return '';
    const itemTotal = product.price * item.qty;
    total += itemTotal;
    return `
      <div class="cart-item">
        <div class="cart-item-image">
          <span>${product.icon}</span>
        </div>
        <div class="cart-item-details">
          <h4>${product.name}</h4>
          <p>₹${product.price.toLocaleString('en-IN')}</p>
        </div>
        <div class="cart-item-qty">
          <button class="qty-btn" onclick="updateQuantity(${item.id}, -1)">−</button>
          <span>${item.qty}</span>
          <button class="qty-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
        </div>
        <button class="remove-btn" onclick="removeFromCart(${item.id})">&times;</button>
      </div>`;
  }).join('');

  document.getElementById('total-amount').textContent = `₹${total.toLocaleString('en-IN')}`;
}

function getCartTotal() {
  return cart.reduce((sum, item) => {
    const product = PRODUCTS.find(p => p.id === item.id);
    return sum + (product ? product.price * item.qty : 0);
  }, 0);
}

// ═══════════════════════════════════════════════════
//  CART SIDEBAR VIEWS
// ═══════════════════════════════════════════════════
function openCart() {
  document.getElementById('cart-sidebar').classList.add('open');
  document.getElementById('cart-overlay').classList.add('active');
  document.body.style.overflow = 'hidden';
  updateCartUI();
}

function closeCart() {
  document.getElementById('cart-sidebar').classList.remove('open');
  document.getElementById('cart-overlay').classList.remove('active');
  document.body.style.overflow = '';
  // Reset to cart view
  showCartView();
}

function showCartView() {
  document.getElementById('cart-view').style.display = '';
  document.getElementById('checkout-view').style.display = 'none';
  document.getElementById('payment-view').style.display = 'none';
  document.getElementById('success-view').style.display = 'none';
  updateCartUI();
}

function showCheckout() {
  if (cart.length === 0) {
    showToast('Your cart is empty!');
    return;
  }

  document.getElementById('cart-view').style.display = 'none';
  document.getElementById('checkout-view').style.display = '';

  // Populate order summary
  const orderItems = document.getElementById('order-items');
  let total = 0;
  orderItems.innerHTML = cart.map(item => {
    const product = PRODUCTS.find(p => p.id === item.id);
    if (!product) return '';
    const itemTotal = product.price * item.qty;
    total += itemTotal;
    return `
      <div class="order-item">
        <span class="order-item-name">${product.name} × ${item.qty}</span>
        <span class="order-item-price">₹${itemTotal.toLocaleString('en-IN')}</span>
      </div>`;
  }).join('');

  document.getElementById('order-amount').textContent = `₹${total.toLocaleString('en-IN')}`;
}

function showCheckoutView() {
  document.getElementById('cart-view').style.display = 'none';
  document.getElementById('checkout-view').style.display = '';
  document.getElementById('payment-view').style.display = 'none';
  document.getElementById('upi-form').style.display = 'none';
  document.getElementById('card-form').style.display = 'none';
  document.querySelectorAll('.payment-option').forEach(o => o.style.display = '');
}

function proceedToPayment() {
  // Validate form
  const name = document.getElementById('name').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const address = document.getElementById('address').value.trim();
  const pincode = document.getElementById('pincode').value.trim();

  if (!name || !phone || !address || !pincode) {
    showToast('Please fill in all delivery details!');
    return;
  }

  document.getElementById('checkout-view').style.display = 'none';
  document.getElementById('payment-view').style.display = '';
  document.getElementById('upi-form').style.display = 'none';
  document.getElementById('card-form').style.display = 'none';
  document.querySelectorAll('.payment-option').forEach(o => o.style.display = '');
}

function showPaymentForm(method) {
  document.querySelectorAll('.payment-option').forEach(o => o.style.display = 'none');
  
  if (method === 'upi') {
    document.getElementById('upi-form').style.display = '';
  } else {
    document.getElementById('card-form').style.display = '';
  }
}

function processPayment(method) {
  if (method === 'UPI') {
    const upiId = document.getElementById('upi-id').value.trim();
    if (!upiId || !upiId.includes('@')) {
      showToast('Please enter a valid UPI ID!');
      return;
    }
  } else {
    const cardNumber = document.getElementById('card-number').value.trim();
    const expiry = document.getElementById('card-expiry').value.trim();
    const cvv = document.getElementById('card-cvv').value.trim();
    const cardName = document.getElementById('card-name').value.trim();

    if (!cardNumber || !expiry || !cvv || !cardName) {
      showToast('Please fill in all card details!');
      return;
    }
  }

  // Simulate payment processing
  showToast('Processing payment...');
  
  setTimeout(() => {
    // Generate order ID
    const orderId = 'SNIP' + Date.now().toString().slice(-8);
    document.getElementById('order-id-display').textContent = orderId;

    // Show success view
    document.getElementById('payment-view').style.display = 'none';
    document.getElementById('success-view').style.display = '';
  }, 1500);
}

// ═══════════════════════════════════════════════════
//  TOAST NOTIFICATION
// ═══════════════════════════════════════════════════
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 2500);
}

// ═══════════════════════════════════════════════════
//  CARD INPUT FORMATTING
// ═══════════════════════════════════════════════════
document.addEventListener('input', e => {
  // Format card number with spaces
  if (e.target.id === 'card-number') {
    let value = e.target.value.replace(/\s/g, '').replace(/\D/g, '');
    value = value.match(/.{1,4}/g)?.join(' ') || value;
    e.target.value = value;
  }

  // Format expiry date
  if (e.target.id === 'card-expiry') {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2);
    }
    e.target.value = value;
  }
});