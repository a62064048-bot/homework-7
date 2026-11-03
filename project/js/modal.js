// ---------- MODAL ----------

const modal = document.querySelector('.modal')
const modalCloseButton = document.querySelector('.modal_close')
const modalOpenButton = document.querySelector('#btn-get')

const MODAL_TIMEOUT = 10000 // 10 секунд

const openModal = () => {
    modal.style.display = 'block'
}

const closeModal = () => {
    modal.style.display = 'none'
}

if (modal) {
    // кнопка "Click me!" и закрытие (крестик или клик по тёмному фону)
    if (modalOpenButton) modalOpenButton.onclick = openModal
    if (modalCloseButton) modalCloseButton.onclick = closeModal
    modal.onclick = (event) => {
        if (event.target === modal || event.target.classList.contains('modal_dialog')) {
            closeModal()
        }
    }

    // ЗАДАНИЕ 3: модальное окно через 10 секунд после открытия сайта
    setTimeout(openModal, MODAL_TIMEOUT)

    // ЗАДАНИЕ 2: модальное окно при прокрутке до конца страницы — только один раз
    const openModalOnScrollEnd = () => {
        const scrolledToEnd =
            window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 1

        if (scrolledToEnd) {
            openModal()
            // удаляем слушатель, поэтому повторно окно уже не откроется
            window.removeEventListener('scroll', openModalOnScrollEnd)
        }
    }

    window.addEventListener('scroll', openModalOnScrollEnd)
}
