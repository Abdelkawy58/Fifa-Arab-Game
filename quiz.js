// عناصر الصفحة
const startBtn = document.getElementById("start-btn");
const quizBox = document.getElementById("quiz-box");
const questionContainer = document.getElementById("question-container");
const answersContainer = document.getElementById("answers-container");
const timerElement = document.getElementById("timer");
const resultBox = document.getElementById("result-box");
const startBox = document.getElementById("start-box");
const interludeBox = document.getElementById("interlude-box");
const testBtn = document.getElementById("test-btn");

const HAS_PLAYED_KEY1 = "fifa_arab_played_1";
const HAS_PLAYED_KEY2 = "fifa_arab_played_2";

// أسئلة المسابقات
const quiz1Questions = [
  { question: "من هو أكثر لاعب شارك في مباريات في تاريخ دوري أبطال أوروبا؟", options: ["ميسي", "رونالدو", "راموس", "بويول"], answer: "رونالدو" },
  { question: "ما النادي الأوروبي الذي لم يخسر أي مباراة على أرضه في دوري الأبطال لمدة 10 سنوات متتالية؟", options: ["ريال مدريد", "تشيلسي", "ليفربول", "بايرن ميونخ"], answer: "تشيلسي" },
  { question: "كم مرة فازت إيطاليا بكأس العالم؟", options: ["2", "3", "4", "5"], answer: "4" },
  { question: "كم دوري يمتلك نادي أرسنال؟", options: ["11", "12", "13", "14"], answer: "13" },
  { question: "من اللاعب الفائز بالكورة الذهبية عام 1968؟", options: ["جورج بست", "بوبي تشارلتون", "يوهان كرويف", "فلوريان ألبرت"], answer: "جورج بست" },
  { question: "في أي عام هبط نادي يوفنتوس للمرة الأولى في تاريخه؟", options: ["2002-2003", "2004-2005", "2006-2007", "2008-2009"], answer: "2006-2007" },
  { question: "من أي نادي انتقل اللاعب فالفيردي إلى ريال مدريد؟", options: ["بينارول", "ريال أوفييدو", "ليجانيس", "إيبار"], answer: "بينارول" },
  { question: "من هو أصغر لاعب سجل هدف في كأس العالم؟", options: ["امبابي", "انسو فاتي", "بيليه", "أوزيبيو"], answer: "بيليه" },
  { question: "الجنسية الثانية التي يمتلكها امبابي؟", options: ["كاميرون", "سنغال", "نيجيريا", "الرأس الأخضر"], answer: "كاميرون" },
  { question: "مركز ليفربول حاليا في الدوري الإنجليزي؟", options: ["2", "3", "4", "5"], answer: "4" }
];

const quiz2Questions = [
  { question: "كم مرة فاز رونالدو الظاهرة بالكرة الذهبية؟", options: ["1", "2", "3", "4"], answer: "2" },
  { question: "المدرب الذي قاد ريال مدريد لثلاثية دوري الأبطال المتتالية؟", options: ["زيدان", "انشيلوتي", "بيليغريني", "مورينيو"], answer: "زيدان" },
  { question: "من هو آخر بطل للدوري الإيطالي؟", options: ["انتر ميلان", "اسي ميلان", "نابولي", "يوفنتوس"], answer: "نابولي" },
  { question: "المركز السادس في الدوري السعودي حاليا؟", options: ["نيوم", "الخلود", "الخليج", "الاتحاد"], answer: "الخليج" }
];

let currentQuiz = 1;
let currentQuestion = 0;
let score = 0;
let timeLeft = 15;
let timerInterval;

// توليد كود الفوز
function generateWinnerCode(type) {
  const prefix = type === "P" ? "FA-P-" : "FA-S-";
  return prefix + Math.floor(10000 + Math.random() * 90000);
}

// عرض السؤال
function showQuestion() {
  const q = currentQuiz === 1 ? quiz1Questions[currentQuestion] : quiz2Questions[currentQuestion];
  questionContainer.textContent = q.question;
  answersContainer.innerHTML = "";

  q.options.forEach(opt => {
    const btn = document.createElement("button");
    btn.className = "answer-btn";
    btn.textContent = opt;
    btn.onclick = () => selectAnswer(btn, q.answer);
    answersContainer.appendChild(btn);
  });

  resetTimer();
  startTimer();
}

// اختيار الإجابة
function selectAnswer(btn, correct) {
  clearInterval(timerInterval);
  if (btn.textContent === correct) score++;
  nextQuestionOrFinish();
}

