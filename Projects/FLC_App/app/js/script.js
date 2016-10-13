// Show a spinner until the page is loaded

var spinner = '<div id="loader" alt="loading..."><text>COSUMES RIVER COLLEGE</text><div class="loaderInner ball-triangle-path"><div></div><div></div><div></div></div></div>';
$('html').prepend(spinner);

// the function that execute all the animations and interactions on the page


// wait for the entire page to be loaded (do not wait for images)
//$( document ).ready( script );

$( window ).load( script );

function script(){

	$('#loader').delay(0).fadeOut('slow');

	$.ajaxSetup( { cache:true } );

	$( '#tabStudents > *' ).css( { 'height': ( $( '#tabStudents > *' ).width() ) + 'px'} );

	$('#menuButton').on('click',function(){
		$('#menuOptions').toggleClass('open');
	});
	$('#returnIcon, #logo, #homeWrapper, #statusBar, #button').on('click',function(){
		$('#menuOptions').removeClass('open');
	});

	$('.mainWin').on('click',function(){
		$('#mainContainer').toggleClass('winOpen');

		$('#menuTitle').text( $(this).text() );
		
	});

	$('#triangle, #backArrow').on('click',function(){
		$('#mainContainer').removeClass('winOpen');
	});

	$('.sports').on('click',function(){
		$('#event').load('section/sports.html');
	});

	$('.studentLife, .events, #triangle').on('click',function(){
		$('#event').load('section/studentLife.html');
		$('#menuContentWrap').removeClass('currentTab');
		$('#tabWrapper').removeClass('dispplayTab');

	});

	$('.students').on('click',function(){
		$('#event').load('section/sLStudents.html');
		$('#menuContentWrap').addClass('currentTab');

	});

	$('#triangle, #backArrow').on('click', function(){
		$('#tabWrapper').addClass('dispplayTab');
	});

	// $('#container').click( function(){ $('#container').css('background','red') } );

	// $('#container').on('click', function(){ $('#container').css('background','red') } );

	setInterval(function(){

		$('.first').on('click',function(){
			$('#tabStudentsWrapper').css('transform', 'translateX(3.5%)');
			$('.first').css('background', '#fafafa');
			$('.second, .last').css('background', 'rgba(250, 250, 250, .4)');
			$('#clubs').removeClass('resize');
			$('#associations, #scholarships').addClass('resize');

		});

		$('.second').on('click',function(){
			$('#tabStudentsWrapper').css('transform', 'translateX(-30%)');
			$('.second').css('background', '#fafafa');
			$('.first, .last').css('background', 'rgba(250, 250, 250, .4)');
			$('#associations').removeClass('resize');
			$('#clubs, #scholarships').addClass('resize');
		});

		$('.last').on('click',function(){
			$('#tabStudents > *').css('transform', 'translateX(-63.5%)');
			$('.last').css('background', '#fafafa');
			$('.second, .first').css('background', 'rgba(250, 250, 250, .4)');
			$('#scholarships').removeClass('resize');
			$('#associations, #clubs').addClass('resize');
		});

	}, 1000 );

	setTime();
	setInterval( setTime, 60000);
};

function setTime(){

		var h = ( new Date() ).getHours();
		var m = ( new Date() ).getMinutes();
		var nt = "";

		if ( m < 10 )
		{
			m = "0" + m;
		}

		nt = m + " AM";

		if ( h >= 12 ) 
		{

			nt = m + " PM";

			if ( h > 12 )
			{
				h -= 12;
			}
			
		} 
		else if (h === 0) 
		{
			h = 12;
		}

		$('#time').text(h + ":" + nt);

		return 0;

	};
