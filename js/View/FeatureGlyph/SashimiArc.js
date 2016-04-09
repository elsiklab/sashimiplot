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
                    color: function( feature ) {
                        if( this.config.useXS ) {
                            return feature.get('strand') == 1 ?
                                'hsl(' + 30 + ',50%,'+10 * Math.log( feature.get('score') + 1 ) +'%)' :
                                'hsl(' + 200 + ',50%,'+Math.max(10 * Math.log( feature.get('score') + 1 ),70) +'%)';
                        }
                        else {
                            return 'hsl(' + 20 * Math.log( feature.get('score') + 1 ) + ',50%,50%)';
                        }
                    },
                    height: function( feature ) {
                        return 10*Math.log( feature.get('end') - feature.get('start') )
                    },
                    lineWidth: function( feature ) {
                        return Math.log( feature.get('score') + 1 );
                    },
                    border_color: null,
                    mouseovercolor: 'rgba(0,0,0,0)',
                    readDepthFilter: 0,
                    strandArrow: false,
                    marginBottom: 1,
                    showMismatches: true,
                    mismatchFont: 'bold 10px Courier New,monospace'
                }
            }
        );
    },

    renderFeature: function( context, fRect ) {
        var style = lang.hitch( this, 'getStyle' );

        var r = this.getRadius( fRect.f, fRect.viewInfo.block );
        if( r.r == 0 || fRect.f.get('score') < (this.config.readDepthFilter||0) ) return;
        context.beginPath();

        context.strokeStyle = style( fRect.f, 'color' );
        context.lineWidth = style( fRect.f, 'lineWidth' );
        context.moveTo( r.drawFrom, 0 );
        var height = style( fRect.f, 'height' );
        context.bezierCurveTo( r.drawFrom, height, r.drawTo, height, r.drawTo, 0 );
        context.stroke();
    },
    getRadius: function( feature, block ) {
        var e,s;
        if(feature.get('subfeatures')&&feature.get('subfeatures').length == 2) {
            s = feature.get('subfeatures')[0].get('end');
            e = feature.get('subfeatures')[1].get('start');
        }
        else {
            s = feature.get('start');
            e = feature.get('end');
        }
        var drawTo = block.bpToX( e );
        var drawFrom = block.bpToX( s );
        return {
            r: ( drawFrom - drawTo ) / 2,
            drawTo: drawTo,
            drawFrom: drawFrom
        };
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

