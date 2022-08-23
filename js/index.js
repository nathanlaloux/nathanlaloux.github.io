// $(document).ready(function () {
//     $(".apiCallButton").click(function (e) {

//     });
// });

function fetchData(){
    var parent = document.getElementById('test');
    parent.innerHTML = "calling api...";

    $.ajax({
        url: "http://localhost:8080/api/v1/student/all",
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
    });
    
}

function processApiData(response){
    var parent = document.getElementById('test');
    parent.innerHTML = response;
}

function createStudentAccount(){
    alert("Submitting");
    var student = {};
    student['id'] = document.getElementById("studentId").value;
    student['name'] = document.getElementById("studentName").value;
    var dob = document.getElementById("studentDob").value;
    student['dob'] = ddmmyyyy(dob);
    student['email'] = document.getElementById("studentEmail").value;
    alert(JSON.stringify(student));
    addStudent(student);
    // document.getElementById('studentCreationForm').submit();
}

function addStudent(s){
    var settings = {
        "url": "http://localhost:8080/api/v1/student/add",
        "method": "POST",
        "timeout": 0,
        "headers": {
          "Content-Type": "application/json"
        },
        "data": JSON.stringify(s),
      };
      
      $.ajax(settings).done(function (res) {
        alert(JSON.stringify(res));
      });
}

function ddmmyyyy(d) {
    var date = new Date(d);
    var mm = date.getMonth() + 1; // getMonth() is zero-based
    var dd = date.getDate();
  
    return ((dd>9 ? '' : '0') + dd + '/'+
    (mm>9 ? '' : '0') + mm + '/'+
    date.getFullYear());
}
  

