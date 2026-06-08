document.addEventListener('DOMContentLoaded', function () {
    setTimeout(() => {
        initChallengesPage();
    }, 100);

    function initChallengesPage() {
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
            console.log('⏭ Пользователь не авторизован, перенаправление на login.html');
            window.location.href = 'login.html';
            return;
        }

        console.log('✅ Загружаем страницу челленджей для:', currentUser.firstName, currentUser.lastName);
        console.log('📊 База челленджей загружена');

        loadAllChallenges(currentUser);
        initFilters();
        initPagination();
        initSearch();
        initChallengeModal();
        initRefreshRecommended();
        initLogout();
        checkAndShowCompletionNotification();
    }

    let userActiveChallenges = [];
    let userCompletedChallenges = [];
    let currentFilters = { type: '', difficulty: '', reward: '', duration: '' };
    let currentPage = 1;
    let allChallengesList = [];
    // const itemsPerPage = 8;
    // Проверка глобального поиска при загрузке страницы
    function checkGlobalSearch() {
        const searchResult = sessionStorage.getItem('globalSearchResult');
        if (searchResult) {
            sessionStorage.removeItem('globalSearchResult');
            try {
                const data = JSON.parse(searchResult);
                if (data.type === 'challenge' && data.results && data.results.length > 0) {
                    setTimeout(() => {
                        if (data.results.length === 1) {
                            const challenge = data.results[0];
                            const isActive = userActiveChallenges && userActiveChallenges.some(ac => ac.id === challenge.id);
                            if (isActive) {
                                const userC = userActiveChallenges.find(ac => ac.id === challenge.id);
                                showChallengeModal({ ...challenge, ...userC }, 'active');
                            } else {
                                showChallengeModal(challenge, 'available');
                            }
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
    // Добавьте функцию для определения количества элементов на странице:
    function getItemsPerPage() {
        if (window.innerWidth <= 768) {
            return 4; // мобильная версия
        }
        return 8; // десктопная версия
    }
    function checkAndShowCompletionNotification() {
        // Проверяем уведомление о завершении челленджа
        const notificationData = sessionStorage.getItem('challengeCompleteNotification');
        if (notificationData) {
            sessionStorage.removeItem('challengeCompleteNotification');
            try {
                const data = JSON.parse(notificationData);
                setTimeout(() => {
                    if (typeof window.showNotification === 'function') {
                        window.showNotification(`🎉 Вы получили награду: ${data.title}! (+${data.reward} очков)`, 'reward');
                    }
                }, 500);
            } catch (e) {
                console.error('Ошибка при показе уведомления о награде:', e);
            }
        }

        // Проверяем уведомление о повышении уровня
        const levelData = sessionStorage.getItem('levelUpNotification');
        if (levelData) {
            sessionStorage.removeItem('levelUpNotification');
            try {
                const data = JSON.parse(levelData);
                setTimeout(() => {
                    if (typeof window.showNotification === 'function') {
                        window.showNotification(`✨ Поздравляем! Вы достигли ${data.level} уровня!`, 'levelup');
                    }
                }, 800);
            } catch (e) {
                console.error('Ошибка при показе уведомления об уровне:', e);
            }
        }
    }

    let itemsPerPage = getItemsPerPage();
    let currentSelectedChallenge = null;

    function loadAllChallenges(currentUser) {
        const user = window.fitnessDB.getUserById(currentUser.id);

        userActiveChallenges = window.AppDatabase.enrichUserChallenges(user.activeChallenges || []);
        userCompletedChallenges = window.AppDatabase.enrichUserChallenges(user.completedChallenges || []);

        // Сохраняем все челленджи в случайном порядке
        allChallengesList = [...window.AppDatabase.challenges];
        // Перемешиваем массив для случайного порядка
        for (let i = allChallengesList.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [allChallengesList[i], allChallengesList[j]] = [allChallengesList[j], allChallengesList[i]];
        }

        document.getElementById('active-challenges-count').querySelector('strong').textContent = userActiveChallenges.length;
        document.getElementById('completed-challenges-count').querySelector('strong').textContent = userCompletedChallenges.length;

        renderRecommendedChallenges();
        renderAllChallenges();
    }

    function renderRecommendedChallenges() {
        const container = document.getElementById('recommended-grid');
        if (!container) return;

        container.innerHTML = '';

        const user = window.fitnessDB.getUserById(window.fitnessDB.getCurrentUser().id);
        const recommended = window.AppDatabase.getRecommendedChallenges(user, 2);

        if (recommended.length === 0) {
            container.innerHTML = '<p class="empty-message">Нет доступных рекомендаций</p>';
            return;
        }

        recommended.forEach(challenge => {
            const card = createChallengeCard(challenge, 'available');
            container.appendChild(card);
        });
    }

    function renderAllChallenges() {
        const grid = document.getElementById('all-challenges-grid');
        if (!grid) return;

        grid.innerHTML = '';

        // Берем все челленджи из базы
        let challengesToShow = [...allChallengesList];

        // Применяем фильтры (если они есть)
        let filteredChallenges = [...challengesToShow];

        // Фильтр по типу
        if (currentFilters.type && currentFilters.type !== '') {
            filteredChallenges = filteredChallenges.filter(c => c.type === currentFilters.type);
        }

        // Фильтр по сложности
        if (currentFilters.difficulty && currentFilters.difficulty !== '') {
            filteredChallenges = filteredChallenges.filter(c => c.difficulty === currentFilters.difficulty);
        }

        // Фильтр по редкости награды
        if (currentFilters.reward && currentFilters.reward !== '') {
            filteredChallenges = filteredChallenges.filter(c => c.rewardRarity === currentFilters.reward);
        }

        // Фильтр по длительности
        if (currentFilters.duration && currentFilters.duration !== '') {
            filteredChallenges = filteredChallenges.filter(c => {
                if (currentFilters.duration === 'short' && c.duration <= 7) return true;
                if (currentFilters.duration === 'medium' && c.duration > 7 && c.duration <= 30) return true;
                if (currentFilters.duration === 'long' && c.duration > 30) return true;
                return false;
            });
        }

        // Проверяем, есть ли активные фильтры
        const hasActiveFilters = (currentFilters.type && currentFilters.type !== '') ||
            (currentFilters.difficulty && currentFilters.difficulty !== '') ||
            (currentFilters.reward && currentFilters.reward !== '') ||
            (currentFilters.duration && currentFilters.duration !== '');

        let finalChallenges = [];

        if (hasActiveFilters) {
            // Если есть фильтры - показываем только отфильтрованные
            finalChallenges = filteredChallenges;
            console.log('🎯 Фильтры активны, показываем отфильтрованные:', finalChallenges.length);
        } else {
            // Если фильтров нет - показываем все челленджи
            finalChallenges = challengesToShow;
            console.log('🎯 Нет фильтров, показываем все челленджи:', finalChallenges.length);
        }

        // СОРТИРУЕМ: сначала активные челленджи пользователя, потом остальные
        finalChallenges.sort((a, b) => {
            const aIsActive = userActiveChallenges.some(c => c.id === a.id);
            const bIsActive = userActiveChallenges.some(c => c.id === b.id);

            // Если a активный, а b нет - a выше (возвращаем -1)
            if (aIsActive && !bIsActive) return -1;
            // Если b активный, а a нет - b выше (возвращаем 1)
            if (!aIsActive && bIsActive) return 1;
            // Если оба активные или оба неактивные - сохраняем исходный порядок
            return 0;
        });

        // Пагинация
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedChallenges = finalChallenges.slice(startIndex, endIndex);

        if (paginatedChallenges.length === 0) {
            grid.innerHTML = '<p class="empty-message">Челленджи не найдены</p>';
            updatePagination(0);
            return;
        }

        paginatedChallenges.forEach(challenge => {
            // Проверяем, активен ли челлендж для пользователя
            const isActive = userActiveChallenges.some(c => c.id === challenge.id);

            if (isActive) {
                // Если активен - показываем карточку с прогрессом
                const userC = userActiveChallenges.find(c => c.id === challenge.id);
                const el = createActiveChallengeCard({ ...challenge, ...userC });
                grid.appendChild(el);
            } else {
                // Если не активен - показываем кнопку "Присоединиться"
                const el = createChallengeCard(challenge, 'available');
                grid.appendChild(el);
            }
        });

        updatePagination(finalChallenges.length);
        initProgressRings();
    }
    function createChallengeCard(challenge, status) {
        const div = document.createElement('div');
        div.className = `challenge-item ${challenge.type === 'daily' ? 'daily-challenge' : 'seasonal-challenge'}`;
        div.dataset.id = challenge.id;
        div.dataset.type = challenge.type;
        div.dataset.difficulty = challenge.difficulty;
        div.dataset.reward = challenge.rewardRarity;
        div.dataset.durationDays = challenge.duration;

        div.innerHTML = `
        <div class="challenge-info">
            <h4>${challenge.title}</h4>
            <p>${challenge.description}</p>
            <div class="challenge-stats">
                <div class="challenge-stat">
                    <i class="fas fa-users"></i>
                    <span>${challenge.participants.toLocaleString()} участников</span>
                </div>
                <div class="challenge-stat">
                    <i class="fas fa-calendar"></i>
                    <span>${challenge.duration} ${challenge.duration === 1 ? 'день' : 'дней'}</span>
                </div>
                <div class="challenge-stat">
                    <i class="fas fa-award"></i>
                    <span>+${challenge.reward} очков</span>
                </div>
            </div>
        </div>
        <div class="challenge-status">
            <span class="status-badge status-available">Доступен</span>
            <button class="btn-primary btn-small" onclick="event.stopPropagation(); joinChallenge(${challenge.id})">
                Присоединиться
            </button>
        </div>
    `;

        div.addEventListener('click', (e) => {
            if (e.target.tagName !== 'BUTTON' && !e.target.closest('button')) {
                showChallengeModal(challenge, 'available');
            }
        });

        return div;
    }

    function createActiveChallengeCard(challenge) {
        const div = document.createElement('div');
        div.className = `challenge-item active ${challenge.type === 'daily' ? 'daily-challenge' : 'seasonal-challenge'}`;
        div.dataset.id = challenge.id;
        div.dataset.challenge = JSON.stringify(challenge);

        const progress = Math.round((challenge.current / challenge.total) * 100) || 0;

        div.innerHTML = `
        <div class="challenge-info">
            <h4>${challenge.title}</h4>
            <p>${challenge.description}</p>
            <div class="challenge-stats">
                <div class="challenge-stat">
                    <i class="fas fa-users"></i>
                    <span>${challenge.participants.toLocaleString()} участников</span>
                </div>
                <div class="challenge-stat">
                    <i class="fas fa-calendar"></i>
                    <span>${challenge.duration} ${challenge.duration === 1 ? 'день' : 'дней'}</span>
                </div>
                <div class="challenge-stat">
                    <i class="fas fa-award"></i>
                    <span>+${challenge.reward} очков</span>
                </div>
            </div>
        </div>
        <div class="challenge-status">
            <span class="status-badge status-active">Активный</span>
            <div class="progress-ring" data-progress="${progress}">
                <svg viewBox="0 0 60 60" width="100%" height="100%">
                    <circle class="progress-ring-bg" cx="30" cy="30" r="26"></circle>
                    <circle class="progress-ring-circle" cx="30" cy="30" r="26"></circle>
                </svg>
                <div class="progress-text">${progress}%</div>
            </div>
        </div>
    `;

        div.addEventListener('click', (e) => {
            if (e.target.tagName !== 'BUTTON' && !e.target.closest('button')) {
                showChallengeModal(challenge, 'active');
            }
        });

        return div;
    }

    window.joinChallenge = function (challengeId, keepModalOpen = false) {
        const currentUser = window.fitnessDB.getCurrentUser();
        const user = window.fitnessDB.getUserById(currentUser.id);

        // Проверяем, присоединен ли уже пользователь
        const alreadyJoined = user.activeChallenges.some(c => c.id === challengeId);

        if (alreadyJoined) {
            // Если уже присоединен, открываем модалку с этим челленджем
            const challenge = window.AppDatabase.findChallengeById(challengeId);
            const userChallenge = user.activeChallenges.find(c => c.id === challengeId);
            if (challenge && userChallenge) {
                showChallengeModal({ ...challenge, ...userChallenge }, 'active');
            }
            return;
        }

        // Присоединяемся к челленджу
        const challenge = window.AppDatabase.findChallengeById(challengeId);

        const newChallenge = {
            id: challengeId,
            title: challenge.title,
            description: challenge.description,
            participants: challenge.participants,
            duration: challenge.duration,
            total: challenge.duration,
            reward: challenge.reward,
            rewardRarity: challenge.rewardRarity,
            rewardRarityName: challenge.rewardRarityName,
            rewardId: challenge.rewardId,
            current: 0,
            joinedAt: new Date().toISOString(),
            status: 'active'
        };

        user.activeChallenges.push(newChallenge);
        window.fitnessDB.updateUser(user.id, { activeChallenges: user.activeChallenges });
        window.fitnessDB.setCurrentUser(user, true);

        console.log(`✅ Вы присоединились к челленджу "${challenge.title}"!`);

        // ОТКРЫВАЕМ МОДАЛКУ СРАЗУ (без перезагрузки)
        const updatedUser = window.fitnessDB.getUserById(currentUser.id);
        const updatedChallenge = updatedUser.activeChallenges.find(c => c.id === challengeId);
        if (updatedChallenge) {
            showChallengeModal({ ...challenge, ...updatedChallenge }, 'active');
        }
    };

    function canMarkChallengeToday(challengeId) {
        const currentUser = window.fitnessDB.getCurrentUser();
        const user = window.fitnessDB.getUserById(currentUser.id);

        const today = new Date().toDateString();
        const lastMarkedDate = user.lastChallengeMark?.[challengeId] ?
            new Date(user.lastChallengeMark[challengeId]).toDateString() : null;

        return lastMarkedDate !== today;
    }

    function getAvatarUrl(avatar, gender) {
        if (avatar && avatar.startsWith('data:image')) return avatar;
        if (avatar) return `images/${avatar}`;
        return gender === 'male' ? 'images/man.png' : 'images/woman.png';
    }

    function showInviteFriendModal(challenge) {
        const modal = document.getElementById('invite-friend-modal');
        if (!modal) return;

        document.getElementById('invite-challenge-name').textContent = challenge.title;
        document.getElementById('invite-challenge-reward').textContent = challenge.reward;
        document.getElementById('invite-challenge-duration').textContent = challenge.duration;
        document.getElementById('invite-challenge-name').dataset.id = challenge.id;

        // Показываем сообщение о необходимости ввести поиск (список пуст)
        const container = document.getElementById('invite-users-list');
        container.innerHTML = `
    `;

        // Добавляем обработчик поиска
        const searchInput = document.getElementById('invite-search');
        if (searchInput) {
            // Очищаем поле ввода
            searchInput.value = '';

            // Убираем старый обработчик, чтобы не дублировался
            const newSearchInput = searchInput.cloneNode(true);
            searchInput.parentNode.replaceChild(newSearchInput, searchInput);

            newSearchInput.addEventListener('input', function (e) {
                const query = e.target.value.trim();
                loadUsersForInvite(challenge.id, query);
            });
        }

        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    function loadUsersForInvite(challengeId, query = '') {
        const currentUser = window.fitnessDB.getCurrentUser();
        const allUsers = window.fitnessDB.getAllUsers();
        const container = document.getElementById('invite-users-list');

        // Если поисковый запрос пустой или меньше 2 символов - не показываем ничего
        if (!query || query.length < 2) {
            container.innerHTML = `
            <div class="no-users">
                <i class="fas fa-search" style="font-size: 40px; margin-bottom: 10px; display: block;"></i>
                <p>Введите имя или логин для поиска</p>
                <p style="font-size: 12px; margin-top: 5px;">Минимум 2 символа</p>
            </div>
        `;
            return;
        }

        // Фильтруем пользователей по поисковому запросу
        let users = allUsers
            .filter(u => u.id !== currentUser.id) // исключаем текущего пользователя
            .filter(u => {
                if (u.privacy?.privateProfile) return false; // исключаем приватные профили

                const searchQuery = query.toLowerCase().trim();
                const displayName = u.privacy?.hideRealName
                    ? (u.privacy.displayName || u.username).toLowerCase()
                    : `${u.firstName} ${u.lastName}`.toLowerCase();

                return displayName.includes(searchQuery) ||
                    u.username.toLowerCase().includes(searchQuery);
            })
            .map(u => ({
                id: u.id,
                displayName: u.privacy?.hideRealName
                    ? (u.privacy.displayName || u.username)
                    : `${u.firstName} ${u.lastName}`,
                username: u.username,
                level: u.level || 1,
                avatar: u.avatar,
                gender: u.gender
            }));

        // Если никого не найдено
        if (users.length === 0) {
            container.innerHTML = `
            <div class="no-users">
                <i class="fas fa-user-slash" style="font-size: 40px; margin-bottom: 10px; display: block;"></i>
                <p>Пользователь "${query}" не найден</p>
                <p style="font-size: 12px; margin-top: 5px;">Проверьте имя или логин</p>
            </div>
        `;
            return;
        }

        // Отображаем найденных пользователей
        container.innerHTML = users.map(user => `
        <div class="invite-user-card">
            <img src="${getAvatarUrl(user.avatar, user.gender)}" class="invite-user-avatar">
            <div class="invite-user-info">
                <div class="invite-user-name">${user.displayName}</div>
                <div class="invite-user-level">Уровень ${user.level}</div>
                <div class="invite-user-username" style="font-size: 10px; color: #94a3b8;">@${user.username}</div>
            </div>
            <button class="btn-invite" onclick="sendInvite(${user.id}, ${challengeId})">
                <i class="fas fa-paper-plane"></i> Пригласить
            </button>
        </div>
    `).join('');
    }

    window.sendInvite = function (toUserId, challengeId) {
        console.log('📨 sendInvite вызван', { toUserId, challengeId });

        const currentUser = window.fitnessDB.getCurrentUser();

        if (typeof window.fitnessDB.sendChallengeInvite === 'function') {
            const result = window.fitnessDB.sendChallengeInvite(currentUser.id, toUserId, challengeId);

            console.log('📨 Результат отправки:', result);

            if (result) {
                alert('✅ Приглашение отправлено! Пользователь получит уведомление.');
                document.getElementById('invite-friend-modal').style.display = 'none';
                document.body.style.overflow = 'auto';
            } else {
                alert('❌ Не удалось отправить приглашение');
            }
        } else {
            console.error('❌ Метод sendChallengeInvite не найден в fitnessDB');
            alert('📨 Функция приглашений временно недоступна');
        }
    };

    // ========== ПОКАЗ МОДАЛЬНОГО ОКНА ЧЕЛЛЕНДЖА ==========
    function showChallengeModal(challenge, status) {
        const modal = document.getElementById('challenge-modal');
        if (!modal) return;

        currentSelectedChallenge = { ...challenge, status };

        setModalText('modal-challenge-title', challenge.title);
        setModalText('modal-challenge-description', challenge.longDescription || challenge.description);
        setModalText('modal-challenge-type', challenge.typeName ||
            (challenge.type === 'daily' ? 'Ежедневный' : 'Сезонный'));
        setModalText('modal-challenge-difficulty', challenge.difficultyName ||
            (challenge.difficulty === 'beginner' ? 'Начальный' :
                challenge.difficulty === 'intermediate' ? 'Средний' : 'Экспертный'));
        setModalText('modal-challenge-duration', challenge.durationText ||
            `${challenge.duration} ${challenge.duration === 1 ? 'день' : 'дней'}`);
        setModalText('modal-challenge-points', challenge.reward);
        setModalText('modal-challenge-participants', challenge.participants.toLocaleString());

        const typeBadge = document.getElementById('modal-challenge-type-badge');
        typeBadge.className = `challenge-detail-type-badge ${challenge.type || 'seasonal'}`;

        const statusBadge = document.getElementById('modal-challenge-status');
        const statusContainer = document.getElementById('modal-challenge-status-badge');

        if (status === 'active') {
            statusBadge.textContent = 'Активный';
            statusContainer.className = 'status-badge status-active';
        } else if (status === 'available') {
            statusBadge.textContent = 'Доступен';
            statusContainer.className = 'status-badge status-available';
        }

        const rewardBadge = document.getElementById('modal-reward-rarity-badge');
        rewardBadge.className = `reward-rarity-badge ${challenge.rewardRarity || 'common'}`;
        setModalText('modal-reward-rarity', challenge.rewardRarityName ||
            (challenge.rewardRarity === 'common' ? 'Обычная' :
                challenge.rewardRarity === 'rare' ? 'Редкая' : 'Супер редкая'));
        setModalText('modal-reward-id', challenge.rewardId || `RWD-${challenge.id}`);
        setModalText('modal-reward-points', challenge.reward);

        const progressSection = document.getElementById('modal-progress-section');
        if (status === 'active') {
            const current = challenge.current || 0;
            const total = challenge.total || challenge.duration;
            const progressPercent = Math.round((current / total) * 100);

            setModalText('modal-progress-days', `${current}/${total}`);
            document.getElementById('modal-progress-bar').style.width = `${progressPercent}%`;
            progressSection.style.display = 'block';
        } else {
            progressSection.style.display = 'none';
        }

        document.getElementById('early-completion-warning').style.display = 'none';
        generateActionButtons(challenge, status);

        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    function setModalText(id, text) {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    }

    function generateActionButtons(challenge, status) {
        const actionsContainer = document.getElementById('modal-actions');
        actionsContainer.innerHTML = '';

        if (status === 'active') {
            const userChallenge = userActiveChallenges.find(c => c.id === challenge.id);

            if (challenge.isDaily || challenge.duration === 1) {
                const completeBtn = document.createElement('button');
                completeBtn.className = 'btn-primary';
                completeBtn.style.flex = '1';
                completeBtn.textContent = '✅ Завершить челлендж';
                completeBtn.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    completeDailyChallenge(challenge.id);
                };
                actionsContainer.appendChild(completeBtn);
            } else {
                const current = userChallenge?.current || 0;
                const total = userChallenge?.total || challenge.duration;

                const canMarkToday = canMarkChallengeToday(challenge.id);

                const markDayBtn = document.createElement('button');
                markDayBtn.className = `btn-primary ${!canMarkToday ? 'disabled' : ''}`;
                markDayBtn.style.flex = '1';
                markDayBtn.textContent = canMarkToday ?
                    `Отметить день ${current + 1}/${total}` :
                    'Сегодня уже отмечено';
                markDayBtn.disabled = !canMarkToday;
                markDayBtn.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (canMarkToday) {
                        markChallengeDay(challenge.id, true); // передаем true - не закрывать модалку
                    }
                };
                actionsContainer.appendChild(markDayBtn);

                const earlyCompleteBtn = document.createElement('button');
                earlyCompleteBtn.className = 'btn-secondary';
                earlyCompleteBtn.style.flex = '1';
                earlyCompleteBtn.textContent = 'Завершить досрочно';
                earlyCompleteBtn.onclick = () => showEarlyCompletionWarning(challenge.id);
                actionsContainer.appendChild(earlyCompleteBtn);
            }
        } else if (status === 'available') {
            const joinBtn = document.createElement('button');
            joinBtn.className = 'btn-primary';
            joinBtn.style.flex = '1';
            joinBtn.textContent = 'Присоединиться';
            joinBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                joinChallenge(challenge.id, true); // false = закрыть модалку и обновить
            };
            actionsContainer.appendChild(joinBtn);

            const inviteFriendBtn = document.createElement('button');
            inviteFriendBtn.className = 'btn-secondary';
            inviteFriendBtn.style.marginTop = '10px';
            inviteFriendBtn.style.width = '100%';
            inviteFriendBtn.innerHTML = '<i class="fas fa-user-plus"></i> Кинуть вызов другу';
            inviteFriendBtn.onclick = () => {
                document.getElementById('challenge-modal').style.display = 'none';
                showInviteFriendModal(challenge);
            };
            actionsContainer.appendChild(inviteFriendBtn);
        }
    }
    function showNotification(message, type = 'reward') {
        // Удаляем старые уведомления
        const oldNotification = document.querySelector('.notification-toast');
        if (oldNotification) oldNotification.remove();

        const notification = document.createElement('div');
        notification.className = 'notification-toast';

        if (type === 'levelup') {
            notification.style.background = 'linear-gradient(135deg, #10b981, #059669)';
        } else {
            notification.style.background = 'linear-gradient(135deg, #f59e0b, #8b5cf6)';
        }

        notification.innerHTML = `<span>${message}</span>`;
        document.body.appendChild(notification);

        // Показываем с анимацией
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 10);

        // Устанавливаем таймер на 5 секунд (не 6)
        const timeoutId = setTimeout(() => {
            if (notification && notification.parentNode) {
                notification.style.opacity = '0';
                notification.style.transform = 'translateX(100px)';
                notification.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                setTimeout(() => {
                    if (notification && notification.parentNode) notification.remove();
                }, 300);
            }
        }, 3000); // 5 секунд

        // Сохраняем timeout для возможности отмены
        notification.dataset.timeoutId = timeoutId;
    }

    function completeDailyChallenge(challengeId) {
        const currentUser = window.fitnessDB.getCurrentUser();
        const user = window.fitnessDB.getUserById(currentUser.id);
        const challengeIndex = user.activeChallenges.findIndex(c => c.id === challengeId);
        if (challengeIndex === -1) return;

        const challenge = user.activeChallenges[challengeIndex];
        const challengeData = window.AppDatabase.findChallengeById(challengeId);

        const reward = window.AppDatabase.getRewardForChallenge(challengeId);

        const newAchievement = {
            id: challengeData.id,
            name: challengeData.title,
            icon: 'fa-trophy',
            image: reward ? reward.image : 'reward_challenge.png',
            earnedAt: new Date().toISOString(),
            points: challengeData.reward,
            rarity: challengeData.rewardRarity,
            rarityName: challengeData.rewardRarityName,
            uniqueId: `${challengeData.rewardId}_${Date.now()}`,
            description: `Завершен челлендж "${challengeData.title}"`,
            challengeId: challengeData.id,
            challengeTitle: challengeData.title
        };

        user.achievements = user.achievements || [];
        user.achievements.push(newAchievement);

        user.pointTransactions = user.pointTransactions || [];
        user.pointTransactions.push({
            id: Date.now(),
            itemId: challengeId,
            itemName: challengeData.title,
            points: challengeData.reward,
            date: new Date().toISOString(),
            type: 'achievement'
        });

        const completedChallenge = {
            ...challenge,
            completedAt: new Date().toISOString(),
            status: 'completed'
        };

        user.completedChallenges = user.completedChallenges || [];
        user.completedChallenges.push(completedChallenge);
        user.activeChallenges.splice(challengeIndex, 1);

        user.stats = user.stats || { trainings: 0, calories: 0, steps: 0, progress: 0 };
        user.stats.trainings = (user.stats.trainings || 0) + 1;

        if (typeof calculateLevel === 'function') {
            const newLevel = calculateLevel(user);
            if (newLevel !== user.level) {
                user.level = newLevel;
            }
        }

        window.fitnessDB.updateUser(user.id, {
            activeChallenges: user.activeChallenges,
            completedChallenges: user.completedChallenges,
            achievements: user.achievements,
            pointTransactions: user.pointTransactions,
            stats: user.stats,
            level: user.level
        });

        window.fitnessDB.setCurrentUser(user, true);

        // Сохраняем информацию об уведомлении в sessionStorage
        const notificationData = {
            title: challengeData.title,
            reward: challengeData.reward,
            timestamp: Date.now()
        };
        sessionStorage.setItem('challengeCompleteNotification', JSON.stringify(notificationData));

        // Закрываем модальное окно
        const modal = document.getElementById('challenge-modal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }

        // Перезагружаем страницу
        window.location.reload();
    }

    function markChallengeDay(challengeId, keepModalOpen = true) {
        const currentUser = window.fitnessDB.getCurrentUser();
        const user = window.fitnessDB.getUserById(currentUser.id);
        const challengeIndex = user.activeChallenges.findIndex(c => c.id === challengeId);
        if (challengeIndex === -1) return;

        if (!canMarkChallengeToday(challengeId)) {
            alert('❌ Вы уже отмечали этот челлендж сегодня!');
            return;
        }

        const challenge = user.activeChallenges[challengeIndex];
        challenge.current = Math.min((challenge.current || 0) + 1, challenge.total);

        user.lastChallengeMark = user.lastChallengeMark || {};
        user.lastChallengeMark[challengeId] = new Date().toISOString();

        if (challenge.current >= challenge.total) {
            // ========== ЗАВЕРШЕНИЕ ЧЕЛЛЕНДЖА ==========
            const reward = window.AppDatabase.getRewardForChallenge(challengeId);

            const newAchievement = {
                id: challengeId,
                name: challenge.title,
                icon: 'fa-trophy',
                image: reward ? reward.image : 'reward_challenge.png',
                earnedAt: new Date().toISOString(),
                points: challenge.reward,
                rarity: challenge.rewardRarity || 'common',
                rarityName: challenge.rewardRarityName || 'Обычная',
                uniqueId: `${challenge.rewardId || `RWD-${challengeId}`}_${Date.now()}`,
                description: `Завершен челлендж "${challenge.title}"`,
                challengeId: challengeId,
                challengeTitle: challenge.title
            };

            user.achievements = user.achievements || [];
            user.achievements.push(newAchievement);

            user.pointTransactions = user.pointTransactions || [];
            user.pointTransactions.push({
                id: Date.now(),
                itemId: challengeId,
                itemName: challenge.title,
                points: challenge.reward,
                date: new Date().toISOString(),
                type: 'achievement'
            });

            // Сохраняем информацию об уведомлении в sessionStorage
            const notificationData = {
                title: challenge.title,
                reward: challenge.reward,
                timestamp: Date.now()
            };
            sessionStorage.setItem('challengeCompleteNotification', JSON.stringify(notificationData));

            // Завершаем челлендж
            const completedChallenge = {
                ...challenge,
                completedAt: new Date().toISOString(),
                status: 'completed'
            };

            user.completedChallenges = user.completedChallenges || [];
            user.completedChallenges.push(completedChallenge);
            user.activeChallenges.splice(challengeIndex, 1);

            user.stats = user.stats || { trainings: 0, calories: 0, steps: 0, progress: 0 };
            user.stats.trainings = (user.stats.trainings || 0) + 1;

            // Обновляем уровень
            if (typeof calculateLevel === 'function') {
                const newLevel = calculateLevel(user);
                if (newLevel !== user.level) {
                    user.level = newLevel;
                    // Сохраняем уведомление об уровне
                    const levelData = {
                        level: user.level,
                        timestamp: Date.now()
                    };
                    sessionStorage.setItem('levelUpNotification', JSON.stringify(levelData));
                }
            }

            // Сохраняем все изменения
            window.fitnessDB.updateUser(user.id, {
                activeChallenges: user.activeChallenges,
                completedChallenges: user.completedChallenges,
                achievements: user.achievements,
                pointTransactions: user.pointTransactions,
                stats: user.stats,
                level: user.level,
                lastChallengeMark: user.lastChallengeMark
            });

            // Обновляем текущую сессию
            window.fitnessDB.setCurrentUser(user, true);

            console.log(`✅ Поздравляем! Вы завершили челлендж "${challenge.title}" и получили награду!`);

            // Закрываем модальное окно
            const modal = document.getElementById('challenge-modal');
            if (modal) {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }

            // Перезагружаем страницу
            setTimeout(function () {
                window.location.reload();
            }, 200);

        } else {
            // ========== ПРОГРЕСС (челлендж еще не завершен) ==========
            window.fitnessDB.updateUser(user.id, {
                activeChallenges: user.activeChallenges,
                lastChallengeMark: user.lastChallengeMark
            });

            // Обновляем текущую сессию
            window.fitnessDB.setCurrentUser(user, true);

            console.log(`✅ День отмечен! Прогресс: ${challenge.current}/${challenge.total}`);

            // ОБНОВЛЯЕМ ОТОБРАЖЕНИЕ В МОДАЛЬНОМ ОКНЕ (НЕ ЗАКРЫВАЕМ)
            const progressPercent = Math.round((challenge.current / challenge.total) * 100);
            const progressDaysEl = document.getElementById('modal-progress-days');
            const progressBarEl = document.getElementById('modal-progress-bar');

            if (progressDaysEl) progressDaysEl.textContent = `${challenge.current}/${challenge.total}`;
            if (progressBarEl) progressBarEl.style.width = `${progressPercent}%`;

            // Показываем уведомление о прогрессе
            if (typeof window.showNotification === 'function') {
                window.showNotification(`📅 Прогресс в челлендже "${challenge.title}": ${challenge.current}/${challenge.total} (${progressPercent}%)`, 'progress');
            } else if (typeof showNotification === 'function') {
                showNotification(`📅 Прогресс в челлендже "${challenge.title}": ${challenge.current}/${challenge.total} (${progressPercent}%)`, 'progress');
            }

            // Обновляем кнопку для следующего дня
            const canMarkToday = canMarkChallengeToday(challengeId);
            const markDayBtn = document.querySelector('#modal-actions .btn-primary:first-child');
            if (markDayBtn) {
                if (!canMarkToday) {
                    markDayBtn.textContent = `✅ Сегодня уже отмечено`;
                    markDayBtn.disabled = true;
                    markDayBtn.classList.add('disabled');
                } else {
                    markDayBtn.textContent = `📅 Отметить день ${challenge.current + 1}/${challenge.total}`;
                }
            }
        }
    }
    function showEarlyCompletionWarning(challengeId) {
        const warningElement = document.getElementById('early-completion-warning');
        const actionsContainer = document.getElementById('modal-actions');

        actionsContainer.style.display = 'none';
        warningElement.style.display = 'block';

        document.getElementById('confirm-early-complete').onclick = () => earlyCompleteChallenge(challengeId);
        document.getElementById('cancel-early-complete').onclick = () => {
            warningElement.style.display = 'none';
            actionsContainer.style.display = 'flex';
            if (currentSelectedChallenge) generateActionButtons(currentSelectedChallenge, 'active');
        };
    }

    function earlyCompleteChallenge(challengeId) {
        const currentUser = window.fitnessDB.getCurrentUser();
        const user = window.fitnessDB.getUserById(currentUser.id);

        const challengeIndex = user.activeChallenges.findIndex(c => c.id === challengeId);
        if (challengeIndex === -1) return;

        user.activeChallenges.splice(challengeIndex, 1);
        window.fitnessDB.updateUser(user.id, { activeChallenges: user.activeChallenges });

        console.log('❌ Челлендж завершен досрочно. Награда не получена.');

        document.getElementById('challenge-modal').style.display = 'none';
        document.body.style.overflow = 'auto';
        window.location.href = window.location.href;
    }

    function initChallengeModal() {
        const modal = document.getElementById('challenge-modal');
        const closeBtn = document.getElementById('close-challenge-modal');

        function closeModal() {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
            // ПЕРЕЗАГРУЖАЕМ СТРАНИЦУ ПРИ ЗАКРЫТИИ МОДАЛКИ
            window.location.href = window.location.href;
        }

        closeBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.style.display === 'flex') closeModal();
        });
    }

    function initFilters() {
        // Получаем элементы фильтров
        const filterType = document.getElementById('filter-type');
        const filterDifficulty = document.getElementById('filter-difficulty');
        const filterReward = document.getElementById('filter-reward');
        const filterDuration = document.getElementById('filter-duration');
        const resetBtn = document.getElementById('reset-filters-btn');

        // Функция применения фильтров
        function applyFiltersAndRender() {
            console.log('🔄 Применяем фильтры:', currentFilters);

            // Сбрасываем на первую страницу
            currentPage = 1;

            // Перерисовываем челленджи
            renderAllChallenges();
        }

        // Обработчики для select фильтров
        if (filterType) {
            filterType.addEventListener('change', function (e) {
                currentFilters.type = this.value;
                applyFiltersAndRender();
            });
        }

        if (filterDifficulty) {
            filterDifficulty.addEventListener('change', function (e) {
                currentFilters.difficulty = this.value;
                applyFiltersAndRender();
            });
        }

        if (filterReward) {
            filterReward.addEventListener('change', function (e) {
                currentFilters.reward = this.value;
                applyFiltersAndRender();
            });
        }

        if (filterDuration) {
            filterDuration.addEventListener('change', function (e) {
                currentFilters.duration = this.value;
                applyFiltersAndRender();
            });
        }

        if (resetBtn) {
            resetBtn.addEventListener('click', function () {
                console.log('🔄 Сброс фильтров');
                currentFilters = { type: '', difficulty: '', reward: '', duration: '' };

                if (filterType) filterType.value = '';
                if (filterDifficulty) filterDifficulty.value = '';
                if (filterReward) filterReward.value = '';
                if (filterDuration) filterDuration.value = '';

                applyFiltersAndRender();
            });
        }
    }

    function applyFilter(filterValue) {
        const allChallenges = document.querySelectorAll('#all-challenges-grid .challenge-item');

        allChallenges.forEach(challenge => {
            const type = challenge.dataset.type;
            const difficulty = challenge.dataset.difficulty;
            const reward = challenge.dataset.reward;

            let show = false;

            switch (filterValue) {
                case 'all':
                    show = true;
                    break;
                case 'daily':
                    show = type === 'daily';
                    break;
                case 'seasonal':
                    show = type === 'seasonal';
                    break;
                case 'beginner':
                    show = difficulty === 'beginner';
                    break;
                case 'intermediate':
                    show = difficulty === 'intermediate';
                    break;
                case 'expert':
                    show = difficulty === 'expert';
                    break;
                case 'common':
                    show = reward === 'common';
                    break;
                case 'rare':
                    show = reward === 'rare';
                    break;
                case 'super':
                    show = reward === 'super';
                    break;
                default:
                    show = true;
            }

            challenge.style.display = show ? 'flex' : 'none';
        });
    }

    function getCheckedValues(groupId) {
        return Array.from(document.querySelectorAll(`#${groupId} input[type="checkbox"]:checked`)).map(cb => cb.value);
    }

    function initRefreshRecommended() {
        document.getElementById('refresh-recommended')?.addEventListener('click', () => renderRecommendedChallenges());
    }

    function initPagination() {
        document.getElementById('prev-page').addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderAllChallenges();
            }
        });

        document.getElementById('next-page').addEventListener('click', () => {
            const totalItems = window.AppDatabase.challenges.length + userActiveChallenges.length;
            if (currentPage < Math.ceil(totalItems / itemsPerPage)) {
                currentPage++;
                renderAllChallenges();
            }
        });

        // Следим за изменением размера окна
        window.addEventListener('resize', function () {
            const newItemsPerPage = getItemsPerPage();
            if (newItemsPerPage !== itemsPerPage) {
                itemsPerPage = newItemsPerPage;
                currentPage = 1;
                renderAllChallenges();
            }
        });
    }

    function updatePagination(totalItems) {
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        const prevBtn = document.getElementById('prev-page');
        const nextBtn = document.getElementById('next-page');
        const pageNumbers = document.getElementById('page-numbers');

        if (prevBtn) prevBtn.disabled = currentPage === 1;
        if (nextBtn) nextBtn.disabled = currentPage === totalPages || totalPages === 0;

        if (pageNumbers) {
            let pagesHtml = '';

            // Показываем до 5 страниц, если их много
            let startPage = Math.max(1, currentPage - 2);
            let endPage = Math.min(totalPages, currentPage + 2);

            if (startPage > 1) {
                pagesHtml += `<button class="page-number" data-page="1">1</button>`;
                if (startPage > 2) pagesHtml += `<span class="page-dots">...</span>`;
            }

            for (let i = startPage; i <= endPage; i++) {
                pagesHtml += `<button class="page-number ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
            }

            if (endPage < totalPages) {
                if (endPage < totalPages - 1) pagesHtml += `<span class="page-dots">...</span>`;
                pagesHtml += `<button class="page-number" data-page="${totalPages}">${totalPages}</button>`;
            }

            pageNumbers.innerHTML = pagesHtml;

            // НЕ СКРЫВАЕМ пагинацию, даже если одна страница
            const paginationContainer = document.querySelector('.pagination');
            if (paginationContainer) {
                paginationContainer.style.display = 'flex'; // всегда показываем
            }

            document.querySelectorAll('.page-number').forEach(btn => {
                btn.addEventListener('click', () => {
                    currentPage = parseInt(btn.dataset.page);
                    renderAllChallenges();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                });
            });
        }
    }

    function initSearch() {
        const searchInput = document.getElementById('global-search-input');
        if (!searchInput) return;

        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const query = e.target.value.trim();
                performSearch(query);
                setTimeout(() => e.target.value = '', 100);
            }
        });
    }

    function performSearch(query) {
        if (!query || query.length < 2) {
            showSearchMessage('Введите минимум 2 символа для поиска');
            return;
        }

        // Используем поиск из AppDatabase
        const results = window.AppDatabase.searchChallenges(query);

        console.log('🔍 Найдено челленджей:', results.length);

        if (results.length === 1) {
            // Если найден один челлендж - открываем его модальное окно
            const challenge = results[0];
            const isActive = userActiveChallenges && userActiveChallenges.some(ac => ac.id === challenge.id);
            if (isActive) {
                const userC = userActiveChallenges.find(ac => ac.id === challenge.id);
                showChallengeModal({ ...challenge, ...userC }, 'active');
            } else {
                showChallengeModal(challenge, 'available');
            }
            // Очищаем поле поиска
            const searchInput = document.getElementById('challenge-search');
            if (searchInput) searchInput.value = '';
        } else if (results.length > 1) {
            // Если найдено несколько - показываем список
            showSearchResultsList(results, query);
        } else {
            // Если ничего не найдено
            showSearchMessage(`Челлендж "${query}" не найден`);
        }
    }

    function showSearchResultsList(results, query) {
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
                ${results.map(c => {
            const isActive = userActiveChallenges && userActiveChallenges.some(ac => ac.id === c.id);
            const typeClass = c.type === 'daily' ? 'type-daily' : 'type-seasonal';
            return `
                        <div class="search-result-item challenge ${isActive ? 'active' : 'available'}" data-id="${c.id}">
                            <div class="result-info">
                                <div class="result-name">${c.title}</div>
                                <div class="result-id ${typeClass}">${c.typeName || (c.type === 'daily' ? 'Ежедневный' : 'Сезонный')}</div>
                                <div class="result-rarity ${c.rewardRarity}">${c.rewardRarityName || 'Обычная'} награда</div>
                            </div>
                            <div class="result-status">
                                ${isActive ? '<span class="result-earned">Активный</span>' : '<span class="result-available">Доступен</span>'}
                            </div>
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
                const challenge = results.find(c => c.id === id);
                if (challenge) {
                    modal.remove();
                    document.body.style.overflow = 'auto';
                    const isActive = userActiveChallenges && userActiveChallenges.some(ac => ac.id === challenge.id);
                    if (isActive) {
                        const userC = userActiveChallenges.find(ac => ac.id === challenge.id);
                        showChallengeModal({ ...challenge, ...userC }, 'active');
                    } else {
                        showChallengeModal(challenge, 'available');
                    }
                    const searchInput = document.getElementById('global-search-input');
                    if (searchInput) searchInput.value = '';
                }
            });
        });
    }

    function showSearchMessage(message) {
        // Удаляем старые модальные окна
        const oldModal = document.querySelector('.search-message-modal');
        if (oldModal) oldModal.remove();

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
            <p class="search-message-subtitle">Попробуйте другой запрос</p>
        </div>
    `;

        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';

        // Закрытие ТОЛЬКО по клику на крестик или на фон
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
                document.body.style.overflow = 'auto';
            }
        });

        // Убираем автоматическое закрытие через 3 секунды
    }
    function initProgressRings() {
        document.querySelectorAll('.progress-ring').forEach(ring => {
            const progress = parseInt(ring.dataset.progress) || 0;
            const circle = ring.querySelector('.progress-ring-circle');
            if (!circle) return;

            const radius = 26;
            const circumference = 2 * Math.PI * radius;

            circle.style.strokeDasharray = `${circumference}`;
            circle.style.strokeDashoffset = circumference - (progress / 100) * circumference;
            circle.style.stroke = progress === 100 ? '#9946fb' : '#f8c044';
        });
    }

    function initLogout() {
        document.querySelector('#logout-btn')?.addEventListener('click', (e) => {
            e.preventDefault();
            window.fitnessDB.logout();
            window.location.href = 'login.html';
        });
    }
    window.showNotification = showNotification;

});