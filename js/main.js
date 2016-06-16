define([
    'dojo/_base/declare',
    'JBrowse/Plugin'
],
function(
   declare,
   JBrowsePlugin
) {
    return declare(JBrowsePlugin, {
        constructor: function(args) {
            var browser = args.browser;

            console.log('SashimiPlot plugin starting');
            browser.registerTrackType({
                label: 'SashimiPlot RNA-seq',
                type: 'SashimiPlot/View/Track/Sashimi'
            });
        }
    });
});
