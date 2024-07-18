const API_BASE = "https://pokeapi.co/api/v2/"
const OFFSET_AMOUNT = 10;

let currentOffset = 0;
const pokemonDataList = [];
let currentModalPokemonIndex = 0;

let filterFunction = (pokemon) => true;
let sortFunction = (pokeA, pokeB) => pokeA.id - pokeB.id;

const cardList = document.getElementById('cardlist');
const loadMoreBtn = document.getElementById('loadmore');
const filterForm = document.getElementById('filterform');
const sortForm = document.getElementById('sortform');
const modal = document.getElementById('modal');
const nextBtn = document.getElementById('nextbtn');
const prevBtn = document.getElementById('prevbtn');
const closeBtn = document.getElementById('closebtn');
const overlay = document.getElementById('overlay');

const WEAKNESSES = {
    "normal": ["Rock", "Ghost", "Steel"],
    "fighting": ["Flying", "Poison", "Psychic", "Bug", "Ghost", "Fairy"],
    "flying": ["Rock", "Steel", "Electric"],
    "poison": ["Poison", "Ground", "Rock", "Ghost", "Steel"],
    "ground": ["Flying", "Bug", "Grass"],
    "rock": ["Fighting", "Ground", "Steel"],
    "bug": ["Fighting", "Flying", "Poison", "Ghost", "Steel", "Fire", "Fairy"],
    "ghost": ["Normal", "Dark"],
    "steel": ["Steel", "Fire", "Water", "Electric"],
    "fire": ["Rock", "Fire", "Water", "Dragon"],
    "water": ["Water", "Grass", "Dragon"],
    "grass": ["Flying", "Poison", "Bug", "Steel", "Fire", "Grass", "Dragon"],
    "electric": ["Ground", "Grass", "Electric", "Dragon"],
    "psychic": ["Steel", "Psychic", "Dark"],
    "ice": ["Steel", "Fire", "Water", "Ice"],
    "dragon": ["Steel", "Fairy"],
    "dark": ["Fighting", "Dark", "Fairy"],
    "fairy": ["Poison", "Steel", "Fire"]
};

const PILL_COLORS = {
    "normal": "zinc-300",
    "fighting": "red-800",
    "flying": "sky-600",
    "poison": "violet-700",
    "ground": "yellow-700",
    "rock": "yellow-950",
    "bug": "lime-300",
    "ghost": "purple-400",
    "steel": "zinc-600",
    "fire": "orange-600",
    "water": "cyan-600",
    "grass": "green-600",
    "electric": "yellow-300",
    "psychic": "pink-700",
    "ice": "cyan-500",
    "dragon": "violet-900",
    "dark": "neutral-800",
    "fairy": "fuchsia-500"
}

const PASTEL_COLORS = {
    "normal": "zinc-300",
    "fighting": "red-200",
    "flying": "sky-300",
    "poison": "violet-200",
    "ground": "yellow-200",
    "rock": "yellow-200",
    "bug": "lime-200",
    "ghost": "purple-300",
    "steel": "zinc-300",
    "fire": "orange-200",
    "water": "cyan-200",
    "grass": "green-200",
    "electric": "yellow-200",
    "psychic": "pink-200",
    "ice": "cyan-200",
    "dragon": "violet-200",
    "dark": "neutral-300",
    "fairy": "fuchsia-200"
}

const WITH_HYPHEN = new Set([
    "ho-oh", "porygon-z", "jangmo-o", "hakamo-o", "kommo-o", "ting-lu", "chien-pao", "wo-chien", "chi-yu"
])

function add_symbols(name) {
    switch (name) {
        case "mr-mime":
            return "mr. mime";
        case "mime-jr":
            return "mime jr."
        case "mr-rime":
            return "mr. rime"
        case "farfetchd":
            return "farfetch'd"
        case "sirfetchd":
            return "sirfetch'd"
        case "type-null":
            return "type: null"
        case "flabebe":
            return "flabébé"
        default:
            return name;
    }
}

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

