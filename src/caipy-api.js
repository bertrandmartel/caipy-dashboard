import moment from 'moment';
import vis from 'vis';

/**
 * default text on caipy events
 * @type {String}
 */
const caipyText = "";

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
 * Format program id from program start/stop date and title
 * 
 * @param  {Date} start program start 
 * @param  {Date} stop  program end
 * @param  {String} title program title
 * @return {String}       program id
 */
function buildProgramId(start, stop, title) {
    return start.getTime() + ":" + stop.getTime() + ":" + title;
}

/**
 * TV channel object.
 */
class Channel {
    constructor(name) {
        this.name = name;
        this.programMap = new Map();
        this.caipyEventList = [];
    }
}

/**
 * Tv program object
 */
class TvProgram {
    constructor(start, stop, title) {
        this.start = start;
        this.stop = stop;
        this.title = title;
        this.id = buildProgramId(start, stop, title);
    }
}

/*eslint no-extend-native: ["off", { "exceptions": ["Object"] }]*/
(function() {
    if (typeof Object.defineProperty === 'function') {
        try { Object.defineProperty(Array.prototype, 'sortBy', { value: sb }); } catch (e) {}
    }
    if (!Array.prototype.sortBy) Array.prototype.sortBy = sb;

    function sb(f) {
        for (var i = this.length; i;) {
            var o = this[--i];
            this[i] = [].concat(f.call(o, o, i), o);
        }
        this.sort(function(a, b) {
            for (var i = 0, len = a.length; i < len; ++i) {
                if (a[i] !== b[i]) return a[i] < b[i] ? -1 : 1;
            }
            return 0;
        });
        for (i = this.length; i;) {
            this[--i] = this[i][this[i].length - 1];
        }
        return this;
    }
})();

/**
 * Build items object made of Caipy events and TV programs.
 * 
 * @param  {Object} data input JSON data downloaded from remote URL or from local json
 * @return {Array} array of channel with the required data to build timeline     
 */
export function buildItems(data) {

    for (var i = 0; i < data.length; i++) {
        data[i].rows.sortBy(function(o) { return -moment(o.time, "DD/MM/YYYY HH:mm:ss").toDate() });
    }

    var stopDate = moment(data[0].rows[0].time, "DD/MM/YYYY HH:mm:ss").toDate();

    var offset = 0;
    var startDate;

    var channelMap = new Map();

    var skipProgram = {};

    for (i = 0; i < data.length; i++) {

        var currentChannel;

        if (channelMap.has(data[i].name)) {
            currentChannel = channelMap.get(data[i].name);
        } else {
            currentChannel = new Channel();
            channelMap.set(data[i].name, currentChannel);
            offset = 0;
            skipProgram = {};
        }

        startDate = moment(data[i].rows[data[i].rows.length - 1].time, "DD/MM/YYYY HH:mm:ss").toDate();

        for (var j = 0; j < data[i].rows.length; j++) {

            var title = data[i].rows[j].title;
            var currentDate = moment(data[i].rows[j].time, "DD/MM/YYYY HH:mm:ss").toDate();
            var start = moment(data[i].rows[j].start, "HH:mm:ss").toDate();
            var stop = moment(data[i].rows[j].stop, "HH:mm:ss").toDate();
            var programStart;
            var programStop;

            if (data[i].rows[j].name === "SharpStart") {

                let tempDate = new Date(currentDate.getTime());

                currentChannel.caipyEventList.push({
                    id: tempDate.getTime() + ":" + tempDate.getTime(),
                    group: 1,
                    start: tempDate,
                    end: tempDate,
                    content: caipyText,
                    title: moment(tempDate).format("HH:mm"),
                    className: "caipy"
                });
            }

            var detectTransition = false;
            var duration;

            if (skipProgram.start) {
                if (skipProgram.start !== data[i].rows[j].start ||
                    skipProgram.stop !== data[i].rows[j].stop ||
                    skipProgram.title !== title) {
                    skipProgram = {};
                }
            }

            if (stop.getHours() < start.getHours()) {
                detectTransition = true;
                var temp = new Date();
                temp.setHours(start.getHours());
                temp.setMinutes(start.getMinutes());
                temp.setSeconds(start.getSeconds());

                var temp2 = new Date(temp.getTime() + 24 * 60 * 60 * 1000);
                temp2.setHours(stop.getHours());
                temp2.setMinutes(stop.getMinutes());
                temp2.setSeconds(stop.getSeconds());

                duration = temp.getTime() - temp2.getTime();

                //change day
                if (currentDate.getHours() >= 0) {
                    //stop is currentDate
                    currentDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000 - (24 * 60 * 60 * 1000) * offset);
                    currentDate.setHours(stop.getHours());
                    currentDate.setMinutes(stop.getMinutes());
                    currentDate.setSeconds(stop.getSeconds());
                    programStop = currentDate;
                    programStart = new Date(programStop.getTime() + duration);
                }
            } else {
                duration = stop.getTime() - start.getTime();
                //start is currentDate
                currentDate.setHours(start.getHours());
                currentDate.setMinutes(start.getMinutes());
                currentDate.setSeconds(start.getSeconds());
                programStart = currentDate;
                programStop = new Date(programStart.getTime() + duration);
            }

            var id = buildProgramId(programStart, programStop, title);

            if (!currentChannel.programMap.has(id) && !skipProgram.start) {
                if (detectTransition) {
                    skipProgram = {
                        start: data[i].rows[j].start,
                        stop: data[i].rows[j].stop,
                        title: title
                    };
                    offset++;
                }
                currentChannel.programMap.set(id, new TvProgram(new Date(programStart.getTime()), new Date(programStop.getTime()), title));
            }
        }
    }

    var channelList = [];

    channelMap.forEach((value, key, map) => {

        var items = new vis.DataSet();

        value.programMap.forEach((value, key, map) => {
            items.add({
                id: value.id,
                group: 0,
                start: value.start,
                end: value.stop,
                content: value.title,
                className: "program",
                title: value.title + " : " + moment(value.start).format("HH:mm") + "-" + moment(value.stop).format("HH:mm")
            });
        });

        for (var i = 0; i < value.caipyEventList.length; i++) {
            items.add(value.caipyEventList[i]);
        }

        channelList.push({
            channelName: key,
            start: startDate,
            stop: stopDate,
            items: items,
            groups: initGroups()
        });
    });

    return channelList;
}