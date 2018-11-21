const URL = 'https://trektravel.herokuapp.com/trips/';

const inputs = ['name', 'email', 'trip', 'id'];

const tripDetails = $('section.trip-details');
const reserveTrip = $('section.reserve-trip');

const reportStatus = (message) => {
  $('#status-message').html(message);
};

const loadTrips = () => {
  reportStatus('Loading trips...');

  // Prep work
  const tripList = $('#trip-list');
  tripList.empty();

  // Actually load the trips
  axios.get(URL)
    .then((response) => {
      reportStatus(`Successfully loaded ${response.data.length} trips`);
      response.data.forEach((trip) => {
        tripList.append(`<li><a href="#" data-trip-id="${trip.id}">${trip.name}</a></li>`);
      });
    })
    .catch((error) => {
      reportStatus(`Encountered an error while loading trips: ${error.message}`);
      console.log(error);
    });
};

const loadDetail = (event) => {
  event.preventDefault();

  const tripID = $(event.currentTarget).attr('data-trip-id');
  const tripDetail = $('#trip-detail');

  reportStatus('Loading trip details...');

  // Prep work
  tripDetail.empty();

  // Load the details
  axios.get(URL + tripID)
    .then((response) => {
      reportStatus(`Successfully loaded ${response.data.name}`);
      console.log(response.data);
      const tripInfo = ['name', 'continent', 'category', 'weeks', 'cost', 'about']
      for (let info of tripInfo) {
        tripDetail.append(`<li><span class="capitalize">${info}</span>: ${response.data[info]}</li>`);
      }
      tripDetails.show();

      $(`#reservation-form input[name="trip"]`).val(response.data.name);
      $(`#reservation-form input[name="id"]`).val(response.data.id);
      reserveTrip.show();
    })
    .catch((error) => {
      reportStatus(`Encountered an error while loading trips: ${error.message}`);
      console.log(error);
    });
};

const readFormData = () => {
  const parsedFormData = {};

  for (let currentInput of inputs) {
    const currentData = $(`#reservation-form input[name="${currentInput}"]`).val();
    parsedFormData[currentInput] = currentData ? currentData : undefined;
  }

  return parsedFormData;
};

const clearForm = () => {
  for (let currentInput of inputs) {
    $(`#reservation-form input[name="${currentInput}"]`).val('');
  }
};

const createReservation = (event) => {
  event.preventDefault();

  const reservationData = readFormData();
  const tripID = reservationData.id;

  reportStatus('Sending reservation data...');

  axios.post(URL + tripID + '/reservations', reservationData)
    .then((response) => {
      reportStatus(`Successfully added a reservation for trip ${reservationData.trip}!`);
      clearForm();
    })
    .catch((error) => {
      console.log(error.response);
      if (error.response.data && error.response.data.errors) {
        reportError(
          `Encountered an error: ${error.message}`,
          error.response.data.errors
        );
      } else {
        reportStatus(`Encountered an error: ${error.message}`);
      }
    });
};


// ON LOAD...

$(document).ready(() => {
  tripDetails.hide();
  reserveTrip.hide();

  $('#load').click(loadTrips);

  $('#trip-list').on('click', 'a', loadDetail);

  $('#reservation-form').submit(createReservation);
});