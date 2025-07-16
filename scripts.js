// scripts.js
let selectedSlot = null;
const blueHeroPool = document.getElementById('blue-hero-pool');
const redHeroPool = document.getElementById('red-hero-pool');
const blueGlobalBans = document.getElementById('blue-global-bans');
const redGlobalBans = document.getElementById('red-global-bans');
const blueTeamBanSection = document.getElementById('blue-ban-section');
const redTeamBanSection = document.getElementById('red-ban-section');
const blueTeamPickSection = document.getElementById('blue-pick-section');
const redTeamPickSection = document.getElementById('red-pick-section');
const blueTeamHeroPoolSection = document.getElementById('blue-hero-pool-section');
const redTeamHeroPoolSection = document.getElementById('red-hero-pool-section');
const blueTeamGlobalBanSection = document.getElementById('blue-global-ban-section');
const redTeamGlobalBanSection = document.getElementById('red-global-ban-section');
const centerControls = document.querySelector('.center-controls');
const heroes = ["airi","aleister","alice","allain","amily","annette","aoi","arduin","arum","astrid","ata","aya","azzen'ka","baldum","bijan","bonnie","bright","butterfly","capheny","celica","charlotte","chaugnar","cresht","d'arcy","dextra","diao chan","dirak","dolia","eland'orr","elsu","enzo","erin","errol","fennik","florentino","gildur","grakk","hayate","helen","iggy","ignis","ilumia","ishar","jinna","kahlii","kaine","keera","kil'groth","kriknak","krixi","krizzix","lauriel","laville","liliana","lindis","lorion","lu bu","lumburr","maloch","marja","max","mganga","mina","ming","moren","mortos","murad","nakroth","natalya","omega","omen","ormarr","paine","preyta","qi","quillen","raz","riktor","rouie","rourke","roxie","ryoma","sephera","sinestrea","skud","slimz","stuart","superman","taara","tachi","teemee","teeri","tel'annas","thane","the flash","thorne","toro","tulen","valhein","veera","veres","violet","volkath","wiro","wisp","wonder woman","wukong","xeniel","yan","y'bneth","yena","yorn","yue","zanis","zata","zephys","zill","zip","zuka"];

const heroTypeOrder = ["Carry", "Tank", "Support", "Mage", "Fighter", "Assassin"];

// Function to fetch and parse CSV file from Google Sheets
async function fetchHeroWinRates() {
    // Replace with your Google Sheets published URL
    const sheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTRH2dLsgW9xyBmudX1MBYcnpPBOLfmJUroMRdkF5sY_96dWzcfiSoiXhbZAjL9uteVd1P-3D5wR5pd/pub?gid=677578437&single=true&output=csv';
    const response = await fetch(sheetUrl);
    const data = await response.text();
    const winRates = {};
    const rows = data.split('\n');

    // Skip the header row and parse the remaining rows
    for (let i = 1; i < rows.length; i++) {
        const row = rows[i].split(',');
        if (row.length >= 5) {
            const [heroFS, fsWinRate, heroOP, opWinRate, heroType] = row;
            const heroFSLower = heroFS.trim().toLowerCase();
            const heroOPLower = heroOP.trim().toLowerCase();
            winRates[heroFSLower] = {
                fsWinRate: fsWinRate.trim(),
                opWinRate: winRates[heroFSLower] ? winRates[heroFSLower].opWinRate : 'N/A',
                heroType: heroType.trim()
            };
            winRates[heroOPLower] = {
                fsWinRate: winRates[heroOPLower] ? winRates[heroOPLower].fsWinRate : 'N/A',
                opWinRate: opWinRate.trim(),
                heroType: heroType.trim()
            };
        }
    }

    console.log('Win Rates:', winRates); // Debugging statement
    return winRates;
}


// Load heroes into both hero pools categorized by hero type
function loadHeroes(winRates) {
    // Clear existing pools
    blueHeroPool.innerHTML = '';
    redHeroPool.innerHTML = '';

    // Create sections for hero types
    const heroTypes = {};
    heroes.forEach(hero => {
        const heroLower = hero.toLowerCase();
        const heroType = winRates[heroLower]?.heroType || 'Unknown';

        if (!heroTypes[heroType]) {
            heroTypes[heroType] = {
                blue: [],
                red: []
            };
        }

        heroTypes[heroType].blue.push({
            name: hero,
            fsWinRate: parseFloat(winRates[heroLower]?.fsWinRate) || 0
        });

        heroTypes[heroType].red.push({
            name: hero,
            opWinRate: parseFloat(winRates[heroLower]?.opWinRate) || 0
        });
    });

    // Sort and display heroes within each type section
    heroTypeOrder.forEach(type => {
        if (heroTypes[type]) {
            // Sort heroes by win rate
            heroTypes[type].blue.sort((a, b) => b.fsWinRate - a.fsWinRate);
            heroTypes[type].red.sort((a, b) => b.opWinRate - a.opWinRate);

            // Create and append type section for blue team
            const blueTypeSection = document.createElement('div');
            blueTypeSection.classList.add('hero-type-section');
            blueTypeSection.innerHTML = `<h3>${type}</h3>`;
            heroTypes[type].blue.forEach(hero => {
                const heroElement = document.createElement('div');
                heroElement.classList.add('hero');
                heroElement.innerHTML = `
                    <img src="heroimage/${hero.name}.jpg" alt="${hero.name}">
                    <span>${hero.name}</span>
                    <span>${hero.fsWinRate}</span>`;
                heroElement.dataset.hero = hero.name;
                heroElement.dataset.team = 'blue';
                heroElement.onclick = () => selectHero(heroElement, hero.name);
                blueTypeSection.appendChild(heroElement);
            });
            blueHeroPool.appendChild(blueTypeSection);

            // Create and append type section for red team
            const redTypeSection = document.createElement('div');
            redTypeSection.classList.add('hero-type-section');
            redTypeSection.innerHTML = `<h3>${type}</h3>`;
            heroTypes[type].red.forEach(hero => {
                const heroElement = document.createElement('div');
                heroElement.classList.add('hero');
                heroElement.innerHTML = `
                    <img src="heroimage/${hero.name}.jpg" alt="${hero.name}">
                    <span>${hero.name}</span>
                    <span>${hero.opWinRate}</span>`;
                heroElement.dataset.hero = hero.name;
                heroElement.dataset.team = 'red';
                heroElement.onclick = () => selectHero(heroElement, hero.name);
                redTypeSection.appendChild(heroElement);
            });
            redHeroPool.appendChild(redTypeSection);
        }
    });
}

