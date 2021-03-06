"use strict";

var $ = require('jquery'),
    lodash = require('lodash'),
    Backbone = require('../../shim/backbone'),
    settings = require('../core/settings'),
    utils = require('../core/utils'),
    coreModels = require('../core/models'),
    turfArea = require('turf-area');

var LayerModel = Backbone.Model.extend({});

// Each layer returned from the analyze endpoint.
// Land, soil, etc.
var LayerCollection = Backbone.Collection.extend({
    url: '/api/',
    model: LayerModel
});

// Each category that makes up the areas of each layer
var LayerCategoryCollection = Backbone.Collection.extend({

});

var AnalyzeTaskModel = coreModels.TaskModel.extend({
    defaults: lodash.extend( {
            name: 'analysis',
            displayName: 'Analysis',
            area_of_interest: null,
            wkaoi: null,
            taskName: 'analyze',
            taskType: 'api',
            token: settings.get('api_token')
        }, coreModels.TaskModel.prototype.defaults
    ),

    /**
     * Returns a promise that completes when Analysis has been fetched. If
     * fetching is not required, returns an immediatley resolved promise.
     */
    fetchAnalysisIfNeeded: function() {
        var self = this,
            aoi = self.get('area_of_interest'),
            wkaoi = self.get('wkaoi'),
            result = self.get('result');

        if (aoi && !result && self.fetchAnalysisPromise === undefined) {
            var gaEvent = self.get('name') + '-analyze',
                gaLabel = utils.isInDrb(aoi) ? 'drb-aoi' : 'national-aoi',
                gaAoiSize = turfArea(aoi) / 1000000;
            window.ga('send', 'event', 'Analyze', gaEvent, gaLabel, parseInt(gaAoiSize));

            var isWkaoi = utils.isWKAoIValid(wkaoi),
                taskHelper = {
                    contentType: 'application/json',
                    queryParams: isWkaoi ? { wkaoi: wkaoi } : null,
                    postData: isWkaoi ? null : JSON.stringify(aoi)
                },
                promises = self.start(taskHelper);

            self.fetchAnalysisPromise = $.when(promises.startPromise,
                                               promises.pollingPromise);
            self.fetchAnalysisPromise
                .always(function() {
                    delete self.fetchAnalysisPromise;
                });
        }

        return self.fetchAnalysisPromise || $.when();
    }
});

var AnalyzeTaskCollection = Backbone.Collection.extend({
    model: AnalyzeTaskModel
});

function createAnalyzeTaskCollection(aoi, wkaoi) {
    var tasks = [
        {
            name: "land",
            displayName: "Land",
            area_of_interest: aoi,
            wkaoi: wkaoi,
            taskName: "analyze/land"
        },
        {
            name: "soil",
            displayName: "Soil",
            area_of_interest: aoi,
            wkaoi: wkaoi,
            taskName: "analyze/soil"
        },
        {
            name: "climate",
            displayName: "Climate",
            area_of_interest: aoi,
            wkaoi: wkaoi,
            taskName: "analyze/climate"
        },
    ];

    if (!settings.get('data_catalog_enabled')) {
        // MMW Analyses
        tasks.push(
            {
                name: "animals",
                displayName: "Animals",
                area_of_interest: aoi,
                wkaoi: wkaoi,
                taskName: "analyze/animals"
            },
            {
                name: "pointsource",
                displayName: "Point Sources",
                area_of_interest: aoi,
                wkaoi: wkaoi,
                taskName: "analyze/pointsource"
            },
            {
                name: "catchment_water_quality",
                displayName: "Water Quality",
                area_of_interest: aoi,
                wkaoi: wkaoi,
                taskName: "analyze/catchment-water-quality"
            },
            {
                name: "streams",
                displayName: "Streams",
                area_of_interest: aoi,
                wkaoi: wkaoi,
                taskName: "analyze/streams"
            }
        );
    }

    return new AnalyzeTaskCollection(tasks);
}

module.exports = {
    AnalyzeTaskModel: AnalyzeTaskModel,
    LayerModel: LayerModel,
    LayerCollection: LayerCollection,
    LayerCategoryCollection: LayerCategoryCollection,
    createAnalyzeTaskCollection: createAnalyzeTaskCollection,
};
