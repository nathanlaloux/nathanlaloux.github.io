var user = {};
var localEndPoint = "http://localhost:8080";
var serverEndPoint = "https://wilmanagementsystem.azurewebsites.net/";
var baseAddress = localEndPoint;
var messageUsers = [];
var messageCurrentUser = {};
var currentDiscussion = {};
var discussionList = [];
var categoryList = [];
var jobList = [];
var currentJobDetails = {};
var interestApplications = [];

const ADMIN = "Admin";
const STUDENT = "Student";
const PARTNER = "Partner";

// var spinner = function () {
//     setTimeout(function () {
//         if ($('#spinner').length > 0) {
//             $('#spinner').removeClass('show');
//         }
//     }, 5);
// };

(function ($) {
    "use strict";

    // ------ Overall controls ---------- //

    // Spinner
    var spinner = function () {
        setTimeout(function () {
            if ($('#spinner').length > 0) {
                $('#spinner').removeClass('show');
            }
        }, 5);
    };
    spinner();
    
    
    // Back to top button
    $(window).scroll(function () {
        if ($(this).scrollTop() > 300) {
            $('.back-to-top').fadeIn('slow');
        } else {
            $('.back-to-top').fadeOut('slow');
        }
    });
    
    $('.back-to-top').click(function () {
        $('html, body').animate({scrollTop: 0}, 1500, 'easeInOutExpo');
        return false;
    });
    
    // Sidebar Toggler
    $('.sidebar-toggler').click(function () {
        $('.sidebar, .content').toggleClass("open");
        return false;
    });

    // ------ Job Board controls ---------- //

    $("#createNewJobPostButton").click(function (e) {
        navigateTo("newjobpost.html");
    });
    
    $("#newJobPostSubmit").click(function (e) {
        createNewJobPost();
    });

    $("#jobCategoryFilterButton").click(function (e) {
        filterJobCategories();
    });

    $("#submitInterestApplicationButton").click(function (e) {
        createInterestApplication();
    });

    $("#editJobPostSubmit").click(function (e) {
        editJobPost();
    });
    
    

    // ------ forum controls ---------- //

    $("#newForumPostSubmit").click(function (e) {
        createNewForumPost();
    });

    $("#forumReplySubmit").click(function (e) {
        createForumReply();
    });

    $("#editForumPostSubmit").click(function (e) {
        editForumPost();
    });


    

    // ------ User controls ---------- //
    
    $("#studentSignupSubmit").click(function (e) {
        createStudentAccount();
    });

    $("#partnerSignupSubmit").click(function (e) {
        createPartnerAccount();
    });

    $(".logoutLink").click(function (e) {
        localStorage.clear();
        window.location.href = "index.html";
    });

    $("#editProfileButton").click(function (e) {
        editProfile();
    });

    

    // ------ Messaging ---------- //

    $("#newMessageButton").click(function (e) {
        createNewMessage();
    });

    $("#messageUserSearchButton").click(function (e) {
        searchMessageUser();
    });

    $("#browseAllUsersButton").click(function (e) {
        searchMessageUser(true);
    });

})(jQuery);

    // ------ User controls ---------- //

function initialization(){
    initializeUser();
}

function initializeUser(){
    
    var userObj = JSON.parse(localStorage.getItem("user"));
    user = userObj;
    InitializeMenu();
    var p = window.location.pathname;

    if(!userObj){
        hidingUserNav();
        // var p = window.location.href;
        // if (!(p.length === 0 || p === "/" || p.match(/^\/?index/))){window.location.href = "index.html";}
        return;
    }else if(!(userObj["dtype"] == "Admin" || userObj["dtype"] == "Partner" || userObj["dtype"] == "Student")){
        hidingUserNav();
        // if (!(p.length === 0 || p === "/" || p.match(/^\/?index/))){window.location.href = "index.html";}
        // if(window.location.href != "index.html"){window.location.href = "index.html";}
        return;
    }else{
        user = userObj;
    }

    var nameFields = document.getElementsByClassName("userName");

    for(index = 0; index < nameFields.length; index++ ){
        nameFields[index].innerText = user.name;
    }

    var typeFields = document.getElementsByClassName("userType");

    for(index = 0; index < typeFields.length; index++ ){
        typeFields[index].innerText = user.dtype;
    }

}

function hidingUserNav(){
    var usernavs = document.getElementsByClassName('userNav');
    for(var index = 0; index < usernavs.length; index++){
        usernavs[index].className = "hide";
    }
}

function jobBoardInit(){
    getJobs(); 
    setCategoriesForFiltering(); 
    hideCreateJobButton();
}

function InitializeMenu(){
    var container = document.getElementById('menuListview');
    container.innerHTML = '';

    container.appendChild(createMenuItem("index.html","fa fa-home", "Home"));
    container.appendChild(createMenuItem("contactus.html","fa fa-address-book", "Contact Us"));
    container.appendChild(createMenuItem("aboutus.html","fa fa-info-circle", "About Us"));

    if(user == null){
        container.appendChild(createMenuItem("signin.html","fas fa-sign-in-alt", "Signin"));
        return;
    }

    if(user.dtype == ADMIN){
        container.appendChild(createMenuItem("dashboard.html","fa fa-tachometer-alt", "Dashboard"));
    }

    if(user.dtype == ADMIN || user.dtype == STUDENT || user.dtype == PARTNER ){
        container.appendChild(createMenuItem("jobboard.html","fa fa-briefcase", "Job Board"));
        container.appendChild(createMenuItem("forum.html","fa fa-comments", "Forum"));
        container.appendChild(createMenuItem("messages.html","fa fa-envelope", "Messages"));
    }else{
        container.appendChild(createMenuItem("signin.html","fa fa-tachometer-alt", "Signin"));
    }
    

}

function createMenuItem(link, icon, title){
    var a = createNewElement('a',"nav-item nav-link");
    a.href = link;
    var i = createNewElement('i', icon + " me-2");
    a.appendChild(i);
    a.innerHTML += title;
    return a;
}

function createNewElement(type, className){
    var element = document.createElement(type);
    element.className = className;
    return element;
}

 // ------ Dashboard Canvas ---------- //

 function getDashboardData(){
    showSpinner();

    var settings = {
        "url": baseAddress + `/api/v1/dashboard/all`,
        "method": "GET",
        "timeout": 0,
        "headers": {
          "Content-Type": "application/json"
        }
      };
      
      return $.ajax(settings);
 }

