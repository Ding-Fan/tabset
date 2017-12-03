// Test

mockTabSets = {

}


// Model
let TabSets = {};
// https://developer.chrome.com/apps/storage#type-StorageArea
let Database = chrome.storage.sync;
let addFlag = false;
let removeFlag = false;

function getTabSets() {
    Database.get(null, (data) => {
        TabSets = data;
        renderShowComponent();
    });
}
getTabSets();
function saveTabSet(tabset, message) {
    Database.set(tabset, () => { renderFlashComponent(message) });
    getTabSets();
}

function removeTabSet(tabsetName) {
    Database.remove(tabsetName);
    renderFlashComponent('Removed!')
    getTabSets();
}



// Controller
function createTabSet() {
    var tabsetName = document.querySelector('#new_tabset_name').value.trim()
    if (tabsetName == '') {
        renderFlashComponent('What\'s its name?');
    } else if (TabSets.hasOwnProperty(tabsetName)) {
        renderFlashComponent('This tabset exists.');
    } else {
        saveTabSet({ [tabsetName]: []}, 'Created!');
    }
}
function modifyTabSet(tabsetName) {
    if (addFlag == true) {
        addFlag = false;
        getCurrentTab((title, url) => {
            TabSets[tabsetName].push({ [title]: url })
            saveTabSet({ [tabsetName]: TabSets[tabsetName] }, 'Added!');
        });
    } else if (removeFlag == true) {
        removeFlag = false;
        removeTabSet(tabsetName);
    }

}

// Helper
function getCurrentTab(callback) {
    var queryInfo = {
        active: true,
        currentWindow: true
    }

    chrome.tabs.query(queryInfo, (tabs) => {
        var tab = tabs[0];
        var url = tab.url;
        var title = tab.title;

        console.assert(typeof url == 'string', 'tab.url should be a string');
        callback(title, url);
    })
}
function openSiteInArr(siteArr) {
    if (siteArr.length) {
        siteArr.forEach((site) => {
            chrome.tabs.create({ 'url': Object.values(site)[0] });
        });
    } else {
        renderFlashComponent('Empty tabset.')
    }
}
function changeColor(colorType) {
    document.querySelector('ul').setAttribute('class', colorType)
    // document.querySelector('ul').addEventListener('mouseleave', (e) => {
    //     e.target.className = 'tabsetWrapper';
    // }, false);
}

// View
function renderInputComponent() {
    document.querySelector('#new_tabset').addEventListener('click', createTabSet, false);
    document.querySelector('#save_tabset_flag').addEventListener('click', (e) => {
        addFlag = !addFlag;
        if (addFlag) {
            changeColor('tabsetWrapper_save');
            document.querySelector('#save_tabset_flag').style.backgroundColor = '#FFD200';
            document.querySelector('#save_tabset_flag').style.color = '#ffffff'
            document.querySelector('#remove_tabset_flag').disabled = true;
            document.querySelector('#remove_tabset_flag').style.cursor = 'not-allowed';
        } else {
            changeColor('');
            document.querySelector('#save_tabset_flag').style.backgroundColor = '';
            document.querySelector('#save_tabset_flag').style.color = '';
            document.querySelector('#remove_tabset_flag').disabled = false;
            document.querySelector('#remove_tabset_flag').style.cursor = 'pointer';
        }
    }, false);
    document.querySelector('#remove_tabset_flag').addEventListener('click', (e) => {
        removeFlag = !removeFlag;
        if (removeFlag) {
            changeColor('tabsetWrapper_remove');
            document.querySelector('#remove_tabset_flag').style.backgroundColor = '#EB2D00';
            document.querySelector('#remove_tabset_flag').style.color = '#ffffff'
            document.querySelector('#save_tabset_flag').disabled = true;
            document.querySelector('#save_tabset_flag').style.cursor = 'not-allowed';
        } else {
            changeColor('');
            document.querySelector('#remove_tabset_flag').style.backgroundColor = '';
            document.querySelector('#remove_tabset_flag').style.color = '';
            document.querySelector('#save_tabset_flag').disabled = false;
            document.querySelector('#save_tabset_flag').style.cursor = 'pointer';
        }
    }, false);
}
renderInputComponent();
function renderShowComponent() {
    let showTabSetsUl = document.querySelector('#show_tabsets > ul');
    showTabSetsUl.innerHTML = '';
    Object.keys(TabSets).forEach((tabsetName, index) => {
        let li = document.createElement('li');
        li.setAttribute('class', 'tabsetWrapper');
        li.appendChild(document.createTextNode(tabsetName));
        
        
        li.setAttribute('id', `${'li' + index}`)
        showTabSetsUl.appendChild(li)
        li.addEventListener('click', (e) => {
            modifyTabSet(e.target.textContent);
        }, false);
        li.addEventListener('dblclick', (e) => { 
            openSiteInArr(TabSets[e.target.textContent]);
        }, false);
    })
}
function renderFlashComponent(message) {
    document.querySelector('#flash').textContent = message;
}