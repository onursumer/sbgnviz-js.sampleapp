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

function bboxProp(ele){
    var sbgnbbox = new Object();

    sbgnbbox.x = $(ele).find('bbox').attr('x');
    sbgnbbox.y = $(ele).find('bbox').attr('y');
    sbgnbbox.w = $(ele).find('bbox').attr('w');
    sbgnbbox.h = $(ele).find('bbox').attr('h');

    //set positions as center
    sbgnbbox.x = parseFloat(sbgnbbox.x) + parseFloat(sbgnbbox.w)/2;
    sbgnbbox.y = parseFloat(sbgnbbox.y) + parseFloat(sbgnbbox.h)/2;

    return sbgnbbox;
};

function stateAndInfoBboxProp(ele, parentBbox){
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
};

function stateAndInfoProp(ele, parentBbox){
    var stateAndInfoArray = new Array();

    $(ele).children('glyph').each(function(){
        var obj = new Object();
        if($(this).attr('class') === 'unit of information'){
            obj.id = $(this).attr('id');
            obj.clazz = $(this).attr('class');
            obj.label = {'text' : $(this).find('label').attr('text')};
            obj.bbox = stateAndInfoBboxProp(this, parentBbox);
            stateAndInfoArray.push(obj);
        }
        else if($(this).attr('class') === 'state variable'){
            obj.id = $(this).attr('id');
            obj.clazz = $(this).attr('class');
            obj.state = {'value' : $(this).find('state').attr('value'),
                'variable' : $(this).find('state').attr('variable')};
            obj.bbox = stateAndInfoBboxProp(this, parentBbox);
            stateAndInfoArray.push(obj);
        }
    });

    return stateAndInfoArray;
};

function addCytoscapeJsNode(ele, jsonArray, parent){
    var nodeObj = new Object();

    nodeObj.id = $(ele).attr('id');
    nodeObj.sbgnbbox = bboxProp(ele);
    nodeObj.sbgnclass = $(ele).attr('class');

    if($(ele).find('clone').length > 0)
        nodeObj.sbgnclonemarker = true;
    else
        nodeObj.sbgnclonemarker = null;

    nodeObj.sbgnlabel = $(ele).find('label').attr('text');
    nodeObj.sbgnstatesandinfos = stateAndInfoProp(ele, nodeObj.sbgnbbox);

    if(parent == ""){
        if(typeof $(ele).attr('compartmentRef') === 'undefined')
            nodeObj.parent = "";
        else
            nodeObj.parent = $(ele).attr('compartmentRef');            
    }
    else{
        nodeObj.parent = parent;
    }

    var cytoscapeJsNode = {data : nodeObj};
    jsonArray.push(cytoscapeJsNode);
};

function traverseNodes(ele, jsonArray, parent){
    //add complex nodes here
    if($(ele).attr('class') === 'complex' || $(ele).attr('class') === 'submap'){
        addCytoscapeJsNode(ele, jsonArray, parent);

        $(ele).children('glyph').each(function(){
            if($(this).attr('class') != 'state variable' && 
                $(this).attr('class') != 'unit of information'){
                traverseNodes(this, jsonArray, $(ele).attr('id'));
            }
        });
    }
    else{
        addCytoscapeJsNode(ele, jsonArray, parent);
    }
};

function getArcSourceAndTarget(arc, xmlObject){
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
};

function addCytoscapeJsEdge(ele, jsonArray, xmlObject){
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

    var sourceAndTarget = getArcSourceAndTarget(ele, xmlObject);

    edgeObj.source = sourceAndTarget.source;
    edgeObj.target = sourceAndTarget.target;

    var cytoscapeJsEdge = {data : edgeObj};
    jsonArray.push(cytoscapeJsEdge);
};

function sbgnmlToJson(xmlObject) {
    var cytoscapeJsNodes = new Array();
    var cytoscapeJsEdges = new Array();

    $(xmlObject).find("map").children('glyph').each(function(){
        traverseNodes(this, cytoscapeJsNodes, "");
    });

    $(xmlObject).find("map").children('arc').each(function(){
        addCytoscapeJsEdge(this, cytoscapeJsEdges, xmlObject);
    });

    var cytoscapeJsGraph = new Object();
    cytoscapeJsGraph.nodes = cytoscapeJsNodes;
    cytoscapeJsGraph.edges = cytoscapeJsEdges;

    return cytoscapeJsGraph;
};