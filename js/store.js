/**
 * ANGLICAN MODEL COLLEGE (AMCO) - LOCAL STORAGE & STATE STORE
 * Offline persistence manager with Export/Import JSON capabilities
 * Includes complete Student, Teacher/User, Class, and Subject data stores
 */

(function () {
  // Storage key for persistent database
  const STORAGE_KEY = "amco_school_management_db_v2";

  class Store {
    constructor() {
      this.listeners = [];
      this.init();
    }

    init() {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) {
          this.resetToDefault(false);
        } else {
          // Verify valid JSON
          JSON.parse(stored);
        }
      } catch (err) {
        console.warn("Storage initialization fallback:", err);
        this.resetToDefault(false);
      }
    }

    subscribe(listener) {
      this.listeners.push(listener);
      return () => {
        this.listeners = this.listeners.filter(l => l !== listener);
      };
    }

    notify(action, payload) {
      this.listeners.forEach(fn => {
        try {
          fn(action, payload);
        } catch (e) {
          console.error("Store listener error:", e);
        }
      });
    }

    getData() {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          return JSON.parse(stored);
        }
      } catch (e) {
        console.error("Error reading localStorage:", e);
      }
      return window.AMCO_DEFAULT_DATA;
    }

    saveData(data) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        this.notify("save", data);
        return true;
      } catch (err) {
        console.error("Failed to save data to localStorage:", err);
        alert("Failed to save data: Local storage limit reached or restricted in browser.");
        return false;
      }
    }

    resetToDefault(notify = true) {
      // Deep clone default data
      const defaultData = JSON.parse(JSON.stringify(window.AMCO_DEFAULT_DATA));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
      if (notify) {
        this.notify("reset", defaultData);
      }
      return defaultData;
    }

    // --- Users / Teachers Management ---
    getUsers() {
      const data = this.getData();
      return data.users || window.AMCO_DEFAULT_DATA.users;
    }

    getUserById(id) {
      const users = this.getUsers();
      return users.find(u => u.id === id || u.username.toLowerCase() === id.toLowerCase()) || null;
    }

    saveUser(user) {
      const data = this.getData();
      if (!data.users) data.users = JSON.parse(JSON.stringify(window.AMCO_DEFAULT_DATA.users));

      if (!user.id) {
        user.id = "usr_" + Date.now();
      }

      const index = data.users.findIndex(u => u.id === user.id || u.username.toLowerCase() === user.username.toLowerCase());
      if (index >= 0) {
        data.users[index] = { ...data.users[index], ...user };
      } else {
        data.users.push(user);
      }

      this.saveData(data);
      this.notify("user_saved", user);
      return user;
    }

    deleteUser(id) {
      const data = this.getData();
      if (!data.users) return false;
      const initialLen = data.users.length;
      // Do not allow deleting the primary admin account
      data.users = data.users.filter(u => u.id !== id && u.username !== "admin");
      if (data.users.length !== initialLen) {
        this.saveData(data);
        this.notify("user_deleted", id);
        return true;
      }
      return false;
    }

    // --- Student Management ---
    getStudents(filterClassId = null) {
      const data = this.getData();
      let list = data.students || [];
      if (filterClassId && filterClassId !== "ALL") {
        list = list.filter(s => s.classId === filterClassId);
      }
      return list;
    }

    getStudentById(id) {
      const data = this.getData();
      return (data.students || []).find(s => s.id === id || s.admNo === id) || null;
    }

    saveStudent(student) {
      const data = this.getData();
      if (!data.students) data.students = [];

      const index = data.students.findIndex(s => s.id === student.id);
      if (index >= 0) {
        data.students[index] = { ...data.students[index], ...student };
      } else {
        if (!student.id) {
          student.id = "std_" + Date.now();
        }
        data.students.push(student);
      }

      this.saveData(data);
      this.notify("student_saved", student);
      return student;
    }

    deleteStudent(id) {
      const data = this.getData();
      if (!data.students) return false;
      const initialLen = data.students.length;
      data.students = data.students.filter(s => s.id !== id);
      if (data.students.length !== initialLen) {
        this.saveData(data);
        this.notify("student_deleted", id);
        return true;
      }
      return false;
    }

    // --- Classes Management ---
    getClasses() {
      const data = this.getData();
      return data.classes || [];
    }

    saveClass(cls) {
      const data = this.getData();
      if (!data.classes) data.classes = [];
      const index = data.classes.findIndex(c => c.id === cls.id);
      if (index >= 0) {
        data.classes[index] = { ...data.classes[index], ...cls };
      } else {
        data.classes.push(cls);
      }
      this.saveData(data);
      this.notify("class_saved", cls);
      return cls;
    }

    // --- Subjects Management ---
    getSubjects() {
      const data = this.getData();
      return data.subjects || [];
    }

    saveSubject(subj) {
      const data = this.getData();
      if (!data.subjects) data.subjects = [];
      const index = data.subjects.findIndex(s => s.code === subj.code);
      if (index >= 0) {
        data.subjects[index] = { ...data.subjects[index], ...subj };
      } else {
        data.subjects.push(subj);
      }
      this.saveData(data);
      this.notify("subject_saved", subj);
      return subj;
    }

    // --- School Settings ---
    getSchoolInfo() {
      const data = this.getData();
      return data.school || window.AMCO_DEFAULT_DATA.school;
    }

    updateSchoolInfo(newInfo) {
      const data = this.getData();
      data.school = { ...data.school, ...newInfo };
      this.saveData(data);
      this.notify("school_updated", data.school);
      return data.school;
    }

    // --- Grading Utility ---
    computeGradeAndRemark(score) {
      const num = parseFloat(score);
      if (isNaN(num)) return { grade: "-", remark: "-" };
      if (num >= 70) return { grade: "A", remark: "DISTINCTION" };
      if (num >= 60) return { grade: "C", remark: "GOOD" };
      if (num >= 50) return { grade: "C", remark: "CREDIT" };
      if (num >= 40) return { grade: "P", remark: "PASS" };
      return { grade: "F", remark: "FAIL" };
    }

    // --- Export & Import ---
    exportJSON() {
      const data = this.getData();
      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const now = new Date();
      const dateStamp = now.toISOString().slice(0, 10);
      const filename = `AMCO_School_Backup_${dateStamp}.json`;

      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }

    importJSON(jsonString) {
      try {
        const parsed = JSON.parse(jsonString);
        if (!parsed.school || !parsed.students || !parsed.classes || !parsed.subjects) {
          throw new Error("Invalid backup structure. Missing required database collections.");
        }
        this.saveData(parsed);
        this.notify("import_success", parsed);
        return { success: true, count: parsed.students.length };
      } catch (err) {
        return { success: false, error: err.message };
      }
    }
  }

  window.AppStore = new Store();
})();
