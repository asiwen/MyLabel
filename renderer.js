// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.

(function(window, $) {

    var datasetPanel = null;
    var datasetPath = '';
    var dataset = [];
    var labels = new Map();
    var currentIndex = 0;

    var ID_SHOW_PANEL = '#picBox';
    var ID_LABEL_INPUT = '#input_label';
    var ID_DATASET_LIST = '#dataset_list';
    var ID_OBJECT = '#object_label';
    var ID_LINK_LABELS = '#link_label_infos';
    var ID_DATASET_TITLE = '#dataset_title';
    var ID_CURRENT_INDEX = "#current_index";

    class DatasetPanel {
        constructor(panel_selector, title, datas) {
            this.panel = $(panel_selector);
            this.datas = datas;
            this.title = title || "dataset:";
            this.render();
            this.selectItem = null;
        }

        render() {
            this.panel.empty();
            let ul = $(`<ul class="list-group">
                <li id="dataset_title" class="list-group-item active">${this.title}</li></ul>`);
            let li = this.datas.reduce((acc, i, idx) => {
                acc.push($(`<li id="dataset_item_${idx}" class="list-group-item list-group-item-action">${i}</li>`));
                return acc;
            }, []);
            ul.append(li);
            this.panel.append(ul);
        }

        select(idx) {
            if (this.selectItem != null) {
                $(`#dataset_item_${this.selectItem}`).removeClass('list-group-item-primary');
            }
            idx = idx % this.datas.length;
            $(`#dataset_item_${idx}`).addClass('list-group-item-primary');
            this.selectItem = idx;
        }

        update(title, datas) {
            this.title = title;
            this.datas = datas;
            this.selectItem = null;
            this.render();
        }
    }

    function changeTo(index) {
        let count = dataset.length;

        if (count > 0) {
            let picName = dataset[index % count];
            let object_id = picName.substr(0, picName.toUpperCase().lastIndexOf('.PNG'));
            $(ID_SHOW_PANEL).attr('src', `${datasetPath}\\${picName}`);
            $(ID_OBJECT).text(object_id);
            $(ID_LABEL_INPUT).val(labels.get(object_id) || '');
            $(ID_CURRENT_INDEX).text(index + 1);
            datasetPanel && datasetPanel.select(index);

        }
    }

    function updateLabels(object_id, label) {
        labels.set(object_id, label);
        $(ID_DATASET_TITLE).text(`dataset: ${labels.size}/${dataset.length}`);
        ipcRenderer.send('update-label', { id: object_id, label: label });
    }

    function saveLabels() {
        let object_id = $(ID_OBJECT).text();
        let label = $(ID_LABEL_INPUT).val();
        if ((object_id != null || object_id.length > 0) && (label.length > 0)) {
            updateLabels(object_id, label);
        }
    }

    $(ID_LABEL_INPUT).keyup((e) => {
        if (e.keyCode === 13) {
            saveLabels();
        }
    });

    $(ID_LINK_LABELS).click(() => {
        const url = 'https://i.zte.com.cn/#/space/a21e895c09104b3d8e231f5e3467abbe/wiki/page/3f6e4d6f6dbe477c8db8ddea3d8ca469/view';
        ipcRenderer.send('open-modaldialog', { url: url });
    });

    window.addEventListener('keyup', (e) => {
        // space keyCode:32, 
        // ArrowLeft, keyCode:37,
        // ArrowRight, keyCode:39
        // Enter, keyCode: 13
        // console.log(e);
        switch (e.keyCode) {
            case 32:
                $(ID_LABEL_INPUT).focus().select();
                break;
            case 37:
                //console.log("prev pictures");
                saveLabels();
                currentIndex = (currentIndex - 1 + dataset.length) % dataset.length;
                changeTo(currentIndex);
                datasetPanel.select(currentIndex);
                break;
            case 39:
                //console.log("next pictures");
                saveLabels();
                currentIndex = (currentIndex + 1) % dataset.length;
                changeTo(currentIndex);
                break;
        }
    }, true);

    //初始化 DatasetPanel
    datasetPanel = new DatasetPanel(ID_DATASET_LIST, 'dataset: 0/0', []);

    window.onOpenDataset = function(args) {

        datasetPath = args['path'];
        dataset = args['files'];
        labels = args['labels'];
        console.log(labels);
        $('title').text(`mylabel - ${datasetPath}`);
        let dataset_title = `dataset: ${labels.size}/${dataset.length}`;

        currentIndex = 0;
        if (datasetPanel == null) {
            datasetPanel = new DatasetPanel(ID_DATASET_LIST, dataset_title, args['files']);
        } else {
            datasetPanel.update(dataset_title, dataset)
        }
        changeTo(currentIndex);
    };

})(window, window.$ || window.jQuery);
