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
    // BED stores hand back the columns as raw strings, so anything we do
    // arithmetic on has to be coerced first: Math.log(score + 1) on the string
    // "0.945" concatenates to "0.9451" and yields a negative width.
    function num(v) {
        var n = parseFloat(v);
        return isNaN(n) ? 0 : n;
    }

    function clamp(v, lo, hi) {
        return Math.min(Math.max(isNaN(v) ? lo : v, lo), hi);
    }

    function scoreOf(feature) {
        return num(feature.get('score'));
    }

    // The arc spans the intron, which is the gap between the two flanking
    // anchors rather than the feature itself. BAM-derived features carry the
    // anchors as subfeatures; BED12 junction files (portcullis, TopHat) encode
    // them as two blocks, and the BED stores expose those as flat columns.
    function intronOf(feature) {
        var start = num(feature.get('start'));
        var end = num(feature.get('end'));

        var subs = feature.get('subfeatures');
        if (subs && subs.length === 2) {
            return { s: num(subs[0].get('end')), e: num(subs[1].get('start')) };
        }

        var sizes = feature.get('block_sizes');
        var starts = feature.get('chrom_starts');
        if (num(feature.get('block_count')) === 2 && sizes && starts) {
            return {
                s: start + num(String(sizes).split(',')[0]),
                e: start + num(String(starts).split(',')[1])
            };
        }

        var thickStart = feature.get('thick_start');
        var thickEnd = feature.get('thick_end');
        if (thickStart != null && thickEnd != null && num(thickEnd) > num(thickStart)) {
            return { s: num(thickStart), e: num(thickEnd) };
        }

        return { s: start, e: end };
    }

    return declare(FeatureGlyph, {
        _defaultConfig: function() {
            return this._mergeConfigs(dojo.clone(this.inherited(arguments)), {
                style: {
                    color: function(feature) {
                        var depth = 10 * Math.log(scoreOf(feature) + 1);
                        if (this.config.useXS) {
                            var hue = feature.get('strand') === 1 ? 30 : 200;
                            return 'hsl(' + hue + ',50%,' + clamp(depth, 10, 70) + '%)';
                        }
                        return 'hsl(' + clamp(2 * depth, 0, 360) + ',50%,50%)';
                    },
                    height: function(feature) {
                        var intron = intronOf(feature);
                        return clamp(
                            10 * Math.log(intron.e - intron.s),
                            10,
                            this.config.maxHeight || 100
                        );
                    },
                    lineWidth: function(feature) {
                        return clamp(Math.log(scoreOf(feature) + 1), 1, 10);
                    },
                    border_color: null,
                    mouseovercolor: 'rgba(0,0,0,0)',
                    strandArrow: false,
                    marginBottom: 1,
                    showMismatches: true,
                    mismatchFont: 'bold 10px Courier New,monospace'
                },
                readDepthFilter: 0
            });
        },

        renderFeature: function(context, fRect) {
            var style = lang.hitch(this, 'getStyle');

            var r = this.getRadius(fRect.f, fRect.viewInfo.block);
            if (!r.r || scoreOf(fRect.f) < (this.config.readDepthFilter || 0)) return;
            context.beginPath();

            context.strokeStyle = style(fRect.f, 'color');
            context.lineWidth = style(fRect.f, 'lineWidth');
            context.moveTo(r.drawFrom, 0);
            var height = style(fRect.f, 'height');
            context.bezierCurveTo(r.drawFrom, height, r.drawTo, height, r.drawTo, 0);
            context.stroke();
        },
        getRadius: function(feature, block) {
            var intron = intronOf(feature);
            var drawTo = block.bpToX(intron.e);
            var drawFrom = block.bpToX(intron.s);
            return {
                r: Math.abs(drawTo - drawFrom) / 2,
                drawTo: drawTo,
                drawFrom: drawFrom
            };
        },
        layoutFeature: function(viewArgs, layout, feature) {
            var rect = this.inherited(arguments);
            if (!rect) return rect;

// need to set the top of the inner rect
            var r = this.getRadius(feature, viewArgs.block);
            rect.rect.t = r.r * 2;

            return rect;
        }
    });
});
