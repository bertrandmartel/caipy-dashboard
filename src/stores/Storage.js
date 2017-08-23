//import constant values
import * as Constant from '../constants/Constant.js';

/**
 * Get an item in local storage
 * 
 * @param  {String} name         item field name
 * @param  {String} defaultValue default value if not found
 * @param  {String} type         type of item to return the right type
 * @return {Object}              value retrieved or default value, type may vary
 */
function getItem(name, defaultValue, type) {
    var value = localStorage.getItem(name);
    if (value === null) {
        localStorage.setItem(name, defaultValue);
        return defaultValue;
    } else {
        if (type) {
            switch (type) {
                case "number":
                    return parseInt(value, 10);
                case "bool":
                    return (value === 'true');
                default:
                    break;
            }
        }
        return value;
    }
}

/**
 * Put key/value in local storage.
 */
function setItem(field, value) {
    localStorage.setItem(field, value);
}

export function getApiUrl() {
    return getItem("api-url", "");
}

export function getMode() {
    return getItem("mode", "demo");
}

export function setApiUrl(url) {
    setItem("api-url", url);
}

export function setMode(mode) {
    setItem("mode", mode);
}

export function setStartDate(startDate) {
    setItem("startDate", startDate);
}

export function setEndDate(endDate) {
    setItem("endDate", endDate);
}

export function getStartDate() {
    return getItem("startDate", Constant.defaultStartDate);
}

export function getEndDate() {
    return getItem("endDate", Constant.defaultEndDate);
}

export function getStack() {
    return getItem("stack", false, "bool");
}

export function getType() {
    return getItem("type", "range");
}

export function setType(type) {
    setItem("type", type);
}

export function setStack(stack) {
    setItem("stack", stack);
}

export function setPreset(preset) {
    setItem("preset", preset);
}

export function getPreset() {
    return getItem("preset", "default");
}

export function setCutProgramDuration(value) {
    setItem("cutProgramDuration", value);
}

export function setCutProgramState(state) {
    setItem("cutProgramState", state);
}

export function getCutProgramDuration() {
    return getItem("cutProgramDuration", 0);
}

export function getCutProgramState() {
    return getItem("cutProgramState", false, "bool");
}

export function getWindowInitSize() {
    return getItem("windowInitSize", Constant.defaultWindowInitSize, "number");
}

export function getZoomWindowSize() {
    return getItem("zoomWindowSize", Constant.defaultZoomWindowSize, "number");
}

export function setWindowInitSize(value) {
    setItem("windowInitSize", value);
}

export function setZoomWindowSize(value) {
    setItem("zoomWindowSize", value);
}