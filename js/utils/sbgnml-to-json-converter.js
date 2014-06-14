function loadXMLDoc(filename) {
    if (window.XMLHttpRequest) {
        xhttp=new XMLHttpRequest();
    }
    else {
        xhttp=new ActiveXObject("Microsoft.XMLHTTP");
    }
    xhttp.open("GET",filename,false);
    xhttp.send();
    return xhttp.responseXML;
};

function textToXmlObject(text){
    if (window.ActiveXObject){
      var doc=new ActiveXObject('Microsoft.XMLDOM');
      doc.async='false';
      doc.loadXML(text);
    } else {
      var parser=new DOMParser();
      var doc=parser.parseFromString(text,'text/xml');
    }
    return doc;
};

var sbgnmlToJson = {
    getAllCompartments : function(xmlObject){
        var compartments = [];
        $(xmlObject).find("glyph[class='compartment']").each(function(){
            compartments.push({
                'x' : parseFloat($(this).children('bbox').attr('x')),
                'y' : parseFloat($(this).children('bbox').attr('y')),
                'w' : parseFloat($(this).children('bbox').attr('w')),
                'h' : parseFloat($(this).children('bbox').attr('h')),
                'id' : $(this).attr('id')
            });
        });

        compartments.sort(function(c1, c2){
            if(c1.h * c1.w < c2.h * c2.w)
                return -1;
            if(c1.h * c1.w > c2.h * c2.w)
                return 1;
            return 0;
        });

        return compartments;
    },

    isInBoundingBox : function(bbox1, bbox2){
        if(bbox1.x > bbox2.x && 
            bbox1.y > bbox2.y &&
            bbox1.x + bbox1.w < bbox2.x + bbox2.w &&
            bbox1.y + bbox1.h < bbox2.y + bbox2.h)
            return true;
        return false;
    },

    bboxProp : function(ele){
        var sbgnbbox = new Object();

        sbgnbbox.x = $(ele).find('bbox').attr('x');
        sbgnbbox.y = $(ele).find('bbox').attr('y');
        sbgnbbox.w = $(ele).find('bbox').attr('w');
        sbgnbbox.h = $(ele).find('bbox').attr('h');

        //set positions as center
        sbgnbbox.x = parseFloat(sbgnbbox.x) + parseFloat(sbgnbbox.w)/2;
        sbgnbbox.y = parseFloat(sbgnbbox.y) + parseFloat(sbgnbbox.h)/2;

        return sbgnbbox;
    },

    stateAndInfoBboxProp : function(ele, parentBbox){
        var xPos = parseFloat(parentBbox.x);
        var yPos = parseFloat(parentBbox.y);

        var sbgnbbox = new Object();

        sbgnbbox.x = $(ele).find('bbox').attr('x');
        sbgnbbox.y = $(ele).find('bbox').attr('y');
        sbgnbbox.w = $(ele).find('bbox').attr('w');
        sbgnbbox.h = $(ele).find('bbox').attr('h');

        //set positions as center
        sbgnbbox.x = parseFloat(sbgnbbox.x) + parseFloat(sbgnbbox.w)/2 - xPos;
        sbgnbbox.y = parseFloat(sbgnbbox.y) + parseFloat(sbgnbbox.h)/2 - yPos;

        return sbgnbbox;
    },

    stateAndInfoProp : function(ele, parentBbox){
        var self = this;
        var stateAndInfoArray = new Array();

        $(ele).children('glyph').each(function(){
            var obj = new Object();
            if($(this).attr('class') === 'unit of information'){
                obj.id = $(this).attr('id');
                obj.clazz = $(this).attr('class');
                obj.label = {'text' : $(this).find('label').attr('text')};
                obj.bbox = self.stateAndInfoBboxProp(this, parentBbox);
                stateAndInfoArray.push(obj);
            }
            else if($(this).attr('class') === 'state variable'){
                obj.id = $(this).attr('id');
                obj.clazz = $(this).attr('class');
                obj.state = {'value' : $(this).find('state').attr('value'),
                    'variable' : $(this).find('state').attr('variable')};
                obj.bbox = self.stateAndInfoBboxProp(this, parentBbox);
                stateAndInfoArray.push(obj);
            }
        });

        return stateAndInfoArray;
    },

    addParentInfoToNode : function(ele, nodeObj, parent, compartments){
        var self = this;
        //there is no complex parent
        if(parent == ""){
            //no compartment reference
            if(typeof $(ele).attr('compartmentRef') === 'undefined'){
                nodeObj.parent = "";

                //add compartment according to geometry
                for(var i = 0 ; i < compartments.length ; i++){
                    var bbox = {
                        'x' : parseFloat($(ele).children('bbox').attr('x')),
                        'y' : parseFloat($(ele).children('bbox').attr('y')),
                        'w' : parseFloat($(ele).children('bbox').attr('w')),
                        'h' : parseFloat($(ele).children('bbox').attr('h')),
                        'id' : $(ele).attr('id')
                    }
                    if(self.isInBoundingBox(bbox, compartments[i])){
                        nodeObj.parent = compartments[i].id;
                        break;
                    }
                }
            }
            //there is compartment reference
            else{
                nodeObj.parent = $(ele).attr('compartmentRef');
            }
        }
        //there is complex parent
        else{
            nodeObj.parent = parent;
        }
    },

    addCytoscapeJsNode : function(ele, jsonArray, parent, compartments){
        var self = this;
        var nodeObj = new Object();

        //add id information
        nodeObj.id = $(ele).attr('id');
        //add node bounding box information
        nodeObj.sbgnbbox = self.bboxProp(ele);
        //add class information
        nodeObj.sbgnclass = $(ele).attr('class');
        //add label information
        nodeObj.sbgnlabel = $(ele).children('label').attr('text');
        //add state and info box information
        nodeObj.sbgnstatesandinfos = self.stateAndInfoProp(ele, nodeObj.sbgnbbox);
        //adding parent information
        self.addParentInfoToNode(ele, nodeObj, parent, compartments);

        //add clone information
        if($(ele).find('clone').length > 0)
            nodeObj.sbgnclonemarker = true;
        else
            nodeObj.sbgnclonemarker = null;

        //add port information
        var ports = [];
        $(ele).find('port').each(function(){
            var id = $(this).attr('id');
            var relativeXPos = parseFloat($(this).attr('x')) - nodeObj.sbgnbbox.x;
            var relativeYPos = parseFloat($(this).attr('y')) - nodeObj.sbgnbbox.y;

            ports.push({
                id : $(this).attr('id'),
                x : relativeXPos,
                y : relativeYPos
            });
        });

        nodeObj.ports = ports;

        var cytoscapeJsNode = {data : nodeObj};
        jsonArray.push(cytoscapeJsNode);
    },

    traverseNodes : function(ele, jsonArray, parent, compartments){
        var self = this;
        //add complex nodes here
        if($(ele).attr('class') === 'complex' || $(ele).attr('class') === 'submap'){
            self.addCytoscapeJsNode(ele, jsonArray, parent, compartments);

            $(ele).children('glyph').each(function(){
                if($(this).attr('class') != 'state variable' && 
                    $(this).attr('class') != 'unit of information'){
                    self.traverseNodes(this, jsonArray, $(ele).attr('id'), compartments);
                }
            });
        }
        else{
            self.addCytoscapeJsNode(ele, jsonArray, parent, compartments);
        }
    },

    getArcSourceAndTarget : function(arc, xmlObject){
        //source and target can be inside of a port
        var source = $(arc).attr('source');
        var target = $(arc).attr('target');
        var sourceNodeId, targetNodeId;

        $(xmlObject).find('glyph').each(function(){
            if($(this).attr('id') == source){
                sourceNodeId = source;
            }
            else if($(this).attr('id') == target){
                targetNodeId = target;
            }
        });

        if(typeof sourceNodeId === 'undefined'){
            $(xmlObject).find("port").each(function(){
                if($(this).attr('id') == source){
                    sourceNodeId = $(this).parent().attr('id');
                }
            });
        }

        if(typeof targetNodeId === 'undefined'){
            $(xmlObject).find("port").each(function(){
                if($(this).attr('id') == target){
                    targetNodeId = $(this).parent().attr('id');
                }
            });
        }

        return {'source' : sourceNodeId, 'target' : targetNodeId};
    },

    addCytoscapeJsEdge : function(ele, jsonArray, xmlObject){
        var self = this;
        var edgeObj = new Object();

        edgeObj.id = $(ele).attr('id');
        edgeObj.sbgnclass = $(ele).attr('class');

        if($(ele).find('glyph').length <= 0){
            edgeObj.sbgncardinality = 0;
        }
        else{
            $(ele).children('glyph').each(function(){
                if($(this).attr('class') != 'cardinality'){
                    edgeObj.sbgncardinality = $(this).find('label').attr('text');
                }
            });
        }

        var sourceAndTarget = self.getArcSourceAndTarget(ele, xmlObject);

        edgeObj.source = sourceAndTarget.source;
        edgeObj.target = sourceAndTarget.target;

        edgeObj.portSource = $(ele).attr("source");
        edgeObj.portTarget = $(ele).attr("target");

        var cytoscapeJsEdge = {data : edgeObj};
        jsonArray.push(cytoscapeJsEdge);
    },

    convert : function(xmlObject) {
        var self = this;
        var cytoscapeJsNodes = [];
        var cytoscapeJsEdges = [];

        var compartments = self.getAllCompartments(xmlObject);

        $(xmlObject).find("map").children('glyph').each(function(){
            self.traverseNodes(this, cytoscapeJsNodes, "", compartments);
        });

        $(xmlObject).find("map").children('arc').each(function(){
            self.addCytoscapeJsEdge(this, cytoscapeJsEdges, xmlObject);
        });

        var cytoscapeJsGraph = new Object();
        cytoscapeJsGraph.nodes = cytoscapeJsNodes;
        cytoscapeJsGraph.edges = cytoscapeJsEdges;

        return cytoscapeJsGraph;
    }
};

