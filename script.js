// ---------- Safe DOM getter ----------
function $(id){
  const el = document.getElementById(id);
  if(!el){
    const dbg = document.getElementById("debugText");
    if(dbg) dbg.textContent = `หา element ไม่เจอ: #${id} (เช็ค id ใน index.html ให้ตรง)`;
  }
  return el;
}

// ✅ อ้างอิงชื่อไฟล์รูปของเอต้า (อยู่โฟลเดอร์เดียวกับ index.html)
const EX = [
  { name:"Jumping Jack", img:"umping-jack.jpg", tags:["fit"], impact:"high", phase:"วอร์มอัพ", tip:"ลงเท้านิ่ม ๆ ไม่กระแทก" },
  { name:"March in Place", img:"march.png", tags:["fresh","fit"], impact:"low", phase:"วอร์มอัพ", tip:"หลังตรง ยกเข่าเบา ๆ" },
  { name:"Arm Circle", img:"arm-circle.jpg", tags:["fresh"], impact:"low", phase:"วอร์มอัพ", tip:"หมุนแขนช้า ๆ ไม่ฝืนไหล่" },

  { name:"Squat", img:"squat.webp", tags:["strength","fit"], impact:"low", phase:"ทำท่า", tip:"เข่าชี้ไปทางเดียวกับปลายเท้า" },
  { name:"Lunge", img:"lunge.jpg", tags:["strength"], impact:"low", phase:"ทำท่า", tip:"ก้าวยาวพอดี หลังตรง" },
  { name:"Push-up", img:"pushup.jpg", tags:["strength"], impact:"low", phase:"ทำท่า", tip:"ลำตัวตรง ไม่แอ่นหลัง" },
  { name:"Plank", img:"plank.jpg", tags:["strength","fit"], impact:"low", phase:"ทำท่า", tip:"ศอกใต้ไหล่ เกร็งท้อง" },
  { name:"Mountain Climber", img:"mountain-climber.png", tags:["fit"], impact:"high", phase:"ทำท่า", tip:"สลับเข่าเร็วพอดี คุมไหล่" },
  { name:"High Knees", img:"high-knees.jpg", tags:["fit"], impact:"high", phase:"ทำท่า", tip:"ยกเข่าเท่าที่ไหว ลงเท้านิ่ม ๆ" },
  { name:"Step Touch", img:"step-touch.jpg", tags:["fit","fresh"], impact:"low", phase:"ทำท่า", tip:"ก้าวซ้าย-ขวา ต่อเนื่อง" },
  { name:"Glute Bridge", img:"glute-bridge.jpg", tags:["strength","fresh"], impact:"low", phase:"ทำท่า", tip:"บีบก้นตอนยกสะโพกขึ้น" },

  { name:"Stretch", img:"stretch.jpg", tags:["fresh","fit","strength"], impact:"low", phase:"คูลดาวน์", tip:"ยืดเบา ๆ ไม่เด้ง" },
  { name:"Breathing", img:"breathing.jpg", tags:["fresh","fit","strength"], impact:"low", phase:"คูลดาวน์", tip:"หายใจเข้าลึก 4 วิ ออก 4 วิ" },
];

const REST_SEG = {
  name: "Rest",
  img: "stretch.jpg",
  tags: [],
  impact: "low",
  phase: "พัก",
  tip: "หายใจลึก ๆ / จิบน้ำ",
};

let routine = [];
let idx = 0;
let timer = null;
let remain = 0;
let total = 0;

function shuffle(arr){ return [...arr].sort(() => Math.random() - 0.5); }
function pad(n){ return String(n).padStart(2,"0"); }
function fmt(sec){
  const m = Math.floor(sec/60);
  const s = sec % 60;
  return `${pad(m)}:${pad(s)}`;
}

function setControls(enabled){
  $("startBtn").disabled = !enabled;
  $("pauseBtn").disabled = true;
  $("nextBtn").disabled = !enabled;
  $("resetBtn").disabled = !enabled;
}

function stopTimer(){
  if(timer){
    clearInterval(timer);
    timer = null;
  }
  $("startBtn").disabled = false;
  $("pauseBtn").disabled = true;
}

function renderPlan(){
  const box = $("planBox");
  if(!box) return;

  if(!routine.length){
    box.textContent = "ยังไม่มีโปรแกรม";
    return;
  }

  box.innerHTML = routine.map((s, i) => `
    <div class="item">
      <span class="badge">${s.phase}</span>
      <b>${i+1}. ${s.name}</b> — ${s.seconds}s
      <div class="note">${s.tip || ""}</div>
      <div class="note" style="font-size:12px;opacity:.7;">ไฟล์รูป: ${s.img}</div>
    </div>
  `).join("");
}

