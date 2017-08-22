import moment from 'moment';
import vis from 'vis';

require("moment-duration-format");

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
        type: "point",
        content: 'Caipy Events',
        className: 'caipy-group'
    });
    return groups;
}

/**
 * Get EPG programs by retrieving channel list and EPG for each channel 
 * 
 * @param  {Function} cb(err,res) callback that holds the result return    
 */
export function getPrograms(url, startDate, stopDate, cutState, cutDuration, cb) {

    var programData = [];
    var channelList = {};

    fetch(url + "/getdatachannels?format=json&start=" + startDate)
        .then(function(response) {
            if (response.status >= 400) {
                throw new Error("Bad response from server");
            }
            return response.json();
        })
        .then(function(channelData) {
            //get epg for each channel
            var promises_arr = [];

            for (var i = 0; i < channelData.channels.length; i++) {

                programData.push({ "name": channelData.channels[i].name });

                promises_arr.push(fetch(url + "/getepg?time_format=iso8601&" +
                        "channel=" + channelData.channels[i].name +
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
                        for (var j = 0; j < programData.length; j++) {
                            if (programData[j].name === data.tvin_name) {
                                programData[j].rows = data.events;
                            }
                        }

                        //populate events
                        for (j = data.events.length - 1; j >= 0; j--) {

                            var dateStart = new Date(data.events[j].start);
                            var dateEnd = new Date(data.events[j].end);

                            var durationDiff = parseInt(moment.duration(dateEnd.getTime() - dateStart.getTime()).format('s'), 10);

                            if (cutState && cutDuration > 0 && (durationDiff <= cutDuration)) {
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
                        channelList[data.tvin_name] = {};
                        channelList[data.tvin_name].program = epgItems;
                    }))
            }

            Promise.all(promises_arr)
                .then(function() {
                    programData.sort(function(a, b) {
                        return a.name.toUpperCase() < b.name.toUpperCase();
                    });
                    cb(null, channelList, programData);
                })
                .catch(function(err) {
                    cb(err, null);
                });
        })
}

/**
 * Get program from a static list of channels in demo mode.
 * 
 * @param  {Array} channels Array of channels
 * @return {Object}          an object that enclose the epg data set + the channel list generated
 */
export function getDemoProgram(channels, cutState, cutDuration) {
    var programData = [];
    var channelList = {};

    for (var i = 0; i < channels.length; i++) {

        programData.push({
            "name": channels[i].tvin_name,
            rows: channels[i].events
        });

        var epgItems = [];

        //populate events
        for (var j = 0; j < channels[i].events.length; j++) {

            var start = channels[i].events[j].start;
            var end = channels[i].events[j].end;

            var durationDiff = parseInt(moment.duration(new Date(end).getTime() - new Date(start).getTime()).format('s'), 10);

            if (cutState && cutDuration > 0 && (durationDiff <= cutDuration)) {
                channels[i].events.splice(j, 1);
            } else {
                var duration = moment.duration(new Date(end).getTime() - new Date(start).getTime()).format('hh[h]mm[m]ss[s]');

                var tooltip = 'title : ' + channels[i].events[j].title + '<br/>' +
                    'time  : ' + moment(start).format("HH:mm") + '-' + moment(end).format("HH:mm") + '<br/>' +
                    'duration  :' + duration;

                epgItems.push({
                    id: channels[i].events[j].event_id,
                    group: 0,
                    start: new Date(start),
                    end: new Date(end),
                    content: channels[i].events[j].title,
                    className: "program",
                    title: tooltip
                });
            }
        }
        channelList[channels[i].tvin_name] = {};
        channelList[channels[i].tvin_name].program = epgItems;
    }
    return {
        programs: programData,
        channels: channelList
    }
}

/**
 * Get Caipy data from its API
 * 
 * @param  {String}   url         URL configured
 * @param  {String}   startDate   filter start date in YYYYMMDDHHmmss format
 * @param  {String}   stopDate    filter end date in YYYYMMDDHHmmss format
 * @param  {String}   preset      preset value
 * @param  {Object}   channelList  Object holding the list of channel with the epg items 
 * @param  {Function} cb          Callback to return when all promise have ended
 */
export function getCaipyData(url, startDate, stopDate, preset, channelList, cb) {

    var caipyData = [];

    fetch(url + "/getdata?preset=" + preset +
            "&format=json&time_format=ISO8601&" +
            "start=" + startDate + "&stop=" + stopDate)
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

                if (!channelList[data.markers[j].channel].caipy) {
                    channelList[data.markers[j].channel].caipy = [];
                }
                var dateStart = new Date(data.markers[j].time);
                var dateEnd = new Date((new Date(data.markers[j].time).getTime()) + data.markers[j].duration * 1000);

                var duration = moment.duration(data.markers[j].duration * 1000).format('hh[h]mm[m]ss[s]');

                var tooltip = 'title : ' + data.markers[j].clip + '<br/>' +
                    'time  : ' + moment(dateStart).format("HH:mm") + '-' + moment(dateEnd).format("HH:mm") + '<br/>' +
                    'duration  :' + data.markers[j].duration + 's (' + duration + ')';

                channelList[data.markers[j].channel].caipy.push({
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
            cb(null, channelList, caipyData);
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

        if (!channelList[data.markers[j].channel].caipy) {
            channelList[data.markers[j].channel].caipy = [];
        }
        var dateStart = new Date(data.markers[j].time);
        var dateEnd = new Date((new Date(data.markers[j].time).getTime()) + data.markers[j].duration * 1000);

        var duration = moment.duration(data.markers[j].duration * 1000).format('hh[h]mm[m]ss[s]');

        var tooltip = 'title : ' + data.markers[j].clip + '<br/>' +
            'time  : ' + moment(dateStart).format("HH:mm") + '-' + moment(dateEnd).format("HH:mm") + '<br/>' +
            'duration  :' + data.markers[j].duration + 's (' + duration + ')';

        channelList[data.markers[j].channel].caipy.push({
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
 * @param  {String} startDate start date in YYYYMMDDHHmmss format
 * @param  {String} stopDate  end date in YYYYMMDDHHmmss format
 * @param  {Object} channels  Object holding caipy events & epg programs
 * @return {Array}            Array of DataSet item for the timeline object
 */
export function buildChannelMap(startDate, stopDate, channels) {
    var channelList = [];

    for (var property in channels) {
        if (channels.hasOwnProperty(property)) {
            var items = new vis.DataSet();

            for (var i = 0; i < channels[property].program.length; i++) {
                items.add(channels[property].program[i]);
            }
            for (i = 0; i < channels[property].caipy.length; i++) {
                items.add(channels[property].caipy[i]);
            }

            channelList.push({
                channelName: property,
                start: moment(startDate, "YYYYMMDDHHmmSS").toDate(),
                stop: moment(stopDate, "YYYYMMDDHHmmSS").toDate(),
                items: items,
                groups: initGroups()
            });
        }
    }
    channelList.sort(function(a, b) {
        return a.channelName.toUpperCase() < b.channelName.toUpperCase();
    });
    return channelList;
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