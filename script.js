const STORAGE_KEY = "lifexp-state-v1";

const defaultState = {
    dailyGoal: 50,

    tasks: [
        {
            id: "task-joggen",
            name: "🏃 Joggen",
            xp: 30
        },
        {
            id: "task-ruecken",
            name: "💪 Rückengymnastik",
            xp: 20
        },
        {
            id: "task-suessigkeiten",
            name: "🍫 Süßigkeiten gegessen",
            xp: -10
        }
    ],

    history: []
};

let state = loadState();

const currentDateElement = document.getElementById("currentDate");
const todayXpElement = document.getElementById("todayXp");
const totalXpElement = document.getElementById("totalXp");
const dailyGoalElement = document.getElementById("dailyGoal");
const dailyGoalInput = document.getElementById("dailyGoalInput");
const saveGoalButton = document.getElementById("saveGoalButton");

const goalCard = document.getElementById("goalCard");
const goalStatusElement = document.getElementById("goalStatus");
const progressBarElement = document.getElementById("progressBar");

const taskListElement = document.getElementById("taskList");
const emptyTasksMessage = document.getElementById("emptyTasksMessage");
const addTaskButton = document.getElementById("addTaskButton");

const undoButton = document.getElementById("undoButton");
const resetTodayButton = document.getElementById("resetTodayButton");

const historyListElement = document.getElementById("historyList");
const historyCountElement = document.getElementById("historyCount");
const emptyHistoryMessage = document.getElementById(
    "emptyHistoryMessage"
);

const taskDialog = document.getElementById("taskDialog");
const taskForm = document.getElementById("taskForm");
const taskDialogTitle = document.getElementById("taskDialogTitle");
const editingTaskIdInput = document.getElementById("editingTaskId");
const taskNameInput = document.getElementById("taskNameInput");
const taskXpInput = document.getElementById("taskXpInput");

const closeTaskDialogButton = document.getElementById(
    "closeTaskDialogButton"
);

const cancelTaskButton = document.getElementById("cancelTaskButton");


function loadState() {
    const savedState = localStorage.getItem(STORAGE_KEY);

    if (!savedState) {
        return structuredClone(defaultState);
    }

    try {
        const parsedState = JSON.parse(savedState);

        return {
            dailyGoal:
                Number(parsedState.dailyGoal) > 0
                    ? Number(parsedState.dailyGoal)
                    : defaultState.dailyGoal,

            tasks: Array.isArray(parsedState.tasks)
                ? parsedState.tasks
                : structuredClone(defaultState.tasks),

            history: Array.isArray(parsedState.history)
                ? parsedState.history
                : []
        };
    } catch (error) {
        console.error("Gespeicherte Daten konnten nicht gelesen werden.", error);

        return structuredClone(defaultState);
    }
}


function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}


function createId(prefix) {
    if (
        typeof crypto !== "undefined" &&
        typeof crypto.randomUUID === "function"
    ) {
        return `${prefix}-${crypto.randomUUID()}`;
    }

    return `${prefix}-${Date.now()}-${Math.random()
        .toString(16)
        .slice(2)}`;
}


