# Caipy Dashboard

[![Build Status](https://travis-ci.org/bertrandmartel/caipy-dashboard.svg?branch=master)](https://travis-ci.org/bertrandmartel/caipy-dashboard)
[![License](http://img.shields.io/:license-mit-blue.svg)](LICENSE.md)

A ReactJS powered material dashboard featuring Ad detection in TV programs from an external API from [Caipy](http://www.caipy.com/)

### [Live Application](http://bertrandmartel.github.io/caipy-dashboard)

The aim is to calculate program startover time in 2 distinct mode :

* with advertisement
* without advertisement

Both algorithm are detailed in a flowchart with the specific path taken to compute the startover time  

[![dashboard](https://user-images.githubusercontent.com/5183022/30557997-4f56be1a-9cb0-11e7-9b9b-a711c713703f.png)](http://bertrandmartel.github.io/caipy-dashboard)

Selection filters available :

* date (start/end)
* preset (used to aggregate/disaggregate ad)
* TV channel
* mode (with & without ad)

[![flowchart](https://user-images.githubusercontent.com/5183022/30558124-b89581d6-9cb0-11e7-9a33-cc5ce5fe1f9b.png)](http://bertrandmartel.github.io/caipy-dashboard)

This project is using :

* [React](https://github.com/facebook/react)
* [Material UI](https://github.com/callemall/material-ui)
* [vis](https://github.com/almende/vis)
* [flowchart.js](https://github.com/adrai/flowchart.js)
* [React infinite calendar](https://github.com/clauderic/react-infinite-calendar)
* [moment](https://github.com/moment/moment)
* [moment duration format](https://github.com/jsmreese/moment-duration-format)
* [React numeric input](https://github.com/vlad-ignatov/react-numeric-input)

This project has been created using [create-react-app](https://github.com/facebookincubator/create-react-app)

### Docker

Modify `homepage` field from `package.json` to match the target host :

* build

```
docker build . -t caipy-dashboard
```

* run

```
docker run -p 5000:5000 caipy-dashboard
```

## License

The MIT License (MIT) Copyright (c) 2017 Bertrand Martel
