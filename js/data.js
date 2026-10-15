/* Smokestack Burger Co. — menu & location data */
window.SB_DATA = (function () {
  const BURGER_ADDONS = [
    { id: 'bacon', label: 'Extra bacon', price: 1.5 },
    { id: 'jalapenos', label: 'Add jalapenos', price: 0.75 },
    { id: 'cheese', label: 'Extra cheese', price: 1.0 }
  ];
  // Size deltas are relative to the listed price of the burger's default size.
  const SIZES_FROM_SINGLE = [
    { id: 'single', label: 'Single', delta: 0 },
    { id: 'double', label: 'Double', delta: 3.0 },
    { id: 'triple', label: 'Triple', delta: 5.5 }
  ];

  const categories = [
    { id: 'burgers', label: 'Burgers' },
    { id: 'sides', label: 'Sides' },
    { id: 'shakes', label: 'Shakes' },
    { id: 'combos', label: 'Combos' }
  ];

  const products = [
    {
      id: 'classic-smash', name: 'The Classic Smash', category: 'burgers', price: 9.5,
      short: 'All the classics, done right.',
      desc: 'A hand-smashed beef patty, melted American cheese, lettuce, tomato, pickles and house sauce on a toasted brioche bun.',
      img: 'images/menu-classic-smash.jpg', wide: 'images/classic-smash.jpg',
      tags: [], rating: 4.7, reviews: 518, popularity: 98, featured: true,
      sizes: SIZES_FROM_SINGLE, defaultSize: 'single', addons: BURGER_ADDONS
    },
    {
      id: 'bacon-cheeseburger', name: 'Bacon Cheeseburger', category: 'burgers', price: 10.9,
      short: 'Smoky bacon, melted cheddar, lettuce, tomato, red onion.',
      desc: 'Applewood-smoked bacon, sharp cheddar, crisp lettuce, tomato and red onion stacked on a juicy smash patty.',
      img: 'images/bacon-cheeseburger.jpg',
      tags: [], rating: 4.6, reviews: 341, popularity: 90,
      sizes: SIZES_FROM_SINGLE, defaultSize: 'single', addons: BURGER_ADDONS
    },
    {
      id: 'mushroom-swiss', name: 'Mushroom Swiss', category: 'burgers', price: 11.2,
      short: 'Sautéed mushrooms, swiss cheese, caramelized onions.',
      desc: 'Garlic-butter mushrooms, slow-caramelized onions and nutty Swiss over a seared beef patty.',
      img: 'images/mushroom-swiss.jpg',
      tags: [], rating: 4.5, reviews: 207, popularity: 72,
      sizes: SIZES_FROM_SINGLE, defaultSize: 'single', addons: BURGER_ADDONS
    },
    {
      id: 'veggie-garden', name: 'Veggie Garden', category: 'burgers', price: 9.8,
      short: 'A hearty plant-based patty with fresh toppings.',
      desc: 'A hearty plant-based patty with lettuce, tomato, pickles, red onion and our house sauce. 100% meat-free.',
      img: 'images/veggie-garden.jpg',
      tags: ['vegetarian'], rating: 4.4, reviews: 156, popularity: 60,
      sizes: SIZES_FROM_SINGLE, defaultSize: 'single', addons: BURGER_ADDONS.filter(a => a.id !== 'bacon')
    },
    {
      id: 'double-bacon-stack', name: 'Double Bacon Stack', category: 'burgers', price: 12.9,
      short: 'Twice the beef. Double the bacon.',
      desc: 'Two smashed patties, smoked bacon, cheddar, pickles, house sauce.',
      img: 'images/double-bacon-stack.jpg', hero: 'images/double-bacon-stack-hero.jpg',
      tags: [], rating: 4.8, reviews: 392, popularity: 100, featured: true,
      sizes: [
        { id: 'single', label: 'Single', delta: -3.0 },
        { id: 'double', label: 'Double', delta: 0 },
        { id: 'triple', label: 'Triple', delta: 2.5 }
      ],
      defaultSize: 'double', addons: BURGER_ADDONS.slice(0, 2)
    },
    {
      id: 'spicy-jalapeno-melt', name: 'Spicy Jalapeno Melt', category: 'burgers', price: 11.5,
      short: 'A little heat goes a long way.',
      desc: 'Pepper jack, fresh jalapenos, chipotle mayo and crisp lettuce on a double-seared patty.',
      img: 'images/menu-spicy.jpg', wide: 'images/spicy-jalapeno-melt.jpg',
      tags: ['spicy'], rating: 4.7, reviews: 288, popularity: 94, featured: true,
      sizes: SIZES_FROM_SINGLE, defaultSize: 'single', addons: BURGER_ADDONS
    },
    {
      id: 'crinkle-fries', name: 'Crinkle Fries', category: 'sides', price: 4.5,
      short: 'Crispy, golden and perfectly salted.',
      desc: 'Crinkle-cut potatoes fried twice for extra crunch and tossed in sea salt.',
      img: 'images/crinkle-fries.jpg', alt: 'images/crinkle-fries-2.jpg',
      tags: ['vegetarian'], rating: 4.8, reviews: 610, popularity: 96,
      addons: [
        { id: 'cheese-sauce', label: 'Cheese sauce', price: 1.25 },
        { id: 'cajun', label: 'Cajun seasoning', price: 0.5 }
      ]
    },
    {
      id: 'onion-rings', name: 'Onion Rings', category: 'sides', price: 5.2,
      short: 'Beer-battered and stacked high.',
      desc: 'Thick-cut sweet onions in a crunchy golden batter, served with ketchup.',
      img: 'images/onion-rings.jpg',
      tags: ['vegetarian'], rating: 4.6, reviews: 233, popularity: 80,
      addons: [{ id: 'ranch', label: 'Smoky ranch dip', price: 0.75 }]
    },
    {
      id: 'chocolate-shake', name: 'Chocolate Shake', category: 'shakes', price: 5.9,
      short: 'Rich, creamy, house-made.',
      desc: 'Thick chocolate shake hand-spun with real ice cream, whipped cream and fudge drizzle.',
      img: 'images/chocolate-shake.jpg',
      tags: ['vegetarian'], rating: 4.9, reviews: 402, popularity: 92,
      addons: [
        { id: 'whip', label: 'Extra whip', price: 0.5 },
        { id: 'malt', label: 'Malt it', price: 0.75 }
      ]
    },
    {
      id: 'vanilla-shake', name: 'Vanilla Fudge Shake', category: 'shakes', price: 5.5,
      short: 'Rich, creamy, and irresistible.',
      desc: 'Classic vanilla bean shake with fudge ribbons, whipped cream and a cherry on top.',
      img: 'images/vanilla-shake.jpg',
      tags: ['vegetarian'], rating: 4.7, reviews: 188, popularity: 70,
      addons: [
        { id: 'whip', label: 'Extra whip', price: 0.5 },
        { id: 'malt', label: 'Malt it', price: 0.75 }
      ]
    },
    {
      id: 'smokestack-shake', name: 'Smokestack Signature Shake', category: 'shakes', price: 6.5,
      short: 'Our cookies & cream secret recipe.',
      desc: 'Cookies & cream ice cream, chocolate drizzle and a mountain of whip in our signature cup.',
      img: 'images/smokestack-shake.jpg',
      tags: ['vegetarian'], rating: 4.8, reviews: 145, popularity: 76,
      addons: [{ id: 'whip', label: 'Extra whip', price: 0.5 }]
    },
    {
      id: 'classic-combo', name: 'Classic Smash Combo', category: 'combos', price: 16.9,
      short: 'Classic Smash, crinkle fries and any shake.',
      desc: 'The Classic Smash with a side of crinkle fries and a hand-spun shake. Save $3 versus ordering separately.',
      img: 'images/classic-smash.jpg',
      tags: [], rating: 4.8, reviews: 260, popularity: 88,
      addons: [{ id: 'large-fries', label: 'Upgrade to large fries', price: 1.0 }]
    },
    {
      id: 'double-bacon-combo', name: 'Double Bacon Combo', category: 'combos', price: 19.9,
      short: 'Double Bacon Stack, fries and a shake.',
      desc: 'The Double Bacon Stack, crinkle fries and a chocolate shake. The full Smokestack experience.',
      img: 'images/double-bacon-stack.jpg',
      tags: [], rating: 4.9, reviews: 214, popularity: 86,
      addons: [{ id: 'large-fries', label: 'Upgrade to large fries', price: 1.0 }]
    },
    {
      id: 'spicy-combo', name: 'Spicy Melt Combo', category: 'combos', price: 18.5,
      short: 'Spicy Jalapeno Melt, onion rings and a shake.',
      desc: 'Spicy Jalapeno Melt with onion rings and a cooling vanilla fudge shake.',
      img: 'images/spicy-jalapeno-melt.jpg',
      tags: ['spicy'], rating: 4.7, reviews: 131, popularity: 74,
      addons: [{ id: 'large-fries', label: 'Upgrade to large rings', price: 1.0 }]
    }
  ];

  const locations = [
    {
      id: 'main-st', name: 'Main St', address: '1974 Main Street', city: 'Springfield, IL 62701',
      phone: '(217) 555-0174', note: 'The original. Same griddle since 1974.',
      hours: { 0: [11, 21], 1: [11, 22], 2: [11, 22], 3: [11, 22], 4: [11, 22], 5: [11, 23], 6: [11, 23] },
      x: 38, y: 46
    },
    {
      id: 'riverside', name: 'Riverside', address: '410 River Road', city: 'Springfield, IL 62702',
      phone: '(217) 555-0410', note: 'Patio seating right on the water.',
      hours: { 0: [11, 21], 1: [11, 22], 2: [11, 22], 3: [11, 22], 4: [11, 22], 5: [11, 23], 6: [11, 23] },
      x: 66, y: 30
    },
    {
      id: 'uptown', name: 'Uptown', address: '88 Oak Avenue', city: 'Springfield, IL 62704',
      phone: '(217) 555-0088', note: 'Late-night window open till midnight on weekends.',
      hours: { 0: [11, 22], 1: [11, 22], 2: [11, 22], 3: [11, 22], 4: [11, 23], 5: [11, 24], 6: [11, 24] },
      x: 24, y: 22
    },
    {
      id: 'westgate', name: 'Westgate Mall', address: '2200 Westgate Blvd', city: 'Springfield, IL 62711',
      phone: '(217) 555-2200', note: 'Food court counter with drive-thru.',
      hours: { 0: [11, 20], 1: [10, 21], 2: [10, 21], 3: [10, 21], 4: [10, 21], 5: [10, 22], 6: [10, 22] },
      x: 74, y: 70
    }
  ];

  return { categories, products, locations, TAX_RATE: 0.08 };
})();
