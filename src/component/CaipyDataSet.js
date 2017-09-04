import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Table, { TableBody, TableCell, TableHead, TableRow } from 'material-ui/Table';
import Paper from 'material-ui/Paper';
import MobileStepper from 'material-ui/MobileStepper';

import * as TableSet from './DataSetCommon';

import moment from 'moment';

/**
 * Caipy Data Set table 
 */
class CaipyDataSet extends TableSet.DataSet {

    getDateField() {
        return "time";
    }

    render() {
        const classes = this.props.classes;
        this.data = this.props.rows;

        var dataRow = this.props.rows.slice((this.state.pageIndex - 1) * this.props.perPage, (this.state.pageIndex - 1) * this.props.perPage + this.props.perPage);

        return <Paper className={classes.paper}>
                    <MobileStepper
                      type="text"
                      steps={Math.ceil(this.props.rows.length / this.props.perPage)}
                      position="static"
                      activeStep={this.state.pageIndex}
                      className={classes.mobileStepper}
                      onBack={this.handleBack}
                      onNext={this.handleNext}
                    /><p className={classes.stepText}>{(this.state.pageIndex-1)*this.props.perPage + 1}-{(this.state.pageIndex-1)*this.props.perPage+this.props.perPage} of {this.props.length}</p>
                  <Table>
                    <TableHead className={classes.head}>
                      <TableRow>
                        <TableCell>Time</TableCell>
                        <TableCell>Clip</TableCell>
                        <TableCell numeric>Duration</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {dataRow.map(n => {
                        return (
                          <TableRow key={this.props.name+":"+n.time}>
                            <TableCell>{moment(n.time).local().toString()}</TableCell>
                            <TableCell>{n.clip}</TableCell>
                            <TableCell numeric>{n.duration}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </Paper>;

        /*
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
        */
    }
}

CaipyDataSet.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(TableSet.styles)(CaipyDataSet);