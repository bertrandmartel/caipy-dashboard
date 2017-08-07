import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import moment from 'moment';
import vis from 'vis';

/**
 * zoom offset value in ms added and substracted to start/stop time of the selected event 
 * @type {Number}
 */
const zoomHourOffset = 1 * 60 * 60 * 1000;

/**
 * default type of DataSet items for Caipy events
 * @type {String}
 */
const defaultItemType = "range";

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
            var elements = selection[0].split(":");
            let startDate = moment(new Date(parseInt(elements[0], 10) - zoomHourOffset)).format("YYYY-MM-DD HH:mm:ss");
            let stopDate = moment(new Date(parseInt(elements[1], 10) + zoomHourOffset)).format("YYYY-MM-DD HH:mm:ss");
            this.timeline.setWindow(startDate, stopDate);
        } else {
            this.timeline.setWindow(this.date.start, this.date.stop);
        }
    }

    /**
     * Get options used to build timeline
     * @param  {Date}   start window start time
     * @param  {Date}   stop  window end time
     * @param  {String} type  type of items ("point"/"range")
     * @return {Object}       Options object
     */
    getOptions(start, stop, type) {
        return {
            orientation: 'top',
            stack: false,
            type: type,
            start: start,
            end: stop,
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
     * Update the type of items ("point"/"range")
     * 
     * @param  {Object} items object items
     */
    updateType(props) {
        var type = props.itemType ? "point" : "range";

        props.data.items.forEach((item) => {
            if (item.group === 1) {
                item.type = type;
                props.data.items.update(item);
            }
        });
        return props.data.items;
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
            case "update-type":
                var items = this.updateType(this.props);
                this.updateTimelineItems(items);
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
     * Create or update timeline
     * 
     * @param  {Object}  config properties
     * @param  {Boolean} create define if action is create or update 
     */
    updateData(config, create) {
        var container = document.getElementById(config.data.channelName);
            
        this.date.start = config.data.start;
        this.date.stop = config.data.stop;

        var options = this.getOptions(config.data.start, config.data.stop, defaultItemType);

        config.data.items = this.updateType(config);

        if (!create) {
            this.timeline.setOptions(options);
            this.timeline.setData({
                groups: config.data.groups,
                items: config.data.items
            });
        } else {
            this.timeline = new vis.Timeline(container, config.data.items, config.data.groups, options);
        }
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