function toggleMenu(){

    const menu = document.querySelector(".menu-content");

    if(menu.style.display === "none"){

        menu.style.display = "block";

    }else{

        menu.style.display = "none";

    }

}

// ================= PRELOADER =================

window.onload = function(){

    const preloader = document.getElementById("preloader");

    setTimeout(function(){

        preloader.classList.add("hide");

        setTimeout(function(){

            preloader.remove();

        },800);

    },2000);

}