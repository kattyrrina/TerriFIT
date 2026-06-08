document.addEventListener('DOMContentLoaded', function () {
    setTimeout(() => {
        initAchievementsPage();
    }, 100);

    function initAchievementsPage() {
        if (typeof window.fitnessDB === 'undefined') {
            console.error('❌ Ошибка: fitnessDB не загружен!');
            return;
        }

        if (typeof window.AppDatabase === 'undefined') {
            console.error('❌ Ошибка: AppDatabase не загружен!');
            return;
        }

        const currentUser = window.fitnessDB.getCurrentUser();
        if (!currentUser) {
            window.location.href = 'login.html';
            return;
        }

        console.log('✅ Загружаем страницу наград для:', currentUser.firstName, currentUser.lastName);
        console.log('📊 База наград загружена');

        loadAllAchievements(currentUser);
        initCarousels();
        initModal();
        initLogout();
        initSearch();
    }

    let userAchievements = [];
    // Проверка глобального поиска при загрузке страницы
    function checkGlobalSearch() {
        const searchResult = sessionStorage.getItem('globalSearchResult');
        if (searchResult) {
            sessionStorage.removeItem('globalSearchResult');
            try {
                const data = JSON.parse(searchResult);
                if (data.type === 'achievement' && data.results && data.results.length > 0) {
                    setTimeout(() => {
                        if (data.results.length === 1) {
                            const achievement = data.results[0];
                            const isEarned = window.AppDatabase.isAchievementEarned(achievement.id, userAchievements);
                            const earnedDate = isEarned ? userAchievements.find(a => a.id === achievement.id)?.earnedAt : null;
                            showAchievementCard(achievement, isEarned, earnedDate);
                        } else {
                            showSearchResultsList(data.results, data.query);
                        }
                    }, 500);
                }
            } catch (e) {
                console.error('Ошибка:', e);
            }
        }
    }

    // Вызвать после загрузки страницы
    setTimeout(() => {
        checkGlobalSearch();
    }, 200);
    function loadAllAchievements(currentUser) {
        const user = window.fitnessDB.getUserById(currentUser.id);

        // Получаем достижения и сортируем от новых к старым
        let rawAchievements = window.AppDatabase.enrichUserAchievements(user.achievements || []);

        // Функция для правильного парсинга даты
        function parseDate(dateString) {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                const parts = dateString.split('T')[0].split('-');
                if (parts.length === 3) {
                    return new Date(parts[0], parts[1] - 1, parts[2], 23, 59, 59);
                }
                return new Date(0);
            }
            return date;
        }

        // Сортируем от новых к старым
        userAchievements = rawAchievements.sort((a, b) => {
            const dateA = parseDate(a.earnedAt);
            const dateB = parseDate(b.earnedAt);
            return dateB - dateA;
        });

        document.getElementById('my-achievements-count').textContent = userAchievements.length;
        document.getElementById('earned-count').textContent = userAchievements.length;
        document.getElementById('total-points').textContent = window.AppDatabase.calculateTotalPoints(userAchievements);

        const stats = window.AppDatabase.getAchievementsStats();
        document.getElementById('common-count').textContent = stats.common;
        document.getElementById('rare-count').textContent = stats.rare;
        document.getElementById('super-count').textContent = stats.superRare;

        const totalCountElement = document.getElementById('total-count');
        if (totalCountElement) {
            totalCountElement.style.display = 'none';
        }

        renderMyAchievements();
        renderAchievementCarousel('common', window.AppDatabase.achievements.common);
        renderAchievementCarousel('rare', window.AppDatabase.achievements.rare);
        renderAchievementCarousel('super', window.AppDatabase.achievements.superRare);
    }

    function renderMyAchievements() {
        const carousel = document.getElementById('my-achievements-carousel');
        if (!carousel) return;

        carousel.innerHTML = '';

        if (!userAchievements.length) {
            carousel.innerHTML = `
            <div class="no-achievements-message">
                <p>У вас пока нет наград</p>
            </div>
        `;
            return;
        }

        [...userAchievements].sort((a, b) => new Date(b.earnedAt) - new Date(a.earnedAt))
            .forEach(a => carousel.appendChild(createAchievementElement(a, true)));
    }
    function renderAchievementCarousel(categoryId, achievements) {
        const carousel = document.getElementById(`${categoryId}-achievements-carousel`);
        if (!carousel) return;

        carousel.innerHTML = '';

        if (achievements.length === 0) {
            carousel.innerHTML = `
            <div class="no-achievements-message">
                <p>Нет наград в этой категории</p>
            </div>
        `;
            return;
        }

        achievements.forEach(a => {
            const isEarned = window.AppDatabase.isAchievementEarned(a.id, userAchievements);
            carousel.appendChild(createAchievementElement(a, isEarned));
        });
    }
    function createAchievementElement(achievement, isEarned) {
        const el = document.createElement('div');
        el.className = `achievement ${achievement.rarity || ''}`;
        el.dataset.id = achievement.id;
        el.dataset.earned = isEarned ? 'true' : 'false';

        const earnedDate = isEarned ? userAchievements.find(a => a.id === achievement.id)?.earnedAt : null;
        el.dataset.achievement = JSON.stringify({ ...achievement, earnedAt: earnedDate });

        const contentDiv = document.createElement('div');
        contentDiv.className = 'achievement-content';

        if (isEarned && achievement.image) {
            contentDiv.innerHTML = `<img src="images/rewards/${achievement.image}" alt="${achievement.name}" class="achievement-image">`;
        } else if (isEarned && achievement.icon) {
            contentDiv.innerHTML = `<i class="fas ${achievement.icon} achievement-icon"></i>`;
        } else {
            contentDiv.innerHTML = '<i class="fas fa-lock achievement-lock"></i>';
        }

        el.appendChild(contentDiv);
        el.addEventListener('click', () => showAchievementCard(achievement, isEarned, earnedDate));

        return el;
    }
    function showAchievementCard(achievement, isEarned, earnedDate) {
        const modal = document.getElementById('achievement-modal');

        document.getElementById('modal-img').src = achievement.image ?
            `images/rewards/${achievement.image}` : 'images/reward_placeholder.png';

        document.getElementById('modal-rarity').textContent = achievement.rarityName ||
            (achievement.rarity === 'common' ? 'Обычная' :
                achievement.rarity === 'rare' ? 'Редкая' : 'Супер редкая');

        document.getElementById('modal-rarity-badge').className =
            `achievement-card-rarity rarity-${achievement.rarity || 'common'}`;

        document.getElementById('modal-title').textContent = achievement.name;
        document.getElementById('modal-unique-id').textContent = achievement.uniqueId || achievement.id;
        document.getElementById('modal-points').textContent = achievement.points || 0;
        document.getElementById('modal-description').textContent = achievement.description || 'Нет описания';

        if (isEarned && earnedDate) {
            const date = new Date(earnedDate);
            document.getElementById('modal-date').textContent = date.toLocaleDateString('ru-RU', {
                day: 'numeric', month: 'long', year: 'numeric'
            });
            document.getElementById('modal-date-container').style.display = 'flex';
        } else {
            document.getElementById('modal-date-container').style.display = 'none';
        }

        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
    function initModal() {
        const modal = document.getElementById('achievement-modal');
        const closeBtn = document.getElementById('close-modal');

        function closeModal() {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }

        closeBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape' && modal.style.display === 'flex') closeModal();
        });
    }
    function initCarousels() {
        ['my', 'common', 'rare', 'super'].forEach(category => {
            const carousel = document.getElementById(`${category}-achievements-carousel`);
            const prevBtn = document.getElementById(`${category}-prev`);
            const nextBtn = document.getElementById(`${category}-next`);

            if (!carousel || !prevBtn || !nextBtn) return;

            const scrollAmount = () => (carousel.children[0]?.offsetWidth || 120) * 3;

            prevBtn.addEventListener('click', () =>
                carousel.scrollBy({ left: -scrollAmount(), behavior: 'smooth' }));

            nextBtn.addEventListener('click', () =>
                carousel.scrollBy({ left: scrollAmount(), behavior: 'smooth' }));
        });
    }

    function initSearch() {
        const searchInput = document.querySelector('.search-bar input');
        if (!searchInput) return;

        searchInput.addEventListener('keypress', e => {
            if (e.key === 'Enter') {
                const query = e.target.value.trim();
                performSearch(query);
                setTimeout(() => e.target.value = '', 100);
            }
        });
    }

    function performSearch(query) {
        if (!query || query.length < 2) {
            showSearchResult(null, 'Введите минимум 2 символа');
            return;
        }

        const results = window.AppDatabase.searchAchievements(query);

        console.log('🔍 Найдено результатов:', results.length);

        if (results.length === 1) {
            showSearchAchievementCard(results[0]);
        } else if (results.length > 1) {
            showSearchResultsList(results, query);
        } else {
            showSearchResult(null, `Награда "${query}" не найдена`);
        }
    }

    function showSearchAchievementCard(achievement) {
        const isEarned = window.AppDatabase.isAchievementEarned(achievement.id, userAchievements);
        const earnedDate = isEarned ? userAchievements.find(a => a.id === achievement.id)?.earnedAt : null;
        showAchievementCard(achievement, isEarned, earnedDate);
    }

    function showSearchResultsList(results, query) {
        // Удаляем старые модальные окна
        const oldModal = document.querySelector('.search-results-modal');
        if (oldModal) oldModal.remove();

        const modal = document.createElement('div');
        modal.className = 'modal-overlay search-results-modal';
        modal.style.display = 'flex';

        modal.innerHTML = `
        <div class="modal search-results-modal-content">
            <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                <i class="fas fa-times"></i>
            </button>
            <h2 class="search-results-title">Результаты поиска: "${query}"</h2>
            <div class="search-results-list">
                ${results.map(ach => {
            const isEarned = window.AppDatabase.isAchievementEarned(ach.id, userAchievements);
            // Убираем показ награды - показываем только название
            return `
                        <div class="search-result-item achievement ${isEarned ? 'earned' : 'not-earned'} ${ach.rarity}" data-id="${ach.id}">
                            <!-- Убираем result-image -->
                            <div class="result-info">
                                <div class="result-name">${ach.name}</div>
                                <div class="result-id">${ach.uniqueId || ach.id}</div>
                                <div class="result-rarity ${ach.rarity}">${ach.rarityName || (ach.rarity === 'common' ? 'Обычная' : ach.rarity === 'rare' ? 'Редкая' : 'Супер редкая')}</div>
                            </div>
                            ${isEarned ? '<div class="result-earned">✓ Получено</div>' : '<div class="result-not-earned">Не получено</div>'}
                        </div>
                    `;
        }).join('')}
            </div>
        </div>
    `;

        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
                document.body.style.overflow = 'auto';
            }
        });

        modal.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('click', () => {
                const id = parseInt(item.dataset.id);
                const achievement = results.find(a => a.id === id);
                if (achievement) {
                    modal.remove();
                    document.body.style.overflow = 'auto';
                    const isEarned = window.AppDatabase.isAchievementEarned(achievement.id, userAchievements);
                    const earnedDate = isEarned ? userAchievements.find(a => a.id === achievement.id)?.earnedAt : null;
                    showAchievementCard(achievement, isEarned, earnedDate);
                }
            });
        });
    }

    function showSearchResult(_, message) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay search-message-modal';
        modal.style.display = 'flex';

        modal.innerHTML = `
            <div class="modal search-message-modal-content">
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                    <i class="fas fa-times"></i>
                </button>
                <div class="search-message-icon"><i class="fas fa-search"></i></div>
                <h3 class="search-message-title">${message}</h3>
            </div>`;

        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';

        setTimeout(() => {
            if (modal.parentNode) {
                modal.remove();
                document.body.style.overflow = 'auto';
            }
        }, 3000);
    }

    function initLogout() {
        document.querySelector('#logout-btn')?.addEventListener('click', e => {
            e.preventDefault();
            window.fitnessDB.logout();
            window.location.href = 'login.html';
        });
    }
});