function loadDashboard(){
    getDashboardData().done(function (res) {
        // alert(JSON.stringify(res));
        // interestApplications = res;
        processDashboardData(res);
        hideSpinner();
        // displayInterestApplications(res, job);
      }).fail(function (error){
        hideSpinner();
        alert(JSON.stringify(error));
    });
}

        
function processDashboardData(res){

    var userStat = res["userStat"];
    var userLabels = [];
    var userData = [];
    var userColors = [];
    for(var index = 0; index < userStat.length; index++){
        if(userStat[index]){
            userLabels.push(userStat[index][0]);
            userData.push(userStat[index][1]);
            userColors.push("rgb(193, 216, 47, ." + index + 3 + ")");
        }
    }
    var userChart = $("#userStat").get(0).getContext("2d");
    loadPieChart(userChart, userLabels, userData, userColors);

    var messageStat = res["messagesStat"];
    if(messageStat){
        var messageGroup = processDatesChart(messageStat);
        var discussionChart = $("#discussionStat").get(0).getContext("2d");
        loadLineChart(discussionChart, messageGroup.labels, messageGroup.data, "Number of messenges sent");
    }
   
    var jobStat = res["jobStat"];
    if(jobStat){
        var jobGroup = processDatesChart(jobStat);
        var jobChart = $("#jobStat").get(0).getContext("2d");
        loadLineChart(jobChart, jobGroup.labels, jobGroup.data, "Number of job post Created");
    }

    var interestApplicationsStat = res["interestApplicationStat"];
    if(interestApplicationsStat){
        var interestApplicationsGroup = processDatesChart(interestApplicationsStat);
        var interestApplicationsChart = $("#interestApplicationsStat").get(0).getContext("2d");
        loadLineChart(interestApplicationsChart, interestApplicationsGroup.labels, interestApplicationsGroup.data, "Number of student interest application submitted");
    }

    var forumStat = res["forumStat"];
    if(forumStat){
        var forumGroup = processDatesChart(forumStat);
        var forumChart = $("#forumStat").get(0).getContext("2d");
        loadLineChart(forumChart, forumGroup.labels, forumGroup.data, "Number of forum post created");
    }
}

function processDatesChart(statData){
    var map = {};
    var uniqueValues = [];
    for(var index = 0; index < statData.length; index++){
        var date = statData[index].substring(0, statData[index].indexOf("T"));
        if(map[date]){
            map[date] = map[date] + 1;
        }else{
            map[date] = 1;
            uniqueValues.push(date);
        }
    }

    var labels = [];
    var data = [];
    for(var index = 0; index < uniqueValues.length; index++){
        if(map[uniqueValues[index]]){
            labels.push(uniqueValues[index]);
            data.push(map[uniqueValues[index]]);
        }
    }

    var stat = {};
    stat.labels = labels;
    stat.data = data;

    // alert(JSON.stringify(labels));
    return stat;
}

function loadPieChart(element, labels, data, colors){
    var pieChart = new Chart(element, {
        type: "pie",
        data: {
            labels: labels,
            datasets: [{
                backgroundColor: colors,
                data: data
            }]
        },
        options: {
            responsive: true,
        }
    });
}
 
function loadLineChart(element, labels, data, labelDescription){
    var lineChart = new Chart(element, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [{
                label: labelDescription,
                fill: false,
                backgroundColor: "rgb(193, 216, 47, .7)",
                data: data
            }]
        },
        options: {
            responsive: true
        }
    });
}
   

// ------ Interest Application ---------- //


function createInterestApplication(){
    var ia = {};
    var message = document.getElementById('interestApplicationMessage');
    var resume = document.getElementById('resumeFormFile');
    if(!resume.files[0]){
        alert("no files selected.");
        return;
    }

    var job = retrieveObject("currentJobDetails");
    ia.message = message.value;
    ia.student = user;
    ia.jobId = job.id;

    var formData = new FormData();
    formData.append('object', new Blob([JSON.stringify(ia)], {
        type: "application/json"
    }));
    formData.append('file', resume.files[0]);

    postInterestApplication(formData);

}

function postInterestApplication(formData){
    var settings = {
        // "enctype": 'multipart/form-data',
        "url": baseAddress + "/api/v1/job/addinterestapplication",
        "method": "POST",
        "processData": false,
        "contentType": false,
        "timeout": 0,
        "headers": {
        //   "Content-Type": "application-octet-stream"
        // "Content-Type": "application/json"

        //   'Content-Type': 'multipart/form-data',
        //   'Accept': 'application/json',
        },
        "data": formData,
      };
      
      $.ajax(settings).done(function (res) {
        // alert(JSON.stringify(res));
        navigateTo("jobboard.html");
        // displayConversation(currentDiscussion);
      }).fail(function (error){
        alert(JSON.stringify(error));
    });
}

function setInterestApplications(){
    var job = retrieveObject("currentJobDetails");

    getInterestApplications(job);

}

function getInterestApplications(job){
    showSpinner();

    var settings = {
        "url": baseAddress + `/api/v1/job/allinterestapplications/${job.id}`,
        "method": "GET",
        "timeout": 0,
        "headers": {
          "Content-Type": "application/json"
        }
      };
      
      $.ajax(settings).done(function (res) {
        // alert(JSON.stringify(res));
        interestApplications = res;
        hideSpinner();
        displayInterestApplications(res, job);
      }).fail(function (error){
        hideSpinner();
        alert(JSON.stringify(error));
    });

}

function displayInterestApplications(applications, job){
    var container = document.getElementById('interestApplications');
    container.innerHTML = '';
    for(var index = 0; index < applications.length; index++){
        displayInterestApplication(applications[index],job, container);
    }
}

