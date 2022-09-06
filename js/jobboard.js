var user = {};
var userType = "";
const ADMIN = "Admin";
const STUDENT = "Student";

$(document).ready(function () {

    initializeUser();
    initializeView();

    $("#menuPanel").panel();
    $('#menuListview').listview().listview('refresh');

    // MENU --------------------------------
    $(".menu").click(function () {
           $("#menuPanel").panel("open");
    });
        // ------END MENU ----------


    $("#jobBoardLink").click(function (e) {
        window.location.href = "jobboard.html";
    });

    $("#forumLink").click(function (e) {
        window.location.href = "forum.html";
    });

    $("#getPartnerCreationForm").click(function (e) {
        $("body").pagecontainer("change", "#partnerCreationPage");
    });   
});

function initializeUser(){
    
    var userObj = JSON.parse(localStorage.getItem("user"));

    if(!userObj){
        window.location.href = "../index.html";
    }

    if(!(userObj["dtype"] == "Admin" || userObj["dtype"] == "Partner" || userObj["dtype"] == "Student")){
        window.location.href = "../index.html";
    }else{
        userType = userObj["dtype"];
        user = userObj["user"];
    }
}

function initializeView(){
    if(userType == STUDENT){
        
    }
}