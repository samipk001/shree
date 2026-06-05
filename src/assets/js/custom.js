$(function () {

    // Header Scroll
    $(window).scroll(function () {
        if ($(window).scrollTop() >= 60) {
            $("header").addClass("fixed-header");
        } else {
            $("header").removeClass("fixed-header");
        }
    });

    // Tooltip
    const tooltipTriggerList = Array.from(
        document.querySelectorAll('[data-bs-toggle="tooltip"]')
    );
    tooltipTriggerList.forEach((tooltipTriggerEl) => {
        new bootstrap.Tooltip(tooltipTriggerEl);
    });


    // Count
    $('.count').each(function () {
        $(this).prop('Counter', 0).animate({
            Counter: $(this).text()
        }, {
            duration: 1000,
            easing: 'swing',
            step: function (now) {
                $(this).text(Math.ceil(now));
            }
        });
    });


    // ScrollToTop
    function scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    const btn = document.getElementById("scrollToTopBtn");
    if (btn) {
        btn.addEventListener("click", scrollToTop);
    }

    window.onscroll = function () {
        const btnOnScroll = document.getElementById("scrollToTopBtn");
        if (btnOnScroll) {
            if (document.documentElement.scrollTop > 100 || document.body.scrollTop > 100) {
                btnOnScroll.style.display = "flex";
            } else {
                btnOnScroll.style.display = "none";
            }
        }
    };


    // Aos
    AOS.init({
        once: true,
    });

    function isProductsPageEnabled(){
        try{
            const raw = localStorage.getItem('shree_products_settings');
            if (!raw) return true;
            const settings = JSON.parse(raw || '{}');
            if (typeof settings.productsPageEnabled === 'boolean') {
                return settings.productsPageEnabled;
            }
            return true;
        }catch(e){
            return true;
        }
    }

    function updateShowcaseLinks(){
        const links = document.querySelectorAll('[data-products-target]');
        const enabled = isProductsPageEnabled();
        links.forEach(link => {
            const target = link.dataset.productsTarget;
            if (enabled) {
                link.setAttribute('href', target);
                link.classList.remove('products-disabled');
                link.removeAttribute('aria-disabled');
            } else {
                link.setAttribute('href', '#');
                link.classList.add('products-disabled');
                link.setAttribute('aria-disabled', 'true');
            }
            link.addEventListener('click', (e) => {
                if (!isProductsPageEnabled()) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                }
            });
        });
    }

    function fixOffcanvasAnchorLinks() {
        const offcanvas = document.getElementById('offcanvasHeader');
        if (!offcanvas || typeof bootstrap === 'undefined') {
            return;
        }

        const links = offcanvas.querySelectorAll('.offcanvas-body a[data-bs-dismiss="offcanvas"]');
        const offcanvasInstance = bootstrap.Offcanvas.getOrCreateInstance(offcanvas);

        links.forEach(link => {
            link.removeAttribute('data-bs-dismiss');
            link.addEventListener('click', () => {
                offcanvasInstance.hide();
            });
        });
    }

    updateShowcaseLinks();
    fixOffcanvasAnchorLinks();

    // Scroll
    const sections = document.querySelectorAll("section[id]");

    window.addEventListener("scroll", navHighlighter);

    function navHighlighter() {

        let scrollY = window.pageYOffset;

        sections.forEach(current => {
            const sectionHeight = current.offsetHeight;
            const sectionTop = current.offsetTop - 100;
            sectionId = current.getAttribute("id");

            if (
                scrollY > sectionTop &&
                scrollY <= sectionTop + sectionHeight
            ) {
                const activeLink = Array.from(document.querySelectorAll('.navbar-collapse a')).find(a => a.getAttribute('href')?.includes('#' + sectionId));
                if (activeLink) activeLink.classList.add('active');
            } else {
                const inactiveLink = Array.from(document.querySelectorAll('.navbar-collapse a')).find(a => a.getAttribute('href')?.includes('#' + sectionId));
                if (inactiveLink) inactiveLink.classList.remove('active');
            }
        });
    }

});

