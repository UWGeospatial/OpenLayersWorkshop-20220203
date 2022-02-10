String.prototype.toProperCase = function () {
    return this.replace(/([^\s-]\w*)/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
};

function getMaxPoly(polys) {
    var polyObj = [];
    //now need to find which one is the greater and so label only this
    for (var b = 0; b < polys.length; b++) {
      polyObj.push({ poly: polys[b], area: polys[b].getArea() });
    }
    polyObj.sort(function (a, b) { return a.area - b.area });
  
    return polyObj[polyObj.length - 1].poly;
}

const labelStyle = new ol.style.Style({
    text: new ol.style.Text({
        font: '12px Calibri,sans-serif',
        fill: new ol.style.Fill({
            color: '#000'
        }),
        stroke: new ol.style.Stroke({
            color: '#fff',
            width: 3
        })
    })
})

const provParkLabel = new ol.style.Style({
    text: new ol.style.Text({
        font: '12px Calibri,sans-serif',
        overflow: true,
        fill: new ol.style.Fill({
          color: "rgba(65, 133, 9, 1)"
        }),
        stroke: new ol.style.Stroke({
          color: '#fff',
          width: 3
        }),
    }),
    geometry: function(feature){
        var retPoint;
        if (feature.getGeometry().getType() === 'MultiPolygon') {
          retPoint =  getMaxPoly(feature.getGeometry().getPolygons()).getInteriorPoint();
        } else if (feature.getGeometry().getType() === 'Polygon') {
          retPoint = feature.getGeometry().getInteriorPoint();
        }
        return retPoint;
    }
})

const provParkShape = new ol.style.Style({
    fill: new ol.style.Fill({
        color: "rgba(65, 133, 9, 0.5)",
    }),
    stroke: new ol.style.Stroke({
        color: "rgba(65, 133, 9, 0.8)",
        width: 1.5,
    })
})

const map = new ol.Map({
    target: 'map',
    layers: [
        new ol.layer.Tile({
            source: new ol.source.OSM()
        }),
        new ol.layer.Vector({
            source: new ol.source.Vector({
                url: "./cities.geojson",
                format: new ol.format.GeoJSON()
            }),
            style: function(feature) {
                labelStyle.getText().setText(feature.get('English Names'));
                return labelStyle
            },
            declutter: true,
        }),
        new ol.layer.Vector({
            source: new ol.source.Vector({
                url: "https://opendata.arcgis.com/datasets/c5191fcd8a944eaf91920b4ed914825a_4.geojson",
                format: new ol.format.GeoJSON()
            }),
            declutter: true,
            style: function(feature) {
                provParkLabel.getText().setText(feature.get("PROTECTED_AREA_NAME_ENG").toProperCase().split("(")[0])
                return [provParkLabel, provParkShape]
            }
        }),
        new ol.layer.Image({
            source: new ol.source.ImageWMS({
                format: "image/png",
                url: "https://proxyinternet.nrcan.gc.ca/arcgis/services/CLSS-SATC/CLSS_Administrative_Boundaries/MapServer/WMSServer?layers=0&legend_format=image/png&feature_info_type=text/html",
                transition: 500
            })
        })
    ],
    view: new ol.View({
        center: ol.proj.fromLonLat([-100,60]),
        zoom: 3
    })
})
