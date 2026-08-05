function toggleMenu() {

    const menu = document.querySelector(".menu-content");

    menu.classList.toggle("active");
}

window.addEventListener("load", () => {

    const preloader = document.getElementById("preloader");

    if (!preloader) return;

    setTimeout(() => {

        preloader.style.opacity = "0";

        setTimeout(() => {

            preloader.style.display = "none";

        }, 500);

    }, 1500);

});