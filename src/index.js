const API_BASE = "https://pokeapi.co/api/v2/"
const OFFSET_AMOUNT = 10;

let currentOffset = 0;

const cardList = document.getElementById('cardlist');
const loadMoreBtn = document.getElementById('loadmore');

async function getPokemonDetailsByURL(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('API response was not ok ' + response.statusText);
        }
        const data = await response.json();
        return data;

    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
    }
}

async function getPokemonDetailsByID(idNumber) {
    const url = `${API_BASE}/pokemon/${idNumber}/`;
    return await getPokemonDetailsByURL(url)
}

async function getPokemons(amount, offset) {
    try {
        const response = await fetch(`${API_BASE}/pokemon?limit=${amount}&offset=${offset}`);
        if (!response.ok) {
            throw new Error('API response was not ok ' + response.statusText);
        }
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
    }
}

async function loadMorePokemons() {
    const pokemons = await getPokemons(OFFSET_AMOUNT, currentOffset);
    // loop over the results, for each result, perform fetch to get the details
    for(const pokemon of pokemons) {
        const pokemonDetails = await getPokemonDetailsByURL(pokemon.url);

        const id = pokemonDetails.id;
        const name = pokemonDetails.name;
        const types = pokemonDetails.types.map(type => type.type.name).join(', ');
        const imgSrc = `https://assets.pokemon.com/assets/cms2/img/pokedex/full/${id.toString().padStart(3, '0')}.png`;

        const newCard = document.createElement("div");
        newCard.setAttribute("class", "card")
        newCard.innerHTML = `<img src="${imgSrc}" alt="${name}">
            <div>Id No. ${id.toString().padStart(3, '0')}</div>
            <div>${name}</div>
            <div>Type(s): ${types}</div>`

        console.log(newCard);
        cardList.appendChild(newCard);
    }

    // Update global state
    currentOffset = currentOffset + OFFSET_AMOUNT;
}
loadMoreBtn.addEventListener('click', loadMorePokemons)

window.onload = () => {
    loadMorePokemons();
}