//============================================
// Script to get connections list and its mutual friends
// Author: Ishan Vyas
//============================================
//prefixes of implementation that we want to test
window.indexedDB =
  window.indexedDB ||
  window.mozIndexedDB ||
  window.webkitIndexedDB ||
  window.msIndexedDB;

//prefixes of window.IDB objects
window.IDBTransaction =
  window.IDBTransaction ||
  window.webkitIDBTransaction ||
  window.msIDBTransaction;
window.IDBKeyRange =
  window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;

if (!window.indexedDB) {
  window.alert("Your browser doesn't support a stable version of IndexedDB.");
}

var db;
var tableName = "connections";
var request = window.indexedDB.open("linkedInDb", 1);

request.onupgradeneeded = function (event) {
  console.log("running onupgradeneeded");
  var db = event.target.result;

  //Create Table
  if (!db.objectStoreNames.contains(tableName)) {
    console.log("I need to make the table : " + tableName + " objectstore");
    var objectStore = db.createObjectStore(tableName, { keyPath: "userId" });
  }
};

request.onerror = function (event) {
  console.log("error: in IndexedDB");
};

request.onsuccess = function (event) {
  db = request.result;
  console.log("success: " + db);
};
request.onerror = function (event) {
  console.log("error: ");
  Location.reload();
};

var scrollTime = 1;
var liObj = document.querySelectorAll(".mn-connection-card");
var liLength = liObj.length;

var loaderImage = "https://giphy.com/gifs/mashable-3oEjI6SIIHBdRxXI40";
var elem = document.createElement("div"); // Create Div for Loader
elem.style.cssText =
  'position:fixed;width:100%;height:100%;opacity:0.3;z-index:100;background:url("' +
  loaderImage +
  '") no-repeat center center rgba(0,0,0,0.25)';
elem.setAttribute("id", "linkedInLoaderByQbix");
var container = document.body;
container.insertBefore(elem, container.firstChild); //Append in body Of LinkedIn
var linkedInLoader = document.getElementById("linkedInLoaderByQbix"); // Get LinkedIn loader div

