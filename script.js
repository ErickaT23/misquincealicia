document.addEventListener('DOMContentLoaded', async function() {
    await hydrateSiteConfigForEvent();
    applySiteConfig();
    await InvitadoApp.init();
    MensajeFlota.init();
    MusicaPlayer.init();
    initPortada();
    initScrollAnimations();
    initCountdown();
    initAutoGallery();
    initRSVP();
    initGiftModal();
    hydrateContextLinks();
});

const externalConfig = window.config || {};

function resolveEventId() {
    const eventConfig = externalConfig.event || {};
    const eventIdParam = String(eventConfig.eventIdParam || 'eventId').trim() || 'eventId';
    const defaultEventId = String(eventConfig.defaultEventId || 'alicia-2026').trim() || 'alicia-2026';
    const params = new URLSearchParams(window.location.search || '');
    const paramValue = String(params.get(eventIdParam) || '').trim();
    const eventId = paramValue || defaultEventId;

    return {
        eventId,
        eventIdParam,
        defaultEventId
    };
}

const EventContext = resolveEventId();
window.EventContext = EventContext;
window.currentEventId = EventContext.eventId;

function hydrateContextLinks() {
    const search = String(window.location.search || '');
    if (!search) return;

    const links = document.querySelectorAll('.hero-evento-card, .hero-deseo-semicirculo, .hero-rsvp-circulo, .hero-galeria-card');
    links.forEach(function(link) {
        if (!link || !link.getAttribute) return;
        const href = String(link.getAttribute('href') || '').trim();
        if (!href || href.startsWith('http') || href.startsWith('#')) return;

        const hashIndex = href.indexOf('#');
        const hash = hashIndex >= 0 ? href.slice(hashIndex) : '';
        const pathWithQuery = hashIndex >= 0 ? href.slice(0, hashIndex) : href;

        if (pathWithQuery.includes('?')) {
            link.setAttribute('href', pathWithQuery + '&' + search.slice(1) + hash);
        } else {
            link.setAttribute('href', pathWithQuery + search + hash);
        }
    });
}

function normalizeRemoteEventConfig(rawConfig) {
    if (!rawConfig || typeof rawConfig !== 'object') return {};

    const remoteEvento = rawConfig.evento && typeof rawConfig.evento === 'object'
        ? rawConfig.evento
        : {};
    const remoteCeremonia = (remoteEvento.ceremonia && typeof remoteEvento.ceremonia === 'object'
        ? remoteEvento.ceremonia
        : rawConfig.ceremonia) || {};
    const remoteRecepcion = (remoteEvento.recepcion && typeof remoteEvento.recepcion === 'object'
        ? remoteEvento.recepcion
        : rawConfig.recepcion) || {};

    return {
        ...rawConfig,
        evento: {
            ...remoteEvento,
            ceremonia: {
                ...remoteCeremonia,
                ubicacionUrl: remoteCeremonia.ubicacionUrl || remoteCeremonia.ubicacion || ''
            },
            recepcion: {
                ...remoteRecepcion,
                ubicacionUrl: remoteRecepcion.ubicacionUrl || remoteRecepcion.ubicacion || ''
            }
        }
    };
}

function createSiteConfig(remoteConfig) {
    const normalizedRemoteConfig = normalizeRemoteEventConfig(remoteConfig);
    const localEvento = (externalConfig && externalConfig.evento) || {};
    const remoteEvento = normalizedRemoteConfig.evento || {};

    return {
        seo: {
            titulo: 'Alicia | Quinceañera 2026',
            descripcion: 'Quinceañera de Alicia - 5 de Junio 2026',
            autor: 'Two Design',
            ...externalConfig.seo,
            ...normalizedRemoteConfig.seo
        },
        pareja: {
            nombres: 'Alicia',
            fecha: '05-06-2026',
            fechaVisible: '05 · 06 · 2026',
            ...externalConfig.pareja,
            ...normalizedRemoteConfig.pareja
        },
        musica: {
            titulo: 'Nuestra Cancion',
            archivo: 'audio/nuestra-cancion.mp3',
            ...externalConfig.musica,
            ...normalizedRemoteConfig.musica
        },
        evento: {
            ceremonia: {
                titulo: 'Ceremonia',
                lugar: 'Iglesia de La Merced',
                hora: '3:00 PM',
                direccion: '1a Calle Poniente, Antigua Guatemala',
                ubicacionUrl: 'https://maps.app.goo.gl/3ZrcNpw7afgj21q79',
                ...(localEvento.ceremonia || {}),
                ...(remoteEvento.ceremonia || {})
            },
            recepcion: {
                titulo: 'Recepcion',
                lugar: 'Verde Eventos',
                hora: '4:00 PM',
                direccion: 'Eventos Verdes, Antigua Guatemala',
                ubicacionUrl: 'https://maps.app.goo.gl/Lj7mttDL4H1A392m6',
                ...(localEvento.recepcion || {}),
                ...(remoteEvento.recepcion || {})
            }
        },
        textos: {
            mensajeInvitado: 'Eres muy especial para nosotros',
            mensajePases: 'Hemos reservado {pases} lugares en su honor',
            ...externalConfig.textos,
            ...normalizedRemoteConfig.textos
        },
        footer: {
            hashtag: '#Alicia2026',
            instagramUrl: 'https://instagram.com/thetwodesign',
            facebookUrl: 'https://facebook.com/thetwodesign',
            marcaTexto: 'Diseño',
            marcaNombre: 'Two Design',
            marcaUrl: 'https://twodesign.com',
            ...externalConfig.footer,
            ...normalizedRemoteConfig.footer
        }
    };
}

