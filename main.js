// ─── CURSOR (pointer:fine only) ───
const cur = document.getElementById('cur');
const cur2 = document.getElementById('cur2');
const sectionDots = document.getElementById('sectionDots');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
if(!finePointer){
  if(cur) cur.style.display='none';
  if(cur2) cur2.style.display='none';
} else if(cur && cur2) {
  let mx=window.innerWidth/2, my=window.innerHeight/2;
  let cx=mx, cy=my, ux=mx, uy=my;
  document.addEventListener('mousemove', e=>{
    mx=e.clientX; my=e.clientY;
    // Hide ring + tip near section dots so they can't read as a phantom slot under 05
    if(sectionDots){
      const r = sectionDots.getBoundingClientRect();
      const pad = 44;
      const near = mx >= r.left - 10 && mx <= r.right + 10
        && my >= r.top - pad && my <= r.bottom + pad;
      cur.classList.toggle('is-near-dots', near);
      cur2.classList.toggle('is-near-dots', near);
    }
  },{passive:true});
  (function animCur(){
    ux+=(mx-ux)*.5; uy+=(my-uy)*.5;
    cur.style.transform=`translate(${ux}px,${uy}px) translate(-50%,-50%)`;
    cx+=(mx-cx)*.15; cy+=(my-cy)*.15;
    cur2.style.transform=`translate(${cx}px,${cy}px) translate(-50%,-50%)`;
    requestAnimationFrame(animCur);
  })();
}

// ─── PROGRESS ───
const prog = document.getElementById('prog');
if(prog){
  let progTicking = false;
  window.addEventListener('scroll',()=>{
    if(progTicking) return;
    progTicking = true;
    requestAnimationFrame(()=>{
      const max = document.body.scrollHeight - innerHeight;
      prog.style.width = (max > 0 ? scrollY / max * 100 : 0) + '%';
      progTicking = false;
    });
  },{passive:true});
}

// ─── MOBILE MENU ───
const navToggle = document.getElementById('navToggle');
const mobileMenu = document.getElementById('mobileMenu');
function setMenu(open){
  if(!navToggle) return;
  document.body.classList.toggle('menu-open', open);
  navToggle.setAttribute('aria-expanded', open);
}
if(navToggle && mobileMenu){
  navToggle.addEventListener('click', ()=>setMenu(!document.body.classList.contains('menu-open')));
  mobileMenu.querySelectorAll('a').forEach(a=>a.addEventListener('click', ()=>setMenu(false)));
}

// ─── CAMPUS ZONE JUMPS ───
document.querySelectorAll('[data-jump]').forEach((el) => {
  el.addEventListener('click', (e) => {
    e.preventDefault();
    if(typeof window.campusJumpTo === 'function'){
      window.campusJumpTo(el.dataset.jump);
    }
    setMenu(false);
  });
});

