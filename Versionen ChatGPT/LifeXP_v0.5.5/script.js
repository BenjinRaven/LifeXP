const STORAGE_KEY = "lifexp-state-v1";
const SCHEMA_VERSION = 6;
const DEFAULT_DAY_RESET_MINUTES = 4 * 60;

const defaultCatalog = [
    {
        id: "task-joggen",
        name: "🏃 Joggen",
        xp: 15,
        active: true,
        custom: false,
        repeatable: false
    },
    {
        id: "task-ruecken",
        name: "🧘 Rückengymnastik",
        xp: 20,
        active: true,
        custom: false,
        repeatable: false
    },
    {
        id: "task-suessigkeiten",
        name: "🍫 Süßigkeiten gegessen",
        xp: -10,
        active: true,
        custom: false,
        repeatable: true
    },
    {
        id: "task-spazieren",
        name: "🚶 Spazieren",
        xp: 10,
        active: true,
        custom: false,
        repeatable: false
    },
    {
        id: "task-sport",
        name: "🏋️ Sport",
        xp: 15,
        active: true,
        custom: false,
        repeatable: false
    },
    {
        id: "task-todo-oeffnen",
        name: "📋 To-do-Liste öffnen",
        xp: 5,
        active: true,
        custom: false,
        repeatable: false
    },
    {
        id: "task-todo-bearbeiten",
        name: "✅ Etwas von der To-do-Liste abhaken",
        xp: 10,
        active: true,
        custom: false,
        repeatable: true
    },
    {
        id: "task-aufraeumen",
        name: "🧹 Aufräumen",
        xp: 10,
        active: false,
        custom: false,
        repeatable: false
    },
    {
        id: "task-salat",
        name: "🥗 Salat essen",
        xp: 10,
        active: false,
        custom: false,
        repeatable: false
    },
    {
        id: "task-lesen",
        name: "📖 30 min Lesen",
        xp: 10,
        active: false,
        custom: false,
        repeatable: false
    },
    {
        id: "task-zaehne",
        name: "🪥 Zähne putzen",
        xp: 5,
        active: false,
        custom: false,
        repeatable: true
    },
    {
        id: "task-vitamin-c",
        name: "💊 Vitamin C nehmen",
        xp: 5,
        active: false,
        custom: false,
        repeatable: false
    },
    {
        id: "task-kreatin",
        name: "🥄 Kreatin nehmen",
        xp: 5,
        active: false,
        custom: false,
        repeatable: false
    },
    {
        id: "task-muell",
        name: "🗑️ Müll rausbringen",
        xp: 5,
        active: false,
        custom: false,
        repeatable: false
    },
    {
        id: "task-10000-schritte",
        name: "👣 10.000 Schritte erreichen",
        xp: 10,
        active: false,
        custom: false,
        repeatable: false
    }
];

const defaultState = {
    schemaVersion: SCHEMA_VERSION,
    dailyGoal: 50,
    dayResetMinutes: DEFAULT_DAY_RESET_MINUTES,
    gridSize: 2,
    theme: "classic",
    tasks: defaultCatalog,
    history: [],
    deletedTaskIds: []
};

let state = loadState();
let currentView = "today";

const elements = {
    currentDate: document.getElementById("currentDate"),
    todayXp: document.getElementById("todayXp"),
    totalXp: document.getElementById("totalXp"),
    dailyGoal: document.getElementById("dailyGoal"),
    dailyGoalInput: document.getElementById("dailyGoalInput"),
    saveGoalButton: document.getElementById("saveGoalButton"),
    goalCard: document.getElementById("goalCard"),
    goalStatus: document.getElementById("goalStatus"),
    progressBar: document.getElementById("progressBar"),

    todayTaskGrid: document.getElementById("todayTaskGrid"),
    emptyTodayTasks: document.getElementById("emptyTodayTasks"),

    undoButton: document.getElementById("undoButton"),
    resetTodayButton: document.getElementById("resetTodayButton"),

    historyList: document.getElementById("historyList"),
    historyCount: document.getElementById("historyCount"),
    emptyHistoryMessage: document.getElementById("emptyHistoryMessage"),

    statsTodayXp: document.getElementById("statsTodayXp"),
    statsTotalXp: document.getElementById("statsTotalXp"),
    statsCurrentStreak: document.getElementById("statsCurrentStreak"),
    statsBestStreak: document.getElementById("statsBestStreak"),
    statsWeekAverage: document.getElementById("statsWeekAverage"),
    statsMonthAverage: document.getElementById("statsMonthAverage"),
    statsSuccessRate: document.getElementById("statsSuccessRate"),
    statsActiveTasks: document.getElementById("statsActiveTasks"),
    weeklyChart: document.getElementById("weeklyChart"),
    weeklyChartYAxis: document.getElementById("weeklyChartYAxis"),
    weekRangeLabel: document.getElementById("weekRangeLabel"),
    monthTitle: document.getElementById("monthTitle"),
    monthCalendar: document.getElementById("monthCalendar"),

    activeTaskList: document.getElementById("activeTaskList"),
    inactiveTaskList: document.getElementById("inactiveTaskList"),
    activeTaskCount: document.getElementById("activeTaskCount"),
    inactiveTaskCount: document.getElementById("inactiveTaskCount"),
    emptyActiveTasks: document.getElementById("emptyActiveTasks"),
    emptyInactiveTasks: document.getElementById("emptyInactiveTasks"),

    addTaskButton: document.getElementById("addTaskButton"),

    gridSizeTwo: document.getElementById("gridSizeTwo"),
    gridSizeThree: document.getElementById("gridSizeThree"),
    themeClassic: document.getElementById("themeClassic"),
    themeForest: document.getElementById("themeForest"),
    themeDark: document.getElementById("themeDark"),
    themeWarm: document.getElementById("themeWarm"),

    dayResetInput: document.getElementById("dayResetInput"),
    saveDayResetButton: document.getElementById("saveDayResetButton"),
    dayResetHint: document.getElementById("dayResetHint"),

    taskDialog: document.getElementById("taskDialog"),
    taskForm: document.getElementById("taskForm"),
    taskDialogTitle: document.getElementById("taskDialogTitle"),
    editingTaskId: document.getElementById("editingTaskId"),
    taskNameInput: document.getElementById("taskNameInput"),
    taskXpInput: document.getElementById("taskXpInput"),
    taskRepeatableInput: document.getElementById("taskRepeatableInput"),
    closeTaskDialogButton: document.getElementById("closeTaskDialogButton"),
    cancelTaskButton: document.getElementById("cancelTaskButton"),
    deleteCustomTaskButton: document.getElementById("deleteCustomTaskButton")
};

