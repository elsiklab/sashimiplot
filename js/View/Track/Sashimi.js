define( [   
            'dojo/_base/declare',
            'dojo/_base/array',
            'dojo/_base/lang',
            'SashimiPlot/Store/SeqFeature/Sashimi',
            'SashimiPlot/View/Dialog/ReadDepthDialog',
            'JBrowse/View/Track/CanvasFeatures'
        ],
        function(
            declare,
            array,
            lang,
            SashimiStore,
            ReadDepthDialog,
            CanvasFeatures
        ) {

return declare( CanvasFeatures,
{
    constructor: function() {
        var thisB = this;
        this.store = new SashimiStore(
            { store: this.store,
              browser: this.browser,
              filter: function( f ) {
                  return thisB.filterFeature( f );
              }
            });
    },
    _defaultConfig: function() {

        var config = lang.clone( this.inherited(arguments) );
        config.glyph = "SashimiPlot/View/FeatureGlyph/SashimiArc";
        return config;
    },
        
    _trackMenuOptions: function() {
        var track = this;
        var options = this.inherited(arguments);
        options.push({
            label: 'Filter depth',
            onClick: function(event) {
                new ReadDepthDialog({
                    setCallback: function( filterInt ) {
                        track.config.readDepthFilter = filterInt;
                        track.browser.publish('/jbrowse/v1/c/tracks/replace', [track.config]);
                    },
                    readDepthFilter: track.config.readDepthFilter
                }).show();                    
            }
        });
        return options;
    },
    // override getLayout to access addRect method
    _getLayout: function () {
        var thisB = this;
        var browser = this.browser;
        var layout = this.inherited(arguments);
        var clabel = this.name + "-collapsed";
        return declare.safeMixin(layout, {
            addRect: function (id, left, right, height, data) {
                this.pTotalHeight = 10*Math.log(data.get('end') - data.get('start'))
                return 0;
                
            }
        });
    },
});
});
