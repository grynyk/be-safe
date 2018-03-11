/*
LOCAL VARS = _name
GLOBAL VARS = Name
FUNCTION ARGUMENTS = name
*/

let MarkerList = null;
let GoogleMap = null;
let UserPosition = null;
let Type = null;
let Description = null;
let DateAndTime = null;


function InitFirebase() {  //INIT OF FIREBASE DATABASE
    var config = {
        apiKey: "AIzaSyDf0HHMffQxBycIAA2O-V1QaCD0qZmbVk8",
        authDomain: "besafe-2018.firebaseapp.com",
        databaseURL: "https://besafe-2018.firebaseio.com",
        projectId: "besafe-2018",
        storageBucket: "",
        messagingSenderId: "827771907476"
    };
    firebase.initializeApp(config);

    console.log("InitFirebase");
}

function getFirebaseData() {  //FIREBASE DATA GETTER
    var _markerList = [];

    var _markers = firebase.database().ref('Marker');
    _markers.on('value', function (snapshot) {
        snapshot.forEach(function (childSnapshot) {
            _markerList.push(childSnapshot.val());
        });
    });

    MarkerList = _markerList;
    console.log("getFirebaseData");
}

function sendFirebaseData() {
    let [_type, _description] = getTypeAndDescription();
    let _dateAndTime = calculateDate();
    // Reference to your entire Firebase database
    var _myFirebase = firebase.database().ref();
    // Get a reference to the recommendations object of your Firebase.
    // Note: this doesn't exist yet. But when we write to our Firebase using
    // this reference, it will create this object for us!
    var _marker = _myFirebase.child("Marker");

    // Push our first recommendation to the end of the list and assign it a
    // unique ID automatically.
    _marker.push({
        "type": _type,
        "position": UserPosition,
        "description": _description,
        "dateAndTime": _dateAndTime
    });
}

function formMsgSend() {
    var msg = document.getElementById('msgSent');
    msg.innerText = "Your application was sent successfull";
    msg.style = "display:inline-block";
    var frm = document.querySelector('#description_form');
    frm.reset();  // Reset all form data
    setTimeout(function () { window.location.href = "#t3"; msg.style = "display:none"; }, 900);

    return false; // Prevent page refresh
}
function calculateDate() {
    var _today = new Date();
    var _dd = _today.getDate();
    var _mm = _today.getMonth() + 1; //January is 0!
    var _yyyy = _today.getFullYear();
    var _hh = _today.getHours();
    var _min = _today.getMinutes();

    if (_dd < 10) { _dd = '0' + _dd }
    if (_mm < 10) { _mm = '0' + _mm }
    _today = "Date: " + _mm + '/' + _dd + '/' + _yyyy + " Time: " + _hh + ":" + _min;
    DateAndTime = _today;
    return _today;
}

function initMap() {
    let _map = new google.maps.Map(document.getElementById('map'), { zoom: 12 });

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            UserPosition = pos;

            _map.setCenter(pos);
            //            console.log(pos);
            var _marker = new google.maps.Marker({
                position: pos,
                map: _map,
                title: '(Ayers Rock)',
                anchorPoint: new google.maps.Point(0, -2),
                draggable: true

            });
            google.maps.event.addListener(_marker, 'dragend', function () {
                pos = { lat: _marker.getPosition().lat(), lng: _marker.getPosition().lng() }
                UserPosition = pos;
                handleMarkerInsert();
                window.location.href = "#t2";

            })



        }, function () {
            handleLocationError(true, infoWindow, _map.getCenter());
        });
    } else {
        // Browser doesn't support Geolocation
        handleLocationError(false, infoWindow, _map.getCenter());
    }

    GoogleMap = _map;
    console.log("MapINIT");
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(browserHasGeolocation ?
        'Error: The Geolocation service failed.' :
        'Error: Your browser doesn\'t support geolocation.');
}

function getTypeAndDescription() {
    var _type = document.getElementById("Select-Section").value;
    var _description = document.getElementById('POST-name').value;

    //SETTING GLOBAL VARS
    Type = _type;
    Description = _description;

    return [_type, _description];
}

function handleMarkerInsert() {
    if (MarkerList) {
        MarkerList.forEach(marker => {
            var temp_icon;
            switch (marker.type) {
                case 'Car accident':
                    temp_icon = './img/car-collision.png';
                    break;
                case 'Lost item':
                    temp_icon = './img/lost-items.png';
                    break;
                case 'Murder accident':
                    temp_icon = './img/stab-wounds.png';
                    break;
                case 'Theft accident':
                    temp_icon = './img/thief.png';
                    break;

                default:
                    break;

            }
            var _map_marker = new google.maps.Marker({
                position: marker.position,
                map: GoogleMap,
                title: marker.description,
                icon: temp_icon
            });
            let contentString = `
            <p class="h1 font-weight-bold text-center text-danger" >${marker.type}.</p>
            <br>
            <p class="h3 font-weight-normal text-danger">${marker.description}</p>
            <br>
            <p class="h5 font-italic text-danger">${marker.dateAndTime}</p>
            </div>
            `;

            var infowindow = new google.maps.InfoWindow({
                content: contentString
            });

            _map_marker.addListener('click', function () {
                infowindow.open(GoogleMap, _map_marker);
            });
            console.log("handleMarkerInsert");
        }
        )
    }
}