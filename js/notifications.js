// Глобальная функция для показа уведомлений на любой странице
window.showFloatingNotification = function (message, type = 'reward') {
    // Удаляем старые уведомления
    const oldNotification = document.querySelector('.notification-toast');
    if (oldNotification) oldNotification.remove();

    const notification = document.createElement('div');
    notification.className = 'notification-toast';

    let icon = 'fa-award';
    let bgGradient = 'linear-gradient(135deg, #f59e0b, #8b5cf6)';

    if (type === 'levelup') {
        icon = 'fa-arrow-up';
        bgGradient = 'linear-gradient(135deg, #10b981, #059669)';
    } else if (type === 'achievement') {
        icon = 'fa-trophy';
        bgGradient = 'linear-gradient(135deg, #f59e0b, #8b5cf6)';
    } else if (type === 'progress') {
        icon = 'fa-chart-line';
        bgGradient = 'linear-gradient(135deg, #3b82f6, #8b5cf6)';
    }

    notification.style.background = bgGradient;
    notification.innerHTML = `<i class="fas ${icon}"></i><span>${message}</span>`;
    document.body.appendChild(notification);

    // Анимация появления
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 10);

    // Автоматическое закрытие через 4 секунды
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 4000);
};

console.log('✅ Система уведомлений загружена');