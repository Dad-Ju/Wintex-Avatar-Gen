var logo = {
    background : "",
    name: "Member",
    squad: "",
    namefont: "",
    squadfont: "",
    namecol: "ffffff",
    squadcol: "ffffff"
    }

$(function(){
    console.log("Page Loaded");
    $.get( "/attachments", function(res){
        logo.background = res[0].name;
        updatepreview();
        res.forEach(background => {
            var menuitem = `<a id=${background.name} role="presentation" class="dropdown-item pulse animated"><img class="border rounded" src="data:image/jpg;base64,${background.base64}" style="width: 100px;margin-right: 16px;padding: 0px;" /><span>${background.name}</span></a>`
            $('#bg-menu').append(menuitem);
            $("#" + background.name).click(event => update(event));
        });
    });
    $("input").change(event => update(event));
    $("#download").click(event => download());
  });


function download(){
    var newwin = window.open("/download?" + $.param(logo), '_blank');
    newwin.focus();
}

function update(event){
    var id = event.delegateTarget.id;
    var value = event.delegateTarget.value;
    if(event.handleObj.type == "click"){
        // Vorlagen Wechsel
        // console.log(event);
        changelogo("background", id);
    }else if(event.handleObj.type == "change"){
        // Name / Input wechsel
        changelogo(id, value);
    }
}

function changelogo(item, value){
    var posebillity = ["background" ,
    "name",
    "squad",
    "namefont",
    "squadfont",
    "namecol",
    "squadcol"]
    if(posebillity.includes(item)){
        //console.log(item, value);
        if(value == null){
            return
        }
        logo[item] = value;
        updatepreview();
        //console.log(logo);
    }
}

function updatepreview(){
    var qstring = "/preview?" + $.param(logo);
    //console.log(qstring);
    $.get(qstring, function(previewres){
        $('#preview').attr('src', `data:image/jpg;base64,${previewres}`);
    });
}