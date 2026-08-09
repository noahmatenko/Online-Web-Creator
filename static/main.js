const blankScreen = document.getElementById("blankScreen")
const codeContainer = document.getElementById("codeContainer")
const codeField = document.getElementById("codeField")
const lineCount = document.getElementById("lineCount")
const downloadButton = document.getElementById("downloadButton")
const testButton = document.getElementById("testButton")
const explorer = document.getElementById("explorer")
const click2Menu = document.getElementById("click2Menu")
const editorTabs = document.getElementById("editorTabs")
const warningPopup = document.getElementById("warningPopup")
const selectContainer = document.getElementById("selectContainer")
const selectBox = document.getElementById("selectBox")
const selectExplorer = document.getElementById("selectExplorer")
const cancelButton = document.getElementById("cancelButton")
const confirmButton = document.getElementById("confirmButton")

const data = {
    click2Options: {
        break: `<hr class="click2Break">`, 

        open: `<div class="click2Selection" onclick="createTab(explorer.querySelector('.selected'))">Open new tab</div>`,

        createFile: `<div class="click2Selection" onclick="parent = explorer.querySelector('.selected'); fileTable = {id: crypto.randomUUID(), name: '', parentId: parent.id, depth: Number(parent.dataset.depth) + 1, isFolder: false, fileData: new File([''], 'newFile.txt', { type: 'text/plain' })}; storeFileDB(fileTable); createFile(fileTable, true)">Create new file</div>`, 
        createFolder: `<div class="click2Selection" onclick="parent = explorer.querySelector('.selected'); folderTable = {id: crypto.randomUUID(), name: '', parentId: parent.id, depth: Number(parent.dataset.depth) + 1, isFolder: true}; storeFileDB(folderTable); createFile(folderTable, true)">Create new folder</div>`, 
        import: `<div class="click2Selection" onclick="importFile(explorer.querySelector('.selected'))">Import file</div>`,

        cut: `<div class="click2Selection" onclick="copyFile(explorer.querySelector('.selected'), true)">Cut</div>`, 
        copy: `<div class="click2Selection" onclick="copyFile(explorer.querySelector('.selected'), false)">Copy</div>`, 
        paste: `<div class="click2Selection" onclick="pasteFile(explorer.querySelector('.selected'))">Paste</div>`, 
        duplicate: `<div class="click2Selection" onclick="duplicateFile(explorer.querySelector('.selected'))">Duplicate</div>`, 

        copyPath: `<div class="click2Selection" onclick="const filePath = generatePath(explorer.querySelector('.selected')); navigator.clipboard.writeText(filePath)">Copy path</div>`,

        delete: `<div class="click2Selection" onclick="deleteFile(explorer.querySelector('.selected'))">Delete</div>`,
        rename: `<div class="click2Selection" onclick="renameFile(explorer.querySelector('.selected'))">Rename</div>`,

        exportFile: `<div class="click2Selection" onclick="exportFile(explorer.querySelector('.selected'))">Export file</div>`,
        exportFolder: `<div class="click2Selection" onclick="downloadZip(explorer.querySelector('.selected'), true)">Export folder as .zip</div>`,

        closeTab: `<div class="click2Selection" onclick="deleteTab(editorTabs.querySelector('.currentTab'))">Close tab</div>`,
        closeOthers: `<div class="click2Selection" onclick="const currentTab = editorTabs.querySelector('.currentTab'); const tabs = editorTabs.querySelectorAll('.tab'); tabs.forEach(tab => {if (tab !== currentTab) deleteTab(tab)});">Close other tabs</div>`,
        closeAll: `<div class="click2Selection" onclick="const tabs = editorTabs.querySelectorAll('.tab'); tabs.forEach(tab => {deleteTab(tab)})">Close all</div>`,

        save: `<div class="click2Selection" onclick="saveFile(editorTabs.querySelector('.currentTab'))">Save</div>`
    },

    blacklistedMagic: [
        "89504E47",
        "FFD8FF",
        "47494638",
        "25504446",
        "504B0304"
    ],

    editableTypes: {
        "txt": "text/plain", 
        "html": "text/html", 
        "htm": "text/html", 
        "css": "text/css", 
        "js": "text/js", 
        "json": "application/json", 
        "jsonc": "application/jsonc", 
        "xml": "application/xml",
        "svg": "image/svg+xml", 
        "py": "text/x-python", 
        "c": "text/x-c", 
        "cpp": "text/x-c++src", 
        "md": "text/markdown"
    },
}

function getIconElement(iconId) {
    const template = document.getElementById("iconsTemplate");
    const svg = template.content.querySelector(`#icon_${iconId}`);
    return svg ? svg.cloneNode(true) : null;
}

function countLines(textarea) {
  const lines = textarea.value.split("\n");
  return lines.length;
};

function codeInput() {
    const count = countLines(codeField)
    let lineText = "";

    for (let i = 0; i < count; i++) {
        lineText += i + 1 + "\n";
    }
    
    lineCount.innerText = lineText;
}

