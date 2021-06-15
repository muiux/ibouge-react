import React, { useEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { useSelector } from "react-redux";
// import * as Highcharts from 'highcharts';
import Highcharts from "highcharts/highmaps";
import $ from "jquery";

import MapChart from "../../components/MapChart";
import Navbar from "../../components/Navbar";
import requireAuth from "../../hoc/requireAuth";

import "./styles.scss";

import MapModule from "highcharts/modules/map";
import drilldown from "highcharts/modules/drilldown";
import dataModule from "highcharts/modules/data";

dataModule(Highcharts);
MapModule(Highcharts);

drilldown(Highcharts);
window.Highcharts = Highcharts;

const CountryView = () => {
  const auth = useSelector((state) => state.auth);
  const [mapTitle, setMapTitle] = useState("");
  // const dispatch = useDispatch();
  const history = useHistory();

  const key = sessionStorage.countryISOKey;

  const mapPath =
    "https://code.highcharts.com/mapdata/countries/" +
    key +
    "/" +
    key +
    "-all.geo.json";
  const [mapOptions, setOptions] = useState({
    credits: {
      enabled: false,
    },
    plotOptions: {
      map: {
        states: {
          hover: {
            color: "#fa834b",
          },
        },

        color: "#acadb3",
        showInLegend: false,
      },

      series: {
        events: {
          click: function (event) {
            sessionStorage.stateName = event.point.name;
            sessionStorage.longitude = event.point.properties.longitude;
            sessionStorage.latitude = event.point.properties.latitude;
            // $rootScope.$broadcast('closeModal');
          },
        },
      },
    },
    chart: {
      backgroundColor: null,
      events: {
        drilldown: (e) => {
          if (!e.seriesOptions) {
            var mapKey = `countries/${key}/` + e.point.drilldown + "-all";

            // Load the drilldown map
            $.getScript(
              "https://code.highcharts.com/mapdata/" + mapKey + ".js",
              function() {
                var data = Highcharts.geojson(Highcharts.maps[mapKey]);
                setOptions({
                  series: [
                    {
                      data: data,
                      dataLabels: {
                        enabled: false,
                      },
                      borderColor: 'white',
                    },
                  ],
                });
              }
            );
          }
        },
      },
    },

    tooltip: {
      backgroundColor: "#F7F8FA",
      borderRadius: 20,
      borderWidth: 1,
      borderColor: "#FF8E69",
      formatter: function () {
        return this.point.name;
      },
    },

    title: {
      text: null,
    },

    series: [
      {
        data: [],
        dataLabels: {
          enabled: false,
        },
        borderColor: "white",
      },
    ],
  });

  useEffect(() => {
    fetch(mapPath)
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        console.log(data)
        const mapData = Highcharts.geojson(data);
        mapData.forEach(function (i) {
          i.drilldown = i.properties["hc-key"];
          i.value = i;
        });
        setMapTitle(data.title);
        setOptions({
          series: [
            {
              data: mapData,
              dataLabels: {
                enabled: false,
              },
              borderColor: "white",
            },
          ],
        });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="home-page">
      {!auth.isAuthenticated ? (
        <div>
          <p>
            Welcome guest!
            <Link className="bold" to="/login">
              Log in
            </Link>
            or
            <Link className="bold" to="/register">
              Register
            </Link>
          </p>
        </div>
      ) : (
        <>
          <Navbar title="mapOSM" />
          <div className="row">
            <i
              className="fa fa-times icon-close-map"
              onClick={() => {
                history.goBack();
              }}
            ></i>
            <div className="col-md-3 col-sm-3 col-12"></div>
            <div className="col-md-6 col-sm-6 col-12">
              <div className="w-100 h-100-120" id="countryModalDiv">
                <h1 className="mt-120 text-center">
                  <span className="countryName">{mapTitle}</span>
                </h1>
                <MapChart
                  options={mapOptions}
                  highcharts={Highcharts}
                  containerProps={{ className: "mt-0" }}
                />
              </div>
            </div>
            <div className="col-md-3 col-sm-3 col-12"></div>
          </div>
        </>
      )}
    </div>
  );
};

export default requireAuth(CountryView);