function createCard(pokemonDetails) {
    const id = pokemonDetails.id;
    const name = pokemonDetails.name;
    const types = pokemonDetails.types.map(type => `<div class="bg-${PILL_COLORS[type.type.name]} text-xs text-white capitalize rounded-2xl px-3 py-1 m-1">${type.type.name}</div>`).join(' ');
    const imgSrc = `https://assets.pokemon.com/assets/cms2/img/pokedex/full/${id.toString().padStart(3, '0')}.png`;

    const newCard = document.createElement("div");
    newCard.setAttribute("class", "card bg-sky-950 rounded-lg px-4 py-2 hover:bg-white hover:shadow-lg cursor-pointer group");
    newCard.innerHTML = `
        <div class="pokenum text-lg text-cyan-700">${id.toString().padStart(3, '0')}</div>
        <img src="${imgSrc}" alt="${name}" class="transition-transform duration-300 group-hover:scale-110">
        <div class="pokename capitalize font-bold text-center text-3xl text-slate-200 group-hover:text-sky-950">${name}</div>
        <div class="poketype flex justify-center mt-1">${types}</div>`
    
    newCard.addEventListener('click', (e) => {
        currentModalPokemonIndex = id - 1;
        showModal(pokemonDetails);
    });
    return newCard;
}

async function loadMorePokemons() {
    const pokemons = loadPokemons(OFFSET_AMOUNT, currentOffset);
    
    for(const pokemonDetails of pokemons) {
        const newCard = createCard(pokemonDetails);
        cardList.appendChild(newCard);
    }

    currentOffset = currentOffset + OFFSET_AMOUNT;
}

function refreshCardList() {
    const filteredPokemon = pokemonDataList.filter(filterFunction);
    const sortedPokemon = filteredPokemon.sort(sortFunction);

    cardList.innerHTML = '';
    sortedPokemon.forEach(pokemonDetails => {
        const newCard = createCard(pokemonDetails);
        cardList.appendChild(newCard);
    });
}

function applyFilter(id, name) {
    filterFunction = (pokemon) => {
        return pokemon.id == id || (name !== '' && pokemon.name.toLowerCase().includes(name.toLowerCase())) || id === '' && name === '';
    }

    refreshCardList();
}

function applySort(sortType) {
    sortFunction = (pokeA, pokeB) => {
        if (sortType === "id") {
            return pokeA.id - pokeB.id;
        } else {
            if (pokeA.name < pokeB.name) {
                return -1;
            } else {
                return 1;
            }
        }
    };
    refreshCardList();
}