let SiteConfig = createSiteConfig();
window.SiteConfig = SiteConfig;

async function hydrateSiteConfigForEvent() {
    try {
        const rsvpDB = window.RSVPDatabase;
        if (!rsvpDB || typeof rsvpDB.getEventConfig !== 'function') return;

        const eventId = String(window.currentEventId || '').trim();
        const remoteConfig = await rsvpDB.getEventConfig(eventId);
        if (!remoteConfig || typeof remoteConfig !== 'object') return;

        SiteConfig = createSiteConfig(remoteConfig);
        window.SiteConfig = SiteConfig;
    } catch (error) {
        console.warn('No se pudo cargar configuración remota del evento. Se usará config local:', error);
    }
}

function splitPairNames(nombres) {
    const safeNombres = String(nombres || '').trim();
    const parts = safeNombres.split('&');
    const left = (parts[0] || '').trim();
    const right = (parts[1] || '').trim();
    return { left, right };
}

function setStyledWord(container, word) {
    if (!container) return;
    const initialEl = container.querySelector('.inicial, .musica-inicial, .event-inicial');
    const restEl = container.querySelector('.resto, .musica-resto, .event-resto');
    const safeWord = String(word || '').trim();

    if (!safeWord) return;
    if (initialEl) initialEl.textContent = safeWord.charAt(0);
    if (restEl) restEl.textContent = safeWord.slice(1);
}

function applySiteConfig() {
    applySeoConfig();
    const fullName = String(SiteConfig.pareja.nombres || '').trim();

    const portadaTitle = document.querySelector('.portada-nombres');
    if (portadaTitle && fullName) portadaTitle.textContent = fullName;

    const heroTitle = document.querySelector('.hero-invitado-nombres');
    if (heroTitle && fullName) heroTitle.textContent = fullName;

    const heroDate = document.querySelector('.hero-invitado-fecha');
    if (heroDate) heroDate.textContent = SiteConfig.pareja.fechaVisible;

    const musicaTitulo = String(SiteConfig.musica.titulo || '').trim().split(/\s+/);
    const musicaWords = document.querySelectorAll('.musica-titulo .musica-palabra');
    if (musicaWords[0] && musicaTitulo[0]) {
        const firstInitial = musicaWords[0].querySelector('.musica-inicial');
        const firstRest = musicaWords[0].querySelector('.musica-resto');
        if (firstInitial) firstInitial.textContent = musicaTitulo[0].charAt(0);
        if (firstRest) firstRest.textContent = musicaTitulo[0].slice(1);
    }
    if (musicaWords[1] && musicaTitulo[1]) {
        const secondInitial = musicaWords[1].querySelector('.musica-inicial');
        const secondRest = musicaWords[1].querySelector('.musica-resto');
        if (secondInitial) secondInitial.textContent = musicaTitulo[1].charAt(0);
        if (secondRest) secondRest.textContent = musicaTitulo[1].slice(1);
    }

    const audioSource = document.querySelector('#musica-audio source');
    const audioEl = document.getElementById('musica-audio');
    if (audioSource && SiteConfig.musica.archivo) {
        audioSource.setAttribute('src', SiteConfig.musica.archivo);
    }
    if (audioEl) audioEl.load();

    const invitadoMensaje = document.querySelector('.invitado-mensaje');
    if (invitadoMensaje) invitadoMensaje.textContent = SiteConfig.textos.mensajeInvitado;

    applyEventCard('.events-container .event-card:nth-child(1)', SiteConfig.evento.ceremonia);
    applyEventCard('.events-container .event-card:nth-child(2)', SiteConfig.evento.recepcion);
    applyFooterConfig();
}

function applySeoConfig() {
    if (SiteConfig.seo.titulo) {
        document.title = SiteConfig.seo.titulo;
    }

    setMetaContent('description', SiteConfig.seo.descripcion);
    setMetaContent('author', SiteConfig.seo.autor);
}

