import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import moment from 'moment';
import vis from 'vis';

//react materialize components
import { Button, Icon } from 'react-materialize';

//import StartOver functions
import * as StartOver from '../startover/StartOver.js';

//storage functions
import * as Storage from '../stores/Storage.js';

//constant id for start over item in timeline
const startOverId = "startOverId";

/**
 * The Timeline object used to render a vis.js timeline
 */
export class TimelineContainer extends Component {

    date = {
        start: "",
        stop: ""
    }

    currentTime = null;
    lastChangedTime = null;

    rolling = false;

    rollingPeriod = 2;

    constructor(props) {
        super(props);
        this.updateData = this.updateData.bind(this);
        this.onSelect = this.onSelect.bind(this);
        this.onTimeChange = this.onTimeChange.bind(this);
        this.onClick = this.onClick.bind(this);
        this.rollingTask = this.rollingTask.bind(this);
    }

    componentDidMount() {
        if (this.props.data.items) {
            this.updateData(this.props, true);
        }
    }

    /**
     * Get options used to build timeline
     * @param  {Date}   start window start time
     * @param  {Date}   stop  window end time
     * @param  {String} type  type of items ("point"/"range")
     * @return {Object}       Options object
     */
    getOptions(window, options) {

        return {
            orientation: 'top',
            showCurrentTime: true,
            stack: options.stack,
            type: options.type,
            start: window.start,
            end: window.end,
            tooltip: {
                followMouse: true
            },
            template: function(item, element) {
                if (!item) { return }
                ReactDOM.unmountComponentAtNode(element);
                return ReactDOM.render(<ItemTemplate item={item} />, element);
            },
            groupTemplate: function(group, element) {
                if (!group) { return }
                ReactDOM.unmountComponentAtNode(element);
                return ReactDOM.render(<GroupTemplate group={group} />, element);
            }
        }
    }

    /**
     * Manage action to perform based on actionType props
     * 
     */
    componentDidUpdate() {
        switch (this.props.actionType) {
            case "options-timeline":
                var options = this.getOptions(this.timeline.getWindow(), this.props.options);
                this.timeline.setOptions(options);
                this.computeStartOver();
                break;
            case "options-global":
                options = this.getOptions(this.getWindow(this.props.data.items), this.props.options);
                this.timeline.setOptions(options);
                this.computeStartOver();
                break;
            case "update":
                this.updateData(this.props, false);
                break;
            case "create":
                this.updateData(this.props, true);
                break;
            default:
                break;
        }
    }

    /**
     * Build timeline window, a dichotomy is used with addition of a fixed value
     * 
     * @param  {vis.DataSet} items data set featured in the timeline
     * @return {Object}       window start & end values
     */
    getWindow(items) {
        var minDate = items.min("start").start;
        var maxDate = items.max("end").end;

        var diff = maxDate.getTime() - minDate.getTime();

        var windowStart = new Date(minDate.getTime() + diff / 2);
        var windowEnd = new Date(windowStart.getTime() + this.props.settings.windowSize);

        return {
            start: windowStart,
            end: windowEnd
        }
    }

    /**
     * Called when an item is select in the timeline
     * 
     * @param  {[type]} properties item properies
     */
    onSelect(properties) {
        if (this.timeline.itemSet.items[properties.items[0]]) {
            if (typeof this.props.onUpdatePage === 'function') {
                this.props.onUpdatePage(this.timeline.itemSet.items[properties.items[0]].data.start, this.props.channel);
            }
        }
    }

    /**
     * Compute start over and replace the current startover item.
     */
    computeStartOver() {

        var startOver = StartOver.computeStartover(this.currentTime,
            this.props.caipyData,
            this.props.epgData,
            this.props.channel,
            this.props.settings.startOverDetectAd,
            this.props.settings.startOverDetectSharpStart);

        this.timeline.itemSet.itemsData.remove(startOverId);

        var tooltip;

        if (startOver.startover) {

            tooltip = 'title    : ' + startOver.program.title + '<br/>' +
                'epg time : ' + moment(new Date(startOver.program.start)).format("HH:mm") + '-' + moment(new Date(startOver.program.end)).format("HH:mm");

            tooltip += '<br/>start time : ' + moment(new Date(startOver.startover.time)).format("HH:mm");
            tooltip += '<br/>clip : ' + startOver.startover.clip;

            this.timeline.itemSet.itemsData.update({
                id: startOverId,
                group: 2,
                start: new Date(startOver.startover.time),
                end: this.currentTime,
                content: startOver.program.title,
                className: "startover",
                title: tooltip
            });
        } else if (startOver.program) {

            tooltip = 'title    : ' + startOver.program.title + '<br/>' +
                'epg time : ' + moment(new Date(startOver.program.start)).format("HH:mm") + '-' + moment(new Date(startOver.program.end)).format("HH:mm");

            this.timeline.itemSet.itemsData.update({
                id: startOverId,
                group: 2,
                start: new Date(startOver.program.start),
                end: this.currentTime,
                content: startOver.program.title,
                className: "startover",
                title: tooltip
            });
        } else {
            console.log("error no program found");
        }
    }

    /**
     * Called when time change
     * @param  {Object} properties properties
     */
    onTimeChange(properties) {
        this.currentTime = properties.time;
        this.computeStartOver();
    }

    clearCustomTime() {
        for (var i = this.timeline.customTimes.length - 1; i >= 0; i--) {
            if (this.timeline.customTimes[i]) {
                this.timeline.removeCustomTime(this.timeline.customTimes[i].options.id);
            }
        }
    }

