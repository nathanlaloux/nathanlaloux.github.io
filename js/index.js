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

function createStudentAccount(){
    alert("Submitting");
    var student = {};
    student.id = document.getElementById("studentId").value;
    student.name = document.getElementById("studentName").value;
    student.dob = document.getElementById("studentDob").value;
    student.email = document.getElementById("studentEmail").value;

    addStudent(student);
    // document.getElementById('studentCreationForm').submit();
}

function addStudent(s){
    $.ajax({
        url: "https://wilmanagementsystem.azurewebsites.net/api/v1/student/add",
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(s),
        dataType: 'json', // added data type
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Access-Control-Allow-Origin': '*'
        },
        success: function(res) {
            alert(JSON.stringify(res));
        },
        error: function(res){
            alert('error: ' + JSON.stringify(res));
        }
        // put in error handling
    });
}

