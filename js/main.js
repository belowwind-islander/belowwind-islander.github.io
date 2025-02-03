$(function() {
  const d = new Date();
  const hours = d.getHours();
  // const night = hours >= 19 || hours <= 7; // between 7pm and 7am
  const body = document.querySelector('body');
  const toggle = document.getElementById('toggle');
  const input = document.getElementById('switch');

  // if (night) {
  //   input.checked = true;
  //   body.classList.add('night');
  // }

  toggle.addEventListener('click', function() {
    const isChecked = input.checked;
    if (isChecked) {
      body.classList.remove('night');
    } else {
      body.classList.add('night');
    }
  });

  const introHeight = document.querySelector('.intro').offsetHeight;
  const topButton = document.getElementById('top-button');
  const $topButton = $('#top-button');

  window.addEventListener(
    'scroll',
    function() {
      if (window.scrollY > introHeight) {
        $topButton.fadeIn();
      } else {
        $topButton.fadeOut();
      }
    },
    false
  );

  topButton.addEventListener('click', function() {
    $('html, body').animate({ scrollTop: 0 }, 500);
  });

  const hand = document.querySelector('.emoji.wave-hand');

  function waveOnLoad() {
    hand.classList.add('wave');
    setTimeout(function() {
      hand.classList.remove('wave');
    }, 2000);
  }

  setTimeout(function() {
    waveOnLoad();
  }, 1000);

  hand.addEventListener('mouseover', function() {
    hand.classList.add('wave');
  });

  hand.addEventListener('mouseout', function() {
    hand.classList.remove('wave');
  });

  window.sr = ScrollReveal({
    reset: false,
    duration: 600,
    easing: 'cubic-bezier(.694,0,.335,1)',
    scale: 1,
    viewFactor: 0.3,
  });

  sr.reveal('.background');
  sr.reveal('.skills');
  sr.reveal('.experience', { viewFactor: 0.2 });
  sr.reveal('.other-projects', { viewFactor: 0.05 });
});

// Theme Manager
class ThemeManager {
  constructor() {
    this.switch = document.getElementById('switch');
    this.body = document.body;
    this.init();
  }

  init() {
    this.loadTheme();
    this.switch.addEventListener('change', (e) => this.toggleTheme(e));
  }

  loadTheme() {
    const savedTheme = localStorage.getItem('night-mode');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Priority: Saved preference > System preference > Light mode
    const isNight = savedTheme !== null ? savedTheme === 'true' : prefersDark;
    
    this.body.classList.toggle('night', isNight);
    this.switch.checked = isNight;
    localStorage.setItem('night-mode', isNight);
  }

  toggleTheme(e) {
    const isNight = e.target.checked;
    this.body.classList.toggle('night', isNight);
    localStorage.setItem('night-mode', isNight);
  }
}

// Initialize when DOM loads
document.addEventListener('DOMContentLoaded', () => {
  // Theme Management
  if (document.getElementById('switch')) {
    new ThemeManager();
  }

  // Back Button Animation
  document.querySelectorAll('.back-button').forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      document.body.classList.add('fade-out');
      setTimeout(() => window.location = this.href, 300);
    });
  });

  // Top Button Behavior (Vanilla JS)
  const topButton = document.getElementById('top-button');
  if (topButton) {
    let introHeight = 500;
    const intro = document.querySelector('.intro');
    if (intro) introHeight = intro.offsetHeight;

    window.addEventListener('scroll', () => {
      topButton.style.display = window.scrollY > introHeight ? 'block' : 'none';
    });

    topButton.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Wave Hand Animation (Homepage only)
  if (document.querySelector('.intro')) {
    const hand = document.querySelector('.emoji.wave-hand');
    const wave = () => hand.classList.add('wave');
    const unwave = () => hand.classList.remove('wave');
    
    setTimeout(wave, 1000);
    hand.addEventListener('mouseover', wave);
    hand.addEventListener('mouseout', unwave);
  }
});