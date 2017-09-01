import * as StartOver from './StartOverCommon.js';

export const chartCode = `
st->op1->cond1
cond1(yes)->current

cond1(no,right)->cond5

cond5(no,bottom)->op7
cond5(yes)->cond6
cond6(yes)->cond7

cond7(yes)->op6
cond7(no,bottom)->last
cond6(no,botom)->last

last->cond4

cond1(yes)->current
current->cond4

cond2(yes)->op2

cond4(no)->cond2
cond4(yes)->op5
cond2(no)->op4
`;

export const startOverState = {
    "start": {
        code: 'st',
        mask: 0x00001,
        text: 'Start',
        type: 'start',
        params: ''
    },
    "get_current_program": {
        code: 'op1',
        mask: 0x00002,
        text: 'Get current program',
        type: 'operation',
        params: ''
    },
    "program_exists": {
        code: 'cond1',
        mask: 0x00004,
        text: 'program exists ?',
        type: 'condition',
        params: 'align-next=no'
    },
    "last_program_found": {
        code: 'cond5',
        mask: 0x00008,
        text: 'last program \nfound ?',
        type: 'condition',
        params: 'align-next=no'
    },
    "epg_fail": {
        code: 'op7',
        mask: 0x00010,
        text: 'startover not found : EPG fail',
        type: 'end',
        params: ''
    },
    "sharpstart_after_last_program": {
        code: 'cond6',
        mask: 0x00020,
        text: 'Sharpstart \nafter last program ?',
        type: 'condition',
        params: 'align-next=no'
    },
    "ad_before_sharpstart": {
        code: 'cond7',
        mask: 0x00020,
        text: 'Ad before \nsharpstart ?',
        type: 'condition',
        params: 'align-next=no'
    },
    "startover_sharpstart_after_ad": {
        code: 'op6',
        mask: 0x00040,
        text: 'startover = sharpstart after ad',
        type: 'end',
        params: ''
    },
    "program_set_last": {
        code: 'last',
        mask: 0x00080,
        text: 'program = last program',
        type: 'operation',
        params: ''
    },
    "program_set_current": {
        code: 'current',
        mask: 0x00100,
        text: 'program = current program',
        type: 'operation',
        params: ''
    },
    "ad_after_program": {
        code: 'cond4',
        mask: 0x00200,
        text: 'Ad found \nafter program?',
        type: 'condition',
        params: 'align-next=no'
    },
    "startover_ad_after_program": {
        code: 'op5',
        mask: 0x00400,
        text: 'startover = sharpstart after ad',
        type: 'end',
        params: ''
    },
    "sharpstart_after_program": {
        code: 'cond2',
        mask: 0x00800,
        text: 'SharpStart \n after program?',
        type: 'condition',
        params: 'align-next=no'
    },
    "startover_sharpstart_after": {
        code: 'op2',
        mask: 0x01000,
        text: 'startover = sharpstart after program',
        type: 'end',
        params: ''
    },
    "startover_epg_time": {
        code: 'op4',
        mask: 0x08000,
        text: 'startover = EPG program start (caipy fail)',
        type: 'end',
        params: ''
    }
};

/**
 * Compute start over value from the Caipy events & EPG data set.
 * 
 * @param  {Date}   time                       current date to calculate the startover from
 * @param  {Object} caipyData                  Caipy event data
 * @param  {Object} epgData                    EPG data set
 * @param  {String} channel                    channel name
 * @param  {Number} startOverDetectAd          startover detection settings : time range for looking for ad after start of program
 * @param  {Number} startOverDetectSharpStart  startover detection settings : time range for looking for a SharpStart before start of program
 * @return {Object}                            startover result with startover field (caipy event item) & program field (epg item)
 */
