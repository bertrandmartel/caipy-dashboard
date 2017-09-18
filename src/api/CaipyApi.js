import moment from 'moment';
import vis from 'vis';
import * as Storage from '../stores/Storage.js';

require("moment-duration-format");

/**
 * Main data processing function that will retrieve data from API or local JSON depending on mode
 * 
 * @param  {String}   mode               app mode (demo or live)
 * @param  {String}   startDate          start date in DD/MM/YYYY
 * @param  {String}   endDate            end date in DD/MM/YYYY
 * @param  {Number}   cutProgramDuration all program with less than the specified duration in sec will be removed
 * @param  {String}   preset             preset value determining how the data will be aggregated from the remote Caipy API
 * @param  {Function} cb                 Callback function
 */
export function getData(mode, startDate, endDate, cutProgramDuration, preset, channel, cb) {

    startDate += "00:00:00";
    endDate += "23:59:59";

    startDate = moment(startDate, "DD/MM/YYYYHH:mm:ss").utc().format("YYYYMMDDHHmmSS");
    endDate = moment(endDate, "DD/MM/YYYYHH:mm:ss").utc().format("YYYYMMDDHHmmSS");

    if (mode === "live") {

        //get channel list
        getPrograms(Storage.getApiUrl(), channel, startDate, endDate, cutProgramDuration, function(err, programRes, epgData) {
            if (err) {
                return cb(err, null);
            }
            getCaipyData(Storage.getApiUrl(), epgData.name, startDate, endDate, preset, programRes, function(err, caipyRes, caipyData) {
                if (err) {
                    return cb(err, null);
                }
                var item = buildChannelMap(startDate, endDate, caipyRes, epgData.name);

                cb(null, {
                    caipyEvents: caipyData,
                    epgPrograms: epgData,
                    timelineItems: item
                })
            })
        });
    } else {
        var data = require('./demo-config/demo-data.json');
        var channels = require('./demo-config/demo-tf1.json');

        var epgResult = getDemoProgram(channels, cutProgramDuration);
        var caipyResult = getDemoEvents(data, epgResult.channels);

        var items = buildChannelMap(startDate, endDate, caipyResult.channels, epgResult.programs.name);

        cb(null, {
            caipyEvents: caipyResult.caipy,
            epgPrograms: epgResult.programs,
            timelineItems: items
        })
    }
}

/**
 * Initialize Timeline groups
 * 
 * @return {vis.DataSet}  groups to display
 */
function initGroups() {
    var groups = new vis.DataSet();
    groups.add({
        id: 0,
        content: 'TV Programs'
    });
    groups.add({
        id: 1,
        type: "range",
        content: 'Caipy Events',
        className: 'caipy-group'
    });
    groups.add({
        id: 2,
        type: "range",
        content: 'Start Over',
        className: 'startover-group'
    });
    return groups;
}

/**
 * Get EPG programs by retrieving channel list and EPG for each channel 
 * 
 * @param  {String}   url         Caipy API URL
 * @param  {String}   startDate   start date in DD/MM/YYYY format
 * @param  {String}   stopDate    endDate in DD/MM/YYYY format
 * @param  {Number}   cutDuration cut program duration
 * @param  {Function} cb          Callback
 */
export function getPrograms(url, channel, startDate, stopDate, cutDuration, cb) {

    var programData = { "name": channel };

    fetch(url + "/getepg?time_format=iso8601&" +
            "channel=" + channel +
            "&start=" + startDate + "&end=" + stopDate)
        .then(function(response) {
            if (response.status >= 400) {
                throw new Error("Bad response from server");
            }
            return response.json();
        })
        .then(function(data) {
            var epgItems = [];

            //populate data
            programData.rows = data.events;

            //populate events
            for (var j = data.events.length - 1; j >= 0; j--) {

                var dateStart = new Date(data.events[j].start);
                var dateEnd = new Date(data.events[j].end);

                var durationDiff = parseInt(moment.duration(dateEnd.getTime() - dateStart.getTime()).format('s'), 10) * 1000;

                if (cutDuration > 0 && (durationDiff <= cutDuration)) {
                    data.events.splice(j, 1);
                } else {
                    var duration = moment.duration(dateEnd.getTime() - dateStart.getTime()).format('hh[h]mm[m]ss[s]');

                    var tooltip = 'title : ' + data.events[j].title + '<br/>' +
                        'time  : ' + moment(data.events[j].start).format("HH:mm") + '-' + moment(data.events[j].end).format("HH:mm") + '<br/>' +
                        'duration  :' + duration;

                    epgItems.push({
                        id: data.events[j].event_id,
                        group: 0,
                        start: dateStart,
                        end: dateEnd,
                        content: data.events[j].title,
                        className: "program",
                        title: tooltip
                    });
                }
            }
            cb(null, {
                program: epgItems
            }, programData);
        })
        .catch(function(err) {
            cb(err, null);
        });
}

