(function () {
    function injectStyles() {
        if (document.getElementById('animations-global-style')) return;

        var style = document.createElement('style');
        style.id = 'animations-global-style';
        style.textContent = [
            '@keyframes fadeUpSoft { from { opacity: 0; transform: translate3d(0, 14px, 0); } to { opacity: 1; transform: translate3d(0, 0, 0); } }',
            '@keyframes floatRomantic { 0%,100% { transform: translate3d(0,0,0); } 50% { transform: translate3d(0,-6px,0); } }',
            '@keyframes floatTiltLeft { 0%,100% { transform: rotate(-11deg) translate3d(0,0,0); } 50% { transform: rotate(-11deg) translate3d(0,-6px,0); } }',
            '@keyframes glowSoft { 0%,100% { box-shadow: 0 8px 18px rgba(120, 42, 73, 0.24); } 50% { box-shadow: 0 12px 24px rgba(120, 42, 73, 0.34); } }',

            '.anim-reveal { opacity: 0; transform: translate3d(0,14px,0); }',
            '.anim-reveal.is-visible { animation: fadeUpSoft 0.75s cubic-bezier(0.22,1,0.36,1) forwards; animation-delay: var(--reveal-delay, 0s); }',
            '.anim-float { animation: floatRomantic 5.6s ease-in-out infinite; }',
            '#music-bubble-global, #home-bubble-global { animation: glowSoft 2.8s ease-in-out infinite; }',
            '#music-bubble-global:hover, #home-bubble-global:hover { transform: translateY(-2px) scale(1.02); }',
            '.gallery-item img, .hero-polaroid, .hero-polaroid-2 { transition: transform 0.45s cubic-bezier(0.22,1,0.36,1); }',
            '.gallery-item:hover img { transform: scale(1.03); }'
        ].join('');

        document.head.appendChild(style);
    }

    function applyReveal() {
        var selectors = [
            'h1', 'h2', 'h3',
            'p',
            'form',
            '.hero-evento-card', '.hero-deseo-semicirculo', '.hero-rsvp-circulo', '.hero-galeria-card',
            '.gallery-item',
            '.site-footer',
            '.btn', '.portada-boton'
        ];
        var nodes = document.querySelectorAll(selectors.join(','));
        nodes.forEach(function (el, index) {
            if (el.classList.contains('anim-reveal')) return;
            el.classList.add('anim-reveal');
            el.style.setProperty('--reveal-delay', String((index % 10) * 0.05) + 's');
        });

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

        document.querySelectorAll('.anim-reveal').forEach(function (el) {
            observer.observe(el);
        });
    }

    function applyFloatToDecoratives() {
        var decoratives = document.querySelectorAll([
            '.hero-corona', '.hero-open-enve', '.hero-mono-rosa', '.hero-mono-rosa-2', '.hero-mono-centro',
            '.rsvp-mono', '.wish-mono', '.gallery-mono', '.mono-final',
            '.intro-mono', '.mono-dress'
        ].join(','));

        decoratives.forEach(function (el, idx) {
            el.classList.add('anim-float');
            el.style.animationDelay = String((idx % 6) * 0.22) + 's';
        });

        var polaroids = document.querySelectorAll('.hero-polaroid, .hero-polaroid-2');
        polaroids.forEach(function (el, idx) {
            el.style.animation = 'floatTiltLeft 5.6s ease-in-out infinite';
            el.style.animationDelay = String((idx % 2) * 0.24) + 's';
        });
    }

    function applySoftParallax() {
        var targets = document.querySelectorAll([
            '.hero-corona', '.hero-open-enve', '.hero-mono-rosa', '.hero-mono-rosa-2', '.hero-mono-centro',
            '.rsvp-mono', '.wish-mono', '.gallery-mono', '.mono-final', '.intro-mono', '.mono-dress'
        ].join(','));

        if (!targets.length) return;

        var maxMove = 3;
        function move(clientX, clientY) {
            var w = window.innerWidth || 1;
            var h = window.innerHeight || 1;
            var nx = ((clientX / w) - 0.5) * 2;
            var ny = ((clientY / h) - 0.5) * 2;

            targets.forEach(function (el, idx) {
                var factor = 0.35 + (idx % 4) * 0.08;
                var tx = (nx * maxMove * factor).toFixed(2);
                var ty = (ny * maxMove * factor).toFixed(2);
                el.style.setProperty('--parallax-x', tx + 'px');
                el.style.setProperty('--parallax-y', ty + 'px');
                if (!el.dataset.parallaxReady) {
                    el.style.transition = (el.style.transition ? el.style.transition + ', ' : '') + 'transform 0.35s ease';
                    el.dataset.parallaxReady = '1';
                }
            });
        }

        window.addEventListener('pointermove', function (event) {
            move(event.clientX, event.clientY);
        }, { passive: true });

        window.addEventListener('deviceorientation', function (event) {
            var x = ((Number(event.gamma) || 0) + 45) / 90;
            var y = ((Number(event.beta) || 0) + 45) / 90;
            move(x * (window.innerWidth || 1), y * (window.innerHeight || 1));
        }, { passive: true });

        targets.forEach(function (el) {
            var baseAnimation = el.style.animation;
            if (baseAnimation && baseAnimation.indexOf('floatTiltLeft') >= 0) return;
            el.style.transform = 'translate3d(var(--parallax-x, 0), var(--parallax-y, 0), 0)';
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        injectStyles();
        applyReveal();
        applyFloatToDecoratives();
        applySoftParallax();
    });
})();
