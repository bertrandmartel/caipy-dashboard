//style
import 'vis/dist/vis.css';
//import 'materialize-css/dist/css/materialize.min.css';
import './App.css';

//react
import React, { Component } from 'react';

//demo data
import demo from './demo.json';

//react components
import { Chip, Tabs, Tab, Footer, Collection, CollectionItem, Row, Col, Preloader, Navbar, NavItem, Icon } from 'react-materialize';
import { Timeline } from './Timeline.js';
import { DataSetItem } from './DataSet.js';
import { FilterView } from './Filter.js';
import { SettingsView } from './Settings.js';

//utility for Caipy (parse JSON data)
import * as ApiUtils from './caipy-api.js';
import * as Storage from './Storage.js';

// jquery & materialize
import $ from 'jquery';
//import $ from 'jquery';
window.$ = window.jQuery = require('jquery');
//window.$ = window.jQuery = $;

require('materialize-css/dist/js/materialize.min.js');
//require('materialize-css/materialize.min.js')

/**
 * Default start date for query in live mode
 * @type {String}
 */
const defaultStartDate = "08/02/2017";

/**
 * Default end date for query in live mode
 * @type {String}
 */
const defaultEndDate = "08/02/2017";

/**
 * Footer component
 */
class FooterView extends Component {
    render() {
        return <Footer className='white-text footer blue darken-1' 
                       moreLinks={
                            <div>
                            <a className="white-text center" href="https://github.com/bertrandmartel" rel="noopener noreferrer" target="_blank">
                            Copyright (c) 2017 Bertrand Martel</a>
                             </div>
                         }>
                </Footer>
    }
}

/**
 * View showing a Loader in the middle of the screen
 */
class ProgressView extends Component {
    render() {
        return <Row className={this.props.value ? "center-div hidden" : "center-div"}>
                    <Col s={12}>
                        <Preloader size="big" color="blue"/>
                    </Col>
                    <p className="error-message">{this.props.message}</p>
                </Row>
    }
}

/**
 * The navigation bar 
 */
class TopNavbar extends Component {

    /**
     * fit the items in the timeline
     */
    fit() {
        if (typeof this.props.onFit === 'function') {
            this.props.onFit();
        }
    }

    /**
     * update the type of item in the timeline ("point"/"range")
     */
    updateType() {
        if (typeof this.props.onUpdateType === 'function') {
            this.props.onUpdateType();
        }
    }

    /**
     * refresh data (in dataset & in timeline)
     * @param  {String} type refresh type ("create" or "update")
     */
    refresh(type) {
        if (typeof this.props.onRefresh === 'function') {
            this.props.onRefresh(type);
        }
    }

    /**
     * open URL settings view
     */
    urlSettings() {
        if (typeof this.props.onUrlSettings === 'function') {
            this.props.onUrlSettings();
        }
    }

    render() {
        return <Navbar brand='Caipy Dashboard' className="blue darken-1" right>
                    <NavItem onClick={() => this.fit()}><Icon medium>center_focus_strong</Icon></NavItem>
                    <NavItem onClick={() => this.updateType()}><Icon medium>timeline</Icon></NavItem>
                    <NavItem onClick={() => this.refresh("update")}><Icon>refresh</Icon></NavItem>
                    <NavItem onClick={() => this.urlSettings()}><Chip close={false}>{this.props.mode} mode</Chip></NavItem> 
                    <NavItem href="https://github.com/bertrandmartel/caipy-dashboard" target="_blank" ><Icon>code</Icon></NavItem>
                </Navbar>
    }
}

/**
 * Tab view showing the dataset & the timeline
 */
class TabCollection extends Component {

    render() {
        return <div className='tab-main'>
                    <Tabs>
                            <Tab title="timeline" active>
                                <div className={this.props.ready ? "" : "hidden"}>
                                    <Collection>
                                        {
                                            this.props.items.map(function(value, index){
                                                return (
                                                        <CollectionItem className="coll-item" key={value.channelName + "-coll"}>
                                                            <Timeline key={value.channelName}
                                                                      data={value}
                                                                      actionType={this.props.actionType}
                                                                      itemType={this.props.itemType}/>
                                                        </CollectionItem>             
                                               );
                                            },this)
                                        }
                                    </Collection>
                                </div>
                            </Tab>
                            <Tab title="dataset" active>
                                <div className={this.props.ready ? "" : "hidden"}>
                                    <Collection>
                                        {
                                            this.props.data.map(function(value, index){
                                                return (
                                                    <DataSetItem key={value.name} 
                                                                 name={value.name}
                                                                 rows={value.rows}
                                                                 length={value.rows.length}
                                                                 perPage={15}/>
                                               );
                                            },this)
                                        }
                                    </Collection>
                                </div>
                            </Tab>
                    </Tabs>
                </div>
    }
}

/**
 * Main app component
 */
class App extends Component {

    /**
     * date filter used to init filter & to be used in query in live mode.
     * @type {Object}
     */
    date = {
        startDate: defaultStartDate,
        endDate: defaultEndDate
    }

    state = {
        ready: false,
        items: [],
        data: [],
        mode: "demo",
        url: Storage.getApiUrl(),
        message: "",
        startDate: this.date.startDate,
        endDate: this.date.endDate
    };

    /**
     * mode can be "demo" or "live"
     * @type {String}
     */
    mode = "demo";

    /**
     * default timeline item type (false for "range" / true for "point")
     * @type {Boolean}
     */
    itemType = false;

    constructor() {
        super();
        this.items = [];
        this.data = [];
        this.checkItemType();
        this.checkDate();
        this.fit = this.fit.bind(this);
        this.refresh = this.refresh.bind(this);
        this.updateType = this.updateType.bind(this);
        this.setUrlSettings = this.setUrlSettings.bind(this);
        this.setMode = this.setMode.bind(this);
        this.setFilterSettings = this.setFilterSettings.bind(this);
    }

