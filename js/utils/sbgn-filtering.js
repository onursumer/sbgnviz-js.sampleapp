var sbgnFiltering = {

	notHighlightNode : {'border-opacity': 0.3, 'text-opacity' : 0.3},
    notHighlightEdge : {'opacity':0.3, 'text-opacity' : 0.3, 'background-opacity': 0.3},
    processTypes : ['process', 'omitted process', 'uncertain process', 
        'association', 'dissociation', 'phenotype'],

    hideSelected: function(){
        var allNodes = cy.nodes();
        var selectedNodes = cy.nodes(":selected");
        var nodesToShow = this.expandRemainingNodes(selectedNodes, allNodes);
        this.applyFilter(allNodes.not(nodesToShow));

        cy.elements(":selected").unselect();
    },

    showSelected: function(){       
        var allNodes = cy.nodes();
        var selectedNodes = cy.nodes(":selected");
        var nodesToShow = this.expandNodes(selectedNodes);
        this.applyFilter(allNodes.not(nodesToShow));

        cy.elements(":selected").unselect();
    },

    showAll: function(){
        this.removeFilter();     
    },

    highlightNeighborsofSelected: function(){
        var selectedEles = cy.elements(":selected");
        selectedEles = selectedEles.add(selectedEles.parents("node[sbgnclass='complex']"));
        selectedEles = selectedEles.add(selectedEles.descendants());
        var neighborhoodEles = selectedEles.neighborhood();
        var nodesToHighlight = selectedEles.add(neighborhoodEles);
        nodesToHighlight = nodesToHighlight.add(nodesToHighlight.descendants());
        this.highlightGraph(nodesToHighlight.nodes(), nodesToHighlight.edges());
    },

    highlightProcessesOfSelected: function(){
        var selectedEles = cy.elements(":selected");
        selectedEles = this.expandNodes(selectedEles);
        this.highlightGraph(selectedEles.nodes(), selectedEles.edges());
    },

    removeHighlights: function(){
        cy.nodes().removeCss(this.notHighlightNode);
        cy.edges().removeCss(this.notHighlightEdge);
    },

    highlightGraph: function(nodes, edges){
        cy.nodes().css(this.notHighlightNode);
        cy.edges().css(this.notHighlightEdge);
        nodes.removeCss(this.notHighlightNode);
        edges.removeCss(this.notHighlightEdge);
    },

    expandNodes: function(nodesToShow){
        var self = this;
        //add children
        nodesToShow = nodesToShow.add(nodesToShow.nodes().descendants());
        //add parents
        nodesToShow = nodesToShow.add(nodesToShow.parents());
        //add complex children
        nodesToShow = nodesToShow.add(nodesToShow.nodes("node[sbgnclass='complex']").descendants());

        // var processes = nodesToShow.nodes("node[sbgnclass='process']");
        // var nonProcesses = nodesToShow.nodes("node[sbgnclass!='process']");
        // var neighborProcesses = nonProcesses.neighborhood("node[sbgnclass='process']");

        var processes = nodesToShow.filter(function(){
            return $.inArray(this._private.data.sbgnclass, self.processTypes) >= 0;
        });
        var nonProcesses = nodesToShow.filter(function(){
            return $.inArray(this._private.data.sbgnclass, self.processTypes) === -1;
        });
        var neighborProcesses = nonProcesses.neighborhood().filter(function(){
            return $.inArray(this._private.data.sbgnclass, self.processTypes) >= 0;
        });

        nodesToShow = nodesToShow.add(processes.neighborhood());
        nodesToShow = nodesToShow.add(neighborProcesses);
        nodesToShow = nodesToShow.add(neighborProcesses.neighborhood());

        //add parents
        nodesToShow = nodesToShow.add(nodesToShow.nodes().parents());
        //add children
        nodesToShow = nodesToShow.add(nodesToShow.nodes("node[sbgnclass='complex']").descendants());

        return nodesToShow;
    },

    expandRemainingNodes: function(nodesToFilter, allNodes){
        nodesToFilter = this.expandNodes(nodesToFilter);
        var nodesToShow = allNodes.not(nodesToFilter);
        nodesToShow = this.expandNodes(nodesToShow);
        return nodesToShow;
    },

    applyFilter: function(nodesToFilterOut){
        //nodesToFilterOut = nodesToFilterOut.add(nodesToFilterOut.descendants());
        nodesToFilterOut.hide();
        //nodesToFilterOut.data(filterType, true);
    },

    removeFilter: function(){
        cy.elements().show();
    }
};