import * as StartOver from './StartOverCommon.js';

export const chartCode = `
st->op1->cond1
cond1(yes)->current

current->cond8
cond8(yes)->cond2
cond8(no)->op6
cond1(no)->cond7
cond7(no,bottom)->op5
cond7(yes)->cond6

cond6(no)->cond9
cond6(yes)->op4
cond9(no)->last
cond9(yes)->op7

last->cond8
cond2(yes)->cond3
cond2(no)->cond4
cond3(no)->cond4
cond3(yes)->op2
cond4(no)->fail
cond4(yes,right)->op3`;

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

export const startOverState = {
    "start": {
        code: 'st',
        mask: 0x000001,
        text: 'Start',
        type: 'start',
        params: ''
    },
    "get_current_program": {
        code: 'op1',
        mask: 0x000002,
        text: 'Get current program',
        type: 'operation',
        params: ''
    },
    "program_exists": {
        code: 'cond1',
        mask: 0x000004,
        text: 'program exists ?',
        type: 'condition',
        params: 'align-next=no'
    },
    "last_program_found": {
        code: 'cond7',
        mask: 0x000008,
        text: 'last program \nfound ?',
        type: 'condition',
        params: 'align-next=no'
    },
    "epg_fail": {
        code: 'op5',
        mask: 0x000010,
        text: 'startover not found : EPG fail',
        type: 'end',
        params: ''
    },
    "ad_after_last_program": {
        code: 'cond6',
        mask: 0x000020,
        text: 'Ad after \nlast program ?',
        type: 'condition',
        params: 'align-next=no'
    },
    "ad_after_last_sharpstart": {
        code: 'cond9',
        mask: 0x000040,
        text: 'Ad after \nlast sharpstart ?',
        type: 'condition',
        params: 'align-next=no'
    },
    "startover_ad_after_sharpstart2": {
        code: 'op7',
        mask: 0x000080,
        text: 'startover = ad after SharpStart',
        type: 'end',
        params: ''
    },
    "program_set_last": {
        code: 'last',
        mask: 0x000100,
        text: 'program = last program',
        type: 'operation',
        params: ''
    },
    "program_set_current": {
        code: 'current',
        mask: 0x000200,
        text: 'program = current program',
        type: 'operation',
        params: ''
    },
    "startover_set_ad_after_last_prog": {
        code: 'op4',
        mask: 0x000400,
        text: 'startover = ad after last program end',
        type: 'end',
        params: ''
    },
    "event_at_program_start": {
        code: 'cond8',
        mask: 0x000800,
        text: 'Event existing \n at program start ?',
        type: 'condition',
        params: 'align-next=no'
    },
    "no_event_at_program_start": {
        code: 'op6',
        mask: 0x001000,
        text: 'startover = EPG program start (Caipy fail)',
        type: 'end',
        params: ''
    },
    "sharpstart_after_program_start": {
        code: 'cond2',
        mask: 0x002000,
        text: 'SharpStart after \nprogram start ?',
        type: 'condition',
        params: ''
    },
    "ad_existing_after_program_start": {
        code: 'cond3',
        mask: 0x004000,
        text: 'Ad existing after \nprogram start ?',
        type: 'condition',
        params: ''
    },
    "startover_after_program_start": {
        code: 'op2',
        mask: 0x008000,
        text: 'startover = ad after program start',
        type: 'end',
        params: ''
    },
    "ad_before_program": {
        code: 'cond4',
        mask: 0x010000,
        text: 'Ad before \nprogram ?',
        type: 'condition',
        params: ''
    },
    "startover_epg_program_start": {
        code: 'fail',
        mask: 0x020000,
        text: 'startover = EPG program start',
        type: 'end',
        params: ''
    },
    "startover_ad_after_sharpstart": {
        code: 'op3',
        mask: 0x040000,
        text: 'startover = ad after SharpStart',
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
export function computeWithAdStartover(time, caipyData, epgData, channel, startOverDetectAd, startOverDetectSharpStart) {
    var startover = {
        startover: null,
        program: null,
        state: (0x000000 ^ startOverState["start"].mask ^ startOverState["get_current_program"].mask ^ startOverState["program_exists"].mask)
    };

    var currentTime = time.getTime();

    //filter the caipy event data
    caipyData = StartOver.initCaipyData(caipyData, channel, currentTime);

    //search current program
    var program = StartOver.searchCurrentProgram(epgData, channel, currentTime);

    //X : check program exist at current time
    if (program) {
        startover.state ^= startOverState["program_set_current"].mask;
        [startover.state, startover.startover] = computeCurrentProgram(startover.state, program, caipyData, startOverDetectAd, startOverDetectSharpStart, currentTime);
        startover.program = program;
    } else {
        console.log('[1] - program was not found');
        startover.state ^= startOverState["last_program_found"].mask;

        //search the last program
        var lastProgram = searchLastProgram(epgData, channel, currentTime);

        if (lastProgram) {
            startover.state ^= startOverState["ad_after_last_program"].mask;
            var adAfterLastProgram = searchAdAfterTime(caipyData, new Date(lastProgram.end).getTime());

            if (adAfterLastProgram) {
                startover.state ^= startOverState["startover_set_ad_after_last_prog"].mask;
                console.log("[11] - found ad after last program");
                console.log("[SUCCESS] - successfully found the StartOver");
                startover.startover = adAfterLastProgram;
                startover.program = lastProgram;
            } else {
                startover.state ^= startOverState["ad_after_last_sharpstart"].mask;

                var adAfterLastSharpstart = searchAdAfterSharpStart(caipyData, new Date(lastProgram.end).getTime() - startOverDetectSharpStart);
                
                if (adAfterLastSharpstart) {
                    startover.state ^= startOverState["startover_ad_after_sharpstart2"].mask;
                    startover.program = lastProgram;
                    startover.startover = adAfterLastSharpstart;
                } else {
                    startover.state ^= startOverState["program_set_last"].mask;
                    console.log("[10] - no ad found after last program");
                    [startover.state, startover.startover] = computeCurrentProgram(startover.state, lastProgram, caipyData, startOverDetectAd, startOverDetectSharpStart);
                    startover.program = lastProgram;
                }
            }
        } else {
            startover.state ^= startOverState["epg_fail"].mask;
            console.log("[FAIL] - program not found. EPG down ?");
        }
    }
    return startover;
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
    for (var j = 0; j < epgData.rows.length; j++) {
        var start = new Date(epgData.rows[j].start).getTime();
        if (currentTime < start) {
            return (lastProgram ? lastProgram : null);
        }
        lastProgram = epgData.rows[j];
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
 * Search an ad after SharpStart until the start of the program
 * 
 * @param  {Object} sharpStartBeforeProgram Object representing the Caipy SharpStart event from which we need to search
 * @param  {Object} caipyData               Caipt data
 * @param  {Number} programStart            program start in millis since 1970
 * @return {Object}                         Caipy event if ad found or null if not found
 */
function searchAd(sharpStartBeforeProgram, caipyData, programStart, timeRange) {
    for (var i = sharpStartBeforeProgram.index; i < caipyData.length; i++) {
        var startTime = new Date(caipyData[i].time).getTime();
        var endTime = startTime + caipyData[i].duration * 1000;
        if (endTime < (programStart - timeRange)) {
            return null;
        }
        if (caipyData[i].clip !== "SharpStart") {
            return caipyData[i];
        }
    }
    return null;
}

function searchAdAfterSharpStart(caipyData, periodEnd) {
    var ad = null;
    for (var i = 0; i < caipyData.length; i++) {
        var startTime = new Date(caipyData[i].time).getTime();
        var endTime = startTime + caipyData[i].duration * 1000;
        if (endTime < periodEnd) {
            return null;
        }
        if (ad !== null && caipyData[i].clip === "SharpStart") {
            return ad;
        } else {
            ad = caipyData[i];
        }
    }
}

function searchAdAfterTime(caipyData, periodEnd) {
    var ad = null;
    for (var i = 0; i < caipyData.length; i++) {
        var startTime = new Date(caipyData[i].time).getTime();
        var endTime = startTime + caipyData[i].duration * 1000;
        if (endTime < periodEnd) {
            return ad;
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
 * @param  {Number} startOverDetectSharpStart  startover detection settings : time range for looking for a SharpStart before start of program
 */
function searchBeforeProgram(state, programStartEvent, caipyData, programStart, startOverDetectSharpStart, currentTime) {

    var adAfterSharpStart = searchAd(programStartEvent, caipyData, programStart, startOverDetectSharpStart);

    if (adAfterSharpStart) {
        state ^= startOverState["startover_ad_after_sharpstart"].mask;
        console.log("[01222] - Found an ad after sharpstart");
        console.log("[SUCCESS] - successfully found the StartOver");
        return [state, adAfterSharpStart];
    } else {
        console.log("[01221] - [FAIL] Didn't found an ad after sharpstart");
    }

    state ^= startOverState["startover_epg_program_start"].mask;
    return [state, null];
}

/**
 * Compute start over on a specific program
 * 
 * @param  {Obect} program   Program object
 * @param  {Obect} caipyData Caipy data
 * @param  {Number} startOverDetectAd          startover detection settings : time range for looking for ad after start of program
 * @param  {Number} startOverDetectSharpStart  startover detection settings : time range for looking for a SharpStart before start of program
 */
function computeCurrentProgram(state, program, caipyData, startOverDetectAd, startOverDetectSharpStart, currentTime) {

    console.log("[0] - we do have a program");

    var programStart = new Date(program.start).getTime();

    //look for the the type of event at the beginning of the TV program
    var programStartEvent = StartOver.searchProgramStartEvent(caipyData, programStart);

    state ^= startOverState["event_at_program_start"].mask;

    if (programStartEvent.index === -1) {
        state ^= startOverState["no_event_at_program_start"].mask;
        console.log("no event have been found at program start");
        return [state, null];
    }

    state ^= startOverState["sharpstart_after_program_start"].mask;
    //0X : deal with sharpstart or ad/no event
    if (programStartEvent.clip === "SharpStart") {
        console.log("[01] - we do have a sharpStart at the beginning of the program");
        state ^= startOverState["ad_existing_after_program_start"].mask;
        // 01X : search for ad after program start
        var adAfterProgram = searchAdAfterProgramStart(programStartEvent, caipyData, programStart, startOverDetectAd);

        if (adAfterProgram) {
            state ^= startOverState["startover_after_program_start"].mask;
            console.log("[011] - Found an ad after program start");
            console.log("[SUCCESS] - successfully found the StartOver");
            return [state, adAfterProgram]
        } else {
            state ^= startOverState["ad_before_program"].mask;
            console.log("[012] - Didn't found ad after program start");
            return searchBeforeProgram(state, programStartEvent, caipyData, programStart, startOverDetectSharpStart, currentTime);
        }
    } else if (programStartEvent.index !== -1) {
        state ^= startOverState["ad_before_program"].mask;
        console.log("[02] - we do have an ad or no event at all at the beginning of the program");
        return searchBeforeProgram(state, programStartEvent, caipyData, programStart, startOverDetectSharpStart, currentTime);
    }
}