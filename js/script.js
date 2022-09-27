const bookshelves = [];
const RENDER_EVENT = 'render-bookshelf';

document.addEventListener("DOMContentLoaded", function() {
    const submitForm = document.getElementById("inputBook");
    submitForm.addEventListener("submit", function(event) {
        event.preventDefault();

        addBook();

        submitForm.reset();
    });

    const inputBookIsComplete = document.getElementById("inputBookIsComplete");
    inputBookIsComplete.addEventListener("click", function() {
        const inputBookIsComplete = document.getElementById("inputBookIsComplete").checked;
        const confirmInput = document.getElementById("confirmInput");
        confirmInput.innerHTML = inputBookIsComplete ? "Selesai Dibaca" : "Belum Selesai Dibaca";
    });

    if (isStorageExist()) {
        loadDataFromStorage();
    }


    const searchInput = document.getElementById("searchBookTitle");
    searchInput.addEventListener("keyup", function(event) {
        event.preventDefault();
        
        const incompleteBookshelfList = document.getElementById("incompleteBookshelfList");
        incompleteBookshelfList.innerHTML = "";
        
        const completeBookshelfList = document.getElementById("completeBookshelfList");
        completeBookshelfList.innerHTML = "";
        
        for (const bookItem of bookshelves) {
            const bookElement = makeBookshelf(bookItem);
            
            const searchInput = document.getElementById("searchBookTitle").value.toLowerCase();
        
            if(bookItem.title.toLowerCase().includes(searchInput)) {
                if(!bookItem.isComplete) {
                    incompleteBookshelfList.append(bookElement);
                } else {
                    completeBookshelfList.append(bookElement);
                }
            }
        }
    });
});

function addBook() {
    const inputBookTitle = document.getElementById("inputBookTitle").value;
    const inputBookAuthor = document.getElementById("inputBookAuthor").value;
    const inputBookYear = document.getElementById("inputBookYear").value;
    const inputBookIsComplete = document.getElementById("inputBookIsComplete").checked;
    
    const generatedID = generateId();
    const bookshelfObject = generateBookshelfObject(generatedID, inputBookTitle, inputBookAuthor, inputBookYear, inputBookIsComplete);
    bookshelves.push(bookshelfObject);
    
    document.dispatchEvent(new Event(RENDER_EVENT));

    saveData();
}

function generateId() {
    return +new Date();
}

function generateBookshelfObject(id, title, author, year, isComplete) {
    return {
        id,
        title,
        author,
        year,
        isComplete
    }
}

document.addEventListener(RENDER_EVENT, function () {
    const incompleteBookshelfList = document.getElementById("incompleteBookshelfList");
    incompleteBookshelfList.innerHTML = "";

    const completeBookshelfList = document.getElementById("completeBookshelfList");
    completeBookshelfList.innerHTML = "";
    
    for (const bookItem of bookshelves) {
        const bookElement = makeBookshelf(bookItem);

        if(!bookItem.isComplete) {
            incompleteBookshelfList.append(bookElement);
        } else {
            completeBookshelfList.append(bookElement);
        }
    }
});

function makeBookshelf(bookshelfObject) {
    const buttonRed = document.createElement("button");
    buttonRed.innerHTML = `<i class="fa-solid fa-trash-can"></i>`;
    buttonRed.classList.add("red");

    const buttonGreen = document.createElement("button");
    buttonGreen.innerHTML = !bookshelfObject.isComplete ? `<i class="fa-solid fa-circle-check"></i>` : `<i class="fa-solid fa-circle-xmark"></i>`;
    buttonGreen.classList.add("green");

    const buttonContainer = document.createElement("div");
    buttonContainer.classList.add("action");
    buttonContainer.append(buttonRed, buttonGreen);


    const textTitle = document.createElement("h3");
    textTitle.innerText = bookshelfObject.title;
    
    const authorBook = document.createElement("p");
    authorBook.innerText = bookshelfObject.author;

    const yearBook = document.createElement("p");
    yearBook.innerText = bookshelfObject.year;
    
    const container = document.createElement("article");
    container.classList.add("book-item");
    container.append(buttonContainer, textTitle, authorBook, yearBook);
    container.setAttribute("id", `bookshelf-${bookshelfObject.id}`);


    if(bookshelfObject.isComplete) {
        buttonGreen.addEventListener("click", function() {
            undoTaskFromCompleted(bookshelfObject.id);
        });

        buttonRed.addEventListener("click", function() {
            infoAlert(bookshelfObject.id);
        });
    } else {
        buttonGreen.addEventListener("click", function() {
            addTaskToCompleted(bookshelfObject.id);
        });

        buttonRed.addEventListener("click", function() {
            infoAlert(bookshelfObject.id);
        });
    }

    return container;
}

function infoAlert(bookId) {
    swal({
        title: "Apa Kamu Yakin?",
        text: "Setelah dihapus, kamu tidak dapat memulihkannya lagi!",
        icon: "warning",
        buttons: true,
        dangerMode: true,
    })
    .then((willDelete) => {
        if(willDelete) {
            swal("Data buku telah dihapus!", {
                icon: "success",
            });

            removeTaskFromCompleted(bookId);
        } else {
            swal("Data buku kamu aman!");
        }
    });
}

function addTaskToCompleted(bookId) {
    const bookTarget = findBook(bookId);
    
    if(bookTarget == null) return;
    
    bookTarget.isComplete = true;
    document.dispatchEvent(new Event(RENDER_EVENT));

    saveData();
}

function findBook(bookId) {
    for (const bookItem of bookshelves) {
        if(bookItem.id === bookId) {
            return bookItem;
        }
    }

    return null;
}

function removeTaskFromCompleted(bookId) {
    const bookTarget = findBookIndex(bookId);
    
    if(bookTarget === -1) return;
    
    bookshelves.splice(bookTarget, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));

    saveData();
}

function undoTaskFromCompleted(bookId) {
    const bookTarget = findBook(bookId);
    
    if(bookTarget == null) return;
    
    bookTarget.isComplete = false;
    document.dispatchEvent(new Event(RENDER_EVENT));

    saveData();
}

function findBookIndex(bookId) {
    for(const index in bookshelves) {
        if(bookshelves[index].id === bookId) {
            return index;
        }
    }

    return -1;
}

function saveData() {
    if(isStorageExist()) {
        const parsed = JSON.stringify(bookshelves);
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(SAVED_EVENT));
    }
}

const SAVED_EVENT = 'saved-bookshelf';
const STORAGE_KEY = 'BOOKSHELF_APPS';

function isStorageExist() {
    if(typeof(Storage) === undefined) {
        alert('Browser kamu tidak mendukung local storage');
        return false;
    }

    return true;
}

function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);
    
    if(data !== null) {
        for(const item of data) {
            bookshelves.push(item);
        }
    }
    
    document.dispatchEvent(new Event(RENDER_EVENT));
}