function selectSlot(slot, team, type) {
    if (slot.classList.contains('selected')) {
        // If slot already has a hero, remove the hero
        removeHero(slot);
    } else {
        // Mark this slot as active
        if (selectedSlot) {
            selectedSlot.classList.remove('active-slot');
        }
        selectedSlot = slot;
        slot.classList.add('active-slot');
        selectedSlot.dataset.team = team;
        selectedSlot.dataset.type = type;
    }
}

function selectHero(heroElement, hero) {
    if (selectedSlot) {
        const team = selectedSlot.dataset.team;
        const type = selectedSlot.dataset.type;

        // Ensure the hero is selected from the correct pool
        if (heroElement.dataset.team !== team) {
            alert('You can only select heroes from your own pool.');
            return;
        }

        // Assign hero to selected slot
        selectedSlot.innerHTML = heroElement.innerHTML;
        selectedSlot.classList.add('selected');
        selectedSlot.dataset.hero = hero;

        // Style the hero in the pool
        if (type === 'ban') {
            heroElement.classList.add('banned');
        } else {
            heroElement.classList.add(`selected-${team}`);
        }

        // Deselect the slot
        selectedSlot.classList.remove('active-slot');
        selectedSlot = null;
    }
}

function removeHero(slot) {
    const hero = slot.dataset.hero;
    if (hero) {
        const heroElement = document.querySelector(`.hero[data-hero="${hero}"][data-team="${slot.dataset.team}"]`);
        heroElement.classList.remove('banned', 'selected-blue', 'selected-red');
        slot.innerHTML = '';
        slot.classList.remove('selected');
        delete slot.dataset.hero;
    }
}

function movePickedHeroesToGlobalBans() {
    const pickedSlots = document.querySelectorAll('.pick-slot.selected');
    pickedSlots.forEach(slot => {
        const hero = slot.dataset.hero;
        if (hero) {
            const heroElement = document.querySelector(`.hero[data-hero="${hero}"][data-team="${slot.dataset.team}"]`);
            heroElement.classList.remove('selected-blue', 'selected-red');
            heroElement.classList.add('banned');

            const team = slot.dataset.team;
            if (team === 'blue') {
                blueGlobalBans.appendChild(heroElement);
            } else {
                redGlobalBans.appendChild(heroElement);
            }

            slot.innerHTML = '';
            slot.classList.remove('selected');
            delete slot.dataset.hero;
        }
    });

    // Clear ban slots
    document.querySelectorAll('.ban-slot').forEach(slot => {
        removeHero(slot);
    });
}

function switchTeams() {
    const blueBanSection = blueTeamBanSection.parentNode.removeChild(blueTeamBanSection);
    const redBanSection = redTeamBanSection.parentNode.removeChild(redTeamBanSection);
    const bluePickSection = blueTeamPickSection.parentNode.removeChild(blueTeamPickSection);
    const redPickSection = redTeamPickSection.parentNode.removeChild(redTeamPickSection);
    const blueHeroPoolSection = blueTeamHeroPoolSection.parentNode.removeChild(blueTeamHeroPoolSection);
    const redHeroPoolSection = redTeamHeroPoolSection.parentNode.removeChild(redHeroPoolSection);
    const blueGlobalBanSection = blueTeamGlobalBanSection.parentNode.removeChild(blueTeamGlobalBanSection);
    const redGlobalBanSection = redTeamGlobalBanSection.parentNode.removeChild(redTeamGlobalBanSection);

    const teamWrapper = document.querySelector('.container');
    teamWrapper.insertBefore(redBanSection, centerControls);
    teamWrapper.insertBefore(blueBanSection, redBanSection);
    teamWrapper.insertBefore(redPickSection, centerControls);
    teamWrapper.insertBefore(bluePickSection, redPickSection);
    teamWrapper.insertBefore(redHeroPoolSection, centerControls);
    teamWrapper.insertBefore(blueHeroPoolSection, redHeroPoolSection);
    teamWrapper.insertBefore(redGlobalBanSection, centerControls);
    teamWrapper.insertBefore(blueGlobalBanSection, redGlobalBanSection);
}

// Attach event listeners to slots for activation
document.querySelectorAll('.ban-slot, .pick-slot').forEach(slot => {
    slot.addEventListener('click', () => {
        selectSlot(slot, slot.dataset.team, slot.dataset.type);
    });
});

// Attach event listener to New Game button
document.getElementById('new-game').addEventListener('click', movePickedHeroesToGlobalBans);

// Attach event listener to Switch button
// document.getElementById('switch').addEventListener('click', switchTeams);

// Fetch win rates and load heroes
fetchHeroWinRates().then(winRates => {
    loadHeroes(winRates);
});
