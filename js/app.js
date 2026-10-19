/**
 * ANGLICAN MODEL COLLEGE (AMCO) - APP CONTROLLER & NAVIGATION
 * Orchestrates views, modals, notifications, role permissions, and offline backups
 */

(function () {
  // --- Toast Notification Manager ---
  class NotificationManager {
    constructor() {
      this.container = document.getElementById("toast-container");
    }

    show(message, type = "info", duration = 3500) {
      if (!this.container) {
        this.container = document.getElementById("toast-container");
      }
      if (!this.container) return;

      const toast = document.createElement("div");
      toast.className = `toast toast-${type}`;

      let icon = "ℹ️";
      if (type === "success") icon = "✓";
      if (type === "danger") icon = "✕";
      if (type === "warning") icon = "⚠";

      toast.innerHTML = `
        <span class="font-bold text-lg">${icon}</span>
        <div class="flex-1 text-sm font-medium leading-tight">${message}</div>
      `;

      this.container.appendChild(toast);

      setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateX(100%)";
        toast.style.transition = "all 0.3s ease";
        setTimeout(() => toast.remove(), 300);
      }, duration);
    }
  }

  window.AppNotification = new NotificationManager();

  // --- Main Application Navigation & Lifecycle ---
  class Application {
    constructor() {
      this.activeTab = "tab-students";
    }

    init() {
      this.bindTabNavigation();
      this.bindAuthUI();
      this.bindBackupUI();
      this.bindModalClosers();
      this.syncUserRoleUI();

      // Initialize all sub-modules
      if (window.AppStudents) window.AppStudents.init();
      if (window.AppClasses) window.AppClasses.init();
      if (window.AppTeachers) window.AppTeachers.init();
      if (window.AppScores) window.AppScores.init();
      if (window.AppReportCard) window.AppReportCard.init();

      // Listen for data changes across components
      window.AppStore.subscribe((action, payload) => {
        if (action === "reset" || action === "import_success") {
          window.location.reload();
        }
      });

      // Listen for auth changes
      window.addEventListener("amco_auth_changed", () => {
        this.syncUserRoleUI();
        if (window.AppStudents) window.AppStudents.renderDirectory();
      });
    }

    switchTab(targetTabId) {
      this.activeTab = targetTabId;

      // Update Nav Buttons
      document.querySelectorAll(".nav-tab-btn").forEach(btn => {
        if (btn.getAttribute("data-tab") === targetTabId) {
          btn.classList.add("active");
        } else {
          btn.classList.remove("active");
        }
      });

      // Update Tab Panes
      document.querySelectorAll(".tab-pane").forEach(pane => {
        if (pane.id === targetTabId) {
          pane.classList.remove("hidden");
          if (targetTabId === "tab-report-card") {
            pane.classList.add("active-printable");
          } else {
            pane.classList.remove("active-printable");
          }
        } else {
          pane.classList.add("hidden");
          pane.classList.remove("active-printable");
        }
      });

      // Trigger re-render of active view
      if (targetTabId === "tab-students" && window.AppStudents) {
        window.AppStudents.renderDirectory();
      } else if (targetTabId === "tab-classes" && window.AppClasses) {
        window.AppClasses.renderClassesList();
        window.AppClasses.renderSubjectsList();
      } else if (targetTabId === "tab-teachers" && window.AppTeachers) {
        window.AppTeachers.populateDropdowns();
        window.AppTeachers.renderTeachersList();
      } else if (targetTabId === "tab-results" && window.AppScores) {
        window.AppScores.renderScoreEntryTable();
      } else if (targetTabId === "tab-domain" && window.AppScores) {
        window.AppScores.populateDomainStudentDropdown();
      } else if (targetTabId === "tab-report-card" && window.AppReportCard) {
        window.AppReportCard.populateStudentDropdown();
        window.AppReportCard.render();
      }
    }

    bindTabNavigation() {
      document.querySelectorAll(".nav-tab-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          const tabId = btn.getAttribute("data-tab");
          if (tabId) {
            this.switchTab(tabId);
          }
        });
      });
    }

    bindAuthUI() {
      // Role Switcher buttons
      const btnSwitchAdmin = document.getElementById("btn-quick-admin");
      const btnSwitchTeacher = document.getElementById("btn-quick-teacher");
      const btnLogout = document.getElementById("btn-header-logout");
      const btnOpenLoginModal = document.getElementById("btn-open-login-modal");
      const loginForm = document.getElementById("login-modal-form");

      if (btnSwitchAdmin) {
        btnSwitchAdmin.addEventListener("click", () => {
          window.AppAuth.switchRole("admin");
          window.AppNotification.show("Switched to Admin Role (Alhaji / Rev. Administrator)", "success");
        });
      }

      if (btnSwitchTeacher) {
        btnSwitchTeacher.addEventListener("click", () => {
          window.AppAuth.switchRole("teacher");
          window.AppNotification.show("Switched to Teacher Role (Mr. Siyanbola John)", "info");
        });
      }

      if (btnLogout) {
        btnLogout.addEventListener("click", () => {
          window.AppAuth.logout();
          window.AppNotification.show("Logged out.", "info");
          this.openModal("login-modal");
        });
      }

      if (btnOpenLoginModal) {
        btnOpenLoginModal.addEventListener("click", () => {
          this.openModal("login-modal");
        });
      }

      if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
          e.preventDefault();
          const u = document.getElementById("login-username").value;
          const p = document.getElementById("login-password").value;
          const res = window.AppAuth.login(u, p);
          if (res.success) {
            window.AppNotification.show(`Welcome back, ${res.user.fullName}!`, "success");
            this.closeModal("login-modal");
            document.getElementById("login-username").value = "";
            document.getElementById("login-password").value = "";
          } else {
            window.AppNotification.show(res.message, "danger");
          }
        });
      }
    }

    syncUserRoleUI() {
      const user = window.AppAuth.getCurrentUser();
      const isAdmin = window.AppAuth.isAdmin();
      const isTeacher = window.AppAuth.isTeacher();

      const userBadge = document.getElementById("header-user-badge");
      const userRoleLabel = document.getElementById("header-user-role-label");

      if (userBadge && userRoleLabel) {
        if (user) {
          userBadge.textContent = user.fullName || user.username;
          userRoleLabel.textContent = user.role.toUpperCase();
          userRoleLabel.className = `badge ${user.role === 'admin' ? 'badge-primary' : 'badge-navy'}`;
        } else {
          userBadge.textContent = "Guest / Logged Out";
          userRoleLabel.textContent = "VISITOR";
          userRoleLabel.className = "badge badge-slate";
        }
      }

      // Highlight quick role buttons based on active session
      const btnAdmin = document.getElementById("btn-quick-admin");
      const btnTeacher = document.getElementById("btn-quick-teacher");
      if (btnAdmin) {
        btnAdmin.style.background = isAdmin ? "#ffffff" : "rgba(255,255,255,0.15)";
        btnAdmin.style.color = isAdmin ? "#0f172a" : "#ffffff";
        btnAdmin.style.fontWeight = isAdmin ? "700" : "500";
      }
      if (btnTeacher) {
        btnTeacher.style.background = isTeacher ? "#ffffff" : "rgba(255,255,255,0.15)";
        btnTeacher.style.color = isTeacher ? "#0f172a" : "#ffffff";
        btnTeacher.style.fontWeight = isTeacher ? "700" : "500";
      }

      // Restrict tabs
      document.querySelectorAll(".admin-only").forEach(el => {
        if (isAdmin) {
          el.classList.remove("hidden");
        } else {
          el.classList.add("hidden");
        }
      });

      // If non-admin is currently on an admin-only tab, switch to a safe tab
      if (!isAdmin && (this.activeTab === "tab-registration" || this.activeTab === "tab-classes" || this.activeTab === "tab-teachers" || this.activeTab === "tab-backup")) {
        this.switchTab("tab-results");
      }
    }

    bindBackupUI() {
      const exportBtn = document.getElementById("btn-export-backup");
      const importInput = document.getElementById("file-import-backup");
      const resetBtn = document.getElementById("btn-reset-demo-data");

      if (exportBtn) {
        exportBtn.addEventListener("click", () => {
          window.AppStore.exportJSON();
          window.AppNotification.show("Database exported as JSON backup file.", "success");
        });
      }

      if (importInput) {
        importInput.addEventListener("change", (e) => {
          const file = e.target.files[0];
          if (!file) return;

          const reader = new FileReader();
          reader.onload = (event) => {
            const content = event.target.result;
            const res = window.AppStore.importJSON(content);
            if (res.success) {
              window.AppNotification.show(`Backup restored successfully! Loaded ${res.count} students.`, "success");
            } else {
              window.AppNotification.show(`Import error: ${res.error}`, "danger");
            }
          };
          reader.readAsText(file);
          importInput.value = "";
        });
      }

      if (resetBtn) {
        resetBtn.addEventListener("click", () => {
          if (confirm("Reset entire school database back to default seed data? Any new students and score entries will be overwritten.")) {
            window.AppStore.resetToDefault(true);
          }
        });
      }
    }

    bindModalClosers() {
      document.querySelectorAll(".modal-close-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
          const modal = btn.closest(".modal-overlay");
          if (modal) {
            modal.classList.remove("active");
            modal.classList.remove("print-active-modal");
          }
        });
      });

      // Close on background click
      document.querySelectorAll(".modal-overlay").forEach(modal => {
        modal.addEventListener("click", (e) => {
          if (e.target === modal) {
            modal.classList.remove("active");
            modal.classList.remove("print-active-modal");
          }
        });
      });
    }

    openModal(modalId) {
      const modal = document.getElementById(modalId);
      if (modal) {
        modal.classList.add("active");
      }
    }

    closeModal(modalId) {
      const modal = document.getElementById(modalId);
      if (modal) {
        modal.classList.remove("active");
        modal.classList.remove("print-active-modal");
      }
    }
  }

  window.AppNavigation = new Application();

  document.addEventListener("DOMContentLoaded", () => {
    window.AppNavigation.init();
  });
})();
