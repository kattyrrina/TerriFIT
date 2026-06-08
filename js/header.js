// Обновление аватара и очков в шапке на всех страницах
function updateHeaderAvatar() {
    const currentUser = window.fitnessDB?.getCurrentUser();
    if (!currentUser) return;

    const user = window.fitnessDB.getUserById(currentUser.id);
    if (!user) return;

    // Обновляем очки
    const earnedPoints = window.AppDatabase?.calculateTotalPoints(user.achievements || []) || 0;
    const spentPoints = user.spentPoints || 0;
    const availablePoints = earnedPoints - spentPoints;

    document.querySelectorAll('.user-points').forEach(el => {
        if (el) el.textContent = availablePoints;
    });

    // Обновляем аватар
    const avatarContainer = document.getElementById('header-avatar');
    if (!avatarContainer) return;

    if (user.avatar && user.avatar.startsWith('data:image')) {
        avatarContainer.innerHTML = `<img src="${user.avatar}" alt="avatar" class="avatar-img">`;
    } else {
        const avatarFile = user.avatar ? `images/${user.avatar}` : (user.gender === 'male' ? 'images/man.png' : 'images/woman.png');
        avatarContainer.innerHTML = `<img src="${avatarFile}" alt="avatar" class="avatar-img">`;
    }
}

// Обновление бейджа уведомлений (только точка)
window.updateNotificationBadge = function () {
    const currentUser = window.fitnessDB?.getCurrentUser();
    if (!currentUser) return;

    const user = window.fitnessDB.getUserById(currentUser.id);
    if (!user) return;

    const unreadCount = user.notifications?.filter(n => !n.read).length || 0;

    // Обновляем бейдж в сайдбаре
    const sidebarBadge = document.getElementById('sidebar-notification-badge');
    if (sidebarBadge) {
        sidebarBadge.style.display = unreadCount > 0 ? 'block' : 'none';
    }

    // Обновляем бейдж в мобильном меню
    const mobileBadge = document.getElementById('mobile-notification-badge');
    if (mobileBadge) {
        mobileBadge.style.display = unreadCount > 0 ? 'block' : 'none';
    }
};

// Функция для мобильного меню
function initMobileMenu() {
    const burgerMenu = document.getElementById('burger-menu');
    const mobileMenu = document.getElementById('mobile-menu-full');
    const mobileMenuClose = document.getElementById('mobile-menu-close');
    const mobileLogoutBtn = document.getElementById('mobile-logout-btn');

    if (!burgerMenu || !mobileMenu) return;

    function openMenu() {
        mobileMenu.classList.add('open');
        document.body.style.overflow = 'hidden';
        burgerMenu.classList.add('active');
    }

    function closeMenu() {
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
        burgerMenu.classList.remove('active');
    }

    // Убираем старые обработчики и добавляем новые
    burgerMenu.removeEventListener('click', openMenu);
    burgerMenu.addEventListener('click', openMenu);

    if (mobileMenuClose) {
        mobileMenuClose.removeEventListener('click', closeMenu);
        mobileMenuClose.addEventListener('click', closeMenu);
    }

    // Закрытие при клике на фон
    mobileMenu.addEventListener('click', (e) => {
        if (e.target === mobileMenu) {
            closeMenu();
        }
    });

    document.querySelectorAll('.mobile-menu-item').forEach(item => {
        if (item.id !== 'mobile-logout-btn') {
            item.removeEventListener('click', closeMenu);
            item.addEventListener('click', () => {
                setTimeout(closeMenu, 150);
            });
        }
    });

    if (mobileLogoutBtn) {
        mobileLogoutBtn.removeEventListener('click', (e) => {
            e.preventDefault();
            closeMenu();
            setTimeout(() => {
                if (typeof window.fitnessDB !== 'undefined') {
                    window.fitnessDB.logout();
                }
            }, 200);
        });
        mobileLogoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            closeMenu();
            setTimeout(() => {
                if (typeof window.fitnessDB !== 'undefined') {
                    window.fitnessDB.logout();
                }
            }, 200);
        });
    }
}

// Вызываем всё при загрузке страницы
document.addEventListener('DOMContentLoaded', function () {
    setTimeout(() => {
        if (typeof window.updateNotificationBadge === 'function') {
            window.updateNotificationBadge();
        }
        initMobileMenu();
        updateHeaderAvatar();
    }, 200);
});
// Очистка всех таймеров и интервалов
function clearAllTimers() {
    // Очищаем все setTimeout
    const highestId = setTimeout(() => { }, 0);
    for (let i = 0; i < highestId; i++) {
        clearTimeout(i);
        clearInterval(i);
    }
}

// При переходе на другую страницу
window.addEventListener('beforeunload', function () {
    clearAllTimers();
});
// Флаг для предотвращения двойной инициализации
let isInitialized = false;

document.addEventListener('DOMContentLoaded', function () {
    if (isInitialized) return;
    isInitialized = true;

    setTimeout(() => {
        if (typeof window.updateNotificationBadge === 'function') {
            window.updateNotificationBadge();
        }
        initMobileMenu();
        updateHeaderAvatar();
    }, 200);
});
// Глобальное закрытие всех модальных окон
window.closeAllModals = function () {
    const modals = document.querySelectorAll('.modal-overlay');
    modals.forEach(modal => {
        if (modal) {
            modal.style.display = 'none';
        }
    });
    // Возвращаем прокрутку страницы
    document.body.style.overflow = 'auto';
    document.body.style.position = '';
    document.body.style.width = '';
};

// Закрытие конкретного модального окна по ID
window.closeModal = function (modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
};

// Также добавьте очистку всех таймеров
window.clearAllTimers = function () {
    const highestId = setTimeout(() => { }, 0);
    for (let i = 0; i < highestId; i++) {
        clearTimeout(i);
        clearInterval(i);
    }
};

// Обработчик для перехода по ссылкам
function handleLinkClick(e) {
    const link = e.target.closest('a');
    if (link && link.href && link.href !== window.location.href && !link.href.includes('javascript:')) {
        // Очищаем всё перед переходом
        if (typeof window.closeAllModals === 'function') {
            window.closeAllModals();
        }
        window.clearAllTimers();
    }
}

// Вешаем обработчик на клики
document.addEventListener('click', handleLinkClick);

// При загрузке страницы проверяем, не остались ли открытые модалки
document.addEventListener('DOMContentLoaded', function () {
    // Закрываем все модалки при загрузке (на случай если остались)
    setTimeout(() => {
        if (typeof window.closeAllModals === 'function') {
            window.closeAllModals();
        }
        if (typeof window.updateNotificationBadge === 'function') {
            window.updateNotificationBadge();
        }
        initMobileMenu();
        updateHeaderAvatar();
    }, 200);
});

// При выгрузке страницы очищаем всё
window.addEventListener('beforeunload', function () {
    window.clearAllTimers();
});
// Перехват всех переходов по ссылкам
document.addEventListener('click', function (e) {
    const link = e.target.closest('a');
    if (link && link.href && link.href !== window.location.href) {
        // Очищаем все перед переходом
        clearAllTimers();
        closeAllModals();
    }
});