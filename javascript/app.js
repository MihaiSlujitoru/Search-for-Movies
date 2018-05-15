(function(){
	const content = document.querySelector('.js-content');
	const pagination = document.querySelector('.js-pagination');

	const elForm = document.getElementById('searchForm');
	let elInput  = document.querySelector('.js-search-query');

	const elNav = document.querySelectorAll(".js-navigation span");


	/*
		@function initializeApp
		@desc initialize the page with now playing movies
	*/
	const initializeApp = (queryType) => {
		init(queryType);
	}

	/*
		@function eventListener
		@desc when search form is submited grab the value;
	*/
	elForm.addEventListener("submit", (e) => {
		e.preventDefault();
		let queryType = 'search';
		keepSearchedQuery( encodeURIComponent(elInput.value));
		init(queryType, 1 ,elInput.value);
		elNav.forEach(function (btn) {
			btn.classList.remove('active');
		});		
	});

	/*
		@function eventListener
		@desc when you click on a navigation button render the options
	*/
	
	for (var i = 0; i < elNav.length; i++) {	
		elNav[i].addEventListener("click", function(e) {
			e.preventDefault();
			if (this.classList.contains('active')) {
				this.classList.remove('active');
			} else {
				elNav.forEach(function (btn) {
					btn.classList.remove('active');
				});
    			this.classList.add('active');
  			}
			init(this.dataset.type);
		});
	}
	

	/*
		@function xhrGetPromise
		@desc given a url, and cb return the api response
	*/
	const xhrGetPromise = (url, callback) => {
		return new Promise((resolve, reject) => {
			const ajaxCall = new XMLHttpRequest();
			ajaxCall.open('GET', url);	
			ajaxCall.onload = e => {
				resolve(JSON.parse(e.target.responseText)) // converts string into object literal
			}
			ajaxCall.onerror = (err) => {
				reject(err);
			}					
			ajaxCall.send();
		});
	}//xhrGetPromise

	/*
		@function getMovieEndPoint
		@desc given a movieName name str, return the
			  api endpoint to call to fetch movies data
	*/
	const getSearchMovieEndPoint = (queryType, page, movieName) => {
		const baseUrl 	= "https://api.themoviedb.org";
		const version 	= 3;
		let endpoint 	= '';
		let q 			= encodeURIComponent(movieName);
		const api_key 	= '07e4757f9a9c98f9849bfee2d8edee55';
		const lang  	= 'en-US';
		let pageNum 	= (page ? page : 1); 

		let urlSearch = getParameterByName('urlSearch');

		if( !(urlSearch === null)) { q = urlSearch};

		if(queryType === 'search') {
			endpoint 	= `search/movie?&query=${q}&page=${pageNum}`;
			keepSearchedQuery(q);
		} else {
			endpoint 	= `movie/${queryType}?&page=${pageNum}`;
			keepSearchedQuery(queryType);
		}

		return `${baseUrl}/${version}/${endpoint}&language=${lang}&api_key=${api_key}`;
	};


	/*
		@function renderMovie
		@desc given output, display to UI
	*/
	const renderMovie = (response) => {
		let output = '';
		for(let i = 0; i < response.results.length; i++) {
			if(response.results[i].poster_path === null) {
				moviePoster = 'http://via.placeholder.com/500x750?text=Poster+Not+Available';
			} else {
				moviePoster = 'https://image.tmdb.org/t/p/w500/' + response.results[i].poster_path;
			}
			movieName 	= response.results[i].original_title;
			movieDesc 	= response.results[i].overview;
			movieId 	=  response.results[i].id;
			releaseDate = response.results[i].release_date
			avgRate 	= response.results[i].vote_average
			userRate 	= response.results[i].vote_count

			output += `
				<div class='col-12 col-sm-6 col-md-4 col-lg-3' style='padding-bottom:15px;'>
					<div class="card movie-card">
					  <img class="card-img-top" src="${moviePoster}" alt="${movieName}">
					  <div class="card-body">
					    <h5 class="card-title">${movieName}</h5>
					    <!--<p class="card-text">${movieDesc}</p>--->
					    <a href="#${movieId}" rel="modal:open" class="btn btn-primary">Learn More</a>
					  </div>
					</div>
					<div id="${movieId}" class="modal">
					  <div class='row'>
						<div class='col'>
							  <img class="card-img-top" src="${moviePoster}" alt="${movieName}">
						</div>
						<div class='col'>
							<ul class="list-group">
							  <li class="list-group-item"><b>${movieName}</b></li>
							  <li class="list-group-item"><i>Release Date:</i> ${releaseDate}</li>
							  <li class="list-group-item"><i>Average Rating:</i> ${avgRate}/10</li>
							  <li class="list-group-item"><i>User Ratings:</i> ${userRate}</li>
							  <li class="list-group-item"><i>Description:</i> ${movieDesc}</li>
							</ul>						
						</div>
					  </div>
					</div>					
				</div>
			`
		}		
		content.innerHTML = output;
	}

	/*
		@function renderPagination
		@desc given output, display to UI
	*/
	const renderPagination = (response, queryType) => {
	    $('.js-pagination').twbsPagination({
	        totalPages: response.total_pages,
	        visiblePages: 7,
	        onPageClick: function (event, page) {
				let urlSearch = getParameterByName('urlSearch');
				init(queryType, page, urlSearch);	            
	        }
	    });
	}

	/*
		@function keepSearchedQuery
		@desc add a variable to URL for later use
	*/
	const keepSearchedQuery = (queryVar) => {
	    let qs = "?urlSearch=" + encodeURIComponent(queryVar);
	    history.pushState(null, null, qs);
	}

	/*
		@function getParameterByName
		@desc retrieve a variable from URL 
		@from https://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
	*/	
	function getParameterByName(name, url) {
	    if (!url) url = window.location.href;
	    name = name.replace(/[\[\]]/g, "\\$&");
	    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
	        results = regex.exec(url);
	    if (!results) return null;
	    if (!results[2]) return '';
	    return decodeURIComponent(results[2].replace(/\+/g, " "));
	}

	const init = (queryType, pageNum, queryVar) => {
		xhrGetPromise(getSearchMovieEndPoint(queryType, pageNum, queryVar))
			.then(response => {
				console.log(response);
				renderMovie(response);
				renderPagination(response, queryType);
			})
	}

	//call the initializeApp
	initializeApp('now_playing');
})();
	