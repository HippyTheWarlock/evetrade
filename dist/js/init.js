function getTradeHubName(t){return"Jita IV - Moon 4 - Caldari Navy Assembly Plant"==t?"Jita":"Amarr VIII (Oris) - Emperor Family Academy"==t?"Amarr":"Rens VI - Moon 8 - Brutor Tribe Treasury"==t?"Rens":"Dodixie IX - Moon 20 - Federation Navy Assembly Plant"==t?"Dodixie":"Hek VIII - Moon 12 - Boundless Creation Factory"==t?"Hek":t}function initCompletely(t,e){var n=completely(document.getElementById(t),{fontSize:"18px",fontFamily:"Roboto",color:"#333",ignoreCase:!0});n.options=e,n.repaint(),"start_station"==t&&$($("#"+t+" input")[1]).on("keydown",function(t){13==t.keyCode&&(shifted?newStartStation(t={shiftKey:!0}):newStartStation())}),"end_station"==t&&$($("#"+t+" input")[1]).on("keydown",function(t){13==t.keyCode&&(shifted?newEndStation(t={shiftKey:!0}):newEndStation())})}function setupCustomDropdown(){var a=setInterval(function(){if(station_ids!==undefined){clearInterval(a);for(var t=[""],e=0;e<station_ids.length;e++){var n=station_ids[e][2],o=getTradeHubName(n);if(n!==o){var i=o.toLowerCase();universeList[i]={},universeList[i].region=station_ids[e][1],universeList[i].station=station_ids[e][0],universeList[i].name=o,t.push(o)}i=n.toLowerCase();universeList[i]={},universeList[i].region=station_ids[e][1],universeList[i].station=station_ids[e][0],universeList[i].name=n,t.push(n),stationIdToName[station_ids[e][0]]=n}t.sort(),initCompletely("custom_station",t),initCompletely("start_station",t),initCompletely("end_station",t),null==$("#route-preference").val()&&$("#route-preference").val("shortest"),null==$("#security-threshold").val()&&$("#security-threshold").val("NULL"),null==$("#buying-type-station").val()&&$("#buying-type-station").val("SELL"),null==$("#selling-type-station").val()&&$("#selling-type-station").val("BUY"),stationsReady=!0}},1e3),i=setInterval(function(){if(region_ids!==undefined){clearInterval(i);for(var t=[""],e=0;e<region_ids.length;e++){var n=region_ids[e][1],o=n.toLowerCase();universeList[o]={},universeList[o].name=region_ids[e][1],universeList[o].id=region_ids[e][0],t.push(n)}t.sort(),initCompletely("start_region",t),initCompletely("end_region",t),null==$("#buying-type-region").val()&&$("#buying-type-region").val("SELL"),null==$("#selling-type-region").val()&&$("#selling-type-region").val("BUY"),regionsReady=!0}},1e3),t=setInterval(function(){stationsReady&&regionsReady&&(checkDirection(),clearInterval(t),$(function(){var t=1;$("input").each(function(){"hidden"!=this.type&&($(this).attr("tabindex",t),t++)})}),$(".location-input").keyup(function(t){if("9"==t.keyCode){var e=parseInt(t.target.id.charAt(t.target.id.length-1));1==e?$("#volume-threshold").focus():2==e||4==e?$("#location-input-"+(e+1)).focus():3==e?$("#profit-threshold").focus():5==e&&$("#region-profit-threshold").focus()}}),$(".loadingIcon").remove(),$(".core-section").css("opacity",1))},1e3)}function findAllStations(t){var e=[],n=t.toLowerCase();if(-1<t.indexOf(" ")&&(n=t.substr(0,t.indexOf(" ")).toLowerCase()),3<=n.length)for(station in universeList)universeList.hasOwnProperty(station)&&station&&station.startsWith(n)&&-1<station.indexOf(" ")&&e.push(station);return e}function newStartStation(t){var e=document.createElement("li"),n=$("#start_station input")[0].value&&universeList[$("#start_station input")[0].value.toLowerCase()]&&universeList[$("#start_station input")[0].value.toLowerCase()].name;0==n.length&&(n=$("#start_station input")[1].value&&universeList[$("#start_station input")[1].value.toLowerCase()]&&universeList[$("#start_station input")[1].value.toLowerCase()].name);var o=[];if(t&&t.shiftKey){o=findAllStations(n);for(var i=0;i<o.length;i++)$("#start_station input")[0].value=o[i],$("#start_station input")[1].value=o[i],newStartStation(),$("#start_station input")[0].value="",$("#start_station input")[1].value=""}else{var a=document.createTextNode(n);if(-1==addedToStartList.indexOf(n)){addedToStartList.push(n),e.appendChild(a),""===n?alert("You must choose a station!"):(document.getElementById("custom_route_start").style.display="block",document.getElementById("custom_route_start").appendChild(e)),$("#start_station input")[0].value="",$("#start_station input")[1].value="";var s=document.createElement("SPAN"),r=document.createTextNode(" \xd7");s.className="closeStation",s.title="Remove: "+n,s.appendChild(r),e.appendChild(s)}var l=document.getElementsByClassName("closeStation");for(i=0;i<l.length;i++)l[i].onclick=function(){var t=$(this)[0].previousSibling.data;addedToStartList[addedToStartList.indexOf(t)]="",$(this.parentElement).remove()}}}function newEndStation(t){var e=document.createElement("li"),n=$("#end_station input")[0].value&&universeList[$("#end_station input")[0].value.toLowerCase()]&&universeList[$("#end_station input")[0].value.toLowerCase()].name;0==n.length&&(n=$("#end_station input")[1].value&&universeList[$("#end_station input")[1].value.toLowerCase()]&&universeList[$("#end_station input")[1].value.toLowerCase()].name);var o=[];if(t&&t.shiftKey){o=findAllStations(n);for(var i=0;i<o.length;i++)$("#end_station input")[0].value=o[i],$("#end_station input")[1].value=o[i],newEndStation(),$("#end_station input")[0].value="",$("#end_station input")[1].value=""}else{var a=document.createTextNode(n);if(-1==addedToEndList.indexOf(n)){addedToEndList.push(n),e.appendChild(a),""===n?alert("You must choose a station!"):(document.getElementById("custom_route_end").style.display="block",document.getElementById("custom_route_end").appendChild(e)),$("#end_station input")[0].value="",$("#end_station input")[1].value="";var s=document.createElement("SPAN"),r=document.createTextNode(" \xd7");s.className="closeStation",s.title="Remove: "+n,s.appendChild(r),e.appendChild(s)}var l=document.getElementsByClassName("closeStation");for(i=0;i<l.length;i++)l[i].onclick=function(){var t=$(this)[0].previousSibling.data;addedToEndList[addedToEndList.indexOf(t)]="",$(this.parentElement).remove()}}}function onClickListeners(){$(".end").on("click",function(){$(this).hasClass("end-selected")?$(this).removeClass("end-selected"):$(this).addClass("end-selected")}),$(".hauling-region-trader").on("click",function(){setupTradeOptions(2)}),$(".hauling-station-trader").on("click",function(){setupTradeOptions(1)}),$(".station-trader").on("click",function(){setupTradeOptions(0)}),$(".station-start").on("click",function(){$(".station-start").removeClass("station-selected"),$(this).addClass("station-selected")}),$(".directionChange").on("change",function(){checkDirection()}),$("#sst").on("click",function(){window.location=window.location.pathname+"?trade=sst"}),$("#s2s").on("click",function(){window.location=window.location.pathname+"?trade=s2s"}),$("#r2r").on("click",function(){window.location=window.location.pathname+"?trade=r2r"})}function checkDirection(){var t=$("#buying-type-station").val(),e=$("#selling-type-station").val(),n=$("#buying-type-region").val(),o=$("#selling-type-region").val();"SELL"==t&&"BUY"==e?$("#directionWarningStation").hide():($("#directionWarningStation > .startDirection").text(t),$("#directionWarningStation > .endDirection").text(e),$("#directionWarningStation").show()),"SELL"==n&&"BUY"==o?$("#directionWarningRegion").hide():($("#directionWarningRegion > .startDirection").text(n),$("#directionWarningRegion > .endDirection").text(o),$("#directionWarningRegion").show())}function setAbout(){null==tradingStyle?$("#about")[0].onclick=function(){$("#howto").modal("show")}:tradingStyle==STATION_HAUL||tradingStyle==REGION_HAUL?$("#about")[0].onclick=function(){$("#howto-route").modal("show")}:tradingStyle==STATION_TRADE&&($("#about")[0].onclick=function(){$("#howto-station").modal("show")})}function setupCookies(){for(var t=["lower-margin-threshold","upper-margin-threshold","volume-threshold","profit-threshold","roi-threshold","buy-threshold","weight-threshold","route-preference","include-citadels","security-threshold","region-buy-threshold","region-roi-threshold","region-weight-threshold","region-profit-threshold","buying-type-station","selling-type-station","buying-type-region","selling-type-region"],e=0;e<t.length;e++)$("#"+t[e]).inputStore()}function setupTradeOptions(t){tradingStyle=t,$(".howto").toggle(!1),$("#initial_choice").hide(),$("#trade_menu").show(),setAbout();var e="";tradingStyle==STATION_HAUL?($("#route_trade").slideToggle(),e="Hauler - Station"):tradingStyle==STATION_TRADE?($("#station_trade").slideToggle(),e="Station Trader"):tradingStyle==REGION_HAUL&&($("#region_trade").slideToggle(),e="Hauler - Region"),gtag("event","User Preference Campaign",{event_category:"Trade Style",event_label:e,value:1})}function open_popup(t,e,n,o){!o.name&&citadelCache[o.station]&&(citadelCache[o.station]&&citadelCache[o.station].name?o.name=citadelCache[o.station].name+"*":o.name=citadelCache[o.station]+"*"),popup_table_buy.clear(),popup_table_sell.clear();var i=getStationName(o)||o.name,a=o.station||o;$("#popup_itemName").text("Trade info for "+e);var s=[],r=[];s="BUY"==orderTypeStart?customSell[n.station][t]:customBuy[n.station][t],r="BUY"==orderTypeEnd?customSell[a][t]:customBuy[a][t];for(var l=0;l<s.length;l++)s[l]&&$("#popup-table-buy").dataTable().fnAddData([numberWithCommas(s[l][0].toFixed(2)),numberWithCommas(s[l][1].toFixed())]);for(l=0;l<r.length;l++)r[l]&&$("#popup-table-sell").dataTable().fnAddData([numberWithCommas(r[l][0].toFixed(2)),numberWithCommas(r[l][1].toFixed())]);$("#popup").modal("show"),popup_table_buy.draw(),popup_table_sell.draw(),"BUY"==orderTypeStart?($("#buyLocation").text("Buy Orders at "+n.name),$("#popup-table-buy th:first-of-type")[0].textContent="Buy Orders",$("#popup-table-buy").dataTable().fnSort([0,"desc"])):($("#buyLocation").text("Sell Orders at "+n.name),$("#popup-table-buy th:first-of-type")[0].textContent="Sell Orders",$("#popup-table-buy").dataTable().fnSort([0,"asc"])),"BUY"==orderTypeEnd?($("#sellLocation").text("Buy Orders at "+i),$("#popup-table-sell th:first-of-type")[0].textContent="Buy Orders",$("#popup-table-sell").dataTable().fnSort([0,"desc"])):($("#sellLocation").text("Sell Orders at "+i),$("#popup-table-sell th:first-of-type")[0].textContent="Sell Orders",$("#popup-table-sell").dataTable().fnSort([0,"asc"]))}function addStart(t){if(tradingStyle==STATION_TRADE)$("#custom_station input")[0].value=t,$("#custom_station input")[1].value=t;else if(tradingStyle==STATION_HAUL)if($("#start_station input")[0].value=t,$("#start_station input")[1].value=t,shifted){var e={shiftKey:!0};newStartStation(e)}else newStartStation();else tradingStyle==REGION_HAUL&&($("#start_region input")[0].value=t,$("#start_region input")[1].value=t)}function addEnd(t){if(tradingStyle!=STATION_TRADE)if(tradingStyle==STATION_HAUL)if($("#end_station input")[0].value=t,$("#end_station input")[1].value=t,shifted){var e={shiftKey:!0};newEndStation(e)}else newEndStation();else tradingStyle==REGION_HAUL&&($("#end_region input")[0].value=t,$("#end_region input")[1].value=t)}function setStationTradingLocations(){var t=$("#custom_station input")[0].value||$("#custom_station input")[1].value;startLocations=t.toLowerCase();var e=universeList[startLocations].region,n=universeList[startLocations].station;startLocations=universeList[startLocations].name,startCoordinates.region=e,startCoordinates.station=n}function setRouteRegionTradingLocations(){var t=$("#start_region input")[0].value||$("#start_region input")[1].value;startLocations=t.toLowerCase(),startCoordinates=universeList[startLocations],startLocations=startCoordinates.name,t=$("#end_region input")[0].value||$("#end_region input")[1].value,endLocations=t.toLowerCase(),endCoordinates=universeList[endLocations],endLocations=endCoordinates.name}function getCoordinatesFor(t,e){var o,i=[],a=[];if($.each($(t+" > li"),function(){var t={},e=$(this).text(),n=e.substring(0,e.length-2).toLowerCase();o=universeList[n],t.region=o.region,t.station=o.station,t.name=o.name,-1==a.indexOf(t.station)&&(i.push(t),a.push(t.station))}),$(e+" input")[0].value){var n=$(e+" input")[0].value||$(e+" input")[1].value;if(o=universeList[n.toLowerCase()]){var s={};s.region=o.region,s.station=o.station,s.name=o.name,-1==a.indexOf(s.station)&&i.push(s)}}return i}function setRouteStationTradingLocations(){if(0<(startCoordinates=getCoordinatesFor("#custom_route_start","#start_station")).length){startLocations=[];for(var t=0;t<startCoordinates.length;t++)startLocations.push(startCoordinates[t].name);for(endCoordinates=getCoordinatesFor("#custom_route_end","#end_station"),t=0;t<endCoordinates.length;t++)endLocations.push(endCoordinates[t].name)}}function execute(){if(tradingStyle==STATION_HAUL){routes=[];for(var t=0;t<startCoordinates.length;t++)new Route(startCoordinates[t],endCoordinates).startRoute()}else tradingStyle==STATION_TRADE?new Station(startCoordinates).startStation():tradingStyle==REGION_HAUL&&new Region(startCoordinates,endCoordinates).startRoute()}function init(t){tradingStyle=t;try{tradingStyle==STATION_TRADE?(threshold_margin_lower=setDefaultVal($("#lower-margin-threshold").val(),20),threshold_margin_upper=setDefaultVal($("#upper-margin-threshold").val(),40),volume_threshold=setDefaultVal($("#volume-threshold").val(),1e3),setStationTradingLocations()):tradingStyle==STATION_HAUL?(threshold_profit=setDefaultVal($("#profit-threshold").val(),5e5),threshold_roi=setDefaultVal($("#roi-threshold").val(),4),threshold_cost=setDefaultVal($("#buy-threshold").val(),1e18),threshold_weight=setDefaultVal($("#weight-threshold").val(),1e18),setRouteStationTradingLocations()):tradingStyle==REGION_HAUL&&(threshold_profit=setDefaultVal($("#region-profit-threshold").val(),5e5),threshold_roi=setDefaultVal($("#region-roi-threshold").val(),4),threshold_cost=setDefaultVal($("#region-buy-threshold").val(),1e18),threshold_weight=setDefaultVal($("#region-weight-threshold").val(),1e18),setRouteRegionTradingLocations()),setCopyWording();var e=startLocations&&0<startLocations.length,n=(tradingStyle==STATION_HAUL||tradingStyle==REGION_HAUL)&&0<endLocations.length||tradingStyle==STATION_TRADE;if(!e||!n)return $(".error").slideToggle(!0),!1;$(".error").slideToggle(!1),$("#selection").hide(),$(".tableLoadingIcon").show(),createTradeHeader(),execute()}catch(o){return $(".error").slideToggle(!0),console.log(o),!1}return!1}var threshold_margin_lower,threshold_margin_upper,volume_threshold,threshold_profit,threshold_roi,threshold_cost,threshold_weight,popup_table_buy,popup_table_sell,tradingStyle=null,errorShown=!1,addedToStartList=[],addedToEndList=[],stationsReady=!1,regionsReady=!1,universeList={},stationIdToName={},startCoordinates=[],endCoordinates=[],startLocations=[],endLocations=[],shifted=!1;$(document).ready(function(){switch(popup_table_buy=$("#popup-table-buy").DataTable({order:[[0,"asc"]],lengthMenu:[[10],["10"]]}),popup_table_sell=$("#popup-table-sell").DataTable({order:[[0,"desc"]],lengthMenu:[[10],["10"]]}),onClickListeners(),$('input[type="number"]').keypress(function(t){var e=t||window.event,n=e.keyCode||e.which;n=String.fromCharCode(n),/[0-9]|\./.test(n)||8===e.charCode||0===e.charCode||(e.returnValue=!1,e.preventDefault&&e.preventDefault())}),$(document).on("keyup keydown",function(t){return t.shiftKey?($(".add-station-button").val("Add System"),shifted=!0):($(".add-station-button").val("+"),shifted=!1),!0}),setAbout(),setupCookies(),setupCustomDropdown(),$(".show-amazon-offers").on("click",function(){$(".amazon-offers").slideToggle()}),$.fn.isInViewport=function(){var t=$(this).offset().top,e=t+$(this).outerHeight(),n=$(window).scrollTop(),o=n+$(window).height();return n<e&&t<o},$(window).on("resize scroll",function(){$(".branding").isInViewport()?$(".promo-item").css("transform","translateY(0)"):$(".promo-item").css("transform","translateY(-5em)")}),gtag("event","Browser Location Tracking",{event_category:"URI",event_label:window.location.href,value:1}),new URL(window.location.href).searchParams.get("trade")){case"sst":setupTradeOptions(0);break;case"s2s":setupTradeOptions(1);break;case"r2r":setupTradeOptions(2)}}),String.prototype.startsWith||(String.prototype.startsWith=function(t,e){return e=e||0,this.indexOf(t,e)===e});