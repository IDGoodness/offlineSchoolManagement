/**
 * ANGLICAN MODEL COLLEGE (AMCO) - TEACHER & STAFF MANAGEMENT MODULE
 * Allows Administrator to register and manage teachers, assign classes & subjects
 * Also powers self-registration from the login screen
 */

(function () {
  class TeachersModule {
    constructor() {}

    init() {
      this.bindEvents();
      this.populateDropdowns();
      this.renderTeachersList();
    }

    populateDropdowns() {
      const classes = window.AppStore.getClasses();
      const subjects = window.AppStore.getSubjects();

      // Admin Teacher Creation Dropdowns
      const classSelect = document.getElementById("new-teacher-class");
      const subjSelect = document.getElementById("new-teacher-subject");

      // Self Registration Dropdowns
      const selfClassSelect = document.getElementById("self-teacher-class");
      const selfSubjSelect = document.getElementById("self-teacher-subject");

      const classOptions = classes.map(c => `<option value="${c.id}">${c.name} (${c.category})</option>`).join("");
      const subjOptions = subjects.map(s => `<option value="${s.code}">${s.name} (${s.code})</option>`).join("");

      if (classSelect) classSelect.innerHTML = classOptions;
      if (subjSelect) subjSelect.innerHTML = subjOptions;
      if (selfClassSelect) selfClassSelect.innerHTML = classOptions;
      if (selfSubjSelect) selfSubjSelect.innerHTML = subjOptions;
    }

    bindEvents() {
      // Admin Register Teacher Form
      const form = document.getElementById("register-teacher-form");
      if (form) {
        form.addEventListener("submit", (e) => {
          e.preventDefault();
          this.handleAdminRegisterTeacher();
        });
      }

      // Self Registration Form in Login Modal
      const selfForm = document.getElementById("self-register-teacher-form");
      if (selfForm) {
        selfForm.addEventListener("submit", (e) => {
          e.preventDefault();
          this.handleSelfRegisterTeacher();
        });
      }

      // Tab switcher in login modal (Sign In vs Register Teacher)
      const tabSignInBtn = document.getElementById("btn-login-tab-signin");
      const tabRegisterBtn = document.getElementById("btn-login-tab-register");
      const paneSignIn = document.getElementById("login-pane-signin");
      const paneRegister = document.getElementById("login-pane-register");

      if (tabSignInBtn && tabRegisterBtn && paneSignIn && paneRegister) {
        tabSignInBtn.addEventListener("click", () => {
          tabSignInBtn.classList.add("active");
          tabRegisterBtn.classList.remove("active");
          paneSignIn.classList.remove("hidden");
          paneRegister.classList.add("hidden");
        });

        tabRegisterBtn.addEventListener("click", () => {
          tabRegisterBtn.classList.add("active");
          tabSignInBtn.classList.remove("active");
          paneRegister.classList.remove("hidden");
          paneSignIn.classList.add("hidden");
        });
      }
    }

    renderTeachersList() {
      const tbody = document.getElementById("teachers-table-body");
      const countBadge = document.getElementById("teachers-count-badge");
      if (!tbody) return;

      const users = window.AppStore.getUsers();
      const teachers = users.filter(u => u.role === "teacher");
      const icons = window.AppIcons || {};

      if (countBadge) {
        countBadge.textContent = `${teachers.length} Registered Teacher${teachers.length === 1 ? '' : 's'}`;
      }

      if (teachers.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="7" class="text-center py-8 text-muted-foreground">
              No teachers registered yet. Use the form above to add a new teacher.
            </td>
          </tr>
        `;
        return;
      }

      const activeUser = window.AppAuth.getCurrentUser();

      tbody.innerHTML = teachers.map((t, idx) => {
        const isCurrent = activeUser && activeUser.id === t.id;
        return `
          <tr class="hover:bg-slate-100/60 transition-colors">
            <td class="font-medium text-xs text-muted-foreground">${idx + 1}</td>
            <td>
              <div class="font-bold text-foreground text-sm">${t.fullName}</div>
              <div class="text-xs text-muted-foreground">${t.title || "Teacher"}</div>
            </td>
            <td>
              <span class="badge badge-secondary font-mono text-xs font-semibold">${t.username}</span>
            </td>
            <td>
              <span class="font-mono text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded border">
                •••••••• (${t.password})
              </span>
            </td>
            <td>
              <span class="badge badge-primary text-xs">${t.assignedClass || "SSS 1"}</span>
            </td>
            <td>
              <span class="badge badge-outline text-xs font-mono">${t.assignedSubject || "MTH"}</span>
            </td>
            <td class="text-right">
              <div class="inline-flex gap-1.5">
                <button class="btn btn-outline btn-sm" onclick="window.AppTeachers.loginAsTeacher('${t.id}')" title="Login as ${t.fullName}">
                  ${icons.users || ''} ${isCurrent ? 'Active' : 'Login As'}
                </button>
                <button class="btn btn-danger btn-sm" onclick="window.AppTeachers.confirmDeleteTeacher('${t.id}', '${t.fullName.replace(/'/g, "\\'")}')" title="Delete Teacher">
                  ${icons.trash || ''} Del
                </button>
              </div>
            </td>
          </tr>
        `;
      }).join("");
    }

    handleAdminRegisterTeacher() {
      const getVal = id => document.getElementById(id)?.value.trim() || "";

      const fullName = getVal("new-teacher-name");
      const username = getVal("new-teacher-username");
      const password = getVal("new-teacher-password");
      const title = getVal("new-teacher-title");
      const assignedClass = getVal("new-teacher-class");
      const assignedSubject = getVal("new-teacher-subject");

      if (!fullName || !username || !password) {
        window.AppNotification.show("Please fill in Teacher Name, Username, and Password.", "danger");
        return;
      }

      const res = window.AppAuth.registerTeacher({
        fullName,
        username,
        password,
        title,
        assignedClass,
        assignedSubject
      });

      if (res.success) {
        window.AppNotification.show(res.message, "success");
        document.getElementById("register-teacher-form").reset();
        this.populateDropdowns();
        this.renderTeachersList();
      } else {
        window.AppNotification.show(res.message, "danger");
      }
    }

    handleSelfRegisterTeacher() {
      const getVal = id => document.getElementById(id)?.value.trim() || "";

      const fullName = getVal("self-teacher-name");
      const username = getVal("self-teacher-username");
      const password = getVal("self-teacher-password");
      const title = getVal("self-teacher-title") || "Subject Teacher";
      const assignedClass = getVal("self-teacher-class");
      const assignedSubject = getVal("self-teacher-subject");

      if (!fullName || !username || !password) {
        window.AppNotification.show("Please enter your Name, Username, and Password.", "danger");
        return;
      }

      const res = window.AppAuth.registerTeacher({
        fullName,
        username,
        password,
        title,
        assignedClass,
        assignedSubject
      });

      if (res.success) {
        // Automatically log them in as the newly created teacher!
        window.AppAuth.login(username, password);
        window.AppNotification.show(`Welcome to AMCO, ${res.user.fullName}! Your account has been created.`, "success");
        if (window.AppNavigation) window.AppNavigation.closeModal("login-modal");
        document.getElementById("self-register-teacher-form").reset();
        this.renderTeachersList();
      } else {
        window.AppNotification.show(res.message, "danger");
      }
    }

    loginAsTeacher(userId) {
      const user = window.AppStore.getUserById(userId);
      if (user) {
        window.AppAuth.switchUserById(userId);
        window.AppNotification.show(`Switched session to ${user.fullName} (${user.assignedClass} • ${user.assignedSubject})`, "info");
        // Automatically switch to Results Entry tab pre-filtered to their class and subject
        if (window.AppNavigation) {
          window.AppNavigation.switchTab("tab-results");
        }
        if (window.AppScores) {
          const classSelect = document.getElementById("score-class-select");
          const subjSelect = document.getElementById("score-subject-select");
          if (classSelect && user.assignedClass) classSelect.value = user.assignedClass;
          if (subjSelect && user.assignedSubject) subjSelect.value = user.assignedSubject;
          window.AppScores.selectedClassId = user.assignedClass || "SSS 1";
          window.AppScores.selectedSubjectCode = user.assignedSubject || "MTH";
          window.AppScores.renderScoreEntryTable();
        }
      }
    }

    confirmDeleteTeacher(id, name) {
      if (confirm(`Are you sure you want to remove teacher "${name}" from the system?`)) {
        window.AppStore.deleteUser(id);
        window.AppNotification.show(`Teacher "${name}" removed.`, "info");
        this.renderTeachersList();
      }
    }
  }

  window.AppTeachers = new TeachersModule();
})();
