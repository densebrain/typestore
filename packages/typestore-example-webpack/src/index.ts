///<reference path="../typings/index.d.ts"/>
require('babel-polyfill')
import {runCars} from './ExampleRunCarsWebPack'

window.document.getElementById('body').onload = runCars
