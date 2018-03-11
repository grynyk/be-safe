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
    sendToCommandCentralInfo(_type,_description,_dateAndTime);

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
                title: 'your location',
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


//FOR MOTOROLA SOLUTIONS
function sendToCommandCentralInfo(type, description, dateAndTime) {
    const eventBody = {
        "metaHeader": {
            // Date, when event really occured
            "metaTimeStamp": "2018-03-01T15:00:00.000Z",
            // Label
            "metaEventTypeLabel": "John"
        },
        "eventHeader": {
            // Unique event ID
            "id": "officer-john-1",
            // Descriptive Label
            "label": "Officer John 1",
            // Event reported
            "timeStamp": "2018-03-01T15:00:00.000Z",
            "location": {
                // map coordinates - latitude
                "latitude": 50.051854,
                // map coordinates - longitude
                "longitude": 19.941407
            },
            // detailed description - visible in map popup
            "detailedDescription": "Officer John - found a homeless person taking drugs.",
            "icon": {
                // icon url - could be custom source, or predefined (format MsiIcon://{name})
                "url": "MsiIcon://ic_unit_police_sirens"
            },
            // timestamp, when event will expire (gone from map and layers panel)
            "expirationTimeStamp": "2018-03-01T16:00:00.000Z",
            // available priorities: 'emergency' | 'high' | 'medium' | 'low' | 'diagnostic' | 'unknown'
            // emergency priority is treated specially (events are marked red)
            "priority": "high",
            // an array of attachments
            "attachments": [
                {
                    // Title of Attachment
                    "name": "Incident Location (external)",
                    // content type
                    // see https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types
                    "contentType": "application/link",
                    // url to source
                    "url": "https://goo.gl/maps/Yiz4TLDBF3L2"
                }, {
                    "name": "Incident image",
                    "contentType": "image/jpeg",
                    "url": "https://www.motorolasolutions.com/content/dam/msi/images/en-xw/brand_stories/lte-broadband-lex-brandstory-1160x308.jpg"
                }
            ]
        }
    };
 
    var settings = {
        "async": true,
        "crossDomain": true,
        "url": "https://hacknarok.release.commandcentral.com/",
        "method": "PUT",
        "headers": {
            "Authorization": "Basic QWlkN21zdU5nenU5ZUVq",
            "Content-Type": "application/json"
                },
        "data": eventBody
    }
 
    $.ajax(settings).done(function (response) {
        console.log(response);
    });
}