# Smokestack Burger Co.

A fully functional, animated burger-shop website built from the Smokestack design mockups.
It's plain HTML, CSS and JavaScript, with no build step and no dependencies.

## Run it

Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

It works on any static host (GitHub Pages, Netlify, Vercel) as-is.

## Pages (hash routes)

| Route | What it does |
| --- | --- |
| `#/` | Hero with animated burger, spinning "free fries" badge, scrolling ticker, popular burgers, how-it-works, promo with count-up stats |
| `#/menu[/burgers\|sides\|shakes\|combos]` | Category tabs, filters (vegetarian, spicy, price ranges), sorting, live results |
| `#/product/:id` | Patty size, add-ons, quantity, live price, "perfect with your burger" pairings |
| `#/cart` | Quantity steppers, remove/clear, order summary with 8% tax, first-order free fries, pickup location and time picker, place-order flow with confirmation |
| `#/locations` | Store cards with live open/closed status, interactive map pins, set your pickup spot |

The cart, pickup choice and first-order status are saved in `localStorage`.

## Structure

```
index.html        app shell (header, footer, modal, toasts)
css/styles.css    all styles and animations (respects prefers-reduced-motion)
js/data.js        menu items, prices, options and locations — edit here
js/app.js         router, cart store, views and interactions
images/           product photography (stored locally)
```