function setMetaContent(name, value) {
    if (!value) return;
    const meta = document.querySelector('meta[name="' + name + '"]');
    if (!meta) return;
    meta.setAttribute('content', value);
}

function applyEventCard(selector, data) {
    const card = document.querySelector(selector);
    if (!card || !data) return;

    const initial = card.querySelector('.event-inicial');
    const rest = card.querySelector('.event-resto');
    const titulo = String(data.titulo || '').trim();
    if (titulo) {
        if (initial) initial.textContent = titulo.charAt(0);
        if (rest) rest.textContent = titulo.slice(1);
    }

    const timeEl = card.querySelector('.event-time');
    const lugarEl = card.querySelector('.event-lugar');
    const direccionEl = card.querySelector('.event-direccion');
    const linkEl = card.querySelector('.btn-location');

    if (timeEl) timeEl.textContent = data.hora || '';
    if (lugarEl) lugarEl.textContent = data.lugar || '';
    if (direccionEl) direccionEl.textContent = data.direccion || '';
    if (linkEl) linkEl.setAttribute('href', data.ubicacionUrl || '#');
}

function applyFooterConfig() {
    const instagramEl = document.querySelector('#social-icons a[aria-label="Instagram"]');
    if (instagramEl && SiteConfig.footer.instagramUrl) {
        instagramEl.setAttribute('href', SiteConfig.footer.instagramUrl);
    }

    const facebookEl = document.querySelector('#social-icons a[aria-label="Facebook"]');
    if (facebookEl && SiteConfig.footer.facebookUrl) {
        facebookEl.setAttribute('href', SiteConfig.footer.facebookUrl);
    }
}

// ============================================
// CONFIGURACIÓN - Editar aquí los invitados
// ============================================
const GuestConfig = {
    invitados: {
        "1": { nombre: "María Alicia Turcios de Marroquín", pases: 1 },
        "2": { nombre: "José Ovidio y Sra.", pases: 2 },
        "3": { nombre: "Jorge Alberto y Familia", pases: 3 },
        "4": { nombre: "Jorge Alberto Paiz y Familia", pases: 4 },
        "5": { nombre: "Lourdes Paiz e Hijo", pases: 2 },
        "6": { nombre: "Jose Benjamin Arteaga y Sra.", pases: 2 },
        "7": { nombre: "Lorena Isabel Salguero", pases: 1 },
        "8": { nombre: "Maria del Rosario Salguero", pases: 1 },
        "9": { nombre: "Maria José Henríquez", pases: 1 },
        "10": { nombre: "Joel Saravia y familia", pases: 4 },
        "11": { nombre: "Jose Francisco Salguero", pases: 1 },
        "12": { nombre: "Rolando Samuel Díaz", pases: 1 },
        "13": { nombre: "Veronica Vivar", pases: 1 },
        "14": { nombre: "Yiomara Romero", pases: 1 },
        "15": { nombre: "Amira Carrillo", pases: 1 },
        "16": { nombre: "Yuri Leal", pases: 1 },
        "17": { nombre: "Harry Leal", pases: 1 },
        "18": { nombre: "Jorge Leal e hija", pases: 2 },
        "19": { nombre: "Edgar Sologaistoa y Sra.", pases: 2 },
        "20": { nombre: "Olga Mendizabal", pases: 4 },
        "21": { nombre: "Julio Salguero y Sra", pases: 2 },
        "22": { nombre: "Jose Carlo Rivas", pases: 1 },
        "23": { nombre: "Josseline Rodríguez", pases: 1 },
        "24": { nombre: "Kelvin Gerardo Anaya Lopez", pases: 1 },
        "G50": { nombre: "Invitación grupal abierta", pases: 1, tipo: "grupo", solicitaNombre: true, pasesDisponibles: 50 }
    },
    invitadoDefault: { nombre: "Invitado Especial", pases: 2 },
    paramId: 'id'
};

window.GuestConfig = GuestConfig;

