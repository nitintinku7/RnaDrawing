jQuery(function ($) {
    var App = {
        StringValue : '',
        init : function(){

                this.bindEvents();
                $('.nodesArea').hide();

        },
        bindEvents : function(){

            $('#new-search').on('keyup','#new-substring',this.createStruct.bind(this));
            $('#formInput').on('submit',this.validate.bind(this));
        },

        validate :function(e){

            var pattern =/^['A'|'C'|'G'|'U'|'X'|'Y'|'a'|'c'|'g'|'u'|'x'|'y']+$/;
            if( this.StringValue== "" || this.StringValue.length < 20 || this.StringValue.length > 200)
            {
                $('#new-substring').val("");
                $('#searchError').text( "PLease enter a string with length between 20 and 200 characters only " );
                $('#formInput').focus() ;

                return false;
            }
            if(!pattern.test(this.StringValue))
            {
                $('#searchError').text( "Please enter valid characters only " );
                $('#formInput').focus() ;
                return false;
            }
            else
            {
                $('#new-search').hide(800);

                this.makeNodes(this.StringValue);

            }

        },
        createStruct : function(e){
            var $inputEntered = $(e.target);
            this.StringValue = $inputEntered.val().trim();
        },

        makeNodes : function (StringValue) {
            var width = null;
            var height = null;
            var radius = null;
            var pageWidth = $(window).width();
            var pageHeight = $(window).height();
            var margin = {top: 20, right: 20, bottom: 20, left: 20},
                width = pageWidth - margin.left - margin.right,
                height = pageHeight - (margin.top + margin.bottom);
            $('.nodesArea').show(800);
            var numNodes = StringValue.length;
            radius = 4 * StringValue.length;
            width = (radius * 2) + 25;
            height = (radius * 2) + 25;
            var angle, x, y, i;
            for (i = 0; i < numNodes; i++) {
                angle = (i / (numNodes / 2)) * Math.PI; // Calculate the angle at which the element will be placed.
                // For a semicircle, we would use (i / numNodes) * Math.PI.
                x = (pageWidth/8) + (radius * Math.cos(angle)) + (width / 2); // Calculate the x position of the element.
                y = (pageHeight/4) + (radius * Math.sin(angle)) + (width / 2); // Calculate the y position of the element.
                var Id = util.uuid();
                var textValue = StringValue[i];
                RNAStructure.add(x, y, Id, i, textValue);
            }
            makeLinks();
            debugger;
            renderStructure();

        }

    };


    App.init();
});
var makeLinks = function(){
    var element = util.store("RnaNodes");
    for(var i = 0; i < element.length-1; i++)
    {
        var id = util.uuid();
        var j = i + 1;
        var source = element[i].id;
        var target = element[j].id;
        RNAStructure.addLinks(source,target,id);
    }
}