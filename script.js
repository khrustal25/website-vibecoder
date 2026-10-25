/* =========================================================
   Поведение сайта: меню, плавный скролл, анимации, форма
   Комментарии рассчитаны на новичка
   ========================================================= */

(function () {
  const header = document.querySelector(".header");
  const nav = document.querySelector("#site-nav");
  const burger = document.querySelector(".burger");
  const overlay = document.querySelector(".nav-overlay");
  const form = document.querySelector("#lead-form");
  const success = document.querySelector("#form-success");
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ----- Header при прокрутке ----- */
  function onScroll() {
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  }

  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ----- Мобильное меню ----- */
  function isMobileNav() {
    return window.matchMedia("(max-width: 1100px)").matches;
  }

  function setMobileNavA11y(isOpen) {
    if (!nav) return;
    if (isMobileNav()) {
      if (isOpen) {
        nav.removeAttribute("aria-hidden");
        nav.querySelectorAll("a").forEach(function (link) {
          link.removeAttribute("tabindex");
        });
      } else {
        nav.setAttribute("aria-hidden", "true");
        nav.querySelectorAll("a").forEach(function (link) {
          link.setAttribute("tabindex", "-1");
        });
      }
    } else {
      nav.removeAttribute("aria-hidden");
      nav.querySelectorAll("a").forEach(function (link) {
        link.removeAttribute("tabindex");
      });
    }
  }

  function openMenu() {
    nav.classList.add("is-open");
    burger.classList.add("is-open");
    if (overlay) {
      overlay.classList.add("is-visible");
      overlay.hidden = false;
    }
    burger.setAttribute("aria-expanded", "true");
    burger.setAttribute("aria-label", "Закрыть меню");
    setMobileNavA11y(true);
    document.body.classList.add("menu-open");
  }

  function closeMenu() {
    nav.classList.remove("is-open");
    burger.classList.remove("is-open");
    if (overlay) {
      overlay.classList.remove("is-visible");
      window.setTimeout(function () {
        if (!nav.classList.contains("is-open")) overlay.hidden = true;
      }, 400);
    }
    burger.setAttribute("aria-expanded", "false");
    burger.setAttribute("aria-label", "Открыть меню");
    setMobileNavA11y(false);
    document.body.classList.remove("menu-open");
  }

  function toggleMenu() {
    if (nav.classList.contains("is-open")) closeMenu();
    else openMenu();
  }

  /* На iOS fixed-меню внутри sticky-шапки не открывается — выносим меню в body */
  function placeNav() {
    var inner = document.querySelector(".header__inner");
    if (!nav || !inner || !burger) return;

    if (isMobileNav()) {
      if (nav.parentElement !== document.body) {
        document.body.appendChild(nav);
      }
      if (!nav.classList.contains("is-open")) setMobileNavA11y(false);
    } else {
      if (nav.parentElement !== inner) {
        inner.insertBefore(nav, burger);
      }
      if (nav.classList.contains("is-open")) closeMenu();
      setMobileNavA11y(true);
    }
  }

  placeNav();
  window.addEventListener("resize", placeNav);

  if (burger) {
    burger.addEventListener("click", function (event) {
      event.preventDefault();
      toggleMenu();
    });
  }

  if (overlay) {
    overlay.addEventListener("click", closeMenu);
  }

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") closeMenu();
  });

  /* ----- Плавный переход по якорям с учётом липкой шапки ----- */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (event) {
      const id = link.getAttribute("href");
      if (!id || id === "#") {
        event.preventDefault();
        return;
      }

      const target = document.querySelector(id);
      if (!target) return;

      event.preventDefault();
      closeMenu();

      const top = target.getBoundingClientRect().top + window.scrollY - header.offsetHeight - 8;
      window.scrollTo({
        top: Math.max(0, top),
        behavior: prefersReduced ? "auto" : "smooth"
      });
    });
  });

  /* ----- Появление блоков при скролле ----- */
  const revealItems = document.querySelectorAll(".reveal");

  if (prefersReduced) {
    revealItems.forEach(function (item) {
      item.classList.add("is-visible");
    });
  } else if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -40px 0px" }
    );

    revealItems.forEach(function (item, index) {
      item.style.transitionDelay = (index % 6) * 70 + "ms";
      observer.observe(item);
    });
  } else {
    revealItems.forEach(function (item) {
      item.classList.add("is-visible");
    });
  }

  /* ----- Форма заявки: проверка и подготовка письма ----- */
  function showError(input, errorEl, message) {
    input.closest(".form__field").classList.add("is-invalid");
    errorEl.textContent = message;
    errorEl.hidden = false;
  }

  function clearError(input, errorEl) {
    input.closest(".form__field").classList.remove("is-invalid");
    errorEl.hidden = true;
  }

  if (form) {
    const nameInput = form.querySelector("#name");
    const methodSelect = form.querySelector("#contact-method");
    const contactInput = form.querySelector("#contact-value");
    const taskInput = form.querySelector("#task");
    const consentInput = form.querySelector("#privacy-consent");
    const nameError = form.querySelector("#name-error");
    const methodError = form.querySelector("#method-error");
    const contactError = form.querySelector("#contact-error");
    const consentError = form.querySelector("#consent-error");

    nameInput.addEventListener("input", function () {
      if (nameInput.value.trim()) clearError(nameInput, nameError);
    });

    methodSelect.addEventListener("change", function () {
      if (methodSelect.value) clearError(methodSelect, methodError);
      if (methodSelect.value === "VK") {
        contactInput.placeholder = "Ссылка на ваш профиль VK";
      } else if (methodSelect.value === "Telegram") {
        contactInput.placeholder = "Ник в Telegram";
      } else if (methodSelect.value === "Email") {
        contactInput.placeholder = "Ваш email";
      } else {
        contactInput.placeholder = "Ник, email или ссылка для связи";
      }
    });

    contactInput.addEventListener("input", function () {
      if (contactInput.value.trim()) clearError(contactInput, contactError);
    });

    if (consentInput) {
      consentInput.addEventListener("change", function () {
        if (consentInput.checked) clearError(consentInput, consentError);
      });
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var valid = true;

      if (!nameInput.value.trim()) {
        showError(nameInput, nameError, "Пожалуйста, укажите имя");
        valid = false;
      } else {
        clearError(nameInput, nameError);
      }

      if (!methodSelect.value) {
        showError(methodSelect, methodError, "Выберите способ связи");
        valid = false;
      } else {
        clearError(methodSelect, methodError);
      }

      if (!contactInput.value.trim()) {
        showError(contactInput, contactError, "Укажите контакт для связи");
        valid = false;
      } else {
        clearError(contactInput, contactError);
      }

      if (!consentInput || !consentInput.checked) {
        showError(consentInput, consentError, "Нужно согласие на обработку персональных данных");
        valid = false;
      } else {
        clearError(consentInput, consentError);
      }

      if (!valid) {
        const firstError = form.querySelector(".is-invalid input, .is-invalid select, .is-invalid textarea");
        if (firstError) firstError.focus();
        return;
      }

      var subject = "Заявка с сайта Елены Хрусталевой";
      var body =
        "Имя: " + nameInput.value.trim() + "\n" +
        "Способ связи: " + methodSelect.value + "\n" +
        "Контакт: " + contactInput.value.trim() + "\n" +
        "Описание задачи: " + (taskInput.value.trim() || "—");

      var mailto =
        "mailto:smmehrustal25@gmail.com" +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body);

      window.location.href = mailto;

      if (success) {
        form.hidden = true;
        success.hidden = false;
        success.querySelector("h3").focus?.();
      }
    });
  }

  /* ----- Год в копирайте подвала ----- */
  var yearEl = document.querySelector("#footer-year");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }
})();
