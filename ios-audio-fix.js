(function () {
    console.log('[ios-audio-fix] script start', {
        path: window.location.pathname,
        search: window.location.search,
        readyState: document.readyState
    });

    var STORAGE_PLAY = 'inv.music.shouldPlay';
    var STORAGE_TIME = 'inv.music.currentTime';
    var AUDIO_ID = 'global-audio-player';
    var TOAST_ID = 'ios-audio-fix-toast';
    var hasBoundGesture = false;
    var hasInterception = false;

    function isIOS() {
        var ua = window.navigator.userAgent || '';
        var platform = window.navigator.platform || '';
        var touchPoints = Number(window.navigator.maxTouchPoints || 0);
        var detected = /iP(ad|hone|od)/i.test(ua) || (platform === 'MacIntel' && touchPoints > 1);
        console.log('[ios-audio-fix] iOS detection', {
            detected: detected,
            platform: platform,
            maxTouchPoints: touchPoints,
            ua: ua
        });
        return detected;
    }

    function shouldPlay() {
        try {
            var value = window.localStorage.getItem(STORAGE_PLAY);
            console.log('[ios-audio-fix] localStorage read', {
                key: STORAGE_PLAY,
                value: value
            });
            return value === '1';
        } catch (error) {
            console.log('[ios-audio-fix] localStorage read error', error);
            return false;
        }
    }

    function getAudio() {
        return document.getElementById(AUDIO_ID);
    }

    function getToast() {
        return document.getElementById(TOAST_ID);
    }

    function isHomePage() {
        var path = String(window.location.pathname || '').toLowerCase();
        return path.endsWith('/index.html') || path.endsWith('/');
    }

    function hideToast() {
        var toast = getToast();
        if (toast && toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }

    function showToast() {
        if (getToast()) return;
        var toast = document.createElement('div');
        toast.id = TOAST_ID;
        toast.textContent = '🎵 Toca para continuar la música';
        toast.style.position = 'fixed';
        toast.style.left = '50%';
        toast.style.bottom = '18px';
        toast.style.transform = 'translate(-50%, 8px)';
        toast.style.background = 'rgba(21, 14, 17, 0.78)';
        toast.style.border = '1px solid rgba(255, 228, 234, 0.24)';
        toast.style.color = '#fff6f8';
        toast.style.fontFamily = "'Cormorant Garamond', 'Cormorant', serif";
        toast.style.fontSize = '17px';
        toast.style.fontStyle = 'italic';
        toast.style.letterSpacing = '0.03em';
        toast.style.lineHeight = '1.15';
        toast.style.padding = '11px 18px';
        toast.style.borderRadius = '999px';
        toast.style.boxShadow = '0 10px 24px rgba(24, 10, 17, 0.34)';
        toast.style.backdropFilter = 'blur(6px)';
        toast.style.webkitBackdropFilter = 'blur(6px)';
        toast.style.zIndex = '99999';
        toast.style.pointerEvents = 'none';
        toast.style.whiteSpace = 'nowrap';
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 320ms ease, transform 320ms ease';
        document.body.appendChild(toast);

        window.requestAnimationFrame(function () {
            toast.style.opacity = '1';
            toast.style.transform = 'translate(-50%, 0)';
        });
    }

    function tryPlay(audio, options) {
        console.log('[ios-audio-fix] tryPlay called', {
            hasAudio: !!audio,
            paused: audio ? audio.paused : null,
            currentTime: audio ? audio.currentTime : null,
            options: options || null
        });
        if (!audio || !shouldPlay()) return Promise.resolve(false);
        var opts = options || {};

        if (opts.resetBeforePlay) {
            try {
                audio.currentTime = 0;
            } catch (error) {
                // Ignore readonly/state errors in some iOS moments.
            }
        }

        var result;
        try {
            result = audio.play();
        } catch (error) {
            return Promise.reject(error);
        }
        if (result && typeof result.then === 'function') {
            return result.then(function () {
                return true;
            });
        }
        return Promise.resolve(true);
    }

    function bindResumeGesture(audio) {
        if (hasBoundGesture) return;
        hasBoundGesture = true;

        function cleanup() {
            document.removeEventListener('touchstart', onGesture);
            document.removeEventListener('click', onGesture);
            hasBoundGesture = false;
        }

        function onGesture() {
            if (!shouldPlay()) {
                hideToast();
                cleanup();
                return;
            }
            tryPlay(audio, { resetBeforePlay: true }).finally(function () {
                hideToast();
                cleanup();
            });
        }

        document.addEventListener('touchstart', onGesture, { once: true, passive: true });
        document.addEventListener('click', onGesture, { once: true, passive: true });
    }

    function persistReturnToHomeIntent() {
        try {
            window.localStorage.setItem(STORAGE_PLAY, '1');
            window.localStorage.setItem(STORAGE_TIME, '0');
        } catch (error) {
            // Ignore storage restrictions.
        }
    }

    function buildHomeUrlFromCurrentContext(targetHref) {
        var search = String(window.location.search || '');
        var hash = '#invitacion';

        if (targetHref) {
            try {
                var parsed = new URL(targetHref, window.location.href);
                if (parsed.hash) {
                    hash = parsed.hash;
                }
            } catch (error) {
                // Keep fallback hash.
            }
        }

        return 'index.html' + search + hash;
    }

    function bindHomeInterception() {
        if (hasInterception || isHomePage()) return;
        hasInterception = true;

        document.addEventListener('click', function (event) {
            var node = event.target;
            if (!node || !node.closest) return;

            var target = node.closest('#btn-back-home, a[href*="index.html"]');
            if (!target) return;

            var href = target.getAttribute('href') || '';
            var isBackButton = target.id === 'btn-back-home';
            var pointsHome = href.indexOf('index.html') !== -1;
            if (!isBackButton && !pointsHome) return;

            persistReturnToHomeIntent();
            event.preventDefault();
            window.location.href = buildHomeUrlFromCurrentContext(href);
        }, true);
    }

    function init() {
        bindHomeInterception();
        if (!shouldPlay()) return;

        var attempts = 0;
        var maxAttempts = 20;
        var intervalId = window.setInterval(function () {
            attempts += 1;
            var audio = getAudio();
            if (!audio) {
                if (attempts >= maxAttempts) {
                    window.clearInterval(intervalId);
                }
                return;
            }

            window.clearInterval(intervalId);
            tryPlay(audio).catch(function () {
                if (!isIOS()) return;
                showToast();
                bindResumeGesture(audio);
            });
        }, 80);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
