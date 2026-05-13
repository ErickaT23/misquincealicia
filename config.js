const config = {
    event: {
        defaultEventId: "alicia-2026",
        eventIdParam: "eventId",
        legacyFallback: {
            read: false,
            write: false,
            subscribe: false
        }
    },

    seo: {
        titulo: "Alicia | Quinceañera 2026",
        descripcion: "Quinceañera de Alicia - 5 de Junio 2026",
        autor: "Two Design"
    },

    pareja: {
        nombres: "Alicia",
        fecha: "05-06-2026",
        fechaVisible: "05 · 06 · 2026"
    },

    musica: {
        titulo: "Mi Canción",
        archivo: "audio/nuestra-cancion.mp3"
    },

    evento: {
        ceremonia: {
            titulo: "Misa",
            lugar: "Iglesia De San Isidro Labrador",
            hora: "5:30 PM",
            direccion: "Bv. Acatan, Zona 16, Ciudad de Guatemala.",
            ubicacionUrl: "https://maps.app.goo.gl/4oVkkZG1qH7mi6kLA"
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
        hashtag: "#Alicia2026",
        instagramUrl: "https://instagram.com/thetwodesign",
        facebookUrl: "https://facebook.com/thetwodesign",
        marcaTexto: "Diseño",
        marcaNombre: "Two Design",
        marcaUrl: "https://twodesign.com"
    }
};

window.config = config;
