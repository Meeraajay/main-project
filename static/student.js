
const form = document.querySelector('form');

form.addEventListener('submit', function () {

    const name = document.querySelector('input[name="name"]').value.trim();
    const mark = document.querySelector('input[name="mark"]').value.trim();
    const course = document.querySelector('select[name="course"]').value;

    if (name === '' || mark === '' || course === '') {
        alert('Please fill in all fields!');
        return;
    }

    // Optional user feedback
    alert('Details submitted successfully!');
});