function displayInterestApplication(application, job, container){


    var styleContainer = document.createElement('div');
    styleContainer.className = "black-background jobPost rounded h-100 p-4";


    //infosec
    var infoSection = document.createElement('div');
    infoSection.className = "jobPostInfoSection";

    var titleDiv = document.createElement('div');
    titleDiv.className = "jobPostTitle primary-text";
    titleDiv.innerHTML = application.student.name;

//     var titleLink = document.createElement('a');
//     var titleLinkId = "jobLink" + job.id;
//     titleLink.id = titleLinkId;
//     titleLink.href = "#";
//     titleLink.innerText = job.title;
//     titleDiv.appendChild(titleLink);

//     $(document).on('click', "#" + titleLinkId , function() {
//         localStorage.setItem("currentJobDetails",JSON.stringify(job));
//         navigateTo("jobdetails.html");
//    });

    var descriptionDiv = document.createElement('div');
    descriptionDiv.className = "jobPostDescription text-justify";
    descriptionDiv.innerHTML = application.message;

    var categoryDiv = document.createElement('div');
    categoryDiv.className = "jobPostCategory";
    categoryDiv.innerText = job.category.category;

    var authorDiv = document.createElement('div');
    authorDiv.className = "jobPostAuthor";
    authorDiv.innerHTML = "Posted on the " + application.postedDate.replace("T"," at ");;
  
    infoSection.appendChild(titleDiv);
    infoSection.appendChild(descriptionDiv);
    infoSection.appendChild(categoryDiv);
    infoSection.appendChild(authorDiv);

    styleContainer.appendChild(infoSection);

    //control
    var controlDiv = document.createElement('div');
    controlDiv.className = "jobPostControlSection";

    var downloadbutton = document.createElement('button');
    downloadbutton.className = "btn btn-primary";
    downloadbutton.innerText = "Download Resume";
    var downloadbuttonId = "downloadbutton" + application.id;
    downloadbutton.id = downloadbuttonId;
    controlDiv.appendChild(downloadbutton);

    $(document).on('click', "#" + downloadbuttonId , function() {
        // messageCurrentUser = usr;
        // getResume(application.id).done(function (res) {
        //     // alert(JSON.stringify(res));
        //     // downloadFile(res.resume,"resume.docx");
        //     // interestApplications = res;
        //     hideSpinner();
        //     // displayInterestApplications(res, job);
        //   }).fail(function (error){
        //     hideSpinner();
        //     alert(JSON.stringify(error));
        // });
        window.open(baseAddress + `/api/v1/job/getresume/${application.id}`, '_blank').focus();
        // alert(blob);
        // displayConversationName(messageCurrentUser['name']);
        // GetDiscussion(messageCurrentUser);
        // alert(" Doanload button for application: " + downloadbuttonId);
    });

    // var messageButton = document.createElement('button');
    // messageButton.className = "btn btn-primary";
    // messageButton.innerText = "Message Applicant";
    // var messageButtonId = "messageButton" + application.id;
    // messageButton.id = messageButtonId;
    // controlDiv.appendChild(messageButton);

    // $(document).on('click', "#" + messageButtonId , function() {
    //     // messageCurrentUser = usr;
    //     // displayConversationName(messageCurrentUser['name']);
    //     // GetDiscussion(messageCurrentUser);
    //     alert("Message Applicant button for application: " + messageButtonId);
    // });

    // var viewApplicationButton = document.createElement('button');
    // viewApplicationButton.className = "btn btn-primary";
    // viewApplicationButton.innerText = "View Applications";
    // var viewApplicationButtonId = "viewApplication" + job.id;
    // viewApplicationButton.id = viewApplicationButtonId;
    // controlDiv.appendChild(viewApplicationButton);

    // $(document).on('click', "#" + viewApplicationButtonId , function() {
    //     // messageCurrentUser = usr;
    //     // displayConversationName(messageCurrentUser['name']);
    //     // GetDiscussion(messageCurrentUser);
    //     localStorage.setItem("currentJobDetails",JSON.stringify(job));
    //     navigateTo("viewapplications.html");
    // });

    styleContainer.appendChild(controlDiv);

    container.appendChild(styleContainer);


}

function getResume(id){
    showSpinner();

    var settings = {
        "url": baseAddress + `/api/v1/job/getresume/${id}`,
        "method": "GET",
        "timeout": 0,
        "headers": {
          "Content-Type": "application/json"
        }
      };
      
      return $.ajax(settings);

}

// function downloadFile(data, name = "resume.docx", element){
//     const blob = new Blob([data], {type : "octet-stream"});

//     const href = URL.createObjectURL(blob);

//     const newElem = Object.assign(element, {
//         href,
//         style: "display: none",
//         download: name
//     });

//     // newElem.click();
//     // URL.revokeObjectURL(href);
//     // newElem.remove();
// }

function downloadFile(data, filename) {
    var file = new Blob([data], {type: "octet-stream"});
    if (window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveOrOpenBlob(file, filename); //IE 10+
    } else {
        var a = document.createElement("a");
        var url = window.URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 0);
    }
}

// ------ Job Board ---------- //

function createNewJobPost(){
    var form = document.getElementById('createJobPostForm');

    var jobPost = {};
    jobPost['title'] = form['newJobPostTitle'].value;
    jobPost['company'] = user['businessName'];
    var categoryId = form['jobCategoryDopDown'].value;
    var category = categoryList.find(x => x.id == categoryId);
    jobPost['category'] = category;
    jobPost['description'] = form['newJobPostDescription'].value;
    jobPost['author'] = user;

    postNewJobPost(jobPost);

}



function postNewJobPost(jobPost){
    var settings = {
        "url": baseAddress + "/api/v1/job/addjob",
        "method": "POST",
        "timeout": 0,
        "headers": {
          "Content-Type": "application/json"
        },
        "data": JSON.stringify(jobPost),
      };
      
      $.ajax(settings).done(function (res) {
        // alert(JSON.stringify(res));
        navigateTo("jobboard.html");
        // displayConversation(currentDiscussion);
      }).fail(function (error){
        alert(JSON.stringify(error));
    });
}

function getJobs(){
    if(user.dtype == PARTNER){
        getPartnerJobs();
    }else{
        getAllJobs()
    }
}

function getPartnerJobs(){
    showSpinner();

    var settings = {
        "url": baseAddress + `/api/v1/job/getjobsbyuserid/${user.id}`,
        "method": "GET",
        "timeout": 0,
        "headers": {
          "Content-Type": "application/json"
        }
      };
      
      $.ajax(settings).done(function (res) {
        // messageUsers = res;
        // displayMessageUsers(messageUsers);
        // alert(JSON.stringify(res));
        jobList = res;
        hideSpinner();
        displayAllJobs(res);
      }).fail(function (error){
        hideSpinner();
        alert(JSON.stringify(error));
    });
}

function getAllJobs(){
    showSpinner();
    var settings = {
        "url": baseAddress + `/api/v1/job/alljobs`,
        "method": "GET",
        "timeout": 0,
        "headers": {
          "Content-Type": "application/json"
        }
      };
      
      $.ajax(settings).done(function (res) {
        // messageUsers = res;
        // displayMessageUsers(messageUsers);
        jobList = res;
        hideSpinner();
        displayAllJobs(res);
      }).fail(function (error){
        hideSpinner();
        alert(JSON.stringify(error));
    });
}

