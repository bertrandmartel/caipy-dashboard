export const linkStyleColor = "Red";

/**
 * This will initialize Caipy event for preparing Start Over processing : 
 * <ul>
 *     <li>keep only events before the current time</li>
 *     <li>filter events in descending order</li>
 * </ul>
 * @param  {Object} caipyData   Caipy event data
 * @param  {String} channel     channel name
 * @param  {Number} currentTime current time in millis
 * @return {Object} caipy data filtered
 */
export function initCaipyData(caipyData, channel, currentTime) {
    for (var i = 0; i < caipyData.length; i++) {
        if (channel === caipyData[i].name) {
            var rows = caipyData[i].rows;
            //filter only thoses  <= current time
            caipyData = rows.filter(function(item) {
                return new Date(item.time).getTime() <= currentTime;
            });
            caipyData.sort(function(a, b) { return new Date(b.time).getTime() - new Date(a.time).getTime() });
            break;
        }
    }
    return caipyData
}

/**
 * Look for current program in EPG
 * 
 * @param  {Object} epgData     EPG data
 * @param  {String} channel     channel name
 * @param  {Number} currentTime current time in millis
 * @return {Object}             program item or null if not found
 */
export function searchCurrentProgram(epgData, channel, currentTime) {
    for (var j = 0; j < epgData.rows.length; j++) {
        var start = new Date(epgData.rows[j].start).getTime();
        var end = new Date(epgData.rows[j].end).getTime();
        if (currentTime >= start && currentTime <= end) {
            return epgData.rows[j];
        }
    }
    return null;
}


/**
 * Search an a SharpStart event before the program start (delimited by timeRange)
 * 
 * @param  {Object} programStartEvent program start event defining a clip name and index value (index of event at the beginning of the program)
 * @param  {Object} caipyData         caipy event data
 * @param  {Number} programStart      program start time in milliseconds since 1970
 * @param  {Number} timeRange         max time range to look for after the program start
 * @return {Object}                   Caipy SharpStart event or null if not found
 */
export function searchSharpStartBeforeProgramStart(programStartEvent, caipyData, programStart, timeRange) {
    var max = programStart - timeRange;

    for (var i = programStartEvent.index; i < caipyData.length; i++) {
        var startTime = new Date(caipyData[i].time).getTime();
        var endTime = startTime + caipyData[i].duration * 1000;

        if (endTime < max) {
            return null;
        }
        //we want only SharpStart event but not the one that occured at program start
        if (caipyData[i].clip === "SharpStart" && i !== programStartEvent.index) {
            return {
                event: caipyData[i],
                index: i
            };
        }
    }
    return null;
}

export const chartOptions = {
    width: 600,
    x: 0,
    y: 0,
    'line-width': 3,
    'line-length': 50,
    'text-margin': 10,
    'font-size': 14,
    'font-color': 'black',
    'line-color': 'black',
    'element-color': 'black',
    fill: 'white',
    'yes-text': 'yes',
    'no-text': 'no',
    'arrow-end': 'block',
    scale: 1,
    flowstate: {
        active: { fill: '#EEEEEE' },
    },
};

/**
 * Build Start Over flowchart from startover state
 * 
 * @param  {Number} state 2 Byte value Startover start
 * @return {String}       chart Code
 */
export function buildChartCode(stateTemplate, chartCode, state) {
    var code = "";
    var linkFlow = "";
    for (var property in stateTemplate) {
        if (stateTemplate.hasOwnProperty(property)) {
            var prop = stateTemplate[property];
            var active = '';
            if ((state & prop.mask) !== 0) {
                active = '|active';
                linkFlow += prop.code + '({"stroke":"' + linkStyleColor + '"})@>'
            }
            code += prop.code + '(' + prop.params + ')=>' + prop.type + ': ' + prop.text + active + '\n';
        }
    }
    linkFlow = linkFlow.substring(0, linkFlow.length - 2);

    code += chartCode + '\n' + linkFlow;
    return code;
}


/**
 * Look for the event type at the beginning of the TV program, it could be either SharpStart, or an ad or nothing.
 *
 * @param  {Object} caipyData   caipy data (previously filtered)
 * @param  {Number} programStart time in millis since 1970 for the start of TV program
 * @return {String} event type (clip name)
 */
export function searchProgramStartEvent(caipyData, programStart) {
    for (var i = 0; i < caipyData.length; i++) {
        var startTime = new Date(caipyData[i].time).getTime();
        var endTime = startTime + caipyData[i].duration * 1000;

        if (programStart >= startTime && programStart < endTime) {
            return {
                clip: caipyData[i].clip,
                index: i
            };
        } else if (programStart > endTime) {
            return {
                clip: "",
                index: -1
            };
        }
    }
    return {
        clip: "",
        index: -1
    };
}