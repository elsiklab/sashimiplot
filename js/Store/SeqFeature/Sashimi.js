/**
 * Store that encapsulates another store, which is expected to have
 * features in it that have CIGAR and MD attributes.  Produces
 * features that include SNP allele frequencies.
 */

define([
           'dojo/_base/declare',
           'dojo/_base/array',
           'JBrowse/Util',
           'JBrowse/Store/SeqFeature',
           'JBrowse/Model/SimpleFeature',
           'JBrowse/Model/CoverageFeature',
           'JBrowse/Store/SeqFeature/_MismatchesMixin'
       ],
       function(
           declare,
           array,
           Util,
           SeqFeatureStore,
           SimpleFeature,
           CoverageFeature,
           MismatchesMixin
       ) {

return declare( [ SeqFeatureStore, MismatchesMixin ], {

    constructor: function( args ) {
        this.store = args.store;
        this.filter = args.filter || function() { return true; };
    },

    getGlobalStats: function( callback, errorCallback ) {
        callback( {} );
    },

    _defaultConfig: function() {
        return Util.deepUpdate(
            dojo.clone( this.inherited(arguments) ),
            {
                mismatchScale: 1/10
            }
        );
    },

    getFeatures: function( query, featureCallback, finishCallback, errorCallback ) {

        
        var thisB = this;
        var leftBase  = query.start;
        var rightBase = query.end;
        var scale = query.scale || query.basesPerSpan && 1/query.basesPerSpan || 10; // px/bp
        var widthBp = rightBase-leftBase;
        var widthPx = widthBp * scale;


        var skipmap = {};

        thisB.store.getFeatures(
            query,
            function( feature ) {
                if( ! thisB.filter( feature ) )
                    return;
                array.forEach( thisB._getMismatches( feature ), function( mismatch ) {
                    var s=feature.get('start')+mismatch.start;
                    var e=feature.get('start')+mismatch.start+mismatch.length;
                    var hash=s*s+e*e;
                    if( mismatch.type=="skip" ) {
                        if( !skipmap[ hash ] ) {
                            skipmap[ hash ] = {
                                feature: feature,
                                start: feature.get('start')+mismatch.start,
                                end: feature.get('start')+mismatch.start+mismatch.length,
                                strand: feature.get('XS'),
                                count: 1
                            };
                        }
                        else skipmap[ hash ].count++;
                    }
                })
            },
            function ( args ) {
                // make fake features from the coverage
                array.forEach( Object.keys( skipmap ), function( key ) {
                    var skip = skipmap[ key ];
                    featureCallback( new SimpleFeature({
                                                        id: skip.start*skip.start+skip.end*skip.end,
                                                        data: {
                                                            start: skip.start,
                                                            end: skip.end,
                                                            score: skip.count,
                                                            strand: {"+":1,"-":-1}[skip.strand]||0
                                                        }
                                                    })
                    );
                });
                
                finishCallback( args ); // optional arguments may change callback behaviour (e.g. add masking)
            }
            , errorCallback
        );
    },

    saveStore: function() {
        return {
            urlTemplate: this.config.bam.url,
            baiUrlTemplate: this.config.bai.url
        };
    }
});
});
