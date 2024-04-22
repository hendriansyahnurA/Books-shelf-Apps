const book = []
const RENDER_EVENT = "render-book"

document.addEventListener('DOMContentLoaded', function () {
    addBookHandller();
    if (isStorageExist()) {
        loadStorage();
    }
})



function generateBookObject(id, title, author, year, isComplete) {
    return {
        id,
        title,
        author,
        year: parseInt(year),
        isComplete
    }
}

function CheckBox() {
    const checkBox = document.getElementById('inputBookIsComplete');
    const btnRak = document.getElementById('submit');
    const btn = document.getElementById('pinjaman');
    if (checkBox.checked == true) {
        btn.style.display = 'block';
        btnRak.style.display = 'none'
    } else {
        btnRak.style.display = 'block'
        btn.style.display = 'none'
    }

    btn.addEventListener('click', function (event) {
        event.preventDefault()
        addCheckBoxList()
    })
}

function addCheckBoxList() {

    const title = document.getElementById('title').value;
    const author = document.getElementById('author').value;
    const year = document.getElementById('year').value;
    const generateID = generateId();
    const bookObject = generateBookObject(generateID, title, author, year, true)
    book.push(bookObject)

    const completeBookshelfList = document.getElementById('completeList')
    const bookElement = makeBook(bookObject)
    completeBookshelfList.appendChild(bookElement)


    console.table(bookObject)

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function addBookHandller() {
    const submitBook = document.getElementById('inputBook')
    submitBook.addEventListener('submit', function (event) {
        event.preventDefault();
        addBook()
    })
}

function addBook() {
    const title = document.getElementById('title').value;
    const author = document.getElementById('author').value;
    const year = document.getElementById('year').value;
    const generateID = generateId();
    const bookObject = generateBookObject(generateID, title, author, year, false)
    book.push(bookObject)

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}


function generateId() {
    return + new Date();
}

document.addEventListener(RENDER_EVENT, function () {
    const uncomplatedBookshelfList = document.getElementById('incompleteList')
    uncomplatedBookshelfList.innerHTML = '';

    const completeBookshelfList = document.getElementById('completeList');
    completeBookshelfList.innerHTML = '';

    for (const bookItem of book) {
        const bookElement = makeBook(bookItem)
        if (!bookItem.isComplete) {
            uncomplatedBookshelfList.append(bookElement)
        } else {
            completeBookshelfList.append(bookElement)
        }
    }
})


function makeBook(bookObject) {
    const bookTitle = document.createElement('h3');
    bookTitle.innerText = bookObject.title;

    const bookAuthor = document.createElement('p');
    bookAuthor.innerText = 'Penulis: ' + bookObject.author;

    const bookYear = document.createElement('p');
    bookYear.innerText = 'Tahun: ' + bookObject.year;

    const completeButton = document.createElement('button');
    completeButton.classList.add('green');

    if (bookObject.isComplete) {
        completeButton.classList.add('green')
    } else {
        completeButton.classList.add('green-checklist');
    }

    const removeButton = document.createElement('button');
    removeButton.classList.add('red');

    const editButton = document.createElement('button');
    editButton.classList.add('yellow');

    completeButton.addEventListener('click', function () {
        addCompleteList(bookObject.id);
    });

    editButton.addEventListener('click', function () {
        editBookList(bookObject.id);
    });

    removeButton.addEventListener('click', function () {
        removeBookList(bookObject.id);
    })



    const actionContainer = document.createElement('div');
    actionContainer.classList.add('action');
    actionContainer.append(completeButton, editButton, removeButton);

    const bookContainer = document.createElement('article');
    bookContainer.classList.add('book_item');
    bookContainer.append(bookTitle, bookAuthor, bookYear, actionContainer);
    bookContainer.setAttribute('id', `book-${bookObject.id}`)

    return bookContainer;

}

function addCompleteList(bookID) {
    const bookTarget = findBook(bookID);

    if (bookTarget == null) return;
    bookTarget.isComplete = bookTarget.isComplete ? false : true
    document.dispatchEvent(new Event(RENDER_EVENT));

    saveData();
}

function removeBookList(bookID) {

    const bookTarget = findBook(bookID);

    if (bookTarget == -1) return;

    if (confirm(`Yakin ingin menghapus buku "${bookTarget.title}"?`)) {

        book.splice(bookTarget, 1);

        document.dispatchEvent(new Event(RENDER_EVENT));

    };
    saveData();

}

function editBookHandller(bookTarget) {

    const form = document.getElementById('inputBook');

    const titleInput = form.querySelector('#title');

    const authorInput = form.querySelector('#author');

    const yearInput = form.querySelector('#year');

    titleInput.value = bookTarget.title;

    authorInput.value = bookTarget.author;

    yearInput.value = bookTarget.year;


    form.style.display = 'block';

    form.addEventListener('submit', function (event) {
        event.preventDefault();
        const bookIndex = book.findIndex(book => book === bookTarget);
        if (bookIndex !== -1) {
            book.splice(bookIndex, 1);
        }
        bookTarget.title = titleInput.value;
        bookTarget.author = authorInput.value;
        bookTarget.year = yearInput.value;
        form.reset();

        document.dispatchEvent(new Event(RENDER_EVENT));
        saveData();
    });
}



function editBookList(bookID) {
    const bookTarget = findBook(bookID);
    if (bookTarget == null) return;
    const submitBook = document.getElementById('inputBook')
    if (bookTarget) {
        submitBook.removeEventListener('submit', addBookHandller)
        editBookHandller(bookTarget);
    } else {
        submitBook.addEventListener('submit', editBookHandller)
    }

    document.dispatchEvent(new Event(EDIT_RENDER));
}

const EDIT_RENDER = 'RENDER-EDIT'

function search(query) {

    return book.filter(bookItem => bookItem.title.toLowerCase().includes(query.toLowerCase()));

}



document.getElementById('searchBook').addEventListener('submit', function (event) {

    event.preventDefault();

    const query = document.getElementById('searchTitle').value;

    const filteredBook = search(query);

    displaySearchBook(filteredBook);

})

function displaySearchBook(filteredBook) {

    const incompleteBook = document.getElementById('incompleteList');

    incompleteBook.innerHTML = '';

    const completeBook = document.getElementById('completeList');

    completeBook.innerHTML = '';

    for (const bookItem of filteredBook) {

        const bookElement = makeBook(bookItem);

        if (bookItem.isComplete) {

            completeBook.append(bookElement);

        } else {

            incompleteBook.append(bookElement);

        }

    }

}
function findBook(bookID) {
    for (const bookItem of book) {
        if (bookItem.id === bookID) {
            return bookItem
        }
    }
    return null
}

function saveData() {
    if (isStorageExist()) {
        const parsed = JSON.stringify(book);
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(SAVED_EVENT))
    }
}

const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOK_APPS';

function isStorageExist() {
    if (typeof (Storage) === undefined) {
        alert('Browser Kamu Tidak Mendukung Local Storage')
        return false;
    }
    return true;
}

function loadStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    const data = JSON.parse(serializedData);

    if (data !== null) {
        for (const books of data) {
            book.push(books);
        }
    }
    document.dispatchEvent(new Event(RENDER_EVENT))
}