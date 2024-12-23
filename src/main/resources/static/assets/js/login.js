
document.addEventListener("DOMContentLoaded", function() {
	const username = localStorage.getItem("username");
	const usernameDisplay = document.getElementById("username-display");
	const userMenu = document.getElementById("user-menu");
	const loginLink = document.querySelector('.dropdown-toggle');

	if (username) {
		usernameDisplay.textContent = "Chào " + username;
		userMenu.style.display = "block";
	} else {
		usernameDisplay.textContent = "Login";
		usernameDisplay.parentElement.href = "/login";
	}

	loginLink.addEventListener('click', function(event) {
		event.preventDefault();
		userMenu.style.display = userMenu.style.display === 'none' ? 'block' : 'none';
	});
});

document.getElementById("logoutBtn").addEventListener("click", function() {
	localStorage.removeItem("username");
	window.location.href = "/login";
});