function clone(value) {
    return JSON.parse(JSON.stringify(value));
}

function loadState() {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
        return clone(defaultState);
    }

    try {
        const parsed = JSON.parse(saved);
        const oldTasks = Array.isArray(parsed.tasks) ? parsed.tasks : [];
        const deletedTaskIds = Array.isArray(parsed.deletedTaskIds)
            ? parsed.deletedTaskIds.map(String)
            : [];

        const migratedTasks = oldTasks.map((task) => ({
            id: task.id || createId("task"),
            name: String(task.name || "Unbenannte Aktivität"),
            xp: Number.isFinite(Number(task.xp)) ? Number(task.xp) : 0,
            active: task.active !== false,
            custom:
                typeof task.custom === "boolean"
                    ? task.custom
                    : !defaultCatalog.some((catalogTask) => catalogTask.id === task.id),
            repeatable: task.repeatable === true
        }));

        defaultCatalog.forEach((catalogTask) => {
            const existingTask = migratedTasks.find((task) => task.id === catalogTask.id);

            if (!existingTask) {
                if (!deletedTaskIds.includes(catalogTask.id)) {
                    migratedTasks.push(clone(catalogTask));
                }
                return;
            }

            if (!existingTask.custom) {
                existingTask.name = catalogTask.name;
                existingTask.xp = catalogTask.xp;
            }
        });

        if (Number(parsed.schemaVersion) < 3) {
            const newlyActiveTaskIds = [
                "task-spazieren",
                "task-sport",
                "task-todo-oeffnen",
                "task-todo-bearbeiten"
            ];

            migratedTasks.forEach((task) => {
                if (newlyActiveTaskIds.includes(task.id)) {
                    task.active = true;
                }

                if (/kreatin|creatin|vitamin\s*c/i.test(task.name)) {
                    task.active = false;
                }
            });
        }

        if (Number(parsed.schemaVersion) < 5) {
            const repeatableDefaults = new Set([
                "task-suessigkeiten",
                "task-todo-bearbeiten",
                "task-zaehne"
            ]);

            migratedTasks.forEach((task) => {
                if (!task.custom && repeatableDefaults.has(task.id)) {
                    task.repeatable = true;
                }
            });
        }

        return {
            schemaVersion: SCHEMA_VERSION,
            dailyGoal:
                Number(parsed.dailyGoal) > 0
                    ? Math.round(Number(parsed.dailyGoal))
                    : 50,
            dayResetMinutes:
                Number.isFinite(Number(parsed.dayResetMinutes))
                    ? clamp(Math.round(Number(parsed.dayResetMinutes)), 0, 1439)
                    : DEFAULT_DAY_RESET_MINUTES,
            gridSize: Number(parsed.gridSize) === 3 ? 3 : 2,
            theme: ["classic", "forest", "dark", "warm"].includes(parsed.theme)
                ? parsed.theme
                : "classic",
            tasks: migratedTasks,
            history: Array.isArray(parsed.history) ? parsed.history : [],
            deletedTaskIds
        };
    } catch (error) {
        console.error("Gespeicherte Daten konnten nicht geladen werden.", error);
        return clone(defaultState);
    }
}

function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function createId(prefix) {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
        return `${prefix}-${crypto.randomUUID()}`;
    }

    return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getLogicalDate(date = new Date()) {
    const logicalDate = new Date(date);
    logicalDate.setMinutes(logicalDate.getMinutes() - state.dayResetMinutes);
    return logicalDate;
}

function toDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function getDayKey(date = new Date()) {
    return toDateKey(getLogicalDate(date));
}

function getTodayKey() {
    return getDayKey(new Date());
}

function parseDateKey(key) {
    const [year, month, day] = String(key).split("-").map(Number);
    return new Date(year, month - 1, day, 12, 0, 0, 0);
}

function addDays(date, amount) {
    const result = new Date(date);
    result.setDate(result.getDate() + amount);
    return result;
}

function compareDateKeys(a, b) {
    return String(a).localeCompare(String(b));
}

function getEntryDayKey(entry) {
    if (entry?.createdAt) {
        const createdAt = new Date(entry.createdAt);
        if (!Number.isNaN(createdAt.getTime())) {
            return getDayKey(createdAt);
        }
    }

    return String(entry?.date || "");
}

function formatCurrentDate() {
    return new Intl.DateTimeFormat("de-DE", {
        weekday: "long",
        day: "2-digit",
        month: "long"
    }).format(getLogicalDate());
}

function formatTime(dateString) {
    return new Intl.DateTimeFormat("de-DE", {
        hour: "2-digit",
        minute: "2-digit"
    }).format(new Date(dateString));
}

function formatShortDate(date) {
    return new Intl.DateTimeFormat("de-DE", {
        day: "2-digit",
        month: "2-digit"
    }).format(date);
}

function formatMonthTitle(date) {
    return new Intl.DateTimeFormat("de-DE", {
        month: "long",
        year: "numeric"
    }).format(date);
}

function formatXp(xp) {
    if (xp > 0) return `+${xp} XP`;
    if (xp < 0) return `−${Math.abs(xp)} XP`;
    return "0 XP";
}

function formatStreak(days) {
    return days === 1 ? "1 Tag" : `${days} Tage`;
}

function formatResetTime(minutes) {
    const normalized = clamp(Math.round(minutes), 0, 1439);
    const hours = String(Math.floor(normalized / 60)).padStart(2, "0");
    const mins = String(normalized % 60).padStart(2, "0");
    return `${hours}:${mins}`;
}

function splitEmojiAndName(name) {
    const match = String(name).match(
        /^(\p{Extended_Pictographic}(?:\uFE0F|\u200D|\p{Emoji_Modifier})*)\s*(.*)$/u
    );

    if (!match) {
        return { emoji: "✓", label: name };
    }

    return {
        emoji: match[1],
        label: match[2] || name
    };
}

function getHistoryForDayKey(dayKey) {
    return state.history.filter((entry) => getEntryDayKey(entry) === dayKey);
}

function getDayXp(dayKey) {
    return getHistoryForDayKey(dayKey).reduce(
        (sum, entry) => sum + Number(entry.xp || 0),
        0
    );
}

function getTodayHistory() {
    return getHistoryForDayKey(getTodayKey());
}

function getTodayXp() {
    return getDayXp(getTodayKey());
}

function getTotalXp() {
    return state.history.reduce((sum, entry) => sum + Number(entry.xp || 0), 0);
}

function getActiveTasks() {
    return state.tasks.filter((task) => task.active);
}

function getInactiveTasks() {
    return state.tasks.filter((task) => !task.active);
}

