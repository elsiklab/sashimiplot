define( [   
            'dojo/_base/declare',
            'dojo/_base/array',
            'dojo/_base/lang',
            'SashimiPlot/Store/SeqFeature/Sashimi',
            'JBrowse/View/Track/CanvasFeatures'
        ],
        function(
            declare,
            array,
            lang,
            SashimiStore,
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
    }
});
});
