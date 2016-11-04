$(function() {
  var downloaded_layers = {};
  var secondary_table = {};

  function parseCSV(data) {
    var rows;
    if (typeof data === 'string') {
      rows = data.split(/[\r\n]+/g);
    } else {
      rows = data;
    }

    data = {
      type: 'FeatureCollection',
      features: []
    };

    var headers = rows[0].toLowerCase().split(',');
    var latitude = headers.indexOf('latitude');
    var longitude = headers.indexOf('longitude');

    for (var r = 1; r < rows.length; r++) {
      var row = rows[r].split(',');
      if (row.length <= 1) {
        continue;
      }
      var props = {};
      for (var column = 0; column < row.length; column++) {
        if (column !== latitude && column !== longitude) {
          props[headers[column]] = row[column];
        }
      }
      data.features.push({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [row[longitude] * 1, row[latitude] * 1]
        },
        properties: props
      });
    }

    return data;
  }

  $('input[type="checkbox"]').change(function(e) {
    var layer_id = $(e.currentTarget).attr('name');
    var activate = $(e.currentTarget).prop('checked');
    if (downloaded_layers[layer_id]) {
      if (activate) {
        downloaded_layers[layer_id].addTo(map);
      } else {
        map.removeLayer(downloaded_layers[layer_id]);
      }
    } else if (activate) {
      $(e.currentTarget).prop('disabled', true);
      $.get(layer_id, function(data) {
        try {
          if (typeof data === 'string') {
            data = JSON.parse(data);
          }
          if ($(e.currentTarget).attr('secondary')) {
            if (Object.keys(secondary_table).length === 0) {
              return $.get($(e.currentTarget).attr('secondary'), function (tb) {
                var rows = tb.split(/[\r\n]+/g);
                for (var r = 1; r < rows.length; r++) {
                  var row = rows[r].split(',');
                  if (row.length <= 1) {
                    continue;
                  }
                  var id = row[0];
                  var loc = row[2].replace(/"/g, '').split(' ');
                  secondary_table[id] = [loc[0] * 1, loc[1] * 1];
                }
                var headers = Object.keys(data[0]);
                var csvForm = headers.join(',') + "\n";
                csvForm = csvForm.replace('secondaryassetId', 'latitude,longitude');
                for (var r = 0; r < data.length; r++) {
                  var row = [];
                  for (var h = 0; h < headers.length; h++) {
                    if (headers[h] === 'secondaryassetId') {
                      var assetID = data[r]['secondaryassetId'];
                      var latlng = secondary_table[assetID];
                      row.push(latlng[1]);
                      row.push(latlng[0]);
                    } else {
                      row.push((data[r][headers[h]] + '').replace(/,/g, ';'));
                    }
                  }
                  csvForm += row.join(',') + "\n";
                }
                data = parseCSV(csvForm);
                downloaded_layers[layer_id] = mapJSONfile(data);
                $(e.currentTarget).prop('disabled', false);
              });
            } else {
              data = parseCSV(data);
            }
          }
        } catch(e) {
          layer_id = layer_id.toLowerCase();
          if (layer_id.indexOf('.csv') > -1) {
            data = parseCSV(data);
          }
        }
        downloaded_layers[layer_id] = mapJSONfile(data);
        $(e.currentTarget).prop('disabled', false);
      });
    }
  });
});
