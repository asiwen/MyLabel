// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.
window.addEventListener('DOMContentLoaded', () => {

    console.log('ok');
    changeTo(currentPic);
});

pictures = [
    '6334686280573812776.png', '7945816592361015385.PNG', '8638984084167113900.PNG'
];

rootPath = 'file:///c:/';
currentPic = 0;

function changeTo(index) {
    let count = pictures.length;
    const img = document.getElementById("picBox");
    let picName = pictures[index % count];
    img.src = `${rootPath}${picName}`;
}


$('#input_label').keyup((e) => {
    if (e.keyCode === 13) {
        console.log(e);
        $('#input_label').blur();
    }
});

window.addEventListener('keyup', (e) => {
    //space keyCode:32, 
    // ArrowLeft, keyCode:37,
    // ArrowRight, keyCode:39
    // Enter, keyCode: 13
    console.log(e);
    switch (e.keyCode) {
        case 32:
            console.log('input label:');
            $('#input_label').focus().select();
            break;
        case 37:
            //console.log("prev pictures");
            currentPic = (currentPic - 1 + pictures.length) % pictures.length;
            changeTo(currentPic);
            break;
        case 39:
            //console.log("next pictures");
            currentPic = (currentPic + 1) % pictures.length;
            changeTo(currentPic);
            break;
    }
}, true);

class DatasetPanel {
    constructor(panel_selector, datas) {
        this.panel = $(panel_selector);
        this.datas = datas;
        this.render();
        this.selectItem = null;
    }

    render() {
        let ul = $('<ul class="list-group"><li class="list-group-item active">dataset:</li></ul>');
        let li = this.datas.reduce((acc, i, idx) => {
            acc.push($(`<li id="dataset_item_${idx}" class="list-group-item list-group-item-action">${i}</li>`));
            return acc;
        }, []);
        ul.append(li);
        this.panel.append(ul);
    }

    select(idx) {
        if (!this.selectItem) {
            $(`#dataset_item_${this.selectItem}`).removeClass('list-group-item-primary');
        }
        idx = idx % this.datas.length;
        $(`#dataset_item_${idx}`).addClass('list-group-item-primary');
        this.selectItem = idx;
    }
}

datasetPanel = new DatasetPanel('#dataset_list', [6334686280573812776, 7945816592361015385, 8638984084167113900]);
datasetPanel.select(2);