/**
 * Get program from a static list of channels in demo mode.
 * 
 * @param  {Array} channels Array of channels
 * @return {Object}          an object that enclose the epg data set + the channel list generated
 */
export function getDemoProgram(channels, cutDuration) {
    var programData = {
        "name": channels.tvin_name,
        rows: channels.events
    };

    var epgItems = [];

    //populate events
    for (var j = 0; j < channels.events.length; j++) {

        var start = channels.events[j].start;
        var end = channels.events[j].end;

        var durationDiff = parseInt(moment.duration(new Date(end).getTime() - new Date(start).getTime()).format('s'), 10) * 1000;

        if (cutDuration > 0 && (durationDiff <= cutDuration)) {
            channels.events.splice(j, 1);
        } else {
            var duration = moment.duration(new Date(end).getTime() - new Date(start).getTime()).format('hh[h]mm[m]ss[s]');

            var tooltip = 'title : ' + channels.events[j].title + '<br/>' +
                'time  : ' + moment(start).format("HH:mm") + '-' + moment(end).format("HH:mm") + '<br/>' +
                'duration  :' + duration;

            epgItems.push({
                id: channels.events[j].event_id,
                group: 0,
                start: new Date(start),
                end: new Date(end),
                content: channels.events[j].title,
                className: "program",
                title: tooltip
            });
        }
    }
    return {
        programs: programData,
        channels: {
            program: epgItems
        }
    }
}

/**
 * Get Caipy data from its API
 * 
 * @param  {String}   url         URL configured
 * @param  {String}   startDate   filter start date in DD/MM/YYYY format
 * @param  {String}   stopDate    filter end date in DD/MM/YYYY format
 * @param  {String}   preset      preset value
 * @param  {Object}   channel     Object holding the channel with the epg items 
 * @param  {Function} cb          Callback to return when all promise have ended
 */
export function getCaipyData(url, channelName, startDate, stopDate, preset, channel, cb) {

    var caipyData = [];

    fetch(url + "/getdata?preset=" + preset +
            "&format=json&time_format=ISO8601&" +
            "&channel=" + channelName +
            "&start=" + startDate + "&stop=" + stopDate)
        .then(function(response) {
            if (response.status >= 400) {
                throw new Error("Bad response from server");
            }
            return response.json();
        })
        .then(function(data) {

            for (var j = 0; j < data.markers.length; j++) {

                var found = false;
                for (var i = 0; i < caipyData.length; i++) {
                    if (caipyData[i].name === data.markers[j].channel) {
                        caipyData[i].rows.push(data.markers[j])
                        found = true;
                    }
                }
                if (!found) {
                    caipyData.push({
                        "name": data.markers[j].channel,
                        "rows": [
                            data.markers[j]
                        ]
                    });
                }

                if (!channel.caipy) {
                    channel.caipy = [];
                }
                var dateStart = new Date(data.markers[j].time);
                var dateEnd = new Date((new Date(data.markers[j].time).getTime()) + data.markers[j].duration * 1000);

                var duration = moment.duration(data.markers[j].duration * 1000).format('hh[h]mm[m]ss[s]');

                var tooltip = 'title : ' + data.markers[j].clip + '<br/>' +
                    'time  : ' + moment(dateStart).format("HH:mm:ss") + '-' + moment(dateEnd).format("HH:mm:ss") + '<br/>' +
                    'duration  :' + data.markers[j].duration + 's (' + duration + ')';

                channel.caipy.push({
                    id: Math.random().toString(36).substring(7),
                    group: 1,
                    start: dateStart,
                    end: dateEnd,
                    content: data.markers[j].clip,
                    className: "caipy",
                    title: tooltip
                });
            }
            caipyData.sort(function(a, b) {
                return a.name.toUpperCase() < b.name.toUpperCase();
            });
            cb(null, channel, caipyData);
        })
        .catch(function(err) {
            cb(err, null);
        });
}

