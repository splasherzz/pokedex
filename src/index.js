const API_BASE = "https://pokeapi.co/api/v2/"
const OFFSET_AMOUNT = 10;

let currentOffset = 0;
const pokemonDataList = [];

const cardList = document.getElementById('cardlist');
const loadMoreBtn = document.getElementById('loadmore');
const filterForm = document.getElementById('filterform')

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

function loadPokemons(amount, offset) {
    console.log(offset)
    return pokemonDataList.slice(offset, offset+amount);
}

async function loadMorePokemons() {
    const pokemons = loadPokemons(OFFSET_AMOUNT, currentOffset);
    // loop over the results, for each result, perform fetch to get the details
    for(const pokemonDetails of pokemons) {
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

        cardList.appendChild(newCard);
    }

    // Update global state
    currentOffset = currentOffset + OFFSET_AMOUNT;
}

function applyFilter(id, name) {
    const filteredPokemon = pokemonDataList.filter(pokemon => {
        return pokemon.id == id || pokemon.name === name || id === '' && name === '';
    });

    console.log(id, name)
    console.log(filteredPokemon)

    cardList.innerHTML = '';
    filteredPokemon.forEach(pokemonDetails => {
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

        cardList.appendChild(newCard);
    })
}

loadMoreBtn.addEventListener('click', loadMorePokemons);

filterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('id').value;
    const name = document.getElementById('name').value;
    applyFilter(id, name);
});

window.onload = () => {
    getPokemons(1_010, 0)
        .then(async (pokemons) => {
            let numProcessed = 0;
            for(const pokemon of pokemons) {
                const pokemonDetails = await getPokemonDetailsByURL(pokemon.url);
                pokemonDataList.push(pokemonDetails);
                console.log(pokemon);
                
                if (currentOffset < OFFSET_AMOUNT) {
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
    
                    cardList.appendChild(newCard);
                    currentOffset += 1;
                }
            }
    });
}