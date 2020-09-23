# CrossWidget

A d3.js plugin to generate multiple scented widgets for cross filtering activities.

CrossWidget is based on [D3.js](https://d3js.org/) version 5, and [Crossfilter](https://github.com/crossfilter/crossfilter), a JavaScript library for exploring large multivariate datasets in the browser.
The plugin offers a set of visual scents and set of widgets that can be freely combined by the user to create a *multiple scented widget*, linked to a crossfilter dimension. 

<img alt="radviz" src="https://github.com/aware-diag-sapienza/crosswidget/blob/master/crosswidget.png" width="960">

This is an example of a possible configuration using the Iris dataset. On the right there is the PCA representation of the dataset. On the left, five crosswidgets linked to a dimension of the dataset. See the [online demo](https://aware-diag-sapienza.github.io/crosswidget/) that use CrossWidget. 

A crosswidget is composed of several components, that can be widgets and/or visual scents, placed one on top of the other, vertically aligning their domains, in order to be comparable.

A crosswidget needs a *crossfilter object* and an *accessor function* for the dimension to link the crosswidget to a crossfilter dimension. 

## Installing
In this example we use the Iris dataset; suppose *iris* is the crossfilter object yet created.

```html
<script src="crosswidget.js"></script>
<script>

var iris = crossfilter(...);

</script>
```

An unlimited number of components (visual scents and widgets) can be added to a crosswidget using the function *addComponent*. Components are displayed in the same order in which they are added to the crosswidget. The following code shows how to create the live example of this page.


```javascript
// species
var cwSpecies = d3.crosswidget(iris, function(d){ return d["species"]})
  .paddingOuter(10)
  .addComponent(d3.crosswidgetComponent.frequencyPlot())
  .addComponent(d3.crosswidgetComponent.fixedIntervalsSelector())
 
// sepal-length
var cwSepalLength = d3.crosswidget(iris, function(d){ return d["sepal-length"]})
  .paddingOuter(10)
  .addComponent(d3.crosswidgetComponent.boxplot())
  .addComponent(d3.crosswidgetComponent.sliderSelector())
    
// sepal-width
var cwSepalWidth = d3.crosswidget(iris, function(d){ return d["sepal-width"]})
  .paddingOuter(10)
  .addComponent(d3.crosswidgetComponent.frequencyPlot().bins(20))
  .addComponent(d3.crosswidgetComponent.fixedIntervalsSelector().bins(8).feedback())
     
// petal-length
var cwPetalLength = d3.crosswidget(iris, function(d){ return d["petal-length"]})
  .paddingOuter(10)
  .addComponent(d3.crosswidgetComponent.heatmap())
  .addComponent(d3.crosswidgetComponent.sliderSelector())
    
// petal-width
var cwPetalWidth = d3.crosswidget(iris, function(d){ return d["petal-width"]})
  .paddingOuter(10)
  .addComponent(d3.crosswidgetComponent.violinPlot())
  .addComponent(d3.crosswidgetComponent.fixedIntervalsSelector().feedback())
```

Once the crosswidget has been created, we need to draw it in a container. It appends an svg to the container and creates all the components inside of the svg, fitting the dimension of the container.

```javascript
d3.select("#species")
    .call(cwSpecies);
```

Optional properties for a crosswidjet object:

```javascript
.paddingInner(10)

.paddingTop(10)
.paddingRight(10)
.paddingBottom(10)
.paddingLeft(10)
.paddingOuter(10) // sets top, right, bottom, left

.padding(10) //sets all    
```


## API Reference - Components

The plugin offers in *d3.crosswidgetComponent* a set of visual scents and set of widgets that can be freely combined by the user to create a multiple scented widget, linked to an attribute of the dataset. Widgets and visual scents are placed one on top of the other, vertically aligning their domains, in order to be comparable.

### Visual scents

They are designed to show information of a single attribute concerning all the dataset items and/or only a selection of them, with a continuous or discrete representation. The user can set the visual scent to show information about both dataset and selection or just one of them. %, removing from the scent the visualizations of the undesired part.
When the current selection changes, the parts of the visual scent encoding the selection are automatically updated in order to show the new selected items.
Currently we have implemented the following components:
- *Boxplot*
- *Frequency plot*
- *Heatmap*
- *Violin plot*

#### Boxplot
```javascript
var c = d3.crosswidgetComponent.boxplot()
```

#### Frequency Plot
```javascript
var c = d3.crosswidgetComponent.frequencyPlot()
  .bins(10) //optional - set the number of bins
```

#### Heatmap
```javascript
var c = d3.crosswidgetComponent.heatmap()
  .bins(10) //optional - set the number of bins
  .colorInterpolatorDataset(interp) //optional - set the color interpolator for the dataset visualization (for ex., d3.interpolateGreys)
  .colorInterpolatorSelection(interp) //optional - set the color interpolator for the selection visualization (for ex., d3.interpolateBlues)
```

#### Violin Plot
```javascript
var c = d3.crosswidgetComponent.violinPlot()
```

 All the scents offer the following optional methods:

```javascript
/*
Hides the visualizations that concern the dataset properties.
If fitSelection is True the domain of the selection is enlarged to fit the container width.
*/
c.hideDataset([fitSelection])
/*
Hides the visualizations that concern the current selection properties.
*/
c.hideSelection()
/*
Shows ticks on the bottom of the visual scent.
If tickSize is defined (integer), set the font-size property of the tick. Default 6 px.
*/
c.showTicks([tickSize])
```

### Widgets

These elements are designed to allow filtering activities on attributes of the dataset. Since multiple widgets can be used for an attribute, and on each widget multiple selections are allowed, the query on the attribute is defined as the logical OR among all the selected intervals of the attribute. If no selection is done over an attribute, all the domain is considered selected. The resulting selection on the dataset is defined as the logical AND among all the attribute selections.
Currently we have implemented the following components:
- *Slider selector*
- *Fixed intervals selector*

#### Slider selector
```javascript
var c = sliderSelector()
```

#### Fixed intervals selector
```javascript
var c = fixedIntervalsSelector()
  .bins(10) // optional - sets the number of intervals
  .feedback() // optional - enables the feedback on the current selection
```

## Credits
 Please, if you use this work in your research please cite: 
 > Marco Angelini, Graziano Blasilli, Simone Lenti, Alessia Palleschi and Giuseppe Santucci. 2020. CrossWidgets: Enhancing Complex Data Selections through Modular Multi Attribute Selectors. In Proceedings of the 2020 International Conference on Advanced Visual Interfaces (AVI '20). DOI:https://doi.org/10.1145/3399715.3399918

 