// ============================================
// APP DE INVITADOS - Lógica reutilizable
// ============================================
const InvitadoApp = {
    data: null,

    async init() {
        const localGuest = this.getLocalFromURL();
        const remoteGuest = await this.getRemoteGuest(localGuest.id);
        this.data = remoteGuest || localGuest;
        this.renderSection();
        this.renderRSVP();
        return this.data;
    },

    getLocalFromURL() {
        const params = new URLSearchParams(window.location.search);
        const rawId = String(params.get(GuestConfig.paramId) || '').trim();
        const safeId = rawId || 'default';
        const invitado = GuestConfig.invitados[rawId];

        if (invitado) {
            return {
                id: safeId,
                nombre: String(invitado.nombre || ''),
                pases: Math.max(1, Number(invitado.pases) || 1),
                activo: true,
                tipo: String(invitado.tipo || 'individual').trim().toLowerCase(),
                solicitaNombre: Boolean(invitado.solicitaNombre)
            };
        }

        return {
            id: safeId,
            nombre: String(GuestConfig.invitadoDefault.nombre || ''),
            pases: Math.max(1, Number(GuestConfig.invitadoDefault.pases) || 1),
            activo: true,
            tipo: 'individual',
            solicitaNombre: false
        };
    },

    async getRemoteGuest(guestId) {
        try {
            const rsvpDB = window.RSVPDatabase;
            if (!rsvpDB || typeof rsvpDB.getInvitadoById !== 'function') return null;

            const eventId = String(window.currentEventId || '').trim();
            const remoteGuest = await rsvpDB.getInvitadoById(eventId, guestId);
            if (!remoteGuest || typeof remoteGuest !== 'object') return null;

            return {
                id: String(remoteGuest.id || guestId || 'default'),
                nombre: String(remoteGuest.nombre || '').trim() || String(GuestConfig.invitadoDefault.nombre || ''),
                pases: Math.max(1, Number(remoteGuest.pases) || Number(GuestConfig.invitadoDefault.pases) || 1),
                activo: typeof remoteGuest.activo === 'undefined' ? true : Boolean(remoteGuest.activo),
                tipo: String(remoteGuest.tipo || 'individual').trim().toLowerCase(),
                solicitaNombre: Boolean(remoteGuest.solicitaNombre)
            };
        } catch (error) {
            console.warn('No se pudo cargar invitado remoto. Se usará fallback local:', error);
            return null;
        }
    },

    renderSection() {
        const nombreEl = document.getElementById('nombre-invitado');
        const portadaNombreEl = document.getElementById('portada-nombre-invitado');
        const portadaSobreEl = document.getElementById('sobre-abrir');
        const isGroupOpenLink = this.data && String(this.data.id || '').trim().toUpperCase() === 'G50';
        const shouldHideName = Boolean(isGroupOpenLink);

        if (nombreEl) nombreEl.textContent = shouldHideName ? '' : this.data.nombre;
        if (portadaNombreEl) {
            if (shouldHideName) {
                portadaNombreEl.style.display = 'none';
                portadaNombreEl.setAttribute('aria-hidden', 'true');
            } else {
                portadaNombreEl.style.display = '';
                portadaNombreEl.removeAttribute('aria-hidden');
                portadaNombreEl.textContent = this.data.nombre;
            }
        }
        if (portadaSobreEl) {
            portadaSobreEl.classList.toggle('is-group-open', shouldHideName);
        }
        this.renderPasesText(this.data.pases);
    },

    renderPasesText(pases) {
        const lugaresEl = document.querySelector('.invitado-lugares');
        const portadaNumeroEl = document.getElementById('portada-numero-lugares');
        if (portadaNumeroEl) portadaNumeroEl.textContent = String(pases);
        if (!lugaresEl) return;

        const template = String(SiteConfig.textos.mensajePases || '');
        if (!template.includes('{pases}')) {
            lugaresEl.textContent = template;
            return;
        }

        const parts = template.split('{pases}');
        const suffixText = pases === 1
            ? String(parts[1] || '').replace(/lugares/i, 'lugar')
            : String(parts[1] || '');
        const numeroEl = document.createElement('span');
        numeroEl.id = 'numero-lugares';
        numeroEl.textContent = String(pases);

        const textoEl = document.createElement('span');
        textoEl.id = 'texto-lugares';
        textoEl.textContent = suffixText;

        lugaresEl.replaceChildren(
            document.createTextNode(parts[0] || ''),
            numeroEl,
            textoEl
        );

    },

    renderRSVP() {
        const nameInput = document.getElementById('rsvp-name');
        const guestsWrapper = document.getElementById('guest-count-wrapper');
        const guestsSelect = document.getElementById('guest-count');
        const responseYes = document.getElementById('rsvp-response-yes');
        const responseNo = document.getElementById('rsvp-response-no');
        const totalPases = Math.max(1, Number(this.data && this.data.pases) || 1);

        if (nameInput) {
            nameInput.value = this.data.nombre;
            nameInput.readOnly = true;
        }

        if (guestsSelect) {
            guestsSelect.replaceChildren();

            for (let i = 1; i <= totalPases; i += 1) {
                const option = document.createElement('option');
                option.value = String(i);
                option.textContent = i === 1 ? '1 invitado' : i + ' invitados';
                guestsSelect.appendChild(option);
            }

            guestsSelect.value = String(totalPases);
            guestsSelect.disabled = true;
            guestsSelect.required = false;
        }

        if (guestsWrapper) {
            guestsWrapper.style.display = 'none';
        }
        if (responseYes) responseYes.checked = false;
        if (responseNo) responseNo.checked = false;
    },

    getData() {
        return this.data;
    }
};

