export function getApiUrl() {
    return localStorage.getItem("api-url");
}

export function checkApiUrl() {
    if (localStorage.getItem("api-url") !== null) {
        return true;
    }
    return false;
}

export function checkMode() {
    return localStorage.getItem("mode");
}

export function setApiUrl(url) {
    localStorage.setItem("api-url", url);
}

export function setMode(mode) {
    localStorage.setItem("mode", mode);
}

export function setDate(startDate, endDate) {
    localStorage.setItem("startDate", startDate);
    localStorage.setItem("endDate", endDate);
}

export function getStartDate() {
    return localStorage.getItem("startDate");
}

export function getEndDate() {
    return localStorage.getItem("endDate");
}

export function getStack() {
    var stack = localStorage.getItem("stack");
    if (stack === null) {
        setStack(false);
        return false;
    } else {
        return (stack === 'true');
    }
}

export function getType() {
    var type = localStorage.getItem("type");
    if (type === null) {
        setType("range");
        return "range";
    } else {
        return type;
    }
}

export function setType(type) {
    localStorage.setItem("type", type);
}

export function setStack(stack) {
    localStorage.setItem("stack", stack);
}

export function setPreset(preset) {
    localStorage.setItem("preset", preset);
}

export function getPreset() {
    var preset = localStorage.getItem("preset");
    if (preset === null) {
        setPreset("default");
        return "default";
    } else {
        return preset;
    }
}

export function setCutProgramDuration(value) {
    localStorage.setItem("cutProgramDuration", value);
}

export function setCutProgramState(state) {
    localStorage.setItem("cutProgramState", state);
}

export function getCutProgramDuration() {
    var duration = localStorage.getItem("cutProgramDuration");
    if (duration === null) {
        setCutProgramDuration(0);
        return 0;
    } else {
        return duration;
    }
}

export function getCutProgramState() {
    var state = localStorage.getItem("cutProgramState");
    if (state === null) {
        setCutProgramState(false);
        return false;
    } else {
        return (state === 'true');
    }
}