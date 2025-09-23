// تطبيق مبسط بدون Firebase للاختبار
class StudentPortal {
    constructor() {
        this.currentUser = null;
        this.userData = null;
        this.init();
    }

    init() {
        // عرض صفحة التسجيل مباشرة (بدون Firebase)
        this.showLoginPage();
    }

    // عرض صفحة التسجيل
    showLoginPage() {
        const app = document.getElementById('app');
        app.innerHTML = `
            <div class="auth-container">
                <div class="auth-card">
                    <h1>بوابة الطالب</h1>
                    
                    <div class="tabs">
                        <button class="tab-btn active" data-tab="login">تسجيل الدخول</button>
                        <button class="tab-btn" data-tab="signup">إنشاء حساب جديد</button>
                    </div>

                    <!-- نموذج تسجيل الدخول -->
                    <form id="loginForm" class="auth-form active">
                        <div class="form-group">
                            <label for="loginUsername">اسم المستخدم:</label>
                            <input type="text" id="loginUsername" required>
                        </div>
                        <div class="form-group">
                            <label for="loginPassword">كلمة المرور:</label>
                            <input type="password" id="loginPassword" required>
                        </div>
                        <button type="submit" class="btn-primary">تسجيل الدخول</button>
                    </form>

                    <!-- نموذج إنشاء حساب -->
                    <form id="signupForm" class="auth-form">
                        <div class="form-group">
                            <label for="signupUsername">اسم المستخدم:</label>
                            <input type="text" id="signupUsername" pattern="[A-Za-z0-9_]+" 
                                   title="فقط حروف إنجليزية، أرقام، والعلامة _" required>
                            <small>فقط حروف إنجليزية، أرقام، والعلامة _</small>
                        </div>
                        <div class="form-group">
                            <label for="signupPassword">كلمة المرور:</label>
                            <input type="password" id="signupPassword" pattern="[A-Za-z0-9]{6,}" 
                                   title="6 أحرف على الأقل (حروف إنجليزية وأرقام فقط)" required>
                            <small>6 أحرف على الأقل (حروف إنجليزية وأرقام فقط)</small>
                        </div>
                        <div class="form-group">
                            <label for="specialization">التخصص:</label>
                            <select id="specialization" required>
                                <option value="">اختر التخصص</option>
                                <option value="science">علمي علوم</option>
                                <option value="math">علمي رياضة</option>
                                <option value="literary">أدبي</option>
                            </select>
                        </div>
                        <button type="submit" class="btn-primary">إنشاء حساب</button>
                    </form>

                    <div id="authMessage" class="message"></div>
                </div>
            </div>
        `;

        this.setupAuthEvents();
    }

