var user = {};
var userType = "";
var localEndPoint = "http://localhost:8080";
var serverEndPoint = "https://wilmanagementsystem.azurewebsites.net/";
var baseAddress = localEndPoint;

const ADMIN = "Admin";
const STUDENT = "Student";
const PARTNER = "Partner";

$(document).ready(function () {

    initializeUser();
    initializeView();
    loadMenu(userType);

    // ------ Menu controls ---------- //
    
    $("#menuPanel").panel();
    $('#menuListview').listview().listview('refresh');

    $(".menu").click(function () {
           $("#menuPanel").panel("open");
    });

    $(".homePageLink").click(function () {
        if(userType == ADMIN){
            window.location.href = "statistics.html";
        }else if(userType == STUDENT){
            window.location.href = "jobboard.html";
        }else if(userType == PARTNER){
            window.location.href = "partnerapplicationboard.html";
        }else{
            window.location.href = "../index.html";
        }
 });
    

    // ------ Job Board controls ---------- //

    $("#jobBoardLink").click(function (e) {
        window.location.href = "jobboard.html";
    });

    $("#partnerApplicationBoardLink").click(function (e) {
        window.location.href = "partnerapplicationboard.html";
    });

    // ------ forum controls ---------- //

    $("#forumLink").click(function (e) {
        window.location.href = "forum.html";
    });

    $("#createNewForumPost").click(function (e) {
        $("body").pagecontainer("change", "#newForumPostPage");
    });

    $("#postNewForumPost").click(function (e) {
        createNewForumPost();
        // refreshForumPosts();
        // $("body").pagecontainer("change", "#forumHome");
    });

    // ------ User controls ---------- //

    $("#logoutLink").click(function (e) {
        localStorage.clear();
        window.location.href = "../index.html";
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
        user.dtype = userType;
    }
}

function initializeView(){
    if(userType == STUDENT){
        
    }
}

function createNewForumPost(){
    var form = document.getElementById('createForumPostForm');
    var forumPost = {};
    forumPost['title'] = form['newForumPostTitle'].value;
    forumPost['description'] = form['newForumPostContent'].value;
    forumPost['author'] = user;

    postNewForumPost(forumPost);
}
function postNewForumPost(forumPost){
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
        //alert(JSON.stringify(res));
        $("body").pagecontainer("change", "#forumHome");
        // document.getElementById('accountCreationMessage').innerHTML = "The Partner account was successfully created.";
        // $("body").pagecontainer("change", "#accountCreationResultPage");
      }).fail(function (error){
        alert(JSON.stringify(error));
        // document.getElementById('accountCreationMessage').innerHTML = "An Error occured during the Partner account creation. Error Message: " + error.responseText;
        // $("body").pagecontainer("change", "#accountCreationResultPage");
      });
}

function getAllForumPosts(){
    loadForumPostDetails();
    $.mobile.loading('show');
    var settings = {
        "url": baseAddress + "/api/v1/forum/all",
        "method": "GET",
        "timeout": 0,
        "headers": {
          "Content-Type": "application/json"
        }
      };
      
      $.ajax(settings).done(function (res) {
        $.mobile.loading('hide');
        displayForumPosts(res);
      }).fail(function (error){
        $.mobile.loading('hide');
        alert(JSON.stringify(error));
    });
}

function displayForumPosts(array){
    for(var i = 0; i < array.length; i++){
        displayForumPost(array[i]);
    }
}

function displayForumPost(forumPost){
    //alert(JSON.stringify(forumPost));

    var container = document.getElementById("forumPosts");
    var iDiv = document.createElement('div');
    iDiv.className = 'forumPost rcorners';

    //Left Div
    var image = document.createElement('img');
    image.src = "../img/forumPostIcon.png";
    image.className = "ForumImage forumLeft";

    //Center Div
    var centerDiv = document.createElement('div');
    centerDiv.className = "forumCenter";

    var title = document.createElement('h3');
    title.className = "ForumTitle";
    var titleLink = document.createElement('a');
    var forumPostId = "forumPostId" + forumPost["id"];
    titleLink.id = forumPostId;
    titleLink.innerHTML = forumPost["title"];
    titleLink.href = "#";

    title.appendChild(titleLink);

    var description = document.createElement('p');
    description.innerHTML = limitCharacters(forumPost["description"],100);
    description.className = "forumDescription";

    centerDiv.appendChild(title);
    centerDiv.appendChild(description);

    //Right Div
    var rightDiv = document.createElement('div');
    rightDiv.className = "forumRight";

    var author = document.createElement('p');
    author.innerHTML = "Posted by " + forumPost['author']["name"] + "<br>" + forumPost["postedDate"].replace("T"," at ");
    author.className = "ForumAuthor"

    var repliesNbr = document.createElement('p');
    repliesNbr.innerHTML = "Number of Threads: " + forumPost["replies"].length;
    repliesNbr.className = "forumRepliesNbr";

    rightDiv.appendChild(author);
    rightDiv.appendChild(repliesNbr);

    //Adding all components

    iDiv.appendChild(image);
    iDiv.appendChild(centerDiv);
    iDiv.appendChild(rightDiv);


    container.appendChild(iDiv);

    //register a dinamically created event listener
    $(document).on('click', "#" + forumPostId , function() {
        displayForumPostPage(forumPost);
   });

}

function displayForumPostPage(forumPost){
    storeItem("forumPost",forumPost);
    loadForumPostDetails();
    $("body").pagecontainer("change", "#displayForumDetailsPage");
}

function loadForumPostDetails(){
    var forumPostDetails = retrieveObject("forumPost"); 
    if(forumPostDetails){
        document.getElementById('forumDetailsTitle').innerHTML = forumPostDetails["title"];
        document.getElementById('forumDetailsDescription').innerHTML = forumPostDetails["description"];
        document.getElementById('forumDetailsAuthor').innerHTML = "Posted by " + forumPostDetails['author']["name"] + "<br>" + forumPostDetails["postedDate"].replace("T"," at ");
    }
}

function limitCharacters(text, nbr){
    var newString = "";

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
    menu.appendChild(li);
}