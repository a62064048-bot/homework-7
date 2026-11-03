
// ---------- GMAIL VALIDATOR ----------

const gmailInput = document.getElementById('gmail_input');
const gmailButton = document.getElementById('gmail_button');
const gmailResult = document.getElementById('gmail_result');

const gmailRegex = /^[a-zA-Z0-9._-]+@gmail\.com$/;

gmailButton.addEventListener('click', () => {
    const email = gmailInput.value.trim();

    if (gmailRegex.test(email)) {
        gmailResult.style.color = 'green';
         gmailResult.textContent = '✔ Валидная почта';
    } else {
        gmailResult.textContent = '✘ Невалидная gmail-почта';
        gmailResult.style.color = 'red';     
           

    }
});


// ---------- RED SQUARE 2.0 ----------

const parentBlock = document.querySelector('.parent_block');
const childBlock = document.querySelector('.child_block');

let x = 0;
let y = 0;
let direction = 'right';

function moveSquare() {
    if (!parentBlock || !childBlock) return;

    const maxX = parentBlock.clientWidth - childBlock.offsetWidth;
    const maxY = parentBlock.clientHeight - childBlock.offsetHeight;

    if (direction === 'right') {
        x++;
        if (x >= maxX) {
            x = maxX;
            direction = 'down';
        }
    } else if (direction === 'down') {
        y++;
        if (y >= maxY) {
            y = maxY;
            direction = 'left';
        }
    } else if (direction === 'left') {
        x--;
        if (x <= 0) {
            x = 0;
            direction = 'up';
        }
    } else if (direction === 'up') {
        y--;
        if (y <= 0) {
            y = 0;
            direction = 'right';
        }
    }

    childBlock.style.left = x + 'px';
    childBlock.style.top = y + 'px';

    setTimeout(moveSquare, 10);
}

if (parentBlock && childBlock) {
    moveSquare();
}


// ---------- STOPWATCH ----------

const secondsDisplay = document.getElementById('seconds');
const startButton = document.getElementById('start');
const stopButton = document.getElementById('stop');
const resetButton = document.getElementById('reset');

let seconds = 0;
let timer = null;

if (secondsDisplay && startButton && stopButton && resetButton) {
    startButton.addEventListener('click', () => {
        if (timer !== null) return;

        timer = setInterval(() => {
            seconds++;
            secondsDisplay.textContent = seconds;
        }, 1000);
    });

    stopButton.addEventListener('click', () => {
        clearInterval(timer);
        timer = null;
    });

    resetButton.addEventListener('click', () => {
        clearInterval(timer);
        timer = null;
        seconds = 0;
        secondsDisplay.textContent = seconds;
    });
}


// ---------- XHR REQUEST (DRY) ----------

// Один общий XHR GET-запрос для всех JSON-файлов
const request = (url, callback) => {
    const xhr = new XMLHttpRequest()
    xhr.open('GET', url)
    xhr.setRequestHeader('Content-type', 'application/json')
    xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
            callback(JSON.parse(xhr.response))
        } else {
            console.error(`Ошибка запроса ${url}: ${xhr.status}`)
        }
    }
    xhr.onerror = () => console.error(`Не удалось загрузить ${url}`)
    xhr.send()
}


// ---------- CHARACTERS ----------

const charactersList = document.querySelector('.characters-list')

const renderCharacters = (characters) => {
    characters.forEach((character) => {
        const card = document.createElement('div')
        card.classList.add('character-card')
        card.innerHTML = `
            <div class="character-photo">
                <img src="${character.photo}" alt="${character.name}">
            </div>
            <h3>${character.name}</h3>
            <p>${character.role}, ${character.age} лет</p>
            <p>${character.description}</p>
        `
        charactersList.append(card)
    })
}

if (charactersList) {
    request('../data/characters.json', renderCharacters)
}


// ---------- ANY JSON ----------

request('../data/any.json', (data) => console.log(data))
