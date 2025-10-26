/* quiz.js - نهائي
   - رسالة داخلية بدل alert
   - زر "تجربة" يفتح محاولة عرضية فقط (trial) ولا يسجل PLAYED_KEY
   - زر "ابدأ التحدي" يبدأ اللعب الحقيقي ويسجل PLAYED_KEY بعد النهاية
   - انتهاء الوقت لأي سؤال => تنتهي المسابقة فورًا
   - تحميل الأسئلة من questions.json (يدعم array أو { questions: [...] })
*/

//// عناصر الواجهة ////
const startBtn = document.getElementById("start-btn");
const quizBox = document.getElementById("quiz-box");
const questionContainer = document.getElementById("question-container");
const answersContainer = document.getElementById("answers-container");
const timerElement = document.getElementById("timer");
const resultBox = document.getElementById("result-box");
const startBox = document.getElementById("start-box");
const testBtn = document.getElementById("test-btn");

//// إعدادات ////
const PLAYED_KEY = "fifa_arab_played_single_v1";
const PLAYER_ID_KEY = "fifa_player_id";
const PRIZE_AMOUNT = 200000;
const CODE_PREFIX = "FA-";

//// حالة ////
let questions = [];
let questionsLoaded = false;
let currentQuestion = 0;
let score = 0;
let timeLeft = 15;
let timerInterval = null;
let isTrial = false; // true لو فتحنا عبر زر "تجربة" (لا يسجّل المشاركة)

//// دالة إظهار رسالة داخل الصفحة بدل alert ////
function showMessage(type, text, persist = false) {
  // type: "error" | "info" | "success"
  const existing = document.querySelector(".msg-box");
  if (existing) existing.remove();

  const msgBox = document.createElement("div");
  msgBox.className = "msg-box";
  // ستايل سريع مضمّن حتى يشتغل من غير تعديل CSS خارجي
  msgBox.style.position = "fixed";
  msgBox.style.top = "20px";
  msgBox.style.left = "50%";
  msgBox.style.transform = "translateX(-50%)";
  msgBox.style.zIndex = 9999;
  msgBox.style.padding = "12px 16px";
  msgBox.style.borderRadius = "10px";
  msgBox.style.boxShadow = "0 6px 18px rgba(0,0,0,0.25)";
  msgBox.style.fontFamily = "Cairo, sans-serif";
  msgBox.style.fontSize = "15px";
  msgBox.style.color = "#071017";
  msgBox.style.maxWidth = "90%";
  msgBox.style.textAlign = "center";

  if (type === "error") {
    msgBox.style.background = "#ffdddd";
    msgBox.style.border = "1px solid #ff9b9b";
  } else if (type === "success") {
    msgBox.style.background = "#ddffdd";
    msgBox.style.border = "1px solid #9bff9b";
  } else {
    msgBox.style.background = "#e6f7ff";
    msgBox.style.border = "1px solid #bfefff";
  }

  msgBox.textContent = text;
  document.body.appendChild(msgBox);

  if (!persist) {
    setTimeout(() => {
      msgBox.style.transition = "opacity 300ms";
      msgBox.style.opacity = "0";
      setTimeout(() => msgBox.remove(), 320);
    }, 4500);
  }
}

//// توليد معرف لاعب ////
function ensurePlayerId() {
  let pid = localStorage.getItem(PLAYER_ID_KEY);
  if (!pid) {
    pid = "p-" + Math.random().toString(36).slice(2, 12);
    try { localStorage.setItem(PLAYER_ID_KEY, pid); } catch (e) {}
  }
  return pid;
}

//// توليد كود الفوز ////
function generateWinnerCode() {
  return CODE_PREFIX + Math.floor(10000 + Math.random() * 90000);
}

//// تحميل الأسئلة (يدعم array أو { questions: [...] }) ////
async function loadQuestions() {
  questionsLoaded = false;
  try {
    const res = await fetch("questions.json", { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (Array.isArray(data)) {
      questions = data;
    } else if (data && Array.isArray(data.questions)) {
      questions = data.questions;
    } else {
      throw new Error("الشكل غير صحيح لملف الأسئلة");
    }
    if (questions.length === 0) throw new Error("قائمة الأسئلة فارغة");
    questionsLoaded = true;
  } catch (err) {
    console.error("خطأ تحميل الأسئلة:", err);
    // عرض رسالة داخل الواجهة (بدل alert) — بدون زر إعادة محاولة
    showMessage("error", "نعتذر! حدث خطأ أثناء تحميل الأسئلة. حاول لاحقًا.", true);
  }
}

//// عرض السؤال ////
function showQuestion() {
  if (!questionsLoaded || !questions || questions.length === 0) {
    showMessage("error", "نعتذر! الأسئلة غير متاحة الآن.", true);
    return;
  }

  const q = questions[currentQuestion];
  questionContainer.textContent = `${currentQuestion + 1}. ${q.question}`;
  answersContainer.innerHTML = "";

  q.options.forEach((opt) => {
    const btn = document.createElement("button");
    btn.className = "answer-btn";
    btn.textContent = opt;
    btn.style.cursor = "pointer";
    btn.addEventListener("click", () => {
      // تعطيل الأزرار فور النقر لمنع تكرار الضغط
      answersContainer.querySelectorAll(".answer-btn").forEach(b => b.disabled = true);
      selectAnswer(btn, q.answer);
    });
    answersContainer.appendChild(btn);
  });

  resetTimer();
  startTimer();
}

//// اختيار الإجابة ////
function selectAnswer(btn, correct) {
  clearInterval(timerInterval);
  if (btn.textContent === correct) score++;

  if (currentQuestion < questions.length - 1) {
    currentQuestion++;
    setTimeout(showQuestion, 300);
  } else {
    setTimeout(finishQuiz, 300);
  }
}

//// المؤقت: انتهاء الوقت => نهاية المسابقة فورًا ////
function startTimer() {
  timeLeft = 15;
  timerElement.textContent = timeLeft;
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timeLeft--;
    timerElement.textContent = timeLeft;
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      // انتهاء الوقت بدون إجابة => نهاية المسابقة
      finishQuiz();
    }
  }, 1000);
}
function resetTimer() {
  clearInterval(timerInterval);
  timeLeft = 15;
  timerElement.textContent = timeLeft;
}

