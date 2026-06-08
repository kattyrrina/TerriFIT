document.addEventListener('DOMContentLoaded', function () {
    setTimeout(() => {
        initPremium();
    }, 100);

    function initPremium() {
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

        console.log('✅ Загружаем премиум контент для:', currentUser.firstName, currentUser.lastName);

        loadUserPoints();
        loadPremiumContent();
        loadOpenedContent();
        initLogout();
        initModals();
        initPremiumSearch();
        checkGlobalSearchForPremium();


    }
    function checkGlobalSearchForPremium() {
        const searchResult = sessionStorage.getItem('globalSearchResult');
        if (searchResult) {
            sessionStorage.removeItem('globalSearchResult');
            try {
                const data = JSON.parse(searchResult);
                if (data.type === 'premium' && data.results && data.results.length > 0) {
                    setTimeout(() => {
                        highlightPremiumItems(data.results);
                    }, 500);
                }
            } catch (e) {
                console.error('Ошибка:', e);
            }
        }
    }
    function initPremiumSearch() {
        const searchInput = document.getElementById('global-search-input');
        if (!searchInput) return;

        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const query = e.target.value.trim();
                performPremiumSearch(query);
                setTimeout(() => e.target.value = '', 100);
            }
        });
    }


    function performPremiumSearch(query) {
        if (!query || query.length < 2) {
            showSearchMessage('Введите минимум 2 символа для поиска');
            return;
        }

        const searchQuery = query.toLowerCase().trim();

        const results = premiumContent.filter(item =>
            item.title.toLowerCase().includes(searchQuery) ||
            item.description.toLowerCase().includes(searchQuery)
        );

        if (results.length > 0) {
            closeSearchModal();
            setTimeout(() => {
                highlightPremiumItems(results);
            }, 100);
        } else {
            showSearchMessage(`Контент "${query}" не найден`, false);
        }
    }
    function closeSearchModal() {
        const modal = document.querySelector('.search-message-modal');
        if (modal) {
            modal.remove();
            document.body.style.overflow = 'auto';
        }
    }

    function highlightPremiumItems(items) {
        document.querySelectorAll('.premium-card').forEach(card => {
            card.classList.remove('search-highlight');
            card.style.animation = '';
        });

        items.forEach(item => {
            const card = document.querySelector(`.premium-card[data-id="${item.id}"]`);
            if (card) {
                card.classList.add('search-highlight');
                card.style.animation = 'highlightFlash 1.5s ease 2';

                if (items[0].id === item.id) {
                    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        });

        showToastMessage(`Найдено: ${items.length}`);
    }
    function showToastMessage(message) {
        const oldToast = document.querySelector('.search-toast');
        if (oldToast) oldToast.remove();

        const toast = document.createElement('div');
        toast.className = 'search-toast';
        toast.innerHTML = `<i class="fas fa-info-circle"></i><span>${message}</span>`;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('show');
        }, 10);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    function showSearchMessage(message, autoClose = false) {
        const oldModal = document.querySelector('.search-message-modal');
        if (oldModal) oldModal.remove();

        const modal = document.createElement('div');
        modal.className = 'modal-overlay search-message-modal';
        modal.style.display = 'flex';

        modal.innerHTML = `
        <div class="modal search-message-modal-content">
            <button class="modal-close" onclick="this.closest('.modal-overlay').remove(); document.body.style.overflow = 'auto'">
                <i class="fas fa-times"></i>
            </button>
            <div class="search-message-icon"><i class="fas fa-search"></i></div>
            <h3 class="search-message-title">${message}</h3>
        </div>
    `;

        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';

        const closeBtn = modal.querySelector('.search-modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.remove();
                document.body.style.overflow = 'auto';
            });
        }
    }
    const premiumContent = [
        {
            id: 'video-1',
            title: 'Продвинутая йога',
            description: '2-часовая практика йоги для продвинутых',
            price: 300,
            icon: 'fa-video',
            category: 'video',
            url: 'premium/video_1.mp4',
            type: 'mp4'
        },
        {
            id: 'video-2',
            title: 'Силовая тренировка',
            description: 'Интенсивная силовая тренировка',
            price: 400,
            icon: 'fa-dumbbell',
            category: 'video',
            url: 'premium/video_2.mov',
            type: 'mov'
        },
        {
            id: 'video-3',
            title: 'Питание для профи',
            description: 'Лекция о спортивном питании',
            price: 250,
            icon: 'fa-apple-alt',
            category: 'video',
            url: 'premium/video_3.mp4',
            type: 'mp4'
        },
        {
            id: 'video-4',
            title: 'Секреты чемпионов',
            description: 'Эксклюзивное интервью с чемпионом мира',
            price: 150,
            icon: 'fa-trophy',
            category: 'video',
            url: 'premium/video_4.mp4',
            type: 'mp4'
        },
        {
            id: 'video-5',
            title: 'Медитация для спортсменов',
            description: 'Медитация для восстановления',
            price: 100,
            icon: 'fa-vihara',
            category: 'audio',
            url: 'premium/video_5.mp4',
            type: 'mp4'
        },
        {
            id: 'article-1',
            title: 'Программа тренировок',
            description: '12-недельная программа для набора массы',
            price: 500,
            icon: 'fa-calendar-alt',
            category: 'article',
            url: 'premium/article_1.pdf',
            type: 'pdf'
        },
        {
            id: 'recipe-1',
            title: 'Кулинарная книга',
            description: '50 рецептов для здорового питания',
            price: 200,
            icon: 'fa-utensils',
            category: 'recipe',
            url: 'premium/recipe_1.pdf',
            type: 'pdf'
        },
        {
            id: 'webinar-1',
            title: 'Вебинар с тренером',
            description: 'Запись вебинара: "Как избежать травм"',
            price: 350,
            icon: 'fa-chalkboard-teacher',
            category: 'video',
            url: 'https://rutube.ru/video/3f87e583f4df8f6a5683ad87a2dc0205/', 
            type: 'external'
        },
        {
            id: 'webinar-2',
            title: 'Питание для похудения',
            description: 'Вебинар с диетологом о правильном питании',
            price: 280,
            icon: 'fa-leaf',
            category: 'video',
            url: 'https://rutube.ru/video/a15b54da4971fd635a23cb6f055d0f4c/', 
            type: 'external'
        }
    ];

    function loadUserPoints() {
        const currentUser = window.fitnessDB.getCurrentUser();
        if (!currentUser) return;

        const user = window.fitnessDB.getUserById(currentUser.id);

        const earnedPoints = window.AppDatabase.calculateTotalPoints(user.achievements || []);
        const spentPoints = user.spentPoints || 0;
        const availablePoints = earnedPoints - spentPoints;

        document.querySelectorAll('.user-points').forEach(el => {
            el.textContent = availablePoints;
        });

        return availablePoints;
    }

    function loadPremiumContent() {
        const container = document.getElementById('premium-container');
        if (!container) return;

        const currentUser = window.fitnessDB.getCurrentUser();
        const user = window.fitnessDB.getUserById(currentUser.id);
        const openedContent = user.openedPremiumContent || [];

        const earnedPoints = window.AppDatabase.calculateTotalPoints(user.achievements || []);
        const spentPoints = user.spentPoints || 0;
        const availablePoints = earnedPoints - spentPoints;

        const grid = document.createElement('div');
        grid.className = 'premium-grid';

        premiumContent.forEach(item => {
            const isOpened = openedContent.includes(item.id);
            const canAfford = availablePoints >= item.price && !isOpened;

            const card = document.createElement('div');
            card.className = `premium-card ${isOpened ? 'opened' : ''}`;
            card.dataset.id = item.id;

            card.innerHTML = `
            <div class="premium-card-image">
                <i class="fas ${item.icon}"></i>
            </div>
            <div class="premium-card-content">
                <h3>${item.title}</h3>
                <p>${item.description}</p>
                <div class="premium-card-price">
                    <i class="fas fa-star"></i>
                    <span>${item.price}</span>
                </div>
                ${isOpened ?
                    '<div class="opened-label"><i class="fas fa-unlock"></i> Открыто</div>' :
                    `<button class="unlock-btn ${canAfford ? '' : 'disabled'}" 
                        onclick="event.stopPropagation(); window.unlockContent('${item.id}', ${item.price})"
                        ${canAfford ? '' : 'disabled'}>
                        <i class="fas fa-lock"></i> ${canAfford ? 'Открыть' : 'Не хватает'}
                    </button>`
                }
            </div>
            ${!isOpened ? '<div class="premium-overlay"></div>' : ''}
        `;

            grid.appendChild(card);
        });

        container.innerHTML = '';
        container.appendChild(grid);
    }

    function loadOpenedContent() {
        const container = document.getElementById('opened-content');
        if (!container) return;

        const currentUser = window.fitnessDB.getCurrentUser();
        const user = window.fitnessDB.getUserById(currentUser.id);
        const openedIds = user.openedPremiumContent || [];

        if (openedIds.length === 0) {
            container.innerHTML = '<div class="empty-content">У вас пока нет открытого премиум контента</div>';
            return;
        }

        const openedItems = premiumContent.filter(item => openedIds.includes(item.id));

        const grid = document.createElement('div');
        grid.className = 'opened-grid';

        openedItems.forEach(item => {
            const card = document.createElement('div');
            card.className = 'opened-card';
            card.innerHTML = `
                <div class="opened-card-image">
                    <i class="fas ${item.icon}"></i>
                </div>
                <div class="opened-card-content">
                    <h4>${item.title}</h4>
                    <p>${item.description}</p>
                    <div class="opened-card-footer">
                        <span class="opened-price">
                            <i class="fas fa-star"></i> ${item.price}
                        </span>
                        <button class="open-btn" onclick="window.openContent('${item.id}')">
                            <i class="fas fa-play"></i> Смотреть
                        </button>
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });

        container.innerHTML = '';
        container.appendChild(grid);
    }

    window.unlockContent = function (contentId, price) {
        const currentUser = window.fitnessDB.getCurrentUser();
        if (!currentUser) {
            alert('Ошибка: пользователь не авторизован');
            return;
        }

        const user = window.fitnessDB.getUserById(currentUser.id);
        if (!user) {
            alert('Ошибка: пользователь не найден');
            return;
        }

        const earnedPoints = window.AppDatabase.calculateTotalPoints(user.achievements || []);
        const spentPoints = user.spentPoints || 0;
        const availablePoints = earnedPoints - spentPoints;

        if (availablePoints < price) {
            alert('Недостаточно очков!');
            return;
        }

        user.openedPremiumContent = user.openedPremiumContent || [];
        user.pointTransactions = user.pointTransactions || [];
        user.spentPoints = user.spentPoints || 0;

        if (user.openedPremiumContent.includes(contentId)) {
            alert('Контент уже открыт!');
            return;
        }

        const content = premiumContent.find(c => c.id === contentId);
        if (!content) {
            alert('Контент не найден');
            return;
        }

        user.spentPoints += price;

        user.pointTransactions.push({
            id: Date.now(),
            contentId: contentId,
            contentName: content.title,
            points: price,
            date: new Date().toISOString(),
            type: 'premium'
        });

        user.openedPremiumContent.push(contentId);

        const updatedUser = window.fitnessDB.updateUser(user.id, {
            openedPremiumContent: user.openedPremiumContent,
            pointTransactions: user.pointTransactions,
            spentPoints: user.spentPoints
        });

        if (updatedUser) {
            window.fitnessDB.setCurrentUser(updatedUser, true);
            updateAllPoints(updatedUser);
            loadPremiumContent();
            loadOpenedContent();
            showNotification(`Контент "${content.title}" открыт!`, 'success');
        } else {
            alert('Ошибка при открытии контента');
        }
    };

    function updateAllPoints(user) {
        const earnedPoints = window.AppDatabase.calculateTotalPoints(user.achievements || []);
        const spentPoints = user.spentPoints || 0;
        const availablePoints = earnedPoints - spentPoints;

        document.querySelectorAll('.user-points').forEach(el => {
            el.textContent = availablePoints;
        });
    }

    window.openContent = function (contentId) {
        const content = premiumContent.find(c => c.id === contentId);
        if (!content) return;
        showContentModal(content);
    };

    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i><span>${message}</span>`;
        notification.style.cssText = `
            position: fixed; top: 20px; right: 20px; padding: 15px 25px;
            background: ${type === 'success' ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #ef4444, #dc2626)'};
            color: white; border-radius: 10px; z-index: 9999; display: flex; align-items: center; gap: 10px;
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }

    function showContentModal(content) {
        const modal = document.getElementById('content-modal');
        if (!modal) return;

        // Очищаем предыдущее содержимое и останавливаем видео
        const oldContentFrame = document.getElementById('content-frame');
        if (oldContentFrame) {
            const oldVideos = oldContentFrame.querySelectorAll('video');
            const oldAudios = oldContentFrame.querySelectorAll('audio');
            oldVideos.forEach(video => {
                video.pause();
                video.src = '';
                video.load();
            });
            oldAudios.forEach(audio => {
                audio.pause();
                audio.src = '';
                audio.load();
            });
            oldContentFrame.innerHTML = '';
        }

        document.getElementById('content-title').textContent = content.title;
        document.getElementById('content-description').textContent = content.description || '';

        const contentFrame = document.getElementById('content-frame');
        contentFrame.innerHTML = '';

        // Для внешних ссылок (вебинары на Rutube, YouTube и т.д.)
        if (content.type === 'external') {
            contentFrame.innerHTML = `
            <div style="text-align: center; padding: 30px; background: rgba(139,92,246,0.1); border-radius: 16px;">
                <i class="fas fa-external-link-alt" style="font-size: 60px; color: #8b5cf6; margin-bottom: 20px; display: block;"></i>
                <p style="color: #f8fafc; margin-bottom: 15px; font-size: 16px;">
                    Контент доступен на внешнем ресурсе
                </p>
                <p style="color: #94a3b8; margin-bottom: 25px; font-size: 14px;">
                    Для просмотра вебинара перейдите по ссылке ниже
                </p>
                <button class="btn-primary" onclick="window.open('${content.url}', '_blank')" style="display: inline-block; width: auto; padding: 12px 30px;">
                    <i class="fas fa-external-link-alt"></i> Перейти к вебинару
                </button>
            </div>
        `;
        }
        // Для локальных MP4 файлов
        else if (content.type === 'mp4' || content.type === 'mov') {
            contentFrame.innerHTML = `
            <video controls style="width: 100%; max-width: 600px; height: auto; max-height: 340px; border-radius: 12px; background: #000; display: block; margin: 0 auto;">
                <source src="${content.url}" type="video/mp4">
                Ваш браузер не поддерживает видео.
            </video>
        `;
        }
        // Для аудио
        else if (content.type === 'mp3') {
            contentFrame.innerHTML = `
            <div style="text-align: center; padding: 30px; background: rgba(139,92,246,0.1); border-radius: 16px;">
                <i class="fas fa-headphones" style="font-size: 60px; color: #8b5cf6; margin-bottom: 20px; display: block;"></i>
                <audio controls style="width: 100%;">
                    <source src="${content.url}" type="audio/mpeg">
                    Ваш браузер не поддерживает аудио.
                </audio>
            </div>
        `;
        }
        // Для PDF файлов
        else if (content.type === 'pdf') {
            contentFrame.innerHTML = `
            <div style="text-align: center; padding: 30px; background: rgba(139,92,246,0.1); border-radius: 16px;">
                <i class="fas fa-file-pdf" style="font-size: 60px; color: #8b5cf6; margin-bottom: 20px; display: block;"></i>
                <p style="color: #f8fafc; margin-bottom: 20px;">${content.title}</p>
                <button class="btn-primary" onclick="window.open('${content.url}', '_blank')">
                    <i class="fas fa-external-link-alt"></i> Открыть в новой вкладке
                </button>
            </div>
        `;
        }
        // Для других типов
        else {
            contentFrame.innerHTML = `
            <div style="background: rgba(19,14,72,0.5); border-radius: 12px; padding: 40px; text-align: center;">
                <i class="fas ${content.icon}" style="font-size: 60px; color: #8b5cf6; margin-bottom: 20px; display: block;"></i>
                <p style="color: #94a3b8;">Контент будет доступен в ближайшее время</p>
            </div>
        `;
        }

        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    function initModals() {
        const modal = document.getElementById('content-modal');
        if (!modal) return;

        // Функция закрытия модального окна
        function closeModal() {
            // Очищаем все таймеры, чтобы избежать залипания
            const highestId = setTimeout(() => { }, 0);
            for (let i = 0; i < highestId; i++) {
                clearTimeout(i);
                clearInterval(i);
            }
            // Останавливаем все видео/аудио в модальном окне
            const contentFrame = document.getElementById('content-frame');
            if (contentFrame) {
                const videos = contentFrame.querySelectorAll('video');
                const audios = contentFrame.querySelectorAll('audio');
                videos.forEach(video => {
                    video.pause();
                    video.src = '';
                    video.load();
                });
                audios.forEach(audio => {
                    audio.pause();
                    audio.src = '';
                    audio.load();
                });
                contentFrame.innerHTML = '';
            }

            // Скрываем модальное окно
            modal.style.display = 'none';

            // Возвращаем прокрутку страницы
            document.body.style.overflow = 'auto';
            document.body.style.position = '';
            document.body.style.width = '';
        }

        // Закрытие по кнопке "Закрыть" в модальном окне
        const closeButton = modal.querySelector('.btn-primary');
        if (closeButton) {
            // Убираем старый обработчик, если был
            const newCloseButton = closeButton.cloneNode(true);
            closeButton.parentNode.replaceChild(newCloseButton, closeButton);

            newCloseButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                closeModal();
            });
        }

        // Закрытие по клавише Escape
        function closeModalOnEsc(e) {
            if (e.key === 'Escape' && modal.style.display === 'flex') {
                closeModal();
            }
        }

        document.removeEventListener('keydown', closeModalOnEsc);
        document.addEventListener('keydown', closeModalOnEsc);
    }

    function initLogout() {
        document.querySelector('#logout-btn')?.addEventListener('click', (e) => {
            e.preventDefault();
            window.fitnessDB.logout();
            window.location.href = 'login.html';
        });
    }
});
// Глобальная функция закрытия всех модальных окон
window.closeAllModals = function () {
    const modal = document.getElementById('content-modal');
    if (modal && modal.style.display === 'flex') {
        // Останавливаем видео
        const contentFrame = document.getElementById('content-frame');
        if (contentFrame) {
            const videos = contentFrame.querySelectorAll('video');
            const audios = contentFrame.querySelectorAll('audio');
            videos.forEach(video => {
                video.pause();
                video.src = '';
                video.load();
            });
            audios.forEach(audio => {
                audio.pause();
                audio.src = '';
                audio.load();
            });
            contentFrame.innerHTML = '';
        }

        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        document.body.style.position = '';
        document.body.style.width = '';
    }
};