function hasTaskBeenCompletedToday(taskId) {
    return getTodayHistory().some((entry) => entry.taskId === taskId);
}

function getFirstTrackedDayKey() {
    const keys = state.history
        .map(getEntryDayKey)
        .filter(Boolean)
        .sort();

    return keys[0] || null;
}

function getWeekStart(date = getLogicalDate()) {
    const result = new Date(date);
    result.setHours(12, 0, 0, 0);
    const day = result.getDay();
    const mondayOffset = (day + 6) % 7;
    result.setDate(result.getDate() - mondayOffset);
    return result;
}

function getDaysBetweenInclusive(start, end) {
    if (!start || !end || start > end) return [];

    const days = [];
    let cursor = new Date(start);
    cursor.setHours(12, 0, 0, 0);

    const final = new Date(end);
    final.setHours(12, 0, 0, 0);

    while (cursor <= final) {
        days.push(new Date(cursor));
        cursor = addDays(cursor, 1);
    }

    return days;
}

function getStatisticsSummary() {
    const todayDate = getLogicalDate();
    todayDate.setHours(12, 0, 0, 0);
    const todayKey = toDateKey(todayDate);
    const firstTrackedKey = getFirstTrackedDayKey();
    const goal = state.dailyGoal;

    if (!firstTrackedKey) {
        return {
            currentStreak: 0,
            bestStreak: 0,
            weekAverage: 0,
            monthAverage: 0,
            successRate: 0
        };
    }

    const firstTrackedDate = parseDateKey(firstTrackedKey);
    const yesterday = addDays(todayDate, -1);
    const todayReached = getDayXp(todayKey) >= goal;
    const streakEnd = todayReached ? todayDate : yesterday;

    let currentStreak = 0;
    if (streakEnd >= firstTrackedDate) {
        let cursor = new Date(streakEnd);
        while (cursor >= firstTrackedDate) {
            if (getDayXp(toDateKey(cursor)) < goal) break;
            currentStreak += 1;
            cursor = addDays(cursor, -1);
        }
    }

    let bestStreak = 0;
    let running = 0;
    for (const date of getDaysBetweenInclusive(firstTrackedDate, todayDate)) {
        if (getDayXp(toDateKey(date)) >= goal) {
            running += 1;
            bestStreak = Math.max(bestStreak, running);
        } else {
            running = 0;
        }
    }

    const sevenStart = addDays(todayDate, -6);
    const effectiveSevenStart =
        sevenStart > firstTrackedDate ? sevenStart : firstTrackedDate;
    const sevenDays = getDaysBetweenInclusive(effectiveSevenStart, todayDate);
    const weekAverage = sevenDays.length
        ? Math.round(
            sevenDays.reduce((sum, date) => sum + getDayXp(toDateKey(date)), 0) /
                sevenDays.length
        )
        : 0;

    const monthStart = new Date(
        todayDate.getFullYear(),
        todayDate.getMonth(),
        1,
        12
    );
    const effectiveMonthStart =
        monthStart > firstTrackedDate ? monthStart : firstTrackedDate;
    const monthDays = getDaysBetweenInclusive(effectiveMonthStart, todayDate);
    const monthAverage = monthDays.length
        ? Math.round(
            monthDays.reduce((sum, date) => sum + getDayXp(toDateKey(date)), 0) /
                monthDays.length
        )
        : 0;

    const successEnd = todayReached ? todayDate : yesterday;
    const successDays = getDaysBetweenInclusive(firstTrackedDate, successEnd);
    const reachedDays = successDays.filter(
        (date) => getDayXp(toDateKey(date)) >= goal
    ).length;
    const successRate = successDays.length
        ? Math.round((reachedDays / successDays.length) * 100)
        : 0;

    return {
        currentStreak,
        bestStreak,
        weekAverage,
        monthAverage,
        successRate
    };
}

function render() {
    const scrollX = window.scrollX;
    applyTheme();
    const scrollY = window.scrollY;

    renderNavigation();
    renderHeaderAndGoal();
    renderTodayTasks();
    renderHistory();
    renderActionButtons();
    renderStats();
    renderManagement();
    renderSettings();

    requestAnimationFrame(() => {
        window.scrollTo(scrollX, scrollY);
    });
}

function applyTheme() {
    const theme = ["classic", "forest", "dark", "warm"].includes(state.theme)
        ? state.theme
        : "classic";

    document.body.dataset.theme = theme;

    const themeColors = {
        classic: "#f3f5f8",
        forest: "#edf4ef",
        dark: "#11151d",
        warm: "#f7f0e7"
    };

    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (themeColorMeta) {
        themeColorMeta.setAttribute("content", themeColors[theme]);
    }
}

function renderNavigation() {
    document.querySelectorAll(".view").forEach((view) => {
        view.classList.toggle(
            "active-view",
            view.id === `${currentView}View`
        );
    });

    document.querySelectorAll(".nav-button").forEach((button) => {
        button.classList.toggle(
            "active",
            button.dataset.view === currentView
        );
    });
}

function openView(viewName) {
    currentView = viewName;
    renderNavigation();
}

function renderHeaderAndGoal() {
    const todayXp = getTodayXp();
    const totalXp = getTotalXp();
    const goal = state.dailyGoal;

    elements.currentDate.textContent = formatCurrentDate();
    elements.todayXp.textContent = todayXp;
    elements.totalXp.textContent = `${totalXp} XP`;
    elements.dailyGoal.textContent = goal;
    elements.dailyGoalInput.value = goal;

    const percentage = Math.max(
        0,
        Math.min((todayXp / goal) * 100, 100)
    );

    elements.progressBar.style.width = `${percentage}%`;

    const reached = todayXp >= goal;

    elements.goalCard.classList.toggle("reached", reached);
    elements.progressBar.classList.toggle("reached", reached);
    elements.goalStatus.classList.toggle("reached", reached);

    if (reached) {
        elements.goalStatus.textContent = "✓ Tagesziel geschafft";
    } else {
        elements.goalStatus.textContent = `Noch ${goal - todayXp} XP`;
    }
}