codeField.addEventListener("input", (e) => {
    codeInput()

    const currentTab = editorTabs.querySelector(".currentTab")

    if (currentTab) {
        const tabName = currentTab.querySelector(".tabName")
        tabName.dataset.allSaved = "false"
    }
});

codeField.addEventListener("keydown", function(e) {
    const code = codeField.value

    const start = codeField.selectionStart
    const end = codeField.selectionEnd

    if (e.key === "Tab") {
        e.preventDefault()

        codeField.value = code.substring(0, start) + "\t" + code.substring(end);
        codeField.selectionStart = codeField.selectionEnd = start + 1;

        codeField.dispatchEvent(new Event("input"));
    } else if (e.key === "Enter") {
        e.preventDefault()

        const lineStart = code.lastIndexOf("\n", start - 1) + 1;
        let beforeStart = code.substring(lineStart, start)
        let newLine = "\n"

        for (let i = 0; i < beforeStart.length; i++) {
            if (beforeStart[i] == "\t") {
                newLine += "\t";
            } else {
                break;
            }
        }

        codeField.value = code.substring(0, start) + newLine + code.substring(end);
        codeField.selectionStart = codeField.selectionEnd = start + newLine.length;

        codeField.dispatchEvent(new Event("input"));
    }
});

function clearClick2() {
    click2Menu.replaceChildren();
}

function toggleChildren(parent, visible) {
    const children = explorer.querySelectorAll(`[data-parent="${parent.id}"]`);

    children.forEach((child) => {
        child.style.display = visible ? "flex" : "none"

        if (explorer.querySelectorAll(`[data-parent="${child.id}"]`).length > 0) {
            toggleChildren(child, visible ? (child.querySelector(".folderArrow").dataset.opened === "true") : false)
        }
    })
}

function rotateArrow(arrow, setTo, e) {
    if (!arrow) return;

    let opened = (arrow.dataset.opened === "true")

    arrow.dataset.opened = (setTo) ? setTo : !opened
    opened = (arrow.dataset.opened === "true")
    arrow.style.rotate = opened ? "90deg" : "0deg"

    const folder = arrow.parentElement
    toggleChildren(folder, opened)
}

function invalidPopup(reason) {
    warningPopup.textContent = reason
    warningPopup.className = "popupAppear"

    warningPopup.addEventListener("animationend", () => {
        warningPopup.classList.remove("popupAppear")
    }, { once: true })
}

function getAvailableName(fileName) {
    if (!fileName) return;

    let currentName = fileName.innerText
    let availableName = fileName.innerText
    let loopCount = 1

    const file = fileName.parentElement
    const otherNames = Array.from(explorer.querySelectorAll(".fileName")).filter(span => (span !== fileName && span.parentElement.dataset.parent === file.dataset.parent));

    while (Array.from(otherNames).some(name => name.innerText === availableName)) {
        if (currentName.includes(".")) {
            let preExtension = availableName.substring(0, currentName.lastIndexOf("."))
            const extension = currentName.substring(currentName.lastIndexOf("."))

            const numberIndex = preExtension.length - 2
            let testPre = preExtension;

            if (!isNaN(preExtension[numberIndex])) {
                testPre = preExtension.substring(0, numberIndex) + String(loopCount) + preExtension.substring(numberIndex + 1)
            }

            if (testPre.endsWith(`(${loopCount})`)) {
                availableName = currentName.substring(0, numberIndex) + String(loopCount + 1) + currentName.substring(numberIndex + 1);
            } else {
                availableName = currentName.substring(0, currentName.lastIndexOf(".")) + ` (${loopCount})` + extension
            }
        } else {
            const numberIndex = availableName.length - 2

            if (availableName.endsWith(`(${loopCount})`) && !isNaN(availableName[numberIndex])) {
                availableName = currentName.substring(0, numberIndex) + String(loopCount + 1) + currentName.substring(numberIndex + 1);
            } else {
                availableName = currentName + ` (${loopCount})`
            }
        }

        loopCount += 1
    }

    return availableName
}

const indexedDB = window.indexedDB

/*const IS_DEV = true;

if (IS_DEV) {
    indexedDB.deleteDatabase("projectFiles");
}*/

const openRequest = indexedDB.open("projectFiles", 1)
let db;

openRequest.onupgradeneeded = function () {
    const database = openRequest.result;

    if (database.objectStoreNames.contains("files")) {
        database.deleteObjectStore("files");
    }

    const store = database.createObjectStore("files", { keyPath: "id" })
    store.createIndex("byParent", "parentId", { unique: false });

    store.put({
        id: "projectFolder", 
        name: "My_Project", 
        parentId: null, 
        depth: 0,
        isFolder: true
    })
};

function storeFileDB(data) {
    if (!db) return;

    const transaction = db.transaction("files", "readwrite")
    const store = transaction.objectStore("files")

    store.put(data);
}

