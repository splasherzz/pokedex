const API_BASE = "https://pokeapi.co/api/v2/"
const OFFSET_AMOUNT = 10;

let currentOffset = 0;
const pokemonDataList = [];

const cardList = document.getElementById('cardlist');
const loadMoreBtn = document.getElementById('loadmore');
const filterForm = document.getElementById('filterform');
const sortForm = document.getElementById('sortform');
const modal = document.getElementById('modal');

const WEAKNESSES = {
    "normal": ["rock", "ghost", "steel"],
    "fighting": ["flying", "poison", "psychic", "bug", "ghost", "fairy"]
    // Continue to add
};

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

function applySort(sortType) {
    const sortedPokemon = pokemonDataList.sort((pokeA, pokeB) => {
        if (sortType === "id") {
            return pokeA.id - pokeB.id;
        } else {
            if (pokeA.name < pokeB.name) {
                return -1;
            } else {
                return 1;
            }
        }
    })

    cardList.innerHTML = '';
    sortedPokemon.forEach(pokemonDetails => {
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

function showModal(details) {
    modal.style.display = 'flex';
    const modalbody = document.getElementById('modalbody');
    const id = details.id.toString().padStart(3, '0');
    const types = details.types.map(type => type.type.name).join(', ');
    const weaknesses = "rock, ghost, steel"; 
    
    modalbody.innerHTML = `
        <img src="https://assets.pokemon.com/assets/cms2/img/pokedex/full/${id}.png" alt="ditto">
            <div id="info" class="flex flex-col">
                <p>ID Num: ${id}</p>
                <p>Name: ${details.name}</p>
                <p>Height: ${details.height}</p>
                <p>Weight: ${details.weight}</p>
                <p>Type(s): ${types}</p>
                <p>Weakness: Rock, Ghost, Steel</p>
                <div>
                    <p>Stats</p>
                    <div>HP: ${details.stats[0].base_stat}</div>
                    <div>Attack: ${details.stats[1].base_stat}</div>
                    <div>Defense: ${details.stats[2].base_stat}</div>
                    <div>Special Attack: ${details.stats[3].base_stat}</div>
                    <div>Special Defense: ${details.stats[4].base_stat}</div>
                    <div>Speed: ${details.stats[5].base_stat}</div>
                </div>
                <p>Abilities</p>
                <div id="abilities" class="max-h-32 overflow-scroll">
                </div>
                <p>Moves</p>
                <div id="moves" class="max-h-16 overflow-scroll">
                </div>
            </div>
        </div>`;
    
    const abilities = document.getElementById("abilities");
    details.abilities.forEach(ability => {
        const newAbilityDiv = document.createElement("div");
        newAbilityDiv.innerHTML = `${ability.ability.name}`;
        abilities.appendChild(newAbilityDiv);
    });

    const moves = document.getElementById("moves");
    details.moves.forEach(move => {
        const newMoveDiv = document.createElement("div");
        newMoveDiv.innerHTML = `${move.move.name}`;
        moves.appendChild(newMoveDiv);
    });

}

loadMoreBtn.addEventListener('click', loadMorePokemons);

filterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('id').value;
    const name = document.getElementById('name').value;
    applyFilter(id, name);
});

sortForm.addEventListener('change', (e) => {
    const sortType = e.target.value;
    applySort(sortType);
});

window.onload = () => {
    modal.style.display = 'flex';
    getPokemons(1_010, 0)
        .then(async (pokemons) => {
            let numProcessed = 0;
            for(const pokemon of pokemons) {
                const pokemonDetails = await getPokemonDetailsByURL(pokemon.url);
                pokemonDataList.push(pokemonDetails);
                
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
            console.log(pokemonDataList[0]);
            showModal(pokemonDataList[0]);
    });
}