function makeTodayTaskElement(task) {
    const parts = splitEmojiAndName(task.name);
    const completedToday = !task.repeatable && hasTaskBeenCompletedToday(task.id);

    const card = document.createElement("article");
    card.className = "task-tile sortable-tile";
    card.dataset.taskId = task.id;
    card.draggable = window.matchMedia("(pointer: fine)").matches;
    card.tabIndex = completedToday ? -1 : 0;
    card.setAttribute("role", "button");
    card.setAttribute(
        "aria-label",
        completedToday
            ? `${parts.label}, heute bereits erledigt`
            : `${parts.label}, ${formatXp(task.xp)}`
    );

    if (task.xp < 0) {
        card.classList.add("negative");
    }

    if (completedToday) {
        card.classList.add("completed");
        card.setAttribute("aria-disabled", "true");
    }

    const dragHandle = document.createElement("button");
    dragHandle.type = "button";
    dragHandle.className = "task-drag-handle";
    dragHandle.textContent = "≡";
    dragHandle.setAttribute("aria-label", `${parts.label} verschieben`);
    dragHandle.addEventListener("click", (event) => {
        event.stopPropagation();
    });

    const emoji = document.createElement("span");
    emoji.className = "task-emoji";
    emoji.textContent = completedToday ? "✓" : parts.emoji;

    const name = document.createElement("span");
    name.className = "task-tile-name";
    name.textContent = parts.label;

    const xp = document.createElement("strong");
    xp.className = "task-tile-xp";
    xp.textContent = completedToday ? "Heute erledigt" : formatXp(task.xp);

    card.append(dragHandle, emoji, name, xp);

    if (task.repeatable) {
        const repeatable = document.createElement("span");
        repeatable.className = "task-repeatable-badge";
        repeatable.textContent = "↻ Wiederholbar";
        card.appendChild(repeatable);
    }

    if (!completedToday) {
        card.addEventListener("click", () => {
            if (card.dataset.justDragged === "true") {
                card.dataset.justDragged = "false";
                return;
            }
            addHistoryEntry(task);
        });

        card.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                addHistoryEntry(task);
            }
        });
    }

    setupTodayDrag(card, dragHandle, task.id);
    return card;
}

function renderTodayTasks() {
    const activeTasks = getActiveTasks();

    elements.todayTaskGrid.innerHTML = "";
    elements.todayTaskGrid.className =
        `task-grid ${state.gridSize === 3 ? "grid-three" : "grid-two"}`;

    elements.emptyTodayTasks.hidden = activeTasks.length > 0;

    activeTasks.forEach((task) => {
        elements.todayTaskGrid.appendChild(makeTodayTaskElement(task));
    });

    const addTaskTile = document.createElement("button");
    addTaskTile.type = "button";
    addTaskTile.className = "task-tile add-task-tile";

    const addIcon = document.createElement("span");
    addIcon.className = "task-emoji";
    addIcon.textContent = "+";

    const addLabel = document.createElement("span");
    addLabel.className = "task-tile-name";
    addLabel.textContent = "Neue Aktivität hinzufügen";

    addTaskTile.append(addIcon, addLabel);
    addTaskTile.addEventListener("click", () => openTaskDialog());

    elements.todayTaskGrid.appendChild(addTaskTile);
}

function renderHistory() {
    const entries = getTodayHistory()
        .slice()
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    elements.historyList.innerHTML = "";
    elements.emptyHistoryMessage.hidden = entries.length > 0;
    elements.historyCount.textContent =
        entries.length === 1 ? "1 Eintrag" : `${entries.length} Einträge`;

    entries.forEach((entry) => {
        const item = document.createElement("div");
        item.className = "history-item";

        const information = document.createElement("div");
        information.className = "history-information";

        const name = document.createElement("strong");
        name.textContent = entry.taskName;

        const time = document.createElement("span");
        time.textContent = formatTime(entry.createdAt);

        const xp = document.createElement("strong");
        xp.className = "history-xp";
        xp.textContent = formatXp(entry.xp);

        if (Number(entry.xp) < 0) {
            xp.classList.add("negative");
        }

        information.append(name, time);
        item.append(information, xp);
        elements.historyList.appendChild(item);
    });
}

function renderActionButtons() {
    const hasEntries = getTodayHistory().length > 0;
    elements.undoButton.disabled = !hasEntries;
    elements.resetTodayButton.disabled = !hasEntries;
}

function renderStats() {
    const summary = getStatisticsSummary();

    elements.statsTodayXp.textContent = `${getTodayXp()} XP`;
    elements.statsTotalXp.textContent = `${getTotalXp()} XP`;
    elements.statsCurrentStreak.textContent = formatStreak(summary.currentStreak);
    elements.statsBestStreak.textContent = formatStreak(summary.bestStreak);
    elements.statsWeekAverage.textContent = `${summary.weekAverage} XP`;
    elements.statsMonthAverage.textContent = `${summary.monthAverage} XP`;
    elements.statsSuccessRate.textContent = `${summary.successRate} %`;
    elements.statsActiveTasks.textContent = getActiveTasks().length;

    renderWeeklyChart();
    renderMonthCalendar();
}

function renderWeeklyChart() {
    if (!elements.weeklyChart || !elements.weeklyChartYAxis) return;

    const logicalToday = getLogicalDate();
    logicalToday.setHours(12, 0, 0, 0);
    const todayKey = toDateKey(logicalToday);
    const weekStart = getWeekStart(logicalToday);
    const weekDays = Array.from({ length: 7 }, (_, index) =>
        addDays(weekStart, index)
    );
    const firstTrackedKey = getFirstTrackedDayKey();

    const values = weekDays.map((date) => getDayXp(toDateKey(date)));
    const maxValue = Math.max(state.dailyGoal, ...values, 1);

    // Die Wochenansicht hat immer mindestens 80 XP Platz nach oben.
    // Sobald ein Tag höher liegt, wächst die Skala automatisch in 20er-Schritten
    // und lässt weiterhin etwas Luft oberhalb des höchsten Balkens.
    const desiredMaximum = Math.max(80, maxValue + 10, state.dailyGoal + 30);
    const axisMax = Math.max(80, Math.ceil(desiredMaximum / 20) * 20);
    const goalPercent = clamp((state.dailyGoal / axisMax) * 100, 0, 100);

    elements.weekRangeLabel.textContent =
        `${formatShortDate(weekDays[0])} – ${formatShortDate(weekDays[6])}`;

    elements.weeklyChartYAxis.innerHTML = `
        <div class="week-y-plot">
            <span class="week-axis-label axis-max">${axisMax}</span>
            <span class="week-axis-label goal-axis-label" style="bottom: ${goalPercent}%">${state.dailyGoal}</span>
            <span class="week-axis-label axis-zero">0</span>
        </div>
    `;

    elements.weeklyChart.innerHTML = "";

    const weekdayFormatter = new Intl.DateTimeFormat("de-DE", {
        weekday: "short"
    });

    weekDays.forEach((date, index) => {
        const key = toDateKey(date);
        const value = values[index];
        const isFuture = compareDateKeys(key, todayKey) > 0;
        const isBeforeTracking =
            firstTrackedKey && compareDateKeys(key, firstTrackedKey) < 0;
        const isUntracked = !firstTrackedKey || isFuture || isBeforeTracking;
        const reached = !isUntracked && value >= state.dailyGoal;

        const column = document.createElement("div");
        column.className = "week-column";

        const valueLabel = document.createElement("span");
        valueLabel.className = "week-value";
        valueLabel.textContent = isUntracked ? "–" : `${value}`;

        const barArea = document.createElement("div");
        barArea.className = "week-bar-area";

        const goalLine = document.createElement("span");
        goalLine.className = "week-goal-line";
        goalLine.style.bottom = `${clamp((state.dailyGoal / axisMax) * 100, 0, 100)}%`;

        const bar = document.createElement("div");
        bar.className = "week-bar";

        if (isUntracked) {
            bar.classList.add("neutral");
            bar.style.height = "0";
        } else {
            bar.classList.add(reached ? "success" : "missed");
            const positiveHeight = Math.max(value, 0);
            const height = clamp((positiveHeight / axisMax) * 100, 0, 100);
            bar.style.height = `${Math.max(height, value === 0 ? 2 : 4)}%`;

            if (value < 0) {
                bar.classList.add("negative-value");
            }
        }

        const dayLabel = document.createElement("span");
        dayLabel.className = "week-day";
        dayLabel.textContent = weekdayFormatter
            .format(date)
            .replace(".", "")
            .slice(0, 2);

        barArea.append(goalLine, bar);
        column.append(valueLabel, barArea, dayLabel);
        elements.weeklyChart.appendChild(column);
    });
}

