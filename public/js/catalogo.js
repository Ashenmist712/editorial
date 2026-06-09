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
    const dAmazon = document.getElementById("detail-amazon");
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
        
        const dNoAmazon = document.getElementById("detail-no-amazon");
        if (libro.amazon_link) {
            dAmazon.href = libro.amazon_link;
            dAmazon.style.display = "inline-block";
            if(dNoAmazon) dNoAmazon.style.display = "none";
        } else {
            dAmazon.style.display = "none";
            if(dNoAmazon) dNoAmazon.style.display = "block";
        }

        // Actualizar paginación
        dPagination.textContent = `${currentBookIndex + 1} / ${librosData.length}`;

        // Transición
        booksContainer.classList.add("hidden");
        catalogHeader.classList.add("hidden");
        detailView.classList.remove("hidden");
        window.scrollTo(0, 0);
    }

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

    // Modal y WhatsApp Logic
    const btnOpenModal = document.getElementById('btn-open-modal');
    const btnCloseModal = document.getElementById('btn-close-modal');
    const modal = document.getElementById('whatsapp-modal');
    const whatsappForm = document.getElementById('whatsapp-form');

    if (btnOpenModal && modal && btnCloseModal) {
        btnOpenModal.addEventListener('click', () => {
            modal.classList.add('active');
        });

        btnCloseModal.addEventListener('click', () => {
            modal.classList.remove('active');
        });

        // Cerrar modal si hace click fuera del contenido
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    }

    if (whatsappForm) {
        whatsappForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = document.getElementById('wa-name').value.trim();
            const email = document.getElementById('wa-email').value.trim();
            const phone = document.getElementById('wa-phone').value.trim();
            const message = document.getElementById('wa-message').value.trim();
            
            // Construir el mensaje formateado para WhatsApp
            const waNumber = "525611871013"; // Número proporcionado por el usuario
            const textMsg = `Hola Linterna Negra,\n\nMi nombre es *${name}*.\nMi correo es: ${email}\nMi teléfono es: ${phone}\n\n*De qué trata mi libro / Mi duda:*\n${message}`;
            
            // Codificar el texto para URL
            const encodedText = encodeURIComponent(textMsg);
            
            // Crear el enlace a WhatsApp API
            const waUrl = `https://wa.me/${waNumber}?text=${encodedText}`;
            
            // Abrir en una nueva pestaña
            window.open(waUrl, '_blank');
            
            // Opcional: Cerrar el modal después de enviar
            if (modal) {
                modal.classList.remove('active');
            }
            whatsappForm.reset();
        });
    }
});
