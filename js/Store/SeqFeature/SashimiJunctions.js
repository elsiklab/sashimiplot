define([
           'dojo/_base/declare',
           'dojo/_base/array',
           'JBrowse/Util',
           'JBrowse/Store/SeqFeature',
           'JBrowse/Model/SimpleFeature'
       ],
       function(
           declare,
           array,
           Util,
           SeqFeatureStore,
           SimpleFeature
       ) {

var dojof = Util.dojof;

return declare( [ SeqFeatureStore ], {

    constructor: function( args ) {
        this.store = args.store;
        this.filter = args.filter || function() { return true; };
    },

    getGlobalStats: function( callback, errorCallback ) {
        callback( {} );
    },

    getFeatures: function( query, featureCallback, finishCallback, errorCallback ) {
        var thisB = this;
        var skipmap = {};
        thisB.store.getFeatures(
            query,
            function( feature ) {
                if( ! thisB.filter( feature ) )
                    return;
                var s = feature.get('start');
                var e = feature.get('end');
                var strand = feature.get('strand');
                var hash = s*s+e*e;
                if( !skipmap[ hash ] ) {
                    skipmap[ hash ] = {
                        feature: feature,
                        start: s,
                        end: e,
                        strand: strand,
                        count: 1
                    };
                }
                else skipmap[ hash ].count++;
            },
            function ( args ) {
                // make fake features from the coverage
                array.forEach( dojof.keys( skipmap ), function( key ) {
                    var skip = skipmap[ key ];
                    featureCallback( new SimpleFeature({
                                                        id: key,
                                                        data: {
                                                            start: skip.start,
                                                            end: skip.end,
                                                            score: skip.count,
                                                            strand: skip.strand
                                                        }
                                                    })
                    );
                });
                
                finishCallback( args );
            }
            , errorCallback
        );
    },

    saveStore: function() {
        return {
            urlTemplate: this.config.bam.url
        };
    }
});
});