function renderMonthCalendar() {
    if (!elements.monthCalendar || !elements.monthTitle) return;

    const logicalToday = getLogicalDate();
    logicalToday.setHours(12, 0, 0, 0);
    const todayKey = toDateKey(logicalToday);
    const firstTrackedKey = getFirstTrackedDayKey();
    const monthStart = new Date(
        logicalToday.getFullYear(),
        logicalToday.getMonth(),
        1,
        12
    );
    const monthEnd = new Date(
        logicalToday.getFullYear(),
        logicalToday.getMonth() + 1,
        0,
        12
    );

    elements.monthTitle.textContent = formatMonthTitle(logicalToday);
    elements.monthCalendar.innerHTML = "";

    const mondayOffset = (monthStart.getDay() + 6) % 7;

    for (let index = 0; index < mondayOffset; index += 1) {
        const spacer = document.createElement("span");
        spacer.className = "month-day spacer";
        elements.monthCalendar.appendChild(spacer);
    }

    for (let day = 1; day <= monthEnd.getDate(); day += 1) {
        const date = new Date(
            logicalToday.getFullYear(),
            logicalToday.getMonth(),
            day,
            12
        );
        const key = toDateKey(date);
        const value = getDayXp(key);
        const isFuture = compareDateKeys(key, todayKey) > 0;
        const isBeforeTracking =
            firstTrackedKey && compareDateKeys(key, firstTrackedKey) < 0;
        const isNeutral = !firstTrackedKey || isFuture || isBeforeTracking;

        const cell = document.createElement("span");
        cell.className = "month-day";
        cell.textContent = day;
        cell.title = isNeutral
            ? `${day}. – noch nicht gewertet`
            : `${day}. – ${value} XP`;

        if (key === todayKey) {
            cell.classList.add("today");
        }

        if (isNeutral) {
            cell.classList.add("neutral");
        } else if (value >= state.dailyGoal) {
            cell.classList.add("success");
        } else {
            cell.classList.add("missed");
        }

        elements.monthCalendar.appendChild(cell);
    }
}

function createManageItem(task, active) {
    const item = document.createElement("article");
    item.className = "manage-item";
    item.dataset.taskId = task.id;

    if (active) {
        item.draggable = window.matchMedia("(pointer: fine)").matches;
        item.classList.add("sortable-item");

        const dragHandle = document.createElement("button");
        dragHandle.type = "button";
        dragHandle.className = "drag-handle";
        dragHandle.setAttribute("aria-label", `${task.name} verschieben`);
        dragHandle.textContent = "≡";
        setupManageDragHandle(dragHandle, item, task.id);
        item.appendChild(dragHandle);
    }

    const text = document.createElement("div");
    text.className = "manage-item-text";

    const name = document.createElement("strong");
    name.textContent = task.name;

    const meta = document.createElement("span");
    meta.className = task.xp < 0 ? "negative-text" : "positive-text";
    meta.textContent = task.repeatable
        ? `${formatXp(task.xp)} · ↻ Wiederholbar`
        : formatXp(task.xp);

    text.append(name, meta);

    const actions = document.createElement("div");
    actions.className = "manage-actions";

    const toggleButton = document.createElement("button");
    toggleButton.type = "button";
    toggleButton.className = active
        ? "small-button muted-button"
        : "small-button activate-button";
    toggleButton.textContent = active ? "Ausblenden" : "+ Aktivieren";
    toggleButton.addEventListener("click", () => toggleTask(task.id));

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "small-button";
    editButton.textContent = "Bearbeiten";
    editButton.addEventListener("click", () => openTaskDialog(task.id));

    if (!active) {
        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "small-button delete-small-button";
        deleteButton.textContent = "Löschen";
        deleteButton.addEventListener("click", () => permanentlyDeleteTask(task.id));
        actions.append(deleteButton, toggleButton, editButton);
    } else {
        actions.append(toggleButton, editButton);
    }

    item.append(text, actions);
    return item;
}

function createManageAddItem() {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "manage-add-item";
    button.innerHTML =
        `<span class="manage-add-icon">+</span>` +
        `<span><strong>Neue Aktivität hinzufügen</strong>` +
        `<small>Eigene Aktivität mit XP-Wert anlegen</small></span>`;
    button.addEventListener("click", () => openTaskDialog());
    return button;
}

function renderManagement() {
    const activeTasks = getActiveTasks();
    const inactiveTasks = getInactiveTasks();

    elements.activeTaskList.innerHTML = "";
    elements.inactiveTaskList.innerHTML = "";

    elements.activeTaskList.appendChild(createManageAddItem());

    activeTasks.forEach((task) => {
        elements.activeTaskList.appendChild(createManageItem(task, true));
    });

    inactiveTasks.forEach((task) => {
        elements.inactiveTaskList.appendChild(createManageItem(task, false));
    });

    elements.activeTaskCount.textContent = activeTasks.length;
    elements.inactiveTaskCount.textContent = inactiveTasks.length;
    elements.emptyActiveTasks.hidden = true;
    elements.emptyInactiveTasks.hidden = inactiveTasks.length > 0;
}

