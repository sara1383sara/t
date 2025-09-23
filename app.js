// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBK6FZF3LW83qaUHBKYTfiVd2Ozrd1Rf2g",
    authDomain: "thanawy-1383.firebaseapp.com",
    projectId: "thanawy-1383",
    storageBucket: "thanawy-1383.firebasestorage.app",
    messagingSenderId: "1026664406457",
    appId: "1:1026664406457:web:546440a738ca05eda0aa68",
    measurementId: "G-MXETCQM4QK"
};

// Firebase imports (using CDN)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { 
    getFirestore, 
    doc, 
    setDoc, 
    getDoc,
    updateDoc,
    deleteDoc,
    collection,
    getDocs,
    addDoc,
    arrayUnion,
    arrayRemove
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

class StudentPortal {
    constructor() {
        this.currentUser = null;
        this.userData = null;
        this.currentFolderId = null;
        this.currentContentId = null;
        this.init();
    }

    init() {
        // نتأكد من حالة المستخدم
        onAuthStateChanged(auth, (user) => {
            if (user) {
                this.currentUser = user;
                this.loadUserData();
            } else {
                this.showLoginPage();
            }
        });

        // إعداد أحداث النوافذ المنبثقة
        this.setupModals();
    }

    // إعداد النوافذ المنبثقة
    setupModals() {
        // إغلاق النوافذ عند النقر على X أو خارج المحتوى
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.modal').forEach(modal => {
                    modal.style.display = 'none';
                });
            });
        });

        // إغلاق النوافذ عند النقر خارج المحتوى
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            });
        });

        // تغيير عرض حقل الرابط بناءً على نوع المحتوى
        document.getElementById('contentType').addEventListener('change', (e) => {
            const urlField = document.getElementById('urlField');
            if (e.target.value === 'video' || e.target.value === 'link') {
                urlField.style.display = 'block';
                document.getElementById('contentUrl').required = true;
            } else {
                urlField.style.display = 'none';
                document.getElementById('contentUrl').required = false;
            }
        });

        // إرسال نموذج إضافة المحتوى
        document.getElementById('contentForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addContentToFolder();
        });

        // إرسال نموذج تعديل المجلد
        document.getElementById('folderForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateFolder();
        });
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
            // تسجيل دخول كمسؤول
            try {
                // محاولة تسجيل الدخول باستخدام بريد افتراضي
                await signInWithEmailAndPassword(auth, 'admin@thanawy.com', '123432');
                messageDiv.textContent = 'تم تسجيل الدخول كمسؤول بنجاح!';
                messageDiv.className = 'message success';
            } catch (error) {
                // إذا فشل، ننشئ حساب المسؤول
                await this.createAdminAccount();
                messageDiv.textContent = 'تم تسجيل الدخول كمسؤول بنجاح!';
                messageDiv.className = 'message success';
            }
            return;
        }

        if (username === 'owner' && password === '13831383') {
            // تسجيل دخول كمالك
            try {
                await signInWithEmailAndPassword(auth, 'owner@thanawy.com', '13831383');
                messageDiv.textContent = 'تم تسجيل الدخول كمالك بنجاح!';
                messageDiv.className = 'message success';
            } catch (error) {
                await this.createOwnerAccount();
                messageDiv.textContent = 'تم تسجيل الدخول كمالك بنجاح!';
                messageDiv.className = 'message success';
            }
            return;
        }

        try {
            messageDiv.textContent = 'جاري تسجيل الدخول...';
            messageDiv.className = 'message info';

            // البحث عن المستخدم باستخدام اسم المستخدم
            const userEmail = await this.getUserEmailByUsername(username);
            
            if (!userEmail) {
                messageDiv.textContent = 'اسم المستخدم غير موجود';
                messageDiv.className = 'message error';
                return;
            }

            await signInWithEmailAndPassword(auth, userEmail, password);
            messageDiv.textContent = 'تم تسجيل الدخول بنجاح!';
            messageDiv.className = 'message success';
        } catch (error) {
            messageDiv.textContent = this.getAuthErrorMessage(error.code);
            messageDiv.className = 'message error';
        }
    }

    // إنشاء حساب المسؤول
    async createAdminAccount() {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, 'admin@thanawy.com', '123432');
            const user = userCredential.user;
            
            await setDoc(doc(db, 'users', user.uid), {
                username: 'admin',
                email: 'admin@thanawy.com',
                specialization: 'admin',
                role: 'admin',
                createdAt: new Date()
            });
        } catch (error) {
            console.error('Error creating admin account:', error);
        }
    }

    // إنشاء حساب المالك
    async createOwnerAccount() {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, 'owner@thanawy.com', '13831383');
            const user = userCredential.user;
            
            await setDoc(doc(db, 'users', user.uid), {
                username: 'owner',
                email: 'owner@thanawy.com',
                specialization: 'owner',
                role: 'owner',
                createdAt: new Date()
            });
        } catch (error) {
            console.error('Error creating owner account:', error);
        }
    }

    // البحث عن البريد الإلكتروني باستخدام اسم المستخدم
    async getUserEmailByUsername(username) {
        try {
            const usersSnapshot = await getDocs(collection(db, 'users'));
            let userEmail = null;
            
            usersSnapshot.forEach(doc => {
                const userData = doc.data();
                if (userData.username === username) {
                    userEmail = userData.email;
                }
            });
            
            return userEmail;
        } catch (error) {
            console.error('Error getting user email:', error);
            return null;
        }
    }

    // التحقق من وجود اسم مستخدم
    async isUsernameTaken(username) {
        try {
            const usersSnapshot = await getDocs(collection(db, 'users'));
            let taken = false;
            
            usersSnapshot.forEach(doc => {
                const userData = doc.data();
                if (userData.username === username) {
                    taken = true;
                }
            });
            
            return taken;
        } catch (error) {
            console.error('Error checking username:', error);
            return false;
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
        const isTaken = await this.isUsernameTaken(username);
        if (isTaken) {
            messageDiv.textContent = 'اسم المستخدم موجود مسبقاً، الرجاء اختيار اسم آخر';
            messageDiv.className = 'message error';
            return;
        }

        try {
            messageDiv.textContent = 'جاري إنشاء الحساب...';
            messageDiv.className = 'message info';

            // إنشاء بريد إلكتروني فريد بناءً على اسم المستخدم
            const email = `${username}@thanawy.com`;

            // إنشاء المستخدم في Authentication
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // حفظ بيانات إضافية في Firestore
            await setDoc(doc(db, 'users', user.uid), {
                username: username,
                email: email,
                specialization: specialization,
                role: 'student',
                createdAt: new Date()
            });

            messageDiv.textContent = 'تم إنشاء الحساب بنجاح!';
            messageDiv.className = 'message success';
        } catch (error) {
            messageDiv.textContent = this.getAuthErrorMessage(error.code);
            messageDiv.className = 'message error';
        }
    }

    // تحميل بيانات المستخدم
    async loadUserData() {
        try {
            const userDoc = await getDoc(doc(db, 'users', this.currentUser.uid));
            if (userDoc.exists()) {
                this.userData = userDoc.data();
                this.showDashboard();
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    }

    // عرض الصفحة الرئيسية
    async showDashboard() {
        const app = document.getElementById('app');
        
        // المواد حسب التخصص
        const subjects = this.getSubjectsBySpecialization(this.userData.specialization);
        
        // تحميل المجلدات والمحتوى
        const folders = await this.loadFolders();
        
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
                    ${this.userData.role === 'admin' || this.userData.role === 'owner' ? this.renderAdminPanel(folders) : ''}
                    
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

        // إضافة أحداث لوحة الإدارة
        if (this.userData.role === 'admin' || this.userData.role === 'owner') {
            this.setupAdminEvents();
        }
    }

    // عرض محتوى المادة
    async showSubjectContent(subjectName) {
        const folders = await this.loadFolders();
        const subjectFolders = folders.filter(folder => folder.subject === subjectName);
        
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
                    ${this.userData.role === 'admin' || this.userData.role === 'owner' ? this.renderAdminPanel(folders, subjectName) : ''}
                    
                    <h2>محتوى ${subjectName}</h2>
                    <div class="folder-management">
                        ${subjectFolders.length > 0 ? 
                            subjectFolders.map(folder => this.renderFolder(folder)).join('') : 
                            '<p style="text-align: center; color: #aaa;">لا توجد مجلدات لهذه المادة بعد</p>'
                        }
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

        // إعداد أحداث لوحة الإدارة إذا كان المستخدم مسؤولاً
        if (this.userData.role === 'admin' || this.userData.role === 'owner') {
            this.setupAdminEvents();
        }
    }

    // عرض المجلد
    renderFolder(folder) {
        return `
            <div class="folder-item" data-folder-id="${folder.id}">
                <h4>${folder.name}</h4>
                ${this.userData.role === 'admin' || this.userData.role === 'owner' ? `
                    <div class="folder-actions">
                        <button class="btn-secondary edit-folder">تعديل</button>
                        <button class="btn-danger delete-folder">حذف</button>
                        <button class="btn-primary add-content">إضافة محتوى</button>
                    </div>
                ` : ''}
                <div class="folder-content">
                    ${folder.content && folder.content.length > 0 ? 
                        folder.content.map(item => this.renderContentItem(item, folder.id)).join('') : 
                        '<p style="text-align: center; color: #888;">لا يوجد محتوى في هذا المجلد بعد</p>'
                    }
                </div>
            </div>
        `;
    }

    // عرض عنصر المحتوى
    renderContentItem(item, folderId) {
        let contentHtml = '';
        
        if (item.type === 'folder') {
            contentHtml = `<span>📁 ${item.name}</span>`;
        } else if (item.type === 'video') {
            contentHtml = `<span>🎥 ${item.name}</span> <a href="${item.url}" target="_blank" style="color: #4a8cff;">(مشاهدة)</a>`;
        } else if (item.type === 'link') {
            contentHtml = `<span>🔗 ${item.name}</span> <a href="${item.url}" target="_blank" style="color: #4a8cff;">(فتح الرابط)</a>`;
        }
        
        return `
            <div class="content-item">
                <div>${contentHtml}</div>
                ${this.userData.role === 'admin' || this.userData.role === 'owner' ? `
                    <div class="content-actions">
                        <button class="btn-danger delete-content" data-folder-id="${folderId}" data-item-id="${item.id}">حذف</button>
                    </div>
                ` : ''}
            </div>
        `;
    }

    // عرض لوحة الإدارة
    renderAdminPanel(folders, currentSubject = '') {
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

    // إعداد أحداث لوحة الإدارة
    setupAdminEvents() {
        // إضافة مجلد
        const addFolderBtn = document.getElementById('addFolderBtn');
        if (addFolderBtn) {
            addFolderBtn.addEventListener('click', () => {
                this.addFolder();
            });
        }

        // تعديل مجلد
        document.querySelectorAll('.edit-folder').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const folderId = e.target.closest('.folder-item').dataset.folderId;
                this.showEditFolderModal(folderId);
            });
        });

        // حذف مجلد
        document.querySelectorAll('.delete-folder').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const folderId = e.target.closest('.folder-item').dataset.folderId;
                if (confirm('هل أنت متأكد من حذف هذا المجلد؟')) {
                    this.deleteFolder(folderId);
                }
            });
        });

        // إضافة محتوى
        document.querySelectorAll('.add-content').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const folderId = e.target.closest('.folder-item').dataset.folderId;
                this.showAddContentModal(folderId);
            });
        });

        // حذف محتوى
        document.querySelectorAll('.delete-content').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const folderId = e.target.dataset.folderId;
                const itemId = e.target.dataset.itemId;
                if (confirm('هل أنت متأكد من حذف هذا المحتوى؟')) {
                    this.deleteContent(folderId, itemId);
                }
            });
        });
