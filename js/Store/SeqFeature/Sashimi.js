define([
    'dojo/_base/declare',
    'dojo/_base/array',
    'JBrowse/Util',
    'JBrowse/Store/SeqFeature',
    'JBrowse/Model/SimpleFeature',
    'JBrowse/Store/SeqFeature/_MismatchesMixin'
],
       function(
           declare,
           array,
           Util,
           SeqFeatureStore,
           SimpleFeature,
           MismatchesMixin
       ) {
           var dojof = Util.dojof;
           return declare([ SeqFeatureStore, MismatchesMixin ], {

               constructor: function(args) {
                   this.store = args.store;
                   this.filter = args.filter || function() { return true; };
               },

               getGlobalStats: function(callback /* , errorCallback */) {
                   callback({});
               },

               getFeatures: function(query, featureCallback, finishCallback, errorCallback) {
                   var thisB = this;
                   var skipmap = {};
                   thisB.store.getFeatures(
            query,
            function(feature) {
                if (!thisB.filter(feature)) {
                    return;
                }
                array.forEach(thisB._getMismatches(feature), function(mismatch) {
                    var s = feature.get('start') + mismatch.start;
                    var e = feature.get('start') + mismatch.start + mismatch.length;
                    var hash = s * s + e * e;
                    if (mismatch.type === 'skip') {
                        if (!skipmap[ hash ]) {
                            skipmap[ hash ] = {
                                feature: feature,
                                start: s,
                                end: e,
                                strand: feature.get('xs'),
                                count: 1
                            };
                        } else {
                            skipmap[ hash ].count++;
                        }
                    }
                });
            },
            function(args) {
                // make fake features from the coverage
                array.forEach(dojof.keys(skipmap), function(key) {
                    var skip = skipmap[ key ];
                    featureCallback(new SimpleFeature({
                        id: key,
                        data: {
                            start: skip.start,
                            end: skip.end,
                            score: skip.count,
                            strand: {'+': 1, '-': -1}[skip.strand] || 0
                        }
                    })
                    );
                });

                finishCallback(args); // optional arguments may change callback behaviour (e.g. add masking)
            }, errorCallback
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