    /**
     * initialize dates used in filter & query
     */
    checkDate() {
        var startDate = Storage.getStartDate();
        var endDate = Storage.getEndDate();
        if (startDate !== null && startDate !== "undefined" &&
            endDate !== null && endDate !== "undefined") {
            this.date.startDate = startDate;
            this.date.endDate = endDate;
        }
    }

    /**
     * initiliaze timeline item type
     */
    checkItemType() {
        var type = Storage.getItemType();
        if (type === null) {
            Storage.setItemType(false);
            this.itemType = false;
        } else {
            this.itemType = (type === 'true');
        }
    }

    /**
     * On mount check the mode ("live" or "demo") and refresh the data according to this
     */
    componentDidMount() {
        if (Storage.checkMode() !== null &&
            Storage.checkMode() === "live" &&
            Storage.checkApiUrl()) {
            this.mode = "live";
        } else {
            Storage.setMode("demo");
        }
        this.refresh("create");
    }

    /**
     * Parse the JSON data to build timeline DataSet 
     * @param  {Object} data       JSON data object (from query response or from local JSON file)
     * @param  {String} actionType type of action to perform ("create","update","idle")
     */
    parseItems(data, actionType) {
        this.items = ApiUtils.buildItems(data);
        this.data = data;
        this.setState({
            actionType: actionType,
            ready: true,
            data: this.data,
            items: this.items,
            mode: this.mode,
            url: Storage.getApiUrl(),
            message: "",
            startDate: this.date.startDate,
            endDate: this.date.endDate
        });
    }

    /**
     * Refresh the data according to mode
     * @param  {String} actionType type of action to perform ("create","update","idle")
     * @return {[type]}            [description]
     */
    refresh(actionType) {

        var that = this;

        that.setState({
            actionType: "idle",
            ready: false,
            data: that.data,
            items: that.items,
            mode: this.mode,
            url: Storage.getApiUrl(),
            message: "",
            startDate: this.date.startDate,
            endDate: this.date.endDate
        });

        if (this.mode === "live") {
            fetch(Storage.getApiUrl() + "?type=channels&startdate=" + this.date.startDate + "&starttime=00:00:00&" +
                    "enddate=" + this.date.endDate + "&endtime=23:59:59")
                .then(function(response) {
                    if (response.status >= 400) {
                        throw new Error("Bad response from server");
                    }
                    return response.json();
                })
                .then(function(data) {
                    that.parseItems(data, actionType);
                })
                .catch(function(e) {
                    console.log(e);
                    //show error message and set mode to "idle"
                    that.setState({
                        actionType: "idle",
                        ready: false,
                        data: that.data,
                        items: that.items,
                        mode: that.mode,
                        url: Storage.getApiUrl(),
                        message: "error occured",
                        startDate: that.date.startDate,
                        endDate: that.date.endDate
                    });
                });
        } else {
            //in demo mode just parse the raw item
            that.parseItems(demo, actionType);
        }
    }

    /**
     * set settings URL value
     * @param {String} url URL value
     */
    setUrlSettings(url) {
        Storage.setApiUrl(url);
        Storage.setMode("live");
        this.mode = "live";
        this.refresh("update");
    }

    /**
     * Set filter value
     * @param {Date} startDate start date filter
     * @param {Date} endDate   end date filter
     */
    setFilterSettings(startDate, endDate) {
        Storage.setDate(startDate, endDate);
        this.date.startDate = startDate;
        this.date.endDate = endDate;
        this.refresh("update");
    }

    /**
     * Set the mode ("demo" or "live")
     * @param {String} mode the mode
     */
    setMode(mode) {
        Storage.setMode(mode);
        this.mode = mode;
        this.refresh("update");
    }

    /**
     * Open URL settings modal
     */
    urlSettings() {
        $('#url-settings').modal('open');
    }

    /**
     * fit the items in the timeline according to time window or selected items
     */
    fit() {
        this.setState({
            actionType: "fit",
            ready: true,
            data: this.data,
            items: this.items,
            mode: this.mode,
            url: Storage.getApiUrl(),
            message: "",
            startDate: this.date.startDate,
            endDate: this.date.endDate
        })
    }

    /**
     * toggle timeline item type ("range" or "type")
     */
    updateType() {
        this.itemType = !this.itemType;
        Storage.setItemType(this.itemType);
        this.setState({
            actionType: "update-type",
            ready: true,
            data: this.data,
            items: this.items,
            mode: this.mode,
            url: Storage.getApiUrl(),
            message: "",
            startDate: this.date.startDate,
            endDate: this.date.endDate
        });
    }

    render() {
        return (
            <div className="body">
                <div className="main">
                    <TopNavbar mode={this.state.mode}
                               onFit={this.fit}
                               onUpdateType={this.updateType}
                               onRefresh={this.refresh}
                               onUrlSettings={this.urlSettings} />
                    <FilterView onSetFilterSettings={this.setFilterSettings}
                                mode={this.state.mode}
                                startDate={this.state.startDate}
                                endDate={this.state.endDate}/>
                    <TabCollection ready={this.state.ready} 
                                   items={this.state.items} 
                                   data={this.state.data} 
                                   actionType={this.state.actionType}
                                   itemType={this.itemType}/>
                    <ProgressView value={this.state.ready}
                                  message={this.state.message}/>
                    <SettingsView mode={this.state.mode}
                                  url={this.state.url}
                                  onSetUrlSettings={this.setUrlSettings}
                                  onSetMode={this.setMode}/>
                </div>
                <FooterView/>
             </div>
        );
    }
}

export default App;