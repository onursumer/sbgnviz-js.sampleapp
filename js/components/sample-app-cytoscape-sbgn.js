var sbgnStyleSheet = cytoscape.stylesheet()
        .selector("node")
        .css({
            'border-width' : 1,
            'border-color' : '#555',
            'background-color' : '#f6f6f6',
            'font-size' : 11,
            'shape' : 'data(sbgnclass)',
            'background-opacity' : '0.5'
        })
        .selector("node[sbgnclass='complex']")
        .css({
            'background-color' : '#F4F3EE',
            'padding-bottom' : '20',
            'padding-top' : '20'
        })
        .selector("[sbgnclass='compartment']")
        .css({
            'background-opacity' : '0',
            'background-color' : '#FFFFFF'
        })
        .selector("node[sbgnclass!='complex'][sbgnclass!='compartment']")
        .css({
            'width' : 'data(sbgnbbox.w)',
            'height' : 'data(sbgnbbox.h)'
        })
        .selector("node[sbgnclass='compartment']")
        .css({
            'content' : 'data(sbgnlabel)',
            'text-valign' : 'bottom',
            'text-halign' : 'center'
        })
        .selector("node:selected")
        .css({
            'border-color' : '#1ABC9C',
            'target-arrow-color' : '#000',
            'text-outline-color' : '#000'
        })
        .selector("node:active")
        .css({
            'background-opacity' : '0.7',
            'overlay-color' : '#1ABC9C',
            'overlay-padding' : '8'
        })
        .selector("edge")
        .css({
            'line-color' : '#444',
            'target-arrow-fill' : 'hollow',
            'source-arrow-fill' : 'hollow',
            'width': 1.5,
            'target-arrow-color': '#444',
            'source-arrow-color': '#444',
            'target-arrow-shape' : 'data(sbgnclass)'
        })
        .selector("edge[sbgnclass='inhibition']")
        .css({
            'target-arrow-fill' : 'filled'
        })
        .selector("edge[sbgnclass='consumption']")
        .css({
            'target-arrow-shape' : 'none',
            'source-arrow-shape' : 'data(sbgnclass)',
            'line-style' : 'consumption'
        })
        .selector("edge[sbgnclass='production']")
        .css({
            'target-arrow-fill' : 'filled',
            'line-style' : 'production'
        })
        .selector("edge:selected")
        .css({
            'line-color' : '#1ABC9C',
            'source-arrow-color': '#1ABC9C',
            'target-arrow-color': '#1ABC9C'
        })
        .selector(".ui-cytoscape-edgehandles-source")
        .css({
            'border-color': '#5CC2ED',
            'border-width': 3
        })
        .selector(".ui-cytoscape-edgehandles-target, node.ui-cytoscape-edgehandles-preview")
        .css({
            'background-color': '#5CC2ED'
        })
        .selector("edge.ui-cytoscape-edgehandles-preview")
        .css({
            'line-color' : '#5CC2ED'
        })
        .selector("node.ui-cytoscape-edgehandles-preview, node.intermediate")
        .css({
            'shape' : 'rectangle',
            'width' : 15,
            'height' : 15
}); // end of sbgnStyleSheet

var SBGNContainer = Backbone.View.extend({
    cyStyle: sbgnStyleSheet,

    render: function(){
        var container = $(this.el);
        container.html("");
        container.append(_.template($("#loading-template").html()));

        var cytoscapeJsGraph = (this.model.cytoscapeJsGraph);

        var positionMap = {};

        //add position information to data for preset layout
        for (var i = 0 ; i < cytoscapeJsGraph.nodes.length ; i++){
            var xPos = cytoscapeJsGraph.nodes[i].data.sbgnbbox.x;
            var yPos = cytoscapeJsGraph.nodes[i].data.sbgnbbox.y;
            positionMap[cytoscapeJsGraph.nodes[i].data.id] = {'x':xPos, 'y':yPos};
        }

        var cyOptions = {
            elements: cytoscapeJsGraph,
            style: sbgnStyleSheet,
            layout: { 
                name: 'preset',
                positions: positionMap
            },
            showOverlay: false,
            minZoom: 0.125,
            maxZoom: 16,

            ready: function()
            {
                window.cy = this;
                container.cytoscapePanzoom();

                cy.on('tap', function(evt){
                });

                cy.on('tap', 'node', function(evt){
                    var node = this;
                });
            }

        };
        container.html("");
        container.cy(cyOptions);
        return this;
    }
});

var SBGNLayout = Backbone.View.extend({
    defaultLayoutProperties: {
        name: 'cose',
        nodeRepulsion: 10000,
        nodeOverlap: 10,
        idealEdgeLength: 10,
        edgeElasticity: 100,
        nestingFactor: 5,
        gravity: 250,
        numIter: 100
    },
    currentLayoutProperties: null,

    initialize: function() {
        var self = this;
        self.copyProperties();
        self.template = _.template($("#layout-settings-template").html(), self.currentLayoutProperties);
    },

    copyProperties: function(){
        this.currentLayoutProperties = _.clone(this.defaultLayoutProperties);
    },

    applyLayout: function(){
        var options = this.currentLayoutProperties;
        cy.layout( options );
    },

    render: function(){
        var self = this;
        self.template = _.template($("#layout-settings-template").html(), self.currentLayoutProperties);
        $(self.el).html(self.template);

        $(self.el).dialog();        

        $("#save-layout").die("click").live("click", function(evt){
            self.currentLayoutProperties.nodeRepulsion = document.getElementById("node-repulsion").value;
            self.currentLayoutProperties.nodeOverlap = document.getElementById("node-overlap").value;
            self.currentLayoutProperties.idealEdgeLength = document.getElementById("ideal-edge-length").value;
            self.currentLayoutProperties.edgeElasticity = document.getElementById("edge-elasticity").value;
            self.currentLayoutProperties.nestingFactor = document.getElementById("nesting-factor").value;
            self.currentLayoutProperties.gravity = document.getElementById("gravity").value;
            self.currentLayoutProperties.numIter = document.getElementById("num-iter").value;

            $(self.el).dialog('close');
        });

        $("#default-layout").die("click").live("click", function(evt){
            self.copyProperties();
            self.template = _.template($("#layout-settings-template").html(), self.currentLayoutProperties);
            $(self.el).html(self.template);
        });

        return this;
    }
});
