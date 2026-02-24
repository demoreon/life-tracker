// =============================================
// LIFE TRACKER 2026 — APP ENGINE
// =============================================

const APP = {
  currentMonth: new Date().getMonth(),
  currentYear: new Date().getFullYear(),
  viewDate: todayStr(),
  weekOffset: 0,
  todayMode: "category", // "category" or "time"
};

// ── HELPERS ──
function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function dateStr(d) {
  return d.toISOString().slice(0, 10);
}

function getDayName(d) {
  return d.toLocaleDateString("en-US", { weekday: "short" });
}

function getMonthName(m) {
  return [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ][m];
}

// Add greeting by time of day

function getFullDateStr(dateString) {
  const d = dateString ? new Date(dateString + "T12:00:00") : new Date();
  return d.toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

// Make name editable

function initName() {
  const saved = localStorage.getItem("ht_username");
  if (saved) CONFIG.name = saved;
  
  const el = document.getElementById("userName");
  el.textContent = CONFIG.name;
  el.style.cursor = "pointer";
  el.title = "Click to change your name";
  el.onclick = () => {
    const newName = prompt("Enter your name:", CONFIG.name);
    if (newName && newName.trim()) {
      CONFIG.name = newName.trim();
      localStorage.setItem("ht_username", CONFIG.name);
      el.textContent = CONFIG.name;
    }
  };
}

function getWeekStart(d) {
  const dt = new Date(d);
  const day = dt.getDay();
  const diff = day === 0 ? 6 : day - 1;
  dt.setDate(dt.getDate() - diff);
  return dt;
}

function isSameDay(a, b) {
  return dateStr(a) === dateStr(b);
}

function isFuture(d) {
  return dateStr(d) > todayStr();
}

function isPast(d) {
  return dateStr(d) < todayStr();
}

function isToday(d) {
  return dateStr(d) === todayStr();
}

function isSunday(d) {
  return d.getDay() === CONFIG.weeklyReviewDay;
}

// ── STORAGE ──
function getKey(habitIndex, date) {
  return `ht_${habitIndex}_${date}`;
}

function isChecked(habitIndex, date) {
  return localStorage.getItem(getKey(habitIndex, date)) === "1";
}

function toggleCheck(habitIndex, date) {
  const key = getKey(habitIndex, date);
  if (localStorage.getItem(key) === "1") {
    localStorage.removeItem(key);
  } else {
    localStorage.setItem(key, "1");
  }
}

// ── WHICH HABITS SHOW ON A DATE ──
function habitsForDate(date) {
  const d = new Date(date);
  const sunday = d.getDay() === CONFIG.weeklyReviewDay;
  return CONFIG.habits.filter((h, i) => {
    if (h.weekly && !sunday) return false;
    return true;
  }).map((h) => ({ ...h, _index: CONFIG.habits.indexOf(h) }));
}

function dailyHabits() {
  return CONFIG.habits.filter((h) => !h.weekly);
}

// ── STREAK CALC ──
function getStreak(habitIndex) {
  let streak = 0;
  const d = new Date();
  d.setDate(d.getDate() - 1);
  while (true) {
    const ds = dateStr(d);
    const h = CONFIG.habits[habitIndex];
    if (h.weekly && d.getDay() !== CONFIG.weeklyReviewDay) {
      d.setDate(d.getDate() - 1);
      continue;
    }
    if (isChecked(habitIndex, ds)) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else {
      break;
    }
    if (streak > 365) break;
  }
  if (isChecked(habitIndex, todayStr())) streak++;
  return streak;
}

function getStreakFrom(habitIndex, fromDate) {
  let streak = 1;
  const d = new Date(fromDate + "T12:00:00");
  d.setDate(d.getDate() - 1);
  const h = CONFIG.habits[habitIndex];
  while (true) {
    const ds = dateStr(d);
    if (h.weekly && d.getDay() !== CONFIG.weeklyReviewDay) {
      d.setDate(d.getDate() - 1);
      continue;
    }
    if (isChecked(habitIndex, ds)) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else {
      break;
    }
    if (streak > 365) break;
  }
  return streak;
}

// ── COMPLETION CALCS ──
function dayCompletion(date) {
  const habits = habitsForDate(date);
  if (habits.length === 0) return 0;
  const done = habits.filter((h) => isChecked(h._index, date)).length;
  return Math.round((done / habits.length) * 100);
}

function monthCompletion(year, month) {
  const days = new Date(year, month + 1, 0).getDate();
  let total = 0, done = 0;
  for (let i = 1; i <= days; i++) {
    const d = new Date(year, month, i);
    if (isFuture(d)) break;
    const habits = habitsForDate(dateStr(d));
    total += habits.length;
    done += habits.filter((h) => isChecked(h._index, dateStr(d))).length;
  }
  return total === 0 ? 0 : Math.round((done / total) * 100);
}

function yearCompletion(year) {
  let total = 0, done = 0;
  for (let m = 0; m < 12; m++) {
    const days = new Date(year, m + 1, 0).getDate();
    for (let i = 1; i <= days; i++) {
      const d = new Date(year, m, i);
      if (isFuture(d)) return total === 0 ? 0 : Math.round((done / total) * 100);
      const habits = habitsForDate(dateStr(d));
      total += habits.length;
      done += habits.filter((h) => isChecked(h._index, dateStr(d))).length;
    }
  }
  return total === 0 ? 0 : Math.round((done / total) * 100);
}

function categoryCompletion(catIndex) {
  const habits = CONFIG.habits
    .map((h, i) => ({ ...h, _index: i }))
    .filter((h) => h.cat === catIndex);
  let total = 0, done = 0;
  const today = new Date();
  const jan1 = new Date(CONFIG.year, 0, 1);
  const d = new Date(jan1);
  while (d <= today) {
    const ds = dateStr(d);
    habits.forEach((h) => {
      if (h.weekly && d.getDay() !== CONFIG.weeklyReviewDay) return;
      total++;
      if (isChecked(h._index, ds)) done++;
    });
    d.setDate(d.getDate() + 1);
  }
  return total === 0 ? 0 : Math.round((done / total) * 100);
}

function habitMonthlyPct(habitIndex, year, month) {
  const h = CONFIG.habits[habitIndex];
  const days = new Date(year, month + 1, 0).getDate();
  let total = 0, done = 0;
  for (let i = 1; i <= days; i++) {
    const d = new Date(year, month, i);
    if (isFuture(d)) break;
    if (h.weekly && d.getDay() !== CONFIG.weeklyReviewDay) continue;
    total++;
    if (isChecked(habitIndex, dateStr(d))) done++;
  }
  return total === 0 ? 0 : Math.round((done / total) * 100);
}

function habitWeeklyPcts(habitIndex, numWeeks) {
  const results = [];
  const today = new Date();
  for (let w = numWeeks - 1; w >= 0; w--) {
    const weekEnd = new Date(today);
    weekEnd.setDate(weekEnd.getDate() - w * 7);
    const weekStart = new Date(weekEnd);
    weekStart.setDate(weekStart.getDate() - 6);
    let total = 0, done = 0;
    const d = new Date(weekStart);
    while (d <= weekEnd) {
      if (!isFuture(d)) {
        const h = CONFIG.habits[habitIndex];
        if (!h.weekly || d.getDay() === CONFIG.weeklyReviewDay) {
          total++;
          if (isChecked(habitIndex, dateStr(d))) done++;
        }
      }
      d.setDate(d.getDate() + 1);
    }
    results.push(total === 0 ? 0 : Math.round((done / total) * 100));
  }
  return results;
}

function bestStreak() {
  let best = 0;
  CONFIG.habits.forEach((h, i) => {
    const s = getStreak(i);
    if (s > best) best = s;
  });
  return best;
}

// ── RING UPDATER ──
function updateRing(ringId, pctId, countId, msgId, date) {
  const habits = habitsForDate(date);
  const done = habits.filter((h) => isChecked(h._index, date)).length;
  const total = habits.length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  const offset = 251 - (251 * pct) / 100;

  document.getElementById(ringId).setAttribute("stroke-dashoffset", offset);
  document.getElementById(pctId).textContent = pct + "%";
  document.getElementById(countId).textContent = `${done} of ${total} done`;

  const msg = document.getElementById(msgId);
  if (pct === 100) msg.textContent = "🎉 Perfect day!";
  else if (pct >= 75) msg.textContent = "Almost there — keep going!";
  else if (pct >= 50) msg.textContent = "Solid progress. Push through!";
  else if (pct > 0) msg.textContent = "Good start. Build momentum!";
  else msg.textContent = "Let's get started!";
}

// Add date navigation functions

function changeViewDate(dir) {
  const d = new Date(APP.viewDate + "T12:00:00");
  d.setDate(d.getDate() + dir);
  APP.viewDate = dateStr(d);
  renderCombinedView();
}

function goToToday() {
  APP.viewDate = todayStr();
  renderCombinedView();
}

// =============================================
// RENDERERS
// =============================================

function renderCombinedView() {
  const date = APP.viewDate;
  const habits = habitsForDate(date);
  const isViewingToday = date === todayStr();
  const container = document.getElementById("todayList");
  container.innerHTML = "";

  // Update header
  document.getElementById("dateToday").textContent = getFullDateStr(date);
  document.getElementById("greetingText").textContent = getGreeting();
  
  // Show/hide today button
  document.getElementById("goTodayBtn").style.display = isViewingToday ? "none" : "inline-block";

  // Toggle button text
  document.getElementById("modeToggle").textContent = 
    APP.todayMode === "category" ? "📋 Switch to Time Blocks" : "☀️ Switch to Categories";

  if (APP.todayMode === "category") {
    // ── CATEGORY VIEW ──
    CONFIG.categories.forEach((cat, ci) => {
      const catHabits = habits.filter((h) => h.cat === ci);
      if (catHabits.length === 0) return;

      const label = document.createElement("div");
      label.className = "section-label";
      label.innerHTML = `<span class="dot" style="background:${cat.color}"></span> ${cat.icon} ${cat.name}`;
      container.appendChild(label);

      catHabits.forEach((h) => {
        container.appendChild(createHabitRow(h, date, false));
      });
    });
  } else {
    // ── TIME BLOCK VIEW ──
    CONFIG.timeBlocks.forEach((block, bi) => {
      const blockHabits = habits.filter((h) => h.time === bi);
      if (blockHabits.length === 0) return;

      const done = blockHabits.filter((h) => isChecked(h._index, date)).length;
      const total = blockHabits.length;
      const pct = Math.round((done / total) * 100);
      const color = pct === 100 ? "var(--green)" : pct >= 50 ? "var(--orange)" : "var(--accent)";

      const tb = document.createElement("div");
      tb.className = "time-block";
      tb.innerHTML = `
        <div class="time-block-header">
          <div class="time-block-icon">${block.icon}</div>
          <div class="time-block-info">
            <b>${block.name}</b>
            <small>${block.range}</small>
          </div>
          <div class="time-block-stat">${done}/${total}</div>
          <div class="time-block-bar">
            <div class="time-block-bar-fill" style="width:${pct}%;background:${color}"></div>
          </div>
        </div>
      `;

      blockHabits.forEach((h) => {
        tb.appendChild(createHabitRow(h, date, true));
      });

      container.appendChild(tb);
    });
  }

  updateRing("ring-today", "pct-today", "count-today", "msg-today", date);
}

function createHabitRow(h, date, showCat) {
  const cat = CONFIG.categories[h.cat];
  const checked = isChecked(h._index, date);
  const streak = isChecked(h._index, date) ? getStreakFrom(h._index, date) : 0;
  const row = document.createElement("div");
  row.className = "habit-row";
  if (showCat) row.style.borderLeftColor = cat.color;
  row.innerHTML = `
    <div class="habit-check ${checked ? "checked" : ""}">✓</div>
    <div class="habit-info">
      <div class="habit-name">${h.name}</div>
      ${showCat ? `<div class="habit-cat">${cat.icon} ${cat.name}</div>` : ""}
    </div>
    <div class="habit-est">${h.est}</div>
    <div class="habit-streak">${streak > 0 ? "🔥 " + streak : "—"}</div>
  `;
  row.onclick = () => {
    toggleCheck(h._index, date);
    renderCombinedView();
  };
  return row;
}

function toggleMode() {
  APP.todayMode = APP.todayMode === "category" ? "time" : "category";
  renderCombinedView();
}

// ── VIEW 3: WEEK ──
function renderWeek() {
  const today = new Date();
  const weekStart = getWeekStart(today);
  weekStart.setDate(weekStart.getDate() + APP.weekOffset * 7);
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    days.push(d);
  }

  const range = document.getElementById("weekRange");
  range.textContent = `${days[0].toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${days[6].toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;

  const daily = dailyHabits().map((h) => ({
    ...h,
    _index: CONFIG.habits.indexOf(h),
  }));

  const grid = document.getElementById("weekGrid");
  grid.innerHTML = "";
  grid.className = "week-grid";

  grid.innerHTML += `<div></div>`;
  days.forEach((d) => {
    const cls = isToday(d) ? "week-day-head is-today" : "week-day-head";
    const opacity = isFuture(d) ? "opacity:0.3" : isPast(d) ? "opacity:0.6" : "";
    grid.innerHTML += `<div class="${cls}" style="${opacity}">${getDayName(d)}<br><small>${d.getDate()}</small></div>`;
  });

  daily.forEach((h) => {
    const cat = CONFIG.categories[h.cat];
    grid.innerHTML += `<div class="week-label"><span class="dot" style="background:${cat.color}"></span> ${h.name}</div>`;
    days.forEach((d) => {
      const ds = dateStr(d);
      const checked = isChecked(h._index, ds);
      const fut = isFuture(d);
      const tod = isToday(d);
      let cls = "week-dot";
      if (checked) cls += " checked";
      if (fut) cls += " future";
      if (tod) cls += " is-today";
      grid.innerHTML += `<div class="week-cell${tod ? " is-today" : ""}"><div class="${cls}" data-h="${h._index}" data-d="${ds}"></div></div>`;
    });
  });

  grid.querySelectorAll(".week-dot:not(.future)").forEach((dot) => {
    dot.onclick = () => {
      toggleCheck(parseInt(dot.dataset.h), dot.dataset.d);
      renderWeek();
    };
  });

  let total = 0, done = 0;
  days.forEach((d) => {
    if (isFuture(d)) return;
    const ds = dateStr(d);
    const habits = habitsForDate(ds);
    total += habits.length;
    done += habits.filter((h) => isChecked(h._index, ds)).length;
  });
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  document.getElementById("weekPct").textContent = pct + "%";
  document.getElementById("weekBar").style.width = pct + "%";
}

function changeWeek(dir) {
  APP.weekOffset += dir;
  renderWeek();
}

function goToCurrentWeek() {
  APP.weekOffset = 0;
  renderWeek();
}
// ── VIEW 4: DASHBOARD ──
function renderDashboard() {
  document.getElementById("dYr").textContent = yearCompletion(CONFIG.year) + "%";
  document.getElementById("dMo").textContent = monthCompletion(CONFIG.year, new Date().getMonth()) + "%";
  document.getElementById("dSt").textContent = bestStreak();
  document.getElementById("dHab").textContent = CONFIG.habits.length;

  // Monthly bars
  const moChart = document.getElementById("moChart");
  moChart.innerHTML = "";
  moChart.className = "bar-chart";
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  months.forEach((m, i) => {
    const pct = monthCompletion(CONFIG.year, i);
    const future = i > new Date().getMonth();
    const color = future ? "#2a2a3a" : pct >= 80 ? "var(--green)" : "var(--accent)";
    moChart.innerHTML += `<div class="bar-col"><div class="bar-fill" style="height:${Math.max(pct, 2)}%;background:${color}"></div><span class="bar-label">${m}</span></div>`;
  });

  // Category bars
  const catBars = document.getElementById("catBars");
  catBars.innerHTML = "";
  CONFIG.categories.forEach((cat, i) => {
    const pct = categoryCompletion(i);
    catBars.innerHTML += `
      <div class="cat-row">
        <div class="cat-name">${cat.icon} ${cat.name}</div>
        <div class="cat-bar-bg"><div class="cat-bar-fill" style="width:${pct}%;background:${cat.color}"></div></div>
        <div class="cat-pct" style="color:${cat.color}">${pct}%</div>
      </div>`;
  });

  // Heatmap
  const heatmap = document.getElementById("heatmap");
  heatmap.innerHTML = "";
  const jan1 = new Date(CONFIG.year, 0, 1);
  const dec31 = new Date(CONFIG.year, 11, 31);
  const d = new Date(jan1);
  while (d <= dec31) {
    const ds = dateStr(d);
    const cell = document.createElement("div");
    cell.className = "heatmap-cell";
    if (!isFuture(d)) {
      const pct = dayCompletion(ds);
      if (pct > 0) {
        const lvl = pct >= 90 ? 5 : pct >= 70 ? 4 : pct >= 50 ? 3 : pct >= 25 ? 2 : 1;
        cell.classList.add("hm-" + lvl);
      }
    }
    cell.title = `${ds}: ${isFuture(d) ? "—" : dayCompletion(ds) + "%"}`;
    heatmap.appendChild(cell);
    d.setDate(d.getDate() + 1);
  }
}

// ── VIEW 5: MONTH ──
function renderMonth() {
  const year = APP.currentYear;
  const month = APP.currentMonth;
  const today = new Date();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const offset = firstDay === 0 ? 6 : firstDay - 1; // Monday start

  document.getElementById("moTitle").textContent = `${getMonthName(month)} ${year}`;
  document.getElementById("moPct").textContent = monthCompletion(year, month) + "%";

  const cal = document.getElementById("moCal");
  cal.innerHTML = "";

  ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].forEach((d) => {
    cal.innerHTML += `<div class="month-day-label">${d}</div>`;
  });

  for (let i = 0; i < offset; i++) {
    cal.innerHTML += `<div class="month-cell empty"></div>`;
  }

  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(year, month, i);
    const ds = dateStr(d);
    const fut = isFuture(d);
    const tod = isToday(d);
    const pct = fut ? 0 : dayCompletion(ds);
    let cls = "month-cell";
    if (tod) cls += " is-today";
    if (fut) cls += " future";
    if (!fut && pct > 0) {
      const lvl = pct >= 90 ? 5 : pct >= 70 ? 4 : pct >= 50 ? 3 : pct >= 25 ? 2 : 1;
      cls += ` ml-${lvl}`;
    }
    cal.innerHTML += `<div class="${cls}"><div>${i}</div><span class="cell-pct">${fut ? "—" : pct + "%"}</span></div>`;
  }
}

function chMo(dir) {
  APP.currentMonth += dir;
  if (APP.currentMonth > 11) { APP.currentMonth = 0; APP.currentYear++; }
  if (APP.currentMonth < 0) { APP.currentMonth = 11; APP.currentYear--; }
  renderMonth();
}

// ── VIEW 6: DRILL DOWN ──
function renderDrillDown() {
  const container = document.getElementById("drillList");
  container.innerHTML = "";

  CONFIG.categories.forEach((cat, ci) => {
    const catHabits = CONFIG.habits
      .map((h, i) => ({ ...h, _index: i }))
      .filter((h) => h.cat === ci);
    if (catHabits.length === 0) return;

    const catPct = categoryCompletion(ci);
    const dc = document.createElement("div");
    dc.className = "drill-cat";

    const header = document.createElement("div");
    header.className = "drill-header";
    header.innerHTML = `
      <span class="dot" style="background:${cat.color};width:12px;height:12px"></span>
      <div class="cat-label">${cat.icon} ${cat.name}</div>
      <div class="cat-total" style="color:${cat.color}">${catPct}%</div>
      <div class="arrow">▼</div>
    `;

    const body = document.createElement("div");
    body.className = "drill-body";

    catHabits.forEach((h) => {
      const row = document.createElement("div");
      row.className = "drill-row";

      // Monthly sparklines
      let sparks = "";
      let totalPct = 0;
      let monthsCounted = 0;
      let trend = "→";
      let lastTwo = [];

      for (let m = 0; m < 12; m++) {
        const pct = habitMonthlyPct(h._index, CONFIG.year, m);
        const fut = m > new Date().getMonth();
        const color = fut ? "#2a2a3a" : pct < 50 ? "var(--red)" : pct < 70 ? "var(--orange)" : cat.color;
        sparks += `<div class="drill-spark" style="height:${Math.max(fut ? 3 : pct, 3)}%;background:${color}"></div>`;
        if (!fut) {
          totalPct += pct;
          monthsCounted++;
          lastTwo.push(pct);
          if (lastTwo.length > 2) lastTwo.shift();
        }
      }

      const avg = monthsCounted === 0 ? 0 : Math.round(totalPct / monthsCounted);
      if (lastTwo.length === 2) {
        trend = lastTwo[1] > lastTwo[0] ? "📈" : lastTwo[1] < lastTwo[0] ? "📉" : "→";
      }

      const isWarn = avg < 50;
      const badgeClass = avg >= 70 ? "badge-up" : avg < 50 ? "badge-down" : "badge-flat";
      const badgeText = avg >= 70 ? "▲ Strong" : avg < 50 ? "▼ Falling" : "→ Steady";
      const pctColor = avg >= 70 ? "var(--green)" : avg < 50 ? "var(--red)" : "var(--orange)";

      row.innerHTML = `
        <div class="drill-name ${isWarn ? "warn" : ""}">${h.name}${isWarn ? " ⚠️" : ""}</div>
        <div class="drill-sparks">${sparks}</div>
        <div class="drill-pct" style="color:${pctColor}">${avg}%</div>
        <div class="drill-trend">${trend}</div>
        <div class="badge ${badgeClass}">${badgeText}</div>
      `;
      body.appendChild(row);
    });

    header.onclick = () => {
      header.classList.toggle("open");
      body.classList.toggle("open");
    };

    dc.appendChild(header);
    dc.appendChild(body);
    container.appendChild(dc);
  });

  // Auto-open first category
  const first = container.querySelector(".drill-header");
  if (first) {
    first.classList.add("open");
    first.nextElementSibling.classList.add("open");
  }
}

// ── VIEW 7: TRENDS ──
function renderTrends() {
  const container = document.getElementById("trendGrid");
  container.innerHTML = "";

  CONFIG.habits.forEach((h, i) => {
    const cat = CONFIG.categories[h.cat];
    const weeks = habitWeeklyPcts(i, 8);
    const avg = weeks.length === 0 ? 0 : Math.round(weeks.reduce((a, b) => a + b, 0) / weeks.length);
    const isWarn = avg < 50;
    const pctColor = avg >= 70 ? "var(--green)" : avg < 50 ? "var(--red)" : "var(--orange)";

    let bars = "";
    weeks.forEach((w) => {
      const color = w < 50 ? "var(--red)" : w < 70 ? "var(--orange)" : cat.color;
      bars += `<div class="trend-bar" style="height:${Math.max(w, 3)}%;background:${color}"></div>`;
    });

    let weekLabels = "";
    for (let w = 1; w <= 8; w++) {
      weekLabels += `<span>W${w}</span>`;
    }

    const card = document.createElement("div");
    card.className = `trend-card${isWarn ? " warn" : ""}`;
    card.innerHTML = `
      <div class="trend-header">
        <b><span class="dot" style="background:${cat.color}"></span> ${h.name}${isWarn ? " ⚠️" : ""}${h.weekly ? " 📅" : ""}</b>
        <em style="color:${pctColor}">${avg}%</em>
      </div>
      <div class="trend-bars">${bars}</div>
      <div class="trend-weeks">${weekLabels}</div>
    `;
    container.appendChild(card);
  });
}

// =============================================
// NAVIGATION
// =============================================
function goToView(index) {
  document.querySelectorAll(".nav-tab").forEach((t, i) => {
    t.classList.toggle("active", i === index);
  });
  document.querySelectorAll(".view").forEach((v, i) => {
    v.classList.toggle("active", i === index);
  });

  switch (index) {
    case 0: renderCombinedView(); break;
    case 1: renderWeek(); break;
    case 2: renderDashboard(); break;
    case 3: renderMonth(); break;
    case 4: renderDrillDown(); break;
    case 5: renderTrends(); break;
  }
}

// =============================================
// INIT
// =============================================
document.addEventListener("DOMContentLoaded", () => {
  initName();
  renderCombinedView();
});