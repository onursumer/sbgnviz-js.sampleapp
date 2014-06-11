var sbgnLayoutProp = new SBGNLayout({
        el: '#sbgn-layout-table'
    });

$("#node-legend").click(function(e){
    e.preventDefault();
    $.fancybox(
    _.template($("#node-legend-template").html(), {}),
    {
        'autoDimensions' : false,
        'width' : 420,
        'height' : 393,
        'transitionIn' : 'none',
        'transitionOut' : 'none',
    }
    );
});

$("#edge-legend").click(function(e){
    e.preventDefault();
    $.fancybox(
    _.template($("#edge-legend-template").html(), {}),
    {
        'autoDimensions' : false,
        'width' : 400,
        'height' : 220,
        'transitionIn' : 'none',
        'transitionOut' : 'none',
    }
    );
});

$("#about").click(function(e){
    e.preventDefault();
    $.fancybox(
    _.template($("#about-template").html(), {}),
    {
        'autoDimensions' : false,
        'width' : 380,
        'height' : 368,
        'transitionIn' : 'none',
        'transitionOut' : 'none',
    }
    );
});

$("#load-sample1").click(function(e){
    (new SBGNContainer({
        el : '#sbgn-network-container',
        model : {url : 'samples/sample1.xml'}
    })).render();
});

$("#load-sample2").click(function(e){
    (new SBGNContainer({
        el: '#sbgn-network-container',
        model : {url : 'samples/sample2.xml'}
    })).render();
});

$("#load-sample3").click(function(e){
    (new SBGNContainer({
        el: '#sbgn-network-container',
        model : {url : 'samples/sample3.xml'}
    })).render();
});

$("#load-sample4").click(function(e){
    (new SBGNContainer({
        el: '#sbgn-network-container',
        model : {url : 'samples/sample4.xml'}
    })).render();
});

$("#load-sample5").click(function(e){
    (new SBGNContainer({
        el: '#sbgn-network-container',
        model : {url : 'samples/sample5.xml'}
    })).render();
});

$("#load-sample6").click(function(e){
    (new SBGNContainer({
        el: '#sbgn-network-container',
        model : {url : 'samples/sample6.xml'}
    })).render();
});

$("#hide-selected").click(function(e){
    sbgnFiltering.hideSelected();
});

$("#show-selected").click(function(e){
    sbgnFiltering.showSelected();
});

$("#show-all").click(function(e){
    sbgnFiltering.showAll();
});

$("#neighbors-of-selected").click(function(e){
    sbgnFiltering.highlightNeighborsofSelected();
});

$("#processes-of-selected").click(function(e){
    sbgnFiltering.highlightProcessesOfSelected();
});

$("#remove-highlights").click(function(e){
    sbgnFiltering.removeHighlights();
});

$("#layout-properties").click(function(e){
    sbgnLayoutProp.render();
});

$("#perform-layout").click(function(e){
    sbgnLayoutProp.applyLayout();
});

$("#save-as-png").click(function(evt){
    var pngContent = cy.png();
/*
    _.each($("#main-network-view canvas"), function(canvas) {
        if($(canvas).data("id").indexOf("buffer") == 0) {
            $(canvas).remove();
        }
    });
*/
    window.open(pngContent, "_blank");
});

$("#load-file").click(function(evt){
});


