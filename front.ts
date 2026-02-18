

const userBtn = document.getElementById('userBtn');
const hamburgerBtn = document.getElementById('hamburgerBtn');
const mobileMenu = document.getElementById('mobileMenu');
const closeBtn = document.getElementById('closeMenu');
const signupBtn = document.getElementById('signupBtn');
const loginBtn = document.getElementById('loginBtn');


// active för CSS för att visa menyn
function openMenu(): void{
    if (mobileMenu) {
        mobileMenu.classList.add('active');
        document.body.style.overflow = 'hidden'; 
    }
}
// ta bort active
function closeMenu(): void{
    if (mobileMenu) {
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';    
    }
}


// öppna menyn när man klickar på hamburger ikonen
if (hamburgerBtn)
{
    hamburgerBtn.addEventListener('click', openMenu);
}
// stäng menyn när man klicka på X
if (closeBtn)
{
    closeBtn.addEventListener('click', closeMenu);
}