function filterJobCategories(){
    var filterList = [];
    var filterDiv = document.getElementById('jobCategoryFilter');

    for(var child = filterDiv.firstChild; child !== null; child = child.nextSibling) {
        var input = child.getElementsByTagName("input");
        if(input[0]){
            if(input[0].checked){
                filterList.push(input[0].value);
            }
        }
    }

    if(filterList.length > 0){
        var newJobList = [];

        for(var index = 0; index < filterList.length; index++){
            var filteredjobs = jobList.filter(x => x.category.id == filterList[index]);
            if(filteredjobs.length > 0){
                newJobList.push(...filteredjobs);
            }
        }

        displayAllJobs(newJobList);
    }
    else{
        displayAllJobs(jobList);
    }
}

function displayAllJobs(jobs){

    var JobContainer = document.getElementById('jobPostings');
    JobContainer.innerHTML = '';

    for(index = 0; index < jobs.length; index++){
        var job = jobs[index];
        displayJob(job, JobContainer,300);
    }
}

function displayJob(jobGlob, containerDiv, descriptionLength){

    var job = jobGlob;
    // var containerDiv = document.getElementById('jobPostings');

    var styleContainer = document.createElement('div');
    styleContainer.className = "black-background jobPost rounded h-100 p-4";


    //infosec
    var infoSection = document.createElement('div');
    infoSection.className = "jobPostInfoSection";

    var titleDiv = document.createElement('div');
    titleDiv.className = "jobPostTitle";

    var titleLink = document.createElement('a');
    var titleLinkId = "jobLink" + job.id;
    titleLink.id = titleLinkId;
    titleLink.href = "#";
    titleLink.innerText = job.title;
    titleDiv.appendChild(titleLink);

    $(document).on('click', "#" + titleLinkId , function() {
        localStorage.setItem("currentJobDetails",JSON.stringify(job));
        navigateTo("jobdetails.html");
   });

    var companyDiv = document.createElement('div');
    companyDiv.className = "jobPostCompany";
    companyDiv.innerHTML = job.company;

    var descriptionDiv = document.createElement('div');
    descriptionDiv.className = "jobPostDescription text-justify";
    descriptionDiv.innerHTML = limitCharacters(job.description,descriptionLength);

    var categoryDiv = document.createElement('div');
    categoryDiv.className = "jobPostCategory";
    categoryDiv.innerText = job.category.category;

    var authorDiv = document.createElement('div');
    authorDiv.className = "jobPostAuthor";
    authorDiv.innerHTML = job.author.name + "<br>Posted on the " + job.postedDate.replace("T"," at ");;

    var applicantsDiv = document.createElement('div');
    applicantsDiv.className = "jobPostApplicants";
    applicantsDiv.innerText = "Number of Applicants: " + job.interestApplications.length;

    

    infoSection.appendChild(titleDiv);
    infoSection.appendChild(companyDiv);
    infoSection.appendChild(descriptionDiv);
    infoSection.appendChild(categoryDiv);
    infoSection.appendChild(authorDiv);
    infoSection.appendChild(applicantsDiv);

    styleContainer.appendChild(infoSection);

    //control
    var controlDiv = document.createElement('div');
    controlDiv.className = "jobPostControlSection";

    if(user.dtype == STUDENT){
        var applyButton = document.createElement('button');
        applyButton.className = "btn btn-primary";
        var applyButtonId = "applyButton" + job.id;
        applyButton.id = applyButtonId;
        applyButton.innerText = "Apply";
        controlDiv.appendChild(applyButton);

        $(document).on('click', "#" + applyButtonId , function() {
            localStorage.setItem("currentJobDetails",JSON.stringify(job));
            navigateTo("interestapplication.html");
       });

    }else{
        var editButton = document.createElement('button');
        editButton.className = "btn btn-primary";
        editButton.innerText = "Edit";
        var editButtonId = "editButton" + job.id;
        editButton.id = editButtonId;
        controlDiv.appendChild(editButton);

        $(document).on('click', "#" + editButtonId , function() {
            // messageCurrentUser = usr;
            // displayConversationName(messageCurrentUser['name']);
            // GetDiscussion(messageCurrentUser);
            localStorage.setItem("currentJobDetails",JSON.stringify(job));
            navigateTo("editjobpost.html")
       });

        var deleteButton = document.createElement('button');
        deleteButton.className = "btn btn-primary";
        deleteButton.innerText = "Delete";
        var deleteButtonId = "deleteButton" + job.id;
        deleteButton.id = deleteButtonId;
        controlDiv.appendChild(deleteButton);

        $(document).on('click', "#" + deleteButtonId , function() {
            // messageCurrentUser = usr;
            // displayConversationName(messageCurrentUser['name']);
            // GetDiscussion(messageCurrentUser);
            // localStorage.setItem("currentJobDetails",JSON.stringify(job));
            deleteJobPost(job);
            // alert(" Delete button for Post: " + deleteButtonId);
       });

       var viewApplicationButton = document.createElement('button');
       viewApplicationButton.className = "btn btn-primary";
       viewApplicationButton.innerText = "View Applications";
       var viewApplicationButtonId = "viewApplication" + job.id;
       viewApplicationButton.id = viewApplicationButtonId;
       controlDiv.appendChild(viewApplicationButton);

       $(document).on('click', "#" + viewApplicationButtonId , function() {
           // messageCurrentUser = usr;
           // displayConversationName(messageCurrentUser['name']);
           // GetDiscussion(messageCurrentUser);
           localStorage.setItem("currentJobDetails",JSON.stringify(job));
           navigateTo("viewapplications.html");
      });
    }

    styleContainer.appendChild(controlDiv);

    containerDiv.appendChild(styleContainer);
}

function setJobCategoriesDropDown(){
    getJobCategories().done(function (res) {
        var select = document.getElementById('jobCategoryDopDown');
        select.innerHTML = '';

        //setting up category List
        categoryList = res;

        var catTitle = document.createElement('option');
        catTitle.innerText = "Job Category";
        select.appendChild(catTitle);

        for(index = 0; index < res.length; index++){
            var category = res[index];

            var option = document.createElement('option');
            option.value = category.id;
            option.innerText = category.category;

            select.appendChild(option);
        }
      }).fail(function (error){
        alert(JSON.stringify(error));
    });

}

