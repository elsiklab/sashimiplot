define([
           'dojo/_base/declare',
           'dojo/_base/array',
           'dojo/_base/lang',
           'JBrowse/View/FeatureGlyph/Box'
       ],
       function(
           declare,
           array,
           lang,
           FeatureGlyph
       ) {

return declare( FeatureGlyph, {
    _defaultConfig: function() {
        return this._mergeConfigs(
            dojo.clone( this.inherited(arguments) ),
            {
                //maxFeatureScreenDensity: 400
                style: {
                    color: function( feature, path, glyph, track ) {
                        return 'rgba(0,0,0,0)';
                    },
                    border_color: null,
                    mouseovercolor: 'rgba(0,0,0,0)',
                    readDepthFilter: 0,
                    strandArrow: false,
                    height: 7,
                    marginBottom: 1,
                    showMismatches: true,
                    mismatchFont: 'bold 10px Courier New,monospace'
                }
            }
        );
    },

    renderFeature: function( context, fRect ) {
        var r = this.getRadius( fRect.f, fRect.viewInfo.block );
        if( r.r == 0 ) return;
        context.beginPath();
        context.strokeStyle = this.get_hue_color( 20 * Math.log( r.score + 1 ) );
        context.lineWidth = 2* Math.log( r.score + 1 );
        context.moveTo( r.drawFrom, 0 );
        if( this.config.readDepthFilter && r.score < this.config.readDepthFilter ) return;
        var ret = fRect.f.get('end') - fRect.f.get('start');
        context.bezierCurveTo( r.drawFrom, 10*Math.log(ret), r.drawTo, 10*Math.log(ret), r.drawTo, 0 );
        context.stroke();
    },
    getRadius: function( feature, block ) {
        var e = feature.get('end');
        var s = feature.get('start');
        var drawTo = block.bpToX( e );
        var drawFrom = block.bpToX( s );
        return {
            r: ( drawFrom - drawTo ) / 2,
            drawTo: drawTo,
            drawFrom: drawFrom,
            score: feature.get('score'),
        };
    },
    get_hue_color: function(x) {
        var h = x;
        var s = 50;
        var l = 50;
        return 'hsl(' + h + ',' + s + '%,' + l + '%)';
    },
    layoutFeature: function( viewArgs, layout, feature ) {
        var rect = this.inherited( arguments );
        if( ! rect ) return rect;

        // need to set the top of the inner rect
        var r = this.getRadius( feature, viewArgs.block );
        rect.rect.t = Math.abs(r.r*2);

        return rect;
    }
});
});

