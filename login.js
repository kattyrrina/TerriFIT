document.write('<script src="js/database.js"></script>');
document.addEventListener('DOMContentLoaded', function () {

    setTimeout(() => {
        if (typeof window.fitnessDB === 'undefined') {
            console.error('❌ Ошибка: fitnessDB не загружен!');
            alert('Ошибка загрузки базы данных. Обновите страницу.');
            return;
        }

        initAuth();

        window.fitnessDB.debug();

    }, 200);

    function initAuth() {
        console.log('✅ fitnessDB загружен, инициализация авторизации...');
        cleanupOldDatabases();
        initPhoneMasks();
        initFormNavigation();
        initEventListeners();
        setTestValues();
        checkAuth();
    }

    function cleanupOldDatabases() {
        const oldKeys = [
            'fitnessUsers',
            'fitness_sessions_db',
            'fitness_users_db',
            'fitness_current_user_old',
            'currentFitnessUser',
            'fitnessDB_users'
        ];

        oldKeys.forEach(key => {
            if (localStorage.getItem(key)) {
                console.log(`🗑️ Удаляем старую базу: ${key}`);
                localStorage.removeItem(key);
            }
        });

        const users = window.fitnessDB.getAllUsers();
        const hasSokol = users.some(u => u.username === 'sokol');

        if (!hasSokol) {
            console.log('👤 Создаем тестового пользователя sokol');

            const sokol = {
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
                level: 23,
                avatar: 'man.png',
                registrationDate: '2024-01-15T10:30:00.000Z',
                lastLogin: new Date().toISOString(),
                stats: {
                    trainings: 147,
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
                        earnedAt: '2024-05-10'
                    },
                    {
                        id: 2,
                        name: 'Силач',
                        icon: 'fa-dumbbell',
                        image: 'reward_power.png',
                        earnedAt: '2024-04-15'
                    },
                    {
                        id: 3,
                        name: 'Марафонец',
                        icon: 'fa-running',
                        image: 'reward_runner.png',
                        earnedAt: '2024-03-20'
                    },
                    {
                        id: 4,
                        name: 'Звезда сообщества',
                        icon: 'fa-star',
                        image: 'reward_star.png',
                        earnedAt: '2024-06-01'
                    }
                ],
                activeChallenges: [
                    {
                        id: 1,
                        title: '30 дней приседаний',
                        description: 'Выполняйте приседания каждый день для укрепления ног',
                        total: 30,
                        current: 19,
                        reward: 250,
                        joinedAt: '2024-11-01T10:30:00.000Z',
                        status: 'active'
                    },
                    {
                        id: 2,
                        title: 'Пить 2л воды в день',
                        description: 'Следите за водным балансом организма',
                        total: 30,
                        current: 24,
                        reward: 200,
                        joinedAt: '2024-10-28T15:45:00.000Z',
                        status: 'active'
                    }
                ],
                completedChallenges: [
                    {
                        id: 3,
                        title: '10000 шагов в день',
                        description: 'Поддерживайте ежедневную активность',
                        total: 30,
                        current: 30,
                        reward: 300,
                        completedAt: '2026-01-10T09:15:00.000Z'
                    }
                ]
            };

            users.push(sokol);
            window.fitnessDB.saveUsers(users);
            console.log('✅ Пользователь sokol создан с датой рождения 1996-03-15');
        }
    }

    function phoneMask(input) {
        if (!input) return;

        let value = input.value.replace(/\D/g, '');

        if (value.length > 11) {
            value = value.substring(0, 11);
        }

        if (value.length > 0) {
            if (value.startsWith('7')) {
                value = '+' + value;
            } else if (value.startsWith('8')) {
                value = '+7' + value.substring(1);
            } else if (!value.startsWith('+')) {
                value = '+7' + value;
            }
            input.value = value;
        } else {
            input.value = '+7';
        }
    }

    function initPhoneMasks() {
        const phoneInputs = ['phone', 'recovery-phone', 'register-phone'];

        phoneInputs.forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.value = '+7';

                input.addEventListener('focus', function () {
                    if (this.value === '') {
                        this.value = '+7';
                    }
                });

                input.addEventListener('input', function () {
                    phoneMask(this);
                });

                input.addEventListener('keydown', function (e) {
                    if (e.key === 'Backspace' && (this.value === '+7' || this.value === '+')) {
                        e.preventDefault();
                        this.value = '+7';
                    }
                });
            }
        });
    }

    function initFormNavigation() {
        window.showForm = function (formName) {
            const forms = {
                login: document.getElementById('login-form'),
                sms: document.getElementById('sms-form'),
                recovery: document.getElementById('recovery-form'),
                register: document.getElementById('register-form')
            };

            Object.values(forms).forEach(form => {
                if (form) form.style.display = 'none';
            });

            if (forms[formName]) {
                forms[formName].style.display = 'block';

                if (formName === 'sms') {
                    const smsCodeGroup = document.getElementById('sms-code-group');
                    const sendBtn = document.getElementById('send-sms-btn');
                    const verifyBtn = document.getElementById('verify-sms-btn');

                    if (smsCodeGroup) smsCodeGroup.style.display = 'none';
                    if (sendBtn) sendBtn.style.display = 'block';
                    if (verifyBtn) verifyBtn.style.display = 'none';
                }

                if (formName === 'register') {
                    resetRegistration();
                }
            }
        };

        document.getElementById('show-register')?.addEventListener('click', (e) => {
            e.preventDefault();
            window.showForm('register');
        });

        document.getElementById('show-login')?.addEventListener('click', (e) => {
            e.preventDefault();
            window.showForm('login');
        });

        document.getElementById('sms-login-btn')?.addEventListener('click', (e) => {
            e.preventDefault();
            window.showForm('sms');
        });

        document.getElementById('forgot-password')?.addEventListener('click', (e) => {
            e.preventDefault();
            window.showForm('recovery');
        });

        document.getElementById('back-to-login')?.addEventListener('click', (e) => {
            e.preventDefault();
            window.showForm('login');
        });

        document.getElementById('back-to-login-2')?.addEventListener('click', (e) => {
            e.preventDefault();
            window.showForm('login');
        });
    }

    function calculateAgeFromBirthDate(birthDate) {
        if (!birthDate) return null;

        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }

        return age;
    }

    function validateBirthDate(birthDate) {
        if (!birthDate) {
            return { valid: false, message: 'Укажите дату рождения' };
        }

        const age = calculateAgeFromBirthDate(birthDate);

        if (age < 14) {
            return { valid: false, message: 'Вам должно быть не менее 14 лет' };
        }

        if (age > 100) {
            return { valid: false, message: 'Проверьте правильность даты' };
        }

        return { valid: true, message: '' };
    }

    function getBirthDateLimits() {
        const today = new Date();

        const maxDate = new Date(today.getFullYear() - 14, today.getMonth(), today.getDate());

        const minDate = new Date(today.getFullYear() - 100, today.getMonth(), today.getDate());

        return {
            min: minDate.toISOString().split('T')[0],
            max: maxDate.toISOString().split('T')[0]
        };
    }

    function initEventListeners() {

        document.getElementById('login-btn')?.addEventListener('click', (e) => {
            e.preventDefault();

            const username = document.getElementById('login-username')?.value.trim();
            const password = document.getElementById('login-password')?.value.trim();
            const rememberMe = document.getElementById('remember-me')?.checked || false;

            document.getElementById('login-username-error').textContent = '';
            document.getElementById('login-password-error').textContent = '';

            let isValid = true;
            if (!username) {
                document.getElementById('login-username-error').textContent = 'Введите логин';
                isValid = false;
            }
            if (!password) {
                document.getElementById('login-password-error').textContent = 'Введите пароль';
                isValid = false;
            }

            if (!isValid) return;

            const user = window.fitnessDB.authenticate(username, password);

            if (user) {
                console.log('✅ Вход выполнен:', user.firstName, user.lastName);
                window.fitnessDB.setCurrentUser(user, rememberMe);
                window.location.href = 'index.html';
            } else {
                document.getElementById('login-password-error').textContent = 'Неверный логин или пароль';
            }
        });

        document.getElementById('send-sms-btn')?.addEventListener('click', (e) => {
            e.preventDefault();

            const phone = document.getElementById('phone')?.value.trim();
            document.getElementById('phone-error').textContent = '';

            if (!phone || phone === '+7' || phone.length < 12) {
                document.getElementById('phone-error').textContent = 'Введите номер телефона (11 цифр после +7)';
                return;
            }

            const code = Math.floor(1000 + Math.random() * 9000).toString();

            sessionStorage.setItem('sms_code_' + phone, JSON.stringify({
                code: code,
                expires: Date.now() + 5 * 60 * 1000
            }));

            console.log(`📱 SMS код для ${phone}: ${code}`);
            alert(`[ТЕСТ] Ваш код подтверждения: ${code}`);

            document.getElementById('sms-code-group').style.display = 'block';
            document.getElementById('send-sms-btn').style.display = 'none';
            document.getElementById('verify-sms-btn').style.display = 'block';

            startSMSTimer();
        });

        document.getElementById('verify-sms-btn')?.addEventListener('click', (e) => {
            e.preventDefault();

            const phone = document.getElementById('phone')?.value.trim();
            const code = document.getElementById('sms-code')?.value.trim();
            document.getElementById('sms-code-error').textContent = '';

            if (!code || code.length !== 4) {
                document.getElementById('sms-code-error').textContent = 'Введите 4-значный код';
                return;
            }

            const stored = JSON.parse(sessionStorage.getItem('sms_code_' + phone) || '{}');

            if (stored.code === code && stored.expires > Date.now()) {
                const user = window.fitnessDB.getUserByPhone(phone);

                if (user) {
                    console.log('✅ Вход по SMS выполнен:', user.firstName, user.lastName);
                    window.fitnessDB.setCurrentUser(user, true);
                    window.location.href = 'index.html';
                } else {
                    document.getElementById('phone-error').textContent = 'Пользователь с таким номером не найден';
                }
            } else {
                document.getElementById('sms-code-error').textContent = 'Неверный или просроченный код';
            }
        });

        document.getElementById('recovery-btn')?.addEventListener('click', (e) => {
            e.preventDefault();

            const phone = document.getElementById('recovery-phone').value.trim();
            document.getElementById('recovery-phone-error').textContent = '';

            if (!phone || phone === '+7' || phone.length < 12) {
                document.getElementById('recovery-phone-error').textContent = 'Введите номер телефона (11 цифр после +7)';
                return;
            }

            const user = window.fitnessDB.getUserByPhone(phone);

            if (user) {
                const tempPassword = Math.random().toString(36).slice(-8);
                window.fitnessDB.updateUser(user.id, { password: tempPassword });

                console.log(`🔑 Временный пароль для ${phone}: ${tempPassword}`);
                alert(`[ТЕСТ] Ваш временный пароль: ${tempPassword}\nСмените его после входа.`);

                window.showForm('login');
            } else {
                document.getElementById('recovery-phone-error').textContent = 'Пользователь с таким номером не найден';
            }
        });

        document.getElementById('toggle-login-password')?.addEventListener('click', function () {
            const passwordInput = document.getElementById('login-password');
            const icon = this.querySelector('i');

            passwordInput.type = passwordInput.type === 'password' ? 'text' : 'password';
            icon.classList.toggle('fa-eye');
            icon.classList.toggle('fa-eye-slash');
        });

        document.getElementById('toggle-register-password')?.addEventListener('click', function () {
            const passwordInput = document.getElementById('register-password');
            const icon = this.querySelector('i');

            passwordInput.type = passwordInput.type === 'password' ? 'text' : 'password';
            icon.classList.toggle('fa-eye');
            icon.classList.toggle('fa-eye-slash');
        });

        document.getElementById('next-step')?.addEventListener('click', () => {
            if (validateCurrentStep()) {
                currentStep++;
                updateProgress();
                showStep(currentStep);
            }
        });

        document.getElementById('prev-step')?.addEventListener('click', () => {
            currentStep--;
            updateProgress();
            showStep(currentStep);
        });

        document.getElementById('complete-registration')?.addEventListener('click', (e) => {
            e.preventDefault();
            if (validateCurrentStep()) {
                completeRegistration();
            }
        });

        document.getElementById('register-password')?.addEventListener('input', function () {
            checkPasswordStrength(this.value);
        });

        document.getElementById('resend-sms')?.addEventListener('click', () => {
            const phone = document.getElementById('phone')?.value.trim();
            if (phone && phone.length >= 12) {
                const code = Math.floor(1000 + Math.random() * 9000).toString();

                sessionStorage.setItem('sms_code_' + phone, JSON.stringify({
                    code: code,
                    expires: Date.now() + 5 * 60 * 1000
                }));

                alert(`[ТЕСТ] Новый код подтверждения: ${code}`);
                startSMSTimer();
            }
        });
    }

    function startSMSTimer() {
        let seconds = 60;
        const timerElement = document.getElementById('timer');
        const timerText = document.getElementById('sms-timer-text');
        const resendBtn = document.getElementById('resend-sms');

        if (timerElement) timerElement.textContent = seconds;
        if (resendBtn) resendBtn.style.display = 'none';
        if (timerText) timerText.style.display = 'block';

        if (window.smsTimer) clearInterval(window.smsTimer);

        window.smsTimer = setInterval(() => {
            seconds--;
            if (timerElement) timerElement.textContent = seconds;

            if (seconds <= 0) {
                clearInterval(window.smsTimer);
                if (timerText) timerText.style.display = 'none';
                if (resendBtn) resendBtn.style.display = 'block';
            }
        }, 1000);
    }

    let currentStep = 1;
    const totalSteps = 9; 

    function resetRegistration() {
        currentStep = 1;
        updateProgress();
        showStep(currentStep);

        const prevBtn = document.getElementById('prev-step');
        const nextBtn = document.getElementById('next-step');
        const completeBtn = document.getElementById('complete-registration');

        if (prevBtn) {
            prevBtn.style.display = 'block';
            prevBtn.disabled = true;
        }
        if (nextBtn) nextBtn.style.display = 'block';
        if (completeBtn) completeBtn.style.display = 'none';
    }

    function updateProgress() {
        const progress = (currentStep / totalSteps) * 100;
        const progressBar = document.getElementById('registration-progress');
        const currentStepEl = document.getElementById('current-step');

        if (progressBar) progressBar.style.width = `${progress}%`;
        if (currentStepEl) currentStepEl.textContent = currentStep;
    }

    function showStep(step) {
        for (let i = 1; i <= totalSteps; i++) {
            const stepEl = document.getElementById(`step-${i}`);
            if (stepEl) stepEl.classList.remove('active');
        }

        const currentStepEl = document.getElementById(`step-${step}`);
        if (currentStepEl) currentStepEl.classList.add('active');

        const prevBtn = document.getElementById('prev-step');
        const nextBtn = document.getElementById('next-step');
        const completeBtn = document.getElementById('complete-registration');

        if (prevBtn) prevBtn.disabled = step === 1;

        if (step === totalSteps) {
            if (nextBtn) nextBtn.style.display = 'none';
            if (completeBtn) completeBtn.style.display = 'block';
        } else {
            if (nextBtn) nextBtn.style.display = 'block';
            if (completeBtn) completeBtn.style.display = 'none';
        }
    }

    function validateCurrentStep() {
        let isValid = true;

        document.querySelectorAll('.error-message').forEach(el => {
            el.textContent = '';
        });

        switch (currentStep) {
            case 1:
                const firstName = document.getElementById('first-name')?.value.trim();
                const lastName = document.getElementById('last-name')?.value.trim();

                if (!firstName) {
                    document.getElementById('first-name-error').textContent = 'Введите имя';
                    isValid = false;
                }
                if (!lastName) {
                    document.getElementById('last-name-error').textContent = 'Введите фамилию';
                    isValid = false;
                }
                break;

            case 2:
                const phone = document.getElementById('register-phone')?.value.trim();
                if (!phone || phone === '+7' || phone.length < 12) {
                    document.getElementById('register-phone-error').textContent = 'Введите номер телефона (11 цифр после +7)';
                    isValid = false;
                } else {
                    const existingUser = window.fitnessDB.getUserByPhone(phone);
                    if (existingUser) {
                        document.getElementById('register-phone-error').textContent = 'Этот номер телефона уже зарегистрирован';
                        isValid = false;
                    }
                }
                break;

            case 3:
                const username = document.getElementById('username')?.value.trim();
                if (!username) {
                    document.getElementById('username-error').textContent = 'Введите логин';
                    isValid = false;
                } else if (username.length < 3) {
                    document.getElementById('username-error').textContent = 'Логин должен содержать минимум 3 символа';
                    isValid = false;
                } else {
                    const existingUser = window.fitnessDB.getUserByUsername(username);
                    if (existingUser) {
                        document.getElementById('username-error').textContent = 'Этот логин уже занят';
                        isValid = false;
                    }
                }
                break;

            case 4:
                const password = document.getElementById('register-password')?.value;
                const confirmPassword = document.getElementById('confirm-password')?.value;

                if (!password) {
                    document.getElementById('register-password-error').textContent = 'Введите пароль';
                    isValid = false;
                } else if (password.length < 8) {
                    document.getElementById('register-password-error').textContent = 'Пароль должен содержать минимум 8 символов';
                    isValid = false;
                }

                if (!confirmPassword) {
                    document.getElementById('confirm-password-error').textContent = 'Подтвердите пароль';
                    isValid = false;
                } else if (password !== confirmPassword) {
                    document.getElementById('confirm-password-error').textContent = 'Пароли не совпадают';
                    isValid = false;
                }
                break;

            case 5:
                const birthDate = document.getElementById('birthDate')?.value;
                if (!birthDate) {
                    document.getElementById('birthDate-error').textContent = 'Укажите дату рождения';
                    isValid = false;
                } else {
                    const age = calculateAgeFromBirthDate(birthDate);
                    if (age < 14) {
                        document.getElementById('birthDate-error').textContent = 'Вам должно быть не менее 14 лет';
                        isValid = false;
                    } else if (age > 100) {
                        document.getElementById('birthDate-error').textContent = 'Проверьте правильность даты';
                        isValid = false;
                    }
                }
                break;

            case 6:
                const gender = document.querySelector('input[name="gender"]:checked');
                if (!gender) {
                    document.getElementById('gender-error').textContent = 'Выберите пол';
                    isValid = false;
                }
                break;

            case 7:
                const weight = parseFloat(document.getElementById('weight')?.value);
                if (!weight) {
                    document.getElementById('weight-error').textContent = 'Введите вес';
                    isValid = false;
                } else if (weight < 30 || weight > 200) {
                    document.getElementById('weight-error').textContent = 'Вес должен быть от 30 до 200 кг';
                    isValid = false;
                }
                break;

            case 8:
                const fitnessLevel = document.getElementById('fitness-level')?.value;
                if (!fitnessLevel) {
                    document.getElementById('fitness-level-error').textContent = 'Выберите уровень подготовки';
                    isValid = false;
                }
                break;

            case 9:
                const goal = document.getElementById('goal')?.value;
                if (!goal) {
                    document.getElementById('goal-error').textContent = 'Выберите основную цель';
                    isValid = false;
                }
                break;
        }

        return isValid;
    }

    function checkPasswordStrength(password) {
        const strengthBar = document.getElementById('password-strength');
        const strengthText = document.getElementById('strength-text');

        if (!strengthBar || !strengthText) return;

        const hasLength = password.length >= 8;
        const hasUppercase = /[A-Z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        let strength = 0;
        if (hasLength) strength += 25;
        if (hasUppercase) strength += 25;
        if (hasNumbers) strength += 25;
        if (hasSpecial) strength += 25;

        strengthBar.style.width = `${strength}%`;

        if (strength <= 25) {
            strengthBar.style.backgroundColor = '#ef4444';
            strengthText.textContent = 'Слабый';
        } else if (strength <= 50) {
            strengthBar.style.backgroundColor = '#f59e0b';
            strengthText.textContent = 'Средний';
        } else if (strength <= 75) {
            strengthBar.style.backgroundColor = '#3b82f6';
            strengthText.textContent = 'Хороший';
        } else {
            strengthBar.style.backgroundColor = '#10b981';
            strengthText.textContent = 'Надежный';
        }

        const reqLength = document.getElementById('req-length');
        const reqUppercase = document.getElementById('req-uppercase');
        const reqNumbers = document.getElementById('req-numbers');
        const reqSpecial = document.getElementById('req-special');

        if (reqLength) reqLength.className = hasLength ? 'valid' : '';
        if (reqUppercase) reqUppercase.className = hasUppercase ? 'valid' : '';
        if (reqNumbers) reqNumbers.className = hasNumbers ? 'valid' : '';
        if (reqSpecial) reqSpecial.className = hasSpecial ? 'valid' : '';
    }


    function completeRegistration() {
        console.log('📝 Начало регистрации...');

        const firstName = document.getElementById('first-name')?.value.trim();
        const lastName = document.getElementById('last-name')?.value.trim();
        const phone = document.getElementById('register-phone')?.value.trim();
        const username = document.getElementById('username')?.value.trim();
        const password = document.getElementById('register-password')?.value;
        const birthDate = document.getElementById('birthDate')?.value;
        const gender = document.querySelector('input[name="gender"]:checked')?.value;
        const weight = parseFloat(document.getElementById('weight')?.value);
        const fitnessLevel = document.getElementById('fitness-level')?.value;
        const goal = document.getElementById('goal')?.value;
        const medicalIssues = document.getElementById('medical-issues')?.value.trim() || '';

        if (!birthDate) {
            document.getElementById('birthDate-error').textContent = 'Укажите дату рождения';
            return;
        }

        const age = calculateAgeFromBirthDate(birthDate);
        if (age < 14) {
            document.getElementById('birthDate-error').textContent = 'Вам должно быть не менее 14 лет';
            return;
        }

        if (window.fitnessDB.getUserByUsername(username)) {
            document.getElementById('username-error').textContent = 'Этот логин уже занят';
            alert('Пользователь с таким логином уже существует');
            return;
        }

        if (window.fitnessDB.getUserByPhone(phone)) {
            document.getElementById('register-phone-error').textContent = 'Этот номер телефона уже зарегистрирован';
            alert('Этот номер телефона уже зарегистрирован');
            return;
        }

        if (!weight || weight < 30 || weight > 200) {
            document.getElementById('weight-error').textContent = 'Введите вес от 30 до 200 кг';
            return;
        }

        const userData = {
            firstName,
            lastName,
            phone,
            username,
            password,
            birthDate,
            gender,
            weight,
            fitnessLevel,
            goal,
            medicalIssues
        };

        const newUser = window.fitnessDB.createUser(userData);

        if (newUser) {
            console.log('✅ Новый пользователь создан:', newUser.firstName, newUser.lastName);
            window.fitnessDB.setCurrentUser(newUser, true);
            window.location.href = 'index.html';
        }
    }

    function checkAuth() {
        const currentUser = window.fitnessDB.getCurrentUser();
        if (currentUser && window.location.pathname.includes('login.html')) {
            console.log('✅ Пользователь уже авторизован, перенаправление на профиль');
            window.location.href = 'index.html';
        }
    }

    function setTestValues() {
        setTimeout(() => {

            if (document.getElementById('fitness-level')) {
                document.getElementById('fitness-level').value = 'intermediate';
            }
            if (document.getElementById('goal')) {
                document.getElementById('goal').value = 'muscle-gain';
            }
        }, 200);
    }
});

document.getElementById('go-to-login')?.addEventListener('click', function () {
    const modal = document.getElementById('success-modal');
    if (modal) modal.style.display = 'none';
    window.location.href = 'index.html';
});