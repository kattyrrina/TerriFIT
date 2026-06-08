window.AppDatabase = {
    achievements: {
        common: [
            { id: 1, uniqueId: 'RWD-001', name: '100 тренировок', icon: 'fa-fire', image: 'reward_100_workout.png', description: 'Выполните 100 тренировок на платформе', rarity: 'common', rarityName: 'Обычная', points: 100 },
            { id: 2, uniqueId: 'RWD-002', name: 'Силач', icon: 'fa-dumbbell', image: 'reward_power.png', description: 'Поднимите общий вес 1000 кг', rarity: 'common', rarityName: 'Обычная', points: 200 },
            { id: 3, uniqueId: 'RWD-003', name: 'Марафонец', icon: 'fa-running', image: 'reward_runner.png', description: 'Пробегите марафонскую дистанцию', rarity: 'common', rarityName: 'Обычная', points: 150 },
            { id: 4, uniqueId: 'RWD-004', name: 'Звезда сообщества', icon: 'fa-star', image: 'reward_star.png', description: 'Получите 100 лайков', rarity: 'common', rarityName: 'Обычная', points: 100 },
            { id: 5, uniqueId: 'RWD-005', name: 'Планка', icon: 'fa-clock', image: 'reward_plank.png', description: 'Удерживайте планку каждый день', rarity: 'common', rarityName: 'Обычная', points: 200 },

            { id: 101, uniqueId: 'RWD-101', name: '10 000 шагов', icon: 'fa-shoe-prints', image: 'reward_steps.png', description: 'Пройдите 10 000 шагов за день', rarity: 'common', rarityName: 'Обычная', points: 50 },
            { id: 102, uniqueId: 'RWD-102', name: '50 приседаний', icon: 'fa-child', image: 'reward_squat.png', description: 'Выполните 50 приседаний', rarity: 'common', rarityName: 'Обычная', points: 40 },
            { id: 103, uniqueId: 'RWD-103', name: 'Пить 2л воды', icon: 'fa-water', image: 'reward_water.png', description: 'Выпейте 2 литра воды', rarity: 'common', rarityName: 'Обычная', points: 30 },
            { id: 104, uniqueId: 'RWD-104', name: '5 км бега', icon: 'fa-running', image: 'reward_run.png', description: 'Пробегите 5 километров', rarity: 'common', rarityName: 'Обычная', points: 60 },
            { id: 105, uniqueId: 'RWD-105', name: '10 минут планки', icon: 'fa-clock', image: 'reward_plank_10.png', description: 'Удерживайте планку 10 минут', rarity: 'common', rarityName: 'Обычная', points: 55 },
            { id: 106, uniqueId: 'RWD-106', name: '100 отжиманий', icon: 'fa-dumbbell', image: 'reward_pushups.png', description: 'Выполните 100 отжиманий', rarity: 'common', rarityName: 'Обычная', points: 70 },

            { id: 107, uniqueId: 'RWD-107', name: 'Новичок', icon: 'fa-seedling', image: 'reward_beginner.png', description: 'Завершите 5 тренировок', rarity: 'common', rarityName: 'Обычная', points: 5 },
            { id: 108, uniqueId: 'RWD-108', name: 'Гибкость', icon: 'fa-person-walking', image: 'reward_flex.png', description: '30 минут растяжки', rarity: 'common', rarityName: 'Обычная', points: 20 },
            { id: 109, uniqueId: 'RWD-109', name: 'Сила духа', icon: 'fa-heart', image: 'reward_spirit.png', description: 'Тренировка в сложный день', rarity: 'common', rarityName: 'Обычная', points: 25 },
            { id: 110, uniqueId: 'RWD-110', name: 'Ранняя пташка', icon: 'fa-clock', image: 'reward_early.png', description: '5 тренировок до 8 утра', rarity: 'common', rarityName: 'Обычная', points: 15 },
            { id: 111, uniqueId: 'RWD-111', name: 'Командный игрок', icon: 'fa-people-group', image: 'reward_team.png', description: '3 групповых тренировки', rarity: 'common', rarityName: 'Обычная', points: 30 },
            { id: 112, uniqueId: 'RWD-112', name: 'Энергия', icon: 'fa-bolt', image: 'reward_energy.png', description: 'Сожгите 5000 калорий', rarity: 'common', rarityName: 'Обычная', points: 35 }
        ],
        rare: [
            { id: 201, uniqueId: 'RWD-201', name: 'Couch to 5K', icon: 'fa-running', image: 'reward_marathon_pro.png', description: 'Подготовка к 5 км за 8 недель', rarity: 'rare', rarityName: 'Редкая', points: 500 },
            { id: 202, uniqueId: 'RWD-202', name: 'Силовая выносливость', icon: 'fa-dumbbell', image: 'reward_super_strongman.png', description: '4-недельная программа для силы', rarity: 'rare', rarityName: 'Редкая', points: 400 },
            { id: 203, uniqueId: 'RWD-203', name: 'Гибкость и растяжка', icon: 'fa-pagelines', image: 'reward_yoga.png', description: '6-недельный курс йоги', rarity: 'rare', rarityName: 'Редкая', points: 450 },
            { id: 204, uniqueId: 'RWD-204', name: 'Марафон 42 км', icon: 'fa-running', image: 'reward_iron.png', description: '12-недельная подготовка к марафону', rarity: 'rare', rarityName: 'Редкая', points: 800 },
            { id: 205, uniqueId: 'RWD-205', name: 'Пресс за 30 дней', icon: 'fa-heart', image: 'reward_bike.png', description: '30-дневный курс для пресса', rarity: 'rare', rarityName: 'Редкая', points: 300 },
            { id: 206, uniqueId: 'RWD-206', name: '30 дней приседаний', icon: 'fa-child', image: 'reward_squat_pro.png', description: 'Ежедневные приседания', rarity: 'rare', rarityName: 'Редкая', points: 250 }
        ],
        superRare: [
            { id: 301, uniqueId: 'RWD-301', name: '500 тренировок', icon: 'fa-fire', image: 'reward_500_workout.png', description: '500 тренировок', rarity: 'super', rarityName: 'Супер редкая', points: 300 },
            { id: 302, uniqueId: 'RWD-302', name: 'Легенда сообщества', icon: 'fa-star', image: 'reward_legend_star.png', description: '1000 лайков', rarity: 'super', rarityName: 'Супер редкая', points: 350 },
            { id: 303, uniqueId: 'RWD-303', name: 'Легенда', icon: 'fa-crown', image: 'reward_legend.png', description: '1000 тренировок', rarity: 'super', rarityName: 'Супер редкая', points: 500 },
            { id: 304, uniqueId: 'RWD-304', name: 'Чемпион', icon: 'fa-trophy', image: 'reward_champion.png', description: '1 место в ТОПе', rarity: 'super', rarityName: 'Супер редкая', points: 400 },
            { id: 305, uniqueId: 'RWD-305', name: 'Бессмертный', icon: 'fa-infinity', image: 'reward_immortal.png', description: '365 дней подряд', rarity: 'super', rarityName: 'Супер редкая', points: 1000 },
            { id: 306, uniqueId: 'RWD-306', name: 'Гуру фитнеса', icon: 'fa-brain', image: 'reward_guru.png', description: '100 уровень', rarity: 'super', rarityName: 'Супер редкая', points: 250 }
        ]
    },

    challenges: [
        {
            id: 1,
            title: '30 дней приседаний',
            description: 'Выполняйте приседания каждый день для укрепления ног',
            longDescription: 'Ежедневные приседания укрепят ваши ноги и ягодицы. Начните с малого и постепенно увеличивайте количество.',
            type: 'seasonal',
            typeName: 'Сезонный',
            rewardRarity: 'common',
            rewardRarityName: 'Обычная',
            rewardId: 'RWD-001',
            difficulty: 'beginner',
            difficultyName: 'Начальный',
            duration: 30,
            durationText: '30 дней',
            reward: 250,
            points: 250,
            participants: 245,
            isDaily: false,
            icon: 'fa-running'
        },
        {
            id: 2,
            title: 'Пить 2л воды в день',
            description: 'Следите за водным балансом организма',
            longDescription: 'Вода необходима для нормального функционирования организма. Пейте 2 литра воды каждый день.',
            type: 'seasonal',
            typeName: 'Сезонный',
            rewardRarity: 'common',
            rewardRarityName: 'Обычная',
            rewardId: 'RWD-002',
            difficulty: 'beginner',
            difficultyName: 'Начальный',
            duration: 30,
            durationText: '30 дней',
            reward: 200,
            points: 200,
            participants: 189,
            isDaily: false,
            icon: 'fa-water'
        },
        {
            id: 3,
            title: '10000 шагов в день',
            description: 'Поддерживайте ежедневную активность',
            longDescription: 'Ходьба - самый доступный вид физической активности. Проходите 10000 шагов каждый день.',
            type: 'seasonal',
            typeName: 'Сезонный',
            rewardRarity: 'common',
            rewardRarityName: 'Обычная',
            rewardId: 'RWD-003',
            difficulty: 'intermediate',
            difficultyName: 'Средний',
            duration: 30,
            durationText: '30 дней',
            reward: 300,
            points: 300,
            participants: 312,
            isDaily: false,
            icon: 'fa-shoe-prints'
        },
        {
            id: 4,
            title: 'Утренняя зарядка',
            description: 'Начните день с 15 минут зарядки',
            longDescription: 'Утренняя зарядка поможет проснуться и зарядиться энергией на весь день.',
            type: 'seasonal',
            typeName: 'Сезонный',
            rewardRarity: 'common',
            rewardRarityName: 'Обычная',
            rewardId: 'RWD-004',
            difficulty: 'beginner',
            difficultyName: 'Начальный',
            duration: 21,
            durationText: '21 день',
            reward: 150,
            points: 150,
            participants: 156,
            isDaily: false,
            icon: 'fa-sun'
        },
        {
            id: 5,
            title: 'Планка',
            description: 'Удерживайте планку каждый день',
            longDescription: 'Планка укрепляет мышцы кора, спины и пресса. Начните с 30 секунд и увеличивайте время.',
            type: 'seasonal',
            typeName: 'Сезонный',
            rewardRarity: 'common',
            rewardRarityName: 'Обычная',
            rewardId: 'RWD-005',
            difficulty: 'intermediate',
            difficultyName: 'Средний',
            duration: 30,
            durationText: '30 дней',
            reward: 200,
            points: 200,
            participants: 203,
            isDaily: false,
            icon: 'fa-clock'
        },

        {
            id: 101,
            title: '10 000 шагов',
            description: 'Пройдите 10 000 шагов за день',
            longDescription: 'Отслеживайте свою активность в течение дня. Старайтесь больше ходить пешком.',
            type: 'daily',
            typeName: 'Ежедневный',
            rewardRarity: 'common',
            rewardRarityName: 'Обычная',
            rewardId: 'RWD-101',
            difficulty: 'beginner',
            difficultyName: 'Начальный',
            duration: 1,
            durationText: '1 день',
            reward: 50,
            points: 50,
            participants: 5234,
            isDaily: true,
            icon: 'fa-shoe-prints'
        },
        {
            id: 102,
            title: '50 приседаний',
            description: 'Выполните 50 приседаний',
            longDescription: 'Можно разбить на несколько подходов. Следите за правильной техникой.',
            type: 'daily',
            typeName: 'Ежедневный',
            rewardRarity: 'common',
            rewardRarityName: 'Обычная',
            rewardId: 'RWD-102',
            difficulty: 'beginner',
            difficultyName: 'Начальный',
            duration: 1,
            durationText: '1 день',
            reward: 40,
            points: 40,
            participants: 3890,
            isDaily: true,
            icon: 'fa-child'
        },
        {
            id: 103,
            title: 'Пить 2л воды',
            description: 'Выпейте 2 литра воды',
            longDescription: 'Следите за водным балансом. Вода улучшает обмен веществ и самочувствие.',
            type: 'daily',
            typeName: 'Ежедневный',
            rewardRarity: 'common',
            rewardRarityName: 'Обычная',
            rewardId: 'RWD-103',
            difficulty: 'beginner',
            difficultyName: 'Начальный',
            duration: 1,
            durationText: '1 день',
            reward: 30,
            points: 30,
            participants: 4156,
            isDaily: true,
            icon: 'fa-water'
        },
        {
            id: 104,
            title: '5 км бега',
            description: 'Пробегите 5 километров',
            longDescription: 'Можно бежать на улице или на беговой дорожке. Не забывайте про разминку.',
            type: 'daily',
            typeName: 'Ежедневный',
            rewardRarity: 'common',
            rewardRarityName: 'Обычная',
            rewardId: 'RWD-104',
            difficulty: 'intermediate',
            difficultyName: 'Средний',
            duration: 1,
            durationText: '1 день',
            reward: 60,
            points: 60,
            participants: 2780,
            isDaily: true,
            icon: 'fa-running'
        },
        {
            id: 105,
            title: '10 минут планки',
            description: 'Удерживайте планку 10 минут',
            longDescription: 'Можно разбить на подходы. Главное - суммарное время.',
            type: 'daily',
            typeName: 'Ежедневный',
            rewardRarity: 'common',
            rewardRarityName: 'Обычная',
            rewardId: 'RWD-105',
            difficulty: 'intermediate',
            difficultyName: 'Средний',
            duration: 1,
            durationText: '1 день',
            reward: 55,
            points: 55,
            participants: 1950,
            isDaily: true,
            icon: 'fa-clock'
        },
        {
            id: 106,
            title: '100 отжиманий',
            description: 'Выполните 100 отжиманий',
            longDescription: 'Можно разбить на подходы в течение дня. Следите за техникой.',
            type: 'daily',
            typeName: 'Ежедневный',
            rewardRarity: 'common',
            rewardRarityName: 'Обычная',
            rewardId: 'RWD-106',
            difficulty: 'expert',
            difficultyName: 'Экспертный',
            duration: 1,
            durationText: '1 день',
            reward: 70,
            points: 70,
            participants: 1240,
            isDaily: true,
            icon: 'fa-dumbbell'
        },

        {
            id: 201,
            title: 'Couch to 5K',
            description: 'Подготовка к 5 км за 8 недель',
            longDescription: 'Программа для начинающих бегунов. За 8 недель вы сможете пробежать 5 км без остановки.',
            type: 'seasonal',
            typeName: 'Сезонный',
            rewardRarity: 'rare',
            rewardRarityName: 'Редкая',
            rewardId: 'RWD-201',
            difficulty: 'intermediate',
            difficultyName: 'Средний',
            duration: 56,
            durationText: '56 дней',
            reward: 500,
            points: 500,
            participants: 3450,
            isDaily: false,
            icon: 'fa-running'
        },
        {
            id: 202,
            title: 'Силовая выносливость',
            description: '4-недельная программа для силы',
            longDescription: 'Интенсивная программа для развития силовой выносливости. 4 тренировки в неделю.',
            type: 'seasonal',
            typeName: 'Сезонный',
            rewardRarity: 'rare',
            rewardRarityName: 'Редкая',
            rewardId: 'RWD-202',
            difficulty: 'intermediate',
            difficultyName: 'Средний',
            duration: 28,
            durationText: '28 дней',
            reward: 400,
            points: 400,
            participants: 2180,
            isDaily: false,
            icon: 'fa-dumbbell'
        },
        {
            id: 203,
            title: 'Гибкость и растяжка',
            description: '6-недельный курс йоги',
            longDescription: 'Улучшите гибкость и научитесь расслабляться с помощью ежедневных практик йоги.',
            type: 'seasonal',
            typeName: 'Сезонный',
            rewardRarity: 'rare',
            rewardRarityName: 'Редкая',
            rewardId: 'RWD-203',
            difficulty: 'beginner',
            difficultyName: 'Начальный',
            duration: 42,
            durationText: '42 дня',
            reward: 450,
            points: 450,
            participants: 1670,
            isDaily: false,
            icon: 'fa-pagelines'
        },
        {
            id: 204,
            title: 'Марафон 42 км',
            description: '12-недельная подготовка к марафону',
            longDescription: 'Серьезная программа для подготовки к марафонской дистанции. Для опытных бегунов.',
            type: 'seasonal',
            typeName: 'Сезонный',
            rewardRarity: 'rare',
            rewardRarityName: 'Редкая',
            rewardId: 'RWD-204',
            difficulty: 'expert',
            difficultyName: 'Экспертный',
            duration: 84,
            durationText: '84 дня',
            reward: 800,
            points: 800,
            participants: 890,
            isDaily: false,
            icon: 'fa-running'
        },
        {
            id: 205,
            title: 'Пресс за 30 дней',
            description: '30-дневный курс для пресса',
            longDescription: 'Ежедневные упражнения для мышц пресса. За 30 дней вы увидите результат.',
            type: 'seasonal',
            typeName: 'Сезонный',
            rewardRarity: 'rare',
            rewardRarityName: 'Редкая',
            rewardId: 'RWD-205',
            difficulty: 'intermediate',
            difficultyName: 'Средний',
            duration: 30,
            durationText: '30 дней',
            reward: 300,
            points: 300,
            participants: 3890,
            isDaily: false,
            icon: 'fa-heart'
        },
        {
            id: 206,
            title: '30 дней приседаний',
            description: 'Ежедневные приседания',
            longDescription: 'Ежедневные приседания для укрепления ног и ягодиц. Постепенно увеличивайте количество.',
            type: 'seasonal',
            typeName: 'Сезонный',
            rewardRarity: 'rare',
            rewardRarityName: 'Редкая',
            rewardId: 'RWD-206',
            difficulty: 'beginner',
            difficultyName: 'Начальный',
            duration: 30,
            durationText: '30 дней',
            reward: 250,
            points: 250,
            participants: 4120,
            isDaily: false,
            icon: 'fa-child'
        }
    ],

    findAchievementById: function (id) {
        const allAchievements = [
            ...this.achievements.common,
            ...this.achievements.rare,
            ...this.achievements.superRare
        ];
        return allAchievements.find(a => a.id === id);
    },

    getAchievementPoints: function (id) {
        const achievement = this.findAchievementById(id);
        return achievement ? achievement.points : 0;
    },

    findChallengeById: function (id) {
        return this.challenges.find(c => c.id === id);
    },

    getRewardForChallenge: function (challengeId) {
        const challenge = this.findChallengeById(challengeId);
        if (!challenge) return null;

        const achievement = this.findAchievementById(challengeId);

        return {
            id: challenge.id,
            name: challenge.title,
            icon: challenge.icon || 'fa-trophy',
            image: achievement ? achievement.image : `reward_${challenge.rewardRarity}.png`,
            points: challenge.reward,
            rarity: challenge.rewardRarity,
            rarityName: challenge.rewardRarityName,
            uniqueId: challenge.rewardId
        };
    },

    enrichUserAchievements: function (userAchievements) {
        if (!userAchievements || !Array.isArray(userAchievements)) return [];
        return userAchievements.map(ua => {
            // Ищем по id, но если их несколько, показываем все
            const fullInfo = this.findAchievementById(ua.id);
            return fullInfo ? { ...fullInfo, ...ua, displayId: ua.uniqueId || ua.id } : ua;
        });
    },

    enrichUserChallenges: function (userChallenges) {
        if (!userChallenges || !Array.isArray(userChallenges)) return [];
        return userChallenges.map(uc => {
            const fullInfo = this.findChallengeById(uc.id);
            return fullInfo ? { ...fullInfo, ...uc } : uc;
        });
    },

    isAchievementEarned: function (achievementId, userAchievements) {
        if (!userAchievements || !Array.isArray(userAchievements)) return false;
        return userAchievements.some(a => a.id === achievementId);
    },

    calculateTotalPoints: function (userAchievements) {
        if (!userAchievements || !Array.isArray(userAchievements)) return 0;
        return userAchievements.reduce((total, ach) => {
            return total + (this.getAchievementPoints(ach.id) || 0);
        }, 0);
    },

    getAchievementsByRarity: function (rarity) {
        return this.achievements[rarity] || [];
    },

    getChallengesByType: function (type) {
        if (type === 'all') return this.challenges;
        return this.challenges.filter(c => c.type === type);
    },

    getChallengesByDifficulty: function (difficulty) {
        return this.challenges.filter(c => c.difficulty === difficulty);
    },

    getDailyChallenges: function () {
        return this.challenges.filter(c => c.isDaily);
    },

    getSeasonalChallenges: function () {
        return this.challenges.filter(c => !c.isDaily);
    },

    searchChallenges: function (query) {
        if (!query) return this.challenges;
        const lowerQuery = query.toLowerCase();
        return this.challenges.filter(c =>
            c.title.toLowerCase().includes(lowerQuery) ||
            c.description.toLowerCase().includes(lowerQuery)
        );
    },

    searchAchievements: function (query) {
        const allAchievements = [
            ...this.achievements.common,
            ...this.achievements.rare,
            ...this.achievements.superRare
        ];

        if (!query) return allAchievements;

        const lowerQuery = query.toLowerCase();
        return allAchievements.filter(a =>
            a.name.toLowerCase().includes(lowerQuery) ||
            a.uniqueId.toLowerCase().includes(lowerQuery) ||
            a.id.toString().includes(lowerQuery)
        );
    },

    getAchievementsStats: function () {
        return {
            total: this.achievements.common.length + this.achievements.rare.length + this.achievements.superRare.length,
            common: this.achievements.common.length,
            rare: this.achievements.rare.length,
            superRare: this.achievements.superRare.length,
            totalPoints: [
                ...this.achievements.common,
                ...this.achievements.rare,
                ...this.achievements.superRare
            ].reduce((sum, a) => sum + a.points, 0)
        };
    },

    getChallengesStats: function () {
        return {
            total: this.challenges.length,
            daily: this.challenges.filter(c => c.isDaily).length,
            seasonal: this.challenges.filter(c => !c.isDaily).length,
            beginner: this.challenges.filter(c => c.difficulty === 'beginner').length,
            intermediate: this.challenges.filter(c => c.difficulty === 'intermediate').length,
            expert: this.challenges.filter(c => c.difficulty === 'expert').length,
            common: this.challenges.filter(c => c.rewardRarity === 'common').length,
            rare: this.challenges.filter(c => c.rewardRarity === 'rare').length,
            super: this.challenges.filter(c => c.rewardRarity === 'super').length
        };
    },

    getRecommendedChallenges: function (user, count = 2) {
        const activeIds = (user.activeChallenges || []).map(c => c.id);
        const available = this.challenges.filter(c => !activeIds.includes(c.id));

        const shuffled = [...available].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }, 

    getAvailablePoints: function (user) {
        const earnedPoints = this.calculateTotalPoints(user.achievements || []);
        const spentPoints = user.spentPoints || 0;
        return earnedPoints - spentPoints;
    }
}; 

console.log('✅ AppDatabase загружена');
console.log('📊 Статистика наград:', window.AppDatabase.getAchievementsStats());
console.log('📊 Статистика челленджей:', window.AppDatabase.getChallengesStats());

window.dbTools = {
    achievements: () => window.AppDatabase.achievements,
    challenges: () => window.AppDatabase.challenges,
    findAchievement: (id) => window.AppDatabase.findAchievementById(id),
    findChallenge: (id) => window.AppDatabase.findChallengeById(id),
    stats: () => ({
        achievements: window.AppDatabase.getAchievementsStats(),
        challenges: window.AppDatabase.getChallengesStats()
    }),
    search: (query) => ({
        achievements: window.AppDatabase.searchAchievements(query),
        challenges: window.AppDatabase.searchChallenges(query)
    })
};