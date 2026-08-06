"use strict";

(() => {
  const recipes = Array.isArray(window.BERRY_RECIPES) ? window.BERRY_RECIPES : [];
  const groupOrder = Array.isArray(window.BERRY_GROUP_ORDER) ? window.BERRY_GROUP_ORDER : [];
  const groupMeta = window.BERRY_GROUP_META || {};

  const stream = document.querySelector("#cookbook-stream");
  const categoryLinks = document.querySelector("#category-links");
  const archiveGrid = document.querySelector("#archive-grid");
  const archiveSearch = document.querySelector("#archive-search");
  const archiveCategory = document.querySelector("#archive-category");
  const archiveStatus = document.querySelector("#archive-status");
  const liveCounter = document.querySelector("#live-counter");
  const progressBar = document.querySelector("#scroll-progress-bar");

  const searchDialog = document.querySelector("#search-dialog");
  const searchDialogClose = document.querySelector("#search-dialog-close");
  const dialogSearchInput = document.querySelector("#dialog-search-input");
  const dialogSearchResults = document.querySelector("#dialog-search-results");

  const recipeDialog = document.querySelector("#recipe-dialog");
  const recipeDialogClose = document.querySelector("#recipe-dialog-close");

  const menuButton = document.querySelector("#menu-button");
  const mobileNav = document.querySelector("#mobile-nav");

  const guideBubble = document.querySelector("#guide-bubble");
  const guideMessage = document.querySelector("#guide-message");

  let currentRecipeIndex = 0;
  let guideTimer = null;

  const escapeHtml = (value) =>
    String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  const slugify = (value) =>
    String(value)
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const categoryId = (group) => `category-${slugify(group)}`;

  const getMeta = (group) =>
    groupMeta[group] || { color: "#d94c6b", soft: "#fff1f4" };

  const showGuide = (message) => {
    if (!guideBubble || !guideMessage) return;
    guideMessage.textContent = message;
    guideBubble.classList.add("is-visible");
    window.clearTimeout(guideTimer);
    guideTimer = window.setTimeout(() => {
      guideBubble.classList.remove("is-visible");
    }, 4200);
  };

  const openDialog = (dialog) => {
    if (!dialog) return;
    document.body.classList.add("dialog-open");
    if (typeof dialog.showModal === "function") {
      dialog.showModal();
    } else {
      dialog.setAttribute("open", "");
    }
  };

  const closeDialog = (dialog) => {
    if (!dialog) return;
    document.body.classList.remove("dialog-open");
    if (typeof dialog.close === "function" && dialog.open) {
      dialog.close();
    } else {
      dialog.removeAttribute("open");
    }
  };

  const firstFlavorPhrase = (flavor) => {
    const text = String(flavor || "").trim();
    if (!text) return "COZY ✦";
    const phrase = text.split(/[,.!]/)[0].trim();
    const short = phrase.split(/\s+/).slice(0, 4).join(" ");
    return `${short.toUpperCase()} ✦`;
  };

  const buildCategoryLinks = () => {
    if (!categoryLinks || !archiveCategory) return;

    categoryLinks.innerHTML = "";
    archiveCategory.innerHTML = '<option value="all">All chapters</option>';

    groupOrder.forEach((group, index) => {
      const meta = getMeta(group);
      const count = recipes.filter((recipe) => recipe.category === group).length;

      const link = document.createElement("a");
      link.className = "category-link";
      link.href = `#${categoryId(group)}`;
      link.style.setProperty("--cat-color", meta.color);
      link.style.setProperty("--cat-soft", meta.soft);
      link.innerHTML = `<b>${String(index + 1).padStart(2, "0")}</b><span>${escapeHtml(group)} · ${count}</span>`;
      categoryLinks.appendChild(link);

      const option = document.createElement("option");
      option.value = group;
      option.textContent = `${group} (${count})`;
      archiveCategory.appendChild(option);
    });
  };

  const createCategoryGate = (group, index) => {
    const meta = getMeta(group);
    const count = recipes.filter((recipe) => recipe.category === group).length;

    const section = document.createElement("section");
    section.className = "category-gate";
    section.id = categoryId(group);
    section.dataset.bigNumber = String(index + 1).padStart(2, "0");
    section.style.setProperty("--cat-color", meta.color);
    section.style.setProperty("--cat-soft", meta.soft);

    section.innerHTML = `
      <div class="category-gate-copy">
        <p class="micro-label">CHAPTER ${String(index + 1).padStart(2, "0")} / ${String(count).padStart(2, "0")} ENTRIES</p>
        <h2>${escapeHtml(group)}</h2>
        <p>Keep scrolling. Every section below is another recipe in this chapter of the live cookbook.</p>
      </div>
      <figure class="category-gate-figure">
        <img src="assets/images/BerryBelle.jpg" alt="BerryBelle introducing ${escapeHtml(group)}">
        <span>NEW CHAPTER ✦</span>
      </figure>
    `;

    return section;
  };

  const createRecipeChapter = (recipe, index) => {
    const meta = getMeta(recipe.category);
    const article = document.createElement("article");
    article.className = `recipe-chapter${index % 2 ? " is-reversed" : ""}`;
    article.id = `recipe-${recipe.id}`;
    article.dataset.recipeIndex = String(index);
    article.style.setProperty("--cat-color", meta.color);
    article.style.setProperty("--cat-soft", meta.soft);

    const paddedNumber = String(recipe.number).padStart(3, "0");
    const sourceLabel = recipe.source === "Signature CCD" ? "SIGNATURE CCD" : "EXPANDED COOKBOOK";

    article.innerHTML = `
      <div class="recipe-half recipe-poster">
        <span class="recipe-source-sticker">${escapeHtml(sourceLabel)}<br>${escapeHtml(recipe.category)}</span>
        <span class="taste-sticker">${escapeHtml(firstFlavorPhrase(recipe.flavor))}</span>
        <span class="recipe-ghost-number" aria-hidden="true">${paddedNumber}</span>
        <div class="recipe-emoji-wrap" aria-hidden="true">
          <span class="recipe-emoji">${escapeHtml(recipe.emoji)}</span>
        </div>
      </div>

      <div class="recipe-half recipe-copy">
        <div class="recipe-index-line">
          <b>${paddedNumber} / ${recipes.length}</b>
          <span>${escapeHtml(recipe.category)}</span>
        </div>
        <h2>${escapeHtml(recipe.name)}</h2>
        <p class="recipe-flavor">${escapeHtml(recipe.flavor)}</p>
        <div class="recipe-copy-actions">
          <button class="button button-primary" type="button" data-open-recipe="${escapeHtml(recipe.id)}">Read recipe</button>
          <a class="button button-ghost" href="#recipe-index">Open index</a>
        </div>
      </div>

      <button class="recipe-ticket" type="button" data-open-recipe="${escapeHtml(recipe.id)}" aria-label="Open ${escapeHtml(recipe.name)}">
        <small>BERRY VIBES</small>
        <span>${paddedNumber}</span>
        <strong>OPEN RECIPE</strong>
        <span class="ticket-arrow" aria-hidden="true">↕</span>
        <small>${escapeHtml(recipe.source)}</small>
      </button>

      <span class="chapter-scroll-cue">${index % 2 ? "SCROLL UP ↑ / DOWN ↓" : "SCROLL DOWN ↓"}</span>
    `;

    article.addEventListener("pointermove", (event) => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const rect = article.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width - 0.5) * 14;
      const y = ((event.clientY - rect.top) / rect.height - 0.5) * 14;
      article.style.setProperty("--mx", `${x}px`);
      article.style.setProperty("--my", `${y}px`);
    });

    article.addEventListener("pointerleave", () => {
      article.style.setProperty("--mx", "0px");
      article.style.setProperty("--my", "0px");
    });

    return article;
  };

  const buildStream = () => {
    if (!stream) return;

    const fragment = document.createDocumentFragment();

    groupOrder.forEach((group, groupIndex) => {
      fragment.appendChild(createCategoryGate(group, groupIndex));

      recipes
        .map((recipe, index) => ({ recipe, index }))
        .filter(({ recipe }) => recipe.category === group)
        .forEach(({ recipe, index }) => {
          fragment.appendChild(createRecipeChapter(recipe, index));
        });
    });

    stream.appendChild(fragment);
  };

  const renderArchive = () => {
    if (!archiveGrid || !archiveStatus) return;

    const query = String(archiveSearch?.value || "").trim().toLowerCase();
    const category = archiveCategory?.value || "all";

    const filtered = recipes.filter((recipe) => {
      const matchesCategory = category === "all" || recipe.category === category;
      const haystack = `${recipe.name} ${recipe.category} ${recipe.flavor} ${recipe.source}`.toLowerCase();
      return matchesCategory && haystack.includes(query);
    });

    archiveStatus.textContent = `Showing ${filtered.length} of ${recipes.length} recipes`;
    archiveGrid.innerHTML = "";

    const fragment = document.createDocumentFragment();

    filtered.forEach((recipe) => {
      const meta = getMeta(recipe.category);
      const button = document.createElement("button");
      button.type = "button";
      button.className = "archive-card";
      button.style.setProperty("--cat-color", meta.color);
      button.style.setProperty("--cat-soft", meta.soft);
      button.dataset.jumpRecipe = recipe.id;

      button.innerHTML = `
        <small>${String(recipe.number).padStart(3, "0")} · ${escapeHtml(recipe.source)}</small>
        <div>
          <h3>${escapeHtml(recipe.name)}</h3>
          <p>${escapeHtml(recipe.flavor)}</p>
        </div>
        <span class="archive-card-emoji" aria-hidden="true">${escapeHtml(recipe.emoji)}</span>
      `;

      fragment.appendChild(button);
    });

    archiveGrid.appendChild(fragment);
  };

  const renderSearchResults = () => {
    if (!dialogSearchResults) return;

    const query = String(dialogSearchInput?.value || "").trim().toLowerCase();
    const matches = recipes
      .filter((recipe) => {
        if (!query) return true;
        return `${recipe.name} ${recipe.category} ${recipe.flavor}`.toLowerCase().includes(query);
      })
      .slice(0, 18);

    dialogSearchResults.innerHTML = "";

    if (!matches.length) {
      dialogSearchResults.innerHTML = "<p>No recipes matched that search.</p>";
      return;
    }

    const fragment = document.createDocumentFragment();

    matches.forEach((recipe) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "search-result-button";
      button.dataset.searchJump = recipe.id;
      button.innerHTML = `
        <span aria-hidden="true">${escapeHtml(recipe.emoji)}</span>
        <strong>${escapeHtml(recipe.name)}</strong>
        <small>${String(recipe.number).padStart(3, "0")}</small>
      `;
      fragment.appendChild(button);
    });

    dialogSearchResults.appendChild(fragment);
  };

  const populateRecipeDialog = (recipeIndex) => {
    const recipe = recipes[recipeIndex];
    if (!recipe) return;

    currentRecipeIndex = recipeIndex;

    document.querySelector("#dialog-number").textContent =
      `${String(recipe.number).padStart(3, "0")} / ${recipes.length}`;
    document.querySelector("#dialog-source").textContent = recipe.source;
    document.querySelector("#dialog-category").textContent = recipe.category;
    document.querySelector("#dialog-title").textContent = recipe.name;
    document.querySelector("#dialog-vibe").textContent = recipe.vibe || recipe.flavor;
    document.querySelector("#dialog-emoji").textContent = recipe.emoji;
    document.querySelector("#dialog-yield").textContent = recipe.yield_text || "—";
    document.querySelector("#dialog-calories").textContent = recipe.calories || "—";
    document.querySelector("#dialog-why").textContent = recipe.why || recipe.flavor;
    document.querySelector("#dialog-comparison").textContent = recipe.comparison || "—";
    document.querySelector("#dialog-variations").textContent = recipe.variations || "—";
    document.querySelector("#dialog-ratings").textContent = recipe.ratings || "—";

    const ingredientsList = document.querySelector("#dialog-ingredients");
    const methodList = document.querySelector("#dialog-method");
    const fullDetails = document.querySelector("#dialog-full-details");
    const signatureNote = document.querySelector("#signature-note");

    ingredientsList.innerHTML = "";
    methodList.innerHTML = "";

    if (recipe.details_complete) {
      fullDetails.hidden = false;
      signatureNote.hidden = true;

      recipe.ingredients.forEach((ingredient) => {
        const li = document.createElement("li");
        li.textContent = ingredient;
        ingredientsList.appendChild(li);
      });

      recipe.method.forEach((step) => {
        const li = document.createElement("li");
        li.textContent = step;
        methodList.appendChild(li);
      });
    } else {
      fullDetails.hidden = true;
      signatureNote.hidden = false;
    }

    openDialog(recipeDialog);
  };

  const openRecipeById = (id) => {
    const index = recipes.findIndex((recipe) => recipe.id === id);
    if (index >= 0) populateRecipeDialog(index);
  };

  const jumpToRecipe = (id, behavior = "smooth") => {
    const section = document.querySelector(`#recipe-${CSS.escape(id)}`);
    if (!section) return;
    section.scrollIntoView({ behavior, block: "start" });
  };

  const jumpRandom = () => {
    if (!recipes.length) return;
    const index = Math.floor(Math.random() * recipes.length);
    const recipe = recipes[index];
    jumpToRecipe(recipe.id);
    showGuide(`Try ${recipe.name}. ${recipe.flavor}`);
  };

  const initObservers = () => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add("is-visible");

        if (entry.target.classList.contains("recipe-chapter")) {
          const index = Number(entry.target.dataset.recipeIndex);
          const recipe = recipes[index];

          if (recipe) {
            liveCounter.textContent =
              `${String(recipe.number).padStart(3, "0")} / ${recipes.length}`;

            showGuide(`${recipe.name}: ${recipe.flavor}`);
          }
        }
      });
    }, {
      root: null,
      rootMargin: "-18% 0px -18% 0px",
      threshold: 0.18
    });

    document
      .querySelectorAll(".recipe-chapter, .category-gate")
      .forEach((section) => observer.observe(section));
  };

  const updateScrollProgress = () => {
    if (!progressBar) return;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const value = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    progressBar.style.width = `${value * 100}%`;
  };

  const initEvents = () => {
    document.addEventListener("click", (event) => {
      const openButton = event.target.closest("[data-open-recipe]");
      if (openButton) {
        openRecipeById(openButton.dataset.openRecipe);
        return;
      }

      const archiveButton = event.target.closest("[data-jump-recipe]");
      if (archiveButton) {
        jumpToRecipe(archiveButton.dataset.jumpRecipe);
        return;
      }

      const searchJump = event.target.closest("[data-search-jump]");
      if (searchJump) {
        closeDialog(searchDialog);
        jumpToRecipe(searchJump.dataset.searchJump);
      }
    });

    archiveSearch?.addEventListener("input", renderArchive);
    archiveCategory?.addEventListener("change", renderArchive);

    dialogSearchInput?.addEventListener("input", renderSearchResults);

    document.querySelector("#open-search-button")?.addEventListener("click", () => {
      renderSearchResults();
      openDialog(searchDialog);
      window.setTimeout(() => dialogSearchInput?.focus(), 60);
    });

    document.querySelector("#mobile-search-button")?.addEventListener("click", () => {
      mobileNav?.classList.remove("is-open");
      menuButton?.setAttribute("aria-expanded", "false");
      renderSearchResults();
      openDialog(searchDialog);
      window.setTimeout(() => dialogSearchInput?.focus(), 60);
    });

    searchDialogClose?.addEventListener("click", () => closeDialog(searchDialog));
    recipeDialogClose?.addEventListener("click", () => closeDialog(recipeDialog));

    searchDialog?.addEventListener("click", (event) => {
      if (event.target === searchDialog) closeDialog(searchDialog);
    });

    recipeDialog?.addEventListener("click", (event) => {
      if (event.target === recipeDialog) closeDialog(recipeDialog);
    });

    document.querySelector("#previous-recipe")?.addEventListener("click", () => {
      const nextIndex = (currentRecipeIndex - 1 + recipes.length) % recipes.length;
      populateRecipeDialog(nextIndex);
    });

    document.querySelector("#next-recipe")?.addEventListener("click", () => {
      const nextIndex = (currentRecipeIndex + 1) % recipes.length;
      populateRecipeDialog(nextIndex);
    });

    document.querySelector("#dialog-jump-button")?.addEventListener("click", () => {
      const recipe = recipes[currentRecipeIndex];
      closeDialog(recipeDialog);
      if (recipe) jumpToRecipe(recipe.id);
    });

    [
      "#random-recipe-button",
      "#hero-random-button",
      "#archive-random-button",
      "#berrybelle-pick-button"
    ].forEach((selector) => {
      document.querySelector(selector)?.addEventListener("click", jumpRandom);
    });

    menuButton?.addEventListener("click", () => {
      const open = !mobileNav?.classList.contains("is-open");
      mobileNav?.classList.toggle("is-open", open);
      menuButton.setAttribute("aria-expanded", String(open));
    });

    mobileNav?.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        mobileNav.classList.remove("is-open");
        menuButton?.setAttribute("aria-expanded", "false");
      });
    });

    window.addEventListener("scroll", updateScrollProgress, { passive: true });
    window.addEventListener("resize", updateScrollProgress);
  };

  const init = () => {
    if (!recipes.length || !stream) {
      console.error("Berry Vibes Studio recipe data did not load.");
      return;
    }

    buildCategoryLinks();
    buildStream();
    renderArchive();
    renderSearchResults();
    initEvents();
    initObservers();
    updateScrollProgress();

    window.setTimeout(() => {
      showGuide("Keep scrolling. The cookbook is live.");
    }, 900);
  };

  init();
})();
