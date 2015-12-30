/*
* mingying
*2015-12-30
*销售系统计算工时
*Copyright http://waimaichaoren.com
*email:mingying@waimaichaoren.com
*/

function Calendar(obj, options) {
	this.$element = $(obj);
    this.options = options;
    this.$weeks = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
    this.$days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
	//24节气
   this.SolarTermStr = new Array(
                        "小寒", "大寒", "立春", "雨水", "惊蛰", "春分", "清明", "谷雨", "立夏", "小满", "芒种", "夏至",
                        "小暑", "大暑", "立秋", "处暑", "白露", "秋分", "寒露", "霜降", "立冬", "小雪", "大雪", "冬至"); 
	//24节气值
    this.DifferenceInMonth = new Array(
                        1272060, 1275495, 1281180, 1289445, 1299225, 1310355, 1321560, 1333035, 1342770, 1350855, 1356420, 1359045,
                        1358580, 1355055, 1348695, 1340040, 1329630, 1318455, 1306935, 1297380, 1286865, 1277730, 1274550, 1271556); 
	//阳历节日
    this.V = { "0101": "*1元旦", "0214": "情人节", "0305#": "学雷锋纪念日", "0308": "妇女节", "0312#": "植树节", "0315#": "消费者权益日", "0401#": "愚人节", "0501": "*1劳动节", "0504": "青年节", "0601": "儿童节", "0701": "建党节", "0801": "建军节", "0910": "教师节", "1001": "*3国庆节", "1224": "平安夜", "1225": "圣诞节" }; 
    //阴历节日
	this.T = { "0101": "*2春节", "0115": "元宵节", "0505": "*1端午节", "0815": "*1中秋节", "0707": "七夕", "0909": "重阳节", "1010#": "感恩节", "1208#": "腊八节", "0100": "除夕" }; 
    //年 月 日
    if(this.options.date && typeof this.options.date == "string"){
        var dateArr = date.split("-");
        this.year = dateArr[0];
        this.month = dateArr[1];
    }else{
        var $date = new Date();
        this.year = $date.getFullYear();
        this.month = $date.getMonth() + 1;
    }

    this.date = 1;
};

//判断润年
Calendar.prototype.isLeapYear = function(year) {
    return (year % 4 == 0 && year % 100 != 0) || (year % 400 == 0);
}
//create DOM
Calendar.prototype._init = function(){
    var gridHtml = '<div id="calendar" class="cfix">';
        gridHtml += '<div class="calendar-left">';
        gridHtml += '<p class="calendar-leftTop"></p>';
        gridHtml += '<a href="javascript:void(0);" id="OnesubPrev" class="subPrev J_subPrev"></a>';
        gridHtml +=  '<a href="javascript:void(0);" id="OnesubNext" class="subNext J_subNext"></a>';
        gridHtml +=  '</div>';

    gridHtml += "<table border='0' class='calendar' cellPadding='0' cellSpacing='0'><tbodY>";

    for (var i = 0; i < 7; ++i) {
        switch (i) {
            case 0:
                gridHtml += '<tr class="calendar-weeks">';
                break;
            default:
                gridHtml += '<tr class="calendar-week-days">';
                break;
        }
        for (var j = 0; j < 7; ++j) {
            if(i==0){
                //星期日 星期六   
                if(j == 0 || j == 6){
                    gridHtml += '<th class="calendar_color_ff6600">'+ this.$weeks[j] +'</th>';
                }else{
                    gridHtml += '<th>'+ this.$weeks[j] +'</th>';
                }
            }else{
                gridHtml += '<td></td>';
            }
        }
        gridHtml += "</tr>";
    }
    gridHtml += "</tbody></table></div>";

    this.$grid = $(gridHtml);
    this.CalendarEvent();
}

//切换日期事件
Calendar.prototype.CalendarEvent = function(){
        var $this = this;
        $this.$grid.find(".J_subPrev").on('click', function() {
            $this.month--;
            if($this.month > 0){
                $this.change($this.year, $this.month, $this.date);
            }else if($this.month <= 0){
                $this.month = 12;
                $this.year --;
                $this.change($this.year, $this.month, $this.date);
            };
        });
        $this.$grid.find(".J_subNext").on('click', function() {
           $this.month++;
            if( $this.month > 12){
                $this.month = 1;
                $this.year ++;
            }
            $this.change($this.year, $this.month, $this.date);
        });
        if(this.options.isWork){
            this.$grid.find("td").on("click", function(){
                if($(this).find("i").hasClass("J_rest")){
                    $(this).find("i").removeClass("J_rest calendar_rest").addClass("J_work calendar_work");
                    $(this).find("i").text("上班");
                }else{
                    $(this).find("i").removeClass("J_work calendar_work").addClass("J_rest calendar_rest");
                    $(this).find("i").text("休息");
                }
            })
        }
}

