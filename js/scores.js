/**
 * ANGLICAN MODEL COLLEGE (AMCO) - RESULTS & DOMAIN ASSESSMENT MODULE
 * Results entry for Teachers with strict validation & Form Tutor assessments
 */

(function () {
  class ScoresModule {
    constructor() {
      this.selectedClassId = "SSS 1";
      this.selectedSubjectCode = "MTH";
      this.selectedTerm = "THIRD";
    }

    init() {
      const classes = window.AppStore.getClasses();
      if (classes.length > 0 && !classes.some(c => c.id === this.selectedClassId)) {
        this.selectedClassId = classes[0].id;
      }
      this.bindEvents();
      this.populateDropdowns();
      this.renderScoreEntryTable();
      this.populateDomainStudentDropdown();
    }

    populateDropdowns() {
      const classes = window.AppStore.getClasses();
      const subjects = window.AppStore.getSubjects();

      const classSelect = document.getElementById("score-class-select");
      const subjSelect = document.getElementById("score-subject-select");
      const domainClassSelect = document.getElementById("domain-class-select");

      if (classSelect) {
        classSelect.innerHTML = classes.map(c => `<option value="${c.id}">${c.name} (${c.category})</option>`).join("");
        classSelect.value = this.selectedClassId;
      }

      if (subjSelect) {
        subjSelect.innerHTML = subjects.map(s => `<option value="${s.code}">${s.name} (${s.code}) - ${s.category || ''}</option>`).join("");
        subjSelect.value = this.selectedSubjectCode;
      }

      if (domainClassSelect) {
        domainClassSelect.innerHTML = classes.map(c => `<option value="${c.id}">${c.name}</option>`).join("");
        domainClassSelect.value = this.selectedClassId;
      }
    }

    bindEvents() {
      const classSelect = document.getElementById("score-class-select");
      const subjSelect = document.getElementById("score-subject-select");
      const termSelect = document.getElementById("score-term-select");

      const refresh = () => {
        if (classSelect) this.selectedClassId = classSelect.value;
        if (subjSelect) this.selectedSubjectCode = subjSelect.value;
        if (termSelect) this.selectedTerm = termSelect.value;
        this.renderScoreEntryTable();
      };

      if (classSelect) classSelect.addEventListener("change", refresh);
      if (subjSelect) subjSelect.addEventListener("change", refresh);
      if (termSelect) termSelect.addEventListener("change", refresh);

      // Save button
      const saveBtn = document.getElementById("btn-save-all-scores");
      if (saveBtn) {
        saveBtn.addEventListener("click", () => this.saveScoresWithValidation());
      }

      // Fill Sample Scores button for testers
      const fillBtn = document.getElementById("btn-auto-fill-scores");
      if (fillBtn) {
        fillBtn.addEventListener("click", () => this.autoFillSampleScores());
      }

      // Domain Student selection
      const domainClassSelect = document.getElementById("domain-class-select");
      if (domainClassSelect) {
        domainClassSelect.addEventListener("change", () => {
          this.populateDomainStudentDropdown();
        });
      }

      const domainStudentSelect = document.getElementById("domain-student-select");
      if (domainStudentSelect) {
        domainStudentSelect.addEventListener("change", () => {
          this.loadStudentDomainData();
        });
      }

      // Save Domain Assessments
      const saveDomainBtn = document.getElementById("btn-save-domain-assessment");
      if (saveDomainBtn) {
        saveDomainBtn.addEventListener("click", () => this.saveDomainAssessment());
      }
    }

    renderScoreEntryTable() {
      const tbody = document.getElementById("scores-entry-tbody");
      const subjectHeader = document.getElementById("score-entry-subject-title");
      if (!tbody) return;

      const subjects = window.AppStore.getSubjects();
      const currentSubject = subjects.find(s => s.code === this.selectedSubjectCode) || subjects[0];
      const maxCA = currentSubject ? currentSubject.maxCA : 30;
      const maxExam = currentSubject ? currentSubject.maxExam : 70;

      if (subjectHeader) {
        subjectHeader.textContent = `Entering Scores: ${currentSubject ? currentSubject.name : ''} (${this.selectedSubjectCode}) — ${this.selectedClassId} (${this.selectedTerm} Term)`;
      }

      const allStudents = window.AppStore.getStudents(this.selectedClassId);
      // Filter students who take this subject
      const students = allStudents.filter(s =>
        !s.enrolledSubjects || s.enrolledSubjects.length === 0 || s.enrolledSubjects.includes(this.selectedSubjectCode)
      );

      if (students.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="11" class="text-center py-8 text-muted-foreground">
              No students enrolled in ${this.selectedClassId} for subject ${this.selectedSubjectCode}.
            </td>
          </tr>
        `;
        return;
      }

      tbody.innerHTML = students.map((s, idx) => {
        const scoreObj = (s.scores && s.scores[this.selectedSubjectCode]) || {};
        const ca = scoreObj.ca !== undefined ? scoreObj.ca : "";
        const exam = scoreObj.exam !== undefined ? scoreObj.exam : "";
        const termTotal = scoreObj.termTotal !== undefined ? scoreObj.termTotal : (ca !== "" && exam !== "" ? (parseFloat(ca) + parseFloat(exam)) : "");
        const term1 = scoreObj.term1Total !== undefined ? scoreObj.term1Total : 70;
        const term2 = scoreObj.term2Total !== undefined ? scoreObj.term2Total : 70;

        let avg = "-";
        if (termTotal !== "") {
          avg = ((parseFloat(term1) + parseFloat(term2) + parseFloat(termTotal)) / 3).toFixed(1);
        }

        const gradeInfo = termTotal !== "" ? window.AppStore.computeGradeAndRemark(termTotal) : { grade: "-", remark: "-" };

        return `
          <tr data-student-id="${s.id}" class="hover:bg-muted/50 transition-colors">
            <td class="font-medium text-foreground">${idx + 1}</td>
            <td class="font-mono text-xs text-muted-foreground">${s.admNo}</td>
            <td>
              <div class="font-semibold text-foreground">${s.nameOfApplicant}</div>
              <div class="text-xs text-muted-foreground">${s.sex === 'F' ? 'Female' : 'Male'}</div>
            </td>
            <td class="text-center">
              <input type="number" class="score-input score-term1 w-16 h-8 text-center border rounded-md bg-muted/40 font-mono text-xs" value="${term1}" min="0" max="100">
            </td>
            <td class="text-center">
              <input type="number" class="score-input score-term2 w-16 h-8 text-center border rounded-md bg-muted/40 font-mono text-xs" value="${term2}" min="0" max="100">
            </td>
            <td class="text-center">
              <input type="number"
                     class="score-input score-ca h-8 w-20 text-center border rounded-md font-semibold text-xs"
                     value="${ca}"
                     min="0"
                     max="${maxCA}"
                     step="0.5"
                     placeholder="0-${maxCA}"
                     data-max="${maxCA}"
                     oninput="window.AppScores.handleScoreInput(this)">
            </td>
            <td class="text-center">
              <input type="number"
                     class="score-input score-exam h-8 w-20 text-center border rounded-md font-semibold text-xs"
                     value="${exam}"
                     min="0"
                     max="${maxExam}"
                     step="0.5"
                     placeholder="0-${maxExam}"
                     data-max="${maxExam}"
                     oninput="window.AppScores.handleScoreInput(this)">
            </td>
            <td class="text-center font-bold text-foreground score-total">
              ${termTotal !== "" ? termTotal : "-"}
            </td>
            <td class="text-center font-medium text-muted-foreground score-avg">
              ${avg}
            </td>
            <td class="text-center">
              <span class="badge ${gradeInfo.grade === 'A' ? 'badge-primary' : (gradeInfo.grade === 'F' ? 'badge-destructive' : 'badge-secondary')} score-grade">
                ${gradeInfo.grade}
              </span>
            </td>
            <td class="text-center text-xs font-medium text-muted-foreground score-remark">
              ${gradeInfo.remark}
            </td>
          </tr>
        `;
      }).join("");
    }

    handleScoreInput(inputEl) {
      const row = inputEl.closest("tr");
      if (!row) return;

      const caInput = row.querySelector(".score-ca");
      const examInput = row.querySelector(".score-exam");
      const term1Input = row.querySelector(".score-term1");
      const term2Input = row.querySelector(".score-term2");

      const totalEl = row.querySelector(".score-total");
      const avgEl = row.querySelector(".score-avg");
      const gradeEl = row.querySelector(".score-grade");
      const remarkEl = row.querySelector(".score-remark");

      const max = parseFloat(inputEl.getAttribute("data-max")) || 100;
      const val = parseFloat(inputEl.value);

      // Validate range
      if (inputEl.value !== "" && (isNaN(val) || val < 0 || val > max)) {
        inputEl.classList.add("invalid-score");
      } else {
        inputEl.classList.remove("invalid-score");
      }

      const caVal = parseFloat(caInput.value);
      const examVal = parseFloat(examInput.value);
      const t1Val = parseFloat(term1Input?.value) || 0;
      const t2Val = parseFloat(term2Input?.value) || 0;

      if (!isNaN(caVal) && !isNaN(examVal) && caVal >= 0 && examVal >= 0 && caVal <= 30 && examVal <= 70) {
        const total = (caVal + examVal).toFixed(1);
        totalEl.textContent = total;
        const avg = ((t1Val + t2Val + parseFloat(total)) / 3).toFixed(1);
        avgEl.textContent = avg;

        const gradeInfo = window.AppStore.computeGradeAndRemark(total);
        gradeEl.textContent = gradeInfo.grade;
        gradeEl.className = `badge ${gradeInfo.grade === 'A' ? 'badge-primary' : (gradeInfo.grade === 'F' ? 'badge-destructive' : 'badge-secondary')} score-grade`;
        remarkEl.textContent = gradeInfo.remark;
      } else {
        totalEl.textContent = "-";
        avgEl.textContent = "-";
        gradeEl.textContent = "-";
        remarkEl.textContent = "-";
      }
    }

    saveScoresWithValidation() {
      const tbody = document.getElementById("scores-entry-tbody");
      if (!tbody) return;

      const rows = tbody.querySelectorAll("tr[data-student-id]");
      if (rows.length === 0) {
        window.AppNotification.show("No student rows to save.", "warning");
        return;
      }

      let hasRangeErrors = false;
      let blankCount = 0;
      const updates = [];

      rows.forEach(row => {
        const studentId = row.getAttribute("data-student-id");
        const caInput = row.querySelector(".score-ca");
        const examInput = row.querySelector(".score-exam");
        const term1Input = row.querySelector(".score-term1");
        const term2Input = row.querySelector(".score-term2");

        const caStr = caInput.value.trim();
        const examStr = examInput.value.trim();

        if (caStr === "" || examStr === "") {
          blankCount++;
          caInput.classList.add("input-error");
          examInput.classList.add("input-error");
        } else {
          caInput.classList.remove("input-error");
          examInput.classList.remove("input-error");

          const ca = parseFloat(caStr);
          const exam = parseFloat(examStr);
          const t1 = parseFloat(term1Input?.value) || 0;
          const t2 = parseFloat(term2Input?.value) || 0;

          if (ca < 0 || ca > 30 || exam < 0 || exam > 70) {
            hasRangeErrors = true;
          } else {
            updates.push({
              studentId,
              ca,
              exam,
              termTotal: parseFloat((ca + exam).toFixed(1)),
              term1Total: t1,
              term2Total: t2
            });
          }
        }
      });

      if (hasRangeErrors) {
        window.AppNotification.show("Error: Some scores exceed the maximum allowable marks (CA max 30, Exam max 70). Please correct the highlighted errors.", "danger");
        return;
      }

      if (blankCount > 0) {
        const proceed = confirm(`Notice: ${blankCount} student(s) have incomplete or blank score entries. Do you wish to save the completed entries anyway?`);
        if (!proceed) return;
      }

      // Persist to store
      updates.forEach(u => {
        const student = window.AppStore.getStudentById(u.studentId);
        if (student) {
          if (!student.scores) student.scores = {};
          student.scores[this.selectedSubjectCode] = {
            ca: u.ca,
            exam: u.exam,
            termTotal: u.termTotal,
            term1Total: u.term1Total,
            term2Total: u.term2Total
          };
          window.AppStore.saveStudent(student);
        }
      });

      window.AppNotification.show(`Successfully saved ${updates.length} student scores for ${this.selectedSubjectCode}!`, "success");
      this.renderScoreEntryTable();
    }

    autoFillSampleScores() {
      const tbody = document.getElementById("scores-entry-tbody");
      if (!tbody) return;

      const rows = tbody.querySelectorAll("tr[data-student-id]");
      rows.forEach(row => {
        const caInput = row.querySelector(".score-ca");
        const examInput = row.querySelector(".score-exam");

        if (caInput && examInput) {
          const sampleCA = Math.floor(Math.random() * 8) + 22; // 22 to 29
          const sampleExam = Math.floor(Math.random() * 25) + 45; // 45 to 69
          caInput.value = sampleCA;
          examInput.value = sampleExam;
          this.handleScoreInput(caInput);
        }
      });

      window.AppNotification.show("Auto-filled realistic scores. Click 'Save All Scores' to commit.", "info");
    }

    // --- Form Tutor Non-Cognitive Domain Assessment ---
    populateDomainStudentDropdown() {
      const classSelect = document.getElementById("domain-class-select");
      const studentSelect = document.getElementById("domain-student-select");
      if (!classSelect || !studentSelect) return;

      const students = window.AppStore.getStudents(classSelect.value);
      studentSelect.innerHTML = students.map(s => `
        <option value="${s.id}">${s.nameOfApplicant} (${s.admNo})</option>
      `).join("");

      this.loadStudentDomainData();
    }

    loadStudentDomainData() {
      const studentSelect = document.getElementById("domain-student-select");
      if (!studentSelect) return;

      const studentId = studentSelect.value;
      const student = window.AppStore.getStudentById(studentId);
      if (!student) return;

      const setVal = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.value = val !== undefined ? val : 4;
      };

      // Attendance
      const att = student.attendance || { timesOpened: 120, timesPresent: 115, timesAbsent: 5 };
      setVal("att-opened", att.timesOpened);
      setVal("att-present", att.timesPresent);
      setVal("att-absent", att.timesAbsent);

      // Affective Domain
      const aff = student.affectiveDomain || {};
      setVal("aff-punctuality", aff.punctuality || 4);
      setVal("aff-neatness", aff.neatness || 4);
      setVal("aff-attentiveness", aff.attentiveness || 4);
      setVal("aff-relationship", aff.relationshipWithOthers || 4);
      setVal("aff-politeness", aff.politeness || 4);
      setVal("aff-responsiveness", aff.responsiveness || 4);
      setVal("aff-commitment", aff.commitment || 4);
      setVal("aff-consistency", aff.consistency || 4);

      // Psychomotor Domain
      const psy = student.psychomotorDomain || {};
      setVal("psy-crafts", psy.craftsDrawingPainting || 4);
      setVal("psy-technical", psy.technicalSkills || 4);
      setVal("psy-ict", psy.ictSkills || 4);
      setVal("psy-gardening", psy.gardeningFarmingSkills || 4);
      setVal("psy-games", psy.gamesSports || 4);
      setVal("psy-creativity", psy.creativityInitiative || 4);
      setVal("psy-fluency", psy.verbalFluency || 4);

      // Comments
      const tutorCommentEl = document.getElementById("domain-tutor-comment");
      const principalCommentEl = document.getElementById("domain-principal-comment");
      const promotionStatusEl = document.getElementById("domain-promotion-status");

      if (tutorCommentEl) tutorCommentEl.value = student.tutorComment || "Satisfactory conduct and attitude to learning.";
      if (principalCommentEl) principalCommentEl.value = student.principalComment || "Good academic progress. Keep it up.";
      if (promotionStatusEl) promotionStatusEl.value = student.promotionStatus || "PROMOTED";
    }

    saveDomainAssessment() {
      const studentSelect = document.getElementById("domain-student-select");
      if (!studentSelect) return;

      const studentId = studentSelect.value;
      const student = window.AppStore.getStudentById(studentId);
      if (!student) return;

      const getVal = (id, def = 4) => {
        const el = document.getElementById(id);
        return el ? parseInt(el.value, 10) || def : def;
      };

      student.attendance = {
        timesOpened: getVal("att-opened", 120),
        timesPresent: getVal("att-present", 115),
        timesAbsent: getVal("att-absent", 5)
      };

      student.affectiveDomain = {
        punctuality: getVal("aff-punctuality"),
        neatness: getVal("aff-neatness"),
        attentiveness: getVal("aff-attentiveness"),
        relationshipWithOthers: getVal("aff-relationship"),
        politeness: getVal("aff-politeness"),
        responsiveness: getVal("aff-responsiveness"),
        commitment: getVal("aff-commitment"),
        consistency: getVal("aff-consistency")
      };

      student.psychomotorDomain = {
        craftsDrawingPainting: getVal("psy-crafts"),
        technicalSkills: getVal("psy-technical"),
        ictSkills: getVal("psy-ict"),
        gardeningFarmingSkills: getVal("psy-gardening"),
        gamesSports: getVal("psy-games"),
        creativityInitiative: getVal("psy-creativity"),
        verbalFluency: getVal("psy-fluency")
      };

      student.tutorComment = document.getElementById("domain-tutor-comment")?.value || "";
      student.principalComment = document.getElementById("domain-principal-comment")?.value || "";
      student.promotionStatus = document.getElementById("domain-promotion-status")?.value || "PROMOTED";

      window.AppStore.saveStudent(student);
      window.AppNotification.show(`Saved domain ratings and comments for ${student.nameOfApplicant}!`, "success");
    }
  }

  window.AppScores = new ScoresModule();
})();
