// ---------- COMMON ----------

const BASE_URL = 'https://jsonplaceholder.typicode.com'

// Один общий запрос для всего файла (DRY)
const getData = async (endpoint) => {
    const response = await fetch(`${BASE_URL}/${endpoint}`)
    if (!response.ok) {
        throw new Error(`Ошибка запроса: ${response.status}`)
    }
    return response.json()
}


// ---------- AUTO TAB SLIDER ----------

const tabContents = document.querySelectorAll('.tab_content_block')
const tabButtons = document.querySelectorAll('.tab_content_items button')
const TAB_DELAY = 3000 // 3 секунды

let tabIndex = 0
let tabTimer = null

// Одна функция показывает нужный таб и подсвечивает нужную кнопку (DRY)
const showTab = (index) => {
    tabContents.forEach((content, i) => {
        content.style.display = i === index ? 'flex' : 'none'
    })
    tabButtons.forEach((button, i) => {
        button.classList.add('tab_content_item')
        button.classList.toggle('tab_content_item_active', i === index)
    })
}

const nextTab = () => {
    tabIndex = tabIndex < tabContents.length - 1 ? tabIndex + 1 : 0
    showTab(tabIndex)
}

// (пере)запуск автослайдера: каждые 3 секунды переключаем на следующий таб
const startAutoTabs = () => {
    clearInterval(tabTimer)
    tabTimer = setInterval(nextTab, TAB_DELAY)
}

// при клике на кнопку открываем её таб и отсчёт 3 секунд начинается заново
tabButtons.forEach((button, i) => {
    button.onclick = () => {
        tabIndex = i
        showTab(tabIndex)
        startAutoTabs()
    }
})

if (tabContents.length) {
    showTab(tabIndex)
    startAutoTabs()
}


// ---------- CONVERTER ----------

// Резервные курсы на случай, если API временно недоступен.
const RATES = {
    som: 1,
    usd: 1 / 87.5,
    eur: 1 / 101
};

const converterInputs = Object.keys(RATES).map((currency) => ({
    currency,
    input: document.querySelector(`#${currency}`)
}));

// Получаем актуальные курсы относительно KGS (кыргызского сома).
const loadRates = async () => {
    try {
        const response = await fetch('https://open.er-api.com/v6/latest/KGS');
        if (!response.ok) throw new Error(`Ошибка загрузки курсов: ${response.status}`);

        const data = await response.json();
        if (data.result !== 'success' || !data.rates?.USD || !data.rates?.EUR) {
            throw new Error('API вернул некорректные данные о курсах валют');
        }

        RATES.som = 1;
        RATES.usd = data.rates.USD;
        RATES.eur = data.rates.EUR;
        console.log('Курсы валют обновлены:', RATES);
    } catch (error) {
        console.error('Не удалось получить актуальные курсы. Используются резервные значения:', error);
    }
};

const convert = async (fromCurrency, value) => {
    try {
        if (!Object.prototype.hasOwnProperty.call(RATES, fromCurrency)) {
            throw new Error('Неизвестная валюта');
        }

        if (value === '') {
            converterInputs.forEach(({ currency, input }) => {
                if (currency !== fromCurrency && input) input.value = '';
            });
            return;
        }

        const numericValue = Number(value);
        if (!Number.isFinite(numericValue)) throw new Error('Введите корректное число');

        // Все курсы заданы как количество единиц валюты за 1 KGS.
        const inSom = numericValue / RATES[fromCurrency];
        converterInputs.forEach(({ currency, input }) => {
            if (currency !== fromCurrency && input) {
                input.value = (inSom * RATES[currency]).toFixed(2);
            }
        });
    } catch (error) {
        console.error('Ошибка конвертации:', error);
    }
};

converterInputs.forEach(({ currency, input }) => {
    if (input) {
        input.addEventListener('input', () => convert(currency, input.value));
    }
});

// Сначала загружаем курсы, после этого включаем конвертер.
loadRates();

// ---------- CARD SWITCHER ----------

const card = document.querySelector('.card');
const btnPrev = document.querySelector('#btn-prev');
const btnNext = document.querySelector('#btn-next');

const FIRST_CARD = 1;
const LAST_CARD = 200;
let cardId = FIRST_CARD;

const renderCard = ({ id, title, completed }) => {
    if (!card) return;
    card.innerHTML = `
        <p>${title}</p>
        <p style="color: ${completed ? 'green' : 'red'}">${completed ? 'Completed' : 'Not completed'}</p>
        <span>${id}</span>
    `;
};

const loadCard = async (id) => {
    try {
        const data = await getData(`todos/${id}`);
        // Не показываем устаревший ответ, если пользователь уже переключил карточку.
        if (id === cardId) renderCard(data);
    } catch (error) {
        console.error('Не удалось загрузить карточку:', error);
        if (card && id === cardId) {
            card.innerHTML = '<p>Не удалось загрузить карточку. Попробуйте ещё раз.</p>';
        }
    }
};

const switchCard = (step) => {
    cardId += step;
    if (cardId > LAST_CARD) cardId = FIRST_CARD;
    if (cardId < FIRST_CARD) cardId = LAST_CARD;
    loadCard(cardId);
};

if (card && btnNext && btnPrev) {
    btnNext.addEventListener('click', () => switchCard(1));
    btnPrev.addEventListener('click', () => switchCard(-1));
    loadCard(cardId);
}

// ---------- WEATHER SEARCH ----------

// Open-Meteo не требует API-ключа: сначала находим координаты города,
// затем получаем текущую погоду по этим координатам.
const weatherInput = document.querySelector('#searchInput');
const weatherButton = document.querySelector('#search');
const weatherCity = document.querySelector('.city');
const weatherTemp = document.querySelector('.temp');

const searchWeather = async (cityName) => {
    try {
        if (!cityName.trim()) {
            throw new Error('Введите название города');
        }

        const geoResponse = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=ru&format=json`
        );
        if (!geoResponse.ok) throw new Error(`Ошибка поиска города: ${geoResponse.status}`);

        const geoData = await geoResponse.json();
        const city = geoData.results?.[0];
        if (!city) throw new Error('Город не найден');

        const weatherResponse = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${city.latitude}&longitude=${city.longitude}&current=temperature_2m&timezone=auto`
        );
        if (!weatherResponse.ok) throw new Error(`Ошибка загрузки погоды: ${weatherResponse.status}`);

        const weatherData = await weatherResponse.json();
        if (weatherCity) weatherCity.textContent = `${city.name}${city.country ? ', ' + city.country : ''}`;
        if (weatherTemp) weatherTemp.textContent = `Температура: ${weatherData.current.temperature_2m} ${weatherData.current_units.temperature_2m}`;
    } catch (error) {
        console.error('Ошибка получения погоды:', error);
        if (weatherCity) weatherCity.textContent = error.message;
        if (weatherTemp) weatherTemp.textContent = '';
    }
};

if (weatherInput && weatherButton) {
    weatherButton.addEventListener('click', () => searchWeather(weatherInput.value));
    weatherInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') searchWeather(weatherInput.value);
    });
}

// ---------- FETCH POSTS ----------

const loadPosts = async () => {
    try {
        const posts = await getData('posts');
        console.log('Posts:', posts);
    } catch (error) {
        console.error('Не удалось загрузить posts:', error);
    }
};

loadPosts();