    // إعداد أحداث النماذج
    setupAuthEvents() {
        // تبديل بين التبويبات
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
                
                e.target.classList.add('active');
                document.getElementById(e.target.dataset.tab + 'Form').classList.add('active');
            });
        });

        // تسجيل الدخول
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // إنشاء حساب
        document.getElementById('signupForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSignup();
        });
    }

    // معالجة تسجيل الدخول
    async handleLogin() {
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;
        const messageDiv = document.getElementById('authMessage');

        // التحقق من المستخدمين الخاصين
        if (username === 'admin' && password === '123432') {
            this.userData = {
                username: 'admin',
                specialization: 'admin',
                role: 'admin'
            };
            this.showDashboard();
            return;
        }

        if (username === 'owner' && password === '13831383') {
            this.userData = {
                username: 'owner',
                specialization: 'owner',
                role: 'owner'
            };
            this.showDashboard();
            return;
        }

        // مستخدم عادي
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.username === username && u.password === password);
        
        if (user) {
            this.userData = user;
            this.showDashboard();
        } else {
            messageDiv.textContent = 'اسم المستخدم أو كلمة المرور غير صحيحة';
            messageDiv.className = 'message error';
        }
    }

    // معالجة إنشاء حساب
    async handleSignup() {
        const username = document.getElementById('signupUsername').value;
        const password = document.getElementById('signupPassword').value;
        const specialization = document.getElementById('specialization').value;
        const messageDiv = document.getElementById('authMessage');

        // التحقق من صحة اسم المستخدم
        if (!/^[A-Za-z0-9_]+$/.test(username)) {
            messageDiv.textContent = 'اسم المستخدم يجب أن يحتوي فقط على حروف إنجليزية، أرقام، والعلامة _';
            messageDiv.className = 'message error';
            return;
        }

        // التحقق من عدم استخدام اسم مستخدم محجوز
        if (username === 'admin' || username === 'owner') {
            messageDiv.textContent = 'اسم المستخدم محجوز، الرجاء اختيار اسم آخر';
            messageDiv.className = 'message error';
            return;
        }

        // التحقق من عدم وجود اسم المستخدم مسبقاً
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const isTaken = users.some(u => u.username === username);
        
        if (isTaken) {
            messageDiv.textContent = 'اسم المستخدم موجود مسبقاً، الرجاء اختيار اسم آخر';
            messageDiv.className = 'message error';
            return;
        }

        // إنشاء حساب جديد
        const newUser = {
            username: username,
            password: password,
            specialization: specialization,
            role: 'student'
        };

        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));

        this.userData = newUser;
        this.showDashboard();
    }

    // عرض الصفحة الرئيسية
    async showDashboard() {
        const app = document.getElementById('app');
        
        // المواد حسب التخصص
        const subjects = this.getSubjectsBySpecialization(this.userData.specialization);
        
        app.innerHTML = `
            <div class="dashboard">
                <header class="header">
                    <h1>مرحباً ${this.userData.username} 👋</h1>
                    <div class="user-info">
                        <span>${this.getRoleDisplay()}</span>
                        <button id="logoutBtn" class="btn-secondary">تسجيل الخروج</button>
                    </div>
                </header>

                <main class="main-content">
                    ${this.userData.role === 'admin' || this.userData.role === 'owner' ? this.renderAdminPanel() : ''}
                    
                    <h2>موادك الدراسية</h2>
                    <div class="subjects-grid">
                        ${subjects.map(subject => `
                            <div class="subject-card">
                                <h3>${subject.name}</h3>
                                <p>${subject.description}</p>
                                <div class="card-actions">
                                    <button class="btn-primary" data-subject="${subject.name}">الدخول للمادة</button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </main>
            </div>
        `;

        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.handleLogout();
        });

        // إضافة أحداث للأزرار
        document.querySelectorAll('.btn-primary[data-subject]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const subject = e.target.dataset.subject;
                this.showSubjectContent(subject);
            });
        });
    }

    // عرض محتوى المادة
    async showSubjectContent(subjectName) {
        const app = document.getElementById('app');
        app.innerHTML = `
            <div class="dashboard">
                <header class="header">
                    <h1>${subjectName}</h1>
                    <div class="user-info">
                        <button id="backBtn" class="btn-secondary">العودة للرئيسية</button>
                        <button id="logoutBtn" class="btn-secondary">تسجيل الخروج</button>
                    </div>
                </header>

                <main class="main-content">
                    ${this.userData.role === 'admin' || this.userData.role === 'owner' ? this.renderAdminPanel(subjectName) : ''}
                    
                    <h2>محتوى ${subjectName}</h2>
                    <div style="text-align: center; color: #aaa; padding: 40px;">
                        <p>سيتم إضافة المحتوى قريباً...</p>
                        ${this.userData.role === 'admin' || this.userData.role === 'owner' ? 
                            '<p>يمكنك إضافة محتوى من لوحة الإدارة أعلاه</p>' : ''}
                    </div>
                </main>
            </div>
        `;

        document.getElementById('backBtn').addEventListener('click', () => {
            this.showDashboard();
        });

        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.handleLogout();
        });
    }

    // عرض لوحة الإدارة
    renderAdminPanel(currentSubject = '') {
        const subjects = this.getSubjectsList();
        
        return `
            <div class="admin-panel">
                <h3>لوحة الإدارة</h3>
                <div class="form-group">
                    <label for="adminSubject">المادة:</label>
                    <select id="adminSubject">
                        <option value="">اختر المادة</option>
                        ${subjects.map(subject => 
                            `<option value="${subject}" ${currentSubject === subject ? 'selected' : ''}>${subject}</option>`
                        ).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label for="folderName">اسم المجلد:</label>
                    <input type="text" id="folderName" placeholder="أدخل اسم المجلد">
                </div>
                <button id="addFolderBtn" class="btn-primary">إضافة مجلد</button>
            </div>
        `;
    }

    // الحصول على عرض الدور
    getRoleDisplay() {
        if (this.userData.role === 'admin') {
            return 'الدور: مسؤول';
        } else if (this.userData.role === 'owner') {
            return 'الدور: مالك النظام';
        } else {
            return `التخصص: ${this.getSpecializationName(this.userData.specialization)}`;
        }
    }

    // الحصول على المواد حسب التخصص
    getSubjectsBySpecialization(spec) {
        const subjects = {
            science: [
                { name: 'الكيمياء', description: 'دراسة المادة وخصائصها' },
                { name: 'الفيزياء', description: 'دراسة القوانين الطبيعية' },
                { name: 'الأحياء', description: 'دراسة الكائنات الحية' },
                { name: 'اللغة العربية', description: 'قواعد وأدب عربي' },
                { name: 'اللغة الإنجليزية', description: 'English Language' }
            ],
            math: [
                { name: 'الرياضيات', description: 'جبر وهندسة وحساب مثلثات' },
                { name: 'الفيزياء', description: 'دراسة القوانين الطبيعية' },
                { name: 'الكيمياء', description: 'دراسة المادة وخصائصها' },
                { name: 'اللغة العربية', description: 'قواعد وأدب عربي' },
                { name: 'اللغة الإنجليزية', description: 'English Language' }
            ],
            literary: [
                { name: 'التاريخ', description: 'تاريخ العالم والعرب' },
                { name: 'الجغرافيا', description: 'دراسة الأرض والظواهر الطبيعية' },
                { name: 'الفلسفة', description: 'منطق وفلسفة' },
                { name: 'علم النفس', description: 'دراسة السلوك البشري' },
                { name: 'اللغة العربية', description: 'قواعد وأدب عربي' }
            ],
            admin: [
                { name: 'الكيمياء', description: 'دراسة المادة وخصائصها' },
                { name: 'الفيزياء', description: 'دراسة القوانين الطبيعية' },
                { name: 'الرياضيات', description: 'جبر وهندسة وحساب مثلثات' },
                { name: 'التاريخ', description: 'تاريخ العالم والعرب' },
                { name: 'اللغة العربية', description: 'قواعد وأدب عربي' }
            ],
            owner: [
                { name: 'الكيمياء', description: 'دراسة المادة وخصائصها' },
                { name: 'الفيزياء', description: 'دراسة القوانين الطبيعية' },
                { name: 'الرياضيات', description: 'جبر وهندسة وحساب مثلثات' },
                { name: 'التاريخ', description: 'تاريخ العالم والعرب' },
                { name: 'اللغة العربية', description: 'قواعد وأدب عربي' }
            ]
        };

        return subjects[spec] || [];
    }

    // الحصول على قائمة المواد
    getSubjectsList() {
        const allSubjects = [
            'الكيمياء', 'الفيزياء', 'الأحياء', 'الرياضيات', 
            'التاريخ', 'الجغرافيا', 'الفلسفة', 'علم النفس', 
            'اللغة العربية', 'اللغة الإنجليزية'
        ];
        
        return allSubjects;
    }

    // الحصول على اسم التخصص
    getSpecializationName(spec) {
        const names = {
            science: 'علمي علوم',
            math: 'علمي رياضة',
            literary: 'أدبي',
            admin: 'مسؤول',
            owner: 'مالك النظام'
        };
        return names[spec] || spec;
    }

    // معالجة تسجيل الخروج
    handleLogout() {
        this.currentUser = null;
        this.userData = null;
        this.showLoginPage();
    }
}

// بدء التطبيق بعد تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    new StudentPortal();
});
