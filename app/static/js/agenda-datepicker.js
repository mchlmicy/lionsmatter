// History items
var historyFeed = $('#history_feed'),
	historyItems = historyFeed.find('.history-date a');
	
// Datepicker items
var datepickerDates = $('.datepicker-calendar'),
	datepickerHeight = datepickerDates.outerHeight() + 150;
	updateDatepickerItems(); 

// Elements of time reused across multiple functions
var this_day, this_month, this_year;
	
$(document).ready(function() 
{
	// Set datepicker width to feed width and display the datepicker
	var container_width = $('#agenda-feed').width();
	$('.datepicker-container').width(container_width).css('display','block');
	
	// Assign datepicker calendar arrows to functions to update the calendar
	$('.datepicker-next').click(function(e){updateDatepicker('next_week')});
	$('.datepicker-previous').click(function(e){updateDatepicker('previous_week')});
	
	// Set variable offset for scrolling past history-items
	$('#date-picker').on('hidden.bs.collapse', function (){datepickerHeight = datepickerDates.outerHeight() + 54;	$(window).scroll();});
	$('#date-picker').on('shown.bs.collapse', function () {datepickerHeight = datepickerDates.outerHeight() + 150;	$(window).scroll();});
	
	// If no datepickerItems are highlighted, scroll so that one is
	if(datepickerItems.parent().hasClass('active')==false){$(window).scroll();}	
});

var container_width, window_width = $(window).width(), window_width_current;
$(window).resize(function() 
{
  	container_width = $('#agenda-feed').width();
  	$('.datepicker-container').width(container_width);
	
	window_width_current = $(window).width();
	if(window_width_current>window_width)
	{
		if(window_width_current > 767 && $('.datepicker-container').css('top', '0px'))
		{
			$('.datepicker-container').css('top', '-9px');
		}
	}
	else if(window_width_current<window_width)
	{
		if(window_width_current <= 767 && $('.datepicker-container').css('top', '-9px'))
		{
			$('.datepicker-container').css('top', '0px');
		}
	}
	
	window_width = window_width_current;
});

$(window).one('scroll', function()
{	
	$('#history_feed').css('margin-top', '18px').css('padding-top', '0px');
});

var fromTop, last, historyItem_current, lastId, datepickerItems_exist, scroller_anchor;
$(window).scroll(function()
{
	/* FIND THE HISTORY ITEM THAT HAS BEEN SCROLLED PAST     **
	** AND HANDLE UPDATING THE DATEPICKER TO REFLECT CHANGES */
	// Get container scroll position
	fromTop = $(this).scrollTop() + datepickerHeight;	
	
	// Get current historyItem 
	historyItem_current = historyItems.map(function()
	{
		if($(this).offset().top > fromTop){return last;} 
		last = this;  
	});   
	
	// If there is a current historyItem, get its id
	// If there is no current item, select the last historyItem and get its id
	if(historyItem_current.attr('id')){id = historyItem_current.attr('id');}
	else
	{
		historyItem_current = $(historyItems[historyItems.length-1]);
		id = $(historyItem_current).attr('id');
	}
	
	// See if the current historyItem is in the datepicker  
	datepickerItems_exist = false;
	datepickerItems.map(function() 
	{
		if($(this).attr('href').substr(1)==id){return  datepickerItems_exist = true;}
	});  
	
	// If the current historyItem isn't in the datepicker, update the datepicker
	if(datepickerItems_exist!=true)
	{
		updateDatepicker(id);  
	}
	
	// If an new historyItem has been scrolled past, update components of datepicker
	if(lastId !== id) 
	{
		datepickerItems.parent().removeClass("active").end().filter("[href=#"+id+"]").parent().addClass("active");
		$('#datepicker-label').html($(historyItem_current).data('date'));
		
		lastId = id;
	} 
	
	/* HANDLE THE POSITIONING OF THE DATEPICKER (CSS) **
	** AS THE USER SCROLLS UP AND DOWN THE PAGE       */
	// Get the position of the location where the scroller starts.
    scroller_anchor = $(".scroller_anchor").offset().top-58; 
    
    // Check if the user has scrolled and the current position is after the scroller's start location and if its not already fixed at the top 
    if($(this).scrollTop() >= scroller_anchor && $('.scroller').css('position') != 'fixed') 
    {   
		$('.datepicker-container').css({
            'position': 'fixed',
            'top': '51px'
        });
        // Changing the height of the scroller anchor to that of scroller so that there is no change in the overall height of the page.
        $('.scroller_anchor').css('height', '0px');
    } 
    else if($(this).scrollTop() < scroller_anchor && $('.datepicker-container').css('position') != 'relative') 
    {    // If the user has scrolled back to the location above the scroller anchor place it back into the content.
        
        // Change the height of the scroller anchor to 0 and now we will be adding the scroller back to the content.
        $('.scroller_anchor').css('height', '0px');
        
        // Change the CSS and put it back to its original position.
        $('.datepicker-container').css('position','relative');
		
		if($(window).width()<=767)
		{
			$('.datepicker-container').css('top','0px');
		}
		else
		{
			$('.datepicker-container').css('top','-9px');
		}
    } 
});

