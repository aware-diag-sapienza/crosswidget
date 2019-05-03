;d3.crosswidget = function(crossfilter, dimensionAccessorFunction) {
    
    //crossfilter 
    var dimensionAccessorFunction = dimensionAccessorFunction;
    var crossfilterDimension = crossfilter.dimension(dimensionAccessorFunction);
    var crossfilterDimensionForFiltering = crossfilter.dimension(dimensionAccessorFunction);

    var allNumericalValues = function(){
        var allNumerical = true;
        var data = crossfilter.all().map(dimensionAccessorFunction);
        for(var i=0; i<data.length; i++){
            if (isNaN(Number(data[i]))) {
                allNumerical = false;
                break;
            }
        }
        return allNumerical;
    }();

    
    var componentsList = []; //list of components (scents and widgets)
    var paddingVal = {top:6, right:6, bottom:6, left:6, inner:6};

    // this function is returned when crosswidget() is invoked.
    // it can be invoked on a whole selection by using call() -- see the rest of the example.
    function fn(selection) {
        selection.each(function() {

            componentsList.forEach(function(component, i){
                component.index = i;
                component.crossfilter = crossfilter;
                component.crossfilterDimension = crossfilterDimension;
                component.crossfilterDimensionForFiltering = crossfilterDimensionForFiltering;
                component.dimensionAccessorFunction = dimensionAccessorFunction;
                component.data.allNumericalValues = allNumericalValues;
            });
            
            //svg elements
            var svgWidth = Math.floor(d3.select(this).node().getBoundingClientRect().width);
            var svgHeight = Math.floor(d3.select(this).node().getBoundingClientRect().height);
            
            var svg = d3.select(this).append("svg").attr("class", "crosswidget")
                .style("width", svgWidth + "px")
                .style("height", svgHeight + "px");

            svg.append("defs").html(
                    "<pattern id='stiped-pattern' \
                        width='4' height='4' \
                        patternUnits='userSpaceOnUse' \
                        patternTransform='rotate(45)'> \
                        <rect width='2' height='4' transform='translate(0,0)' pointer-events='none'></rect> \
                    </pattern>"
                );
            
            

            var sizeSum = d3.sum(componentsList, function(d){ return d.size});
            var totalVerticalPadding = (componentsList.length - 1)*paddingVal.inner + paddingVal.top + paddingVal.bottom;
            var hMin = Math.floor((svgHeight -  totalVerticalPadding) / sizeSum);
            

            //components
            componentsList.forEach(function(component, i){
                component.width = svgWidth - paddingVal.left - paddingVal.right;
                component.height = Math.floor(component.size*hMin);
                component.totalHeight = Math.floor(component.height);

                component.translateX = paddingVal.left;
                component.translateY = paddingVal.top;
                if(i != 0) component.translateY += componentsList[i-1].translateY + componentsList[i-1].totalHeight;
                
                component.g = svg.append("g")
                    .attr("class", "crosswidget-component crosswidget-component-" + component.index)
                    .attr("transform", "translate(" + component.translateX + " " + component.translateY + ")");

                if(component.showAxisVal){
                    component.height = component.height - component.axisSizeVal;
                    component.gAxis = component.g.append("g")
                        .attr("class", "axis")
                        .attr("transform", "translate(0 " + component.height + ")");
                }

                if(component.name != undefined) component.g.classed(component.name, true);

                component._init_();

                if(component._update_ != undefined){
                    crossfilter.onChange(function(eventType){
                        component._update_(eventType);
                    });
                }

            });

            componentsList.forEach(function(component, i){
                
            })

            return svg;
        });
    }
    //padding from the borders and among the components
    fn.padding = function(value) {
        if (!arguments.length) return paddingVal;
        var p = (typeof(value) === "function" ? value() : value);
        paddingVal.inner = p;
        paddingVal.top = p;
        paddingVal.right = p;
        paddingVal.bottom = p;
        paddingVal.left = p;
        return fn;
    };
    fn.paddingInner = function(value) {
        if (!arguments.length) return paddingVal.inner;
        paddingVal.inner = (typeof(value) === "function" ? value() : value);
        return fn;
    };
    fn.paddingOuter = function(value) {
        if (!arguments.length) return paddingVal;
        var p = (typeof(value) === "function" ? value() : value);
        paddingVal.top = p;
        paddingVal.right = p;
        paddingVal.bottom = p;
        paddingVal.left = p;
        return fn;
    };
    fn.paddingTop = function(value) {
        if (!arguments.length) return paddingVal.top;
        paddingVal.top = (typeof(value) === "function" ? value() : value);
        return fn;
    };
    fn.paddingRight = function(value) {
        if (!arguments.length) return paddingVal.right;
        paddingVal.right = (typeof(value) === "function" ? value() : value);
        return fn;
    };
    fn.paddingBottom = function(value) {
        if (!arguments.length) return paddingVal.bottom;
        paddingVal.bottom = (typeof(value) === "function" ? value() : value);
        return fn;
    };
    fn.paddingTop = function(value) {
        if (!arguments.length) return paddingVal.left;
        paddingVal.left = (typeof(value) === "function" ? value() : value);
        return fn;
    };

    /**
     * 
     * SET / GET CROSSWIDGET COMPONENT
     * 
     */
    fn.getComponents = function() {
        return componentsList;
    };
    fn.addComponent = function(value, size) {
        var component = (typeof(value) === "function" ? value() : value);
        if(size != undefined) component.size = (typeof(size) === "function" ? size() : size)
        componentsList.push(component);
        return fn;
    };
    
    /**
     * 
     * 
     */
    //reset selections
    fn.reset = function() {
        componentsList.forEach(function(component){
            component.reset();
        })
        return fn;
    };
     /**
     * 
     * 
     * 
     */
    return fn;
};
/*
*
*/
d3.crosswidgetComponent = {
    _basicComponent: class{
        constructor(name){
            this.name = (name==undefined ? undefined : name.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"-").replace(/\s{1,}/g,""));
            this.index = null;
            this.crossfilter = null;
            this.crossfilterDimension = null;
            this.crossfilterDimensionForFiltering = null;
            this.dimensionAccessorFunction = null;
            this.size = 1;
            
            this.hideDatasetVal = false;
            this.hideSelectionVal = false;
            this.fitSelectionVal = false;

            this.feedbackVal = false;

            this.tickSize = null;
            /*
            this.showAxisVal = false;
            this.axisSizeVal = 15;
            this.axisFontSizeVal = 8;
            this.axistickSizeVal = 3;
            */

            this.g = null;
            this.gAxis = null;
            this.scaleX = null;
            
            var that = this;
            function computeDistibution(values){
                values = values.sort(function (a, b) { return a - b });
                if(values.length == 0) return null;
                var dist = {
                    min: d3.min(values),
                    q1: d3.quantile(values, 0.25),
                    median: d3.median(values),
                    q3: d3.quantile(values, 0.75),
                    max: d3.max(values),
                    mean: d3.mean(values),
                    //wMin: d3.quantile(values, 0.02),
                    //wMax: d3.quantile(values, 0.98),
                }
                dist.iqr = dist.q3 - dist.q1;
                dist.wMin = Math.max(dist.q1 - (1.5 * dist.iqr), dist.min);
                dist.wMax =  Math.min(dist.q3 + (1.5 * dist.iqr), dist.max);
                return dist;
            }
            this.data = {
                anyFilterActive: function(){
                    return that.crossfilter.all().length != that.crossfilter.allFiltered().length;
                },
                all: function(){
                    return that.crossfilter.all().map(that.dimensionAccessorFunction);
                },
                allFiltered: function(){
                    return that.crossfilter.allFiltered().map(that.dimensionAccessorFunction);
                },
                minAll: function(){
                    return d3.min(that.crossfilter.all(), that.dimensionAccessorFunction);
                },
                maxAll: function(){
                    return d3.max(that.crossfilter.all(), that.dimensionAccessorFunction);
                },
                extentAll: function(){
                    return d3.extent(that.crossfilter.all(), that.dimensionAccessorFunction);
                },
                minFiltered: function(){
                    return d3.min(that.crossfilter.allFiltered(), that.dimensionAccessorFunction);
                },
                maxFiltered: function(){
                    return d3.max(that.crossfilter.allFiltered(), that.dimensionAccessorFunction);
                },
                extentFiltered: function(){
                    return d3.extent(that.crossfilter.allFiltered(), that.dimensionAccessorFunction);
                },
                distributionAll: function(){
                    return computeDistibution(that.crossfilter.all().map(that.dimensionAccessorFunction))
                },
                distributionFiltered: function(){
                    return computeDistibution(that.crossfilter.allFiltered().map(that.dimensionAccessorFunction))
                },
                allNumericalValues: null,
                filter: function(value){
                    that.crossfilterDimensionForFiltering.filter(value);
                }
            };
        }
        
        reset(){
            this.data.filter(null);
        }
            
                
        hideDataset(fitSelection=false){
            this.hideDatasetVal = true;
            this.fitSelectionVal = (typeof(fitSelection) === "function" ? fitSelection() : fitSelection);
            return this;
        }
            
        hideSelection(){
            this.hideSelectionVal = true;
            return this;
        }
            
        feedback(value){
            this.feedbackVal = (typeof(value) === "function" ? value() : value);
            if(this.feedbackVal == undefined) this.feedbackVal = true;
            return this;
        }

        showTicks(value=6){
            this.tickSize = (typeof(value) === "function" ? value() : value);
            return this;
        }

        _init_(){}
        //_update_(){};
    }
};
/*
*
*
*
*/
d3.crosswidgetComponent.sliderSelector = function(){
    return new class extends d3.crosswidgetComponent._basicComponent{
    constructor(){ 
        super("slider-selector");
        this.brush = null;
        this.brushArea = null;
    }

    reset(){
        super.reset();
        this.brushArea.call(this.brush.move, null);
    }

    
    _init_(){
        var that = this;
        
        if(!that.data.allNumericalValues){
            console.error("SliderSelector cannot be used with not numerical data.");
            return;
        }

        that.scaleX = d3.scaleLinear().domain(that.data.extentAll()).range([0, that.width]);
        var axis = d3.axisBottom().scale(that.scaleX).tickArguments([8]);
        
        that.g.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(" + 0 + " " + Math.floor(that.height/2) + ")")
            .call(axis);
        
        that.brush = d3.brushX().extent([[-2, 0], [that.width+2, that.height]])
            .on("brush end", function(){
                var sel = d3.event.selection;
                if(sel != null) sel = sel.map(that.scaleX.invert);
                that.data.filter(sel)
            });

        that.brushArea = that.g.append("g").attr("class", "brush-area").call(that.brush);
    }
    }
}
/*
*
*
*
*/
d3.crosswidgetComponent.fixedIntervalsSelector = function(){
    return new class extends d3.crosswidgetComponent._basicComponent{
    constructor(){ 
        super("fixed-intervals-selector");
        this.binsNumber = 5;
        this.intervals = [];
        this.intervalSvgElements = null;

        this.cfGroup = null;
        this.cfGroupAll = null;
    }

    reset(){
        super.reset();
        this.intervalSvgElements.classed("selected", false);
        this.intervals.forEach(function(d){ d.selected = false});
    }

    bins(value){
        if (!arguments.length) return this.binsNumber;
        this.binsNumber = (typeof(value) === "function" ? value() : value);
        return this;
    }

    filterFunction(){
        var that = this;
        var allFalse = that.intervals.every(function(d){ return !d.selected});
        if(allFalse) return null;

        if(!that.data.allNumericalValues){
            return function(x){
                return that.intervals.map(function(d){
                    return d.value == x && d.selected;
                }).reduce(function(a,b){ return a || b});
            }
        }
        else{
            return function(x){
                return that.intervals.map(function(d){
                    return x >= d.min && x < d.max && d.selected;
                }).reduce(function(a,b){ return a || b});
            }
        }
    }

    
    _init_(){
        var that = this;
        
        if(!that.data.allNumericalValues){
            
            that.scaleX = d3.scaleBand().domain(that.data.all()).range([0, that.width]).padding(0.05);
            var axis = d3.axisBottom().scale(that.scaleX).tickSizeOuter(0);

            that.g.append("g")
                .attr("class", "axis")
                .attr("transform", "translate(" + 0 + " " + Math.floor((that.height)/2 + 4) + ")")
                .call(axis);
            
            that.scaleX.domain().forEach(function(d){ 
                that.intervals.push({
                    selected: false,
                    value: d,
                    allItems: null,
                    selectedItems: null
                });
            });
           
            that.intervalSvgElements = that.g
                .selectAll(".interval")
                .data(that.intervals)
                .enter()
                .append("rect")
                .attr("class", "interval")
                .attr("x", function(d){ return that.scaleX(d.value)})
                .attr("y", 0)
                .attr("width", that.scaleX.bandwidth())
                .attr("height", Math.floor((that.height)/2))
                .on("click", function(d){
                    d.selected = !d.selected;
                    d3.select(this).classed("selected", d.selected);
                    that.data.filter(that.filterFunction());
                })
               
            if(that.feedbackVal){
                that.cfGroup = that.crossfilterDimension.group(function(d){
                    for(var i=0; i<that.scaleX.domain().length; i++){
                        if(d == that.scaleX.domain()[i]) return i;
                    }
                });

                that.cfGroup.all().forEach(function(d,i){
                    that.intervals[i].allItems = d.value;
                    that.intervals[i].selectedItems = d.value;
                });
            }   
        } //end not numeric
        else{ 
            //numeric
            that.scaleX = d3.scaleLinear().domain(that.data.extentAll()).range([0, that.width]);


            var min = that.scaleX.domain()[0];
            var max = that.scaleX.domain()[1];
            var delta = (max - min) / that.binsNumber;
            var deltaX = (that.scaleX.range()[1] - that.scaleX.range()[0]) / that.binsNumber;
            var ticks = Array(that.binsNumber + 1).fill(0).map(function(d, i){ return (min + delta*i)});
            ticks[0] = min;
            ticks[ticks.length-1] = max;
            

            var axis = d3.axisBottom().scale(that.scaleX).tickValues(ticks).tickSizeOuter(0)//.tickSize(0);
            
            that.g.append("g")
                .attr("class", "axis")
                .attr("transform", "translate(" + 0 + " " + Math.floor((that.height)/2 + 4) + ")")
                .call(axis)
                .selectAll(".tick")
                .each(function(){
                    //d3.select(this).selectAll("line").attr("display", "none");
                });

            that.intervals = ticks.slice(0, ticks.length-1).map(function(d,i){
                return {
                    selected: false,
                    value: d,
                    min: d,
                    max: (i == ticks.length - 2) ? ticks[i+1] +1 : ticks[i+1] 
                }
            });

            that.intervalSvgElements = that.g
                .selectAll(".interval")
                .data(that.intervals)
                .enter()
                .append("rect")
                .attr("class", "interval")
                .attr("x", function(d){ return that.scaleX(d.value)})
                .attr("y", 0)
                .attr("width", deltaX)
                .attr("height", Math.floor((that.height)/2))
                .on("click", function(d){
                    d.selected = !d.selected;
                    d3.select(this).classed("selected", d.selected);
                    that.data.filter(that.filterFunction());
                });

            if(that.feedbackVal){
                that.cfGroup = that.crossfilterDimension.group(function(d){
                    for(var i=0; i<that.intervals.length; i++){
                        if(d >= that.intervals[i].min && d < that.intervals[i].max) return i;
                    }
                });

                that.cfGroup.all().forEach(function(d,i){
                    that.intervals[i].allItems = d.value;
                    that.intervals[i].selectedItems = d.value;
                });
            }

        } 
    }
    
    _update_(){
        var that = this;
        
        //feedback
        if(that.feedbackVal){
            that.cfGroup.all().forEach(function(d,i){
                that.intervals[i].selectedItems = d.value;
            });
            if(that.data.anyFilterActive()){
                that.intervalSvgElements
                    .classed("feedback-full", function(d){ return d.allItems == d.selectedItems && d.allItems > 0})
                    .classed("feedback-partial", function(d){ return d.selectedItems > 0 && d.allItems != d.selectedItems})
                    .classed("feedback-empty", function(d){ return d.allItems == 0 ||  d.selectedItems == 0})
            }
            else{
                that.intervalSvgElements
                    .classed("feedback-full", false)
                    .classed("feedback-partial", false)
                    .classed("feedback-empty", false)
            }
        }
        // end feedback
    }
    }
}
/*
*
*
*
*/
d3.crosswidgetComponent.boxplot = function(){
return new class extends d3.crosswidgetComponent._basicComponent{
    constructor(){ 
        super("boxplot");

        this.paddingVal = 2;
        this.boxHeight = null;
        this.wiskerHeightPercentage = 0.75;
        this.wiskerHeight = null;
        
        this.gBoxplotDataset = null;
        this.gBoxplotSelection = null;

        this.boxplotDataset = null;
        this.boxplotSelection = null;

        this.scaleDataset = null;
        this.scaleSelection = null;

        this.tickSize = null;
    }


    _init_(){
        var that = this;

        if(!that.data.allNumericalValues){
            console.error("Boxplot cannot be used with not numerical data.");
            return;
        }

        that.scaleDataset = d3.scaleLinear().domain(that.data.extentAll()).range([0, that.width]);
        that.scaleSelection = d3.scaleLinear().domain(that.data.extentFiltered()).range([0, that.width]);

        if(that.hideDatasetVal && that.hideSelectionVal) return;
        if(!that.hideDatasetVal && !that.hideSelectionVal){
            that.boxHeight = Math.floor((that.height - that.paddingVal)/2);
            that.wiskerHeight = Math.floor(that.wiskerHeightPercentage*that.boxHeight);
            that.gBoxplotDataset = that.g.append("g")
                .attr("class", "dataset");
            that.gBoxplotSelection = that.g.append("g")
                .attr("class", "selection")
                .attr("transform", "translate(0 " + " " + (that.boxHeight + that.paddingVal) + ")");
        }
        else if(that.hideDatasetVal){
            that.boxHeight = that.height;
            that.wiskerHeight = Math.floor(that.wiskerHeightPercentage*that.boxHeight);
            that.gBoxplotSelection = that.g.append("g")
                .attr("class", "selection"); 
        }
        else if(that.hideSelectionVal){
            that.boxHeight = that.height;
            that.wiskerHeight = Math.floor(that.wiskerHeightPercentage*that.boxHeight);
            that.gBoxplotDataset = that.g.append("g")
                .attr("class", "dataset");
        }

        if(that.tickSize != null){
            that.boxHeight = that.boxHeight - that.tickSize;
        }

        var datasetDistribution = that.data.distributionAll();
  
        that.boxplotDataset = {
            box: null,
            median: null,
            minWisker: null,
            maxWisker: null,
            hLineMin: null,
            hLineMax: null,
            ticks: null
        };

        that.boxplotSelection = {
            box: null,
            median: null,
            minWisker: null,
            maxWisker: null,
            hLineMin: null,
            hLineMax: null,
            ticks: null
        };

        var subcomponents = [];
        if(!that.hideDatasetVal) subcomponents.push({
            boxplot: that.boxplotDataset,
            g: that.gBoxplotDataset
        });
        if(!that.hideSelectionVal) subcomponents.push({
            boxplot: that.boxplotSelection,
            g: that.gBoxplotSelection
        });

        subcomponents.forEach(function(c){
            
            c.boxplot.box = c.g.append("rect")
                .attr("class", "box")
                .attr("y", 0)
                .attr("height", that.boxHeight)
                .attr("x", that.scaleDataset(datasetDistribution.q1))
                .attr("width", that.scaleDataset(datasetDistribution.q3) - that.scaleDataset(datasetDistribution.q1));
                
            c.boxplot.median = c.g.append("line")
                .attr("class", "median")
                .attr("y1", 0)
                .attr("y2", that.boxHeight)
                .attr("x1", Math.floor(that.scaleDataset(datasetDistribution.median)))
                .attr("x2", Math.floor(that.scaleDataset(datasetDistribution.median)));
                
            c.boxplot.minWisker = c.g.append("line")
                .attr("class", "wisker wisker-min")
                .attr("y1", Math.floor( (that.boxHeight - that.wiskerHeight) / 2 ) )
                .attr("y2", that.wiskerHeight + Math.floor( (that.boxHeight - that.wiskerHeight) / 2 ))
                .attr("x1", Math.floor(that.scaleDataset(datasetDistribution.wMin)))
                .attr("x2", Math.floor(that.scaleDataset(datasetDistribution.wMin)));

            c.boxplot.maxWisker = c.g.append("line")
                .attr("class", "wisker wisker-max")
                .attr("y1", Math.floor( (that.boxHeight - that.wiskerHeight) / 2 ) - 1)
                .attr("y2", that.wiskerHeight + Math.floor( (that.boxHeight - that.wiskerHeight) / 2 ))
                .attr("x1", Math.floor(that.scaleDataset(datasetDistribution.wMax)))
                .attr("x2", Math.floor(that.scaleDataset(datasetDistribution.wMax)));

            c.boxplot.hLineMin = c.g.append("line")
                .attr("class", "hline hline-min")
                .attr("y1", Math.floor( that.boxHeight / 2 ))
                .attr("y2", Math.floor( that.boxHeight / 2 ))
                .attr("x1", Math.floor(that.scaleDataset(datasetDistribution.wMin)))
                .attr("x2", Math.floor(that.scaleDataset(datasetDistribution.q1)));

            c.boxplot.hLineMax = c.g.append("line")
                .attr("class", "hline hline-max")
                .attr("y1", Math.floor( that.boxHeight / 2 ))
                .attr("y2", Math.floor( that.boxHeight / 2 ))
                .attr("x1", Math.floor(that.scaleDataset(datasetDistribution.q3)))
                .attr("x2", Math.floor(that.scaleDataset(datasetDistribution.wMax)));
                
            
            if(that.tickSize != null){
                var ticksAxis = d3.axisBottom().scale(that.scaleDataset)
                    .tickValues(["wMin", "q1", "median", "q3", "wMax"].map(function(d){ return datasetDistribution[d]}))
                    .tickSize(0)
                    .tickPadding(1)

             
                c.boxplot.ticks = c.g.append("g")
                    .attr("class", "axis")
                    .attr("transform", "translate(0 " + (that.boxHeight ) + ")")
                    .call(ticksAxis)
                    .attr("font-size", that.tickSize)
            }
        });
    }

    _update_(){
        var that = this;
        if(!that.data.allNumericalValues) return;

        var distributionFiltered = that.data.distributionFiltered();

        if(distributionFiltered == null){
            that.gBoxplotSelection.style("display", "none");
            return;
        }
            
        that.gBoxplotSelection.style("display", null);

        if(that.fitSelectionVal){
            that.scaleSelection.domain([distributionFiltered.min, distributionFiltered.max]);
        }

        that.boxplotSelection.box
            .attr("x", that.scaleSelection(distributionFiltered.q1))
            .attr("width", that.scaleSelection(distributionFiltered.q3) - that.scaleSelection(distributionFiltered.q1));
            
        that.boxplotSelection.median
            .attr("x1", Math.floor(that.scaleSelection(distributionFiltered.median)))
            .attr("x2", Math.floor(that.scaleSelection(distributionFiltered.median)));

        that.boxplotSelection.minWisker
            .attr("x1", Math.floor(that.scaleSelection(distributionFiltered.wMin)))
            .attr("x2", Math.floor(that.scaleSelection(distributionFiltered.wMin)));

        that.boxplotSelection.maxWisker
            .attr("x1", Math.floor(that.scaleSelection(distributionFiltered.wMax)))
            .attr("x2", Math.floor(that.scaleSelection(distributionFiltered.wMax)));

        that.boxplotSelection.hLineMin
            .attr("x1", Math.floor(that.scaleSelection(distributionFiltered.wMin)))
            .attr("x2", Math.floor(that.scaleSelection(distributionFiltered.q1)));

        that.boxplotSelection.hLineMax
            .attr("x1", Math.floor(that.scaleSelection(distributionFiltered.q3)))
            .attr("x2", Math.floor(that.scaleSelection(distributionFiltered.wMax)));

        
        if(that.tickSize != null){
            var ticksAxis = d3.axisBottom().scale(that.scaleSelection)
                .tickValues(["wMin", "q1", "median", "q3", "wMax"].map(function(d){ return distributionFiltered[d]}))
                .tickSize(0)
                .tickPadding(1)

            that.boxplotSelection.ticks.call(ticksAxis)
        }
    }
}
}
/*
*
*
*
*/
d3.crosswidgetComponent.violinPlot = function(){
    return new class extends d3.crosswidgetComponent._basicComponent{
    constructor(){ 
        super("violin-plot");
        this.scaleY = null;
        this.line = null;
        this.selectionAreaTop = null;
        this.selectionAreaBottom = null;
        this.cfGroup = null;
    }

    kernelDensityEstimator(kernel, X) {
        return function(V) {
          return X.map(function(x) {
            return [x, d3.mean(V, function(v) { return kernel(x - v); })];
          });
        };
    }
      
    kernelEpanechnikov(k) {
        return function(v) {
          return Math.abs(v /= k) <= 1 ? 0.75 * (1 - v * v) / k : 0;
        };
    }

    density(){
        var that = this;

        if(that.data.allNumericalValues){
            var density = that.kernelDensityEstimator(that.kernelEpanechnikov(1), that.scaleX.ticks(Math.floor(that.width/5)))(that.data.allFiltered());
            density[0][1] = 0
            density[density.length - 1][1] = 0;
            if(density == undefined || density[0][1] == undefined) return undefined;
            return density;
        }
        else{
            if(that.cfGroup == null){
                that.cfGroup = that.crossfilterDimension.group(function(d){
                    for(var i=0; i<that.scaleX.domain().length; i++){
                        if(d == that.scaleX.domain()[i]) return i;
                    }
                });
            }
            var density = [[0,0]];
            that.cfGroup.all().forEach(function(d, i){
                density.push([
                    that.scaleX(that.scaleX.domain()[i]),
                    d.value
                ]);
                density.push([
                    that.scaleX(that.scaleX.domain()[i]) + that.scaleX.bandwidth(),
                    d.value
                ]);
            });
            density.push([density[density.length-1][0],0]);
            return density;
        }
        
    }

    
    _init_(){
        var that = this;

        if(that.tickSize != null){
            that.height = that.height - that.tickSize;
        }

        var density = null;

        if(that.data.allNumericalValues){

            that.scaleX = d3.scaleLinear()
                .domain(that.data.extentAll())
                .range([0, that.width]);
            
            density = that.density();

            that.scaleY = d3.scaleLinear()
                .domain(d3.extent(density, function(d){ return d[1]}))
                .range([that.height/2, 0]);

            that.line = d3.line()
                .curve(d3.curveBasis)
                .x(function(d){ return that.scaleX(d[0]) })
                .y(function(d){ return that.scaleY(d[1]) });
        }
        else{

            that.scaleX = d3.scaleBand()
                    .domain(that.data.all())
                    .rangeRound([0, that.width])
                    .padding(0);

            density = that.density();
            
            that.scaleY = d3.scaleLinear()
                .domain(d3.extent(density, function(d){ return d[1]}))
                .range([that.height/2, 0]);

            that.line = d3.line()
                .curve(d3.curveStep)
                .y(function(d){ return that.scaleY(d[1]) });
        }

        if(!that.hideDatasetVal){
            var gDataset = that.g.append("g").attr("class", "dataset");
            gDataset.append("path")
                .datum(density)
                .attr("class", "top")
                .attr("d",  that.line);
        
            gDataset.append("path")
                .datum(density)
                .attr("class", "bottom")
                .attr("d",  that.line)
                .attr("transform", "translate(0, " + that.height + ") scale(1, -1)")  
        }

        if(!that.hideSelectionVal){
            var gSelection = that.g.append("g").attr("class", "selection");
            that.selectionAreaTop = gSelection.append("path")
                .datum(density)
                .attr("class", "top")
                .attr("d",  that.line);
                
            that.selectionAreaBottom = gSelection.append("path")
                .datum(density)
                .attr("class", "bottom")
                .attr("d",  that.line)
                .attr("transform", "translate(0, " + that.height + ") scale(1, -1)")
        }
       
        that.g.append("line")
            .attr("class", "hline")
            .attr("x1", 0)
            .attr("y1", that.height/2)
            .attr("x2", that.width)
            .attr("y2", that.height/2);

        if(that.tickSize != null){
            var ticksAxis = d3.axisBottom().scale(that.scaleX)
                .tickSize(3)
                .tickPadding(1)

            that.g.append("g")
                .attr("class", "axis")
                .attr("transform", "translate(0 " + (that.height) + ")")
                .call(ticksAxis)
                .attr("font-size", that.tickSize)
        }
    }

    _update_(){
        var that = this;
        if(that.hideSelectionVal) return;

        var density = that.density();
        if(density == undefined) return;
        that.scaleY.domain(d3.extent(density, function(d){ return d[1]}));
        that.line.y(function(d) { return that.scaleY(d[1]); });
        that.selectionAreaTop.attr("d",  function(){ return that.line(density)});
        that.selectionAreaBottom.attr("d",  function(){ return that.line(density)});

    }
    }
}
/*
*
*
*
*/
d3.crosswidgetComponent.frequencyPlot = function(){
    return new class extends d3.crosswidgetComponent._basicComponent{
    constructor(){ 
        super("frequency-plot");

        this.binsNumber = null;
        this.scaleY = null;
        this.scaleBin = null;
        this.barHeight = null;
        this.gHeatmapDataset = null;
        this.gHeatmapSelection = null;
        this.groupsData = null;
    }

    bins(value){
        if (!arguments.length) return this.binsNumber;
        this.binsNumber = (typeof(value) === "function" ? value() : value);
        return this;
    }

    groups(){
        var that = this;
        if(that.data.allNumericalValues){
            if(that.scaleBin == null){
                that.scaleBin = d3.scaleQuantize()
                .domain(that.data.extentAll())
                .range(Array(that.binsNumber).fill(0).map(function(d,i){
                    return i;
                }));
            }
            
            var tmpGroup = that.crossfilterDimension.group(function(d){
                    return that.scaleBin(d);
                });

            that.groupsData = Array(that.binsNumber).fill(0);
            tmpGroup.all().forEach(function(d){
                that.groupsData[d.key] = d.value;
            });
            return that.groupsData;
        }
        else{
            if(that.groupsData == null){
                that.groupsData = that.crossfilterDimension.group(function(d){
                    for(var i=0; i<that.scaleX.domain().length; i++){
                        if(d == that.scaleX.domain()[i]) return i;
                    }
                });
            }
            return that.groupsData.all();
        }
    }

    _init_(){
        var that = this;

        if(that.tickSize != null){
            that.height = that.height - that.tickSize;
        }

        that.barHeight = that.height;

        if(that.hideDatasetVal && that.hideSelectionVal) return;
        
        if(!that.hideDatasetVal){
            that.gHeatmapDataset = that.g.append("g")
                .attr("class", "dataset");
        }
        if(!that.hideSelectionVal ){
            that.gHeatmapSelection = that.g.append("g")
                .attr("class", "selection");
        }

        if(that.binsNumber == null){
            that.binsNumber = Math.floor(that.width/ 20);
        }
        that.binsNumber = Math.min(that.binsNumber, that.width);

        if(that.data.allNumericalValues){
    
            that.scaleX = d3.scaleBand()
                .rangeRound([0, that.width])
                .domain(Array(that.binsNumber).fill(0).map(function(d,i){
                    return i;
                }))
                .padding(0.08);
            
            var groups = that.groups();

            that.scaleY = d3.scaleLinear()
                .domain([0, d3.max(groups)])
                .range([that.barHeight, 0]);

            if(!this.hideDatasetVal){
                that.rects = that.gHeatmapDataset
                    .selectAll("rect")
                    .data(groups)
                    .enter()
                    .append("rect")
                    .attr("x", function(d, i) { return that.scaleX(i) })
                    .attr("width", that.scaleX.bandwidth() )
                    .attr("y", function(d){ return Math.floor(that.scaleY(d))})
                    .attr("height", function(d){ return Math.max(0, that.barHeight -  Math.floor(that.scaleY(d)))});
            }

            if(!this.hideSelectionVal){
                that.rectsSelection = that.gHeatmapSelection
                    .selectAll("rect")
                    .data(groups)
                    .enter()
                    .append("rect")
                    .attr("x", function(d, i) { return that.scaleX(i) })
                    .attr("width", that.scaleX.bandwidth() )
                    .attr("y", function(d){ return Math.floor(that.scaleY(d))})
                    .attr("height", function(d){ return Math.max(0, that.barHeight -  Math.floor(that.scaleY(d)))});
            }
        }
        else{
            that.scaleX = d3.scaleBand()
                .domain(that.data.all())
                .rangeRound([0, that.width])
                .padding(0.08);

            var groups = that.groups();
            
            that.scaleY = d3.scaleLinear()
                .domain([0, d3.max(groups, function(d){ return d.value})])
                .range([that.barHeight, 0]);

            if(!this.hideDatasetVal){
                that.rects = that.gHeatmapDataset
                    .selectAll("rect")
                    .data(groups.map(function(d,i){ return {key: that.scaleX.domain()[i], value: d.value}}))
                    .enter()
                    .append("rect")
                    .attr("class", "interval")
                    .attr("x", function(d){ return that.scaleX(d.key)})
                    .attr("width", that.scaleX.bandwidth())
                    .attr("y", function(d){ return Math.floor(that.scaleY(d.value))})
                    .attr("height", function(d){ return Math.max(0, that.barHeight -  Math.floor(that.scaleY(d.value)))});
            }
    
            if(!this.hideSelectionVal){
                that.rectsSelection = that.gHeatmapSelection
                    .selectAll("rect")
                    .data(groups.map(function(d,i){ return {key: that.scaleX.domain()[i], value: d.value}}))
                    .enter()
                    .append("rect")
                    .attr("class", "interval")
                    .attr("x", function(d){ return that.scaleX(d.key)})
                    .attr("width", that.scaleX.bandwidth())
                    .attr("y", function(d){ return Math.floor(that.scaleY(d.value))})
                    .attr("height", function(d){ return Math.max(0, that.barHeight -  Math.floor(that.scaleY(d.value)))});
    
            }
        }
        
        if(that.tickSize != null){
            var ticksAxis = d3.axisBottom().tickSize(3).tickPadding(1);
            if(that.data.allNumericalValues) ticksAxis.scale(d3.scaleLinear().domain(that.data.extentAll()).range([0, that.width]))
            else ticksAxis.scale(that.scaleX)
                
            that.g.append("g")
                .attr("class", "axis")
                .attr("transform", "translate(0 " + (that.height) + ")")
                .call(ticksAxis)
                .attr("font-size", that.tickSize)
        }
    }

    _update_(){
        var that = this;
        if(that.hideSelectionVal) return;
        var groups = that.groups();
        
        if(that.data.allNumericalValues){
            that.rectsSelection
                    .data(groups)
                    .attr("y", function(d){ return Math.floor(that.scaleY(d))})
                    .attr("height", function(d){ return Math.max(0, that.barHeight -  Math.floor(that.scaleY(d)))});
                    
        }
        else{
            that.rectsSelection
                .data(groups.map(function(d,i){ return {key: that.scaleX.domain()[i], value: d.value}}))
                .attr("y", function(d){ return Math.floor(that.scaleY(d.value))})
                .attr("height", function(d){ return Math.max(0, that.barHeight -  Math.floor(that.scaleY(d.value)))});
                
        }
    }
}
}
/*
*
*
*
*/
d3.crosswidgetComponent.heatmap = function(){
    return new class extends d3.crosswidgetComponent._basicComponent{
    constructor(){ 
        super("heatmap");

        this.binsNumber = null;

        this.cfGroup = null;
        this.scaleBin = null;
        
        this.barHeight = null;
        this.gHeatmapDataset = null;
        this.gHeatmapSelection = null;

        this.colorInterpolatorDatasetVal = d3.interpolateGreys;
        this.colorInterpolatorSelectionVal = d3.interpolateBlues;

        this.groupsData = null;
    }

    bins(value){
        if (!arguments.length) return this.binsNumber;
        this.binsNumber = (typeof(value) === "function" ? value() : value);
        return this;
    }

    colorInterpolatorDataset(value){
        this.colorInterpolatorDatasetVal = value;
        return this;
    }

    colorInterpolatorSelection(value){
        this.colorInterpolatorSelectionVal = value;
        return this;
    }


    groups(){
        var that = this;
        if(that.data.allNumericalValues){
            if(that.scaleBin == null){
                that.scaleBin = d3.scaleQuantize()
                .domain(that.data.extentAll())
                .range(Array(that.binsNumber).fill(0).map(function(d,i){
                    return i;
                }));
            }
            
            var tmpGroup = that.crossfilterDimension.group(function(d){
                    return that.scaleBin(d);
                });

            that.groupsData = Array(that.binsNumber).fill(0);
            tmpGroup.all().forEach(function(d){
                that.groupsData[d.key] = d.value;
            });
            return that.groupsData;
        }
        else{
            if(that.groupsData == null){
                that.groupsData = that.crossfilterDimension.group(function(d){
                    for(var i=0; i<that.scaleX.domain().length; i++){
                        if(d == that.scaleX.domain()[i]) return i;
                    }
                });
            }
            return that.groupsData.all();
        }
    }

    _init_(){
        var that = this;

        if(that.tickSize != null){
            that.height = that.height - that.tickSize;
        }

        if(that.hideDatasetVal && that.hideSelectionVal) return;
        if(!that.hideDatasetVal && !that.hideSelectionVal){
            that.barHeight = Math.floor(that.height/2);
            that.gHeatmapDataset = that.g.append("g")
                .attr("class", "dataset");
            that.gHeatmapSelection = that.g.append("g")
                .attr("transform", "translate(0 " + " " + (that.barHeight) + ")")
                .attr("class", "heatmap-selection");
            }
        else if(that.hideDatasetVal){
            that.barHeight = that.height;
            that.gHeatmapSelection = that.g.append("g")
                .attr("class", "selection");
        }
        else if(that.hideSelectionVal){
            that.barHeight = that.height;
            that.gHeatmapDataset = that.g.append("g")
                .attr("class", "dataset");
        }

        if(that.binsNumber == null){
            that.binsNumber = Math.floor(that.width/ 20);
        }
        that.binsNumber = Math.min(that.binsNumber, that.width);

        that.colorDataset = d3.scaleSequential(that.colorInterpolatorDatasetVal);
        that.colorSelection = d3.scaleSequential(that.colorInterpolatorSelectionVal);


        if(that.data.allNumericalValues){
    
            that.scaleX = d3.scaleBand()
                .rangeRound([0, that.width])
                .domain(Array(that.binsNumber).fill(0).map(function(d,i){
                    return i;
                }));
            
            var groups = that.groups();
            that.colorDataset.domain([0, d3.max(groups)]);
            that.colorSelection.domain([0, d3.max(groups)]);
            
            if(!this.hideDatasetVal){
                that.rects = that.gHeatmapDataset
                    .selectAll("rect")
                    .data(groups)
                    .enter()
                    .append("rect")
                    .attr("x", function(d, i) { return that.scaleX(i) })
                    .attr("width", that.scaleX.bandwidth() )
                    .attr("y", 0)
                    .attr("height", that.barHeight)
                    .attr("fill", function(d){ return that.colorDataset(d)});
            }

            if(!this.hideSelectionVal){
                that.rectsSelection = that.gHeatmapSelection
                    .selectAll("rect")
                    .data(groups)
                    .enter()
                    .append("rect")
                    .attr("x", function(d, i) { return that.scaleX(i) })
                    .attr("width", that.scaleX.bandwidth() )
                    .attr("y", 0)
                    .attr("height", that.barHeight )
                    .attr("fill", function(d){ return that.colorSelection(d)});
            }
        }
        else{
            that.scaleX = d3.scaleBand()
                .domain(that.data.all())
                .rangeRound([0, that.width])
                .padding(0.08);

            var groups = that.groups();
            that.colorDataset.domain([0, d3.max(groups, function(d){ return d.value})]);
            that.colorSelection.domain([0, d3.max(groups, function(d){ return d.value})]);


            if(!this.hideDatasetVal){
                that.rects = that.gHeatmapDataset
                    .selectAll("rect")
                    .data(groups.map(function(d,i){ return {key: that.scaleX.domain()[i], value: d.value}}))
                    .enter()
                    .append("rect")
                    .attr("class", "interval")
                    .attr("x", function(d){ return that.scaleX(d.key)})
                    .attr("width", that.scaleX.bandwidth())
                    .attr("y", 0)
                    .attr("height", that.barHeight)
                    .attr("fill", function(d){ return that.colorDataset(d.value)});
            }
    
            if(!this.hideSelectionVal){
                that.rectsSelection = that.gHeatmapSelection
                    .selectAll("rect")
                    .data(groups.map(function(d,i){ return {key: that.scaleX.domain()[i], value: d.value}}))
                    .enter()
                    .append("rect")
                    .attr("class", "interval")
                    .attr("x", function(d){ return that.scaleX(d.key)})
                    .attr("width", that.scaleX.bandwidth())
                    .attr("y", 0)
                    .attr("height",that.barHeight)
                    .attr("fill", function(d){ return that.colorSelection(d.value)});
    
            }
        }

        if(that.tickSize != null){
            var ticksAxis = d3.axisBottom().tickSize(3).tickPadding(1);
            if(that.data.allNumericalValues) ticksAxis.scale(d3.scaleLinear().domain(that.data.extentAll()).range([0, that.width]))
            else ticksAxis.scale(that.scaleX)
                
            that.g.append("g")
                .attr("class", "axis")
                .attr("transform", "translate(0 " + (that.height) + ")")
                .call(ticksAxis)
                .attr("font-size", that.tickSize)
        }
    }

    _update_(){
        var that = this;
        if(that.hideSelectionVal) return;
        var groups = that.groups();
        
        if(that.data.allNumericalValues){
            that.rectsSelection
                    .data(groups)
                    .attr("fill", function(d){ return that.colorSelection(d)});
        }
        else{
            that.rectsSelection
                .data(groups.map(function(d,i){ return {key: that.scaleX.domain()[i], value: d.value}}))
                .attr("fill", function(d){ return that.colorSelection(d.value)});
        }
    }
}
}
/*
*
*
*
*/
d3.crosswidgetComponent.test = function(){
    return new class extends d3.crosswidgetComponent._basicComponent{
    constructor(){ 
        super("test");
    }

    reset(){
        super.reset();
    }

    
    _init_(){
        
    } 

    _update_(){

    }
}
}