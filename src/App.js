import React, { useReducer } from "react";

import FlightIcon from "./assets/flight-icon.png";
import "./App.css";

function flightBookingReducer(state, action) {
  switch (action.type) {
    case "SHOW_CONFIRMBOOKING":
      return {
        ...state,
        showConfirmBookingModal: action.showConfirmBookingModal,
      };
    case "SET_FLIGHTS_DATA":
      return {
        ...state,
        flights: action.flights,
      };
    case "SET_CONFIRMBOOKING":
      return {
        ...state,
        bookingConfirmed: action.bookingConfirmed,
      };
    case "UPDATE_BOOKINGDETAILS":
      if (!Object.entries(action.bookingDetails).length)
        return { ...state, bookingDetails: {} };

      return {
        ...state,
        bookingDetails: { ...state.bookingDetails, ...action.bookingDetails },
      };
    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
}

function FlightBooking() {
  const initialState = {
    flights: [],
    showConfirmBookingModal: false,
    bookingConfirmed: false,
    bookingDetails: {},
  };
  const [state, dispatch] = useReducer(flightBookingReducer, initialState);

  function onSearchClickHandler() {
    fetch("/flights")
      .then((response) => response.json())
      .then((data) => {
        dispatch({
          type: "SET_FLIGHTS_DATA",
          flights: data,
        });
      });
  }

  function onBookNowClickHandler() {
    dispatch({ type: "SHOW_CONFIRMBOOKING", showConfirmBookingModal: true });
  }

  function onConfirmBookingCancelHandler() {
    dispatch({ type: "SHOW_CONFIRMBOOKING", showConfirmBookingModal: false });
    dispatch({
      type: "UPDATE_BOOKINGDETAILS",
      bookingDetails: {},
    });
  }

  function onConfirmBookingHandler() {
    const { bookingDetails } = state;

    fetch("/booking", {
      method: "POST",
      body: JSON.stringify({
        name: bookingDetails.name,
        email: bookingDetails.email,
        flight: 1,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        dispatch({ type: "SET_CONFIRMBOOKING", bookingConfirmed: true });
        dispatch({ type: "SET_FLIGHTS_DATA", flights: [] });
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  function onConfirmBookingCloseHandler() {
    dispatch({ type: "SHOW_CONFIRMBOOKING", showConfirmBookingModal: false });
    dispatch({ type: "SET_CONFIRMBOOKING", bookingConfirmed: false });
    dispatch({
      type: "UPDATE_BOOKINGDETAILS",
      bookingDetails: {},
    });
  }

  function onInputChangeHandler(event) {
    dispatch({
      type: "UPDATE_BOOKINGDETAILS",
      bookingDetails: { [event.target.name]: event.target.value },
    });
  }

  const {
    showConfirmBookingModal,
    flights,
    bookingConfirmed,
    bookingDetails,
  } = state;

  return (
    <div>
      <div className="container">
        <h1>Flight Booking</h1>
        <div className="search-bar">
          <label htmlFor="source">Source</label>
          <input data-testid="source" placeholder="Source" type="text" />
          <label htmlFor="destination">Destination</label>
          <input
            data-testid="destination"
            placeholder="Destination"
            type="text"
          />
          <label htmlFor="when">When</label>
          <input data-testid="when" placeholder="When" type="text" />
          <button
            type="button"
            name="Search Flight"
            onClick={onSearchClickHandler}
          >
            Search Flight
          </button>
        </div>
        <div className="search-list">
          {!flights || flights.length === 0 ? (
            <p>Search for a flight!</p>
          ) : (
            flights.map((flight) => {
              return (
                <div key={flight.id} className="search-flight">
                  <div className="icon">
                    <img src={FlightIcon} alt="Flight" />
                  </div>
                  <div className="details">
                    <h1>{flight.arrival}</h1>
                    <p data-testid="company">{flight.company}</p>
                  </div>
                  <div className="duration">
                    <h1>{flight.duration}</h1>
                    <p>{`${flight.source.key}-${flight.destination.key}`}</p>
                  </div>
                  <div className="price">
                    <h1 data-testid="price">₹ {flight.price}</h1>
                    <button
                      data-testid="booknow"
                      type="button"
                      onClick={onBookNowClickHandler}
                    >
                      Book now
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      {showConfirmBookingModal && (
        <div className="booknow-frm">
          <div className="container">
            {!bookingConfirmed ? (
              <>
                <h1>Your Details</h1>
                <input
                  data-testid="name"
                  name="name"
                  type="text"
                  placeholder="Your Name"
                  value={bookingDetails?.name}
                  onChange={onInputChangeHandler}
                />
                <input
                  data-testid="email"
                  name="email"
                  type="text"
                  placeholder="Your Email"
                  value={bookingDetails?.email}
                  onChange={onInputChangeHandler}
                />
                <button
                  data-testid="confirm_booking"
                  onClick={onConfirmBookingHandler}
                >
                  Confirm Booking
                </button>
                <button onClick={onConfirmBookingCancelHandler}>Cancel</button>
              </>
            ) : (
              <>
                <p data-testid="result">Booking Confirmed!</p>
                <button onClick={onConfirmBookingCloseHandler}>Close</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default FlightBooking;
