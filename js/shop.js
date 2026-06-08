document.addEventListener('DOMContentLoaded', function () {
    setTimeout(() => {
        initShop();
    }, 100);

    function initShop() {
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

        console.log('✅ Загружаем магазин для:', currentUser.firstName, currentUser.lastName);

        loadUserPoints();
        loadShopItems();
        loadPurchasedItems();
        initLogout();
        initModals();
        initShopSearch();
        checkGlobalSearchForShop();


    }
    function checkGlobalSearchForShop() {
        const searchResult = sessionStorage.getItem('globalSearchResult');
        if (searchResult) {
            sessionStorage.removeItem('globalSearchResult');
            try {
                const data = JSON.parse(searchResult);
                if (data.type === 'shop' && data.results && data.results.length > 0) {
                    setTimeout(() => {
                        highlightShopItems(data.results);
                    }, 500);
                }
            } catch (e) {
                console.error('Ошибка:', e);
            }
        }
    }
    function initShopSearch() {
        const searchInput = document.getElementById('global-search-input');
        if (!searchInput) return;

        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const query = e.target.value.trim();
                performShopSearch(query);
                setTimeout(() => e.target.value = '', 100);
            }
        });
    }


    function performShopSearch(query) {
        if (!query || query.length < 2) {
            showSearchMessage('Введите минимум 2 символа для поиска');
            return;
        }

        const searchQuery = query.toLowerCase().trim();

        // Ищем товары в shopItems (из shop.js)
        const results = shopItems.filter(item =>
            item.name.toLowerCase().includes(searchQuery) ||
            item.description.toLowerCase().includes(searchQuery)
        );

        if (results.length > 0) {
            // Закрываем модалку если она открыта
            closeSearchModal();
            // Подсвечиваем найденные товары
            setTimeout(() => {
                highlightShopItems(results);
            }, 100);
        } else {
            showSearchMessage(`Товар "${query}" не найден`, false);
        }
    }
    function closeSearchModal() {
        const modal = document.querySelector('.search-message-modal');
        if (modal) {
            modal.remove();
            document.body.style.overflow = 'auto';
        }
    }


    function highlightShopItems(items) {
        // Убираем предыдущую подсветку
        document.querySelectorAll('.shop-card').forEach(card => {
            card.classList.remove('search-highlight');
            card.style.animation = '';
        });

        // Подсвечиваем найденные
        items.forEach(item => {
            const card = document.querySelector(`.shop-card[data-id="${item.id}"]`);
            if (card) {
                card.classList.add('search-highlight');
                // Более медленная анимация (1.5 секунды, 2 раза)
                card.style.animation = 'highlightFlash 1.5s ease 2';

                // Прокручиваем к первому найденному
                if (items[0].id === item.id) {
                    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        });

        // Показываем уведомление о количестве найденных (не модалкой)
        showToastMessage(`Найдено товаров: ${items.length}`);
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
        // Удаляем старое модальное окно
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

        // Закрытие по кнопке
        const closeBtn = modal.querySelector('.search-modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.remove();
                document.body.style.overflow = 'auto';
            });
        }

        // НЕ ЗАКРЫВАЕМСЯ АВТОМАТИЧЕСКИ
    }

    const shopItems = [
        {
            id: 'discount-1',
            name: 'Скидка 10% на абонемент',
            description: 'Скидка 10% на любой абонемент в сети тренажерных залов "FitnessPro"',
            price: 500,
            icon: 'fa-ticket-alt',
            category: 'discount',
            needsCode: true
        },
        {
            id: 'discount-2',
            name: 'Скидка 20% на абонемент',
            description: 'Скидка 20% на годовой абонемент в тренажерный зал',
            price: 1200,
            icon: 'fa-percent',
            category: 'discount',
            needsCode: true
        },

        {
            id: 'nutrition-1',
            name: 'Сертификат 500₽ на спортпит',
            description: 'Сертификат на покупку спортивного питания в магазине "SportFood"',
            price: 300,
            icon: 'fa-apple-alt',
            category: 'nutrition',
            needsCode: true
        },
        {
            id: 'nutrition-2',
            name: 'Сертификат 1500₽ на спортпит',
            description: 'Сертификат на покупку спортивного питания премиум-класса',
            price: 800,
            icon: 'fa-weight-hanging',
            category: 'nutrition',
            needsCode: true
        },

        {
            id: 'equipment-1',
            name: 'Коврик для йоги',
            description: 'Профессиональный коврик для йоги и фитнеса',
            price: 400,
            icon: 'fa-vihara',
            category: 'equipment',
            needsCode: false,
            needsManager: true
        },
        {
            id: 'equipment-2',
            name: 'Набор гантелей (2x5кг)',
            description: 'Разборные гантели для домашних тренировок',
            price: 1500,
            icon: 'fa-dumbbell',
            category: 'equipment',
            needsCode: false,
            needsManager: true
        },
        {
            id: 'equipment-3',
            name: 'Эспандер',
            description: 'Фитнес-резинки для тренировок',
            price: 250,
            icon: 'fa-hand',
            category: 'equipment',
            needsCode: false,
            needsManager: true
        },

        {
            id: 'clothes-1',
            name: 'Футболка TerriFIT',
            description: 'Брендированная футболка из хлопка',
            price: 350,
            icon: 'fa-tshirt',
            category: 'clothes',
            needsCode: false,
            needsManager: true
        },
        {
            id: 'clothes-2',
            name: 'Бутылка для воды',
            description: 'Спортивная бутылка 750мл',
            price: 200,
            icon: 'fa-droplet',
            category: 'clothes',
            needsCode: false,
            needsManager: true
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

        const headerPoints = document.getElementById('header-points');
        if (headerPoints) headerPoints.textContent = availablePoints;

        return availablePoints;
    }

    function loadShopItems() {
        const container = document.getElementById('shop-items-container');
        if (!container) return;

        const currentUser = window.fitnessDB.getCurrentUser();
        const user = window.fitnessDB.getUserById(currentUser.id);
        const purchasedItems = user.purchasedItems || [];

        const earnedPoints = window.AppDatabase.calculateTotalPoints(user.achievements || []);
        const spentPoints = user.spentPoints || 0;
        const availablePoints = earnedPoints - spentPoints;

        const grid = document.createElement('div');
        grid.className = 'shop-grid';

        shopItems.forEach(item => {
            const isPurchased = purchasedItems.includes(item.id);
            const canAfford = availablePoints >= item.price && !isPurchased;

            const card = document.createElement('div');
            card.className = `shop-card ${isPurchased ? 'purchased' : ''}`;
            card.dataset.id = item.id;

            card.innerHTML = `
                <div class="shop-card-image">
                    <i class="fas ${item.icon}"></i>
                </div>
                <div class="shop-card-content">
                    <h3>${item.name}</h3>
                    <p>${item.description}</p>
                    <div class="shop-card-price">
                        <i class="fas fa-star"></i>
                        <span>${item.price}</span>
                    </div>
                    ${isPurchased ?
                    '<div class="purchased-label"><i class="fas fa-check"></i> Куплено</div>' :
                    `<button class="buy-btn ${canAfford ? '' : 'disabled'}" 
                            onclick="window.buyItem('${item.id}', ${item.price})"
                            ${canAfford ? '' : 'disabled'}>
                            ${canAfford ? 'Купить' : 'Не хватает'}
                        </button>`
                }
                </div>
            `;

            grid.appendChild(card);
        });

        container.innerHTML = '';
        container.appendChild(grid);
    }

    function loadPurchasedItems() {
        const container = document.getElementById('purchased-items');
        if (!container) return;

        const currentUser = window.fitnessDB.getCurrentUser();
        const user = window.fitnessDB.getUserById(currentUser.id);
        const purchasedIds = user.purchasedItems || [];

        if (purchasedIds.length === 0) {
            container.innerHTML = '<div class="empty-purchased">У вас пока нет купленных товаров</div>';
            return;
        }

        const purchasedItems = shopItems.filter(item => purchasedIds.includes(item.id));

        const grid = document.createElement('div');
        grid.className = 'purchased-grid';

        purchasedItems.forEach(item => {
            const card = document.createElement('div');
            card.className = 'purchased-card';
            card.innerHTML = `
                <div class="purchased-card-image">
                    <i class="fas ${item.icon}"></i>
                </div>
                <div class="purchased-card-content">
                    <h4>${item.name}</h4>
                    <p>${item.description}</p>
                    <div class="purchased-card-footer">
                        <span class="purchased-price">
                            <i class="fas fa-star"></i> ${item.price}
                        </span>
                        <button class="use-btn" onclick="window.useItem('${item.id}')">
                            <i class="fas fa-gift"></i> Использовать
                        </button>
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });

        container.innerHTML = '';
        container.appendChild(grid);
    }

    window.buyItem = function (itemId, price) {
        console.log('🛒 Попытка покупки:', itemId, price);

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

        user.purchasedItems = user.purchasedItems || [];
        user.pointTransactions = user.pointTransactions || [];
        user.spentPoints = user.spentPoints || 0;

        if (user.purchasedItems.includes(itemId)) {
            alert('Товар уже куплен!');
            return;
        }

        const item = shopItems.find(i => i.id === itemId);
        if (!item) {
            alert('Товар не найден');
            return;
        }

        user.spentPoints += price;

        user.pointTransactions.push({
            id: Date.now(),
            itemId: itemId,
            itemName: item.name,
            points: price,
            date: new Date().toISOString(),
            type: 'purchase'
        });

        user.purchasedItems.push(itemId);

        const updatedUser = window.fitnessDB.updateUser(user.id, {
            purchasedItems: user.purchasedItems,
            pointTransactions: user.pointTransactions,
            spentPoints: user.spentPoints
        });

        if (updatedUser) {
            console.log(`✅ Товар "${item.name}" куплен за ${price} очков`);

            window.fitnessDB.setCurrentUser(updatedUser, true);

            loadUserPoints();      
            loadShopItems();       
            loadPurchasedItems();  

            if (typeof window.updateProfilePoints === 'function') {
                window.updateProfilePoints();
            }
            if (typeof window.updateSidebarTransactions === 'function') {
                window.updateSidebarTransactions();
            }
            setTimeout(() => {
                showPurchaseModal(item);
            }, 100);
        } else {
            alert('Ошибка при покупке');
        }
    };

    window.useItem = function (itemId) {
        const item = shopItems.find(i => i.id === itemId);
        if (!item) return;

        showUseModal(item);
    };

    function showPurchaseModal(item) {
        const modal = document.getElementById('purchase-modal');
        if (!modal) return;

        document.getElementById('purchase-item-name').textContent = item.name;
        document.getElementById('purchase-item-price').textContent = item.price;

        modal.style.display = 'flex';
    }

    function showUseModal(item) {
        const modal = document.getElementById('use-modal');
        if (!modal) return;

        document.getElementById('use-item-name').textContent = item.name;

        if (item.needsCode) {
            document.getElementById('use-code-section').style.display = 'block';
            document.getElementById('manager-section').style.display = 'none';

            const code = generateCode();
            document.getElementById('use-item-code').textContent = code;
        }
        else if (item.needsManager) {
            document.getElementById('use-code-section').style.display = 'none';
            document.getElementById('manager-section').style.display = 'block';
        }

        modal.style.display = 'flex';
    }

    function generateCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                code += chars[Math.floor(Math.random() * chars.length)];
            }
            if (i < 3) code += '-';
        }
        return code;
    }

    function initModals() {
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.modal-overlay').forEach(modal => {
                    modal.style.display = 'none';
                });
                document.body.style.overflow = 'auto';
            });
        });

        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    overlay.style.display = 'none';
                    document.body.style.overflow = 'auto';
                }
            });
        });

        document.getElementById('copy-code')?.addEventListener('click', function () {
            const code = document.getElementById('use-item-code').textContent;
            navigator.clipboard.writeText(code);

            const originalText = this.innerHTML;
            this.innerHTML = '<i class="fas fa-check"></i> Скопировано!';
            setTimeout(() => {
                this.innerHTML = originalText;
            }, 2000);
        });
    }

    function initLogout() {
        document.querySelector('#logout-btn')?.addEventListener('click', (e) => {
            e.preventDefault();
            window.fitnessDB.logout();
            window.location.href = 'login.html';
        });
    }
});
