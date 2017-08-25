/**
 * Default start date for query in live mode
 * @type {String}
 */
export const defaultStartDate = "02/08/2017";

/**
 * Default end date for query in live mode
 * @type {String}
 */
export const defaultEndDate = "02/08/2017";

/**
 * Default size of timeline window
 * @type {Number}
 */
export const defaultWindowInitSize = 2 * 60 * 60 * 1000;

/**
 * Start over time range in milliseconds after the beginning of the program to detect AD
 * @type {Number}
 */
export const startOverRangeAd = 10 * 60 * 1000;

/**
 * Start over time range in milliseconds before the program to detect SharpStart
 * @type {Number}
 */
export const startOverRangeSharpStart= 10 * 60 * 1000;

/**
 * Program duration that should be excluded if duration is less than this value.
 * 
 * @type {Number}
 */
export const cutProgramDuration = 0;

/**
 * numeric input style from https://github.com/vlad-ignatov/react-numeric-input/blob/master/src/NumericInput.jsx
 */
export const numericInputStyle = {

    // The wrapper (span)
    wrap: {
        position: 'relative',
        display: 'inline-block'
    },

    'wrap.hasFormControl': {
        display: 'block'
    },

    // The increase button arrow (i)
    arrowUp: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: 0,
        height: 0,
        borderWidth: '0 0.6ex 0.6ex 0.6ex',
        borderColor: 'transparent transparent rgba(0, 0, 0, 0.7)',
        borderStyle: 'solid',
        margin: '-0.3ex 0 0 -0.56ex'
    },

    // The decrease button arrow (i)
    arrowDown: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: 0,
        height: 0,
        borderWidth: '0.6ex 0.6ex 0 0.6ex',
        borderColor: 'rgba(0, 0, 0, 0.7) transparent transparent',
        borderStyle: 'solid',
        margin: '-0.3ex 0 0 -0.56ex'
    },

    // The vertical segment of the plus sign (for mobile only)
    plus: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: 2,
        height: 10,
        background: 'rgba(0,0,0,.7)',
        margin: '-5px 0 0 -1px'
    },

    // The horizontal segment of the plus/minus signs (for mobile only)
    minus: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: 10,
        height: 2,
        background: 'rgba(0,0,0,.7)',
        margin: '-1px 0 0 -5px'
    },

    // Common styles for the up/down buttons (b)
    btn: {
        position: 'absolute',
        right: 2,
        width: '2.26ex',
        borderColor: 'rgba(0,0,0,.1)',
        borderStyle: 'solid',
        textAlign: 'center',
        cursor: 'default',
        transition: 'all 0.1s',
        background: 'rgba(0,0,0,.1)',
        boxShadow: '-1px -1px 3px rgba(0,0,0,.1) inset,' +
            '1px 1px 3px rgba(255,255,255,.7) inset'
    },

    btnUp: {
        top: 2,
        bottom: '50%',
        borderRadius: '2px 2px 0 0',
        borderWidth: '1px 1px 0 1px'
    },

    'btnUp.mobile': {
        width: '3.3ex',
        bottom: 2,
        boxShadow: 'none',
        borderRadius: 2,
        borderWidth: 1
    },

    btnDown: {
        top: '50%',
        bottom: 2,
        borderRadius: '0 0 2px 2px',
        borderWidth: '0 1px 1px 1px'
    },

    'btnDown.mobile': {
        width: '3.3ex',
        bottom: 2,
        left: 2,
        top: 2,
        right: 'auto',
        boxShadow: 'none',
        borderRadius: 2,
        borderWidth: 1
    },

    'btn:hover': {
        background: 'rgba(0,0,0,.2)'
    },

    'btn:active': {
        background: 'rgba(0,0,0,.3)',
        boxShadow: '0 1px 3px rgba(0,0,0,.2) inset,' +
            '-1px -1px 4px rgba(255,255,255,.5) inset'
    },

    'btn:disabled': {
        opacity: 0.5,
        boxShadow: 'none',
        cursor: 'not-allowed'
    },

    // The input (input[type="text"])
    input: {
        paddingRight: '3ex',
        boxSizing: 'border-box'
    },

    // The input with bootstrap class
    'input:not(.form-control)': {
        border: 'none',
        borderRadius: 2,
        paddingLeft: 4,
        display: 'inline-block',
        WebkitAppearance: 'none',
        lineHeight: 'normal'
    },

    'input.mobile': {
        paddingLeft: ' 3.4ex',
        paddingRight: '3.4ex',
        textAlign: 'center'
    },

    'input:focus': {},

    'input:disabled': {
        color: 'rgba(0, 0, 0, 0.3)',
        textShadow: '0 1px 0 rgba(255, 255, 255, 0.8)'
    }
};