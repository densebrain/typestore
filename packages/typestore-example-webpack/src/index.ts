/// <reference path="../typings/typestore-example-webpack.d.ts"/>
require('babel-polyfill')
import {runCars} from './ExampleRunCarsWebPack'

window.document.getElementById('body').onload = runCars