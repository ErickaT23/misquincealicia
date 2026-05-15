(function () {
    var AUDIO_SRC = 'audio/nuestra-cancion.mp3';
    var STORAGE_PLAY = 'inv.music.shouldPlay';
    var STORAGE_TIME = 'inv.music.currentTime';

    var audio = null;
    var btn = null;
    var homeBtn = null;
    var timerId = null;
    var pendingResumeByGesture = false;

    function bindResumeOnUserGesture() {
        if (pendingResumeByGesture) return;
        pendingResumeByGesture = true;

        function onGesture() {
            document.removeEventListener('pointerdown', onGesture);
            document.removeEventListener('keydown', onGesture);
            document.removeEventListener('touchstart', onGesture);
            pendingResumeByGesture = false;
            if (getShouldPlay()) {
                play();
            }
        }

        document.addEventListener('pointerdown', onGesture, { once: true, passive: true });
        document.addEventListener('keydown', onGesture, { once: true });
        document.addEventListener('touchstart', onGesture, { once: true, passive: true });
    }

    function getShouldPlay() {
        return window.localStorage.getItem(STORAGE_PLAY) === '1';
    }

    function setShouldPlay(value) {
        window.localStorage.setItem(STORAGE_PLAY, value ? '1' : '0');
    }

    function saveCurrentTime() {
        if (!audio) return;
        try {
            window.localStorage.setItem(STORAGE_TIME, String(audio.currentTime || 0));
        } catch (error) {
            console.warn('No se pudo guardar tiempo de musica:', error);
        }
    }

    function restoreCurrentTime() {
        if (!audio) return;
        var raw = window.localStorage.getItem(STORAGE_TIME);
        var sec = Number(raw || 0);
        if (Number.isFinite(sec) && sec > 0) {
            audio.currentTime = sec;
        }
    }

    function updateBtn() {
        if (!btn || !audio) return;
        var playing = !audio.paused;
        btn.innerHTML = playing
            ? '<span style="display:inline-flex;align-items:center;justify-content:center;font-size:0.95rem;line-height:1;">&#10074;&#10074;</span>'
            : '<span style="display:inline-flex;align-items:center;justify-content:center;font-size:1.05rem;line-height:1;">&#9835;</span>';
        btn.setAttribute('aria-label', playing ? 'Pausar musica' : 'Reproducir musica');
    }

    function isCoverVisible() {
        var portada = document.getElementById('portada');
        if (!portada) return false;
        if (portada.classList.contains('abrir')) return false;
        if (portada.style && portada.style.display === 'none') return false;
        return true;
    }

    function getHomeHref() {
        var q = String(window.location.search || '').trim();
        return q ? ('index.html' + q + '#invitacion') : 'index.html#invitacion';
    }

    function refreshVisibility() {
        var hide = isCoverVisible();
        if (btn) btn.style.display = hide ? 'none' : 'inline-flex';
        if (homeBtn) homeBtn.style.display = hide ? 'none' : 'inline-flex';
        if (homeBtn) homeBtn.href = getHomeHref();
    }

    function play() {
        if (!audio) return;
        var p = audio.play();
        if (p && typeof p.then === 'function') {
            p.then(function () {
                setShouldPlay(true);
                updateBtn();
            }).catch(function () {
                updateBtn();
                bindResumeOnUserGesture();
            });
        }
    }

    function pause() {
        if (!audio) return;
        audio.pause();
        setShouldPlay(false);
        saveCurrentTime();
        updateBtn();
    }

    function toggle() {
        if (!audio) return;
        if (audio.paused) {
            setShouldPlay(true);
            play();
            return;
        }
        pause();
    }

    function ensureUI() {
        if (document.getElementById('music-bubble-global')) {
            btn = document.getElementById('music-bubble-global');
            return;
        }

        btn = document.createElement('button');
        btn.id = 'music-bubble-global';
        btn.type = 'button';
        btn.innerHTML = '<span style="display:inline-flex;align-items:center;justify-content:center;font-size:1.05rem;line-height:1;">&#9835;</span>';
        btn.setAttribute('aria-label', 'Reproducir musica');
        btn.style.position = 'fixed';
        btn.style.right = '1rem';
        btn.style.bottom = '1rem';
        btn.style.width = '46px';
        btn.style.height = '46px';
        btn.style.borderRadius = '50%';
        btn.style.border = '1px solid rgba(184, 116, 144, 0.62)';
        btn.style.background = 'linear-gradient(135deg, #d49fa7 0%, #aa757f 48%, #e0b6be 100%)';
        btn.style.color = '#fff6f8';
        btn.style.fontSize = '1.15rem';
        btn.style.fontWeight = '400';
        btn.style.boxShadow = '0 8px 18px rgba(120, 42, 73, 0.28)';
        btn.style.zIndex = '2000';
        btn.style.cursor = 'pointer';
        btn.style.display = 'inline-flex';
        btn.style.alignItems = 'center';
        btn.style.justifyContent = 'center';
        document.body.appendChild(btn);

        homeBtn = document.createElement('a');
        homeBtn.id = 'home-bubble-global';
        homeBtn.href = getHomeHref();
        homeBtn.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" style="display:block"><path d="M3 10.8L12 3l9 7.8v9.2a1 1 0 0 1-1 1h-5.7v-6.4h-4.6V21H4a1 1 0 0 1-1-1z" fill="currentColor"></path></svg>';
        homeBtn.setAttribute('aria-label', 'Volver al home');
        homeBtn.style.position = 'fixed';
        homeBtn.style.right = '1rem';
        homeBtn.style.bottom = '4.4rem';
        homeBtn.style.width = '36px';
        homeBtn.style.height = '36px';
        homeBtn.style.borderRadius = '50%';
        homeBtn.style.display = 'inline-flex';
        homeBtn.style.alignItems = 'center';
        homeBtn.style.justifyContent = 'center';
        homeBtn.style.border = '1px solid rgba(184, 116, 144, 0.62)';
        homeBtn.style.background = 'linear-gradient(135deg, #d49fa7 0%, #aa757f 48%, #e0b6be 100%)';
        homeBtn.style.color = '#fff6f8';
        homeBtn.style.fontSize = '1.05rem';
        homeBtn.style.fontWeight = '400';
        homeBtn.style.boxShadow = '0 8px 16px rgba(120, 42, 73, 0.24)';
        homeBtn.style.zIndex = '2000';
        homeBtn.style.textDecoration = 'none';
        document.body.appendChild(homeBtn);
    }

    function init() {
        audio = document.getElementById('global-audio-player');
        if (!audio) {
            audio = document.createElement('audio');
            audio.id = 'global-audio-player';
            audio.src = AUDIO_SRC;
            audio.loop = true;
            audio.preload = 'auto';
            audio.volume = 0.4;
            document.body.appendChild(audio);
        }

        ensureUI();
        restoreCurrentTime();

        btn.addEventListener('click', toggle);
        if (homeBtn) {
            homeBtn.addEventListener('click', function () {
                saveCurrentTime();
            });
        }
        audio.addEventListener('play', updateBtn);
        audio.addEventListener('pause', updateBtn);

        window.addEventListener('beforeunload', saveCurrentTime);
        window.addEventListener('pagehide', saveCurrentTime);
        window.addEventListener('pageshow', function () {
            if (getShouldPlay() && audio && audio.paused) {
                play();
            }
        });

        if (timerId) window.clearInterval(timerId);
        timerId = window.setInterval(saveCurrentTime, 1500);

        if (getShouldPlay()) {
            play();
        } else {
            updateBtn();
        }

        var portada = document.getElementById('portada');
        if (portada && typeof MutationObserver !== 'undefined') {
            var observer = new MutationObserver(refreshVisibility);
            observer.observe(portada, { attributes: true, attributeFilter: ['class', 'style'] });
        }
        refreshVisibility();

        window.GlobalMusic = {
            play: function () {
                setShouldPlay(true);
                play();
            },
            pause: pause,
            toggle: toggle,
            refreshVisibility: refreshVisibility
        };
    }

    document.addEventListener('DOMContentLoaded', init);
})();
