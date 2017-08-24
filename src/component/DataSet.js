import React, { Component } from 'react';

import { Pagination, Table, CollectionItem } from 'react-materialize';

import moment from 'moment';

class DataSet extends Component {

    data = [];

    /**
     * state change depending on pageIndex value
     * @type {Object}
     */
    state = {
        pageIndex: 1,
    };

    constructor() {
        super();
        this.onSelect = this.onSelect.bind(this);
    }

    onSelect(index) {
        this.setState({
            pageIndex: index
        });
    }

    /**
     * Update selected page according to start date of selected item
     * 
     * @param  {Date} date start date of selected item
     * @param  {String} channel channel tab to update
     */
    updatePage(date) {

        var millis = date.getTime();
        var set = false;
        var currentDiff = false;
        var current = "";
        var dateField = this.getDateField();

        for (var i = 0; i < this.data.length; i++) {
            if (!set) {
                set = true;
                current = new Date(this.data[i][dateField]).getTime();
                currentDiff = (millis < current);
                if (current === millis) {
                    this.setPageForIndex(i);
                    break;
                }
            } else {
                current = new Date(this.data[i][dateField]).getTime();
                if ((millis < current) !== currentDiff) {
                    this.setPageForIndex(i);
                    break;
                }
            }
        }
    }

    setPageForIndex(index) {
        var res = Math.round(index / this.props.perPage);
        if (res === 0) {
            res = 1;
        }
        this.onSelect(res);
    }
}

/**
 * Caipy Data Set table 
 */
export class CaipyDataSetItem extends DataSet {

    getDateField() {
        return "time";
    }

    render() {
        this.data = this.props.rows;

        var dataRow = this.props.rows.slice((this.state.pageIndex - 1) * this.props.perPage, (this.state.pageIndex - 1) * this.props.perPage + this.props.perPage);

        return <CollectionItem className="coll-item" key={this.props.name + "-coll"}>

                    <Pagination items={Math.round(this.props.length/this.props.perPage)} 
                                activePage={this.state.pageIndex} 
                                maxButtons={10}
                                className='pull-right'
                                onSelect={this.onSelect} />

                    <p>{(this.state.pageIndex-1)*this.props.perPage + 1}-{(this.state.pageIndex-1)*this.props.perPage+this.props.perPage} of {this.props.length}
                    </p>
                    <Table className="bordered striped">
                        <thead>
                            <tr>
                                <th data-field="time">time</th>
                                <th data-field="clip">clip</th>
                                <th data-field="duration">duration</th>
                            </tr>
                        </thead>

                        <tbody>
                        {
                            dataRow.map(function(item, index){
                                return (
                                    <tr key={this.props.name+":"+item.time}>
                                        <td>{moment(item.time).local().toString()}</td>
                                        <td>{item.clip}</td>
                                        <td>{item.duration}</td>
                                    </tr>
                                );
                            },this)
                        }
                        </tbody>
                    </Table>                              
                </CollectionItem>
    }
}

/**
 * Date Set table 
 */
export class EpgDataSetItem extends DataSet {

    getDateField() {
        return "start";
    }

    render() {
        this.data = this.props.rows;

        var dataRow = [];
        var length = 0;

        if (this.data) {
            dataRow = this.props.rows.slice((this.state.pageIndex - 1) * this.props.perPage, (this.state.pageIndex - 1) * this.props.perPage + this.props.perPage);
            length = this.props.rows.length;
        }

        return <CollectionItem className="coll-item" key={this.props.name + "-coll"}>
                    <Pagination items={Math.round(length/this.props.perPage)} 
                                activePage={this.state.pageIndex} 
                                maxButtons={10}
                                className='pull-right'
                                onSelect={this.onSelect} />
                    <p>{(this.state.pageIndex-1)*this.props.perPage + 1}-{(this.state.pageIndex-1)*this.props.perPage+this.props.perPage} of {length}
                    </p>
                    <Table className="bordered striped">
                        <thead>
                            <tr>
                                <th data-field="event_id">event_id</th>
                                <th data-field="title">title</th>
                                <th data-field="start">start</th>
                                <th data-field="end">end</th>
                            </tr>
                        </thead>

                        <tbody>
                        {
                            dataRow.map(function(item, index){
                                return (
                                    <tr key={this.props.name+":"+item.event_id}>
                                        <td>{item.event_id}</td>
                                        <td>{item.title}</td>
                                        <td>{moment(item.start).local().toString()}</td>
                                        <td>{moment(item.end).local().toString()}</td>
                                    </tr>
                                );
                            },this)
                        }
                        </tbody>
                    </Table>                              
                </CollectionItem>
    }
}