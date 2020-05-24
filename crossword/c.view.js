var crwKeyDownEventProcessed = false;
function setupView() {
    $('#tblFields input').on('mousedown', function () { onMouseDown(this); return true; });
    $('#tblFields input').on('keydown', function (e) {
        var txt = this; if (!e) e = window.event; var pressedKeyCode = e.keyCode;
        if (!e) e = window.event;
        function handle() {
            onTextBoxKeyDown(txt, pressedKeyCode);
        }
        setTimeout(handle, 0);
        crwKeyDownEventProcessed = true;
    });
    $('#tblFields input').on('input', function (e) {
        if (crwKeyDownEventProcessed) {
            crwKeyDownEventProcessed = false;
            return;
        }
        var txt = this; var pressedKeyCode = 50; // symbol
        if (this.value.length === 0)
            pressedKeyCode = 8; // Backspace
        function handle() {
            onTextBoxKeyDown(txt, pressedKeyCode);
        }
        setTimeout(handle, 0);
    });
    $('#dQuestionsV span, #dQuestionsH span, #dRightWordsH span, #dRightWordsV span').on('click', function () { onQuestionTextClick(this) });
    $('#tblFields span.questiontext').on('click', function () { onScanwordQuestionTextClick(this) });
}
var curWid; var curWidAttr; var curWidAttrOnQuestion;
function onMouseDown(txt) {
    var td = txt.parentNode;
    if (curWidAttrOnQuestion == null) {
        if ($(td).attr("wid-h") != undefined && $(td).attr("wid-v") != undefined) {
            if ($(td).attr("seldir") == undefined) {
                $(td).attr("seldir", "v");
            }
            if ($(td).attr("seldir") == "v") {
                curWidAttr = "wid-h";
                $(td).attr("seldir", "h");
            }
            else if ($(td).attr("seldir", "h")) {
                curWidAttr = "wid-v";
                $(td).attr("seldir", "v");
            }
        }
        else if ($(td).attr("wid-h") != undefined)
            curWidAttr = "wid-h";
        else if ($(td).attr("wid-v") != undefined)
            curWidAttr = "wid-v";
    }
    else {
        curWidAttr = curWidAttrOnQuestion;
    }
    if (curWid != $(td).attr(curWidAttr))
        $('#dpopuptext').hide();
    curWid = $(td).attr(curWidAttr);
    cleanCells();
    $.each(getWordCells(curWidAttr, curWid), function (i, td) { $(td).css("background-color", "#ddd"); });
    showPopupQuestionText();
}