// ─── SELECTED WORK DETAIL PANEL ───
(function initProjectDetailPanel(){
  const projects = {
    golazo: {
      title: 'Golazo AI',
      kicker: 'Mobile App · 2025',
      icon: 'images/icons/golazo.webp',
      copy: '<div class="proj-section"><div class="proj-section-label">Problem</div><p>Young football players had no structured way to record drills, get feedback on their technique, or track how they were improving over time.</p></div><div class="proj-section"><div class="proj-section-label">How we solved it</div><p>We built a mobile app where players record training sessions and get technique scores, with progress tracked over sessions. The app is live on iOS and Android with thousands of active users.</p></div><div class="proj-section"><div class="proj-section-label">My contribution</div><p>Client project alongside one other developer who owned the backend and ML. I <strong>owned the mobile app end to end</strong> — all API integrations, the video player, and when the design called for a text style React Native doesn\'t support natively, I built the component myself and published it as open source on npm.</p></div>',
      image: {
        src: 'images/golazo.webp',
        alt: 'Golazo AI, football training app on the App Store',
        width: 640,
        height: 360
      },
      tags: ['React Native', 'iOS', 'Android', 'npm'],
      links: [
        {
          href: 'https://golazo.ai',
          label: 'golazo.ai',
          favicon: 'https://golazo.ai/apple-touch-icon.png'
        }
      ]
    },
    'outlined-text': {
      title: 'react-native-outlined-text',
      kicker: 'Open Source · npm · 2025',
      icon: 'images/icons/npm.webp',
      copy: '<div class="proj-section"><div class="proj-section-label">Problem</div><p>React Native has no native support for outlined text. Getting it to work properly across iOS and Android requires platform-specific workarounds, and nothing reliable existed in the community at the time.</p></div><div class="proj-section"><div class="proj-section-label">How we solved it</div><p>I built a React Native component that handles outlined text cross-platform without native modules. It came out of a real requirement in Golazo AI. <strong>Once it worked well, I extracted it into its own package and published it to npm.</strong></p></div><div class="proj-section"><div class="proj-section-label">My contribution</div><p>Sole author. Designed, built, and published the package.</p></div>',
      image: {
        src: 'images/outlined-text.webp',
        alt: 'react-native-outlined-text npm package page',
        width: 640,
        height: 373
      },
      tags: ['React Native', 'TypeScript', 'npm'],
      links: [
        {
          href: 'https://www.npmjs.com/package/@donkasun/react-native-outlined-text',
          label: 'npm package',
          favicon: 'images/npm.svg'
        }
      ]
    },
    byob: {
      title: 'BYOBSL',
      kicker: 'Local Directory · 2025',
      icon: 'images/icons/byob.webp',
      copy: '<div class="proj-section"><div class="proj-section-label">Problem</div><p>Sri Lanka has quite a few restaurants that let you bring your own alcohol, but there was no central place to find them or check corkage policies before heading out.</p></div><div class="proj-section"><div class="proj-section-label">How we solved it</div><p>My brother came up with the idea and did the initial design and early development. I took over and <strong>ported the whole thing from an AI coding platform to a proper standalone codebase</strong>, worked on scaling and performance, built new features, and rebuilt the admin panel with AI integrations. I still keep it running today.</p></div><div class="proj-section"><div class="proj-section-label">My contribution</div><p>Took ownership after the initial prototype. Full port to production, scaling work, new feature development, and admin panel rebuild with AI integrations.</p></div>',
      image: {
        src: 'images/byobsl.webp',
        alt: 'BYOB Sri Lanka, directory of BYOB restaurants in Colombo and across Sri Lanka',
        width: 640,
        height: 360
      },
      tags: ['Next.js', 'React', 'Supabase', 'Node.js'],
      links: [
        {
          href: 'https://byobsl.com',
          label: 'byobsl.com',
          favicon: 'https://www.byobsl.com/apple-touch-icon.png'
        }
      ]
    },
    ollamadock: {
      title: 'OllamaDock',
      kicker: 'macOS Menu Bar App · 2025',
      icon: 'images/icons/github.webp',
      copy: '<div class="proj-section"><div class="proj-section-label">Problem</div><p>Once an Ollama model is running, there\'s no easy way to see what\'s loaded in your GPU memory without opening a terminal. The official menu bar icon doesn\'t show this. Chat apps are built for conversations, not for monitoring what\'s actually running.</p></div><div class="proj-section"><div class="proj-section-label">How we solved it</div><p>I built a <strong>native macOS menu bar app</strong> that sits quietly and shows you at a glance. A green dot means something is running. Open the popover and you can see each model, how much memory it\'s using, and a countdown to when Ollama will unload it. You can load a model, stop one, or launch Ollama itself — no terminal needed.</p></div><div class="proj-section"><div class="proj-section-label">My contribution</div><p>Sole author. Built everything from scratch — UI, API integration, state management, and release packaging.</p></div>',
      image: {
        src: 'images/ollamadock.webp',
        alt: 'OllamaDock macOS menu bar app showing loaded Ollama models',
        width: 640,
        height: 480
      },
      tags: ['Swift', 'SwiftUI', 'macOS', 'XcodeGen'],
      links: [
        {
          href: 'https://github.com/donkasun/ollamadock',
          label: 'GitHub',
          favicon: null
        }
      ]
    },
    lumina: {
      title: 'Lumina Smart',
      kicker: 'Personal Project · React Native · 2025',
      icon: 'images/icons/github.webp',
      copy: '<div class="proj-section"><div class="proj-section-label">Problem</div><p>I wanted to see how far I could push React Native for complex UI work without the usual product constraints getting in the way — custom animations, gesture-driven controls, a design system that holds together across screens.</p></div><div class="proj-section"><div class="proj-section-label">How we solved it</div><p>I built a <strong>fully working smart home concept app</strong> covering lights, thermostat, locks, cameras, doorbell, solar, vacuum, purifier, and sprinklers — each with its own custom controls. Neumorphic and glassmorphic design system built from scratch with light and dark mode. Custom SVG components like the thermostat dial, colour temperature slider, and colour picker are all hand-built with no third-party UI libraries. There\'s also a music player that keeps playing in silent mode.</p></div><div class="proj-section"><div class="proj-section-label">My contribution</div><p>Sole author. Built everything from the design system through to every screen and component.</p></div>',
      images: [
        { src: 'images/lumina_Home.webp', alt: 'Lumina Smart — home screen', width: 390, height: 845 },
        { src: 'images/lumina_bulb.webp', alt: 'Lumina Smart — smart bulb control', width: 390, height: 845 },
        { src: 'images/lumina_thermostat.webp', alt: 'Lumina Smart — thermostat control', width: 390, height: 845 }
      ],
      tags: ['React Native', 'Expo', 'TypeScript', 'Zustand', 'Reanimated', 'Gesture Handler', 'SVG'],
      links: [
        {
          href: 'https://github.com/donkasun/lumina-smart',
          label: 'GitHub',
          favicon: null
        }
      ]
    },
    pdf: {
      title: 'PDF Intelligence POC',
      kicker: 'Research Tool · 2025',
      icon: 'images/icons/gcloud.webp',
      copy: '<div class="proj-section"><div class="proj-section-label">Problem</div><p>A research team needed to build a pipeline that could extract structured data from large PDFs — part of a bigger project, and they needed a proof of concept to validate the approach before going further.</p></div><div class="proj-section"><div class="proj-section-label">How we solved it</div><p>We built the POC and delivered it to the team. The work involved <strong>testing different AI models to find what worked best for their documents</strong>, bringing in computer vision for PDFs with complex layouts, and building a React interface so the team could review and validate the extracted output.</p></div><div class="proj-section"><div class="proj-section-label">My contribution</div><p>Two-person project. I worked on model evaluation, parts of the pipeline, and the React review interface.</p></div>',
      tags: ['Python', 'React', 'Vertex AI', 'AI SDK', 'PDF Parsing', 'Computer Vision'],
      links: []
    }
  };

  const rows = [...document.querySelectorAll('.project-row')];
  const panel = document.querySelector('.project-detail-panel');
  const closeButton = document.querySelector('.project-detail-close');
  const detailTitle = document.querySelector('#project-detail-title');
  const detailKicker = document.querySelector('#project-detail-kicker');
  const detailIcon = document.querySelector('#project-detail-icon');
  const detailCopy = document.querySelector('#project-detail-copy');
  const detailMedia = document.querySelector('#project-detail-media');
  const detailTags = document.querySelector('#project-detail-tags');
  const detailLinks = document.querySelector('#project-detail-links');

  if(!rows.length || !panel || !closeButton || !detailTitle || !detailKicker || !detailCopy || !detailMedia || !detailTags || !detailLinks){
    return;
  }

  let activeRow = null;
  let pendingRow = null;
  let panelState = 'closed';
  let cancelTransitionWait = () => {};
  let restoreFocusOnClose = false;

  let carouselTimer = null;

  function stopCarousel(){
    if(carouselTimer) { clearInterval(carouselTimer); carouselTimer = null; }
  }

  function startCarousel(strip, count){
    if(window.matchMedia('(prefers-reduced-motion:reduce)').matches) return;
    let index = 0;
    const advance = () => {
      index = (index + 1) % count;
      strip.style.transform = `translateX(calc(-${index} * 100%))`;
    };
    carouselTimer = setInterval(advance, 2800);
  }

  function setExpandedRow(row){
    rows.forEach((item) => item.setAttribute('aria-expanded', String(item === row)));
  }

  function renderProject(row){
    const project = projects[row.dataset.project];
    if(!project) return;

    detailTitle.textContent = project.title;
    detailKicker.textContent = project.kicker;
    if(detailIcon && project.icon){
      detailIcon.src = project.icon;
      detailIcon.hidden = false;
    } else if(detailIcon){
      detailIcon.hidden = true;
    }
    detailCopy.innerHTML = project.copy;

    stopCarousel();
    if(project.images){
      const strip = document.createElement('div');
      strip.className = 'carousel-strip';
      project.images.forEach((imgData) => {
        const img = document.createElement('img');
        img.src = imgData.src;
        img.alt = imgData.alt;
        img.width = imgData.width;
        img.height = imgData.height;
        img.loading = 'lazy';
        strip.appendChild(img);
      });
      detailMedia.replaceChildren(strip);
      detailMedia.classList.add('project-detail-media--carousel');
      detailMedia.hidden = false;
      startCarousel(strip, project.images.length);
    } else if(project.image){
      const img = document.createElement('img');
      img.src = project.image.src;
      img.alt = project.image.alt;
      img.width = project.image.width;
      img.height = project.image.height;
      img.loading = 'lazy';
      detailMedia.replaceChildren(img);
      detailMedia.classList.remove('project-detail-media--carousel');
      detailMedia.hidden = false;
    } else {
      detailMedia.replaceChildren();
      detailMedia.classList.remove('project-detail-media--carousel');
      detailMedia.hidden = true;
    }

    detailTags.replaceChildren(
      ...project.tags.map((tag) => {
        const item = document.createElement('span');
        item.className = 'proj-pill';
        item.textContent = tag;
        return item;
      })
    );

    detailLinks.replaceChildren(
      ...project.links.map((link) => {
        const anchor = document.createElement('a');
        anchor.href = link.href;
        anchor.target = '_blank';
        anchor.rel = 'noopener noreferrer';
        anchor.className = 'proj-link';

        if(link.favicon){
          const favicon = document.createElement('img');
          favicon.className = 'proj-favicon';
          favicon.src = link.favicon;
          favicon.alt = '';
          favicon.loading = 'lazy';
          favicon.width = 16;
          favicon.height = 16;
          anchor.appendChild(favicon);
        }

        anchor.appendChild(document.createTextNode(link.label));
        return anchor;
      })
    );
  }

  function waitForPanelTransition(callback){
    cancelTransitionWait();

    let finished = false;
    const styles = getComputedStyle(panel);
    const toMilliseconds = (value) =>
      value.trim().endsWith('ms') ? parseFloat(value) : parseFloat(value) * 1000;
    const durations = styles.transitionDuration.split(',').map(toMilliseconds);
    const delays = styles.transitionDelay.split(',').map(toMilliseconds);
    const fallbackDelay = Math.max(
      0,
      ...durations.map((duration, index) => duration + (delays[index] ?? delays[0] ?? 0))
    ) + 50;

    function finish(){
      if(finished) return;
      finished = true;
      panel.removeEventListener('transitionend', onTransitionEnd);
      clearTimeout(timer);
      cancelTransitionWait = () => {};
      callback();
    }

    function onTransitionEnd(event){
      if(event.target === panel && event.propertyName === 'transform') finish();
    }

    const timer = setTimeout(finish, fallbackDelay);
    panel.addEventListener('transitionend', onTransitionEnd);
    cancelTransitionWait = () => {
      finished = true;
      panel.removeEventListener('transitionend', onTransitionEnd);
      clearTimeout(timer);
    };
  }

  function showProject(row){
    renderProject(row);
    activeRow = row;
    setExpandedRow(row);
    panelState = 'opening';
    panel.classList.add('is-open');
    panel.setAttribute('aria-hidden', 'false');
    closeButton.focus({ preventScroll: true });
    waitForPanelTransition(() => {
      if(panelState === 'opening') panelState = 'open';
    });
  }

  function hideProject({ restoreFocus = false } = {}){
    if(panelState === 'closed' || panelState === 'closing') return;
    stopCarousel();
    const focusTarget = activeRow;
    restoreFocusOnClose = restoreFocus;
    panelState = 'closing';

    if(document.activeElement && panel.contains(document.activeElement)){
      if(restoreFocus && focusTarget){
        focusTarget.focus({ preventScroll: true });
        restoreFocusOnClose = false;
      } else {
        document.activeElement.blur();
      }
    }

    panel.classList.remove('is-open');
    panel.setAttribute('aria-hidden', 'true');
    setExpandedRow(null);

    waitForPanelTransition(() => {
      panelState = 'closed';
      activeRow = null;

      if(pendingRow){
        const nextRow = pendingRow;
        pendingRow = null;
        showProject(nextRow);
      } else if(restoreFocusOnClose && focusTarget){
        focusTarget.focus({ preventScroll: true });
        restoreFocusOnClose = false;
      } else {
        restoreFocusOnClose = false;
      }
    });
  }

  function selectProject(row){
    if(row === activeRow && (panelState === 'open' || panelState === 'opening')) return;

    if(panelState === 'closed'){
      showProject(row);
      return;
    }

    pendingRow = row;
    if(panelState !== 'closing') hideProject();
  }

  function dismissProject({ restoreFocus = true } = {}){
    pendingRow = null;
    if(panelState === 'closing' || panelState === 'closed') return;
    hideProject({ restoreFocus });
  }

  function isOutsideDismissTarget(target){
    if(!(target instanceof Element)) return false;
    if(panel.contains(target)) return false;
    if(target.closest('.project-row')) return false;
    return true;
  }

  rows.forEach((row) => {
    row.addEventListener('click', () => selectProject(row));
  });

  closeButton.addEventListener('click', () => dismissProject());

  document.addEventListener('click', (event) => {
    if(panelState === 'closed' || panelState === 'closing') return;
    if(!isOutsideDismissTarget(event.target)) return;
    dismissProject({ restoreFocus: false });
  });

  document.addEventListener('keydown', (event) => {
    if(event.key === 'Escape') dismissProject();
  });
})();
