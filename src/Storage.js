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

export function setItemType(type) {
    localStorage.setItem("item-type", type);
}

export function getItemType() {
    return localStorage.getItem("item-type");
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