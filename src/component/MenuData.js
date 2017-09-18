// This file is shared across the demos.

import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import { ListItem, ListItemIcon, ListItemText } from 'material-ui/List';
import TvIcon from 'material-ui-icons/Tv';
import SettingsApplicationIcon from 'material-ui-icons/SettingsApplications';
import StartOverIcon from 'material-ui-icons/SubdirectoryArrowLeft';
import EventIcon from 'material-ui-icons/Event';

import Button from 'material-ui/Button';
import Dialog, {
    DialogActions,
    DialogContent,
    DialogTitle,
} from 'material-ui/Dialog';

import classNames from 'classnames';
import Collapse from 'material-ui/transitions/Collapse';
import ExpandLess from 'material-ui-icons/ExpandLess';
import ExpandMore from 'material-ui-icons/ExpandMore';

import InfiniteCalendar from 'react-infinite-calendar';
import 'react-infinite-calendar/styles.css'; // Make sure to import the default stylesheet

import moment from 'moment';

const styles = theme => ({
    nested: {
         paddingLeft: 20
    },
    unselected: {
        opacity: 0.4
    }
});

class MenuData extends React.Component {

    state = {
        dateOpen: false,
        channelOpen: false,
        presetOpen: false,
        startOverOpen: false,
        dateType: '',
        dateValue: new Date()
    };

    startDate = '';
    endDate = '';

    constructor(props) {
        super(props);
        this.handleDateClick = this.handleDateClick.bind(this);
        this.handleChannelClick = this.handleChannelClick.bind(this);
        this.handlePresetClick = this.handlePresetClick.bind(this);
        this.handleStartOverClick = this.handleStartOverClick.bind(this);
        this.handleChannelItemClick = this.handleChannelItemClick.bind(this);
        this.handlePresetItemClick = this.handlePresetItemClick.bind(this);
        this.handleStartOverItemClick = this.handleStartOverItemClick.bind(this);
        this.handleRequestClose = this.handleRequestClose.bind(this);
        this.handleDateConfirm = this.handleDateConfirm.bind(this);
        this.onDateSelected = this.onDateSelected.bind(this);
    }

    componentDidMount() {
        this.startDate = this.props.startDate;
        this.endDate = this.props.endDate;

        this.datePickerStyle = {
            accentColor: this.props.theme.palette.primary["500"],
            floatingNav: {
                background: 'rgba(56, 87, 138, 0.94)',
                chevron: this.props.theme.palette.primary["500"],
                color: '#FFF',
            },
            headerColor: this.props.theme.palette.primary["500"],
            selectionColor: this.props.theme.palette.secondary["500"],
            textColor: {
                active: '#FFF',
                default: '#333',
            },
            todayColor: this.props.theme.palette.primary["500"],
            weekdayColor: this.props.theme.palette.secondary["500"],
        };
    }
    handleRequestClose() {
        this.setState({ dateOpen: false });
    }

    handleDateClick(type) {
        this.handleMenutClick();
        var prop = {};
        switch (type) {
            case 'start':
                prop["dateValue"] = moment(this.startDate, "DD/MM/YYYY").toDate();
                break;
            case 'end':
                prop["dateValue"] = moment(this.endDate, "DD/MM/YYYY").toDate();
                break;
            default:
                break;
        }
        prop["dateOpen"] = !this.state.dateOpen;
        prop["dateType"] = type;
        this.setState(prop);
    }

    onDateSelected(date) {
        switch (this.state.dateType) {
            case 'start':
                this.startDate = moment(date).format("DD/MM/YYYY");
                break;
            case 'end':
                this.endDate = moment(date).format("DD/MM/YYYY");
                break;
            default:
                break;
        }
    }

    handleDateConfirm() {
        switch (this.state.dateType) {
            case "start":
                if (typeof this.props.onSetFilterSettings === 'function') {
                    this.props.onSetFilterSettings(this.startDate, this.props.endDate);
                }
                break;
            case "end":
                if (typeof this.props.onSetFilterSettings === 'function') {
                    this.props.onSetFilterSettings(this.props.startDate, this.endDate);
                }
                break;
            default:
                break;
        }
        this.setState({ dateOpen: false });
    }

    handleMenutClick() {
        if (!this.props.drawerOpen) {
            if (typeof this.props.onHandleDrawerOpen === 'function') {
                this.props.onHandleDrawerOpen();
            }
        }
    }

    handleChannelClick() {
        this.handleMenutClick();
        this.setState({ channelOpen: !this.state.channelOpen });
    }

