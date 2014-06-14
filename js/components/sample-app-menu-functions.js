window.onload = function() {
        var fileInput = document.getElementById('file-input');
        //var fileDisplayArea = document.getElementById('fileDisplayArea');

        fileInput.addEventListener('change', function(e) {
            var file = fileInput.files[0];
            var textType = /text.*/;

            if (file.type.match(textType)) {
                var reader = new FileReader();

                reader.onload = function(e) {
                    //fileDisplayArea.innerText = reader.result;
                    var x = 5;
                    (new SBGNContainer({
                        el: '#sbgn-network-container',
                        model : {cytoscapeJsGraph : 
                            sbgnmlToJson.convert(textToXmlObject(this.result))}
                    })).render();
                }

                reader.readAsText(file);    
            } else {
                //fileDisplayArea.innerText = "File not supported!"
            }
        });
};

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
    });
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
    });
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
    });
});

$("#load-sample1").click(function(e){
    var xmlObject = loadXMLDoc('samples/sample1.xml');

    (new SBGNContainer({
        el: '#sbgn-network-container',
        model : {cytoscapeJsGraph : sbgnmlToJson.convert(xmlObject)}
    })).render();
});

$("#load-sample2").click(function(e){
    var xmlObject = loadXMLDoc('samples/sample2.xml');

    (new SBGNContainer({
        el: '#sbgn-network-container',
        model : {cytoscapeJsGraph : sbgnmlToJson.convert(xmlObject)}
    })).render();
});

$("#load-sample3").click(function(e){
    var xmlObject = loadXMLDoc('samples/sample3.xml');

    (new SBGNContainer({
        el: '#sbgn-network-container',
        model : {cytoscapeJsGraph : sbgnmlToJson.convert(xmlObject)}
    })).render();
});

$("#load-sample4").click(function(e){
    var xmlObject = loadXMLDoc('samples/sample4.xml');

    (new SBGNContainer({
        el: '#sbgn-network-container',
        model : {cytoscapeJsGraph : sbgnmlToJson.convert(xmlObject)}
    })).render();
});

$("#load-sample5").click(function(e){
    var xmlObject = loadXMLDoc('samples/sample5.xml');

    (new SBGNContainer({
        el: '#sbgn-network-container',
        model : {cytoscapeJsGraph : sbgnmlToJson.convert(xmlObject)}
    })).render();
});

$("#load-sample6").click(function(e){
    var xmlObject = loadXMLDoc('samples/sample6.xml');

    (new SBGNContainer({
        el: '#sbgn-network-container',
        model : {cytoscapeJsGraph : sbgnmlToJson.convert(xmlObject)}
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
    window.open(pngContent, "_blank");
});

$("#load-file").click(function(evt){
    $("#file-input").trigger('click');
});

$("#save-as-sbgnml").click(function(evt){
    //TODO : add sbgn converter here
    toSbgnml.createSbgnml();
});



