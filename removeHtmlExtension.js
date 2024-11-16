if (window.location.href.endsWith('.html')) {
    const currentURL = window.location.href;
    const cleanURL = currentURL.replace(/\.html$/, '');
    window.history.replaceState({}, '', cleanURL);
}