function initPortada() {
    const portada = document.getElementById('portada');
    const btnAbrir = document.getElementById('btn-abrir');
    const sobreAbrir = document.getElementById('sobre-abrir');
    const invitacion = document.getElementById('invitacion');
    
    if (!portada || !invitacion) return;

    let opened = false;
    function openInvitation() {
        if (opened) return;
        opened = true;
        if (window.GlobalMusic && typeof window.GlobalMusic.play === 'function') {
            window.GlobalMusic.play();
        }
        MusicaPlayer.play();
        MusicaPlayer.showControl();
        
        portada.classList.add('abrir');
        invitacion.classList.add('revelar');
        MensajeFlota.mostrar();
        
        setTimeout(function() {
            portada.style.display = 'none';
        }, 1200);
    }

    if (btnAbrir) btnAbrir.addEventListener('click', openInvitation);
    if (sobreAbrir) sobreAbrir.addEventListener('click', openInvitation);

    if ((window.location.hash || '').toLowerCase() === '#invitacion') {
        openInvitation();
    }

    if (btnAbrir) {
        btnAbrir.addEventListener('pointermove', function(event) {
            const rect = btnAbrir.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            const offsetX = ((x / rect.width) - 0.5) * 4;
            const offsetY = ((y / rect.height) - 0.5) * -4;

            btnAbrir.style.setProperty('--btn-tilt-x', offsetX.toFixed(2));
            btnAbrir.style.setProperty('--btn-tilt-y', offsetY.toFixed(2));
            btnAbrir.style.setProperty('--btn-light-x', ((x / rect.width) * 100).toFixed(2) + '%');
            btnAbrir.style.setProperty('--btn-light-y', ((y / rect.height) * 100).toFixed(2) + '%');
        });

        btnAbrir.addEventListener('pointerleave', function() {
            btnAbrir.style.setProperty('--btn-tilt-x', '0');
            btnAbrir.style.setProperty('--btn-tilt-y', '0');
            btnAbrir.style.setProperty('--btn-light-x', '50%');
            btnAbrir.style.setProperty('--btn-light-y', '50%');
        });
    }
}

// ============================================
// REPRODUCTOR DE MÚSICA
// ============================================
const MusicaPlayer = {
    audio: null,
    btn: null,
    fab: null,
    progressFill: null,
    status: null,
    isPlaying: false,

    init() {
        this.audio = document.getElementById('musica-audio');
        this.btn = document.getElementById('musica-btn');
        this.fab = document.getElementById('music-fab');
        this.progressFill = document.querySelector('.musica-progress-fill');
        this.status = document.querySelector('.musica-status');

        const invitation = document.getElementById('invitacion');
        if (invitation && invitation.classList.contains('revelar')) {
            this.showControl();
        }
        
        if (this.audio) {
            this.audio.volume = 0.4;
            
            this.audio.addEventListener('timeupdate', () => {
                this.updateProgress();
            });
            
            this.audio.addEventListener('ended', () => {
                this.audio.play();
            });
        }
        
        if (this.btn && this.audio) {
            this.btn.addEventListener('click', () => {
                this.toggle();
            });
        }
    },

    updateProgress() {
        if (!this.audio || !this.progressFill) return;
        
        const percent = (this.audio.currentTime / this.audio.duration) * 100;
        this.progressFill.style.width = percent + '%';
    },

    play() {
        if (!this.audio) return;
        
        this.audio.volume = 0.4;
        const playPromise = this.audio.play();
        
        if (playPromise !== undefined) {
            playPromise.then(() => {
                this.isPlaying = true;
                this.updateUI();
            }).catch(() => {
                this.isPlaying = false;
            });
        }
    },

    pause() {
        if (!this.audio) return;
        this.audio.pause();
        this.isPlaying = false;
        this.updateUI();
    },

    toggle() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    },

    showControl() {
        if (!this.fab) return;
        this.fab.classList.add('is-visible');
    },

    updateUI() {
        if (!this.btn) return;
        this.btn.classList.toggle('playing', this.isPlaying);
        this.btn.setAttribute('aria-pressed', this.isPlaying ? 'true' : 'false');
        this.btn.setAttribute('aria-label', this.isPlaying ? 'Pausar música' : 'Reanudar música');

        if (this.fab) {
            this.fab.classList.toggle('playing', this.isPlaying);
        }
        
        if (this.status) {
            this.status.classList.toggle('active', this.isPlaying);
            this.status.textContent = this.isPlaying ? 'Reproduciendo' : 'Pausado';
        }
    }
};

