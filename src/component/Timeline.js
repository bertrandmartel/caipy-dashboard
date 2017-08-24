import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import moment from 'moment';
import vis from 'vis';

//import StartOver functions
import * as StartOver from '../startover/StartOver.js';

const startOverId = "startOverId";

/**
 * The Timeline object used to render a vis.js timeline
 */
export class Timeline extends Component {

    date = {
        start: "",
        stop: ""
    }

    currentTime = null;
    lastChangedTime = null;

    constructor(props) {
        super(props);
        this.updateData = this.updateData.bind(this);
        this.onSelect = this.onSelect.bind(this);
        this.onTimeChange = this.onTimeChange.bind(this);
        this.onClick = this.onClick.bind(this);
    }

    componentDidMount() {
        this.updateData(this.props, true);
    }

    fit() {
        var selection = this.timeline.getSelection();
        if (selection.length > 0) {
            this.timeline.focus(selection);
            this.timeline.setSelection([]);
            let startDate = moment(this.timeline.itemSet.items[selection[0]].data.start.getTime() - this.props.settings.zoomWindowSize).format("YYYY-MM-DD HH:mm:ss");
            let stopDate = moment(this.timeline.itemSet.items[selection[0]].data.end.getTime() + this.props.settings.zoomWindowSize).format("YYYY-MM-DD HH:mm:ss");
            this.timeline.setWindow(startDate, stopDate);
        } else {
            //this.timeline.setWindow(this.date.start, this.date.stop);
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
            case "fit":
                this.fit();
                break;
            case "options-timeline":
                var options = this.getOptions(this.timeline.getWindow(), this.props.options);
                this.timeline.setOptions(options);
                break;
            case "options-global":
                options = this.getOptions(this.getWindow(this.props.data.items), this.props.options);
                this.timeline.setOptions(options);
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
        var windowEnd = new Date(windowStart.getTime() + this.props.settings.windowInitSize);

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
        var startOver = StartOver.computeStartover(this.currentTime, this.props.caipyData, this.props.epgData, this.props.channel);

        this.timeline.itemSet.itemsData.remove(startOverId);

        var tooltip = 'title    : ' + startOver.program.title + '<br/>' +
            'epg time : ' + moment(new Date(startOver.program.start)).format("HH:mm") + '-' + moment(new Date(startOver.program.end)).format("HH:mm");

        if (startOver.startover) {

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
        } else {
            this.timeline.itemSet.itemsData.update({
                id: startOverId,
                group: 2,
                start: new Date(startOver.program.start),
                end: this.currentTime,
                content: startOver.program.title,
                className: "startover",
                title: tooltip
            });
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

    /**
     * Called when user click on timeline
     * @param  {Object} properties properties
     */
    onClick(properties) {
        for (var i = this.timeline.customTimes.length - 1; i >= 0; i--) {
            if (this.timeline.customTimes[i]) {
                this.timeline.removeCustomTime(this.timeline.customTimes[i].options.id);
            }
        }
        this.currentTime = properties.time;
        this.timeline.addCustomTime(properties.time, properties.time);
        this.computeStartOver();
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

        var window = this.getWindow(config.data.items);

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
    }

    render() {
        return <div className="timeline-tools">
                    <h5 key={this.props.data.channelName + "-title"} className="title">{this.props.data.channelName} </h5>
                    <div className="timeline-object" id={this.props.data.channelName}></div>
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