function getFileDB(value, getAll, index) {
    return new Promise((resolve, reject) => {
        if (!db) return reject("Database not initialized");

        const transaction = db.transaction("files", "readonly");
        const store = transaction.objectStore("files");

        let getIndex = store;

        if (index) {
            getIndex = store.index(index);
        };

        let request;
        
        if (getAll) {
            request = getIndex.getAll(value);
        } else {
            request = store.get(value);
        }

        request.onsuccess = () => resolve(request.result);
        request.onerror = (e) => reject(e.target.error);
    });
}

function deleteFileDB(id) {
    if (!db) return;

    const transaction = db.transaction("files", "readwrite")
    const store = transaction.objectStore("files")

    store.delete(id)
}

let unsavedTabs = {}

async function saveFile(fileTab) {
    if (!fileTab) return;

    const id = fileTab.id.replace("tab_", "")
    const file = await getFileDB(id, false)

    const newContent = codeField.value || "";
    
    if (file.fileData instanceof File || file.fileData instanceof Blob) {
        file.fileData = new File([newContent], file.name, { type: file.fileData.type || "text/plain" });
    } else {
        file.fileData = newContent;
    }

    await storeFileDB(file);

    const tabName = fileTab.querySelector(".tabName")
    tabName.dataset.allSaved = "true"

    if (unsavedTabs[fileTab.id]) {
        delete unsavedTabs[fileTab.id]
    }
}

async function checkInTab() {
    const currentTab = editorTabs.querySelector(".currentTab")

    if (currentTab) {
        codeContainer.style.display = "flex"
        blankScreen.style.display = "none"

        if (unsavedTabs[currentTab.id]) {
            codeField.value = unsavedTabs[currentTab.id]
            delete unsavedTabs[currentTab.id]
        } else {
            const fileId = currentTab.id.replace("tab_", "")
            const file = await getFileDB(fileId, false)

            codeField.value = await file.fileData.text();
        }

        codeInput()
    } else {
        codeContainer.style.display = "none"
        blankScreen.style.display = "flex"
    }
}

function deleteTab(tab) {
    if (tab.classList.contains("currentTab")) {
        const previousTab = tab.previousElementSibling
        const nextTab = tab.nextElementSibling

        if (previousTab) {
            previousTab.classList.add("currentTab")
        } else if (nextTab) {
            nextTab.classList.add("currentTab")
        }
    }

    tab.remove()
    checkInTab()

    if (unsavedTabs[tab.id]) {
        delete unsavedTabs[tab.id]
    }
}

async function deleteFile(file) {
    const parentId = file.dataset.parent

    if (file.classList.contains("folder")) {
        const children = await getFileDB(file.id, true, "byParent")

        children.forEach((child) => {
            deleteFile(document.getElementById(child.id))
        });
    }

    const tab = document.getElementById("tab_" + file.id)

    if (tab) {
        deleteTab(tab)
    }

    deleteFileDB(file.id)
    file.remove()

    let parentChildren = await getFileDB(parentId, true, "byParent")
    parentChildren = parentChildren.filter(child => child.id !== "copiedFile")

    if (parentChildren.length < 1) {
        const parent = document.getElementById(parentId)

        if (parent) rotateArrow(parent.querySelector(".folderArrow"), "false")
    }
}

function setIcon(name) {
    if (name.includes(".") && !name.endsWith(".")) {
        const extension = name.substring(name.lastIndexOf(".") + 1)
        const icon = getIconElement(extension)

        if (icon && icon.classList.contains("fileIcon")) {
            return icon
        } else {
            return getIconElement("other")
        }
    } else {
        return getIconElement("txt")
    }
}

async function checkNullBytes(blob) {
    const slice = blob.slice(0, 512);
    const buffer = await slice.arrayBuffer();
    const bytes = new Uint8Array(buffer);

    for (let i = 0; i < bytes.length; i++) {
        if (bytes[i] === 0) {
            return true;
        }
    }

    return false;
}

async function checkMagicNumbers(blob) {
    const slice = blob.slice(0, 4);
    const buffer = await slice.arrayBuffer();
    const bytes = new Uint8Array(buffer);

    const header = Array.from(bytes).map(b => b.toString(16).padStart(2, "0").toUpperCase()).join("");
    const blacklisted = data.blacklistedMagic

    let contains = false

    blacklisted.forEach(number => {
        if (header.startsWith(number)) contains = true
    })

    return contains
}

async function isEditable(fileData) {
    if (!fileData) return {editable: false, reason: "No file data found. Please try another file."};
    if (!fileData.text) return {editable: false, reason: "No text found in file. Please try another file."};
    if (fileData.size > 5242880) return {editable: false, reason: "File size exceeds 5mb limit. Please try another file."};
    if (await checkMagicNumbers(fileData)) return {editable: false, reason: "Invalid file type detected. Please try another file."};

    let whiteListed = false

    const name = fileData.name || ""
    const extension = (name.includes(".")) ? name.substring(name.lastIndexOf(".") + 1) : ""
    const validTypes = data.editableTypes

    const type = fileData.type || ""
    const editableTypes = ["application/json", "application/jsonc", "application/xml", "image/svg+xml"]
    const typeEditable = type.startsWith("text/") || editableTypes.includes(type)
        
    whiteListed = validTypes[extension] || typeEditable

    if (whiteListed) {
        const containsNull = await checkNullBytes(fileData)

        if (containsNull) {
            return {editable: false, reason: "Invalid file type detected. Please try another file."}
        } else {
            return {editable: true, reason: ""}
        }
    }

    return {editable: false, reason: "Tab could not be created. Please try another file."};
}

