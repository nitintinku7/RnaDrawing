var RNAStructure = {
    nodeList  : [] ,
    links : [],
    bonds : [] ,
    add : function(xPosition,yPosition,Id,i,textValue)
    {
        if(arguments.length === 5)
        {
            this.nodeList.push({
                xPosition : xPosition,
                yPosition :yPosition,
                id : Id,
                index : i,
                content : textValue,
                bondPosition : null
            });
        }
        util.store("RnaNodes",this.nodeList);
    },
    addLinks : function(source,target,id)
    {
        this.links.push(
            {
                source : source,
                target : target,
                id : id
            });
        util.store("RnaLinks",this.links);
    },
    addBonds : function(source,target,id)
    {
        this.bonds.push(
            {
                source : source,
                target : target,
                id : id
            });
        util.store("RnaBonds",this.bonds);
        util.store("RnaNodes",this.nodeList);
    },
    updateElement : function(id,value,x,y)
    {
        if(arguments.length == 2) {
            var i = RNAStructure.nodeList.length - 1;
            while (i >= 0) {
                if (RNAStructure.nodeList[i].id == id) {
                    RNAStructure.nodeList[i].content = value;
                }
                i--;
            }
        }
        else {
            var i = RNAStructure.nodeList.length - 1;
            while (i >= 0) {
                if (RNAStructure.nodeList[i].id == id) {
                    RNAStructure.nodeList[i].xPosition = x;
                    RNAStructure.nodeList[i].yPosition = y;
                }
                i--;
            }
        }
        util.store("RnaNodes",this.nodeList);
    },
    updateBond : function(index,value)
    {
        RNAStructure.nodeList[index].bondPosition = value;
        util.store("RnaNodes",this.nodeList);
    }
    ,
    delete : function(id,value)
    {
        var i = RNAStructure.nodeList.length-1;
        if(arguments.length == 1)
        {
            while(i >= 0)
            {
                if(RNAStructure.nodeList[i].id == id)
                {
                    RNAStructure.nodeList.splice(i,1);
                    for(var j = i;j<RNAStructure.nodeList.length;j++)
                    {
                        RNAStructure.nodeList[j].index = j;
                    }
                    this.deleteBond(id);
                    break;
                }
                i--;
            }
        }
        else if (arguments.length == 2)
        {
            RNAStructure.nodeList.splice(id,0,value);
            for(var j = id+1;j<RNAStructure.nodeList.length;j++)
            {
                RNAStructure.nodeList[j].index = j;
            }
        }
        util.store("RnaNodes",this.nodeList);

    },
    deleteBond : function(id)
    {
        console.log(RNAStructure.bonds);
        console.log(RNAStructure.nodeList);
        var bondId = null;
        var i = RNAStructure.bonds.length-1;
        var count = 0;
        while(i >= 0) {
            if (RNAStructure.bonds[i].source == id || RNAStructure.bonds[i].target == id) {
                    bondId = RNAStructure.bonds[i].id;
            }
            i--;
        }
        var i = RNAStructure.bonds.length-1;
        while(i >= 0)
        {
            if(RNAStructure.bonds[i].id == bondId)
            {
                var sourceId = RNAStructure.bonds[i].source;
                var targetId = RNAStructure.bonds[i].target;

                for(var j = 0 ; j < RNAStructure.nodeList.length; j++)
                {
                    if(RNAStructure.nodeList[j].id == sourceId || RNAStructure.nodeList[j].id == targetId)
                    {
                        RNAStructure.nodeList[j].bondPosition = null;
                    }
                    console.log("in1");
                }

                RNAStructure.bonds.splice(i, 1);
                break;
            }
            i--;
            }


        console.log(RNAStructure.nodeList);
        util.store("RnaNodes",this.nodeList);
    },
    getElementIndex : function(index)
    {
        return  RNAStructure.nodeList[index];
    },
    getElementId : function(id)
    {
        var i = RNAStructure.nodeList.length-1;
        while(i >= 0)
        {
            if(RNAStructure.nodeList[i].id == id)
            {
                return  RNAStructure.nodeList[i];
            }
            i--;
        }
    },
    updateLink : function(id, value)
    {
        var i = RNAStructure.links.length-1;
        while(i >= 0)
        {
            if(RNAStructure.links[i].id == id)
            {
                RNAStructure.links[i].target = value;
            }
            i--;
        }
    },
    validateInput: function(inputValue,elementInfo){
        var position = elementInfo.index;
        if(inputValue == position + 1 || inputValue == position - 1)
        {
            return "bond should be atleast 2 places away";
        }
        else if(inputValue < 0 || inputValue > RNAStructure.nodeList.length-1)
        {
            return "Please enter a position within the length of the search";
        }
        else if(RNAStructure.nodeList[inputValue].bondPosition != null)
        {
            return "Already bonded";
        }
        else
        {
            return true;
        }
    }

};

var util = {
    uuid: function () {
        /*jshint bitwise:false */
        var i, random;
        var uuid = '';
        for (i = 0; i < 32; i++) {
            random = Math.random() * 16 | 0;
            if (i === 8 || i === 12 || i === 16 || i === 20)
            {
                uuid += '-';
            }
            uuid += (i === 12 ? 4 : (i === 16 ? (random & 3 | 8) : random)).toString(16);
        }
        return uuid;
    },
    store: function (namespace, data) {
        if (arguments.length > 1) {
            return sessionStorage.setItem(namespace, JSON.stringify(data));
        } else {
            var store = sessionStorage.getItem(namespace);
            return (store && JSON.parse(store)) || [];
        }
    }
};