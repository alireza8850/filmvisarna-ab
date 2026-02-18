var userBtn = document.getElementById('userBtn');
var hamburgerBtn = document.getElementById('hamburgerBtn');
var mobileMenu = document.getElementById('mobileMenu');
var closeBtn = document.getElementById('closeMenu');
var signupBtn = document.getElementById('signupBtn');
var loginBtn = document.getElementById('loginBtn');
// active för CSS för att visa menyn
function openMenu() {
    if (mobileMenu) {
        mobileMenu.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}
// ta bort active
function closeMenu() {
    if (mobileMenu) {
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
    }
}
// öppna menyn när man klickar på hamburger ikonen
if (hamburgerBtn) {
    hamburgerBtn.addEventListener('click', openMenu);
}
// stäng menyn när man klicka på X
if (closeBtn) {
    closeBtn.addEventListener('click', closeMenu);
}