Calendar.prototype.dbDate = function(date){
    if(typeof date == "number"){
        date = date < 10 ? "0"+date : date;
    }
    return date;
}

Calendar.prototype.change = function(year, month, date) {
    //过滤特殊字符、英文与数字
    var regzhongwen = /[A-Za-z_\-\~\!\@\#\$\%\^\&\*\(\)\|\0-9]+/; 
    //show current date
    this.$grid.find(".calendar-leftTop").html(year + " 年 <br />" + this.dbDate(month) + " 月");
    //reset
    var $tr =  this.$grid.find("tr");
    $tr.find("td").html("").removeClass("calendar-today");

    var date = new Date(year, month - 1, 1);
    var dayOfWeek = date.getDay();
    var day = 1, days = this.$days[month - 1] + (month == 2 && this.isLeapYear(year) ? 1 : 0);

    //填充日历数据 节气 日期
    for (var i = 1; i < $tr.length; ++i) {

        for (var j = i == 1 ? dayOfWeek : 0; j < 7; ++j) {
            var $td = $tr.eq(i).find("td").eq(j), $date = new Date();
            //判断是否今天
            var isToday = (year == $date.getFullYear() && month == $date.getMonth() + 1 && day == $date.getDate());
            className = isToday ? "calendar-today" : "";
            $td.addClass(className);

            var dayT = "";
            if (this.options.isSolarTerm == true) {
                var tdate = new Date(date.getFullYear(), date.getMonth(), day);
                dayT = this.T[showCal(tdate, true)]; dayT = dayT ? dayT : ""; //GetCNDate.js showCal(date, lockNum)//以阴历节日为主

                if (!dayT) {
                    var dayV = this.V[(month < 10 ? "0" + month : month.toString()) + (day < 10 ? "0" + day : day.toString())]; //阳历节日
                    dayT = dayV ? dayV : "";
                    if (!dayT) {
                        var dayJ = this.jieqi(tdate); //24节气 如果当前天没有公历与农历节日则判断性取节气
                        if (dayJ) dayT = dayJ ? dayJ : "";
                    }
                }
                dayT = dayT ? "<span class='v-holiday'>" + dayT.replace(regzhongwen, '') + "</span>" : ""; //节日text
            } //end if (this.isSolarTerm == true)  是否显示节日、节气
            var text = "";
           if(this.options.isWork){
               if(j == 6 || j == 0){
                    text = "<br><i class='J_rest calendar_rest'>休息</i>"
               }else{
                    text = "<br><i class='J_work calendar_work'>上班</i>"
               }
           }
           $td.html("<div>" + dayT + (day) +text+ "</div>");

            ++day;
            if (day > days)
            return;
        } //end for
    } //end for
}    //**************************************************************** end change ********************************************

//节气
Calendar.prototype.jieqi = function(date) {
    var DifferenceInYear = 31556926;
    var BeginTime = new Date(1901 / 1 / 1);
    BeginTime.setTime(947120460000);
    for (; date.getFullYear() < BeginTime.getFullYear(); ) {
        BeginTime.setTime(BeginTime.getTime() - DifferenceInYear * 1000);
    }
    for (; date.getFullYear() > BeginTime.getFullYear(); ) {
        BeginTime.setTime(BeginTime.getTime() + DifferenceInYear * 1000);
    }
    for (var M = 0; date.getMonth() > BeginTime.getMonth(); M++) {
        BeginTime.setTime(BeginTime.getTime() + this.DifferenceInMonth[M] * 1000);
    }
    if (date.getDate() > BeginTime.getDate()) {
        BeginTime.setTime(BeginTime.getTime() + this.DifferenceInMonth[M] * 1000);
        M++;
    }
    if (date.getDate() > BeginTime.getDate()) {
        BeginTime.setTime(BeginTime.getTime() + this.DifferenceInMonth[M] * 1000);
        M == 23 ? M = 0 : M++;
    }
    var JQ = "";
    if (date.getDate() == BeginTime.getDate()) {
        JQ += this.SolarTermStr[M];
    }
    return JQ;
}

//显示日历
Calendar.prototype.show = function() {
   this._init();
   this.$element.append(this.$grid);
   this.change(this.year, this.month, this.date);
}
/**
* date 为默认时间 不传取当前年月 2015-11
* isSolarTerm 是否显示时节 default:true
* isWork 是否显示工作休息 default:false
**/

$.fn.calendar = function(option){
	return this.each(function(){
		var $this = $(this);
		var data = $this.data("calendar"),
		options = $.extend({}, $.fn.calendar.options, typeof option == 'object' && option)
		var calendarFunc = new Calendar(this, options);
		if(!data){
			$this.data("calendar", calendarFunc);
		}
		if (typeof option == 'string') {
      		calendarFunc[option]()
      	} else {
      		calendarFunc.show()
      	}
	})
}
$.fn.calendar.options = {
	date: null,
    isSolarTerm: true,
    isWork: false
}