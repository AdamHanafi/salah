import React, { Component, Fragment } from "react";
import Geocode from "react-geocode";

import Container from "./Container";
import DateHeader from "./DateHeader";
import PrayerTimesList from "./PrayerTimesList";
import LocateManually from "./LocateManually";
import Footer from "./Footer";

import prayertimes from "../api/prayertimes";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      latitude: null,
      longitude: null,
      elevation: null,
      address: null,
      prayerTimes: [],
      errorMessage: "",
      loading: true,
      manualForm: false
    };
  }

  fetchData = async (lat, long, elevation) => {
    const response = await prayertimes.get("/times/today.json", {
      params: {
        latitude: lat,
        longitude: long,
        elevation: elevation
      }
    });
    return response;
  };

  handleButtonClick = event => {
    event.preventDefault();
    this.setState({ manualForm: true });
  };

  handleMapsSearch = (lat, long) => {
    this.setState({ latitude: lat, longitude: long });
  };

  setAddress = () => {
    Geocode.setApiKey("AIzaSyC8t1G9mouMmq1JxJfYZTaGei8j_C-kDK4");
    Geocode.fromLatLng(`${this.state.latitude}`, `${this.state.longitude}`)
    .then(
      response => {
        const address = response.results[0].formatted_address;
        this.setState({address});
      },
      error => {
        console.error(error);
      }
    );
  };

  componentDidMount = () => {
    if (window.navigator.geolocation) {
      window.navigator.geolocation.getCurrentPosition(
        async position => {
          const response = await this.fetchData(position.coords.latitude, position.coords.longitude, position.coords.altitude);
          this.setState({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            elevation: position.coords.altitude,
            prayerTimes: Object.entries(response.data.results.datetime[0].times),
            loading: false
          });
          this.setAddress();
        },
        err => this.setState({ errorMessage: err.message, loading: false }),
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 10000
        }
      );
    } else console.log("Navigator not supported.");
  };

  componentDidUpdate = async (prevProps, prevState) => {
    if (this.state.latitude !== prevState.latitude) {
      const response = await this.fetchData(this.state.latitude, this.state.longitude, this.state.elevation);
      this.setState({
        prayerTimes: Object.entries(response.data.results.datetime[0].times),
        loading: false
      });
      this.setAddress();
    }
  };

  render() {
    return (
      <Fragment>
        <Container>
          <DateHeader location={this.state.address}/>
          <PrayerTimesList
            loading={this.state.loading}
            prayerTimes={this.state.prayerTimes}
          />
          <LocateManually
            loading={this.state.loading}
            handleClick={this.handleButtonClick}
            displayForm={this.state.manualForm}
            handleMapsSearch={this.handleMapsSearch}
          />
        </Container>
        <Footer />
      </Fragment>
    );
  }
}

export default App;
