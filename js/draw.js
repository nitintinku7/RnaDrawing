var structureProto = [
    {
        xPosition : null,
        yPosition : null,
        textData: 'Edit'
    },
    {
        xPosition : null,
        yPosition : null,
        textData: 'RemoveNode'
    },
    {
        xPosition : null,
        yPosition : null,
        textData: 'Make Bond'
    }
];




debugger;



var findNewCoordinates = function(source,target)
{
    var x1 = source.xPosition;
    var y1 = source.yPosition;
    var x2 = target.xPosition;
    var y2 = target.yPosition;
    var dist = Math.sqrt(((x1-x2)*(x1-x2))+((y1-y2)*(y1-y2)));
    var angle = Math.atan((y2-y1)/(x2-x1));
    var x = x1+ dist*Math.cos((angle*Math.PI)/2);
    var y = y1 + dist*Math.sin((angle*Math.PI)/2);
    var coordinates = [0, 0];
    coordinates[0] = x;
    coordinates[1] = y;
    return coordinates;
};

var border=2;
var pageArea = util.store("RnaNodes").length*20;
var svg1 = d3.select(".nodesArea").append("svg")
    .attr("width", pageArea )
    .attr("height", pageArea)
    .attr("x",-50)
    .attr("y",0)
    .attr("Id","svgElement")
    .attr("border",border);

var borderPath = svg1.append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("height", pageArea)
    .attr("width", pageArea)
    .style("stroke", 'black')
    .style("fill", "none")
    .style("stroke-width", border);

