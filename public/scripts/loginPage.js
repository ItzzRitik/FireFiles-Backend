const signUpButton = document.getElementById('signUpPage');
const signInButton = document.getElementById('signInPage');
const container = document.getElementById('mainContainer');

signUpButton.addEventListener('click', () => {
	container.classList.add('signUp');
});

signInButton.addEventListener('click', () => {
	container.classList.remove('signUp');
});