// ============================================
// MENSAJE FLOTANTE
// ============================================
const MensajeFlota = {
    el: null,

    init() {
        this.el = document.getElementById('scroll-hint');
    },

    mostrar() {
        if (!this.el) return;
        
        this.el.classList.add('mostrar');
        
        setTimeout(() => {
            this.el.classList.remove('mostrar');
        }, 10000);
    }
};

function initScrollAnimations() {
    const elements = document.querySelectorAll('.section, .separator, .footer');

    elements.forEach((element, index) => {
        const revealOrder = index % 4;
        element.style.setProperty('--reveal-order', String(revealOrder));
    });
    
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -8% 0px',
        threshold: 0.14
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    elements.forEach(element => {
        observer.observe(element);
    });
}

function initCountdown() {
    const eventDate = getEventDateFromConfig();
    
    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');
    if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;
    
    function updateCountdown() {
        const now = new Date().getTime();
        const distance = eventDate - now;
        
        if (distance < 0) {
            daysEl.textContent = '00';
            hoursEl.textContent = '00';
            minutesEl.textContent = '00';
            secondsEl.textContent = '00';
            return;
        }
        
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        daysEl.textContent = String(days).padStart(2, '0');
        hoursEl.textContent = String(hours).padStart(2, '0');
        minutesEl.textContent = String(minutes).padStart(2, '0');
        secondsEl.textContent = String(seconds).padStart(2, '0');
    }
    
    updateCountdown();
    setInterval(updateCountdown, 1000);
}

function getEventDateFromConfig() {
    const fallback = new Date('November 21, 2026 15:00:00').getTime();
    const dateParts = String(SiteConfig.pareja.fecha || '').split('-');
    if (dateParts.length !== 3) return fallback;

    const day = Number(dateParts[0]);
    const month = Number(dateParts[1]);
    const year = Number(dateParts[2]);

    if (!Number.isFinite(day) || !Number.isFinite(month) || !Number.isFinite(year)) {
        return fallback;
    }

    let hour = 15;
    let minute = 0;
    const hourMatch = String(SiteConfig.evento.ceremonia.hora || '').match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (hourMatch) {
        const rawHour = Number(hourMatch[1]);
        minute = Number(hourMatch[2]);
        const period = hourMatch[3].toUpperCase();
        hour = rawHour % 12;
        if (period === 'PM') hour += 12;
    }

    return new Date(year, month - 1, day, hour, minute, 0).getTime();
}

function initAutoGallery() {
    const section = document.getElementById('gallery-auto');
    if (!section) return;

    const slides = Array.from(section.querySelectorAll('.gallery-auto-slide'));
    if (slides.length === 0) return;

    let currentIndex = Math.max(0, slides.findIndex(slide => slide.classList.contains('is-active')));
    if (currentIndex < 0 || currentIndex >= slides.length) currentIndex = 0;

    const intervalMs = 4000;
    let timerId = null;

    function render(index) {
        slides.forEach((slide, slideIndex) => {
            slide.classList.toggle('is-active', slideIndex === index);
        });
    }

    function goTo(index) {
        currentIndex = (index + slides.length) % slides.length;
        render(currentIndex);
    }

    function next() {
        goTo(currentIndex + 1);
    }

    function startAutoplay() {
        stopAutoplay();
        timerId = window.setInterval(next, intervalMs);
    }

    function stopAutoplay() {
        if (timerId) {
            window.clearInterval(timerId);
            timerId = null;
        }
    }

    section.addEventListener('mouseenter', stopAutoplay);
    section.addEventListener('mouseleave', startAutoplay);

    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            stopAutoplay();
        } else {
            startAutoplay();
        }
    });

    render(currentIndex);
    startAutoplay();
}

