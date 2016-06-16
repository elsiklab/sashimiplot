define([
    'dojo/_base/declare',
    'dojo/dom-construct',
    'dojo/on',
    'dijit/focus',
    'dijit/form/NumberSpinner',
    'dijit/form/Button',
    'JBrowse/View/Dialog/WithActionBar'
],
function(
    declare,
    dom,
    on,
    focus,
    NumberSpinner,
    Button,
    ActionBarDialog
) {
    return declare(ActionBarDialog, {

        title: 'Set read depth filter',

        constructor: function(args) {
            this.readDepthFilter = args.readDepthFilter || 0;
            this.browser         = args.browser;
            this.setCallback     = args.setCallback || function() {};
            this.cancelCallback  = args.cancelCallback || function() {};
        },

        _fillActionBar: function(actionBar) {
            new Button({
                label: 'OK',
                onClick: dojo.hitch(this, function() {
                    var height = +this.readDepthSpinner.getValue();
                    if (isNaN(height)) return;
                    if (this.setCallback) this.setCallback(height);
                    this.hide();
                })
            }).placeAt(actionBar);

            new Button({
                label: 'Cancel',
                onClick: dojo.hitch(this, function() {
                    if (this.cancelCallback) this.cancelCallback();
                    this.hide();
                })
            }).placeAt(actionBar);
        },

        show: function(/* callback */) {
            dojo.addClass(this.domNode, 'readDepthDialog');

            this.readDepthSpinner = new NumberSpinner({
                value: this.readDepthFilter,
                smallDelta: 2
            });

            this.set('content', [
                dom.create('label', { 'for': 'read_depth', innerHTML: '' }),
                this.readDepthSpinner.domNode,
                dom.create('span', { innerHTML: ' reads' })
            ]);

            this.inherited(arguments);
        },

        hide: function() {
            this.inherited(arguments);
            window.setTimeout(dojo.hitch(this, 'destroyRecursive'), 500);
        }
    });
});
