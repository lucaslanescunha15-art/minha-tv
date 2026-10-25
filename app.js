(function () {
  'use strict';

  /* ---------- CONFIGURAÇÃO DOS ATALHOS ----------
     url:   endereço aberto no navegador da TV
     appId: ID de um app instalado na TV (Tizen), tem prioridade sobre url
            (para listar IDs: tizen.application.getAppsInfo no Tizen Studio)
     Sem url nem appId, o atalho mostra um aviso. */
  var APPS = [
    { nome: 'Vídeos',     url: 'https://www.youtube.com/tv', appId: null,
      icon: '<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M10 9l5 3-5 3z"/>' },
    { nome: 'TV ao vivo', url: null, appId: null,
      icon: '<rect x="3" y="5" width="18" height="12" rx="2"/><path d="M8 21h8M12 17v4"/>' },
    { nome: 'Música',     url: 'https://open.spotify.com', appId: null,
      icon: '<path d="M9 18V5l11-2v13"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5"/>' },
    { nome: 'Jogos',      url: 'https://www.xbox.com/play', appId: null,
      icon: '<rect x="2" y="8" width="20" height="10" rx="5"/><path d="M7 11v4M5 13h4M15.5 12h.01M18 14h.01"/>' },
    { nome: 'Navegador',  url: 'https://www.google.com.br', appId: null,
      icon: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>' },
    { nome: 'Fotos',      url: 'https://photos.google.com', appId: null,
      icon: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="1.8"/><path d="M21 16l-5-5-8 8"/>' },
    { nome: 'Entradas',   url: null, appId: null,
      icon: '<rect x="4" y="8" width="16" height="9" rx="1.5"/><path d="M8 17v3M16 17v3M8 12h8"/>' },
    { nome: 'Ajustes',    url: null, appId: null,
      icon: '<path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/>' }
  ];

  var $ = function (id) { return document.getElementById(id); };
  var stage = $('stage'), appsEl = $('apps'), toastEl = $('toast');
  var tiles = [], current = 0, toastTimer;

  /* ---------- Relógio ---------- */
  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  function tick() {
    var d = new Date(), h = d.getHours();
    $('hh').textContent = pad(h);
    $('mm').textContent = pad(d.getMinutes());
    $('greeting').textContent = h < 5 ? 'Boa madrugada' : h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
    $('date').textContent = d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
    setTimeout(tick, (60 - d.getSeconds()) * 1000 - d.getMilliseconds() + 50);
  }

  /* ---------- Escala para qualquer tela (nativo: 1366x768) ---------- */
  function fit() {
    var s = Math.min(window.innerWidth / 1366, window.innerHeight / 768);
    stage.style.setProperty('--s', s);
  }

  /* ---------- Aplicativos ---------- */
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 2600);
  }

  function launch(i) {
    var app = APPS[i], btn = tiles[i];
    btn.classList.add('press');
    setTimeout(function () { btn.classList.remove('press'); }, 180);

    if (app.appId && window.tizen && tizen.application) {
      tizen.application.launch(app.appId, null, function () {
        toast('Não foi possível abrir ' + app.nome);
      });
    } else if (app.url) {
      setTimeout(function () { window.location.href = app.url; }, 200);
    } else {
      toast('Defina o endereço de “' + app.nome + '” em app.js');
    }
  }

  function focusTile(i, dir) {
    if (i < 0 || i >= tiles.length) {            // limite da lista: pequeno "tranco"
      var b = tiles[current], c = dir < 0 ? 'bump-l' : 'bump-r';
      b.classList.remove('bump-l', 'bump-r');
      void b.offsetWidth;
      b.classList.add(c);
      return;
    }
    current = i;
    tiles[i].focus();
    try { tiles[i].scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' }); } catch (e) {}
  }

  function build() {
    APPS.forEach(function (app, i) {
      var b = document.createElement('button');
      b.className = 'tile';
      b.style.setProperty('--i', i);
      b.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true">' + app.icon + '</svg><span>' + app.nome + '</span>';
      b.addEventListener('click', function () { launch(i); });
      b.addEventListener('mouseenter', function () { if (current !== i) { current = i; b.focus(); } });
      b.addEventListener('animationend', function () { b.classList.remove('bump-l', 'bump-r'); });
      appsEl.appendChild(b);
      tiles.push(b);
    });
  }

  /* ---------- Controle remoto ---------- */
  document.addEventListener('keydown', function (e) {
    switch (e.keyCode) {
      case 37: focusTile(current - 1, -1); break;   // esquerda
      case 39: focusTile(current + 1, 1);  break;   // direita
      case 13: launch(current); break;              // OK / Enter
      case 10009:                                   // Voltar (Samsung Tizen)
        if (window.tizen && tizen.application) { tizen.application.getCurrentApplication().exit(); }
        break;
      case 38: case 40: break;                      // cima/baixo reservados
      default: return;
    }
    e.preventDefault();
  });

  build();
  fit();
  tick();
  window.addEventListener('resize', fit);
  focusTile(0, 1);
})();
