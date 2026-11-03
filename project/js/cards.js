const postsList = document.querySelector('#posts-list');
const postsStatus = document.querySelector('#posts-status');

const loadPosts = async () => {
    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/posts');

        if (!response.ok) {
            throw new Error(`Ошибка сервера: ${response.status}`);
        }

        const posts = await response.json();

        postsList.innerHTML = '';
        const fragment = document.createDocumentFragment();

        posts.forEach((post) => {
            const article = document.createElement('article');
            article.className = 'post-card';

            const user = document.createElement('span');
            user.className = 'post-user';
            user.textContent = `Пользователь №${post.userId}`;

            const title = document.createElement('h2');
            title.textContent = post.title;

            const body = document.createElement('p');
            body.textContent = post.body;

            const id = document.createElement('span');
            id.className = 'post-id';
            id.textContent = `Публикация #${post.id}`;

            article.append(user, title, body, id);
            fragment.append(article);
        });

        postsList.append(fragment);
        postsStatus.textContent = `Загружено карточек: ${posts.length}`;
    } catch (error) {
        console.error('Ошибка загрузки карточек:', error);
        postsStatus.textContent = 'Не удалось загрузить карточки. Проверьте подключение к интернету и обновите страницу.';
    }
};

loadPosts();
