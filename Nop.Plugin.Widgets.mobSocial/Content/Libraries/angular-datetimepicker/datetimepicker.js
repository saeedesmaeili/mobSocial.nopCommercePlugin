var dtpAppDirectives = angular.module('ngDateTimePicker', []);

dtpAppDirectives.directive("datetimepicker", ["$compile", "$rootScope", function($compile, $rootScope) {
        return {
            restrict: "E",
            scope: {
                minDate: "@",
                maxDate: "@",
                currentDate: "=",
                includeTime: "@",
                dateFormat:"@"
            },
            template: "<span class='datepicker-container'><input readonly type='text' ng-focus='expandMe();' class='datepicker-input' ng-model='currentDateFormatted' /> <button class='ng-hide datepicker-close' ng-click='revert();'>&#10006;</button><br/></span>",
            replace: true,
            link: function($scope, $elem, $attr) {
                //let's add the current scope to root scope to maintain the list of all the datetime pickers on the page
                if (!$rootScope.DateTimePickerScopes) {
                    $rootScope.DateTimePickerScopes = [];
                }
                $rootScope.DateTimePickerScopes.push($scope);

                $scope.calLock = false;
                if ($scope.minDate === undefined) {
                    $scope._minDate = new Date(1970, 1, 1);
                }
                else {
                    $scope._minDate = new Date($scope.minDate);
                }

                if ($scope.maxDate === undefined) {
                    $scope._maxDate = new Date(2050, 1, 1);
                }
                else {
                    $scope._maxDate = new Date($scope.maxDate);
                }

                if ($scope.dateFormat === undefined) {
                    $scope._dateFormat = "dddd, MMMM DD YYYY hh:mm:ss A";
                }
                else {
                    $scope._dateFormat = $scope.dateFormat;
                }

                if ($scope.currentDate == undefined) {
                    $scope.currentDate = new Date();
                } else {
                    $scope.currentDate = new Date($scope.currentDate);
                }
                
                $scope._visibleMonth = $scope.currentDate.getMonth();
                $scope._visibleDay = $scope.currentDate.getDate();
                $scope._visibleYear = $scope.currentDate.getFullYear();
                $scope._visibleHour =  $scope.currentDate.getHours();
                $scope._visibleMinute =  $scope.currentDate.getMinutes();
                
                if ($scope._visibleHour > 12) { //12 hour clock
                    $scope._visiblePeriod = "PM";
                    $scope._visibleHour = $scope._visibleHour - 12;
                } else {
                    $scope._visiblePeriod = "AM";
                    if ($scope._visibleHour == 0)
                        $scope._visibleHour = 12;
                }
                var daysInMonth = function(anyDateInMonth){
                    var month = anyDateInMonth.getMonth();
                    month++;
                    return new Date(anyDateInMonth.getFullYear(), month, 0).getDate();
                };

                var getCalendar = function(date) {
                    if ($scope.calLock)
                        return;
                    $scope.calLock = true;
                    var monthStart = 0, monthEnd = 11;
                    var dayMin = 1, dayMax = 31;
                    
                    if ($scope._minDate.getFullYear() === parseInt($scope._visibleYear)) {
                        monthStart = $scope._minDate.getMonth();
                        if (parseInt($scope._visibleMonth) < monthStart) {
                            $scope._visibleMonth = monthStart;
                            date.setMonth(monthStart);
                        }
                        else if (parseInt($scope._visibleMonth) === monthStart) {
                            dayMin = $scope._minDate.getDate();
                        }
                    }

                    if ($scope._maxDate.getFullYear() === parseInt($scope._visibleYear)) {
                        monthEnd = $scope._maxDate.getMonth();
                        
                        if ($scope._visibleMonth > monthEnd) {
                            $scope._visibleMonth = monthEnd;
                            date.setMonth(monthEnd);
                        }
                        else if (parseInt($scope._visibleMonth) === monthEnd) {
                            dayMax = $scope._maxDate.getDate();
                        }
                    }

                    var day = date.getDay();
                    var month = date.getMonth();
                    var year = date.getFullYear();
                    var d = date;
                    var monthArray = new Array();
                    monthArray[0] = "January";
                    monthArray[1] = "February";
                    monthArray[2] = "March";
                    monthArray[3] = "April";
                    monthArray[4] = "May";
                    monthArray[5] = "June";
                    monthArray[6] = "July";
                    monthArray[7] = "August";
                    monthArray[8] = "September";
                    monthArray[9] = "October";
                    monthArray[10] = "November";
                    monthArray[11] = "December";

                    var days = daysInMonth(d);
                    var first_day = (new Date(year, month, 1)).getDay();
                    var day = new Array();
                    day[0] = 'Su';
                    day[1] = 'Mo';
                    day[2] = 'Tu';
                    day[3] = 'We';
                    day[4] = 'Th';
                    day[5] = 'Fr';
                    day[6] = 'Sa';
                    
                    var monthSelect = " <select ng-model='_visibleMonth'>";
                    for (var i = monthStart; i <= monthEnd; i++) {
                        monthSelect += "<option value='" + i + "'>" + monthArray[i] + "</option>"
                    }
                    monthSelect += "</select>";

                    var yearSelect = " <select ng-model='_visibleYear'>";
                    for (var i = $scope._minDate.getFullYear(); i <= $scope._maxDate.getFullYear(); i++) {
                        yearSelect += "<option value='" + i + "'>" + i + "</option>"
                    }
                    yearSelect += "</select>";
                    
                    var hourSelect, minSelect, periodSelect;
                    if($scope.includeTime){
                        hourSelect = " Hours<br/> <select ng-model='_visibleHour'>";
                        hourSelect += "<option value='12'>12</option>";
                        for (var i = 1; i <= 11; i++) {
                            var hour = ("0" + i).slice(-2);
                            hourSelect += "<option value='" + i + "'>" + hour + "</option>";
                        }
                        
                        hourSelect += "</select>";
                        
                        minSelect = " Minutes<br/> <select ng-model='_visibleMinute'>";
                        for (var i = 0; i < 60; i+=5) {
                            var min = ("0" + i).slice(-2);
                            minSelect += "<option value='" + i + "'>" + min + "</option>";
                        }
                        minSelect += "</select>";

                        periodSelect = " Period<br/> <select ng-model='_visiblePeriod'>";
                        periodSelect += "<option value='AM'>AM</option><option value='PM'>PM</option>";
                        periodSelect += "</select>";
                        
                    }
                    var year_html = "<tr><th colspan='7'><a class='datepicker-prev' ng-click='previousMonth()'>&laquo;</a> " + monthSelect + yearSelect  + " <a class='datepicker-next' ng-click='nextMonth()'>&raquo;</a></th></tr>";
                    var day_html = '<tr class="month_row">';
                    for (var i = 0; i < 7; i++)
                        day_html += '<td>' + day[i] + '</td>';
                    day_html += '</tr>';

                    var dates_str = '<tr>';
                    for (var pos = 0; pos < first_day; pos++){
                        dates_str += "<td></td>";
                    }
                    
                    for (var day_val = 1; day_val <= days; day_val++){
                        if (day_val < dayMin || day_val > dayMax) {
                            dates_str += "<td><a class='disabled'>" + day_val + "</a></td>";
                        }
                        else {
                            var isCurrentDate = "";
                            if(day_val === parseInt($scope._visibleDay) && $scope.currentDate.getFullYear() === parseInt($scope._visibleYear) && $scope.currentDate.getMonth() === parseInt($scope._visibleMonth)){
                                isCurrentDate = "isCurrentDate";
                            }
                            
                            dates_str += "<td class='" + isCurrentDate + "'><a class='set-date-"+ day_val + "' href=''  ng-click='setDate(" + day_val + ", true)'>" + day_val + "</a></td>";

                        }

                        first_day++;
                        if (first_day === 7){
                            first_day = 0;
                            dates_str += "</tr><tr>";
                        }
                    }
                    dates_str += "</tr>";
                    var time_html = "<tr class='time_row'><td colspan='7'><table style='width:100%'><tr>" + "<td>" + hourSelect + "</td><td>" + minSelect + "</td><td>" + periodSelect + "</td></tr></table></td></tr>";
                    
                    var close_button = "<tr class='time_row'><td colspan='7'><a style='display:inline' ng-click='closeMe()'>OK</a> <a style='display:inline' ng-click='revert()'>Cancel</a></td></tr>";
                    var cal_string = "<table>" + year_html + day_html + dates_str + time_html + close_button + "</table>";

                    $scope.calLock = false;

                    return cal_string;
                };

                $scope.previousMonth = function() {
                    $scope._visibleMonth = parseInt($scope._visibleMonth) - 1;
                    if ($scope._visibleMonth === -1) {
                        $scope._visibleMonth = 11;
                        $scope._visibleYear -= 1;
                    }
                    $scope.reloadDate();
                };
                $scope.nextMonth = function() {
                    $scope._visibleMonth = parseInt($scope._visibleMonth) + 1;
                    if ($scope._visibleMonth === 12) {
                        $scope._visibleMonth = 0;
                        $scope._visibleYear += 1;
                    }
                    $scope.reloadDate();
                };
                $scope.setDate = function (day, noClose) {
                    
                    var vhour = parseInt($scope._visibleHour);
                    if ($scope._visiblePeriod === "AM") {
                        if (vhour > 11)
                            vhour = vhour - 12;

                    } else {
                        if (vhour < 12)
                            vhour = vhour + 12;
                    }
                   
                    $scope.currentDate = new Date($scope._visibleYear, $scope._visibleMonth, day, vhour, $scope._visibleMinute, 0);
                    $scope._visibleDay = $scope.currentDate.getDate();
                    if (noClose !== true)
                        $scope.closeMe();
                    
                    $scope._datePickerArea.find("td.isCurrentDate").removeClass("isCurrentDate");
                    $scope._datePickerArea.find("a.set-date-" + day).parent().addClass("isCurrentDate");

                };

                $scope.reloadDate = function() {
                    var expectedDate = new Date($scope._visibleYear, $scope._visibleMonth, $scope._visibleDay);
                   
                    if(expectedDate.getMonth() < $scope._minDate.getMonth() && expectedDate.getYear() === $scope._minDate.getYear()){
                        $scope.calLock = true;
                        $scope._visibleMonth = $scope._minDate.getMonth();
                        $scope.calLock = false;
                        return;
                    }
                    if(expectedDate.getMonth() > $scope._maxDate.getMonth() && expectedDate.getYear() === $scope._maxDate.getYear()){
                        $scope.calLock = true;
                        $scope._visibleMonth = $scope._maxDate.getMonth();
                        $scope.calLock = false;
                        return;
                    }
                    $scope._datePickerArea.html(getCalendar(expectedDate, $scope));
                    $compile($scope._datePickerArea)($scope);
                };
                
                $scope.expandMe = function () {
                    //we should close the other opened pickers before opening a new one
                    for (var i = 0; i < $rootScope.DateTimePickerScopes.length; i++) {
                        $rootScope.DateTimePickerScopes[i].closeMe();
                    }

                    //let's save the date first
                    var vhour = parseInt($scope._visibleHour);
                    if ($scope._visiblePeriod === "AM") {
                        if (vhour > 11)
                            vhour = vhour - 12;

                    } else {
                        if (vhour < 12)
                            vhour = vhour + 12;
                    }

                    $scope._previousDate = new Date($scope._visibleYear, $scope._visibleMonth, $scope._visibleDay, vhour, $scope._visibleMinute);
                  
                    $elem.find("button").removeClass("ng-hide");
                    $scope.reloadDate();
                    $scope._datePickerArea.css("display", "block").addClass("datepicker-expanded");
                    
                    jQuery(document).bind('click', function (event) {
                        var isClickedElementChildOfPopup = $elem
                            .find(event.target)
                            .length > 0;

                        if (isClickedElementChildOfPopup) {
                            return;
                        }

                        //is it previous or next button clicked
                        if (event.target.classList.contains('datepicker-prev') || event.target.classList.contains('datepicker-next'))
                            return;

                        $scope.$apply(function () {
                           $scope.closeMe();
                        });
                    });
                };

                $scope.revert = function() {
                    $scope._visibleDay = $scope._previousDate.getDate();
                    $scope._visibleMonth = $scope._previousDate.getMonth();
                    $scope._visibleYear = $scope._previousDate.getFullYear();

                    $scope.currentDate = new Date($scope._visibleYear, $scope._visibleMonth, $scope._visibleDay, $scope._previousDate.getHours(), $scope._visibleMinute, 0);

                    $elem.find("button").addClass("ng-hide");
                    $scope._datePickerArea.css("display", "none").removeClass("datepicker-expanded");

                }
                $scope.closeMe = function () {
                    if (typeof $scope.currentDate !== "object") {
                        if ($scope.currentDate === "")
                            $scope.currentDate = new Date();
                        else
                            $scope.currentDate = new Date($scope.currentDate);

                    }
                    $elem.find("button").addClass("ng-hide");
                    $scope._visibleDay = $scope.currentDate.getDate();
                    $scope._visibleMonth = $scope.currentDate.getMonth();
                    $scope._visibleYear = $scope.currentDate.getFullYear();
                    $scope._datePickerArea.css("display", "none").removeClass("datepicker-expanded");
                };

                $scope.formatDate = function () {
                    $scope.currentDateFormatted = moment($scope.currentDate).format($scope._dateFormat);
                }
                var datePickerArea = angular.element("<div class='datepicker-area'></div>");
                $scope._datePickerArea = datePickerArea;
                $elem.append(datePickerArea);

                $scope.$watchGroup(['_visibleYear', '_visibleMonth'], function(newVal, oldVal) {
                    $scope.reloadDate();
                });
                $scope.$watchGroup(['_visibleHour', '_visibleMinute','_visiblePeriod'], function (newVal, oldVal) {
                    $scope.setDate($scope._visibleDay, true);
                });                
                $scope.$watchGroup(['currentDate'], function (newVal, oldVal) {
                    $scope.formatDate();
                });
                $scope.formatDate();
            }
        };
    }]);

