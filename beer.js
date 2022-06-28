let PAGE = 1;
let BEERS = []
// Backup für den Fall, dass das API nicht funktioniert
// BEERS = _BEERS;

window.addEventListener('DOMContentLoaded', () => {
    document.getElementById('zurueck-btn').addEventListener('click', () => {
        if(PAGE > 1) {
            PAGE--;
            clearBeers();
            loadBeers();
            setBeerPageText();
        }
    });
    
    document.getElementById('next-btn').addEventListener('click', () => {
        PAGE++;
        clearBeers();
        loadBeers();
        setBeerPageText();
    });
});

function setBeerPageText() {
    document.getElementById('currentPageSpan').innerText = PAGE;
}

function clearBeers() {
    let main = document.getElementById('beers');
    let modal_beer_info = document.getElementById('modal-beer-info');

    modal_beer_info.style.display = "none";

    const children = Array.from(main.children);
    children.forEach(element => {
        if(element.tagName === 'ARTICLE') {
            element.remove();
        }
    });
}

/**
 * Lade Biere und erzeuge je Bier ein article Element.
 */
function loadBeers() {
    let main = document.getElementById('beers');

    fetch(`https://api.punkapi.com/v2/beers?page=${PAGE}`)
        .then(response => response.json())
        .then(beers => {
            BEERS = beers;
            beers.forEach(beer => {
                const article = document.createElement('article');
                const description_div = document.createElement('div');

                article.insertAdjacentHTML('beforeend', `<h2>${beer.name}</h2>`);
                article.insertAdjacentHTML('beforeend', `<section>${beer.tagline}</section>`);

                description_div.insertAdjacentHTML('beforeend', `<section class='description'>${beer.description}</section>`);
                description_div.insertAdjacentHTML('beforeend', `<img src='${beer.image_url}' />`);
                article.appendChild(description_div);
                
                article.style.color = srmToRGB(beer.srm)["color"];
                article.style.background = srmToRGB(beer.srm)["backgroundColor"];

                article.addEventListener('click', (event) => {
                    let modal_beer_info = document.getElementById('modal-beer-info');
                    modal_beer_info.innerHTML = '';
                    modal_beer_info.insertAdjacentHTML('beforeend', `<h1>${beer.name}</h1>`);
                    modal_beer_info.insertAdjacentHTML('beforeend', `<section><h2>Description</h2>${beer.description}</section>`);
                    modal_beer_info.insertAdjacentHTML('beforeend', `<section><h2>Food Pairings</h2>${beer.food_pairing}</section>`);
                    modal_beer_info.insertAdjacentHTML('beforeend', `<section><h2>Alcohol</h2>${beer.abv}</section>`);
                    modal_beer_info.style.top = event.pageY + "px";
                    modal_beer_info.style.left = event.pageX + "px";
                    modal_beer_info.style.display = "block";
                });

                main.append(article);
            })
        })
        .catch(error => console.error('Oops, something went wrong: %o', error));
}



/**
 * Berechne die Farbe des Biers anhand seines SRM-Werts (@link{https://en.wikipedia.org/wiki/Standard_Reference_Method}).
 * Formel adaptiert nach @link{http://brew-engine.com/engines/beer_color_calculator.html}
 * 
 * @param {number} srm SRM-Wert des Biers 
 * @returns 
 */
function srmToRGB(srm) {
    let red = 0, green = 0, blue = 0;

    if (srm >= 0 && srm <= 1) {
        red = 240;
        green = 239;
        blue = 181;
    } else if (srm > 1 && srm <= 2) {
        red = 233;
        green = 215;
        blue = 108;
    } else if (srm > 2) {
        // Set red decimal
        if (srm < 70.6843) {
            red = 243.8327 - 6.4040 * srm + 0.0453 * srm * srm;
        } else {
            red = 17.5014;
        }
        // Set green decimal
        if (srm < 35.0674) {
            green = 230.929 - 12.484 * srm + 0.178 * srm * srm;
        } else {
            green = 12.0382;
        }
        // Set blue decimal
        if (srm < 4) {
            blue = -54 * srm + 216;
        } else if (srm >= 4 && srm < 7) {
            blue = 0;
        } else if (srm >= 7 && srm < 9) {
            blue = 13 * srm - 91;
        } else if (srm >= 9 && srm < 13) {
            blue = 2 * srm + 8;
        } else if (srm >= 13 && srm < 17) {
            blue = -1.5 * srm + 53.5;
        } else if (srm >= 17 && srm < 22) {
            blue = 0.6 * srm + 17.8;
        } else if (srm >= 22 && srm < 27) {
            blue = -2.2 * srm + 79.4;
        } else if (srm >= 27 && srm < 34) {
            blue = -0.4285 * srm + 31.5714;
        } else {
            blue = 17;
        }
    }

    let color = (red * 0.299 + green * 0.587 + blue * 0.114) > 186 ? 'black' : 'white';

    return {
        color,
        backgroundColor: `rgb(${red}, ${green}, ${blue})`
    }
}