function renameFile(file) {
    const selectedFiles = document.querySelectorAll(".selected")

    selectedFiles.forEach((element) => {
        element.classList.remove("selected")
    })

    file.classList.add("selected")

    const fileName = document.getElementById(file.id + "s");

    if (!fileName) return

    if (!fileName.firstChild) {
        fileName.appendChild(document.createTextNode(""));
    }

    fileName.contentEditable = "plaintext-only";
    fileName.focus();

    const textNode = fileName.firstChild;
    const textContent = textNode.textContent;

    const range = document.createRange();
    let selection = window.getSelection();

    range.setStart(textNode, 0);

    const isFolder = file.classList.contains("folder")

    if (isFolder || !textContent.includes(".")) {
        range.setEnd(textNode, textContent.length);
    } else {
        range.setEnd(textNode, textContent.lastIndexOf("."));
    }

    selection.removeAllRanges();
    selection.addRange(range);

    function checkIcon(e) {
        const newIcon = setIcon(e.target.textContent)

        const oldIcon = file.querySelector(".icon")
        oldIcon.replaceWith(newIcon)
    }

    function removeInvalid(e) {
        e.preventDefault()

        let newPaste = (e.clipboardData || window.clipboardData).getData('text/plain')
        newPaste = newPaste.replaceAll("\n", " ")
        newPaste = newPaste.replaceAll("\t", " ")

        selection = window.getSelection();
        if (!selection.rangeCount) return;

        selection.deleteFromDocument();

        const textNode = document.createTextNode(newPaste);
        selection.getRangeAt(0).insertNode(textNode);

        selection.collapseToEnd();
    }

    async function removeFocus(e) {
        let newName = getAvailableName(fileName)

        fileName.innerText = newName

        const fileDB = await getFileDB(file.id, false)
        const fileData = fileDB.fileData

        const editable = await isEditable(fileData)

        if (editable.editable && newName.includes(".")) {
            const extension = newName.substring(newName.lastIndexOf(".") + 1)
            fileDB.fileData = new File([fileData], fileData.name, { type: data.editableTypes[extension] || "text/plain" })
            storeFileDB(fileDB)
        }

        const tab = document.getElementById("tab_" + file.id)

        if (tab) {
            const tabName = tab.querySelector(".tabName")
            const tabIcon = tab.querySelector(".icon")
            const newIcon = setIcon(newName)

            tabName.innerText = newName
            tabIcon.replaceWith(newIcon)
        }

        fileName.contentEditable = "false";
        fileName.scrollLeft = 0;
        
        if (!isFolder) fileName.removeEventListener("input", checkIcon);
        fileName.removeEventListener("paste", removeInvalid);
        fileName.removeEventListener("blur", removeFocus);

        if (fileName.textContent.length < 1) {
            deleteFile(file)
        } else {
            fileDB.name = newName
            storeFileDB(fileDB)
        }
    }

    fileName.addEventListener("paste", removeInvalid);
    fileName.addEventListener("blur", removeFocus);
    if (!isFolder) fileName.addEventListener("input", checkIcon);
}

function getLastDescendant(file) {
    const children = explorer.querySelectorAll(`[data-parent="${file.id}"]`);
    const lastChild = children[children.length - 1];

    if (!lastChild) {
        return file;
    } else if (lastChild.classList.contains("folder")) {
        return getLastDescendant(lastChild);
    } else {
        return lastChild;
    }
}

async function createTab(file) {
    const indexedFile = await getFileDB(file.id, false)

    const editable = await isEditable(indexedFile.fileData)

    if (!editable.editable) {
        invalidPopup(editable.reason)
        return
    };

    const tabId = "tab_" + file.id

    if (document.getElementById(tabId)) return;

    const closeIcon = getIconElement("closeTab")
    const fileName = document.getElementById(file.id + "s")
    const icon = file.querySelector(".icon")

    const newTab = 
        `<div id="${tabId}" class="tab" data-file="${file.id}">
            ${icon.outerHTML}

            <span class="tabName" inert="true" data-all-saved="true">${fileName.innerText}</span>

            ${closeIcon.outerHTML}
        </div>`

    editorTabs.insertAdjacentHTML("beforeend", newTab)

    const tabElement = document.getElementById(tabId)
    const closeButton = tabElement.querySelector(".closeTab")

    function onSelect() {
        const currentTab = editorTabs.querySelector(".currentTab")

        if (currentTab) {
            currentTab.classList.remove("currentTab")

            const tabName = currentTab.querySelector(".tabName")

            if (tabName.dataset.allSaved === "false") {
                unsavedTabs[currentTab.id] = codeField.value
            }
        }

        tabElement.classList.add("currentTab")

        checkInTab()
    }

    tabElement.addEventListener("click", onSelect)

    closeButton.addEventListener("click", (e) => {
        e.stopPropagation()
        deleteTab(tabElement)
    })

    onSelect()
}

