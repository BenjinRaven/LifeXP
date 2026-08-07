const STORAGE_KEY = "lifexp-state-v1";

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
        repeatable: false
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
        name: "✍️ Etwas von der To-do-Liste abhaken",
        xp: 10,
        active: true,
        custom: false,
        repeatable: false
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
        name: "📖 30 Minuten lesen",
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
        repeatable: false
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
    }
];
const defaultState = {
    schemaVersion: 4,
    dailyGoal: 50,
    gridSize: 2,
    tasks: defaultCatalog,
    history: []
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
    statsTodayEntries: document.getElementById("statsTodayEntries"),
    statsActiveTasks: document.getElementById("statsActiveTasks"),

    activeTaskList: document.getElementById("activeTaskList"),
    inactiveTaskList: document.getElementById("inactiveTaskList"),
    activeTaskCount: document.getElementById("activeTaskCount"),
    inactiveTaskCount: document.getElementById("inactiveTaskCount"),
    emptyActiveTasks: document.getElementById("emptyActiveTasks"),
    emptyInactiveTasks: document.getElementById("emptyInactiveTasks"),

    addTaskButton: document.getElementById("addTaskButton"),

    gridSizeTwo: document.getElementById("gridSizeTwo"),
    gridSizeThree: document.getElementById("gridSizeThree"),

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

        const existingIds = new Set(migratedTasks.map((task) => task.id));

       defaultCatalog.forEach((catalogTask) => {
    const existingTask = migratedTasks.find(
        (task) => task.id === catalogTask.id
    );

    if (!existingTask) {
        migratedTasks.push(clone(catalogTask));
        return;
    }

    if (!existingTask.custom) {
        existingTask.name = catalogTask.name;
        existingTask.xp = catalogTask.xp;
    }

    if (typeof existingTask.repeatable !== "boolean") {
        existingTask.repeatable = catalogTask.repeatable === true;
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

        return {
            schemaVersion: 4,
            
            dailyGoal:
                Number(parsed.dailyGoal) > 0
                    ? Math.round(Number(parsed.dailyGoal))
                    : 50,
            gridSize: Number(parsed.gridSize) === 3 ? 3 : 2,
            tasks: migratedTasks,
            history: Array.isArray(parsed.history) ? parsed.history : []
        };
    } catch (error) {
        console.error("Gespeicherte Daten konnten nicht geladen werden.", error);
        return clone(defaultState);
    }
}

function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function createId(prefix) {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
        return `${prefix}-${crypto.randomUUID()}`;
    }

    return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
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

function formatXp(xp) {
    if (xp > 0) return `+${xp} XP`;
    if (xp < 0) return `−${Math.abs(xp)} XP`;
    return "0 XP";
}

function splitEmojiAndName(name) {
    const match = String(name).match(/^(\p{Extended_Pictographic}(?:\uFE0F|\u200D|\p{Emoji_Modifier})*)\s*(.*)$/u);

    if (!match) {
        return { emoji: "✓", label: name };
    }

    return {
        emoji: match[1],
        label: match[2] || name
    };
}

function getTodayHistory() {
    const today = getTodayKey();
    return state.history.filter((entry) => entry.date === today);
}

function getTodayXp() {
    return getTodayHistory().reduce((sum, entry) => sum + Number(entry.xp), 0);
}

function getTotalXp() {
    return state.history.reduce((sum, entry) => {
        return sum + Number(entry.xp);
    }, 0);
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

function render() {
    renderNavigation();
    renderHeaderAndGoal();
    renderTodayTasks();
    renderHistory();
    renderActionButtons();
    renderStats();
    renderManagement();
    renderSettings();
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

function renderTodayTasks() {
    const activeTasks = getActiveTasks();

    elements.todayTaskGrid.innerHTML = "";
    elements.todayTaskGrid.className =
        `task-grid ${state.gridSize === 3 ? "grid-three" : "grid-two"}`;

    elements.emptyTodayTasks.hidden = activeTasks.length > 0;

    activeTasks.forEach((task) => {
        const parts = splitEmojiAndName(task.name);
        const completedToday = !task.repeatable && hasTaskBeenCompletedToday(task.id);

        const button = document.createElement("button");
        button.type = "button";
        button.className = "task-tile";
        button.disabled = completedToday;

        if (task.xp < 0) {
            button.classList.add("negative");
        }

        if (completedToday) {
            button.classList.add("completed");
        }

        const emoji = document.createElement("span");
        emoji.className = "task-emoji";
        emoji.textContent = completedToday ? "✓" : parts.emoji;

        const name = document.createElement("span");
        name.className = "task-tile-name";
        name.textContent = parts.label;

        const xp = document.createElement("strong");
        xp.className = "task-tile-xp";
        xp.textContent = completedToday ? "Heute erledigt" : formatXp(task.xp);

        button.append(emoji, name, xp);

        if (!completedToday) {
            button.addEventListener("click", () => addHistoryEntry(task));
        }

        elements.todayTaskGrid.appendChild(button);
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
    const entries = getTodayHistory().slice().reverse();

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

        if (entry.xp < 0) {
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
    elements.statsTodayXp.textContent = `${getTodayXp()} XP`;
    elements.statsTotalXp.textContent = `${getTotalXp()} XP`;
    elements.statsTodayEntries.textContent = getTodayHistory().length;
    elements.statsActiveTasks.textContent = getActiveTasks().length;
}

function createManageItem(task, active) {
    const item = document.createElement("article");
    item.className = "manage-item";
    item.dataset.taskId = task.id;

    if (active) {
        item.draggable = true;
        item.classList.add("sortable-item");

        const dragHandle = document.createElement("button");
        dragHandle.type = "button";
        dragHandle.className = "drag-handle";
        dragHandle.setAttribute("aria-label", `${task.name} verschieben`);
        dragHandle.textContent = "≡";
        setupDragHandle(dragHandle, item, task.id);
        item.appendChild(dragHandle);
    }

    const text = document.createElement("div");
    text.className = "manage-item-text";

    const name = document.createElement("strong");
    name.textContent = task.name;

    const meta = document.createElement("span");
    meta.textContent = `${formatXp(task.xp)} · ${task.repeatable ? "mehrmals täglich" : "1× täglich"}`;
    meta.className = task.xp < 0 ? "negative-text" : "positive-text";

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

    if (!active && task.custom) {
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
    button.innerHTML = `<span class="manage-add-icon">+</span><span><strong>Neue Aktivität hinzufügen</strong><small>Eigene Aktivität mit XP-Wert anlegen</small></span>`;
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

let draggedTaskId = null;
let touchDraggedItem = null;

function setupDragHandle(handle, item, taskId) {
    item.addEventListener("dragstart", (event) => {
        draggedTaskId = taskId;
        item.classList.add("dragging");
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", taskId);
    });

    item.addEventListener("dragend", () => {
        item.classList.remove("dragging");
        document.querySelectorAll(".manage-item.drag-over").forEach((element) => {
            element.classList.remove("drag-over");
        });
        syncActiveOrderFromDom();
        draggedTaskId = null;
    });

    item.addEventListener("dragover", (event) => {
        if (!draggedTaskId || draggedTaskId === taskId) return;
        event.preventDefault();
        moveDraggedItemBeforeOrAfter(item, event.clientY);
    });

    handle.addEventListener("pointerdown", (event) => {
        if (event.pointerType === "mouse") return;
        event.preventDefault();
        draggedTaskId = taskId;
        touchDraggedItem = item;
        item.classList.add("dragging");
        handle.setPointerCapture(event.pointerId);
    });

    handle.addEventListener("pointermove", (event) => {
        if (!touchDraggedItem || draggedTaskId !== taskId) return;
        event.preventDefault();
        const target = document.elementFromPoint(event.clientX, event.clientY)?.closest(".manage-item[data-task-id]");
        if (!target || target === touchDraggedItem || !target.classList.contains("sortable-item")) return;
        moveDraggedItemBeforeOrAfter(target, event.clientY, touchDraggedItem);
    });

    const finishTouchDrag = () => {
        if (!touchDraggedItem || draggedTaskId !== taskId) return;
        touchDraggedItem.classList.remove("dragging");
        syncActiveOrderFromDom();
        touchDraggedItem = null;
        draggedTaskId = null;
    };

    handle.addEventListener("pointerup", finishTouchDrag);
    handle.addEventListener("pointercancel", finishTouchDrag);
}

function moveDraggedItemBeforeOrAfter(target, clientY, explicitDraggedItem = null) {
    const draggedItem = explicitDraggedItem || document.querySelector(`.manage-item[data-task-id="${draggedTaskId}"]`);
    if (!draggedItem || target === draggedItem) return;

    const rect = target.getBoundingClientRect();
    const insertAfter = clientY > rect.top + rect.height / 2;

    if (insertAfter) {
        target.after(draggedItem);
    } else {
        target.before(draggedItem);
    }
}

function syncActiveOrderFromDom() {
    const activeIds = Array.from(
        elements.activeTaskList.querySelectorAll(".manage-item[data-task-id]")
    ).map((item) => item.dataset.taskId);

    if (activeIds.length === 0) return;

    const taskById = new Map(state.tasks.map((task) => [task.id, task]));
    const reorderedActiveTasks = activeIds
        .map((id) => taskById.get(id))
        .filter(Boolean);
    const inactiveTasks = state.tasks.filter((task) => !task.active);

    state.tasks = [...reorderedActiveTasks, ...inactiveTasks];
    saveState();
    renderTodayTasks();
}

function renderSettings() {
    elements.gridSizeTwo.checked = state.gridSize === 2;
    elements.gridSizeThree.checked = state.gridSize === 3;
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
    const today = getTodayKey();

    const index = state.history.findLastIndex(
        (entry) => entry.date === today
    );

    if (index === -1) return;

    state.history.splice(index, 1);
    saveState();
    render();
}

function resetToday() {
    if (getTodayHistory().length === 0) return;

    const confirmed = window.confirm(
        "Wirklich alle heutigen Einträge löschen?"
    );

    if (!confirmed) return;

    const today = getTodayKey();
    state.history = state.history.filter((entry) => entry.date !== today);

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
    const task = state.tasks.find((item) => {
        return item.id === taskId;
    });

    if (!task || !task.custom) {
        return;
    }

    const confirmed = window.confirm(
        `„${task.name}“ wirklich endgültig löschen?\n\n` +
        "Bereits vorhandene Historieneinträge bleiben erhalten."
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

function setGridSize(size) {
    state.gridSize = size === 3 ? 3 : 2;
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

elements.dailyGoalInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") saveDailyGoal();
});

elements.gridSizeTwo.addEventListener("change", () => setGridSize(2));
elements.gridSizeThree.addEventListener("change", () => setGridSize(3));

elements.taskXpInput.addEventListener("focus", () => {
    elements.taskXpInput.select();
});

render();
if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js");
}