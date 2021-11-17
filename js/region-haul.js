var routes = [];

/**
 * Creates a Region object
 *
 * @param startLocation a json object that contains the region and station of the start location
 * @param endLocation a json object array that contains the region and station of the end locations
 * @constructor
 */
function Region(startLocation, endLocation) {
    this.startLocation = startLocation;
    this.endLocations = endLocation;

    this.buyOrders = {};
    this.buyOrders.completePages = [];
    this.buyOrders.complete = false;
    this.buyOrders.pageBookend = null;


    this.sellOrders = {};
    this.sellOrders.completePages = [];
    this.sellOrders.complete = false;
    this.sellOrders.pageBookend = null;

    this.regionRoutes = [];
    this.secondsToRefresh = 60;

    this.asyncRefresher = null;
    this.asyncProgressUpdate = null;
    this.routesExecutor = null;

    this.security = setDefaultVal("r2r_min_security");
    this.safety = setDefaultVal("r2r_route_preference");

    this.completed = false;

    this.includeCitadels = $("#r2r_include_citadels").is(":checked");

    if(!this.includeCitadels) {
        $("#r2r_citadels_line").hide();
    } else {
        $("#r2r_citadels_line").show();
    }

    routes.push(this);
}

Region.prototype.className = function() {
    return "Route";
};


/**
 * Begins the process for finding route information and displaying the best trades for the route.
 */
Region.prototype.startRoute = function() {
    var regionId = parseInt(this.startLocation.id);

    this.getSellOrders(regionId, this.buyOrders);

    regionId = parseInt(this.endLocations.id);

    this.getBuyOrders(regionId, this.sellOrders);

    $("#selection").hide();
};

/**
 * Calculates the progress using a logarithmic function
 *
 * @returns {number}
 */
Region.prototype.recalculateProgress = function() {
    var progressUpdate = this.getNumberOfCompletePages(this.buyOrders);
    progressUpdate += this.getNumberOfCompletePages(this.sellOrders);
    return progressUpdate <= 0 ? 1 : 35.0 * Math.log10(progressUpdate);
};

/**
 * Helper function that gets buy orders only.
 *
 * @param region The region ID in question.
 * @param composite The running buy or sell order list object.
 */
Region.prototype.getBuyOrders = function(region, composite) {
    this.getOrders(region, composite, BUY_ORDER);
};

/**
 * Helper function that gets sell orders only.
 *
 * @param region The region ID in question.
 * @param composite The running buy or sell order list object.
 */
Region.prototype.getSellOrders = function(region, composite) {
    this.getOrders(region, composite, SELL_ORDER);
};

/**
 * Getting the orders for a specific region, station, and page number.
 *
 * @param region The region ID in question.
 * @param composite The running buy or sell order list object.
 * @param orderType The order type to get orders for.
 */
Region.prototype.getOrders = function(region, composite, orderType) {
    var thiz = this;

    this.getOrder(region, composite, orderType, 1)
    .then(function(){
        for (var page = 2; page <= composite.pageBookend; page++) {
            thiz.getOrder(region, composite, orderType, page)
        }
    })
};

/**
 * Getting the order for a specific region and page number.
 *
 * @param region The region ID in question.
 * @param composite The running buy or sell order list object.
 * @param orderType The order type to get orders for.
 * @param page The market page number.
 */
Region.prototype.getOrder = function(region, composite, orderType, page) {
    var thiz = this;
    
    return $.ajax({
        type: "get",
        url: marketEndpointBuilder(region, page, orderType),
        dataType: "json",
        contentType: "application/json",
        async: true,
        success: function(data, textStatus, jqXHR) {
            composite.pageBookend = parseInt(jqXHR.getResponseHeader('x-pages'));
            page = (new URLSearchParams(this.url)).get('page');
            incrementProgress(composite, page);

            for (var i = 0; i < data.length; i++) {
                var stationId = data[i]["location_id"];
                var id = data[i]["type_id"];

                if (!composite[stationId]) composite[stationId] = {};

                if (!composite[stationId][id]) composite[stationId][id] = [];

                composite[stationId][id].push(data[i]);
            }

            if (thiz.getNumberOfCompletePages(composite) === composite.pageBookend) {
                composite.complete = true;
                console.log("Completed " + region + " order fetch at " + page);
                thiz.executeOrders();
            }
        },
        error: function(XMLHttpRequest, textStatus, errorThrown){
            displayError();
            incrementProgress(composite, page);
        }
    });
}

