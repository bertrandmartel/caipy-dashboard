import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import moment from 'moment';
import vis from 'vis';

/**
 * zoom offset value in ms added and substracted to start/stop time of the selected event 
 * @type {Number}
 */
const zoomHourOffset = 0.5 * 60 * 60 * 1000;

/**
 * The Timeline object used to render a vis.js timeline
 */
export class Timeline extends Component {

    date = {
        start: "",
        stop: ""
    }

    constructor(props) {
        super(props);
        this.updateData = this.updateData.bind(this);
        this.onTimelineClick = this.onTimelineClick.bind(this);
    }

    componentDidMount() {
        this.updateData(this.props, true);
    }

    fit() {
        var selection = this.timeline.getSelection();
        if (selection.length > 0) {
            this.timeline.focus(selection);
            this.timeline.setSelection([]);
            let startDate = moment(this.timeline.itemSet.items[selection[0]].data.start.getTime() - zoomHourOffset).format("YYYY-MM-DD HH:mm:ss");
            let stopDate = moment(this.timeline.itemSet.items[selection[0]].data.end.getTime() + zoomHourOffset).format("YYYY-MM-DD HH:mm:ss");
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

    updateTimelineItems(items) {
        this.timeline.setItems(items);
    }

    onTimelineClick(e) {
        //var props = this.timeline.getEventProperties(e);
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
            case "options":
                var options = this.getOptions(this.timeline.getWindow(), this.props.options);
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
        var windowEnd = new Date(windowStart.getTime() + 1 * 60 * 60 * 1000);

        return {
            start: windowStart,
            end: windowEnd
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

        var window = this.getWindow(config.data.items);

        var options = this.getOptions(window, config.options);

        if (create) {
            this.timeline = new vis.Timeline(container, null, options);
        } else {
            this.timeline.setOptions(options);
        }
        this.timeline.setGroups(config.data.groups);
        this.timeline.setItems(config.data.items);
    }

    render() {
        return <div className="timeline-tools">
                    <h5 key={this.props.data.channelName + "-title"} className="title">{this.props.data.channelName} </h5>
                    <div onClick={(e) => this.onTimelineClick(e)} className="timeline-object" id={this.props.data.channelName}></div>
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