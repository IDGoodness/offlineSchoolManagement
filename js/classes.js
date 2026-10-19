/**
 * ANGLICAN MODEL COLLEGE (AMCO) - CLASSES & SUBJECTS MODULE
 * Handles Junior & Senior Classes (Arms removed) and Subject Enrolment
 * Styled with Shadcn / Radix primitives & React Icons
 */

(function () {
  class ClassesModule {
    constructor() {
      this.selectedStudentIdForSubjects = null;
    }

    init() {
      this.bindEvents();
      this.renderClassesList();
      this.renderSubjectsList();
    }

    bindEvents() {
      // Add Class Form
      const addClassForm = document.getElementById("add-class-form");
      if (addClassForm) {
        addClassForm.addEventListener("submit", (e) => {
          e.preventDefault();
          this.handleAddClass();
        });
      }

      // Add Subject Form
      const addSubjectForm = document.getElementById("add-subject-form");
      if (addSubjectForm) {
        addSubjectForm.addEventListener("submit", (e) => {
          e.preventDefault();
          this.handleAddSubject();
        });
      }
    }

    renderClassesList() {
      const container = document.getElementById("classes-list-grid");
      if (!container) return;

      const classes = window.AppStore.getClasses();
      const students = window.AppStore.getStudents();
      const icons = window.AppIcons || {};

      container.innerHTML = classes.map(c => {
        const classStudents = students.filter(s => s.classId === c.id);
        const maleCount = classStudents.filter(s => s.sex === 'M').length;
        const femaleCount = classStudents.filter(s => s.sex === 'F').length;
        const isSenior = c.category && c.category.includes("Senior");

        return `
          <div class="class-card ${isSenior ? 'senior' : 'junior'}">
            <div class="card-header py-3 flex justify-between items-center bg-white">
              <div>
                <span class="font-bold text-lg text-foreground tracking-tight">${c.name}</span>
                <span class="badge ${isSenior ? 'badge-senior' : 'badge-junior'} text-xs ml-2">${c.category}</span>
              </div>
              <span class="badge badge-outline text-xs">${classStudents.length} Students</span>
            </div>
            <div class="card-body py-4 text-sm space-y-2">
              <div class="text-foreground">
                <span class="text-muted-foreground">Class Tutor:</span> <strong>${c.tutor || "Not Assigned"}</strong>
              </div>
              <div class="text-xs text-muted-foreground flex gap-4">
                <span>Boys: <strong class="text-blue-700">${maleCount}</strong></span>
                <span>Girls: <strong class="text-emerald-700">${femaleCount}</strong></span>
              </div>
            </div>
            <div class="card-footer py-2.5 flex justify-between bg-slate-50">
              <button class="btn btn-outline btn-sm" onclick="window.AppClasses.viewClassRoster('${c.id}')">
                ${icons.users || ''} View Roster
              </button>
              <button class="btn btn-secondary btn-sm" onclick="window.AppClasses.manageClassSubjects('${c.id}')">
                ${icons.bookOpen || ''} Manage Subjects
              </button>
            </div>
          </div>
        `;
      }).join("");
    }

    renderSubjectsList() {
      const tbody = document.getElementById("subjects-table-body");
      if (!tbody) return;

      const subjects = window.AppStore.getSubjects();
      tbody.innerHTML = subjects.map((s, idx) => `
        <tr class="hover:bg-slate-100/60 transition-colors">
          <td class="font-medium text-muted-foreground text-xs">${idx + 1}</td>
          <td><span class="badge badge-secondary font-mono text-xs">${s.code}</span></td>
          <td class="font-semibold text-foreground">${s.name}</td>
          <td><span class="badge ${s.category && s.category.includes('Senior') ? 'badge-senior' : (s.category && s.category.includes('Junior') ? 'badge-junior' : 'badge-outline')} text-xs">${s.category || 'Core'}</span></td>
          <td class="text-center text-xs font-mono">${s.maxCA || 30}</td>
          <td class="text-center text-xs font-mono">${s.maxExam || 70}</td>
          <td class="text-center font-bold text-xs text-primary-navy">${s.maxMarks || 100}</td>
        </tr>
      `).join("");
    }

    handleAddClass() {
      const nameInput = document.getElementById("new-class-name");
      const categorySelect = document.getElementById("new-class-category");
      const tutorInput = document.getElementById("new-class-tutor");
      const name = nameInput.value.trim().toUpperCase();
      const category = categorySelect ? categorySelect.value : "Junior Secondary";
      const tutor = tutorInput.value.trim();

      if (!name) {
        window.AppNotification.show("Please enter class name (e.g. SSS 1)", "danger");
        return;
      }

      window.AppStore.saveClass({
        id: name,
        name: name,
        category: category,
        tutor: tutor || "Class Tutor"
      });

      nameInput.value = "";
      tutorInput.value = "";
      window.AppNotification.show(`Class ${name} added successfully!`, "success");
      this.renderClassesList();
      window.AppStudents.populateClassDropdowns();
      if (window.AppScores) window.AppScores.populateDropdowns();
    }

    handleAddSubject() {
      const codeInput = document.getElementById("new-subject-code");
      const nameInput = document.getElementById("new-subject-name");
      const categorySelect = document.getElementById("new-subject-category");
      const code = codeInput.value.trim().toUpperCase();
      const name = nameInput.value.trim();
      const category = categorySelect ? categorySelect.value : "Core";

      if (!code || !name) {
        window.AppNotification.show("Please enter both Subject Code and Name", "danger");
        return;
      }

      window.AppStore.saveSubject({
        code: code,
        name: name,
        category: category,
        maxCA: 30,
        maxExam: 70,
        maxMarks: 100
      });

      codeInput.value = "";
      nameInput.value = "";
      window.AppNotification.show(`Subject ${name} (${code}) added successfully!`, "success");
      this.renderSubjectsList();
      if (window.AppScores) window.AppScores.populateDropdowns();
    }

    viewClassRoster(classId) {
      const students = window.AppStore.getStudents(classId);
      const modal = document.getElementById("class-roster-modal");
      const title = document.getElementById("class-roster-title");
      const body = document.getElementById("class-roster-body");
      const icons = window.AppIcons || {};

      if (title) title.innerHTML = `${icons.users || ''} Student Roster for ${classId}`;
      if (body) {
        if (students.length === 0) {
          body.innerHTML = `<p class="text-muted-foreground py-6 text-center text-sm">No students currently assigned to ${classId}.</p>`;
        } else {
          body.innerHTML = `
            <div class="table-container">
              <table class="table">
                <thead>
                  <tr>
                    <th>Adm No</th>
                    <th>Full Name</th>
                    <th>Sex</th>
                    <th>Subjects Taken</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  ${students.map(s => `
                    <tr class="hover:bg-slate-100/60 transition-colors">
                      <td class="font-mono text-xs font-semibold text-navy-900">${s.admNo}</td>
                      <td class="font-medium text-foreground">${s.nameOfApplicant}</td>
                      <td><span class="badge ${s.sex === 'F' ? 'badge-female' : 'badge-male'} text-xs">${s.sex === 'F' ? 'Female' : 'Male'}</span></td>
                      <td><span class="badge badge-secondary text-xs font-mono">${(s.enrolledSubjects || []).length} Subjects</span></td>
                      <td>
                        <button class="btn btn-outline btn-sm" onclick="window.AppClasses.openStudentSubjectsModal('${s.id}')">
                          ${icons.edit || ''} Configure Subjects
                        </button>
                      </td>
                    </tr>
                  `).join("")}
                </tbody>
              </table>
            </div>
          `;
        }
      }

      if (modal) modal.classList.add("active");
    }

    manageClassSubjects(classId) {
      const subjects = window.AppStore.getSubjects();
      const modal = document.getElementById("class-subjects-modal");
      const title = document.getElementById("class-subjects-title");
      const form = document.getElementById("class-subjects-checkboxes");
      const icons = window.AppIcons || {};

      if (title) title.innerHTML = `${icons.bookOpen || ''} Assign Core Subjects to all ${classId} Students`;
      if (form) {
        form.innerHTML = subjects.map(s => `
          <label class="flex items-center gap-2 p-2.5 border rounded-md hover:bg-slate-50 cursor-pointer text-sm">
            <input type="checkbox" name="class_subj" value="${s.code}" checked class="h-4 w-4 text-primary-navy">
            <div>
              <span class="font-semibold text-foreground">${s.name} (${s.code})</span>
              <span class="badge ${s.category && s.category.includes('Senior') ? 'badge-senior' : (s.category && s.category.includes('Junior') ? 'badge-junior' : 'badge-secondary')} text-xs ml-1.5">${s.category || 'Core'}</span>
            </div>
          </label>
        `).join("");
      }

      const saveBtn = document.getElementById("btn-save-class-subjects");
      if (saveBtn) {
        saveBtn.onclick = () => {
          const checked = Array.from(document.querySelectorAll('input[name="class_subj"]:checked')).map(el => el.value);
          const students = window.AppStore.getStudents(classId);
          students.forEach(st => {
            st.enrolledSubjects = checked;
            window.AppStore.saveStudent(st);
          });
          window.AppNotification.show(`Updated subjects for ${students.length} students in ${classId}.`, "success");
          if (modal) modal.classList.remove("active");
        };
      }

      if (modal) modal.classList.add("active");
    }

    openStudentSubjectsModal(studentId) {
      const student = window.AppStore.getStudentById(studentId);
      if (!student) return;

      this.selectedStudentIdForSubjects = studentId;
      const subjects = window.AppStore.getSubjects();
      const modal = document.getElementById("student-subjects-modal");
      const title = document.getElementById("student-subjects-modal-title");
      const container = document.getElementById("student-subjects-checkboxes");
      const icons = window.AppIcons || {};

      if (title) title.innerHTML = `${icons.bookOpen || ''} Enrolled Subjects for ${student.nameOfApplicant}`;
      const enrolled = student.enrolledSubjects || subjects.map(s => s.code);

      if (container) {
        container.innerHTML = subjects.map(s => {
          const isChecked = enrolled.includes(s.code);
          return `
            <label class="flex items-center gap-2 p-2.5 border rounded-md hover:bg-slate-50 cursor-pointer text-sm">
              <input type="checkbox" name="student_subj" value="${s.code}" ${isChecked ? 'checked' : ''} class="h-4 w-4 text-primary-navy">
              <div>
                <span class="font-semibold text-foreground">${s.name} (${s.code})</span>
                <span class="badge ${s.category && s.category.includes('Senior') ? 'badge-senior' : (s.category && s.category.includes('Junior') ? 'badge-junior' : 'badge-secondary')} text-xs ml-1.5">${s.category || 'Core'}</span>
              </div>
            </label>
          `;
        }).join("");
      }

      const saveBtn = document.getElementById("btn-save-student-subjects");
      if (saveBtn) {
        saveBtn.onclick = () => {
          const checked = Array.from(document.querySelectorAll('input[name="student_subj"]:checked')).map(el => el.value);
          student.enrolledSubjects = checked;
          window.AppStore.saveStudent(student);
          window.AppNotification.show(`Updated subjects for ${student.nameOfApplicant}.`, "success");
          if (modal) modal.classList.remove("active");
          this.viewClassRoster(student.classId);
        };
      }

      if (modal) modal.classList.add("active");
    }
  }

  window.AppClasses = new ClassesModule();
})();
