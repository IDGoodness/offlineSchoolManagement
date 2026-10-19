/**
 * ANGLICAN MODEL COLLEGE (AMCO) - AUTHENTICATION & ROLE MANAGEMENT
 * Local user store with Admin and Teacher registration, login, and permissions
 */

(function () {
  const AUTH_KEY = "amco_current_user_session_v2";

  class Auth {
    constructor() {
      this.currentUser = null;
      this.init();
    }

    init() {
      try {
        const stored = localStorage.getItem(AUTH_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          // Verify user still exists in database
          const existing = window.AppStore.getUserById(parsed.id);
          this.currentUser = existing || parsed;
        } else {
          // Default to Admin for immediate full access on first double-click
          const users = window.AppStore.getUsers();
          this.currentUser = users.find(u => u.role === "admin") || users[0];
          this.saveSession();
        }
      } catch (e) {
        console.warn("Auth initialization error:", e);
        this.currentUser = window.AppStore.getUsers()[0];
      }
    }

    saveSession() {
      if (this.currentUser) {
        localStorage.setItem(AUTH_KEY, JSON.stringify(this.currentUser));
      } else {
        localStorage.removeItem(AUTH_KEY);
      }
    }

    getCurrentUser() {
      return this.currentUser;
    }

    isAdmin() {
      return this.currentUser && this.currentUser.role === "admin";
    }

    isTeacher() {
      return this.currentUser && this.currentUser.role === "teacher";
    }

    login(username, password) {
      const users = window.AppStore.getUsers();
      const user = users.find(
        u => u.username.toLowerCase() === username.trim().toLowerCase() && u.password === password.trim()
      );

      if (user) {
        this.currentUser = user;
        this.saveSession();
        this.onAuthChange();
        return { success: true, user };
      }

      return {
        success: false,
        message: "Invalid credentials. Please verify your username and password."
      };
    }

    registerTeacher(teacherData) {
      const users = window.AppStore.getUsers();
      const usernameClean = teacherData.username.trim().toLowerCase();

      // Check if username already exists
      const exists = users.some(u => u.username.toLowerCase() === usernameClean);
      if (exists) {
        return {
          success: false,
          message: `Username '${teacherData.username}' is already taken. Please choose another.`
        };
      }

      const newTeacher = {
        id: "usr_" + Date.now(),
        username: usernameClean,
        password: teacherData.password.trim(),
        fullName: teacherData.fullName.trim(),
        role: "teacher",
        assignedClass: teacherData.assignedClass || "SSS 1",
        assignedSubject: teacherData.assignedSubject || "MTH",
        title: teacherData.title || "Class Tutor & Subject Teacher"
      };

      window.AppStore.saveUser(newTeacher);
      return {
        success: true,
        user: newTeacher,
        message: `Teacher ${newTeacher.fullName} registered successfully!`
      };
    }

    logout() {
      this.currentUser = null;
      this.saveSession();
      this.onAuthChange();
    }

    switchRole(targetRole) {
      const users = window.AppStore.getUsers();
      const user = users.find(u => u.role === targetRole);
      if (user) {
        this.currentUser = user;
        this.saveSession();
        this.onAuthChange();
      }
    }

    switchUserById(userId) {
      const user = window.AppStore.getUserById(userId);
      if (user) {
        this.currentUser = user;
        this.saveSession();
        this.onAuthChange();
        return true;
      }
      return false;
    }

    onAuthChange() {
      const event = new CustomEvent("amco_auth_changed", { detail: this.currentUser });
      window.dispatchEvent(event);
    }
  }

  window.AppAuth = new Auth();
})();