let draggedManageTaskId = null;
let touchDraggedManageItem = null;
let draggedTodayTaskId = null;
let touchDraggedTodayItem = null;

function applyActiveOrder(activeIds) {
    if (!activeIds.length) return;

    const taskById = new Map(state.tasks.map((task) => [task.id, task]));
    const reorderedActiveTasks = activeIds
        .map((id) => taskById.get(id))
        .filter((task) => task?.active);

    const missingActiveTasks = state.tasks.filter(
        (task) => task.active && !activeIds.includes(task.id)
    );
    const inactiveTasks = state.tasks.filter((task) => !task.active);

    state.tasks = [
        ...reorderedActiveTasks,
        ...missingActiveTasks,
        ...inactiveTasks
    ];

    saveState();
}

function setFullCardDragPreview(event, item) {
    if (!event.dataTransfer || !item) return;

    const preview = item.cloneNode(true);
    const rect = item.getBoundingClientRect();

    preview.classList.remove("dragging");
    preview.classList.add("drag-preview-card");
    preview.style.width = `${rect.width}px`;
    preview.style.height = `${rect.height}px`;

    document.body.appendChild(preview);
    event.dataTransfer.setDragImage(
        preview,
        Math.min(32, rect.width / 2),
        Math.min(24, rect.height / 2)
    );

    // Chrome braucht das Element nur für den Moment, in dem das Drag-Bild erzeugt wird.
    setTimeout(() => preview.remove(), 0);
}

let touchDragGhost = null;
let touchDragOffsetX = 0;
let touchDragOffsetY = 0;

function createTouchDragGhost(item, clientX, clientY) {
    removeTouchDragGhost();

    const rect = item.getBoundingClientRect();
    touchDragOffsetX = clientX - rect.left;
    touchDragOffsetY = clientY - rect.top;

    touchDragGhost = item.cloneNode(true);
    touchDragGhost.classList.remove("dragging");
    touchDragGhost.classList.add("live-drag-ghost");
    touchDragGhost.style.width = `${rect.width}px`;
    touchDragGhost.style.height = `${rect.height}px`;

    document.body.appendChild(touchDragGhost);
    moveTouchDragGhost(clientX, clientY);
}

function moveTouchDragGhost(clientX, clientY) {
    if (!touchDragGhost) return;

    touchDragGhost.style.left = `${clientX - touchDragOffsetX}px`;
    touchDragGhost.style.top = `${clientY - touchDragOffsetY}px`;
}

function removeTouchDragGhost() {
    if (!touchDragGhost) return;
    touchDragGhost.remove();
    touchDragGhost = null;
}

function setupManageDragHandle(handle, item, taskId) {
    item.addEventListener("dragstart", (event) => {
        // Die Aktionsbuttons sollen auf dem Desktop weiterhin normal klickbar bleiben.
        if (event.target.closest(".manage-actions")) {
            event.preventDefault();
            return;
        }

        draggedManageTaskId = taskId;
        item.classList.add("dragging");
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", taskId);
        setFullCardDragPreview(event, item);
    });

    item.addEventListener("dragend", () => {
        item.classList.remove("dragging");
        syncActiveOrderFromManageDom();
        draggedManageTaskId = null;
        renderTodayTasks();
    });

    item.addEventListener("dragover", (event) => {
        if (!draggedManageTaskId || draggedManageTaskId === taskId) return;
        event.preventDefault();
        moveDraggedItemBeforeOrAfter(
            item,
            event.clientY,
            document.querySelector(
                `.manage-item[data-task-id="${draggedManageTaskId}"]`
            )
        );
    });

    // Mobil: kurzes Tippen/Scrollen bleibt normal. Nach kurzem Halten kann die
    // komplette Karte an jeder freien Stelle verschoben werden.
    let holdTimer = null;
    let startX = 0;
    let startY = 0;
    let touchDragStarted = false;

    const cancelHold = () => {
        if (holdTimer) {
            clearTimeout(holdTimer);
            holdTimer = null;
        }
    };

    item.addEventListener("touchstart", (event) => {
        if (event.touches.length !== 1) return;

        // Ausblenden/Bearbeiten sollen weiterhin sofort funktionieren.
        if (event.target.closest(".manage-actions")) return;

        const touch = event.touches[0];
        startX = touch.clientX;
        startY = touch.clientY;
        touchDragStarted = false;
        cancelHold();

        holdTimer = setTimeout(() => {
            draggedManageTaskId = taskId;
            touchDraggedManageItem = item;
            touchDragStarted = true;
            item.classList.add("dragging");
            document.body.classList.add("live-reordering");
            createTouchDragGhost(item, startX, startY);
        }, 180);
    }, { passive: true });

    item.addEventListener("touchmove", (event) => {
        if (event.touches.length !== 1) return;

        const touch = event.touches[0];

        if (!touchDragStarted) {
            const moved = Math.hypot(touch.clientX - startX, touch.clientY - startY);
            if (moved > 8) cancelHold();
            return;
        }

        event.preventDefault();
        moveTouchDragGhost(touch.clientX, touch.clientY);

        const target = document
            .elementFromPoint(touch.clientX, touch.clientY)
            ?.closest(".manage-item[data-task-id]");

        if (
            !target ||
            target === touchDraggedManageItem ||
            !target.classList.contains("sortable-item")
        ) {
            return;
        }

        moveDraggedItemBeforeOrAfter(
            target,
            touch.clientY,
            touchDraggedManageItem
        );
    }, { passive: false });

    const finishTouchDrag = () => {
        cancelHold();

        if (!touchDragStarted || !touchDraggedManageItem || draggedManageTaskId !== taskId) {
            touchDragStarted = false;
            return;
        }

        touchDraggedManageItem.classList.remove("dragging");
        removeTouchDragGhost();
        document.body.classList.remove("live-reordering");
        syncActiveOrderFromManageDom();
        touchDraggedManageItem = null;
        draggedManageTaskId = null;
        touchDragStarted = false;
        renderTodayTasks();
    };

    item.addEventListener("touchend", finishTouchDrag, { passive: true });
    item.addEventListener("touchcancel", finishTouchDrag, { passive: true });

    // Das Symbol bleibt als visueller Hinweis bestehen, ist aber nicht mehr nötig.
    handle.addEventListener("click", (event) => event.stopPropagation());
}
function syncActiveOrderFromManageDom() {
    const activeIds = Array.from(
        elements.activeTaskList.querySelectorAll(".manage-item[data-task-id]")
    ).map((item) => item.dataset.taskId);

    applyActiveOrder(activeIds);
}