export function computeWithoutAdStartover(time, caipyData, epgData, channel, detectAfter, detectBefore) {
    var startover = {
        startover: null,
        program: null,
        state: (0x0000 ^ startOverState["start"].mask ^ startOverState["get_current_program"].mask ^ startOverState["program_exists"].mask)
    };

    var currentTime = time.getTime();

    //filter the caipy event data
    caipyData = StartOver.initCaipyData(caipyData, channel, currentTime);

    //search current program
    var program = StartOver.searchCurrentProgram(epgData, channel, currentTime);

    //X : check program exist at current time
    if (program) {

        startover.state ^= startOverState["program_set_current"].mask;

        var programStart = new Date(program.start).getTime();

        startover.program = program;

        startover = computeCurrentProgram(startover, caipyData, programStart, detectAfter);

    } else {
        startover.state ^= startOverState["last_program_found"].mask;

        //search the last program
        var lastProgram = StartOver.searchLastProgram(epgData, channel, currentTime);

        if (lastProgram) {
            startover.state ^= startOverState["sharpstart_after_last_program"].mask;
            startover.program = lastProgram;

            var sharpStartAfterProgram = searchAdAfterTime(caipyData, new Date(lastProgram.end).getTime() - detectBefore);

            if (sharpStartAfterProgram) {
                startover.state ^= startOverState["startover_sharpstart_after_ad"].mask;
                startover.startover = sharpStartAfterProgram;
            } else {
                startover.state ^= startOverState["program_set_last"].mask;
                var lastProgramStart = new Date(lastProgram.start).getTime();
                startover = computeCurrentProgram(startover, caipyData, lastProgramStart, detectAfter);
            }
        } else {
            startover.state ^= startOverState["epg_fail"].mask;
            console.log("[FAIL] - program not found. EPG down ?");
        }
    }
    return startover;
}

function computeCurrentProgram(startover, caipyData, programStart, detectAfter) {

    //look for the the type of event at the beginning of the TV program
    var programStartEvent = StartOver.searchProgramStartEvent(caipyData, programStart);

    startover.state ^= startOverState["ad_after_program"].mask;

    var adAfterProgram = searchAdAfterProgramStart(programStartEvent, caipyData, programStart, detectAfter);

    if (adAfterProgram) {
        startover.state ^= startOverState["startover_ad_after_program"].mask;
        startover.startover = adAfterProgram;
    } else {
        startover.state ^= startOverState["sharpstart_after_program"].mask;
        var sharpStartAfterProgram = searchSharpStartAfterProgramStart(programStartEvent, caipyData, programStart, detectAfter);

        if (sharpStartAfterProgram) {
            startover.state ^= startOverState["startover_sharpstart_after"].mask;
            startover.startover = sharpStartAfterProgram;
        } else {
            startover.state ^= startOverState["startover_epg_time"].mask;
        }
    }
    return startover;
}

function searchAdAfterTime(caipyData, periodEnd) {
    var event = null;
    for (var i = 0; i < caipyData.length; i++) {
        var startTime = new Date(caipyData[i].time).getTime();
        var endTime = startTime + caipyData[i].duration * 1000;
        if (endTime < periodEnd) {
            return null;
        }
        if (caipyData[i].clip === "SharpStart") {
            event = caipyData[i];
        }
        if (event !== null && caipyData[i].clip !== "SharpStart") {
            return event;
        }
    }
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
function searchSharpStartAfterProgramStart(programStartEvent, caipyData, programStart, timeRange) {
    var max = programStart + timeRange;

    for (var i = programStartEvent.index; i >= 0; i--) {
        var startTime = new Date(caipyData[i].time).getTime();
        if (startTime > max) {
            return null;
        }
        if (caipyData[i].clip === "SharpStart") {
            return caipyData[i];
        }
    }
    return null;
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
    var foundAd = false;

    for (var i = programStartEvent.index; i >= 0; i--) {
        var startTime = new Date(caipyData[i].time).getTime();
        if (startTime > max && !(foundAd && caipyData[i].clip === "SharpStart")) {
            return null;
        }
        if (caipyData[i].clip !== "SharpStart") {
            foundAd = true;
        }
        if (foundAd && caipyData[i].clip === "SharpStart") {
            return caipyData[i];
        }
    }
    return null;
}