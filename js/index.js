var localEndPoint = "http://localhost:8080";
var serverEndPoint = "https://wilmanagementsystem.azurewebsites.net/";
var baseAddress = serverEndPoint;

$(document).ready(function () {

    $("#signUpButton").click(function (e) {
        $("body").pagecontainer("change", "#userCreationPage");
    });

    $("#getStudentCreationForm").click(function (e) {
        $("body").pagecontainer("change", "#studentCreationPage");
    });
    $("#getPartnerCreationForm").click(function (e) {
        $("body").pagecontainer("change", "#partnerCreationPage");
    });

    $("#createStudentAccount").click(function (e) {
        if(createStudentAccount()){
            alert("Account creation successful");
            $("accountCreationMessage").text = "The Partner account was successfully created.";
            $("body").pagecontainer("change", "#accountCreationResultPage");
        }
    });

    $("#createPartnerAccount").click(function (e) {
        if(createPartnerAccount()){
            alert("Account creation successful");
            $("accountCreationMessage").text = "The Student account was successfully created.";
            $("body").pagecontainer("change", "#accountCreationResultPage");
        }
    });

    $(".homePageLink").click(function (e) {
        $("body").pagecontainer("change", "#home");
    });

    
});

// function fetchData(){
//     var parent = document.getElementById('test');
//     parent.innerHTML = "calling api...";

//     $.ajax({
//         url: baseAddress + "/api/v1/student/all",
//         type: 'GET',
//         dataType: 'json', // added data type
//         headers: {
//             'Content-Type': 'application/x-www-form-urlencoded',
//             'Access-Control-Allow-Origin': '*'
//         },
//         success: function(res) {
//             processApiData(JSON.stringify(res));
//             alert(JSON.stringify(res));
//         }
//     });
    
// }

// function processApiData(response){
//     var parent = document.getElementById('test');
//     parent.innerHTML = response;
// }

// function createStudentAccount(){
//     alert("Submitting");
//     var student = {};
//     student['id'] = document.getElementById("studentId").value;
//     student['name'] = document.getElementById("studentName").value;
//     var dob = document.getElementById("studentDob").value;
//     student['dob'] = ddmmyyyy(dob);
//     student['email'] = document.getElementById("studentEmail").value;
//     alert(JSON.stringify(student));
//     addStudent(student);
//     // document.getElementById('studentCreationForm').submit();
// }

// function addStudent(s){
//     var settings = {
//         "url": baseAddress + "/api/v1/user/addStudent",
//         "method": "POST",
//         "timeout": 0,
//         "headers": {
//           "Content-Type": "application/json"
//         },
//         "data": JSON.stringify(s),
//       };
      
//       $.ajax(settings).done(function (res) {
//         alert(JSON.stringify(res));
//       });
// }

// function ddmmyyyy(d) {
//     var date = new Date(d);
//     var mm = date.getMonth() + 1; // getMonth() is zero-based
//     var dd = date.getDate();
  
//     return ((dd>9 ? '' : '0') + dd + '/'+
//     (mm>9 ? '' : '0') + mm + '/'+
//     date.getFullYear());
// }

function createStudentAccount(){
    var form = document.getElementById('studentCreationForm');
    var student = {};
    student['username'] = form['username'].value;

    var password1 = form['passwordStudent'].value;
    var password2 = form['RePasswordStudent'].value;

    if(password1 != password2){
        $("#rePassStudentMessage").text("the password doesn't match");
        $("#RePasswordStudent").focus();
        return false;
    }else{
        $("#rePassStudentMessage").text("");
    }

    student['password'] = password1;
    student['name'] = form['name'].value;
    student['studentId'] = form['studentId'].value;
    student['email'] = form['email'].value;
    student['phone'] = form['phone'].value;

    PostStudentAccount(student);
}

function createPartnerAccount(){
    var form = document.getElementById('partnerCreationForm');
    var partner = {};
    partner['username'] = form['username'].value;

    var password1 = form['partnerPassword'].value;
    var password2 = form['partnerRePassword'].value;

    if(password1 != password2){
        $("#rePassPartnerMessage").text("the password doesn't match");
        $("#partnerRePassword").focus();
        return false;
    }else{
        $("#rePassPartnerMessage").text("");
    }

    partner['password'] = password1;
    partner['name'] = form['name'].value;
    partner['businessName'] = form['businessName'].value;
    partner['email'] = form['email'].value;
    partner['phone'] = form['phone'].value;

    PostPartnerAccount(partner);
}

function PostStudentAccount(student){
    var settings = {
        "url": baseAddress + "/api/v1/user/addStudent",
        "method": "POST",
        "timeout": 0,
        "headers": {
          "Content-Type": "application/json"
        },
        "data": JSON.stringify(student),
      };
      
      $.ajax(settings).done(function (res) {
        document.getElementById('accountCreationMessage').innerHTML = "The Student account was successfully created.";
        $("body").pagecontainer("change", "#accountCreationResultPage");
      }).fail(function (error){
        document.getElementById('accountCreationMessage').innerHTML = "An Error occured during the Student account creation. Error Message: " + error.responseText;
        $("body").pagecontainer("change", "#accountCreationResultPage");
      });
}

function PostPartnerAccount(partner){
    var settings = {
        "url": baseAddress + "/api/v1/user/addPartner",
        "method": "POST",
        "timeout": 0,
        "headers": {
          "Content-Type": "application/json"
        },
        "data": JSON.stringify(partner),
      };
      
      $.ajax(settings).done(function (res) {
        document.getElementById('accountCreationMessage').innerHTML = "The Partner account was successfully created.";
        $("body").pagecontainer("change", "#accountCreationResultPage");
      }).fail(function (error){
        document.getElementById('accountCreationMessage').innerHTML = "An Error occured during the Partner account creation. Error Message: " + error.responseText;
        $("body").pagecontainer("change", "#accountCreationResultPage");
      });
}

function signIn(){
    var form = document.getElementById("userLoginForm");
    var username = form["username"].value;
    var password = form["password"].value;
    login(username,password);
}

function login(username, password){
    var settings = {
        "url": baseAddress + `/api/v1/user/getUser/${username}/${password}`,
        "method": "GET",
        "timeout": 0,
        "headers": {
          "Content-Type": "application/json"
        }
      };
      
      $.ajax(settings).done(function (res) {
        document.getElementById("loginErrorMessage").innerHTML = "";
        redirectUser(res);
      }).fail(function(data){
        document.getElementById("loginErrorMessage").innerHTML = data.responseJSON.message;
      });
}

function redirectUser(res){
    storeUserInLocalStoreage(res);
    if(res["dtype"] == "Student"){
        window.location.href = "html/jobboard.html";
    }else if(res["dtype"] == "Partner"){
        window.location.href = "html/jobboard.html";
    }else if(res["dtype"] == "Admin"){
        window.location.href = "html/jobboard.html";
    }else{
        alert("error while trying to parse the user");
        window.location.href = "index.html";
    }
}

function storeUserInLocalStoreage(user){
    localStorage.setItem("user",JSON.stringify(user));
}
