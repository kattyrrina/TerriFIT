class FitnessDatabase {
    constructor() {
        this.STORAGE_KEY = 'fitness_users';
        this.CURRENT_USER_KEY = 'fitness_current_user';

        this.initDatabase();
    }

    initDatabase() {
        const users = localStorage.getItem(this.STORAGE_KEY);

        if (!users) {
            const defaultUsers = [
                {
                    id: 1,
                    username: 'sokol',
                    password: '12345679',
                    firstName: 'Игорь',
                    lastName: 'Соколовский',
                    phone: '+79991234567',
                    birthDate: '1996-11-05',
                    gender: 'male',
                    weight: 75.5,
                    fitnessLevel: 'advanced',
                    goal: 'muscle-gain',
                    goalText: 'Набор мышечной массы',
                    medicalIssues: '',
                    level: 4,  // Меняем на 4
                    avatar: 'man.png',
                    registrationDate: '2024-01-15T10:30:00.000Z',
                    lastLogin: new Date().toISOString(),
                    lastProgressUpdate: new Date().toISOString(),
                    stats: {
                        trainings: 140,  // Меняем на 140
                        calories: 2347,
                        steps: 15200,
                        progress: 87,
                        streak: 42
                    },
                    achievements: [
                        {
                            id: 1,
                            name: '100 тренировок',
                            icon: 'fa-fire',
                            image: 'reward_100_workout.png',
                            earnedAt: '2026-01-01',
                            challengeId: null,
                            challengeTitle: null
                        },
                        {
                            id: 2,
                            name: 'Силач',
                            icon: 'fa-dumbbell',
                            image: 'reward_power.png',
                            earnedAt: '2026-01-15',
                            challengeId: null,
                            challengeTitle: null
                        },
                        {
                            id: 3,
                            name: 'Марафонец',
                            icon: 'fa-running',
                            image: 'reward_runner.png',
                            earnedAt: '2026-02-20',
                            challengeId: null,
                            challengeTitle: null
                        },
                        {
                            id: 4,
                            name: 'Звезда сообщества',
                            icon: 'fa-star',
                            image: 'reward_star.png',
                            earnedAt: '2026-03-23',
                            challengeId: null,
                            challengeTitle: null
                        }
                    ],
                    activeChallenges: [
                        {
                            id: 1,
                            title: '30 дней приседаний',
                            description: 'Выполняйте приседания каждый день для укрепления ног',
                            participants: 245,
                            duration: 30,
                            reward: 250,
                            rewardRarity: 'common',
                            rewardRarityName: 'Обычная',
                            rewardId: 'RWD-001',
                            current: 19,
                            total: 30,
                            joinedAt: '2024-11-01T10:30:00.000Z',
                            status: 'active'
                        },
                        {
                            id: 2,
                            title: 'Пить 2л воды в день',
                            description: 'Следите за водным балансом организма',
                            participants: 189,
                            duration: 30,
                            reward: 200,
                            rewardRarity: 'common',
                            rewardRarityName: 'Обычная',
                            rewardId: 'RWD-002',
                            current: 24,
                            total: 30,
                            joinedAt: '2024-10-28T15:45:00.000Z',
                            status: 'active'
                        }
                    ],
                    completedChallenges: [
                        {
                            id: 3,
                            title: '10000 шагов в день',
                            description: 'Поддерживайте ежедневную активность',
                            participants: 312,
                            duration: 30,
                            reward: 300,
                            rewardRarity: 'common',
                            rewardRarityName: 'Обычная',
                            rewardId: 'RWD-003',
                            completedAt: '2026-01-10T09:15:00.000Z',
                            status: 'completed'
                        }
                    ],
                    purchasedItems: [],
                    openedPremiumContent: [],
                    pointTransactions: [],
                    spentPoints: 0,
                    notifications: [
                        {
                            id: Date.now(),
                            type: 'challenge_invite',
                            fromUserId: 1002,
                            fromUserName: 'Елена Фитнес',
                            fromUserAvatar: 'woman.png',
                            fromUserGender: 'female',
                            challengeId: 101,
                            challengeTitle: '10 000 шагов',
                            challengeDescription: 'Пройдите 10 000 шагов за день',
                            challengeReward: 50,
                            challengeDuration: 1,
                            message: 'приглашает вас участвовать в челлендже "10 000 шагов"',
                            date: new Date().toISOString(),
                            read: false,
                            status: 'pending'
                        }
                    ]
                }
            ];

            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(defaultUsers));
            console.log('✅ База данных инициализирована, создан пользователь sokol с челленджами');
        }

        if (localStorage.getItem('fitnessUsers')) {
            console.log('🗑️ Удаляем старую базу данных fitnessUsers');
            localStorage.removeItem('fitnessUsers');
        }
    }

    getAvailablePoints(userId) {
        const user = this.getUserById(userId);
        if (!user) return 0;

        const earnedPoints = window.AppDatabase.calculateTotalPoints(user.achievements || []);
        const spentPoints = user.spentPoints || 0;
        const availablePoints = earnedPoints - spentPoints;

        console.log('💰 Расчет очков:', { earnedPoints, spentPoints, availablePoints });

        return availablePoints;
    }

    getAllUsers() {
        const users = localStorage.getItem(this.STORAGE_KEY);
        return users ? JSON.parse(users) : [];
    }

    saveUsers(users) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(users));
        console.log('💾 Сохранено пользователей:', users.length);
    }

    getUserById(id) {
        const users = this.getAllUsers();
        return users.find(user => user.id === id) || null;
    }

    getUserByUsername(username) {
        const users = this.getAllUsers();
        return users.find(user => user.username === username) || null;
    }

    getUserByPhone(phone) {
        const users = this.getAllUsers();
        return users.find(user => user.phone === phone) || null;
    }

    createUser(userData) {
        const users = this.getAllUsers();

        if (this.getUserByUsername(userData.username)) {
            console.error('❌ Логин уже существует:', userData.username);
            return null;
        }

        if (this.getUserByPhone(userData.phone)) {
            console.error('❌ Телефон уже существует:', userData.phone);
            return null;
        }

        const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;

        const newUser = {
            id: newId,
            username: userData.username,
            password: userData.password,
            firstName: userData.firstName,
            lastName: userData.lastName,
            phone: userData.phone,
            birthDate: userData.birthDate || null,
            gender: userData.gender || 'male',
            weight: parseFloat(userData.weight) || 70,
            fitnessLevel: userData.fitnessLevel || 'beginner',
            goal: userData.goal || 'health',
            goalText: this.getGoalText(userData.goal),
            medicalIssues: userData.medicalIssues || '',
            level: 1,
            avatar: userData.gender === 'male' ? 'man.png' : 'woman.png',
            registrationDate: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            lastProgressUpdate: new Date().toISOString(),
            stats: {
                trainings: 0,
                calories: 0,
                steps: 0,
                progress: 0,
                streak: 0
            },
            achievements: [],
            activeChallenges: [],
            completedChallenges: [],
            purchasedItems: [],              
            openedPremiumContent: [],        
            pointTransactions: [],          
            spentPoints: 0                  
        };

        users.push(newUser);
        this.saveUsers(users);

        console.log('✅ Новый пользователь создан:', newUser.username, 'ID:', newUser.id);
        console.log('   🛍️ Поля магазина инициализированы');
        return newUser;
    }

    authenticate(username, password) {
        const user = this.getUserByUsername(username);

        if (user && user.password === password) {
            const updatedUser = this.updateChallengeProgress(user);

            updatedUser.lastLogin = new Date().toISOString();

            this.updateUser(updatedUser.id, {
                lastLogin: updatedUser.lastLogin,
                activeChallenges: updatedUser.activeChallenges,
                completedChallenges: updatedUser.completedChallenges,
                lastProgressUpdate: updatedUser.lastProgressUpdate
            });

            console.log('✅ Вход выполнен:', updatedUser.username);
            console.log('   Активные челленджи:', updatedUser.activeChallenges?.length || 0);
            console.log('   Завершенные челленджи:', updatedUser.completedChallenges?.length || 0);

            return updatedUser;
        }

        console.log('❌ Неверный логин или пароль:', username);
        return null;
    }

    updateUser(userId, updatedData) {
        const users = this.getAllUsers();
        const index = users.findIndex(u => u.id === userId);

        if (index !== -1) {
            users[index] = { ...users[index], ...updatedData };
            this.saveUsers(users);
            return users[index];
        }

        return null;
    }

    getCurrentUser() {
        const userJson = localStorage.getItem(this.CURRENT_USER_KEY);
        if (userJson) {
            try {
                return JSON.parse(userJson);
            } catch (e) {
                return null;
            }
        }
        return null;
    }

    setCurrentUser(user, remember = true) {
        const userData = {
            id: user.id,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            gender: user.gender,
            avatar: user.avatar,
            level: user.level,
            stats: user.stats,
            achievements: user.achievements,
            activeChallenges: user.activeChallenges,
            completedChallenges: user.completedChallenges,
            purchasedItems: user.purchasedItems || [],
            openedPremiumContent: user.openedPremiumContent || [],
            pointTransactions: user.pointTransactions || [],
            spentPoints: user.spentPoints || 0
        };

        localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(userData));
        console.log('👤 Текущий пользователь:', user.username);
    }

    logout() {
        localStorage.removeItem(this.CURRENT_USER_KEY);
        console.log('👋 Выход из системы');
        window.location.href = 'login.html';
    }

    getGoalText(goalCode) {
        const goals = {
            'weight-loss': 'Похудение',
            'muscle-gain': 'Набор мышечной массы',
            'endurance': 'Выносливость',
            'health': 'Здоровье',
            'competition': 'Соревнования'
        };
        return goals[goalCode] || 'Фитнес';
    }

    getAllChallenges() {
        if (window.AppDatabase) {
            const challenges = {};
            window.AppDatabase.challenges.forEach(c => {
                challenges[c.id] = {
                    id: c.id,
                    title: c.title,
                    description: c.description,
                    participants: c.participants,
                    reward: c.reward,
                    total: c.duration,
                    icon: c.icon,
                    rewardRarity: c.rewardRarity,
                    rewardRarityName: c.rewardRarityName,
                    rewardId: c.rewardId
                };
            });
            return challenges;
        }

        return this._getLegacyChallenges();
    }

    getRewardForChallenge(challengeId) {
        if (window.AppDatabase) {
            return window.AppDatabase.getRewardForChallenge(challengeId);
        }
        return null;
    }

    completeChallenge(userId, challengeData, completedChallenge) {
        const user = this.getUserById(userId);
        if (!user) return null;

        user.completedChallenges = user.completedChallenges || [];
        user.completedChallenges.push(completedChallenge);

        const reward = window.AppDatabase ?
            window.AppDatabase.getRewardForChallenge(challengeData.id) :
            {
                id: challengeData.id,
                name: challengeData.title,
                icon: 'fa-trophy',
                image: `reward_${challengeData.rewardRarity}.png`,
                points: challengeData.reward,
                rarity: challengeData.rewardRarity,
                rarityName: challengeData.rewardRarityName,
                uniqueId: challengeData.rewardId
            };

        const newAchievement = {
            id: challengeData.id,
            name: challengeData.title,
            icon: 'fa-trophy',
            image: reward.image,
            earnedAt: new Date().toISOString().split('T')[0],
            points: challengeData.reward,
            rarity: challengeData.rewardRarity,
            rarityName: challengeData.rewardRarityName,
            uniqueId: challengeData.rewardId,
            description: `Завершен челлендж "${challengeData.title}"`,
            challengeId: challengeData.id,
            challengeTitle: challengeData.title
        };

        user.achievements = user.achievements || [];
        user.achievements.push(newAchievement);

        this.updateUser(user.id, {
            completedChallenges: user.completedChallenges,
            achievements: user.achievements
        });

        return newAchievement;
    }

    updateChallengeProgress(user) {
        if (!user) return user;

        const updatedUser = { ...user };

        if (!updatedUser.activeChallenges || updatedUser.activeChallenges.length === 0) {
            return updatedUser;
        }

        const today = new Date().toDateString();
        const lastLogin = updatedUser.lastLogin ? new Date(updatedUser.lastLogin).toDateString() : null;

        if (lastLogin === today) {
            console.log('⏭ Сегодня уже обновляли прогресс');
            return updatedUser;
        }

        let updated = false;
        const newActiveChallenges = [];
        const newCompletedChallenges = updatedUser.completedChallenges || [];

        updatedUser.activeChallenges.forEach(challenge => {
            const updatedChallenge = { ...challenge };

            if (updatedChallenge.status === 'active') {
                updatedChallenge.current = Math.min((updatedChallenge.current || 0) + 1, updatedChallenge.total || 30);

                if (updatedChallenge.current >= (updatedChallenge.total || 30)) {
                    updatedChallenge.status = 'completed';
                    updatedChallenge.completedAt = new Date().toISOString();
                    updatedChallenge.current = updatedChallenge.total || 30;

                    newCompletedChallenges.push({
                        id: updatedChallenge.id,
                        title: updatedChallenge.title,
                        description: updatedChallenge.description,
                        participants: updatedChallenge.participants,
                        total: updatedChallenge.total,
                        current: updatedChallenge.total,
                        reward: updatedChallenge.reward || 200,
                        rewardRarity: updatedChallenge.rewardRarity || 'common',
                        rewardRarityName: updatedChallenge.rewardRarityName || 'Обычная',
                        rewardId: updatedChallenge.rewardId || `RWD-${updatedChallenge.id}`,
                        completedAt: updatedChallenge.completedAt
                    });

                    console.log(`✅ Челлендж "${updatedChallenge.title}" завершен!`);
                    updated = true;
                } else {
                    newActiveChallenges.push(updatedChallenge);
                    updated = true;
                }
            } else {
                newActiveChallenges.push(updatedChallenge);
            }
        });

        updatedUser.activeChallenges = newActiveChallenges;
        updatedUser.completedChallenges = newCompletedChallenges;

        if (updated) {
            updatedUser.lastProgressUpdate = new Date().toISOString();
            console.log(`📈 Прогресс челленджей обновлен: +1 день`);
            console.log(`   Активных: ${newActiveChallenges.length}, Завершенных: ${newCompletedChallenges.length}`);
        }

        return updatedUser;
    }

    joinChallenge(userId, challengeId) {
        const users = this.getAllUsers();
        const index = users.findIndex(u => u.id === userId);

        if (index !== -1) {
            const challenges = this.getAllChallenges();
            const challenge = challenges[challengeId];

            if (!challenge) return null;

            if (!users[index].activeChallenges) {
                users[index].activeChallenges = [];
            }

            const alreadyJoined = users[index].activeChallenges.some(c => c.id === challengeId);
            if (!alreadyJoined) {
                users[index].activeChallenges.push({
                    id: challenge.id,
                    title: challenge.title,
                    description: challenge.description,
                    participants: challenge.participants,
                    total: challenge.total,
                    duration: challenge.total,
                    current: 0,
                    reward: challenge.reward,
                    rewardRarity: challenge.rewardRarity,
                    rewardRarityName: challenge.rewardRarityName,
                    rewardId: challenge.rewardId,
                    joinedAt: new Date().toISOString(),
                    status: 'active'
                });

                this.saveUsers(users);
                console.log(`✅ Пользователь ${userId} присоединился к челленджу "${challenge.title}"`);
                return users[index];
            }
        }
        return null;
    }

    completeChallenge(userId, challengeData, completedChallenge) {
        const user = this.getUserById(userId);
        if (!user) return null;

        user.completedChallenges = user.completedChallenges || [];
        user.completedChallenges.push(completedChallenge);

        const newAchievement = {
            id: challengeData.id,
            name: challengeData.title,
            icon: 'fa-trophy',
            image: `reward_${challengeData.rewardRarity}.png`,
            earnedAt: new Date().toISOString().split('T')[0],
            points: challengeData.reward,
            rarity: challengeData.rewardRarity,
            rarityName: challengeData.rewardRarityName,
            uniqueId: challengeData.rewardId,
            description: `Завершен челлендж "${challengeData.title}"`,
            challengeId: challengeData.id,
            challengeTitle: challengeData.title
        };

        user.achievements = user.achievements || [];
        user.achievements.push(newAchievement);

        user.stats = user.stats || { trainings: 0, calories: 0, steps: 0, progress: 0, streak: 0 };
        user.stats.trainings = (user.stats.trainings || 0) + 1;

        this.updateUser(user.id, {
            completedChallenges: user.completedChallenges,
            achievements: user.achievements,
            stats: user.stats
        });

        return newAchievement;
    }

    getAchievementByChallengeId(userId, challengeId) {
        const user = this.getUserById(userId);
        if (!user || !user.achievements) return null;

        return user.achievements.find(a => a.challengeId === challengeId || a.id === challengeId);
    }
    getCompletedChallengesWithRewards(userId) {
        const user = this.getUserById(userId);
        if (!user) return [];

        const completedChallenges = user.completedChallenges || [];

        return completedChallenges.map(challenge => {
            const reward = this.getAchievementByChallengeId(userId, challenge.id);
            return {
                ...challenge,
                reward: reward || null
            };
        });
    }

    migrateOldCompletedChallenges(userId) {
        const user = this.getUserById(userId);
        if (!user) return 0;

        if (!user.completedChallenges || user.completedChallenges.length === 0) return 0;

        let migrated = 0;
        const challengesDB = this.getAllChallenges();

        user.completedChallenges.forEach(completedChallenge => {
            const hasReward = user.achievements?.some(a => a.challengeId === completedChallenge.id || a.id === completedChallenge.id);

            if (!hasReward) {
                const challengeData = challengesDB[completedChallenge.id];

                if (challengeData) {
                    const newAchievement = {
                        id: challengeData.id,
                        name: challengeData.title,
                        icon: 'fa-trophy',
                        image: `reward_${challengeData.rewardRarity}.png`,
                        earnedAt: completedChallenge.completedAt?.split('T')[0] || new Date().toISOString().split('T')[0],
                        points: challengeData.reward,
                        rarity: challengeData.rewardRarity,
                        rarityName: challengeData.rewardRarityName,
                        uniqueId: challengeData.rewardId,
                        description: `Завершен челлендж "${challengeData.title}"`,
                        challengeId: challengeData.id,
                        challengeTitle: challengeData.title
                    };

                    user.achievements = user.achievements || [];
                    user.achievements.push(newAchievement);
                    migrated++;
                }
            }
        });

        if (migrated > 0) {
            this.updateUser(user.id, { achievements: user.achievements });
            console.log(`✅ Мигрировано ${migrated} завершенных челленджей в награды`);
        }

        return migrated;
    }

    addAchievement(userId, achievement) {
        const user = this.getUserById(userId);
        if (user) {
            const achievements = user.achievements || [];
            if (!achievements.find(a => a.id === achievement.id)) {
                achievements.push({
                    ...achievement,
                    earnedAt: new Date().toISOString().split('T')[0]
                });
                return this.updateUser(userId, { achievements });
            }
        }
        return null;
    }

    purchaseItem(userId, itemId, itemName, points) {
        const user = this.getUserById(userId);
        if (!user) return false;

        user.purchasedItems = user.purchasedItems || [];
        user.pointTransactions = user.pointTransactions || [];
        user.spentPoints = user.spentPoints || 0;

        if (user.purchasedItems.includes(itemId)) {
            console.log('❌ Товар уже куплен');
            return false;
        }

        user.spentPoints += points;

        user.purchasedItems.push(itemId);
        user.pointTransactions.push({
            id: Date.now(),
            itemId: itemId,
            itemName: itemName,
            points: points,
            date: new Date().toISOString(),
            type: 'purchase'
        });

        this.updateUser(userId, {
            purchasedItems: user.purchasedItems,
            pointTransactions: user.pointTransactions,
            spentPoints: user.spentPoints
        });

        console.log(`✅ Товар "${itemName}" куплен за ${points} очков`);
        console.log(`💰 Всего потрачено: ${user.spentPoints} очков`);
        return true;
    }

    unlockPremiumContent(userId, contentId, contentName, points) {
        const user = this.getUserById(userId);
        if (!user) return false;

        user.openedPremiumContent = user.openedPremiumContent || [];
        user.pointTransactions = user.pointTransactions || [];
        user.spentPoints = user.spentPoints || 0;

        if (user.openedPremiumContent.includes(contentId)) {
            console.log('❌ Контент уже открыт');
            return false;
        }

        user.spentPoints += points;

        user.openedPremiumContent.push(contentId);

        user.pointTransactions.push({
            id: Date.now(),
            contentId: contentId,
            contentName: contentName,
            points: points,
            date: new Date().toISOString(),
            type: 'premium'
        });

        this.updateUser(userId, {
            openedPremiumContent: user.openedPremiumContent,
            pointTransactions: user.pointTransactions,
            spentPoints: user.spentPoints
        });

        console.log(`✅ Премиум контент "${contentName}" открыт за ${points} очков`);
        console.log(`💰 Всего потрачено: ${user.spentPoints} очков`);
        return true;
    }

    getUserPurchases(userId) {
        const user = this.getUserById(userId);
        return user?.purchasedItems || [];
    }

    getUserPremiumContent(userId) {
        const user = this.getUserById(userId);
        return user?.openedPremiumContent || [];
    }

    getUserTransactions(userId) {
        const user = this.getUserById(userId);
        return user?.pointTransactions || [];
    }
    isItemPurchased(userId, itemId) {
        const user = this.getUserById(userId);
        return user?.purchasedItems?.includes(itemId) || false;
    }
    isPremiumContentUnlocked(userId, contentId) {
        const user = this.getUserById(userId);
        return user?.openedPremiumContent?.includes(contentId) || false;
    }

    getUserSpendingStats(userId) {
        const user = this.getUserById(userId);
        const transactions = user?.pointTransactions || [];

        const totalSpent = transactions.reduce((sum, t) => sum + t.points, 0);
        const purchases = transactions.filter(t => t.type === 'purchase').length;
        const premium = transactions.filter(t => t.type === 'premium').length;

        return {
            totalSpent,
            purchases,
            premium,
            transactions: transactions.length
        };
    }

    exportToFile() {
        const users = this.getAllUsers();
        const blob = new Blob([JSON.stringify(users, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `fitness_users_backup_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        console.log('📤 Экспорт завершен');
    }

    importFromFile(jsonString) {
        try {
            const users = JSON.parse(jsonString);
            if (Array.isArray(users)) {
                localStorage.setItem(this.STORAGE_KEY, jsonString);
                console.log('📥 Импорт успешен, загружено:', users.length, 'пользователей');
                return true;
            }
        } catch (e) {
            console.error('❌ Ошибка импорта:', e);
        }
        return false;
    }

    sendChallengeInvite(fromUserId, toUserId, challengeId) {
        const fromUser = this.getUserById(fromUserId);
        const toUser = this.getUserById(toUserId);
        const challenge = window.AppDatabase.findChallengeById(challengeId);

        if (!fromUser || !toUser || !challenge) return false;

        toUser.notifications = toUser.notifications || [];

        const notification = {
            id: Date.now(),
            type: 'challenge_invite',
            fromUserId: fromUserId,
            fromUserName: fromUser.privacy?.hideRealName ? fromUser.privacy.displayName || fromUser.username : `${fromUser.firstName} ${fromUser.lastName}`,
            fromUserAvatar: fromUser.avatar,
            challengeId: challengeId,
            challengeTitle: challenge.title,
            challengeDescription: challenge.description,
            challengeReward: challenge.reward,
            challengeDuration: challenge.duration,
            message: `приглашает вас участвовать в челлендже "${challenge.title}"`,
            date: new Date().toISOString(),
            read: false,
            status: 'pending' // pending, accepted, declined
        };

        toUser.notifications.push(notification);

        // Сохраняем изменения
        this.updateUser(toUser.id, { notifications: toUser.notifications });

        console.log(`📨 Вызов отправлен пользователю ${toUser.firstName} ${toUser.lastName}`);
        return true;
    }

    respondToInvite(userId, notificationId, accept) {
        const user = this.getUserById(userId);
        if (!user || !user.notifications) return false;

        const notificationIndex = user.notifications.findIndex(n => n.id === notificationId);
        if (notificationIndex === -1) return false;

        const notification = user.notifications[notificationIndex];

        if (accept) {
            // Принимаем вызов - добавляем челлендж пользователю
            const challenge = window.AppDatabase.findChallengeById(notification.challengeId);
            if (!challenge) return false;

            // Добавляем челлендж
            user.activeChallenges = user.activeChallenges || [];
            user.activeChallenges.push({
                id: challenge.id,
                title: challenge.title,
                description: challenge.description,
                participants: challenge.participants,
                total: challenge.duration,
                duration: challenge.duration,
                current: 0,
                reward: challenge.reward,
                rewardRarity: challenge.rewardRarity,
                rewardRarityName: challenge.rewardRarityName,
                rewardId: challenge.rewardId,
                joinedAt: new Date().toISOString(),
                status: 'active',
                invitedBy: notification.fromUserId
            });

            this.sendChallengeAcceptedNotification(notification.fromUserId, userId, challenge);

            notification.status = 'accepted';
            notification.read = true;
        } else {
            notification.status = 'declined';
            notification.read = true;
        }

        user.notifications[notificationIndex] = notification;
        this.updateUser(user.id, {
            notifications: user.notifications,
            activeChallenges: user.activeChallenges
        });

        return true;
    }

    sendChallengeAcceptedNotification(fromUserId, toUserId, challenge) {
        const fromUser = this.getUserById(fromUserId);
        const toUser = this.getUserById(toUserId);

        if (!fromUser || !toUser) return false;

        toUser.notifications = toUser.notifications || [];

        const notification = {
            id: Date.now(),
            type: 'challenge_accepted',
            fromUserId: fromUserId,
            fromUserName: fromUser.privacy?.hideRealName ? fromUser.privacy.displayName || fromUser.username : `${fromUser.firstName} ${fromUser.lastName}`,
            fromUserAvatar: fromUser.avatar,
            challengeId: challenge.id,
            challengeTitle: challenge.title,
            message: `принял ваш вызов и участвует в челлендже "${challenge.title}"!`,
            date: new Date().toISOString(),
            read: false
        };

        toUser.notifications.push(notification);
        this.updateUser(toUser.id, { notifications: toUser.notifications });

        return true;
    }

    getUserNotifications(userId) {
        const user = this.getUserById(userId);
        return user?.notifications || [];
    }

    markNotificationAsRead(userId, notificationId) {
        const user = this.getUserById(userId);
        if (!user || !user.notifications) return false;

        const notificationIndex = user.notifications.findIndex(n => n.id === notificationId);
        if (notificationIndex === -1) return false;

        user.notifications[notificationIndex].read = true;
        this.updateUser(user.id, { notifications: user.notifications });

        return true;
    }

    getUnreadNotificationsCount(userId) {
        const user = this.getUserById(userId);
        if (!user || !user.notifications) return 0;
        return user.notifications.filter(n => !n.read).length;
    }
    sendChallengeInvite(fromUserId, toUserId, challengeId) {
        const fromUser = this.getUserById(fromUserId);
        const toUser = this.getUserById(toUserId);
        const challenge = window.AppDatabase?.findChallengeById(challengeId);

        if (!fromUser || !toUser || !challenge) {
            console.error('❌ Ошибка: пользователь или челлендж не найдены');
            return false;
        }

        toUser.notifications = toUser.notifications || [];

        let fromUserName;
        if (fromUser.privacy?.hideRealName) {
            fromUserName = fromUser.privacy.displayName || fromUser.username;
        } else {
            fromUserName = `${fromUser.firstName} ${fromUser.lastName}`;
        }

        const notification = {
            id: Date.now(),
            type: 'challenge_invite',
            fromUserId: fromUserId,
            fromUserName: fromUserName,
            fromUserAvatar: fromUser.avatar,
            fromUserGender: fromUser.gender,
            challengeId: challengeId,
            challengeTitle: challenge.title,
            challengeDescription: challenge.description,
            challengeReward: challenge.reward,
            challengeDuration: challenge.duration,
            message: `приглашает вас участвовать в челлендже "${challenge.title}"`,
            date: new Date().toISOString(),
            read: false,
            status: 'pending' // pending, accepted, declined
        };

        toUser.notifications.push(notification);

        this.updateUser(toUser.id, { notifications: toUser.notifications });

        console.log(`📨 Вызов отправлен пользователю ${toUser.firstName} ${toUser.lastName}`);
        return true;
    }
    searchUsersForInvite(query, currentUserId) {
        const users = this.getAllUsers();
        const currentUser = this.getUserById(currentUserId);

        return users
            .filter(u => u.id !== currentUserId) 
            .filter(u => {
                if (u.privacy?.privateProfile) return false;

                const searchQuery = query.toLowerCase();
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
    }
    debug() {
        console.log('=== ДИАГНОСТИКА БАЗЫ ДАННЫХ ===');
        const users = this.getAllUsers();
        console.log('📁 Всего пользователей:', users.length);
        users.forEach(user => {
            console.log(`  👤 ${user.username} (${user.firstName} ${user.lastName})`);
            console.log(`     🏆 Достижений: ${user.achievements?.length || 0}`);
            console.log(`     🎯 Активных челленджей: ${user.activeChallenges?.length || 0}`);
            console.log(`     ✅ Завершенных челленджей: ${user.completedChallenges?.length || 0}`);
            console.log(`     🛍️ Покупок: ${user.purchasedItems?.length || 0}`);
            console.log(`     👑 Премиум контента: ${user.openedPremiumContent?.length || 0}`);
            console.log(`     💸 Потрачено очков: ${user.spentPoints || 0}`);
        });

        const currentUser = this.getCurrentUser();
        if (currentUser) {
            console.log('✅ Текущий пользователь:', currentUser.username);
        } else {
            console.log('❌ Нет активной сессии');
        }

        if (localStorage.getItem('fitnessUsers')) {
            console.log('🗑️ Удаляем старую базу fitnessUsers');
            localStorage.removeItem('fitnessUsers');
        }
        if (localStorage.getItem('fitness_sessions_db')) {
            console.log('🗑️ Удаляем старую базу fitness_sessions_db');
            localStorage.removeItem('fitness_sessions_db');
        }
    }
}

window.fitnessDB = new FitnessDatabase();

setTimeout(() => {
    window.fitnessDB.debug();
}, 500);

window.fitnessTools = {
    users: () => window.fitnessDB.getAllUsers(),
    save: () => window.fitnessDB.exportToFile(),
    debug: () => window.fitnessDB.debug(),
    reset: () => {
        if (confirm('Сбросить базу данных?')) {
            localStorage.removeItem('fitness_users');
            localStorage.removeItem('fitness_current_user');
            window.fitnessDB.initDatabase();
            location.reload();
        }
    },
    challenges: () => window.fitnessDB.getAllChallenges(),
    updateProgress: (userId) => {
        const user = window.fitnessDB.getUserById(userId);
        return window.fitnessDB.updateChallengeProgress(user);
    },
    migrateCompleted: (userId) => {
        const id = userId || (window.fitnessDB.getCurrentUser()?.id);
        if (id) {
            const count = window.fitnessDB.migrateOldCompletedChallenges(id);
            alert(`✅ Мигрировано ${count} наград из завершенных челленджей!`);
            if (count > 0) location.reload();
        }
    },
    shop: {
        buy: (itemId, itemName, points) => {
            const user = window.fitnessDB.getCurrentUser();
            if (user) {
                return window.fitnessDB.purchaseItem(user.id, itemId, itemName, points);
            }
            return false;
        },
        unlock: (contentId, contentName, points) => {
            const user = window.fitnessDB.getCurrentUser();
            if (user) {
                return window.fitnessDB.unlockPremiumContent(user.id, contentId, contentName, points);
            }
            return false;
        },
        stats: () => {
            const user = window.fitnessDB.getCurrentUser();
            if (user) {
                return window.fitnessDB.getUserSpendingStats(user.id);
            }
            return null;
        }
    }
};

console.log('🔥 FitnessDB готова к работе!');
console.log('📊 Диагностика: fitnessTools.debug()');
console.log('🎯 Челленджи: fitnessTools.challenges()');
console.log('🔄 Миграция наград: fitnessTools.migrateCompleted()');
console.log('🛍️ Магазин: fitnessTools.shop');