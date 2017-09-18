//react
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import IconButton from 'material-ui/IconButton';
import MenuIcon from 'material-ui-icons/Menu';
import Code from 'material-ui-icons/Code';
import Settings from 'material-ui-icons/Settings';
import Share from 'material-ui-icons/Share';
import Chip from 'material-ui/Chip';
import classNames from 'classnames';

const styles = theme => ({
    flexOpen: {
        flex: 1,
        marginLeft: 25
    },
    flexClosed: {
        flex: 1,
        marginLeft: 11
    },
    menuButton: {
        marginLeft: 6,
        marginRight: 20,
    },
    button: {
        marginRight: 10
    },
    lastButton: {
        marginRight: 20
    },
    chip: {
        marginRight: 10,
        backgroundColor: 'white'
    },
    hide: {
        display: 'none',
    },
});

/**
 * The navigation bar 
 */
class TopNavbar extends Component {

    constructor(props) {
        super(props);
        this.urlSettings = this.urlSettings.bind(this);
        this.handleDrawerOpen = this.handleDrawerOpen.bind(this);
    }

    /**
     * Open URL settings modal
     */
    urlSettings() {
        if (typeof this.props.onOpenUrlSettings === 'function') {
            this.props.onOpenUrlSettings();
        }
    }

    /**
     * Open Global settings modal
     */
    globalSettings() {
        if (typeof this.props.onOpenSettings === 'function') {
            this.props.onOpenSettings();
        }
    }

    handleDrawerOpen() {
        if (typeof this.props.onHandleDrawerOpen === 'function') {
            this.props.onHandleDrawerOpen();
        }
    }

    /**
     * Share this page
     */
    share() {
        if (typeof this.props.onShare === 'function') {
            this.props.onShare();
        }
    }

    render() {
        const { classes } = this.props;

        return (<AppBar position="static" className={this.props.className}>
                    <Toolbar disableGutters>
                      <IconButton
                        color="contrast"
                        aria-label="open drawer"
                        onClick={this.handleDrawerOpen}
                        className={classNames(classes.menuButton, this.props.drawerOpen && classes.hide)}
                      >
                        <MenuIcon />
                      </IconButton>

                      <Typography type="headline" color="inherit" className={this.props.drawerOpen ? classes.flexOpen : classes.flexClosed}>
                        {'Caipy Dashboard v' + process.env.REACT_APP_VERSION}
                      </Typography>
                      <IconButton onClick={() => this.globalSettings()} color="contrast" aria-label="settings">
                        <Settings />
                      </IconButton>
                      <IconButton onClick={() => this.share()} className={classes.button} color="contrast" aria-label="share">
                        <Share />
                      </IconButton>
                      <Chip ref={(buttonUrl) => { this.buttonUrl = buttonUrl; }} 
                            onClick={() => this.urlSettings()} 
                            label={this.props.mode + " mode"} 
                            className={classes.chip} />
                      <IconButton color="contrast" className={classes.lastButton} aria-label="source code" href="https://github.com/bertrandmartel/caipy-dashboard">
                        <Code />
                      </IconButton>
                    </Toolbar>
                  </AppBar>)

        /*
        return <Navbar href={process.env.PUBLIC_URL+"/"} brand={'Caipy Dashboard v' + process.env.REACT_APP_VERSION} className="blue darken-1" right>
                    <NavItem onClick={() => this.globalSettings()}><Icon medium>settings</Icon></NavItem>
                    <NavItem onClick={() => this.share()}><Icon>share</Icon></NavItem> 
                    <NavItem onClick={() => this.urlSettings()}><Chip close={false}>{this.props.mode} mode</Chip></NavItem> 
                    <NavItem href="https://github.com/bertrandmartel/caipy-dashboard" target="_blank" ><Icon>code</Icon></NavItem>
                </Navbar>
                */
    }
}

TopNavbar.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(TopNavbar);