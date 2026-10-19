// Light is the default; only an explicit saved dark preference changes it.
(()=>{let theme='light';try{if(localStorage.getItem('finora-appearance')==='dark')theme='dark';}catch{}document.documentElement.setAttribute('data-theme',theme);document.documentElement.style.colorScheme=theme;})();
