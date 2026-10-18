// Run before CSS paints; this never touches business data.
(()=>{let p='system';try{p=localStorage.getItem('finora-appearance')||'system';}catch{}const theme=p==='dark'||p!=='light'&&matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.setAttribute('data-theme',theme);document.documentElement.style.colorScheme=theme;})();
