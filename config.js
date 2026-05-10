const config = {
    event: {
        defaultEventId: "mariana-lucia-2026",
        eventIdParam: "eventId",
        legacyFallback: {
            read: false,
            write: false,
            subscribe: false
        }
    },

    seo: {
        titulo: "Mariana Lucia | Quinceañera 2026",
        descripcion: "Quinceañera de Mariana Lucia - 14 de Junio 2026",
        autor: "Two Design"
    },

    pareja: {
        nombres: "Alicia",
        fecha: "14-06-2026",
        fechaVisible: "14 · 06 · 2026"
    },

    musica: {
        titulo: "Mi Canción",
        archivo: "audio/nuestra-cancion.mp3"
    },

    evento: {
        ceremonia: {
            titulo: "Ceremonia",
            lugar: "Iglesia de La Merced",
            hora: "3:00 PM",
            direccion: "1a Calle Poniente, Antigua Guatemala",
            ubicacionUrl: "https://maps.app.goo.gl/3ZrcNpw7afgj21q79"
        },
        recepcion: {
            titulo: "Recepción",
            lugar: "Verde Eventos",
            hora: "4:00 PM",
            direccion: "Eventos Verdes, Antigua Guatemala",
            ubicacionUrl: "https://maps.app.goo.gl/Lj7mttDL4H1A392m6"
        }
    },

    textos: {
        mensajeInvitado: "Eres muy especial para mí",
        mensajePases: "Hemos reservado {pases} lugares en su honor"
    },

    footer: {
        hashtag: "#MarianaLucia2026",
        instagramUrl: "https://instagram.com/thetwodesign",
        facebookUrl: "https://facebook.com/thetwodesign",
        marcaTexto: "Diseno",
        marcaNombre: "Two Design",
        marcaUrl: "https://twodesign.com"
    }
};

window.config = config;
