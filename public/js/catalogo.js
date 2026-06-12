document.addEventListener("DOMContentLoaded", () => {
    // Menú móvil
    const mobileMenu = document.getElementById('mobile-menu');
    const navLinksContainer = document.querySelector('.nav-links');

    if (mobileMenu && navLinksContainer) {
        mobileMenu.addEventListener('click', () => {
            navLinksContainer.classList.toggle('active');
        });

        // Cerrar menú al hacer clic en un enlace
        const navLinksItems = document.querySelectorAll('.nav-links a');
        navLinksItems.forEach(item => {
            item.addEventListener('click', () => {
                navLinksContainer.classList.remove('active');
            });
        });
    }

    const booksContainer = document.getElementById("books-container");
    const detailView = document.getElementById("book-detail-view");
    const catalogHeader = document.querySelector(".catalog-header");
    const backButton = document.getElementById("back-to-catalog");

    // Elementos del detalle
    const dBreadcrumb = document.getElementById("detail-breadcrumb-title");
    const dCover = document.getElementById("detail-cover");
    const dTitle = document.getElementById("detail-title");
    const dAuthor = document.getElementById("detail-author");
    const dGenre = document.getElementById("detail-genre");
    const dAuthorMeta = document.getElementById("detail-author-meta");
    const dYear = document.getElementById("detail-year");
    const dPrice = document.getElementById("detail-price");
    const dBuyNow = document.getElementById("btn-buy-now");
    const dAmazonSecondary = document.getElementById("btn-amazon-secondary");
    const dSynopsis = document.getElementById("detail-synopsis");
    const navPrev = document.getElementById("nav-prev");
    const navNext = document.getElementById("nav-next");
    const dPagination = document.getElementById("detail-pagination");

    let librosData = [];
    let currentBookIndex = 0;

    // Cargar JSON
    fetch('public/js/libros.json')
        .then(response => response.json())
        .then(data => {
            // Filtrar solo los libros (ignorar el objeto de editorial)
            librosData = data.filter(item => item.tipo !== 'editorial');
            renderCatalog(librosData);
        })
        .catch(error => {
            console.error("Error cargando el catálogo:", error);
            booksContainer.innerHTML = `<div class="book-placeholder">Error al cargar el catálogo.</div>`;
        });

    function renderCatalog(libros) {
        booksContainer.innerHTML = "";
        libros.forEach((libro, index) => {
            const card = document.createElement("div");
            card.className = "book-card";
            card.innerHTML = `
                <img src="${libro.imagen}" alt="${libro.titulo}" class="book-card-cover" onerror="this.src='public/img/logo.png'; this.style.objectFit='contain';">
                <h3 class="book-card-title">${libro.titulo}</h3>
            `;
            card.addEventListener("click", () => showDetail(index));
            booksContainer.appendChild(card);
        });
    }

    function showDetail(index) {
        currentBookIndex = index;
        const libro = librosData[index];

        // Llenar datos
        dBreadcrumb.textContent = libro.titulo;
        dCover.src = libro.imagen;
        dTitle.textContent = libro.titulo;
        dAuthor.textContent = libro.autor || "Autor Desconocido";
        dGenre.textContent = libro.genero || "No especificado";
        dAuthorMeta.textContent = libro.autor || "Autor Desconocido";
        dYear.textContent = libro.anio || "No especificado";
        dPrice.textContent = libro.precio || "0.00";
        dSynopsis.textContent = libro.sinopsis || "Sinopsis no disponible.";
        
        // 1. Botón Principal (PayPal) - Siempre Activo
        dBuyNow.dataset.paypalLink = libro.paypal_link || ""; 
        dBuyNow.dataset.title = libro.titulo;
        dBuyNow.dataset.price = libro.precio;
        dBuyNow.disabled = false;
        dBuyNow.classList.remove("loading");
        dBuyNow.innerHTML = 'COMPRAR AHORA <i class="fab fa-paypal"></i>';

        // 2. Botón Secundario (Amazon / Próximamente)
        if (libro.amazon_link) {
            dAmazonSecondary.classList.remove("disabled");
            dAmazonSecondary.href = libro.amazon_link;
            dAmazonSecondary.target = "_blank";
            dAmazonSecondary.innerHTML = 'Comprar en Amazon <i class="fab fa-amazon"></i>';
        } else {
            dAmazonSecondary.classList.add("disabled");
            dAmazonSecondary.href = "javascript:void(0)";
            dAmazonSecondary.removeAttribute("target");
            dAmazonSecondary.innerHTML = 'Próximamente';
        }

        // Actualizar paginación
        dPagination.textContent = `${currentBookIndex + 1} / ${librosData.length}`;

        // Transición
        booksContainer.classList.add("hidden");
        catalogHeader.classList.add("hidden");
        detailView.classList.remove("hidden");
        window.scrollTo(0, 0);
    }

    // --- LÓGICA DE COMPRA Y GOOGLE SHEETS ---
    const GAS_WEB_APP_URL = "TU_URL_DE_GOOGLE_APPS_SCRIPT_AQUI"; // REEMPLAZAR CON LA URL DESPLEGADA

    dBuyNow.addEventListener("click", async (e) => {
        e.preventDefault();
        
        const paypalLink = dBuyNow.dataset.paypalLink;
        if (!paypalLink) return;

        // Bloquear botón y UI de carga
        dBuyNow.disabled = true;
        dBuyNow.classList.add("loading");
        dBuyNow.innerHTML = 'PROCESANDO... <i class="fas fa-spinner"></i>';

        const data = {
            titulo: dBuyNow.dataset.title,
            precio: dBuyNow.dataset.price,
            fecha: new Date().toLocaleString("es-MX"),
            estado: "Pendiente"
        };

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 segundos max

            // no-cors se usa para evitar bloqueos del navegador hacia GAS
            // GAS recibirá el payload como texto plano y lo parseará
            await fetch(GAS_WEB_APP_URL, {
                method: "POST",
                mode: "no-cors",
                headers: {
                    "Content-Type": "text/plain"
                },
                body: JSON.stringify(data),
                signal: controller.signal
            });
            clearTimeout(timeoutId);
        } catch (error) {
            console.error("Error silencioso al registrar en GAS:", error);
        }

        // Redirigir siempre a PayPal
        window.location.href = paypalLink;
    });

    // Volver al catálogo
    backButton.addEventListener("click", (e) => {
        e.preventDefault();
        detailView.classList.add("hidden");
        catalogHeader.classList.remove("hidden");
        booksContainer.classList.remove("hidden");
    });

    // Navegación Anterior/Siguiente
    navPrev.addEventListener("click", () => {
        if (currentBookIndex > 0) {
            showDetail(currentBookIndex - 1);
        } else {
            showDetail(librosData.length - 1); // Bucle al final
        }
    });

    navNext.addEventListener("click", () => {
        if (currentBookIndex < librosData.length - 1) {
            showDetail(currentBookIndex + 1);
        } else {
            showDetail(0); // Bucle al inicio
        }
    });


});
