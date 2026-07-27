# Prepper Disk — Cart Page (CRO)

A cart-page layout modeled on the reference screenshot, but populated with
elements pulled straight from your Prepper Disk landing page (same `.pd`
design system, same testimonials, same guarantee, same FAQ, same image
sources).

Key differences from the reference screenshot (all intentional):

- **No custom fields.** This is a **cart** page, not a checkout — so there's
  no name/address/card form. The customer enters that on the real checkout.
- **No trust bar** (per request).
- **Two order bumps** with checkmark toggles:
  1. **10+ hour Battery — $22.99** (powers the Disk 10–20 hrs when the grid is down)
  2. **EMP-Shielding Faraday Bag — $22.99** (shields your Disk, phone & battery)
- A **"2 Years Warranty" unlock row** sits below the bumps. It reads
  **Locked** by default and flips to a green **Unlocked** state when *both*
  the Battery and the Faraday Bag are added (and reverts if either is
  removed). It's a display-only incentive — it does **not** add a product to
  the cart. The **order summary total updates live** as bumps are toggled.
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
- **Quantity steppers** on each bump. A qty control appears when a bump is
  selected; changing it updates the order-summary line (`× n`), the running
  total, and the quantity in the cart.
- **Live Shopify cart sync.** This page mirrors the *real* Shopify cart. On
  load it reads `/cart.js`, reflects any items already in the cart (pre-checking
  bumps), and ensures the Prepper Disk itself is in the cart. Every change —
  main qty, adding/removing a bump, bump qty — is written straight to the cart
  via the AJAX Cart API (`/cart/add.js` + `/cart/update.js`). So the native
  `/cart`, the cart icon, and your **abandoned-cart automation** all see the
  same items, and a genuine (abandonable) cart exists even if the visitor
  never clicks Checkout. Checkout just flushes the latest state and hands off
  to `/checkout`.
- **US-only battery.** The battery only ships to the US, so the Battery bump
  **and** the 2-year warranty (which requires it) are gated in Liquid behind
  `localization.country` — non-US visitors see the Faraday bag alone, and the
  battery HTML is never even sent to them (no flash, and the cart sync can't
  try to add a variant Shopify would reject). Change the market by editing
  `us_only_country` at the top of the code block.
- **Testimonials** (all three from the landing page), the **60-Day Peace of
  Mind Guarantee**, and the **same FAQ** are carried over below the cart.

**⚠️ Before the cart actually adds items — fill in the config block.**
Shopify's cart adds by numeric **variant ID**, and the numbers in your admin
URLs (`…/products/7787534712886`) are **product IDs** — a different value.
Rather than hunt down variant IDs, the template resolves them from **product
handles** via Liquid. The two add-on handles are already filled in at the top
of the code block:

```liquid
{%- assign battery_handle = '10-hour-battery' -%}
{%- assign faraday_handle = 'emp-protection-bag-faraday-defense-nx3' -%}
```

The handle is the last part of each product's storefront URL
(`prepperdisk.com/products/`**`<handle>`**). The main Prepper Disk
variant (`43384681136182`) is already wired. Every change on the page writes
straight to the live Shopify cart, and **Checkout** flushes the latest state
before sending the customer to `/checkout`. (Prefer raw variant IDs? You can
hard-code them straight into the `data-variant=""` attributes instead.)

**Save as:** a **page template** — `templates/page.customPDcart.liquid`
(Liquid, *not* JSON) — then create a Page in admin and assign it that
template. There is **no `{% schema %}` block**: schema only belongs in
*section* files, and a page template must not contain one (it's what broke
the template earlier).

**Hide the header/nav on this page (footer stays).** The first line of the
code block is `{% layout 'no-header' %}`, which tells Shopify to render this
page with a stripped-down layout instead of the default. You need to create
that layout once:

1. In **Edit code → Layout**, open `theme.liquid`, **Copy** its full contents.
2. Add a new layout file named `no-header` (Shopify creates
   `layout/no-header.liquid`) and paste the contents in.
3. In that new file, **delete the header line** — in Dawn that's
   `{% sections 'header-group' %}` (this also removes the announcement bar).
   Leave `{% sections 'footer-group' %}` in place so the footer stays.