function setupTodayDrag(item, handle, taskId) {
    item.addEventListener("dragstart", (event) => {
        draggedTodayTaskId = taskId;
        item.classList.add("dragging");
        item.dataset.justDragged = "true";
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", taskId);
    });

    item.addEventListener("dragend", () => {
        item.classList.remove("dragging");
        syncActiveOrderFromTodayDom();
        draggedTodayTaskId = null;
        renderManagement();

        setTimeout(() => {
            item.dataset.justDragged = "false";
        }, 80);
    });

    item.addEventListener("dragover", (event) => {
        if (!draggedTodayTaskId || draggedTodayTaskId === taskId) return;
        event.preventDefault();

        const draggedItem = elements.todayTaskGrid.querySelector(
            `.task-tile[data-task-id="${draggedTodayTaskId}"]`
        );

        moveDraggedGridItem(item, event.clientX, event.clientY, draggedItem);
    });

    // Mobil: Tippen bleibt ein normaler Aktivitäts-Klick. Wird die Karte kurz
    // gehalten, kann sie anschließend an jeder Stelle verschoben werden.
    let holdTimer = null;
    let startX = 0;
    let startY = 0;
    let touchDragStarted = false;

    const cancelHold = () => {
        if (holdTimer) {
            clearTimeout(holdTimer);
            holdTimer = null;
        }
    };

    item.addEventListener("touchstart", (event) => {
        if (event.touches.length !== 1) return;

        const touch = event.touches[0];
        startX = touch.clientX;
        startY = touch.clientY;
        touchDragStarted = false;
        cancelHold();

        holdTimer = setTimeout(() => {
            draggedTodayTaskId = taskId;
            touchDraggedTodayItem = item;
            touchDragStarted = true;
            item.dataset.justDragged = "true";
            item.classList.add("dragging");
            document.body.classList.add("live-reordering");
            createTouchDragGhost(item, startX, startY);
        }, 180);
    }, { passive: true });

    item.addEventListener("touchmove", (event) => {
        if (event.touches.length !== 1) return;

        const touch = event.touches[0];

        if (!touchDragStarted) {
            const moved = Math.hypot(touch.clientX - startX, touch.clientY - startY);
            if (moved > 8) cancelHold();
            return;
        }

        event.preventDefault();
        moveTouchDragGhost(touch.clientX, touch.clientY);

        const target = document
            .elementFromPoint(touch.clientX, touch.clientY)
            ?.closest(".task-tile[data-task-id]");

        if (!target || target === touchDraggedTodayItem) return;

        moveDraggedGridItem(
            target,
            touch.clientX,
            touch.clientY,
            touchDraggedTodayItem
        );
    }, { passive: false });

    const finishTouchDrag = () => {
        cancelHold();

        if (!touchDragStarted || !touchDraggedTodayItem || draggedTodayTaskId !== taskId) {
            touchDragStarted = false;
            return;
        }

        touchDraggedTodayItem.classList.remove("dragging");
        removeTouchDragGhost();
        document.body.classList.remove("live-reordering");
        syncActiveOrderFromTodayDom();
        renderManagement();

        setTimeout(() => {
            if (touchDraggedTodayItem) {
                touchDraggedTodayItem.dataset.justDragged = "false";
            }
        }, 120);

        touchDraggedTodayItem = null;
        draggedTodayTaskId = null;
        touchDragStarted = false;
    };

    item.addEventListener("touchend", finishTouchDrag, { passive: true });
    item.addEventListener("touchcancel", finishTouchDrag, { passive: true });

    handle.addEventListener("click", (event) => event.stopPropagation());
}
function moveDraggedItemBeforeOrAfter(target, clientY, draggedItem) {
    if (!draggedItem || target === draggedItem) return;

    const rect = target.getBoundingClientRect();
    const insertAfter = clientY > rect.top + rect.height / 2;

    if (insertAfter) {
        target.after(draggedItem);
    } else {
        target.before(draggedItem);
    }
}

function moveDraggedGridItem(target, clientX, clientY, draggedItem) {
    if (!draggedItem || target === draggedItem) return;

    const rect = target.getBoundingClientRect();
    const horizontalRatio = (clientX - rect.left) / Math.max(rect.width, 1);
    const verticalRatio = (clientY - rect.top) / Math.max(rect.height, 1);

    const insertAfter =
        verticalRatio > 0.55 ||
        (verticalRatio >= 0.25 &&
            verticalRatio <= 0.55 &&
            horizontalRatio > 0.5);

    if (insertAfter) {
        target.after(draggedItem);
    } else {
        target.before(draggedItem);
    }
}

function syncActiveOrderFromTodayDom() {
    const activeIds = Array.from(
        elements.todayTaskGrid.querySelectorAll(".task-tile[data-task-id]")
    ).map((item) => item.dataset.taskId);

    applyActiveOrder(activeIds);
}

function renderSettings() {
    elements.gridSizeTwo.checked = state.gridSize === 2;
    elements.gridSizeThree.checked = state.gridSize === 3;

    if (elements.themeClassic) elements.themeClassic.checked = state.theme === "classic";
    if (elements.themeForest) elements.themeForest.checked = state.theme === "forest";
    if (elements.themeDark) elements.themeDark.checked = state.theme === "dark";
    if (elements.themeWarm) elements.themeWarm.checked = state.theme === "warm";

    elements.dayResetInput.value = formatResetTime(state.dayResetMinutes);

    const previousMinute =
        (state.dayResetMinutes - 1 + 1440) % 1440;

    elements.dayResetHint.textContent =
        `Bis ${formatResetTime(previousMinute)} Uhr zählen Aktivitäten noch zum Vortag.`;
}

function addHistoryEntry(task) {
    if (!task.repeatable && hasTaskBeenCompletedToday(task.id)) {
        return;
    }

    state.history.push({
        id: createId("history"),
        taskId: task.id,
        taskName: task.name,
        xp: Number(task.xp),
        date: getTodayKey(),
        createdAt: new Date().toISOString()
    });

    saveState();
    render();
}

function undoLastTodayEntry() {
    const todayKey = getTodayKey();

    const todayIndices = state.history
        .map((entry, index) => ({ entry, index }))
        .filter(({ entry }) => getEntryDayKey(entry) === todayKey)
        .sort(
            (a, b) =>
                new Date(b.entry.createdAt) - new Date(a.entry.createdAt)
        );

    if (!todayIndices.length) return;

    state.history.splice(todayIndices[0].index, 1);
    saveState();
    render();
}