var toSbgnml = {
    createSbgnml : function(){
        var self = this;
        var sbgnmlText = "";

        //add headers
        sbgnmlText = sbgnmlText + "<?xml version='1.0' encoding='UTF-8' standalone='yes'?>\n";
        sbgnmlText = sbgnmlText + "<sbgn xmlns='http://sbgn.org/libsbgn/pd/0.1'>\n";
        sbgnmlText = sbgnmlText + "<map>\n";

        //adding glyph sbgnml
        cy.nodes().each(function(){
            if(!this.isChild())
                sbgnmlText = sbgnmlText + self.getGlyphSbgnml(this);
        });

        //adding arc sbgnml
        cy.edges().each(function(){
            sbgnmlText = sbgnmlText + self.getArcSbgnml(this);
        });

        sbgnmlText = sbgnmlText + "</map>\n";
        sbgnmlText = sbgnmlText + "</sbgn>\n";

        return sbgnmlText;
    },

    getGlyphSbgnml : function(node){
        var self = this;
        var sbgnmlText = "";

        if(node._private.data.sbgnclass === "compartment"){
            sbgnmlText = sbgnmlText + 
                "<glyph id='" + node._private.data.id + "' class='compartment' ";

            if(node.parent().isParent()){
                var parent = node.parent();
                sbgnmlText = sbgnmlText + " compartmentRef='" + node._private.data.id + "'";
            }

            sbgnmlText = sbgnmlText + " >\n";

            sbgnmlText = sbgnmlText + this.addCommonGlyphProperties(node);

            sbgnmlText = sbgnmlText + "</glyph>\n";

            node.children().each(function(){
                sbgnmlText = sbgnmlText + self.getGlyphSbgnml(this);
            });
        }
        else if(node._private.data.sbgnclass === "complex" || node._private.data.sbgnclass === "submap"){
            sbgnmlText = sbgnmlText + 
                "<glyph id='" + node._private.data.id + "' class='" + node._private.data.sbgnclass + "' ";

            if(node.parent().isParent()){
                var parent = node.parent()[0];
                if(parent._private.data.sbgnclass == "compartment")
                    sbgnmlText = sbgnmlText + " compartmentRef='" + parent._private.data.id + "'";
            }
            sbgnmlText = sbgnmlText + " >\n";

            sbgnmlText = sbgnmlText + self.addCommonGlyphProperties(node);

            node.children().each(function(){
                sbgnmlText = sbgnmlText + self.getGlyphSbgnml(this);
            });

            sbgnmlText = sbgnmlText + "</glyph>\n";
        }
        else{//it is a simple node
            sbgnmlText = sbgnmlText + 
                "<glyph id='" + node._private.data.id + "' class='" + node._private.data.sbgnclass + "'";

            if(node.parent().isParent()){
                var parent = node.parent()[0];
                if(parent._private.data.sbgnclass == "compartment")
                    sbgnmlText = sbgnmlText + " compartmentRef='" + parent._private.data.id + "'";
            }

            sbgnmlText = sbgnmlText + " >\n";

            sbgnmlText = sbgnmlText + self.addCommonGlyphProperties(node);

            sbgnmlText = sbgnmlText + "</glyph>\n";
        }
            
        return  sbgnmlText;
    },

    addCommonGlyphProperties : function(node){
        var sbgnmlText = "";

        //add label information
        sbgnmlText = sbgnmlText + this.addLabel(node);
        //add bbox information
        sbgnmlText = sbgnmlText + this.addGlyphBbox(node);
        //add port information
        sbgnmlText = sbgnmlText + this.addPort(node);
        //add state and info box information
        sbgnmlText = sbgnmlText + this.getStateAndInfoSbgnml(node);

        return sbgnmlText;
    },

    getStateAndInfoSbgnml : function(node){
        var sbgnmlText = "";

        for(var i = 0 ; i < node._private.data.sbgnstatesandinfos.length ; i++){
            var boxGlyph = node._private.data.sbgnstatesandinfos[i];
            if(boxGlyph.clazz === "state variable"){
                sbgnmlText = sbgnmlText + this.addStateBoxGlyph(boxGlyph, node);
            }
            else if(boxGlyph.clazz === "unit of information"){
                sbgnmlText = sbgnmlText + this.addInfoBoxGlyph(boxGlyph, node);
            }
        }
        return sbgnmlText;
    },

    getArcSbgnml : function(edge){
        var sbgnmlText = "";

        sbgnmlText = sbgnmlText + "<arc target='" + edge._private.data.portTarget +
            "' source='" + edge._private.data.portSource + "' class='" +
            edge._private.data.sbgnclass + "'>\n";

        sbgnmlText = sbgnmlText + "<start y='" + edge._private.rscratch.startY + "' x='" +
            edge._private.rscratch.startX + "'/>\n";

        sbgnmlText = sbgnmlText + "<end y='" + edge._private.rscratch.endY + "' x='" +
            edge._private.rscratch.endX + "'/>\n";

        sbgnmlText = sbgnmlText + "</arc>\n";

        return sbgnmlText;
    },

    addGlyphBbox : function(node){
        var bbox = node._private.data.sbgnbbox;
        var x = node._private.position.x - bbox.w/2;
        var y = node._private.position.y - bbox.h/2;
        return "<bbox y='" + y + "' x='" + x + 
            "' w='" + bbox.w + "' h='" + bbox.h + "' />\n";
    },

    addStateAndInfoBbox : function(node, boxGlyph){
        boxBbox = boxGlyph.bbox;
        var x = node._private.position.x + (boxBbox.x - boxBbox.w/2);
        var y = node._private.position.y + (boxBbox.y - boxBbox.h/2);
        return "<bbox y='" + y + "' x='" + x + 
            "' w='" + boxBbox.w + "' h='" + boxBbox.h + "' />\n";
    },

    addPort : function(node){
        var sbgnmlText = "";

        var ports = node._private.data.ports;
        for(var i = 0 ; i < ports.length ; i++){
            var x = node._private.position.x + ports[i].x;
            var y = node._private.position.y + ports[i].y;

            sbgnmlText = sbgnmlText + "<port id='" + ports[i].id + 
                "' y='" + y + "' x='" + x + "' />\n";
        }
        return sbgnmlText;
    },

    addLabel : function(node){
        var label = node._private.data.sbgnlabel;

        if(typeof label != 'undefined')
            return "<label text='" + label + "' />\n";
        return "";
    },

    addStateBoxGlyph : function(node, mainGlyph){
        var sbgnmlText = "";

        sbgnmlText = sbgnmlText + "<glyph id='" + node.id + "' class='state variable'>\n";
        sbgnmlText = sbgnmlText + "<state ";

        if(typeof node.state.value != 'undefined')
            sbgnmlText = sbgnmlText + "value='" + node.state.value + "' ";
        if(node.state.variable != 'undefined')
            sbgnmlText = sbgnmlText + "variable='" + node.state.variable + "' ";
        sbgnmlText = sbgnmlText + "/>\n";
        
        sbgnmlText = sbgnmlText + this.addStateAndInfoBbox(mainGlyph, node);
        sbgnmlText = sbgnmlText + "</glyph>\n";

        return sbgnmlText;
    },

    addInfoBoxGlyph : function(node, mainGlyph){
        var sbgnmlText = "";

        sbgnmlText = sbgnmlText + "<glyph id='" + node.id + "' class='unit of information'>\n";
        sbgnmlText = sbgnmlText + "<label ";

        if(typeof node.label.text != 'undefined')
            sbgnmlText = sbgnmlText + "text='" + node.label.text + "' ";
        sbgnmlText = sbgnmlText + "/>\n";
        
        sbgnmlText = sbgnmlText + this.addStateAndInfoBbox(mainGlyph, node);
        sbgnmlText = sbgnmlText + "</glyph>\n";

        return sbgnmlText;
    }
};
