    setCustomTime(time) {
        this.clearCustomTime();
        this.currentTime = time;
        this.timeline.addCustomTime(time, time);
        this.computeStartOver();
    }

    /**
     * Called when user click on timeline
     * @param  {Object} properties properties
     */
    onClick(properties) {
        if (!this.rolling) {
            this.setCustomTime(properties.time);
        }
    }

    createCustomTime(window) {
        this.clearCustomTime();
        var range = this.timeline.getWindow();
        var date = new Date(range.start.getTime() + (range.end.getTime() - range.start.getTime()) / 2);
        this.timeline.addCustomTime(date, date);
        this.onTimeChange({
            time: date
        });
    }

    move(value) {
        var range = this.timeline.getWindow();
        var interval = range.end - range.start;
        this.timeline.setWindow({
            start: range.start.valueOf() - interval * value,
            end: range.end.valueOf() - interval * value
        });
    }

    moveLeft() {
        this.move(0.2);
    }

    moveRight() {
        this.move(-0.2);
    }

    zoomIn() {
        this.timeline.zoomIn(0.5);
    }

    zoomOut() {
        this.timeline.zoomOut(0.5);
    }

    stackToggle() {
        this.props.options.stack = !this.props.options.stack;
        var options = this.getOptions(this.timeline.getWindow(), this.props.options);
        this.timeline.setOptions(options);
        Storage.setStack(this.props.options.stack);
    }

    rollingTask() {
        var nextTime = this.currentTime.getTime() + this.rollingPeriod * 60 * 1000;
        this.setCustomTime(new Date(nextTime));
    }

    playRolling() {
        if (this.rollingId) {
            clearInterval(this.rollingId);
        }
        if (!this.rolling) {
            this.rollingId = setInterval(this.rollingTask, 500);
        }
        this.rolling = !this.rolling;
        this.props.onPlayRolling();
    }

    pauseRolling() {
        if (this.rollingId) {
            clearInterval(this.rollingId);
        }
        this.rolling = !this.rolling;
        this.props.onPauseRolling();
    }

    slowerRolling() {
        if (this.rolling) {
            this.rollingPeriod /= 2;
        }
    }

    fasterRolling() {
        if (this.rolling) {
            this.rollingPeriod *= 2;
        }
    }

    /**
     * Create or update timeline
     * 
     * @param  {Object}  config properties
     * @param  {Boolean} create define if action is create or update 
     */
    updateData(config, create) {
        var container = document.getElementById(config.data.channelName);

        this.date.start = config.data.start;
        this.date.stop = config.data.stop;

        var window;

        if (!this.props.keepCurrentWindow) {
            window = this.getWindow(config.data.items);
        } else {
            window = this.timeline.getWindow();
        }

        var options = this.getOptions(window, config.options);

        if (create) {
            this.timeline = new vis.Timeline(container, null, options);
            this.timeline.on('select', this.onSelect);
            this.timeline.on('timechange', this.onTimeChange);
            this.timeline.on('click', this.onClick);
        } else {
            this.timeline.setOptions(options);
        }
        this.timeline.setGroups(config.data.groups);
        this.timeline.setItems(config.data.items);
        if (!this.props.keepCurrentWindow) {
            this.createCustomTime(window);
        } else {
            this.computeStartOver();
        }
    }

    render() {
        return <div className="timeline-tools">

                    <div className="timeline-object">
                    
                        <div className="pull-right">
                            <Button waves='light' onClick={() => this.moveLeft()} className="blue darken-1 tools"><Icon small>keyboard_arrow_left</Icon></Button>
                            <Button waves='light' onClick={() => this.moveRight()} className="blue darken-1 tools"><Icon small>keyboard_arrow_right</Icon></Button>
                            <Button waves='light' onClick={() => this.zoomIn()} className="blue darken-1 tools"><Icon small>zoom_in</Icon></Button>
                            <Button waves='light' onClick={() => this.zoomOut()} className="blue darken-1 tools"><Icon small>zoom_out</Icon></Button>
                            <Button waves='light' onClick={() => this.stackToggle()} className="blue darken-1 tools"><Icon small>clear_all</Icon></Button>
                            <Button waves='light' onClick={() => this.slowerRolling()} className="blue darken-1 tools"><Icon small>fast_rewind</Icon></Button>
                            <Button waves='light' onClick={() => this.playRolling()} className={ this.rolling ? "hidden" : "blue darken-1 tools"}><Icon small>play_arrow</Icon></Button>
                            <Button waves='light' onClick={() => this.pauseRolling()} className={ this.rolling ? "blue darken-1 tools" : "hidden"}><Icon small>stop</Icon></Button>
                            <Button waves='light' onClick={() => this.fasterRolling()} className="blue darken-1 tools"><Icon small>fast_forward</Icon></Button>
                        </div>

                        <div className="timeline-container" id={this.props.data.channelName}></div>

                    </div>
               
                </div>;
    }
}

/**
 * Timeline Group compoment
 */
class GroupTemplate extends React.Component {
    render() {
        var { group } = this.props;
        return <div>
                <label>{group.content}</label>
            </div>
    }
}

/**
 * Timeline Item component
 */
class ItemTemplate extends React.Component {
    render() {
        var { item } = this.props;
        return <div className="vertical">
                <label>{item.content}</label>
            </div>
    }
}