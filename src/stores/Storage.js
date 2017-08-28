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
    return getItem("stack", true, "bool");
}

export function getFlowChartOpacity() {
    return getItem("flowChartOpacity", true, "bool");
}

export function getStartOverType() {
    return getItem("startOverType", "with advertisement");
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

export function setFlowChartOpacity(opacity) {
    setItem("flowChartOpacity", opacity);
}

export function setStartOverType(type) {
    setItem("startOverType", type);
}

export function setPreset(preset) {
    setItem("preset", preset);
}

export function getPreset() {
    return getItem("preset", "default");
}

export function setChannel(channel) {
    setItem("channel", channel);
}

export function getChannel() {
    return getItem("channel", "TF1");
}

export function setCutProgramDuration(value) {
    setItem("cutProgramDuration", value);
}

export function getCutProgramDuration() {
    return getItem("cutProgramDuration", Constant.cutProgramDuration, "number");
}

export function setStartOverRangeAd(value) {
    setItem("startOverRangeAd", value);
}

export function getStartOverRangeAd() {
    return getItem("startOverRangeAd", Constant.startOverRangeAd, "number");
}

export function setStartOverRangeSharpStart(value) {
    setItem("startOverRangeSharpStart", value);
}

export function getStartOverRangeSharpStart() {
    return getItem("startOverRangeSharpStart", Constant.startOverRangeSharpStart, "number");
}

export function getWindowInitSize() {
    return getItem("windowInitSize", Constant.defaultWindowInitSize, "number");
}

export function setWindowInitSize(value) {
    setItem("windowInitSize", value);
}