function setSegment(i){
  idx = i;
  const s = routine[idx];

  total = remain = s.seconds;

  $("phaseText").textContent = s.phase;
  $("exerciseName").textContent = s.name;
  $("tipText").textContent = "ทิป: " + (s.tip || "-");
  $("stepText").textContent = `${idx+1}/${routine.length}`;

  const imgEl = $("exerciseImg");
  if(imgEl){
    imgEl.onerror = () => {
      $("statusText").textContent = `รูปไม่ขึ้น: หาไฟล์ไม่เจอ → ${s.img}`;
      imgEl.onerror = null;
      imgEl.src = "stretch.jpg";
    };
    imgEl.src = s.img;
    imgEl.alt = s.name;
  }

  $("timeText").textContent = fmt(remain);
  $("bar").style.width = "0%";
}

function tick(){
  remain--;
  $("timeText").textContent = fmt(remain);
  $("bar").style.width = `${Math.min(100, ((total-remain)/total)*100)}%`;

  if(remain <= 0){
    if(idx < routine.length - 1){
      setSegment(idx + 1);
    } else {
      stopTimer();
      $("phaseText").textContent = "เสร็จแล้ว 🎉";
      $("exerciseName").textContent = "เก่งมาก!";
      $("tipText").textContent = "วันนี้ทำครบแล้ว พักผ่อนด้วยน้า";
      $("bar").style.width = "100%";
    }
  }
}

function startTimer(){
  if(!routine.length) return;
  if(timer) return;

  $("startBtn").disabled = true;
  $("pauseBtn").disabled = false;
  timer = setInterval(tick, 1000);
}

// ----- Wire events safely -----
(function init(){
  const randomBtn = $("randomBtn");
  const clearBtn = $("clearBtn");

  if(!randomBtn || !clearBtn){
    // debugText จะขึ้นให้เอง
    return;
  }

  randomBtn.addEventListener("click", () => {
    if(timer) stopTimer();

    const totalMin = Number($("totalMin").value);
    const workSec = Number($("workSec").value);
    const restSec = Number($("restSec").value);
    const goal = $("goal").value;
    const noJump = $("noJump").checked;
    const mixAll = $("mixAll").checked;

    const totalSeconds = totalMin * 60;

    let warmups = EX.filter(x => x.phase === "วอร์มอัพ");
    let cooldowns = EX.filter(x => x.phase === "คูลดาวน์");
    let mains = EX.filter(x => x.phase === "ทำท่า");

    if(noJump){
      warmups = warmups.filter(x => x.impact !== "high");
      mains = mains.filter(x => x.impact !== "high");
    }

    let goalMains = mains.filter(x => x.tags.includes(goal));
    if(goalMains.length < 3) goalMains = mains;

    const mainPool = mixAll ? mains : goalMains;

    const warm = shuffle(warmups)[0];
    const cool = shuffle(cooldowns)[0];

    if(!warm || !cool || mainPool.length === 0){
      $("statusText").textContent = "ท่าไม่พอ (ลองปิด low impact หรือเปลี่ยน goal)";
      return;
    }

    const seg = [];
    const warmSec = Math.min(60, workSec + 10);
    const coolSec = Math.min(60, workSec + 10);

    seg.push({ ...warm, seconds: warmSec });

    let used = warmSec;
    let guard = 0;

    while(used + workSec + coolSec <= totalSeconds && guard < 900){
      guard++;
      let pick = shuffle(mainPool)[0];
      if(seg.length && pick.name === seg[seg.length-1].name){
        pick = shuffle(mainPool)[1] || pick;
      }
      seg.push({ ...pick, seconds: workSec });
      used += workSec;

      if(restSec > 0 && used + restSec + coolSec <= totalSeconds){
        seg.push({ ...REST_SEG, seconds: restSec });
        used += restSec;
      }
    }

    seg.push({ ...cool, seconds: coolSec });
    used += coolSec;

    routine = seg;

    $("statusText").textContent =
      `สร้างแล้ว: ${routine.length} ช่วง | รวมประมาณ ${Math.round(used/60)} นาที | goal=${goal}${noJump ? " | low impact" : ""}`;

    renderPlan();         // ✅ ตรงนี้แสดงแน่นอน
    setSegment(0);
    setControls(true);
  });

  clearBtn.addEventListener("click", () => {
    if(timer) stopTimer();
    routine = [];
    idx = 0;

    $("statusText").textContent = "ล้างแล้ว";
    renderPlan();

    $("phaseText").textContent = "ยังไม่เริ่ม";
    $("exerciseName").textContent = "—";
    $("tipText").textContent = "ทิปจะขึ้นตรงนี้";
    $("stepText").textContent = "0/0";
    $("exerciseImg").src = "";
    $("timeText").textContent = "00:00";
    $("bar").style.width = "0%";

    setControls(false);
  });

  $("startBtn").addEventListener("click", startTimer);
  $("pauseBtn").addEventListener("click", stopTimer);

  $("nextBtn").addEventListener("click", () => {
    if(!routine.length) return;
    stopTimer();
    if(idx < routine.length - 1) setSegment(idx + 1);
  });

  $("resetBtn").addEventListener("click", () => {
    if(!routine.length) return;
    stopTimer();
    setSegment(0);
  });

  setControls(false);
  renderPlan();
})();