function hideOverlay() {
    const overlay = document.querySelector('.overlay');
    overlay.style.display = 'none';
}

let lastScrollPosition = 0;


function resetOverlay(){
    const overlay = document.getElementById('overlay-main-content');
    overlay.innerHTML = '';
    const overlayNav = document.querySelectorAll('#overlay-nav-items > li');
    overlayNav.forEach(n => n.remove());
}

function showOverlay(contentUrl) {
    history.pushState({ overlayOpen: true }, 'Overlay Open');
    lastScrollPosition = window.scrollY;
    document.body.style.top = `-${lastScrollPosition}px`;
    document.body.style.position = 'fixed';

    const overlay = document.getElementById('overlay');
    overlay.style.display = 'flex';

    const overlayContent = document.getElementById('overlay-main-content');
    overlayContent.innerHTML = '<span class = "overlay-loading" aria-busy="true">Loading...</span>';

    fetch(contentUrl)
        .then(response => response.text())
        .then(html => {
            overlayContent.innerHTML = html;
            var overlayNav = document.getElementById('overlay-nav-items');
            if(overlayNav != null){
                overlayNav.innerHTML = '';
                var navTemplate = document.getElementById('nav-template');
                if(navTemplate != null){
                    overlayNav.appendChild(navTemplate.content.cloneNode(true));
                    var evt = new Event("NavInserted", {"bubbles":true, "cancelable":false});
                    document.dispatchEvent(evt);
                    navTemplate.remove();
                }
            }
        });
}


window.addEventListener('popstate', function(event) {
      closeOverlay();
  });

function closeOverlay() {
    document.body.style.position = '';
    document.body.style.top = '';
    window.scrollTo(0, lastScrollPosition);
    if (history.state && history.state.overlayOpen) {
        history.back();
    }
    const overlay = document.getElementById('overlay');
    overlay.style.display = 'none';
}

function openLink(url){
    window.open(url)
}

document.addEventListener('NavInserted', function () {
    const navLinks = document.querySelectorAll('.overlay-nav > aside > nav >details > ul > li a');
    const overlay = document.querySelector('#overlay-main-content');

    let currentLink = null;
    let isScrolling = false;

    function updateAriaCurrent(link) {
        if (currentLink) {
            currentLink.removeAttribute('aria-current');
        }
        link.setAttribute('aria-current', 'page');
        currentLink = link;
    }

    navLinks.forEach(link => {
        link.addEventListener('click', function (event) {
            clearTimeout(link);
            event.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                updateAriaCurrent(link);

                isScrolling = true;
                targetElement.scrollIntoView({ behavior: 'smooth' });

                setTimeout(() => {
                    isScrolling = false;
                }, 600);
            }
        });
    });

    function onScroll() {
        if (isScrolling) return;

        const fromTop = overlay.scrollTop + (overlay.clientHeight / 2);
        let currentSection = null;
        navLinks.forEach(link => {
            const section = document.querySelector(link.getAttribute('href'));
            if(section != null){
                const sectionTop = section.offsetTop;
                if (fromTop >= sectionTop) {
                    currentSection = link;
                }else if(overlay.scrollTop + window.innerHeight >= overlay.scrollHeight){
                    currentSection = link;
                }
            } 
        });

        if (currentSection) {
            updateAriaCurrent(currentSection);
        }
    }

    overlay.addEventListener('scroll', onScroll);

    onScroll();
});


function registerClickEvents(){
    const divs = document.querySelectorAll('.grid-item');
    divs.forEach(div => div.addEventListener('click',event =>{
        if(event.target.getAttribute('btn-github') == null){
            const project = event.target.offsetParent.getAttribute('project');
            if(project != null){
                showOverlay(`/project-htmls/${project}.html`)
            }
        }
    }));
}

registerClickEvents();