function onTextBoxKeyDown(txt, pressedKeyCode) {
    if (onTextBoxKeyUp(txt, pressedKeyCode))
        return;
    onTextBoxKeyPress(txt, pressedKeyCode);
}
function onTextBoxKeyUp(txt, pressedKeyCode) {
    var pos; var m;
    if (curWidAttr.indexOf("-h") > 0) {
        //вверх
        if (pressedKeyCode == 38) {
            m = txt.parentNode.attributes["pos"].value.split('-');
            pos = (parseInt(m[0]) - 1) + "-" + m[1];
            if (onTextBoxKeyUpChangeDir(getCell(pos)))
                return true;
        }
            //вниз
        else if (pressedKeyCode == 40) {
            m = txt.parentNode.attributes["pos"].value.split('-');
            pos = (parseInt(m[0]) + 1) + "-" + m[1];
            if (onTextBoxKeyUpChangeDir(getCell(pos)))
                return true;
        }
    }
    else if (curWidAttr.indexOf("-v") > 0) {
        //влево
        if (pressedKeyCode == 37) {
            m = txt.parentNode.attributes["pos"].value.split('-');
            pos = m[0] + "-" + (parseInt(m[1]) - 1);
            if (onTextBoxKeyUpChangeDir(getCell(pos)))
                return true;
        }
            //вправо
        else if (pressedKeyCode == 39) {
            m = txt.parentNode.attributes["pos"].value.split('-');
            pos = m[0] + "-" + (parseInt(m[1]) + 1);
            if (onTextBoxKeyUpChangeDir(getCell(pos)))
                return true;
        }
    }
    if (pressedKeyCode == 37 || pressedKeyCode == 38) {
        var nextTxt = getTextBoxNext(txt, false);
        if (nextTxt != null) {
            nextTxt.focus();
            nextTxt.select();
        }
        return true;
    }
    else if (pressedKeyCode == 39 || pressedKeyCode == 40) {
        var nextTxt = getTextBoxNext(txt, true);
        if (nextTxt != null) {
            nextTxt.focus();
            nextTxt.select();
        }
        return true;
    }
    else if (pressedKeyCode == 8) {
        if (txt.parentNode.attributes["clue"].value != "1")
            txt.value = "";
        var nextTxt = getTextBoxNext(txt, false);
        if (nextTxt != null) {
            nextTxt.focus();
            nextTxt.select();
        }
        return true;
    }
    return false;
}
function onTextBoxKeyPress(txt, pressedKeyCode) {
    if ((pressedKeyCode > 37 && pressedKeyCode <= 90) ||
        pressedKeyCode == 186 || pressedKeyCode == 188 || pressedKeyCode == 190 ||
        pressedKeyCode == 219 || pressedKeyCode == 221 || pressedKeyCode == 222) {
        txt.value = txt.value.toUpperCase();
        if (pressedKeyCode != 46) {
            var nextTxt = getTextBoxNext(txt, true);
            if (nextTxt != null) {
                nextTxt.focus();
                nextTxt.select();
            }
        }
    }
    else if (pressedKeyCode != 9) {
        //txt.value = "";
    }
    return true;
}
function onTextBoxKeyUpChangeDir(cell) {
    var txt;
    if (cell != null) {
        txt = cell.getElementsByTagName('input')[0]
        if (!txt)
            return true;
        onMouseDown(txt);
        txt.focus(); txt.select();
        return true;
    }
    return false;
}
function getTextBoxNext(txt, isNext) {
    var curPosNumber; var curPosNumberAttr;
    if (curWidAttr.indexOf("-h") > 0)
        curPosNumberAttr = "posnumber-h";
    else if (curWidAttr.indexOf("-v") > 0)
        curPosNumberAttr = "posnumber-v";
    curPosNumber = $(txt).attr(curPosNumberAttr);

    var m = getWordCells(curWidAttr, curWid);

    for (var i = 0; i < m.length; i++) {
        if (m[i].getElementsByTagName('input')[0].attributes[curPosNumberAttr].value == curPosNumber) {
            if (isNext) {
                if (i == m.length - 1)
                    return null;
                else
                    if (m[i + 1].attributes["clue"].value == "1")
                        return getTextBoxNext(m[i + 1].getElementsByTagName('input')[0], isNext);
                    else
                        return m[i + 1].getElementsByTagName('input')[0];
            }
            else {
                if (i == 0)
                    return null;
                else
                    if (m[i - 1].attributes["clue"].value == "1")
                        return getTextBoxNext(m[i - 1].getElementsByTagName('input')[0], isNext);
                    else
                        return m[i - 1].getElementsByTagName('input')[0];
            }
        }
    }
    return;
}
function onQuestionTextClick(span) {
    var wid = span.id.split('-')[1];
    curWidAttrOnQuestion = "wid-" + $(span).parent().attr("dir");
    var m = getWordCells(curWidAttrOnQuestion, wid);
    var txt = m[0].getElementsByTagName('input')[0];

    onMouseDown(txt);

    if (txt.disabled) {
        scrollTo(0, $(txt).offset().top);
        $('html, body').animate({ scrollTop: 0 }, 500);
    }
    else {
        txt.focus(); txt.select();
        $('html, body').animate({ scrollTop: $(txt).offset().top - 150 }, 500);
    }
    curWidAttrOnQuestion = null;
}
function showPopupQuestionText() {
    if ($('#tblFields').attr('showpopupqtext') == '0')
        return;
    var m = getWordCells(curWidAttr, curWid);
    var r = Math.min(parseInt($(m[0]).attr('pos').split('-')[0]), parseInt($(m[m.length - 1]).attr('pos').split('-')[0]));
    var c1 = Math.min(parseInt($(m[0]).attr('pos').split('-')[1]), parseInt($(m[m.length - 1]).attr('pos').split('-')[1]));
    var c2 = Math.max(parseInt($(m[0]).attr('pos').split('-')[1]), parseInt($(m[m.length - 1]).attr('pos').split('-')[1]));
    var top = $(getCell(r + '-' + c1)).position().top - 75;
    var left1 = $(getCell(r + '-' + c1)).position().left;
    var left2 = $(getCell(r + '-' + c2)).position().left + $(getCell(r + '-' + c2)).width();
    var left = left1 + (left2 - left1) / 2 - $('#dpopuptext').width() / 2 + 3;
    $('#dpopuptext p').html($("#sqtext-" + curWid + " a").html());
    $('#dpopuptext').css('top', top + 'px').css('left', left + 'px').show();
}
function onScanwordQuestionTextClick(span) {
    var wid = $(span).attr("widq");
    curWidAttrOnQuestion = "wid-" + $(span).attr("dir");
    var m = getWordCells(curWidAttrOnQuestion, wid);
    var txt = m[0].getElementsByTagName('input')[0];

    onMouseDown(txt);

    if (txt.disabled) {
        scrollTo(0, $(txt).offset().top);
        $('html, body').animate({ scrollTop: 0 }, 500);
    }
    else {
        txt.focus(); txt.select();
        $('html, body').animate({ scrollTop: $(txt).offset().top - 200 }, 500);
    }
    curWidAttrOnQuestion = null;
}

