//react
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { withStyles } from 'material-ui/styles';
import AppBar from 'material-ui/AppBar';
import Tabs, { Tab } from 'material-ui/Tabs';

import EpgDataSet from './EpgDataSet.js';
import CaipyDataSet from './CaipyDataSet.js';
import TimelineContainer from './Timeline.js';
import TimelineIcon from 'material-ui-icons/Timeline';
import StorageIcon from 'material-ui-icons/Storage';

function TabContainer(props) {
    return <div style={{ }}>{props.children}</div>;
}

TabContainer.propTypes = {
    children: PropTypes.node.isRequired,
};

const styles = theme => ({
    root: {
        flexGrow: 1,
        marginTop: 0,
        backgroundColor: theme.palette.background.paper,
    },
    tabRoot: {
        backgroundColor: theme.palette.background.paper,
    },
    hidden : {
      display: 'none'
    }
});

/**
 * Tab view showing the dataset & the timeline
 */
class SectionTabs extends Component {

    caipyDataSet = {};
    epgDataSet = {};

    constructor(props) {
        super(props);
        this.updatePage = this.updatePage.bind(this);
        this.playRolling = this.playRolling.bind(this);
        this.pauseRolling = this.pauseRolling.bind(this);
    }

    /**
     * Update selected page according to start date of selected item
     * 
     * @param  {Date} date start date of selected item
     * @param  {String} channel channel tab to update
     */
    updatePage(date, channel) {
    }

    playRolling() {
        this.props.onPlayRolling();
    }

    pauseRolling() {
        this.props.onPauseRolling();
    }

    state = {
        value: 0,
        updatePageDate: null,
        updateChannel: null
    };

    handleChange = (event, value) => {
        this.setState({ value });
    };

    render() {
        const { classes } = this.props;
        const { value } = this.state;

        const profile = {
            tab1: (value === 0),
            tab2: (value === 1),
            tab3: (value === 2),
        }
        return (<div className={classes.root}>
        <AppBar position="static">
          <Tabs 
            value={value} 
            onChange={this.handleChange}
            indicatorColor="accent"
            textColor="accent"
            className={classes.tabRoot}
            >
            <Tab icon={<TimelineIcon />} label="timeline" />
            <Tab icon={<StorageIcon />} label="event dataset" />
            <Tab icon={<StorageIcon />} label="EPG dataset" />
          </Tabs>
        </AppBar>
        <div className={profile.tab1 ? "" : classes.hidden}>
          <TabContainer >
              <div className={this.props.ready ? "" : "hidden"}>
                <TimelineContainer 
                  key={this.props.items.channelName}
                  channel={this.props.items.channelName}
                  data={this.props.items}
                  caipyData={this.props.caipyData}
                  epgData={this.props.epgData}
                  onUpdatePage={this.updatePage}
                  options={this.props.options}
                  actionType={this.props.actionType}
                  settings={this.props.settings}
                  onPlayRolling={this.playRolling}
                  onPauseRolling={this.pauseRolling}
                  onSetStartOverChart={this.props.onSetStartOverChart}
                  keepCurrentWindow={this.props.keepCurrentWindow}
                  onOpenFlowChart={this.props.onOpenFlowChart}
                  onUpdateOptions={this.props.onUpdateOptions}
                  overrideOptions={this.props.overrideOptions}
                  startover={this.props.startover}
                  />
              </div>
          </TabContainer>
        </div>

        <div className={profile.tab2 ? "" : classes.hidden}>
          <TabContainer>
              <div className={this.props.ready ? "" : "hidden"}>
                {
                    this.props.caipyData.map(function(value, index){
                        return (
                            <CaipyDataSet key={value.name} 
                                         name={value.name}
                                         rows={value.rows}
                                         length={value.rows.length}
                                         perPage={50}
                                         ref={instance => { this.caipyDataSet[value.name] = instance; }}
                                         />
                       );
                    },this)
                }
              </div>
          </TabContainer>
        </div>

        <div className={profile.tab3 ? "" : classes.hidden}>
          <TabContainer>
            <div className={this.props.ready ? "" : "hidden"}>
                  
              <EpgDataSet 
                key={this.props.epgData.name} 
                name={this.props.epgData.name}
                rows={this.props.epgData.rows}
                perPage={50}
                ref={instance => { this.epgDataSet[this.props.epgData.name] = instance; }}
              />
            </div>
          </TabContainer>
        </div>
      </div>)
    }
}

SectionTabs.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(SectionTabs);