function createFile(fileTable, doRename) {
    const id = fileTable.id
    const parentId = fileTable.parentId
    const depth = fileTable.depth
    const isFolder = fileTable.isFolder

    let icon;

    if (isFolder) {
        icon = getIconElement("folder")
    } else {
        icon = setIcon(fileTable.name);
    }

    const parentLine = '<div class="parentLine"></div>'

    const file = 
        `<div id=${id} class="file${(isFolder) ? " folder" : ""}" style="--depth: ${depth};" data-depth="${depth}" data-parent="${parentId}">
            ${(depth > 1) ? parentLine : ""}

            ${icon.outerHTML}

            <span id="${id + "s"}" class="fileName">${fileTable.name}</span>
        </div>`

    if (parentId) {
        const parent = document.getElementById(parentId)

        const siblings = explorer.querySelectorAll(`[data-parent="${parentId}"]`);
        const lastSibling = siblings[siblings.length - 1];

        if (lastSibling) {
            getLastDescendant(lastSibling).insertAdjacentHTML("afterend", file)
        } else {
            parent.insertAdjacentHTML("afterend", file)
        }

        rotateArrow(parent.querySelector(".folderArrow"), "true")
    } else {
        explorer.insertAdjacentHTML("beforeend", file)
    }

    const newFile = document.getElementById(id)

    if (doRename) {
        renameFile(newFile)
    }

    newFile.addEventListener("dblclick", (e) => {
        if (isFolder) {
            const arrow = e.target.closest(".folderArrow")
            if (arrow) return;

            fileTable = {
                id: crypto.randomUUID(), 
                name: '', 
                parentId: newFile.id, 
                depth: Number(newFile.dataset.depth) + 1, 
                isFolder: false, 
                fileData: new File([''], 'newFile.txt', { type: 'text/plain' })};

                storeFileDB(fileTable);
                createFile(fileTable, true)
        } else {
            createTab(newFile)
        }
    })
}

openRequest.onsuccess = async function () {
    db = openRequest.result

    try {
        let allSaved = await getFileDB(null, true);

        if (!allSaved.some(file => file.id === "projectFolder")) {
            const projectFolder = {
                id: "projectFolder",
                name: "My_Project",
                parentId: null,
                depth: 0,
                isFolder: true
            }

            await storeFileDB(projectFolder)
            allSaved.push(projectFolder)
        }

        if (allSaved && allSaved.length > 0) {
            allSaved.sort((a, b) => a.depth - b.depth);

            for (const fileTable of allSaved) {
                if (fileTable.id !== "copiedFile") {
                    if (fileTable.parentId) {
                        const parent = await getFileDB(fileTable.parentId, false)

                        if (!parent) {
                            fileTable.parentId = "projectFolder"
                            fileTable.depth = 1
                        }
                    }

                    createFile(fileTable, false);
                } else {
                    deleteFileDB(fileTable.id)
                }
            }
        }
    } catch (error) {
        console.error("Failed to load saved project files:", error);
    }
}

function importFile(parent) {
    const input = document.createElement("input")
    input.type = "file"

    input.addEventListener("change", function(e) {
        const files = [...e.target.files]

        files.forEach((file) => {
            const fileTable = {
                id: crypto.randomUUID(), 
                name: file.name, 
                parentId: parent.id,
                depth: Number(parent.dataset.depth) + 1,
                isFolder: false,
                fileData: file
            }

            storeFileDB(fileTable)
            createFile(fileTable, true)
        })
    }, { once: true })

    input.click()
}

async function exportFile(file) {
    const selectedFile = await getFileDB(file.id, false)

    if (selectedFile && !selectedFile.isFolder) {
        const fileData = selectedFile.fileData
        const fileUrl = URL.createObjectURL(fileData)

        const link = document.createElement("a")
        link.href = fileUrl
        link.download = selectedFile.name
        link.click()

        URL.revokeObjectURL(fileUrl)
    }
}

