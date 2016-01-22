# sashimiplot


A JBrowse implementation of the sashimi plot style tool. Features a storeclass that converts RNA-seq BAM files into intron support coverage features, a track type that adds menu options, and a featureglyph that draws arcs.


![](img/out2.png)


## Track options


style->color - a CSS color or callback function returning a color
style->height - a specific height or callback function to change height of the bezier curves 
useXS - a built-in option to change strand according to the XS tag (only works on canonical splice sites)