function getTodayKey() {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


function formatCurrentDate() {
    return new Intl.DateTimeFormat("de-DE", {
        weekday: "long",
        day: "2-digit",
        month: "long"
    }).format(new Date());
}


function formatTime(dateString) {
    return new Intl.DateTimeFormat("de-DE", {
        hour: "2-digit",
        minute: "2-digit"
    }).format(new Date(dateString));
}


function getTodayHistory() {
    const todayKey = getTodayKey();

    return state.history.filter((entry) => {
        return entry.date === todayKey;
    });
}


function getTodayXp() {
    return getTodayHistory().reduce((sum, entry) => {
        return sum + entry.xp;
    }, 0);
}


function getRawTotalXp() {
    return state.history.reduce((sum, entry) => {
        return sum + entry.xp;
    }, 0);
}


function getDisplayedTotalXp() {
    return Math.max(0, getRawTotalXp());
}


function formatXp(xp) {
    if (xp > 0) {
        return `+${xp} XP`;
    }

    if (xp < 0) {
        return `−${Math.abs(xp)} XP`;
    }

    return "0 XP";
}


function render() {
    renderHeader();
    renderGoal();
    renderTasks();
    renderHistory();
    renderActionButtons();
}


function renderHeader() {
    currentDateElement.textContent = formatCurrentDate();
    totalXpElement.textContent = `${getDisplayedTotalXp()} XP`;
}


function renderGoal() {
    const todayXp = getTodayXp();
    const dailyGoal = state.dailyGoal;

    todayXpElement.textContent = todayXp;
    dailyGoalElement.textContent = dailyGoal;
    dailyGoalInput.value = dailyGoal;

    const percentage = Math.max(
        0,
        Math.min((todayXp / dailyGoal) * 100, 100)
    );

    progressBarElement.style.width = `${percentage}%`;

    if (todayXp >= dailyGoal) {
        goalStatusElement.textContent = "✓ Tagesziel geschafft";
        goalStatusElement.classList.add("reached");
        progressBarElement.classList.add("reached");
        goalCard.classList.add("reached");
    } else {
        const missingXp = dailyGoal - todayXp;

        goalStatusElement.textContent = `Noch ${missingXp} XP`;
        goalStatusElement.classList.remove("reached");
        progressBarElement.classList.remove("reached");
        goalCard.classList.remove("reached");
    }
}


function renderTasks() {
    taskListElement.innerHTML = "";

    emptyTasksMessage.hidden = state.tasks.length > 0;

    state.tasks.forEach((task) => {
        const taskCard = document.createElement("article");
        taskCard.className = "task-card";

        const mainButton = document.createElement("button");
        mainButton.className = "task-main-button";
        mainButton.type = "button";

        if (task.xp < 0) {
            mainButton.classList.add("negative");
        }

        const taskName = document.createElement("span");
        taskName.className = "task-name";
        taskName.textContent = task.name;

        const taskXp = document.createElement("strong");
        taskXp.className = "task-xp";
        taskXp.textContent = formatXp(task.xp);

        mainButton.append(taskName, taskXp);

        mainButton.addEventListener("click", () => {
            addHistoryEntry(task);
        });

        const controls = document.createElement("div");
        controls.className = "task-controls";

        const editButton = document.createElement("button");
        editButton.className = "small-control-button";
        editButton.type = "button";
        editButton.textContent = "Bearbeiten";

        editButton.addEventListener("click", () => {
            openTaskDialog(task.id);
        });

        const deleteButton = document.createElement("button");
        deleteButton.className =
            "small-control-button delete-control-button";

        deleteButton.type = "button";
        deleteButton.textContent = "Löschen";

        deleteButton.addEventListener("click", () => {
            deleteTask(task.id);
        });

        controls.append(editButton, deleteButton);
        taskCard.append(mainButton, controls);
        taskListElement.appendChild(taskCard);
    });
}


function renderHistory() {
    const todayHistory = getTodayHistory().slice().reverse();

    historyListElement.innerHTML = "";

    emptyHistoryMessage.hidden = todayHistory.length > 0;

    historyCountElement.textContent =
        todayHistory.length === 1
            ? "1 Eintrag"
            : `${todayHistory.length} Einträge`;

    todayHistory.forEach((entry) => {
        const historyItem = document.createElement("div");
        historyItem.className = "history-item";

        const information = document.createElement("div");
        information.className = "history-information";

        const name = document.createElement("strong");
        name.textContent = entry.taskName;

        const time = document.createElement("span");
        time.textContent = formatTime(entry.createdAt);

        information.append(name, time);

        const xp = document.createElement("strong");
        xp.className = "history-xp";
        xp.textContent = formatXp(entry.xp);

        if (entry.xp < 0) {
            xp.classList.add("negative");
        }

        historyItem.append(information, xp);
        historyListElement.appendChild(historyItem);
    });
}


function renderActionButtons() {
    const hasTodayHistory = getTodayHistory().length > 0;

    undoButton.disabled = !hasTodayHistory;
    resetTodayButton.disabled = !hasTodayHistory;
}


function addHistoryEntry(task) {
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

    const lastTodayIndex = state.history.findLastIndex((entry) => {
        return entry.date === todayKey;
    });

    if (lastTodayIndex === -1) {
        return;
    }

    state.history.splice(lastTodayIndex, 1);

    saveState();
    render();
}


function resetToday() {
    const todayHistory = getTodayHistory();

    if (todayHistory.length === 0) {
        return;
    }

    const confirmed = window.confirm(
        "Wirklich alle heutigen Einträge löschen?"
    );

    if (!confirmed) {
        return;
    }

    const todayKey = getTodayKey();

    state.history = state.history.filter((entry) => {
        return entry.date !== todayKey;
    });

    saveState();
    render();
}


function openTaskDialog(taskId = "") {
    editingTaskIdInput.value = taskId;

    if (taskId) {
        const task = state.tasks.find((item) => {
            return item.id === taskId;
        });

        if (!task) {
            return;
        }

        taskDialogTitle.textContent = "Aktivität bearbeiten";
        taskNameInput.value = task.name;
        taskXpInput.value = task.xp;
    } else {
        taskDialogTitle.textContent = "Neue Aktivität";
        taskNameInput.value = "";
        taskXpInput.value = 10;
    }

    taskDialog.showModal();

    window.setTimeout(() => {
        taskNameInput.focus();
    }, 50);
}


function closeTaskDialog() {
    taskDialog.close();
    taskForm.reset();
    editingTaskIdInput.value = "";
}


function saveTask(event) {
    event.preventDefault();

    const taskName = taskNameInput.value.trim();
    const taskXp = Number(taskXpInput.value);
    const editingTaskId = editingTaskIdInput.value;

    if (!taskName) {
        window.alert("Bitte gib einen Namen ein.");
        return;
    }

    if (!Number.isFinite(taskXp)) {
        window.alert("Bitte gib einen gültigen XP-Wert ein.");
        return;
    }

    if (editingTaskId) {
        const task = state.tasks.find((item) => {
            return item.id === editingTaskId;
        });

        if (!task) {
            return;
        }

        task.name = taskName;
        task.xp = taskXp;
    } else {
        state.tasks.push({
            id: createId("task"),
            name: taskName,
            xp: taskXp
        });
    }

    saveState();
    closeTaskDialog();
    render();
}


function deleteTask(taskId) {
    const task = state.tasks.find((item) => {
        return item.id === taskId;
    });

    if (!task) {
        return;
    }

    const confirmed = window.confirm(
        `Aktivität „${task.name}“ wirklich löschen?\n\n` +
        "Bereits vorhandene Einträge in der Historie bleiben erhalten."
    );

    if (!confirmed) {
        return;
    }

    state.tasks = state.tasks.filter((item) => {
        return item.id !== taskId;
    });

    saveState();
    render();
}


function saveDailyGoal() {
    const newGoal = Number(dailyGoalInput.value);

    if (!Number.isFinite(newGoal) || newGoal < 1) {
        window.alert(
            "Das Tagesziel muss mindestens 1 XP betragen."
        );

        dailyGoalInput.value = state.dailyGoal;
        return;
    }

    state.dailyGoal = Math.round(newGoal);

    saveState();
    render();
}


addTaskButton.addEventListener("click", () => {
    openTaskDialog();
});

taskForm.addEventListener("submit", saveTask);

closeTaskDialogButton.addEventListener("click", closeTaskDialog);
cancelTaskButton.addEventListener("click", closeTaskDialog);

undoButton.addEventListener("click", undoLastTodayEntry);
resetTodayButton.addEventListener("click", resetToday);
saveGoalButton.addEventListener("click", saveDailyGoal);

dailyGoalInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        saveDailyGoal();
    }
});

taskDialog.addEventListener("click", (event) => {
    if (event.target === taskDialog) {
        closeTaskDialog();
    }
});

render();