/**
 * Build Caipy data list item completing the list populated with EPG item previously.
 * 
 * @param  {Object} data        Caipy data extracted from API (static list for demo mode)
 * @param  {Object} channelList Object that holds all caipy & program items
 * @return {Object}             object that holds caipy data set + the channels item 
 */
export function getDemoEvents(data, channelList) {
    var caipyData = [];

    for (var j = 0; j < data.markers.length; j++) {

        var found = false;
        for (var i = 0; i < caipyData.length; i++) {
            if (caipyData[i].name === data.markers[j].channel) {
                caipyData[i].rows.push(data.markers[j])
                found = true;
            }
        }
        if (!found) {
            caipyData.push({
                "name": data.markers[j].channel,
                "rows": [
                    data.markers[j]
                ]
            });
        }

        if (!channelList.caipy) {
            channelList.caipy = [];
        }
        var dateStart = new Date(data.markers[j].time);
        var dateEnd = new Date((new Date(data.markers[j].time).getTime()) + data.markers[j].duration * 1000);

        var duration = moment.duration(data.markers[j].duration * 1000).format('hh[h]mm[m]ss[s]');

        var tooltip = 'title : ' + data.markers[j].clip + '<br/>' +
            'time  : ' + moment(dateStart).format("HH:mm:ss") + '-' + moment(dateEnd).format("HH:mm:ss") + '<br/>' +
            'duration  :' + data.markers[j].duration + 's (' + duration + ')';

        channelList.caipy.push({
            id: data.markers[j].clip + data.markers[j].time,
            group: 1,
            start: dateStart,
            end: dateEnd,
            content: data.markers[j].clip,
            className: "caipy",
            title: tooltip
        });
    }
    caipyData.sort(function(a, b) {
        return a.name.toUpperCase() < b.name.toUpperCase();
    });

    return {
        caipy: caipyData,
        channels: channelList
    };
}

/**
 * Build the item map necessary for the timeline
 * 
 * @param  {String} startDate start date in DD/MM/YYYY format
 * @param  {String} stopDate  end date in DD/MM/YYYY format
 * @param  {Object} channels  Object holding caipy events & epg programs
 * @return {Array}            Array of DataSet item for the timeline object
 */
export function buildChannelMap(startDate, stopDate, channel, channelName) {

    var items = new vis.DataSet();

    for (var i = 0; i < channel.program.length; i++) {
        items.add(channel.program[i]);
    }
    for (i = 0; i < channel.caipy.length; i++) {
        items.add(channel.caipy[i]);
    }

    return {
        channelName: channelName,
        start: moment(startDate, "YYYYMMDDHHmmSS").toDate(),
        stop: moment(stopDate, "YYYYMMDDHHmmSS").toDate(),
        items: items,
        groups: initGroups()
    };
}

/**
 * Get list of presets available.
 * 
 * @param  {Function} cb Callback
 */
export function getPresets(url, cb) {
    fetch(url + "/presets")
        .then(function(response) {
            if (response.status >= 400) {
                throw new Error("Bad response from server");
            }
            return response.json();
        })
        .then(function(data) {
            cb(null, data);
        })
        .catch(function(err) {
            cb(err, null);
        });
}

/**
 * Get list of channels available.
 * 
 * @param  {Function} cb Callback
 */
export function getChannels(url, startDate, cb) {

    startDate = moment(startDate, "DD/MM/YYYY").format("YYYYMMDDHHmmSS");

    fetch(url + "/getdatachannels?format=json&start=" + startDate)
        .then(function(response) {
            if (response.status >= 400) {
                throw new Error("Bad response from server");
            }
            return response.json();
        })
        .then(function(data) {
            cb(null, data);
        })
        .catch(function(err) {
            cb(err, null);
        });
}

/**
 * Convert milliseconds to duration object
 * 
 * @param  {Number} millis duration in milliseconds
 * @return {Object}        duration object
 */
export function convertMillisToDuration(millis) {
    var duration = moment.duration(millis);
    return {
        hour: duration.hours(),
        minutes: duration.minutes(),
        seconds: duration.seconds()
    };
}

/**
 * Convert duration to milliseconds
 * 
 * @param  {Object} duration duration object
 * @return {Number}          duration in milliseconds
 */
export function convertHmdToMillis(duration) {
    return (duration.hour * 60 * 60 * 1000 + duration.minutes * 60 * 1000 + duration.seconds * 1000);
}