/**
 * Gets the number of completed pages for a specific order
 *
 * @param order The specific buy or sell order
 * @returns {number} The number of completed pages
 */
Region.prototype.getNumberOfCompletePages = function(order) {
    var numberOfCompletedPages = 0;
    for(var i = 0; i < order.completePages.length; i++) {
        if (order.completePages[i]) {
            numberOfCompletedPages++;
        }
    }
    return numberOfCompletedPages;
};


/**
 * Checks all active order requests to verify whether they are complete or not
 *
 * @returns {boolean|*}
 */
Region.prototype.checkOrdersComplete = function() {
    var ordersComplete = this.buyOrders.complete;

    ordersComplete = ordersComplete && this.sellOrders.complete;

    return ordersComplete;
};

/**
 * If all the active orders are complete then it begins processing them
 */
Region. regionRoutes = [];
Region.prototype.executeOrders = function() {
    if (this.checkOrdersComplete()) {
        hideError();

        for(startStationId in this.buyOrders) {
            var start = {};
            start.region = this.startLocation.id;
            start.station = startStationId;

            if(startStationId > 999999999 && !this.includeCitadels) {
                continue;
            }

            for(itemId in this.buyOrders[startStationId]) {
                if(itemId !== "completePages" && itemId !== "complete" && itemId !== "pageBookend") {
                    var buyPrice = getMarketData(this.buyOrders[startStationId][itemId], start.station, SELL_ORDER, itemId, true);

                    if (buyPrice.length > 0) {
                      if(orderTypeStart != "sell" || orderTypeEnd != "buy") {
                        if(orderTypeStart=="buy"){
                          buyPrice = [buyPrice[0]]
                        } else {
                          buyPrice = [buyPrice[buyPrice.length-1]]
                        }
                      }

                        for (endStationId in this.sellOrders) {

                            if(endStationId > 999999999 && !this.includeCitadels) {
                                continue;
                            }

                            if (endStationId !== startStationId) {
                                var end = {};
                                end.region = this.endLocations.id;
                                end.station = endStationId;

                                var sellOrder = this.sellOrders[endStationId];

                                if (sellOrder && sellOrder[itemId]) {
                                    var sellPrice = getMarketData(sellOrder[itemId], end.station, BUY_ORDER, itemId, true);
                                    if (sellPrice.length > 0) {
                                      if(orderTypeStart != "sell" || orderTypeEnd != "buy") {
                                        if(orderTypeStart=="buy"){
                                          sellPrice = [sellPrice[0]]
                                        } else {
                                          sellPrice = [sellPrice[sellPrice.length-1]]
                                        }
                                      }
                                        var route = {};
                                        route.itemId = itemId;
                                        route.buyPrice = buyPrice;
                                        route.sellPrice = sellPrice;
                                        route.start = start;
                                        route.end = end;
                                        this.regionRoutes.push(route);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        this.executeRoutes();

    }
};

/**
* Keeps tracks of an executes the region calculation
*/
Region.prototype.executeRoutes = function() {
    var thiz = this;
    var runningCount = 0;
    var originalCount = this.regionRoutes.length;
    var remainingProgress = 100 - totalProgress;
    var originalTotal = totalProgress;

    this.routesExecutor = setInterval(function(){

        if(thiz.regionRoutes.length == 0){
            thiz.completed = true;
            totalProgress = 100;
            clearInterval(thiz.routesExecutor);
            if (rowAdded) {
                $(".loading").hide();
            }

            $("#buying_footer").append('<div id="refresh_timer"></div>');

            $(".tableLoadingIcon").hide();

            if (!createdRefresher) {
                createdRefresher = true;
                thiz.asyncRefresh();
            }
        }

        for(var i = 0; i < thiz.regionRoutes.length && i < 1000; i++ ) {
            var route = thiz.regionRoutes.splice(0, 1)[0];

            thiz.getItemInfo(route.itemId, route.buyPrice, route.sellPrice, route.start, route.end);
            runningCount += 1;
        }

        totalProgress = originalTotal + (remainingProgress * (runningCount/originalCount));

        $(".loading").html("Adding orders to table: " + totalProgress.toFixed(2) + "% complete");
        $(".loadingContent").text((totalProgress).toFixed(2) + "%");
    }, 1000);
};

/**
* Clears the entire region for a refresh including async functions
*/
Region.prototype.clear = function() {
    this.startLocation = null;
    this.endLocations = null;

    this.buyOrders = {};
    this.buyOrders.completePages = [];
    this.buyOrders.complete = false;
    this.buyOrders.pageBookend = null;

    this.sellOrders = {};
    this.sellOrders.completePages = [];
    this.sellOrders.complete = false;
    this.sellOrders.pageBookend = null;

    this.regionRoutes = [];
    this.secondsToRefresh = 120;

    clearInterval(this.asyncRefresher);
    clearInterval(this.asyncProgressUpdate);
    clearInterval(this.routesExecutor);

    this.completed = false;
};


/**
 * The asynchronous function that calculated when a refresh can occur.
 */
Region.prototype.asyncRefresh = function() {
    var thiz = this;
    this.asyncRefresher = setInterval(function(){
        if(thiz.secondsToRefresh <= 0){
            clearInterval(thiz.asyncRefresher);
            $("#refresh_timer").remove();
            $("#buying_footer").append('<div id="refresh_button">' +
                '<input type="button" class="btn btn-default" onclick="refresh()" value="Refresh Table with Last Query"/>' +
                '</div>');
        } else {
            if (rowAdded) {
                $(".loading").hide();
            } else {
                $(".loading").text("No trades found for your filters.");
            }

            $("#refresh_timer").html("<p>Refresh allowed in: " + thiz.secondsToRefresh + " seconds.");
            thiz.secondsToRefresh--;
        }
    }, 1000);
};

/**
* Gets all required item info for a given itemId
*/
Region.prototype.getItemInfo = function(itemId, buyPrice, sellPrice, start, end){
    var rows = [];

    for(var i = 0; i < buyPrice.length; i++){
        for(var j = 0; j < sellPrice.length; j++){
            var row = this.calculateRow(itemId, buyPrice[i][0], buyPrice[i][1], sellPrice[j][0], sellPrice[j][1], start, end);
            if(row.length > 0){
                rows.push(row);
            }
        }
    }

    if(rows.length > 0){
        rows = rows.sort(bestRowComparator);
        this.getItemWeight(itemId, this.createRowObject(rows[0]));
    }
};

/**
* Calculates the given row and whether it should be added to the table
*/
Region.prototype.calculateRow = function(itemId, buyPrice, buyVolume, sellPrice, sellVolume, start, end){
    if(buyPrice < sellPrice && sellPrice > 0){
        var itemSellTax = sellPrice * salesTax / 100;
        var itemProfit = sellPrice - itemSellTax - buyPrice;

        if(itemProfit > 0){
            var volume;

            if(buyVolume >= sellVolume){
                volume = sellVolume;
            }else{
                volume = buyVolume;
            }

            var grossMargin = volume * (sellPrice - buyPrice)
            var sellTax = volume * itemSellTax;
            var netProfit = grossMargin - sellTax;
            var netCosts = volume * buyPrice;
            var netSales = volume * sellPrice;

            var iskRatio = itemProfit / buyPrice;

            if(netProfit >= haulingMinProfit && (iskRatio.toFixed(3)*100).toFixed(1) >= haulingMinRoi && netCosts <= haulingMaxBudget ){
                return [itemId, start, volume, buyPrice, netCosts, end, sellPrice, netSales, grossMargin, sellTax, netProfit, iskRatio];
            }else{
                return [];
            }
        }
    }
    return [];
};

/**
* Gets the item weight for a given itemId and adds it to the row
*/
Region.prototype.getItemWeight = function(itemId, row){
    var weightData = getWeight(itemId);
    row.itemName = weightData.typeName;
    row.itemWeight = weightData.volume;

    this.addRow(row);
};

/**
* Creates the row object for a regional trade
*/
Region.prototype.createRowObject = function(row) {
    var rowObject = {};
    rowObject.itemId = row[0];
    rowObject.buyFromStation = row[1];
    rowObject.quantity = row[2];
    rowObject.buyPrice = row[3];
    rowObject.netCosts = row[4];
    rowObject.sellToStation = row[5];
    rowObject.sellPrice = row[6];
    rowObject.netSales = row[7];
    rowObject.grossMargin = row[8];
    rowObject.sellTax = row[9];
    rowObject.netProfit = row[10];
    rowObject.roi = row[11];
    return rowObject;
};

/**
* If the user requested citadel data as well this will swap out the citadel id
* at the endpoint with the citadel data provided by stop.hammerti.me.uk
*/
Region.prototype.updateEndWithCitadel = function (row) {
    var citadelId = row.sellToStation.station;
    var thiz = this;

    if (citadelId < 999999999) {
        $.each(universeList, function(stationName, stationData) {
            if (stationData.station == citadelId) {
                var citadel = {};
                citadel.name = stationData.name;
                citadel.system = stationData.system;
                citadelCache[citadelId] = citadel;
                row.sellToStation.name = stationData.name;
                row.sellToStation.system = stationData.system;
                thiz.getStartSystemSecurity(row);
                return false;
            }
        });
    } else if(this.includeCitadels) {
        if (citadelCache[citadelId]) {
            row.sellToStation.name = "<strong><em>" + citadelCache[citadelId].name + "*</em></strong>";
            row.sellToStation.system = citadelCache[citadelId].system;
            this.getStartSystemSecurity(row);
        } else {
            $.ajax({
                type: "get",
                url: "https://stop.hammerti.me.uk/api/citadel/" + citadelId,
                dataType: "json",
                contentType: "application/json",
                async: true,
                success: function (data) {
                    data = data[citadelId];
                    var citadel = {};
                    citadel.name = data.name;
                    citadel.system = data.systemId;
                    citadelCache[citadelId] = citadel;
                    row.sellToStation.name = "<strong><em>" + data.name + "*</em></strong>";
                    row.sellToStation.system = data.systemId;
                    thiz.getStartSystemSecurity(row);
                }
            });
        }
    }
};


/**
* If the user requested citadel data as well this will swap out the citadel id
* at the startpoint with the citadel data provided by stop.hammerti.me.uk
*/
Region.prototype.updateStartWithCitadel = function (row) {
    var citadelId = row.buyFromStation.station;
    var thiz = this;

    if (citadelId < 999999999) {
        $.each(universeList, function(stationName, stationData) {
            if (stationData.station == citadelId) {
                var citadel = {};
                citadel.name = stationData.name;
                citadel.system = stationData.system;
                citadelCache[citadelId] = citadel;
                row.buyFromStation.name = stationData.name;
                row.buyFromStation.system = stationData.system;
                thiz.updateEndWithCitadel(row);
                return false;
            }
        });
    } else if(this.includeCitadels) {
        if (citadelCache[citadelId]) {
            var citadelName = citadelCache[citadelId].name;
            var citadelSystem = citadelCache[citadelId].system;
            row.buyFromStation.name = "<strong><em>" + citadelName + "*</em></strong>";
            row.buyFromStation.system = citadelSystem;
            this.updateEndWithCitadel(row);
        } else {
            $.ajax({
                type: "get",
                url: "https://stop.hammerti.me.uk/api/citadel/" + citadelId,
                dataType: "json",
                contentType: "application/json",
                async: true,
                success: function (data) {
                    data = data[citadelId];
                    var citadel = {};
                    citadel.name = data.name;
                    citadel.system = data.systemId;
                    citadelCache[citadelId] = citadel;
                    row.buyFromStation.name = "<strong><em>" + data.name + "*</em></strong>";
                    row.buyFromStation.system = data.systemId;
                    thiz.updateEndWithCitadel(row);
                }
            });
        }
    }
};

/**
* If all conditions are met then the row is added to the datatable
*/
Region.prototype.addRow = function(row) {

    var storageVolume = row.itemWeight * row.quantity;

    if(storageVolume > haulingMaxCargo) {
        return;
    }

    if(isSpamItem(row.itemName)) {
        return;
    }

    createDataTable();

    this.updateStartWithCitadel(row);
};

/**
* Translates security codes to their respective numeric values
*/
Region.prototype.getSecurityCode = function (sec) {
    if (sec >= 0.5) {
        return "high_sec";
    } else if (sec > 0 && (this.security == "null" || this.security == "low")) {
        return "low_sec";
    } else if (sec <= 0 && (this.security == "null")) {
        return "null_sec";
    } else {
        return -1;
    }
}

/**
* Determines the endpoint's security code
*/
Region.prototype.getEndSystemSecurity = function (row) {
    var systemId = row.sellToStation.system;
    var thiz = this;

    if (systemSecurity[systemId]) {
        var securityCode = this.getSecurityCode(systemSecurity[systemId]);
        if (securityCode == -1) {
            return;
        }
        row.sellToStation.name = "<span class='" + securityCode + "'>" + row.sellToStation.name + "</span>";
        this.getRouteLength(row);
    } else {
        $.each(universeList, function (stationName, stationData) {
            if (stationData.system == systemId) {
                systemSecurity[systemId] = stationData.security;
                var securityCode = thiz.getSecurityCode(stationData.security);
                if (securityCode == -1) {
                    return false;
                }
                row.sellToStation.name = "<span class='" + securityCode + "'>" + row.sellToStation.name + "</span>";
                thiz.getRouteLength(row);
                return false;
            }
        });
    }
};

/**
* Determines the startpoint's security code
*/
Region.prototype.getStartSystemSecurity = function (row) {
    var systemId = row.buyFromStation.system;
    var thiz = this;

    if (systemSecurity[systemId]) {
        var securityCode = this.getSecurityCode(systemSecurity[systemId]);
        if(securityCode == -1) {
            return;
        }
        row.buyFromStation.name = "<span class='" + securityCode + "'>" + row.buyFromStation.name + "</span>";
        this.getEndSystemSecurity(row);
    } else {
        $.each(universeList, function (stationName, stationData) {
            if (stationData.system == systemId) {
                systemSecurity[systemId] = stationData.security;
                var securityCode = thiz.getSecurityCode(stationData.security);
                if (securityCode == -1) {
                    return false;
                }
                row.buyFromStation.name = "<span class='" + securityCode + "'>" + row.buyFromStation.name + "</span>";
                thiz.getEndSystemSecurity(row);
                return false;
            }
        });
    }
};

/**
* Gets the length of the route
*/
Region.prototype.getRouteLength = function (row) {
    var systemIdStart = row.buyFromStation.system;
    var systemIdEnd = row.sellToStation.system;
    var routeId = systemIdStart + "-" + systemIdEnd;
    var thiz = this;

    if (routeCache[routeId]) {
        row.routeLength = routeCache[routeId];
        this.updateDatatable(row);
    } else {
        $.ajax({
            type: "get",
            url: "https://esi.evetech.net/latest/route/" + systemIdStart + "/" + systemIdEnd + "/?datasource=tranquility&flag=" + thiz.safety,
            dataType: "json",
            contentType: "application/json",
            async: true,
            success: function (data) {
                routeCache[routeId] = data.length;
                row.routeLength = data.length;
                thiz.updateDatatable(row);
            }
        });
    }
};

/**
* Given a row this function updates the datatable
*/
Region.prototype.updateDatatable = function(row) {
    var investigateId = row.sellToStation.station + row.buyFromStation.station + row.itemId + "_investigate";
    var storageVolume = row.itemWeight * row.quantity;

    var row_data = [
        "<span id=\"" + investigateId + "\"" +
        "data-itemId=\"" + row.itemId + "\"" +
        "data-itemName=\"" + row.itemName + "\"" +
        "data-fromStationId=\"" + row.buyFromStation.station + "\"" +
        "data-sellStationId=\"" + row.sellToStation.station + "\">" +
        "<i class=\"fa fa-search-plus\"></i>" +
        "</span>",
        row.itemName,
        row.buyFromStation.name,
        numberWithCommas(row.quantity),
        numberWithCommas(row.buyPrice.toFixed(2)),
        numberWithCommas(row.netCosts.toFixed(2)),
        row.sellToStation.name,
        numberWithCommas(row.sellPrice.toFixed(2)),
        numberWithCommas(row.netSales.toFixed(2)),
        numberWithCommas(row.grossMargin.toFixed(2)),
        numberWithCommas(row.sellTax.toFixed(2)),
        numberWithCommas(row.netProfit.toFixed(2)),
        row.routeLength - 1,
        numberWithCommas((row.netProfit/(row.routeLength - 1)).toFixed(2)),
        (row.roi.toFixed(3) * 100).toFixed(1) + "%",
        numberWithCommas(storageVolume.toFixed(2))
    ];

    var rowIndex = $('#dataTable').dataTable().fnAddData(row_data);
    $('#dataTable').dataTable().fnGetNodes(rowIndex);

    $("#" + investigateId).on('click', function () {
        var popId = parseInt(this.dataset.itemid);
        var popName = this.dataset.itemname;
        var popFrom = parseInt(this.dataset.fromstationid);

        var fromStation = {};
        fromStation.name = stationIdToName[popFrom];
        fromStation.station = popFrom;

        var toStation = {};
        toStation.name = stationIdToName[this.dataset.sellstationid];
        toStation.station = parseInt(this.dataset.sellstationid);

        open_popup(popId, popName, fromStation, toStation);
    });

    rowAdded = true;
};