function showModal(details) {
    document.body.classList.add('modal-open');
    overlay.classList.remove('hidden');
    modal.style.display = 'flex';
    const modalbody = document.getElementById('modalbody');
    const id = details.id.toString().padStart(3, '0');
    const types = details.types.map(type => `<div class="bg-${PILL_COLORS[type.type.name]} text-xs text-white capitalize rounded-2xl px-3 py-1 m-1">${type.type.name}</div>`).join(' ');
    const weaknesses = new Set(); 

    details.types.forEach(type => {
        WEAKNESSES[type.type.name].forEach(weakness => {
            weaknesses.add(weakness);
        })
    })

    const weakness_pills = [...weaknesses].map(type => `<div class="bg-${PILL_COLORS[type.toLowerCase()]} inline-block text-xs text-white capitalize rounded-2xl px-3 py-1 m-1">${type}</div>`).join(' ');
    
    
    modalbody.innerHTML = `
        <div class="flex flex-col items-center bg-${PASTEL_COLORS[details.types[0].type.name.toLowerCase()]} rounded-full mx-5 w-1/2 text-black">
            <img src="https://assets.pokemon.com/assets/cms2/img/pokedex/full/${id}.png" alt="${details.name}" class="w-2/3">
            <p class="pokenum text-sm">${id}</p>
            <p class="capitalize pokename text-3xl">${details.name}</p>
        </div>
        <div id="info" class="flex flex-col w-1/2 mt-6">
            <div class="flex justify-between mainstats text-xs mb-4">
                <div class="flex flex-col w-1/6 items-center text-xl p-1 m-1.5 bg-slate-100 rounded-md text-sky-950">
                    <p class="statnum">${details.stats[0].base_stat}</p>
                    <p>HP</p>
                </div>
                <div class="flex flex-col w-1/6 items-center text-xl p-1 m-1.5 bg-slate-100 rounded-md text-sky-950">
                    <p class="statnum">${details.stats[1].base_stat}</p>
                    <p>ATK</p>
                </div>
                <div class="flex flex-col w-1/6 items-center text-xl p-1 m-1.5 bg-slate-100 rounded-md text-sky-950">
                    <p class="statnum">${details.stats[2].base_stat}</p>
                    <p>DEF</p>
                </div>
                <div class="flex flex-col w-1/6 items-center text-xl p-1 m-1.5 bg-slate-100 rounded-md text-sky-950">
                    <p class="statnum">${details.stats[3].base_stat}</p>
                    <p class="text-center">S. ATK</p>
                </div>
                <div class="flex flex-col w-1/6 items-center text-xl p-1 m-1.5 bg-slate-100 rounded-md text-sky-950">
                    <p class="statnum">${details.stats[4].base_stat}</p>
                    <p class="text-center">S. DEF</p>
                </div>
                <div class="flex flex-col w-1/6 items-center text-xl p-1 m-1.5 bg-slate-100 rounded-md text-sky-950">
                    <p class="statnum">${details.stats[5].base_stat}</p>
                    <p>SPD</p>
                </div>
            </div>
            <div class="flex justify-between items-center px-40 heading mb-4">
                <p>Height: <span class="statval">${details.height}</span></p>
                <p>Weight: <span class="statval">${details.weight}</span></p>
            </div>
            <div class="flex heading ml-8">
                <p><span class="mr-14">Type:</span>${types}<p>
            </div>
            <div class="flex heading w-full mb-6 ml-8">
                <div class="mr-4">Weakness:</div>
                <div>${weakness_pills}</div>
            </div>
            <div class="flex justify-between items-start px-24">
                <div class="flex flex-col heading w-1/2">
                    <p class="text-2xl mb-1">Abilities:</p>
                    <div id="abilities" class="max-h-32 capitalize statval">
                    </div>
                </div>
                <div class="flex flex-col heading w-1/2">
                    <p class="text-2xl mb-1">Moves:</p>
                    <div id="moves" class="max-h-36 overflow-y-scroll capitalize statval pr-10">
                    </div>
                </div>
            </div>
        </div>`;
    
    const abilities = document.getElementById("abilities");
    details.abilities.forEach(ability => {
        const newAbilityDiv = document.createElement("div");
        newAbilityDiv.setAttribute("class", "mb-1.5");
        newAbilityDiv.innerHTML = `${ability.ability.name.replaceAll("-", " ")}`;
        abilities.appendChild(newAbilityDiv);
    });

    const moves = document.getElementById("moves");
    details.moves.forEach(move => {
        const newMoveDiv = document.createElement("div");
        newMoveDiv.setAttribute("class", "mb-1.5");
        newMoveDiv.innerHTML = `${move.move.name.replaceAll("-", " ")}`;
        moves.appendChild(newMoveDiv);
    });

}

function nextModal() {
    currentModalPokemonIndex = (currentModalPokemonIndex + 1) % 1010;
    const nextPokemon = pokemonDataList[currentModalPokemonIndex];
    showModal(nextPokemon);
}

function prevModal() {
    currentModalPokemonIndex = (currentModalPokemonIndex - 1 + 1010) % 1010;
    const nextPokemon = pokemonDataList[currentModalPokemonIndex];
    showModal(nextPokemon);
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

nextBtn.addEventListener('click', nextModal);
prevBtn.addEventListener('click', prevModal);
closeBtn.addEventListener('click', (e) => {
    document.body.classList.remove('modal-open');
    overlay.classList.add('hidden');
    modal.style.display = 'none';
});

overlay.addEventListener('click', (e) => {
    document.body.classList.remove('modal-open');
    overlay.classList.add('hidden');
    modal.style.display = 'none';
});

window.onload = () => {
    modal.style.display = 'none';
    getPokemons(1_010, 0)
        .then(async (pokemons) => {
            let numProcessed = 0;
            for(const pokemon of pokemons) {
                const pokemonDetails = await getPokemonDetailsByURL(pokemon.url);
                if (!WITH_HYPHEN.has(pokemonDetails.name)) {
                    pokemonDetails.name = add_symbols(pokemonDetails.name);
                    pokemonDetails.name = pokemonDetails.name.replaceAll("-", " ");
                } 
                pokemonDataList.push(pokemonDetails);
                
                if (currentOffset < OFFSET_AMOUNT) {
                    const newCard = createCard(pokemonDetails);
                    cardList.appendChild(newCard);
                    currentOffset += 1;
                }
            }
    });
}