import React, { Component } from 'react';

import { Pagination, Table, CollectionItem } from 'react-materialize';

/**
 * Caipy Data Set table 
 */
export class CaipyDataSetItem extends Component {

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

    render() {
        var dataRow = this.props.rows.slice((this.state.pageIndex - 1) * this.props.perPage, (this.state.pageIndex - 1) * this.props.perPage + this.props.perPage);

        return <CollectionItem className="coll-item" key={this.props.name + "-coll"}>
                    <h5>{this.props.name}</h5>
                    <Pagination items={Math.round(this.props.length/this.props.perPage)} 
                                activePage={this.state.pageIndex} 
                                maxButtons={10}
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
                                        <td>{item.time}</td>
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
export class EpgDataSetItem extends Component {

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

    render() {
        var dataRow = this.props.rows.slice((this.state.pageIndex - 1) * this.props.perPage, (this.state.pageIndex - 1) * this.props.perPage + this.props.perPage);

        return <CollectionItem className="coll-item" key={this.props.name + "-coll"}>
                    <h5>{this.props.name}</h5>
                    <Pagination items={Math.round(this.props.length/this.props.perPage)} 
                                activePage={this.state.pageIndex} 
                                maxButtons={10}
                                onSelect={this.onSelect} />
                    <p>{(this.state.pageIndex-1)*this.props.perPage + 1}-{(this.state.pageIndex-1)*this.props.perPage+this.props.perPage} of {this.props.length}
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
                                        <td>{item.start}</td>
                                        <td>{item.end}</td>
                                    </tr>
                                );
                            },this)
                        }
                        </tbody>
                    </Table>                              
                </CollectionItem>
    }
}