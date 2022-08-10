// $(document).ready(function () {
//     $(".apiCallButton").click(function (e) {

//     });
// });

function fetchData(){
    var parent = document.getElementById('test');
    parent.innerHTML = "calling api...";
    
    $.ajax({
        url: "https://wilmanagementsystem.azurewebsites.net/api/v1/student",
        type: 'GET',
        dataType: 'json', // added data type
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Access-Control-Allow-Origin': '*'
        },
        success: function(res) {
            processApiData(JSON.stringify(res));
            alert(JSON.stringify(res));
        }
        // put in error handling
    });
    
    // fetch('https://wilmanagementsystem.azurewebsites.net/api/v1/student')
    //     .then(response => response.json())
    //     .then(response => processApiData(response))
    //     .catch(err => console.error(err));
}

function processApiData(response){
    var parent = document.getElementById('test');
    parent.innerHTML = response;
}

