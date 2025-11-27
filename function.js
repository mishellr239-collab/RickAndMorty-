//url inicial
function index(){
    fetch("https://rickandmortyapi.com/api/character")
        .then(res => res.json())
        .then(response => {
            console.log(response);        
            let section = document.getElementById("mostrar");
            localStorage.setItem('proximaUrl',response.info.next);
            response.results.forEach(function(dato) {
                //cambiar color de la caja
                let div = document.createElement("div");
                if(dato.status == "Alive"){
                    div.style.backgroundColor = "#F0C419";
                } else if(dato.status == "Dead"){
                    div.style.backgroundColor = "#FF6F61";
                } else if(dato.status == "unknown"){
                    div.style.backgroundColor = "#87CEEB";
                }
                //caja donde va la información
                let img = document.createElement("img");
                let imgFav = document.createElement("img");
                let p = document.createElement("p");
                let specie = document.createElement("p");
                let origen = document.createElement("p");
                let gender = document.createElement("p");
                let divInfoNum = document.createElement("div");
                let idPersonaje = document.createElement("p");
                div.classList.add("personaje");
                divInfoNum.classList.add("favNum");
                img.src = dato.image;
                img.classList.add("imgPersonaje");
                if(esFav(dato.id)){
                    imgFav.src = "./assets/nave2.png"
                }else{
                    imgFav.src = "./assets/nave.png"
                }
                imgFav.classList.add("imgFav");
                p.textContent = dato.name;
                specie.textContent ="Specie: "+ dato.species;
                origen.textContent ="Origin: "+ dato.origin.name;
                gender.textContent ="Gender: "+ dato.gender;
                idPersonaje.textContent = "#" + dato.id;
                idPersonaje.classList.add("idpersonaje");
                divInfoNum.appendChild(idPersonaje);
                divInfoNum.appendChild(imgFav);
                div.appendChild(divInfoNum);
                div.appendChild(img);
                div.appendChild(p);
                div.appendChild(specie);
                div.appendChild(origen);
                div.appendChild(gender);
                section.appendChild(div);
            });
        });
}

//Final de la pantalla
function estaAlFinal() {
    var alturaDocumento = document.documentElement.scrollHeight;
    var alturaVentana = window.innerHeight;
    var posicionScroll = window.scrollY || window.pageYOffset;

    return alturaDocumento <= alturaVentana + posicionScroll;
}


function urlScroll(url){
    fetch(url)
    .then(res => res.json())
    .then(response => {
        console.log(response);        
        let section = document.getElementById("mostrar");
        localStorage.setItem('proximaUrl',response.info.next);
        response.results.forEach(function(dato) {
            //cambiar color de la caja
            let div = document.createElement("div");
            if(dato.status == "Alive"){
                div.style.backgroundColor = "#F0C419";
            } else if(dato.status == "Dead"){
                div.style.backgroundColor = "#FF6F61";
            } else if(dato.status == "unknown"){
                div.style.backgroundColor = "#87CEEB";
            }
            //caja donde va la información
            let img = document.createElement("img");
            let imgFav = document.createElement("img");
            let p = document.createElement("p");
            let specie = document.createElement("p");
            let origen = document.createElement("p");
            let gender = document.createElement("p");
            let divInfoNum = document.createElement("div");
            let idPersonaje = document.createElement("p");
            div.classList.add("personaje");
            divInfoNum.classList.add("favNum");
            img.src = dato.image;
            img.classList.add("imgPersonaje");
            if(esFav(dato.id)){
                imgFav.src = "./assets/nave2.png"
            }else{
                imgFav.src = "./assets/nave.png"
            }
            imgFav.classList.add("imgFav");
            p.textContent = dato.name;
            specie.textContent ="Specie: "+ dato.species;
            origen.textContent ="Origin: "+ dato.origin.name;
            gender.textContent ="Gender: "+ dato.gender;
            idPersonaje.textContent = "#" + dato.id;
            idPersonaje.classList.add("idpersonaje");
            divInfoNum.appendChild(idPersonaje);
            divInfoNum.appendChild(imgFav);
            div.appendChild(divInfoNum);
            div.appendChild(img);
            div.appendChild(p);
            div.appendChild(specie);
            div.appendChild(origen);
            div.appendChild(gender);
            section.appendChild(div);
        });
    });
}


/** esFav */

function esFav(id){
    let valor = false;
    let addFav = JSON.parse(localStorage.getItem('favPersonajes'));
    addFav.forEach(num => {
        if(num == id){
            valor = true;
        }
    });
    return valor;
}

/** URL */

function urlChanges(name, status, gender){
    return "https://rickandmortyapi.com/api/character/?name="+name+"&status="+status+"&gender="+gender;
}



/** IndexFav */

function indexFav(url){
    fetch(url)
    .then(res => res.json())
    .then(response => {
        console.log("datos fav" , response);        
        let section = document.getElementById("mostrar");
        response.forEach(function(dato) {
            //cambiar color de la caja
            let div = document.createElement("div");
            if(dato.status == "Alive"){
                div.style.backgroundColor = "#F0C419";
            } else if(dato.status == "Dead"){
                div.style.backgroundColor = "#FF6F61";
            } else if(dato.status == "unknown"){
                div.style.backgroundColor = "#87CEEB";
            }
            //caja donde va la información
            let img = document.createElement("img");
            let imgFav = document.createElement("img");
            let p = document.createElement("p");
            let specie = document.createElement("p");
            let origen = document.createElement("p");
            let gender = document.createElement("p");
            let divInfoNum = document.createElement("div");
            let idPersonaje = document.createElement("p");
            div.classList.add("personaje");
            divInfoNum.classList.add("favNum");
            img.src = dato.image;
            img.classList.add("imgPersonaje");
            imgFav.src = "./assets/nave2.png"
            imgFav.classList.add("imgFav");
            p.textContent = dato.name;
            specie.textContent ="Specie: "+ dato.species;
            origen.textContent ="Origin: "+ dato.origin.name;
            gender.textContent ="Gender: "+ dato.gender;
            idPersonaje.textContent = "#" + dato.id;
            idPersonaje.classList.add("idpersonaje");
            divInfoNum.appendChild(idPersonaje);
            divInfoNum.appendChild(imgFav);
            div.appendChild(divInfoNum);
            div.appendChild(img);
            div.appendChild(p);
            div.appendChild(specie);
            div.appendChild(origen);
            div.appendChild(gender);
            section.appendChild(div);
        });
    });
}