4. Save. The `{% layout 'no-header' %}` directive already at the top of this
   template will now use it, on this page only — every other page keeps the
   normal header.

(If you'd rather keep the header for now, just delete that first
`{% layout 'no-header' %}` line and the page falls back to the default layout.)

**Do not click Shopify's "Format" button** after pasting.

Copy everything inside the code block below:

```liquid
{%- comment -%} Render this page without the theme header/nav (footer stays).
  Requires a layout/no-header.liquid file — see the "Hide the header/nav"
  note above. Remove this next line to fall back to the default layout. {%- endcomment -%}
{% layout 'no-header' %}

{%- comment -%}
  ── Add-on product config ────────────────────────────────────────────────
  Shopify's cart adds items by VARIANT id, not by the PRODUCT id shown in the
  admin URL (…/products/<productId>) — they are different numbers.

  Easiest + most future-proof: paste each add-on's HANDLE below (the last part
  of its storefront URL: prepperdisk.com/products/<handle>). Liquid then looks
  up the live variant id automatically, so it never breaks if the id changes.

  Product ids you provided (reference only — NOT usable in the cart):
    Battery  → product 7787534712886
    Faraday  → product 8742624329782

  Alternative: leave the handles blank and hard-code numeric variant ids
  straight into the two data-variant="" attributes on the bumps instead.
{%- endcomment -%}
{%- assign battery_handle = '10-hour-battery' -%}
{%- assign faraday_handle = 'emp-protection-bag-faraday-defense-nx3' -%}
{%- assign battery_vid = all_products[battery_handle].selected_or_first_available_variant.id -%}
{%- assign faraday_vid = all_products[faraday_handle].selected_or_first_available_variant.id -%}

{%- comment -%}
  ── Region gate ───────────────────────────────────────────────────────────
  The battery only ships to the US, so the Battery bump AND the 2-year warranty
  (which requires the battery) are shown only to US shoppers. Non-US visitors
  see the Faraday bag alone. This uses `localization.country` — the same
  Shopify Markets country signal that already blocks the battery from non-US
  carts — so the two always agree. Set us_only_country to change the market.
{%- endcomment -%}
{%- assign us_only_country = 'US' -%}
{%- assign show_us_only = false -%}
{%- if localization.country.iso_code == us_only_country -%}{%- assign show_us_only = true -%}{%- endif -%}

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
.pd .pd-line-qty { display: inline-flex; align-items: center; gap: 0.6rem; margin-top: 0.75rem; }
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
.pd .pd-bump-note { margin-top: 0.5rem; font-size: 0.82em !important; color: #1e8449; font-weight: 700; display: flex; align-items: center; gap: 0.4rem; }
.pd .pd-bump-note svg { width: 15px; height: 15px; flex-shrink: 0; }
.pd .pd-bump-qty { display: flex; align-items: center; gap: 0.6rem; margin-top: 0.7rem; }
.pd .pd-bump-qty[hidden] { display: none; }
.pd .pd-bump-qty-label { font-size: 0.78em !important; font-weight: 800; color: #1e8449; text-transform: uppercase; letter-spacing: 0.05em; }
.pd .pd-qty { display: inline-flex; align-items: center; border: 1px solid #cfcfcf; border-radius: 8px; overflow: hidden; background: #fff; }
.pd .pd-qty-btn { background: #f4f4f4; border: 0; width: 30px; height: 30px; font-size: 1.1em; line-height: 1; color: #0d2b1a; font-weight: 800; }
.pd .pd-qty-btn:hover { background: #e6e6e6; }
.pd .pd-qty-n { min-width: 36px; text-align: center; font-weight: 800; color: #0d2b1a; font-size: 0.95em; }

/* Warranty unlock row */
.pd .pd-warranty { display: flex; align-items: center; gap: 0.9rem; border: 2px dashed #cfcfcf; border-radius: 12px; padding: 0.9rem 1.1rem; margin-top: 0.25rem; background: #fafafa; transition: border-color 0.2s, background 0.2s, box-shadow 0.2s; }
.pd .pd-warranty-icon { flex: 0 0 auto; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; color: #9a9a9a; transition: color 0.2s; }
.pd .pd-warranty-icon svg { width: 34px; height: 34px; display: block; }
.pd .pd-warranty-icon .pd-ico-open { display: none; }
.pd .pd-warranty-body { flex: 1; min-width: 0; }
.pd .pd-warranty-title { font-weight: 800; color: #666; font-size: 1em !important; display: flex; align-items: center; gap: 0.55rem; flex-wrap: wrap; }
.pd .pd-warranty-state { font-size: 0.68em !important; font-weight: 800; letter-spacing: 0.06em; padding: 0.15rem 0.55rem; border-radius: 999px; background: #e3e3e3; color: #777; text-transform: uppercase; }
.pd .pd-warranty-desc { color: #777; font-size: 0.86em !important; line-height: 1.45; margin-top: 0.2rem; }
.pd .pd-warranty.pd-unlocked { border-style: solid; border-color: #27ae60; background: #eafaf0; box-shadow: 0 2px 12px rgba(39,174,96,0.15); }
.pd .pd-warranty.pd-unlocked .pd-warranty-icon { color: #1e8449; }
.pd .pd-warranty.pd-unlocked .pd-warranty-icon .pd-ico-lock { display: none; }
.pd .pd-warranty.pd-unlocked .pd-warranty-icon .pd-ico-open { display: block; }
.pd .pd-warranty.pd-unlocked .pd-warranty-title { color: #0d2b1a; }
.pd .pd-warranty.pd-unlocked .pd-warranty-state { background: #27ae60; color: #fff; }
.pd .pd-warranty.pd-unlocked .pd-warranty-desc { color: #1e6b3a; }

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
<h1>Great News, your Prepper Disk is in stock and ready to be shipped out!</h1>
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
<div class="pd-line-rating">&#9733;&#9733;&#9733;&#9733;&#9733; <span>4.8 / 5 &middot; 124+ reviews</span></div>
<div class="pd-line-qty">
<span class="pd-bump-qty-label">Qty</span>
<div class="pd-qty">
<button type="button" class="pd-qty-btn" data-mainstep="-1" aria-label="Decrease Prepper Disk quantity">&minus;</button>
<span class="pd-qty-n" id="pdMainQty">1</span>
<button type="button" class="pd-qty-btn" data-mainstep="1" aria-label="Increase Prepper Disk quantity">+</button>
</div>
</div>
</div>
<div class="pd-line-price"><span class="pd-now">$279</span></div>
</div>

<div class="pd-bumps">
<div class="pd-bumps-title">Don't miss out on these add-ons:</div>

{%- if show_us_only -%}
<!-- Bump 1: Battery (US only — battery ships within the US) -->
<div class="pd-bump" data-bump="battery" data-price="22.99" data-variant="{{ battery_vid }}">
<span class="pd-bump-box"><svg viewBox="0 0 24 24" aria-hidden="true"><polyline points="4 12 10 18 20 6"/></svg></span>
<span class="pd-bump-img"><img src="https://cdn.shopify.com/s/files/1/0649/2710/5078/files/Battery-2.png?v=1763005487" alt="Prepper Disk backup battery"></span>
<div class="pd-bump-body">
<div class="pd-bump-name">10+ hour Battery</div>
<div class="pd-bump-desc">This 10,000 mAh battery powers your Prepper Disk for <strong>10&ndash;20 hours</strong> when the grid goes down. Rechargeable via car cigarette lighter, solar generator, wall outlet, and more. Gives your Prepperdisk a 24/7 resistance against grid failures.</div>
<div class="pd-bump-qty" data-qty-for="battery" hidden>
<span class="pd-bump-qty-label">Qty</span>
<div class="pd-qty">
<button type="button" class="pd-qty-btn" data-step="-1" aria-label="Decrease Backup Battery quantity">&minus;</button>
<span class="pd-qty-n">1</span>
<button type="button" class="pd-qty-btn" data-step="1" aria-label="Increase Backup Battery quantity">+</button>
</div>
</div>
</div>
<div class="pd-bump-price">$22.99<span class="pd-add">+ Add</span></div>
</div>
{%- endif -%}

<!-- Bump 2: Faraday bag -->
<div class="pd-bump" data-bump="faraday" data-price="22.99" data-variant="{{ faraday_vid }}">
<span class="pd-bump-box"><svg viewBox="0 0 24 24" aria-hidden="true"><polyline points="4 12 10 18 20 6"/></svg></span>
<span class="pd-bump-img"><img src="https://cdn.shopify.com/s/files/1/0649/2710/5078/files/NX3.png?v=1780083566" alt="EMP-shielding Faraday bag"></span>
<div class="pd-bump-body">
<div class="pd-bump-name">EMP-Shielding Faraday Bag</div>
<div class="pd-bump-desc">Drop your phone, Prepper Disk, and battery inside and they&rsquo;re shielded. So even when an <strong>EMP fries every other electronic</strong>, you still have your emergency library unlike other poor souls.</div>
<div class="pd-bump-qty" data-qty-for="faraday" hidden>
<span class="pd-bump-qty-label">Qty</span>
<div class="pd-qty">
<button type="button" class="pd-qty-btn" data-step="-1" aria-label="Decrease Faraday Bag quantity">&minus;</button>
<span class="pd-qty-n">1</span>
<button type="button" class="pd-qty-btn" data-step="1" aria-label="Increase Faraday Bag quantity">+</button>
</div>
</div>
</div>
<div class="pd-bump-price">$22.99<span class="pd-add">+ Add</span></div>
</div>

{%- if show_us_only -%}
<!-- Warranty unlock (US only — requires the battery): green when BOTH the battery and the faraday bag are added -->
<div class="pd-warranty" id="pdWarranty" aria-live="polite">
<div class="pd-warranty-icon">
<svg class="pd-ico-lock" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>
<svg class="pd-ico-open" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 7.5-2.3"/><path d="M9 15.5l2 2 3.5-3.5"/></svg>
</div>
<div class="pd-warranty-body">
<div class="pd-warranty-title">2 Years Warranty on Your Prepper Disk <span class="pd-warranty-state">Locked</span></div>
<div class="pd-warranty-desc">Add <strong>both</strong> the Battery and the Faraday Bag to unlock a bonus year of warranty on top of the 1 year already included: unlocking a full <strong>2 years of free replacements of your device</strong> in the rare case it stops working as intended.</div>
</div>
</div>
{%- endif -%}

</div>
</div>

<!-- RIGHT: order summary + payment -->
<aside class="pd-summary">
<h2>Order Summary</h2>

<div class="pd-sum-rows" id="pdSumRows">
<div class="pd-sum-row"><span class="pd-sum-label" id="pdBaseLabel">Prepper Disk Premium 512GB</span><span class="pd-sum-val" id="pdBaseVal">$279.00</span></div>
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
<p class="pd-inst-sub" id="pdInstSub"><strong>Pay as low as <u>$95.80</u> down in interest-free installments</strong></p>
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
<div class="pd-rcount">Based on 124+ verified reviews</div>
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
  var MAIN_VARIANT = 43384681136182; // Prepper Disk Premium 512GB
  var rowsWrap = document.getElementById('pdSumRows');
  var totalEl = document.getElementById('pdTotal');
  var mainQtyEl = document.getElementById('pdMainQty');
  var bumps = Array.prototype.slice.call(document.querySelectorAll('.pd .pd-bump'));
  var mainQty = 1;

  function money(n){ return '$' + n.toFixed(2); }
  function qtyOf(b){ return parseInt(b.getAttribute('data-qty') || '1', 10); }

  function labelFor(key){
    if (key === 'battery') return 'Backup Battery';
    if (key === 'faraday') return 'EMP-Shielding Faraday Bag';
    return key;
  }

  // Warranty unlock — green/UNLOCKED only when BOTH bumps are added
  var warrantyEl = document.getElementById('pdWarranty');
  function bumpIsOn(key){
    var el = document.querySelector('.pd .pd-bump[data-bump="' + key + '"]');
    return !!(el && el.classList.contains('pd-on'));
  }
  function updateWarranty(){
    if (!warrantyEl) return;
    var unlocked = bumpIsOn('battery') && bumpIsOn('faraday');
    warrantyEl.classList.toggle('pd-unlocked', unlocked);
    var state = warrantyEl.querySelector('.pd-warranty-state');
    if (state) state.textContent = unlocked ? 'Unlocked' : 'Locked';
  }

  // Installment mention — the "as low as $95.80 down" figure is only accurate
  // for a single Prepper Disk on its own. For any other selection (an add-on
  // selected, or qty > 1) we keep the block but swap in a figure-free sentence.
  var instSubEl = document.getElementById('pdInstSub');
  var INST_SINGLE = '<strong>Pay as low as <u>$95.80</u> down in interest-free installments</strong>';
  var INST_OTHER  = '<strong>Spread your payment into interest-free installments</strong>';
  function updateInstallments(){
    if (!instSubEl) return;
    var anyBump = false;
    bumps.forEach(function(b){ if (b.classList.contains('pd-on')) anyBump = true; });
    var single = (mainQty === 1) && !anyBump;
    instSubEl.innerHTML = single ? INST_SINGLE : INST_OTHER;
  }

  function render(){
    // clear existing bump rows (keep the base product row = first child)
    rowsWrap.querySelectorAll('.pd-bump-row').forEach(function(el){ el.remove(); });
    // base product line reflects the main quantity stepper
    var baseLabel = document.getElementById('pdBaseLabel');
    var baseVal = document.getElementById('pdBaseVal');
    var baseLine = BASE * mainQty;
    if (baseVal) baseVal.textContent = money(baseLine);
    if (baseLabel) baseLabel.innerHTML = 'Prepper Disk Premium 512GB' +
      (mainQty > 1 ? ' <span style="color:#888;font-weight:600">&times;' + mainQty + '</span>' : '');
    var total = baseLine;
    bumps.forEach(function(b){
      if (b.classList.contains('pd-on')){
        var price = parseFloat(b.getAttribute('data-price'));
        var q = qtyOf(b);
        var line = price * q;
        total += line;
        var qtag = q > 1 ? ' <span style="color:#888;font-weight:600">&times;' + q + '</span>' : '';
        var row = document.createElement('div');
        row.className = 'pd-sum-row pd-bump-row';
        row.innerHTML = '<span class="pd-sum-label">+ ' + labelFor(b.getAttribute('data-bump')) + qtag +
                        '</span><span class="pd-sum-val">' + money(line) + '</span>';
        rowsWrap.appendChild(row);
      }
    });
    totalEl.textContent = money(total);
    updateWarranty();
    updateInstallments();
  }

  function setOn(b, on){
    b.classList.toggle('pd-on', on);
    b.setAttribute('aria-pressed', on ? 'true' : 'false');
    var qwrap = b.querySelector('.pd-bump-qty');
    if (qwrap) qwrap.hidden = !on;
    var add = b.querySelector('.pd-add');
    if (add) add.textContent = on ? 'Added ✓' : '+ Add';
  }

  /* ===== Live Shopify cart sync =====
     This page mirrors the REAL Shopify cart. Every change here — main quantity,
     adding/removing a bump, or a bump's quantity — is written to the cart via
     Shopify's AJAX Cart API, so the native /cart page, the cart icon, and any
     abandoned-cart automation always see the same items. We reconcile against
     the live cart on each change: new lines go through /cart/add.js, and
     quantity changes or removals go through /cart/update.js. Displayed prices
     are cosmetic — Shopify always charges the real variant price. */
  var syncTimer = null;
  function desiredState(){
    var desired = {};
    desired[MAIN_VARIANT] = mainQty;
    bumps.forEach(function(b){
      var v = b.getAttribute('data-variant');
      if (v && /^\d+$/.test(v)){
        desired[parseInt(v, 10)] = b.classList.contains('pd-on') ? qtyOf(b) : 0;
      }
    });
    return desired;
  }
  function syncCart(){
    if (syncTimer){ clearTimeout(syncTimer); syncTimer = null; }
    return fetch('/cart.js', { headers: { 'Accept': 'application/json' } })
      .then(function(r){ return r.json(); })
      .then(function(cart){
        var have = {};
        (cart.items || []).forEach(function(it){ have[it.variant_id] = it.quantity; });
        var desired = desiredState();
        var adds = [];
        var updates = {};
        Object.keys(desired).forEach(function(idStr){
          var id = parseInt(idStr, 10);
          var d = desired[id];
          var h = have[id] || 0;
          if (d === h) return;
          if (h === 0 && d > 0) adds.push({ id: id, quantity: d }); // not in cart yet
          else updates[id] = d;                                     // change qty (0 removes)
        });
        var chain = Promise.resolve();
        if (adds.length){
          chain = chain.then(function(){
            return fetch('/cart/add.js', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items: adds }) });
          });
        }
        if (Object.keys(updates).length){
          chain = chain.then(function(){
            return fetch('/cart/update.js', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ updates: updates }) });
          });
        }
        return chain;
      });
  }
  function queueSync(){
    if (syncTimer) clearTimeout(syncTimer);
    syncTimer = setTimeout(function(){ syncTimer = null; syncCart(); }, 250);
  }

  function toggle(b){
    var on = !b.classList.contains('pd-on');
    setOn(b, on);
    render();
    queueSync();
  }

  bumps.forEach(function(b){
    b.setAttribute('role', 'button');
    b.setAttribute('tabindex', '0');
    b.setAttribute('aria-pressed', 'false');
    if (!b.getAttribute('data-qty')) b.setAttribute('data-qty', '1');

    // Toggle on row click — but not when interacting with the qty stepper
    b.addEventListener('click', function(e){
      if (e.target.closest('.pd-bump-qty')) return;
      toggle(b);
    });
    b.addEventListener('keydown', function(e){
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(b); }
    });

    // Quantity steppers
    b.querySelectorAll('.pd-qty-btn').forEach(function(btn){
      btn.addEventListener('click', function(e){
        e.stopPropagation();
        var step = parseInt(btn.getAttribute('data-step'), 10);
        var q = qtyOf(b) + step;
        if (q < 1) q = 1;
        if (q > 99) q = 99;
        b.setAttribute('data-qty', q);
        var nEl = b.querySelector('.pd-qty-n');
        if (nEl) nEl.textContent = q;
        if (!b.classList.contains('pd-on')) toggle(b); // adjusting qty adds it
        else { render(); queueSync(); }
      });
    });
  });

  // Main Prepper Disk quantity stepper
  document.querySelectorAll('.pd .pd-line-qty .pd-qty-btn').forEach(function(btn){
    btn.addEventListener('click', function(){
      var step = parseInt(btn.getAttribute('data-mainstep'), 10);
      mainQty += step;
      if (mainQty < 1) mainQty = 1;
      if (mainQty > 99) mainQty = 99;
      if (mainQtyEl) mainQtyEl.textContent = mainQty;
      render();
      queueSync();
    });
  });

  // On load: mirror the real Shopify cart into this page, and make sure the
  // Prepper Disk itself is in the cart — so a genuine (abandonable) cart exists
  // even if the visitor never clicks Checkout. Bumps already in the cart from a
  // previous visit are shown pre-selected.
  function initFromCart(){
    fetch('/cart.js', { headers: { 'Accept': 'application/json' } })
      .then(function(r){ return r.json(); })
      .then(function(cart){
        var have = {};
        (cart.items || []).forEach(function(it){ have[it.variant_id] = it.quantity; });
        if (have[MAIN_VARIANT]) { mainQty = have[MAIN_VARIANT]; if (mainQtyEl) mainQtyEl.textContent = mainQty; }
        bumps.forEach(function(b){
          var v = b.getAttribute('data-variant');
          if (v && /^\d+$/.test(v)){
            var q = have[parseInt(v, 10)];
            if (q){
              b.setAttribute('data-qty', q);
              var nEl = b.querySelector('.pd-qty-n');
              if (nEl) nEl.textContent = q;
              setOn(b, true);
            }
          }
        });
        render();
        if (!have[MAIN_VARIANT]) queueSync(); // put the Disk in the real cart
      })
      .catch(function(){ render(); });
  }
  initFromCart();

  /* ===== Checkout =====
     The cart is already kept in sync live (see syncCart above), so Checkout
     just flushes the latest state, then hands off to Shopify's secure
     checkout — where PayPal / Shop Pay / Klarna installment options appear. */
  function goToCheckout(){
    syncCart()
      .then(function(){ window.location.href = '/checkout'; })
      .catch(function(){ window.location.href = '/checkout'; });
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
```