var renderStructure = function()
{
    d3.selectAll('.newNodeForm').remove();
    d3.selectAll('.link').remove();
    d3.selectAll('.node').remove();
    d3.selectAll('.bond').remove();
    util.store("RnaNodes",RNAStructure.nodeList);
    util.store("RnaLinks",RNAStructure.links);
    util.store("RnaBonds",RNAStructure.bonds);


    var links = svg1.selectAll(".link")
        .data(util.store("RnaLinks"))
        .enter()
        .insert("line","g")
        .attr("class","link")
        .attr("x1", function(l)
        {
            var sourceNode =  util.store("RnaNodes").filter(function(d, i) {
                if(d.id  === l.source)
                {
                    return d;
                }
            })[0];
            d3.select(this).attr("y1", sourceNode.yPosition);
            return sourceNode.xPosition;
        })
        .attr("x2", function(l)
        {
            var targetNode = util.store("RnaNodes").filter(function(d, i) {
                if(d.id == l.target)
                {
                    return d;
                }
            })[0];
            d3.select(this).attr("y2", targetNode.yPosition);
            return targetNode.xPosition;
        })
        .attr("fill", "none")
        .attr("stroke", "black")
        .attr("stroke-width","3px")
        .on("dblclick",function(d)
        {
            var mainLink = d;
            var source = RNAStructure.getElementId(d.source);
            var target =  RNAStructure.getElementId(d.target);
            var coordinates = [0, 0];
            coordinates = d3.mouse(this);
            var x1 = coordinates[0];
            var y1 = coordinates[1];
            var r1 = 20;
            var r2 = 9;

            svg1.append("ellipse")
                .attr("class","makeNodeElement")
                .attr("cx",x1)
                .attr("cy",y1)
                .attr("rx",r1)
                .attr("ry",r2)
                .attr("fill","white")
                .attr("stroke",'black')
                .attr('stroke-width','1px');

            svg1.append("text")
                .attr("class","makeNodeElement")
                .attr("x",x1-15)
                .attr("y",y1)
                .attr("font-size", "7")
                .style("fill", "black")
                .text('New Node')
                .on("mousedown",function()
                {
                    var present = d;
                    d3.selectAll('.makeNodeElement').remove();
                    d3.selectAll('.newNodeHtm').remove();
                    var newNode = svg1.append ("foreignObject")
                        .attr('class','newNodeForm')
                        .attr('width',10)
                        .attr('height',10)
                        .attr("x",function(d)
                        {
                            return x1+20;
                        })
                        .attr("y",function(d)
                        {
                            return y1;
                        })
                        .append("xhtml:form")
                        .attr('class','newNodeHtm')
                        .style( 'font', "15px 'Helvetica Neue'")

                        .style('background','transparent').html(function() {
                            var htmlScript = "<p>New Node Value:</p><input type =\'text\' id = \'newNodeVal\' value = \'\'>";
                            return htmlScript})
                        .on('submit',function(){
                            d3.select(this).selectAll("text").remove();
                            var changeVal = d3.selectAll('#newNodeVal');
                            var groupValue = changeVal._groups[0];
                            var inputValue = groupValue[0].value;
                            var pattern =/^['A'|'C'|'G'|'U'|'X'|'Y']+$/;

                            if(inputValue.length == 0 || inputValue.length >1 || !pattern.test(inputValue))
                            {

                                d3.select(this).append("text")
                                    .attr("x",function(d)
                                    {
                                        return present.xPosition+20;
                                    })
                                    .attr("y",function(d)
                                    {
                                        return present.yPosition+1;
                                    })
                                    .attr("font-size", "10")
                                    .style("fill", "red")
                                    .text('Please enter a valid text');
                                return false;
                            }
                            else
                            {

                                var newCoord = findNewCoordinates(source,target);
                                var value = groupValue[0].value;
                                var newId = util.uuid();
                                var newLinkId = util.uuid();
                                var newNode =
                                {
                                    xPosition : newCoord[0],
                                    yPosition :newCoord[1],
                                    id : newId,
                                    index : target.index,
                                    content : value,
                                    bondPosition : null
                                };
                                RNAStructure.delete(target.index,newNode);
                                RNAStructure.addLinks(newId,target.id,newLinkId);
                                var mainLinkId = mainLink.id;
                                RNAStructure.updateLink(mainLinkId,newId);

                                renderStructure();
                            }
                        });
        });
    });
    var bonds = svg1.selectAll(".bond")
        .data(util.store("RnaBonds"))
        .enter().insert("line","g")
        .attr("class","link")
        .attr("fill", "none")
        .attr("stroke", "blue")
        .attr("stroke-width","3px")
        .attr("x1", function(l)
        {
            var sourceNode =  util.store("RnaNodes").filter(function(d, i)
            {
                if(d.id  === l.source)
                {
                    return d;
                }
            })[0];
            d3.select(this).attr("y1", sourceNode.yPosition);
            return sourceNode.xPosition;
        })
        .attr("x2", function(l)
        {
            var targetNode = util.store("RnaNodes").filter(function(d, i)
            {
                if(d.id == l.target)
                {
                    return d;
                }
            })[0];
            d3.select(this).attr("y2", targetNode.yPosition);
            return targetNode.xPosition;
        });

    var drag = d3.drag()
        .on("start",function(d,i)
        {
            d3.event.sourceEvent.stopPropagation();
        })
        .on("drag", function(d, i)
        {
            d3.selectAll('.nodeEditForm').remove();
            d3.selectAll('.makeNodeElement').remove();
            d3.select(this).selectAll('.nodeInfo').remove();
            d.xPosition = d3.event.x;
            d.yPosition = d3.event.y;
            d3.select(this).selectAll("circle").attr("cx", d.xPosition).attr("cy", d.yPosition);
            d3.select(this).selectAll("text").attr("x",(d.xPosition)-3).attr("y",(d.yPosition)+2);
            var selectedId = d3.select(this).attr("group-id");
            links.each(function(l, li)
            {
                if (l.source == selectedId)
                {
                    d3.select(this).attr("x1", d.xPosition).attr("y1", d.yPosition);
                    RNAStructure.updateElement(selectedId,null,d.xPosition,d.yPosition);
                }
                else if (l.target == selectedId)
                {
                    d3.select(this).attr("x2", d.xPosition).attr("y2", d.yPosition);
                    RNAStructure.updateElement(selectedId,null,d.xPosition,d.yPosition);
                }
            });
            bonds.each(function(l, li)
            {
                if (l.source == selectedId)
                {
                    d3.select(this).attr("x1", d.xPosition).attr("y1", d.yPosition);
                    RNAStructure.updateElement(selectedId,null,d.xPosition,d.yPosition);
                }
                else if (l.target == selectedId)
                {
                    d3.select(this).attr("x2", d.xPosition).attr("y2", d.yPosition);
                    RNAStructure.updateElement(selectedId,null,d.xPosition,d.yPosition);

                }
            });
        });

    var nodes = svg1.selectAll('.node')
        .data(util.store("RnaNodes"))
        .enter().append("g")
        .attr("group-id",function(d,i)
        {
            return d.id;
        })
        .attr("class", "node")
        .on("dblclick",function(d)
        {
            var self = this;
            var elementInfo = d;
            d3.selectAll('.nodeEditForm').remove();
            d3.selectAll('.nodeInfo').remove();
            if (d3.event.defaultPrevented) return;
            var x = d.xPosition;
            var y = d.yPosition;
            var id = d.id;
            var info =svg1.append('image')
                .attr('class','nodeEdit')
                .attr('width','130')
                .attr('height','130')
                .attr("x",function(d)
                {
                    return x;
                })
                .attr("y",function(d) {
                    return y;
                })
                .attr('xlink:href','https://cdn.gomix.com/99820b96-ce97-49b0-8606-276b284b60b8%2FCircle_Grey.png')
                .style("background","white");
            for(var i = 0; i < structureProto.length; i++)
            {
                structureProto[i].xPosition = x+25;
                structureProto[i].yPosition = y + 25 +i*25;
                structureProto[i].id = id;
            }

            var nodeEditOption = svg1.selectAll('.nodeEditOption')
                .data(structureProto)
                .enter().append("g")
                .attr("id",function(d)
                {
                    return d.textData;
                })
                .attr("class", "nodeEditOption")
                .on("mousedown",function(d)
                {
                    var present = d;
                    if(d.textData == "RemoveNode")
                    {
                        RNAStructure.delete(elementInfo.id);
                        d3.selectAll('.nodeEdit').remove();
                        d3.selectAll('.nodeEditOption').remove();
                        RNAStructure.links = [];
                        makeLinks();
                        renderStructure();
                    }

                    if(d.textData == "Edit")
                    {
                        d3.selectAll('.nodeEdit').remove();
                        d3.selectAll('.nodeEditOption').remove();
                        var editNode = svg1.append ("foreignObject")
                            .attr('class','nodeEditForm')
                            .attr("x",function(d) {
                                return x+20;
                            })
                            .attr("y",function(d) {
                                return y;
                            })
                            .append("xhtml:form")
                            .attr('class','nodeEditHtm')
                            .style( 'font', "15px 'Helvetica Neue'")
                            .attr('width','10%')
                            .attr('height','10%')
                            .style("background","transparent").html(function(self)
                            {
                                var htmlScript = "<p>Change Value:</p><input type = 'text' id = \'changeVal\' value = \'\'>";
                                return htmlScript
                            })
                            .on('submit',function(){
                                d3.select(this).selectAll("text").remove();
                                var changeVal = d3.selectAll('#changeVal');
                            var groupValue = changeVal._groups[0];
                            var inputValue = groupValue[0].value;
                                var pattern =/^['A'|'C'|'G'|'U'|'X'|'Y']+$/;
                                if(inputValue.length == 0 || inputValue.length >1 || !pattern.test(inputValue))
                                {
                                var pattern =/^['A'|'C'|'G'|'U'|'X'|'Y']+$/;


                                    d3.select(this).append("text")
                                        .attr("x",function(d)
                                        {
                                            return present.xPosition+20;
                                        })
                                        .attr("y",function(d)
                                        {
                                            return present.yPosition+1;
                                        })
                                        .attr("font-size", "10")
                                        .style("fill", "red")
                                        .text('Please enter a valid text');
                                    return false;
                                }
                                else
                                {
                                var value = groupValue[0].value;
                                var id = d3.select(self).attr('group-id');
                                elementInfo.content = value;
                                    RNAStructure.updateElement(id,value);
                                d3.select(self).selectAll('text').text(value);
                                d3.selectAll('.nodeEditForm').remove();
                            }
                        });
                    }

                    if(d.textData == "Make Bond")
                    {

                        d3.selectAll('.nodeEdit').remove();
                        d3.selectAll('.nodeEditOption').remove();
                        var editNode = svg1.append ("foreignObject")
                            .attr('class','nodeEditForm')
                            .attr("width", 10)
                            .attr("height", 10)
                            .attr("x",function(d)
                            {
                                return x+20;
                            })
                            .attr("y",function(d)
                            {
                                return y;
                            })
                            .append("xhtml:form")
                            .style("font", "15px 'Helvetica Neue'")
                            .style("background","transparent").html(function(self)
                            {
                                var htmlScript = "<p>Target Bond:</p><input type =\'text\' id = \'TargetBond\' value = \'\'>";
                                return htmlScript;
                            }).on('submit',function(){
                                d3.select(this).selectAll("text").remove();
                                d3.select(this).selectAll("text").remove();
                                var changeVal = d3.selectAll('#TargetBond');
                                var groupValue = changeVal._groups[0];
                                var inputValue = groupValue[0].value;
                                var pattern =/^[0-9]*$/;

                                var flag = RNAStructure.validateInput(inputValue,elementInfo);
                                if(!pattern.test(inputValue))
                                {



                                    d3.select(this).append("text")
                                        .attr("x",function(d)
                                        {
                                            return present.xPosition+20;
                                        })
                                        .attr("y",function(d)
                                        {
                                            return present.yPosition+1;
                                        })
                                        .attr("font-size", "10")
                                        .style("fill", "red")
                                        .text('Please enter a valid text');
                                    return false;
                                }
                                else if (flag != true) {
                                    d3.select(this).append("text")
                                        .attr("x",function(d)
                                        {
                                            return present.xPosition+20;
                                        })
                                        .attr("y",function(d)
                                        {
                                            return present.yPosition+1;
                                        })
                                        .attr("font-size", "10")
                                        .style("fill", "red")
                                        .text(flag);
                                    return false;
                                }
                                else
                                {
                                d3.selectAll('.nodeEditForm').remove();
                                var value = groupValue[0].value;
                                    var target = RNAStructure.getElementIndex(value);
                                    RNAStructure.updateBond(elementInfo.index,target.index);

                                RNAStructure.updateBond(target.index,elementInfo.index);
                                var Id = util.uuid();
                                RNAStructure.addBonds(elementInfo.id,target.id,Id);
                                renderStructure();
                            }
                        });
                    }
                    if(d.textData == "Delete Bond")
                    {
                        d3.selectAll('.nodeEdit').remove();
                        d3.selectAll('.nodeEditOption').remove();
                        RNAStructure.deleteBond(elementInfo.id);
                        renderStructure();
                    }
                });

            nodeEditOption.append('rect')
                .attr('class','nodeEditOption')
                .attr('width','80')
                .attr('height','20')
                .attr("x",function(d)
                {
                    return d.xPosition;
                })
                .attr("y",function(d)
                {
                    return d.yPosition;
                })
                .attr("fill", "white")
                .attr("stroke",'black')
                .attr('stroke-width','1px');

            nodeEditOption.append('text')
                .attr('class','nodeEditOption')
                .attr("x",function(d)
                {
                    return d.xPosition+2;
                })
                .attr("y",function(d)
                {
                    return d.yPosition+10;
                })
                .attr("font-size", "10")
                .style("fill", "black")
                .text(function(d,i)
                {
                    if(i == 2)
                    {
                        if(elementInfo.bondPosition != null)
                        {
                            return d.textData = "Delete Bond";
                        }
                        else
                        {
                            return d.textData = "Make Bond";
                        }
                    }
                  return d.textData;
                });

            nodeEditOption.append('rect')
                .attr('class','nodeEditOption')
                .attr('width','80')
                .attr('height','20')
                .attr("x",function(d)
                {
                    return d.xPosition;
                })
                .attr("y",function(d)
                {
                    return d.yPosition;
                })
                .attr("fill", "transparent")
                .attr("stroke",'black')
                .attr('stroke-width','1px');

        })

        .on("mouseover", function(d)
        {
            d3.selectAll('.newNodeForm').remove();
            d3.selectAll('.makeNodeElement').remove();
            d3.selectAll('.nodeEdit').remove();
            d3.selectAll('.nodeEditOption').remove();
            d3.selectAll('.nodeEditForm').remove();
            var x = d.xPosition;
            var y = d.yPosition;

            var info =svg1.append('image')
                .attr('class',"nodeInfo")
                .attr('width','130')
                .attr('height','130')
                .attr("x",function(d)
                {
                    return x;
                })
                .attr("y",function(d)
                {
                    return y;
                })
                .attr('xlink:href','https://cdn.gomix.com/99820b96-ce97-49b0-8606-276b284b60b8%2Fchat.jpeg')
                .style("background","white");

            var htmlPage = "<p> x:"+Math.round(d.xPosition * 100) / 100+"<br>y:"+Math.round(d.yPosition * 100) / 100+"<br>value:"+d.content+"<br>index:"+d.index+"</p>";
            var infoText = svg1.append("foreignObject")
                .attr("class","nodeInfo")
                .attr("width", 10)
                .attr("height", 10)
                .attr("x",function(d)
                {
                    return x+57;
                })
                .attr("y",function(d)
                {
                    return y+35;
                })
                .append("xhtml:body")
                .style("font", "10px 'Helvetica Neue'")
                .style("background","transparent")
                .html(htmlPage);
        })
        .on("mouseout", function() {
            // Remove the info text on mouse out.
            d3.selectAll('.nodeInfo').remove();
        })
        .call(drag);

    nodes.append("circle")
        .attr("cx", function(d)
        {
            return d.xPosition;
        })
        .attr("cy", function(d)
        {
            return d.yPosition;
        })
        .attr("r", 8)
        .attr("fill", "white")
        .attr("stroke","black").attr("stroke-width","1.5px");

    nodes.append("text")
        .attr("x",function(d)
        {
            return d.xPosition-4;
        })
        .attr("y",function(d)
        {
            return d.yPosition+2;
        })
        .attr("font-size", "10")
        .style("fill", "black")
        .text(function(d)
        {
            return d.content;
        });

    nodes.append("circle")
        .attr("cx", function(d)
        {
            return d.xPosition;
        })
        .attr("cy", function(d)
        {
            return d.yPosition;
        })
        .attr("r", 8)
        .attr("fill", "transparent")
        .attr("stroke","black").attr("stroke-width","1.5px");
};