const STORAGE_KEY = "lifexp-state-v1";
const SCHEMA_VERSION = 9;
const DEFAULT_DAY_RESET_MINUTES = 4 * 60;
let emojiMemoryCache = {};

const defaultCatalog = [
    {
        id: "task-joggen",
        name: "Joggen",
        emoji: "🏃",
        xp: 15,
        active: true,
        custom: false,
        repeatable: false
    },
    {
        id: "task-ruecken",
        name: "Rückengymnastik",
        emoji: "🧘",
        xp: 20,
        active: true,
        custom: false,
        repeatable: false
    },
    {
        id: "task-suessigkeiten",
        name: "Süßigkeiten gegessen",
        emoji: "🍫",
        xp: -10,
        active: true,
        custom: false,
        repeatable: true
    },
    {
        id: "task-spazieren",
        name: "Spazieren",
        emoji: "🚶",
        xp: 10,
        active: true,
        custom: false,
        repeatable: false
    },
    {
        id: "task-sport",
        name: "Sport",
        emoji: "🏋️",
        xp: 15,
        active: true,
        custom: false,
        repeatable: false
    },
    {
        id: "task-todo-oeffnen",
        name: "To-do-Liste öffnen",
        emoji: "📋",
        xp: 5,
        active: true,
        custom: false,
        repeatable: false
    },
    {
        id: "task-todo-bearbeiten",
        name: "Etwas von der To-do-Liste abhaken",
        emoji: "✅",
        xp: 10,
        active: true,
        custom: false,
        repeatable: true
    },
    {
        id: "task-aufraeumen",
        name: "Aufräumen",
        emoji: "🧹",
        xp: 10,
        active: false,
        custom: false,
        repeatable: false
    },
    {
        id: "task-salat",
        name: "Salat essen",
        emoji: "🥗",
        xp: 10,
        active: false,
        custom: false,
        repeatable: false
    },
    {
        id: "task-lesen",
        name: "30 min Lesen",
        emoji: "📖",
        xp: 10,
        active: false,
        custom: false,
        repeatable: false
    },
    {
        id: "task-zaehne",
        name: "Zähne putzen",
        emoji: "🪥",
        xp: 5,
        active: false,
        custom: false,
        repeatable: true
    },
    {
        id: "task-vitamin-c",
        name: "Vitamin C nehmen",
        emoji: "💊",
        xp: 5,
        active: false,
        custom: false,
        repeatable: false
    },
    {
        id: "task-kreatin",
        name: "Kreatin nehmen",
        emoji: "🥄",
        xp: 5,
        active: false,
        custom: false,
        repeatable: false
    },
    {
        id: "task-muell",
        name: "Müll rausbringen",
        emoji: "🗑️",
        xp: 5,
        active: false,
        custom: false,
        repeatable: false
    },
    {
        id: "task-10000-schritte",
        name: "10.000 Schritte erreichen",
        emoji: "👣",
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
    theme: "dark",
    customTheme: { background: "#11151d", surface: "#1c2330", accent: "#7b8cff" },
    tasks: defaultCatalog,
    history: [],
    deletedTaskIds: [],
    emojiMemory: {},
    savedThemes: []
};

let state = loadState();
let currentView = "today";
let selectedEntryDayKey = null;
let retroEntryExpiresAt = 0;
let retroEntryTimer = null;

const elements = {
    currentDate: document.getElementById("currentDate"),
    todayTitle: document.getElementById("todayTitle"),
    retroDayBanner: document.getElementById("retroDayBanner"),
    retroDayBannerTitle: document.getElementById("retroDayBannerTitle"),
    retroDayBannerText: document.getElementById("retroDayBannerText"),
    returnToTodayButton: document.getElementById("returnToTodayButton"),
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
    themeCyber: document.getElementById("themeCyber"),
    themeViolet: document.getElementById("themeViolet"),
    themeCyan: document.getElementById("themeCyan"),
    themeEmber: document.getElementById("themeEmber"),
    themeCustom: document.getElementById("themeCustom"),
    customBackgroundInput: document.getElementById("customBackgroundInput"),
    customSurfaceInput: document.getElementById("customSurfaceInput"),
    customAccentInput: document.getElementById("customAccentInput"),
    applyCustomThemeButton: document.getElementById("applyCustomThemeButton"),
    customThemeNameInput: document.getElementById("customThemeNameInput"),
    saveCustomThemeButton: document.getElementById("saveCustomThemeButton"),
    savedThemeList: document.getElementById("savedThemeList"),

    dayResetInput: document.getElementById("dayResetInput"),
    saveDayResetButton: document.getElementById("saveDayResetButton"),
    dayResetHint: document.getElementById("dayResetHint"),

    taskDialog: document.getElementById("taskDialog"),
    taskForm: document.getElementById("taskForm"),
    taskDialogTitle: document.getElementById("taskDialogTitle"),
    editingTaskId: document.getElementById("editingTaskId"),
    taskNameInput: document.getElementById("taskNameInput"),
    taskEmojiInput: document.getElementById("taskEmojiInput"),
    suggestEmojiButton: document.getElementById("suggestEmojiButton"),
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
        emojiMemoryCache =
            parsed.emojiMemory && typeof parsed.emojiMemory === "object"
                ? { ...parsed.emojiMemory }
                : {};
        const oldTasks = Array.isArray(parsed.tasks) ? parsed.tasks : [];
        const deletedTaskIds = Array.isArray(parsed.deletedTaskIds)
            ? parsed.deletedTaskIds.map(String)
            : [];

        const migratedTasks = oldTasks.map((task) => {
            const parsedTaskName = extractEmojiFromName(String(task.name || "Unbenannte Aktivität"));
            return {
                id: task.id || createId("task"),
                name: parsedTaskName.label,
                emoji: String(task.emoji || parsedTaskName.emoji || suggestEmoji(parsedTaskName.label)),
                xp: Number.isFinite(Number(task.xp)) ? Number(task.xp) : 0,
                active: task.active !== false,
                custom:
                    typeof task.custom === "boolean"
                        ? task.custom
                        : !defaultCatalog.some((catalogTask) => catalogTask.id === task.id),
                repeatable: task.repeatable === true
            };
        });

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
                existingTask.emoji = catalogTask.emoji;
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
            theme:
                (
                    ["classic", "forest", "dark", "warm", "cyber", "violet", "cyan", "ember", "custom"].includes(parsed.theme) ||
                    String(parsed.theme || "").startsWith("saved:")
                )
                    ? parsed.theme
                    : "dark",
            customTheme: normalizeCustomTheme(parsed.customTheme),
            tasks: migratedTasks,
            history: Array.isArray(parsed.history) ? parsed.history : [],
            deletedTaskIds,
            emojiMemory: emojiMemoryCache,
            savedThemes: Array.isArray(parsed.savedThemes)
                ? parsed.savedThemes
                    .filter((theme) => theme && theme.id && theme.name)
                    .map((theme) => ({
                        id: String(theme.id),
                        name: String(theme.name).slice(0, 28),
                        ...normalizeCustomTheme(theme)
                    }))
                : []
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
    const explicitDate = String(entry?.date || "");

    if (/^\d{4}-\d{2}-\d{2}$/.test(explicitDate)) {
        return explicitDate;
    }

    if (entry?.createdAt) {
        const createdAt = new Date(entry.createdAt);
        if (!Number.isNaN(createdAt.getTime())) {
            return getDayKey(createdAt);
        }
    }

    return "";
}

function formatDisplayDate(date) {
    return new Intl.DateTimeFormat("de-DE", {
        weekday: "long",
        day: "2-digit",
        month: "long"
    }).format(date);
}

function formatCurrentDate() {
    return formatDisplayDate(getLogicalDate());
}

function formatRetroTitle(dayKey) {
    return new Intl.DateTimeFormat("de-DE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    }).format(parseDateKey(dayKey));
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

function extractEmojiFromName(name) {
    const text = String(name || "").trim();
    const match = text.match(/^(\p{Extended_Pictographic}(?:\uFE0F|\u200D|\p{Emoji_Modifier})*)\s*(.*)$/u);

    if (!match) {
        return { emoji: "", label: text };
    }

    return {
        emoji: match[1],
        label: match[2] || text
    };
}

function normalizeEmojiText(value) {
    return String(value || "")
        .toLowerCase()
        .replace(/ß/g, "ss")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9äöü\s-]/gi, " ")
        .replace(/[-_/]+/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function emojiTokens(value) {
    return normalizeEmojiText(value)
        .split(" ")
        .filter((token) => token.length >= 2);
}

function levenshteinDistance(a, b) {
    if (a === b) return 0;
    if (!a.length) return b.length;
    if (!b.length) return a.length;

    const row = Array.from({ length: b.length + 1 }, (_, i) => i);

    for (let i = 1; i <= a.length; i += 1) {
        let previous = row[0];
        row[0] = i;

        for (let j = 1; j <= b.length; j += 1) {
            const temp = row[j];
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            row[j] = Math.min(
                row[j] + 1,
                row[j - 1] + 1,
                previous + cost
            );
            previous = temp;
        }
    }

    return row[b.length];
}

const EMOJI_CONCEPTS = [
    { emoji: "⛏️", keywords: ["minecraft", "mine craft", "mining", "erz abbauen", "abbauen", "spitzhacke"] },
    { emoji: "🎮", keywords: ["gaming", "game", "games", "videospiel", "videospiele", "zocken", "spielen", "playstation", "ps5", "xbox", "steam", "konsole", "pc spiel"] },
    { emoji: "🛒", keywords: ["einkauf", "einkaufen", "einkaufen gehen", "supermarkt", "lebensmittel kaufen", "shopping lebensmittel", "wocheneinkauf"] },
    { emoji: "🛍️", keywords: ["shopping", "shoppen", "kleidung kaufen", "sachen kaufen", "laden gehen", "geschenke kaufen"] },
    { emoji: "🧹", keywords: ["putzen", "sauber machen", "saubermachen", "wohnung putzen", "zimmer putzen", "aufräumen", "aufräumen", "ordnung machen", "kehren", "fegen", "staub wischen", "staubwischen"] },
    { emoji: "🧽", keywords: ["wischen", "abwischen", "bad putzen", "küche putzen", "oberflächen reinigen", "spülen reinigen", "schrubben"] },
    { emoji: "🧺", keywords: ["wäsche", "waesche", "waschen", "wäsche waschen", "waschmaschine", "kleidung waschen", "wäsche aufhängen", "waesche aufhaengen"] },
    { emoji: "🗑️", keywords: ["müll", "muell", "abfall", "müll rausbringen", "müll wegbringen", "mülleimer", "papierkorb leeren", "recycling"] },
    { emoji: "🪥", keywords: ["zähne putzen", "zaehne putzen", "zahnpflege", "zahnbürste", "zahnbuerste", "zähne", "zaehne"] },
    { emoji: "🦷", keywords: ["zahnarzt", "zahn", "zahnreinigung", "zahntermin"] },
    { emoji: "🚿", keywords: ["duschen", "dusche", "baden", "körperpflege", "koerperpflege", "waschen gehen"] },
    { emoji: "🧴", keywords: ["hautpflege", "creme", "eincremen", "sonnencreme", "pflege"] },
    { emoji: "🪒", keywords: ["rasieren", "rasur", "bart rasieren"] },
    { emoji: "💊", keywords: ["medikament", "medikamente", "tablette", "tabletten", "vitamin", "vitamine", "supplement", "nahrungsergänzung", "nahrungsergaenzung", "pille nehmen"] },
    { emoji: "🥄", keywords: ["kreatin", "creatin", "proteinpulver", "pulver nehmen"] },
    { emoji: "💧", keywords: ["wasser", "wasser trinken", "trinken", "hydrieren", "flasche wasser"] },
    { emoji: "☕", keywords: ["kaffee", "coffee", "espresso", "cappuccino"] },
    { emoji: "🍵", keywords: ["tee", "grüner tee", "gruener tee"] },
    { emoji: "🥗", keywords: ["salat", "gesund essen", "gesundes essen", "gemüse", "gemuese", "healthy food", "gesund ernähren", "gesund ernaehren"] },
    { emoji: "🍎", keywords: ["obst", "apfel", "frucht", "früchte", "fruechte"] },
    { emoji: "🥦", keywords: ["brokkoli", "gemüse essen", "gemuese essen", "greens"] },
    { emoji: "🍫", keywords: ["süßigkeiten", "suessigkeiten", "süßes", "suesses", "schokolade", "zucker", "snack", "naschen"] },
    { emoji: "🍔", keywords: ["fast food", "burger", "junkfood", "junk food"] },
    { emoji: "🍕", keywords: ["pizza"] },
    { emoji: "🍺", keywords: ["bier", "alkohol trinken", "alkohol"] },
    { emoji: "🚭", keywords: ["nicht rauchen", "rauchfrei", "zigarette vermeiden", "rauchen vermeiden"] },
    { emoji: "🏃", keywords: ["joggen", "laufen", "rennen", "run", "running", "dauerlauf", "lauftraining"] },
    { emoji: "🚶", keywords: ["spazieren", "spaziergang", "gehen", "walk", "walking", "runde gehen", "gassi"] },
    { emoji: "👣", keywords: ["schritte", "10000 schritte", "10 000 schritte", "zehntausend schritte", "steps"] },
    { emoji: "🏋️", keywords: ["sport", "training", "gym", "fitness", "krafttraining", "fitnessstudio", "workout", "hantel", "muskeln"] },
    { emoji: "🤸", keywords: ["gymnastik", "turnen", "mobilität", "mobilitaet", "beweglichkeit"] },
    { emoji: "🧘", keywords: ["yoga", "dehnen", "stretching", "rückengymnastik", "rueckengymnastik", "rückenübung", "rueckenuebung", "physio", "pilates", "meditation"] },
    { emoji: "🚴", keywords: ["fahrrad", "radfahren", "bike", "cycling", "rad fahren"] },
    { emoji: "🏊", keywords: ["schwimmen", "schwimmbad", "swimming"] },
    { emoji: "⚽", keywords: ["fußball", "fussball", "football", "kicken"] },
    { emoji: "🏀", keywords: ["basketball"] },
    { emoji: "🎾", keywords: ["tennis"] },
    { emoji: "🏓", keywords: ["tischtennis", "ping pong"] },
    { emoji: "🥊", keywords: ["boxen", "boxing", "kampfsport"] },
    { emoji: "🥾", keywords: ["wandern", "hiking", "wanderung"] },
    { emoji: "🛌", keywords: ["ins bett", "bett gehen", "schlafen gehen", "früh schlafen", "frueh schlafen"] },
    { emoji: "😴", keywords: ["schlaf", "schlafen", "ausschlafen", "schlafroutine", "powernap", "nap"] },
    { emoji: "⏰", keywords: ["aufstehen", "wecker", "früh aufstehen", "frueh aufstehen", "rechtzeitig aufstehen"] },
    { emoji: "📋", keywords: ["todo", "to do", "to-do", "liste öffnen", "liste oeffnen", "aufgabenliste", "checkliste", "plan öffnen", "plan oeffnen"] },
    { emoji: "✅", keywords: ["abhaken", "erledigen", "erledigt", "fertig machen", "aufgabe abschließen", "aufgabe abschliessen", "todo erledigen"] },
    { emoji: "🗓️", keywords: ["kalender", "termin", "termine", "planung", "woche planen", "tag planen", "schedule"] },
    { emoji: "⏳", keywords: ["zeitmanagement", "pomodoro", "fokuszeit", "timer"] },
    { emoji: "🎯", keywords: ["ziel", "ziele", "challenge", "vorhaben", "projektziel"] },
    { emoji: "📖", keywords: ["lesen", "buch", "bücher", "buecher", "roman", "literatur", "read"] },
    { emoji: "🎓", keywords: ["lernen", "studieren", "studium", "kurs", "weiterbildung", "prüfung lernen", "pruefung lernen", "schule"] },
    { emoji: "📝", keywords: ["schreiben", "notizen", "notiz", "tagebuch", "journal", "aufschreiben", "text schreiben"] },
    { emoji: "🧠", keywords: ["denken", "konzentrieren", "fokus", "mental", "gehirn", "achtsamkeit", "mindfulness"] },
    { emoji: "🧩", keywords: ["rätsel", "raetsel", "puzzle", "logik"] },
    { emoji: "💼", keywords: ["arbeit", "job", "arbeiten", "büro", "buero", "office", "beruf"] },
    { emoji: "💻", keywords: ["computer", "pc", "laptop", "programmieren", "coding", "code", "software", "entwickeln"] },
    { emoji: "📧", keywords: ["email", "e-mail", "mail", "mails", "postfach", "inbox"] },
    { emoji: "📞", keywords: ["anrufen", "telefonieren", "telefonat", "call"] },
    { emoji: "💬", keywords: ["nachricht", "schreiben antworten", "chat", "whatsapp", "antworten"] },
    { emoji: "📦", keywords: ["paket", "paket abholen", "paket verschicken", "versand", "post"] },
    { emoji: "📬", keywords: ["briefkasten", "post holen", "post öffnen", "post oeffnen"] },
    { emoji: "💰", keywords: ["geld", "sparen", "finanzen", "budget", "konto", "vermögen", "vermoegen"] },
    { emoji: "💳", keywords: ["rechnung bezahlen", "bezahlen", "zahlung", "karte", "kreditkarte"] },
    { emoji: "🏦", keywords: ["bank", "überweisung", "ueberweisung", "banking"] },
    { emoji: "📈", keywords: ["aktien", "börse", "boerse", "investment", "investieren", "depot", "rendite"] },
    { emoji: "🧾", keywords: ["rechnung", "beleg", "quittung", "steuer", "steuererklärung", "steuererklaerung"] },
    { emoji: "🧑‍🤝‍🧑", keywords: ["freunde", "freund treffen", "freunde treffen", "sozial", "menschen treffen", "social"] },
    { emoji: "👨‍👩‍👧‍👦", keywords: ["familie", "eltern", "familie besuchen", "familie treffen"] },
    { emoji: "❤️", keywords: ["partner", "freundin", "freund", "beziehung", "date", "liebe"] },
    { emoji: "🐕", keywords: ["hund", "gassi gehen", "haustier", "dog"] },
    { emoji: "🐈", keywords: ["katze", "cat"] },
    { emoji: "🎸", keywords: ["gitarre", "gitarre spielen", "instrument", "musik machen"] },
    { emoji: "🎹", keywords: ["klavier", "piano", "keyboard spielen"] },
    { emoji: "🎵", keywords: ["musik", "musik hören", "musik hoeren", "song", "playlist"] },
    { emoji: "🎧", keywords: ["podcast", "hörbuch", "hoerbuch", "kopfhörer", "kopfhoerer"] },
    { emoji: "🎬", keywords: ["film", "kino", "movie", "serie", "netflix", "fernsehen"] },
    { emoji: "📺", keywords: ["tv", "fernsehen schauen", "youtube"] },
    { emoji: "📷", keywords: ["foto", "fotografieren", "kamera", "bilder machen"] },
    { emoji: "🎨", keywords: ["malen", "zeichnen", "kunst", "design", "kreativ"] },
    { emoji: "✂️", keywords: ["basteln", "schneiden", "handarbeit"] },
    { emoji: "🌱", keywords: ["pflanzen", "pflanze gießen", "pflanzen giessen", "garten", "gärtnern", "gaertnern"] },
    { emoji: "🪴", keywords: ["zimmerpflanze", "blumen gießen", "blumen giessen"] },
    { emoji: "🍳", keywords: ["kochen", "essen kochen", "küche", "kueche", "meal prep"] },
    { emoji: "🥣", keywords: ["frühstück", "fruehstueck", "müsli", "muesli"] },
    { emoji: "🍽️", keywords: ["essen", "mittagessen", "abendessen", "mahlzeit"] },
    { emoji: "🧼", keywords: ["hände waschen", "haende waschen", "seife", "hygiene"] },
    { emoji: "🛏️", keywords: ["bett machen", "bett beziehen", "bettwäsche", "bettwaesche"] },
    { emoji: "🚗", keywords: ["auto", "fahren", "autofahrt", "wagen", "car"] },
    { emoji: "⛽", keywords: ["tanken", "benzin", "tankstelle", "sprit"] },
    { emoji: "🔧", keywords: ["reparieren", "reparatur", "werkzeug", "handwerken", "fixen"] },
    { emoji: "🛞", keywords: ["reifen", "räder", "raeder", "reifen wechseln"] },
    { emoji: "🚌", keywords: ["bus", "öffis", "oeffis", "nahverkehr"] },
    { emoji: "🚆", keywords: ["zug", "bahn", "deutsche bahn", "train"] },
    { emoji: "✈️", keywords: ["flug", "fliegen", "reise", "urlaub", "airport", "flughafen"] },
    { emoji: "🧳", keywords: ["koffer", "packen", "reise packen", "gepäck", "gepaeck"] },
    { emoji: "🗺️", keywords: ["route planen", "reise planen", "karte", "navigation"] },
    { emoji: "🏠", keywords: ["wohnung", "haus", "zuhause", "home"] },
    { emoji: "🔑", keywords: ["schlüssel", "schluessel", "schloss", "wohnungsschlüssel"] },
    { emoji: "🛠️", keywords: ["heimwerken", "bauen", "montieren", "möbel aufbauen", "moebel aufbauen"] },
    { emoji: "🛒", keywords: ["drogerie", "aldi", "lidl", "rewe", "edeka", "kaufland"] },
    { emoji: "💇", keywords: ["friseur", "haare schneiden", "haarschnitt"] },
    { emoji: "👕", keywords: ["kleidung", "anziehen", "outfit", "klamotten"] },
    { emoji: "👟", keywords: ["schuhe", "sneaker"] },
    { emoji: "🩺", keywords: ["arzt", "arzttermin", "untersuchung", "gesundheitscheck", "doktor"] },
    { emoji: "🏥", keywords: ["krankenhaus", "klinik"] },
    { emoji: "🩸", keywords: ["blut", "bluttest", "blutabnahme"] },
    { emoji: "💉", keywords: ["impfung", "impfen", "spritze"] },
    { emoji: "🌞", keywords: ["sonne", "tageslicht", "rausgehen", "frische luft"] },
    { emoji: "🌳", keywords: ["natur", "wald", "park", "draußen", "draussen"] },
    { emoji: "📱", keywords: ["handy", "smartphone", "iphone", "telefon"] },
    { emoji: "🚫", keywords: ["vermeiden", "nicht machen", "aufhören", "aufhoeren", "verzicht", "kein"] },
    { emoji: "📵", keywords: ["weniger handy", "kein handy", "handypause", "digital detox", "social media vermeiden"] },
    { emoji: "⏱️", keywords: ["zeit stoppen", "stoppuhr", "dauer messen"] },
    { emoji: "🧘‍♂️", keywords: ["entspannen", "relaxen", "ruhe", "pause", "stress reduzieren"] },
    { emoji: "🙏", keywords: ["dankbarkeit", "dankbar", "beten", "gebet"] },
    { emoji: "🌬️", keywords: ["atmen", "atemübung", "atemuebung", "breathing"] },
    { emoji: "🧊", keywords: ["kalt duschen", "eisbad", "kälte", "kaelte"] },
    { emoji: "🔥", keywords: ["sauna", "wärme", "waerme"] },
    { emoji: "⭐", keywords: ["wichtig", "priorität", "prioritaet", "extra", "bonus"] }
];

const GENERIC_EMOJI_FALLBACKS = [
    { pattern: /\b(essen|mahlzeit|nahrung)\b/, emoji: "🍽️" },
    { pattern: /\b(trinken|getrank)\b/, emoji: "🥤" },
    { pattern: /\b(machen|erledigen|abschliessen|abschließen)\b/, emoji: "✅" },
    { pattern: /\b(lernen|üben|ueben)\b/, emoji: "📚" },
    { pattern: /\b(spielen|spiel)\b/, emoji: "🎮" },
    { pattern: /\b(kaufen|einkauf)\b/, emoji: "🛒" },
    { pattern: /\b(reinigen|putzen|sauber)\b/, emoji: "🧹" },
    { pattern: /\b(fahren|fahrt)\b/, emoji: "🚗" },
    { pattern: /\b(termin|treffen)\b/, emoji: "📅" }
];

function scoreEmojiConcept(text, tokens, concept) {
    let score = 0;

    for (const rawKeyword of concept.keywords) {
        const keyword = normalizeEmojiText(rawKeyword);
        if (!keyword) continue;

        if (text === keyword) {
            score = Math.max(score, 180 + keyword.length);
            continue;
        }

        if (text.includes(keyword)) {
            score = Math.max(score, 110 + Math.min(keyword.length, 30));
        }

        const keywordTokens = keyword.split(" ").filter(Boolean);
        const matchedTokens = keywordTokens.filter((keywordToken) =>
            tokens.includes(keywordToken)
        ).length;

        if (keywordTokens.length && matchedTokens === keywordTokens.length) {
            score = Math.max(score, 75 + matchedTokens * 12);
        } else if (matchedTokens > 0) {
            score = Math.max(score, 34 + matchedTokens * 10);
        }

        if (keywordTokens.length === 1 && keywordTokens[0].length >= 5) {
            for (const token of tokens) {
                if (token.length < 5) continue;
                const distance = levenshteinDistance(token, keywordTokens[0]);

                if (distance === 1) {
                    score = Math.max(score, 42);
                } else if (distance === 2 && Math.max(token.length, keywordTokens[0].length) >= 8) {
                    score = Math.max(score, 25);
                }
            }
        }
    }

    return score;
}

function suggestEmoji(name) {
    const text = normalizeEmojiText(name);
    if (!text) return "🎯";

    const remembered = emojiMemoryCache[text];
    if (remembered) return remembered;

    const tokens = emojiTokens(text);
    let bestEmoji = "";
    let bestScore = 0;

    for (const concept of EMOJI_CONCEPTS) {
        const score = scoreEmojiConcept(text, tokens, concept);

        if (score > bestScore) {
            bestScore = score;
            bestEmoji = concept.emoji;
        }
    }

    if (bestEmoji && bestScore >= 25) {
        return bestEmoji;
    }

    for (const fallback of GENERIC_EMOJI_FALLBACKS) {
        if (fallback.pattern.test(text)) {
            return fallback.emoji;
        }
    }

    return "🎯";
}

function splitEmojiAndName(name, emoji = "") {
    const parsed = extractEmojiFromName(name);
    return {
        emoji: emoji || parsed.emoji || suggestEmoji(parsed.label),
        label: parsed.label
    };
}

function normalizeCustomTheme(value) {
    const fallback = { background: "#11151d", surface: "#1c2330", accent: "#7b8cff" };
    if (!value || typeof value !== "object") return fallback;
    const valid = (v, f) => /^#[0-9a-f]{6}$/i.test(String(v || "")) ? String(v) : f;
    return {
        background: valid(value.background, fallback.background),
        surface: valid(value.surface, fallback.surface),
        accent: valid(value.accent, fallback.accent)
    };
}

function hexToRgb(hex) {
    const value = String(hex).replace("#", "");
    return {
        r: parseInt(value.slice(0, 2), 16),
        g: parseInt(value.slice(2, 4), 16),
        b: parseInt(value.slice(4, 6), 16)
    };
}

function relativeLuminance(hex) {
    const { r, g, b } = hexToRgb(hex);
    const channels = [r, g, b].map((channel) => {
        const c = channel / 255;
        return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function mixHex(hexA, hexB, ratio) {
    const a = hexToRgb(hexA);
    const b = hexToRgb(hexB);
    const mix = (x, y) => Math.round(x + (y - x) * ratio).toString(16).padStart(2, "0");
    return `#${mix(a.r,b.r)}${mix(a.g,b.g)}${mix(a.b,b.b)}`;
}

const BUILT_IN_THEME_PALETTES = {
    classic: { background: "#f3f5f8", surface: "#ffffff", accent: "#3448d8" },
    forest: { background: "#edf4ef", surface: "#fbfdfb", accent: "#257052" },
    dark: { background: "#11151d", surface: "#1c2330", accent: "#7b8cff" },
    warm: { background: "#f7f0e7", surface: "#fffaf4", accent: "#b85f3f" },
    cyber: { background: "#080d14", surface: "#111b21", accent: "#8cff5b" },
    violet: { background: "#120d1d", surface: "#21172e", accent: "#bf69ff" },
    cyan: { background: "#07171a", surface: "#10262b", accent: "#43e7ff" },
    ember: { background: "#18100e", surface: "#2a1915", accent: "#ff7448" }
};

function getSavedThemeById(id) {
    return (state.savedThemes || []).find((theme) => theme.id === id) || null;
}

function getThemePalette(themeName = state.theme) {
    if (BUILT_IN_THEME_PALETTES[themeName]) {
        return normalizeCustomTheme(BUILT_IN_THEME_PALETTES[themeName]);
    }

    if (themeName === "custom") {
        return normalizeCustomTheme(state.customTheme);
    }

    if (String(themeName).startsWith("saved:")) {
        const saved = getSavedThemeById(String(themeName).slice(6));
        if (saved) return normalizeCustomTheme(saved);
    }

    return normalizeCustomTheme(BUILT_IN_THEME_PALETTES.dark);
}

function applyPaletteVariables(palette) {
    const custom = normalizeCustomTheme(palette);
    const darkSurface = relativeLuminance(custom.surface) < 0.34;
    const text = darkSurface ? "#f4f7fb" : "#172033";
    const muted = darkSurface
        ? mixHex(custom.surface, "#ffffff", 0.60)
        : mixHex(custom.surface, "#000000", 0.55);
    const border = darkSurface
        ? mixHex(custom.surface, "#ffffff", 0.16)
        : mixHex(custom.surface, "#000000", 0.14);
    const soft = darkSurface
        ? mixHex(custom.surface, "#ffffff", 0.07)
        : mixHex(custom.surface, "#000000", 0.04);
    const primaryDark = mixHex(custom.accent, "#000000", 0.18);
    const root = document.documentElement.style;

    root.setProperty("--background", custom.background);
    root.setProperty("--surface", custom.surface);
    root.setProperty("--surface-soft", soft);
    root.setProperty("--text", text);
    root.setProperty("--muted", muted);
    root.setProperty("--border", border);
    root.setProperty("--primary", custom.accent);
    root.setProperty("--primary-dark", primaryDark);
    document.body.style.colorScheme = darkSurface ? "dark" : "light";
}


function isRetroEntryMode() {
    return Boolean(
        selectedEntryDayKey &&
        compareDateKeys(selectedEntryDayKey, getTodayKey()) < 0 &&
        Date.now() < retroEntryExpiresAt
    );
}

function getEntryTargetDayKey() {
    if (!isRetroEntryMode()) {
        if (selectedEntryDayKey) {
            selectedEntryDayKey = null;
            retroEntryExpiresAt = 0;
        }
        return getTodayKey();
    }

    return selectedEntryDayKey;
}

function getEntryTargetDate() {
    return parseDateKey(getEntryTargetDayKey());
}

function getEntryTargetHistory() {
    return getHistoryForDayKey(getEntryTargetDayKey());
}

function getEntryTargetXp() {
    return getDayXp(getEntryTargetDayKey());
}

function hasTaskBeenCompletedOnEntryDay(taskId) {
    return getEntryTargetHistory().some((entry) => entry.taskId === taskId);
}

function stopRetroEntryMode({ renderAfter = true } = {}) {
    selectedEntryDayKey = null;
    retroEntryExpiresAt = 0;

    if (retroEntryTimer) {
        clearInterval(retroEntryTimer);
        retroEntryTimer = null;
    }

    if (renderAfter) render();
}

function updateRetroEntryBanner() {
    if (!elements.retroDayBanner) return;

    if (!isRetroEntryMode()) {
        elements.retroDayBanner.hidden = true;
        return;
    }

    const remainingMs = Math.max(0, retroEntryExpiresAt - Date.now());
    const remainingSeconds = Math.ceil(remainingMs / 1000);
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;

    elements.retroDayBanner.hidden = false;
    elements.retroDayBannerTitle.textContent =
        `Nachtragen für ${formatRetroTitle(selectedEntryDayKey)}`;
    elements.retroDayBannerText.textContent =
        `Noch ${minutes}:${String(seconds).padStart(2, "0")} aktiv`;
}

function startRetroEntryMode(dayKey) {
    const todayKey = getTodayKey();

    if (compareDateKeys(dayKey, todayKey) >= 0) return;

    const confirmed = window.confirm(
        `Bist du dir sicher, dass du zum ${formatRetroTitle(dayKey)} springen willst?\\n\\n` +
        "Sei ehrlich: Trage nur Aktivitäten ein, die du an diesem Tag wirklich gemacht hast."
    );

    if (!confirmed) return;

    selectedEntryDayKey = dayKey;
    retroEntryExpiresAt = Date.now() + 60 * 1000;
    currentView = "today";

    if (retroEntryTimer) clearInterval(retroEntryTimer);

    retroEntryTimer = setInterval(() => {
        if (!isRetroEntryMode()) {
            stopRetroEntryMode();
            return;
        }

        updateRetroEntryBanner();
    }, 1000);

    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
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
    const builtIns = Object.keys(BUILT_IN_THEME_PALETTES);
    const selected = String(state.theme || "dark");
    const isSaved = selected.startsWith("saved:") && getSavedThemeById(selected.slice(6));
    const isCustomLike = selected === "custom" || isSaved;

    const displayTheme = builtIns.includes(selected)
        ? selected
        : isCustomLike
            ? "custom"
            : "dark";

    document.body.dataset.theme = displayTheme;
    document.documentElement.removeAttribute("style");

    const palette = getThemePalette(
        builtIns.includes(selected) || isCustomLike ? selected : "dark"
    );

    if (isCustomLike) {
        applyPaletteVariables(palette);
    } else {
        document.body.style.colorScheme = "";
    }

    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (themeColorMeta) {
        themeColorMeta.setAttribute("content", palette.background);
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
    const todayXp = getEntryTargetXp();
    const totalXp = getTotalXp();
    const goal = state.dailyGoal;
    const retroMode = isRetroEntryMode();
    const displayDate = retroMode ? getEntryTargetDate() : getLogicalDate();

    document.body.classList.toggle("retro-entry-mode", retroMode);
    elements.todayTitle.textContent = retroMode
        ? formatRetroTitle(getEntryTargetDayKey())
        : "Heute";
    elements.currentDate.textContent = formatDisplayDate(displayDate);
    elements.todayXp.textContent = todayXp;
    elements.totalXp.textContent = `${totalXp} XP`;
    elements.dailyGoal.textContent = goal;
    elements.dailyGoalInput.value = goal;
    updateRetroEntryBanner();

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
        elements.goalStatus.textContent = isRetroEntryMode()
            ? "✓ Tagesziel an diesem Tag geschafft"
            : "✓ Tagesziel geschafft";
    } else {
        elements.goalStatus.textContent = `Noch ${goal - todayXp} XP`;
    }
}

function makeTodayTaskElement(task) {
    const parts = splitEmojiAndName(task.name, task.emoji);
    const completedToday = !task.repeatable && hasTaskBeenCompletedOnEntryDay(task.id);

    const card = document.createElement("article");
    card.className = "task-tile sortable-tile";
    card.dataset.taskId = task.id;
    card.draggable = window.matchMedia("(pointer: fine)").matches;
    card.tabIndex = completedToday ? -1 : 0;
    card.setAttribute("role", "button");
    card.setAttribute(
        "aria-label",
        completedToday
            ? `${parts.label}, an diesem Tag bereits erledigt`
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
    emoji.textContent = parts.emoji;

    const name = document.createElement("span");
    name.className = "task-tile-name";
    name.textContent = parts.label;

    const xp = document.createElement("strong");
    xp.className = "task-tile-xp";
    xp.textContent = completedToday ? (isRetroEntryMode() ? "An diesem Tag erledigt" : "Heute erledigt") : formatXp(task.xp);

    card.append(dragHandle, emoji, name, xp);

    if (completedToday) {
        const completedCheck = document.createElement("span");
        completedCheck.className = "task-completed-check";
        completedCheck.textContent = "✓";
        completedCheck.setAttribute("aria-hidden", "true");
        card.appendChild(completedCheck);
    }

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
    const hasEntries = getEntryTargetHistory().length > 0;
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

        const dayNumber = document.createElement("strong");
        dayNumber.className = "month-day-number";
        dayNumber.textContent = day;

        const xpNumber = document.createElement("small");
        xpNumber.className = "month-day-xp";
        xpNumber.textContent = isNeutral ? "" : `${value} XP`;

        cell.append(dayNumber, xpNumber);
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

        const isPast = compareDateKeys(key, todayKey) < 0;

        if (isPast) {
            cell.classList.add("clickable-past");
            cell.tabIndex = 0;
            cell.setAttribute(
                "aria-label",
                `${formatRetroTitle(key)} nachträglich bearbeiten`
            );

            const openPastDay = () => startRetroEntryMode(key);
            cell.addEventListener("click", openPastDay);
            cell.addEventListener("keydown", (event) => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    openPastDay();
                }
            });
        }

        elements.monthCalendar.appendChild(cell);
    }
}

function createManageItem(task, active) {
    const item = document.createElement("article");
    item.className = "manage-item";
    item.dataset.taskId = task.id;
    item.dataset.active = active ? "true" : "false";
    item.draggable = window.matchMedia("(pointer: fine)").matches;
    item.classList.add("sortable-item");

    const dragHandle = document.createElement("button");
    dragHandle.type = "button";
    dragHandle.className = "drag-handle";
    dragHandle.setAttribute(
        "aria-label",
        active
            ? `${task.emoji || ""} ${task.name} verschieben`
            : `${task.emoji || ""} ${task.name} in Aktiv verschieben`
    );
    dragHandle.textContent = "≡";

    if (active) {
        setupManageDragHandle(dragHandle, item, task.id);
    } else {
        setupCatalogDragHandle(dragHandle, item, task.id);
    }

    item.appendChild(dragHandle);

    const text = document.createElement("div");
    text.className = "manage-item-text";

    const name = document.createElement("strong");
    name.textContent = `${task.emoji || suggestEmoji(task.name)} ${task.name}`;

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
let draggedCatalogTaskId = null;
let catalogDropTargetId = null;
let catalogDropAfter = true;
let manageDeactivateDropActive = false;

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



function clearDeactivateDropIndicator() {
    manageDeactivateDropActive = false;
    elements.inactiveTaskList?.classList.remove("deactivate-drop-zone");
}

function updateDeactivateDropIndicator(clientX, clientY) {
    clearDeactivateDropIndicator();

    const rect = elements.inactiveTaskList?.getBoundingClientRect();

    if (!rect) return false;

    const inside =
        clientX >= rect.left &&
        clientX <= rect.right &&
        clientY >= rect.top - 44 &&
        clientY <= rect.bottom + 44;

    if (inside) {
        manageDeactivateDropActive = true;
        elements.inactiveTaskList.classList.add("deactivate-drop-zone");
    }

    return inside;
}

function deactivateTaskToCatalog(taskId) {
    const task = state.tasks.find((item) => item.id === taskId);
    if (!task || !task.active) return false;

    const activeTasks = state.tasks.filter(
        (item) => item.active && item.id !== taskId
    );
    const inactiveTasks = state.tasks.filter(
        (item) => !item.active && item.id !== taskId
    );

    task.active = false;

    // Neu ausgeblendete Aktivität steht im Katalog zunächst ganz oben.
    state.tasks = [
        ...activeTasks,
        task,
        ...inactiveTasks
    ];

    saveState();
    render();
    return true;
}

function finishDeactivateDrop(taskId) {
    const shouldDeactivate =
        manageDeactivateDropActive ||
        elements.inactiveTaskList?.classList.contains("deactivate-drop-zone");

    clearDeactivateDropIndicator();

    if (!shouldDeactivate) return false;

    return deactivateTaskToCatalog(taskId);
}

function clearCatalogDropIndicators() {
    document.querySelectorAll(".catalog-drop-before, .catalog-drop-after").forEach((item) => {
        item.classList.remove("catalog-drop-before", "catalog-drop-after");
    });

    elements.activeTaskList?.classList.remove("catalog-drop-zone");
    catalogDropTargetId = null;
    catalogDropAfter = true;
}

function updateCatalogDropIndicator(clientX, clientY) {
    clearCatalogDropIndicators();

    const target = document
        .elementFromPoint(clientX, clientY)
        ?.closest("#activeTaskList .manage-item[data-task-id]");

    const activeListRect = elements.activeTaskList?.getBoundingClientRect();
    const insideActiveList =
        activeListRect &&
        clientX >= activeListRect.left &&
        clientX <= activeListRect.right &&
        clientY >= activeListRect.top - 36 &&
        clientY <= activeListRect.bottom + 36;

    if (!target) {
        if (insideActiveList) {
            elements.activeTaskList.classList.add("catalog-drop-zone");
        }
        return insideActiveList;
    }

    const rect = target.getBoundingClientRect();
    catalogDropTargetId = target.dataset.taskId;
    catalogDropAfter = clientY > rect.top + rect.height / 2;

    target.classList.add(
        catalogDropAfter ? "catalog-drop-after" : "catalog-drop-before"
    );

    elements.activeTaskList.classList.add("catalog-drop-zone");
    return true;
}

function activateCatalogTaskAtPosition(taskId, targetId = null, insertAfter = true) {
    const task = state.tasks.find((item) => item.id === taskId);
    if (!task) return;

    task.active = true;

    const activeIds = state.tasks
        .filter((item) => item.active && item.id !== taskId)
        .map((item) => item.id);

    if (targetId && activeIds.includes(targetId)) {
        const targetIndex = activeIds.indexOf(targetId);
        activeIds.splice(targetIndex + (insertAfter ? 1 : 0), 0, taskId);
    } else {
        activeIds.push(taskId);
    }

    applyActiveOrder(activeIds);
    render();
}

function finishCatalogDrop(taskId) {
    const activeList = elements.activeTaskList;
    const hasValidDrop =
        activeList?.classList.contains("catalog-drop-zone");

    const targetId = catalogDropTargetId;
    const insertAfter = catalogDropAfter;

    clearCatalogDropIndicators();

    if (!hasValidDrop) return false;

    activateCatalogTaskAtPosition(taskId, targetId, insertAfter);
    return true;
}

function setupCatalogDragHandle(handle, item, taskId) {
    item.addEventListener("dragstart", (event) => {
        if (event.target.closest(".manage-actions")) {
            event.preventDefault();
            return;
        }

        draggedCatalogTaskId = taskId;
        item.classList.add("dragging");
        document.body.classList.add("catalog-dragging");

        if (event.dataTransfer) {
            event.dataTransfer.effectAllowed = "move";
            event.dataTransfer.setData("text/plain", taskId);
            setFullCardDragPreview(event, item);
        }
    });

    item.addEventListener("dragend", () => {
        item.classList.remove("dragging");
        document.body.classList.remove("catalog-dragging");
        clearCatalogDropIndicators();
        draggedCatalogTaskId = null;
    });

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
        if (event.target.closest(".manage-actions")) return;

        const touch = event.touches[0];
        startX = touch.clientX;
        startY = touch.clientY;
        touchDragStarted = false;
        cancelHold();

        holdTimer = setTimeout(() => {
            draggedCatalogTaskId = taskId;
            touchDragStarted = true;
            item.classList.add("dragging");
            document.body.classList.add("live-reordering", "catalog-dragging");
            createTouchDragGhost(item, startX, startY);
        }, 180);
    }, { passive: true });

    item.addEventListener("touchmove", (event) => {
        if (event.touches.length !== 1) return;

        const touch = event.touches[0];

        if (!touchDragStarted) {
            const moved = Math.hypot(
                touch.clientX - startX,
                touch.clientY - startY
            );
            if (moved > 8) cancelHold();
            return;
        }

        event.preventDefault();
        moveTouchDragGhost(touch.clientX, touch.clientY);
        updateCatalogDropIndicator(touch.clientX, touch.clientY);

        const viewportEdge = 72;
        if (touch.clientY < viewportEdge) {
            window.scrollBy({ top: -10, behavior: "auto" });
        } else if (touch.clientY > window.innerHeight - viewportEdge) {
            window.scrollBy({ top: 10, behavior: "auto" });
        }
    }, { passive: false });

    const finishTouchCatalogDrag = () => {
        cancelHold();

        if (!touchDragStarted || draggedCatalogTaskId !== taskId) {
            touchDragStarted = false;
            return;
        }

        item.classList.remove("dragging");
        removeTouchDragGhost();
        document.body.classList.remove("live-reordering", "catalog-dragging");

        const dropped = finishCatalogDrop(taskId);

        draggedCatalogTaskId = null;
        touchDragStarted = false;

        if (!dropped) {
            renderManagement();
        }
    };

    item.addEventListener("touchend", finishTouchCatalogDrag, { passive: true });
    item.addEventListener("touchcancel", finishTouchCatalogDrag, { passive: true });

    handle.addEventListener("click", (event) => event.stopPropagation());
}

function setupCatalogDropZone() {
    if (!elements.activeTaskList) return;

    elements.activeTaskList.addEventListener("dragover", (event) => {
        if (!draggedCatalogTaskId) return;
        event.preventDefault();

        if (event.dataTransfer) {
            event.dataTransfer.dropEffect = "move";
        }

        updateCatalogDropIndicator(event.clientX, event.clientY);
    });

    elements.activeTaskList.addEventListener("drop", (event) => {
        if (!draggedCatalogTaskId) return;
        event.preventDefault();

        const taskId = draggedCatalogTaskId;
        finishCatalogDrop(taskId);

        draggedCatalogTaskId = null;
        document.body.classList.remove("catalog-dragging");
    });

    elements.activeTaskList.addEventListener("dragleave", (event) => {
        if (!draggedCatalogTaskId) return;

        const rect = elements.activeTaskList.getBoundingClientRect();
        const outside =
            event.clientX < rect.left ||
            event.clientX > rect.right ||
            event.clientY < rect.top ||
            event.clientY > rect.bottom;

        if (outside) {
            clearCatalogDropIndicators();
        }
    });

    if (elements.inactiveTaskList) {
        elements.inactiveTaskList.addEventListener("dragover", (event) => {
            if (!draggedManageTaskId) return;

            event.preventDefault();

            if (event.dataTransfer) {
                event.dataTransfer.dropEffect = "move";
            }

            updateDeactivateDropIndicator(event.clientX, event.clientY);
        });

        elements.inactiveTaskList.addEventListener("drop", (event) => {
            if (!draggedManageTaskId) return;

            event.preventDefault();

            const taskId = draggedManageTaskId;

            // null signalisiert dem dragend-Handler, dass der Drop bereits
            // vollständig verarbeitet wurde.
            if (finishDeactivateDrop(taskId)) {
                draggedManageTaskId = null;
            }

            document.body.classList.remove("manage-deactivate-dragging");
        });

        elements.inactiveTaskList.addEventListener("dragleave", (event) => {
            if (!draggedManageTaskId) return;

            const rect = elements.inactiveTaskList.getBoundingClientRect();
            const outside =
                event.clientX < rect.left ||
                event.clientX > rect.right ||
                event.clientY < rect.top ||
                event.clientY > rect.bottom;

            if (outside) {
                clearDeactivateDropIndicator();
            }
        });
    }
}

function setupManageDragHandle(handle, item, taskId) {
    item.addEventListener("dragstart", (event) => {
        // Die Aktionsbuttons sollen auf dem Desktop weiterhin normal klickbar bleiben.
        if (event.target.closest(".manage-actions")) {
            event.preventDefault();
            return;
        }

        draggedManageTaskId = taskId;
        clearDeactivateDropIndicator();
        item.classList.add("dragging");
        document.body.classList.add("manage-deactivate-dragging");
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", taskId);
        setFullCardDragPreview(event, item);
    });

    item.addEventListener("dragend", () => {
        item.classList.remove("dragging");
        document.body.classList.remove("manage-deactivate-dragging");

        // Wenn der Drop bereits in "Verfügbar" verarbeitet wurde, wurde
        // gerendert und die Reihenfolge ist bereits korrekt gespeichert.
        if (draggedManageTaskId) {
            syncActiveOrderFromManageDom();
            renderTodayTasks();
        }

        clearDeactivateDropIndicator();
        draggedManageTaskId = null;
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

        if (updateDeactivateDropIndicator(touch.clientX, touch.clientY)) {
            return;
        }

        const target = document
            .elementFromPoint(touch.clientX, touch.clientY)
            ?.closest("#activeTaskList .manage-item[data-task-id]");

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

        const taskToFinish = draggedManageTaskId;
        const deactivated = finishDeactivateDrop(taskToFinish);

        if (!deactivated) {
            syncActiveOrderFromManageDom();
            renderTodayTasks();
        }

        touchDraggedManageItem = null;
        draggedManageTaskId = null;
        touchDragStarted = false;
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
    if (elements.themeCyber) elements.themeCyber.checked = state.theme === "cyber";
    if (elements.themeViolet) elements.themeViolet.checked = state.theme === "violet";
    if (elements.themeCyan) elements.themeCyan.checked = state.theme === "cyan";
    if (elements.themeEmber) elements.themeEmber.checked = state.theme === "ember";
    if (elements.themeCustom) elements.themeCustom.checked = state.theme === "custom";

    const editorPalette = normalizeCustomTheme(state.customTheme);
    if (elements.customBackgroundInput) elements.customBackgroundInput.value = editorPalette.background;
    if (elements.customSurfaceInput) elements.customSurfaceInput.value = editorPalette.surface;
    if (elements.customAccentInput) elements.customAccentInput.value = editorPalette.accent;

    renderSavedThemes();

    elements.dayResetInput.value = formatResetTime(state.dayResetMinutes);

    const previousMinute =
        (state.dayResetMinutes - 1 + 1440) % 1440;

    elements.dayResetHint.textContent =
        `Bis ${formatResetTime(previousMinute)} Uhr zählen Aktivitäten noch zum Vortag.`;
}


function renderSavedThemes() {
    if (!elements.savedThemeList) return;

    elements.savedThemeList.innerHTML = "";

    const themes = Array.isArray(state.savedThemes) ? state.savedThemes : [];

    if (!themes.length) {
        const hint = document.createElement("p");
        hint.className = "saved-theme-empty";
        hint.textContent = "Noch keine eigenen Designs gespeichert.";
        elements.savedThemeList.appendChild(hint);
        return;
    }

    themes.forEach((theme) => {
        const palette = normalizeCustomTheme(theme);
        const row = document.createElement("div");
        row.className = "saved-theme-row";

        const label = document.createElement("label");
        label.className = "theme-choice saved-theme-choice";

        const radio = document.createElement("input");
        radio.type = "radio";
        radio.name = "appTheme";
        radio.value = `saved:${theme.id}`;
        radio.checked = state.theme === `saved:${theme.id}`;
        radio.addEventListener("change", () => setTheme(`saved:${theme.id}`));

        const preview = document.createElement("span");
        preview.className = "theme-preview";
        preview.setAttribute("aria-hidden", "true");
        [palette.background, palette.surface, palette.accent].forEach((color) => {
            const swatch = document.createElement("i");
            swatch.style.background = color;
            preview.appendChild(swatch);
        });

        const text = document.createElement("span");
        const strong = document.createElement("strong");
        strong.textContent = theme.name;
        const small = document.createElement("small");
        small.textContent = "Eigenes Design";
        text.append(strong, small);

        label.append(radio, preview, text);

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "small-button delete-small-button saved-theme-delete";
        deleteButton.textContent = "Löschen";
        deleteButton.addEventListener("click", () => deleteSavedTheme(theme.id));

        row.append(label, deleteButton);
        elements.savedThemeList.appendChild(row);
    });
}

function saveCurrentCustomTheme() {
    const name = String(elements.customThemeNameInput?.value || "").trim();

    if (!name) {
        window.alert("Bitte gib deinem Design einen Namen.");
        elements.customThemeNameInput?.focus();
        return;
    }

    const palette = normalizeCustomTheme({
        background: elements.customBackgroundInput.value,
        surface: elements.customSurfaceInput.value,
        accent: elements.customAccentInput.value
    });

    const id = createId("theme");
    state.savedThemes = Array.isArray(state.savedThemes) ? state.savedThemes : [];
    state.savedThemes.push({
        id,
        name: name.slice(0, 28),
        ...palette
    });

    state.customTheme = palette;
    state.theme = `saved:${id}`;
    elements.customThemeNameInput.value = "";
    saveState();
    render();
}

function deleteSavedTheme(id) {
    const theme = getSavedThemeById(id);
    if (!theme) return;

    if (!window.confirm(`Design „${theme.name}“ wirklich löschen?`)) return;

    if (state.theme === `saved:${id}`) {
        state.customTheme = normalizeCustomTheme(theme);
        state.theme = "custom";
    }

    state.savedThemes = (state.savedThemes || []).filter((item) => item.id !== id);
    saveState();
    render();
}

function addHistoryEntry(task) {
    const targetDayKey = getEntryTargetDayKey();

    if (!task.repeatable && hasTaskBeenCompletedOnEntryDay(task.id)) {
        return;
    }

    state.history.push({
        id: createId("history"),
        taskId: task.id,
        taskName: `${task.emoji || ""} ${task.name}`.trim(),
        xp: Number(task.xp),
        date: targetDayKey,
        createdAt: new Date().toISOString(),
        retroactive: isRetroEntryMode()
    });

    saveState();
    render();
}

function undoLastTodayEntry() {
    const targetDayKey = getEntryTargetDayKey();

    const todayIndices = state.history
        .map((entry, index) => ({ entry, index }))
        .filter(({ entry }) => getEntryDayKey(entry) === targetDayKey)
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
    if (getEntryTargetHistory().length === 0) return;

    const targetDayKey = getEntryTargetDayKey();
    const confirmed = window.confirm(
        isRetroEntryMode()
            ? `Wirklich alle Einträge vom ${formatRetroTitle(targetDayKey)} löschen?`
            : "Wirklich alle heutigen Einträge löschen?"
    );

    if (!confirmed) return;

    state.history = state.history.filter(
        (entry) => getEntryDayKey(entry) !== targetDayKey
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
        elements.taskEmojiInput.value = task.emoji || suggestEmoji(task.name);
        elements.taskEmojiInput.dataset.manual = "true";
        elements.taskXpInput.value = task.xp;
        elements.taskRepeatableInput.checked = task.repeatable === true;
        elements.deleteCustomTaskButton.hidden = !task.custom;
    } else {
        elements.taskDialogTitle.textContent = "Neue Aktivität";
        elements.taskNameInput.value = "";
        elements.taskEmojiInput.value = "🎯";
        elements.taskEmojiInput.dataset.manual = "false";
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
    if (elements.taskEmojiInput) elements.taskEmojiInput.dataset.manual = "false";
}

function saveTask(event) {
    event.preventDefault();

    const name = extractEmojiFromName(elements.taskNameInput.value.trim()).label;
    const emoji = (elements.taskEmojiInput.value.trim() || suggestEmoji(name)).slice(0, 16);
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

    state.emojiMemory = state.emojiMemory && typeof state.emojiMemory === "object"
        ? state.emojiMemory
        : {};
    const memoryKey = normalizeEmojiText(name);
    if (memoryKey && emoji) {
        state.emojiMemory[memoryKey] = emoji;
        emojiMemoryCache[memoryKey] = emoji;
    }

    if (editingId) {
        const task = state.tasks.find((item) => item.id === editingId);

        if (!task) return;

        task.name = name;
        task.emoji = emoji;
        task.xp = xp;
        task.repeatable = repeatable;
    } else {
        state.tasks.push({
            id: createId("task"),
            name,
            emoji,
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
    const builtIns = Object.keys(BUILT_IN_THEME_PALETTES);
    const isSaved = String(theme).startsWith("saved:") && getSavedThemeById(String(theme).slice(6));

    if (![...builtIns, "custom"].includes(theme) && !isSaved) return;

    state.theme = theme;
    saveState();
    render();
}

setupCatalogDropZone();

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
if (elements.returnToTodayButton) {
    elements.returnToTodayButton.addEventListener("click", () => stopRetroEntryMode());
}
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
if (elements.themeCyber) elements.themeCyber.addEventListener("change", () => setTheme("cyber"));
if (elements.themeViolet) elements.themeViolet.addEventListener("change", () => setTheme("violet"));
if (elements.themeCyan) elements.themeCyan.addEventListener("change", () => setTheme("cyan"));
if (elements.themeEmber) elements.themeEmber.addEventListener("change", () => setTheme("ember"));
if (elements.themeCustom) {
    elements.themeCustom.addEventListener("change", () => {
        if (!elements.themeCustom.checked) return;

        const basePalette = getThemePalette(state.theme);
        state.customTheme = normalizeCustomTheme(basePalette);
        state.theme = "custom";
        saveState();
        render();
    });
}

if (elements.applyCustomThemeButton) {
    elements.applyCustomThemeButton.addEventListener("click", () => {
        state.customTheme = normalizeCustomTheme({
            background: elements.customBackgroundInput.value,
            surface: elements.customSurfaceInput.value,
            accent: elements.customAccentInput.value
        });
        state.theme = "custom";
        saveState();
        render();
    });
}

if (elements.saveCustomThemeButton) {
    elements.saveCustomThemeButton.addEventListener("click", saveCurrentCustomTheme);
}

if (elements.customThemeNameInput) {
    elements.customThemeNameInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            saveCurrentCustomTheme();
        }
    });
}

if (elements.taskNameInput) {
    elements.taskNameInput.addEventListener("input", () => {
        if (elements.taskEmojiInput.dataset.manual !== "true") {
            const cleanName = extractEmojiFromName(elements.taskNameInput.value).label;
            elements.taskEmojiInput.value = suggestEmoji(cleanName);
        }
    });
}

if (elements.taskEmojiInput) {
    elements.taskEmojiInput.addEventListener("input", () => {
        elements.taskEmojiInput.dataset.manual = "true";
    });
}

if (elements.suggestEmojiButton) {
    elements.suggestEmojiButton.addEventListener("click", () => {
        const cleanName = extractEmojiFromName(elements.taskNameInput.value).label;
        elements.taskEmojiInput.value = suggestEmoji(cleanName);
        elements.taskEmojiInput.dataset.manual = "false";
    });
}

elements.taskXpInput.addEventListener("focus", () => {
    elements.taskXpInput.select();
});

render();

if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js");
}