var japanDraw; var japanDrawFill = false; var japanDrawEmpty = false; var japanCurrentCell;
function setupJapView() {
    $('#tblFields td').on('mousedown', function (e) { 
        if ($(this).attr("sel") != undefined) {
            japOnMouseDown(e, this);
        }
        return true;
    });
    $('#tblFields td').on('mousemove', function (e) { 
        if ($(this).attr("sel") != undefined) {
            japOnMouseMove(this);
        }
        return true;
    });
    $(document).on("mouseup", function () { japOnMouseUp(); });
}
function japOnMouseDown(evt, td) {
    if (evt.button == 1 || evt.which == 1) {
        japanCurrentCell = td;
        japanDraw = true;
        var val = $(td).attr("sel");
        if (val == japanColorNum) {
            japanDrawFill = false;
        }
        else {
            japanDrawFill = true;
        }
        japChangeCellFilled(td);
    }
    else if (evt.button == 2 || evt.which == 2) {
        var val = $(td).attr("sel");
        if (val != "0") {
            japanDrawFill = false;
            japChangeCellFilled(td);
        }

        if ($(td).html() == "X") {
            $(td).html("");
        }
        else {
            $(td).html("X");
            japanDrawEmpty = true;
            japanCurrentCell = td;
            
        }
    }
}
function japChangeCellFilled(td) {
    $(td).html("");
    if (japanDrawFill)
        $(td).css("background-color", japanColor).attr("sel", japanColorNum);
    else
        $(td).css("background-color", "").attr("sel", "0");
}
function japOnMouseMove(td) {
    if (japanDraw && japanCurrentCell != td) {
        var val = td.getAttribute("sel");
        if (val == "0" || val == japanColorNum || japanColorNum == "0") {
            japChangeCellFilled(td);
            japanCurrentCell = td;
        }
    }
    else if (japanDrawEmpty && japanCurrentCell != td) {
        var val = $(td).attr("sel");
        if (val != "0") {
            japanDrawFill = false;
            japChangeCellFilled(td);
        }
        $(td).html("X");
        japanDrawEmpty = true;
        japanCurrentCell = td;
    }
}
function japOnMouseUp() {
    japanCurrentCell == null;
    japanDraw = false;
    japanDrawEmpty = false;
}
function japFillSequence() {
    var tbl = document.getElementById('tblFields');
    var rows = parseInt($('#tblFields').attr("rows"));
    var cols = parseInt($('#tblFields').attr("cols"));

    var sequence = "";

    for (var y = 1; y <= rows; y++) {
        for (var x = 1; x <= cols; x++) {
            var td = document.getElementById('pos-' + y + '-' + x);
            if ($(td).attr("sel") == "0") {
                if ($(td).html().toUpperCase() == "X") {
                    sequence = sequence + ".";
                }
                else {
                    sequence = sequence + $(td).attr("sel");
                }
            }
            else {
                sequence = sequence + $(td).attr("sel");
            }
        }
    }
    $('#hSequence').val(sequence);
}
function setJapColor(d) {
    japanColor = $(d).attr("color");
    japanColorNum = $(d).attr("colornum");
    $(d).parent().children().css("border-color", "#fff");
    if (japanColorNum == 0)
        $(d).css("border-color", "#aaa");
    else
        $(d).css("border-color", japanColor);
    $("#firstRowCell").css("background-color", $(d).attr("color"));
}
function japDigitCellOnMouseUp(td) {
    if ($(td).attr("marked") == "0") {
        $(td).css("background-color", "#ddd").attr("marked", "1");
    }
    else {
        $(td).css("background-color", "").attr("marked", "0");
    }
}
function japColorDigitCellOnMouseUp(td) {
    if (event.button == 1 || event.which == 1) {
        var colorNum = $(td).attr("colornum");
        if (colorNum != undefined) {
            setJapColor(document.getElementById("dColorNum" + colorNum));
        }
        else {
            setJapColor(document.getElementById("dNoColor"));
        }
    }
}
function showJapYourField() {
    $('#dJapRight').fadeOut(200, function () { $('#dJapYour').fadeIn(); });
    return false;
}
function showJapRightField() {
    $('#dJapYour').fadeOut(200, function () { $('#dJapRight').fadeIn(); });
    return false;
}