// الانتقال للسؤال التالي أو إنهاء المسابقة
function nextQuestionOrFinish() {
  currentQuestion++;
  const questions = currentQuiz === 1 ? quiz1Questions : quiz2Questions;
  if (currentQuestion < questions.length) {
    showQuestion();
  } else {
    finishQuiz();
  }
}

// المؤقت
function startTimer() {
  timeLeft = 15;
  timerElement.textContent = timeLeft;
  timerInterval = setInterval(() => {
    timeLeft--;
    timerElement.textContent = timeLeft;
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      // انتهاء الوقت بدون إجابة → تنتهي المسابقة فورًا
      finishQuiz();
    }
  }, 1000);
}

function resetTimer() {
  clearInterval(timerInterval);
  timeLeft = 15;
  timerElement.textContent = timeLeft;
}

// نهاية المسابقة
function finishQuiz() {
  clearInterval(timerInterval);
  quizBox.classList.add("hidden");
  resultBox.classList.add("hidden");
  const questions = currentQuiz === 1 ? quiz1Questions : quiz2Questions;
  const playedKey = currentQuiz === 1 ? HAS_PLAYED_KEY1 : HAS_PLAYED_KEY2;

  if (score === questions.length) {
    // فوز كامل
    const code = generateWinnerCode(currentQuiz === 1 ? "P" : "S");
    resultBox.classList.remove("hidden");
    resultBox.innerHTML = `
      <h2>🎉 مبروك الفوز يا بطل!</h2>
      <p>جاوبت صح على كل الأسئلة 👑</p>
      <p>كود الفوز الخاص بك:</p>
      <div style="color:#FFD700;font-size:20px;font-weight:bold;margin-top:5px">${code}</div>
      <p>1️⃣ احتفظ بالكود لتسليم جائزتك(سكرين شوت)</p>
      <p>2️⃣ تأكد من متابعة حسابات المتجر على تويتر وانستجرام و قناه الواتساب.</p>
      <p>3️⃣ ادخل على رابط المتجر وسجل بياناتك.👇</p>
       <a href="https://fifa-arab.com" target="_blank" class="store-btn">🏪 الدخول للمتجر</a>
    `;
    localStorage.setItem(playedKey, "1");
  } else {
    if (currentQuiz === 1) {
      // خسر المسابقة الأولى → عرض interlude للمسابقة الثانية
      interludeBox.classList.remove("hidden");
      interludeBox.innerHTML = ` <h2> وقت المسابقة انتهي </h2>
        <h2>روق يا بطل! 😎</h2>
        <p>جاوبت ${score} من ${questions.length} إجابات صح.</p>
        <p>مع متجر فيفا عرب دايمًا كسبان 💪</p>
        <p>الحين عندك فرصة ثانية للمشاركة في المسابقة التالية:</p>
        <p>عدد الأسئلة: 4 | الجائزة: 50 ألف كوينز 💰</p>
        <button id="continue-btn">ابدأ الأن 🔹</button>
      `;
      const newContinueBtn = document.getElementById("continue-btn");
      newContinueBtn.addEventListener("click", () => {
        interludeBox.classList.add("hidden");
        currentQuiz = 2;
        currentQuestion = 0;
        score = 0;
        quizBox.classList.remove("hidden");
        showQuestion();
      });
      localStorage.setItem(playedKey, "1");
    } else {
      // المسابقة الثانية → النتيجة النهائية
      resultBox.classList.remove("hidden");
      resultBox.innerHTML = ` <h2> وقت المسابقة انتهي </h2>
                              <h2>حظ أوفر المرة القادمة😅</h2>
                             <h2>عروض و مسابقات دايما في متجرنا</h2>
                             <p>أجبت ${score} من ${questions.length} إجابات صحيحة.</p>`;
      localStorage.setItem(playedKey, "1");
    }
  }
}

// بدء المسابقة
startBtn.addEventListener("click", () => {
  if (localStorage.getItem(HAS_PLAYED_KEY1)) {
    alert("لقد شاركت بالفعل في المسابقة! لا يمكن اللعب مرة ثانية.");
    return;
  }
  currentQuiz = 1;
  currentQuestion = 0;
  score = 0;
  startBox.classList.add("hidden");
  quizBox.classList.remove("hidden");
  showQuestion();
});



// زر تجربة المسابقة (يتجاهل localStorage)
testBtn.addEventListener("click", () => {
  startBox.classList.add("hidden");
  interludeBox.classList.add("hidden");
  quizBox.classList.remove("hidden");
  currentQuiz = 1;
  currentQuestion = 0;
  score = 0;
  showQuestion();
}); 

