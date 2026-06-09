window.logout = function () {
    localStorage.removeItem('fitness_current_user');
    window.location.href = 'login.html';
};

function declensionAchievements(count) {
    const lastDigit = count % 10;
    const lastTwoDigits = count % 100;
    if (lastTwoDigits >= 11 && lastTwoDigits <= 19) return 'наград';
    if (lastDigit === 1) return 'награда';
    if (lastDigit >= 2 && lastDigit <= 4) return 'награды';
    return 'наград';
}

document.addEventListener('DOMContentLoaded', function () {

    setTimeout(() => {
        initApp();
    }, 100);

    function initAgeToggle() {
        const ageBox = document.querySelector('.user-stat:nth-child(1) .stat-value');
        if (!ageBox) return;

        let showingAge = true;
        const originalAge = ageBox.textContent;

        ageBox.style.cursor = 'pointer';
        ageBox.title = 'Нажмите чтобы увидеть дату рождения';

        const originalStyle = {
            fontSize: ageBox.style.fontSize,
            lineHeight: ageBox.style.lineHeight
        };

        ageBox.addEventListener('click', function () {
            const currentUser = window.fitnessDB.getCurrentUser();
            const user = window.fitnessDB.getUserById(currentUser.id);

            if (showingAge) {
                if (user.birthDate) {
                    const date = new Date(user.birthDate);
                    const formattedDate = date.toLocaleDateString('ru-RU', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                    }).replace(/\//g, '.');

                    this.textContent = formattedDate;
                    this.style.fontSize = '18px';
                    this.style.lineHeight = '1.2';
                    this.title = 'Нажмите чтобы увидеть возраст';
                } else {
                    this.textContent = '—';
                    this.style.fontSize = originalStyle.fontSize || '24px';
                }
            } else {
                this.textContent = user.birthDate ? calculateAge(user.birthDate) : '—';
                this.style.fontSize = originalStyle.fontSize || '24px';
                this.style.lineHeight = originalStyle.lineHeight || '1.2';
                this.title = 'Нажмите чтобы увидеть дату рождения';
            }

            showingAge = !showingAge;
        });
    }

    function initApp() {
        if (typeof window.fitnessDB === 'undefined') {
            showError('Ошибка загрузки базы данных. Обновите страницу.');
            return;
        }

        if (typeof window.AppDatabase === 'undefined') {
            showError('Ошибка загрузки базы данных. Обновите страницу.');
            return;
        }

        const currentUser = window.fitnessDB.getCurrentUser();
        if (!currentUser) {
            window.location.href = 'login.html';
            return;
        }

        const user = window.fitnessDB.getUserById(currentUser.id);

        if (!user) {
            window.fitnessDB.logout();
            window.location.href = 'login.html';
            return;
        }

        loadUserProfile(user);
        initEventListeners();
        initProgressRings();
        animateContent();
        initProfileModal();
        initChallengeModal();
        initAvatarUpload();
        initWeightEdit();
        initWorkoutIncrement();
        initAgeToggle();
        initGlobalSearch();
        initMobileMenu();
        checkAndShowCompletionNotification();

        setTimeout(() => {
            if (typeof window.updateProfilePoints === 'function') {
                window.updateProfilePoints();
            }
        }, 500);
    }
    function checkAndShowCompletionNotification() {
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
            }
        }

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
            }
        }
    }
    function calculateLevel(user) {
        const trainings = user.stats?.trainings || 0;

        let level = 1;
        let trainingsNeeded = 20;
        let totalTrainingsNeeded = 0;

        while (true) {
            totalTrainingsNeeded += trainingsNeeded;

            if (trainings < totalTrainingsNeeded) {
                return level;
            }

            level++;
            trainingsNeeded += 10;

            if (level >= 100) return 100;
        }
    }

    function calculateProgress(user) {
        const trainings = user.stats?.trainings || 0;
        const currentLevel = user.level || 1;
        const trainingsNeededForNextLevel = 20 + (currentLevel - 1) * 10;

        let trainingsInCurrentLevel = trainings;

        for (let i = 1; i < currentLevel; i++) {
            const neededForPrevLevel = 20 + (i - 1) * 10;
            trainingsInCurrentLevel -= neededForPrevLevel;
        }

        trainingsInCurrentLevel = Math.max(0, trainingsInCurrentLevel);

        let progress = Math.floor((trainingsInCurrentLevel / trainingsNeededForNextLevel) * 100);
        progress = Math.min(Math.max(progress, 0), 99);

        return progress;
    }

    setTimeout(updateNotificationBadge, 500);

    function initWeightEdit() {
        const weightBox = document.querySelector('.user-stat:nth-child(2) .stat-value');
        if (!weightBox) return;

        weightBox.style.cursor = 'pointer';
        weightBox.title = 'Нажмите чтобы изменить вес';

        weightBox.addEventListener('click', function () {
            const currentWeight = this.textContent;
            const newWeight = prompt('Введите новый вес (кг):', currentWeight);

            if (newWeight && !isNaN(newWeight) && newWeight > 0 && newWeight < 300) {
                const currentUser = window.fitnessDB.getCurrentUser();
                const user = window.fitnessDB.getUserById(currentUser.id);

                user.weight = parseFloat(newWeight);
                window.fitnessDB.updateUser(user.id, { weight: user.weight });
                window.fitnessDB.setCurrentUser(user, true);

                this.textContent = user.weight;
            } else if (newWeight) {
                alert('Пожалуйста, введите корректный вес (1-300 кг)');
            }
        });
    }

    function initWorkoutIncrement() {
        const statBoxes = document.querySelectorAll('.stat-box');
        let trainingsBox = null;

        statBoxes.forEach(box => {
            const label = box.querySelector('.stat-label');
            if (label && label.textContent.includes('тренировок')) {
                trainingsBox = box;
            }
        });

        if (!trainingsBox) {
            return;
        }

        const plusBtn = document.createElement('button');
        plusBtn.className = 'btn-plus';
        plusBtn.innerHTML = '<i class="fas fa-plus"></i>';
        plusBtn.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            background: linear-gradient(135deg, #3b82f6, #8b5cf6);
            color: white;
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            opacity: 0;
            transition: opacity 0.3s, transform 0.3s;
            box-shadow: 0 2px 10px rgba(59,130,246,0.3);
            z-index: 10;
        `;

        trainingsBox.style.position = 'relative';
        trainingsBox.appendChild(plusBtn);

        trainingsBox.addEventListener('mouseenter', () => {
            plusBtn.style.opacity = '1';
        });

        trainingsBox.addEventListener('mouseleave', () => {
            plusBtn.style.opacity = '0';
        });

        plusBtn.addEventListener('click', (e) => {
            e.stopPropagation();

            const currentUser = window.fitnessDB.getCurrentUser();
            const user = window.fitnessDB.getUserById(currentUser.id);

            user.stats = user.stats || { trainings: 0, calories: 0, steps: 0, progress: 0, streak: 0 };

            const oldTrainingsCount = user.stats.trainings || 0;
            const newTrainingsCount = oldTrainingsCount + 1;
            user.stats.trainings = newTrainingsCount;
            const hasBeginnerReward = user.achievements?.some(ach => ach.id === 107);

            if (oldTrainingsCount < 5 && newTrainingsCount >= 5 && !hasBeginnerReward) {
                addAchievementToUser(user, 107);
            }

            const newLevel = calculateLevel(user);
            if (newLevel !== user.level) {
                user.level = newLevel;
                document.getElementById('user-level').textContent = `Уровень ${user.level}`;
                showNotification(`Поздравляем! Вы достигли ${user.level} уровня!`, 'levelup');
                window.fitnessDB.updateUser(user.id, { level: user.level });
            }

            const newProgress = calculateProgress(user);
            user.stats.progress = newProgress;

            window.fitnessDB.updateUser(user.id, {
                stats: user.stats,
                level: user.level
            });

            window.fitnessDB.setCurrentUser(user, true);

            document.getElementById('stat-trainings').textContent = user.stats.trainings;
            document.getElementById('stat-progress').textContent = `${user.stats.progress}%`;

            if (typeof window.updateProfilePoints === 'function') {
                window.updateProfilePoints();
            }

            loadAchievements(user);

        });
    }

    function showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ef4444;
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            z-index: 9999;
            box-shadow: 0 5px 20px rgba(0,0,0,0.2);
        `;
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);
        setTimeout(() => errorDiv.remove(), 5000);
    }

    function loadUserProfile(user) {

        setElementText('user-fullname', `${user.firstName} ${user.lastName}`);
        setElementText('user-level', `Уровень ${user.level || 1}`);
        updateAvatarDisplay(user);

        const achievementsCount = user.achievements?.length || 0;
        setElementText('user-achievements-count', `${achievementsCount} ${declensionAchievements(achievementsCount)}`);
        setElementText('achievements-total', achievementsCount);

        const achievementsBadge = document.getElementById('achievements-badge');
        if (achievementsBadge) achievementsBadge.textContent = achievementsCount;

        const earnedPoints = window.AppDatabase.calculateTotalPoints(user.achievements || []);
        const spentPoints = user.spentPoints || 0;
        const availablePoints = earnedPoints - spentPoints;

        setElementText('total-points', availablePoints);
        document.getElementById('user-bio').innerHTML = generateBio(user);
        setElementText('stat-trainings', user.stats?.trainings || 0);
        setElementText('stat-calories', user.stats?.calories || 0);
        setElementText('stat-steps', (user.stats?.steps || 0).toLocaleString());

        const progress = calculateProgress(user);
        user.stats = user.stats || {};
        user.stats.progress = progress;
        setElementText('stat-progress', `${progress}%`);

        loadUserStats(user);
        loadAchievements(user);
        loadChallenges(user);


        setTimeout(() => {
            showFitnessBandPrompt(user);
        }, 500);
    }

    function showFitnessBandPrompt(user) {
        const hasSteps = (user.stats?.steps || 0) > 0;
        const hasCalories = (user.stats?.calories || 0) > 0;
        const hasSeenPrompt = localStorage.getItem(`band_prompt_${user.id}`) === 'true';

        if ((!hasSteps && !hasCalories) && !hasSeenPrompt) {
            setTimeout(() => {
                showBandConnectionPrompt(user);
            }, 300);
        }
    }
    function showBandConnectionPrompt(user) {
        let attempts = 0;
        const maxAttempts = 10;

        function tryShowPrompt() {
            const statsRows = document.querySelectorAll('.stats-row');
            const trainingStatsRow = statsRows[1];

            if (!trainingStatsRow) {
                attempts++;
                if (attempts < maxAttempts) {
                    setTimeout(tryShowPrompt, 300);
                } else {
                }
                return;
            }

            trainingStatsRow.style.position = 'relative';
            trainingStatsRow.style.minHeight = '120px';

            if (trainingStatsRow.querySelector('.band-connection-overlay')) return;

            const overlay = document.createElement('div');
            overlay.className = 'band-connection-overlay';

            overlay.innerHTML = `
            <div>
                <i class="fas fa-heart-pulse"></i>
                <h3>Подключите фитнес-браслет</h3>
                <button id="connect-band-btn">
                    <i class="fab fa-bluetooth-b"></i> Создать пару
                </button>
            </div>
        `;

            trainingStatsRow.appendChild(overlay);

            const connectBtn = document.getElementById('connect-band-btn');
            if (connectBtn) {
                connectBtn.addEventListener('click', () => {
                    const freshUser = window.fitnessDB.getUserById(user.id);

                    const randomSteps = Math.floor(Math.random() * (12000 - 3000 + 1)) + 3000;
                    const randomCalories = Math.floor(Math.random() * (500 - 100 + 1)) + 100;

                    freshUser.stats = freshUser.stats || { trainings: 0, calories: 0, steps: 0, progress: 0, streak: 0 };
                    freshUser.stats.steps = randomSteps;
                    freshUser.stats.calories = randomCalories;

                    window.fitnessDB.updateUser(freshUser.id, { stats: freshUser.stats });
                    window.fitnessDB.setCurrentUser(freshUser, true);

                    localStorage.setItem(`band_prompt_${user.id}`, 'true');

                    overlay.style.animation = 'fadeOut 0.3s ease';
                    setTimeout(() => {
                        overlay.remove();

                        const stepsEl = document.getElementById('stat-steps');
                        const caloriesEl = document.getElementById('stat-calories');
                        if (stepsEl) stepsEl.textContent = freshUser.stats.steps.toLocaleString();
                        if (caloriesEl) caloriesEl.textContent = freshUser.stats.calories;

                        if (typeof window.updateProfilePoints === 'function') {
                            window.updateProfilePoints();
                        }

                        showBandConnectionSuccessNotification();

                    }, 300);
                });
            }
        }
        tryShowPrompt();
    }
    function showNotification(message, type = 'reward') {
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

        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 10);

        const timeoutId = setTimeout(() => {
            if (notification && notification.parentNode) {
                notification.style.opacity = '0';
                notification.style.transform = 'translateX(100px)';
                notification.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                setTimeout(() => {
                    if (notification && notification.parentNode) notification.remove();
                }, 300);
            }
        }, 3000);

        notification.dataset.timeoutId = timeoutId;
    }    
    function showBandConnectionSuccessNotification() {
        const oldNotification = document.querySelector('.band-success-toast');
        if (oldNotification) oldNotification.remove();

        const notification = document.createElement('div');
        notification.className = 'band-success-toast';
        notification.innerHTML = `
        <div class="band-success-icon">
            <i class="fas fa-check-circle"></i>
        </div>
        <div class="band-success-content">
            <div class="band-success-title">Подключение успешно!</div>
            <div class="band-success-message">Фитнес-браслет синхронизирован</div>
        </div>
        <button class="band-success-close">
            <i class="fas fa-times"></i>
        </button>
    `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
        }, 50);

        const closeBtn = notification.querySelector('.band-success-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                notification.classList.remove('show');
                setTimeout(() => notification.remove(), 300);
            });
        }

        setTimeout(() => {
            if (notification && notification.parentNode) {
                notification.classList.remove('show');
                setTimeout(() => notification.remove(), 300);
            }
        }, 3000);
    }

    function generateBio(user) {
        const achievementsCount = user.achievements?.length || 0;
        return `<img src="images/trophy.png" alt="награды" style="width: 20px; height: 20px; vertical-align: middle; margin-right: 5px;"> ${achievementsCount} ${declensionAchievements(achievementsCount)}`;
    }

    function calculateAge(birthDate) {
        if (!birthDate) return '—';
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    }

    function loadUserStats(user) {
        const ageElement = document.getElementById('profile-age');
        if (ageElement) ageElement.textContent = user.birthDate ? calculateAge(user.birthDate) : '—';

        const weightElement = document.getElementById('profile-weight');
        if (weightElement) weightElement.textContent = user.weight ? `${user.weight}` : '—';

        const levelElement = document.getElementById('profile-fitness-level');
        if (levelElement) {
            const levels = { 'beginner': 'Нач.', 'intermediate': 'Сред.', 'advanced': 'Проф.', 'athlete': 'Спорт.' };
            levelElement.textContent = levels[user.fitnessLevel] || '—';
        }

        const goalElement = document.getElementById('profile-goal');
        if (goalElement) {
            const goals = { 'weight-loss': 'Худею', 'muscle-gain': 'Масса', 'endurance': 'Выносл.', 'health': 'Здоровье', 'competition': 'Спорт' };
            goalElement.textContent = goals[user.goal] || '—';
        }
    }

    function setElementText(id, text) {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    }

    function updateAvatarDisplay(user) {
        const avatarContainer = document.getElementById('user-avatar');
        if (!avatarContainer) return;

        if (user.avatar && user.avatar.startsWith('data:image')) {
            avatarContainer.innerHTML = `<img src="${user.avatar}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
        } else {
            const avatarFile = user.avatar ? `images/${user.avatar}` : (user.gender === 'male' ? 'images/man.png' : 'images/woman.png');
            avatarContainer.innerHTML = `<img src="${avatarFile}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
        }
    }
    function initAvatarUpload() {
        const editAvatarBtn = document.querySelector('.edit-avatar-btn');
        if (!editAvatarBtn) return;

        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.style.display = 'none';
        document.body.appendChild(fileInput);

        editAvatarBtn.addEventListener('click', () => fileInput.click());

        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            if (!file.type.startsWith('image/')) {
                alert('Выберите изображение');
                return;
            }

            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    const size = 200;
                    canvas.width = size;
                    canvas.height = size;
                    const sourceSize = Math.min(img.width, img.height);
                    const startX = (img.width - sourceSize) / 2;
                    const startY = (img.height - sourceSize) / 2;

                    ctx.drawImage(img, startX, startY, sourceSize, sourceSize, 0, 0, size, size);

                    const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.9);
                    saveAvatar(compressedDataUrl);
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        });
    }
    function compressImage(file, quality, callback) {
        const reader = new FileReader();
        reader.onload = (event) => {
            compressImageFromDataUrl(event.target.result, quality, callback);
        };
        reader.readAsDataURL(file);
    }

    function compressImageFromDataUrl(dataUrl, quality, callback) {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            const maxWidth = 200;
            const maxHeight = 200;

            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > maxWidth) {
                    height = Math.round(height * (maxWidth / width));
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width = Math.round(width * (maxHeight / height));
                    height = maxHeight;
                }
            }

            canvas.width = width;
            canvas.height = height;

            ctx.drawImage(img, 0, 0, width, height);

            const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.9);
            callback(compressedDataUrl);
        };
        img.src = dataUrl;
    }
    function saveAvatar(imageData) {
        const currentUser = window.fitnessDB.getCurrentUser();
        const user = window.fitnessDB.getUserById(currentUser.id);
        user.avatar = imageData;
        window.fitnessDB.updateUser(user.id, { avatar: imageData });
        updateAvatarDisplay(user);
        if (typeof updateHeaderAvatar === 'function') updateHeaderAvatar();

    }
    function loadAchievements(user) {
        const grid = document.getElementById('achievements-grid');
        if (!grid) return;

        grid.innerHTML = '';
        const enriched = window.AppDatabase.enrichUserAchievements(user.achievements || []);

        if (enriched.length > 0) {
            enriched.slice(0, 4).forEach(ach => {
                const el = document.createElement('div');
                el.className = `achievement ${ach.rarity || ''}`;
                el.innerHTML = `<div class="achievement-content">${ach.image ? `<img src="images/rewards/${ach.image}" class="achievement-image">` : `<i class="fas ${ach.icon || 'fa-trophy'} achievement-icon"></i>`}</div>`;
                el.addEventListener('click', () => showAchievementCard(ach, true, ach.earnedAt));
                grid.appendChild(el);
            });
        } else {
            grid.innerHTML = '<div class="achievement placeholder"><div class="achievement-content"><i class="fas fa-lock"></i></div><div class="achievement-name">Нет достижений</div></div>';
        }
    }

    function showAchievementCard(achievement, isEarned, earnedDate) {
        const modal = document.getElementById('achievement-modal');
        if (!modal) return;

        document.getElementById('modal-img').src = achievement.image ? `images/rewards/${achievement.image}` : 'images/reward_placeholder.png';
        document.getElementById('modal-rarity').textContent = achievement.rarityName || (achievement.rarity === 'common' ? 'Обычная' : achievement.rarity === 'rare' ? 'Редкая' : 'Супер редкая');
        document.getElementById('modal-title').textContent = achievement.name;
        document.getElementById('modal-unique-id').textContent = achievement.uniqueId || achievement.id;
        document.getElementById('modal-points').textContent = achievement.points || 0;
        document.getElementById('modal-description').textContent = achievement.description || 'Нет описания';

        const dateContainer = document.getElementById('modal-date-container');
        if (isEarned && earnedDate) {
            document.getElementById('modal-date').textContent = new Date(earnedDate).toLocaleDateString('ru-RU');
            dateContainer.style.display = 'flex';
        } else {
            dateContainer.style.display = 'none';
        }

        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    function loadChallenges(user) {
        const list = document.getElementById('challenges-list');
        if (!list) return;

        list.innerHTML = '';
        const active = window.AppDatabase.enrichUserChallenges(user.activeChallenges || []);
        const completed = window.AppDatabase.enrichUserChallenges(user.completedChallenges || []);

        const sortedCompleted = [...completed].sort((a, b) =>
            new Date(b.completedAt) - new Date(a.completedAt)
        );

        if (active.length > 0) {
            active.forEach(c => list.appendChild(createChallengeElement(c, 'active')));
        }

        if (sortedCompleted.length > 0) {
            sortedCompleted.forEach(c => list.appendChild(createChallengeElement(c, 'completed')));
        }

        if (active.length === 0 && sortedCompleted.length === 0) {
            list.innerHTML = '<div class="challenge-item placeholder"><div class="challenge-info"><h4>Нет активных челленджей</h4><p>Присоединитесь к челленджу на странице "Челленджи"</p></div></div>';
        }

        setTimeout(() => initProgressRings(), 100);
    }

    function createChallengeElement(challenge, status) {
        const div = document.createElement('div');
        div.className = `challenge-item ${status === 'completed' ? 'completed' : ''}`;
        div.dataset.id = challenge.id;
        div.dataset.challenge = JSON.stringify(challenge);

        if (status === 'active') {
            const current = challenge.current || 0;
            const total = challenge.total || challenge.duration || 30;
            const progress = Math.round((current / total) * 100);

            div.innerHTML = `
            <div class="challenge-info">
                <h4>${challenge.title}</h4>
                <p>${challenge.description}</p>
                <div class="challenge-stats">
                    <div class="challenge-stat">
                        <i class="fas fa-users"></i>
                        <span>${(challenge.participants || 0).toLocaleString()} участников</span>
                    </div>
                    <div class="challenge-stat">
                        <i class="fas fa-calendar"></i>
                        <span>${current}/${total} дней</span>
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
                    <svg viewBox="0 0 60 60" width="60" height="60">
                        <circle class="progress-ring-bg" cx="30" cy="30" r="26"></circle>
                        <circle class="progress-ring-circle" cx="30" cy="30" r="26"></circle>
                    </svg>
                    <div class="progress-text">${progress}%</div>
                </div>
            </div>
        `;
        } else {
            let completedDate = challenge.completedAt ? new Date(challenge.completedAt).toLocaleDateString('ru-RU') : 'Недавно';
            div.innerHTML = `
            <div class="challenge-info">
                <h4>${challenge.title}</h4>
                <p>${challenge.description}</p>
                <div class="challenge-stats">
                    <div class="challenge-stat">
                        <i class="fas fa-calendar-check"></i>
                        <span>Завершен: ${completedDate}</span>
                    </div>
                    <div class="challenge-stat">
                        <i class="fas fa-award"></i>
                        <span>+${challenge.reward} очков</span>
                    </div>
                </div>
            </div>
            <div class="challenge-status">
                <span class="status-badge status-completed">Завершен</span>
                <div class="progress-ring" data-progress="100">
                    <svg viewBox="0 0 60 60" width="60" height="60">
                        <circle class="progress-ring-bg" cx="30" cy="30" r="26"></circle>
                        <circle class="progress-ring-circle" cx="30" cy="30" r="26" style="stroke: #9946fb;"></circle>
                    </svg>
                    <div class="progress-text">100%</div>
                </div>
            </div>
        `;
        }

        div.addEventListener('click', (e) => {
            if (e.target.tagName !== 'BUTTON' && !e.target.closest('button')) {
                showChallengeModal(challenge, status);
            }
        });

        return div;
    }

    function initProgressRings() {
        document.querySelectorAll('.progress-ring').forEach(ring => {
            const progress = parseInt(ring.dataset.progress) || 0;
            const circle = ring.querySelector('.progress-ring-circle');
            if (!circle) return;
            const radius = 26;
            const circumference = 2 * Math.PI * radius;
            circle.style.strokeDasharray = circumference;
            circle.style.strokeDashoffset = circumference - (progress / 100) * circumference;
            circle.style.stroke = progress === 100 ? '#9946fb' : '#f8c044';
        });
    }

    function animateContent() {
        const elements = [...document.querySelectorAll('.profile-card'), ...document.querySelectorAll('.challenges-section')];
        elements.forEach((el, i) => {
            if (!el) return;
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            setTimeout(() => {
                el.style.transition = 'opacity 0.5s, transform 0.5s';
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }, i * 200);
        });
    }

    function initProfileModal() {
        const modal = document.getElementById('achievement-modal');
        const closeBtn = document.getElementById('close-modal');
        if (!modal || !closeBtn) return;
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });
    }

    function initChallengeModal() {
        const modal = document.getElementById('challenge-modal');
        const closeBtn = document.getElementById('close-challenge-modal');
        if (!modal || !closeBtn) return;
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    }

    function initEventListeners() {
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                window.fitnessDB.logout();
            });
        }
    }

    function initGlobalSearch() {
        const searchInput = document.getElementById('global-search-input');
        const resultsDiv = document.getElementById('search-results');

        if (!searchInput) return;

        searchInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                const query = this.value.trim();
                if (query.length >= 2) {
                    redirectToSearchResult(query);
                } else if (query.length === 1) {
                    resultsDiv.innerHTML = `
                    <div class="no-results">
                        <i class="fas fa-search"></i>
                        <p>Введите минимум 2 символа</p>
                        <small>Попробуйте изменить запрос</small>
                    </div>
                `;
                    resultsDiv.style.display = 'block';
                    setTimeout(() => {
                        resultsDiv.style.display = 'none';
                    }, 2000);
                }
            }
        });

        document.addEventListener('click', function (e) {
            if (!searchInput.contains(e.target) && !resultsDiv.contains(e.target)) {
                resultsDiv.style.display = 'none';
            }
        });

        searchInput.addEventListener('focus', function () {
        });
    }

    function redirectToSearchResult(query) {
        const searchQuery = query.toLowerCase().trim();

        const searchInput = document.getElementById('global-search-input');
        if (searchInput) {
            searchInput.value = '';
        }

        function showNotFoundModal(query) {
            const oldModal = document.querySelector('.search-error-modal');
            if (oldModal) oldModal.remove();

            const modal = document.createElement('div');
            modal.className = 'search-error-modal';
            modal.innerHTML = `
            <div class="search-error-content">
                <div class="search-error-close" id="search-error-close">
                    <i class="fas fa-times"></i>
                </div>
                <div class="search-error-icon">
                    <i class="fas fa-search"></i>
                </div>
                <h3 class="search-error-title">Ничего не найдено</h3>
                <p class="search-error-message">По запросу «${query}» ничего не найдено</p>
                <div class="search-error-suggestions">
                    <p><i class="fas fa-lightbulb"></i> Попробуйте:</p>
                    <ul>
                        <li><i class="fas fa-chevron-right"></i> Проверить орфографию</li>
                        <li><i class="fas fa-chevron-right"></i> Использовать более общие слова</li>
                    </ul>
                </div>
                <button class="search-error-btn" id="search-error-ok">Понятно</button>
            </div>
        `;

            document.body.appendChild(modal);

            function closeModal() {
                modal.remove();
            }

            document.getElementById('search-error-close')?.addEventListener('click', closeModal);
            document.getElementById('search-error-ok')?.addEventListener('click', closeModal);
            modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
            document.addEventListener('keydown', function escHandler(e) {
                if (e.key === 'Escape') {
                    closeModal();
                    document.removeEventListener('keydown', escHandler);
                }
            });
        }

        const challenges = window.AppDatabase.searchChallenges(searchQuery);
        if (challenges.length > 0) {
            sessionStorage.setItem('globalSearchResult', JSON.stringify({
                type: 'challenge',
                query: query,
                results: challenges
            }));
            window.location.href = 'challenges.html';
            return;
        }

        const allAchievements = [
            ...window.AppDatabase.achievements.common,
            ...window.AppDatabase.achievements.rare,
            ...window.AppDatabase.achievements.superRare
        ];
        const achievements = allAchievements.filter(a =>
            a.name.toLowerCase().includes(searchQuery)
        );

        if (achievements.length > 0) {
            sessionStorage.setItem('globalSearchResult', JSON.stringify({
                type: 'achievement',
                query: query,
                results: achievements
            }));
            window.location.href = 'achievements.html';
            return;
        }

        const allUsers = window.fitnessDB.getAllUsers();
        const currentUser = window.fitnessDB.getCurrentUser();
        const users = allUsers.filter(u =>
            u.id !== currentUser.id &&
            !u.privacy?.privateProfile &&
            (`${u.firstName} ${u.lastName}`.toLowerCase().includes(searchQuery) ||
                u.username.toLowerCase().includes(searchQuery))
        );

        if (users.length > 0) {
            sessionStorage.setItem('globalSearchResult', JSON.stringify({
                type: 'user',
                query: query,
                results: users
            }));
            window.location.href = 'leaderboard.html';
            return;
        }

        const shopItems = [
            { id: 'discount-1', name: 'Скидка 10% на абонемент', description: 'Скидка 10% на любой абонемент в сети тренажерных залов "FitnessPro"' },
            { id: 'discount-2', name: 'Скидка 20% на абонемент', description: 'Скидка 20% на годовой абонемент в тренажерный зал' },
            { id: 'nutrition-1', name: 'Сертификат 500₽ на спортпит', description: 'Сертификат на покупку спортивного питания в магазине "SportFood"' },
            { id: 'nutrition-2', name: 'Сертификат 1500₽ на спортпит', description: 'Сертификат на покупку спортивного питания премиум-класса' },
            { id: 'equipment-1', name: 'Коврик для йоги', description: 'Профессиональный коврик для йоги и фитнеса' },
            { id: 'equipment-2', name: 'Набор гантелей (2x5кг)', description: 'Разборные гантели для домашних тренировок' },
            { id: 'equipment-3', name: 'Эспандер', description: 'Фитнес-резинки для тренировок' },
            { id: 'clothes-1', name: 'Футболка TerriFIT', description: 'Брендированная футболка из хлопка' },
            { id: 'clothes-2', name: 'Бутылка для воды', description: 'Спортивная бутылка 750мл' }
        ];

        const shopResults = shopItems.filter(item =>
            item.name.toLowerCase().includes(searchQuery) ||
            item.description.toLowerCase().includes(searchQuery)
        );

        if (shopResults.length > 0) {
            sessionStorage.setItem('globalSearchResult', JSON.stringify({
                type: 'shop',
                query: query,
                results: shopResults
            }));
            window.location.href = 'shop.html';
            return;
        }

        const premiumContentList = [
            { id: 'video-1', title: 'Продвинутая йога', description: '2-часовая практика йоги для продвинутых' },
            { id: 'video-2', title: 'Силовая тренировка', description: 'Интенсивная силовая тренировка' },
            { id: 'video-3', title: 'Питание для профи', description: 'Лекция о спортивном питании' },
            { id: 'video-4', title: 'Секреты чемпионов', description: 'Эксклюзивное интервью с чемпионом мира' },
            { id: 'video-5', title: 'Медитация для спортсменов', description: 'Медитация для восстановления' },
            { id: 'article-1', title: 'Программа тренировок', description: '12-недельная программа для набора массы' },
            { id: 'recipe-1', title: 'Кулинарная книга', description: '50 рецептов для здорового питания' },
            { id: 'webinar-1', title: 'Вебинар с тренером', description: 'Запись вебинара: "Как избежать травм"' },
            { id: 'webinar-2', title: 'Питание для похудения', description: 'Вебинар с диетологом о правильном питании' }
        ];

        const premiumResults = premiumContentList.filter(item =>
            item.title.toLowerCase().includes(searchQuery) ||
            item.description.toLowerCase().includes(searchQuery)
        );

        if (premiumResults.length > 0) {
            sessionStorage.setItem('globalSearchResult', JSON.stringify({
                type: 'premium',
                query: query,
                results: premiumResults
            }));
            window.location.href = 'premium.html';
            return;
        }

        showNotFoundModal(query);
    }    function performGlobalSearch(query) {
        const resultsDiv = document.getElementById('search-results');
        if (!resultsDiv) {
            return;
        }

        const searchQuery = query.toLowerCase().trim();

        if (searchQuery.length < 2) {
            resultsDiv.style.display = 'none';
            return;
        }

        let html = '';
        let hasResults = false;

        const allUsers = window.fitnessDB.getAllUsers();
        const currentUser = window.fitnessDB.getCurrentUser();

        const users = allUsers
            .filter(u => u.id !== currentUser.id)
            .filter(u => {
                if (u.privacy?.privateProfile) return false;
                const displayName = u.privacy?.hideRealName
                    ? (u.privacy.displayName || u.username).toLowerCase()
                    : `${u.firstName} ${u.lastName}`.toLowerCase();
                return displayName.includes(searchQuery) || u.username.toLowerCase().includes(searchQuery);
            })
            .slice(0, 3);

        if (users.length > 0) {
            hasResults = true;
            html += '<div class="search-section">';
            html += '<div class="search-section-title"><i class="fas fa-users"></i> Пользователи</div>';
            users.forEach(u => {
                const displayName = u.privacy?.hideRealName
                    ? (u.privacy.displayName || u.username)
                    : `${u.firstName} ${u.lastName}`;
                html += `
                <div class="search-result-item" onclick="window.location.href='leaderboard.html'">
                    <div class="result-avatar user">
                        <i class="fas fa-user"></i>
                    </div>
                    <div class="result-info">
                        <div class="result-name">${displayName}</div>
                        <div class="result-detail">Уровень ${u.level || 1}</div>
                    </div>
                    <div class="result-action"><i class="fas fa-chevron-right"></i></div>
                </div>
            `;
            });
            html += '</div>';
        }

        const challenges = window.AppDatabase.searchChallenges(searchQuery).slice(0, 3);
        if (challenges.length > 0) {
            hasResults = true;
            html += '<div class="search-section">';
            html += '<div class="search-section-title"><i class="fas fa-flag-checkered"></i> Челленджи</div>';
            challenges.forEach(c => {
                const typeClass = c.type === 'daily' ? 'daily' : 'seasonal';
                const typeName = c.type === 'daily' ? 'Ежедневный' : 'Сезонный';
                html += `
                <div class="search-result-item" onclick="window.location.href='challenges.html'">
                    <div class="result-avatar challenge">
                        <i class="fas ${c.icon || 'fa-flag-checkered'}"></i>
                    </div>
                    <div class="result-info">
                        <div class="result-name">${c.title}</div>
                        <div class="result-detail">
                            <span class="result-type ${typeClass}">${typeName}</span>
                            <span class="result-points">+${c.reward} очков</span>
                        </div>
                    </div>
                    <div class="result-action"><i class="fas fa-chevron-right"></i></div>
                </div>
            `;
            });
            html += '</div>';
        }

        const allAchievements = [
            ...window.AppDatabase.achievements.common,
            ...window.AppDatabase.achievements.rare,
            ...window.AppDatabase.achievements.superRare
        ];
        const achievements = allAchievements
            .filter(a => a.name.toLowerCase().includes(searchQuery))
            .slice(0, 3);

        if (achievements.length > 0) {
            hasResults = true;
            html += '<div class="search-section">';
            html += '<div class="search-section-title"><i class="fas fa-trophy"></i> Достижения</div>';
            achievements.forEach(a => {
                const rarityClass = a.rarity || 'common';
                const rarityName = a.rarityName || (a.rarity === 'common' ? 'Обычная' : a.rarity === 'rare' ? 'Редкая' : 'Супер редкая');
                html += `
                <div class="search-result-item" onclick="window.location.href='achievements.html'">
                    <div class="result-avatar achievement">
                        <i class="fas ${a.icon || 'fa-trophy'}"></i>
                    </div>
                    <div class="result-info">
                        <div class="result-name">${a.name}</div>
                        <div class="result-detail">
                            <span class="result-rarity ${rarityClass}">${rarityName}</span>
                            <span class="result-points">+${a.points} очков</span>
                        </div>
                    </div>
                    <div class="result-action"><i class="fas fa-chevron-right"></i></div>
                </div>
            `;
            });
            html += '</div>';
        }

        if (!hasResults) {
            html = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <p>Ничего не найдено</p>
                <small>Попробуйте изменить запрос</small>
            </div>
        `;
        }

        resultsDiv.innerHTML = html;
        resultsDiv.style.display = 'block';
    }

    function showRewardNotification(achievement) {
        const oldNotification = document.querySelector('.reward-toast');
        if (oldNotification) oldNotification.remove();

        const notification = document.createElement('div');
        notification.className = 'reward-toast';
        notification.innerHTML = `
        <div class="reward-toast-icon">
            <i class="fas fa-award"></i>
        </div>
        <div class="reward-toast-content">
            <div class="reward-toast-title">🏆 Новая награда!</div>
            <div class="reward-toast-name">${achievement.name}</div>
            <div class="reward-toast-points">+${achievement.points} очков</div>
        </div>
        <button class="reward-toast-close">
            <i class="fas fa-times"></i>
        </button>
    `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        notification.querySelector('.reward-toast-close').addEventListener('click', () => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        });

        setTimeout(() => {
            if (notification.parentNode) {
                notification.classList.remove('show');
                setTimeout(() => notification.remove(), 300);
            }
        }, 4000);
    }
    function updateProfileUI(user) {
        const earnedPoints = window.AppDatabase.calculateTotalPoints(user.achievements || []);
        const spentPoints = user.spentPoints || 0;
        const availablePoints = earnedPoints - spentPoints;

        const totalPointsEl = document.getElementById('total-points');
        if (totalPointsEl) totalPointsEl.textContent = availablePoints;

        const achievementsCount = user.achievements?.length || 0;
        const achievementsTotalEl = document.getElementById('achievements-total');
        if (achievementsTotalEl) achievementsTotalEl.textContent = achievementsCount;

        const userAchievementsCountEl = document.getElementById('user-achievements-count');
        if (userAchievementsCountEl) userAchievementsCountEl.textContent = `${achievementsCount} ${declensionAchievements(achievementsCount)}`;

        const achievementsBadge = document.getElementById('achievements-badge');
        if (achievementsBadge) achievementsBadge.textContent = achievementsCount;

        const bioEl = document.getElementById('user-bio');
        if (bioEl) bioEl.innerHTML = generateBio(user);

        loadAchievements(user);
    }

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

        burgerMenu.addEventListener('click', openMenu);

        if (mobileMenuClose) {
            mobileMenuClose.addEventListener('click', closeMenu);
        }

        document.querySelectorAll('.mobile-menu-item').forEach(item => {
            if (item.id !== 'mobile-logout-btn') {
                item.addEventListener('click', () => {
                    setTimeout(closeMenu, 150);
                });
            }
        });

        if (mobileLogoutBtn) {
            mobileLogoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                closeMenu();
                setTimeout(() => {
                    window.fitnessDB.logout();
                }, 200);
            });
        }
    }
    function canMarkChallengeToday(challengeId) {
        const currentUser = window.fitnessDB.getCurrentUser();
        const user = window.fitnessDB.getUserById(currentUser.id);
        const today = new Date().toDateString();
        const lastMarkedDate = user.lastChallengeMark?.[challengeId] ?
            new Date(user.lastChallengeMark[challengeId]).toDateString() : null;
        return lastMarkedDate !== today;
    }

    function showChallengeModal(challenge, status) {
        const modal = document.getElementById('challenge-modal');
        if (!modal) return;

        function setModalText(id, text) {
            const el = document.getElementById(id);
            if (el) el.textContent = text;
        }

        setModalText('modal-challenge-title', challenge.title);
        setModalText('modal-challenge-description', challenge.longDescription || challenge.description);
        setModalText('modal-challenge-type', challenge.typeName || (challenge.type === 'daily' ? 'Ежедневный' : 'Сезонный'));
        setModalText('modal-challenge-difficulty', challenge.difficultyName ||
            (challenge.difficulty === 'beginner' ? 'Начальный' : challenge.difficulty === 'intermediate' ? 'Средний' : 'Экспертный'));
        setModalText('modal-challenge-duration', challenge.durationText || `${challenge.duration || challenge.total || 30} дней`);
        setModalText('modal-challenge-points', challenge.reward || 0);
        setModalText('modal-challenge-participants', (challenge.participants || 0).toLocaleString());

        const typeBadge = document.getElementById('modal-challenge-type-badge');
        if (typeBadge) {
            typeBadge.className = `challenge-detail-type-badge ${challenge.type || 'seasonal'}`;
        }

        const statusBadge = document.getElementById('modal-challenge-status');
        const statusContainer = document.getElementById('modal-challenge-status-badge');

        if (status === 'active') {
            if (statusBadge) statusBadge.textContent = 'Активный';
            if (statusContainer) statusContainer.className = 'status-badge status-active';
        } else if (status === 'completed') {
            if (statusBadge) statusBadge.textContent = 'Завершен';
            if (statusContainer) statusContainer.className = 'status-badge status-completed';
        } else {
            if (statusBadge) statusBadge.textContent = 'Доступен';
            if (statusContainer) statusContainer.className = 'status-badge status-available';
        }

        const rewardBadge = document.getElementById('modal-reward-rarity-badge');
        if (rewardBadge) {
            rewardBadge.className = `reward-rarity-badge ${challenge.rewardRarity || 'common'}`;
            setModalText('modal-reward-rarity', challenge.rewardRarityName ||
                (challenge.rewardRarity === 'common' ? 'Обычная' : challenge.rewardRarity === 'rare' ? 'Редкая' : 'Супер редкая'));
        }
        setModalText('modal-reward-id', challenge.rewardId || `RWD-${challenge.id}`);
        setModalText('modal-reward-points', challenge.reward || 0);

        const progressSection = document.getElementById('modal-progress-section');
        if (progressSection) {
            if (status === 'active') {
                const current = challenge.current || 0;
                const total = challenge.total || challenge.duration || 30;
                const progressPercent = Math.round((current / total) * 100);
                setModalText('modal-progress-days', `${current}/${total}`);
                const progressBar = document.getElementById('modal-progress-bar');
                if (progressBar) progressBar.style.width = `${progressPercent}%`;
                progressSection.style.display = 'block';
            } else {
                progressSection.style.display = 'none';
            }
        }

        document.getElementById('early-completion-warning').style.display = 'none';

        const actionsContainer = document.getElementById('modal-actions');
        if (actionsContainer) {
            actionsContainer.innerHTML = '';
            if (status === 'active') {
                if (challenge.isDaily || challenge.duration === 1) {
                    const completeBtn = document.createElement('button');
                    completeBtn.className = 'btn-primary';
                    completeBtn.style.flex = '1';
                    completeBtn.textContent = '✅ Завершить челлендж';
                    completeBtn.onclick = () => completeDailyChallenge(challenge.id);
                    actionsContainer.appendChild(completeBtn);
                } else {
                    const current = challenge.current || 0;
                    const total = challenge.total || challenge.duration || 30;
                    const canMarkToday = canMarkChallengeToday(challenge.id);

                    const markDayBtn = document.createElement('button');
                    markDayBtn.className = `btn-primary ${!canMarkToday ? 'disabled' : ''}`;
                    markDayBtn.style.flex = '1';
                    markDayBtn.textContent = canMarkToday ?
                        `📅 Отметить день ${current + 1}/${total}` :
                        '✅ Сегодня уже отмечено';
                    markDayBtn.disabled = !canMarkToday;
                    markDayBtn.onclick = () => markChallengeDay(challenge.id);
                    actionsContainer.appendChild(markDayBtn);

                    const earlyCompleteBtn = document.createElement('button');
                    earlyCompleteBtn.className = 'btn-secondary';
                    earlyCompleteBtn.style.flex = '1';
                    earlyCompleteBtn.textContent = '⚠️ Завершить досрочно';
                    earlyCompleteBtn.onclick = () => showEarlyCompletionWarning(challenge.id);
                    actionsContainer.appendChild(earlyCompleteBtn);
                }
            }
        }

        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
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
                const levelData = {
                    level: user.level,
                    timestamp: Date.now()
                };
                sessionStorage.setItem('levelUpNotification', JSON.stringify(levelData));
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

        const notificationData = {
            title: challengeData.title,
            reward: challengeData.reward,
            timestamp: Date.now()
        };
        sessionStorage.setItem('challengeCompleteNotification', JSON.stringify(notificationData));

        const modal = document.getElementById('challenge-modal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }

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

            const notificationData = {
                title: challenge.title,
                reward: challenge.reward,
                timestamp: Date.now()
            };
            sessionStorage.setItem('challengeCompleteNotification', JSON.stringify(notificationData));

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
                    const levelData = {
                        level: user.level,
                        timestamp: Date.now()
                    };
                    sessionStorage.setItem('levelUpNotification', JSON.stringify(levelData));
                }
            }

            window.fitnessDB.updateUser(user.id, {
                activeChallenges: user.activeChallenges,
                completedChallenges: user.completedChallenges,
                achievements: user.achievements,
                pointTransactions: user.pointTransactions,
                stats: user.stats,
                level: user.level,
                lastChallengeMark: user.lastChallengeMark
            });

            window.fitnessDB.setCurrentUser(user, true);

            const modal = document.getElementById('challenge-modal');
            if (modal) {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }

            window.location.reload();

        } else {
            window.fitnessDB.updateUser(user.id, {
                activeChallenges: user.activeChallenges,
                lastChallengeMark: user.lastChallengeMark
            });

            window.fitnessDB.setCurrentUser(user, true);

            const progressPercent = Math.round((challenge.current / challenge.total) * 100);
            const progressDaysEl = document.getElementById('modal-progress-days');
            const progressBarEl = document.getElementById('modal-progress-bar');

            if (progressDaysEl) progressDaysEl.textContent = `${challenge.current}/${challenge.total}`;
            if (progressBarEl) progressBarEl.style.width = `${progressPercent}%`;

            if (typeof window.showNotification === 'function') {
                window.showNotification(`📅 Прогресс в челлендже "${challenge.title}": ${challenge.current}/${challenge.total} (${progressPercent}%)`, 'progress');
            }

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

        document.getElementById('challenge-modal').style.display = 'none';
        document.body.style.overflow = 'auto';
        window.location.href = window.location.href;
    }
    function addAchievementToUser(user, achievementId, customName = null) {
        const achievementData = window.AppDatabase.findAchievementById(achievementId);
        if (!achievementData) return false;

        if (user.achievements?.some(a => a.id === achievementId)) return false;

        const now = new Date();

        const newAchievement = {
            id: achievementId,
            name: customName || achievementData.name,
            icon: achievementData.icon,
            image: achievementData.image,
            earnedAt: new Date().toISOString(),
            points: achievementData.points,
            rarity: achievementData.rarity,
            rarityName: achievementData.rarityName,
            uniqueId: achievementData.uniqueId,
            description: achievementData.description
        };

        user.achievements = user.achievements || [];
        user.achievements.push(newAchievement);

        user.pointTransactions = user.pointTransactions || [];
        user.pointTransactions.push({
            id: Date.now(),
            itemId: achievementId,
            itemName: newAchievement.name,
            points: achievementData.points,
            date: now.toISOString(), 
            type: 'achievement'
        });

        window.fitnessDB.updateUser(user.id, {
            achievements: user.achievements,
            pointTransactions: user.pointTransactions
        });

        if (typeof window.showNotification === 'function') {
            window.showNotification(`🎉 Вы получили награду: ${newAchievement.name}! (+${achievementData.points} очков)`, 'reward');
        } else if (typeof showNotification === 'function') {
            showNotification(`🎉 Вы получили награду: ${newAchievement.name}! (+${achievementData.points} очков)`, 'reward');
        }        updateProfileUI(user);

        return true;
    }
    function initEventListeners() {
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                window.fitnessDB.logout();
            });
        }

        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');

                const filter = this.dataset.filter;
                const challenges = document.querySelectorAll('.challenge-item:not(.placeholder)');

                challenges.forEach(challenge => {
                    const statusBadge = challenge.querySelector('.status-badge');
                    const status = statusBadge?.textContent || '';

                    if (filter === 'all') {
                        challenge.style.display = 'flex';
                    } else if (filter === 'active' && status === 'Активный') {
                        challenge.style.display = 'flex';
                    } else if (filter === 'completed' && status === 'Завершен') {
                        challenge.style.display = 'flex';
                    } else {
                        challenge.style.display = 'none';
                    }
                });
            });
        });
    }
    window.showNotification = showNotification;

});

window.updateProfilePoints = function () {
    const currentUser = window.fitnessDB?.getCurrentUser();
    if (!currentUser) return;
    const user = window.fitnessDB.getUserById(currentUser.id);
    if (!user) return;
    const earnedPoints = window.AppDatabase.calculateTotalPoints(user.achievements || []);
    const spentPoints = user.spentPoints || 0;
    const availablePoints = earnedPoints - spentPoints;
    const totalPointsEl = document.getElementById('total-points');
    if (totalPointsEl) totalPointsEl.textContent = availablePoints;
    document.querySelectorAll('.user-points').forEach(el => el.textContent = availablePoints);
};
