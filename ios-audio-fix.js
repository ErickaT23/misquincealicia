(function () {
    var STORAGE_PLAY = 'inv.music.shouldPlay';
    var AUDIO_ID = 'global-audio-player';
    var TOAST_ID = 'ios-audio-fix-toast';
    var hasBoundGesture = false;

    function shouldPlay() {
        try {
            return window.localStorage.getItem(STORAGE_PLAY) === '1';
        } catch (error) {
            return false;
        }
    }

    function getAudio() {
        return document.getElementById(AUDIO_ID);
    }

    function getToast() {
        return document.getElementById(TOAST_ID);
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
        toast.style.bottom = '20px';
        toast.style.transform = 'translateX(-50%)';
        toast.style.background = 'linear-gradient(135deg, rgba(212,159,167,0.96) 0%, rgba(170,117,127,0.96) 48%, rgba(224,182,190,0.96) 100%)';
        toast.style.border = '1px solid rgba(184, 116, 144, 0.62)';
        toast.style.color = '#fff6f8';
        toast.style.fontFamily = "'Cormorant Garamond', 'Cormorant', serif";
        toast.style.fontSize = '16px';
        toast.style.letterSpacing = '0.02em';
        toast.style.lineHeight = '1.15';
        toast.style.padding = '10px 16px';
        toast.style.borderRadius = '999px';
        toast.style.boxShadow = '0 8px 18px rgba(120, 42, 73, 0.28)';
        toast.style.backdropFilter = 'blur(1px)';
        toast.style.webkitBackdropFilter = 'blur(1px)';
        toast.style.zIndex = '99999';
        toast.style.pointerEvents = 'none';
        toast.style.whiteSpace = 'nowrap';
        document.body.appendChild(toast);
    }

    function tryPlay(audio) {
        if (!audio || !shouldPlay()) return Promise.resolve(false);
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
            tryPlay(audio).finally(function () {
                hideToast();
                cleanup();
            });
        }

        document.addEventListener('touchstart', onGesture, { once: true, passive: true });
        document.addEventListener('click', onGesture, { once: true, passive: true });
    }

    function init() {
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