function setCategoriesForFiltering(){
    getJobCategories().done(function (res) {
        var filter = document.getElementById('jobCategoryFilter');
        filter.innerHTML = '';

        //setting up category List
        categoryList = res;

        for(index = 0; index < res.length; index++){
            var category = res[index];

            var checkDiv = document.createElement('div');
            checkDiv.className = "form-check form-check-inline";

            var input = document.createElement('input');
            input.className = "form-check-input";
            input.type = "checkbox";
            input.id = category.id;
            input.value = category.id;

            var label = document.createElement('label');
            label.className = "form-check-label text-secondary-color";
            label.for = category.id;
            label.innerText = category.category;

            checkDiv.appendChild(input);
            checkDiv.appendChild(label);

            filter.appendChild(checkDiv);
        }
      }).fail(function (error){
        alert(JSON.stringify(error));
    });
}

function hideCreateJobButton(){
    var button = document.getElementById('newJobPostButton');
    if(user.dtype == STUDENT){
        button.className = "hide";
    }
}

function getJobCategories(){
    var settings = {
        "url": baseAddress + `/api/v1/job/getcategories`,
        "method": "GET",
        "timeout": 0,
        "headers": {
          "Content-Type": "application/json"
        }
      };
      
      return $.ajax(settings);
}

function getJobDetails(){
    var job = retrieveObject("currentJobDetails");
    var container = document.getElementById('jobDetails');
    displayJob(job, container, null);
}

function loadEditJobPost(){
    var job = retrieveObject("currentJobDetails");

    document.getElementById('newJobPostTitle').value = job.title;
    document.getElementById('newJobPostDescription').value = job.description;
    document.getElementById('jobCategoryDopDown').value = job.category.id;
}

function editJobPost(){
    var form = document.getElementById('editJobPostForm');
    var job = retrieveObject("currentJobDetails");

    job.title = form['newJobPostTitle'].value;
    job.description = form['newJobPostDescription'].value;
    job.category.id = form['jobCategoryDopDown'].value;

    var settings = {
        "url": baseAddress + "/api/v1/job/updatejob",
        "method": "PUT",
        "timeout": 0,
        "headers": {
          "Content-Type": "application/json"
        },
        "data": JSON.stringify(job),
      };
      
      $.ajax(settings).done(function (res) {
        localStorage.setItem('currentJobDetails', JSON.stringify(job));
        window.location.href = "jobboard.html";
      }).fail(function (error){
        alert(JSON.stringify(error));
      });
}

function deleteJobPost(job){
    var settings = {
        "url": baseAddress + `/api/v1/job/deletejob/${job.id}`,
        "method": "DELETE",
        "timeout": 0,
        "headers": {
          "Content-Type": "application/json"
        }
      };
      
      $.ajax(settings).done(function (res) {
        localStorage.setItem('currentJobDetails', null);
        window.location.href = "jobboard.html";
      }).fail(function (error){
        alert(JSON.stringify(error));
      });
}

// function initializeView(){
//     if(userType == STUDENT){
        
//     }
// }

    // ------ Extras ---------- //

function showSpinner(){
    $('#spinner').addClass('show');
}

function hideSpinner(){
    $('#spinner').removeClass('show');
}

    // ------ Messaging ---------- //

function createNewMessage(){
    var msgInput = document.getElementById('newMessageInput').value;
    if(!msgInput){
        return; //message is blank
    }
    if(!currentDiscussion){
        alert("the discussion is not set");
    }
    var message = {};
    message["message"] = msgInput;
    message["discussionId"] = currentDiscussion["id"];
    message["author"] = user;
    postNewMessage(message);
    document.getElementById('newMessageInput').value = '';
}

function postNewMessage(message){
    var settings = {
        "url": baseAddress + "/api/v1/discussion/addMessage",
        "method": "POST",
        "timeout": 0,
        "headers": {
          "Content-Type": "application/json"
        },
        "data": JSON.stringify(message),
      };
      
      $.ajax(settings).done(function (res) {
        currentDiscussion["messages"].push(res);
        // var messageInput = document.getElementById('newMessageInput').value;
        // messageInput = '';
        displayConversation(currentDiscussion);
      }).fail(function (error){
        alert(JSON.stringify(error));
    });
}

function searchMessageUser(browseAll = false){
    var userSearch = document.getElementById('messageUserSearchInput').value;
    var settings = {};

    if(browseAll){
        settings = {
                    "url": baseAddress + `/api/v1/user/all`,
                    "method": "GET",
                    "timeout": 0,
                    "headers": {
                    "Content-Type": "application/json"
                    }
                };
    }else{
        if(!userSearch){
            displayConversations(discussionList);
            return;
        }

        settings = {
            "url": baseAddress + `/api/v1/user/findbyname/${userSearch}`,
            "method": "GET",
            "timeout": 0,
            "headers": {
              "Content-Type": "application/json"
            }
        };
    }
    
      
    $.ajax(settings).done(function (res) {
        messageUsers = res;
        // alert(JSON.stringify(messageUsers));
        //sorting users by name alphbetically
        messageUsers.sort((a, b) => {
            const nameA = a.name.toUpperCase(); // ignore upper and lowercase
            const nameB = b.name.toUpperCase(); // ignore upper and lowercase
            if (nameA < nameB) {
              return -1;
            }
            if (nameA > nameB) {
              return 1;
            }
            // names must be equal
            return 0;
          });
        displayMessageUsers(messageUsers);
      }).fail(function (error){
        // hideSpinner();
        alert(JSON.stringify(error));
    });
}

function displayMessageUsers(userList){
    var userContainer = document.getElementById('messageUsers');
    while (userContainer.firstChild) {
        userContainer.removeChild(userContainer.firstChild);
    }
    
    for(index = 0; index < userList.length;index++){
        var usr = userList[index];
        displayMessageUser(userContainer, usr);
    }
}

function displayMessageUser(userContainer, usr){
   
    var li = document.createElement('li');
    li.className = "clearfix";

    var about = document.createElement('div');
    about.className = "about";

    var nameDiv = document.createElement('div');
    nameDiv.className = "name";

    var link = document.createElement('a');
    link.innerHTML = usr["name"] + " (" + usr['dtype'] + ")";
    var userId = "userId" + usr["id"];
    link.id = userId;
    link.href = "#";
    nameDiv.appendChild(link);

    about.appendChild(nameDiv);
    li.appendChild(about);
    userContainer.appendChild(li);

    $(document).on('click', "#" + userId , function() {
        messageCurrentUser = usr;
        displayConversationName(messageCurrentUser['name']  + " (" + messageCurrentUser['dtype'] + ")");
        GetDiscussion(messageCurrentUser);
   });
}

