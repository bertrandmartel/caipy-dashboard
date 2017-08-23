//react
import React, { Component } from 'react';

//react components
import { Tabs, Tab, Collection, CollectionItem } from 'react-materialize';

import { CaipyDataSetItem, EpgDataSetItem } from './DataSet.js';

import { Timeline } from './Timeline.js';

/**
 * Tab view showing the dataset & the timeline
 */
export class TabCollection extends Component {

    state = {
        updatePageDate: null,
        updateChannel: null
    };

    caipyDataSet = {};
    epgDataSet = {};

    constructor(props) {
        super(props);
        this.updatePage = this.updatePage.bind(this);
    }

    /**
     * Update selected page according to start date of selected item
     * 
     * @param  {Date} date start date of selected item
     * @param  {String} channel channel tab to update
     */
    updatePage(date, channel) {
        this.caipyDataSet[channel].updatePage(date);
        this.epgDataSet[channel].updatePage(date);
    }

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
                                                                      channel={value.channelName}
                                                                      data={value}
                                                                      caipyData={this.props.caipyData}
                                                                      epgData={this.props.epgData}
                                                                      onUpdatePage={this.updatePage}
                                                                      options={this.props.options}
                                                                      actionType={this.props.actionType}
                                                                      settings={this.props.settings}
                                                                      />
                                                        </CollectionItem>             
                                               );
                                            },this)
                                        }
                                    </Collection>
                                </div>
                            </Tab>
                            <Tab title="event dataset" active>
                                <div className={this.props.ready ? "" : "hidden"}>
                                    <Collection>
                                        {
                                            this.props.caipyData.map(function(value, index){
                                                return (
                                                    <CaipyDataSetItem key={value.name} 
                                                                 name={value.name}
                                                                 rows={value.rows}
                                                                 length={value.rows.length}
                                                                 perPage={15}
                                                                 ref={instance => { this.caipyDataSet[value.name] = instance; }}
                                                                 />
                                               );
                                            },this)
                                        }
                                    </Collection>
                                </div>
                            </Tab>
                            <Tab title="epg dataset" active>
                                <div className={this.props.ready ? "" : "hidden"}>
                                    <Collection>
                                        {
                                            this.props.epgData.map(function(value, index){
                                                return (
                                                    <EpgDataSetItem key={value.name} 
                                                                 name={value.name}
                                                                 rows={value.rows}
                                                                 length={value.rows.length}
                                                                 perPage={15}
                                                                 ref={instance => { this.epgDataSet[value.name] = instance; }}
                                                                 />
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