function initRSVP() {
    const form = document.getElementById('rsvp-form');
    const successMessage = document.getElementById('rsvp-success');
    const finalMessage = document.getElementById('rsvp-final-message');
    const introMessage = document.querySelector('#rsvp-section .rsvp-intro');
    const submitBtn = document.getElementById('rsvp-submit');
    const responseYes = document.getElementById('rsvp-response-yes');
    const responseNo = document.getElementById('rsvp-response-no');
    const guestCountWrapper = document.getElementById('guest-count-wrapper');
    const guestCountSelect = document.getElementById('guest-count');
    const confirmationMessages = {
        si: 'Gracias por confirmar tu asistencia. Te vemos pronto.',
        no: 'Lamentamos que no puedas acompañarnos, te extrañaremos.'
    };
    const activeEventId = String(window.currentEventId || '').trim();
    let formLocked = false;
    let isCheckingStatus = false;
    let popupTimer = null;
    const defaultIntroText = introMessage ? introMessage.textContent : '';
    const confirmedIntroText = 'Gracias por haber completado el formulario de asistencia.';
    
    if (!form) return;

    function getSelectedResponse() {
        if (responseYes && responseYes.checked) return 'si';
        if (responseNo && responseNo.checked) return 'no';
        return '';
    }

    function showPopup(message, isError = false) {
        let overlay = document.getElementById('rsvp-popup-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'rsvp-popup-overlay';
            overlay.className = 'rsvp-popup-overlay';
            overlay.innerHTML = [
                '<div class="rsvp-popup" role="status" aria-live="polite">',
                '<p class="rsvp-popup-message"></p>',
                '<button type="button" class="rsvp-popup-close" aria-label="Cerrar mensaje">Aceptar</button>',
                '</div>'
            ].join('');
            document.body.appendChild(overlay);

            const closeBtn = overlay.querySelector('.rsvp-popup-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', function() {
                    overlay.classList.remove('active');
                });
            }

            overlay.addEventListener('click', function(event) {
                if (event.target === overlay) {
                    overlay.classList.remove('active');
                }
            });
        }

        const popup = overlay.querySelector('.rsvp-popup');
        const messageEl = overlay.querySelector('.rsvp-popup-message');
        if (messageEl) {
            messageEl.textContent = message;
        }
        if (popup) {
            popup.classList.toggle('is-error', Boolean(isError));
        }

        overlay.classList.add('active');
        if (popupTimer) clearTimeout(popupTimer);
        popupTimer = setTimeout(function() {
            overlay.classList.remove('active');
        }, 3600);
    }

    function setConfirmedFormVisibility(confirmed) {
        form.hidden = confirmed;
        form.setAttribute('aria-hidden', confirmed ? 'true' : 'false');
        form.style.display = confirmed ? 'none' : '';
    }

    function setIntroMessageForConfirmed(confirmed) {
        if (!introMessage) return;
        introMessage.textContent = confirmed ? confirmedIntroText : defaultIntroText;
    }

    function setFormLocked(locked) {
        formLocked = locked;
        form.classList.toggle('is-locked', locked);

        const controls = form.querySelectorAll('input, select, textarea, button');
        controls.forEach(function(control) {
            if (control.id === 'rsvp-name') {
                control.readOnly = true;
                control.disabled = locked;
                return;
            }
            control.disabled = locked;
        });

        if (submitBtn) {
            submitBtn.disabled = locked;
            submitBtn.style.display = locked ? 'none' : '';
        }
    }

    function toggleGuestCountField() {
        if (!guestCountWrapper || !guestCountSelect) return;

        const shouldShow = Boolean(responseYes && responseYes.checked);
        guestCountWrapper.style.display = shouldShow ? 'block' : 'none';
        guestCountSelect.disabled = !shouldShow || formLocked;
        guestCountSelect.required = shouldShow && !formLocked;

        if (!shouldShow) {
            const firstOption = guestCountSelect.options[0];
            if (firstOption) guestCountSelect.value = firstOption.value;
        }
    }

    function showPermanentMessage(respuesta) {
        const message = confirmationMessages[respuesta] || confirmationMessages.no;
        if (finalMessage) {
            finalMessage.textContent = message;
        }
        if (successMessage) {
            successMessage.style.display = 'block';
        }
    }

    function applyConfirmedState(record) {
        const respuesta = String(record && record.respuesta || '').toLowerCase() === 'si' ? 'si' : 'no';
        const confirmedCount = Math.max(0, Number(record && record.cantidadConfirmada) || 0);

        if (responseYes) responseYes.checked = respuesta === 'si';
        if (responseNo) responseNo.checked = respuesta === 'no';

        if (guestCountSelect && respuesta === 'si') {
            const fallbackValue = guestCountSelect.options.length > 0 ? guestCountSelect.options[guestCountSelect.options.length - 1].value : '1';
            const desiredValue = confirmedCount > 0 ? String(confirmedCount) : fallbackValue;
            const hasDesiredOption = Array.from(guestCountSelect.options).some(function(option) {
                return option.value === desiredValue;
            });
            const safeValue = hasDesiredOption ? desiredValue : fallbackValue;
            guestCountSelect.value = safeValue;
        }

        toggleGuestCountField();
        showPermanentMessage(respuesta);
        setFormLocked(true);
        setConfirmedFormVisibility(true);
        setIntroMessageForConfirmed(true);
    }

    async function getExistingConfirmation(guestId) {
        const rsvpDB = window.RSVPDatabase;
        if (!rsvpDB || typeof rsvpDB.getConfirmationByGuestId !== 'function') return null;
        return rsvpDB.getConfirmationByGuestId(activeEventId, guestId);
    }

    async function saveConfirmation(payload) {
        const rsvpDB = window.RSVPDatabase;
        if (!rsvpDB || typeof rsvpDB.saveConfirmation !== 'function') {
            throw new Error('RSVPDatabase no disponible');
        }
        return rsvpDB.saveConfirmation(activeEventId, payload);
    }

    if (responseYes) {
        responseYes.addEventListener('change', toggleGuestCountField);
    }
    if (responseNo) {
        responseNo.addEventListener('change', toggleGuestCountField);
    }

    toggleGuestCountField();

    const guestData = InvitadoApp.getData() || {};
    const guestId = String(guestData.id || 'default');

    async function checkConfirmedStatusOnLoad() {
        isCheckingStatus = true;
        if (submitBtn) submitBtn.disabled = true;

        try {
            const existing = await getExistingConfirmation(guestId);
            if (existing && existing.confirmado) {
                applyConfirmedState(existing);
            } else if (submitBtn && !formLocked) {
                submitBtn.disabled = false;
            }
        } catch (error) {
            console.error('No se pudo verificar estado RSVP:', error);
            if (submitBtn && !formLocked) submitBtn.disabled = false;
        } finally {
            isCheckingStatus = false;
        }
    }

    checkConfirmedStatusOnLoad();
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        if (formLocked) return;

        if (isCheckingStatus) {
            showPopup('Estamos validando tu estado de confirmación. Intenta de nuevo en un momento.', true);
            return;
        }

        toggleGuestCountField();

        const respuesta = getSelectedResponse();
        if (!respuesta) {
            showPopup('Por favor selecciona si asistirás.', true);
            return;
        }

        if (respuesta === 'si') {
            const selectedCount = guestCountSelect ? String(guestCountSelect.value || '').trim() : '';
            const requestedCount = Number(selectedCount);
            const maxAllowedCount = Math.max(1, Number(guestData.pases) || 1);
            const isValidCount = selectedCount
                && Number.isInteger(requestedCount)
                && requestedCount >= 1
                && requestedCount <= maxAllowedCount;

            if (!isValidCount) {
                showPopup('Selecciona la cantidad de invitados para confirmar.', true);
                return;
            }
        }

        const confirmedCount = respuesta === 'si'
            ? Math.max(1, Number(guestCountSelect && guestCountSelect.value) || 0)
            : 0;

        const payload = {
            id: guestId,
            nombre: String(guestData.nombre || ''),
            pasesAsignados: Math.max(1, Number(guestData.pases) || 1),
            respuesta,
            cantidadConfirmada: confirmedCount,
            confirmado: true,
            fechaConfirmacion: Date.now()
        };

        if (submitBtn) submitBtn.disabled = true;
        
        try {
            const savedRecord = await saveConfirmation(payload);
            applyConfirmedState(savedRecord);
            showPopup(confirmationMessages[respuesta]);
        } catch (error) {
            if (error && error.code === 'RSVP_ALREADY_CONFIRMED') {
                const existingRecord = (error.existingData && error.existingData.confirmado)
                    ? error.existingData
                    : await getExistingConfirmation(guestId);

                if (existingRecord && existingRecord.confirmado) {
                    applyConfirmedState(existingRecord);
                    const existingResponse = String(existingRecord.respuesta || '').toLowerCase() === 'si' ? 'si' : 'no';
                    showPopup(confirmationMessages[existingResponse]);
                    return;
                }
            }

            console.error('Error al guardar RSVP:', error);
            if (submitBtn && !formLocked) submitBtn.disabled = false;
            showPopup('No pudimos guardar tu confirmación. Intenta nuevamente.', true);
        }
    });
}

function initGiftModal() {
    const openBtn = document.getElementById('btn-account-modal');
    const modal = document.getElementById('gift-modal');
    const closeBtn = document.getElementById('gift-modal-close');
    const copyBtn = document.getElementById('btn-copy-account');
    const feedbackEl = document.getElementById('gift-copy-feedback');
    const dataEl = document.getElementById('gift-account-data');

    if (!openBtn || !modal || !closeBtn || !copyBtn || !dataEl) return;

    function openModal() {
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    async function copyAccountData() {
        const data = dataEl.innerText.trim();
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(data);
            } else {
                const textarea = document.createElement('textarea');
                textarea.value = data;
                textarea.setAttribute('readonly', '');
                textarea.style.position = 'absolute';
                textarea.style.left = '-9999px';
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
            }
            if (feedbackEl) feedbackEl.textContent = 'Datos copiados al portapapeles.';
        } catch {
            if (feedbackEl) feedbackEl.textContent = 'No se pudo copiar. Intenta de nuevo.';
        }
    }

    openBtn.addEventListener('click', openModal);
    closeBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', function(event) {
        if (event.target.dataset.modalClose === 'true') {
            closeModal();
        }
    });

    copyBtn.addEventListener('click', copyAccountData);

    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
}