function findSunday(current_date)
{
	// If the current date isn't Sunday, subtract the number of days since Sunday from the current date
	if(current_date.getDay()!=0){current_date.setDate(current_date.getDate() - current_date.getDay());}
	return current_date;
}

function givenDayHref(givenDay)
{
	var givenDay_month = givenDay.getMonth() + 1;
	var givenDay_date  = givenDay.getDate();
			
	if(givenDay_month<=9){givenDay_month = '0' + givenDay_month;}
	if(givenDay_date<=9) {givenDay_date  = '0' + givenDay_date;} 
			
	return(givenDay_month + '-' + givenDay_date + '-' + givenDay.getFullYear());
}

function parseDay(current_date)
{
	if(current_date=='next_week')
	{
		this_day = parseInt($('.datepicker-next').data('nextwk').substr(3,2),10);
		this_month = parseInt($('.datepicker-next').data('nextwk').substr(0,2),10);
		this_year = parseInt($('.datepicker-next').data('nextwk').substr(6,4),10);
	}
	else if(current_date=='previous_week')
	{
		this_day = parseInt($('.datepicker-previous').data('previouswk').substr(3,2),10);
		this_month = parseInt($('.datepicker-previous').data('previouswk').substr(0,2),10);
		this_year = parseInt($('.datepicker-previous').data('previouswk').substr(6,4),10); 
	}
	else 
	{
		this_day = current_date.substr(3,2);
		this_month = current_date.substr(0,2);
		this_year = current_date.substr(6,4); 
	}
}

var currentDate, next_week, givenDay, fullCalendar;
var dotw = new Array('Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat');
var months = new Array('January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December');
function updateDatepicker(current_date)
{
	// Parse date into day, month, and year
	// Create Date object from these time elements
	// Find the Sunday of week that the Date is a part of
	parseDay(current_date);
	currentDate = new Date(this_year, this_month-1, this_day);
	next_week = findSunday(currentDate);
	
	// datapicker-next element creation
	givenDay = new Date(next_week.setDate(next_week.getDate() + 7));
	next_week.setDate(next_week.getDate() - 7);
	fullCalendar = "	<span class='datepicker-next' data-nextwk='" + givenDayHref(givenDay) + "'> \
                        	<span class='glyphicon glyphicon-chevron-right'></span> \
						</span> \
					";
	
	// datapicker-day element creation
	for(x = 6; x>=0; x--)
	{
		givenDay = new Date(next_week.setDate(next_week.getDate() + x));
		next_week.setDate(next_week.getDate() - x);
		fullCalendar = fullCalendar +"	<span class='datepicker-day'> \
											<a href='#" + givenDayHref(givenDay) + "'> \
												<center> \
													<div class='datepicker-day-dotw'><strong><mobile>" + dotw[givenDay.getDay()].substring(0,1) + "</mobile><desktoptablet>" + dotw[givenDay.getDay()] + "</desktoptablet></strong></div> \
													<div class='datepicker-day-body'>" + givenDay.getDate() + "</div> \
												</center> \
											</a> \
										</span> \
									";
	}
	
	// datapicker-previous element creation
	givenDay = new Date(next_week.setDate(next_week.getDate() - 7));
	next_week.setDate(next_week.getDate() + 7);
	fullCalendar = fullCalendar + "	<span class='datepicker-previous' data-previouswk='" + givenDayHref(givenDay) + "'> \
                            			<span class='glyphicon glyphicon-chevron-left'></span> \
									</span> \
								";
	
	$('.datepicker-calendar').html(fullCalendar);
	$('#datepicker-monthlabel').html(months[this_month-1]);
	$('.datepicker-next').click(function(e){updateDatepicker('next_week')});
	$('.datepicker-previous').click(function(e){updateDatepicker('previous_week')});
	updateDatepickerItems();
}