function GetDiscussion(messageCurrentUser){
    var settings = {
        "url": baseAddress + `/api/v1/discussion/find/${user.id}/${messageCurrentUser.id}`,
        "method": "GET",
        "timeout": 0,
        "headers": {
          "Content-Type": "application/json"
        }
      };
      
      $.ajax(settings).done(function (res) {
        currentDiscussion = res;
        // alert(currentDiscussion);
        displayConversation(currentDiscussion);
      }).fail(function (error){
        // hideSpinner();
        alert(JSON.stringify(error));
    });
}

function getAllDiscussions(){
    var settings = {
        "url": baseAddress + `/api/v1/discussion/all/${user.id}`,
        "method": "GET",
        "timeout": 0,
        "headers": {
          "Content-Type": "application/json"
        }
      };
      
      $.ajax(settings).done(function (res) {
        discussionList = res;
        displayConversations(discussionList);
        if(discussionList[0]){
            currentDiscussion = discussionList[0];
            displayConversation(currentDiscussion);
            messageCurrentUser = getDiscussionDestination(currentDiscussion);
            displayConversationName(messageCurrentUser.name  + " (" + messageCurrentUser['dtype'] + ")");
        }
      }).fail(function (error){
        // hideSpinner();
        alert(JSON.stringify(error));
    });
}

function getDiscussionDestination(discussion){
    if(discussion["source"]["id"] == user["id"]){
        return discussion["destination"];
    }else{
        return discussion["source"];
    }
}

function displayConversation(discussion){
    let discussionContainer = document.getElementById('discussionMessages');
    //remove previous conversation
    discussionContainer.innerHTML = '';
    var messages = discussion["messages"];

    for(index = 0; index < messages.length; index++){
        let message = messages[index];
        if(message["author"]["id"] == user["id"]){
            loadMessage(message, true);
        }else{
            loadMessage(message,false);
        }
    }

    let chatHistory = document.getElementsByClassName("chat-history")[0];
    chatHistory.scrollTop = chatHistory.scrollHeight;

}

function displayConversations(discussions){

    var userContainer = document.getElementById("messageUsers");
    userContainer.innerHTML = '';
    for(index = 0; index < discussions.length; index++){
        var discussion = discussions[index];

        displayMessageListOfUser(discussion);
    }
}

function displayMessageListOfUser(discussion){
    var userContainer = document.getElementById("messageUsers");

    var li = document.createElement('li');
    li.className = "clearfix";

    var about = document.createElement('div');
    about.className = "about";

    var nameDiv = document.createElement('div');
    nameDiv.className = "name";

    var link = document.createElement('a');
    var usr = {};
    
    if(discussion["source"]["id"] == user["id"]){
        usr = discussion["destination"];
    }else{
        usr = discussion["source"];
    }
    var userName = usr["name"] + " (" + usr["dtype"] + ")";
    link.innerHTML = userName;
    var userId = "userId" + usr["id"];

    link.id = userId;
    link.href = "#";
    nameDiv.appendChild(link);

    about.appendChild(nameDiv);
    li.appendChild(about);
    userContainer.appendChild(li);

    $(document).on('click', "#" + userId , function() {
        messageCurrentUser = usr;
        currentDiscussion = discussion;
        displayConversationName(userName);
        displayConversation(discussion);
   });
}



function loadMessage(message, right){
    let discussionContainer = document.getElementById('discussionMessages');

    var li = document.createElement('li');
    li.className = "clearfix";

    var timeDiv = document.createElement('div');
    if(right){timeDiv.className = "message-data text-right";}
    else{
        timeDiv.className = "message-data";
    }

    var messageDiv = document.createElement('div');
    if(right){
        messageDiv.className = "message my-message float-right";
    }else{
        messageDiv.className = "message other-message";
    }
    messageDiv.innerHTML = message["message"] + "<br>";
    var dateDiv = document.createElement('small');
    dateDiv.innerHTML = message["postedDate"].replace("T", " at ");

    messageDiv.appendChild(dateDiv);
    li.appendChild(messageDiv);

    discussionContainer.appendChild(li);
}

function displayConversationName(name){
    var userNameDiv = document.getElementById('discussionUserName');
    //remove all previous names
    while (userNameDiv.firstChild != null) {
        userNameDiv.removeChild(userNameDiv.firstChild);
    }
    var h6 = document.createElement('h6');
    h6.className = "m-b-0";
    h6.innerText = name;
    userNameDiv.appendChild(h6);
}


/* ---------  Forum --------- */

function createNewForumPost(){
    var form = document.getElementById('createForumPostForm');
    var forumPost = {};
    forumPost['title'] = form['newForumPostTitle'].value;
    forumPost['description'] = form['newForumPostContent'].value;
    forumPost['author'] = user;

    // alert(JSON.stringify(forumPost));

    postNewForumPost(forumPost);
}

function postNewForumPost(forumPost){
    $('#spinner').addClass('show');

    var settings = {
        "url": baseAddress + "/api/v1/forum/addForumPost",
        "method": "POST",
        "timeout": 0,
        "headers": {
          "Content-Type": "application/json"
        },
        "data": JSON.stringify(forumPost),
      };
      
      $.ajax(settings).done(function (res) {
        $('#spinner').removeClass('show');
        navigateTo("forum.html");
      }).fail(function (error){
        $('#spinner').removeClass('show');
        alert(JSON.stringify(error));
      });
}

function getAllForumPosts(){
    showSpinner();
    var settings = {
        "url": baseAddress + "/api/v1/forum/all",
        "method": "GET",
        "timeout": 0,
        "headers": {
          "Content-Type": "application/json"
        }
      };
      
      $.ajax(settings).done(function (res) {
        hideSpinner();
        displayForumPosts(res);
      }).fail(function (error){
        hideSpinner();
        alert(JSON.stringify(error));
    });
}

function displayForumPosts(array){
    for(var i = 0; i < array.length; i++){
        displayForumPost(array[i]);
    }
}

function createForumReply(){
    var form = document.getElementById('forumReply');
    var reply = {};
    reply['message'] = form['forumReplyContent'].value;
    reply['author'] = user;
    var forumId = retrieveObject('forumPost')['id'];
    reply['forumPostId'] = forumId;
    PostForumReply(reply);
}

function PostForumReply(reply){
    var settings = {
        "url": baseAddress + `/api/v1/forum/addMessage`,
        "method": "POST",
        "timeout": 0,
        "headers": {
          "Content-Type": "application/json"
        },
        "data": JSON.stringify(reply),
      };
      
      $.ajax(settings).done(function (res) {
        var postString = retrieveObject("forumPost");
        var messages = postString['forumMessages'];
        messages.push(res);
        displayForumPostPage(postString);
      }).fail(function (error){
        alert("failure");
    });
}