function resetToday() {
    if (getTodayHistory().length === 0) return;

    const confirmed = window.confirm(
        "Wirklich alle heutigen Einträge löschen?"
    );

    if (!confirmed) return;

    const todayKey = getTodayKey();
    state.history = state.history.filter(
        (entry) => getEntryDayKey(entry) !== todayKey
    );

    saveState();
    render();
}

function toggleTask(taskId) {
    const task = state.tasks.find((item) => item.id === taskId);

    if (!task) return;

    task.active = !task.active;
    saveState();
    render();
}

function permanentlyDeleteTask(taskId) {
    const task = state.tasks.find((item) => item.id === taskId);

    if (!task) return;

    const confirmed = window.confirm(
        `„${task.name}“ wirklich endgültig löschen?\n\n` +
        "Bereits vorhandene Historieneinträge bleiben erhalten."
    );

    if (!confirmed) return;

    if (!task.custom && !state.deletedTaskIds.includes(task.id)) {
        state.deletedTaskIds.push(task.id);
    }

    state.tasks = state.tasks.filter((item) => item.id !== taskId);

    saveState();
    render();
}

function openTaskDialog(taskId = "") {
    elements.editingTaskId.value = taskId;

    if (taskId) {
        const task = state.tasks.find((item) => item.id === taskId);

        if (!task) return;

        elements.taskDialogTitle.textContent = "Aktivität bearbeiten";
        elements.taskNameInput.value = task.name;
        elements.taskXpInput.value = task.xp;
        elements.taskRepeatableInput.checked = task.repeatable === true;
        elements.deleteCustomTaskButton.hidden = !task.custom;
    } else {
        elements.taskDialogTitle.textContent = "Neue Aktivität";
        elements.taskNameInput.value = "";
        elements.taskXpInput.value = 10;
        elements.taskRepeatableInput.checked = false;
        elements.deleteCustomTaskButton.hidden = true;
    }

    elements.taskDialog.showModal();

    setTimeout(() => {
        elements.taskNameInput.focus();
    }, 50);
}

function closeTaskDialog() {
    elements.taskDialog.close();
    elements.taskForm.reset();
    elements.editingTaskId.value = "";
}

function saveTask(event) {
    event.preventDefault();

    const name = elements.taskNameInput.value.trim();
    const xp = Number(elements.taskXpInput.value);
    const repeatable = elements.taskRepeatableInput.checked;
    const editingId = elements.editingTaskId.value;

    if (!name) {
        window.alert("Bitte gib einen Namen ein.");
        return;
    }

    if (!Number.isFinite(xp)) {
        window.alert("Bitte gib einen gültigen XP-Wert ein.");
        return;
    }

    if (editingId) {
        const task = state.tasks.find((item) => item.id === editingId);

        if (!task) return;

        task.name = name;
        task.xp = xp;
        task.repeatable = repeatable;
    } else {
        state.tasks.push({
            id: createId("task"),
            name,
            xp,
            active: true,
            custom: true,
            repeatable
        });
    }

    saveState();
    closeTaskDialog();
    render();
}

function deleteCustomTask() {
    const taskId = elements.editingTaskId.value;
    const task = state.tasks.find((item) => item.id === taskId);

    if (!task || !task.custom) return;

    const confirmed = window.confirm(
        `„${task.name}“ endgültig aus dem Katalog löschen?\n\n` +
        "Bereits vorhandene Historieneinträge bleiben erhalten."
    );

    if (!confirmed) return;

    state.tasks = state.tasks.filter((item) => item.id !== taskId);

    saveState();
    closeTaskDialog();
    render();
}

function saveDailyGoal() {
    const newGoal = Number(elements.dailyGoalInput.value);

    if (!Number.isFinite(newGoal) || newGoal < 1) {
        window.alert("Das Tagesziel muss mindestens 1 XP betragen.");
        elements.dailyGoalInput.value = state.dailyGoal;
        return;
    }

    state.dailyGoal = Math.round(newGoal);
    saveState();
    render();
}

function saveDayReset() {
    const value = elements.dayResetInput.value;

    if (!/^\d{2}:\d{2}$/.test(value)) {
        window.alert("Bitte wähle eine gültige Uhrzeit.");
        elements.dayResetInput.value = formatResetTime(state.dayResetMinutes);
        return;
    }

    const [hours, minutes] = value.split(":").map(Number);

    if (
        !Number.isInteger(hours) ||
        !Number.isInteger(minutes) ||
        hours < 0 ||
        hours > 23 ||
        minutes < 0 ||
        minutes > 59
    ) {
        window.alert("Bitte wähle eine gültige Uhrzeit.");
        return;
    }

    state.dayResetMinutes = hours * 60 + minutes;
    saveState();
    render();
}

function setGridSize(size) {
    state.gridSize = size === 3 ? 3 : 2;
    saveState();
    render();
}

function setTheme(theme) {
    if (!["classic", "forest", "dark", "warm"].includes(theme)) return;
    state.theme = theme;
    saveState();
    render();
}

document.querySelectorAll(".nav-button").forEach((button) => {
    button.addEventListener("click", () => openView(button.dataset.view));
});

document.querySelectorAll("[data-open-view]").forEach((button) => {
    button.addEventListener("click", () => openView(button.dataset.openView));
});

elements.addTaskButton.addEventListener("click", () => openTaskDialog());
elements.taskForm.addEventListener("submit", saveTask);
elements.closeTaskDialogButton.addEventListener("click", closeTaskDialog);
elements.cancelTaskButton.addEventListener("click", closeTaskDialog);
elements.deleteCustomTaskButton.addEventListener("click", deleteCustomTask);

elements.undoButton.addEventListener("click", undoLastTodayEntry);
elements.resetTodayButton.addEventListener("click", resetToday);
elements.saveGoalButton.addEventListener("click", saveDailyGoal);
elements.saveDayResetButton.addEventListener("click", saveDayReset);

elements.dailyGoalInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") saveDailyGoal();
});

elements.dayResetInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") saveDayReset();
});

elements.gridSizeTwo.addEventListener("change", () => setGridSize(2));
elements.gridSizeThree.addEventListener("change", () => setGridSize(3));

if (elements.themeClassic) elements.themeClassic.addEventListener("change", () => setTheme("classic"));
if (elements.themeForest) elements.themeForest.addEventListener("change", () => setTheme("forest"));
if (elements.themeDark) elements.themeDark.addEventListener("change", () => setTheme("dark"));
if (elements.themeWarm) elements.themeWarm.addEventListener("change", () => setTheme("warm"));

elements.taskXpInput.addEventListener("focus", () => {
    elements.taskXpInput.select();
});

render();

if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js");
}
