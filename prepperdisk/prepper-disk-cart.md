# Prepper Disk — Cart Page (CRO)

A cart-page layout modeled on the reference screenshot, but populated with
elements pulled straight from your Prepper Disk landing page (same `.pd`
design system, same testimonials, same guarantee, same FAQ, same image
sources).

Key differences from the reference screenshot (all intentional):

- **No custom fields.** This is a **cart** page, not a checkout — so there's
  no name/address/card form. The customer enters that on the real checkout.
- **No trust bar** (per request).
- **Three order bumps** with checkmark toggles and placeholder prices:
  1. **Backup Battery — $49** (powers the Disk 10–20 hrs when the grid is down)
  2. **Faraday Bag — $39** (EMP shielding for your Disk, phone & battery)
  3. **Battery + Faraday Bundle — $79.20** (both, 10% OFF the $88 combined price)
- The bundle is mutually exclusive with the two individual bumps — selecting
  it unchecks them, and vice-versa. The **order summary total updates live**
  as bumps are toggled.
- **Two payment paths** in the summary:
  - **Checkout** — full price by credit card or a payment provider. This
    button is the **exact same red CTA** as the landing page (`.pd-btn`).
  - **Pay in Interest-Free Installments** — PayPal, Shop Pay, and Klarna
    buttons. These are **branded placeholders**. Shopify's *real* one-click
    provider buttons are dynamic checkout buttons it renders itself (via
    `{{ content_for_additional_checkout_buttons }}` / `payment_button`),
    show only the providers you've enabled in **Settings → Payments**, and
    only work inside a genuine product/cart form. For now, all three route
    to the secure checkout, where the customer picks their installment
    provider — the same options they'd get from the branded buttons.

**⚠️ Before the cart actually adds items — you need three variant IDs.**
Shopify's cart uses numeric **variant IDs**, not SKUs. The main Prepper Disk
variant (`43384681136182`) is already wired. Replace the three
`data-variant="REPLACE_..._VARIANT_ID"` placeholders on the order bumps with
the real variant ids of the Battery, Faraday Bag, and Bundle products. On
**Checkout**, the page rebuilds the cart to match exactly what's shown, then
sends the customer to `/checkout`.
- **Testimonials** (all three from the landing page), the **60-Day Peace of
  Mind Guarantee**, and the **same FAQ** are carried over below the cart.

**Save as:** `sections/prepper-disk-cart.liquid` in your Dawn theme.

**Do not click Shopify's "Format" button** after pasting.

Copy everything inside the code block below:

