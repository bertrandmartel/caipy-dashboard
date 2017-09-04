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

const styles = theme => ({
    root: {
        width: '100%',
    },
    flex: {
        flex: 1,
    },
    menuButton: {
        marginLeft: 12,
        marginRight: 20,
    },
    button: {
        marginLeft: 10,
        marginRight: 10
    },
    chip: {
        backgroundColor: 'white'
    }
});

/**
 * The navigation bar 
 */
class TopNavbar extends Component {

    constructor(props) {
        super(props);
        this.urlSettings = this.urlSettings.bind(this);
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

        return (<div className={classes.root}>
                  <AppBar position="static">
                    <Toolbar disableGutters>
                      <IconButton className={classes.menuButton} color="contrast" aria-label="Menu">
                        <MenuIcon />
                      </IconButton>
                      <Typography type="title" color="inherit" className={classes.flex}>
                        {'Caipy Dashboard v' + process.env.REACT_APP_VERSION}
                      </Typography>
                      <IconButton onClick={() => this.globalSettings()} color="contrast" className={classes.button} aria-label="settings">
                        <Settings />
                      </IconButton>
                      <IconButton onClick={() => this.share()} color="contrast" className={classes.button} aria-label="share">
                        <Share />
                      </IconButton>
                      <Chip ref={(buttonUrl) => { this.buttonUrl = buttonUrl; }} 
                            onClick={() => this.urlSettings()} 
                            label={this.props.mode + " mode"} 
                            className={classes.chip} />
                      <IconButton color="contrast" className={classes.button} aria-label="source code" href="https://github.com/bertrandmartel/caipy-dashboard">
                        <Code />
                      </IconButton>
                    </Toolbar>
                  </AppBar>
                </div>)

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