    handleChannelItemClick(channel) {
        if (typeof this.props.onChannelChange === 'function') {
            this.setState({ channelOpen: false });
            this.props.onChannelChange(channel);
        }
    }

    handlePresetItemClick(preset) {
        if (typeof this.props.onPresetChange === 'function') {
            this.setState({ presetOpen: false });
            this.props.onPresetChange(preset);
        }
    }

    handleStartOverItemClick(startover) {
        if (typeof this.props.onStartOverChange === 'function') {
            this.setState({ startOverOpen: false });
            this.props.onStartOverChange(startover);
        }
    }

    handlePresetClick() {
        this.handleMenutClick();
        this.setState({ presetOpen: !this.state.presetOpen });
    }

    handleStartOverClick() {
        this.handleMenutClick();
        this.setState({ startOverOpen: !this.state.startOverOpen });
    }

    render() {
        const classes = this.props.classes;
        return (
            <div>
        <ListItem button onClick={this.handleChannelClick}>
          <ListItemIcon>
            <TvIcon />
          </ListItemIcon>
          <ListItemText inset primary="Channel" secondary={this.props.channel ? this.props.channel : ""}/>
          {(this.props.drawerOpen && this.state.channelOpen) ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
        <Collapse in={this.props.drawerOpen && this.state.channelOpen} transitionDuration="auto" unmountOnExit>
          
            {this.props.channels.map(n => {
                        return (
                            <ListItem 
                              key={n.name}
                              onClick={this.handleChannelItemClick.bind(this, n.name)}
                              button className={n.name === this.props.channel ? classes.nested : classNames(classes.nested, classes.unselected) } >
                              <ListItemText inset primary={n.name} />
                            </ListItem>
                          );
                        })
            }
        </Collapse>

        <ListItem button onClick={this.handlePresetClick}>
          <ListItemIcon>
            <SettingsApplicationIcon />
          </ListItemIcon>
          <ListItemText inset primary="Preset" secondary={this.props.preset ? this.props.preset : ""} />
          {(this.props.drawerOpen && this.state.presetOpen) ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
        <Collapse in={this.props.drawerOpen && this.state.presetOpen} transitionDuration="auto" unmountOnExit>
          
            {this.props.presets.map(n => {
                        return (
                            <ListItem 
                              key={n}
                              onClick={this.handlePresetItemClick.bind(this, n)}
                              button className={n === this.props.preset ? classes.nested : classNames(classes.nested, classes.unselected) } >
                              <ListItemText inset primary={n} />
                            </ListItem>
                          );
                        })
            }
        </Collapse>

        <ListItem button onClick={this.handleStartOverClick}>
          <ListItemIcon>
            <StartOverIcon />
          </ListItemIcon>
          <ListItemText inset primary="Mode" secondary={this.props.startover ? this.props.startover : ""} />
          {(this.props.drawerOpen && this.state.startOverOpen) ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
        <Collapse in={this.props.drawerOpen && this.state.startOverOpen} transitionDuration="auto" unmountOnExit>
          
            {this.props.startovers.map(n => {
                        return (
                            <ListItem 
                              key={n}
                              onClick={this.handleStartOverItemClick.bind(this, n)}
                              button className={n === this.props.startover ? classes.nested : classNames(classes.nested, classes.unselected) } >
                              <ListItemText inset primary={n} />
                            </ListItem>
                          );
                        })
            }
        </Collapse>

        <ListItem button onClick={this.handleDateClick.bind(this, 'start')}>
          <ListItemIcon>
            <EventIcon />
          </ListItemIcon>
          <ListItemText primary="Start date" secondary={this.props.startDate ? this.props.startDate : ""} />
        </ListItem>

        <ListItem button onClick={this.handleDateClick.bind(this, 'end')}>
          <ListItemIcon>
            <EventIcon />
          </ListItemIcon>
          <ListItemText primary="End date" secondary={this.props.endDate ? this.props.endDate : ""} />
        </ListItem>

        <Dialog open={this.state.dateOpen} onRequestClose={this.handleRequestClose}>
          <DialogTitle>{this.state.dateType === 'start' ? 'Start Date' : 'End Date'}</DialogTitle>
          <DialogContent>
            <InfiniteCalendar
              selected={this.state.dateValue}
              theme={this.datePickerStyle}
              onSelect={(date) => this.onDateSelected(date)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleRequestClose} color="primary">
              Cancel
            </Button>
            <Button onClick={this.handleDateConfirm} color="primary">
              OK
            </Button>
          </DialogActions>
        </Dialog>
      </div>
        );
    }
}

MenuData.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(MenuData);