async function downloadZip(folder, download) {
    const zip = new JSZip();

    async function downloadSubFolder(indexedFolder, parent) {
        const subFolder = parent.folder(indexedFolder.name)
        let subChildren = await getFileDB(indexedFolder.id, true, "byParent")
        subChildren = subChildren.filter(child => child.id !== "copiedFile")

        for (const child of subChildren) {
            if (child.isFolder) {
                await downloadSubFolder(child, subFolder)
            } else {
                const type = child.fileData?.type || "text/plain"

                subFolder.file(child.name, child.fileData, {
                    comment: type
                })
            }
        }
    }

    const indexedFolder = await getFileDB(folder.id, false)
    let children = await getFileDB(folder.id, true, "byParent")
    children = children.filter(child => child.id !== "copiedFile")

    for (const child of children) {
        if (child.isFolder) {
            await downloadSubFolder(child, zip)
        } else {
            const type = child.fileData?.type || "text/plain"

            zip.file(child.name, child.fileData, {
                comment: type
            })
        }
    }

    const zipContent = await zip.generateAsync({ type: "blob" })

    if (download) {
        const downloadLink = document.createElement("a");
        downloadLink.href = URL.createObjectURL(zipContent);
        downloadLink.download = indexedFolder.name;
        downloadLink.click();
  
        URL.revokeObjectURL(downloadLink.href);
    } else return zipContent;
}

downloadButton.addEventListener("click", (e) => {
    downloadZip(document.getElementById("projectFolder"), true)
});

async function copyFile(file, cutting) {
    const selectedFile = await getFileDB(file.id, false)
    let fileCopy = structuredClone(selectedFile)
    fileCopy.id = "copiedFile"

    fileCopy["cutId"] = (cutting) ? file.id : false

    if (cutting) {
        file.classList.add("cutting")
    }

    if (file.classList.contains("folder")) {
        fileCopy.fileData = await downloadZip(file, false)
    }

    storeFileDB(fileCopy)
}

function getZipDirectory(zipContent, startTable) {
    const zipDirectory = {id: startTable.id, name: startTable.name, parentId: startTable.parentId, depth: startTable.depth, isFolder: true, children: {}}

    zipContent.forEach((relativePath, zipEntry) => {
        const cleanPath = relativePath.replace(/\/$/, "")
        const names = cleanPath.split("/")
        let currentTable = zipDirectory

        names.forEach((name, index, list) => {
            if (currentTable.children[name]) {
                currentTable = currentTable.children[name]

                if (index !== list.length - 1) {
                    currentTable.isFolder = true
                }
            } else {
                currentTable.children[name] = {id: crypto.randomUUID(), name: name, parentId: currentTable.id, depth: currentTable.depth + 1, isFolder: false, children: {}}
            }
        })
    })

    return zipDirectory
}

function readZipDirectory(directory, zipDirectory) {
    const cleanDirectory = directory.replace(/\/$/, "")
    const names = cleanDirectory.split("/")
    let currentTable = zipDirectory
    
    names.forEach((name) => {
        if (currentTable.children[name]) {
            currentTable = currentTable.children[name]
        } else {
            return null
        }
    })

    return currentTable
}

async function pasteFile(parent) {
    const copiedFile = await getFileDB("copiedFile", false)

    if (copiedFile) {
        if (copiedFile.isFolder && copiedFile.fileData) {
            const { fileData, ...folderTable } = copiedFile
            folderTable.id = crypto.randomUUID()
            folderTable.parentId = parent.id
            folderTable.depth = Number(parent.dataset.depth) + 1

            storeFileDB(folderTable)
            createFile(folderTable, true)

            const zip = new JSZip()
            const zipContent = await zip.loadAsync(copiedFile.fileData)
            const zipDirectory = getZipDirectory(zipContent, folderTable)

            zipContent.forEach(async (relativePath, zipEntry) => {
                let {children, ...fileTable} = readZipDirectory(relativePath, zipDirectory)

                if (!zipEntry.dir) {
                    const fileData = await zipEntry.async("blob")
                    const type = zipEntry.comment || "text/plain";
                    fileTable.fileData = new File([fileData], fileTable.name, { type: type });
                }

                storeFileDB(fileTable)
                createFile(fileTable, false)
            })
        } else {
            let pastingFile = structuredClone(copiedFile)
            pastingFile.id = crypto.randomUUID()
            pastingFile.parentId = parent.id
            pastingFile.depth = Number(parent.dataset.depth) + 1

            storeFileDB(pastingFile)
            createFile(pastingFile, true)
        }

        if (copiedFile.cutId) {
            const cutFile = document.getElementById(copiedFile.cutId)
            deleteFile(cutFile)
            deleteFileDB("copiedFile")
        }
    }
}

async function duplicateFile(file) {
    const selectedFile = await getFileDB(file.id, false)
    let fileDuplicate = structuredClone(selectedFile)
    fileDuplicate.id = crypto.randomUUID()

    storeFileDB(fileDuplicate)
    createFile(fileDuplicate, true)
}

function generatePath(file) {
    const fileName = document.getElementById(file.id + "s")

    return (Number(file.dataset.depth) > 0) ? generatePath(document.getElementById(file.dataset.parent)) + "/" + fileName.innerText : "/" + fileName.innerText
}

if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("service.js")
        .catch((err) => console.error("Service Worker registration failed:", err));
}