function displayForumPost(forumPost){
    // alert(JSON.stringify(forumPost));

    var container = document.getElementById("forumPosts");

    var rowDiv = document.createElement('div');
    rowDiv.className = "table-row";
    //icon
    var iconDiv = document.createElement('div');
    iconDiv.className = "status";
    var icon = document.createElement('i');
    icon.className = "fa fa-comments";
    iconDiv.appendChild(icon);
    rowDiv.appendChild(iconDiv);

    //subject
    var subjectDiv = document.createElement('div');
    subjectDiv.className = "subjects";
    var detailLink = document.createElement('a');
    detailLink.innerHTML = forumPost["title"];
    var forumPostId = "forumPostId" + forumPost["id"];
    detailLink.id = forumPostId;
    detailLink.href = "#";

    subjectDiv.appendChild(detailLink);
    var br = document.createElement('br');
    subjectDiv.appendChild(br);
    var description = document.createElement('span');
    description.innerHTML = limitCharacters(forumPost["description"],100);
    subjectDiv.appendChild(description);
    rowDiv.appendChild(subjectDiv);

    //replies
    var repliesDiv = document.createElement('div');
    repliesDiv.className = "replies";
    repliesDiv.innerHTML = forumPost["forumMessages"].length + " threads";
    rowDiv.appendChild(repliesDiv);

    //posted by
    var postedBy = document.createElement('div');
    postedBy.className = "last-reply";
    postedBy.innerHTML = forumPost['author']["name"] + "<br>" + forumPost["postedDate"].replace("T"," at ");
    rowDiv.appendChild(postedBy);

    container.appendChild(rowDiv);

    $(document).on('click', "#" + forumPostId , function() {
        displayForumPostPage(forumPost);
   });
}

function displayForumPostPage(forumPost){
    storeItem("forumPost",forumPost);
    if(window.location.href == "forumpost.html"){
        window.location.reload();
    } else{
        window.location.href = "forumpost.html";
    }
}

function loadForumPostDetails(){
    var forumPostDetails = retrieveObject("forumPost"); 
    if(forumPostDetails){
        document.getElementById('forumDetailsTitle').innerHTML = forumPostDetails["title"];
        document.getElementById('forumDetailsDescription').innerHTML = forumPostDetails["description"];
        document.getElementById('forumDetailsAuthor').innerHTML = "Posted by " + forumPostDetails['author']["name"] + "<br>" + forumPostDetails["postedDate"].replace("T"," at ");

        if(forumPostDetails['author']['id'] == user['id'] || user['dtype'] == ADMIN){
            var controlDiv = document.getElementById('forumControl');
            var infoContainer = document.getElementById('forumPostInfo');
            infoContainer.className = "forum-info";

            var editButton = createNewElement('button',"btn btn-primary");
            var editButtonId = "EditButton" + forumPostDetails.id;
            editButton.id = editButtonId;
            editButton.innerText = "Edit";
            controlDiv.appendChild(editButton);

            $(document).on('click', "#" + editButtonId , function() {

                
                navigateTo("editforumpost.html");
            });         
            
            var deleteButton = createNewElement('button',"btn btn-primary");
            var deleteButtonId = "DeleteButton" + forumPostDetails.id;
            deleteButton.id = deleteButtonId;
            deleteButton.innerText = "Delete";
            controlDiv.appendChild(deleteButton);

            $(document).on('click', "#" + deleteButtonId , function() {
                // localStorage.setItem("currentJobDetails",JSON.stringify(job));
                deleteForumPost(forumPostDetails.id);
            });   
        }

        loadForumPostMessages(forumPostDetails);
    }

}

function deleteForumPost(id){
    var settings = {
        "url": baseAddress + `/api/v1/forum/delete/${id}`,
        "method": "DELETE",
        "timeout": 0,
        "headers": {
          "Content-Type": "application/json"
        }
      };
      
      $.ajax(settings).done(function (res) {
        navigateTo("forum.html");
      }).fail(function(data){
        alert(JSON.stringify(data));
      });
}

function loadEditForumPost(){
    var forumPostDetails = retrieveObject("forumPost"); 
    
    if(forumPostDetails){
        document.getElementById('newForumPostTitle').value = forumPostDetails["title"];
        document.getElementById('newForumPostContent').value = forumPostDetails["description"];
    }
}


function editForumPost(){
    var forumPostDetails = retrieveObject("forumPost"); 

    var form = document.getElementById('editForumPostForm');
    forumPostDetails['title'] = form['newForumPostTitle'].value;
    forumPostDetails['description'] = form['newForumPostContent'].value;

    var settings = {
        "url": baseAddress + "/api/v1/forum/update",
        "method": "PUT",
        "timeout": 0,
        "headers": {
          "Content-Type": "application/json"
        },
        "data": JSON.stringify(forumPostDetails),
      };
      
      $.ajax(settings).done(function (res) {
        localStorage.setItem("forumPost",JSON.stringify(forumPostDetails));
        window.location.href = "forumpost.html";
      }).fail(function (error){
        alert(JSON.stringify(error));
    });
}

function loadForumPostMessages(forumPostDetails){
    var array = forumPostDetails['forumMessages'];
    var container = document.getElementById('forumDiscussion');
    for (index = 0; index < array.length; index++) {

        var firstDiv = document.createElement('div');
        firstDiv.className = "col-sm-12 col-xl-12";

        var secondDiv = document.createElement('div');
        secondDiv.className = "bg-secondary rounded h-100 p-4";
        
        var thirdDiv = document.createElement('div');
        thirdDiv.className = "container forumPost rcorners";

        var messageDiv = document.createElement('div');
        messageDiv.className = "forumDetailsCenter";

        var messageP = document.createElement('p');
        messageP.className = "forumDescription text-justify";
        messageP.innerHTML = array[index]["message"];
        messageDiv.appendChild(messageP);

        var authorDiv = document.createElement('div');

        var authorP = document.createElement('p');
        authorP.className = "ForumAuthor text-right";
        authorP.innerHTML = "Posted by " + array[index]['author']['name'] + "<br>" + array[index]['postedDate'].replace("T"," at ");
        authorDiv.appendChild(authorP);

        var separation = document.createElement('hr');
        separation.className = "forumSeparation";

        thirdDiv.appendChild(messageDiv);
        thirdDiv.appendChild(authorDiv);
        thirdDiv.appendChild(separation);
        secondDiv.appendChild(thirdDiv);
        firstDiv.appendChild(secondDiv);
        container.appendChild(firstDiv);
    }
}

/* --------- Extras -------- */