var targetDate, oldestDate, newestDate;
var targetDateShift_plus, targetDateShift_minus;
function updateDatepickerItems()
{ 
	datepickerItems = datepickerDates.find('a'),
	datepickerMap = datepickerItems.map(function()
	{
		var item = $($(this).attr('href'));
		if(item.length){return item;}      
	});
					
	datepickerItems.click(function(e)
	{
		// If this history-date exists...
		if($($(this).attr('href')).length!=0)
		{
			var href = $(this).attr("href"),
			offsetTop = href === "#" ? 0 : $(href).offset().top-datepickerHeight+1;
							  
			$('html, body').stop().animate({scrollTop: offsetTop}, 300);
			e.preventDefault();
		}
		else
		{
			parseDay($(historyItems[historyItems.length-1]).attr('id'));
			oldestDate = new Date(this_year, this_month-1, this_day);
			
			parseDay($(historyItems[0]).attr('id'));
			newestDate = new Date(this_year, this_month-1, this_day); 
			
			parseDay($(this).attr('href').substr(1));
			targetDate = new Date(this_year, this_month-1, this_day);
			
			if(targetDate > oldestDate && targetDate < newestDate)
			{
				targetDateShift_plus = 0;
				while($('#' + this_month + '-' + this_day + '-' + this_year).length==0)
				{
					targetDateShift_plus++;
					targetDate.setDate(targetDate.getDate() + 1);
					
					this_day = targetDate.getDate(), 
					this_month = targetDate.getMonth() + 1,
					this_year = targetDate.getFullYear();
					
					if(this_month<=9){this_month = '0' + this_month;}
					if(this_day<=9){this_day = '0' + this_day;}
				}
				
				//Reset targetDate
				parseDay($(this).attr('href').substr(1));
				targetDate = new Date(this_year, this_month-1, this_day);
				
				targetDateShift_minus = 0;
				while($('#' + this_month + '-' + this_day + '-' + this_year).length==0)
				{	
					targetDateShift_minus++;
					targetDate.setDate(targetDate.getDate() - 1); 
					
					this_day = targetDate.getDate(), 
					this_month = targetDate.getMonth() + 1,
					this_year = targetDate.getFullYear();
					
					if(this_month<=9){this_month = '0' + this_month;}
					if(this_day<=9){this_day = '0' + this_day;}
				}
				
				//Reset targetDate
				parseDay($(this).attr('href').substr(1));
				targetDate = new Date(this_year, this_month-1, this_day);
				
				if(targetDateShift_plus > targetDateShift_minus)
				{
					targetDate.setDate(targetDate.getDate() - targetDateShift_minus); 
				}
				else
				{
					targetDate.setDate(targetDate.getDate() + targetDateShift_plus);
				}
				
				this_day = targetDate.getDate(), 
				this_month = targetDate.getMonth() + 1,
				this_year = targetDate.getFullYear();
					
				if(this_month<=9){this_month = '0' + this_month;}
				if(this_day<=9){this_day = '0' + this_day;}
				
				offsetTop = href === "#" ? 0 : $('#' + this_month + '-' + this_day + '-' + this_year).offset().top-datepickerHeight+1;
				$('html, body').stop().animate({scrollTop: offsetTop}, 300);
			}
			else
			{
				if(targetDate <= oldestDate)
				{
					offsetTop = href === "#" ? 0 : $(historyItems[historyItems.length-1]).offset().top-datepickerHeight+1;
					$('html, body').stop().animate({scrollTop: offsetTop}, 300);
				}
				else if(targetDate >= newestDate)
				{
					offsetTop = href === "#" ? 0 : $(historyItems[0]).offset().top-datepickerHeight+1;
					$('html, body').stop().animate({scrollTop: offsetTop}, 300);
				}
			}
			e.preventDefault();
		}
	});
}