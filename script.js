"use strict";

const recipes = {
  pancakes: {
    category: "SWEET BREAKFAST • CHAPTER 01",
    title: "Cinnamonny Buttermilk Pancakes",
    expectation: "Fluffy centers, lightly crisp edges, cozy cinnamon warmth, and a soft buttermilk-style tang.",
    ingredients: [
      "1/2 cup hybrid flour blend",
      "1/2 tablespoon cornstarch",
      "1 tablespoon pumpkin puree",
      "1 tablespoon ground flaxseed",
      "Milk, as needed for a pourable batter",
      "Cinnamon, vanilla, baking powder, and a pinch of salt"
    ],
    steps: [
      "Whisk the dry ingredients together until evenly combined.",
      "Stir in pumpkin, flaxseed, and enough milk to create a thick but pourable batter.",
      "Let the batter rest for 3–5 minutes so the flour and flaxseed hydrate.",
      "Cook on a lightly greased skillet over medium-low heat until bubbles form, then flip and finish until fluffy."
    ],
    tip: "Letting the batter rest before cooking helps the pancakes become noticeably fluffier."
  },
  "cinnamon-rolls": {
    category: "BAKERY • CHAPTER 02",
    title: "Microwave Cinnamon Rolls",
    expectation: "Warm, soft spirals with buttery cinnamon filling and a quick sweet glaze.",
    ingredients: [
      "3/4 cup hybrid flour blend",
      "1/2 tablespoon cornstarch",
      "Milk, as needed for a soft dough",
      "Ground flaxseed",
      "Cinnamon and sweetener for the filling",
      "A tiny amount of butter or oil",
      "Powdered milk glaze, optional"
    ],
    steps: [
      "Mix the dry ingredients, then add milk gradually until a soft, workable dough forms.",
      "Roll the dough into a rectangle and spread with a thin layer of butter or oil.",
      "Cover with cinnamon filling, roll into a spiral, and slice.",
      "Microwave in short intervals until puffed and cooked through, then glaze while warm."
    ],
    tip: "Keep the dough soft rather than dry—the softer dough gives you the fluffiest microwave roll."
  },
  donuts: {
    category: "BAKERY • CHAPTER 03",
    title: "Pumpkin Microwave Donuts",
    expectation: "Soft, cakey, warmly spiced donuts with a light clear glaze and cozy pumpkin color.",
    ingredients: [
      "Hybrid flour blend",
      "Cornstarch",
      "1–2 tablespoons pumpkin puree",
      "Ground flaxseed",
      "Milk",
      "Cinnamon and vanilla",
      "Powdered milk glaze"
    ],
    steps: [
      "Combine the dry ingredients and spices.",
      "Mix in pumpkin and milk until the batter is thick and smooth.",
      "Shape or portion into a microwave-safe donut mold.",
      "Microwave until set and springy, then cool briefly before glazing."
    ],
    tip: "Use just enough pumpkin for color and softness so the donuts stay fluffy instead of dense."
  },
  "egg-toast": {
    category: "SAVORY • CHAPTER 04",
    title: "Cheesy Garlic Egg Toast",
    expectation: "Creamy avocado, fluffy egg, savory garlic, and melty cheese over crisp toast.",
    ingredients: [
      "1–2 slices bread",
      "2 eggs",
      "Avocado",
      "Greek yogurt or sour cream, optional",
      "Part-skim mozzarella",
      "Garlic powder, paprika, salt, and pepper"
    ],
    steps: [
      "Toast the bread until crisp at the edges.",
      "Scramble the eggs gently with garlic and seasonings until just set.",
      "Mash avocado and spread it over the toast.",
      "Top with eggs and mozzarella, then warm briefly until the cheese softens."
    ],
    tip: "Keep the eggs slightly soft before they hit the toast so they stay fluffy after the final warm-up."
  },
  brownie: {
    category: "CHOCOLATE • CHAPTER 05",
    title: "Brownie Batter Cake",
    expectation: "Deep cocoa flavor with a soft, fudgy middle that feels halfway between cake and brownie batter.",
    ingredients: [
      "Hybrid flour blend",
      "Cornstarch",
      "Cocoa powder",
      "Milk",
      "Vanilla",
      "Sweetener",
      "Chocolate chips, optional"
    ],
    steps: [
      "Whisk the dry ingredients until the cocoa is evenly distributed.",
      "Add milk and vanilla to create a thick batter.",
      "Fold in chocolate chips if using.",
      "Microwave or bake just until the edges set, leaving the center soft and fudgy."
    ],
    tip: "Stop cooking as soon as the center is barely set—the residual heat keeps working after you remove it."
  },
  latte: {
    category: "COFFEE-SHOP VIBES • CHAPTER 06",
    title: "Chili Mocha Latte",
    expectation: "Chocolate-coffee comfort with cinnamon warmth and a tiny chili spark at the finish.",
    ingredients: [
      "Instant coffee or espresso",
      "Milk",
      "Cocoa powder",
      "Cinnamon",
      "Tiny pinch of chili powder",
      "Vanilla and sweetener to taste"
    ],
    steps: [
      "Brew the coffee strong enough to stand up to the milk and cocoa.",
      "Warm the milk with cocoa, cinnamon, vanilla, and a tiny pinch of chili powder.",
      "Whisk until smooth and lightly foamy.",
      "Pour over the coffee and finish with an extra dusting of cinnamon."
    ],
    tip: "The chili should be a quiet background note, not the main flavor—start with the smallest pinch."
  }
};