var fwFirstCell = null; var fwArrCells = null;
function setupFillwordView() {
    $('#tblFields td').on('mousedown', function (e) {
        fwOnMouseDown(e, this);
        return true;
    });
    $('#tblFields td').on('mousemove', function (e) {
        fwOnMouseMove(this);
        return true;
    });
    $(document).on("mouseup", function () { fwOnMouseUp(); });
}
function fwOnMouseDown(evt, td) {
    if (!evt) evt = window.event;
    if (evt.button == 1 || evt.which == 1) {
        fwCleanAllCells();
        if ($(td).attr("selected") == "1") {
            $.each(getWordCells("wid", $(td).attr("wid")), function(i, e){
                $(e).css('background-color', '#ddd');
            });
        }
        else {
            fwFirstCell = td;
            fwArrCells = new Array();
            fwArrCells.push(td);
            $(td).css('background-color', '#ddd');
        }
    }
}
function fwOnMouseMove(td) {
    if (fwFirstCell == null)
        return;
    if ($(fwFirstCell).attr("pos") == $(td).attr("pos"))
        return;
    var exists = false;
    $.each(fwArrCells, function (i, e) {
        if ($(e).attr('pos') == $(td).attr('pos'))
            exists = true;
    });
    if (exists) {
        return;
    }
    if ($(td).hasClass("empty"))
        return;

    fwArrCells.push(td);
    $(td).css('background-color', '#ddd');
}
function fwOnMouseUp() {
    fwFirstCell = null;
    if (fwArrCells.length <= 1)
        return;
    var wId = parseInt($(fwArrCells[0]).attr("wid"));
    var counts = 0;
    for (var i = 0; i < fwArrCells.length; i++) {
        if (wId != parseInt($(fwArrCells[i]).attr("wid"))) {
            fwCleanAllCells();
            return;
        }
        if ((parseInt(i) + 1) != parseInt($(fwArrCells[i]).attr("orignum"))) {
            fwCleanAllCells();
            return;
        }
        counts++;
    }
    if (getWordCells("wid", wId).length != counts) {
        fwCleanAllCells();
        return;
    }
    for (var i = 0; i < fwArrCells.length; i++) {
        if ($(fwArrCells[i]).attr("border-top") == "1")
            $(fwArrCells[i]).css('borderTop', 'solid 2px gray');
        if ($(fwArrCells[i]).attr("border-right") == "1")
            $(fwArrCells[i]).css('border-right', 'solid 2px gray');
        if ($(fwArrCells[i]).attr("border-bottom") == "1")
            $(fwArrCells[i]).css('border-bottom', 'solid 2px gray');
        if ($(fwArrCells[i]).attr("border-left") == "1")
            $(fwArrCells[i]).css('border-left', 'solid 2px gray');
        $(fwArrCells[i]).attr("selected", "1").addClass("filled");
    }
    $("#hwordidselected" + wId).val("1");
    $("#ahintword" + wId).css('text-decoration', 'line-through').css('font-weight', 'normal');
}
function fwCleanAllCells() {
    $.each($('#tblFields td'), function (i, td) {
        $(td).css('background-color', '');
    });
};

function setupSudokuView()
{
    $('#tblFields input').on('keydown', function (e) {
        var txt = this;
        if (!e) e = window.event;
        var pressedKeyCode = e.keyCode;
        function handle() {
            sdkOnTextBoxKeyDown(txt, pressedKeyCode);
        }
        setTimeout(handle, 0);
    });
}
function sdkOnTextBoxKeyDown(txt, pressedKeyCode) {
    m = $(txt).parent().attr("pos").split('-');
    //вверх
    if (pressedKeyCode == 38) {
        pos = (parseInt(m[0]) - 1) + "-" + m[1];
        setSdkFocusedCell(getCell(pos));
    }
        //вниз
    else if (pressedKeyCode == 40) {
        pos = (parseInt(m[0]) + 1) + "-" + m[1];
        setSdkFocusedCell(getCell(pos));
    }
    //влево
    if (pressedKeyCode == 37) {
        pos = m[0] + "-" + (parseInt(m[1]) - 1);
        setSdkFocusedCell(getCell(pos));
    }
    //вправо
    else if (pressedKeyCode == 39) {
        pos = m[0] + "-" + (parseInt(m[1]) + 1);
        setSdkFocusedCell(getCell(pos));
    }
}
function setSdkFocusedCell(cell) {
    var txt;
    if (cell != null) {
        txt = cell.getElementsByTagName('input')[0]
        txt.focus();
        txt.select();
        return true;
    }
    return false;
}

function cleanCells() {
    $.each($('#tblFields td'), function (i, td) {
        if ($(td).children().length > 0) $(td).css("background-color", "");
    });
}
function getCell(pos) {
    var returnValue = null;
    $.each($('#tblFields td'), function (i, td) {
        if ($(td).attr("pos") == pos)
            returnValue = td;
    });
    return returnValue;
}
function getWordCells(widattr, wid) {
    var arr = new Array();
    $.each($('#tblFields td'), function (i, td) {
        if ($(td).attr(widattr) == wid)
            arr.push(td);
    });
    return arr;
}