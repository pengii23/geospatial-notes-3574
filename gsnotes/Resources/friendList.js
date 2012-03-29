(function() {
	gn.ui = gn.ui || {};
	gn.ui.friendList = {};
	
	gn.loadedFriends = false;
	
	gn.ui.createFriendsWindow = function() {

		var friendWindow = Ti.UI.createWindow({
			backgroundColor : '#FFF',
			exitOnClose : false,
			fullscreen : false
		});


		var search = Titanium.UI.createTextField({
			left : 0,
			top : 0,
		    height : '10%',
		    width : '90%',
		    hint : 'Search for a friend...'
		});
		
		var searchBtn = Ti.UI.createButton({
			right : 0,
			top : 0,
			width : '10%',
			height : '10%'
		});
		
		friendWindow.addEventListener('open', function() {
			Ti.App.fireEvent('app:getFriends');
		});
		
		
		var friendTable = Ti.UI.createTableView({
			top :'10%'
		});
		

		friendWindow.add(friendTable);
		
		friendWindow.add(search);
		friendWindow.add(searchBtn);

		searchBtn.addEventListener('click',function(){
				
			Ti.App.fireEvent('app:showFriends', {
				filter_mode : 'fullName',
				filter : search.value
			});
		});
		
		
		Ti.App.addEventListener('app:showFriends', function(params) {

			// Default data
			var data = gn.db.getFBFriends({
				filter_mode : params.filter_mode,
				filter : params.filter
			});
			var rowArray	= new Array();
					
			while(data.isValidRow() )
			{	
				var first_name	= data.fieldByName('fbFirstName');
				var last_name	= data.fieldByName('fbLastName');
				var full_name	= data.fieldByName('fbFullName');
				var id			= data.fieldByName('fbID');
				
				// Alternating background colors
				var bgColor = '#FFFFFF'; //(c % 2 === 1) ? '#EEE' : '#FFF';

				// Create a row for this user
				var tvRow = Ti.UI.createTableViewRow({
					height : 'auto',
					backgroundColor : bgColor,
					title : full_name,
					className : 'fbfriends',
					firstName : first_name,
					lastName : last_name,
					friendID : id
				});

				// Add a listener for that row
				tvRow.addEventListener('click', function() {
					Ti.App.fireEvent('app:openFriend', {
						firstName : this.firstName,
						lastName : this.lastName,
						friendID : this.friendID
					});
				});
				
				
				rowArray.push(tvRow);
				data.next();
			}
			
			friendTable.setData(rowArray);
		});


		// Fetch a list of friends using the Facebook API
		Ti.App.addEventListener('app:getFriends', function() {
			
			if( !gn.loadedFriends )
			{
				if(Ti.Facebook.getLoggedIn()) {
					// requestWithGraphPath vs Titanium.Facebook.Execute
					// Not really sure if there's a big difference, but this one works
					Titanium.Facebook.requestWithGraphPath('me/friends', {
						fields : 'first_name,last_name,id'
					}, 'GET', function(e) {
						if(e.success) {
							var d = JSON.parse(e.result);
							
							// Clear out old db
							gn.db.clearFBFriends();
							
							// Go through the result set, adding friends one by one
							
							var friendCount = d.data.length;
							for(var c = 0; c < friendCount; c++) {
								var friend = d.data[c];
								gn.db.addFBFriend(friend.id, friend.first_name, friend.last_name);
	
							}
							
							
							Ti.App.fireEvent('app:showFriends', {
								filter_mode : '',
								filter: ''
							});
							gn.loadedFriends = true;
						} else if(e.error) {
							alert(e.error + ' please ensure you are logged in correctly from the main screen.');
							setTimeout(function() {
								friendWindow.close();
							}, 2000);
						}
					});
				} else {
					alert('Not logged in');
				}
			}
			else
			{
				Ti.App.fireEvent('app:showFriends', {
					filter_mode : '',
					filter : ''
				});
			}
		});
		
		
		//event params: firstName, lastName, friendID
		Ti.App.addEventListener('app:openFriend', function(params) {
			var firstName = params.firstName;
			var lastName = params.lastName;
			var friendID = params.friendID;
			var fullName = firstName + " " + lastName;
			var friendWindow = Ti.UI.createWindow({
				title : fullName
			});
			
			var friendView = Ti.UI.createView({
				borderRadius : 10,
				width : '95%',
				height : '90%',
				backgroundColor : '#000',
				opacity : .5
			});

			var image = Titanium.UI.createImageView({
				url : "https://graph.facebook.com/" + friendID + "/picture",
				height : '15%',
				width : '15%',
				top : 0,
				left : 0
			});

			var sharedNotesButton = Ti.UI.createButton({
				title : 'See notes shared with ' + firstName,
				top : '15%',
				height : '10%'
			});
			
			var createNotesButton = Ti.UI.createButton({
				title : 'Create new shared note',
				top : '25%'
			})
			
			sharedNotesButton.addEventListener( 'click', function(){
				gn.ui.createInboxWindow().open();
			
			/*
				 var win = Ti.UI.createWindow({
					backgroundColor : 'white',
					title : 'Notes shared with ' + firstName,
					exitOnClose : false
				})
				
				
				win.open();
				*/
				
			});
			
			createNotesButton.addEventListener( 'click', function(){
				var win = Ti.UI.createWindow({
					backgroundColor : 'white',
					title : 'Create new note to share with ' + firstName,
					exitOnClose : false
				})
				win.open();
				
				
			});
			
			friendView.add(image);
			friendView.add( sharedNotesButton);
			friendView.add(createNotesButton);
			friendWindow.add(friendView);

			friendView.addEventListener('click', function() {
				friendWindow.close();
			});
			
			
			
			friendWindow.open();
		});
		return friendWindow;
	};
})();