function navigateTo(url){
    window.location.href = url;
}

function limitCharacters(text, nbr){
    if(nbr == null){
        return text;
    }

    var newString = "";

    if(!text){
        return newString;
    }

    if(text.length < nbr){
        nbr = text.length;
    }

    for(var i = 0; i < nbr; i++){
        newString += text[i];
    }

    newString += "...";
    return newString;
}

function storeItem(name, object){
    localStorage.setItem(name,JSON.stringify(object));
}

function retrieveObject(name){
    return JSON.parse(localStorage.getItem(name));
}

/* --------- Navigation -------- */

function loadMenu(userT){
    var menu = document.getElementById("menuListview");
   
    if(userT == ADMIN){
        addMenuItem(menu, "statisticsLink", "Statistics");
        addMenuItem(menu, "jobBoardLink", "Job Board");
        addMenuItem(menu, "partnerApplicationBoardLink", "Application Board");
    } else if(userT == PARTNER){
        addMenuItem(menu, "partnerApplicationBoardLink", "Application Board");
    }else if(userT == STUDENT){
        addMenuItem(menu, "jobBoardLink", "Job Board");
    }

    addMenuItem(menu, "forumLink", "Forum");
    addMenuItem(menu, "messagesLink", "Messages");
    addMenuItem(menu, "settingsLink", "Settings");
    addMenuItem(menu, "logoutLink", "Logout");
}

function addMenuItem(menu, itemId, itemName){
    var li = document.createElement('li');
    li.setAttribute("data-icon","grid");
    var a = document.createElement("a");
    a.id = itemId;
    a.innerHTML = itemName;
    li.appendChild(a);
}


/* --------- User -------- */

function createStudentAccount(){
    var form = document.getElementById('studentCreationForm');
    var student = {};
    student['username'] = form['username'].value;

    var password1 = form['password'].value;
    var password2 = form['confirmPassword'].value;

    // if(password1 != password2){
    //     $("#rePassStudentMessage").text("the password doesn't match");
    //     $("#RePasswordStudent").focus();
    //     return false;
    // }else{
    //     $("#rePassStudentMessage").text("");
    // }

    student['password'] = password1;
    student['name'] = form['name'].value;
    student['studentId'] = form['studentId'].value;
    student['email'] = form['email'].value;
    student['phone'] = form['phone'].value;
    student['dtype'] = "Student";

    // alert(JSON.stringify(student));

    PostStudentAccount(student);
}

function createPartnerAccount(){
    var form = document.getElementById('partnerCreationForm');
    var partner = {};
    partner['username'] = form['username'].value;

    var password1 = form['password'].value;
    var password2 = form['confirmPassword'].value;

    // if(password1 != password2){
    //     $("#rePassPartnerMessage").text("the password doesn't match");
    //     $("#partnerRePassword").focus();
    //     return false;
    // }else{
    //     $("#rePassPartnerMessage").text("");
    // }

    partner['password'] = password1;
    partner['name'] = form['name'].value;
    partner['businessName'] = form['businessName'].value;
    partner['email'] = form['email'].value;
    partner['phone'] = form['phone'].value;
    partner['dtype'] = "Partner";

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
        localStorage.setItem('accountCreationMessage', "The Student account was successfully created.");
        window.location.href = "registrationconfirmation.html";
      }).fail(function (error){
        localStorage.setItem('accountCreationMessage', "An Error occured during the Student account creation. Error Message: " + error.responseText);
        window.location.href = "registrationconfirmation.html";
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
        localStorage.setItem('accountCreationMessage', 'The Partner account was successfully created.');
        window.location.href = "registrationconfirmation.html";
      }).fail(function (error){
        localStorage.setItem('accountCreationMessage', "An Error occured during the Partner account creation. Error Message: " + error.responseText);
        window.location.href = "registrationconfirmation.html";
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
        redirectUser(res);
      }).fail(function(data){
        document.getElementById("loginErrorMessage").innerHTML = data.responseJSON.message;
      });
}

function redirectUser(res){
    storeUserInLocalStorage(res);
    if(res["dtype"] == "Student"){
        window.location.href = "jobboard.html";
    }else if(res["dtype"] == "Partner"){
        window.location.href = "jobboard.html";
    }else if(res["dtype"] == "Admin"){
        window.location.href = "dashboard.html";
    }else{
        alert("error while trying to parse the user");
        window.location.href = "index.html";
    }
}

function loadUserProfile(){
    document.getElementById('username').value = user.username;
    document.getElementById('email').value = user.email;
    document.getElementById('name').value = user.name;
    document.getElementById('phone').value = user.phone;

    if(user.dtype == STUDENT){
        document.getElementById('optionalField').value = user.studentId;
    }
    if(user.dtype == PARTNER){
        document.getElementById('optionalField').value = user.businessName;
    }
}

function editProfile(){
    fillIfNotBlank('username','username');
    fillIfNotBlank('email','email');
    fillIfNotBlank('name','name');
    fillIfNotBlank('phone','phone');

    if(user.dtype == STUDENT){
        fillIfNotBlank('optionalField','studentId');
    }

    if(user.dtype == PARTNER){
        fillIfNotBlank('optionalField','businessName');
    }

    var password = document.getElementById('password').value;
    var confirmPassword = document.getElementById('confirmPassword').value;
    if(password && confirmPassword && (password == confirmPassword)){
        alert("password match");
        user.password = password;
    }

    storeUserInLocalStorage(user);
    putEditedProfile();
}

function putEditedProfile(){
    showSpinner();
    var settings = {
        "url": baseAddress + "/api/v1/user/update",
        "method": "PUT",
        "timeout": 0,
        "headers": {
          "Content-Type": "application/json"
        },
        "data": JSON.stringify(user),
      };
      
      $.ajax(settings).done(function (res) {
        hideSpinner();
      }).fail(function (error){
        hideSpinner();
        alert(JSON.stringify(error));
      });
}

function fillIfNotBlank(fieldId, userAttribute){
    var field = document.getElementById(fieldId).value;
    if(field){
        user[userAttribute] = field;
    }
}

function storeUserInLocalStorage(user){
    localStorage.setItem("user",JSON.stringify(user));
}

function loadAccountCreationMessage(){
    document.getElementById('accountCreationMessage').innerHTML = localStorage.getItem('accountCreationMessage');
}

function reloadStylesheets() {
    var queryString = '?reload=' + new Date().getTime();
    $('link[rel="stylesheet"]').each(function () {
        this.href = this.href.replace(/\?.*|$/, queryString);
    });
}