async function testProject(e) {
    confirmButton.disabled = true

    selectContainer.className = "selecting"
    selectExplorer.replaceChildren()

    const children = [...explorer.children].filter(
        child => (child.classList.contains("file") && !child.classList.contains("folder"))
    )

    let urlTable = {}

    for (const child of children) {
        const id = child.id + "test"
        const fileIcon = child.querySelector(".icon")
        const fileName = child.querySelector(".fileName").cloneNode(true)
        fileName.id = fileName.id + "test"

        const fileHtml = 
        `<div id=${id} class="testFile">
            ${fileIcon.outerHTML}
            ${fileName.outerHTML}
        </div>`

        selectExplorer.insertAdjacentHTML("beforeend", fileHtml)

        const indexedFile = await getFileDB(child.id, false)

        let filePath = generatePath(child).replace(/^\/[^\/]+/, "");
        if (!filePath.startsWith("/")) filePath = "/" + filePath;

        console.log(filePath)

        const fileUrl = URL.createObjectURL(indexedFile.fileData)
        urlTable[filePath] = fileUrl
    }

    const serviceWorker = navigator.serviceWorker.controller || (await navigator.serviceWorker.ready).active;
    
    if (serviceWorker) {
        serviceWorker.postMessage({ type: "setUrls", table: urlTable });
    }
}

testButton.addEventListener("click", testProject)

selectContainer.addEventListener("click", (e) => {
    selectContainer.classList.remove("selecting")
})

selectBox.addEventListener("click", (e) => {
    e.stopPropagation()

    const testFile = e.target.closest(".testFile")
    const testSelected = document.querySelectorAll(".testSelected")

    testSelected.forEach((element) => {
        element.classList.remove("testSelected")
    })

    if (testFile) {
        testFile.classList.add("testSelected")
        confirmButton.disabled = false
    } else {
        confirmButton.disabled = true
    }
})

cancelButton.addEventListener("click", (e) => {
    selectContainer.classList.remove("selecting")
})

confirmButton.addEventListener("click", async (e) => {
    const testFile = selectExplorer.querySelector(".testSelected")
    const id = testFile.id.substring(0, testFile.id.length - 4)
    const file = document.getElementById(id)
    const indexedFile = await getFileDB(id, false)

    selectContainer.classList.remove("selecting")

    let filePath = generatePath(file).replace(/^\/[^\/]+/, "");
    if (!filePath.startsWith("/")) filePath = "/" + filePath;

    const previewUrl = new URL(`./preview${filePath}`, window.location.href).href;

    window.open(previewUrl, "_blank");
})

document.addEventListener("click", (e) => {
    const arrow = e.target.closest(".folderArrow")
    const file = e.target.closest(".file")
    const click2 = e.target.closest("#click2Menu")

    if (arrow) rotateArrow(arrow, null)

    click2Menu.style.display = "none"
    clearClick2()

    if (click2) return

    const selectedFiles = document.querySelectorAll(".selected")

    selectedFiles.forEach((element) => {
        element.classList.remove("selected")
    })

    if (file) {
        file.classList.add("selected")
    } else {
        selectedFiles.forEach((element) => {
            const fileName = document.getElementById(element.id + "s")

            if (fileName.isContentEditable) {
                fileName.blur()
            }
        })
    }
})

