Aquaponics - Data Science
=============

####Aquaponics Slideshow

This slideshow demonstrates the processes of the aquaponics tank.

Within js/main.js, the top four lines have been reserved for easily changing the following in seconds:

- The duration of data visualization staying on the screen (graphTransitionTime)
- The duration of each slide staying on the screen (slideTransitionTime)
- The duration it takes to fade in and out between each slide (fadeTime)

####Aquaponics Data Visualization

The visualizations represent five sensor data:

- pH
- Water Temperature
- Electrical Conductivity
- Humidity
- Air temperature

This data is received from sensors in the tank itself which is then sent to a serial port on an arduino, which is then sent to an SQL database. It is then retrieved by the front end code within graph.js to be delivered onto the d3.js visualizations.

The graphs are generated independently with the following five variables to configure each graph:

- Position of the graph (1-5)
- The dataset (including sensor values and measurement times)
- Header content (sensor type)
- Subheader content (units of measurements)
- Line path color