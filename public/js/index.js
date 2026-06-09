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

    // Animación del Splash Screen
    const splashScreen = document.getElementById('splash-screen');
    if (splashScreen) {
        setTimeout(() => {
            splashScreen.classList.add('hidden');
        }, 2800);
    }

    // Cargar información de la editorial desde el JSON
    fetch('public/js/libros.json')
        .then(response => response.json())
        .then(data => {
            const editorialInfo = data.find(item => item.tipo === 'editorial');
            if (editorialInfo) {
                document.getElementById('about-content').textContent = editorialInfo.descripcion;
            }
        })
        .catch(error => {
            console.error("Error cargando la información de la editorial:", error);
            document.getElementById('about-content').textContent = "LINTERNA NEGRA es una casa editorial independiente fundada desde enero de 2022 por el autor-editor Juan Carlos Doñate.";
        });

    // ScrollSpy para iluminar el navbar
    const sections = document.querySelectorAll("section");
    const navLinks = document.querySelectorAll(".nav-links a");

    window.addEventListener("scroll", () => {
        let current = "";
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            // Se resta una porción para que el cambio se dé cuando la sección está visible
            if (pageYOffset >= (sectionTop - sectionHeight / 3)) {
                current = section.getAttribute("id");
            }
        });

        navLinks.forEach(link => {
            link.classList.remove("active");
            if (link.getAttribute("href").includes(current) && current !== "") {
                link.classList.add("active");
            }
        });
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
            
            // Construir el mensaje formateado para el Correo
            const emailAddress = "linternanegraediciones@gmail.com";
            const subject = encodeURIComponent("Contacto desde la página web");
            const textMsg = `Hola Linterna Negra,\n\nMi nombre es: ${name}\nMi correo es: ${email}\nMi teléfono es: ${phone}\n\nDe qué trata mi libro / Mi duda:\n${message}`;
            
            // Codificar el texto para URL
            const encodedText = encodeURIComponent(textMsg);
            
            // Crear el enlace mailto
            const mailtoUrl = `mailto:${emailAddress}?subject=${subject}&body=${encodedText}`;
            
            // Abrir el cliente de correo
            window.location.href = mailtoUrl;
            
            // Opcional: Cerrar el modal después de enviar
            if (modal) {
                modal.classList.remove('active');
            }
            whatsappForm.reset();
        });
    }
});