var getScroll = function () {
  // Start Scrolling Interval For get friends of Logged In User
  window.scrollBy(0, -50);
  window.scrollBy(0, 50);
  window.scrollTo(0, document.body.scrollHeight); // Scroll
  var allLoad = setTimeout(function () {
    // Set Timeout for load connections
    if (scrollTime) {
      // Set Variable for continue to scroll
      var newLength = document.querySelectorAll(".mn-connection-card").length;
      if (liLength != newLength) {
        // check the length of loaded connections and previously get connection
        liLength = newLength;
      } else {
        scrollTime = 0; //Stop Scroll
      }
    }
  }, 5000);
  if (!scrollTime) {
    var liObj = document.querySelectorAll(".mn-connection-card"); //get All connection object li
    var connections = new Array();
    for (var i = 0; i < liObj.length; i++) {
      profileDetails = liObj[i].querySelectorAll(
        ".mn-connection-card__details"
      );
      profilePicture = liObj[i].querySelectorAll(
        ".mn-connection-card__picture"
      );
      var profileLink = profileDetails[0].querySelectorAll(
        ".mn-connection-card__link"
      );
      let profileImage = "";
      if (
        profilePicture[0].querySelectorAll(".presence-entity__image").length > 0
      ) {
        profileImage = profilePicture[0].querySelectorAll(
          ".presence-entity__image"
        );
        profileImage = profileImage[0].src;
      }
      var profileName = profileDetails[0].querySelectorAll(
        ".mn-connection-card__name"
      );
      var profileOccupation = profileDetails[0].querySelectorAll(
        ".mn-connection-card__occupation"
      );
      var userObj = new Object(); // User Object for connection data
      userObj = {
        name: profileName[0].innerHTML.trim(),
        image: profileImage,
        link: profileLink[0].href,
        userId: profileName[0].innerHTML.trim(),
        occupation: profileOccupation[0].innerHTML.trim(),
      };
      connections.push(userObj); //push to main user object
      //console.log(connections);
      if (userObj != null) {
        var request = db
          .transaction([tableName], "readwrite")
          .objectStore(tableName)
          .add(userObj);

        request.onsuccess = function (event) {
          console.log("New record has been added to your database.");
        };

        request.onerror = function (event) {
          console.log(
            "Unable to add record.\r\nIt is aready exist in your database! "
          );
        };
      }
    }

    /* START getting link for getting mutual friend */

    var index = 0;
    var mutualFriendLink = window.open(
      "",
      "",
      "width:100,height:200,visible:none"
    );
    var getMutualFriendLink = function () {
      // Set interval for getting link of to get list of mutual connection for each user
      clearInterval(intervalForScroll);
      clearInterval(intervalForMutualFriendLink);
      if (index < connections.length) {
        mutualFriendLink.location = connections[index].link;
        mutualFriendLink.addEventListener(
          "DOMContentLoaded",
          loadWindow(mutualFriendLink, index),
          false
        );
        index = index + 1;
      } else {
        linkedInLoader.style.visibility = "hidden";
        clearInterval(intervalForMutualFriendLink);
      }
    };
    intervalForMutualFriendLink = setInterval(getMutualFriendLink, 3000); //Interval for new friend load
    var loadWindow = function (mutualFriendLink, index) {
      var allLoad = setTimeout(function () {
        mutualFriendLink.focus();
        let linkToGetMutualFriend = "";
        if (
          mutualFriendLink.document.querySelectorAll(
            ".pv-highlight-entity__card-action-link"
          ).length > 0
        ) {
          linkToGetMutualFriend = mutualFriendLink.document.querySelectorAll(
            ".pv-highlight-entity__card-action-link"
          );
          linkToGetMutualFriend = linkToGetMutualFriend[0].href;
        }
        connections[index].mutalLink = linkToGetMutualFriend;
        intervalForMutualFriendLink = setInterval(getMutualFriendLink, 3000);
      }, 15000);
    };

    /* END getting link for getting mutual friend */

    /* START getting mutal friend of connection in parellel window */

    var indexForMutual = 0;
    var mutualFriends = window.open(
      "",
      "",
      "width:100,height:200,visible:none"
    );
    var getMutualFriends = function () {
      if (indexForMutual < connections.length) {
       // console.log("if conditiaon", indexForMutual);
        if (connections[indexForMutual].mutalLink) {
          clearInterval(intervalForMutualFriends);
          mutualFriends.location = connections[indexForMutual].mutalLink;
          mutualFriends.addEventListener(
            "DOMContentLoaded",
            loadWindowForMutualFriend(mutualFriends, indexForMutual),
            false
          );
          indexForMutual = indexForMutual + 1;
        } else {
          if (indexForMutual > 0) {
            indexForMutual = indexForMutual + 1;
            clearInterval(intervalForMutualFriends);
            intervalForMutualFriends = setInterval(getMutualFriends, 15000);
          }
        }
      } else {
        clearInterval(intervalForMutualFriends);
      }
    };
    intervalForMutualFriends = setInterval(getMutualFriends, 15000);
    var loadWindowForMutualFriend = function (mutualFriends, indexForMutual) {
      var userFriend = connections[indexForMutual];
      var allLoad = setTimeout(function () {
        mutualFriends.focus();
        var liMutalObj = mutualFriends.document.querySelectorAll(
          ".reusable-search__result-container "
        ); //get All mutual object li
        var mutualFriendArray = new Array();
        for (var i = 0; i < liMutalObj.length; i++) {
          mutualContent = liMutalObj[i].querySelectorAll(
            ".entity-result__content"
          );
          mutualContentLink = mutualContent[0].querySelectorAll(
            ".app-aware-link"
          );
          mutualContentImage = liMutalObj[i].querySelectorAll(
            ".entity-result__item"
          );
          contentImageInner = mutualContentImage[0].querySelectorAll(
            ".ivm-view-attr__img-wrapper"
          );
          mutualContentName = mutualContentLink[0].querySelectorAll("span");
          profileLink = mutualContentLink[0].href;
          profileName = mutualContentName[1].innerHTML.trim();
          let profileImage = "";
          if (contentImageInner[0].querySelectorAll("img").length > 0) {
            profileImage = contentImageInner[0].querySelectorAll("img")[0].src;
          } else {
            profileImage = "";
          }

          var userObj = new Object(); // User Object for mutual connection data
          userObj = {
            name: profileName,
            image: profileImage,
            link: profileLink,
          };
          //console.log(userObj);
          mutualFriendArray.push(userObj);
        }
        connections[indexForMutual].mutalFriends = mutualFriendArray;
        var transactions = db.transaction([tableName], "readwrite");
        var objectStores = transactions.objectStore(tableName);

        var request = objectStores.put(userFriend);
        //console.log(connections);
        intervalForMutualFriends = setInterval(getMutualFriends, 3000);
      }, 15000);
    };

    /* END getting mutal friend of connection in parellel window */
  }
};

intervalForScroll = setInterval(getScroll, 5000); // set interval for logged in user scroll
