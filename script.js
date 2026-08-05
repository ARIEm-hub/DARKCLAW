function toggleMenu() {

    const menu = document.querySelector(".menu-content");

    menu.classList.toggle("active");
}


const particles = document.getElementById("particles");


for(let i = 0; i < 40; i++){

    let p=document.createElement("span");

    p.className="particle";


    p.style.left=Math.random()*100+"vw";

    p.style.animationDuration=
    (5+Math.random()*10)+"s";


    p.style.animationDelay=
    Math.random()*5+"s";


    particles.appendChild(p);

}