import * as StartOver from './StartOverCommon.js';

export const chartCode = `
st->op1->cond1
cond1(yes)->current

cond1(no,right)->cond3
cond1(yes)->cond2
cond2(yes)->op2
cond2(no)->cond3
cond3(yes)->op3
cond3(no)->op4
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
    "sharpstart_after_program": {
        code: 'cond2',
        mask: 0x00008,
        text: 'SharpStart \nfound after program?',
        type: 'condition',
        params: 'align-next=no'
    },
    "startover_sharpstart_after": {
        code: 'op2',
        mask: 0x00010,
        text: 'startover = sharpstart after program',
        type: 'end',
        params: ''
    },
    "sharpstart_before_program": {
        code: 'cond3',
        mask: 0x00020,
        text: 'SharpStart \n before program ?',
        type: 'condition',
        params: 'align-next=no'
    },
    "startover_sharpstart_before": {
        code: 'op3',
        mask: 0x00040,
        text: 'startover = sharpstart before program',
        type: 'end',
        params: ''
    },
    "startover_epg_time": {
        code: 'op4',
        mask: 0x00080,
        text: 'startover = EPG program start',
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

        var programStart = new Date(program.start).getTime();

        //look for the the type of event at the beginning of the TV program
        var programStartEvent = StartOver.searchProgramStartEvent(caipyData, programStart);

        startover.state ^= startOverState["sharpstart_after_program"].mask;
        var sharpStartAfterProgram = searchSharpStartAfterProgramStart(programStartEvent, caipyData, programStart, detectAfter);
        startover.program = program;

        if (sharpStartAfterProgram) {
            startover.state ^= startOverState["startover_sharpstart_after"].mask;
            startover.startover = sharpStartAfterProgram;
        } else {
            [startover.state, startover.startover] = searchBeforeProgram(startover.state, program, programStartEvent, caipyData, programStart, detectBefore);
        }
    } else {
        programStartEvent = StartOver.searchProgramStartEvent(caipyData, time.getTime());

        console.log('[1] - program was not found');
        //[startover.state, startover.startover] = searchBeforeProgram(startover.state, program, programStartEvent, caipyData, programStart, detectBefore);
    }
    return startover;
}

function searchBeforeProgram(state, program, programStartEvent, caipyData, programStart, detectBefore) {
    state ^= startOverState["sharpstart_before_program"].mask;

    if (programStartEvent.index === -1) {
        console.log("no caipy event found");
        state ^= startOverState["startover_epg_time"].mask;
        return [state, null];
    }
    var sharpStartBeforeProgram = StartOver.searchSharpStartBeforeProgramStart(programStartEvent, caipyData, programStart, detectBefore);

    if (sharpStartBeforeProgram) {
        console.log("sharpstart before program");
        state ^= startOverState["startover_sharpstart_before"].mask;
        return [state, sharpStartBeforeProgram.event];
    } else {
        console.log("no shartpstart before program");
        state ^= startOverState["startover_epg_time"].mask;
        return [state, null];
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