document.addEventListener("keydown", async function onInput(e) {
    if (e.key === "Enter") {
        const file = explorer.querySelector(".selected")

        if (file) {
            e.preventDefault()

            const fileName = document.getElementById(file.id + "s")

            if (fileName.isContentEditable) {
                fileName.blur()
            } else {
                renameFile(file)
            }
        }
    } else if (e.key === "Backspace") {
        const file = explorer.querySelector(".selected")

        if (file && file.id !== "projectFolder") {
            const fileName = document.getElementById(file.id + "s")

            if (!fileName.isContentEditable) {
                e.preventDefault()
                deleteFile(file)
            }
        }
    } else if ((e.altKey || e.ctrlKey) && e.key.toLowerCase() === "n") {
        e.preventDefault();

        const parent = explorer.querySelector(".selected")

        if (parent && parent.classList.contains("folder")) {
            let fileTable;

            if (e.shiftKey) {
                fileTable = {
                    id: crypto.randomUUID(), 
                    name: "", 
                    parentId: parent.id, 
                    depth: Number(parent.dataset.depth) + 1, 
                    isFolder: true, 
                }
            } else {
                fileTable = {
                    id: crypto.randomUUID(), 
                    name: "", 
                    parentId: parent.id, 
                    depth: Number(parent.dataset.depth) + 1, 
                    isFolder: false, 
                    fileData: new File([""], "newFile.txt", { type: "text/plain" })
                }
            }

            storeFileDB(fileTable)
            createFile(fileTable, true)
        }
    } else if ((e.altKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        const currentTab = editorTabs.querySelector(".currentTab")

        if (currentTab) {
            saveFile(currentTab)
        }
    } else if ((e.altKey || e.ctrlKey) && e.key.toLowerCase() === "o") {
        const selectedFile = explorer.querySelector(".selected")

        if (selectedFile && !selectedFile.isFolder) {
            createTab(selectedFile)
        }
    } else if ((e.altKey || e.ctrlKey) && e.key.toLowerCase() === "d") {
        const selectedFile = explorer.querySelector(".selected")

        if (selectedFile && selectedFile.id !== "projectFolder") {
            duplicateFile(selectedFile)
        }
    } else if ((e.altKey || e.ctrlKey) && e.key.toLowerCase() === "c") {
        const selectedFile = explorer.querySelector(".selected")

        if (selectedFile) {
            copyFile(selectedFile, false)
        }
    } else if ((e.altKey || e.ctrlKey) && e.key.toLowerCase() === "x") {
        const selectedFile = explorer.querySelector(".selected")

        if (selectedFile && selectedFile.id !== "projectFolder") {
            copyFile(selectedFile, true)
        }
    } else if ((e.altKey || e.ctrlKey) && e.key.toLowerCase() === "v") {
        const selectedFile = explorer.querySelector(".selected")
        const projectFolder = document.getElementById("projectFolder")

        if (selectedFile && selectedFile.classList.contains("folder")) {
            pasteFile(selectedFile)
        } else {
            pasteFile(projectFolder)
        }
    } else if ((e.altKey || e.ctrlKey) && e.key.toLowerCase() === "i") {
        const selectedFile = explorer.querySelector(".selected")
        const projectFolder = document.getElementById("projectFolder")

        if (selectedFile && selectedFile.classList.contains("folder")) {
            importFile(selectedFile)
        } else {
            importFile(projectFolder)
        }
    } else if ((e.altKey || e.ctrlKey) && e.key.toLowerCase() === "e") {
        const selectedFile = explorer.querySelector(".selected")
        const projectFolder = document.getElementById("projectFolder")

        if (selectedFile) {
            if (selectedFile.classList.contains("folder")) {
                downloadZip(selectedFile, true)
            } else {
                exportFile(selectedFile)
            }
        } else {
            downloadZip(projectFolder, true)
        }
    } else if ((e.altKey || e.ctrlKey) && e.key.toLowerCase() === "p") {
        const selectedFile = explorer.querySelector(".selected")

        if (selectedFile) {
            const filePath = generatePath(selectedFile)
            navigator.clipboard.writeText(filePath)
        }
    } else if ((e.altKey || e.ctrlKey) && e.key.toLowerCase() === "t") {
        testProject()
    }
});

document.addEventListener("contextmenu", (e) => {
    click2Menu.style.display = "none"
    clearClick2()

    const file = e.target.closest(".file")
    const tab = e.target.closest(".tab")

    const selectedFiles = document.querySelectorAll(".selected")

    selectedFiles.forEach((element) => {
        element.classList.remove("selected")
    })

    if (file) {
        e.preventDefault();
        file.classList.add("selected")

        let currentOptions

        if (file.classList.contains("folder")) {
            if (file.id === "projectFolder") {
                currentOptions = [
                    data.click2Options.createFile, 
                    data.click2Options.createFolder, 
                    data.click2Options.import, 
                    data.click2Options.break, 
                    data.click2Options.copy, 
                    data.click2Options.paste, 
                    data.click2Options.break,
                    data.click2Options.copyPath, 
                    data.click2Options.break, 
                    data.click2Options.rename, 
                    data.click2Options.break, 
                    data.click2Options.exportFolder
                ]
            } else {
                currentOptions = [
                    data.click2Options.createFile, 
                    data.click2Options.createFolder, 
                    data.click2Options.import, 
                    data.click2Options.break, 
                    data.click2Options.cut, 
                    data.click2Options.copy, 
                    data.click2Options.paste, 
                    data.click2Options.duplicate, 
                    data.click2Options.break, 
                    data.click2Options.copyPath, 
                    data.click2Options.break, 
                    data.click2Options.delete, 
                    data.click2Options.rename, 
                    data.click2Options.break, 
                    data.click2Options.exportFolder
                ]
            }
        } else {
            currentOptions = [
                data.click2Options.open,
                data.click2Options.cut, 
                data.click2Options.copy, 
                data.click2Options.duplicate, 
                data.click2Options.break,
                data.click2Options.copyPath,
                data.click2Options.break, 
                data.click2Options.delete, 
                data.click2Options.rename, 
                data.click2Options.break, 
                data.click2Options.exportFile
            ]
        }

        currentOptions.forEach((item) => {
            click2Menu.insertAdjacentHTML("beforeend", item)
        })

        click2Menu.style.display = "flex"
        click2Menu.style.left = event.clientX + "px"
        click2Menu.style.top = event.clientY + "px"
    } else if (tab) {
        e.preventDefault();
        tab.classList.add("currentTab")

        const currentOptions = [
            data.click2Options.closeTab,
            data.click2Options.closeOthers,
            data.click2Options.closeAll,
            data.click2Options.break,
            data.click2Options.save
        ]

        currentOptions.forEach((item) => {
            click2Menu.insertAdjacentHTML("beforeend", item)
        })

        click2Menu.style.display = "flex"
        click2Menu.style.left = event.clientX + "px"
        click2Menu.style.top = event.clientY + "px"
    }
})