```liquid
<style>
.pd * { box-sizing: border-box; margin: 0; padding: 0; }
.pd { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #1a1a1a; line-height: 1.6; background: #fff; font-size: 18px !important; }
.pd, .pd * { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important; }
.pd h1, .pd h2, .pd h3, .pd h4, .pd h5, .pd h6 { font-weight: 800; }
.pd p { font-size: 1.05em !important; line-height: 1.65 !important; }
.pd li { font-size: 1em !important; }
.pd h1 { font-size: 2.8em !important; }
.pd h2 { font-size: 2.3em !important; }
.pd h3 { font-size: 1.35em !important; }
.pd .pd-sub { font-size: 1.15em !important; }
.pd .pd-quote { font-size: 1.05em !important; }
.pd .pd-faq summary { font-size: 1.1em !important; }
.pd .pd-btn { font-size: 1.15em !important; }
.pd img { max-width: 100%; display: block; }
.pd .pd-container { max-width: 1100px; margin: 0 auto; padding: 0 1.25rem; }
.pd a { color: inherit; text-decoration: none; }
.pd button { cursor: pointer; font-family: inherit; }
.pd p { margin-bottom: 1rem; }

/* ===== Base red CTA — identical to the landing page ===== */
.pd .pd-btn { display: inline-block; background: #c0392b; color: #fff; padding: 1.1rem 2.5rem; font-size: 1.1em; font-weight: 700; border: 0; border-radius: 8px; text-transform: uppercase; letter-spacing: 0.05em; box-shadow: 0 4px 14px rgba(192,57,43,0.3); transition: transform 0.15s; }
.pd .pd-btn:hover { transform: translateY(-2px); }

.pd .pd-block { padding: 4.5rem 0; }
.pd .pd-block.pd-alt { background: #faf7f2; }
.pd .pd-block h2 { font-size: 2.1em; text-align: center; margin-bottom: 0.75rem; line-height: 1.2; color: #0d2b1a; }
.pd .pd-block .pd-sub { text-align: center; color: #555; max-width: 750px; margin: 0 auto 2.5rem; font-size: 1.05em; }
@media (max-width: 700px) {
.pd .pd-block { padding: 2.5rem 0; }
.pd .pd-block h2 { font-size: 1.35em !important; }
.pd h2 { font-size: 1.35em !important; }
.pd h3 { font-size: 1.1em !important; }
.pd .pd-block .pd-sub { font-size: 0.95em !important; margin-bottom: 1.5rem; }
.pd .pd-sub { font-size: 0.95em !important; }
}

/* ===== Cart layout ===== */
.pd .pd-cart { padding: 2.5rem 0 3.5rem; background: linear-gradient(180deg, #fafafa 0%, #fff 100%); }
.pd .pd-cart-head { text-align: center; margin-bottom: 2rem; }
.pd .pd-cart-head h1 { font-size: 2.1em !important; color: #0d2b1a; margin-bottom: 0.35rem; }
.pd .pd-cart-head .pd-cart-secure { color: #1e8449; font-weight: 700; font-size: 0.95em; display: inline-flex; align-items: center; gap: 0.4rem; }
.pd .pd-cart-grid { display: grid; grid-template-columns: 1.5fr 1fr; gap: 2.5rem; align-items: start; }
@media (max-width: 860px) { .pd .pd-cart-grid { grid-template-columns: 1fr; gap: 1.75rem; } }

/* Cart line item */
.pd .pd-line { display: flex; gap: 1.25rem; align-items: center; background: #fff; border: 1px solid #e8e8e8; border-radius: 12px; padding: 1.25rem; box-shadow: 0 2px 12px rgba(0,0,0,0.04); }
.pd .pd-line-img { flex: 0 0 110px; width: 110px; height: 110px; border-radius: 10px; overflow: hidden; background: #f4f4f4; }
.pd .pd-line-img img { width: 100%; height: 100%; object-fit: cover; }
.pd .pd-line-body { flex: 1; min-width: 0; }
.pd .pd-line-body h3 { font-size: 1.15em !important; color: #0d2b1a; margin-bottom: 0.25rem; }
.pd .pd-line-meta { color: #666; font-size: 0.9em !important; margin-bottom: 0.6rem; }
.pd .pd-line-rating { color: #f5a623; font-size: 0.95em; }
.pd .pd-line-rating span { color: #666; }
.pd .pd-line-qty { display: inline-flex; align-items: center; gap: 0.75rem; margin-top: 0.75rem; border: 1px solid #ddd; border-radius: 8px; padding: 0.25rem 0.5rem; }
.pd .pd-line-qty button { background: transparent; border: 0; font-size: 1.2em; color: #0d2b1a; line-height: 1; width: 1.5rem; }
.pd .pd-line-qty span { font-weight: 700; min-width: 1.25rem; text-align: center; }
.pd .pd-line-price { text-align: right; flex-shrink: 0; }
.pd .pd-line-price .pd-now { font-size: 1.4em; font-weight: 800; color: #0d2b1a; }
@media (max-width: 480px) {
.pd .pd-line { flex-wrap: wrap; }
.pd .pd-line-img { flex: 0 0 80px; width: 80px; height: 80px; }
.pd .pd-line-price { width: 100%; text-align: left; }
}

/* Order-bump section */
.pd .pd-bumps { margin-top: 1.5rem; }
.pd .pd-bumps-title { font-size: 0.95em !important; font-weight: 800; color: #0d2b1a; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.85rem; display: flex; align-items: center; gap: 0.5rem; }
.pd .pd-bumps-title::before { content: "★"; color: #f5a623; }
.pd .pd-bump { display: flex; gap: 1rem; align-items: flex-start; background: #fff; border: 2px solid #e3e3e3; border-radius: 12px; padding: 1rem 1.15rem; margin-bottom: 0.85rem; cursor: pointer; transition: border-color 0.15s, background 0.15s, box-shadow 0.15s; }
.pd .pd-bump:hover { border-color: #bcdcc7; }
.pd .pd-bump.pd-on { border-color: #27ae60; background: #f3faf5; box-shadow: 0 2px 12px rgba(39,174,96,0.12); }
.pd .pd-bump.pd-best { border-color: #f5a623; }
.pd .pd-bump.pd-best.pd-on { border-color: #27ae60; }
.pd .pd-bump input { position: absolute; opacity: 0; width: 0; height: 0; }
.pd .pd-bump-box { flex: 0 0 26px; width: 26px; height: 26px; border-radius: 6px; border: 2px solid #c4c4c4; background: #fff; display: flex; align-items: center; justify-content: center; margin-top: 0.15rem; transition: all 0.15s; }
.pd .pd-bump-box svg { width: 16px; height: 16px; stroke: #fff; stroke-width: 3.5; fill: none; opacity: 0; transition: opacity 0.15s; }
.pd .pd-bump.pd-on .pd-bump-box { background: #27ae60; border-color: #27ae60; }
.pd .pd-bump.pd-on .pd-bump-box svg { opacity: 1; }
.pd .pd-bump-img { flex: 0 0 64px; width: 64px; height: 64px; border-radius: 8px; background: #f4f4f4; overflow: hidden; display: flex; align-items: center; justify-content: center; }
.pd .pd-bump-img img { width: 100%; height: 100%; object-fit: contain; padding: 4px; }
@media (max-width: 480px) { .pd .pd-bump-img { flex-basis: 52px; width: 52px; height: 52px; } }
.pd .pd-bump-body { flex: 1; min-width: 0; }
.pd .pd-bump-name { font-weight: 800; color: #0d2b1a; font-size: 1.02em !important; display: flex; align-items: center; flex-wrap: wrap; gap: 0.5rem; }
.pd .pd-bump-tag { background: #f5a623; color: #1a1a1a; font-size: 0.62em !important; font-weight: 800; padding: 0.15rem 0.5rem; border-radius: 999px; text-transform: uppercase; letter-spacing: 0.05em; }
.pd .pd-bump-desc { color: #555; font-size: 0.9em !important; line-height: 1.5; margin-top: 0.25rem; }
.pd .pd-bump-price { flex-shrink: 0; text-align: right; font-weight: 800; color: #0d2b1a; font-size: 1.05em; white-space: nowrap; }
.pd .pd-bump-price .pd-was { display: block; text-decoration: line-through; color: #999; font-weight: 600; font-size: 0.8em; }
.pd .pd-bump-price .pd-add { display: block; color: #27ae60; font-size: 0.7em; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; margin-top: 0.1rem; }

/* Order summary (sticky sidebar) */
.pd .pd-summary { background: #fff; border: 1px solid #e3e3e3; border-radius: 14px; padding: 1.5rem; box-shadow: 0 6px 24px rgba(0,0,0,0.07); position: sticky; top: 1.5rem; }
.pd .pd-summary h2 { font-size: 1.2em !important; color: #0d2b1a; text-align: left; margin-bottom: 1rem; }
.pd .pd-sum-rows { border-bottom: 1px solid #eee; padding-bottom: 0.85rem; margin-bottom: 0.85rem; }
.pd .pd-sum-row { display: flex; justify-content: space-between; gap: 1rem; font-size: 0.95em; color: #444; padding: 0.3rem 0; }
.pd .pd-sum-row .pd-sum-label { min-width: 0; }
.pd .pd-sum-row .pd-sum-val { font-weight: 700; color: #0d2b1a; white-space: nowrap; }
.pd .pd-sum-row.pd-muted { color: #888; font-size: 0.85em; }
.pd .pd-sum-total { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 0.35rem; }
.pd .pd-sum-total .pd-t-label { font-weight: 800; color: #0d2b1a; font-size: 1.05em; }
.pd .pd-sum-total .pd-t-val { font-weight: 800; color: #0d2b1a; font-size: 1.9em; line-height: 1; }
.pd .pd-sum-ship { color: #666; font-size: 0.82em !important; margin-bottom: 1rem; }

/* Checkout CTA — identical red button to the landing page, full width */
.pd .pd-checkout { display: block; width: 100%; text-align: center; padding: 1.1rem; font-size: 1.15em !important; }
.pd .pd-pay-secure { text-align: center; color: #1e8449; font-size: 0.82em; font-weight: 600; margin-top: 0.75rem; display: flex; align-items: center; justify-content: center; gap: 0.4rem; }

/* Installments divider + provider buttons */
.pd .pd-inst { margin-top: 1.5rem; }
.pd .pd-inst-div { display: flex; align-items: center; gap: 0.75rem; color: #888; font-size: 0.85em; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 1rem; }
.pd .pd-inst-div::before, .pd .pd-inst-div::after { content: ""; flex: 1; height: 1px; background: #e3e3e3; }
.pd .pd-inst-sub { text-align: center; color: #555; font-size: 0.9em !important; margin: -0.5rem 0 1rem; }
.pd .pd-inst-btns { display: grid; gap: 0.6rem; }
.pd .pd-pay-btn { display: flex; align-items: center; justify-content: center; gap: 0.5rem; width: 100%; padding: 0.85rem; border-radius: 8px; font-weight: 800; font-size: 1em; border: 0; letter-spacing: 0.01em; transition: transform 0.15s, filter 0.15s; }
.pd .pd-pay-btn:hover { transform: translateY(-1px); filter: brightness(0.97); }
.pd .pd-pay-btn small { font-weight: 600; font-size: 0.72em; opacity: 0.85; }
.pd .pd-pay-paypal { background: #ffc439; color: #003087; }
.pd .pd-pay-paypal b { color: #003087; } .pd .pd-pay-paypal b i { font-style: italic; }
.pd .pd-pay-paypal .pd-pp2 { color: #009cde; }
.pd .pd-pay-shop { background: #5a31f4; color: #fff; }
.pd .pd-pay-klarna { background: #ffb3c7; color: #17120f; }
.pd .pd-inst-note { text-align: center; color: #888; font-size: 0.78em !important; margin-top: 0.85rem; line-height: 1.5; }

/* ===== Testimonials (from landing page) ===== */
.pd .pd-rating { text-align: center; }
.pd .pd-big { font-size: 4em; font-weight: 800; color: #0d2b1a; line-height: 1; }
.pd .pd-stars { color: #f5a623; font-size: 1.5em; margin: 0.25rem 0; }
.pd .pd-rcount { color: #555; font-size: 0.95em; }
.pd .pd-tests { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
@media (max-width: 800px) { .pd .pd-tests { grid-template-columns: 1fr; } }
.pd .pd-test { background: #fff; border: 1px solid #eee; border-radius: 10px; padding: 0; overflow: hidden; display: flex; flex-direction: column; }
.pd .pd-test-img img { width: 100%; aspect-ratio: 16/10; object-fit: cover; display: block; background: #e8e8e8; }
.pd .pd-test-stars { color: #f5a623; font-size: 1.5em; letter-spacing: 0.15em; text-align: center; padding: 1rem 1.5rem 0; }
.pd .pd-test-body { padding: 0.75rem 1.5rem 1.5rem; }
.pd .pd-quote { color: #333; font-size: 0.95em; margin-bottom: 1rem; }
.pd .pd-quote b { color: #0d2b1a; }
.pd .pd-author { font-weight: 600; font-size: 0.9em; color: #555; }

/* ===== Guarantee (from landing page) ===== */
.pd .pd-guar { background: #0d2b1a; color: #fff; padding: 4rem 0; text-align: center; }
.pd .pd-guar h2 { color: #fff; font-size: 2.1em; margin-bottom: 0.75rem; }
.pd .pd-guar .pd-sub { color: #d4d4d4; max-width: 700px; margin: 0 auto 2rem; }
.pd .pd-seal-wrap { display: flex; justify-content: center; margin: 0 auto 1.5rem; }
.pd .pd-guar p { max-width: 700px; margin: 0 auto 1rem; }
@media (max-width: 700px) { .pd .pd-guar h2 { font-size: 1.35em; } }

/* ===== FAQ (from landing page) ===== */
.pd .pd-faq { max-width: 800px; margin: 0 auto; }
.pd .pd-faq details { background: #fff; border: 1px solid #eee; border-radius: 8px; margin-bottom: 0.75rem; box-shadow: 0 1px 3px rgba(0,0,0,0.03); }
.pd .pd-faq summary { padding: 1.1rem 1.25rem; font-weight: 600; cursor: pointer; list-style: none; display: flex; justify-content: space-between; align-items: center; gap: 1rem; color: #0d2b1a; font-size: 1.02em; }
.pd .pd-faq summary::-webkit-details-marker { display: none; }
.pd .pd-faq summary::after { content: "+"; font-size: 1.5em; color: #1e8449; font-weight: 400; line-height: 1; }
.pd .pd-faq details[open] summary::after { content: "\2212"; }
.pd .pd-faq details > p { padding: 0 1.25rem 1.25rem; color: #444; margin: 0; }
</style>

<div class="pd">

<section class="pd-cart">
<div class="pd-container">

<div class="pd-cart-head">
<h1>Your Cart</h1>
<span class="pd-cart-secure">
<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
Secure 256-bit encrypted checkout
</span>
</div>

<div class="pd-cart-grid">

<!-- LEFT: cart item + order bumps -->
<div class="pd-cart-main">

<div class="pd-line">
<div class="pd-line-img"><img src="https://cdn.shopify.com/s/files/1/0649/2710/5078/files/Product_Shot.webp?v=1778838659" alt="Prepper Disk Premium 512GB"></div>
<div class="pd-line-body">
<h3>Prepper Disk Premium · 512GB</h3>
<div class="pd-line-meta">Off-line survival library · Yours to keep for life</div>
<div class="pd-line-rating">&#9733;&#9733;&#9733;&#9733;&#9733; <span>4.8 / 5 &middot; 114+ reviews</span></div>
<div class="pd-line-qty">
<button type="button" aria-label="Decrease quantity">&minus;</button>
<span>1</span>
<button type="button" aria-label="Increase quantity">+</button>
</div>
</div>
<div class="pd-line-price"><span class="pd-now">$279</span></div>
</div>

<div class="pd-bumps">
<div class="pd-bumps-title">Add these before you check out</div>

<!-- Bump 1: Battery -->
<label class="pd-bump" data-bump="battery" data-price="49" data-variant="REPLACE_BATTERY_VARIANT_ID">
<input type="checkbox">
<span class="pd-bump-box"><svg viewBox="0 0 24 24" aria-hidden="true"><polyline points="4 12 10 18 20 6"/></svg></span>
<span class="pd-bump-img"><img src="https://cdn.shopify.com/s/files/1/0649/2710/5078/files/Battery-2.png?v=1763005487" alt="Prepper Disk backup battery"></span>
<div class="pd-bump-body">
<div class="pd-bump-name">Prepper Disk Backup Battery</div>
<div class="pd-bump-desc">Powers your Prepper Disk for <strong>10&ndash;20 hours</strong> when the grid goes down. Rechargeable via car cigarette lighter, solar generator, wall outlet, and more &mdash; so your library never goes dark.</div>
</div>
<div class="pd-bump-price">$49<span class="pd-add">+ Add</span></div>
</label>

<!-- Bump 2: Faraday bag -->
<label class="pd-bump" data-bump="faraday" data-price="39" data-variant="REPLACE_FARADAY_VARIANT_ID">
<input type="checkbox">
<span class="pd-bump-box"><svg viewBox="0 0 24 24" aria-hidden="true"><polyline points="4 12 10 18 20 6"/></svg></span>
<span class="pd-bump-img"><img src="https://cdn.shopify.com/s/files/1/0649/2710/5078/files/NX3.png?v=1780083566" alt="EMP-shielding Faraday bag"></span>
<div class="pd-bump-body">
<div class="pd-bump-name">EMP-Shielding Faraday Bag</div>
<div class="pd-bump-desc">Drop your phone, Prepper Disk, and battery inside and they&rsquo;re shielded &mdash; so even when an <strong>EMP fries every other electronic</strong>, you still have your emergency library. The edge that wins a SHTF scenario.</div>
</div>
<div class="pd-bump-price">$39<span class="pd-add">+ Add</span></div>
</label>

<!-- Bump 3: Bundle -->
<label class="pd-bump pd-best" data-bump="bundle" data-price="79.20" data-variant="REPLACE_BUNDLE_VARIANT_ID">
<input type="checkbox">
<span class="pd-bump-box"><svg viewBox="0 0 24 24" aria-hidden="true"><polyline points="4 12 10 18 20 6"/></svg></span>
<span class="pd-bump-img"><img src="https://cdn.shopify.com/s/files/1/0649/2710/5078/files/BatteryEMPBundle-4.png?v=1763005487" alt="Battery + Faraday bundle"></span>
<div class="pd-bump-body">
<div class="pd-bump-name">Battery + Faraday Bundle <span class="pd-bump-tag">Save 10%</span></div>
<div class="pd-bump-desc">Get <strong>both</strong> the Backup Battery and the EMP-Shielding Faraday Bag together and save 10% &mdash; power when the grid dies, protection when the electronics fry. Fully covered, both ways.</div>
</div>
<div class="pd-bump-price"><span class="pd-was">$88</span>$79.20<span class="pd-add">+ Add</span></div>
</label>

</div>
</div>

<!-- RIGHT: order summary + payment -->
<aside class="pd-summary">
<h2>Order Summary</h2>

<div class="pd-sum-rows" id="pdSumRows">
<div class="pd-sum-row"><span class="pd-sum-label">Prepper Disk Premium 512GB</span><span class="pd-sum-val">$279.00</span></div>
<!-- bump rows injected here by JS -->
</div>

<div class="pd-sum-total">
<span class="pd-t-label">Total</span>
<span class="pd-t-val" id="pdTotal">$279.00</span>
</div>
<div class="pd-sum-ship">Shipping &amp; taxes calculated at checkout</div>

<button type="button" class="pd-btn pd-checkout">Checkout</button>
<div class="pd-pay-secure">
<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
Guaranteed safe &amp; secure checkout
</div>

<div class="pd-inst">
<div class="pd-inst-div">or</div>
<p class="pd-inst-sub"><strong>Pay in interest-free installments</strong></p>
<div class="pd-inst-btns">
<button type="button" class="pd-pay-btn pd-pay-paypal"><b>Pay<span class="pd-pp2">Pal</span></b></button>
<button type="button" class="pd-pay-btn pd-pay-shop">Shop&nbsp;Pay</button>
<button type="button" class="pd-pay-btn pd-pay-klarna">Klarna</button>
</div>
<p class="pd-inst-note">Split your order into interest-free payments. Availability depends on order total and provider approval.</p>
</div>
</aside>

</div>
</div>
</section>

<section class="pd-block pd-alt">
<div class="pd-container">
<h2>Stashed With 7,000+ Households</h2>
<p class="pd-sub">From homesteaders to prepared families, here's what people are saying.</p>
<div class="pd-rating" style="margin-bottom: 2.5rem;">
<div class="pd-big">4.8</div>
<div class="pd-stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
<div class="pd-rcount">Based on 114+ verified reviews</div>
</div>
<div class="pd-tests">
<div class="pd-test">
<div class="pd-test-img"><img src="https://cdn.shopify.com/s/files/1/0649/2710/5078/files/Douglas_Photo.webp?v=1778838659" alt="Douglas G."></div>
<div class="pd-test-stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
<div class="pd-test-body">
<p class="pd-quote">This device is a must have in a disaster situation. I can have <b>the library of Alexandria in my hands</b> using the USB feature with an external drive on multiple devices. If I could give Prepper Disk six stars, I would.</p>
<div class="pd-author">&mdash; Douglas G., verified buyer</div>
</div>
</div>
<div class="pd-test">
<div class="pd-test-img"><img src="https://cdn.shopify.com/s/files/1/0649/2710/5078/files/Micaela_Photo.webp?v=1778838659" alt="Micaela B."></div>
<div class="pd-test-stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
<div class="pd-test-body">
<p class="pd-quote">WOW! Firstly, <b>the customer service is above and beyond fantastic.</b> When I encountered a delivery hiccup I reached out to the company and Adam responded promptly and thoughtfully.</p>
<div class="pd-author">&mdash; Micaela B., verified buyer</div>
</div>
</div>
<div class="pd-test">
<div class="pd-test-img"><img src="https://cdn.shopify.com/s/files/1/0649/2710/5078/files/Garrett_Photo.webp?v=1778838658" alt="Garrett D."></div>
<div class="pd-test-stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
<div class="pd-test-body">
<p class="pd-quote">Within seconds I was connected on my mini PC and my phone. It's really a pretty amazing device. The Pi is USB-C powered so it makes it <b>super easy to take on the go, in the car, or in my comms trailer.</b> It's well organized and easy to find everything.</p>
<div class="pd-author">&mdash; Garrett D., verified buyer</div>
</div>
</div>
</div>
</div>
</section>

<section class="pd-guar">
<div class="pd-container">
<h2>Our 60-Day 'Peace of Mind' Guarantee</h2>
<p class="pd-sub">Because the only way you should ever feel about your Prepper Disk is genuinely safer, more capable, and more prepared than you were the day before it arrived</p>
<div class="pd-seal-wrap">
<div style="width: 180px; height: 180px; border-radius: 12px; overflow: hidden;"><img src="https://cdn.shopify.com/s/files/1/0649/2710/5078/files/Guarantee_badge.svg?v=1778838911" alt="60-day money-back guarantee" style="width: 100%; height: 100%; object-fit: cover;"></div>
</div>
<p>So if somehow your Prepper Disk doesn't meet your expectations, just email our team at <strong>support@prepperdisk.com</strong> within sixty days and we'll send you instructions for getting it back to us, with a full refund processed the moment it arrives.</p>
<p>On top of that, every single unit we ship comes with a full one-year hardware warranty, so you're covered in every direction from the moment your order is placed.</p>
</div>
</section>

<section class="pd-block pd-alt" id="pd-faq">
<div class="pd-container">
<h2>Frequently Asked Questions</h2>
<p class="pd-sub">Quick answers to the questions we hear most often. If yours isn't here, just shoot us a note at support@prepperdisk.com and we'll get right back to you.</p>
<div class="pd-faq">
<details>
<summary>Is there a subscription, or any kind of ongoing fee?</summary>
<p>There are no subscriptions, no monthly fees, and no usage limits whatsoever. Once your Prepper Disk arrives, every single piece of content on it is yours to keep forever, and any future content updates we release are included at absolutely no extra cost.</p>
</details>
<details>
<summary>Do I really need to be tech-savvy to set this up?</summary>
<p>Not even a little bit. The Prepper Disk arrives fully loaded and ready to go, so all you need to do is plug it in, switch your phone or laptop's WiFi over to its private network, and start browsing like you would on any normal website. Most of our customers are completely up and running within five minutes of opening the box.</p>
</details>
<details>
<summary>What happens when there is no electricity?</summary>
<p>The Prepper Disk runs on a standard USB-C power source, which means a regular wall outlet, a car charger, a portable power bank, or even a (solar) generator will all do the job perfectly. The moment it has power, it creates its own private WiFi network and is ready to use within a few seconds.</p>
</details>
<details>
<summary>How many devices can connect to a single Disk at the same time?</summary>
<p>Up to twenty devices can be connected to a single Prepper Disk at once, which is more than enough capacity for a typical household, a small classroom, a community group, or even a fully off-grid homestead with extended family staying through an emergency.</p>
</details>
<details>
<summary>How big is it, and is it durable enough to take outdoors?</summary>
<p>The Disk measures 3.5 by 2.75 by 1 inches and slips comfortably into a jacket pocket, glove box, or bug-out bag. It lives inside a rugged aluminum case with passive cooling, which means there is no internal fan that could fail on you in dusty, sandy, or wet field conditions.</p>
</details>
<details>
<summary>What about EMP events or electromagnetic interference?</summary>
<p>We offer an optional Faraday Bag that protects the unit from EMP events and general electromagnetic interference, and it's something we'd genuinely recommend for anyone who wants to keep the Disk fully shielded and stored safely between uses.</p>
</details>
<details>
<summary>What happens if it doesn't work out for me?</summary>
<p>Every Prepper Disk comes with a 60-day return window, so if it doesn't end up making you feel safer, more capable, and more prepared, just email our team at support@prepperdisk.com and we'll send you the instructions to ship it back for a full refund. On top of that, every unit is covered by a one-year hardware warranty just in case anything ever does go sideways.</p>
</details>
</div>
</div>
</section>

</div>

<script>
(function(){
  var BASE = 279.00;
  var rowsWrap = document.getElementById('pdSumRows');
  var totalEl = document.getElementById('pdTotal');
  var bumps = Array.prototype.slice.call(document.querySelectorAll('.pd .pd-bump'));

  function money(n){ return '$' + n.toFixed(2); }

  function labelFor(key){
    if (key === 'battery') return 'Backup Battery';
    if (key === 'faraday') return 'EMP-Shielding Faraday Bag';
    if (key === 'bundle')  return 'Battery + Faraday Bundle';
    return key;
  }

  function render(){
    // clear existing bump rows (keep the base product row = first child)
    rowsWrap.querySelectorAll('.pd-bump-row').forEach(function(el){ el.remove(); });
    var total = BASE;
    bumps.forEach(function(b){
      if (b.classList.contains('pd-on')){
        var price = parseFloat(b.getAttribute('data-price'));
        total += price;
        var row = document.createElement('div');
        row.className = 'pd-sum-row pd-bump-row';
        row.innerHTML = '<span class="pd-sum-label">+ ' + labelFor(b.getAttribute('data-bump')) +
                        '</span><span class="pd-sum-val">' + money(price) + '</span>';
        rowsWrap.appendChild(row);
      }
    });
    totalEl.textContent = money(total);
  }

  function setOn(b, on){
    b.classList.toggle('pd-on', on);
    var cb = b.querySelector('input');
    if (cb) cb.checked = on;
  }

  bumps.forEach(function(b){
    var cb = b.querySelector('input');
    cb.addEventListener('change', function(){
      var key = b.getAttribute('data-bump');
      var on = cb.checked;
      setOn(b, on);
      // mutual exclusivity: bundle vs. the two individual bumps
      if (on && key === 'bundle'){
        bumps.forEach(function(o){
          var k = o.getAttribute('data-bump');
          if (k === 'battery' || k === 'faraday') setOn(o, false);
        });
      } else if (on && (key === 'battery' || key === 'faraday')){
        bumps.forEach(function(o){
          if (o.getAttribute('data-bump') === 'bundle') setOn(o, false);
        });
      }
      render();
    });
  });

  render();

  /* ===== Checkout wiring =====
     Shopify's cart uses numeric VARIANT IDs (not SKUs). The main product's
     variant id is taken from the landing-page add-to-cart link. Replace the
     three data-variant="REPLACE_..." placeholders on the bumps above with the
     real variant ids of those add-on products (or bundle product).
     On checkout we rebuild the cart to match exactly what's shown here, then
     send the customer to Shopify's secure checkout (where PayPal / Shop Pay /
     Klarna installment options appear). */
  var MAIN_VARIANT = 43384681136182; // Prepper Disk Premium 512GB

  function goToCheckout(){
    var items = [{ id: MAIN_VARIANT, quantity: 1 }];
    bumps.forEach(function(b){
      if (b.classList.contains('pd-on')){
        var v = b.getAttribute('data-variant');
        if (v && /^\d+$/.test(v)) items.push({ id: parseInt(v, 10), quantity: 1 });
      }
    });
    fetch('/cart/clear.js', { method: 'POST' })
      .then(function(){
        return fetch('/cart/add.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: items })
        });
      })
      .then(function(){ window.location.href = '/checkout'; })
      .catch(function(){ window.location.href = '/cart'; });
  }

  var checkoutBtn = document.querySelector('.pd .pd-checkout');
  if (checkoutBtn) checkoutBtn.addEventListener('click', goToCheckout);

  // Installment buttons currently route to the same secure checkout, where the
  // customer chooses their pay-over-time provider. See notes for the real
  // one-click provider buttons.
  document.querySelectorAll('.pd .pd-pay-btn').forEach(function(btn){
    btn.addEventListener('click', goToCheckout);
  });
})();
</script>

{% schema %}
{
  "name": "Prepper Disk Cart",
  "settings": [],
  "presets": [
    { "name": "Prepper Disk Cart" }
  ]
}
{% endschema %}
```