//// نهاية المسابقة ////
function finishQuiz() {
  clearInterval(timerInterval);
  quizBox.classList.add("hidden");
  resultBox.classList.remove("hidden");

  const total = questions.length;
  ensurePlayerId();

  if (score === total) {
    // فاز
    const code = generateWinnerCode();
    resultBox.innerHTML = `
      <h2>🎉 مبروك الفوز يا بطل!</h2>
      <p>جاوبت صح على كل الأسئلة 👑</p>
      <p>الجائزة: ${PRIZE_AMOUNT.toLocaleString("en-US")} كوينز</p>
      <p>كود الفوز الخاص بك:</p>
      <div style="color:#FFD700;font-size:20px;font-weight:bold;margin-top:5px">${code}</div>
      <p>1️⃣ احتفظ بالكود لتسليم جائزتك (سكرين شوت)</p>
      <p>2️⃣ تابع حسابات المتجر على تويتر وإنستجرام وقناة الواتساب.</p>
      <p>3️⃣ ادخل على رابط المتجر وسجل بياناتك.👇</p>
      <a href="https://fifa-arab.com" target="_blank" class="store-btn">🏪 الدخول للمتجر</a>
    `;
  } else {
    resultBox.innerHTML = `
      <h2>حظ أوفر المرة القادمة</h2>
      <h2>روق يا بطل! 😎</h2>
      <p>أجبت ${score} من ${total} إجابات صحيحة.</p>
      <p>مع متجر فيفا عرب دايمًا كسبان انتظر المسابقة القادمة 💪</p>
    `;
  }

  // فقط في حالة اللعب الحقيقي نسجل أن اللاعب شارك (localStorage)
  if (!isTrial) {
    try { localStorage.setItem(PLAYED_KEY, "1"); }
    catch (e) { console.warn("تعذر حفظ حالة اللعب:", e); }
  } else {
    // كانت تجربة عرضية → لا نسجل PLAYED_KEY
    showMessage("info", "كانت هذه محاولة تجريبية — اضغط 'ابدأ التحدي' للعب الحقيقي.");
  }
  // إعادة الحالة الافتراضية للتجربة
  isTrial = false;
}

//// بدء المسابقة الحقيقية ////
startBtn.addEventListener("click", () => {
  // لو سبق للمستخدم اللعب بالفعل على هذا المتصفح
  if (localStorage.getItem(PLAYED_KEY)) {
    showMessage("error", "لقد شاركت بالفعل في المسابقة! لا يمكن اللعب مرة ثانية.", true);
    return;
  }

  // تأكد أن الأسئلة محملة
  if (!questionsLoaded || !questions || questions.length === 0) {
    showMessage("error", "نعتذر! لم يتم تحميل الأسئلة بنجاح. حاول لاحقًا.", true);
    return;
  }

  // إذا كان المستخدم حاليًا في وضع تجربة، نوقف المحاكاة ونبدأ حقيقي جديد
  isTrial = false;
  currentQuestion = 0;
  score = 0;
  startBox.classList.add("hidden");
  resultBox.classList.add("hidden");
  quizBox.classList.remove("hidden");
  showQuestion();
});

//// زر تجربة — يفتح محاولة عرضية فقط (لا يضع PLAYED_KEY) ////
if (testBtn) {
  testBtn.addEventListener("click", () => {
    // جرب بدون تسجيل المشاركة الحقيقية
    isTrial = true;
    currentQuestion = 0;
    score = 0;
    // لا نخفي startBox حتى تقدر تضغط Start بعد التجربة لو حبيت
    resultBox.classList.add("hidden");
    quizBox.classList.remove("hidden");
    showQuestion();
    showMessage("info", "هذا وضع تجريبي — اضغط 'ابدأ التحدي' لبدء اللعب الحقيقي.", false);
  });
}

//// تحميل الأسئلة عند فتح الصفحة ////
document.addEventListener("DOMContentLoaded", () => {
  resultBox.classList.add("hidden");
  // نحمّل الأسئلة لكن لا نعرض تنبيه لو فشل هنا — التنبيه سيظهر عند محاولات البدء
  loadQuestions();
});
