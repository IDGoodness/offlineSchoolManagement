/**
 * ANGLICAN MODEL COLLEGE (AMCO) - STUDENT MANAGEMENT MODULE
 * Handles Student Registration Form (Page 1 Entrance Form) and Student Directory
 * Redesigned with Shadcn UI, Vibrant Badges & React Icons
 */

(function () {
  class StudentsModule {
    constructor() {
      this.editingStudentId = null;
    }

    init() {
      this.bindFormEvents();
      this.bindDirectoryEvents();
      this.renderDirectory();
      this.populateClassDropdowns();
    }

    populateClassDropdowns() {
      const classes = window.AppStore.getClasses();
      const regSelect = document.getElementById("reg-class-select");
      const filterSelect = document.getElementById("filter-class-select");

      if (regSelect) {
        regSelect.innerHTML = classes
          .map(c => `<option value="${c.id}">${c.name} (${c.category})</option>`)
          .join("");
      }

      if (filterSelect) {
        filterSelect.innerHTML = `<option value="ALL">All Classes (Junior & Senior)</option>` +
          classes.map(c => `<option value="${c.id}">${c.name} (${c.category})</option>`).join("");
      }
    }

    bindFormEvents() {
      const form = document.getElementById("student-registration-form");
      if (!form) return;

      // Auto-compute Entrance Exam Average
      const mathInput = document.getElementById("reg-entrance-math");
      const engInput = document.getElementById("reg-entrance-eng");
      const genInput = document.getElementById("reg-entrance-gen");
      const avgInput = document.getElementById("reg-entrance-avg");

      const updateAvg = () => {
        const m = parseFloat(mathInput?.value) || 0;
        const e = parseFloat(engInput?.value) || 0;
        const g = parseFloat(genInput?.value) || 0;
        const count = [mathInput?.value, engInput?.value, genInput?.value].filter(v => v !== "").length || 1;
        const avg = ((m + e + g) / count).toFixed(1);
        if (avgInput) avgInput.value = avg;

        // Auto suggest Remark
        const remarkSelect = document.getElementById("reg-entrance-remark");
        if (remarkSelect && avg >= 50) {
          remarkSelect.value = "Admission GRANTED";
        }
      };

      [mathInput, engInput, genInput].forEach(inp => {
        if (inp) inp.addEventListener("input", updateAvg);
      });

      // Submit Form
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        this.saveStudentFromForm();
      });

      // Cancel Edit Button
      const cancelEditBtn = document.getElementById("btn-cancel-edit");
      if (cancelEditBtn) {
        cancelEditBtn.addEventListener("click", () => {
          this.cancelEdit();
        });
      }

      // Initial ID generation
      this.generateNextIds();
    }

    cancelEdit() {
      this.editingStudentId = null;
      const form = document.getElementById("student-registration-form");
      if (form) form.reset();
      const title = document.getElementById("form-action-title");
      if (title) title.textContent = "New Student Registration";
      const indicator = document.getElementById("reg-edit-indicator");
      if (indicator) indicator.classList.add("hidden");
      this.generateNextIds();
      window.AppNotification.show("Edit cancelled. Form ready for new student registration.", "info");
    }

    generateNextIds() {
      if (this.editingStudentId) return;
      const students = window.AppStore.getStudents();
      const lastFormNo = students.reduce((max, s) => {
        const num = parseInt(s.formNo, 10);
        return !isNaN(num) && num > max ? num : max;
      }, 140);
      const lastAdmNo = students.reduce((max, s) => {
        const num = parseInt(s.admNo, 10);
        return !isNaN(num) && num > max ? num : max;
      }, 2515);

      const formNoField = document.getElementById("reg-form-no");
      const admNoField = document.getElementById("reg-adm-no");

      if (formNoField && !formNoField.value) {
        formNoField.value = "0" + (lastFormNo + 1);
      }
      if (admNoField && !admNoField.value) {
        admNoField.value = (lastAdmNo + 1).toString();
      }
    }

    saveStudentFromForm() {
      const getVal = (id) => {
        const el = document.getElementById(id);
        return el ? el.value.trim() : "";
      };

      const nameOfApplicant = getVal("reg-name-applicant");
      if (!nameOfApplicant) {
        window.AppNotification.show("Please enter applicant name (Surname First)", "danger");
        return;
      }

      const formNo = getVal("reg-form-no") || "0143";
      const admNo = getVal("reg-adm-no") || "2516";
      const classId = getVal("reg-class-select") || "SSS 1";

      const existingStudent = this.editingStudentId ? window.AppStore.getStudentById(this.editingStudentId) : null;

      // Select default enrolled subjects based on junior vs senior
      let defaultSubjects = window.AppStore.getSubjects().map(s => s.code);
      if (classId.startsWith("SSS")) {
        defaultSubjects = ["MTH", "ENG", "PHY", "CHM", "BIO", "GEO", "ECO", "AGR", "YOR", "CMP", "CIV", "ANH"];
      } else {
        defaultSubjects = ["MTH", "ENG", "BSC", "BTE", "SST", "CIV", "AGR", "BUS", "CMP", "YOR", "CCA", "PHE"];
      }

      const studentData = {
        id: this.editingStudentId || ("std_" + Date.now()),
        formNo: formNo,
        admNo: admNo,
        classId: classId,
        rollNo: existingStudent ? existingStudent.rollNo : Math.floor(Math.random() * 40) + 1,
        nameOfApplicant: nameOfApplicant.toUpperCase(),
        sex: getVal("reg-sex"),
        religion: getVal("reg-religion"),
        denomination: getVal("reg-denomination"),
        dateOfBirth: getVal("reg-dob"),
        nationality: getVal("reg-nationality") || "Nigerian",
        stateOfOrigin: getVal("reg-state-origin"),
        lga: getVal("reg-lga"),
        homeTown: getVal("reg-home-town"),
        nameOfPresentSchool: getVal("reg-present-school"),
        presentClass: getVal("reg-present-class") || "Primary 6",
        nameOfParent: getVal("reg-name-parent"),
        addressOfParent: getVal("reg-address-parent"),
        occupationOfFather: getVal("reg-occ-father"),
        occupationOfMother: getVal("reg-occ-mother"),
        responsibleForFees: getVal("reg-responsible-fees"),
        hasDisability: getVal("reg-has-disability"),
        disabilityDetails: getVal("reg-disability-details"),
        isAllergic: getVal("reg-is-allergic"),
        allergyDetails: getVal("reg-allergy-details"),
        emergencyContact: getVal("reg-emergency-contact"),
        gsmNo: getVal("reg-gsm-no"),
        entranceExam: {
          mathematics: parseFloat(getVal("reg-entrance-math")) || 0,
          english: parseFloat(getVal("reg-entrance-eng")) || 0,
          general: parseFloat(getVal("reg-entrance-gen")) || 0,
          average: parseFloat(getVal("reg-entrance-avg")) || 0,
          interview: getVal("reg-entrance-interview"),
          remark: getVal("reg-entrance-remark")
        },
        enrolledSubjects: existingStudent ? existingStudent.enrolledSubjects : defaultSubjects,
        scores: existingStudent ? existingStudent.scores : {},
        attendance: existingStudent ? existingStudent.attendance : { timesOpened: 120, timesPresent: 115, timesAbsent: 5 },
        affectiveDomain: existingStudent ? existingStudent.affectiveDomain : {
          punctuality: 4, neatness: 4, attentiveness: 4, relationshipWithOthers: 4, politeness: 4, responsiveness: 4, commitment: 4, consistency: 4
        },
        psychomotorDomain: existingStudent ? existingStudent.psychomotorDomain : {
          craftsDrawingPainting: 4, technicalSkills: 4, ictSkills: 4, gardeningFarmingSkills: 4, gamesSports: 4, creativityInitiative: 4, verbalFluency: 4
        },
        tutorComment: existingStudent ? existingStudent.tutorComment : "Satisfactory conduct and attitude to learning.",
        tutorName: existingStudent ? existingStudent.tutorName : "Class Tutor",
        principalComment: existingStudent ? existingStudent.principalComment : "Good progress. Keep it up.",
        promotionStatus: existingStudent ? existingStudent.promotionStatus : "PROMOTED"
      };

      window.AppStore.saveStudent(studentData);
      window.AppNotification.show(
        this.editingStudentId ? `Student ${studentData.nameOfApplicant} updated successfully!` : `Student ${studentData.nameOfApplicant} registered successfully!`,
        "success"
      );

      // Reset form
      this.editingStudentId = null;
      document.getElementById("student-registration-form").reset();
      document.getElementById("form-action-title").textContent = "New Student Registration";
      const indicator = document.getElementById("reg-edit-indicator");
      if (indicator) indicator.classList.add("hidden");
      this.generateNextIds();
      this.renderDirectory();
    }

    bindDirectoryEvents() {
      const searchInput = document.getElementById("search-students-input");
      const classFilter = document.getElementById("filter-class-select");
      const genderFilter = document.getElementById("filter-gender-select");

      const filterHandler = () => {
        this.renderDirectory();
      };

      if (searchInput) searchInput.addEventListener("input", filterHandler);
      if (classFilter) classFilter.addEventListener("change", filterHandler);
      if (genderFilter) genderFilter.addEventListener("change", filterHandler);
    }

    renderDirectory() {
      const tableBody = document.getElementById("students-table-body");
      const countBadge = document.getElementById("student-count-badge");
      if (!tableBody) return;

      const search = (document.getElementById("search-students-input")?.value || "").toLowerCase().trim();
      const classFilter = document.getElementById("filter-class-select")?.value || "ALL";
      const genderFilter = document.getElementById("filter-gender-select")?.value || "ALL";

      let students = window.AppStore.getStudents();

      // Filter by class
      if (classFilter !== "ALL") {
        students = students.filter(s => s.classId === classFilter);
      }

      // Filter by gender
      if (genderFilter !== "ALL") {
        students = students.filter(s => s.sex === genderFilter);
      }

      // Filter by search query
      if (search) {
        students = students.filter(s =>
          (s.nameOfApplicant && s.nameOfApplicant.toLowerCase().includes(search)) ||
          (s.admNo && s.admNo.toLowerCase().includes(search)) ||
          (s.formNo && s.formNo.toLowerCase().includes(search)) ||
          (s.gsmNo && s.gsmNo.includes(search))
        );
      }

      if (countBadge) {
        countBadge.textContent = `${students.length} Student${students.length === 1 ? '' : 's'}`;
      }

      this.updateDashboardStats();

      if (students.length === 0) {
        tableBody.innerHTML = `
          <tr>
            <td colspan="7" class="text-center py-8 text-muted-foreground">
              No students found matching current filters.
            </td>
          </tr>
        `;
        return;
      }

      const isAdmin = window.AppAuth ? window.AppAuth.isAdmin() : true;
      const icons = window.AppIcons || {};

      tableBody.innerHTML = students.map((s, idx) => {
        const isGranted = s.entranceExam && s.entranceExam.remark.includes("GRANTED");
        const isSenior = s.classId && s.classId.startsWith("SSS");
        return `
          <tr class="hover:bg-slate-100/60 transition-colors">
            <td class="font-mono text-xs font-bold text-navy-900">${s.admNo || "-"}</td>
            <td>
              <span class="badge badge-secondary font-mono text-xs">${s.formNo || "-"}</span>
            </td>
            <td>
              <div class="font-bold text-foreground text-sm">${s.nameOfApplicant}</div>
              <div class="text-xs text-muted-foreground">${s.stateOfOrigin || "Oyo"} State • ${s.lga || ""}</div>
            </td>
            <td>
              <span class="badge ${s.sex === 'F' ? 'badge-female' : 'badge-male'} text-xs">
                ${s.sex === 'F' ? 'Female' : 'Male'}
              </span>
            </td>
            <td>
              <span class="badge ${isSenior ? 'badge-senior' : 'badge-junior'} text-xs">
                ${s.classId || "SSS 1"}
              </span>
            </td>
            <td>
              <span class="badge ${isGranted ? 'badge-success' : 'badge-danger'} text-xs">
                ${isGranted ? (icons.check || '✓') : (icons.x || '✕')} ${s.entranceExam ? s.entranceExam.remark : 'GRANTED'}
              </span>
            </td>
            <td class="text-right">
              <div class="inline-flex gap-1.5">
                <button class="btn btn-outline btn-sm" onclick="window.AppStudents.viewCandidateSlip('${s.id}')" title="Candidate Slip">
                  ${icons.fileText || ''} Slip
                </button>
                <button class="btn btn-primary btn-sm" onclick="window.AppReportCard.generate('${s.id}')" title="View Report Card">
                  ${icons.award || ''} Report Card
                </button>
                ${isAdmin ? `
                  <button class="btn btn-secondary btn-sm" onclick="window.AppStudents.editStudent('${s.id}')" title="Edit Student">
                    ${icons.edit || ''} Edit
                  </button>
                  <button class="btn btn-danger btn-sm" onclick="window.AppStudents.confirmDelete('${s.id}', '${s.nameOfApplicant.replace(/'/g, "\\'")}')" title="Delete Student">
                    ${icons.trash || ''} Del
                  </button>
                ` : ''}
              </div>
            </td>
          </tr>
        `;
      }).join("");
    }

    updateDashboardStats() {
      const allStudents = window.AppStore.getStudents();
      const juniorCount = allStudents.filter(s => s.classId && s.classId.startsWith("JSS")).length;
      const seniorCount = allStudents.filter(s => s.classId && s.classId.startsWith("SSS")).length;
      const subjects = window.AppStore.getSubjects();

      const elTotal = document.getElementById("stat-total-students");
      const elJunior = document.getElementById("stat-junior-students");
      const elSenior = document.getElementById("stat-senior-students");
      const elSubjects = document.getElementById("stat-total-subjects");

      if (elTotal) elTotal.textContent = allStudents.length;
      if (elJunior) elJunior.textContent = juniorCount;
      if (elSenior) elSenior.textContent = seniorCount;
      if (elSubjects) elSubjects.textContent = subjects.length;
    }

    editStudent(id) {
      const student = window.AppStore.getStudentById(id);
      if (!student) return;

      this.editingStudentId = student.id;

      if (window.AppNavigation) {
        window.AppNavigation.switchTab("tab-registration");
      }

      document.getElementById("form-action-title").textContent = `Editing: ${student.nameOfApplicant} (Adm: ${student.admNo})`;
      const indicator = document.getElementById("reg-edit-indicator");
      if (indicator) indicator.classList.remove("hidden");

      const setVal = (elmId, val) => {
        const el = document.getElementById(elmId);
        if (el) el.value = val !== undefined && val !== null ? val : "";
      };

      setVal("reg-form-no", student.formNo);
      setVal("reg-adm-no", student.admNo);
      setVal("reg-class-select", student.classId);
      setVal("reg-name-applicant", student.nameOfApplicant);
      setVal("reg-sex", student.sex);
      setVal("reg-religion", student.religion);
      setVal("reg-denomination", student.denomination);
      setVal("reg-dob", student.dateOfBirth);
      setVal("reg-nationality", student.nationality);
      setVal("reg-state-origin", student.stateOfOrigin);
      setVal("reg-lga", student.lga);
      setVal("reg-home-town", student.homeTown);
      setVal("reg-present-school", student.nameOfPresentSchool);
      setVal("reg-present-class", student.presentClass);
      setVal("reg-name-parent", student.nameOfParent);
      setVal("reg-address-parent", student.addressOfParent);
      setVal("reg-occ-father", student.occupationOfFather);
      setVal("reg-occ-mother", student.occupationOfMother);
      setVal("reg-responsible-fees", student.responsibleForFees);
      setVal("reg-has-disability", student.hasDisability);
      setVal("reg-disability-details", student.disabilityDetails);
      setVal("reg-is-allergic", student.isAllergic);
      setVal("reg-allergy-details", student.allergyDetails);
      setVal("reg-emergency-contact", student.emergencyContact);
      setVal("reg-gsm-no", student.gsmNo);

      if (student.entranceExam) {
        setVal("reg-entrance-math", student.entranceExam.mathematics);
        setVal("reg-entrance-eng", student.entranceExam.english);
        setVal("reg-entrance-gen", student.entranceExam.general);
        setVal("reg-entrance-avg", student.entranceExam.average);
        setVal("reg-entrance-interview", student.entranceExam.interview);
        setVal("reg-entrance-remark", student.entranceExam.remark);
      }

      window.AppNotification.show(`Loaded ${student.nameOfApplicant} into form for editing.`, "info");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    confirmDelete(id, name) {
      if (confirm(`Are you sure you want to delete student "${name}"? This action cannot be undone.`)) {
        window.AppStore.deleteStudent(id);
        window.AppNotification.show(`Student ${name} deleted successfully.`, "info");
        this.renderDirectory();
      }
    }

    viewCandidateSlip(studentId) {
      const student = window.AppStore.getStudentById(studentId);
      if (!student) return;

      const school = window.AppStore.getSchoolInfo();
      const modalBody = document.getElementById("candidate-slip-modal-content");
      if (!modalBody) return;

      modalBody.innerHTML = `
        <div class="report-sheet-border p-5 bg-white" style="font-family: var(--font-serif); border: 2px solid #000;">
          <!-- Slip Header -->
          <div class="text-center border-b pb-2 mb-3">
            <h2 class="text-xl font-bold tracking-wider" style="color: #000;">${school.name}</h2>
            <p class="text-xs font-semibold">${school.box}</p>
            <div class="my-2 inline-block bg-slate-900 text-white font-bold text-xs uppercase px-4 py-1 tracking-wider rounded">
              CANDIDATE EXAMINATION SLIP / IDENTITY SLIP
            </div>
            <div class="flex justify-between items-center text-xs font-bold mt-1 px-2">
              <span>APPLICATION FORM NO: <u>${student.formNo || '0135'}</u></span>
              <span>EXAM SESSION: <u>${school.currentSession}</u></span>
            </div>
          </div>

          <!-- Applicant Particulars -->
          <div class="text-xs space-y-2 leading-relaxed">
            <div class="border-b pb-1">
              <strong>1. Name Of Applicant (surname First):</strong>
              <span class="text-sm font-bold uppercase ml-2">${student.nameOfApplicant}</span>
            </div>
            <div class="grid grid-cols-2 gap-2 border-b pb-1">
              <div><strong>2. Sex:</strong> ${student.sex === 'F' ? 'Female' : 'Male'}</div>
              <div><strong>Date Of Birth:</strong> ${student.dateOfBirth || 'N/A'}</div>
            </div>
            <div class="grid grid-cols-2 gap-2 border-b pb-1">
              <div><strong>3. State Of Origin:</strong> ${student.stateOfOrigin || 'Oyo'}</div>
              <div><strong>L.G.A.:</strong> ${student.lga || 'Ogbomoso'}</div>
            </div>
            <div class="border-b pb-1">
              <strong>4. Name Of Present School:</strong> ${student.nameOfPresentSchool || 'N/A'}
            </div>
            <div class="grid grid-cols-2 gap-2 border-b pb-1">
              <div><strong>5. Assigned Class:</strong> <span class="font-bold text-navy-900">${student.classId}</span></div>
              <div><strong>Admission No:</strong> <span class="font-bold">${student.admNo}</span></div>
            </div>
            <div class="border-b pb-1">
              <strong>6. Parent / Guardian GSM No:</strong> ${student.gsmNo || 'N/A'}
            </div>
          </div>

          <!-- Official Performance Box -->
          <div class="mt-3 p-2 border border-slate-400 bg-slate-50 text-xs">
            <div class="font-bold uppercase text-center border-b pb-1 mb-1">Entrance Examination Scores & Admission Status</div>
            <div class="grid grid-cols-4 gap-1 text-center font-semibold">
              <div class="p-1 border bg-white">Mathematics: ${student.entranceExam?.mathematics || '-'}</div>
              <div class="p-1 border bg-white">English: ${student.entranceExam?.english || '-'}</div>
              <div class="p-1 border bg-white">General: ${student.entranceExam?.general || '-'}</div>
              <div class="p-1 border bg-white font-bold text-emerald-700">Average: ${student.entranceExam?.average || '-'}%</div>
            </div>
            <div class="mt-2 flex justify-between items-center font-bold px-1">
              <span>Decision: <u class="text-emerald-800">${student.entranceExam?.remark || 'Admission GRANTED'}</u></span>
              <span>Candidate Signature: __________________</span>
            </div>
          </div>

          <div class="mt-3 text-center text-xs font-bold uppercase tracking-wide text-slate-700">
            PLEASE BRING THIS FORM WHILE COMING FOR THE ENTRANCE EXAMINATION
          </div>
        </div>
      `;

      // Open Modal
      const modal = document.getElementById("candidate-slip-modal");
      if (modal) {
        modal.classList.add("active");
        modal.classList.add("print-active-modal");
      }
    }
  }

  window.AppStudents = new StudentsModule();
})();