const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");
const splitStage = document.querySelector("#split-stage");
const splitViewport = document.querySelector("#split-viewport");
const leftTrack = document.querySelector("#left-track");
const rightTrack = document.querySelector("#right-track");
const spineCard = document.querySelector("#spine-card");
const spineTitle = document.querySelector("#spine-title");
const dialog = document.querySelector("#recipe-dialog");
const dialogClose = document.querySelector("#dialog-close");
const dialogCategory = document.querySelector("#dialog-category");
const dialogTitle = document.querySelector("#dialog-title");
const dialogExpectation = document.querySelector("#dialog-expectation");
const dialogIngredients = document.querySelector("#dialog-ingredients");
const dialogSteps = document.querySelector("#dialog-steps");
const dialogTip = document.querySelector("#dialog-tip");

const isDesktop = () => window.matchMedia("(min-width: 981px)").matches;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

if (navToggle && siteNav) {
  navToggle.addEventListener("click", () => {
    const willOpen = !siteNav.classList.contains("is-open");
    siteNav.classList.toggle("is-open", willOpen);
    navToggle.setAttribute("aria-expanded", String(willOpen));
  });

  siteNav.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      siteNav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    }
  });
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function updateSplitScroll() {
  if (!splitStage || !splitViewport || !leftTrack || !rightTrack || !spineCard) return;

  if (!isDesktop() || reduceMotion.matches) {
    leftTrack.style.transform = "none";
    rightTrack.style.transform = "none";
    spineCard.style.transform = "rotate(-2deg)";
    return;
  }

  const rect = splitStage.getBoundingClientRect();
  const viewportHeight = splitViewport.clientHeight;
  const scrollableDistance = splitStage.offsetHeight - viewportHeight;
  const traveled = clamp(-rect.top, 0, scrollableDistance);
  const progress = scrollableDistance > 0 ? traveled / scrollableDistance : 0;

  const leftTravel = Math.max(0, leftTrack.scrollHeight - viewportHeight + 120);
  const rightTravel = Math.max(0, rightTrack.scrollHeight - viewportHeight + 120);

  const leftY = -progress * leftTravel;
  const rightY = -(1 - progress) * rightTravel;

  leftTrack.style.transform = `translate3d(0, ${leftY.toFixed(2)}px, 0)`;
  rightTrack.style.transform = `translate3d(0, ${rightY.toFixed(2)}px, 0)`;

  const rotation = -4 + progress * 8;
  spineCard.style.transform = `rotate(${rotation.toFixed(2)}deg)`;

  const sequence = [
    "Cinnamonny Buttermilk Pancakes",
    "Microwave Cinnamon Rolls",
    "Pumpkin Microwave Donuts",
    "Cheesy Garlic Egg Toast",
    "Brownie Batter Cake",
    "Chili Mocha Latte"
  ];
  const index = Math.min(sequence.length - 1, Math.floor(progress * sequence.length));
  spineTitle.textContent = sequence[index];
}

let ticking = false;
function requestSplitUpdate() {
  if (ticking) return;
  ticking = true;
  window.requestAnimationFrame(() => {
    updateSplitScroll();
    ticking = false;
  });
}

window.addEventListener("scroll", requestSplitUpdate, { passive: true });
window.addEventListener("resize", requestSplitUpdate);
reduceMotion.addEventListener?.("change", requestSplitUpdate);
window.addEventListener("load", requestSplitUpdate);

function fillList(element, items, tagName) {
  element.innerHTML = "";
  items.forEach((item) => {
    const li = document.createElement(tagName);
    li.textContent = item;
    element.appendChild(li);
  });
}

function openRecipe(recipeKey) {
  const recipe = recipes[recipeKey];
  if (!recipe || !dialog) return;

  dialogCategory.textContent = recipe.category;
  dialogTitle.textContent = recipe.title;
  dialogExpectation.textContent = recipe.expectation;
  fillList(dialogIngredients, recipe.ingredients, "li");
  fillList(dialogSteps, recipe.steps, "li");
  dialogTip.textContent = recipe.tip;

  if (typeof dialog.showModal === "function") {
    dialog.showModal();
  } else {
    dialog.setAttribute("open", "");
  }
}

document.addEventListener("click", (event) => {
  const trigger = event.target.closest("[data-open-recipe]");
  if (!trigger) return;
  openRecipe(trigger.dataset.openRecipe);
});

if (dialogClose && dialog) {
  dialogClose.addEventListener("click", () => dialog.close());

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && dialog?.open) dialog.close();
});
