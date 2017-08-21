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