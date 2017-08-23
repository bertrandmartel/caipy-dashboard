//import constant values
import * as Constant from '../constants/Constant.js';

/**
 * Compute start over value from the Caipy events & EPG data set.
 * 
 * @param  {Date}   time        current date to calculate the startover from
 * @param  {Object} caipyData   Caipy event data
 * @param  {Object} epgData     EPG data set
 * @param  {String} channel     channel name
 * @return {Object}             startover result with startover field (caipy event item) & program field (epg item)
 */
export function computeStartover(time, caipyData, epgData, channel) {
    var startover = {
        startover: null,
        program: null
    };

    var currentTime = time.getTime();

    //filter the caipy event data
    caipyData = initCaipyData(caipyData, channel, currentTime);

    //search current program
    var program = searchCurrentProgram(epgData, channel, currentTime);

    //X : check program exist at current time
    if (program) {
        startover = {
            startover: computeCurrentProgram(program, caipyData),
            program: program
        };
    } else {
        console.log('[1] - program was not found');

        //search the last program
        var lastProgram = searchLastProgram(epgData, channel, currentTime);

        if (lastProgram) {
            var adAfterLastProgram = searchAdAfterTime(caipyData, lastProgram);

            if (adAfterLastProgram) {
                console.log("[11] - found ad after last program");
                console.log("[SUCCESS] - successfully found the StartOver");
                console.log(adAfterLastProgram);
                return {
                    startover: adAfterLastProgram,
                    program: lastProgram
                };
            } else {
                console.log("[10] - no ad found after last program");
                startover = {
                    startover: computeCurrentProgram(lastProgram, caipyData),
                    program: lastProgram
                };
            }
        } else {
            console.log("[FAIL] - program not found. EPG down ?");
        }
    }
    return startover;
}

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
function initCaipyData(caipyData, channel, currentTime) {
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
function searchCurrentProgram(epgData, channel, currentTime) {
    for (var i = 0; i < epgData.length; i++) {
        if (channel === epgData[i].name) {
            for (var j = 0; j < epgData[i].rows.length; j++) {
                var start = new Date(epgData[i].rows[j].start).getTime();
                var end = new Date(epgData[i].rows[j].end).getTime();
                if (currentTime >= start && currentTime <= end) {
                    return epgData[i].rows[j];
                }
            }
        }
    }
    return null;
}

/**
 * Look for the last program in EPG
 * 
 * @param  {Object} epgData     EPG data
 * @param  {String} channel     channel name
 * @param  {Number} currentTime current time in millis
 * @return {Object}             program item or null if not found
 */
function searchLastProgram(epgData, channel, currentTime) {
    var lastProgram;
    for (var i = 0; i < epgData.length; i++) {
        if (channel === epgData[i].name) {
            for (var j = 0; j < epgData[i].rows.length; j++) {
                var start = new Date(epgData[i].rows[j].start).getTime();
                if (currentTime < start) {
                    return (lastProgram ? lastProgram : null);
                }
                lastProgram = epgData[i].rows[j];
            }
        }
    }
    return null;
}

/**
 * Look for the event type at the beginning of the TV program, it could be either SharpStart, or an ad or nothing.
 *
 * @param  {Object} caipyData   caipy data (previously filtered)
 * @param  {Number} programStart time in millis since 1970 for the start of TV program
 * @return {String} event type (clip name)
 */
function searchProgramStartEvent(caipyData, programStart) {
    for (var i = 0; i < caipyData.length; i++) {
        var startTime = new Date(caipyData[i].time).getTime();
        var endTime = startTime + caipyData[i].duration * 1000;

        if (programStart > startTime && programStart < endTime) {
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

/**
 * Search an an event different from SharpStart after program start (delimited by timeRange)
 * 
 * @param  {Object} programStartEvent program start event defining a clip name and index value (index of event at the beginning of the program)
 * @param  {Object} caipyData         caipy event data
 * @param  {Number} programStart      program start time in milliseconds since 1970
 * @param  {Number} timeRange         max time range to look for after the program start
 * @return {Object}                   Caipy event if something different from a SharpStart is found or null if not found
 */
function searchAdAfterProgramStart(programStartEvent, caipyData, programStart, timeRange) {
    var max = programStart + timeRange;

    for (var i = programStartEvent.index; i >= 0; i--) {
        var startTime = new Date(caipyData[i].time).getTime();
        if (startTime > max) {
            return null;
        }
        if (caipyData[i].clip !== "SharpStart") {
            return caipyData[i];
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
function searchSharpStartBeforeProgramStart(programStartEvent, caipyData, programStart, timeRange) {
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

/**
 * Search an ad after SharpStart until the start of the program
 * 
 * @param  {Object} sharpStartBeforeProgram Object representing the Caipy SharpStart event from which we need to search
 * @param  {Object} caipyData               Caipt data
 * @param  {Number} programStart            program start in millis since 1970
 * @return {Object}                         Caipy event if ad found or null if not found
 */
function searchAdAfterSharpStart(sharpStartBeforeProgram, caipyData, programStart) {
    for (var i = sharpStartBeforeProgram.index; i >= 0; i--) {
        var startTime = new Date(caipyData[i].time).getTime();

        if (startTime > programStart) {
            return null;
        }
        if (caipyData[i].clip !== "SharpStart") {
            return caipyData[i];
        }
    }
    return null;
}

function searchAdAfterTime(caipyData, lastProgram) {
    var programEnd = new Date(lastProgram.end).getTime();
    var ad;
    for (var i = 0; i < caipyData.length; i++) {
        var startTime = new Date(caipyData[i].time).getTime();
        var endTime = startTime + caipyData[i].duration * 1000;

        if (endTime < programEnd) {
            return (ad ? ad : null);
        }
        if (caipyData[i].clip !== "SharpStart") {
            ad = caipyData[i];
        }
    }
}

/**
 * Search Start Over before program start 
 * 
 * @param  {Object} programStartEvent program start event defining a clip name and index value (index of event at the beginning of the program)
 * @param  {Object} caipyData         caipy event data
 * @param  {Number} programStart      program start time in milliseconds since 1970
 */
function searchBeforeProgram(programStartEvent, caipyData, programStart) {

    var sharpStartBeforeProgram = searchSharpStartBeforeProgramStart(programStartEvent, caipyData, programStart, Constant.startOverRange);

    if (sharpStartBeforeProgram) {
        console.log("[0122] - Found a sharpstart before program start");

        var adAfterSharpStart = searchAdAfterSharpStart(sharpStartBeforeProgram, caipyData, programStart);

        if (adAfterSharpStart) {
            console.log("[01222] - Found an ad after sharpstart");
            console.log("[SUCCESS] - successfully found the StartOver");
            return adAfterSharpStart;
        } else {
            console.log("[01221] - [FAIL] Didn't found an ad after sharpstart");
        }
    } else {
        console.log("[0121] - [FAIL] Didn't found a sharpstart before program start");
    }
    return null;
}

/**
 * Compute start over on a specific program
 * 
 * @param  {Obect} program   Program object
 * @param  {Obect} caipyData Caipy data
 */
function computeCurrentProgram(program, caipyData) {
    console.log("[0] - we do have a program");

    var programStart = new Date(program.start).getTime();

    //look for the the type of event at the beginning of the TV program
    var programStartEvent = searchProgramStartEvent(caipyData, programStart);

    //0X : deal with sharpstart or ad/no event
    if (programStartEvent.clip === "SharpStart") {
        console.log("[01] - we do have a sharpStart at the beginning of the program");

        // 01X : search for ad after program start
        var adAfterProgram = searchAdAfterProgramStart(programStartEvent, caipyData, programStart, Constant.startOverRange);

        if (adAfterProgram) {
            console.log("[011] - Found an ad after program start");
            console.log("[SUCCESS] - successfully found the StartOver");
            return adAfterProgram;
        } else {
            console.log("[012] - Didn't found ad after program start");
            return searchBeforeProgram(programStartEvent, caipyData, programStart);
        }
    } else {
        console.log("[02] - we do have an ad or no event at all at the beginning of the program");
        return searchBeforeProgram(programStartEvent, caipyData, programStart);
    }
}